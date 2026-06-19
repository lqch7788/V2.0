<template>
  <div class="space-y-4 p-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <el-icon :size="20" color="white">
            <FileText />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">合同管理</h1>
          <p class="text-xs text-gray-500">员工合同签订与终止管理</p>
        </div>
      </div>
    </div>

    <!-- 4 KPI 卡片（V1.1 L364-409） -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
      <div class="bg-green-50 rounded-lg p-2">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="18" color="#16a34a"><FileText /></el-icon>
          </div>
          <div>
            <p class="text-xl font-bold text-green-700">{{ statusCounts.生效中 }}</p>
            <p class="text-xs text-green-600">生效中</p>
          </div>
        </div>
      </div>
      <div class="bg-amber-50 rounded-lg p-2">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="18" color="#d97706"><AlertTriangle /></el-icon>
          </div>
          <div>
            <p class="text-xl font-bold text-amber-700">{{ statusCounts.即将到期 }}</p>
            <p class="text-xs text-amber-600">即将到期</p>
          </div>
        </div>
      </div>
      <div class="bg-red-50 rounded-lg p-2">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="18" color="#dc2626"><FileText /></el-icon>
          </div>
          <div>
            <p class="text-xl font-bold text-red-700">{{ statusCounts.已到期 }}</p>
            <p class="text-xs text-red-600">已到期</p>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 rounded-lg p-2">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="18" color="#6b7280"><FileText /></el-icon>
          </div>
          <div>
            <p class="text-xl font-bold text-gray-700">{{ statusCounts.已终止 }}</p>
            <p class="text-xs text-gray-600">已终止</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div class="flex-1 min-w-[200px]">
          <el-input v-model="filters.keyword" placeholder="搜索员工姓名、身份证号、合同编号..." clearable @clear="handleSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <el-select v-model="filters.status" placeholder="全部状态" clearable class="w-full sm:w-32">
          <el-option label="全部状态" value="" />
          <el-option label="生效中" value="生效中" />
          <el-option label="即将到期" value="即将到期" />
          <el-option label="已到期" value="已到期" />
          <el-option label="已终止" value="已终止" />
        </el-select>
        <el-select v-model="filters.contractType" placeholder="全部类型" clearable class="w-full sm:w-32">
          <el-option label="全部类型" value="" />
          <el-option label="劳动合同" value="劳动合同" />
          <el-option label="实习协议" value="实习协议" />
          <el-option label="劳务合同" value="劳务合同" />
        </el-select>
        <div class="flex gap-2">
          <el-button type="warning" @click="handleResetFilters"><el-icon><RotateCcw /></el-icon> 重置</el-button>
          <el-button type="default" @click="handleSearch"><el-icon><Search /></el-icon> 搜索</el-button>
        </div>
      </div>
    </div>

    <!-- 合同记录表 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">合同记录</h3>
        <div class="flex gap-2">
          <template v-if="!inBatchMode">
            <!-- V1.1 L464-471 到期提醒按钮（关键 P0-MD-021 修复） -->
            <el-button size="small" type="warning" @click="openRemindModal">
              <el-icon><AlertTriangle /></el-icon> 到期提醒 ({{ expiringContracts.length }})
            </el-button>
            <el-button size="small" type="primary" @click="openCreateModal"><el-icon><Plus /></el-icon> 新增</el-button>
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
          <el-table-column prop="contractCode" label="合同编号" min-width="140" />
          <el-table-column label="员工姓名" min-width="120">
            <template #default="{ row }">
              <p class="text-gray-900">{{ row.staffName }}</p>
              <p class="text-xs text-gray-500">{{ row.idCard }}</p>
            </template>
          </el-table-column>
          <el-table-column prop="contractType" label="合同类型" min-width="100" />
          <el-table-column label="合同期限" min-width="200">
            <template #default="{ row }">
              <p class="text-gray-900">{{ row.startDate }}</p>
              <p class="text-xs text-gray-500">至 {{ row.endDate }}</p>
            </template>
          </el-table-column>
          <el-table-column label="状态" min-width="100">
            <template #default="{ row }">
              <span :class="getStatusClass(row.computedStatus)">{{ row.computedStatus }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="!inBatchMode" label="操作" width="260" fixed="right">
            <template #default="{ row }">
              <el-tooltip content="查看详情" placement="top">
                <el-button size="small" :icon="Eye" link @click="viewDetail(row)" />
              </el-tooltip>
              <el-tooltip content="编辑" placement="top">
                <el-button size="small" :icon="Edit2" link @click="openEditModal(row)" />
              </el-tooltip>
              <el-tooltip v-if="row.computedStatus !== '已终止' && row.computedStatus !== '已到期'" content="终止" placement="top">
                <el-button size="small" link type="warning" @click="handleTerminate(row)">终止</el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button size="small" :icon="Trash2" link type="danger" @click="handleDelete(row)" />
              </el-tooltip>
            </template>
          </el-table-column>
          <template #empty>
            <div class="text-center py-8"><p class="text-gray-400">{{ error || '暂无合同数据' }}</p></div>
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
    <el-dialog v-model="detailDialogVisible" title="合同详情" width="700px">
      <div v-if="currentRecord" class="space-y-2">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="合同编号">{{ currentRecord.contractCode }}</el-descriptions-item>
          <el-descriptions-item label="合同类型">{{ currentRecord.contractType }}</el-descriptions-item>
          <el-descriptions-item label="员工姓名">{{ currentRecord.staffName }}</el-descriptions-item>
          <el-descriptions-item label="身份证号" :span="2">{{ currentRecord.idCard }}</el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ currentRecord.startDate }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ currentRecord.endDate }}</el-descriptions-item>
          <el-descriptions-item label="月薪">{{ currentRecord.monthlySalary || '-' }}</el-descriptions-item>
          <el-descriptions-item label="日工资">{{ currentRecord.dailyWage || '-' }}</el-descriptions-item>
          <el-descriptions-item label="时工资">{{ currentRecord.hourlyWage || '-' }}</el-descriptions-item>
          <el-descriptions-item label="签订日期">{{ currentRecord.signingDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态" :span="2">
            <span :class="getStatusClass(currentRecord.computedStatus)">{{ currentRecord.computedStatus }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentRecord.remarks || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer><el-button @click="detailDialogVisible = false">关闭</el-button></template>
    </el-dialog>

    <!-- 到期提醒弹窗（V1.1 ContractRemindModal L19-69 - 关键 P0-MD-020 修复） -->
    <el-dialog v-model="remindDialogVisible" title="到期提醒" width="680px">
      <div class="space-y-3">
        <div class="bg-amber-50 rounded-lg p-3 text-sm text-amber-800">
          <p>共有 <strong>{{ expiringContracts.length }}</strong> 份合同将在 30 天内到期，请及时处理</p>
        </div>
        <el-table :data="expiringContracts" stripe max-height="400">
          <el-table-column prop="staffName" label="员工" min-width="100" />
          <el-table-column prop="contractType" label="合同类型" min-width="100" />
          <el-table-column prop="endDate" label="到期日期" min-width="120" />
          <el-table-column label="剩余天数" min-width="100">
            <template #default="{ row }">
              <el-tag :type="getDaysLeftType(row.daysLeft)" size="small">
                {{ row.daysLeft > 0 ? `${row.daysLeft} 天` : '已过期' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="紧急程度" min-width="100">
            <template #default="{ row }">
              <el-tag v-if="row.daysLeft <= 7" type="danger" size="small">紧急</el-tag>
              <el-tag v-else-if="row.daysLeft <= 15" type="warning" size="small">高</el-tag>
              <el-tag v-else type="info" size="small">一般</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="remindDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 表单弹窗（V1.1 ContractFormModal L33-175） -->
    <el-dialog v-model="formDialogVisible" :title="editingContract ? '编辑合同' : '新建合同'" width="640px" @closed="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="员工姓名" prop="staffName">
          <el-input v-model="formData.staffName" placeholder="请输入员工姓名" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="formData.idCard" placeholder="请输入身份证号" maxlength="18" />
        </el-form-item>
        <el-form-item label="合同类型" prop="contractType">
          <el-select v-model="formData.contractType" placeholder="请选择合同类型" style="width:100%">
            <el-option label="劳动合同" value="劳动合同" />
            <el-option label="实习协议" value="实习协议" />
            <el-option label="劳务合同" value="劳务合同" />
          </el-select>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="签订日期" prop="signingDate">
              <el-date-picker v-model="formData.signingDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker v-model="formData.startDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker v-model="formData.endDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width:100%" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="月薪">
              <el-input-number v-model="formData.monthlySalary" :min="0" :precision="0" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="日工资">
              <el-input-number v-model="formData.dailyWage" :min="0" :precision="2" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="时工资">
              <el-input-number v-model="formData.hourlyWage" :min="0" :precision="2" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="formData.remarks" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 批量编辑弹窗 -->
    <el-dialog v-model="batchEditDialogVisible" title="批量编辑合同" width="900px">
      <div class="flex flex-col gap-3">
        <div class="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
          已选择 <strong>{{ selectedRows.length }}</strong> 条合同记录进行批量编辑
        </div>
        <el-select v-model="selectedRecordId" placeholder="请选择记录" style="width:100%">
          <el-option v-for="opt in selectedRecordOptions" :key="opt.id" :label="opt.label" :value="opt.id" />
        </el-select>
        <div v-if="currentEditRecord" class="grid grid-cols-4 gap-3">
          <div class="bg-gray-100 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">合同编号</div><div class="text-sm font-medium">{{ currentEditRecord.contractCode }}</div></div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">员工姓名</div><el-input :model-value="getEditedField('staffName')" @update:model-value="(v) => setEditedField('staffName', v)" size="small" /></div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">合同类型</div>
            <el-select :model-value="getEditedField('contractType')" @update:model-value="(v) => setEditedField('contractType', v)" size="small" style="width:100%">
              <el-option label="劳动合同" value="劳动合同" /><el-option label="实习协议" value="实习协议" /><el-option label="劳务合同" value="劳务合同" />
            </el-select>
          </div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">结束日期</div><el-date-picker :model-value="getEditedField('endDate')" @update:model-value="(v) => setEditedField('endDate', v)" type="date" value-format="YYYY-MM-DD" size="small" style="width:100%" /></div>
        </div>
      </div>
      <template #footer>
        <el-button @click="handleBatchEditNext">确认（下一个）</el-button>
        <el-button @click="batchEditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchEditSave">保存修改</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog v-model="deleteWarningVisible" title="删除合同警告" width="480px">
      <div class="flex items-center gap-4 mb-4">
        <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <span class="text-red-600 text-2xl">!</span>
        </div>
        <p class="text-sm text-gray-500">此操作不可撤销</p>
      </div>
      <p class="text-gray-600 mb-2">确定要删除选中的 <strong class="text-red-600">{{ selectedRows.length }}</strong> 条合同记录吗？</p>
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
 * 合同管理 Panel
 * 1:1 对应 V1.1 ContractTable.tsx
 * 关键 P0-MD-020/021：到期提醒弹窗 + 到期提醒按钮
 */
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FileText, Search, RotateCcw, Plus, Edit2, Trash2, Download, X, AlertTriangle, Eye } from 'lucide-vue-next'

const EXPORT_FORMATS = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

// V1.1 statusConfig L92-97
const getStatusClass = (status) => {
  const map = {
    '生效中': 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700',
    '即将到期': 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700',
    '已到期': 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700',
    '已终止': 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600'
  }
  return map[status] || 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600'
}

const getDaysLeftType = (days) => {
  if (days <= 7) return 'danger'
  if (days <= 15) return 'warning'
  return 'info'
}

// 动态计算合同状态（V1.1 L148-158 getComputedStatus）
const computeStatus = (contract) => {
  if (contract.status === '已终止') return '已终止'
  const endDate = new Date(contract.endDate)
  const today = new Date()
  const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (daysUntilExpiry < 0) return '已到期'
  if (daysUntilExpiry <= 30) return '即将到期'
  return '生效中'
}

// 计算剩余天数
const getDaysLeft = (endDate) => {
  const days = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  return days
}

const today = new Date()
const days30 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
const days30Str = `${days30.getFullYear()}-${String(days30.getMonth() + 1).padStart(2, '0')}-${String(days30.getDate()).padStart(2, '0')}`

const initialContracts = [
  { id: '1', contractCode: 'HT-2024-001', staffName: '张明', idCard: '110101199001011234', contractType: '劳动合同', startDate: '2024-01-01', endDate: '2026-12-31', monthlySalary: 8000, dailyWage: undefined, hourlyWage: undefined, signingDate: '2023-12-25', status: '生效中', remarks: '生产主管' },
  { id: '2', contractCode: 'HT-2025-002', staffName: '李华', idCard: '110101199203052345', contractType: '劳动合同', startDate: '2025-03-01', endDate: days30Str, monthlySalary: 12000, dailyWage: undefined, hourlyWage: undefined, signingDate: '2025-02-25', status: '生效中', remarks: '技术总监（即将到期）' },
  { id: '3', contractCode: 'HT-2026-003', staffName: '周晓', idCard: '110101200005154567', contractType: '实习协议', startDate: '2026-05-01', endDate: '2026-07-31', monthlySalary: undefined, dailyWage: undefined, hourlyWage: 25, signingDate: '2026-04-25', status: '生效中', remarks: '暑期实习' },
  { id: '4', contractCode: 'HT-2025-004', staffName: '孙小军', idCard: '110101199812102345', contractType: '劳务合同', startDate: '2025-04-01', endDate: '2025-12-31', monthlySalary: undefined, dailyWage: 200, hourlyWage: undefined, signingDate: '2025-03-25', status: '已到期', remarks: '仓库管理员' },
  { id: '5', contractCode: 'HT-2024-005', staffName: '赵强', idCard: '110101198805103456', contractType: '劳动合同', startDate: '2024-06-01', endDate: '2026-05-31', monthlySalary: 15000, dailyWage: undefined, hourlyWage: undefined, signingDate: '2024-05-25', status: '已到期', remarks: '销售经理（已到期）' },
  { id: '6', contractCode: 'HT-2023-006', staffName: '陈某', idCard: '110101199308256789', contractType: '劳动合同', startDate: '2023-09-01', endDate: '2026-08-31', monthlySalary: 7000, dailyWage: undefined, hourlyWage: undefined, signingDate: '2023-08-25', status: '生效中', remarks: '人事专员' },
  { id: '7', contractCode: 'HT-2025-007', staffName: '李某', idCard: '110101198812308901', contractType: '劳动合同', startDate: '2025-01-01', endDate: '2026-04-30', monthlySalary: 6000, dailyWage: undefined, hourlyWage: undefined, signingDate: '2024-12-25', status: '已终止', remarks: '因违反公司规定被终止' }
]

// 自动附加 computedStatus
initialContracts.forEach(c => { c.computedStatus = computeStatus(c) })

const contracts = ref([...initialContracts])
const loading = ref(false)
const error = ref('')

const filters = reactive({ keyword: '', status: '', contractType: '' })
const pagination = reactive({ currentPage: 1, pageSize: 10 })

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
const editingContract = ref(null)
const remindDialogVisible = ref(false) // V1.1 ContractRemindModal

const tableRef = ref()
const formRef = ref()
const formData = reactive({
  staffName: '', idCard: '', contractType: '', signingDate: '',
  startDate: '', endDate: '', monthlySalary: undefined, dailyWage: undefined, hourlyWage: undefined, remarks: ''
})
const formRules = {
  staffName: [{ required: true, message: '请输入员工姓名', trigger: 'blur' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  contractType: [{ required: true, message: '请选择合同类型', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }]
}

const formDialogVisible = computed({ get: () => showFormModal.value, set: (v) => { showFormModal.value = v } })
const batchEditDialogVisible = computed({ get: () => showBatchEditModal.value, set: (v) => { showBatchEditModal.value = v } })
const deleteWarningVisible = computed({ get: () => showDeleteWarning.value, set: (v) => { showDeleteWarning.value = v } })
const exportModalVisible = computed({ get: () => showExportModal.value, set: (v) => { showExportModal.value = v } })

const inBatchMode = computed(() => batchEditMode.value || batchDeleteMode.value || exportMode.value)

// V1.1 L245 getExpiringContracts(30)
const expiringContracts = computed(() => {
  return contracts.value
    .filter(c => {
      const days = getDaysLeft(c.endDate)
      return days <= 30 && days >= -30 && c.status !== '已终止'
    })
    .map(c => ({ ...c, daysLeft: getDaysLeft(c.endDate) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
})

const statusCounts = computed(() => ({
  生效中: contracts.value.filter(c => c.computedStatus === '生效中').length,
  即将到期: expiringContracts.value.length,
  已到期: contracts.value.filter(c => c.computedStatus === '已到期').length,
  已终止: contracts.value.filter(c => c.status === '已终止').length
}))

const filteredData = computed(() => {
  return contracts.value.filter(c => {
    if (filters.keyword) {
      const kw = filters.keyword
      if (!c.contractCode.includes(kw) && !c.staffName.includes(kw) && !c.idCard.includes(kw)) return false
    }
    if (filters.status && c.computedStatus !== filters.status && !(filters.status === '已终止' && c.status === '已终止')) return false
    if (filters.contractType && c.contractType !== filters.contractType) return false
    return true
  })
})
const paginatedFilteredData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

const currentEditRecord = computed(() => {
  if (!selectedRecordId.value) return null
  return contracts.value.find(c => c.id === selectedRecordId.value) || null
})
const selectedRecordOptions = computed(() => selectedRows.value
  .map(id => contracts.value.find(c => c.id === id))
  .filter(Boolean)
  .map(c => ({ id: c.id, label: `${c.contractCode} - ${c.staffName}${editedRecordIds.value.includes(c.id) ? '  (已编辑)' : ''}` })))

onMounted(() => { loading.value = false })

const handleSearch = () => { pagination.currentPage = 1 }
const handleResetFilters = () => { filters.keyword = ''; filters.status = ''; filters.contractType = ''; pagination.currentPage = 1 }
const handlePageSizeChange = () => { pagination.currentPage = 1 }

const handleSelectAll = () => {
  if (selectedRows.value.length === paginatedFilteredData.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = paginatedFilteredData.value.map(c => c.id)
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
      const i = contracts.value.findIndex(c => c.id === id)
      if (i === -1) return
      contracts.value[i] = { ...contracts.value[i], ...(editedRecords.value[id] || {}) }
      contracts.value[i].computedStatus = computeStatus(contracts.value[i])
    })
    ElMessage.success('批量编辑成功')
    showBatchEditModal.value = false
    cancelBatch()
  } catch { ElMessage.error('批量编辑失败') }
}

const handleBatchDeleteConfirm = () => {
  if (!selectedRows.value.length) { ElMessage.warning('请先选择要删除的记录'); return }
  showDeleteWarning.value = true
}
const confirmBatchDelete = () => {
  contracts.value = contracts.value.filter(c => !selectedRows.value.includes(c.id))
  ElMessage.success('批量删除成功')
  showDeleteWarning.value = false
  cancelBatch()
}

const handleExportConfirm = () => {
  if (!selectedRows.value.length) { ElMessage.warning('请先选择要导出的数据'); return }
  showExportModal.value = true
}
const confirmExport = () => {
  const selectedData = contracts.value.filter(c => selectedRows.value.includes(c.id))
  const headers = ['合同编号', '员工姓名', '身份证号', '合同类型', '开始日期', '结束日期', '状态']
  const exportData = selectedData.map(c => ({
    '合同编号': c.contractCode, '员工姓名': c.staffName, '身份证号': c.idCard,
    '合同类型': c.contractType, '开始日期': c.startDate, '结束日期': c.endDate,
    '状态': c.computedStatus
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
  const fileName = `合同记录_${todayStr}.${extension}`
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

const openRemindModal = () => { remindDialogVisible.value = true }

// V1.1 L230-235 handleTerminate
const handleTerminate = async (row) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入终止原因：', '终止合同', { confirmButtonText: '确定终止', cancelButtonText: '取消', type: 'warning' })
    if (!reason || !reason.trim()) { ElMessage.warning('请输入终止原因'); return }
    const idx = contracts.value.findIndex(c => c.id === row.id)
    if (idx !== -1) {
      contracts.value[idx] = { ...contracts.value[idx], status: '已终止', remarks: reason }
      contracts.value[idx].computedStatus = '已终止'
      ElMessage.success('合同已终止')
    }
  } catch { /* 取消 */ }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除合同 "${row.contractCode}" 吗？`, '确认删除', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    contracts.value = contracts.value.filter(c => c.id !== row.id)
    ElMessage.success('删除成功')
  } catch { /* 取消 */ }
}

const viewDetail = (row) => { currentRecord.value = row; detailDialogVisible.value = true }
const openCreateModal = () => {
  editingContract.value = null
  resetForm()
  showFormModal.value = true
}
const openEditModal = (contract) => {
  editingContract.value = contract
  Object.assign(formData, { ...contract })
  showFormModal.value = true
}
const resetForm = () => {
  Object.assign(formData, {
    staffName: '', idCard: '', contractType: '', signingDate: '',
    startDate: '', endDate: '', monthlySalary: undefined, dailyWage: undefined, hourlyWage: undefined, remarks: ''
  })
  if (formRef.value) formRef.value.clearValidate()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      const code = editingContract.value ? formData.contractCode : `HT-${new Date().getFullYear()}-${String(contracts.value.length + 1).padStart(3, '0')}`
      const newContract = { id: editingContract.value ? formData.id : String(contracts.value.length + 1), ...formData, contractCode: code, status: '生效中' }
      newContract.computedStatus = computeStatus(newContract)
      if (editingContract.value) {
        const idx = contracts.value.findIndex(c => c.id === editingContract.value.id)
        if (idx !== -1) contracts.value[idx] = newContract
        ElMessage.success('编辑成功')
      } else {
        contracts.value.push(newContract)
        ElMessage.success('创建成功')
      }
      showFormModal.value = false
    } catch { ElMessage.error('保存失败') }
  })
}
</script>

<style scoped>
/* 继承全局样式 */
</style>