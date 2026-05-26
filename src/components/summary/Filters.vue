<template>
  <!-- 筛选工具栏 - 与V1.1 Filters.tsx 完全一致 -->
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
    <div class="flex flex-wrap gap-4 items-end">
      <!-- 日期筛选 -->
      <div v-if="filters.date" class="min-w-[180px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ filters.date.label }}
        </label>
        <el-date-picker
          :model-value="filters.date.value ? new Date(filters.date.value) : null"
          type="date"
          placeholder="选择日期"
          class="w-full h-10"
          @update:model-value="(val) => filters.date?.onChange(toDateStr(val))"
        />
      </div>

      <!-- 下拉筛选 -->
      <div v-for="select in filters.selects" :key="select.key" class="min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ select.label }}
        </label>
        <el-select
          :model-value="select.value"
          class="w-full h-10"
          @update:model-value="select.onChange"
        >
          <el-option
            v-for="option in select.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-2">
        <el-button
          v-if="onSearch"
          class="h-10 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
          @click="onSearch"
        >
          <el-icon class="mr-1"><Search /></el-icon>
          搜索
        </el-button>
        <template v-if="showExportMode">
          <el-button
            class="h-10 px-4 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
            @click="onConfirmExport"
          >
            <el-icon class="mr-1"><Download /></el-icon>
            确认导出
          </el-button>
          <el-button
            class="h-10 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            @click="onCancelExport"
          >
            取消
          </el-button>
        </template>
        <el-button
          v-else-if="!hideExportButton"
          class="h-10 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
          @click="onExportClick"
        >
          <el-icon class="mr-1"><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search, Download } from '@element-plus/icons-vue'

defineProps({
  filters: {
    type: Object,
    required: true
  },
  showExportMode: {
    type: Boolean,
    default: false
  },
  selectedCount: {
    type: Number,
    default: 0
  },
  onExportClick: {
    type: Function,
    default: () => {}
  },
  onConfirmExport: {
    type: Function,
    default: () => {}
  },
  onCancelExport: {
    type: Function,
    default: () => {}
  },
  onSearch: {
    type: Function,
    default: null
  },
  hideExportButton: {
    type: Boolean,
    default: false
  }
})

/** 将Date对象转换为日期字符串(YYYY-MM-DD) */
function toDateStr(date) {
  if (!date) return ''
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
</script>
