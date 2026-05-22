<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <a
            href="/settings"
            class="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hover:from-gray-200 hover:to-gray-300 transition-colors"
            title="返回系统设置"
          >
            <el-icon :size="20" color="#4b5563">
              <ArrowLeft />
            </el-icon>
          </a>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white">
              <VideoCamera />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">视频管理</h1>
            <p class="text-gray-500">摄像头注册和RTSP/HTTP视频流地址配置</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">摄像头总数</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.total }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-green-600">运行中</p>
        <p class="text-2xl font-bold text-green-600 mt-1">{{ stats.active }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-blue-600">RTSP 已配置</p>
        <p class="text-2xl font-bold text-blue-600 mt-1">{{ stats.withRtsp }}</p>
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
              placeholder="搜索名称、编码或品牌..."
              clearable
              @clear="handleKeywordClear"
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
              <el-option label="运行中" value="active" />
              <el-option label="已停用" value="inactive" />
            </el-select>
          </div>
          <div class="flex items-end">
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">
          摄像头列表 <span v-if="filteredData.length > 0" class="text-sm text-gray-400 font-normal">({{ filteredData.length }})</span>
        </h3>
        <el-button type="primary" size="small" @click="openAddModal">
          <el-icon><Plus /></el-icon> 新增摄像头
        </el-button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <th class="py-3 px-4 text-left font-medium">摄像头名称</th>
              <th class="py-3 px-4 text-left font-medium w-32">编码</th>
              <th class="py-3 px-4 text-left font-medium">RTSP 地址</th>
              <th class="py-3 px-4 text-left font-medium">所属分区</th>
              <th class="py-3 px-4 text-left font-medium w-24">品牌/型号</th>
              <th class="py-3 px-4 text-left font-medium w-20">通道数</th>
              <th class="py-3 px-4 text-left font-medium w-20">状态</th>
              <th class="py-3 px-4 text-center font-medium w-24">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="8" class="py-12 text-center text-gray-400">加载中...</td>
            </tr>
            <tr v-else-if="filteredData.length === 0">
              <td colspan="8" class="py-12 text-center text-gray-400">
                {{ items.length === 0 ? '暂无摄像头数据' : '无匹配结果' }}
              </td>
            </tr>
            <tr
              v-for="item in filteredData"
              :key="item.oid"
              class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td class="py-2.5 px-4">
                <div class="flex items-center gap-2">
                  <el-icon :size="16" color="#9ca3af"><Monitor /></el-icon>
                  <span class="font-medium text-gray-900">{{ item.cameraName }}</span>
                </div>
              </td>
              <td class="py-2.5 px-4">
                <span class="text-xs font-mono text-gray-500">{{ item.cameraCode || '-' }}</span>
              </td>
              <td class="py-2.5 px-4 text-gray-500 text-xs font-mono max-w-[250px] truncate">
                {{ item.rtspUrl || '-' }}
              </td>
              <td class="py-2.5 px-4 text-gray-600">{{ item.partitionName || '-' }}</td>
              <td class="py-2.5 px-4 text-gray-500 text-xs">
                {{ item.brand ? `${item.brand}${item.model ? ` / ${item.model}` : ''}` : '-' }}
              </td>
              <td class="py-2.5 px-4 text-gray-500">{{ item.channelCount }}</td>
              <td class="py-2.5 px-4">
                <span
                  :class="[
                    'inline-flex px-2 py-0.5 rounded text-xs font-medium',
                    item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  ]"
                >
                  {{ item.status === 'active' ? '运行中' : '已停用' }}
                </span>
              </td>
              <td class="py-2.5 px-4">
                <div class="flex items-center justify-center gap-1">
                  <el-button
                    link
                    type="primary"
                    size="small"
                    @click="openEditModal(item)"
                    class="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="编辑"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button
                    link
                    type="danger"
                    size="small"
                    @click="openDeleteConfirm(item)"
                    class="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="删除"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="modalVisible"
      :title="isEditMode ? '编辑摄像头' : '新增摄像头'"
      width="640px"
      :close-on-click-modal="false"
      @close="closeModal"
    >
      <div class="space-y-4">
        <!-- 基本信息 -->
        <div class="bg-emerald-50 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-emerald-700 mb-3">基本信息</h4>
          <el-form :model="form" label-position="top" class="grid grid-cols-2 gap-4">
            <el-form-item label="摄像头名称" required>
              <el-input v-model="form.cameraName" placeholder="如：1号棚前置摄像头" />
            </el-form-item>
            <el-form-item label="编码">
              <el-input v-model="form.cameraCode" placeholder="如：CAM001" />
            </el-form-item>
            <el-form-item label="所属分区">
              <el-select v-model="form.partitionOid" placeholder="— 请选择 —" clearable class="w-full">
                <el-option
                  v-for="p in partitionOptions"
                  :key="p.oid"
                  :label="p.name"
                  :value="p.oid"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="通道数">
              <el-input-number v-model="form.channelCount" :min="1" :max="64" class="w-full" />
            </el-form-item>
          </el-form>
        </div>

        <!-- 视频流配置 -->
        <div class="rounded-lg p-4 border border-gray-100">
          <h4 class="text-sm font-semibold text-gray-700 mb-3">视频流配置</h4>
          <el-form :model="form" label-position="top">
            <el-form-item label="RTSP 地址">
              <el-input
                v-model="form.rtspUrl"
                placeholder="rtsp://192.168.1.100:554/stream1"
                style="font-family: monospace"
              />
            </el-form-item>
            <el-form-item label="HTTP 预览地址">
              <el-input
                v-model="form.httpUrl"
                placeholder="http://192.168.1.100:8080/snapshot"
                style="font-family: monospace"
              />
            </el-form-item>
          </el-form>
        </div>

        <!-- 设备信息 -->
        <div class="rounded-lg p-4 border border-gray-100">
          <h4 class="text-sm font-semibold text-gray-700 mb-3">设备信息</h4>
          <el-form :model="form" label-position="top" class="grid grid-cols-2 gap-4">
            <el-form-item label="品牌">
              <el-input v-model="form.brand" placeholder="如：海康威视" />
            </el-form-item>
            <el-form-item label="型号">
              <el-input v-model="form.model" placeholder="如：DS-2CD2T47" />
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="form.username" placeholder="admin" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="form.password" type="password" placeholder="摄像头密码" show-password />
            </el-form-item>
          </el-form>
        </div>
      </div>
      <template #footer>
        <el-button @click="closeModal">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :disabled="!form.cameraName?.trim()">提交</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="400px"
    >
      <p class="text-sm text-gray-500">
        确定要删除摄像头 "<span class="font-medium text-gray-700">{{ selectedItem?.cameraName }}</span>" 吗？
      </p>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleDelete">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ArrowLeft, Search, Plus, Edit, Delete, VideoCamera, Monitor } from '@element-plus/icons-vue'
