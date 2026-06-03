<!--
  @file 种植标记管理弹窗 - 1:1 翻译自 V1.1 PlantingMarkModal.tsx
  @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\farm\planting\modals\PlantingMarkModal.tsx
  @description 通过树形结构展示可用标记，勾选标签后分配标记
  @note 兼容现有 PlantingPage.vue 的 prop-callback 调用约定 (:on-close, :on-submit)，
        同时也 emit Vue idiom 事件 (close, submit) 供后续迁移
-->
<template>
  <!-- 1:1 V1.1: isOpen 控制显隐，纯 div 结构而非 el-dialog 以保留渐变标题栏样式 -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
    tabindex="-1"
    @click.self="handleClose"
    @keydown.esc="handleClose"
  >
    <div class="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[85vh] flex flex-col">
      <!-- 标题栏（1:1 V1.1 紫色渐变）-->
      <div
        class="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-500 via-purple-600 to-purple-500 rounded-t-xl"
      >
        <h3 class="text-lg font-semibold text-white flex items-center gap-2">
          <el-icon><PriceTag /></el-icon>
          标记管理
        </h3>
        <el-button text class="!text-white hover:!bg-purple-700" @click="handleClose">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 overflow-y-auto p-4">
        <div class="grid grid-cols-2 gap-4">
          <!-- 左侧：标记树 -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2">可用标记</h4>
            <div class="border border-gray-200 rounded-lg p-2 max-h-80 overflow-y-auto">
              <div
                v-if="markTree.length === 0"
                class="py-8 text-center text-sm text-gray-400"
              >
                暂无可用的标记
              </div>
              <el-tree
                v-else
                :data="markTree"
                node-key="key"
                :props="{ label: 'title', children: 'children' }"
                :highlight-current="true"
                :current-node-key="selectedMarkKey || null"
                @node-click="handleMarkSelect"
              >
                <template #default="{ data }">
                  <span class="flex items-center gap-2">
                    <span
                      :class="['w-3 h-3 rounded-full', getColorDot(data.color)]"
                    />
                    <span>{{ data.title }}</span>
                  </span>
                </template>
              </el-tree>
            </div>

            <!-- 选中标记预览（1:1 V1.1） -->
            <div
              v-if="selectedMark"
              class="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg"
            >
              <div class="flex items-center gap-2">
                <span :class="['w-4 h-4 rounded-full', getColorDot(selectedMark.color)]" />
                <span class="text-sm font-medium text-purple-800">
                  已选标记: {{ selectedMark.name }}
                </span>
              </div>
              <span v-if="selectedMark.icon" class="text-xs text-purple-600 mt-1 block">
                图标: {{ selectedMark.icon }}
              </span>
            </div>
          </div>

          <!-- 右侧：标签选择 -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-medium text-gray-700">选择标签</h4>
              <el-button link type="primary" size="small" @click="toggleAllLabels">
                {{ checkedLabelIds.length === labels.length ? '取消全选' : '全选' }}
              </el-button>
            </div>
            <div class="border border-gray-200 rounded-lg p-2 max-h-80 overflow-y-auto space-y-1">
              <div
                v-if="labels.length === 0"
                class="py-8 text-center text-sm text-gray-400"
              >
                暂无可用标签
              </div>
              <div
                v-for="label in labels"
                :key="label.id"
                :class="[
                  'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors',
                  checkedLabelIds.includes(label.id)
                    ? 'bg-purple-50 border border-purple-200'
                    : 'hover:bg-gray-50 border border-transparent',
                ]"
                @click="toggleLabel(label.id)"
              >
                <el-icon v-if="checkedLabelIds.includes(label.id)" color="#9333ea">
                  <Check />
                </el-icon>
                <el-icon v-else color="#9ca3af">
                  <Minus />
                </el-icon>
                <span class="text-sm text-gray-700">{{ label.labelNumber }}</span>
                <span
                  v-if="label.currentMarkName"
                  class="text-xs text-gray-400 ml-auto"
                >
                  当前: {{ label.currentMarkName }}
                </span>
              </div>
            </div>
            <div class="mt-1 text-xs text-gray-400">
              已选 {{ checkedLabelIds.length }} / {{ labels.length }} 个标签
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="p-4 border-t border-gray-200 flex justify-end gap-3">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认标记</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * @file MarkModal.vue
 * @description 种植标记管理弹窗 - 1:1 翻译自 V1.1 PlantingMarkModal.tsx
 *              通过树形结构展示可用标记，勾选标签后分配标记
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\farm\planting\modals\PlantingMarkModal.tsx
 */
import { ref, computed, watch } from 'vue'
import { PriceTag, Close, Check, Minus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// ==================== JSDoc 类型定义 ====================

/**
 * 可用标记数据（1:1 V1.1 PlantMark）
 * @typedef {Object} PlantMark
 * @property {number} id
 * @property {string} name
 * @property {string} [color]
 * @property {string} [icon]
 * @property {number} parentId
 * @property {string} markAid
 * @property {number} isUse
 * @property {number} sortOrder
 */

/**
 * 可标记标签数据（1:1 V1.1 LabelOption）
 * @typedef {Object} LabelOption
 * @property {number} id
 * @property {string} labelNumber
 * @property {string} [currentMarkName]
 */

// ==================== 颜色 Tailwind 映射（1:1 V1.1 COLOR_MAP） ====================

const COLOR_MAP = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  gray: 'bg-gray-400',
  emerald: 'bg-emerald-500',
  cyan: 'bg-cyan-500',
  indigo: 'bg-indigo-500',
}

