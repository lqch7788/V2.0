<template>
  <div class="space-y-4 p-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <el-icon :size="20" color="white">
            <CirclePlus />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">入职办理</h1>
          <p class="text-xs text-gray-500">招聘到入职的闭环管理</p>
        </div>
      </div>
    </div>

    <!-- 3 KPI 卡片（V1.1 L342-376） -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
      <div class="bg-amber-50 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="18" color="#d97706"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-xl font-bold text-amber-700">{{ statusCounts.待入职 }}</p>
            <p class="text-xs text-amber-600">待入职</p>
          </div>
        </div>
      </div>
      <div class="bg-blue-50 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="18" color="#2563eb"><AlertTriangle /></el-icon>
          </div>
          <div>
            <p class="text-xl font-bold text-blue-700">{{ statusCounts.办理中 }}</p>
            <p class="text-xs text-blue-600">办理中</p>
          </div>
        </div>
      </div>
      <div class="bg-green-50 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="18" color="#16a34a"><CircleCheck /></el-icon>
          </div>
          <div>
            <p class="text-xl font-bold text-green-700">{{ statusCounts.已入职 }}</p>
            <p class="text-xs text-green-600">已入职</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div class="flex-1 min-w-[200px]">
          <el-input v-model="filters.keyword" placeholder="搜索姓名、身份证号、手机号..." clearable @clear="handleSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <el-select v-model="filters.status" placeholder="全部状态" clearable class="w-full sm:w-32">
          <el-option label="全部状态" value="" />
          <el-option label="待入职" value="待入职" />
          <el-option label="办理中" value="办理中" />
          <el-option label="已入职" value="已入职" />
        </el-select>
        <div class="flex gap-2">
          <el-button type="warning" @click="handleResetFilters"><el-icon><RotateCcw /></el-icon> 重置</el-button>
          <el-button type="default" @click="handleSearch"><el-icon><Search /></el-icon> 搜索</el-button>
        </div>
      </div>
    </div>

    <!-- 入职记录表（V1.1 L507-521） -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">入职记录</h3>
        <div class="flex gap-2">
          <template v-if="!inBatchMode">
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
          <el-table-column label="姓名" min-width="120">
            <template #default="{ row }">
              <div>
                <p class="font-medium text-gray-900">{{ row.name }}</p>
                <p class="text-xs text-gray-500">{{ row.phone }}</p>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="岗位" min-width="120">
            <template #default="{ row }">
              <div>
                <p class="text-gray-900">{{ row.position }}</p>
                <p class="text-xs text-gray-500">{{ row.department }}</p>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="contractType" label="合同类型" min-width="100" />
          <el-table-column prop="joinDate" label="入职日期" min-width="120" />
          <el-table-column label="状态" min-width="100">
            <template #default="{ row }">
              <span :class="getStatusClass(row.status)">
                <el-icon :size="12" class="mr-1"><component :is="statusIcon(row.status)" /></el-icon>
                {{ row.status }}
              </span>
            </template>
          </el-table-column>
          <el-table-column v-if="!inBatchMode" label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-tooltip content="查看详情" placement="top">
                <el-button size="small" :icon="Eye" link @click="openDetailModal(row)" />
              </el-tooltip>
              <el-tooltip v-if="row.status === '待入职'" content="开始办理" placement="top">
                <el-button size="small" :icon="Play" link type="primary" @click="handleProgress(row, '办理中')" />
              </el-tooltip>
              <el-tooltip v-if="row.status === '办理中'" content="完成入职" placement="top">
                <el-button size="small" :icon="Check" link type="success" @click="handleProgress(row, '已入职')" />
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

    <!-- 详情弹窗（含办理进度时间线 V1.1 L669-700） -->
    <el-dialog v-model="detailDialogVisible" title="入职详情" width="700px">
      <div v-if="currentRecord" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ currentRecord.name }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentRecord.phone }}</el-descriptions-item>
          <el-descriptions-item label="身份证号" :span="2">{{ currentRecord.idCard }}</el-descriptions-item>
          <el-descriptions-item label="岗位">{{ currentRecord.position }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ currentRecord.department }}</el-descriptions-item>
          <el-descriptions-item label="合同类型">{{ currentRecord.contractType }}</el-descriptions-item>
          <el-descriptions-item label="入职日期">{{ currentRecord.joinDate }}</el-descriptions-item>
          <el-descriptions-item label="状态" :span="2">
            <span :class="getStatusClass(currentRecord.status)">{{ currentRecord.status }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 办理进度时间线（V1.1 L669-700 关键 P0 修复） -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-900 mb-3">办理进度</h4>
          <el-timeline>
            <el-timeline-item v-for="(step, idx) in getProgressSteps(currentRecord)" :key="idx"
              :timestamp="step.time" :type="step.type" :hollow="idx < getProgressSteps(currentRecord).length - 1"
              :icon="step.icon">
              <span class="font-medium text-gray-900">{{ step.title }}</span>
              <p v-if="step.desc" class="text-xs text-gray-500 mt-1">{{ step.desc }}</p>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 表单弹窗（V1.1 OnboardingForm L33-177） -->
    <el-dialog v-model="formDialogVisible" :title="editingRecord ? '编辑入职' : '办理入职'" width="640px" @closed="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="姓名" prop="name"><el-input v-model="formData.name" placeholder="请输入姓名" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="手机号" prop="phone"><el-input v-model="formData.phone" placeholder="请输入手机号" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="formData.idCard" placeholder="请输入身份证号" maxlength="18" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="岗位" prop="position">
              <el-input v-model="formData.position" placeholder="请输入岗位" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门" prop="department">
              <el-select v-model="formData.department" placeholder="请选择部门" style="width:100%">
                <el-option v-for="d in DEPT_OPTIONS.filter(x => x.value)" :key="d.value" :label="d.label" :value="d.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="合同类型" prop="contractType">
              <el-select v-model="formData.contractType" placeholder="请选择合同类型" style="width:100%">
                <el-option label="劳动合同" value="劳动合同" />
                <el-option label="劳务合同" value="劳务合同" />
                <el-option label="实习协议" value="实习协议" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入职日期" prop="joinDate">
              <el-date-picker v-model="formData.joinDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 按合同类型显示条件工资字段（V1.1 L40-44） -->
        <el-form-item v-if="formData.contractType === '劳务合同'" label="日工资">
          <el-input-number v-model="formData.dailyWage" :min="0" :precision="2" style="width:100%" />
        </el-form-item>
        <el-form-item v-if="formData.contractType === '实习协议'" label="时工资">
          <el-input-number v-model="formData.hourlyWage" :min="0" :precision="2" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 批量编辑弹窗 -->
    <el-dialog v-model="batchEditDialogVisible" title="批量编辑入职记录" width="900px">
      <div class="flex flex-col gap-3">
        <div class="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
          已选择 <strong>{{ selectedRows.length }}</strong> 条记录进行批量编辑
        </div>
        <el-select v-model="selectedRecordId" placeholder="请选择记录" style="width:100%">
          <el-option v-for="opt in selectedRecordOptions" :key="opt.id" :label="opt.label" :value="opt.id" />
        </el-select>
        <div v-if="currentEditRecord" class="grid grid-cols-4 gap-3">
          <div class="bg-gray-100 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">姓名</div><div class="text-sm font-medium">{{ currentEditRecord.name }}</div></div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">岗位</div><el-input :model-value="getEditedField('position')" @update:model-value="(v) => setEditedField('position', v)" size="small" /></div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">部门</div>
            <el-select :model-value="getEditedField('department')" @update:model-value="(v) => setEditedField('department', v)" size="small" style="width:100%">
              <el-option v-for="d in DEPT_OPTIONS.filter(x => x.value)" :key="d.value" :label="d.label" :value="d.value" />
            </el-select>
          </div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">合同类型</div>
            <el-select :model-value="getEditedField('contractType')" @update:model-value="(v) => setEditedField('contractType', v)" size="small" style="width:100%">
              <el-option label="劳动合同" value="劳动合同" /><el-option label="劳务合同" value="劳务合同" /><el-option label="实习协议" value="实习协议" />
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
    <el-dialog v-model="deleteWarningVisible" title="删除入职记录警告" width="480px">
      <div class="flex items-center gap-4 mb-4">
        <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <span class="text-red-600 text-2xl">!</span>
        </div>
        <p class="text-sm text-gray-500">此操作不可撤销</p>
      </div>
      <p class="text-gray-600 mb-2">确定要删除选中的 <strong class="text-red-600">{{ selectedRows.length }}</strong> 条入职记录吗？</p>
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
 * 入职办理 Panel
 * 1:1 对应 V1.1 OnboardingPage.tsx
 * 包含 KPI 卡片 + 表格 + 详情时间线 + 批量编辑 + 3 种导出格式
 */
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CirclePlus, Search, RotateCcw, Plus, Edit2, Trash2, Download, X, Eye, Play, Check, Clock, AlertTriangle, CircleCheck } from 'lucide-vue-next'
import { DEPT_OPTIONS } from '@/data/laborData'

