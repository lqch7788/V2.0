<template>
  <div class="space-y-4 p-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><ClipboardCheck /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">职务管理</h1>
          <p class="text-xs text-gray-500">职务信息管理与组织架构</p>
        </div>
      </div>
    </div>

    <!-- 3 个 KPI 卡片：职务总数 / 启用中 / 在职人数（V1.1 L382-416） -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div class="bg-blue-50 rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <el-icon :size="20" color="#2563eb"><ClipboardCheck /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-blue-700">{{ totalCount }}</p>
            <p class="text-xs text-blue-600">职务总数</p>
          </div>
        </div>
      </div>
      <div class="bg-green-50 rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <span class="text-green-600 text-xl font-bold">✓</span>
          </div>
          <div>
            <p class="text-2xl font-bold text-green-700">{{ activeCount }}</p>
            <p class="text-xs text-green-600">启用中</p>
          </div>
        </div>
      </div>
      <div class="bg-amber-50 rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <span class="text-amber-600 text-xl font-bold">!</span>
          </div>
          <div>
            <p class="text-2xl font-bold text-amber-700">{{ onJobCount }}</p>
            <p class="text-xs text-amber-600">在职人数</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选栏（V1.1 L419-482） -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div class="flex-1 min-w-[200px]">
          <el-input v-model="filters.keyword" placeholder="搜索职务编号、名称、部门..." clearable @clear="handleSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <el-select v-model="filters.level" placeholder="全部级别" clearable class="w-full sm:w-32">
          <el-option label="全部级别" value="" />
          <el-option label="高层" value="高层" />
          <el-option label="中层" value="中层" />
          <el-option label="基层" value="基层" />
        </el-select>
        <el-select v-model="filters.status" placeholder="全部状态" clearable class="w-full sm:w-32">
          <el-option label="全部状态" value="" />
          <el-option label="启用" value="启用" />
          <el-option label="停用" value="停用" />
        </el-select>
        <div class="flex gap-2">
          <el-button type="warning" @click="handleResetFilters"><el-icon><RotateCcw /></el-icon> 重置</el-button>
          <el-button type="default" @click="handleSearch"><el-icon><Search /></el-icon> 搜索</el-button>
        </div>
      </div>
    </div>

    <!-- 职务列表（V1.1 L484-682） -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">职务列表</h3>
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
          row-class-name="position-table-row" @selection-change="handleSelectionChange">
          <el-table-column v-if="inBatchMode" type="selection" width="55" />
          <el-table-column prop="code" label="职务编号" min-width="120" />
          <el-table-column prop="name" label="职务名称" min-width="120" />
          <el-table-column prop="dept" label="所属部门" min-width="100" />
          <el-table-column prop="level" label="职务级别" min-width="100" />
          <el-table-column label="基本工资(元)" min-width="120" align="right">
            <template #default> - </template>
          </el-table-column>
          <el-table-column label="岗位人数" min-width="100" align="right">
            <template #default> - </template>
          </el-table-column>
          <el-table-column prop="description" label="职责描述" min-width="180" show-overflow-tooltip />
          <el-table-column label="状态" min-width="100">
            <template #default="{ row }">
              <span :class="row.statusClass === 'normal'
                ? 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700'
                : 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700'">
                {{ row.status }}
              </span>
            </template>
          </el-table-column>
          <el-table-column v-if="!inBatchMode" label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-tooltip content="编辑" placement="top">
                <el-button size="small" :icon="Edit2" link @click="handleEdit(row)" />
              </el-tooltip>
              <el-tooltip content="查看" placement="top">
                <el-button size="small" :icon="Eye" link @click="viewDetail(row)" />
              </el-tooltip>
            </template>
          </el-table-column>
          <template #empty>
            <div class="text-center py-8"><p class="text-gray-400">{{ error || '暂无数据' }}</p></div>
          </template>
        </el-table>
      </div>

      <!-- 分页（V1.1 L672-680，Element Plus el-pagination） -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div class="text-sm text-gray-500">共 {{ filteredData.length }} 条</div>
        <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]" :total="filteredData.length"
          layout="sizes, prev, pager, next, jumper" background
          @size-change="handlePageSizeChange" />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="职务详情" width="600px">
      <div v-if="currentRecord" class="space-y-2">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="职务编号">{{ currentRecord.code }}</el-descriptions-item>
          <el-descriptions-item label="职务名称">{{ currentRecord.name }}</el-descriptions-item>
          <el-descriptions-item label="所属部门">{{ currentRecord.dept }}</el-descriptions-item>
          <el-descriptions-item label="职务级别">{{ currentRecord.level }}</el-descriptions-item>
          <el-descriptions-item label="基本工资">-</el-descriptions-item>
          <el-descriptions-item label="岗位人数">-</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentRecord.statusClass === 'normal' ? 'success' : 'info'" size="small">
              {{ currentRecord.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="职责描述" :span="2">{{ currentRecord.description || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer><el-button @click="detailDialogVisible = false">关闭</el-button></template>
    </el-dialog>

    <!-- 表单弹窗：PositionFormModal -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑职务' : '新增职务'" width="640px" @closed="resetFormData">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="职务编号"><el-input v-model="formData.code" placeholder="请输入职务编号" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="职务名称" prop="name"><el-input v-model="formData.name" placeholder="请输入职务名称" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="所属部门" prop="dept">
              <el-select v-model="formData.dept" placeholder="请选择所属部门" style="width: 100%">
                <el-option v-for="opt in deptOpts" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职务级别" prop="level">
              <el-select v-model="formData.level" placeholder="请选择职务级别" style="width: 100%">
                <el-option label="高层" value="高层" /><el-option label="中层" value="中层" /><el-option label="基层" value="基层" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="基本工资(元)"><el-input-number v-model="formData.salary" :min="0" :precision="0" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="启用" value="启用" /><el-option label="停用" value="停用" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="职责描述"><el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入职责描述" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

    <!-- 批量编辑弹窗：PositionBatchEditModal -->
    <el-dialog v-model="batchEditDialogVisible" title="批量编辑职务记录" width="900px">
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 bg-blue-500 text-white text-xs rounded">已选择 {{ selectedRows.length }} 条</span>
        </div>
        <div class="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
          已选择 <strong>{{ selectedRows.length }}</strong> 条职务记录进行批量编辑，已编辑 <strong>{{ editedRecordIds.length }}</strong> 条
        </div>
        <div class="flex items-center gap-3">
          <div class="flex-1">
            <label class="text-xs font-medium text-gray-600 mb-1 block">选择职务记录</label>
            <el-select v-model="selectedRecordId" placeholder="请选择记录" style="width: 100%">
              <el-option v-for="opt in selectedRecordOptions" :key="opt.id" :label="opt.label" :value="opt.id" />
            </el-select>
          </div>
        </div>
        <div v-if="currentEditRecord" class="grid grid-cols-4 gap-3">
          <div class="bg-gray-100 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">职务编号</div><div class="text-sm font-medium text-gray-900">{{ currentEditRecord.code }}</div></div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">职务名称</div>
            <el-input :model-value="getEditedField('name')" @update:model-value="(v) => setEditedField('name', v)" size="small" />
          </div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">所属部门</div>
            <el-select :model-value="getEditedField('dept')" @update:model-value="(v) => setEditedField('dept', v)" size="small" style="width: 100%">
              <el-option v-for="opt in deptOpts" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">职务级别</div>
            <el-select :model-value="getEditedField('level')" @update:model-value="(v) => setEditedField('level', v)" size="small" style="width: 100%">
              <el-option label="高层" value="高层" /><el-option label="中层" value="中层" /><el-option label="基层" value="基层" />
            </el-select>
          </div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">基本工资(元)</div>
            <el-input-number :model-value="getEditedField('salary')" @update:model-value="(v) => setEditedField('salary', v)" :min="0" :precision="0" size="small" style="width: 100%" />
          </div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">状态</div>
            <el-select :model-value="getEditedField('status')" @update:model-value="(v) => setEditedField('status', v)" size="small" style="width: 100%">
              <el-option label="启用" value="启用" /><el-option label="停用" value="停用" />
            </el-select>
          </div>
          <div class="col-span-2 bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">职责描述</div>
            <el-input :model-value="getEditedField('description')" @update:model-value="(v) => setEditedField('description', v)" size="small" />
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="handleBatchEditNext"><el-icon><Edit2 /></el-icon> 确认（下一个）</el-button>
        <el-button @click="batchEditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchEditSave">保存修改</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗：PositionDeleteWarningModal -->
    <el-dialog v-model="deleteWarningVisible" title="确认删除" width="480px">
      <div class="flex items-center gap-4 mb-4">
        <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <span class="text-red-600 text-2xl">!</span>
        </div>
        <p class="text-sm text-gray-500">此操作不可撤销</p>
      </div>
      <p class="text-gray-600 mb-2">确定要删除选中的 <strong class="text-red-600">{{ selectedRows.length }}</strong> 条职务记录吗？</p>
      <p class="text-sm text-gray-400">删除后将无法恢复，请谨慎操作。</p>
      <template #footer>
        <el-button @click="deleteWarningVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmBatchDelete">确认删除</el-button>
      </template>
    </el-dialog>

    <!-- 导出格式弹窗：PositionExportFormatModal -->
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
 * 人事管理聚合页面组件（职务管理）
 * 1:1 对应 V1.1 PersonnelManagementPage.tsx
 * 实体：Position（职务），非 Worker（员工）
 */
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ClipboardCheck, Search, RotateCcw, Edit2, Trash2, Download, Plus, X, Eye } from 'lucide-vue-next'
import { DEPT_OPTIONS } from '@/data/laborData'

const EXPORT_FORMATS = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

// Mock 数据：6 条覆盖 3 级别 × 2 状态 × 多部门
const initialPositions = [
  { id: '1', code: 'POS-001', name: '生产主管', dept: '生产部', level: '高层', salary: 8000, staffCount: 0, description: '负责生产部日常管理与任务分配', status: '启用', statusClass: 'normal' },
  { id: '2', code: 'POS-002', name: '技术总监', dept: '技术部', level: '高层', salary: 12000, staffCount: 0, description: '负责技术研发与团队管理', status: '启用', statusClass: 'normal' },
  { id: '3', code: 'POS-003', name: '农技员', dept: '生产部', level: '基层', salary: 5000, staffCount: 0, description: '负责田间种植技术指导与病虫害防治', status: '启用', statusClass: 'normal' },
  { id: '4', code: 'POS-004', name: '财务经理', dept: '财务部', level: '中层', salary: 10000, staffCount: 0, description: '负责财务部全面工作', status: '启用', statusClass: 'normal' },
  { id: '5', code: 'POS-005', name: '仓库管理员', dept: '仓储部', level: '基层', salary: 4500, staffCount: 0, description: '负责仓库物资出入库管理', status: '停用', statusClass: 'disabled' },
  { id: '6', code: 'POS-006', name: '人事专员', dept: '综合办', level: '基层', salary: 4800, staffCount: 0, description: '负责招聘、培训、薪酬等人力资源工作', status: '停用', statusClass: 'disabled' }
]

const deptOpts = DEPT_OPTIONS.filter(d => d.value)

const positions = ref([...initialPositions])
const loading = ref(false)
const error = ref('')

// 筛选（V1.1 L84-88）
const filters = reactive({ keyword: '', level: '', status: '' })
// 分页（V1.1 L79-81，默认 pageSize=5）
const pagination = reactive({ currentPage: 1, pageSize: 5 })

// 3 个独立批量模式（V1.1 L96-100，互斥）
const batchEditMode = ref(false)
const batchDeleteMode = ref(false)
const exportMode = ref(false)
const selectedRows = ref([])

// 批量编辑状态（V1.1 L102-105）
const editedRecordIds = ref([])
const editedRecords = ref({})
const selectedRecordId = ref('')

// 弹窗状态（V1.1 L107-113）
const showFormModal = ref(false)
const showBatchEditModal = ref(false)
const showDeleteWarning = ref(false)
const showExportModal = ref(false)
const exportFormat = ref('excel')
const detailDialogVisible = ref(false)
const currentRecord = ref(null)

// 表单
const formRef = ref()
const isEdit = ref(false)
const formData = reactive({
  id: null, code: '', name: '', dept: '生产部', level: '基层',
  salary: 0, description: '', status: '启用', statusClass: 'normal'
})
const formRules = {
  name: [{ required: true, message: '请输入职务名称', trigger: 'blur' }],
  dept: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
  level: [{ required: true, message: '请选择职务级别', trigger: 'change' }]
}

const tableRef = ref()

// 弹窗显隐别名
const formDialogVisible = computed({ get: () => showFormModal.value, set: (v) => { showFormModal.value = v } })
const batchEditDialogVisible = computed({ get: () => showBatchEditModal.value, set: (v) => { showBatchEditModal.value = v } })
const deleteWarningVisible = computed({ get: () => showDeleteWarning.value, set: (v) => { showDeleteWarning.value = v } })
const exportModalVisible = computed({ get: () => showExportModal.value, set: (v) => { showExportModal.value = v } })

// 计算属性（V1.1 L382-411）
const inBatchMode = computed(() => batchEditMode.value || batchDeleteMode.value || exportMode.value)
const totalCount = computed(() => positions.value.length)
const activeCount = computed(() => positions.value.filter(p => p.status === '启用').length)
const onJobCount = computed(() => positions.value.reduce((sum, p) => sum + p.staffCount, 0))

// 筛选 + 分页（V1.1 L118-144）
const filteredData = computed(() => {
  return positions.value.filter(pos => {
    if (filters.keyword) {
      const kw = filters.keyword
      if (!pos.name.includes(kw) && !pos.code.includes(kw) && !pos.dept.includes(kw)) return false
    }
    if (filters.level && pos.level !== filters.level) return false
    if (filters.status && pos.status !== filters.status) return false
    return true
  })
})
const paginatedFilteredData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

// 批量编辑 - 当前编辑记录
const currentEditRecord = computed(() => {
  if (!selectedRecordId.value) return null
  return positions.value.find(p => p.id === selectedRecordId.value) || null
})
const selectedRecordOptions = computed(() => selectedRows.value
  .map(id => positions.value.find(p => p.id === id))
  .filter(Boolean)
  .map(r => ({ id: r.id, label: `${r.code} - ${r.name}${editedRecordIds.value.includes(r.id) ? '  (已编辑)' : ''}` })))

onMounted(() => { loading.value = false })

// 搜索 / 重置 / 分页
const handleSearch = () => { pagination.currentPage = 1 }
const handleResetFilters = () => { filters.keyword = ''; filters.level = ''; filters.status = ''; pagination.currentPage = 1 }
const handlePageSizeChange = () => { pagination.currentPage = 1 }

// 批量选择（V1.1 L153-167）
const handleSelectAll = () => {
  if (selectedRows.value.length === paginatedFilteredData.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = paginatedFilteredData.value.map(p => p.id)
  }
}
const handleSelectionChange = (selection) => { selectedRows.value = selection.map(s => s.id) }

// 进入批量模式（V1.1 L223-297，三模式互斥）
const enterBatch = (mode) => {
  batchEditMode.value = mode === 'edit'
  batchDeleteMode.value = mode === 'delete'
  exportMode.value = mode === 'export'
  selectedRows.value = []
  if (mode === 'edit') { editedRecordIds.value = []; editedRecords.value = {}; selectedRecordId.value = '' }
}
// 取消批量（V1.1 L170-178）
const cancelBatch = () => {
  batchEditMode.value = false; batchDeleteMode.value = false; exportMode.value = false
  selectedRows.value = []; editedRecordIds.value = []; editedRecords.value = {}; selectedRecordId.value = ''
  if (tableRef.value) tableRef.value.clearSelection()
}

// 批量编辑 - 字段双向绑定
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
      const i = positions.value.findIndex(p => p.id === id)
      if (i === -1) return
      const edited = editedRecords.value[id] || {}
      const next = { ...positions.value[i], ...edited }
      if (edited.status) next.statusClass = edited.status === '启用' ? 'normal' : 'disabled'
      positions.value[i] = next
    })
    ElMessage.success('批量编辑成功')
    showBatchEditModal.value = false
    cancelBatch()
  } catch { ElMessage.error('批量编辑失败，请重试') }
}

