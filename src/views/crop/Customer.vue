<template>
  <div class="p-6 bg-[#F2F6FA] min-h-screen">
    <!-- 页面标题卡片 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <el-button size="small" @click="handleBack" class="mr-2">
            <ArrowLeft class="w-4 h-4" />
          </el-button>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <User class="text-white" :size="24" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">客户管理</h1>
            <p class="text-gray-500">管理客户档案信息</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <User class="text-white" :size="16" />
          </div>
          <div>
            <p class="text-xl font-bold text-gray-900">{{ statsData.total }}</p>
            <p class="text-xs text-gray-500">客户总数</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <CirclePlus class="text-white" :size="16" />
          </div>
          <div>
            <p class="text-xl font-bold text-gray-900">{{ statsData.thisMonth }}</p>
            <p class="text-xs text-gray-500">本月新增</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
            <Building2 class="text-white" :size="16" />
          </div>
          <div>
            <p class="text-xl font-bold text-gray-900">{{ statsData.total }}</p>
            <p class="text-xs text-gray-500">有效客户</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <Phone class="text-white" :size="16" />
          </div>
          <div>
            <p class="text-xl font-bold text-gray-900">0</p>
            <p class="text-xs text-gray-500">待跟进</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="bg-white rounded-xl p-4 border border-gray-100 mb-6">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <el-input
            v-model="search"
            placeholder="搜索客户名称、编码、联系人、电话..."
            clearable
            @keydown.enter="handleSearch"
          />
        </div>
        <div class="flex items-center gap-2">
          <el-button size="small" @click="handleSearch">
            <Search class="w-4 h-4" />
            搜索
          </el-button>
          <el-button size="small" @click="handleReset">
            <RotateCcw class="w-4 h-4" />
            重置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 操作按钮行 -->
    <div class="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-700">客户列表</span>
          <span class="text-xs text-gray-500">（共 {{ filteredData.length }} 条）</span>
        </div>
        <div class="flex items-center gap-2">
          <template v-if="deleteMode">
            <el-button type="primary" size="small" @click="handleConfirmDelete">
              确认删除{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
            </el-button>
            <el-button size="small" @click="deleteMode = false">取消</el-button>
          </template>
          <template v-else-if="exportMode">
            <el-button type="primary" size="small" @click="handleExportConfirm">
              确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
            </el-button>
            <el-button size="small" @click="handleExportCancel">取消</el-button>
          </template>
          <template v-else>
            <el-button type="primary" size="small" @click="handleAdd">
              <Plus class="w-4 h-4" />
              新增
            </el-button>
            <el-button size="small" @click="handleExportClick">
              <Download class="w-4 h-4" />
              导出
            </el-button>
            <el-button type="danger" size="small" @click="deleteMode = true">
              <Delete class="w-4 h-4" />
              删除
            </el-button>
          </template>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div v-loading="loading" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <tr>
              <th v-if="exportMode || deleteMode" class="px-4 py-3 text-left text-sm font-semibold w-12">
                <el-checkbox
                  :model-value="selectedRows.length === filteredData.length && filteredData.length > 0"
                  @change="handleSelectAll"
                />
              </th>
              <th class="px-4 py-3 text-left text-sm font-semibold">客户编码</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">客户名称</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">联系人</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">联系电话</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">收货地址</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">备注</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="paginatedData.length === 0">
              <td :colspan="exportMode || deleteMode ? 8 : 7" class="px-4 py-8 text-center text-gray-500">
                暂无数据
              </td>
            </tr>
            <tr
              v-for="customer in paginatedData"
              :key="customer.id"
              class="hover:bg-emerald-50 transition-colors"
            >
              <td v-if="exportMode || deleteMode" class="px-4 py-3">
                <el-checkbox
                  :model-value="selectedRows.includes(customer.id)"
                  @change="() => handleToggleSelect(customer.id)"
                />
              </td>
              <td class="px-4 py-3 text-sm font-mono">{{ customer.customerCode }}</td>
              <td class="px-4 py-3 text-sm font-medium">{{ customer.customerName }}</td>
              <td class="px-4 py-3 text-sm">{{ customer.contactPerson || '-' }}</td>
              <td class="px-4 py-3 text-sm">{{ customer.contactPhone || '-' }}</td>
              <td class="px-4 py-3 text-sm max-w-xs truncate">{{ customer.deliveryAddress || '-' }}</td>
              <td class="px-4 py-3 text-sm max-w-xs truncate">{{ customer.remarks || '-' }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <el-button link @click="handleEdit(customer)">
                    <Edit class="w-4 h-4" />
                  </el-button>
                  <el-button link type="danger" @click="handleDeleteOne(customer)">
                    <Delete class="w-4 h-4" />
                  </el-button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div class="text-sm text-gray-500">
          共 {{ filteredData.length }} 条记录
        </div>
        <div class="flex items-center gap-2">
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50]"
            :total="filteredData.length"
            layout="sizes, prev, pager, next"
            background
          />
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <CustomerModal
      :is-open="modalVisible"
      :customer="editCustomer"
      @close="handleCloseModal"
      @success="handleModalSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  User, Plus, Edit, Delete, Download, Search, RotateCcw,
  ArrowLeft, CirclePlus, Building2, Phone
} from 'lucide-vue-next'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCustomerStore } from '@/stores/modules/customer'
import CustomerModal from '@/views/crop/modals/CustomerModal.vue'

