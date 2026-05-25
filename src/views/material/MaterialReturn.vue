<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <el-icon :size="24" color="white">
              <RefreshLeft />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">生产退料</h1>
            <p class="text-gray-500">生产退料单管理</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
      <div class="grid grid-cols-5 gap-4">
        <!-- 退料单号 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">退料单号</label>
          <el-input
            v-model="searchForm.code"
            placeholder="请输入"
            clearable
            @clear="updateSearchField('code', '')"
          />
        </div>

        <!-- 源单据号 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">源单据号</label>
          <el-input
            v-model="searchForm.sourceAppCode"
            placeholder="请输入"
            clearable
            @clear="updateSearchField('sourceAppCode', '')"
          />
        </div>

        <!-- 退料日期 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">退料日期</label>
          <el-date-picker
            v-model="searchForm.returnDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            clearable
            @clear="updateSearchField('returnDate', '')"
          />
        </div>

        <!-- 退料人 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">退料人</label>
          <el-input
            v-model="searchForm.returner"
            placeholder="请输入"
            clearable
            @clear="updateSearchField('returner', '')"
          />
        </div>

        <!-- 状态 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <el-select v-model="searchForm.status" placeholder="全部" @change="updateSearchField('status', searchForm.status)">
            <el-option label="全部" value="" />
            <el-option label="已提交" value="submitted" />
            <el-option label="已审批" value="approved" />
            <el-option label="已入库" value="inbound" />
            <el-option label="已作废" value="voided" />
          </el-select>
        </div>
      </div>

      <!-- 搜索按钮 -->
      <div class="mt-4 flex justify-end gap-2">
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">生产退料单列表</h3>
        <div class="flex gap-2">
          <template v-if="!hasActiveMode">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增
            </el-button>
            <el-button @click="handleBatchEdit">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" @click="handleDelete">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
            <el-button @click="handleExport">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </template>
          <template v-else>
            <!-- 删除模式 -->
            <template v-if="deleteMode">
              <el-button type="danger" @click="handleConfirmBatchDelete">
                确认删除{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
              </el-button>
              <el-button @click="handleCancelDelete">取消</el-button>
            </template>
            <!-- 编辑模式 -->
            <template v-if="batchEditMode">
              <el-button type="primary" @click="handleConfirmBatchEdit">
                确认编辑{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
              </el-button>
              <el-button @click="handleCancelBatchEdit">取消</el-button>
            </template>
            <!-- 导出模式 -->
            <template v-if="exportMode">
              <el-button type="primary" @click="handleConfirmExport">
                <el-icon><Download /></el-icon>
                确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
              </el-button>
              <el-button @click="handleCancelExport">取消</el-button>
            </template>
          </template>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        :data="paginatedReturns"
        stripe
        @selection-change="handleSelectionChange"
        @expand-change="handleExpandChange"
        :expand-row-keys="expandedRows"
        row-key="id"
      >
        <el-table-column
          v-if="hasActiveMode"
          type="selection"
          width="55"
        />
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="p-4 bg-gray-50">
              <h4 class="font-medium mb-2">退料物料明细</h4>
              <el-table :data="row.materials" size="small">
                <el-table-column prop="code" label="物料编号" width="120" />
                <el-table-column prop="name" label="物料名称" min-width="150" />
                <el-table-column prop="spec" label="规格" width="100" />
                <el-table-column prop="unit" label="单位" width="80" />
                <el-table-column prop="quantity" label="退料数量" width="100" />
                <el-table-column prop="reason" label="退料原因" min-width="150" />
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="退料单号" width="180" />
        <el-table-column prop="sourceAppCode" label="源单据号" width="150" />
        <el-table-column prop="sourceAppType" label="源单据类型" width="120" />
        <el-table-column prop="returnDate" label="退料日期" width="120" />
        <el-table-column prop="returner" label="退料人" width="100" />
        <el-table-column prop="warehouse" label="退料仓库" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleVoid(row)">作废</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">每页</span>
          <el-select
            v-model="pageSize"
            style="width: 80px"
            @change="handlePageSizeChange"
          >
            <el-option :value="10" label="10" />
            <el-option :value="20" label="20" />
            <el-option :value="50" label="50" />
          </el-select>
          <span class="text-sm text-gray-500">条</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">
            共 {{ filteredReturns.length }} 条，第 {{ currentPage }} / {{ totalPages }} 页
          </span>
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredReturns.length"
            layout="prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <!-- 查看详情弹窗 -->
    <el-dialog
      v-model="showDetailModal"
      title="退料单详情"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="退料单号">{{ selectedRecord?.code }}</el-descriptions-item>
        <el-descriptions-item label="源单据号">{{ selectedRecord?.sourceAppCode }}</el-descriptions-item>
        <el-descriptions-item label="源单据类型">{{ selectedRecord?.sourceAppType }}</el-descriptions-item>
        <el-descriptions-item label="退料日期">{{ selectedRecord?.returnDate }}</el-descriptions-item>
        <el-descriptions-item label="退料人">{{ selectedRecord?.returner }}</el-descriptions-item>
        <el-descriptions-item label="退料仓库">{{ selectedRecord?.warehouse }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(selectedRecord?.status || '')" size="small">
            {{ getStatusName(selectedRecord?.status || '') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ selectedRecord?.createTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ selectedRecord?.remarks || '-' }}</el-descriptions-item>
      </el-descriptions>

      <div class="mt-4">
        <h4 class="font-medium mb-2">退料物料明细</h4>
        <el-table :data="selectedRecord?.materials || []" stripe>
          <el-table-column prop="code" label="物料编号" width="120" />
          <el-table-column prop="name" label="物料名称" min-width="150" />
          <el-table-column prop="spec" label="规格" width="100" />
          <el-table-column prop="unit" label="单位" width="80" />
          <el-table-column prop="quantity" label="退料数量" width="100" />
          <el-table-column prop="reason" label="退料原因" min-width="150" />
        </el-table>
      </div>

      <template #footer>
        <el-button @click="showDetailModal = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="showFormModal"
      :title="isEdit ? '编辑退料单' : '新增退料单'"
      width="900px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="退料单号" prop="code">
              <el-input v-model="form.code" placeholder="自动生成" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="退料日期" prop="returnDate">
              <el-date-picker
                v-model="form.returnDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="源单据号" prop="sourceAppCode">
              <el-input v-model="form.sourceAppCode" placeholder="请输入源单据号">
                <template #append>
                  <el-button @click="handleSelectSource">选择</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="源单据类型" prop="sourceAppType">
              <el-select v-model="form.sourceAppType" placeholder="请选择">
                <el-option label="生产领料单" value="生产领料单" />
                <el-option label="采购退料单" value="采购退料单" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="退料人" prop="returner">
              <el-input v-model="form.returner" placeholder="请输入退料人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="退料仓库" prop="warehouse">
              <el-select v-model="form.warehouse" placeholder="请选择">
                <el-option label="原料仓库A" value="原料仓库A" />
                <el-option label="原料仓库B" value="原料仓库B" />
                <el-option label="成品仓库" value="成品仓库" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 退料物料明细 -->
        <el-form-item label="退料物料">
          <div class="mb-2">
            <el-button size="small" @click="handleAddMaterial">
              <el-icon><Plus /></el-icon>
              添加物料
            </el-button>
            <el-button size="small" @click="handleSelectFromSource">
              <el-icon><Download /></el-icon>
              从源单选择
            </el-button>
          </div>
          <el-table :data="form.materials" stripe size="small">
            <el-table-column prop="code" label="物料编号" width="120">
              <template #default="{ row }">
                <el-input v-model="row.code" placeholder="物料编号" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="name" label="物料名称" min-width="120">
              <template #default="{ row }">
                <el-input v-model="row.name" placeholder="物料名称" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="spec" label="规格" width="100">
              <template #default="{ row }">
                <el-input v-model="row.spec" placeholder="规格" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="unit" label="单位" width="80">
              <template #default="{ row }">
                <el-input v-model="row.unit" placeholder="单位" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="退料数量" width="100">
              <template #default="{ row }">
                <el-input-number v-model="row.quantity" :min="1" size="small" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="退料原因" min-width="120">
              <template #default="{ row }">
                <el-input v-model="row.reason" placeholder="退料原因" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ $index }">
                <el-button link type="danger" size="small" @click="handleRemoveMaterial($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="form.remarks" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showFormModal = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 物料选择弹窗 -->
    <el-dialog
      v-model="showMaterialSelectModal"
      title="选择物料"
      width="700px"
    >
      <p class="text-sm text-gray-500 mb-4">请选择物料（源单据号：{{ selectedSourceAppCode }}）</p>
      <el-table :data="sourceMaterials" stripe>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="code" label="物料编号" width="120" />
        <el-table-column prop="name" label="物料名称" min-width="150" />
        <el-table-column prop="spec" label="规格" width="100" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="availableQty" label="可用数量" width="100" />
      </el-table>
      <template #footer>
        <el-button @click="showMaterialSelectModal = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmMaterialSelect">确认</el-button>
      </template>
    </el-dialog>

    <!-- 作废弹窗 -->
    <el-dialog
      v-model="showVoidModal"
      title="申请作废"
      width="500px"
    >
      <el-form :model="voidForm" label-width="100px">
        <el-form-item label="退料单号">
          <span class="font-medium">{{ voidForm.code }}</span>
        </el-form-item>
        <el-form-item label="作废原因" required>
          <el-input
            v-model="voidForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入作废原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showVoidModal = false">取消</el-button>
        <el-button type="danger" @click="handleSubmitVoid">提交作废</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="showDeleteConfirm"
      title="确认删除"
      width="400px"
    >
      <div class="flex items-center gap-3">
        <el-icon :size="40" color="#f56c6c"><WarningFilled /></el-icon>
        <div>
          <p class="text-lg font-medium">确定要删除选中的 {{ selectedRows.length }} 条退料记录吗？</p>
          <p class="text-sm text-gray-500">此操作不可恢复</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDeleteConfirm = false">取消</el-button>
        <el-button type="danger" @click="handleDoDelete">确认删除</el-button>
      </template>
    </el-dialog>

    <!-- 导出格式选择弹窗 -->
    <el-dialog
      v-model="showExportModal"
      title="选择导出格式"
      width="500px"
    >
      <p class="text-sm text-gray-500 mb-4">
        {{ selectedRows.length > 0 ? `已选择 ${selectedRows.length} 条数据` : `共 ${filteredReturns.length} 条数据` }}
      </p>
      <div class="space-y-3">
        <el-radio-group v-model="exportFormat" class="w-full">
          <div
            v-for="format in exportFormats"
            :key="format.value"
            :class="[
              'flex items-center p-4 border rounded-lg cursor-pointer transition-all',
              exportFormat === format.value
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300'
            ]"
            @click="exportFormat = format.value"
          >
            <el-radio :value="format.value">
              <div class="ml-3">
                <span class="block text-sm font-medium text-gray-900">{{ format.label }}</span>
                <span class="block text-xs text-gray-500">{{ format.desc }}</span>
              </div>
            </el-radio>
          </div>
        </el-radio-group>
      </div>
      <template #footer>
        <el-button @click="showExportModal = false">取消</el-button>
        <el-button type="primary" @click="handleDoExport">导出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { RefreshLeft, Plus, Edit, Delete, Download, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useMaterialReturnStore } from '@/stores/modules/inventory/useMaterialReturnStore'

// 状态类型映射
const statusMap = {
  'submitted': '已提交',
  'approved': '已审批',
  'inbound': '已入库',
  'voided': '已作废'
}

const getStatusName = (status) => statusMap[status] || status

const getStatusType = (status) => {
  const typeMap = {
    'submitted': 'warning',
    'approved': 'success',
    'inbound': 'info',
    'voided': 'danger'
  }
  return typeMap[status] || ''
}

// 导出格式选项
const exportFormats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

// 物料类型

// 退料单类型

// 源单物料数据
const sourceMaterials = ref([
  { code: '010101001', name: '番茄种子', spec: '优等品', unit: '袋', quantity: 10, reason: '' },
  { code: '010201001', name: '尿素', spec: '50kg/袋', unit: '袋', quantity: 5, reason: '' },
  { code: '010301001', name: '多菌灵', spec: '500ml/瓶', unit: '瓶', quantity: 20, reason: '' }
])

// Store
const returnStore = useMaterialReturnStore()

onMounted(async () => {
  await returnStore.loadReturnRecords()
})

// 状态
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRows = ref([])
const expandedRows = ref([])
const batchEditMode = ref(false)
const deleteMode = ref(false)
const exportMode = ref(false)
const showDetailModal = ref(false)
const showFormModal = ref(false)
const showMaterialSelectModal = ref(false)
const showVoidModal = ref(false)
const showDeleteConfirm = ref(false)
const showExportModal = ref(false)
const isEdit = ref(false)
const exportFormat = ref('excel')
const selectedRecord = ref(null)
const selectedSourceAppCode = ref('')

// 搜索表单
const searchForm = reactive({
  code: '',
  sourceAppCode: '',
  returnDate: '',
  returner: '',
  status: ''
})

// 表单状态
const form = reactive({
  id: 0,
  code: '',
  sourceAppCode: '',
  sourceAppType: '',
  returnDate: '',
  returner: '',
  warehouse: '',
  status: 'submitted',
  remarks: '',
  materials: []
})

// 作废表单
const voidForm = reactive({
  code: '',
  reason: ''
})

const formRef = ref()

const rules = {
  sourceAppCode: [{ required: true, message: '请输入源单据号', trigger: 'blur' }],
  sourceAppType: [{ required: true, message: '请选择源单据类型', trigger: 'change' }],
  returnDate: [{ required: true, message: '请选择退料日期', trigger: 'change' }],
  returner: [{ required: true, message: '请输入退料人', trigger: 'blur' }],
  warehouse: [{ required: true, message: '请选择退料仓库', trigger: 'change' }]
}

// 计算属性
const filteredReturns = computed(() => {
  return returnStore.returnRecords.filter(r => {
    if (searchForm.code && !r.code.includes(searchForm.code)) return false
    if (searchForm.sourceAppCode && !r.sourceAppCode.includes(searchForm.sourceAppCode)) return false
    if (searchForm.returnDate && r.returnDate !== searchForm.returnDate) return false
    if (searchForm.returner && !r.returner.includes(searchForm.returner)) return false
    if (searchForm.status && r.status !== searchForm.status) return false
    return true
  })
})

const paginatedReturns = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredReturns.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredReturns.value.length / pageSize.value) || 1)

