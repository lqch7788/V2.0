<template>
  <!-- 指标表格组件 - V1.1样式 -->
  <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
    <table class="w-full">
      <!-- 表头 - V1.1渐变蓝色样式 -->
      <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <tr>
          <!-- 导出模式选择列 -->
          <th v-if="exportMode" class="px-3 py-3 text-left text-sm font-semibold w-12">
            <el-checkbox
              :model-value="selectedIds.length === indicators.length && indicators.length > 0"
              @change="handleSelectAll"
            />
          </th>
          <th class="px-3 py-3 text-left text-sm font-semibold">指标编码</th>
          <th class="px-3 py-3 text-left text-sm font-semibold">指标名称</th>
          <th class="px-3 py-3 text-left text-sm font-semibold">类别</th>
          <th class="px-3 py-3 text-left text-sm font-semibold">采集方式</th>
          <th class="px-3 py-3 text-left text-sm font-semibold">目标值</th>
          <th class="px-3 py-3 text-left text-sm font-semibold">实际值</th>
          <th class="px-3 py-3 text-left text-sm font-semibold">达成率</th>
          <th class="px-3 py-3 text-left text-sm font-semibold">趋势</th>
          <th class="px-3 py-3 text-left text-sm font-semibold">操作</th>
        </tr>
      </thead>
      <!-- 表格主体 -->
      <tbody class="divide-y divide-gray-300">
        <tr
          v-for="ind in indicators"
          :key="ind.id"
          :class="[
            'hover:bg-blue-50 transition-all duration-300',
            selectedIds.includes(ind.id) ? 'bg-blue-50' : ''
          ]"
        >
          <!-- 导出模式选择列 -->
          <td v-if="exportMode" class="px-3 py-3">
            <el-checkbox
              :model-value="selectedIds.includes(ind.id)"
              @change="() => onToggleSelect(ind.id)"
            />
          </td>
          <!-- 指标编码 -->
          <td class="px-3 py-3 text-sm text-gray-600 font-mono">{{ ind.code }}</td>
          <!-- 指标名称 -->
          <td class="px-3 py-3">
            <div class="flex items-center gap-2">
              <el-icon :size="16" class="text-blue-600"><DataAnalysis /></el-icon>
              <span class="text-sm font-medium text-gray-900">{{ ind.name }}</span>
            </div>
          </td>
          <!-- 类别 -->
          <td class="px-3 py-3">
            <span class="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full border border-blue-200">{{ ind.category }}</span>
          </td>
          <!-- 采集方式 -->
          <td class="px-3 py-3">
            <span :class="[
              'px-2 py-1 text-xs rounded-full',
              ind.source === '自动采集'
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            ]">
              {{ ind.source }}
            </span>
          </td>
          <!-- 目标值 -->
          <td class="px-3 py-3 text-sm text-gray-700 font-mono">{{ ind.target }}{{ ind.unit }}</td>
          <!-- 实际值 -->
          <td class="px-3 py-3 text-sm text-gray-900 font-medium font-mono">{{ ind.actual }}{{ ind.unit }}</td>
          <!-- 达成率 -->
          <td class="px-3 py-3">
            <div class="flex items-center gap-2">
              <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  :class="getProgressColor(ind.actual, ind.target)"
                  class="h-full rounded-full transition-all"
                  :style="{ width: `${Math.min((ind.actual / ind.target) * 100, 100)}%` }"
                />
              </div>
              <span :class="getAchievementColor(ind.actual, ind.target)" class="text-xs font-medium font-mono">
                {{ calcAchievementRate(ind.actual, ind.target) }}
              </span>
            </div>
          </td>
          <!-- 趋势 -->
          <td class="px-3 py-3">
            <div class="flex items-center gap-1">
              <el-icon :size="16" :class="getTrendIconClass(ind.trend)">
                <component :is="getTrendIcon(ind.trend)" />
              </el-icon>
              <span class="text-xs text-gray-500">{{ getTrendText(ind.trend) }}</span>
            </div>
          </td>
          <!-- 操作 -->
          <td class="px-3 py-3">
            <div class="flex items-center gap-1">
              <el-button
                type="primary"
                :icon="View"
                circle
                size="small"
                text
                @click="onView(ind)"
                title="查看"
              />
              <el-button
                type="primary"
                :icon="Odometer"
                circle
                size="small"
                text
                @click="onAnalyze(ind)"
                title="分析"
              />
              <el-button
                type="primary"
                :icon="Edit"
                circle
                size="small"
                text
                @click="onEdit(ind)"
                title="编辑"
              />
              <el-button
                type="danger"
                :icon="Delete"
                circle
                size="small"
                text
                @click="onDelete(ind)"
                title="删除"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 空状态 -->
    <div v-if="indicators.length === 0" class="text-center py-12">
      <el-icon :size="48" class="text-gray-400"><DataAnalysis /></el-icon>
      <p class="text-gray-500 mt-4">暂无数据</p>
    </div>

    <!-- 分页控件 - V1.1自定义样式 -->
    <div v-if="indicators.length > 0" class="mt-4 flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-600">
          共 <span class="text-blue-600 font-medium">{{ totalCount }}</span> 条记录
        </span>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">每页</span>
          <el-select
            :model-value="pageSize"
            @change="(val) => onPageSizeChange(val)"
            style="width: 80px"
          >
            <el-option v-for="opt in pageSizeOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
          <span class="text-sm text-gray-600">条</span>
        </div>
      </div>

      <!-- 分页按钮组 -->
      <div class="flex items-center gap-2">
        <!-- 首页按钮 -->
        <el-button
          variant="text"
          size="small"
          @click="() => onPageChange(1)"
          :disabled="currentPage === 1"
          class="text-gray-600"
        >
          <el-icon><DArrowLeft /></el-icon>
        </el-button>
        <!-- 上一页按钮 -->
        <el-button
          variant="text"
          size="small"
          @click="() => onPageChange(currentPage - 1)"
          :disabled="currentPage === 1"
          class="text-gray-600"
        >
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <!-- 页码按钮 -->
        <template v-for="page in visiblePages" :key="page">
          <el-button
            size="small"
            :class="[
              page === currentPage
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none'
                : 'text-gray-700 hover:bg-blue-50 border-gray-300'
            ]"
            @click="() => onPageChange(page)"
          >
            {{ page }}
          </el-button>
        </template>
        <!-- 下一页按钮 -->
        <el-button
          variant="text"
          size="small"
          @click="() => onPageChange(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="text-gray-600"
        >
          <el-icon><ArrowRight /></el-icon>
        </el-button>
        <!-- 末页按钮 -->
        <el-button
          variant="text"
          size="small"
          @click="() => onPageChange(totalPages)"
          :disabled="currentPage === totalPages"
          class="text-gray-600"
        >
          <el-icon><DArrowRight /></el-icon>
        </el-button>
        <span class="text-sm text-gray-600 ml-2">
          第 <span class="text-blue-600 font-medium">{{ currentPage }}</span> / {{ totalPages }} 页
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  DataAnalysis,
  View,
  Edit,
  Delete,
  Odometer,
  Top,
  Bottom,
  Minus,
  ArrowLeft,
  ArrowRight,
  DArrowLeft,
  DArrowRight
} from '@element-plus/icons-vue'

