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
            <el-icon :size="20" class="text-gray-600"><ArrowLeft /></el-icon>
          </a>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" class="text-white"><Setting /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">工程调试</h1>
            <p class="text-gray-500">HMI版本查询、数据库连接测试和系统诊断工具</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具卡片网格 -->
    <div class="grid grid-cols-2 gap-4">
      <!-- HMI 版本 -->
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <el-icon :size="20" class="text-emerald-600"><Monitor /></el-icon>
            <h3 class="font-semibold text-gray-900">HMI 版本信息</h3>
          </div>
          <button
            @click="fetchHmi"
            :disabled="loading.hmi"
            class="p-1 hover:bg-gray-100 rounded"
          >
            <el-icon
              :size="16"
              :class="loading.hmi ? 'animate-spin text-emerald-500' : 'text-gray-400'"
            >
              <Refresh />
            </el-icon>
          </button>
        </div>
        <div v-if="hmi" class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500">版本</span>
            <span class="font-mono text-gray-900">{{ hmi.version }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">构建日期</span>
            <span class="text-gray-900">{{ hmi.buildDate }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Node.js</span>
            <span class="font-mono text-gray-600">{{ hmi.nodeVersion }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">平台</span>
            <span class="text-gray-600">{{ hmi.platform }} ({{ hmi.arch }})</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">进程 PID</span>
            <span class="font-mono text-gray-600">{{ hmi.pid }}</span>
          </div>
        </div>
        <div v-else class="py-4 text-center text-sm text-gray-400">点击刷新加载版本信息</div>
      </div>

      <!-- 系统诊断 -->
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <el-icon :size="20" class="text-blue-600"><Monitor /></el-icon>
            <h3 class="font-semibold text-gray-900">系统诊断</h3>
          </div>
          <button
            @click="fetchDiagnostics"
            :disabled="loading.diag"
            class="p-1 hover:bg-gray-100 rounded"
          >
            <el-icon
              :size="16"
              :class="loading.diag ? 'animate-spin text-emerald-500' : 'text-gray-400'"
            >
              <Refresh />
            </el-icon>
          </button>
        </div>
        <div v-if="diag" class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500">数据库表数</span>
            <span class="font-semibold text-gray-900">{{ diag.database?.tableCount || 0 }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">堆内存使用</span>
            <span class="text-gray-900">{{ diag.memory?.heapUsed || 0 }} / {{ diag.memory?.heapTotal || 0 }} MB</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">运行时间</span>
            <span class="text-gray-600">
              {{ diag.uptime ? `${Math.floor(diag.uptime / 3600)}h ${Math.floor((diag.uptime % 3600) / 60)}m` : '-' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">诊断时间</span>
            <span class="text-gray-600 text-xs">
              {{ diag.timestamp ? new Date(diag.timestamp).toLocaleString('zh-CN') : '-' }}
            </span>
          </div>
          <!-- 表行数概览 -->
          <div v-if="diag.database?.tableRows" class="mt-3 pt-3 border-t border-gray-100">
            <p class="text-xs text-gray-500 mb-2">表行数概览 (Top 8)</p>
            <div class="grid grid-cols-2 gap-1">
              <div
                v-for="([name, count]) in Object.entries(diag.database.tableRows).slice(0, 8)"
                :key="name"
                class="flex justify-between text-xs"
              >
                <span class="text-gray-500 truncate max-w-[120px]">{{ name }}</span>
                <span class="font-mono text-gray-700">{{ count }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="py-4 text-center text-sm text-gray-400">点击刷新加载诊断数据</div>
      </div>

      <!-- 数据库测试 -->
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <el-icon :size="20" class="text-purple-600"><Document /></el-icon>
            <h3 class="font-semibold text-gray-900">数据库连接测试</h3>
          </div>
        </div>
        <div class="py-3 text-center">
          <div
            v-if="dbTestResult"
            :class="[
              'flex items-center justify-center gap-2 py-2 rounded-lg',
              dbTestResult.status === '连接正常' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            ]"
          >
            <el-icon :size="20">
              <CircleCheck v-if="dbTestResult.status === '连接正常'" />
              <CircleClose v-else />
            </el-icon>
            <span class="font-medium">{{ dbTestResult.status }}</span>
            <span v-if="dbTestResult.duration > 0" class="text-xs text-gray-500 ml-2">
              ({{ dbTestResult.duration }}ms)
            </span>
          </div>
          <p v-else class="text-sm text-gray-400">点击按钮测试数据库连接</p>
          <button
            @click="testDb"
            :disabled="loading.db"
            class="mt-3 px-4 py-2 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            <el-icon v-if="loading.db" class="is-loading"><Loading /></el-icon>
            <span>{{ loading.db ? '测试中...' : '开始测试' }}</span>
          </button>
        </div>
      </div>

      <!-- 运行时间 -->
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2 mb-4">
          <el-icon :size="20" class="text-orange-600"><Clock /></el-icon>
          <h3 class="font-semibold text-gray-900">服务状态</h3>
        </div>
        <div v-if="diag" class="space-y-4">
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
              <el-icon :size="12"><CircleCheck /></el-icon>
              运行中
            </span>
            <span class="text-sm text-gray-500">
              已运行 {{ diag.uptime ? `${Math.floor(diag.uptime / 3600)}小时${Math.floor((diag.uptime % 3600) / 60)}分钟` : '-' }}
            </span>
          </div>
          <div class="text-xs text-gray-400">
            <p>进程 PID: {{ diag.hmi?.pid || '-' }}</p>
            <p>Node.js: {{ diag.hmi?.nodeVersion || '-' }}</p>
          </div>
        </div>
        <div v-else class="py-4 text-center text-sm text-gray-400">加载中...</div>
      </div>
    </div>

    <!-- 调试日志 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <el-icon :size="20" class="text-gray-500"><List /></el-icon>
          调试日志
          <span v-if="logs.length > 0" class="text-sm text-gray-400 font-normal">({{ logs.length }})</span>
        </h3>
        <div class="flex items-center gap-2">
          <button
            @click="fetchLogs"
            class="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <el-icon :size="14"><Refresh /></el-icon>
            刷新
          </button>
          <button
            v-if="logs.length > 0"
            @click="clearLogs"
            class="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            <el-icon :size="14"><Delete /></el-icon>
            清空
          </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50">
              <th class="py-2.5 px-4 text-left text-xs font-medium text-gray-500 w-24">类型</th>
              <th class="py-2.5 px-4 text-left text-xs font-medium text-gray-500">测试目标</th>
              <th class="py-2.5 px-4 text-left text-xs font-medium text-gray-500 w-24">结果</th>
              <th class="py-2.5 px-4 text-left text-xs font-medium text-gray-500 w-20">耗时</th>
              <th class="py-2.5 px-4 text-left text-xs font-medium text-gray-500 w-40">时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading.logs">
              <td colspan="5" class="py-8 text-center text-gray-400">
                <el-icon class="is-loading" :size="20" style="margin: 0 auto;">
                  <Loading />
                </el-icon>
              </td>
            </tr>
            <tr v-else-if="logs.length === 0">
              <td colspan="5" class="py-8 text-center text-gray-400">暂无调试日志</td>
            </tr>
            <tr
              v-else
              v-for="(log, i) in logs"
              :key="log.oid || i"
              class="border-b border-gray-50 hover:bg-gray-50"
            >
              <td class="py-2 px-4">
                <span class="inline-flex px-1.5 py-0.5 rounded text-xs font-mono bg-blue-100 text-blue-700">
                  {{ log.debug_type }}
                </span>
              </td>
              <td class="py-2 px-4 text-gray-600">{{ log.test_target || '-' }}</td>
              <td class="py-2 px-4">
                <span
                  :class="[
                    'text-xs font-medium',
                    log.test_result === 'SUCCESS' ? 'text-green-600' :
                    log.test_result === 'FAILED' ? 'text-red-600' : 'text-gray-600'
                  ]"
                >
                  {{ log.test_result || '-' }}
                </span>
              </td>
              <td class="py-2 px-4 text-gray-500">
                {{ log.duration_ms ? `${log.duration_ms}ms` : '-' }}
              </td>
              <td class="py-2 px-4 text-gray-400 text-xs">
                {{ log.created_at ? new Date(log.created_at).toLocaleString('zh-CN') : '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 工程调试页面 — iAGS ProjectDebug 集成
 * HMI版本查询、数据库测试、系统诊断工具
 * V2.0 Vue3 重构版本
 */
import { ref, reactive, onMounted } from 'vue'
import { get, post, del } from '@/api/request'
import {
  ArrowLeft,
  Refresh,
  CircleCheck,
  CircleClose,
  Loading,
  Clock,
  Delete,
  Monitor,
  Setting,
  List,
  Document
} from '@element-plus/icons-vue'

// API 基础路径
const API_BASE = '/api/debug'

// HMI / 诊断状态
const hmi = ref(null)
const diag = ref(null)
const dbTestResult = ref(null)
const logs = ref([])

// 加载状态
const loading = reactive({
  hmi: false,
  diag: false,
  db: false,
  logs: false
})

/**
 * 获取HMI版本信息
 */
const fetchHmi = async () => {
  loading.hmi = true
  try {
    const data = await get(`${API_BASE}/hmi`)
    hmi.value = data
  } catch (e) {
    // 错误处理
  }
  loading.hmi = false
}

/**
 * 获取系统诊断信息
 */
const fetchDiagnostics = async () => {
  loading.diag = true
  try {
    const data = await get(`${API_BASE}/diagnostics`)
    diag.value = data
  } catch (e) {
    // 错误处理
  }
  loading.diag = false
}

/**
 * 测试数据库连接
 */
const testDb = async () => {
  loading.db = true
  dbTestResult.value = null
  try {
    const data = await post(`${API_BASE}/db-test`, {})
    dbTestResult.value = data
  } catch (e) {
    dbTestResult.value = { status: '失败', duration: 0 }
  }
  loading.db = false
  // 延迟获取日志
  setTimeout(() => fetchLogs(), 500)
}

/**
 * 获取调试日志列表
 */
const fetchLogs = async () => {
  loading.logs = true
  try {
    const data = await get(`${API_BASE}/logs`)
    logs.value = Array.isArray(data) ? data : []
  } catch (e) {
    logs.value = []
  }
  loading.logs = false
}

/**
 * 清空调试日志
 */
const clearLogs = async () => {
  try {
    await del(`${API_BASE}/logs`)
    logs.value = []
  } catch (e) {
    // 错误处理
  }
}

// 页面加载时获取初始数据
onMounted(() => {
  fetchHmi()
  fetchDiagnostics()
  fetchLogs()
})
</script>