const hasActiveMode = computed(() => batchEditMode.value || deleteMode.value || exportMode.value)

// 方法
const handlePageChange = (page) => {
  currentPage.value = page
}

const handlePageSizeChange = () => {
  currentPage.value = 1
}

const updateSearchField = (field, value) => {
  (searchForm)[field] = value
  currentPage.value = 1
}

const handleReset = () => {
  searchForm.code = ''
  searchForm.sourceAppCode = ''
  searchForm.returnDate = ''
  searchForm.returner = ''
  searchForm.status = ''
  currentPage.value = 1
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleExpandChange = (row) => {
  const index = expandedRows.value.indexOf(row.id)
  if (index > -1) {
    expandedRows.value.splice(index, 1)
  } else {
    expandedRows.value.push(row.id)
  }
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  generateCode()
  showFormModal.value = true
}

const handleView = (row) => {
  selectedRecord.value = row
  showDetailModal.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  showFormModal.value = true
}

const generateCode = () => {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  const todayRecords = returnStore.returnRecords.filter(r => r.code.startsWith(`RT${dateStr}`))
  let maxSeq = 0
  if (todayRecords.length > 0) {
    const sequences = todayRecords.map(r => parseInt(r.code.split('-')[1] || '0'))
    maxSeq = Math.max(...sequences)
  }
  const newSeq = (maxSeq + 1).toString().padStart(3, '0')
  form.code = `RT${dateStr}-${newSeq}`
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (isEdit.value) {
        await returnStore.editReturn(form.id, { ...form })
        ElMessage.success('编辑成功')
      } else {
        await returnStore.addReturn({
          code: form.code,
          sourceAppCode: form.sourceAppCode,
          sourceAppType: form.sourceAppType,
          returnDate: form.returnDate,
          returner: form.returner,
          warehouse: form.warehouse,
          status: 'submitted',
          remarks: form.remarks,
          materials: [...form.materials]
        })
        ElMessage.success('新增成功')
      }
      showFormModal.value = false
    }
  })
}

