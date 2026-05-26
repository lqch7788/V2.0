<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <el-icon :size="24" color="white">
              <Collection />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">物料类别</h1>
            <p class="text-gray-500">物料分类管理体系</p>
          </div>
        </div>
        <el-button type="primary" @click="handleAddCategory">
          <el-icon><Plus /></el-icon>
          新增类别
        </el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
      <div class="grid grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">类别编码</label>
          <el-input
            v-model="searchForm.code"
            placeholder="请输入"
            clearable
            @clear="updateSearchField('code', '')"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">类别名称</label>
          <el-input
            v-model="searchForm.name"
            placeholder="请输入"
            clearable
            @clear="updateSearchField('name', '')"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">上级类别</label>
          <el-select
            v-model="searchForm.parentCode"
            placeholder="全部"
            clearable
            @clear="updateSearchField('parentCode', '')"
          >
            <el-option label="原料" value="01" />
            <el-option label="资材" value="02" />
          </el-select>
        </div>
        <div class="flex items-end">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">物料类别列表</h3>
        <div class="flex gap-2">
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
        :data="paginatedCategories"
        stripe
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="code" label="类别编码" width="120" />
        <el-table-column prop="name" label="类别名称" min-width="150" />
        <el-table-column prop="level" label="层级" width="80">
          <template #default="{ row }">
            <el-tag :type="row.level === 1 ? 'success' : row.level === 2 ? 'warning' : 'info'" size="small">
              {{ row.level === 1 ? '大类' : row.level === 2 ? '中类' : '小类' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="parentCode" label="上级类别" width="120">
          <template #default="{ row }">
            {{ getParentName(row.parentCode) }}
          </template>
        </el-table-column>
        <el-table-column prop="prefix" label="编码前缀" width="100" />
        <el-table-column prop="description" label="描述" min-width="150" />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
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
            共 {{ filteredCategories.length }} 条，第 {{ currentPage }} / {{ totalPages }} 页
          </span>
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredCategories.length"
            layout="prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="showFormModal"
      :title="isEdit ? '编辑类别' : '新增类别'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="类别编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入类别编码" />
        </el-form-item>
        <el-form-item label="类别名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入类别名称" />
        </el-form-item>
        <el-form-item label="层级" prop="level">
          <el-select v-model="form.level" placeholder="请选择层级" @change="handleLevelChange">
            <el-option label="大类" :value="1" />
            <el-option label="中类" :value="2" />
            <el-option label="小类" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="上级类别" prop="parentCode">
          <el-select v-model="form.parentCode" placeholder="请选择上级类别" :disabled="form.level === 1">
            <el-option
              v-for="cat in parentCategoryOptions"
              :key="cat.code"
              :label="`${cat.code} - ${cat.name}`"
              :value="cat.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="编码前缀" prop="prefix">
          <el-input v-model="form.prefix" placeholder="请输入编码前缀" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showFormModal = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情弹窗 -->
    <el-dialog
      v-model="showDetailModal"
      title="类别详情"
      width="500px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="类别编码">{{ selectedCategory?.code }}</el-descriptions-item>
        <el-descriptions-item label="类别名称">{{ selectedCategory?.name }}</el-descriptions-item>
        <el-descriptions-item label="层级">
          <el-tag :type="selectedCategory?.level === 1 ? 'success' : selectedCategory?.level === 2 ? 'warning' : 'info'" size="small">
            {{ selectedCategory?.level === 1 ? '大类' : selectedCategory?.level === 2 ? '中类' : '小类' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="上级类别">{{ getParentName(selectedCategory?.parentCode) }}</el-descriptions-item>
        <el-descriptions-item label="编码前缀">{{ selectedCategory?.prefix }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ selectedCategory?.sortOrder }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="selectedCategory?.status === 'active' ? 'success' : 'info'" size="small">
            {{ selectedCategory?.status === 'active' ? '启用' : '停用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="描述">{{ selectedCategory?.description || '-' }}</el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="showDetailModal = false">关闭</el-button>
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
          <p class="text-lg font-medium">确定要删除选中的 {{ selectedRows.length }} 个类别吗？</p>
          <p class="text-sm text-gray-500">删除后将无法恢复</p>
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
        {{ selectedRows.length > 0 ? `已选择 ${selectedRows.length} 个类别` : `共 ${filteredCategories.length} 个类别` }}
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
import { ref, computed, reactive } from 'vue'
import { Collection, Plus, Edit, Delete, Download, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 导出格式选项
const exportFormats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

// Mock数据 - 树形结构类别
const mockCategories = ref([
  {
    id: 1,
    code: '01',
    name: '原料',
    level: 1,
    parentCode: '',
    prefix: '01',
    description: '农业生产原料',
    sortOrder: 1,
    status: 'active',
    children: [
      {
        id: 11,
        code: '0101',
        name: '种子',
        level: 2,
        parentCode: '01',
        prefix: '0101',
        description: '各类种子',
        sortOrder: 1,
        status: 'active',
        children: [
          { id: 111, code: '010101', name: '蔬菜种子', level: 3, parentCode: '0101', prefix: '010101', description: '蔬菜类种子', sortOrder: 1, status: 'active' },
          { id: 112, code: '010102', name: '水果种子', level: 3, parentCode: '0101', prefix: '010102', description: '水果类种子', sortOrder: 2, status: 'active' },
        ]
      },
      {
        id: 12,
        code: '0102',
        name: '肥料',
        level: 2,
        parentCode: '01',
        prefix: '0102',
        description: '各类肥料',
        sortOrder: 2,
        status: 'active',
        children: [
          { id: 121, code: '010201', name: '氮肥', level: 3, parentCode: '0102', prefix: '010201', description: '氮肥类', sortOrder: 1, status: 'active' },
          { id: 122, code: '010202', name: '磷肥', level: 3, parentCode: '0102', prefix: '010202', description: '磷肥类', sortOrder: 2, status: 'active' },
          { id: 123, code: '010203', name: '钾肥', level: 3, parentCode: '0102', prefix: '010203', description: '钾肥类', sortOrder: 3, status: 'active' },
        ]
      },
      {
        id: 13,
        code: '0103',
        name: '农药',
        level: 2,
        parentCode: '01',
        prefix: '0103',
        description: '各类农药',
        sortOrder: 3,
        status: 'active',
        children: [
          { id: 131, code: '010301', name: '杀虫剂', level: 3, parentCode: '0103', prefix: '010301', description: '杀虫药剂', sortOrder: 1, status: 'active' },
          { id: 132, code: '010302', name: '杀菌剂', level: 3, parentCode: '0103', prefix: '010302', description: '杀菌药剂', sortOrder: 2, status: 'active' },
        ]
      },
    ]
  },
  {
    id: 2,
    code: '02',
    name: '资材',
    level: 1,
    parentCode: '',
    prefix: '02',
    description: '农业生产资材',
    sortOrder: 2,
    status: 'active',
    children: [
      {
        id: 21,
        code: '0201',
        name: '包装材料',
        level: 2,
        parentCode: '02',
        prefix: '0201',
        description: '包装用材料',
        sortOrder: 1,
        status: 'active',
        children: [
          { id: 211, code: '020101', name: '纸箱', level: 3, parentCode: '0201', prefix: '020101', description: '各种规格纸箱', sortOrder: 1, status: 'active' },
          { id: 212, code: '020102', name: '塑料袋', level: 3, parentCode: '0201', prefix: '020102', description: '各种规格塑料袋', sortOrder: 2, status: 'active' },
        ]
      },
      {
        id: 22,
        code: '0202',
        name: '工具',
        level: 2,
        parentCode: '02',
        prefix: '0202',
        description: '生产工具',
        sortOrder: 2,
        status: 'active',
        children: [
          { id: 221, code: '020201', name: '剪刀', level: 3, parentCode: '0202', prefix: '020201', description: '修剪用剪刀', sortOrder: 1, status: 'active' },
          { id: 222, code: '020202', name: '铲子', level: 3, parentCode: '0202', prefix: '020202', description: '挖掘用铲子', sortOrder: 2, status: 'active' },
        ]
      },
    ]
  },
])

// 状态
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRows = ref([])
const showFormModal = ref(false)
const showDetailModal = ref(false)
const showDeleteConfirm = ref(false)
const showExportModal = ref(false)
const isEdit = ref(false)
const exportFormat = ref('excel')
const selectedCategory = ref(null)

// 搜索表单
const searchForm = reactive({
  code: '',
  name: '',
  parentCode: ''
})

// 表单状态
const form = reactive({
  id: 0,
  code: '',
  name: '',
  level: 1,
  parentCode: '',
  prefix: '',
  sortOrder: 0,
  status: 'active',
  description: ''
})

const formRef = ref()

const rules = {
  code: [{ required: true, message: '请输入类别编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入类别名称', trigger: 'blur' }],
  level: [{ required: true, message: '请选择层级', trigger: 'change' }],
}

// 计算属性 - 将树形结构平铺
const flatCategories = computed(() => {
  const result = []
  const flatten = (categories, parentName = '') => {
    categories.forEach(cat => {
      result.push({ ...cat, parentName })
      if (cat.children && cat.children.length > 0) {
        flatten(cat.children, cat.name)
      }
    })
  }
  flatten(mockCategories.value)
  return result
})

const filteredCategories = computed(() => {
  return flatCategories.value.filter(cat => {
    if (searchForm.code && !cat.code.includes(searchForm.code)) return false
    if (searchForm.name && !cat.name.includes(searchForm.name)) return false
    if (searchForm.parentCode && cat.parentCode !== searchForm.parentCode && !cat.code.startsWith(searchForm.parentCode)) return false
    return true
  })
})

const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredCategories.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredCategories.value.length / pageSize.value) || 1)

// 上级类别选项
const parentCategoryOptions = computed(() => {
  if (form.level === 1) return []
  if (form.level === 2) {
    return mockCategories.value.map(c => ({ code: c.code, name: c.name }))
  }
  // 小类 - 获取所有中类
  const options = []
  mockCategories.value.forEach(big => {
    if (big.children) {
      big.children.forEach(mid => {
        options.push({ code: mid.code, name: `${big.name} > ${mid.name}` })
      })
    }
  })
  return options
})

// 方法
const getParentName = (parentCode) => {
  if (!parentCode) return '-'
  const findName = (categories) => {
    for (const cat of categories) {
      if (cat.code === parentCode) return cat.name
      if (cat.children) {
        const found = findName(cat.children)
        if (found) return found
      }
    }
    return null
  }
  return findName(mockCategories.value) || '-'
}

const updateSearchField = (field, value) => {
  (searchForm)[field] = value
  currentPage.value = 1
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  searchForm.code = ''
  searchForm.name = ''
  searchForm.parentCode = ''
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

const handleLevelChange = () => {
  form.parentCode = ''
  if (form.level === 1) {
    form.prefix = form.code
  } else if (form.level === 2) {
    form.prefix = form.parentCode
  }
}

const handleAddCategory = () => {
  isEdit.value = false
  resetForm()
  showFormModal.value = true
}

const handleView = (row) => {
  selectedCategory.value = row
  showDetailModal.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  showFormModal.value = true
}

const handleDelete = (row) => {
  selectedRows.value = [row]
  showDeleteConfirm.value = true
}

const handleBatchEdit = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要编辑的类别')
    return
  }
  ElMessage.info('批量编辑功能开发中')
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的类别')
    return
  }
  showDeleteConfirm.value = true
}

const handleDoDelete = () => {
  const ids = selectedRows.value.map(r => r.id)
  // 实际删除逻辑 - 这里简化处理
  ElMessage.success(`删除了 ${ids.length} 个类别`)
  showDeleteConfirm.value = false
  selectedRows.value = []
}

const handleExport = () => {
  showExportModal.value = true
}

const handleDoExport = () => {
  const dataToExport = selectedRows.value.length > 0
    ? selectedRows.value
    : filteredCategories.value

  const headers = ['类别编码', '类别名称', '层级', '上级类别', '编码前缀', '排序', '状态', '描述']
  const exportData = dataToExport.map(c => ({
    '类别编码': c.code,
    '类别名称': c.name,
    '层级': c.level === 1 ? '大类' : c.level === 2 ? '中类' : '小类',
    '上级类别': getParentName(c.parentCode),
    '编码前缀': c.prefix,
    '排序': c.sortOrder,
    '状态': c.status === 'active' ? '启用' : '停用',
    '描述': c.description || ''
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
  link.download = `物料类别_${new Date().toISOString().slice(0, 10)}.${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  showExportModal.value = false
  ElMessage.success('导出成功')
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        // 编辑模式
        ElMessage.success('编辑成功')
      } else {
        // 新增模式
        ElMessage.success('新增成功')
      }
      showFormModal.value = false
    }
  })
}

const resetForm = () => {
  form.id = 0
  form.code = ''
  form.name = ''
  form.level = 1
  form.parentCode = ''
  form.prefix = ''
  form.sortOrder = 0
  form.status = 'active'
  form.description = ''
}
</script>

<style scoped>
/* 蓝色渐变表头 - 与V1.1保持一致 */
:deep(.el-table__header-wrapper .el-table__header th) {
  background: linear-gradient(to right, #3b82f6, #2563eb) !important;
  color: #fff !important;
  font-weight: 600 !important;
}
:deep(.el-table__header-wrapper .el-table__header th .cell) {
  color: #fff !important;
}
/* 蓝色悬停行 */
:deep(.el-table__body-wrapper .el-table__body tr:hover > td) {
  background-color: #dbeafe !important;
}
</style>
