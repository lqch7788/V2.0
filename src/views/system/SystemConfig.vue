<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <!-- 返回按钮 -->
        <a
          href="/settings"
          class="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hover:from-gray-200 hover:to-gray-300 transition-colors"
          title="返回系统设置"
        >
          <el-icon :size="20"><ArrowLeft /></el-icon>
        </a>
        <!-- 标题图标 -->
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" color="white"><Setting /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">系统参数配置</h1>
          <p class="text-gray-500">管理系统运行参数、阈值、开关等配置项</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center">
            <el-icon :size="20" color="#64748b"><Setting /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ configs.length }}</p>
            <p class="text-xs text-gray-500">配置项总数</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <!-- 搜索框 -->
        <el-input
          v-model="searchTerm"
          placeholder="搜索配置键或描述..."
          clearable
          size="small"
          class="w-48"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <!-- 刷新按钮 -->
        <el-button size="small" @click="loadConfigs" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <!-- 导出按钮 -->
        <el-button size="small" :disabled="configs.length === 0" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        <!-- 新增按钮 -->
        <el-button size="small" @click="openAddModal">
          <el-icon><Plus /></el-icon>
          新增配置
        </el-button>
      </div>
    </div>

    <!-- 分类Tab -->
    <div class="flex items-center gap-1 border-b border-gray-200 overflow-x-auto">
      <button
        v-for="cat in CATEGORY_TABS"
        :key="cat.value"
        @click="activeCategory = cat.value"
        :class="[
          'px-4 py-2 rounded-t-lg text-base font-bold transition-colors whitespace-nowrap',
          activeCategory === cat.value
            ? 'bg-green-600 text-white'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        ]"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading && configs.length === 0" class="flex items-center justify-center h-64">
      <el-icon class="is-loading" :size="32" color="#059669"><Loading /></el-icon>
      <span class="ml-2 text-gray-600">加载中...</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error && configs.length === 0" class="flex items-center justify-center h-64">
      <el-icon :size="32" color="#ef4444"><WarningFilled /></el-icon>
      <span class="ml-2 text-red-600">{{ error }}</span>
    </div>

    <!-- 配置内容 - 生长引擎TAB -->
    <div v-else-if="activeCategory === 'crop'">
      <CropGrowthConfigPanel />
    </div>

    <!-- 配置内容 - 其他分类 -->
    <div v-else-if="filteredConfigs.length === 0" class="bg-white rounded-lg shadow p-12 text-center max-w-2xl">
      <el-icon :size="48" color="#d1d5db"><Setting /></el-icon>
      <p class="text-gray-500 mt-3">
        "{{ CATEGORY_TABS.find(t => t.value === activeCategory)?.label }}"分类下暂无配置
      </p>
    </div>

    <div v-else class="bg-white rounded-lg shadow max-w-4xl">
      <div class="divide-y divide-gray-300 max-h-[520px] overflow-y-auto">
        <div
          v-for="config in filteredConfigs"
          :key="config.id"
          class="px-4 py-3 hover:bg-blue-100 transition-colors"
        >
          <div class="flex items-center justify-between">
            <!-- 左侧：描述和类型 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-medium text-gray-900 text-sm truncate">
                  {{ config.description || config.configKey }}
                </span>
                <span :class="getTypeBadgeClass(config.configType)">
                  {{ getTypeLabel(config.configType) }}
                </span>
              </div>
              <p class="text-xs text-gray-400 mt-0.5 font-mono truncate">{{ config.configKey }}</p>
            </div>

            <!-- 右侧：值和操作 -->
            <div class="flex items-center gap-4 ml-4 min-w-0">
              <div class="flex-1 min-w-0">
                <!-- 编辑状态 -->
                <div v-if="editingId === config.id">
                  <el-select
                    v-if="config.configType === 'boolean'"
                    v-model="editValue"
                    class="w-24"
                    size="small"
                  >
                    <el-option label="是" value="true" />
                    <el-option label="否" value="false" />
                  </el-select>
                  <DelegationRulesEditor
                    v-else-if="config.configType === 'json' && config.configKey === 'approval.delegation.rules'"
                    v-model="editValue"
                  />
                  <el-input
                    v-else-if="config.configType === 'json'"
                    v-model="editValue"
                    type="textarea"
                    :rows="6"
                    class="w-full min-w-[300px] font-mono text-xs"
                    placeholder="JSON格式"
                  />
                  <el-input
                    v-else
                    :type="config.configType === 'number' ? 'number' : 'text'"
                    v-model="editValue"
                    size="small"
                    class="w-full"
                  />
                </div>
                <!-- 非编辑状态 -->
                <div v-else>
                  <!-- 布尔类型 -->
                  <span
                    v-if="config.configType === 'boolean'"
                    :class="['text-sm font-medium', config.configValue === 'true' ? 'text-green-600' : 'text-gray-500']"
                  >
                    {{ config.configValue === 'true' ? '是' : '否' }}
                  </span>
                  <!-- 委托规则专用预览 -->
                  <DelegationRulesPreview
                    v-else-if="config.configType === 'json' && config.configKey === 'approval.delegation.rules'"
                    :config="config"
                    @edit="startEdit(config)"
                  />
                  <!-- 其他JSON类型 -->
                  <code
                    v-else-if="config.configType === 'json'"
                    class="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded max-w-[350px] truncate block cursor-pointer hover:bg-blue-50 hover:text-blue-700 border border-gray-200"
                    :title="'点击展开查看/编辑完整JSON'"
                    @click="startEdit(config)"
                  >
                    {{ truncateJson(config.configValue) }}
                  </code>
                  <!-- 其他类型 -->
                  <span v-else class="text-sm text-gray-900">{{ config.configValue }}</span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex items-center gap-1">
                <template v-if="editingId === config.id">
                  <el-button
                    size="small"
                    type="success"
                    @click="handleSaveEdit(config.id)"
                    circle
                    title="保存"
                  >
                    <el-icon><Select /></el-icon>
                  </el-button>
                  <el-button
                    size="small"
                    @click="handleCancelEdit"
                    circle
                    title="取消"
                  >
                    <el-icon><Close /></el-icon>
                  </el-button>
                </template>
                <template v-else>
                  <el-button
                    size="default"
                    class="edit-btn"
                    @click="startEdit(config)"
                    circle
                    title="编辑"
                  >
                    <el-icon class="edit-icon"><Edit /></el-icon>
                  </el-button>
                  <el-button
                    size="default"
                    class="delete-btn"
                    @click="handleDeleteConfig(config.id)"
                    circle
                    title="删除"
                  >
                    <el-icon class="delete-icon"><Delete /></el-icon>
                  </el-button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页信息 -->
      <div
        v-if="filteredConfigs.length > PAGE_SIZE"
        class="px-4 py-2 text-center text-xs text-gray-400 border-t border-gray-100 bg-gray-50 rounded-b-lg"
      >
        共 {{ filteredConfigs.length }} 条，滚动查看更多
      </div>
    </div>

    <!-- 新增配置弹窗 -->
    <el-dialog
      v-model="showAddModal"
      :show-close="false"
      :close-on-click-modal="false"
      class="config-add-dialog"
      :modal="true"
      :lock-scroll="true"
    >
      <!-- 拖拽标题栏 -->
      <template #header>
        <div
          class="dialog-header"
          @mousedown="handleDragStart"
        >
          <span class="text-lg font-semibold text-white">新增系统配置</span>
          <div class="flex items-center gap-1">
            <button
              @click="toggleMaximize"
              class="p-1.5 rounded hover:bg-white/20 transition-colors"
              :title="isMaximized ? '还原' : '最大化'"
            >
              <el-icon :size="18" color="white">
                <component :is="isMaximized ? 'SemiSelect' : 'FullScreen'" />
              </el-icon>
            </button>
          </div>
        </div>
      </template>
      <el-form :model="newConfig" label-width="80px" class="grid grid-cols-2 gap-4">
        <el-form-item label="配置键" required>
          <el-input
            v-model="newConfig.configKey"
            placeholder="如：task_accept_warning_hours"
          />
        </el-form-item>
        <el-form-item label="配置值" required>
          <el-input
            v-if="newConfig.configType !== 'json'"
            v-model="newConfig.configValue"
            placeholder="配置值"
          />
          <el-input
            v-else
            v-model="newConfig.configValue"
            type="textarea"
            :rows="5"
            placeholder='JSON格式，如：{"key": "value"}'
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="newConfig.configType" class="w-full">
            <el-option label="文本" value="string" />
            <el-option label="数字" value="number" />
            <el-option label="布尔" value="boolean" />
            <el-option label="JSON" value="json" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="newConfig.category" class="w-full">
            <el-option
              v-for="cat in CATEGORY_TABS"
              :key="cat.value"
              :label="cat.label"
              :value="cat.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述说明" class="col-span-2">
          <el-input
            v-model="newConfig.description"
            type="textarea"
            :rows="2"
            placeholder="参数用途说明"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeAddModal">取消</el-button>
        <el-button type="primary" @click="handleAddConfig">添加</el-button>
      </template>

      <!-- 缩放拖拽手柄（最大化时隐藏） -->
      <template v-if="!isMaximized">
        <div class="resize-handle resize-nw" @mousedown.stop.prevent="(e) => handleResizeStart(e, 'nw')"></div>
        <div class="resize-handle resize-ne" @mousedown.stop.prevent="(e) => handleResizeStart(e, 'ne')"></div>
        <div class="resize-handle resize-sw" @mousedown.stop.prevent="(e) => handleResizeStart(e, 'sw')"></div>
        <div class="resize-handle resize-se" @mousedown.stop.prevent="(e) => handleResizeStart(e, 'se')"></div>
        <div class="resize-handle resize-n" @mousedown.stop.prevent="(e) => handleResizeStart(e, 'n')"></div>
        <div class="resize-handle resize-s" @mousedown.stop.prevent="(e) => handleResizeStart(e, 's')"></div>
        <div class="resize-handle resize-w" @mousedown.stop.prevent="(e) => handleResizeStart(e, 'w')"></div>
        <div class="resize-handle resize-e" @mousedown.stop.prevent="(e) => handleResizeStart(e, 'e')"></div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Setting,
  Plus,
  Edit,
  Delete,
  Download,
  ArrowLeft,
  Select,
  Close,
  Loading,
  WarningFilled,
  FullScreen,
  SemiSelect,
  Search,
  Refresh
} from '@element-plus/icons-vue'
import { useSystemConfigStore, CATEGORY_TABS } from '@/stores/modules/systemConfig'
import CropGrowthConfigPanel from './CropGrowthConfigPanel.vue'