const EXPORT_FORMATS = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

// 状态样式（V1.1 L104-108）
const getStatusClass = (status) => {
  const map = {
    '待入职': 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700',
    '办理中': 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700',
    '已入职': 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700'
  }
  return map[status] || 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600'
}

const statusIcon = (status) => {
  const map = { '待入职': Clock, '办理中': AlertTriangle, '已入职': CircleCheck }
  return map[status] || Clock
}

const initialOnboardings = [
  { id: '1', name: '钱小宝', phone: '13900139001', idCard: '110101200103011234', position: '农技员', department: '生产部', contractType: '劳动合同', joinDate: '2026-04-15', status: '待入职', progress: [{ step: '提交入职申请', time: '2026-04-01', operator: '钱小宝', desc: '入职材料已收集' }] },
  { id: '2', name: '孙小军', phone: '13900139002', idCard: '110101199812102345', position: '仓库管理员', department: '仓储部', contractType: '劳务合同', joinDate: '2026-04-20', dailyWage: 200, status: '办理中', progress: [
    { step: '提交入职申请', time: '2026-04-05', operator: '孙小军', desc: '入职材料已收集' },
    { step: '开始办理', time: '2026-04-08', operator: '人事专员', desc: '签订合同中' }
  ] },
  { id: '3', name: '李明', phone: '13900139003', idCard: '110101199005103456', position: '销售经理', department: '销售部', contractType: '劳动合同', joinDate: '2026-03-15', status: '已入职', progress: [
    { step: '提交入职申请', time: '2026-03-01', operator: '李明', desc: '入职材料已收集' },
    { step: '开始办理', time: '2026-03-05', operator: '人事专员', desc: '签订合同中' },
    { step: '完成入职', time: '2026-03-15', operator: '王经理', desc: '员工档案已建立' }
  ] },
  { id: '4', name: '周晓', phone: '13900139004', idCard: '110101200005154567', position: '实习生', department: '技术部', contractType: '实习协议', joinDate: '2026-05-01', hourlyWage: 25, status: '待入职', progress: [{ step: '提交入职申请', time: '2026-04-20', operator: '周晓', desc: '实习协议已签订' }] },
  { id: '5', name: '吴海', phone: '13900139005', idCard: '110101198809205678', position: '安全员', department: '生产部', contractType: '劳动合同', joinDate: '2026-03-20', status: '已入职', progress: [
    { step: '提交入职申请', time: '2026-03-10', operator: '吴海', desc: '入职材料已收集' },
    { step: '开始办理', time: '2026-03-15', operator: '人事专员', desc: '签订合同中' },
    { step: '完成入职', time: '2026-03-20', operator: '王经理', desc: '员工档案已建立' }
  ] }
]

