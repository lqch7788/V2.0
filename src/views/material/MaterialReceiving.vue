<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <el-icon :size="24" color="white">
              <Upload />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">物料接收</h1>
            <p class="text-gray-500">物料接收记录管理</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
      <div class="grid grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">接收单号</label>
          <el-input
            v-model="searchForm.code"
            placeholder="请输入"
            clearable
            @clear="updateSearchField('code', '')"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
          <el-input
            v-model="searchForm.supplier"
            placeholder="请输入"
            clearable
            @clear="updateSearchField('supplier', '')"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">接收日期</label>
          <el-date-picker
            v-model="searchForm.receiveDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            clearable
            @clear="updateSearchField('receiveDate', '')"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">接收人</label>
          <el-input
            v-model="searchForm.receiver"
            placeholder="请输入"
            clearable
            @clear="updateSearchField('receiver', '')"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <el-select v-model="searchForm.status" placeholder="全部" clearable @clear="updateSearchField('status', '')">
            <el-option label="待确认" value="pending" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="已入库" value="inbound" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </div>
      </div>
      <div class="mt-4 flex justify-end gap-2">
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">物料接收列表</h3>
        <div class="flex gap-2">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
          <el-button @click="handleBatchEdit">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button type="danger" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </div>

      <el-table
        :data="paginatedRecords"
        stripe
        @selection-change="handleSelectionChange"
        @expand-change="handleExpandChange"
        :expand-row-keys="expandedRows"
        row-key="id"
      >
        <el-table-column
          v-if="batchEditMode || deleteMode || exportMode"
          type="selection"
          width="55"
        />
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="p-4 bg-gray-50">
              <h4 class="font-medium mb-2">接收物料明细</h4>
              <el-table :data="row.materials" size="small">
                <el-table-column prop="code" label="物料编号" width="120" />
                <el-table-column prop="name" label="物料名称" min-width="150" />
                <el-table-column prop="spec" label="规格" width="100" />
                <el-table-column prop="unit" label="单位" width="80" />
                <el-table-column prop="quantity" label="接收数量" width="100" />
                <el-table-column prop="qualityStatus" label="质量状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.qualityStatus === 'qualified' ? 'success' : 'danger'" size="small">
                      {{ row.qualityStatus === 'qualified' ? '合格' : '不合格' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="remarks" label="备注" min-width="150" />
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="接收单号" width="150" />
        <el-table-column prop="supplier" label="供应商" width="120" />
        <el-table-column prop="receiveDate" label="接收日期" width="120" />
        <el-table-column prop="receiver" label="接收人" width="100" />
        <el-table-column prop="warehouse" label="接收仓库" width="100" />
        <el-table-column label="物料种类" width="100">
          <template #default="{ row }">
            {{ row.materials?.length || 0 }} 种
          </template>
        </el-table-column>
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
            <el-button link type="success" @click="handleConfirm(row)" v-if="row.status === 'pending'">确认</el-button>
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
            共 {{ filteredRecords.length }} 条，第 {{ currentPage }} / {{ totalPages }} 页
          </span>
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredRecords.length"
            layout="prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <!-- 查看详情弹窗 -->
    <el-dialog
      v-model="showDetailModal"
      title="接收单详情"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="接收单号">{{ selectedRecord?.code }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ selectedRecord?.supplier }}</el-descriptions-item>
        <el-descriptions-item label="接收日期">{{ selectedRecord?.receiveDate }}</el-descriptions-item>
        <el-descriptions-item label="接收人">{{ selectedRecord?.receiver }}</el-descriptions-item>
        <el-descriptions-item label="接收仓库">{{ selectedRecord?.warehouse }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(selectedRecord?.status || '')" size="small">
            {{ getStatusName(selectedRecord?.status || '') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ selectedRecord?.createTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ selectedRecord?.remarks || '-' }}</el-descriptions-item>
      </el-descriptions>

      <div class="mt-4">
        <h4 class="font-medium mb-2">接收物料明细</h4>
        <el-table :data="selectedRecord?.materials || []" stripe>
          <el-table-column prop="code" label="物料编号" width="120" />
          <el-table-column prop="name" label="物料名称" min-width="150" />
          <el-table-column prop="spec" label="规格" width="100" />
          <el-table-column prop="unit" label="单位" width="80" />
          <el-table-column prop="quantity" label="接收数量" width="100" />
          <el-table-column prop="qualityStatus" label="质量状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.qualityStatus === 'qualified' ? 'success' : 'danger'" size="small">
                {{ row.qualityStatus === 'qualified' ? '合格' : '不合格' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remarks" label="备注" min-width="150" />
        </el-table>
      </div>

      <template #footer>
        <el-button @click="showDetailModal = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="showFormModal"
      :title="isEdit ? '编辑接收单' : '新增接收单'"
      width="900px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="接收单号" prop="code">
              <el-input v-model="form.code" placeholder="自动生成" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="接收日期" prop="receiveDate">
              <el-date-picker
                v-model="form.receiveDate"
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
            <el-form-item label="供应商" prop="supplier">
              <el-input v-model="form.supplier" placeholder="请输入供应商" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="接收人" prop="receiver">
              <el-input v-model="form.receiver" placeholder="请输入接收人" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="接收仓库" prop="warehouse">
              <el-select v-model="form.warehouse" placeholder="请选择">
                <el-option label="原料仓库A" value="原料仓库A" />
                <el-option label="原料仓库B" value="原料仓库B" />
                <el-option label="成品仓库" value="成品仓库" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="质检状态">
              <el-radio-group v-model="form.qualityCheck">
                <el-radio label="passed">免检</el-radio>
                <el-radio label="pending">待检</el-radio>
                <el-radio label="failed">不合格</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 接收物料明细 -->
        <el-form-item label="接收物料">
          <div class="mb-2">
            <el-button size="small" @click="handleAddMaterial">
              <el-icon><Plus /></el-icon>
              添加物料
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
            <el-table-column prop="quantity" label="接收数量" width="100">
              <template #default="{ row }">
                <el-input-number v-model="row.quantity" :min="1" size="small" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column prop="qualityStatus" label="质量状态" width="100">
              <template #default="{ row }">
                <el-select v-model="row.qualityStatus" placeholder="状态" size="small">
                  <el-option label="合格" value="qualified" />
                  <el-option label="不合格" value="unqualified" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="remarks" label="备注" min-width="120">
              <template #default="{ row }">
                <el-input v-model="row.remarks" placeholder="备注" size="small" />
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

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="showDeleteConfirm"
      title="确认删除"
      width="400px"
    >
      <div class="flex items-center gap-3">
        <el-icon :size="40" color="#f56c6c"><WarningFilled /></el-icon>
        <div>
          <p class="text-lg font-medium">确定要删除选中的 {{ selectedRows.length }} 条接收记录吗？</p>
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
        {{ selectedRows.length > 0 ? `已选择 ${selectedRows.length} 条数据` : `共 ${filteredRecords.length} 条数据` }}
      </p>
      <div class="space-y-3">
        <el-radio-group v-model="exportFormat" class="w-full">
          <div
            v-for="format in exportFormats"
            :key="format.value"
            :class="[
              'flex items-center p-4 border rounded-lg cursor-pointer transition-all',
              exportFormat === format.value
                ? 'border-green-500 bg-green-50'
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
import { ref, computed, reactive } from 'vue'
import { Upload, Plus, Edit, Delete, Download, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 状态类型映射
const statusMap = {
  'pending': '待确认',
  'confirmed': '已确认',
  'inbound': '已入库',
  'rejected': '已拒绝'
}

const getStatusName = (status) => statusMap[status] || status

const getStatusType = (status) => {
  const typeMap = {
    'pending': 'warning',
    'confirmed': 'success',
    'inbound': 'info',
    'rejected': 'danger'
  }
  return typeMap[status] || ''
}

// 导出格式选项
const exportFormats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

// Mock数据
const mockRecords = ref([
  {
    id: 1,
    code: 'JS20260522-001',
    supplier: '种子公司A',
    receiveDate: '2026-05-22',
    receiver: '张三',
    warehouse: '原料仓库A',
    status: 'pending',
    createTime: '2026-05-22 09:30:00',
    remarks: '正常接收',
    qualityCheck: 'pending',
    materials: [
      { code: '010101001', name: '番茄种子', spec: '优等品', unit: '袋', quantity: 50, qualityStatus: 'qualified', remarks: '' },
      { code: '010102001', name: '黄瓜种子', spec: '优等品', unit: '袋', quantity: 30, qualityStatus: 'qualified', remarks: '' }
    ]
  },
  {
    id: 2,
    code: 'JS20260521-001',
    supplier: '肥料公司B',
    receiveDate: '2026-05-21',
    receiver: '李四',
    warehouse: '原料仓库B',
    status: 'confirmed',
    createTime: '2026-05-21 14:20:00',
    remarks: '',
    qualityCheck: 'passed',
    materials: [
      { code: '010201001', name: '尿素', spec: '50kg/袋', unit: '袋', quantity: 100, qualityStatus: 'qualified', remarks: '' }
    ]
  },
  {
    id: 3,
    code: 'JS20260520-001',
    supplier: '农药公司C',
    receiveDate: '2026-05-20',
    receiver: '王五',
    warehouse: '原料仓库A',
    status: 'inbound',
    createTime: '2026-05-20 10:15:00',
    remarks: '已入库',
    qualityCheck: 'passed',
    materials: [
      { code: '010301001', name: '多菌灵', spec: '500ml/瓶', unit: '瓶', quantity: 50, qualityStatus: 'qualified', remarks: '' },
      { code: '010302001', name: '百菌清', spec: '500ml/瓶', unit: '瓶', quantity: 30, qualityStatus: 'qualified', remarks: '' }
    ]
  },
  {
    id: 4,
    code: 'JS20260519-001',
    supplier: '资材公司D',
    receiveDate: '2026-05-19',
    receiver: '赵六',
    warehouse: '成品仓库',
    status: 'rejected',
    createTime: '2026-05-19 16:45:00',
    remarks: '部分物料不合格',
    qualityCheck: 'failed',
    materials: [
      { code: '020101001', name: '纸箱(大)', spec: '50*40*30', unit: '个', quantity: 200, qualityStatus: 'unqualified', remarks: '规格不符' }
    ]
  }
])

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
const showDeleteConfirm = ref(false)
const showExportModal = ref(false)
const isEdit = ref(false)
const exportFormat = ref('excel')
const selectedRecord = ref(null)

// 搜索表单
const searchForm = reactive({
  code: '',
  supplier: '',
  receiveDate: '',
  receiver: '',
  status: ''
})

// 表单状态
const form = reactive({
  id: 0,
  code: '',
  receiveDate: '',
  supplier: '',
  receiver: '',
  warehouse: '',
  qualityCheck: 'pending',
  remarks: '',
  materials: []
})

const formRef = ref()

const rules = {
  supplier: [{ required: true, message: '请输入供应商', trigger: 'blur' }],
  receiveDate: [{ required: true, message: '请选择接收日期', trigger: 'change' }],
  receiver: [{ required: true, message: '请输入接收人', trigger: 'blur' }],
  warehouse: [{ required: true, message: '请选择接收仓库', trigger: 'change' }]
}

// 计算属性
const filteredRecords = computed(() => {
  return mockRecords.value.filter(r => {
    if (searchForm.code && !r.code.includes(searchForm.code)) return false
    if (searchForm.supplier && !r.supplier.includes(searchForm.supplier)) return false
    if (searchForm.receiveDate && r.receiveDate !== searchForm.receiveDate) return false
    if (searchForm.receiver && !r.receiver.includes(searchForm.receiver)) return false
    if (searchForm.status && r.status !== searchForm.status) return false
    return true
  })
})

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRecords.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredRecords.value.length / pageSize.value) || 1)

// 方法
const updateSearchField = (field, value) => {
  (searchForm)[field] = value
  currentPage.value = 1
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  searchForm.code = ''
  searchForm.supplier = ''
  searchForm.receiveDate = ''
  searchForm.receiver = ''
  searchForm.status = ''
  currentPage.value = 1
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const handlePageSizeChange = () => {
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

const handleConfirm = (row) => {
  row.status = 'confirmed'
  ElMessage.success('确认成功')
}

const generateCode = () => {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  const todayRecords = mockRecords.value.filter(r => r.code.startsWith(`JS${dateStr}`))
  let maxSeq = 0
  if (todayRecords.length > 0) {
    const sequences = todayRecords.map(r => parseInt(r.code.split('-')[1] || '0'))
    maxSeq = Math.max(...sequences)
  }
  const newSeq = (maxSeq + 1).toString().padStart(3, '0')
  form.code = `JS${dateStr}-${newSeq}`
}

const handleAddMaterial = () => {
  form.materials.push({
    code: '',
    name: '',
    spec: '',
    unit: '',
    quantity: 1,
    qualityStatus: 'qualified',
    remarks: ''
  })
}

const handleRemoveMaterial = (index) => {
  form.materials.splice(index, 1)
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        const index = mockRecords.value.findIndex(r => r.id === form.id)
        if (index !== -1) {
          mockRecords.value[index] = { ...form }
        }
        ElMessage.success('编辑成功')
      } else {
        const newRecord = {
          id: Math.max(...mockRecords.value.map(r => r.id)) + 1,
          code: form.code,
          supplier: form.supplier,
          receiveDate: form.receiveDate,
          receiver: form.receiver,
          warehouse: form.warehouse,
          status: 'pending',
          createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
          remarks: form.remarks,
          qualityCheck: form.qualityCheck,
          materials: [...form.materials]
        }
        mockRecords.value.unshift(newRecord)
        ElMessage.success('新增成功')
      }
      showFormModal.value = false
    }
  })
}

const handleBatchEdit = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要编辑的接收单')
    return
  }
  ElMessage.info('批量编辑功能开发中')
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的接收单')
    return
  }
  showDeleteConfirm.value = true
}

