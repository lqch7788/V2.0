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
          <button :class="btnDefault" @click="handleSearch">
            <Search class="w-4 h-4" />
            搜索
          </button>
          <button :class="btnSecondary" @click="handleReset">
            <RotateCcw class="w-4 h-4" />
            重置
          </button>
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
          <!-- 删除模式（与订单管理 Order.vue L41-47 1:1 对齐） -->
          <template v-if="deleteMode">
            <button :class="btnDestructive" @click="handleConfirmDelete">
              <Delete class="w-4 h-4" />
              确认删除{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
            </button>
            <button :class="btnSecondary" @click="deleteMode = false">取消</button>
          </template>
          <!-- 导出模式（与订单管理 Order.vue L49-57 1:1 对齐） -->
          <template v-else-if="exportMode">
            <button :class="btnDefault" @click="handleExportConfirm">
              <Download class="w-4 h-4" />
              确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
            </button>
            <button :class="btnSecondary" @click="handleExportCancel">取消</button>
          </template>
          <!-- 正常模式（与订单管理 Order.vue L59-83 1:1 对齐） -->
          <template v-else>
            <button :class="btnDefault" @click="handleAdd">
              <Plus class="w-4 h-4" />
              新增
            </button>
            <button :class="btnDefault" @click="handleExportClick">
              <Download class="w-4 h-4" />
              导出
            </button>
            <button :class="btnDestructive" @click="deleteMode = true">
              <Delete class="w-4 h-4" />
              删除
            </button>
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
                  <!-- 表格操作列：与订单管理 OrderTable.vue 1:1 对齐（btnGhost + 文字色 + hover 态） -->
                  <button
                    :class="btnGhost + ' text-blue-600 hover:text-blue-800 p-1'"
                    title="编辑"
                    @click="handleEdit(customer)"
                  >
                    <Edit class="w-4 h-4" />
                  </button>
                  <button
                    :class="btnGhost + ' text-red-600 hover:text-red-800 p-1'"
                    title="删除"
                    @click="handleDeleteOne(customer)"
                  >
                    <Delete class="w-4 h-4" />
                  </button>
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

    <!-- 新增/编辑弹窗（与订单管理 AddModal 风格一致：1080×650） -->
    <CustomerModal
      :is-open="modalVisible"
      :customer="editCustomer"
      @close="handleCloseModal"
      @success="handleModalSuccess"
    />

    <!-- 删除警告弹窗（与订单管理一致：DeleteWarningModal 560×450，单条/批量共用） -->
    <DeleteWarningModal
      v-model:is-open="deleteWarningOpen"
      :selected-count="deleteTargetCount"
      :title="deleteTargetTitle"
      :description="deleteTargetDescription"
      @close="handleDeleteWarningClose"
      @confirm="handleDeleteWarningConfirm"
    />

    <!-- 导出格式选择弹窗（与订单管理一致：500×400） -->
    <ExportFormatModal
      :visible="showExportModal"
      :export-file-type="exportFormat"
      :selected-count="selectedRows.length"
      @close="showExportModal = false"
      @confirm="handleDoExport"
      @update:export-file-type="(v) => (exportFormat = v)"
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
import { ElMessage } from 'element-plus'
import { showSuccess } from '@/lib/dialogService'
import { useCustomerStore } from '@/stores/modules/customer'
// ✅ 修复: 与订单管理 Order.vue 1:1 对齐，按键样式统一使用生产模块共享常量
import { btnDefault, btnSecondary, btnDestructive, btnBlue, btnGhost } from '@/views/production/constants/buttonStyles'
import CustomerModal from '@/views/crop/modals/CustomerModal.vue'
// ✅ 修复: 与订单管理一致，统一弹窗组件
import DeleteWarningModal from '@/components/common/DeleteWarningModal.vue'
import ExportFormatModal from '@/components/common/ExportFormatModal.vue'

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

// 导出格式（与订单管理一致：excel / csv / word）
const exportFormat = ref('excel')
const showExportModal = ref(false)

// 删除警告弹窗状态（与订单管理 DeleteWarningModal 4 字段一致）
const deleteWarningOpen = ref(false)
const deleteTargetCount = ref(0)
const deleteTargetTitle = ref('删除客户警告')
const deleteTargetDescription = ref('')
const deleteTargetIds = ref([])  // 单条/批量共用，存储待删的 id 列表
const singleDeleteMode = ref(false)  // 区分单条/批量（影响 title/description 文案）

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

// ========== 删除（统一用 DeleteWarningModal，与订单管理一致）==========

// 单条删除 - 改为先弹 DeleteWarningModal
const handleDeleteOne = (customer) => {
  deleteTargetIds.value = [customer.id]
  deleteTargetCount.value = 1
  singleDeleteMode.value = true
  deleteTargetTitle.value = '删除客户警告'
  deleteTargetDescription.value = `确定要删除客户 <strong>${customer.customerName}</strong> 吗？此操作 <span style="color:#dc2626">无法恢复</span>，删除后数据将永久丢失。`
  deleteWarningOpen.value = true
}

// 批量删除 - 显示 DeleteWarningModal
const handleConfirmDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的数据')
    return
  }
  deleteTargetIds.value = [...selectedRows.value]
  deleteTargetCount.value = selectedRows.value.length
  singleDeleteMode.value = false
  deleteTargetTitle.value = '批量删除客户警告'
  deleteTargetDescription.value = `确定要删除选中的 <strong>${selectedRows.value.length}</strong> 条客户记录吗？此操作 <span style="color:#dc2626">无法恢复</span>，删除后数据将永久丢失。`
  deleteWarningOpen.value = true
}

