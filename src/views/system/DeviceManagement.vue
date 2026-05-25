<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <router-link
            to="/settings"
            class="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hover:from-gray-200 hover:to-gray-300 transition-colors"
            title="返回系统设置"
          >
            <el-icon :size="20" color="#525252">
              <ArrowLeft />
            </el-icon>
          </router-link>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white">
              <Monitor />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">设备管理</h1>
            <p class="text-gray-500">设备信息管理与状态监控</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">设备总数</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.total }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-green-600">在线设备</p>
        <p class="text-2xl font-bold text-green-600 mt-1">{{ stats.online }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-400">离线设备</p>
        <p class="text-2xl font-bold text-gray-400 mt-1">{{ stats.offline }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-yellow-600">维护中</p>
        <p class="text-2xl font-bold text-yellow-600 mt-1">{{ stats.maintenance }}</p>
      </div>
    </div>

    <!-- 过滤 -->
    <div class="flex items-center gap-4 flex-wrap">
      <div class="relative flex-1 min-w-[200px]">
        <el-input
          v-model="searchTerm"
          placeholder="搜索设备..."
          clearable
          @clear="handleSearchClear"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <el-select v-model="filterType" placeholder="全部类型" clearable class="w-36">
        <el-option label="全部类型" value="all" />
        <el-option v-for="t in DEVICE_TYPES" :key="t" :label="t" :value="t" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="全部状态" clearable class="w-36">
        <el-option label="全部状态" value="all" />
        <el-option label="在线" value="online" />
        <el-option label="离线" value="offline" />
        <el-option label="维护中" value="maintenance" />
      </el-select>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <el-icon class="is-loading text-2xl text-emerald-600"><Loading /></el-icon>
      <span class="ml-2 text-gray-600">加载中...</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="flex items-center justify-center h-64">
      <el-icon :size="32" color="#ef4444"><Warning /></el-icon>
      <span class="ml-2 text-red-600">{{ error }}</span>
    </div>

    <!-- 设备列表 -->
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="device in filteredDevices"
        :key="device.oid"
        class="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div
              class="p-2 rounded-lg"
              :class="{
                'bg-green-50': device.status === 'online',
                'bg-gray-100': device.status === 'offline',
                'bg-yellow-50': device.status === 'maintenance'
              }"
            >
              <el-icon
                :size="20"
                :class="{
                  'text-green-600': device.status === 'online',
                  'text-gray-400': device.status === 'offline',
                  'text-yellow-600': device.status === 'maintenance'
                }"
              >
                <Monitor />
              </el-icon>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 text-sm">{{ device.deviceName }}</h3>
              <p class="text-xs text-gray-500">{{ device.deviceCode }}</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <el-icon
              :size="16"
              :class="{
                'text-green-600': device.status === 'online',
                'text-gray-400': device.status === 'offline',
                'text-yellow-600': device.status === 'maintenance'
              }"
            >
              <component :is="getStatusIcon(device.status)" />
            </el-icon>
            <span class="text-xs text-gray-500">{{ getStatusLabel(device.status) }}</span>
          </div>
        </div>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500">类型</span>
            <span class="text-gray-900">{{ device.deviceType || '-' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">位置</span>
            <span class="text-gray-900">{{ device.location || '-' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">温室</span>
            <span class="text-gray-900">{{ device.greenhouseName || '-' }}</span>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
          <el-button
            link
            type="primary"
            size="small"
            @click="editDeviceAction(device)"
            class="p-1 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="编辑"
          >
            <el-icon :size="16"><Edit /></el-icon>
          </el-button>
          <el-button
            link
            type="danger"
            size="small"
            @click="handleDeleteDevice(device.oid)"
            class="p-1 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="删除"
          >
            <el-icon :size="16"><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && !error && filteredDevices.length === 0" class="text-center py-12 text-gray-400">
      暂无设备数据
    </div>

    <!-- 设备编辑弹窗 -->
    <el-dialog
      v-model="showModal"
      :title="editingDevice ? '编辑设备' : '新增设备'"
      width="600px"
      :close-on-click-modal="false"
      @close="handleModalClose"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">设备名称</label>
          <el-input
            v-model="newDevice.deviceName"
            placeholder="请输入设备名称"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">设备编码</label>
            <el-input
              v-model="newDevice.deviceCode"
              placeholder="请输入设备编码"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">设备类型</label>
            <el-select v-model="newDevice.deviceType" placeholder="请选择" class="w-full">
              <el-option label="请选择" value="" />
              <el-option v-for="t in DEVICE_TYPES" :key="t" :label="t" :value="t" />
            </el-select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">厂商</label>
            <el-input
              v-model="newDevice.manufacturer"
              placeholder="请输入厂商"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">序列号</label>
            <el-input
              v-model="newDevice.serialNumber"
              placeholder="请输入序列号"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">安装位置</label>
          <el-input
            v-model="newDevice.location"
            placeholder="请输入安装位置"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <el-select v-model="newDevice.status" placeholder="请选择" class="w-full">
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
            <el-option label="维护中" value="maintenance" />
          </el-select>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <el-button @click="handleModalClose">取消</el-button>
          <el-button type="primary" @click="handleSaveDevice">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDeviceStore } from '@/stores'
import { DEVICE_TYPES } from '@/types/system'
import {
  ArrowLeft,
  Monitor,
  Search,
  Plus,
  Edit,
  Delete,
  Loading,
  Warning,
  Connection,
  Close,
  Setting
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 路由实例
const router = useRouter()

// ========== Store ==========
const deviceStore = useDeviceStore()

// ========== 状态 ==========
const searchTerm = ref('')
const filterType = ref('all')
const filterStatus = ref('all')
const showModal = ref(false)
const editingDevice = ref(null)

// 新建设备表单数据
const newDevice = reactive({
  deviceName: '',
  deviceCode: '',
  deviceType: '',
  manufacturer: '',
  serialNumber: '',
  location: '',
  status: 'online'
})

// ========== 计算属性 ==========
const devices = computed(() => deviceStore.devices)
const loading = computed(() => deviceStore.loading)
const error = computed(() => deviceStore.error)
const stats = computed(() => deviceStore.stats)

// 筛选后的设备列表
const filteredDevices = computed(() => {
  return devices.value.filter(d => {
    const matchSearch =
      !searchTerm.value ||
      d.deviceName.includes(searchTerm.value) ||
      d.deviceCode.includes(searchTerm.value) ||
      (d.location && d.location.includes(searchTerm.value))
    const matchType = filterType.value === 'all' || d.deviceType === filterType.value
    const matchStatus = filterStatus.value === 'all' || d.status === filterStatus.value
    return matchSearch && matchType && matchStatus
  })
})

// ========== 生命周期 ==========
onMounted(() => {
  loadDevices()
})

// ========== 方法 ==========
// 获取设备列表
const loadDevices = () => {
  deviceStore.loadDevices()
}

// 清除搜索
const handleSearchClear = () => {
  searchTerm.value = ''
}

// 获取状态图标组件
const getStatusIcon = (status) => {
  switch (status) {
    case 'online':
      return Connection
    case 'offline':
      return Close
    case 'maintenance':
      return Setting
    default:
      return Connection
  }
}

// 获取状态标签
const getStatusLabel = (status) => {
  const map = {
    online: '在线',
    offline: '离线',
    maintenance: '维护中'
  }
  return map[status] || status
}

// 编辑设备
const editDeviceAction = (device) => {
  editingDevice.value = device
  newDevice.deviceName = device.deviceName
  newDevice.deviceCode = device.deviceCode
  newDevice.deviceType = device.deviceType || ''
  newDevice.manufacturer = device.manufacturer || ''
  newDevice.serialNumber = device.serialNumber || ''
  newDevice.location = device.location || ''
  newDevice.status = device.status
  showModal.value = true
}

// 删除设备
const handleDeleteDevice = async (oid) => {
  try {
    await ElMessageBox.confirm('确定删除该设备吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deviceStore.removeDevice(oid)
    ElMessage.success('删除成功')
  } catch (err) {
    if (err !== 'cancel') {
      console.error('删除设备失败:', err)
      ElMessage.error('删除设备失败')
    }
  }
}

// 保存设备
const handleSaveDevice = async () => {
  if (!newDevice.deviceName || !newDevice.deviceCode) {
    ElMessage.warning('请填写设备名称和编码')
    return
  }

  try {
    if (editingDevice.value) {
      // 编辑模式
      await deviceStore.editDevice(editingDevice.value.oid, {
        deviceName: newDevice.deviceName,
        deviceCode: newDevice.deviceCode,
        deviceType: newDevice.deviceType,
        manufacturer: newDevice.manufacturer,
        serialNumber: newDevice.serialNumber,
        location: newDevice.location,
        status: newDevice.status
      })
      ElMessage.success('更新成功')
    } else {
      // 新增模式
      await deviceStore.addDevice({
        deviceName: newDevice.deviceName,
        deviceCode: newDevice.deviceCode,
        deviceType: newDevice.deviceType,
        manufacturer: newDevice.manufacturer,
        serialNumber: newDevice.serialNumber,
        location: newDevice.location,
        status: newDevice.status
      })
      ElMessage.success('创建成功')
    }
    handleModalClose()
  } catch (err) {
    console.error('保存设备失败:', err)
    ElMessage.error('保存设备失败')
  }
}

// 弹窗关闭
const handleModalClose = () => {
  showModal.value = false
  editingDevice.value = null
  // 重置表单
  newDevice.deviceName = ''
  newDevice.deviceCode = ''
  newDevice.deviceType = ''
  newDevice.manufacturer = ''
  newDevice.serialNumber = ''
  newDevice.location = ''
  newDevice.status = 'online'
}

// 打开新增弹窗 - 暴露给外部使用
const openAddModal = () => {
  editingDevice.value = null
  handleModalClose()
  showModal.value = true
}

// 暴露方法
defineExpose({
  openAddModal
})
</script>