const handleDoDelete = () => {
  const ids = selectedRows.value.map(r => r.id)
  mockRecords.value = mockRecords.value.filter(r => !ids.includes(r.id))
  ElMessage.success(`删除了 ${ids.length} 条接收记录`)
  showDeleteConfirm.value = false
  selectedRows.value = []
}

const handleExport = () => {
  showExportModal.value = true
}

const handleDoExport = () => {
  const dataToExport = selectedRows.value.length > 0
    ? selectedRows.value
    : filteredRecords.value

  const headers = ['接收单号', '供应商', '接收日期', '接收人', '接收仓库', '物料种类', '状态', '创建时间', '备注']
  const exportData = dataToExport.map(r => ({
    '接收单号': r.code,
    '供应商': r.supplier,
    '接收日期': r.receiveDate,
    '接收人': r.receiver,
    '接收仓库': r.warehouse,
    '物料种类': `${r.materials?.length || 0} 种`,
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
    mimeType = 'application/ms-word;charset=utf-8'
    extension = 'doc'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `物料接收单_${new Date().toISOString().slice(0, 10)}.${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  showExportModal.value = false
  ElMessage.success('导出成功')
}

const resetForm = () => {
  form.id = 0
  form.code = ''
  form.receiveDate = ''
  form.supplier = ''
  form.receiver = ''
  form.warehouse = ''
  form.qualityCheck = 'pending'
  form.remarks = ''
  form.materials = []
}
</script>
