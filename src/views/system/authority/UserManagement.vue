<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">用户管理</h2>
    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <span>用户列表</span>
          <el-button type="primary" @click="openFormModal">添加用户</el-button>
        </div>
      </template>
      <!-- 筛选栏 -->
      <div class="mb-4 flex flex-col sm:flex-row gap-4">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索用户名、姓名..."
          clearable
          @clear="handleSearch"
          class="w-full sm:w-64"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filters.role" placeholder="全部角色" clearable class="w-full sm:w-36">
          <el-option label="全部角色" value="" />
          <el-option label="管理员" value="admin" />
          <el-option label="普通用户" value="user" />
        </el-select>
        <el-select v-model="filters.status" placeholder="全部状态" clearable class="w-full sm:w-32">
          <el-option label="全部状态" value="" />
          <el-option label="启用" value="active" />
          <el-option label="禁用" value="inactive" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      <!-- 数据表格 -->
      <el-table :data="paginatedData" stripe>
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="role" label="角色" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'" size="small">
              {{ row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" min-width="120" />
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
    <el-dialog v-model="detailDialogVisible" title="用户详情" width="500px">
      <div v-if="currentRecord" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ currentRecord.username }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ currentRecord.name }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentRecord.email }}</el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag :type="currentRecord.role === 'admin' ? 'danger' : 'primary'" size="small">
              {{ currentRecord.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="部门">{{ currentRecord.department }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentRecord.status === 'active' ? 'success' : 'info'" size="small">
              {{ currentRecord.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="formData.department" placeholder="请输入部门" />
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
import { mockUsers } from '@/data'

// 筛选条件
const filters = reactive({
  keyword: '',
  role: '',
  status: ''
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
  username: '',
  name: '',
  email: '',
  role: 'user',
  department: '',
  status: 'active'
})

const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  department: [{ required: true, message: '请输入部门', trigger: 'blur' }]
}

// 模拟数据
const allData = ref([...mockUsers])

// 筛选后的数据
const filteredData = computed(() => {
  return allData.value.filter(record => {
    if (filters.keyword && !record.name.includes(filters.keyword) && !record.username.includes(filters.keyword)) return false
    if (filters.role && record.role !== filters.role) return false
    if (filters.status && record.status !== filters.status) return false
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
  filters.role = ''
  filters.status = ''
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
    username: '',
    name: '',
    email: '',
    role: 'user',
    department: '',
    status: 'active'
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
          ...formData
        })
        ElMessage.success('新增成功')
      }
      formDialogVisible.value = false
    }
  })
}
</script>
