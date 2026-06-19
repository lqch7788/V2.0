<template>
  <div class="space-y-4 p-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <el-icon :size="20" color="white">
            <Medal />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">技能档案</h1>
          <p class="text-xs text-gray-500">员工技能与培训记录</p>
        </div>
      </div>
    </div>

    <!-- 4 KPI 卡片（V1.1 L293-338） -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
      <div class="bg-blue-50 rounded-lg p-2">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="18" color="#2563eb"><User /></el-icon>
          </div>
          <div>
            <p class="text-xl font-bold text-blue-700">{{ totalCount }}</p>
            <p class="text-xs text-blue-600">员工总数</p>
          </div>
        </div>
      </div>
      <div class="bg-green-50 rounded-lg p-2">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="18" color="#16a34a"><CircleCheck /></el-icon>
          </div>
          <div>
            <p class="text-xl font-bold text-green-700">{{ normalCount }}</p>
            <p class="text-xs text-green-600">正常状态</p>
          </div>
        </div>
      </div>
      <div class="bg-amber-50 rounded-lg p-2">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="18" color="#d97706"><AlertTriangle /></el-icon>
          </div>
          <div>
            <p class="text-xl font-bold text-amber-700">{{ expiringCount }}</p>
            <p class="text-xs text-amber-600">即将过期</p>
          </div>
        </div>
      </div>
      <div class="bg-red-50 rounded-lg p-2">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="18" color="#dc2626"><XCircle /></el-icon>
          </div>
          <div>
            <p class="text-xl font-bold text-red-700">{{ expiredCount }}</p>
            <p class="text-xs text-red-600">已过期</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选栏（V1.1 SkillFiltersComponent） -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div class="flex-1 min-w-[200px]">
          <el-input v-model="filters.keyword" placeholder="搜索工号、姓名..." clearable @clear="handleSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <el-select v-model="filters.skillType" placeholder="全部技能类型" clearable class="w-full sm:w-32">
          <el-option label="全部技能类型" value="" />
          <el-option label="灌溉技能" value="灌溉技能" />
          <el-option label="施肥技能" value="施肥技能" />
          <el-option label="植保技能" value="植保技能" />
          <el-option label="采收技能" value="采收技能" />
          <el-option label="农机技能" value="农机技能" />
          <el-option label="温室技能" value="温室技能" />
          <el-option label="农事技能" value="农事技能" />
        </el-select>
        <el-select v-model="filters.level" placeholder="全部等级" clearable class="w-full sm:w-32">
          <el-option label="全部等级" value="" />
          <el-option label="初级" value="初级" />
          <el-option label="中级" value="中级" />
          <el-option label="高级" value="高级" />
          <el-option label="技师" value="技师" />
        </el-select>
        <el-select v-model="filters.status" placeholder="全部状态" clearable class="w-full sm:w-32">
          <el-option label="全部状态" value="" />
          <el-option label="正常" value="正常" />
          <el-option label="即将过期" value="即将过期" />
          <el-option label="已过期" value="已过期" />
        </el-select>
        <div class="flex gap-2">
          <el-button type="warning" @click="handleResetFilters"><el-icon><RotateCcw /></el-icon> 重置</el-button>
          <el-button type="default" @click="handleSearch"><el-icon><Search /></el-icon> 搜索</el-button>
        </div>
      </div>
    </div>

    <!-- 技能档案表（V1.1 SkillTable L94-212） -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">技能档案列表</h3>
        <div class="flex gap-2">
          <template v-if="!inBatchMode">
            <el-button size="small" type="primary" @click="openAddModal"><el-icon><Plus /></el-icon> 新增</el-button>
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
          <el-table-column prop="staffId" label="工号" min-width="120" />
          <el-table-column prop="staffName" label="姓名" min-width="100" />
          <el-table-column prop="department" label="部门" min-width="100" />
          <el-table-column label="技能标签" min-width="200">
            <template #default="{ row }">
              <div class="flex flex-wrap gap-1">
                <el-tag v-for="s in row.skills" :key="s.tag" :type="getLevelTagType(s.level)" size="small">
                  {{ s.tag }} · {{ s.level }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="技能数" min-width="80" align="center">
            <template #default="{ row }">
              <span class="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">{{ row.skills.length }} 项</span>
            </template>
          </el-table-column>
          <el-table-column label="证书数" min-width="80" align="center">
            <template #default="{ row }">{{ row.certificationCount }}</template>
          </el-table-column>
          <el-table-column label="状态" min-width="100">
            <template #default="{ row }">
              <span :class="getStatusClass(row.status)">{{ row.status }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="!inBatchMode" label="操作" width="200" fixed="right">
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

    <!-- 详情弹窗（含培训记录 V1.1 L125 trainingRecords） -->
    <el-dialog v-model="detailDialogVisible" title="技能档案详情" width="700px">
      <div v-if="currentRecord" class="space-y-3">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="工号">{{ currentRecord.staffId }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ currentRecord.staffName }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ currentRecord.department }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <span :class="getStatusClass(currentRecord.status)">{{ currentRecord.status }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <div>
          <h4 class="text-sm font-semibold text-gray-900 mb-2">技能列表</h4>
          <el-table :data="currentRecord.skills" border>
            <el-table-column prop="tag" label="技能" />
            <el-table-column prop="level" label="等级">
              <template #default="{ row }">
                <el-tag :type="getLevelTagType(row.level)" size="small">{{ row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="certDate" label="认证日期" />
            <el-table-column prop="expireDate" label="到期日期" />
          </el-table>
        </div>

        <div v-if="currentRecord.trainingRecords && currentRecord.trainingRecords.length">
          <h4 class="text-sm font-semibold text-gray-900 mb-2">培训记录</h4>
          <el-timeline>
            <el-timeline-item v-for="(tr, idx) in currentRecord.trainingRecords" :key="idx"
              :timestamp="tr.date" placement="top">
              <span class="font-medium">{{ tr.title }}</span>
              <p class="text-xs text-gray-500 mt-1">{{ tr.desc }} · 培训师：{{ tr.trainer }}</p>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      <template #footer><el-button @click="detailDialogVisible = false">关闭</el-button></template>
    </el-dialog>

    <!-- 表单弹窗（V1.1 SkillFormModal L97-141） -->
    <el-dialog v-model="formDialogVisible" :title="editingSkill ? '编辑员工技能档案' : '新建员工技能档案'" width="640px" @closed="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="员工工号" prop="staffId"><el-input v-model="formData.staffId" placeholder="请输入员工工号" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="姓名" prop="staffName"><el-input v-model="formData.staffName" placeholder="请输入姓名" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="部门" prop="department">
          <el-select v-model="formData.department" placeholder="请选择部门" style="width:100%">
            <el-option v-for="d in DEPT_OPTIONS.filter(x => x.value)" :key="d.value" :label="d.label" :value="d.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="技能标签" prop="skills">
          <div class="space-y-2 w-full">
            <div v-for="(tags, group) in SKILL_TAG_GROUPS" :key="group">
              <div class="text-xs text-gray-500 mb-1">{{ group }}</div>
              <el-checkbox-group v-model="formData.selectedTags">
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
    <el-dialog v-model="batchEditDialogVisible" title="批量编辑技能档案" width="900px">
      <div class="flex flex-col gap-3">
        <div class="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
          已选择 <strong>{{ selectedRows.length }}</strong> 条记录进行批量编辑
        </div>
        <el-select v-model="selectedRecordId" placeholder="请选择记录" style="width:100%">
          <el-option v-for="opt in selectedRecordOptions" :key="opt.id" :label="opt.label" :value="opt.id" />
        </el-select>
        <div v-if="currentEditRecord" class="grid grid-cols-3 gap-3">
          <div class="bg-gray-100 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">工号</div><div class="text-sm font-medium">{{ currentEditRecord.staffId }}</div></div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">姓名</div><el-input :model-value="getEditedField('staffName')" @update:model-value="(v) => setEditedField('staffName', v)" size="small" /></div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">部门</div>
            <el-select :model-value="getEditedField('department')" @update:model-value="(v) => setEditedField('department', v)" size="small" style="width:100%">
              <el-option v-for="d in DEPT_OPTIONS.filter(x => x.value)" :key="d.value" :label="d.label" :value="d.value" />
            </el-select>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="handleBatchEditNext">确认（下一个）</el-button>
        <el-button @click="batchEditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchEditSave">保存修改</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog v-model="deleteWarningVisible" title="删除技能档案警告" width="480px">
      <div class="flex items-center gap-4 mb-4">
        <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <span class="text-red-600 text-2xl">!</span>
        </div>
        <p class="text-sm text-gray-500">此操作不可撤销</p>
      </div>
      <p class="text-gray-600 mb-2">确定要删除选中的 <strong class="text-red-600">{{ selectedRows.length }}</strong> 条技能档案吗？</p>
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
 * 技能档案 Panel
 * 1:1 对应 V1.1 SkillPage.tsx
 * 包含 KPI 卡片 + 技能标签分组 + 等级徽章 + 培训记录时间线 + 批量操作
 */
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Medal, User, Search, RotateCcw, Plus, Edit2, Trash2, Download, X, Eye, CircleCheck, AlertTriangle, XCircle } from 'lucide-vue-next'
import { DEPT_OPTIONS } from '@/data/laborData'

const EXPORT_FORMATS = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

// 技能标签分组（V1.1 SkillFormModal L23-31）
const SKILL_TAG_GROUPS = {
  '灌溉技能': ['微喷灌溉', '滴灌操作', '渗灌系统', '灌溉设备'],
  '施肥技能': ['基肥施用', '追肥操作', '水肥一体化'],
  '植保技能': ['农药配制', '喷雾操作', '生物防治', '病害识别', '虫害识别'],
  '采收技能': ['果蔬采收', '分级包装', '冷链处理'],
  '农机技能': ['拖拉机', '旋耕机', '收割机'],
  '温室技能': ['温室调控', '加温系统', '通风系统'],
  '农事技能': ['长势评估', '播种', '嫁接', '炼苗']
}

const getStatusClass = (status) => {
  const map = {
    '正常': 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700',
    '即将过期': 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700',
    '已过期': 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700'
  }
  return map[status] || 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600'
}

// V1.1 SkillTable L79-92 等级徽章颜色
const getLevelTagType = (level) => {
  const map = { '初级': 'info', '中级': 'primary', '高级': 'warning', '技师': 'danger' }
  return map[level] || 'info'
}

const today = new Date()
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
const futureDate = (days) => {
  const d = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const initialSkills = [
  { id: '1', staffId: 'EMP-001', staffName: '张明', department: '生产部', skills: [
    { tag: '微喷灌溉', level: '高级', certDate: '2024-03-01', expireDate: futureDate(180) },
    { tag: '拖拉机', level: '技师', certDate: '2023-06-15', expireDate: futureDate(90) }
  ], certificationCount: 2, status: '正常', trainingRecords: [
    { date: '2024-03-01', title: '微喷灌溉技能培训', desc: '完成灌溉系统基础课程', trainer: '王老师' },
    { date: '2025-09-15', title: '拖拉机驾驶培训', desc: '农机安全驾驶规范', trainer: '李师傅' }
  ] },
  { id: '2', staffId: 'EMP-002', staffName: '李华', department: '技术部', skills: [
    { tag: '病害识别', level: '技师', certDate: '2024-01-10', expireDate: futureDate(20) },
    { tag: '生物防治', level: '高级', certDate: '2024-05-20', expireDate: futureDate(60) }
  ], certificationCount: 2, status: '即将过期', trainingRecords: [
    { date: '2024-01-10', title: '植保技能高级培训', desc: '病虫害诊断专家认证', trainer: '王老师' }
  ] },
  { id: '3', staffId: 'EMP-003', staffName: '周晓', department: '技术部', skills: [
    { tag: '嫁接', level: '初级', certDate: '2025-04-01', expireDate: futureDate(365) },
    { tag: '播种', level: '初级', certDate: '2025-04-01', expireDate: futureDate(365) }
  ], certificationCount: 1, status: '正常', trainingRecords: [
    { date: '2025-04-01', title: '园艺基础培训', desc: '完成园艺入门课程', trainer: '王老师' }
  ] },
  { id: '4', staffId: 'EMP-004', staffName: '孙小军', department: '仓储部', skills: [
    { tag: '冷链处理', level: '中级', certDate: '2024-08-10', expireDate: futureDate(-30) }
  ], certificationCount: 1, status: '已过期', trainingRecords: [
    { date: '2024-08-10', title: '冷链物流培训', desc: '冷链管理中级认证', trainer: '李老师' }
  ] },
  { id: '5', staffId: 'EMP-005', staffName: '赵强', department: '销售部', skills: [
    { tag: '果蔬采收', level: '中级', certDate: '2025-02-15', expireDate: futureDate(200) }
  ], certificationCount: 1, status: '正常', trainingRecords: [] }
]

const skills = ref([...initialSkills])
const loading = ref(false)
const error = ref('')

const filters = reactive({ keyword: '', skillType: '', level: '', status: '' })
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
const editingSkill = ref(null)

const tableRef = ref()
const formRef = ref()
const formData = reactive({
  staffId: '', staffName: '', department: '', selectedTags: []
})
const formRules = {
  staffId: [{ required: true, message: '请输入员工工号', trigger: 'blur' }],
  staffName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  selectedTags: [{ type: 'array', required: true, min: 1, message: '请选择至少一项技能', trigger: 'change' }]
}

const formDialogVisible = computed({ get: () => showFormModal.value, set: (v) => { showFormModal.value = v } })
const batchEditDialogVisible = computed({ get: () => showBatchEditModal.value, set: (v) => { showBatchEditModal.value = v } })
const deleteWarningVisible = computed({ get: () => showDeleteWarning.value, set: (v) => { showDeleteWarning.value = v } })
const exportModalVisible = computed({ get: () => showExportModal.value, set: (v) => { showExportModal.value = v } })

const inBatchMode = computed(() => batchEditMode.value || batchDeleteMode.value || exportMode.value)

const totalCount = computed(() => skills.value.length)
const normalCount = computed(() => skills.value.filter(s => s.status === '正常').length)
const expiringCount = computed(() => skills.value.filter(s => s.status === '即将过期').length)
const expiredCount = computed(() => skills.value.filter(s => s.status === '已过期').length)

const filteredData = computed(() => {
  return skills.value.filter(s => {
    if (filters.keyword) {
      const kw = filters.keyword
      if (!s.staffId.includes(kw) && !s.staffName.includes(kw)) return false
    }
    if (filters.skillType) {
      const hasType = s.skills.some(sk => SKILL_TAG_GROUPS[filters.skillType]?.includes(sk.tag))
      if (!hasType) return false
    }
    if (filters.level) {
      const hasLevel = s.skills.some(sk => sk.level === filters.level)
      if (!hasLevel) return false
    }
    if (filters.status && s.status !== filters.status) return false
    return true
  })
})
const paginatedFilteredData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

const currentEditRecord = computed(() => {
  if (!selectedRecordId.value) return null
  return skills.value.find(s => s.id === selectedRecordId.value) || null
})
const selectedRecordOptions = computed(() => selectedRows.value
  .map(id => skills.value.find(s => s.id === id))
  .filter(Boolean)
  .map(s => ({ id: s.id, label: `${s.staffId} - ${s.staffName}${editedRecordIds.value.includes(s.id) ? '  (已编辑)' : ''}` })))

onMounted(() => { loading.value = false })

const handleSearch = () => { pagination.currentPage = 1 }
const handleResetFilters = () => { filters.keyword = ''; filters.skillType = ''; filters.level = ''; filters.status = ''; pagination.currentPage = 1 }
const handlePageSizeChange = () => { pagination.currentPage = 1 }

const handleSelectAll = () => {
  if (selectedRows.value.length === paginatedFilteredData.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = paginatedFilteredData.value.map(s => s.id)
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
      const i = skills.value.findIndex(s => s.id === id)
      if (i === -1) return
      skills.value[i] = { ...skills.value[i], ...(editedRecords.value[id] || {}) }
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
  skills.value = skills.value.filter(s => !selectedRows.value.includes(s.id))
  ElMessage.success('批量删除成功')
  showDeleteWarning.value = false
  cancelBatch()
}

const handleExportConfirm = () => {
  if (!selectedRows.value.length) { ElMessage.warning('请先选择要导出的数据'); return }
  showExportModal.value = true
}
const confirmExport = () => {
  const selectedData = skills.value.filter(s => selectedRows.value.includes(s.id))
  const headers = ['工号', '姓名', '部门', '技能标签', '证书数量', '状态']
  const exportData = selectedData.map(s => ({
    '工号': s.staffId, '姓名': s.staffName, '部门': s.department,
    '技能标签': s.skills.map(sk => sk.tag).join('; '), '证书数量': s.certificationCount, '状态': s.status
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
  const fileName = `技能档案_${todayStr}.${extension}`
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

const viewDetail = (row) => { currentRecord.value = row; detailDialogVisible.value = true }
const openAddModal = () => {
  editingSkill.value = null
  resetForm()
  showFormModal.value = true
}
const handleEdit = (row) => {
  editingSkill.value = row
  Object.assign(formData, { staffId: row.staffId, staffName: row.staffName, department: row.department, selectedTags: row.skills.map(s => s.tag) })
  showFormModal.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除技能档案 "${row.staffName}" 吗？`, '确认删除', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    skills.value = skills.value.filter(s => s.id !== row.id)
    ElMessage.success('删除成功')
  } catch { /* 取消 */ }
}

const resetForm = () => {
  Object.assign(formData, { staffId: '', staffName: '', department: '', selectedTags: [] })
  if (formRef.value) formRef.value.clearValidate()
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      const skillsArr = formData.selectedTags.map(tag => ({
        tag, level: '中级', certDate: todayStr, expireDate: futureDate(365)
      }))
      if (editingSkill.value) {
        const idx = skills.value.findIndex(s => s.id === editingSkill.value.id)
        if (idx !== -1) {
          skills.value[idx] = {
            ...skills.value[idx],
            staffId: formData.staffId, staffName: formData.staffName, department: formData.department,
            skills: skillsArr, certificationCount: skillsArr.length,
            status: skillsArr.length > 0 ? '正常' : '已过期'
          }
        }
        ElMessage.success('编辑成功')
      } else {
        const newId = String(skills.value.length + 1)
        skills.value.push({
          id: newId,
          staffId: formData.staffId, staffName: formData.staffName, department: formData.department,
          skills: skillsArr, certificationCount: skillsArr.length,
          status: '正常', trainingRecords: []
        })
        ElMessage.success('添加成功')
      }
      showFormModal.value = false
    } catch { ElMessage.error('保存失败') }
  })
}
</script>

<style scoped>
/* 继承全局样式 */
</style>