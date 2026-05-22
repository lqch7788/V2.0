<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">权限配置</h2>
    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <span>权限列表</span>
          <el-button type="primary" @click="openFormModal">添加权限</el-button>
        </div>
      </template>
      <!-- 筛选栏 -->
      <div class="mb-4 flex flex-col sm:flex-row gap-4">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索权限名称、编码..."
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
          <el-option label="菜单权限" value="menu" />
          <el-option label="按钮权限" value="button" />
          <el-option label="数据权限" value="data" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      <!-- 数据表格 -->
      <el-table :data="paginatedData" stripe>
        <el-table-column prop="name" label="权限名称" min-width="150" />
        <el-table-column prop="code" label="权限编码" min-width="150" />
        <el-table-column prop="type" label="权限类型" min-width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
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
    <el-dialog v-model="detailDialogVisible" title="权限详情" width="500px">
      <div v-if="currentRecord" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="权限名称">{{ currentRecord.name }}</el-descriptions-item>
          <el-descriptions-item label="权限编码">{{ currentRecord.code }}</el-descriptions-item>
          <el-descriptions-item label="权限类型">
            <el-tag :type="getTypeTagType(currentRecord.type)" size="small">
              {{ getTypeLabel(currentRecord.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentRecord.status === 'active' ? 'success' : 'info'" size="small">
              {{ currentRecord.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ currentRecord.description }}</el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{ currentRecord.createTime }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑权限' : '新增权限'" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="权限编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入权限编码" />
        </el-form-item>
        <el-form-item label="权限类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择权限类型">
            <el-option label="菜单权限" value="menu" />
            <el-option label="按钮权限" value="button" />
            <el-option label="数据权限" value="data" />
          </el-select>
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
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 权限Mock数据
const mockPermissions = [
  { id: 1, name: '用户管理', code: 'system:user', type: 'menu', description: '系统用户管理权限', status: 'active', createTime: '2024-01-01 10:00:00' },
  { id: 2, name: '角色管理', code: 'system:role', type: 'menu', description: '系统角色管理权限', status: 'active', createTime: '2024-01-01 10:00:00' },
  { id: 3, name: '权限配置', code: 'system:permission', type: 'menu', description: '系统权限配置权限', status: 'active', createTime: '2024-01-01 10:00:00' },
  { id: 4, name: '新增用户', code: 'system:user:add', type: 'button', description: '新增用户按钮权限', status: 'active', createTime: '2024-01-01 10:00:00' },
  { id: 5, name: '编辑用户', code: 'system:user:edit', type: 'button', description: '编辑用户按钮权限', status: 'active', createTime: '2024-01-01 10:00:00' },
  { id: 6, name: '删除用户', code: 'system:user:delete', type: 'button', description: '删除用户按钮权限', status: 'inactive', createTime: '2024-01-01 10:00:00' },
  { id: 7, name: '数据查看', code: 'farm:data:view', type: 'data', description: '农场数据查看权限', status: 'active', createTime: '2024-01-15 14:30:00' },
  { id: 8, name: '数据编辑', code: 'farm:data:edit', type: 'data', description: '农场数据编辑权限', status: 'active', createTime: '2024-01-15 14:30:00' }
]

// 权限类型映射
const typeMap = {
  menu: { label: '菜单权限', type: 'primary' },
  button: { label: '按钮权限', type: 'warning' },
  data: { label: '数据权限', type: 'success' }
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
  code: '',
  type: 'menu',
  description: '',
  status: 'active',
  createTime: ''
})

const formRules = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入权限编码', trigger: 'blur' }],
  type: [{ required: true, message: '请选择权限类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 模拟数据
const allData = ref([...mockPermissions])

// 筛选后的数据
const filteredData = computed(() => {
  return allData.value.filter(record => {
    if (filters.keyword && !record.name.includes(filters.keyword) && !record.code.includes(filters.keyword)) return false
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
    code: '',
    type: 'menu',
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
