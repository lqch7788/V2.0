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
              <Coin />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">备份恢复</h1>
            <p class="text-gray-500">管理系统数据备份和恢复操作</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <el-icon :size="20" color="#10b981">
              <Coin />
            </el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ records.length }}</p>
            <p class="text-xs text-gray-500">备份记录</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <el-icon :size="20" color="#22c55e">
              <CircleCheck />
            </el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ successCount }}</p>
            <p class="text-xs text-gray-500">成功备份</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <el-icon :size="20" color="#ef4444">
              <CircleClose />
            </el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ failedCount }}</p>
            <p class="text-xs text-gray-500">失败备份</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <el-icon :size="20" color="#3b82f6">
              <Monitor />
            </el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ activeStrategyCount }}</p>
            <p class="text-xs text-gray-500">运行中策略</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab导航 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100">
      <div class="flex border-b">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="handleTabChange(tab.key)"
          :class="[
            'flex items-center gap-2 px-6 py-3 font-medium transition-colors',
            activeTab === tab.key
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          <el-icon :size="18">
            <component :is="tab.icon" />
          </el-icon>
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <div class="relative max-w-md">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索备份名称或备注..."
              clearable
              @clear="handleSearchClear"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
        <template v-if="activeTab === 'record'">
          <el-button type="primary" :loading="backingUp" @click="handleCreateBackup">
            <el-icon v-if="!backingUp"><Download /></el-icon>
            {{ backingUp ? '备份中...' : '立即备份' }}
          </el-button>
          <el-button @click="handleExportRecords">
            <el-icon><Upload /></el-icon>
            导出记录
          </el-button>
        </template>
        <template v-if="activeTab === 'strategy'">
          <el-button type="primary" @click="showStrategyModal = true">
            <el-icon><Plus /></el-icon>
            新增策略
          </el-button>
        </template>
      </div>
    </div>

    <!-- 备份记录表格 -->
    <div v-if="activeTab === 'record'" class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <el-table :data="paginatedRecords" stripe style="width: 100%">
        <el-table-column prop="name" label="备份名称" min-width="180">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-icon :size="16" :color="getStatusIconColor(row.status)">
                <component :is="getStatusIcon(row.status)" />
              </el-icon>
              <div>
                <p class="text-sm font-bold text-gray-800">{{ row.name }}</p>
                <p class="text-xs text-gray-500 max-w-xs truncate">{{ row.remark }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'full' ? 'primary' : 'warning'" size="small">
              {{ row.type === 'full' ? '全量' : '增量' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="mode" label="模式" width="100">
          <template #default="{ row }">
            <el-tag :type="row.mode === 'auto' ? 'info' : 'warning'" size="small">
              {{ row.mode === 'auto' ? '自动' : '手动' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="160" />
        <el-table-column prop="duration" label="耗时" width="100" />
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-button
                link
                type="primary"
                :disabled="row.status !== 'success'"
                @click="openRestoreModal(row)"
                :title="row.status !== 'success' ? '仅成功的备份可恢复' : '恢复'"
                size="small"
              >
                <el-icon><Refresh /></el-icon>
              </el-button>
              <el-button
                link
                type="primary"
                @click="handleDownload(row)"
                title="下载"
                size="small"
              >
                <el-icon><Download /></el-icon>
              </el-button>
              <el-button
                link
                type="danger"
                @click="handleDeleteBackup(row)"
                title="删除"
                size="small"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="flex items-center justify-end px-4 py-3 border-t border-gray-200">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredRecords.length"
          layout="prev, pager, next"
          background
        />
      </div>
    </div>

    <!-- 备份策略表格 -->
    <div v-if="activeTab === 'strategy'" class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <el-table :data="strategies" stripe style="width: 100%">
        <el-table-column prop="name" label="策略名称" min-width="150" />
        <el-table-column prop="type" label="备份类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === 'full' ? 'primary' : 'warning'" size="small">
              {{ row.type === 'full' ? '全量' : '增量' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="schedule" label="执行周期" width="150" />
        <el-table-column prop="retention" label="保留份数" width="100">
          <template #default="{ row }">
            {{ row.retention }}份
          </template>
        </el-table-column>
        <el-table-column prop="target" label="备份对象" width="150" />
        <el-table-column prop="lastRun" label="上次执行" width="160" />
        <el-table-column prop="nextRun" label="下次执行" width="160" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '运行中' : '已暂停' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-button
                link
                type="primary"
                @click="handleToggleStrategy(row)"
                :title="row.status === 'active' ? '暂停' : '启动'"
                size="small"
              >
                <el-icon v-if="row.status === 'active'"><Timer /></el-icon>
                <el-icon v-else><Refresh /></el-icon>
              </el-button>
              <el-button
                link
                type="danger"
                @click="handleDeleteStrategy(row)"
                title="删除"
                size="small"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 恢复确认模态框 -->
    <el-dialog
      v-model="showRestoreModal"
      title="数据恢复确认"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="space-y-4">
        <!-- 警告提示 -->
        <div class="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
          <el-icon :size="20" color="#f59e0b" class="flex-shrink-0 mt-0.5">
            <Warning />
          </el-icon>
          <div>
            <p class="font-medium text-amber-800">警告：此操作将覆盖当前数据</p>
            <p class="text-sm text-amber-600 mt-1">恢复前会自动创建当前数据的备份</p>
          </div>
        </div>
        <!-- 备份信息 -->
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-500">备份名称：</span>
            <span class="text-gray-800 font-bold">{{ selectedBackup?.name }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">备份时间：</span>
            <span class="text-gray-800">{{ selectedBackup?.startTime }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">备份大小：</span>
            <span class="text-gray-800">{{ selectedBackup?.size }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showRestoreModal = false">取消</el-button>
        <el-button type="danger" @click="handleRestore">确认恢复</el-button>
      </template>
    </el-dialog>

    <!-- 新增策略模态框 -->
    <el-dialog
      v-model="showStrategyModal"
      title="新增备份策略"
      width="550px"
      :close-on-click-modal="false"
    >
      <el-form ref="strategyFormRef" :model="strategyForm" :rules="strategyFormRules" label-width="100px">
        <el-form-item label="策略名称" prop="name">
          <el-input v-model="strategyForm.name" placeholder="请输入策略名称" />
        </el-form-item>
        <el-form-item label="备份类型" prop="type">
          <el-select v-model="strategyForm.type" placeholder="请选择备份类型" style="width: 100%">
            <el-option label="全量备份" value="full" />
            <el-option label="增量备份" value="incremental" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行周期" prop="schedule">
          <el-input v-model="strategyForm.schedule" placeholder="如：每天 02:00 或 每周一 01:00" />
        </el-form-item>
        <el-form-item label="保留份数" prop="retention">
          <el-input-number v-model="strategyForm.retention" :min="1" :max="30" />
        </el-form-item>
        <el-form-item label="备份对象" prop="target">
          <el-select v-model="strategyForm.target" placeholder="请选择备份对象" style="width: 100%">
            <el-option label="全部数据库" value="全部数据库" />
            <el-option label="核心业务数据" value="核心业务数据" />
            <el-option label="配置文件" value="配置文件" />
            <el-option label="系统日志" value="系统日志" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showStrategyModal = false">取消</el-button>
        <el-button type="success" @click="handleAddStrategy">创建策略</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  CircleCheck, CircleClose, Download, Upload, Delete,
  Search, Plus, ArrowLeft,
  Coin, Folder, Monitor, Setting, Timer, Refresh
} from '@element-plus/icons-vue'
import { enhancedApiClient } from '@/lib/apiClient'

// 备份记录类型
const BackupRecord = {
  id: String,
  name: String,
  type: String, // 'full' | 'incremental'
  size: String,
  status: String, // 'success' | 'failed' | 'in_progress'
  mode: String, // 'auto' | 'manual'
  startTime: String,
  endTime: String,
  duration: String,
  filePath: String,
  remark: String
}

// 备份策略类型
const BackupStrategy = {
  id: String,
  name: String,
  type: String, // 'full' | 'incremental'
  schedule: String,
  retention: Number,
  status: String, // 'active' | 'paused'
  lastRun: String,
  nextRun: String,
  target: String
}

// 状态
const activeTab = ref('record')
const records = ref([])
const strategies = ref([])
const loading = ref(true)
const searchKeyword = ref('')
const showStrategyModal = ref(false)
const showRestoreModal = ref(false)
const selectedBackup = ref(null)
const currentPage = ref(1)
const backingUp = ref(false)
const pageSize = 10

// Tab配置
const tabs = [
  { key: 'record', icon: Coin, label: '备份记录' },
  { key: 'strategy', icon: Setting, label: '备份策略' }
]

// 策略表单
const strategyFormRef = ref()
const strategyForm = reactive({
  name: '',
  type: 'full',
  schedule: '',
  retention: 7,
  target: '全部数据库'
})

// 策略表单验证规则
const strategyFormRules = {
  name: [{ required: true, message: '请输入策略名称', trigger: 'blur' }],
  schedule: [{ required: true, message: '请输入执行周期', trigger: 'blur' }]
}

// 计算属性
const filteredRecords = computed(() => {
  if (!searchKeyword.value) return records.value
  return records.value.filter(r =>
    r.name.includes(searchKeyword.value) || r.remark.includes(searchKeyword.value)
  )
})

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredRecords.value.slice(start, start + pageSize)
})

const successCount = computed(() => records.value.filter(r => r.status === 'success').length)
const failedCount = computed(() => records.value.filter(r => r.status === 'failed').length)
const activeStrategyCount = computed(() => strategies.value.filter(s => s.status === 'active').length)

// 获取状态图标
const getStatusIcon = (status) => {
  switch (status) {
    case 'success': return CircleCheck
    case 'failed': return CircleClose
    case 'in_progress': return 'Loading'
    default: return CircleClose
  }
}

// 获取状态图标颜色
const getStatusIconColor = (status) => {
  switch (status) {
    case 'success': return '#22c55e'
    case 'failed': return '#ef4444'
    case 'in_progress': return '#f59e0b'
    default: return '#6b7280'
  }
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case 'success': return 'success'
    case 'failed': return 'danger'
    case 'in_progress': return 'warning'
    default: return 'info'
  }
}

// 获取状态标签文本
const getStatusLabel = (status) => {
  switch (status) {
    case 'success': return '成功'
    case 'failed': return '失败'
    case 'in_progress': return '进行中'
    default: return '未知'
  }
}

// 加载数据
const fetchData = async () => {
  loading.value = true
  try {
    const [recRes, strRes] = await Promise.all([
      enhancedApiClient.get('/backup/records'),
      enhancedApiClient.get('/backup/strategies')
    ])
    records.value = Array.isArray(recRes) ? recRes : (recRes?.data || [])
    strategies.value = Array.isArray(strRes) ? strRes : (strRes?.data || [])
  } catch (err) {
    console.error('获取备份数据失败:', err)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// Tab切换
const handleTabChange = (key) => {
  activeTab.value = key
  currentPage.value = 1
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 搜索清除
const handleSearchClear = () => {
  searchKeyword.value = ''
  currentPage.value = 1
}

// 创建备份
const handleCreateBackup = async () => {
  backingUp.value = true
  try {
    await enhancedApiClient.post('/backup/create', { remark: '手动备份' })
    ElMessage.success('备份创建成功')
    await fetchData()
  } catch (err) {
    console.error('备份失败:', err)
    ElMessage.error('备份失败，请检查服务器')
  } finally {
    backingUp.value = false
  }
}

// 删除备份
const handleDeleteBackup = async (record) => {
  try {
    await ElMessageBox.confirm(`确定删除备份 "${record.name}" 吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const filename = record.filePath.split(/[/\\]/).pop()
    if (filename) {
      await enhancedApiClient.delete(`/backup/${filename}`)
    }
    ElMessage.success('删除成功')
    await fetchData()
  } catch (err) {
    if (err !== 'cancel') {
      console.error('删除备份失败:', err)
      ElMessage.error('删除失败')
    }
  }
}

// 打开恢复模态框
const openRestoreModal = (record) => {
  selectedBackup.value = record
  showRestoreModal.value = true
}

// 恢复备份
const handleRestore = async () => {
  if (!selectedBackup.value) return
  try {
    await ElMessageBox.confirm('数据恢复将覆盖当前数据库，确定继续？建议先创建当前数据备份。', '数据恢复确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const filename = selectedBackup.value.filePath.split(/[/\\]/).pop()
    if (filename) {
      await enhancedApiClient.post(`/backup/restore/${filename}`)
    }
    showRestoreModal.value = false
    ElMessage.success('数据恢复成功！服务器将自动重启以加载恢复的数据。')
  } catch (err) {
    if (err !== 'cancel') {
      console.error('恢复失败:', err)
      ElMessage.error('数据恢复失败')
    }
  }
}

// 新增策略
const handleAddStrategy = async () => {
  if (!strategyFormRef.value) return
  try {
    await strategyFormRef.value.validate()
    await enhancedApiClient.post('/backup/strategies', strategyForm)
    ElMessage.success('创建策略成功')
    showStrategyModal.value = false
    // 重置表单
    Object.assign(strategyForm, {
      name: '',
      type: 'full',
      schedule: '',
      retention: 7,
      target: '全部数据库'
    })
    await fetchData()
  } catch (err) {
    if (err !== false) {
      console.error('创建策略失败:', err)
      ElMessage.error('创建策略失败')
    }
  }
}

// 切换策略状态
const handleToggleStrategy = async (strategy) => {
  try {
    await enhancedApiClient.put(`/backup/strategies/${strategy.id}/toggle`)
    ElMessage.success(strategy.status === 'active' ? '策略已暂停' : '策略已启动')
    await fetchData()
  } catch (err) {
    console.error('切换策略状态失败:', err)
    ElMessage.error('操作失败')
  }
}

// 删除策略
const handleDeleteStrategy = async (strategy) => {
  try {
    await ElMessageBox.confirm(`确定删除策略 "${strategy.name}" 吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await enhancedApiClient.delete(`/backup/strategies/${strategy.id}`)
    ElMessage.success('删除成功')
    await fetchData()
  } catch (err) {
    if (err !== 'cancel') {
      console.error('删除策略失败:', err)
      ElMessage.error('删除失败')
    }
  }
}

// 下载备份
const handleDownload = (record) => {
  const filename = record.filePath.split(/[/\\]/).pop()
  if (filename) {
    window.open(`/api/backup/download/${filename}`, '_blank')
  }
}

// 导出记录
const handleExportRecords = () => {
  const csv = ['名称,类型,大小,状态,模式,开始时间,耗时,备注']
    .concat(records.value.map(r =>
      `${r.name},${r.type === 'full' ? '全量' : '增量'},${r.size},${r.status},${r.mode === 'auto' ? '自动' : '手动'},${r.startTime},${r.duration},${r.remark}`
    ))
    .join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `备份记录_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

// 组件挂载时加载数据
onMounted(() => {
  fetchData()
})
</script>
