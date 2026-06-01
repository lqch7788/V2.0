<template>
  <!-- 种植标签详情弹窗 - 展示标签列表和标签履历两个标签页 -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
  >
    <div class="bg-white rounded-xl w-full max-w-5xl shadow-xl max-h-[85vh] flex flex-col">
      <!-- 标题栏 - 渐变背景 -->
      <div
        class="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 flex-shrink-0 rounded-t-xl"
      >
        <h3 class="text-lg font-semibold text-white">标签管理详情</h3>
        <el-button
          link
          class="text-white hover:bg-emerald-700"
          @click="handleClose"
        >
          <el-icon style="color: white;"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 搜索框 -->
      <div class="px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div class="relative w-64">
          <el-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" :size="16">
            <Search />
          </el-icon>
          <el-input
            :model-value="searchText"
            placeholder="搜索二维码ID..."
            class="pl-9"
            @update:model-value="handleSearchChange"
          />
        </div>
      </div>

      <!-- Tabs 内容区域 -->
      <div class="flex-1 overflow-y-auto p-4">
        <el-tabs v-model="activeTab">
          <!-- TAB 1: 标签列表 -->
          <el-tab-pane label="标签列表" name="labels">
            <el-table
              :data="paginatedLabels"
              style="width: 100%"
              :row-class-name="getRowClassName"
              @row-click="handleRowClick"
            >
              <el-table-column label="二维码ID" min-width="160">
                <template #default="{ row }">
                  <span class="font-mono text-sm">{{ row.labelNumber }}</span>
                </template>
              </el-table-column>
              <el-table-column label="移入位置" min-width="120">
                <template #default="{ row }">{{ row.moveInAreaName || '-' }}</template>
              </el-table-column>
              <el-table-column label="移入日期" min-width="120">
                <template #default="{ row }">{{ row.moveInDate || '-' }}</template>
              </el-table-column>
              <el-table-column label="移出位置" min-width="120">
                <template #default="{ row }">{{ row.moveOutAreaName || '-' }}</template>
              </el-table-column>
              <el-table-column label="移出日期" min-width="120">
                <template #default="{ row }">{{ row.moveOutDate || '-' }}</template>
              </el-table-column>
              <el-table-column label="标记状态" min-width="120">
                <template #default="{ row }">
                  <el-tag
                    v-if="row.markName"
                    :type="getBadgeType(row.markColor)"
                    size="small"
                  >
                    <el-icon :size="12" class="mr-1"><PriceTag /></el-icon>
                    {{ row.markName }}
                  </el-tag>
                  <span v-else class="text-gray-400 text-sm">未标记</span>
                </template>
              </el-table-column>
              <template #empty>
                <div class="text-center text-gray-400 py-8">暂无标签数据</div>
              </template>
            </el-table>

            <!-- 分页 -->
            <div v-if="filteredLabels.length > 0" class="flex justify-center mt-4">
              <el-pagination
                :current-page="labelPage"
                :page-size="PAGE_SIZE"
                :total="filteredLabels.length"
                layout="prev, pager, next"
                background
                @current-change="handleLabelPageChange"
              />
            </div>
          </el-tab-pane>

          <!-- TAB 2: 标签履历 -->
          <el-tab-pane label="标签履历" name="resume">
            <!-- 未选中标签：提示 -->
            <div v-if="selectedLabelId === null" class="py-12 text-center text-gray-400">
              <el-icon :size="48" class="mx-auto mb-3 text-gray-300">
                <PriceTag />
              </el-icon>
              <p>请先在"标签列表"中选中一个标签，查看其履历</p>
            </div>

            <!-- 已选中但无履历：提示 -->
            <div v-else-if="currentResumes.length === 0" class="py-12 text-center text-gray-400">
              <el-icon :size="48" class="mx-auto mb-3 text-gray-300">
                <PriceTag />
              </el-icon>
              <p>该标签暂无履历记录</p>
            </div>

            <!-- 已选中且有履历：展示 -->
            <template v-else>
              <!-- 选中的标签信息 -->
              <div
                v-if="selectedLabelInfo"
                class="mb-4 p-3 bg-emerald-50 rounded-lg flex items-center gap-2"
              >
                <span class="text-sm font-medium text-emerald-700">
                  标签: {{ selectedLabelInfo.labelNumber }}
                </span>
                <el-tag v-if="selectedLabelInfo.markName" type="primary" size="small">
                  <el-icon :size="12" class="mr-1"><PriceTag /></el-icon>
                  {{ selectedLabelInfo.markName }}
                </el-tag>
              </div>

              <!-- 履历时间线 (左右交替Z型布局) -->
              <div class="relative">
                <!-- 头部：当前标签信息 -->
                <div
                  v-if="selectedLabelInfo"
                  class="flex items-center gap-2 mb-6 px-2"
                >
                  <span class="text-sm font-bold text-gray-900">
                    {{ selectedLabelInfo.labelNumber }}
                  </span>
                  <span
                    v-if="selectedLabelInfo.markName"
                    class="px-2 py-0.5 rounded-full text-xs text-white font-medium"
                    :style="{ backgroundColor: selectedLabelInfo.markColor || '#9ca3af' }"
                  >
                    {{ selectedLabelInfo.markName }}
                  </span>
                </div>

                <!-- 时间线主体 -->
                <div class="relative">
                  <!-- 中间竖线 -->
                  <div
                    class="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200"
                    style="transform: translateX(-0.5px);"
                  />

                  <div
                    v-for="(entry, i) in paginatedResumes"
                    :key="entry.id"
                    class="relative"
                    :style="{ marginBottom: i === paginatedResumes.length - 1 ? '0' : '64px' }"
                  >
                    <!-- 内容行 -->
                    <div class="flex items-start">
                      <!-- 左侧内容（奇数条目，i%2===0） -->
                      <div class="flex-1 pr-8" style="min-width: 0;">
                        <div
                          v-if="i % 2 === 0"
                          class="bg-white border rounded-lg p-3 shadow-sm text-right"
                          :class="getCardBorderClass(entry)"
                          :style="getCardBorderStyle(entry)"
                        >
                          <div class="flex items-center gap-1.5 mb-1 justify-end">
                            <span
                              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium"
                              :class="getOpConfig(entry.operationType).bgClass + ' ' + getOpConfig(entry.operationType).textClass"
                            >
                              <el-icon :size="12">
                                <component :is="getOpConfig(entry.operationType).icon" />
                              </el-icon>
                              {{ getOpConfig(entry.operationType).label }}
                            </span>
                            <span
                              v-if="entry.operationType === 'mark' && entry.markName"
                              class="px-1.5 py-0.5 rounded text-xs text-white font-medium"
                              :style="{ backgroundColor: entry.markColor || '#9ca3af' }"
                            >
                              {{ entry.markName }}
                            </span>
                          </div>
                          <p class="text-sm text-gray-700">
                            <el-icon :size="12" class="inline mr-1 text-gray-400">
                              <Location />
                            </el-icon>
                            {{ getAreaLabel(entry) }}
                          </p>
                          <p class="text-xs text-gray-400 mt-1">
                            {{ entry.operationDate }}
                            <span v-if="entry.operatorName"> · {{ entry.operatorName }}</span>
                          </p>
                        </div>
                      </div>

                      <!-- 中间圆点 -->
                      <div class="relative flex-shrink-0 z-10">
                        <div
                          class="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                          :style="{ backgroundColor: entry.markColor || '#d1d5db' }"
                        />
                      </div>

                      <!-- 右侧内容（偶数条目，i%2!==0） -->
                      <div class="flex-1 pl-8" style="min-width: 0;">
                        <div
                          v-if="i % 2 !== 0"
                          class="bg-white border rounded-lg p-3 shadow-sm text-left"
                          :class="getCardBorderClass(entry)"
                          :style="getCardBorderStyle(entry)"
                        >
                          <div class="flex items-center gap-1.5 mb-1">
                            <span
                              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium"
                              :class="getOpConfig(entry.operationType).bgClass + ' ' + getOpConfig(entry.operationType).textClass"
                            >
                              <el-icon :size="12">
                                <component :is="getOpConfig(entry.operationType).icon" />
                              </el-icon>
                              {{ getOpConfig(entry.operationType).label }}
                            </span>
                            <span
                              v-if="entry.operationType === 'mark' && entry.markName"
                              class="px-1.5 py-0.5 rounded text-xs text-white font-medium"
                              :style="{ backgroundColor: entry.markColor || '#9ca3af' }"
                            >
                              {{ entry.markName }}
                            </span>
                          </div>
                          <p class="text-sm text-gray-700">
                            <el-icon :size="12" class="inline mr-1 text-gray-400">
                              <Location />
                            </el-icon>
                            {{ getAreaLabel(entry) }}
                          </p>
                          <p class="text-xs text-gray-400 mt-1">
                            {{ entry.operationDate }}
                            <span v-if="entry.operatorName"> · {{ entry.operatorName }}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- 连接线（非最后一项） -->
                    <div
                      v-if="i !== paginatedResumes.length - 1"
                      class="absolute w-px left-1/2"
                      :style="{
                        height: '64px',
                        backgroundColor: entry.markColor || '#d1d5db',
                        top: '12px',
                        transform: 'translateX(-0.5px)'
                      }"
                    />
                  </div>
                </div>

                <!-- 图例 -->
                <div class="flex items-center gap-4 mt-6 pt-4 border-t border-gray-100 px-2">
                  <div
                    v-for="(cfg, key) in OPERATION_CONFIG"
                    :key="key"
                    class="flex items-center gap-1.5 text-xs text-gray-500"
                  >
                    <span class="px-1.5 py-0.5 rounded" :class="cfg.bgClass + ' ' + cfg.textClass">
                      {{ cfg.label }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 履历分页 -->
              <div v-if="currentResumes.length > PAGE_SIZE" class="flex justify-center mt-4">
                <el-pagination
                  :current-page="resumePage"
                  :page-size="PAGE_SIZE"
                  :total="currentResumes.length"
                  layout="prev, pager, next"
                  background
                  @current-change="handleResumePageChange"
                />
              </div>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 底部按钮 -->
      <div class="p-4 border-t border-gray-200 flex justify-end flex-shrink-0">
        <el-button size="small" @click="handleClose">关闭</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 种植标签详情弹窗
 * 展示标签列表和标签履历两个标签页
 *
 * V1.1 → V2.0 1:1 翻译，源文件：
 * D:\TMcrop\yuanxingtu\V1.1\src\components\farm\planting\modals\PlantingLabelDetailModal.tsx
 */
import { ref, computed, watch, markRaw } from 'vue'
import {
  Close,
  Search,
  PriceTag,
  Location,
  Right as ArrowRight,
  Back as ArrowLeft
} from '@element-plus/icons-vue'

/**
 * @typedef {Object} PlantLabel
 * @property {number} id
 * @property {string} labelNumber
 * @property {number} plantingId
 * @property {string} moveInAreaName
 * @property {string} moveInDate
 * @property {string} moveOutAreaName
 * @property {string} moveOutDate
 * @property {string} [markName]
 * @property {string} [markColor]
 */

/**
 * @typedef {Object} PlantLabelResume
 * @property {number} id
 * @property {number} labelId
 * @property {'move_in'|'move_out'|'mark'} operationType
 * @property {string} [fromAreaName]
 * @property {string} [toAreaName]
 * @property {string} [markName]
 * @property {string} [markColor]
 * @property {string} operationDate
 * @property {string} [operatorName]
 */

const props = defineProps({
  /** 弹窗是否打开 */
  isOpen: {
    type: Boolean,
    required: true
  },
  /** 标签列表数据 */
  labels: {
    type: Array,
    default: () => []
  },
  /** 标签履历数据（按labelId索引） */
  resumeMap: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

// ========== 常量 ==========
const PAGE_SIZE = 20

// 操作类型配置（对应 V1.1 LabelResumeTimeline OPERATION_CONFIG）
const OPERATION_CONFIG = {
  move_in: {
    label: '移入',
    icon: markRaw(ArrowRight),
    bgClass: 'bg-emerald-100',
    textClass: 'text-emerald-700'
  },
  move_out: {
    label: '移出',
    icon: markRaw(ArrowLeft),
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-700'
  },
  mark: {
    label: '标记',
    icon: markRaw(PriceTag),
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-700'
  }
}

// ========== 状态 ==========
// 搜索状态
const searchText = ref('')
// 标签列表分页
const labelPage = ref(1)
// 标签履历分页
const resumePage = ref(1)
// 当前选中的标签（用于显示履历）
const selectedLabelId = ref(null)
// 当前激活 Tab
const activeTab = ref('labels')

// ========== 计算属性 ==========

// 过滤标签
const filteredLabels = computed(() => {
  if (!searchText.value) return props.labels
  return props.labels.filter((l) =>
    l.labelNumber.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

// 标签分页
const paginatedLabels = computed(() => {
  const start = (labelPage.value - 1) * PAGE_SIZE
  return filteredLabels.value.slice(start, start + PAGE_SIZE)
})

// 当前标签的履历
const currentResumes = computed(() => {
  if (selectedLabelId.value === null) return []
  return props.resumeMap[selectedLabelId.value] || []
})

// 履历分页
const paginatedResumes = computed(() => {
  const start = (resumePage.value - 1) * PAGE_SIZE
  return currentResumes.value.slice(start, start + PAGE_SIZE)
})

// 当前选中标签的详细信息
const selectedLabelInfo = computed(() => {
  if (selectedLabelId.value === null) return null
  return props.labels.find((l) => l.id === selectedLabelId.value) || null
})

// ========== 事件处理 ==========

// 搜索变化时重置分页
const handleSearchChange = (val) => {
  searchText.value = val
  labelPage.value = 1
}

// 行点击选中标签
const handleRowClick = (row) => {
  selectedLabelId.value = row.id
  resumePage.value = 1
}

// 行 className（高亮选中行）
const getRowClassName = ({ row }) => {
  return selectedLabelId.value === row.id ? 'bg-emerald-50' : ''
}

// 标签分页变化
const handleLabelPageChange = (page) => {
  labelPage.value = page
}

// 履历分页变化
const handleResumePageChange = (page) => {
  resumePage.value = page
}

// 关闭弹窗
const handleClose = () => {
  emit('close')
}

// 获取 markColor 对应的 Element Plus tag type
const getBadgeType = (color) => {
  if (color === 'red') return 'danger'
  if (color === 'yellow') return 'warning'
  if (color === 'blue') return 'primary'
  return 'success'
}

// 获取操作类型配置
const getOpConfig = (type) => {
  return OPERATION_CONFIG[type] || OPERATION_CONFIG.move_in
}

// 获取区域名称（移入->移出->通用 优先级）
const getAreaLabel = (entry) => {
  return entry.toAreaName || entry.fromAreaName || entry.areaName || '-'
}

// 履历卡片边框类
const getCardBorderClass = (entry) => {
  if (entry.operationType === 'mark' && entry.markColor) {
    return 'border-l-2'
  }
  return 'border-gray-100'
}

// 履历卡片边框样式
const getCardBorderStyle = (entry) => {
  if (entry.operationType === 'mark' && entry.markColor) {
    return { borderLeftColor: entry.markColor }
  }
  return undefined
}

// 监听弹窗开关，重置状态
watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      searchText.value = ''
      labelPage.value = 1
      resumePage.value = 1
      selectedLabelId.value = null
      activeTab.value = 'labels'
    }
  }
)
</script>

<style scoped>
/* 选中行高亮（覆盖 Element Plus 默认行样式） */
:deep(.el-table .bg-emerald-50) {
  --el-table-tr-bg-color: rgb(236 253 245);
  background-color: rgb(236 253 245);
  cursor: pointer;
}

:deep(.el-table tbody tr) {
  cursor: pointer;
}
</style>