const props = defineProps({
  indicators: Array,
  selectedIds: Array,
  exportMode: Boolean,
  currentPage: Number,
  pageSize: Number,
  totalPages: Number,
  totalCount: Number
})

const emit = defineEmits([
  'update:currentPage',
  'page-change',
  'page-size-change',
  'select-all',
  'toggle-select',
  'view',
  'analyze',
  'edit',
  'delete'
])

// 分页选项
const pageSizeOptions = [5, 10, 20, 50]

// 计算可见的页码（最多显示5页）
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let startPage = Math.max(1, props.currentPage - Math.floor(maxVisible / 2))
  const endPage = Math.min(props.totalPages, startPage + maxVisible - 1)

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  return pages
})

// 获取进度条颜色
const getProgressColor = (actual, target) => {
  const ratio = actual / target
  if (ratio >= 1) return 'bg-emerald-500'
  if (ratio >= 0.95) return 'bg-amber-500'
  return 'bg-red-500'
}

// 获取达成率颜色
const getAchievementColor = (actual, target) => {
  const ratio = (actual / target) * 100
  if (ratio >= 100) return 'text-emerald-600'
  if (ratio >= 95) return 'text-amber-600'
  return 'text-red-600'
}

// 计算达成率
const calcAchievementRate = (actual, target) => {
  return ((actual / target) * 100).toFixed(1) + '%'
}

// 获取趋势图标
const getTrendIcon = (trend) => {
  switch (trend) {
    case 'up':
      return Top
    case 'down':
      return Bottom
    default:
      return Minus
  }
}

// 获取趋势图标样式
const getTrendIconClass = (trend) => {
  switch (trend) {
    case 'up':
      return 'text-emerald-600'
    case 'down':
      return 'text-red-600'
    default:
      return 'text-gray-400'
  }
}

// 获取趋势文字
const getTrendText = (trend) => {
  switch (trend) {
    case 'up':
      return '上升'
    case 'down':
      return '下降'
    default:
      return '持平'
  }
}

// 全选操作
const handleSelectAll = () => {
  emit('select-all')
}

// 页面变化
const onPageChange = (page) => {
  emit('update:currentPage', page)
  emit('page-change', page)
}

// 页面大小变化
const onPageSizeChange = (size) => {
  emit('page-size-change', size)
}

// 查看
const onView = (item) => {
  emit('view', item)
}

// 分析
const onAnalyze = (item) => {
  emit('analyze', item)
}

// 编辑
const onEdit = (item) => {
  emit('edit', item)
}

// 删除
const onDelete = (item) => {
  emit('delete', item)
}

// 切换选择
const onToggleSelect = (id) => {
  emit('toggle-select', id)
}
</script>

<style scoped>
/* 表格行悬浮效果由hover:bg-blue-50 transition-all duration-300实现 */

/* 渐变按钮样式 */
:deep(.bg-gradient-to-r.from-blue-500.to-blue-600) {
  background: linear-gradient(to right, #3b82f6, #2563eb);
  color: white;
}
</style>