/**
 * 根据颜色名获取 Tailwind class（1:1 V1.1 getColorDot）
 * @param {string} [color]
 * @returns {string}
 */
function getColorDot(color) {
  if (!color) return 'bg-gray-400'
  return COLOR_MAP[color] || 'bg-gray-400'
}

// ==================== Props (完整定义，匹配 V1.1 + PlantingPage.vue 现有用法) ====================

const props = defineProps({
  /** 弹窗显示状态 */
  isOpen: {
    type: Boolean,
    default: false,
  },
  /** 可用标记列表（扁平数组，通过 parentId 构建树） */
  marks: {
    type: Array,
    default: () => [],
  },
  /** 可标记的标签列表 */
  labels: {
    type: Array,
    default: () => [],
  },
  /** 关闭回调（V1.1 prop callback 模式，兼容 PlantingPage.vue 现有用法） */
  onClose: {
    type: Function,
    default: null,
  },
  /** 提交回调 (markId, labelIds) => void（V1.1 prop callback 模式） */
  onSubmit: {
    type: Function,
    default: null,
  },
})

// ==================== Emits ====================

/**
 * @event close 关闭弹窗（Vue idiom 事件，与 onClose prop 并存）
 * @event submit ({markId, labelIds}) 提交标记分配（Vue idiom 事件）
 */
const emit = defineEmits(['close', 'submit'])

// ==================== 内部状态（1:1 V1.1 useState） ====================

/** @type {import('vue').Ref<string>} */
const selectedMarkKey = ref('')
/** @type {import('vue').Ref<number[]>} */
const checkedLabelIds = ref([])

// ==================== 构建标记树（1:1 V1.1 buildMarkTree） ====================

/**
 * 将扁平标记数组转为 TreeNode 树（1:1 V1.1 buildMarkTree）
 * @returns {Array<{key: string, title: string, color?: string, icon?: string, children: any[]}>}
 */
const markTree = computed(() => {
  const map = new Map()
  const roots = []

  // 先创建所有节点
  props.marks.forEach((m) => {
    map.set(m.id, {
      key: String(m.id),
      title: m.name,
      color: m.color,
      icon: m.icon,
      children: [],
    })
  })

  // 建立父子关系
  props.marks.forEach((m) => {
    const node = map.get(m.id)
    if (!node) return
    if (m.parentId === 0 || !map.has(m.parentId)) {
      roots.push(node)
    } else {
      const parent = map.get(m.parentId)
      if (parent) {
        if (!parent.children) parent.children = []
        parent.children.push(node)
      }
    }
  })

  return roots
})

// ==================== 选中的标记信息（1:1 V1.1 selectedMark） ====================

const selectedMark = computed(() => {
  if (!selectedMarkKey.value) return null
  return props.marks.find((m) => String(m.id) === selectedMarkKey.value)
})

// ==================== 弹窗打开时重置（1:1 V1.1 useEffect） ====================

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      selectedMarkKey.value = ''
      checkedLabelIds.value = []
    }
  },
)

// ==================== 树节点选择 ====================

function handleMarkSelect(data) {
  selectedMarkKey.value = data.key
}

// ==================== 切换标签选中（1:1 V1.1 toggleLabel） ====================

function toggleLabel(labelId) {
  const next = new Set(checkedLabelIds.value)
  if (next.has(labelId)) {
    next.delete(labelId)
  } else {
    next.add(labelId)
  }
  checkedLabelIds.value = Array.from(next)
}

// ==================== 全选/取消全选（1:1 V1.1 toggleAllLabels） ====================

function toggleAllLabels() {
  if (checkedLabelIds.value.length === props.labels.length) {
    checkedLabelIds.value = []
  } else {
    checkedLabelIds.value = props.labels.map((l) => l.id)
  }
}

// ==================== 提交（1:1 V1.1 handleSubmit） ====================

async function handleSubmit() {
  const markId = Number(selectedMarkKey.value)
  if (!markId || checkedLabelIds.value.length === 0) {
    if (!markId) {
      ElMessage.warning('请先选择一个标记')
    } else {
      ElMessage.warning('请至少选择一个标签')
    }
    return
  }

  // V1.1: await onSubmit(markId, Array.from(checkedLabelIds))
  if (typeof props.onSubmit === 'function') {
    await props.onSubmit(markId, [...checkedLabelIds.value])
  }
  emit('submit', { markId, labelIds: [...checkedLabelIds.value] })
  handleClose()
}

// ==================== 关闭（同时支持 onClose prop 和 close emit） ====================

function handleClose() {
  if (typeof props.onClose === 'function') {
    props.onClose()
  }
  emit('close')
}
</script>
