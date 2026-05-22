<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <el-icon :size="20" color="white">
            <Coin />
          </el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">编码规则</h1>
          <p class="text-xs text-gray-500">系统编码规则配置</p>
        </div>
      </div>
    </div>

    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <span>编码规则列表</span>
          <el-button type="primary" @click="openFormModal">添加规则</el-button>
        </div>
      </template>
      <!-- 筛选栏 -->
      <div class="mb-4 flex flex-col sm:flex-row gap-4">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索规则名称、编码..."
          clearable
          @clear="handleSearch"
          class="w-full sm:w-64"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filters.type" placeholder="全部类型" clearable class="w-full sm:w-36">
          <el-option label="全部类型" value="" />
          <el-option label="产品编码" value="product" />
          <el-option label="供应商编码" value="supplier" />
          <el-option label="物料编码" value="material" />
          <el-option label="地块编码" value="block" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      <!-- 数据表格 -->
      <el-table :data="paginatedData" stripe>
        <el-table-column prop="name" label="规则名称" min-width="150" />
        <el-table-column prop="prefix" label="编码前缀" min-width="120" />
        <el-table-column prop="type" label="规则类型" min-width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="example" label="示例" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">详情</el-button>
            <el-button link type="primary" size="small" @click="editRecord(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="flex items-center justify-between p-4 border-t border-gray-100">
        <div class="text-sm text-gray-500">
          共 {{ filteredData.length }} 条记录
        </div>
        <el-pagination
          v-model:current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          :total="filteredData.length"
          layout="prev, pager, next"
          background
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="编码规则详情" width="600px">
      <div v-if="currentRecord" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="规则名称">{{ currentRecord.name }}</el-descriptions-item>
          <el-descriptions-item label="编码前缀">{{ currentRecord.prefix }}</el-descriptions-item>
          <el-descriptions-item label="规则类型">
            <el-tag :type="getTypeTagType(currentRecord.type)" size="small">
              {{ getTypeLabel(currentRecord.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="序号长度">{{ currentRecord.serialLength }}</el-descriptions-item>
          <el-descriptions-item label="示例" :span="2">{{ currentRecord.example }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ currentRecord.description }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentRecord.status === 'active' ? 'success' : 'info'" size="small">
              {{ currentRecord.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentRecord.createTime }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑规则' : '新增规则'" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="编码前缀" prop="prefix">
          <el-input v-model="formData.prefix" placeholder="请输入编码前缀，如：PRD" />
        </el-form-item>
        <el-form-item label="规则类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择规则类型">
            <el-option label="产品编码" value="product" />
            <el-option label="供应商编码" value="supplier" />
            <el-option label="物料编码" value="material" />
            <el-option label="地块编码" value="block" />
          </el-select>
        </el-form-item>
        <el-form-item label="序号长度" prop="serialLength">
          <el-input-number v-model="formData.serialLength" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="日期格式" prop="dateFormat">
          <el-select v-model="formData.dateFormat" placeholder="请选择日期格式">
            <el-option label="YYYYMMDD" value="YYYYMMDD" />
            <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
            <el-option label="YYYYMMDDHHmmss" value="YYYYMMDDHHmmss" />
            <el-option label="不使用日期" value="" />
          </el-select>
        </el-form-item>
        <el-form-item label="示例" prop="example">
          <el-input v-model="formData.example" placeholder="如：PRD2026052200001" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Coin, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 编码规则Mock数据
const mockCodeRules = [
  { id: 1, name: '产品编码规则', prefix: 'PRD', type: 'product', serialLength: 6, dateFormat: 'YYYYMMDD', example: 'PRD20260522000001', description: '产品唯一编码规则', status: 'active', createTime: '2024-01-01 10:00:00' },
  { id: 2, name: '供应商编码规则', prefix: 'SUP', type: 'supplier', serialLength: 4, dateFormat: '', example: 'SUP0001', description: '供应商唯一编码规则', status: 'active', createTime: '2024-01-01 10:00:00' },
  { id: 3, name: '物料编码规则', prefix: 'MAT', type: 'material', serialLength: 5, dateFormat: 'YYYYMMDD', example: 'MAT2026052200001', description: '物料唯一编码规则', status: 'active', createTime: '2024-01-15 14:30:00' },
  { id: 4, name: '地块编码规则', prefix: 'BLK', type: 'block', serialLength: 3, dateFormat: '', example: 'BLK001', description: '地块唯一编码规则', status: 'active', createTime: '2024-02-01 09:00:00' },
  { id: 5, name: '员工编码规则', prefix: 'EMP', type: 'employee', serialLength: 4, dateFormat: '', example: 'EMP0001', description: '员工唯一编码规则', status: 'inactive', createTime: '2024-03-01 11:00:00' }
]

// 规则类型映射
const typeMap = {
  product: { label: '产品编码', type: 'primary' },
  supplier: { label: '供应商编码', type: 'success' },
  material: { label: '物料编码', type: 'warning' },
  block: { label: '地块编码', type: 'info' },
  employee: { label: '员工编码', type: '' }
}

const getTypeLabel = (type) => typeMap[type]?.label || type
const getTypeTagType = (type) => typeMap[type]?.type || 'info'

// 筛选条件
const filters = reactive({
  keyword: '',
  type: ''
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

// 详情弹窗
const detailDialogVisible = ref(false)
const currentRecord = ref(null)

// 表单弹窗
const formDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const formData = reactive({
  id: null,
  name: '',
  prefix: '',
  type: 'product',
  serialLength: 6,
  dateFormat: 'YYYYMMDD',
  example: '',
  description: '',
  status: 'active',
  createTime: ''
})

const formRules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  prefix: [{ required: true, message: '请输入编码前缀', trigger: 'blur' }],
  type: [{ required: true, message: '请选择规则类型', trigger: 'change' }],
  serialLength: [{ required: true, message: '请输入序号长度', trigger: 'blur' }]
}

// 模拟数据
const allData = ref([...mockCodeRules])

// 筛选后的数据
const filteredData = computed(() => {
  return allData.value.filter(record => {
    if (filters.keyword && !record.name.includes(filters.keyword) && !record.prefix.includes(filters.keyword)) return false
    if (filters.type && record.type !== filters.type) return false
    return true
  })
})

// 分页数据
const paginatedData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
}

// 重置
const handleReset = () => {
  filters.keyword = ''
  filters.type = ''
  pagination.currentPage = 1
}

// 详情
const viewDetail = (row) => {
  currentRecord.value = row
  detailDialogVisible.value = true
}

// 编辑
const editRecord = (row) => {
  isEdit.value = true
  Object.assign(formData, row)
  formDialogVisible.value = true
}

// 新增
const openFormModal = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: null,
    name: '',
    prefix: '',
    type: 'product',
    serialLength: 6,
    dateFormat: 'YYYYMMDD',
    example: '',
    description: '',
    status: 'active',
    createTime: ''
  })
  formDialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        const index = allData.value.findIndex(r => r.id === formData.id)
        if (index !== -1) {
          allData.value[index] = { ...formData }
        }
        ElMessage.success('编辑成功')
      } else {
        allData.value.unshift({
          id: Date.now(),
          ...formData,
          createTime: new Date().toLocaleString()
        })
        ElMessage.success('新增成功')
      }
      formDialogVisible.value = false
    }
  })
}
</script>
