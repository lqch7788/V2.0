<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <router-link
            to="/system"
            class="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hover:from-gray-200 hover:to-gray-300 transition-colors"
            title="返回系统设置"
          >
            <el-icon :size="20" color="#525252">
              <ArrowLeft />
            </el-icon>
          </router-link>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white">
              <Odometer />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">系统监控</h1>
            <p class="text-gray-500">实时监控服务器和服务运行状态</p>
          </div>
        </div>
        <el-button type="default" @click="fetchSystemInfo">
          <el-icon><Refresh /></el-icon> 刷新
        </el-button>
      </div>
    </div>

    <!-- 系统资源概览 -->
    <div v-if="systemInfo" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3 mb-3">
          <el-icon :size="20" color="#3b82f6">
            <Cpu />
          </el-icon>
          <span class="text-sm font-medium text-gray-700">CPU 负载</span>
        </div>
        <div class="text-2xl font-bold text-gray-900">{{ systemInfo.loadAvg[0].toFixed(1) }}</div>
        <div class="text-xs text-gray-500 mt-1">{{ systemInfo.cpus }} 核 / 1min: {{ systemInfo.loadAvg[0].toFixed(2) }}</div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3 mb-3">
          <el-icon :size="20" color="#22c55e">
            <Box />
          </el-icon>
          <span class="text-sm font-medium text-gray-700">内存使用</span>
        </div>
        <div class="text-2xl font-bold text-gray-900">{{ systemInfo.memoryUsagePercent.toFixed(1) }}%</div>
        <div class="w-full h-2 bg-gray-200 rounded-full mt-2">
          <div
            :class="['h-full rounded-full', getProgressColor(systemInfo.memoryUsagePercent, [70, 90])]"
            :style="{ width: Math.min(systemInfo.memoryUsagePercent, 100) + '%' }"
          />
        </div>
        <div class="text-xs text-gray-500 mt-1">空闲: {{ formatBytes(systemInfo.freeMemory) }}</div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3 mb-3">
          <el-icon :size="20" color="#a855f7">
            <Timer />
          </el-icon>
          <span class="text-sm font-medium text-gray-700">运行时间</span>
        </div>
        <div class="text-lg font-bold text-gray-900">{{ formatUptime(systemInfo.osUptime) }}</div>
        <div class="text-xs text-gray-500 mt-1">进程: {{ formatUptime(systemInfo.processUptime) }}</div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3 mb-3">
          <el-icon :size="20" color="#6366f1">
            <Monitor />
          </el-icon>
          <span class="text-sm font-medium text-gray-700">系统信息</span>
        </div>
        <div class="text-sm text-gray-600">
          <div>平台: {{ systemInfo.platform }} {{ systemInfo.arch }}</div>
          <div>Node.js: {{ systemInfo.nodeVersion }}</div>
          <div>主机: {{ systemInfo.hostname }}</div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <el-icon class="is-loading" :size="32" color="#059669">
        <Loading />
      </el-icon>
      <span class="ml-2 text-gray-600">加载系统信息...</span>
    </div>

    <!-- 服务统计 -->
    <div v-if="!loading && systemInfo" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <el-icon :size="20" color="#3b82f6">
              <Odometer />
            </el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ services.length }}</p>
            <p class="text-xs text-gray-500">服务总数</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <el-icon :size="20" color="#22c55e">
              <CircleCheckFilled />
            </el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ runningCount }}</p>
            <p class="text-xs text-gray-500">运行中</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <el-icon :size="20" color="#f59e0b">
              <WarnTriangleFilled />
            </el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ warningCount }}</p>
            <p class="text-xs text-gray-500">警告</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <el-icon :size="20" color="#ef4444">
              <WarnTriangleFilled />
            </el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ errorCount }}</p>
            <p class="text-xs text-gray-500">异常</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-[200px]">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索服务名称、主机或描述..."
            clearable
            @clear="handleSearchClear"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-select
          v-model="typeFilter"
          placeholder="全部类型"
          clearable
          @change="handleSearch"
          class="w-full sm:w-36"
        >
          <el-option label="全部类型" value="all" />
          <el-option
            v-for="t in serviceTypes"
            :key="t.value"
            :label="t.label"
            :value="t.value"
          />
        </el-select>
        <el-select
          v-model="statusFilter"
          placeholder="全部状态"
          clearable
          @change="handleSearch"
          class="w-full sm:w-36"
        >
          <el-option label="全部状态" value="all" />
          <el-option label="运行中" value="running" />
          <el-option label="警告" value="warning" />
          <el-option label="异常" value="error" />
          <el-option label="已停止" value="stopped" />
        </el-select>
      </div>
    </div>

    <!-- 服务列表表格 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600">
          <tr>
            <th
              v-for="h in tableHeaders"
              :key="h"
              :class="[
                'px-4 py-3 text-sm font-medium text-white',
                h === '操作' ? 'text-center' : 'text-left'
              ]"
            >
              {{ h }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300 bg-white">
          <tr v-for="service in paginatedServices" :key="service.id" class="hover:bg-gray-50">
            <td class="px-4 py-3">
              <div class="text-sm font-bold text-gray-800">{{ service.name }}</div>
              <div class="text-xs text-gray-500 max-w-xs truncate">{{ service.description }}</div>
            </td>
            <td class="px-4 py-3">
              <span class="text-sm text-gray-600">{{ getTypeLabel(service.type) }}</span>
            </td>
            <td class="px-4 py-3">
              <el-tag :type="getStatusTagType(service.status)" size="small" effect="light">
                {{ getStatusLabel(service.status) }}
              </el-tag>
            </td>
            <td class="px-4 py-3">
              <span :class="['text-sm font-bold', getHealthColor(service.health)]">
                {{ service.health }}%
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="w-16">
                <div class="text-xs text-gray-500 mb-1">{{ service.cpuUsage }}%</div>
                <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    :class="['h-full rounded-full', getProgressColor(service.cpuUsage, [50, 80])]"
                    :style="{ width: Math.min(service.cpuUsage, 100) + '%' }"
                  />
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="w-16">
                <div class="text-xs text-gray-500 mb-1">{{ service.memoryUsage }}%</div>
                <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    :class="['h-full rounded-full', getProgressColor(service.memoryUsage, [50, 80])]"
                    :style="{ width: Math.min(service.memoryUsage, 100) + '%' }"
                  />
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="w-16">
                <div class="text-xs text-gray-500 mb-1">{{ service.diskUsage }}%</div>
                <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    :class="['h-full rounded-full', getProgressColor(service.diskUsage, [70, 90])]"
                    :style="{ width: Math.min(service.diskUsage, 100) + '%' }"
                  />
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ service.uptime }}</td>
            <td class="px-4 py-3 text-center">
              <el-button
                link
                type="primary"
                size="small"
                @click="openDetailModal(service)"
                title="查看详情"
              >
                <el-icon><View /></el-icon>
              </el-button>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- 分页 -->
      <div v-if="totalPages > 1" class="flex items-center justify-end px-4 py-3 border-t border-gray-200">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredServices.length"
          layout="prev, pager, next"
          background
        />
      </div>
    </div>

    <!-- 详情模态框 -->
    <el-dialog
      v-model="showDetailModal"
      title="服务详情"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedService" class="space-y-6">
        <!-- 基本信息 -->
        <div>
          <h4 class="text-sm font-medium text-gray-500 mb-3">基本信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="服务名称">{{ selectedService.name }}</el-descriptions-item>
            <el-descriptions-item label="服务类型">{{ getTypeLabel(selectedService.type) }}</el-descriptions-item>
            <el-descriptions-item label="运行状态">
              <el-tag :type="getStatusTagType(selectedService.status)" size="small" effect="light">
                {{ getStatusLabel(selectedService.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="运行时间">{{ selectedService.uptime }}</el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">{{ selectedService.description }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <!-- 性能指标 -->
        <div>
          <h4 class="text-sm font-medium text-gray-500 mb-3">性能指标</h4>
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="(metric, index) in performanceMetrics"
              :key="index"
              class="bg-gray-50 rounded-lg p-3"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-500">{{ metric.label }}</span>
                <span :class="['text-lg font-bold', getHealthColor(100 - metric.value)]">
                  {{ metric.value }}%
                </span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  :class="['h-full rounded-full', getProgressColor(metric.value, metric.thresholds)]"
                  :style="{ width: Math.min(metric.value, 100) + '%' }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDetailModal = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
/**
 * 系统监控仪表盘页面
 * 功能：实时监控服务器和服务运行状态
 * 架构：Vue3 Composition API + Element Plus + Tailwind CSS
 */
import { ref, reactive, computed, onMounted } from 'vue'
import { get } from '@/api/request'
import {
  ArrowLeft,
  Search,
  Refresh,
  Odometer,
  Cpu,
  Box,
  Timer,
  Monitor,
  CircleCheckFilled,
  WarnTriangleFilled,
  View,
  Loading
} from '@element-plus/icons-vue'

// 系统信息接口
interface SystemInfo {
  hostname: string
  platform: string
  arch: string
  cpus: number
  totalMemory: number
  freeMemory: number
  memoryUsagePercent: number
  osUptime: number
  processUptime: number
  loadAvg: number[]
  nodeVersion: string
}

// 服务信息接口
interface ServiceInfo {
  id: string
  name: string
  type: 'database' | 'api' | 'cache' | 'storage' | 'message' | 'compute'
  host: string
  port: number
  status: 'running' | 'stopped' | 'error' | 'warning'
  health: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkIn: number
  networkOut: number
  uptime: string
  lastHeartbeat: string
  description: string
}

// 表格列配置
const tableHeaders = ['服务名称', '类型', '状态', '健康度', 'CPU', '内存', '磁盘', '运行时间', '操作']

// 分页配置
const currentPage = ref(1)
const pageSize = 10

// 搜索和筛选
const searchKeyword = ref('')
const typeFilter = ref('all')
const statusFilter = ref('all')

// 弹窗控制
const showDetailModal = ref(false)
const selectedService = ref<ServiceInfo | null>(null)

// 加载状态
const loading = ref(true)

// 系统信息
const systemInfo = ref<SystemInfo | null>(null)

// 服务类型配置
const serviceTypes = [
  { value: 'database', label: '数据库' },
  { value: 'cache', label: '缓存' },
  { value: 'api', label: 'API网关' },
  { value: 'storage', label: '存储' },
  { value: 'message', label: '消息队列' },
  { value: 'compute', label: '计算服务' }
]

// 获取服务类型标签
const getTypeLabel = (type) => {
  const found = serviceTypes.find(t => t.value === type)
  return found ? found.label : type
}

// 获取状态标签
const getStatusLabel = (status) => {
  const labels = {
    running: '运行中',
    stopped: '已停止',
    error: '异常',
    warning: '警告'
  }
  return labels[status] || status
}

// 获取状态标签类型（对应Element Plus的tag类型）
const getStatusTagType = (status) => {
  const types = {
    running: 'success',
    stopped: 'info',
    error: 'danger',
    warning: 'warning'
  }
  return types[status] || 'info'
}

// 获取健康度颜色
const getHealthColor = (health) => {
  if (health >= 90) return 'text-green-600'
  if (health >= 70) return 'text-amber-600'
  return 'text-red-600'
}

// 获取进度条颜色
const getProgressColor = (value, thresholds) => {
  if (value > thresholds[1]) return 'bg-red-500'
  if (value > thresholds[0]) return 'bg-amber-500'
  return 'bg-green-500'
}

// 格式化字节数
const formatBytes = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

// 格式化运行时间
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (days > 0) return `${days}天${hours}小时${mins}分`
  if (hours > 0) return `${hours}小时${mins}分`
  return `${mins}分`
}

// 获取服务列表
const getMockServices = () => {
  if (!systemInfo.value) return []

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const totalMem = systemInfo.value.totalMemory
  const freeMem = systemInfo.value.freeMemory
  const usedMemPercent = Math.round(((totalMem - freeMem) / totalMem) * 100)

  return [
    {
      id: '1',
      name: 'Express API 服务',
      type: 'api' as const,
      host: 'localhost',
      port: 3001,
      status: 'running' as const,
      health: 99,
      cpuUsage: systemInfo.value.loadAvg[0] * 10,
      memoryUsage: usedMemPercent,
      diskUsage: 45,
      networkIn: 125,
      networkOut: 89,
      uptime: formatUptime(systemInfo.value.processUptime),
      lastHeartbeat: now,
      description: '后端 API 服务主实例'
    },
    {
      id: '2',
      name: 'SQLite 数据库',
      type: 'database' as const,
      host: 'localhost',
      port: 0,
      status: 'running' as const,
      health: 98,
      cpuUsage: 5,
      memoryUsage: Math.round(usedMemPercent * 0.4),
      diskUsage: 52,
      networkIn: 0,
      networkOut: 0,
      uptime: formatUptime(systemInfo.value.processUptime),
      lastHeartbeat: now,
      description: '核心业务数据库'
    },
    {
      id: '3',
      name: 'Vite 开发服务器',
      type: 'compute' as const,
      host: 'localhost',
      port: 5188,
      status: 'running' as const,
      health: 100,
      cpuUsage: 15,
      memoryUsage: Math.round(usedMemPercent * 0.3),
      diskUsage: 10,
      networkIn: 234,
      networkOut: 189,
      uptime: formatUptime(systemInfo.value.processUptime),
      lastHeartbeat: now,
      description: '前端开发服务器 (HMR)'
    },
    {
      id: '4',
      name: '文件存储服务',
      type: 'storage' as const,
      host: 'localhost',
      port: 0,
      status: systemInfo.value.memoryUsagePercent > 90 ? 'warning' as const : 'running' as const,
      health: systemInfo.value.memoryUsagePercent > 90 ? 82 : 95,
      cpuUsage: 8,
      memoryUsage: Math.round(usedMemPercent * 0.15),
      diskUsage: 58,
      networkIn: 56,
      networkOut: 128,
      uptime: formatUptime(systemInfo.value.osUptime),
      lastHeartbeat: now,
      description: '本地文件存储和备份管理'
    },
    {
      id: '5',
      name: 'Node.js 运行时',
      type: 'compute' as const,
      host: systemInfo.value.hostname,
      port: 0,
      status: 'running' as const,
      health: 100,
      cpuUsage: systemInfo.value.loadAvg[0] * 8,
      memoryUsage: usedMemPercent,
      diskUsage: 0,
      networkIn: 0,
      networkOut: 0,
      uptime: formatUptime(systemInfo.value.osUptime),
      lastHeartbeat: now,
      description: `Node.js ${systemInfo.value.nodeVersion} / ${systemInfo.value.platform} ${systemInfo.value.arch}`
    }
  ]
}

const services = computed(() => getMockServices())

// 筛选服务
const filteredServices = computed(() => {
  return services.value.filter(service => {
    const matchSearch =
      service.name.includes(searchKeyword.value) ||
      service.host.includes(searchKeyword.value) ||
      service.description.includes(searchKeyword.value)
    const matchType = typeFilter.value === 'all' || service.type === typeFilter.value
    const matchStatus = statusFilter.value === 'all' || service.status === statusFilter.value
    return matchSearch && matchType && matchStatus
  })
})

// 分页服务
const paginatedServices = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredServices.value.slice(start, start + pageSize)
})