// 删除警告弹窗关闭
const handleDeleteWarningClose = () => {
  deleteWarningOpen.value = false
  deleteTargetIds.value = []
  singleDeleteMode.value = false
}

// 删除警告弹窗确认执行
const handleDeleteWarningConfirm = async () => {
  const ids = [...deleteTargetIds.value]
  const isBatch = ids.length > 1
  deleteWarningOpen.value = false
  deleteTargetIds.value = []
  singleDeleteMode.value = false
  try {
    if (isBatch) {
      // 批量删除：逐条调用
      for (const id of ids) {
        await customerStore.deleteCustomer(id)
      }
      selectedRows.value = []
      deleteMode.value = false
      showSuccess(`已删除 ${ids.length} 个客户`)
    } else {
      await customerStore.deleteCustomer(ids[0])
      showSuccess('删除成功')
    }
  } catch (error) {
    console.error('删除客户失败:', error)
    ElMessage.error(error?.message || '删除失败，请重试')
  } finally {
    // 删除后重新拉取，确保列表与后端一致
    await customerStore.fetchCustomers()
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

// ========== 导出（统一用 ExportFormatModal 弹窗，与订单管理一致）==========

// 点击"导出"按钮：进入导出模式（不默认勾选）
const handleExportClick = () => {
  exportMode.value = true
  selectedRows.value = []
}

// 点击"确认导出"：弹出 ExportFormatModal 选格式
const handleExportConfirm = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

// 取消导出（清选择 + 退模式）
const handleExportCancel = () => {
  exportMode.value = false
  selectedRows.value = []
}

// 实际执行导出（3 格式：Excel/CSV/Word，与订单管理 handleDoExport 1:1 对齐）
const handleDoExport = () => {
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

  const fileNameBase = `客户管理_${new Date().toISOString().slice(0, 10)}`
  const content = ''
  const mimeType = ''
  const extension = ''

  // RFC4180 CSV 转义
  const csvEscape = (v) => {
    const s = v === null || v === undefined ? '' : String(v)
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }

  if (exportFormat.value === 'csv') {
    const lines = [
      headers.join(','),
      ...exportData.map(row => headers.map(h => csvEscape(row[h])).join(',')),
    ]
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    downloadBlob(blob, `${fileNameBase}.csv`)
  } else if (exportFormat.value === 'excel') {
    // 用 xlsx 库生成 .xlsx（与订单管理 1:1 对齐）
    import('xlsx').then((XLSX) => {
      const wsData = [
        headers,
        ...exportData.map(row => headers.map(h => row[h] ?? '')),
      ]
      const ws = XLSX.utils.aoa_to_sheet(wsData)
      ws['!cols'] = headers.map(h => ({ wch: Math.max(12, h.length * 2) }))
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '客户管理')
      XLSX.writeFile(wb, `${fileNameBase}.xlsx`)
    })
  } else if (exportFormat.value === 'word') {
    const escapeHtml = (s) => String(s ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${escapeHtml(row[h])}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    const blob = new Blob([html], { type: 'application/vnd.ms-word;charset=utf-8' })
    downloadBlob(blob, `${fileNameBase}.doc`)
  }

  // 关闭弹窗 + 清状态（与订单管理一致）
  showExportModal.value = false
  exportMode.value = false
  selectedRows.value = []
  showSuccess('导出成功')
}

// 通用下载（与订单管理 1:1 对齐）
const downloadBlob = (blob, fileName) => {
  if (window.showSaveFilePicker) {
    window.showSaveFilePicker({
      suggestedName: fileName,
      types: [{ description: fileName.split('.').pop()?.toUpperCase() || 'File', accept: { [blob.type]: [`.${fileName.split('.').pop()}`] } }],
    }).then(handle => handle.createWritable()).then(writable => {
      writable.write(blob)
      writable.close()
    }).catch(() => {
      // 用户取消或不支持，回退
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    })
  } else {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }
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
