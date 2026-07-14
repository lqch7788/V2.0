<template>
  <!--
    种源筛选工具栏组件（V1.1 1:1 迁移版）
    V1.1源文件：src/components/farm/seed-source/components/SeedSourceFilter.tsx
    V1.1 Input/SelectTrigger 视觉：w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-emerald-500
  -->
  <div class="bg-gray-50 rounded-xl p-4 shadow-sm seed-filter">
    <!-- 强制单行布局，搜索/重置按键放最后（日期选择器 160px，避免按键换行） -->
    <div class="flex flex-nowrap gap-3 items-end">
      <!-- 作物品种 -->
      <div class="flex-1 min-w-[120px] filter-item">
        <label class="text-gray-700 filter-label">作物品种</label>
        <el-input
          :model-value="filters.cropName"
          @update:model-value="(val) => onChange({ ...filters, cropName: val })"
          placeholder="请输入作物品种"
          clearable
          class="w-full"
        />
      </div>

      <!-- 种源批号 -->
      <div class="flex-1 min-w-[120px] filter-item">
        <label class="text-gray-700 filter-label">种源批号</label>
        <el-input
          :model-value="filters.seedCode"
          @update:model-value="(val) => onChange({ ...filters, seedCode: val })"
          placeholder="请输入种源批号"
          clearable
          class="w-full"
        />
      </div>

      <!-- 来源（source_origin 9 枚举） -->
      <div class="min-w-[100px] flex-shrink-0 filter-item">
        <label class="text-gray-700 filter-label">来源</label>
        <el-select
          :model-value="filters.sourceOrigin || '__all__'"
          @update:model-value="(val) => onChange({ ...filters, sourceOrigin: val === '__all__' ? '' : val })"
          placeholder="全部"
          clearable
          class="w-full"
        >
          <el-option label="全部" value="__all__" />
          <el-option
            v-for="o in SOURCE_ORIGINS"
            :key="o.value"
            :label="o.label"
            :value="o.value"
          />
        </el-select>
      </div>

      <!-- 形态（种源类型） -->
      <div class="min-w-[100px] flex-shrink-0 filter-item">
        <label class="text-gray-700 filter-label">形态</label>
        <el-select
          :model-value="filters.sourceType"
          @update:model-value="(val) => onChange({ ...filters, sourceType: val })"
          placeholder="全部"
          clearable
          class="w-full"
        >
          <el-option label="全部" value="__all__" />
          <el-option
            v-for="t in SOURCE_TYPES"
            :key="t.value"
            :label="t.label"
            :value="t.value"
          />
        </el-select>
      </div>

      <!-- 供应商 -->
      <div class="min-w-[120px] flex-shrink-0 filter-item">
        <label class="text-gray-700 filter-label">供应商</label>
        <el-select
          :model-value="filters.supplierName"
          @update:model-value="(val) => onChange({ ...filters, supplierName: val })"
          placeholder="全部"
          clearable
          class="w-full"
        >
          <el-option label="全部" value="__all__" />
          <el-option
            v-for="s in suppliers"
            :key="s.value"
            :label="s.label"
            :value="s.value"
          />
        </el-select>
      </div>

      <!-- 状态 -->
      <div class="min-w-[100px] flex-shrink-0 filter-item">
        <label class="text-gray-700 filter-label">状态</label>
        <el-select
          :model-value="filters.status"
          @update:model-value="(val) => onChange({ ...filters, status: val })"
          placeholder="全部"
          clearable
          class="w-full"
        >
          <el-option label="全部" value="__all__" />
          <el-option
            v-for="s in statusOptions"
            :key="s.value"
            :label="s.label"
            :value="s.value"
          />
        </el-select>
      </div>

      <!-- 采购/入库日期（V1.1: min-w-[160px]） -->
      <div class="min-w-[160px] flex-shrink-0 filter-item">
        <label class="text-gray-700 filter-label">采购/入库日期</label>
        <el-date-picker
          :model-value="dateRange"
          @update:model-value="handleDateChange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          format="YYYY-MM-DD"
          class="w-full"
        />
      </div>

      <!-- 按钮行：重置、搜索 — ml-auto 推到最右，与 V1.1 一致 -->
      <div class="flex gap-2 items-end flex-shrink-0 ml-auto">
        <el-button :icon="RefreshRight" @click="onReset" type="warning" plain>重置</el-button>
        <el-button :icon="Search" @click="onSearch">搜索</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 种源筛选工具栏组件
 * V1.1 源文件：src/components/farm/seed-source/components/SeedSourceFilter.tsx
 *
 * V1.1 Input/SelectTrigger 视觉规范：
 *   h-10 px-3 border-gray-200 rounded-lg text-sm focus:border-emerald-500
 * 通过 <style scoped> + :deep() 把 Element Plus 默认 32px 的 el-input / el-select 强制对齐 V1.1 的 40px。
 */
import { computed } from 'vue'
import { Search, RefreshRight } from '@element-plus/icons-vue'
import { SOURCE_ORIGINS, SOURCE_TYPES } from '@/constants/seedSourceDict'

// Props（V1.1 SeedSourceFilterProps 1:1）
const props = defineProps({
  filters: { type: Object, required: true },
  onChange: { type: Function, required: true },
  onSearch: { type: Function, required: true },
  onReset: { type: Function, required: true },
  cropCategories: { type: Array, default: () => [] },
  suppliers: { type: Array, default: () => [] },
  statusOptions: { type: Array, default: () => [] }
})

// 日期范围（V1.1 DateRangePicker onChange(start, end) → V2 el-date-picker 数组）
const dateRange = computed(() => {
  const start = props.filters.startDate
  const end = props.filters.endDate
  if (start && end) return [start, end]
  if (start) return [start, null]
  if (end) return [null, end]
  return []
})

const handleDateChange = (val) => {
  const [start, end] = val || []
  props.onChange({
    ...props.filters,
    startDate: start || '',
    endDate: end || ''
  })
}
</script>

<style scoped>
/* ===== 与 V1.1 Input/SelectTrigger 1:1 对齐 ===== */
/* V1.1: w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-emerald-500 */

/* 强制 el-input / el-select 容器宽度撑满（防止 flex 子项被压缩） */
.filter-item :deep(.el-input),
.filter-item :deep(.el-select),
.filter-item :deep(.el-date-editor) {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

/* V1.1: h-10 (40px) + border-gray-200 + rounded-lg + focus:emerald-500 */
.filter-item :deep(.el-input__wrapper),
.filter-item :deep(.el-select__wrapper) {
  box-shadow: 0 0 0 1px #e5e7eb inset;
  border-radius: 0.5rem;
  padding: 0 12px;
  min-height: 40px;
  transition: box-shadow 0.2s;
}

/* focus 时显示 emerald-500 边框（V1.1 focus:border-emerald-500） */
.filter-item :deep(.el-input__wrapper.is-focus),
.filter-item :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #10b981 inset, 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
}

/* V1.1: text-sm (14px) */
.filter-item :deep(.el-input__inner) {
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  color: #111827;
}

/* label 视觉（V1.1 Label text-gray-700） */
.filter-label {
  display: block;
  font-size: 14px;
  color: #374151;
  margin-bottom: 4px;
  line-height: 1.4;
}

/* 日期范围选择器高度对齐 */
.filter-item :deep(.el-date-editor.el-input) {
  min-height: 40px;
}
.filter-item :deep(.el-date-editor .el-input__wrapper) {
  min-height: 40px;
  padding: 0 12px;
}
</style>