// 总页数
const totalPages = computed(() => Math.ceil(filteredServices.value.length / pageSize) || 1)

// 统计计数
const runningCount = computed(() => services.value.filter(s => s.status === 'running').length)
const warningCount = computed(() => services.value.filter(s => s.status === 'warning').length)
const errorCount = computed(() => services.value.filter(s => s.status === 'error').length)

// 性能指标（用于详情弹窗）
const performanceMetrics = computed(() => {
  if (!selectedService.value) return []
  return [
    { label: 'CPU使用率', value: selectedService.value.cpuUsage, thresholds: [50, 80] },
    { label: '内存使用率', value: selectedService.value.memoryUsage, thresholds: [50, 80] },
    { label: '磁盘使用率', value: selectedService.value.diskUsage, thresholds: [70, 90] },
    { label: '健康度', value: selectedService.value.health, thresholds: [70, 90] }
  ]
})

// 获取系统信息
const fetchSystemInfo = async () => {
  loading.value = true
  try {
    const data = await get('/monitoring/system')
    systemInfo.value = data
  } catch (err) {
    console.error('获取系统信息失败:', err)
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
}

// 清除搜索
const handleSearchClear = () => {
  searchKeyword.value = ''
  currentPage.value = 1
}

// 打开详情弹窗
const openDetailModal = (service) => {
  selectedService.value = service
  showDetailModal.value = true
}

// 组件挂载时获取数据
onMounted(() => {
  fetchSystemInfo()
})
</script>