const handleAddMaterial = () => {
  form.materials.push({
    code: '',
    name: '',
    spec: '',
    unit: '',
    quantity: 0,
    reason: ''
  })
}

const handleRemoveMaterial = (index) => {
  form.materials.splice(index, 1)
}

const handleSelectFromSource = () => {
  if (!form.sourceAppCode) {
    ElMessage.warning('请先输入源单据号')
    return
  }
  selectedSourceAppCode.value = form.sourceAppCode
  showMaterialSelectModal.value = true
}

const handleSelectSource = () => {
  ElMessage.info('选择源单据功能开发中')
}

const handleConfirmMaterialSelect = () => {
  ElMessage.success('物料选择功能开发中')
  showMaterialSelectModal.value = false
}

const handleVoid = (row) => {
  voidForm.code = row.code
  voidForm.reason = ''
  showVoidModal.value = true
}

const handleSubmitVoid = async () => {
  if (!voidForm.reason) {
    ElMessage.warning('请输入作废原因')
    return
  }
  const returnRecord = returnStore.returnRecords.find(r => r.code === voidForm.code)
  if (returnRecord) {
    await returnStore.voidReturn(returnRecord.id)
  }
  ElMessage.success('作废申请已提交')
  showVoidModal.value = false
}

const handleBatchEdit = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要编辑的退料单')
    return
  }
  batchEditMode.value = true
  deleteMode.value = false
  exportMode.value = false
}

