<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <el-icon :size="24" color="white">
              <Incoming />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">物料入库</h1>
            <p class="text-gray-500">物料入库记录管理</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 编码规则生成器 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-2 mb-4">
        <h3 class="text-lg font-semibold text-gray-900">物料编码生成</h3>
        <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          资材编码规则：大类(2位) + 中类(2位) + 小类(2位) + 序号(3位)
        </span>
      </div>

      <div class="grid grid-cols-4 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">大类</label>
          <el-select
            v-model="codeGen.bigCategory"
            placeholder="请选择大类"
            @change="handleCodeGenBigCategoryChange"
          >
            <el-option
              v-for="cat in bigCategories"
              :key="cat.code"
              :label="`${cat.code} - ${cat.name}`"
              :value="cat.code"
            />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">中类</label>
          <el-select
            v-model="codeGen.midCategory"
            placeholder="请选择中类"
            :disabled="!codeGen.bigCategory"
            @change="handleCodeGenMidCategoryChange"
          >
            <el-option
              v-for="cat in codeGenMidCategories"
              :key="cat.code"
              :label="`${cat.code} - ${cat.name}`"
              :value="cat.code"
            />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">小类</label>
          <el-select
            v-model="codeGen.subCategory"
            placeholder="请选择小类"
            :disabled="!codeGen.midCategory"
            @change="handleCodeGenSubCategoryChange"
          >
            <el-option
              v-for="cat in codeGenSubCategories"
              :key="cat.code"
              :label="`${cat.code} - ${cat.name}`"
              :value="cat.code"
            />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">生成编码</label>
          <div class="flex gap-2">
            <el-input
              v-model="codeGen.generatedCode"
              placeholder="点击生成"
              readonly
            />
            <el-button
              type="primary"
              :disabled="!codeGen.subCategory"
              @click="handleCodeGen"
            >
              生成
            </el-button>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center gap-3">
        <el-button
          type="primary"
          :disabled="!codeGen.generatedCode"
          @click="handleVerifyCode"
        >
          <el-icon><Search /></el-icon>
          验证重码
        </el-button>
        <el-button
          :disabled="!codeGen.generatedCode"
          @click="handleCopyCode"
        >
          <el-icon><Download /></el-icon>
          {{ copySuccess ? '已复制!' : '复制编码' }}
        </el-button>
        <span class="text-xs text-gray-500">生成的编码可复制后用于新增物料</span>
      </div>

      <!-- 提示信息 -->
      <div v-if="codeGenError" class="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-600">{{ codeGenError }}</p>
      </div>
      <div v-if="codeGenSuccess && !codeGenError" class="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
        <p class="text-sm text-green-600">{{ codeGenSuccess }}</p>
      </div>
    </div>

    <!-- 入库记录表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">物料入库记录</h3>
        <div class="flex gap-2">
          <el-button type="primary" @click="handleAddInbound">
            <el-icon><Plus /></el-icon>
            新增入库
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </div>

      <el-table :data="paginatedRecords" stripe>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="code" label="入库单号" width="150" />
        <el-table-column prop="materialCode" label="物料编号" width="120" />
        <el-table-column prop="materialName" label="物料名称" min-width="150" />
        <el-table-column label="入库数量" width="120">
          <template #default="{ row }">
            {{ row.quantity }}{{ row.unit }}
          </template>
        </el-table-column>
        <el-table-column prop="supplier" label="供应商" width="120" />
        <el-table-column prop="inboundDate" label="入库日期" width="120" />
        <el-table-column prop="operator" label="操作员" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'completed' ? 'success' : 'warning'">
              {{ row.status === 'completed' ? '已完成' : '待审核' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
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

    <!-- 新增/编辑入库弹窗 -->
    <el-dialog
      v-model="showModal"
      :title="isEdit ? '编辑入库' : '新增入库'"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <!-- 入库单号 -->
        <el-form-item label="入库单号">
          <div class="flex gap-2 w-full">
            <el-input
              v-model="form.code"
              placeholder="点击自动生成"
              readonly
              class="flex-1"
            />
            <el-button type="primary" @click="generateCode" :disabled="isEdit">
              <el-icon><Refresh /></el-icon>
              自动生成
            </el-button>
          </div>
        </el-form-item>

        <!-- 物料编码 -->
        <el-form-item label="物料编码" prop="materialCode" required>
          <div class="flex gap-2 w-full">
            <el-input
              v-model="form.materialCode"
              placeholder="请输入物料编码（可从上方编码生成器复制）"
            />
            <el-button type="primary" @click="handleGenerateCodeInModal">
              生成编码
            </el-button>
          </div>
          <div class="text-xs text-gray-500 mt-1">提示：可在"物料编码生成"区域生成并验证编码后复制到此</div>
        </el-form-item>

        <!-- 物料名称 -->
        <el-form-item label="物料名称" prop="materialName" required>
          <el-input
            v-model="form.materialName"
            placeholder="请输入物料名称"
          />
        </el-form-item>

        <!-- 分类选择 -->
        <el-form-item label="分类选择">
          <div class="grid grid-cols-3 gap-4 w-full">
            <el-select
              v-model="form.bigCategory"
              placeholder="请选择大类"
              @change="handleModalBigCategoryChange"
            >
              <el-option
                v-for="cat in bigCategories"
                :key="cat.code"
                :label="`${cat.code} - ${cat.name}`"
                :value="cat.code"
              />
            </el-select>
            <el-select
              v-model="form.midCategory"
              placeholder="请选择中类"
              :disabled="!form.bigCategory"
              @change="handleModalMidCategoryChange"
            >
              <el-option
                v-for="cat in modalMidCategories"
                :key="cat.code"
                :label="`${cat.code} - ${cat.name}`"
                :value="cat.code"
              />
            </el-select>
            <el-select
              v-model="form.subCategory"
              placeholder="请选择小类"
              :disabled="!form.midCategory"
            >
              <el-option
                v-for="cat in modalSubCategories"
                :key="cat.code"
                :label="`${cat.code} - ${cat.name}`"
                :value="cat.code"
              />
            </el-select>
          </div>
        </el-form-item>

        <!-- 数量和单位 -->
        <el-form-item label="入库数量" prop="quantity" required>
          <div class="grid grid-cols-2 gap-4 w-full">
            <el-input
              v-model.number="form.quantity"
              type="number"
              placeholder="请输入数量"
            />
            <el-select v-model="form.unit" placeholder="请选择单位">
              <el-option v-for="unit in unitOptions" :key="unit" :label="unit" :value="unit" />
            </el-select>
          </div>
        </el-form-item>

        <!-- 供应商 -->
        <el-form-item label="供应商" prop="supplier">
          <el-input v-model="form.supplier" placeholder="请输入供应商" />
        </el-form-item>

        <!-- 入库日期和操作员 -->
        <el-form-item label="入库日期">
          <el-date-picker
            v-model="form.inboundDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="操作员">
          <el-input v-model="form.operator" placeholder="请输入操作员" />
        </el-form-item>

        <!-- 备注 -->
        <el-form-item label="备注">
          <el-input
            v-model="form.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleCloseModal">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情弹窗 -->
    <el-dialog
      v-model="showDetailModal"
      title="入库详情"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="入库单号">{{ selectedRecord?.code }}</el-descriptions-item>
        <el-descriptions-item label="物料编号">{{ selectedRecord?.materialCode }}</el-descriptions-item>
        <el-descriptions-item label="物料名称">{{ selectedRecord?.materialName }}</el-descriptions-item>
        <el-descriptions-item label="入库数量">{{ selectedRecord?.quantity }}{{ selectedRecord?.unit }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ selectedRecord?.supplier }}</el-descriptions-item>
        <el-descriptions-item label="入库日期">{{ selectedRecord?.inboundDate }}</el-descriptions-item>
        <el-descriptions-item label="操作员">{{ selectedRecord?.operator }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="selectedRecord?.status === 'completed' ? 'success' : 'warning'">
            {{ selectedRecord?.status === 'completed' ? '已完成' : '待审核' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ selectedRecord?.remarks || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="showDetailModal = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 导出格式选择弹窗 -->
    <el-dialog
      v-model="showExportModal"
      title="选择导出格式"
      width="500px"
    >
      <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedRows.length }} 条数据</p>
      <div class="space-y-3">
        <el-radio-group v-model="exportFormat" class="w-full">
          <div
            v-for="format in exportFormats"
            :key="format.value"
            :class="[
              'flex items-center p-4 border rounded-lg cursor-pointer transition-all',
              exportFormat === format.value
                ? 'border-blue-500 bg-blue-50'
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
import { Upload, Download, Search, Plus, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useInboundStore } from '@/stores/modules/inventory/useInboundStore'
import { useMaterialTypeStore } from '@/stores/modules/inventory/useMaterialTypeStore'

// 状态管理
const inboundStore = useInboundStore()
const materialTypeStore = useMaterialTypeStore()

// 单位选项
const unitOptions = ['袋', '箱', '个', '公斤', '升', '平方米']

// 导出格式选项
const exportFormats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

// 状态
const currentPage = ref(1)
const pageSize = ref(10)
const showModal = ref(false)
const showDetailModal = ref(false)
const showExportModal = ref(false)
const isEdit = ref(false)
const selectedRecord = ref(null)
const selectedRows = ref([])
const exportFormat = ref('excel')
const copySuccess = ref(false)

// 编码生成器状态
const codeGen = reactive({
  bigCategory: '',
  midCategory: '',
  subCategory: '',
  generatedCode: ''
})
const codeGenError = ref('')
const codeGenSuccess = ref('')

// 表单状态
const form = reactive({
  id: 0,
  code: '',
  materialCode: '',
  materialName: '',
  bigCategory: '',
  midCategory: '',
  subCategory: '',
  quantity: '',
  unit: '袋',
  supplier: '',
  inboundDate: '',
  operator: '',
  remarks: ''
})

const formRef = ref()

const rules = {
  materialCode: [{ required: true, message: '请输入物料编码', trigger: 'blur' }],
  materialName: [{ required: true, message: '请输入物料名称', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入入库数量', trigger: 'blur' }],
  supplier: [{ required: true, message: '请输入供应商', trigger: 'blur' }]
}

// 大类选项从 store 获取
const bigCategories = computed(() => materialTypeStore.bigCategories)

// 代码生成器中类/小类选项（弹窗共用同一 store 数据源）
const codeGenMidCategories = computed(() => materialTypeStore.midCategories)
const codeGenSubCategories = computed(() => materialTypeStore.subCategories)
const modalMidCategories = computed(() => materialTypeStore.midCategories)
const modalSubCategories = computed(() => materialTypeStore.subCategories)

// 筛选和分页
const filteredRecords = computed(() => inboundStore.inboundRecords)

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRecords.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredRecords.value.length / pageSize.value) || 1)

// 方法
const handlePageChange = (page) => {
  currentPage.value = page
}

const handlePageSizeChange = () => {
  currentPage.value = 1
}

// 编码生成器方法
const handleCodeGenBigCategoryChange = async () => {
  codeGen.midCategory = ''
  codeGen.subCategory = ''
  codeGen.generatedCode = ''
  codeGenError.value = ''
  codeGenSuccess.value = ''
  if (codeGen.bigCategory) {
    await materialTypeStore.loadMidCategories(codeGen.bigCategory)
  }
}

const handleCodeGenMidCategoryChange = async () => {
  codeGen.subCategory = ''
  codeGen.generatedCode = ''
  codeGenError.value = ''
  codeGenSuccess.value = ''
  if (codeGen.bigCategory && codeGen.midCategory) {
    await materialTypeStore.loadSubCategories(codeGen.bigCategory, codeGen.midCategory)
  }
}

const handleCodeGenSubCategoryChange = () => {
  codeGen.generatedCode = ''
  codeGenError.value = ''
  codeGenSuccess.value = ''
}

const handleCodeGen = () => {
  codeGenError.value = ''
  codeGenSuccess.value = ''
  if (!codeGen.bigCategory || !codeGen.midCategory || !codeGen.subCategory) {
    codeGenError.value = '请先选择大类、中类、小类'
    return
  }

  // 前缀由三级编码拼接组成（规则：大类(2位) + 中类(2位) + 小类(2位)）
  const prefix = `${codeGen.bigCategory}${codeGen.midCategory}${codeGen.subCategory}`
  const existingCodes = inboundStore.inboundRecords
    .map(m => m.materialCode && m.materialCode.startsWith(prefix) ? parseInt(m.materialCode.slice(-3)) : 0)

  let maxSeq = 0
  if (existingCodes.length > 0) {
    maxSeq = Math.max(...existingCodes)
  }

  const newSeq = (maxSeq + 1).toString().padStart(3, '0')
  codeGen.generatedCode = prefix + newSeq
  codeGenSuccess.value = '编码已生成！'
}

const handleVerifyCode = async () => {
  codeGenError.value = ''
  codeGenSuccess.value = ''
  if (!codeGen.generatedCode) {
    codeGenError.value = '请先生成编码'
    return
  }

  try {
    const exists = await materialTypeStore.checkCodeExists(codeGen.generatedCode)
    if (exists) {
      codeGenError.value = '警告：该编码已在记录中存在！'
    } else {
      codeGenSuccess.value = '验证通过：该编码可以使用！'
    }
  } catch {
    // API 调用失败时回退到本地检查
    const exists = inboundStore.inboundRecords.some(m => m.materialCode === codeGen.generatedCode)
    if (exists) {
      codeGenError.value = '警告：该编码已在记录中存在！'
    } else {
      codeGenSuccess.value = '验证通过：该编码可以使用！'
    }
  }
}

const handleCopyCode = () => {
  if (!codeGen.generatedCode) return
  navigator.clipboard.writeText(codeGen.generatedCode)
  copySuccess.value = true
  setTimeout(() => { copySuccess.value = false }, 2000)
}

// 新增入库相关方法
const handleAddInbound = () => {
  isEdit.value = false
  resetForm()
  showModal.value = true
}

const handleView = (row) => {
  selectedRecord.value = row
  showDetailModal.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  showModal.value = true
}

const generateCode = () => {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  const todayRecords = inboundStore.inboundRecords.filter(r => r.code && r.code.startsWith(`RK${dateStr}`))
  let maxSeq = 0
  if (todayRecords.length > 0) {
    const sequences = todayRecords.map(r => parseInt(r.code.split('-')[1] || '0'))
    maxSeq = Math.max(...sequences)
  }
  const newSeq = (maxSeq + 1).toString().padStart(3, '0')
  form.code = `RK${dateStr}-${newSeq}`
}

const handleGenerateCodeInModal = () => {
  if (!form.bigCategory || !form.midCategory || !form.subCategory) {
    ElMessage.warning('请先选择大类、中类、小类')
    return
  }

  // 前缀由三级编码拼接组成
  const prefix = `${form.bigCategory}${form.midCategory}${form.subCategory}`
  const existingCodes = inboundStore.inboundRecords
    .map(m => m.materialCode && m.materialCode.startsWith(prefix) ? parseInt(m.materialCode.slice(-3)) : 0)

  let maxSeq = 0
  if (existingCodes.length > 0) {
    maxSeq = Math.max(...existingCodes)
  }

  const newSeq = (maxSeq + 1).toString().padStart(3, '0')
  form.materialCode = prefix + newSeq
}

const handleModalBigCategoryChange = async () => {
  form.midCategory = ''
  form.subCategory = ''
  form.materialCode = ''
  if (form.bigCategory) {
    await materialTypeStore.loadMidCategories(form.bigCategory)
  }
}

const handleModalMidCategoryChange = async () => {
  form.subCategory = ''
  form.materialCode = ''
  if (form.bigCategory && form.midCategory) {
    await materialTypeStore.loadSubCategories(form.bigCategory, form.midCategory)
  }
}

const handleSave = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    if (isEdit.value) {
      // 编辑模式：调用 store 更新
      await inboundStore.editInbound(form.id, { ...form, quantity: Number(form.quantity) })
      ElMessage.success('编辑成功')
    } else {
      // 新增模式：调用 store 创建
      await inboundStore.addInbound({
        code: form.code,
        materialCode: form.materialCode,
        materialName: form.materialName,
        quantity: Number(form.quantity),
        unit: form.unit,
        supplier: form.supplier,
        inboundDate: form.inboundDate,
        operator: form.operator,
        status: 'pending',
        remarks: form.remarks
      })
      ElMessage.success('新增成功')
    }
    handleCloseModal()
  } catch (err) {
    // Element Plus 表单验证失败时 showModal 保持打开
    // API 错误已在 store 中处理，此处仅对可见异常做提示
    if (err && typeof err === 'object' && 'message' in err) {
      ElMessage.error(err.message)
    }
  }
}

const handleCloseModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  form.id = 0
  form.code = ''
  form.materialCode = ''
  form.materialName = ''
  form.bigCategory = ''
  form.midCategory = ''
  form.subCategory = ''
  form.quantity = ''
  form.unit = '袋'
  form.supplier = ''
  form.inboundDate = ''
  form.operator = ''
  form.remarks = ''
}

const handleExport = () => {
  showExportModal.value = true
}

const handleDoExport = () => {
  const dataToExport = selectedRows.value.length > 0
    ? selectedRows.value
    : filteredRecords.value

  const headers = ['入库单号', '物料编号', '物料名称', '入库数量', '单位', '供应商', '入库日期', '操作员', '状态', '备注']
  const exportData = dataToExport.map(r => ({
    '入库单号': r.code,
    '物料编号': r.materialCode,
    '物料名称': r.materialName,
    '入库数量': r.quantity,
    '单位': r.unit,
    '供应商': r.supplier,
    '入库日期': r.inboundDate,
    '操作员': r.operator,
    '状态': r.status === 'completed' ? '已完成' : '待审核',
    '备注': r.remarks || ''
  }))

  let content = ''
  let mimeType = ''
  let extension = ''

  if (exportFormat.value === 'csv') {
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => headers.map(h => `"${(row)[h]}"`).join(','))
    ].join('\n')
    const BOM = '﻿'
    content = BOM + csvContent
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFormat.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${(row)[h]}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  } else if (exportFormat.value === 'word') {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>物料入库记录</title></head><body><table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse"><tr style="background-color:#f0f0f0">${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${(row)[h]}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/ms-word;charset=utf-8'
    extension = 'doc'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `物料入库记录_${new Date().toISOString().slice(0, 10)}.${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  showExportModal.value = false
  ElMessage.success('导出成功')
}

// 初始化：加载物料大类及入库记录
onMounted(async () => {
  await materialTypeStore.loadBigCategories()
  await inboundStore.loadInboundRecords()
})
</script>
