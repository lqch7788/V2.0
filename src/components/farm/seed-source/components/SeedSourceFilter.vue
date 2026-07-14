<template>
  <!--
    种源筛选工具栏组件（V1.1 1:1 迁移版）
    V1.1源文件：src/components/farm/seed-source/components/SeedSourceFilter.tsx
  -->
  <div class="bg-gray-50 rounded-xl p-4 shadow-sm">
    <!-- 强制单行布局，搜索/重置按键放最后 -->
    <div class="flex flex-nowrap gap-3 items-end">
      <!-- 作物品种 -->
      <div class="flex-1 min-w-[120px]">
        <label class="text-gray-700 text-sm">作物品种</label>
        <el-input
          :model-value="filters.cropName"
          @update:model-value="(val) => onChange({ ...filters, cropName: val })"
          placeholder="请输入作物品种"
          clearable
        />
      </div>

      <!-- 种源批号 -->
      <div class="flex-1 min-w-[120px]">
        <label class="text-gray-700 text-sm">种源批号</label>
        <el-input
          :model-value="filters.seedCode"
          @update:model-value="(val) => onChange({ ...filters, seedCode: val })"
          placeholder="请输入种源批号"
          clearable
        />
      </div>

      <!-- 来源（source_origin 9 枚举） -->
      <div class="min-w-[100px] flex-shrink-0">
        <label class="text-gray-700 text-sm">来源</label>
        <el-select
          :model-value="filters.sourceOrigin || '__all__'"
          @update:model-value="(val) => onChange({ ...filters, sourceOrigin: val === '__all__' ? '' : val })"
          placeholder="全部"
          clearable
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
      <div class="min-w-[100px] flex-shrink-0">
        <label class="text-gray-700 text-sm">形态</label>
        <el-select
          :model-value="filters.sourceType"
          @update:model-value="(val) => onChange({ ...filters, sourceType: val })"
          placeholder="全部"
          clearable
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
      <div class="min-w-[120px] flex-shrink-0">
        <label class="text-gray-700 text-sm">供应商</label>
        <el-select
          :model-value="filters.supplierName"
          @update:model-value="(val) => onChange({ ...filters, supplierName: val })"
          placeholder="全部"
          clearable
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
      <div class="min-w-[100px] flex-shrink-0">
        <label class="text-gray-700 text-sm">状态</label>
        <el-select
          :model-value="filters.status"
          @update:model-value="(val) => onChange({ ...filters, status: val })"
          placeholder="全部"
          clearable
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

      <!-- 采购/入库日期 -->
      <div class="min-w-[260px] flex-shrink-0">
        <label class="text-gray-700 text-sm">采购/入库日期</label>
        <el-date-picker
          :model-value="dateRange"
          @update:model-value="handleDateChange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          format="YYYY-MM-DD"
          style="width: 100%"
        />
      </div>

      <!-- 按钮行：重置、搜索 -->
      <div class="flex gap-2 items-end flex-shrink-0 ml-auto">
        <el-button :icon="RefreshRight" @click="onReset" type="warning" plain>重置</el-button>
        <el-button :icon="Search" @click="onSearch" type="primary">搜索</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
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

// 日期范围
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
