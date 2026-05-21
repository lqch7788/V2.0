<template>
  <!-- 指标表格组件 -->
  <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
    <el-table
      :data="indicators"
      style="width: 100%"
      :row-class-name="tableRowClassName"
    >
      <!-- 导出模式选择列 -->
      <el-table-column v-if="exportMode" width="60" align="center">
        <template #header>
          <el-checkbox
            :model-value="selectedIds.length === indicators.length && indicators.length > 0"
            @change="handleSelectAll"
          />
        </template>
        <template #default="{ row }">
          <el-checkbox
            :model-value="selectedIds.includes(row.id)"
            @change="() => onToggleSelect(row.id)"
          />
        </template>
      </el-table-column>

      <!-- 指标编码 -->
      <el-table-column prop="code" label="指标编码" width="120">
        <template #default="{ row }">
          <span class="text-sm text-gray-600 font-mono">{{ row.code }}</span>
        </template>
      </el-table-column>

      <!-- 指标名称 -->
      <el-table-column label="指标名称" min-width="180">
        <template #default="{ row }">
          <div class="flex items-center gap-2">
            <el-icon :size="16" class="text-blue-600"><DataAnalysis /></el-icon>
            <span class="text-sm font-medium text-gray-900">{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>

      <!-- 类别 -->
      <el-table-column label="类别" width="120">
        <template #default="{ row }">
          <el-tag size="small" type="info" effect="plain">
            {{ row.category }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 采集方式 -->
      <el-table-column label="采集方式" width="120">
        <template #default="{ row }">
          <el-tag
            size="small"
            :type="row.source === '自动采集' ? 'primary' : 'warning'"
            effect="plain"
          >
            {{ row.source }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 目标值 -->
      <el-table-column label="目标值" width="120">
        <template #default="{ row }">
          <span class="text-sm text-gray-700 font-mono">{{ row.target }}{{ row.unit }}</span>
        </template>
      </el-table-column>

      <!-- 实际值 -->
      <el-table-column label="实际值" width="120">
        <template #default="{ row }">
          <span class="text-sm text-gray-900 font-medium font-mono">{{ row.actual }}{{ row.unit }}</span>
        </template>
      </el-table-column>

      <!-- 达成率 -->
      <el-table-column label="达成率" width="180">
        <template #default="{ row }">
          <div class="flex items-center gap-2">
            <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                :class="getProgressColor(row.actual, row.target)"
                class="h-full rounded-full transition-all"
                :style="{ width: `${Math.min((row.actual / row.target) * 100, 100)}%` }"
              />
            </div>
            <span
              :class="getAchievementColor(row.actual, row.target)"
              class="text-xs font-medium font-mono"
            >
              {{ calcAchievementRate(row.actual, row.target) }}
            </span>
          </div>
        </template>
      </el-table-column>

      <!-- 趋势 -->
      <el-table-column label="趋势" width="100">
        <template #default="{ row }">
          <div class="flex items-center gap-1">
            <el-icon :size="16" :class="getTrendIconClass(row.trend)">
              <component :is="getTrendIcon(row.trend)" />
            </el-icon>
            <span class="text-xs text-gray-500">{{ getTrendText(row.trend) }}</span>
          </div>
        </template>
      </el-table-column>

      <!-- 操作 -->
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <div class="flex items-center gap-1">
            <el-button
              type="primary"
              :icon="View"
              circle
              size="small"
              text
              @click="onView(row)"
              title="查看"
            />
            <el-button
              type="primary"
              :icon="Odometer"
              circle
              size="small"
              text
              @click="onAnalyze(row)"
              title="分析"
            />
            <el-button
              type="primary"
              :icon="Edit"
              circle
              size="small"
              text
              @click="onEdit(row)"
              title="编辑"
            />
            <el-button
              type="danger"
              :icon="Delete"
              circle
              size="small"
              text
              @click="onDelete(row)"
              title="删除"
            />
          </div>
        </template>
      </el-table-column>

      <!-- 空状态 -->
      <template #empty>
        <div class="text-center py-12">
          <el-icon :size="48" class="text-gray-400"><DataAnalysis /></el-icon>
          <p class="text-gray-500 mt-4">暂无数据</p>
        </div>
      </template>
    </el-table>

    <!-- 分页控件 -->
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

      <el-pagination
        v-model:current-page="currentPageModel"
        :page-size="pageSize"
        :total="totalCount"
        :pager-count="5"
        layout="prev, pager, next"
        background
      />

      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">
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
  Minus
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

// 当前页双向绑定
const currentPageModel = computed({
  get() {
    return props.currentPage
  },
  set: (val) => emit('update:currentPage', val)
})

// 表格行样式
const tableRowClassName = ({ row }) => {
  return props.selectedIds.includes(row.id) ? 'bg-blue-50' : ''
}

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
  emit('selectAll')
}

// 页面变化
const handlePageChange = (page) => {
  emit('pageChange', page)
}

// 页面大小变化
const handlePageSizeChange = (size) => {
  emit('pageSizeChange', size)
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
</script>

<style scoped>
:deep(.el-table .bg-blue-50) {
  background-color: #eff6ff;
}
</style>