// ==================== Store ====================
const store = useSystemConfigStore()
const configs = computed(() => store.configs)
const loading = computed(() => store.loading)
const error = computed(() => store.error)

// ==================== 常量 ====================
const PAGE_SIZE = 10
const MODAL_MIN_WIDTH = 480
const MODAL_MIN_HEIGHT = 360

// ==================== 状态 ====================
const activeCategory = ref('system')
const searchTerm = ref('')
const editingId = ref(null)
const editValue = ref('')
const showAddModal = ref(false)
const isMaximized = ref(false)
const newConfig = ref({
  configKey: '',
  configValue: '',
  configType: 'string',
  category: 'system',
  description: ''
})

// 弹窗拖拽状态
const dialogRef = ref(null)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0, left: 0, top: 0 })

// 弹窗缩放状态
const isResizing = ref(false)
const resizeDir = ref('')
const resizeStart = ref({ x: 0, y: 0, w: 0, h: 0, left: 0, top: 0 })

// ==================== 计算属性 ====================
/** 根据分类筛选配置 */
const filteredConfigs = computed(() => {
  let result = configs.value.filter(c => c.category === activeCategory.value)
  // 搜索过滤
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    result = result.filter(c =>
      c.configKey.toLowerCase().includes(term) ||
      (c.description || '').toLowerCase().includes(term) ||
      (c.configValue || '').toLowerCase().includes(term)
    )
  }
  return result
})

