<template>
  <!-- 订单筛选工具栏 - 从V1.1 OrderFilter.tsx 1:1迁移 -->
  <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div class="flex items-end gap-4 flex-wrap">
      <!-- 订单编号 -->
      <div class="flex-1 min-w-[150px]">
        <label class="text-gray-700 text-sm block mb-1">订单编号</label>
        <el-input
          :model-value="filters.orderCode"
          @update:model-value="update('orderCode', $event)"
          placeholder="请输入订单编号"
          size="default"
        />
      </div>

      <!-- 订单名称 -->
      <div class="flex-1 min-w-[150px]">
        <label class="text-gray-700 text-sm block mb-1">订单名称</label>
        <el-input
          :model-value="filters.orderName"
          @update:model-value="update('orderName', $event)"
          placeholder="请输入订单名称"
          size="default"
        />
      </div>

      <!-- 作物品种 -->
      <div class="flex-1 min-w-[150px]">
        <label class="text-gray-700 text-sm block mb-1">作物品种</label>
        <el-select
          :model-value="filters.cropName"
          @update:model-value="update('cropName', $event)"
          placeholder="请选择"
          class="w-full"
        >
          <el-option
            v-for="item in cropNames"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          />
        </el-select>
      </div>

      <!-- 订单状态 -->
      <div class="flex-1 min-w-[150px]">
        <label class="text-gray-700 text-sm block mb-1">订单状态</label>
        <el-select
          :model-value="filters.status"
          @update:model-value="update('status', $event)"
          placeholder="请选择"
          class="w-full"
        >
          <el-option
            v-for="opt in orderStatusOptions"
            :key="opt.value"
            :value="opt.value"
            :label="opt.label"
          />
        </el-select>
      </div>

      <!-- 创建人 -->
      <div class="flex-1 min-w-[150px]">
        <label class="text-gray-700 text-sm block mb-1">创建人</label>
        <el-input
          :model-value="filters.createBy"
          @update:model-value="update('createBy', $event)"
          placeholder="请输入创建人"
          size="default"
        />
      </div>

      <!-- 订单日期范围 -->
      <div class="flex-1 min-w-[200px]">
        <label class="text-gray-700 text-sm block mb-1">订单日期</label>
        <el-date-picker
          :model-value="dateRange"
          @update:model-value="handleDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="w-full"
        />
      </div>

      <!-- 按钮 -->
      <div class="flex gap-2">
        <el-button size="default" @click="$emit('reset')">
          <el-icon><RefreshRight /></el-icon>
          重置
        </el-button>
        <el-button type="primary" size="default" @click="$emit('search')">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Search, RefreshRight } from '@element-plus/icons-vue'

const props = defineProps({
  filters: { type: Object, required: true },
  orderStatusOptions: { type: Array, default: () => [] },
  cropNames: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:filters', 'search', 'reset'])

const update = (key, value) => {
  emit('update:filters', { ...props.filters, [key]: value })
}

const dateRange = computed(() => {
  if (props.filters.startDate && props.filters.endDate) {
    return [new Date(props.filters.startDate), new Date(props.filters.endDate)]
  }
  return null
})

const handleDateRange = (val) => {
  if (val && val.length === 2) {
    emit('update:filters', {
      ...props.filters,
      startDate: val[0].toISOString().split('T')[0],
      endDate: val[1].toISOString().split('T')[0],
    })
  } else {
    emit('update:filters', { ...props.filters, startDate: '', endDate: '' })
  }
}
</script>