// 批量删除（V1.1 L261-284）
const handleBatchDeleteConfirm = () => {
  if (!selectedRows.value.length) { ElMessage.warning('请先选择要删除的记录'); return }
  showDeleteWarning.value = true
}
const confirmBatchDelete = () => {
  try {
    positions.value = positions.value.filter(p => !selectedRows.value.includes(p.id))
    ElMessage.success('批量删除成功')
    showDeleteWarning.value = false
    cancelBatch()
  } catch { ElMessage.error('批量删除失败，请重试') }
}

// 导出（V1.1 L287-368）
const handleExportConfirm = () => {
  if (!selectedRows.value.length) { ElMessage.warning('请先选择要导出的数据'); return }
  showExportModal.value = true
}
const confirmExport = () => {
  const selectedData = positions.value.filter(p => selectedRows.value.includes(p.id))
  const headers = ['职务编号', '职务名称', '所属部门', '职务级别', '状态']
  const exportData = selectedData.map(p => ({
    '职务编号': p.code, '职务名称': p.name, '所属部门': p.dept, '职务级别': p.level, '状态': p.status
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
  const fileName = `职务列表_${todayStr}.${extension}`
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

// 新增 / 编辑 / 查看（V1.1 L181-189）
const openFormModal = () => {
  isEdit.value = false
  Object.assign(formData, { id: null, code: '', name: '', dept: '生产部', level: '基层', salary: 0, description: '', status: '启用', statusClass: 'normal' })
  showFormModal.value = true
}
const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, { ...row })
  showFormModal.value = true
}
const viewDetail = (row) => { currentRecord.value = row; detailDialogVisible.value = true }

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      if (isEdit.value) {
        const idx = positions.value.findIndex(p => p.id === formData.id)
        if (idx !== -1) {
          positions.value[idx] = { ...positions.value[idx], ...formData, statusClass: formData.status === '启用' ? 'normal' : 'disabled' }
        }
        ElMessage.success('编辑成功')
      } else {
        const newId = String(positions.value.length + 1)
        positions.value.push({ id: newId, code: formData.code, name: formData.name, dept: formData.dept, level: formData.level, salary: formData.salary, staffCount: 0, description: formData.description, status: formData.status, statusClass: formData.status === '启用' ? 'normal' : 'disabled' })
        ElMessage.success('新增成功')
      }
      showFormModal.value = false
    } catch { ElMessage.error('保存失败，请重试') }
  })
}
const resetFormData = () => { if (formRef.value) formRef.value.clearValidate() }
</script>

<style scoped>
:deep(.position-table-row:hover > td) {
  background-color: #ecfdf5 !important; /* emerald-50 */
  cursor: pointer;
}
</style>