const handleConfirmBatchEdit = () => {
  ElMessage.success(`批量编辑了 ${selectedRows.value.length} 条退料记录`)
  batchEditMode.value = false
  selectedRows.value = []
}

const handleCancelBatchEdit = () => {
  batchEditMode.value = false
  selectedRows.value = []
}

const handleDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的退料单')
    return
  }
  batchEditMode.value = false
  deleteMode.value = true
  exportMode.value = false
  showDeleteConfirm.value = true
}

const handleConfirmBatchDelete = () => {
  showDeleteConfirm.value = false
  handleDoDelete()
}

const handleDoDelete = async () => {
  const ids = selectedRows.value.map(r => r.id)
  await returnStore.removeReturnsBatch(ids)
  ElMessage.success(`删除了 ${ids.length} 条退料记录`)
  selectedRows.value = []
  deleteMode.value = false
}

const handleCancelDelete = () => {
  deleteMode.value = false
  showDeleteConfirm.value = false
  selectedRows.value = []
}

const handleExport = () => {
  batchEditMode.value = false
  deleteMode.value = false
  exportMode.value = true
  selectedRows.value = []
}

const handleConfirmExport = () => {
  showExportModal.value = true
}

const handleCancelExport = () => {
  exportMode.value = false
  selectedRows.value = []
}

