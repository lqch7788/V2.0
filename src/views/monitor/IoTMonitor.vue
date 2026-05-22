<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><Connection /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">IoT监控</h1>
          <p class="text-xs text-gray-500">物联网设备监控</p>
        </div>
      </div>
    </div>

    <!-- 设备状态概览 -->
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border-l-4 border-emerald-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-500">在线设备</p>
            <p class="text-2xl font-bold text-emerald-600 mt-1">{{ stats.online }}</p>
          </div>
          <el-icon :size="32" color="#10b981"><CircleCheck /></el-icon>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border-l-4 border-gray-400">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-500">离线设备</p>
            <p class="text-2xl font-bold text-gray-600 mt-1">{{ stats.offline }}</p>
          </div>
          <el-icon :size="32" color="#9ca3af"><CircleClose /></el-icon>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border-l-4 border-amber-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-500">警告设备</p>
            <p class="text-2xl font-bold text-amber-600 mt-1">{{ stats.warning }}</p>
          </div>
          <el-icon :size="32" color="#f59e0b"><Warning /></el-icon>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-500">设备总数</p>
            <p class="text-2xl font-bold text-blue-600 mt-1">{{ stats.total }}</p>
          </div>
          <el-icon :size="32" color="#3b82f6"><Monitor /></el-icon>
        </div>
      </div>
    </div>

    <!-- 设备列表 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-semibold text-gray-800">IoT设备列表</h3>
        <el-radio-group v-model="filterStatus" size="small">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="online">在线</el-radio-button>
          <el-radio-button label="offline">离线</el-radio-button>
          <el-radio-button label="warning">警告</el-radio-button>
        </el-radio-group>
      </div>

      <el-table :data="filteredDevices" stripe style="width: 100%">
        <el-table-column prop="name" label="设备名称" min-width="120" />
        <el-table-column prop="type" label="设备类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">{{ row.typeName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="安装位置" min-width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastHeartbeat" label="最后心跳" width="160" />
        <el-table-column prop="signal" label="信号强度" width="100">
          <template #default="{ row }">
            <el-progress :percentage="row.signal" :color="getSignalColor(row.signal)" :show-text="false" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleDetail(row)">详情</el-button>
            <el-button type="danger" link size="small" @click="handleRestart(row)">重启</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 设备详情弹窗 -->
    <el-dialog v-model="showDetail" title="设备详情" width="700px">
      <div v-if="selectedDevice">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="设备名称">{{ selectedDevice.name }}</el-descriptions-item>
          <el-descriptions-item label="设备编号">{{ selectedDevice.id }}</el-descriptions-item>
          <el-descriptions-item label="设备类型">{{ selectedDevice.typeName }}</el-descriptions-item>
          <el-descriptions-item label="安装位置">{{ selectedDevice.location }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="getStatusTagType(selectedDevice.status)" size="small">
              {{ getStatusText(selectedDevice.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="信号强度">{{ selectedDevice.signal }}%</el-descriptions-item>
          <el-descriptions-item label="最后心跳" :span="2">{{ selectedDevice.lastHeartbeat }}</el-descriptions-item>
        </el-descriptions>

        <div class="mt-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">设备数据</h4>
          <div class="grid grid-cols-3 gap-4">
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-xs text-gray-500">温度</p>
              <p class="text-lg font-bold text-gray-800">{{ selectedDevice.data?.temperature || '--' }} °C</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-xs text-gray-500">湿度</p>
              <p class="text-lg font-bold text-gray-800">{{ selectedDevice.data?.humidity || '--' }} %</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-xs text-gray-500">电压</p>
              <p class="text-lg font-bold text-gray-800">{{ selectedDevice.data?.voltage || '--' }} V</p>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Connection, CircleCheck, CircleClose, Warning, Monitor } from '@element-plus/icons-vue'

// 设备状态统计
const stats = ref({
  total: 24,
  online: 20,
  offline: 2,
  warning: 2
})

// 筛选状态
const filterStatus = ref('')

// 设备列表数据
const devices = ref([
  { id: 'IOT001', name: '温室A1传感器', type: 'sensor', typeName: '环境传感器', location: '1号棚-A区', status: 'online', lastHeartbeat: '2026-05-22 10:30:00', signal: 95, data: { temperature: 25.3, humidity: 65, voltage: 3.6 } },
  { id: 'IOT002', name: '温室A2传感器', type: 'sensor', typeName: '环境传感器', location: '1号棚-B区', status: 'online', lastHeartbeat: '2026-05-22 10:30:00', signal: 88, data: { temperature: 24.8, humidity: 68, voltage: 3.5 } },
  { id: 'IOT003', name: '温室B1传感器', type: 'sensor', typeName: '环境传感器', location: '2号棚', status: 'online', lastHeartbeat: '2026-05-22 10:30:00', signal: 92, data: { temperature: 26.2, humidity: 72, voltage: 3.6 } },
  { id: 'IOT004', name: '灌溉控制器1', type: 'controller', typeName: '灌溉控制器', location: '1号棚-A区', status: 'online', lastHeartbeat: '2026-05-22 10:29:00', signal: 85, data: { temperature: null, humidity: null, voltage: 5.0 } },
  { id: 'IOT005', name: '灌溉控制器2', type: 'controller', typeName: '灌溉控制器', location: '2号棚', status: 'offline', lastHeartbeat: '2026-05-22 08:15:00', signal: 0, data: { temperature: null, humidity: null, voltage: 0 } },
  { id: 'IOT006', name: '温室C1传感器', type: 'sensor', typeName: '环境传感器', location: '3号棚', status: 'warning', lastHeartbeat: '2026-05-22 10:30:00', signal: 45, data: { temperature: 35.2, humidity: 85, voltage: 2.8 } },
  { id: 'IOT007', name: '通风控制器1', type: 'controller', typeName: '通风控制器', location: '1号棚', status: 'online', lastHeartbeat: '2026-05-22 10:30:00', signal: 90, data: { temperature: null, humidity: null, voltage: 5.0 } },
  { id: 'IOT008', name: '通风控制器2', type: 'controller', typeName: '通风控制器', location: '2号棚', status: 'online', lastHeartbeat: '2026-05-22 10:30:00', signal: 87, data: { temperature: null, humidity: null, voltage: 5.0 } },
])

// 筛选后的设备列表
const filteredDevices = computed(() => {
  if (!filterStatus.value) return devices.value
  return devices.value.filter(d => d.status === filterStatus.value)
})

// 设备详情弹窗
const showDetail = ref(false)
const selectedDevice = ref(null)

const getTypeTagType = (type) => {
  const map = { sensor: 'success', controller: 'primary', camera: 'warning' }
  return map[type] || 'info'
}

const getStatusTagType = (status) => {
  const map = { online: 'success', offline: 'info', warning: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { online: '在线', offline: '离线', warning: '警告' }
  return map[status] || status
}

const getSignalColor = (signal) => {
  if (signal >= 80) return '#10b981'
  if (signal >= 50) return '#f59e0b'
  return '#ef4444'
}

const handleDetail = (row) => {
  selectedDevice.value = row
  showDetail.value = true
}

const handleRestart = (row) => {
  console.log('重启设备:', row.id)
}
</script>
