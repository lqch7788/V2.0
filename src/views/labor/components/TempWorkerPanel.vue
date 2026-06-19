<template>
  <div class="space-y-4 p-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <el-icon :size="20" color="white">
            <UserPlus />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">临时工入职</h1>
          <p class="text-xs text-gray-500">临时工快速入职登记与技能管理</p>
        </div>
      </div>
    </div>

    <!-- 筛选栏（V1.1 TempWorkerFilters L1-86） -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div class="flex-1 min-w-[200px]">
          <el-input v-model="filters.keyword" placeholder="搜索姓名或工号..." clearable @clear="handleSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <el-select v-model="filters.workerType" placeholder="全部类型" clearable class="w-full sm:w-32">
          <el-option label="全部类型" value="" />
          <el-option label="正式工" value="正式工" />
          <el-option label="临时工" value="临时工" />
          <el-option label="季节工" value="季节工" />
        </el-select>
        <el-select v-model="filters.status" placeholder="全部状态" clearable class="w-full sm:w-32">
          <el-option label="全部状态" value="" />
          <el-option label="在职" value="在职" />
          <el-option label="离职" value="离职" />
          <el-option label="停薪留职" value="停薪留职" />
          <el-option label="试用期" value="试用期" />
        </el-select>
        <div class="flex gap-2">
          <el-button type="warning" @click="handleResetFilters"><el-icon><RotateCcw /></el-icon> 重置</el-button>
          <el-button type="default" @click="handleSearch"><el-icon><Search /></el-icon> 搜索</el-button>
        </div>
      </div>
    </div>

    <!-- 临时工列表（V1.1 TempWorkerTable L51-336） -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">临时工列表</h3>
        <div class="flex gap-2">
          <template v-if="!inBatchMode">
            <el-button size="small" type="primary" @click="openFormModal"><el-icon><Plus /></el-icon> 新增</el-button>
            <el-button size="small" type="primary" plain @click="enterBatch('edit')"><el-icon><Edit2 /></el-icon> 编辑</el-button>
            <el-button size="small" type="danger" @click="enterBatch('delete')"><el-icon><Trash2 /></el-icon> 删除</el-button>
            <el-button size="small" @click="enterBatch('export')"><el-icon><Download /></el-icon> 导出</el-button>
          </template>
          <template v-else>
            <el-button v-if="batchEditMode" size="small" type="primary" :disabled="!selectedRows.length" @click="handleBatchEditConfirm">
              <el-icon><Edit2 /></el-icon> 批量编辑
            </el-button>
            <el-button v-if="batchDeleteMode" size="small" type="danger" :disabled="!selectedRows.length" @click="handleBatchDeleteConfirm">
              <el-icon><Trash2 /></el-icon> 确认删除
            </el-button>
            <el-button v-if="exportMode" size="small" :disabled="!selectedRows.length" @click="handleExportConfirm">
              <el-icon><Download /></el-icon> 确认导出
            </el-button>
            <el-button size="small" @click="cancelBatch"><el-icon><X /></el-icon> 取消</el-button>
          </template>
        </div>
      </div>

      <div v-if="inBatchMode" class="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-4">
        <el-button link size="small" @click="handleSelectAll">
          {{ selectedRows.length === paginatedFilteredData.length && paginatedFilteredData.length > 0 ? '全不选' : '全选' }}
        </el-button>
        <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
      </div>

      <div class="overflow-auto">
        <el-table ref="tableRef" :data="paginatedFilteredData" stripe v-loading="loading"
          @selection-change="handleSelectionChange">
          <el-table-column v-if="inBatchMode" type="selection" width="55" />
          <el-table-column prop="employeeCode" label="工号" min-width="120" />
          <el-table-column prop="name" label="姓名" min-width="100" />
          <el-table-column prop="workerType" label="类型" min-width="100" />
          <el-table-column prop="contractType" label="合同类型" min-width="100" />
          <el-table-column label="技能数" min-width="80" align="center">
            <template #default="{ row }">
              <span class="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">{{ row.skillTags.length }} 项</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" min-width="100">
            <template #default="{ row }">
              <span :class="getStatusClass(row.status)">{{ row.status }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="joinDate" label="入职日期" min-width="120" />
          <el-table-column v-if="!inBatchMode" label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <el-tooltip content="查看详情" placement="top">
                <el-button size="small" :icon="Eye" link @click="viewDetail(row)" />
              </el-tooltip>
              <el-tooltip content="编辑" placement="top">
                <el-button size="small" :icon="Edit2" link @click="handleEdit(row)" />
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button size="small" :icon="Trash2" link type="danger" @click="handleDelete(row)" />
              </el-tooltip>
            </template>
          </el-table-column>
          <template #empty>
            <div class="text-center py-8"><p class="text-gray-400">{{ error || '暂无数据' }}</p></div>
          </template>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div class="text-sm text-gray-500">共 {{ filteredData.length }} 条</div>
        <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]" :total="filteredData.length"
          layout="sizes, prev, pager, next, jumper" background
          @size-change="handlePageSizeChange" />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="临时工详情" width="600px">
      <div v-if="currentRecord" class="space-y-2">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="工号">{{ currentRecord.employeeCode }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ currentRecord.name }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentRecord.phone }}</el-descriptions-item>
          <el-descriptions-item label="身份证号" :span="2">{{ currentRecord.idCard }}</el-descriptions-item>
          <el-descriptions-item label="工人类型">{{ currentRecord.workerType }}</el-descriptions-item>
          <el-descriptions-item label="合同类型">{{ currentRecord.contractType }}</el-descriptions-item>
          <el-descriptions-item label="日工资">{{ currentRecord.dailyWage || '-' }} 元/天</el-descriptions-item>
          <el-descriptions-item label="时工资">{{ currentRecord.hourlyWage || '-' }} 元/时</el-descriptions-item>
          <el-descriptions-item label="保险类型">{{ currentRecord.insuranceType || '-' }}</el-descriptions-item>
          <el-descriptions-item label="来源">{{ currentRecord.source || '-' }}</el-descriptions-item>
          <el-descriptions-item label="最大用工天数">{{ currentRecord.maxWorkDays || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <span :class="getStatusClass(currentRecord.status)">{{ currentRecord.status }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="作业区域" :span="2">
            <el-tag v-for="z in currentRecord.workZones" :key="z" type="info" size="small" class="mr-1">{{ z }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="技能标签" :span="2">
            <el-tag v-for="t in currentRecord.skillTags" :key="t" type="success" size="small" class="mr-1 mb-1">{{ t }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer><el-button @click="detailDialogVisible = false">关闭</el-button></template>
    </el-dialog>

    <!-- 表单弹窗（V1.1 TempWorkerFormModal L36-392 完整 13 字段） -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑临时工' : '快速入职'" width="780px" @closed="resetFormData">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="姓名" prop="name"><el-input v-model="formData.name" placeholder="请输入员工姓名" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="联系电话" prop="phone"><el-input v-model="formData.phone" placeholder="请输入手机号" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="formData.idCard" placeholder="请输入18位身份证号" maxlength="18" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="工人类型" prop="workerType">
              <el-select v-model="formData.workerType" placeholder="请选择工人类型" style="width:100%">
                <el-option label="正式工" value="正式工" />
                <el-option label="临时工" value="临时工" />
                <el-option label="季节工" value="季节工" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合同类型" prop="contractType">
              <el-select v-model="formData.contractType" placeholder="请选择合同类型" style="width:100%">
                <el-option label="劳动合同" value="劳动合同" />
                <el-option label="劳务合同" value="劳务合同" />
                <el-option label="实习协议" value="实习协议" />
                <el-option label="无合同" value="无合同" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="日工资 (元/天)"><el-input-number v-model="formData.dailyWage" :min="0" :precision="2" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="时工资 (元/时)"><el-input-number v-model="formData.hourlyWage" :min="0" :precision="2" style="width:100%" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="保险类型">
              <el-select v-model="formData.insuranceType" placeholder="请选择保险类型" clearable style="width:100%">
                <el-option label="工伤险" value="工伤险" />
                <el-option label="综合险" value="综合险" />
                <el-option label="无保险" value="无保险" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来源">
              <el-select v-model="formData.source" placeholder="请选择来源" clearable style="width:100%">
                <el-option label="劳务公司" value="劳务公司" />
                <el-option label="个人零工" value="个人零工" />
                <el-option label="学生实习" value="学生实习" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="最大用工天数"><el-input-number v-model="formData.maxWorkDays" :min="0" :precision="0" style="width:100%" /></el-form-item></el-col>
          <el-col v-if="isEdit" :span="12">
            <el-form-item label="状态">
              <el-select v-model="formData.status" style="width:100%">
                <el-option label="在职" value="在职" />
                <el-option label="离职" value="离职" />
                <el-option label="停薪留职" value="停薪留职" />
                <el-option label="试用期" value="试用期" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="作业区域" prop="workZones">
          <el-checkbox-group v-model="formData.workZones">
            <el-checkbox v-for="z in WORK_ZONES" :key="z" :value="z">{{ z }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="技能标签" prop="skillTags">
          <div class="space-y-2 w-full">
            <div v-for="(tags, group) in SKILL_TAG_GROUPS" :key="group">
              <div class="text-xs text-gray-500 mb-1">{{ group }}</div>
              <el-checkbox-group v-model="formData.skillTags">
                <el-checkbox v-for="t in tags" :key="t" :value="t" class="mr-3">{{ t }}</el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

    <!-- 批量编辑弹窗 -->
    <el-dialog v-model="batchEditDialogVisible" title="批量编辑临时工" width="900px">
      <div class="flex flex-col gap-3">
        <div class="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
          已选择 <strong>{{ selectedRows.length }}</strong> 条记录进行批量编辑，已编辑 <strong>{{ editedRecordIds.length }}</strong> 条
        </div>
        <el-select v-model="selectedRecordId" placeholder="请选择记录" style="width: 100%">
          <el-option v-for="opt in selectedRecordOptions" :key="opt.id" :label="opt.label" :value="opt.id" />
        </el-select>
        <div v-if="currentEditRecord" class="grid grid-cols-4 gap-3">
          <div class="bg-gray-100 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">工号</div><div class="text-sm font-medium">{{ currentEditRecord.employeeCode }}</div></div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">姓名</div><el-input :model-value="getEditedField('name')" @update:model-value="(v) => setEditedField('name', v)" size="small" /></div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">工人类型</div>
            <el-select :model-value="getEditedField('workerType')" @update:model-value="(v) => setEditedField('workerType', v)" size="small" style="width:100%">
              <el-option label="正式工" value="正式工" /><el-option label="临时工" value="临时工" /><el-option label="季节工" value="季节工" />
            </el-select>
          </div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">合同类型</div>
            <el-select :model-value="getEditedField('contractType')" @update:model-value="(v) => setEditedField('contractType', v)" size="small" style="width:100%">
              <el-option label="劳动合同" value="劳动合同" /><el-option label="劳务合同" value="劳务合同" /><el-option label="实习协议" value="实习协议" /><el-option label="无合同" value="无合同" />
            </el-select>
          </div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">日工资</div><el-input-number :model-value="getEditedField('dailyWage')" @update:model-value="(v) => setEditedField('dailyWage', v)" :min="0" :precision="2" size="small" style="width:100%" /></div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">时工资</div><el-input-number :model-value="getEditedField('hourlyWage')" @update:model-value="(v) => setEditedField('hourlyWage', v)" :min="0" :precision="2" size="small" style="width:100%" /></div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">状态</div>
            <el-select :model-value="getEditedField('status')" @update:model-value="(v) => setEditedField('status', v)" size="small" style="width:100%">
              <el-option label="在职" value="在职" /><el-option label="离职" value="离职" /><el-option label="停薪留职" value="停薪留职" /><el-option label="试用期" value="试用期" />
            </el-select>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="handleBatchEditNext"><el-icon><Edit2 /></el-icon> 确认（下一个）</el-button>
        <el-button @click="batchEditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchEditSave">保存修改</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog v-model="deleteWarningVisible" title="删除临时工警告" width="480px">
      <div class="flex items-center gap-4 mb-4">
        <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <span class="text-red-600 text-2xl">!</span>
        </div>
        <p class="text-sm text-gray-500">此操作不可撤销</p>
      </div>
      <p class="text-gray-600 mb-2">确定要删除选中的 <strong class="text-red-600">{{ selectedRows.length }}</strong> 条临时工记录吗？</p>
      <p class="text-sm text-gray-400">删除后将无法恢复，请谨慎操作。</p>
      <template #footer>
        <el-button @click="deleteWarningVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmBatchDelete">确认删除</el-button>
      </template>
    </el-dialog>

    <!-- 导出格式弹窗 -->
    <el-dialog v-model="exportModalVisible" title="选择导出格式" width="520px">
      <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedRows.length }} 条数据</p>
      <el-radio-group v-model="exportFormat" class="flex flex-col gap-3 w-full">
        <label v-for="fmt in EXPORT_FORMATS" :key="fmt.value" :class="[
          'flex items-center p-4 border rounded-lg cursor-pointer transition-all',
          exportFormat === fmt.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-400'
        ]">
          <el-radio :value="fmt.value" size="large" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">{{ fmt.label }}</p>
            <p class="text-xs text-gray-500">{{ fmt.desc }}</p>
          </div>
        </label>
      </el-radio-group>
      <template #footer>
        <el-button @click="exportModalVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmExport">导出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 临时工入职 Panel
 * 1:1 对应 V1.1 TempWorkerPage.tsx（含 Filters/Table/FormModal/BatchEditModal/Export/Delete 弹窗）
 */
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UserPlus, Search, RotateCcw, Plus, Edit2, Trash2, Download, X, Eye } from 'lucide-vue-next'

const EXPORT_FORMATS = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

// V1.1 TempWorkerFormModal L23-31 技能标签分组
const SKILL_TAG_GROUPS = {
  '灌溉技能': ['微喷灌溉', '滴灌操作', '渗灌系统', '灌溉设备'],
  '施肥技能': ['基肥施用', '追肥操作', '水肥一体化'],
  '植保技能': ['农药配制', '喷雾操作', '生物防治', '病害识别', '虫害识别'],
  '采收技能': ['果蔬采收', '分级包装', '冷链处理'],
  '农机技能': ['拖拉机', '旋耕机', '收割机'],
  '温室技能': ['温室调控', '加温系统', '通风系统'],
  '农事技能': ['长势评估', '播种', '嫁接', '炼苗']
}

// V1.1 TempWorkerFormModal L90 作业区域
const WORK_ZONES = ['A区', 'B区', 'C区', 'D区']

// Mock 数据：覆盖 3 工人类型 × 4 状态
const initialTempWorkers = [
  { id: '1', employeeCode: 'TW-001', name: '王大力', phone: '13800138001', idCard: '110101199001011234', workerType: '临时工', contractType: '劳务合同', dailyWage: 200, hourlyWage: 25, insuranceType: '工伤险', source: '劳务公司', maxWorkDays: 90, workZones: ['A区', 'B区'], skillTags: ['微喷灌溉', '农药配制', '拖拉机'], status: '在职', joinDate: '2026-03-01' },
  { id: '2', employeeCode: 'TW-002', name: '李小花', phone: '13800138002', idCard: '110101199203052345', workerType: '季节工', contractType: '劳务合同', dailyWage: 220, hourlyWage: 28, insuranceType: '综合险', source: '个人零工', maxWorkDays: 180, workZones: ['C区'], skillTags: ['果蔬采收', '分级包装'], status: '在职', joinDate: '2026-03-15' },
  { id: '3', employeeCode: 'TW-003', name: '赵刚', phone: '13800138003', idCard: '110101198805103456', workerType: '正式工', contractType: '劳动合同', dailyWage: 280, hourlyWage: 35, insuranceType: '综合险', source: '劳务公司', maxWorkDays: undefined, workZones: ['A区', 'B区', 'C区', 'D区'], skillTags: ['拖拉机', '旋耕机', '收割机', '温室调控'], status: '在职', joinDate: '2025-09-01' },
  { id: '4', employeeCode: 'TW-004', name: '孙小美', phone: '13800138004', idCard: '110101200001154567', workerType: '季节工', contractType: '实习协议', dailyWage: 150, hourlyWage: 20, insuranceType: '工伤险', source: '学生实习', maxWorkDays: 60, workZones: ['B区'], skillTags: ['播种', '嫁接'], status: '试用期', joinDate: '2026-04-01' },
  { id: '5', employeeCode: 'TW-005', name: '周建军', phone: '13800138005', idCard: '110101198507205678', workerType: '正式工', contractType: '劳动合同', dailyWage: 260, hourlyWage: 33, insuranceType: '综合险', source: '劳务公司', maxWorkDays: undefined, workZones: ['A区'], skillTags: ['基肥施用', '追肥操作', '水肥一体化'], status: '在职', joinDate: '2025-11-10' },
  { id: '6', employeeCode: 'TW-006', name: '吴丽', phone: '13800138006', idCard: '110101199308256789', workerType: '临时工', contractType: '劳务合同', dailyWage: 210, hourlyWage: 26, insuranceType: '工伤险', source: '个人零工', maxWorkDays: 30, workZones: ['D区'], skillTags: ['长势评估', '病害识别'], status: '停薪留职', joinDate: '2026-01-20' },
  { id: '7', employeeCode: 'TW-007', name: '郑伟', phone: '13800138007', idCard: '110101198812308901', workerType: '季节工', contractType: '劳务合同', dailyWage: 230, hourlyWage: 29, insuranceType: '工伤险', source: '劳务公司', maxWorkDays: 120, workZones: ['A区', 'C区'], skillTags: ['冷链处理', '采收'], status: '离职', joinDate: '2025-08-15' }
]

const tempWorkers = ref([...initialTempWorkers])
const loading = ref(false)
const error = ref('')

// 状态样式（V1.1 TempWorkerTable L16-29）
const getStatusClass = (status) => {
  const map = {
    '在职': 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700',
    '离职': 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600',
    '停薪留职': 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700',
    '试用期': 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700'
  }
  return map[status] || 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600'
}

// 筛选（V1.1 L25-32）
const filters = reactive({ keyword: '', workerType: '', status: '' })
const pagination = reactive({ currentPage: 1, pageSize: 10 })

// 三个互斥批量模式
const batchEditMode = ref(false)
const batchDeleteMode = ref(false)
const exportMode = ref(false)
const selectedRows = ref([])

const editedRecordIds = ref([])
const editedRecords = ref({})
const selectedRecordId = ref('')

const showFormModal = ref(false)
const showBatchEditModal = ref(false)
const showDeleteWarning = ref(false)
const showExportModal = ref(false)
const exportFormat = ref('excel')
const detailDialogVisible = ref(false)
const currentRecord = ref(null)

const formRef = ref()
const isEdit = ref(false)
const tableRef = ref()
const formData = reactive({
  id: null, employeeCode: '', name: '', phone: '', idCard: '',
  workerType: '临时工', contractType: '劳务合同',
  dailyWage: undefined, hourlyWage: undefined,
  insuranceType: '', source: '', maxWorkDays: undefined,
  workZones: [], skillTags: [], status: '在职'
})
const formRules = {
  name: [{ required: true, message: '请输入员工姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  workerType: [{ required: true, message: '请选择工人类型', trigger: 'change' }],
  contractType: [{ required: true, message: '请选择合同类型', trigger: 'change' }],
  workZones: [{ type: 'array', required: true, min: 1, message: '请选择至少一个作业区域', trigger: 'change' }],
  skillTags: [{ type: 'array', required: true, min: 1, message: '请选择至少一项技能标签', trigger: 'change' }]
}

const formDialogVisible = computed({ get: () => showFormModal.value, set: (v) => { showFormModal.value = v } })
const batchEditDialogVisible = computed({ get: () => showBatchEditModal.value, set: (v) => { showBatchEditModal.value = v } })
const deleteWarningVisible = computed({ get: () => showDeleteWarning.value, set: (v) => { showDeleteWarning.value = v } })
const exportModalVisible = computed({ get: () => showExportModal.value, set: (v) => { showExportModal.value = v } })

const inBatchMode = computed(() => batchEditMode.value || batchDeleteMode.value || exportMode.value)

const filteredData = computed(() => {
  return tempWorkers.value.filter(w => {
    if (filters.keyword) {
      const kw = filters.keyword
      if (!w.name.includes(kw) && !w.employeeCode.includes(kw)) return false
    }
    if (filters.workerType && w.workerType !== filters.workerType) return false
    if (filters.status && w.status !== filters.status) return false
    return true
  })
})
const paginatedFilteredData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

const currentEditRecord = computed(() => {
  if (!selectedRecordId.value) return null
  return tempWorkers.value.find(w => w.id === selectedRecordId.value) || null
})
const selectedRecordOptions = computed(() => selectedRows.value
  .map(id => tempWorkers.value.find(w => w.id === id))
  .filter(Boolean)
  .map(r => ({ id: r.id, label: `${r.employeeCode} - ${r.name}${editedRecordIds.value.includes(r.id) ? '  (已编辑)' : ''}` })))

onMounted(() => { loading.value = false })

const handleSearch = () => { pagination.currentPage = 1 }
const handleResetFilters = () => { filters.keyword = ''; filters.workerType = ''; filters.status = ''; pagination.currentPage = 1 }
const handlePageSizeChange = () => { pagination.currentPage = 1 }

const handleSelectAll = () => {
  if (selectedRows.value.length === paginatedFilteredData.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = paginatedFilteredData.value.map(w => w.id)
  }
}
const handleSelectionChange = (selection) => { selectedRows.value = selection.map(s => s.id) }

const enterBatch = (mode) => {
  batchEditMode.value = mode === 'edit'
  batchDeleteMode.value = mode === 'delete'
  exportMode.value = mode === 'export'
  selectedRows.value = []
  if (mode === 'edit') { editedRecordIds.value = []; editedRecords.value = {}; selectedRecordId.value = '' }
}
const cancelBatch = () => {
  batchEditMode.value = false; batchDeleteMode.value = false; exportMode.value = false
  selectedRows.value = []; editedRecordIds.value = []; editedRecords.value = {}; selectedRecordId.value = ''
  if (tableRef.value) tableRef.value.clearSelection()
}

const getEditedField = (field) => {
  if (!selectedRecordId.value || !currentEditRecord.value) return ''
  const edited = editedRecords.value[selectedRecordId.value]
  if (edited && edited[field] !== undefined) return edited[field]
  return currentEditRecord.value[field]
}
const setEditedField = (field, value) => {
  if (!selectedRecordId.value) return
  if (!editedRecords.value[selectedRecordId.value]) editedRecords.value[selectedRecordId.value] = {}
  editedRecords.value[selectedRecordId.value] = { ...editedRecords.value[selectedRecordId.value], [field]: value }
  if (!editedRecordIds.value.includes(selectedRecordId.value)) editedRecordIds.value = [...editedRecordIds.value, selectedRecordId.value]
}
const handleBatchEditConfirm = () => {
  if (!selectedRows.value.length) { ElMessage.warning('请先选择要编辑的记录'); return }
  selectedRecordId.value = selectedRows.value[0]
  showBatchEditModal.value = true
}
const handleBatchEditNext = () => {
  if (selectedRecordId.value && !editedRecordIds.value.includes(selectedRecordId.value)) {
    editedRecordIds.value = [...editedRecordIds.value, selectedRecordId.value]
  }
  const idx = selectedRows.value.findIndex(r => r === selectedRecordId.value)
  const nextId = selectedRows.value[idx + 1]
  if (nextId) selectedRecordId.value = nextId
  else { showBatchEditModal.value = false; cancelBatch() }
}
const handleBatchEditSave = () => {
  try {
    editedRecordIds.value.forEach(id => {
      const i = tempWorkers.value.findIndex(w => w.id === id)
      if (i === -1) return
      tempWorkers.value[i] = { ...tempWorkers.value[i], ...(editedRecords.value[id] || {}) }
    })
    ElMessage.success('批量编辑成功')
    showBatchEditModal.value = false
    cancelBatch()
  } catch { ElMessage.error('批量编辑失败，请重试') }
}

const handleBatchDeleteConfirm = () => {
  if (!selectedRows.value.length) { ElMessage.warning('请先选择要删除的记录'); return }
  showDeleteWarning.value = true
}
const confirmBatchDelete = () => {
  try {
    tempWorkers.value = tempWorkers.value.filter(w => !selectedRows.value.includes(w.id))
    ElMessage.success('批量删除成功')
    showDeleteWarning.value = false
    cancelBatch()
  } catch { ElMessage.error('批量删除失败，请重试') }
}

const handleExportConfirm = () => {
  if (!selectedRows.value.length) { ElMessage.warning('请先选择要导出的数据'); return }
  showExportModal.value = true
}
const confirmExport = () => {
  const selectedData = tempWorkers.value.filter(w => selectedRows.value.includes(w.id))
  const headers = ['工号', '姓名', '类型', '合同类型', '技能数', '状态', '入职日期']
  const exportData = selectedData.map(w => ({
    '工号': w.employeeCode, '姓名': w.name, '类型': w.workerType, '合同类型': w.contractType,
    '技能数': w.skillTags.length, '状态': w.status, '入职日期': w.joinDate
  }))
  let content = '', mimeType = '', extension = ''
  if (exportFormat.value === 'csv') {
    content = headers.join(',') + '\n' + exportData.map(row => headers.map(h => `"${row[h] || ''}"`).join(',')).join('\n')
    mimeType = 'text/csv;charset=utf-8'; extension = 'csv'
  } else if (exportFormat.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'; extension = 'xls'
  } else if (exportFormat.value === 'word') {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">${headers.map(h => `<th>${h}</th>`).join('')}${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-word;charset=utf-8'; extension = 'doc'
  }
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const fileName = `临时工_${todayStr}.${extension}`
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = fileName
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
  showExportModal.value = false
  cancelBatch()
}

const openFormModal = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: null, employeeCode: '', name: '', phone: '', idCard: '',
    workerType: '临时工', contractType: '劳务合同',
    dailyWage: undefined, hourlyWage: undefined,
    insuranceType: '', source: '', maxWorkDays: undefined,
    workZones: [], skillTags: [], status: '在职'
  })
  showFormModal.value = true
}
const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, { ...row })
  showFormModal.value = true
}
const viewDetail = (row) => { currentRecord.value = row; detailDialogVisible.value = true }

// V1.1 单条删除（onDelete）
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除员工 "${row.name}" 吗？`, '确认删除', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    tempWorkers.value = tempWorkers.value.filter(w => w.id !== row.id)
    ElMessage.success('删除成功')
  } catch { /* 取消 */ }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      if (isEdit.value) {
        const idx = tempWorkers.value.findIndex(w => w.id === formData.id)
        if (idx !== -1) tempWorkers.value[idx] = { ...tempWorkers.value[idx], ...formData }
        ElMessage.success('编辑成功')
      } else {
        const newId = String(tempWorkers.value.length + 1)
        const newCode = `TW-${String(tempWorkers.value.length + 1).padStart(3, '0')}`
        tempWorkers.value.push({ ...formData, id: newId, employeeCode: newCode })
        ElMessage.success('入职登记成功')
      }
      showFormModal.value = false
    } catch { ElMessage.error('保存失败，请重试') }
  })
}
const resetFormData = () => { if (formRef.value) formRef.value.clearValidate() }
</script>

<style scoped>
/* 继承全局样式 */
</style>