const onboardings = ref([...initialOnboardings])
const loading = ref(false)
const error = ref('')

const filters = reactive({ keyword: '', status: '' })
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
const editingRecord = ref(null)

const tableRef = ref()
const formRef = ref()
const formData = reactive({
  name: '', idCard: '', phone: '', position: '', department: '',
  contractType: '劳动合同', dailyWage: undefined, hourlyWage: undefined, joinDate: ''
})
const formRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  position: [{ required: true, message: '请输入岗位', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  contractType: [{ required: true, message: '请选择合同类型', trigger: 'change' }],
  joinDate: [{ required: true, message: '请选择入职日期', trigger: 'change' }]
}

const formDialogVisible = computed({ get: () => showFormModal.value, set: (v) => { showFormModal.value = v } })
const batchEditDialogVisible = computed({ get: () => showBatchEditModal.value, set: (v) => { showBatchEditModal.value = v } })
const deleteWarningVisible = computed({ get: () => showDeleteWarning.value, set: (v) => { showDeleteWarning.value = v } })
const exportModalVisible = computed({ get: () => showExportModal.value, set: (v) => { showExportModal.value = v } })

const inBatchMode = computed(() => batchEditMode.value || batchDeleteMode.value || exportMode.value)

const statusCounts = computed(() => ({
  待入职: onboardings.value.filter(o => o.status === '待入职').length,
  办理中: onboardings.value.filter(o => o.status === '办理中').length,
  已入职: onboardings.value.filter(o => o.status === '已入职').length
}))

const filteredData = computed(() => {
  return onboardings.value.filter(o => {
    if (filters.keyword) {
      const kw = filters.keyword
      if (!o.name.includes(kw) && !o.idCard.includes(kw) && !o.phone.includes(kw)) return false
    }
    if (filters.status && o.status !== filters.status) return false
    return true
  })
})
const paginatedFilteredData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

const currentEditRecord = computed(() => {
  if (!selectedRecordId.value) return null
  return onboardings.value.find(o => o.id === selectedRecordId.value) || null
})
const selectedRecordOptions = computed(() => selectedRows.value
  .map(id => onboardings.value.find(o => o.id === id))
  .filter(Boolean)
  .map(o => ({ id: o.id, label: `${o.name} - ${o.position}${editedRecordIds.value.includes(o.id) ? '  (已编辑)' : ''}` })))

onMounted(() => { loading.value = false })

const handleSearch = () => { pagination.currentPage = 1 }
const handleResetFilters = () => { filters.keyword = ''; filters.status = ''; pagination.currentPage = 1 }
const handlePageSizeChange = () => { pagination.currentPage = 1 }

const handleSelectAll = () => {
  if (selectedRows.value.length === paginatedFilteredData.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = paginatedFilteredData.value.map(o => o.id)
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
      const i = onboardings.value.findIndex(o => o.id === id)
      if (i === -1) return
      onboardings.value[i] = { ...onboardings.value[i], ...(editedRecords.value[id] || {}) }
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
  onboardings.value = onboardings.value.filter(o => !selectedRows.value.includes(o.id))
  ElMessage.success('批量删除成功')
  showDeleteWarning.value = false
  cancelBatch()
}

const handleExportConfirm = () => {
  if (!selectedRows.value.length) { ElMessage.warning('请先选择要导出的数据'); return }
  showExportModal.value = true
}
const confirmExport = () => {
  const selectedData = onboardings.value.filter(o => selectedRows.value.includes(o.id))
  const headers = ['姓名', '手机号', '岗位', '部门', '合同类型', '入职日期', '状态']
  const exportData = selectedData.map(o => ({
    '姓名': o.name, '手机号': o.phone, '岗位': o.position, '部门': o.department,
    '合同类型': o.contractType, '入职日期': o.joinDate, '状态': o.status
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
  const fileName = `入职记录_${todayStr}.${extension}`
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

// 进度时间线辅助（V1.1 L669-700）
const getProgressSteps = (record) => {
  const steps = []
  const progress = record.progress || []
  progress.forEach((p, idx) => {
    const isLast = idx === progress.length - 1
    steps.push({
      title: p.step, time: p.time, desc: p.desc ? `操作人：${p.operator} - ${p.desc}` : `操作人：${p.operator}`,
      type: isLast && record.status === '已入职' ? 'success' : 'primary',
      icon: isLast && record.status === '已入职' ? CircleCheck : Clock
    })
  })
  return steps
}

// 办理进度（V1.1 L213-222）
const handleProgress = async (record, newStatus) => {
  if (newStatus === '办理中' && record.status === '待入职') {
    const idx = onboardings.value.findIndex(o => o.id === record.id)
    if (idx !== -1) {
      onboardings.value[idx] = {
        ...onboardings.value[idx],
        status: '办理中',
        progress: [...(onboardings.value[idx].progress || []), { step: '开始办理', time: new Date().toISOString().split('T')[0], operator: '人事专员', desc: '签订合同中' }]
      }
      ElMessage.success('已开始办理')
    }
  } else if (newStatus === '已入职') {
    try {
      await ElMessageBox.confirm('确定要完成入职办理吗？这将创建员工档案。', '确认完成', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      })
      const idx = onboardings.value.findIndex(o => o.id === record.id)
      if (idx !== -1) {
        onboardings.value[idx] = {
          ...onboardings.value[idx],
          status: '已入职',
          progress: [...(onboardings.value[idx].progress || []), { step: '完成入职', time: new Date().toISOString().split('T')[0], operator: '王经理', desc: '员工档案已建立' }]
        }
        ElMessage.success('入职已完成')
      }
    } catch { /* 取消 */ }
  }
}

const openDetailModal = (row) => { currentRecord.value = row; detailDialogVisible.value = true }
const openCreateModal = () => {
  editingRecord.value = null
  resetForm()
  showFormModal.value = true
}
const resetForm = () => {
  Object.assign(formData, {
    name: '', idCard: '', phone: '', position: '', department: '',
    contractType: '劳动合同', dailyWage: undefined, hourlyWage: undefined, joinDate: ''
  })
  if (formRef.value) formRef.value.clearValidate()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      const newId = String(onboardings.value.length + 1)
      onboardings.value.push({
        id: newId, ...formData, status: '待入职',
        progress: [{ step: '提交入职申请', time: new Date().toISOString().split('T')[0], operator: formData.name, desc: '入职材料已收集' }]
      })
      ElMessage.success('入职办理已创建')
      showFormModal.value = false
    } catch { ElMessage.error('保存失败') }
  })
}
</script>

<style scoped>
/* 继承全局样式 */
</style>