const handleDoExport = () => {
  const dataToExport = selectedRows.value.length > 0
    ? selectedRows.value
    : filteredReturns.value

  const headers = ['退料单号', '源单据号', '源单据类型', '退料日期', '退料人', '退料仓库', '状态', '创建时间', '备注']
  const exportData = dataToExport.map(r => ({
    '退料单号': r.code,
    '源单据号': r.sourceAppCode,
    '源单据类型': r.sourceAppType,
    '退料日期': r.returnDate,
    '退料人': r.returner,
    '退料仓库': r.warehouse,
    '状态': getStatusName(r.status),
    '创建时间': r.createTime,
    '备注': r.remarks || ''
  }))

  let content = ''
  let mimeType = ''
  let extension = ''

  if (exportFormat.value === 'csv') {
    content = headers.join(',') + '\n' + exportData.map(row =>
      headers.map(h => `"${(row)[h] || ''}"`).join(',')
    ).join('\n')
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFormat.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${(row)[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  } else if (exportFormat.value === 'word') {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">${headers.map(h => `<th>${h}</th>`).join('')}${exportData.map(row => `<tr>${headers.map(h => `<td>${(row)[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/msword;charset=utf-8'
    extension = 'doc'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `生产退料单_${new Date().toISOString().split('T')[0]}.${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  showExportModal.value = false
  exportMode.value = false
  selectedRows.value = []
  ElMessage.success('导出成功')
}

const resetForm = () => {
  form.id = 0
  form.code = ''
  form.sourceAppCode = ''
  form.sourceAppType = ''
  form.returnDate = ''
  form.returner = ''
  form.warehouse = ''
  form.status = 'submitted'
  form.remarks = ''
  form.materials = []
}
</script>