// ==================== 方法 ====================

/** 组件挂载时加载数据 */
onMounted(() => {
  store.loadConfigs()
})

/** 获取类型标签显示 */
const getTypeLabel = (type) => {
  const map = {
    string: '文本',
    number: '数字',
    boolean: '布尔',
    json: 'JSON'
  }
  return map[type] || '文本'
}

/** 获取类型标签样式 - 与V1.1 TypeBadge一致 */
const getTypeBadgeClass = (type) => {
  const map = {
    string: 'px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700',
    number: 'px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700',
    boolean: 'px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700',
    json: 'px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700'
  }
  return map[type] || map.string
}

/** 截断JSON显示 */
const truncateJson = (value) => {
  const maxLen = 150
  if (!value) return ''
  return value.length > maxLen ? value.substring(0, maxLen) + '…' : value
}

/** 开始编辑 */
const startEdit = (config) => {
  editingId.value = config.id
  editValue.value = config.configValue
}

/** 保存编辑 */
const handleSaveEdit = async (id) => {
  try {
    await store.updateConfig(id, { configValue: editValue.value })
    editingId.value = null
    editValue.value = ''
  } catch (err) {
    ElMessage.error('更新配置失败')
  }
}

/** 取消编辑 */
const handleCancelEdit = () => {
  editingId.value = null
  editValue.value = ''
}