const router = useRouter()
const customerStore = useCustomerStore()

// 搜索
const search = ref('')

// 弹窗状态
const modalVisible = ref(false)
const editCustomer = ref(null)

// 分页
const pagination = ref({
  current: 1,
  pageSize: 10
})

// 选中行
const selectedRows = ref([])

// 模式状态
const exportMode = ref(false)
const deleteMode = ref(false)

// 加载状态
const loading = computed(() => customerStore.isLoading)

// 统计数据
const statsData = computed(() => {
  const total = customerStore.customers.length
  const thisMonth = customerStore.customers.filter(c => {
    if (!c.createTime) return false
    const createDate = new Date(c.createTime)
    const now = new Date()
    return createDate.getMonth() === now.getMonth() && createDate.getFullYear() === now.getFullYear()
  }).length
  return { total, thisMonth }
})

// 筛选数据
const filteredData = computed(() => {
  if (!search.value) return customerStore.customers
  const s = search.value.toLowerCase()
  return customerStore.customers.filter(c =>
    c.customerName?.toLowerCase().includes(s) ||
    c.customerCode?.toLowerCase().includes(s) ||
    c.contactPerson?.toLowerCase().includes(s) ||
    c.contactPhone?.toLowerCase().includes(s)
  )
})

// 分页数据
const paginatedData = computed(() => {
  const start = (pagination.value.current - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredData.value.slice(start, end)
})

// 返回
const handleBack = () => {
  router.push('/crop/order')
}

// 搜索
const handleSearch = () => {
  pagination.value.current = 1
}

// 重置
const handleReset = () => {
  search.value = ''
  pagination.value.current = 1
}

// 新增
const handleAdd = () => {
  editCustomer.value = null
  modalVisible.value = true
}

// 编辑
const handleEdit = (customer) => {
  editCustomer.value = customer
  modalVisible.value = true
}

// 关闭弹窗
const handleCloseModal = () => {
  modalVisible.value = false
  editCustomer.value = null
}

// 弹窗成功
const handleModalSuccess = () => {
  customerStore.fetchCustomers()
  handleCloseModal()
}

// 单条删除
const handleDeleteOne = async (customer) => {
  try {
    await ElMessageBox.confirm(`确定要删除客户 ${customer.customerName} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await customerStore.deleteCustomer(customer.id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

// 批量删除确认
const handleConfirmDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的数据')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条记录吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    for (const id of selectedRows.value) {
      await customerStore.deleteCustomer(id)
    }
    selectedRows.value = []
    deleteMode.value = false
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

// 全选
const handleSelectAll = () => {
  if (selectedRows.value.length === filteredData.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredData.value.map(c => c.id)
  }
}

// 切换选中
const handleToggleSelect = (id) => {
  const index = selectedRows.value.indexOf(id)
  if (index > -1) {
    selectedRows.value.splice(index, 1)
  } else {
    selectedRows.value.push(id)
  }
}

// 导出
const handleExportClick = () => {
  exportMode.value = true
  selectedRows.value = []
}

const handleExportCancel = () => {
  exportMode.value = false
  selectedRows.value = []
}

const handleExportConfirm = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  const selectedData = filteredData.value.filter(c => selectedRows.value.includes(c.id))
  const headers = ['客户编码', '客户名称', '联系人', '联系电话', '收货地址', '备注', '创建时间']
  const exportData = selectedData.map(c => ({
    '客户编码': c.customerCode,
    '客户名称': c.customerName,
    '联系人': c.contactPerson || '',
    '联系电话': c.contactPhone || '',
    '收货地址': c.deliveryAddress || '',
    '备注': c.remarks || '',
    '创建时间': c.createTime || ''
  }))

  let content = headers.join(',') + '\n' + exportData.map(row =>
    headers.map(h => `"${row[h] || ''}"`).join(',')
  ).join('\n')

  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `客户管理_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)

  exportMode.value = false
  selectedRows.value = []
  ElMessage.success('导出成功')
}

// 初始化
onMounted(() => {
  customerStore.fetchCustomers()
})
</script>

<style scoped>
:deep(.bg-gradient-to-r.from-blue-500.to-blue-600) {
  background: linear-gradient(to right, #3b82f6, #2563eb);
  color: white;
}
</style>
