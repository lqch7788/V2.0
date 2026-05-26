<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <!-- 返回系统设置按钮 -->
          <a
            href="/settings"
            class="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hover:from-gray-200 hover:to-gray-300 transition-colors"
            title="返回系统设置"
          >
            <el-icon :size="20" color="#525252">
              <ArrowLeft />
            </el-icon>
          </a>
          <!-- 页面图标 -->
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white">
              <Tools />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">系统管理</h1>
            <p class="text-gray-500">设备系统类型定义和IDC数据中心关联配置</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">系统总数</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.total }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-green-600">使用中</p>
        <p class="text-2xl font-bold text-green-600 mt-1">{{ stats.active }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-400">已停用</p>
        <p class="text-2xl font-bold text-gray-400 mt-1">{{ stats.inactive }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-blue-600">已关联IDC</p>
        <p class="text-2xl font-bold text-blue-600 mt-1">{{ stats.withIdc }}</p>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-end gap-4">
        <div class="grid grid-cols-3 gap-4 flex-1">
          <div>
            <label class="block text-xs text-gray-500 mb-1">关键词搜索</label>
            <el-input
              v-model="keyword"
              placeholder="搜索编码、名称或描述..."
              clearable
              @clear="handleReset"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">状态</label>
            <el-select v-model="filterStatus" placeholder="全部" clearable class="w-full">
              <el-option label="全部" value="" />
              <el-option label="使用中" value="active" />
              <el-option label="已停用" value="inactive" />
            </el-select>
          </div>
          <div class="flex items-end">
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格卡片 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">
          系统列表 <span v-if="filteredData.length > 0" class="text-sm text-gray-400 font-normal">({{ filteredData.length }})</span>
        </h3>
        <el-button type="primary" @click="openAddModal">
          <el-icon><Plus /></el-icon> 新增系统
        </el-button>
      </div>

      <!-- 表格 -->
      <el-table :data="filteredData" stripe v-loading="isLoading" style="width: 100%">
        <el-table-column prop="systemCode" label="系统编码" width="160">
          <template #default="{ row }">
            <span class="inline-flex px-2 py-0.5 rounded text-xs font-mono font-medium bg-blue-100 text-blue-700">
              {{ row.systemCode }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="systemName" label="系统名称" min-width="150" />
        <el-table-column prop="idcUrl" label="IDC 地址" min-width="200">
          <template #default="{ row }">
            <a v-if="row.idcUrl" :href="row.idcUrl" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline text-xs font-mono">
              {{ row.idcUrl }}
            </a>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="idcToken" label="IDC Token" width="150">
          <template #default="{ row }">
            <span class="text-gray-400 text-xs font-mono">
              {{ row.idcToken ? '••••••••' : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="250">
          <template #default="{ row }">
            <span class="text-gray-500 text-xs truncate block max-w-[250px]">
              {{ row.description || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span
              :class="[
                'inline-flex px-2 py-0.5 rounded text-xs font-medium',
                row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              ]"
            >
              {{ row.status === 'active' ? '使用中' : '已停用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template #default="{ row }">
            <span class="text-gray-500 text-xs">
              {{ formatDateTime(row.updatedAt) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-button
                link
                size="small"
                @click="openEditModal(row)"
                class="p-1 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="编辑"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button
                link
                type="danger"
                size="small"
                @click="openDeleteConfirm(row)"
                class="p-1 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="删除"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
        <!-- 空状态 -->
        <template #empty>
          <div class="py-12 text-center text-gray-400">
            {{ items.length === 0 ? '暂无系统数据，点击"新增系统"开始创建' : '无匹配结果' }}
          </div>
        </template>
      </el-table>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <div class="space-y-4">
        <!-- 基本信息系统 -->
        <div class="bg-emerald-50 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-emerald-700 mb-3">系统信息</h4>
          <el-form :model="form" label-position="top" class="grid grid-cols-2 gap-4">
            <el-form-item label="系统编码" required>
              <el-input
                v-model="form.systemCode"
                placeholder="如：SYS001"
                class="font-mono"
              />
            </el-form-item>
            <el-form-item label="系统名称" required>
              <el-input
                v-model="form.systemName"
                placeholder="如：环境监控系统"
              />
            </el-form-item>
          </el-form>
        </div>

        <!-- IDC 关联配置 -->
        <div class="rounded-lg p-4 border border-gray-100">
          <h4 class="text-sm font-semibold text-gray-700 mb-3">IDC 数据中心关联</h4>
          <el-form :model="form" label-position="top">
            <el-form-item label="IDC 地址">
              <el-input
                v-model="form.idcUrl"
                placeholder="如：https://idc.example.com/api"
                class="font-mono"
              />
            </el-form-item>
            <el-form-item label="IDC Token">
              <el-input
                v-model="form.idcToken"
                placeholder="认证令牌"
                class="font-mono"
              />
            </el-form-item>
            <el-form-item label="描述备注">
              <el-input
                v-model="form.description"
                placeholder="系统描述信息"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleSubmit"
            :disabled="!form.systemCode.trim() || !form.systemName.trim()"
          >
            提交
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="400px"
      @close="handleDeleteClose"
    >
      <div v-if="selectedItem">
        <p class="text-sm text-gray-500">
          确定要删除系统 "<span class="font-medium text-gray-700">{{ selectedItem.systemName }}</span>" ({{ selectedItem.systemCode }}) 吗？
        </p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="handleDelete">确认删除</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useDeviceSystemStore } from '@/stores'
import { ArrowLeft, Tools, Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// ========== Store ==========
const deviceSystemStore = useDeviceSystemStore()

// ========== 状态 ==========
const keyword = ref('')
const filterStatus = ref('')
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const isEdit = ref(false)
const selectedItem = ref(null)

// 表单数据
const form = reactive({
  systemCode: '',
  systemName: '',
  idcUrl: '',
  idcToken: '',
  description: ''
})

// ========== 计算属性 ==========
const items = computed(() => deviceSystemStore.items)
const isLoading = computed(() => deviceSystemStore.isLoading)
const stats = computed(() => deviceSystemStore.stats)

// 筛选后的数据
const filteredData = computed(() => {
  let filtered = items.value

  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.systemCode.toLowerCase().includes(kw) ||
      item.systemName.toLowerCase().includes(kw) ||
      (item.idcUrl || '').toLowerCase().includes(kw) ||
      (item.description || '').toLowerCase().includes(kw)
    )
  }

  if (filterStatus.value) {
    filtered = filtered.filter(item => item.status === filterStatus.value)
  }

  return filtered
})

// 格式化日期时间（与V1.1 toLocaleString('zh-CN')保持一致）
const formatDateTime = (val) => {
  if (!val) return '-'
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return val
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch { return val }
}

// 弹窗标题
const dialogTitle = computed(() => isEdit.value ? '编辑系统' : '新增系统')

// ========== 生命周期 ==========
onMounted(() => {
  fetchItems()
})

// ========== 方法 ==========
// 获取数据
const fetchItems = () => {
  deviceSystemStore.fetchItems()
}

// 重置筛选
const handleReset = () => {
  keyword.value = ''
  filterStatus.value = ''
}

// 打开新增弹窗
const openAddModal = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 打开编辑弹窗
const openEditModal = (item) => {
  isEdit.value = true
  selectedItem.value = item
  form.systemCode = item.systemCode
  form.systemName = item.systemName
  form.idcUrl = item.idcUrl || ''
  form.idcToken = item.idcToken || ''
  form.description = item.description || ''
  dialogVisible.value = true
}

// 打开删除确认弹窗
const openDeleteConfirm = (item) => {
  selectedItem.value = item
  deleteDialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  form.systemCode = ''
  form.systemName = ''
  form.idcUrl = ''
  form.idcToken = ''
  form.description = ''
}

// 弹窗关闭
const handleDialogClose = () => {
  if (!isEdit.value) {
    resetForm()
  }
}

// 删除弹窗关闭
const handleDeleteClose = () => {
  selectedItem.value = null
}

// 提交表单
const handleSubmit = async () => {
  if (!form.systemCode.trim() || !form.systemName.trim()) {
    ElMessage.warning('请填写必填项')
    return
  }

  const data = {
    systemCode: form.systemCode.trim(),
    systemName: form.systemName.trim(),
    idcUrl: form.idcUrl.trim() || null,
    idcToken: form.idcToken.trim() || null,
    description: form.description.trim() || null
  }

  if (isEdit.value && selectedItem.value) {
    // 编辑
    await deviceSystemStore.updateItem(selectedItem.value.oid, data)
  } else {
    // 新增
    const result = await deviceSystemStore.createItem(data)
    if (result) {
    }
  }

  dialogVisible.value = false
  resetForm()
}

// 删除确认
const handleDelete = async () => {
  if (!selectedItem.value) return

  const success = await deviceSystemStore.deleteItem(selectedItem.value.oid)
  if (success) {
  }

  deleteDialogVisible.value = false
  selectedItem.value = null
}
</script>

<style scoped>
/* 弹窗头部渐变 - 与V1.1保持一致: 3-stop emerald渐变 */
:deep(.el-dialog__header) {
  background: linear-gradient(to right, #10b981, #059669, #10b981);
  border-radius: 8px 8px 0 0;
  margin: 0;
  padding: 16px 20px;
}
:deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
}
:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
}
:deep(.el-dialog__body) {
  padding: 20px;
}

/* 表格头部渐变 - 与V1.1保持一致 */
:deep(.el-table th) {
  background: linear-gradient(to right, #10b981, #059669) !important;
  color: white !important;
  font-weight: 500;
}

/* 主按钮改为emerald绿色 - 与V1.1 bg-emerald-600 保持一致 */
:deep(.el-button--primary) {
  --el-button-bg-color: #059669;
  --el-button-border-color: #059669;
  --el-button-hover-bg-color: #047857;
  --el-button-hover-border-color: #047857;
}
</style>