import { useCameraStore } from '@/stores/modules/camera'
import { useFarmPartitionStore } from '@/stores/modules/farmPartition'
import { ElMessage } from 'element-plus'

// Store
const cameraStore = useCameraStore()
const partitionStore = useFarmPartitionStore()

// 状态
const items = computed(() => cameraStore.items)
const isLoading = computed(() => cameraStore.isLoading)

// 筛选
const keyword = ref('')
const filterStatus = ref('')

// 弹窗状态
const modalVisible = ref(false)
const deleteDialogVisible = ref(false)
const isEditMode = ref(false)
const selectedItem = ref(null)

// 表单数据
const form = reactive({
  cameraName: '',
  cameraCode: '',
  rtspUrl: '',
  httpUrl: '',
  partitionOid: '',
  greenhouseOid: '',
  brand: '',
  model: '',
  username: '',
  password: '',
  channelCount: 1
})

// 分区选项
const partitionOptions = computed(() => {
  return partitionStore.items.map(p => ({ oid: p.oid, name: p.name }))
})

// 统计数据
const stats = computed(() => ({
  total: items.value.length,
  active: items.value.filter(i => i.status === 'active').length,
  withRtsp: items.value.filter(i => i.rtspUrl).length
}))

// 筛选后的数据
const filteredData = computed(() => {
  let filtered = items.value

  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.cameraName.toLowerCase().includes(kw) ||
      (item.cameraCode || '').toLowerCase().includes(kw) ||
      (item.brand || '').toLowerCase().includes(kw) ||
      (item.partitionName || '').toLowerCase().includes(kw)
    )
  }

  if (filterStatus.value) {
    filtered = filtered.filter(item => item.status === filterStatus.value)
  }

  return filtered
})

// 重置表单
const resetForm = () => {
  form.cameraName = ''
  form.cameraCode = ''
  form.rtspUrl = ''
  form.httpUrl = ''
  form.partitionOid = ''
  form.greenhouseOid = ''
  form.brand = ''
  form.model = ''
  form.username = ''
  form.password = ''
  form.channelCount = 1
}

// 打开新增弹窗
const openAddModal = () => {
  resetForm()
  isEditMode.value = false
  selectedItem.value = null
  modalVisible.value = true
}

// 打开编辑弹窗
const openEditModal = (item) => {
  selectedItem.value = item
  Object.assign(form, {
    cameraName: item.cameraName,
    cameraCode: item.cameraCode || '',
    rtspUrl: item.rtspUrl || '',
    httpUrl: item.httpUrl || '',
    partitionOid: item.partitionOid || '',
    greenhouseOid: item.greenhouseOid || '',
    brand: item.brand || '',
    model: item.model || '',
    username: item.username || '',
    password: item.password || '',
    channelCount: item.channelCount
  })
  isEditMode.value = true
  modalVisible.value = true
}

// 关闭弹窗
const closeModal = () => {
  modalVisible.value = false
  selectedItem.value = null
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  if (!form.cameraName.trim()) return

  // 根据分区名称获取分区信息
  const partition = partitionStore.items.find(p => p.oid === form.partitionOid)
  const submitData = {
    ...form,
    partitionName: partition?.name || '',
    status: 'active'
  }

  if (isEditMode.value) {
    await cameraStore.updateItem(selectedItem.value.oid, submitData)
    ElMessage.success('编辑成功')
  } else {
    await cameraStore.createItem(submitData)
    ElMessage.success('新增成功')
  }
  closeModal()
}

// 打开删除确认
const openDeleteConfirm = (item) => {
  selectedItem.value = item
  deleteDialogVisible.value = true
}

// 删除
const handleDelete = async () => {
  if (!selectedItem.value) return
  await cameraStore.deleteItem(selectedItem.value.oid)
  deleteDialogVisible.value = false
  selectedItem.value = null
  ElMessage.success('删除成功')
}

// 重置筛选
const handleReset = () => {
  keyword.value = ''
  filterStatus.value = ''
}

// 关键词清除
const handleKeywordClear = () => {
  keyword.value = ''
}

// 初始化
onMounted(() => {
  cameraStore.fetchItems()
  partitionStore.fetchItems()
})
</script>

<style scoped>
/* 表格表头样式 */
:deep(.el-table th) {
  background: linear-gradient(to right, #10b981, #059669);
  color: white;
}

/* 弹窗头部样式 */
:deep(.el-dialog__header) {
  background: linear-gradient(to right, #10b981, #059669);
  color: white;
  margin: 0;
  padding: 16px 20px;
}

:deep(.el-dialog__title) {
  color: white !important;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white !important;
}
</style>
