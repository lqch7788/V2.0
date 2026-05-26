<template>
  <!-- 施肥筛选工具栏 - 从V1.1 FertilizerFilter.tsx 1:1迁移 -->
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
    <div class="flex flex-wrap gap-4 items-end">
      <div class="min-w-[140px]">
        <label class="text-gray-700 text-sm block mb-1">肥料类型</label>
        <el-select :model-value="filters.fertilizerType || ''" @update:model-value="update('fertilizerType', $event)" class="w-full" placeholder="全部" clearable>
          <el-option v-for="t in fertilizerTypes" :key="t.value" :value="t.value" :label="t.label" />
        </el-select>
      </div>
      <div class="flex-1 min-w-[140px]">
        <label class="text-gray-700 text-sm block mb-1">作物品种</label>
        <el-input :model-value="filters.cropName || ''" @update:model-value="update('cropName', $event)" placeholder="请输入作物品种" />
      </div>
      <div class="flex-1 min-w-[140px]">
        <label class="text-gray-700 text-sm block mb-1">温室位置</label>
        <el-input :model-value="filters.greenhouseName || ''" @update:model-value="update('greenhouseName', $event)" placeholder="请输入温室位置" />
      </div>
      <div class="min-w-[120px]">
        <label class="text-gray-700 text-sm block mb-1">数据来源</label>
        <el-select :model-value="filters.dataSource || ''" @update:model-value="update('dataSource', $event)" class="w-full" placeholder="全部" clearable>
          <el-option value="manual" label="手动" />
          <el-option value="auto_iot" label="IoT自动" />
        </el-select>
      </div>
      <div class="min-w-[150px]">
        <label class="text-gray-700 text-sm block mb-1">开始日期</label>
        <el-date-picker :model-value="filters.startDate" @update:model-value="update('startDate', $event)" type="date" class="w-full" />
      </div>
      <div class="min-w-[150px]">
        <label class="text-gray-700 text-sm block mb-1">结束日期</label>
        <el-date-picker :model-value="filters.endDate" @update:model-value="update('endDate', $event)" type="date" class="w-full" />
      </div>
      <div class="flex-1 min-w-[120px]">
        <label class="text-gray-700 text-sm block mb-1">操作员</label>
        <el-input :model-value="filters.operatorName || ''" @update:model-value="update('operatorName', $event)" placeholder="请输入操作员" />
      </div>
      <div class="flex gap-2">
        <el-button @click="$emit('reset')">
          <el-icon><RefreshRight /></el-icon>
          重置
        </el-button>
        <el-button type="primary" @click="$emit('search')">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search, RefreshRight } from '@element-plus/icons-vue'

const props = defineProps({
  filters: { type: Object, default: () => ({}) },
  fertilizerTypes: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:filters', 'search', 'reset'])

const update = (key, value) => {
  emit('update:filters', { ...props.filters, [key]: value })
}
</script>
