<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
          <el-icon :size="20" color="white">
            <Shop />
          </el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">供应商编码规则</h1>
          <p class="text-xs text-gray-500">供应商编码规则配置</p>
        </div>
      </div>
    </div>

    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <span>供应商编码规则列表</span>
          <el-button type="primary" @click="openFormModal">添加规则</el-button>
        </div>
      </template>
      <!-- 筛选栏 -->
      <div class="mb-4 flex flex-col sm:flex-row gap-4">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索规则名称..."
          clearable
          @clear="handleSearch"
          class="w-full sm:w-64"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filters.supplierType" placeholder="全部供应商类型" clearable class="w-full sm:w-44">
          <el-option label="全部供应商类型" value="" />
          <el-option label="种子供应商" value="seed" />
          <el-option label="肥料供应商" value="fertilizer" />
          <el-option label="农药供应商" value="pesticide" />
          <el-option label="设备供应商" value="equipment" />
          <el-option label="包装供应商" value="packaging" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      <!-- 数据表格 -->
      <el-table :data="paginatedData" stripe>
        <el-table-column prop="name" label="规则名称" min-width="150" />
        <el-table-column prop="supplierType" label="供应商类型" min-width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.supplierType)" size="small">
              {{ getTypeLabel(row.supplierType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="prefix" label="编码前缀" min-width="100" />
        <el-table-column prop="serialLength" label="序号位数" min-width="100" />
        <el-table-column prop="regionCode" label="地区码" min-width="100" />
        <el-table-column prop="example" label="示例" min-width="150" />
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
    <el-dialog v-model="detailDialogVisible" title="供应商编码规则详情" width="600px">
      <div v-if="currentRecord" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="规则名称">{{ currentRecord.name }}</el-descriptions-item>
          <el-descriptions-item label="供应商类型">
            <el-tag :type="getTypeTagType(currentRecord.supplierType)" size="small">
              {{ getTypeLabel(currentRecord.supplierType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="编码前缀">{{ currentRecord.prefix }}</el-descriptions-item>
          <el-descriptions-item label="序号位数">{{ currentRecord.serialLength }}</el-descriptions-item>
          <el-descriptions-item label="地区码">{{ currentRecord.regionCode || '无' }}</el-descriptions-item>
          <el-descriptions-item label="年份码">{{ currentRecord.yearCode ? '是' : '否' }}</el-descriptions-item>
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
        <el-form-item label="供应商类型" prop="supplierType">
          <el-select v-model="formData.supplierType" placeholder="请选择供应商类型">
            <el-option label="种子供应商" value="seed" />
            <el-option label="肥料供应商" value="fertilizer" />
            <el-option label="农药供应商" value="pesticide" />
            <el-option label="设备供应商" value="equipment" />
            <el-option label="包装供应商" value="packaging" />
            <el-option label="通用" value="general" />
          </el-select>
        </el-form-item>
        <el-form-item label="编码前缀" prop="prefix">
          <el-input v-model="formData.prefix" placeholder="请输入编码前缀，如：ZZ" />
        </el-form-item>
        <el-form-item label="序号位数" prop="serialLength">
          <el-input-number v-model="formData.serialLength" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="地区码" prop="regionCode">
          <el-input v-model="formData.regionCode" placeholder="请输入地区码，如：BJ" />
        </el-form-item>
        <el-form-item label="年份码" prop="yearCode">
          <el-switch v-model="formData.yearCode" />
        </el-form-item>
        <el-form-item label="示例" prop="example">
          <el-input v-model="formData.example" placeholder="如：ZZ-BJ-240001" />
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
import { Shop, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 供应商类型映射
const supplierTypeMap = {
  seed: { label: '种子供应商', type: 'success' },
  fertilizer: { label: '肥料供应商', type: 'warning' },
  pesticide: { label: '农药供应商', type: 'danger' },
  equipment: { label: '设备供应商', type: 'primary' },
  packaging: { label: '包装供应商', type: 'info' },
  general: { label: '通用', type: '' }
}

const getTypeLabel = (type) => supplierTypeMap[type]?.label || type
const getTypeTagType = (type) => supplierTypeMap[type]?.type || 'info'

// 供应商编码规则Mock数据
const mockSupplierCodeRules = [
  { id: 1, name: '种子供应商编码', supplierType: 'seed', prefix: 'ZZ', serialLength: 4, regionCode: 'BJ', yearCode: true, example: 'ZZ-BJ-240001', description: '种子供应商唯一编码规则', status: 'active', createTime: '2024-01-01 10:00:00' },
  { id: 2, name: '肥料供应商编码', supplierType: 'fertilizer', prefix: 'FL', serialLength: 4, regionCode: 'BJ', yearCode: true, example: 'FL-BJ-240001', description: '肥料供应商唯一编码规则', status: 'active', createTime: '2024-01-01 10:00:00' },
  { id: 3, name: '农药供应商编码', supplierType: 'pesticide', prefix: 'NY', serialLength: 4, regionCode: 'BJ', yearCode: true, example: 'NY-BJ-240001', description: '农药供应商唯一编码规则', status: 'active', createTime: '2024-01-15 14:30:00' },
  { id: 4, name: '设备供应商编码', supplierType: 'equipment', prefix: 'SB', serialLength: 4, regionCode: 'BJ', yearCode: true, example: 'SB-BJ-240001', description: '设备供应商唯一编码规则', status: 'active', createTime: '2024-02-01 09:00:00' },
  { id: 5, name: '包装供应商编码', supplierType: 'packaging', prefix: 'BZ', serialLength: 4, regionCode: 'BJ', yearCode: true, example: 'BZ-BJ-240001', description: '包装供应商唯一编码规则', status: 'active', createTime: '2024-03-01 11:00:00' },
  { id: 6, name: '通用供应商编码', supplierType: 'general', prefix: 'GYS', serialLength: 4, regionCode: '', yearCode: false, example: 'GYS0001', description: '通用供应商编码规则', status: 'inactive', createTime: '2024-04-01 08:00:00' }
]

// 筛选条件
const filters = reactive({
  keyword: '',
  supplierType: ''
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
  supplierType: 'general',
  prefix: '',
  serialLength: 4,
  regionCode: '',
  yearCode: false,
  example: '',
  description: '',
  status: 'active',
  createTime: ''
})

const formRules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  supplierType: [{ required: true, message: '请选择供应商类型', trigger: 'change' }],
  prefix: [{ required: true, message: '请输入编码前缀', trigger: 'blur' }],
  serialLength: [{ required: true, message: '请输入序号长度', trigger: 'blur' }]
}

// 模拟数据
const allData = ref([...mockSupplierCodeRules])

// 筛选后的数据
const filteredData = computed(() => {
  return allData.value.filter(record => {
    if (filters.keyword && !record.name.includes(filters.keyword)) return false
    if (filters.supplierType && record.supplierType !== filters.supplierType) return false
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
  filters.supplierType = ''
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
    supplierType: 'general',
    prefix: '',
    serialLength: 4,
    regionCode: '',
    yearCode: false,
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