/** 删除配置 */
const handleDeleteConfig = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个配置项吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await store.removeConfig(id)
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除配置失败')
    }
  }
}

/** 打开新增弹窗 */
const openAddModal = () => {
  newConfig.value = {
    configKey: '',
    configValue: '',
    configType: 'string',
    category: 'system',
    description: ''
  }
  showAddModal.value = true
}

/** 关闭新增弹窗 */
const closeAddModal = () => {
  showAddModal.value = false
  newConfig.value = {
    configKey: '',
    configValue: '',
    configType: 'string',
    category: 'system',
    description: ''
  }
}

/** 添加配置 */
const handleAddConfig = async () => {
  if (!newConfig.value.configKey) {
    ElMessage.warning('请填写配置键')
    return
  }
  try {
    const result = await store.addConfig({
      configKey: newConfig.value.configKey,
      configValue: newConfig.value.configValue || '',
      configType: newConfig.value.configType || 'string',
      category: newConfig.value.category || 'system',
      description: newConfig.value.description || ''
    })
    if (result) {
      closeAddModal()
    }
  } catch (err) {
    ElMessage.error('创建配置失败')
  }
}

/** 导出CSV */
const handleExport = () => {
  const csv = ['配置键,配置值,类型,分类,描述,状态']
    .concat(configs.value.map(c =>
      `${c.configKey},"${c.configValue}",${c.configType},${c.category},"${c.description}",${c.isActive ? '启用' : '禁用'}`
    ))
    .join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `系统配置_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ==================== 委托规则组件 ====================
// 导入委托规则预览和编辑器组件（自动在模板中可用）
import DelegationRulesPreview from './components/DelegationRulesPreview.vue'
import DelegationRulesEditor from './components/DelegationRulesEditor.vue'

// ==================== 弹窗拖拽/缩放处理 ====================

/** 拖拽开始 */
const handleDragStart = (e) => {
  if (isMaximized.value) return
  const dialogEl = e.target.closest('.el-dialog')
  if (!dialogEl) return
  // 排除按钮点击
  if (e.target.closest('button')) return
  e.preventDefault()
  isDragging.value = true
  const rect = dialogEl.getBoundingClientRect()
  dragStart.value = { x: e.clientX, y: e.clientY, left: rect.left, top: rect.top }
}

/** 缩放开始 */
const handleResizeStart = (e, dir) => {
  if (isMaximized.value) return
  e.preventDefault()
  e.stopPropagation()
  isResizing.value = true
  resizeDir.value = dir
  const dialogEl = document.querySelector('.config-add-dialog .el-dialog')
  if (dialogEl) {
    const rect = dialogEl.getBoundingClientRect()
    resizeStart.value = { x: e.clientX, y: e.clientY, w: rect.width, h: rect.height, left: rect.left, top: rect.top }
  }
}

/** 鼠标移动处理 */
const handleMouseMove = (e) => {
  if (!isDragging.value && !isResizing.value) return

  if (isDragging.value) {
    const dialogEl = document.querySelector('.config-add-dialog .el-dialog')
    if (dialogEl) {
      const deltaX = e.clientX - dragStart.value.x
      const deltaY = e.clientY - dragStart.value.y
      dialogEl.style.position = 'fixed'
      dialogEl.style.left = `${dragStart.value.left + deltaX}px`
      dialogEl.style.top = `${dragStart.value.top + deltaY}px`
      dialogEl.style.margin = '0'
    }
  }

  if (isResizing.value) {
    const dx = e.clientX - resizeStart.value.x
    const dy = e.clientY - resizeStart.value.y
    let newW = resizeStart.value.w
    let newH = resizeStart.value.h
    let newLeft = resizeStart.value.left
    let newTop = resizeStart.value.top

    if (resizeDir.value.includes('e')) newW = Math.max(MODAL_MIN_WIDTH, resizeStart.value.w + dx)
    if (resizeDir.value.includes('s')) newH = Math.max(MODAL_MIN_HEIGHT, resizeStart.value.h + dy)
    if (resizeDir.value.includes('w')) {
      newW = Math.max(MODAL_MIN_WIDTH, resizeStart.value.w - dx)
      newLeft = resizeStart.value.left + (resizeStart.value.w - newW)
    }
    if (resizeDir.value.includes('n')) {
      newH = Math.max(MODAL_MIN_HEIGHT, resizeStart.value.h - dy)
      newTop = resizeStart.value.top + (resizeStart.value.h - newH)
    }

    const dialogEl = document.querySelector('.config-add-dialog .el-dialog')
    if (dialogEl) {
      dialogEl.style.position = 'fixed'
      dialogEl.style.width = `${newW}px`
      dialogEl.style.height = `${newH}px`
      dialogEl.style.maxWidth = 'none'
      dialogEl.style.maxHeight = 'none'
      dialogEl.style.left = `${newLeft}px`
      dialogEl.style.top = `${newTop}px`
      dialogEl.style.margin = '0'
    }
  }
}

/** 鼠标释放 */
const handleMouseUp = () => {
  isDragging.value = false
  isResizing.value = false
  resizeDir.value = ''
}

/** 切换最大化 */
const toggleMaximize = () => {
  const dialogEl = document.querySelector('.config-add-dialog .el-dialog')
  if (!isMaximized.value && dialogEl) {
    dialogEl.style.width = '100vw'
    dialogEl.style.height = '100vh'
    dialogEl.style.maxWidth = 'none'
    dialogEl.style.maxHeight = 'none'
    dialogEl.style.left = '0'
    dialogEl.style.top = '0'
    dialogEl.style.borderRadius = '0'
  } else if (dialogEl) {
    dialogEl.style.width = ''
    dialogEl.style.height = ''
    dialogEl.style.maxWidth = ''
    dialogEl.style.maxHeight = ''
    dialogEl.style.left = ''
    dialogEl.style.top = ''
    dialogEl.style.borderRadius = ''
  }
  isMaximized.value = !isMaximized.value
}

// 挂载/卸载全局鼠标事件
onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<style scoped>
/* 配置项悬停效果 */
.hover\:bg-blue-100:hover {
  background-color: rgb(239 246 255);
}

/* 弹窗样式覆盖 */
:deep(.config-add-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.config-add-dialog .el-dialog) {
  width: 560px;
  max-width: 90vw;
  border-radius: 12px;
}

:deep(.config-add-dialog .el-dialog__body) {
  padding: 20px 24px;
}

/* 拖拽标题栏 */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(to right, #10b981, #059669);
  cursor: move;
  user-select: none;
}

/* 缩放手柄 */
.resize-handle {
  position: absolute;
  z-index: 10;
}
.resize-nw { top: 0; left: 0; width: 8px; height: 8px; cursor: nw-resize; }
.resize-ne { top: 0; right: 0; width: 8px; height: 8px; cursor: ne-resize; }
.resize-sw { bottom: 0; left: 0; width: 8px; height: 8px; cursor: sw-resize; }
.resize-se { bottom: 0; right: 0; width: 8px; height: 8px; cursor: se-resize; }
.resize-n { top: 0; left: 50%; transform: translateX(-50%); width: 40px; height: 6px; cursor: n-resize; }
.resize-s { bottom: 0; left: 50%; transform: translateX(-50%); width: 40px; height: 6px; cursor: s-resize; }
.resize-w { left: 0; top: 50%; transform: translateY(-50%); width: 6px; height: 40px; cursor: w-resize; }
.resize-e { right: 0; top: 50%; transform: translateY(-50%); width: 6px; height: 40px; cursor: e-resize; }

/* 编辑按钮样式 - 蓝色图标无边框，与V1.1一致 */
.edit-btn {
  background-color: transparent !important;
  border: none !important;
  color: #3b82f6;
  width: 24px;
  height: 24px;
  padding: 0;
}
.edit-btn:hover {
  background-color: #dbeafe !important;
  color: #1d4ed8 !important;
}
.edit-icon {
  font-size: 16px;
}

/* 删除按钮样式 - 红色图标无边框，与V1.1一致 */
.delete-btn {
  background-color: transparent !important;
  border: none !important;
  color: #ef4444;
  width: 24px;
  height: 24px;
  padding: 0;
}
.delete-btn:hover {
  background-color: #fee2e2 !important;
  color: #dc2626 !important;
}
.delete-icon {
  font-size: 16px;
}
</style>
