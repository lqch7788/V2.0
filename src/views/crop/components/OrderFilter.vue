<template>
  <!-- 订单筛选工具栏组件 - V1.1 OrderFilter.tsx 1:1 翻译 -->
  <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div class="flex items-end gap-4 flex-wrap">
      <!-- 订单编号 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">订单编号</label>
        <el-input
          :model-value="filters.orderCode"
          placeholder="请输入订单编号"
          clearable
          @update:model-value="(val) => onChange({ ...filters, orderCode: val })"
        />
      </div>

      <!-- 订单名称 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">订单名称</label>
        <el-input
          :model-value="filters.orderName"
          placeholder="请输入订单名称"
          clearable
          @update:model-value="(val) => onChange({ ...filters, orderName: val })"
        />
      </div>

      <!-- 作物品种 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">作物品种</label>
        <el-select
          :model-value="filters.cropName"
          placeholder="请选择"
          clearable
          class="w-full"
          @change="(val) => onChange({ ...filters, cropName: val })"
        >
          <el-option
            v-for="item in cropNames"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>

      <!-- 订单状态 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">订单状态</label>
        <el-select
          :model-value="filters.status"
          placeholder="请选择"
          clearable
          class="w-full"
          @change="(val) => onChange({ ...filters, status: val })"
        >
          <el-option
            v-for="opt in orderStatusOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>

      <!-- 订单日期 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">订单日期</label>
        <el-date-picker
          :model-value="filters.orderDate"
          type="date"
          value-format="YYYY-MM-DD"
          class="w-full"
          @update:model-value="(val) => onChange({ ...filters, orderDate: val })"
        />
      </div>

      <!-- 按钮 -->
      <div class="flex gap-2">
        <el-button size="small" class="whitespace-nowrap" @click="onReset">
          <RotateCcw class="w-4 h-4 mr-1" />
          重置
        </el-button>
        <el-button type="primary" size="small" class="whitespace-nowrap" @click="onSearch">
          <Search class="w-4 h-4 mr-1" />
          搜索
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * OrderFilter 订单筛选工具栏组件
 * 对应 V1.1 src/components/farm/order/components/OrderFilter.tsx 1:1 翻译
 *
 * Props（与 V1.1 OrderFilterProps 1:1 对齐）：
 * - filters: CropOrderFilters 筛选条件 state
 * - onChange: 筛选条件变化回调
 * - onSearch: 搜索按钮回调
 * - onReset: 重置按钮回调
 * - orderStatusOptions: 订单状态下拉选项
 * - cropNames: 作物品种下拉选项
 */
import { Search, RotateCcw } from 'lucide-vue-next'

defineProps({
  filters: {
    type: Object,
    required: true
  },
  onChange: {
    type: Function,
    required: true
  },
  onSearch: {
    type: Function,
    required: true
  },
  onReset: {
    type: Function,
    required: true
  },
  orderStatusOptions: {
    type: Array,
    required: true
  },
  cropNames: {
    type: Array,
    required: true
  }
})
</script>
