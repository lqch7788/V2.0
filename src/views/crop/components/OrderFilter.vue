<template>
  <!-- 订单筛选工具栏组件 - V1.1 OrderFilter.tsx 1:1 翻译 -->
  <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div class="flex items-end gap-4 flex-wrap">
      <!-- 订单编号（V1.1 L36-47） -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">订单编号</label>
        <el-input
          :model-value="filters.orderCode"
          placeholder="请输入订单编号"
          clearable
          @update:model-value="(val) => onChange({ ...filters, orderCode: val })"
        />
      </div>

      <!-- 订单名称（V1.1 L49-61） -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">订单名称</label>
        <el-input
          :model-value="filters.orderName"
          placeholder="请输入订单名称"
          clearable
          @update:model-value="(val) => onChange({ ...filters, orderName: val })"
        />
      </div>

      <!-- 作物品种（V1.1 L63-83） -->
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

      <!-- 订单状态（V1.1 L85-105） -->
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

      <!-- 开始日期（V1.1 L108-117 P1 修复：单日期 → 区间） -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
        <el-date-picker
          :model-value="filters.startDate"
          type="date"
          placeholder="选择开始日期"
          value-format="YYYY-MM-DD"
          class="w-full"
          @update:model-value="(val) => onChange({ ...filters, startDate: val || '' })"
        />
      </div>

      <!-- 结束日期（V1.1 L118-127） -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
        <el-date-picker
          :model-value="filters.endDate"
          type="date"
          placeholder="选择结束日期"
          value-format="YYYY-MM-DD"
          class="w-full"
          @update:model-value="(val) => onChange({ ...filters, endDate: val || '' })"
        />
      </div>

      <!-- 创建人（V2.0 补全：V1.1 CropOrderFilters.createBy 在 filteredData 已用，OrderFilter 也需提供输入） -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">创建人</label>
        <el-input
          :model-value="filters.createBy"
          placeholder="请输入创建人"
          clearable
          @update:model-value="(val) => onChange({ ...filters, createBy: val })"
        />
      </div>

      <!-- 按钮（V1.1 L129-149：重置=warning黄 在前，搜索=default绿 在后） -->
      <div class="flex gap-2">
        <button :class="btnWarning" @click="onReset">
          <RotateCcw class="w-4 h-4" />
          重置
        </button>
        <button :class="btnDefault" @click="onSearch">
          <Search class="w-4 h-4" />
          搜索
        </button>
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
 * - filters: CropOrderFilters 筛选条件 state（orderCode/orderName/cropName/status/startDate/endDate/createBy 7 字段）
 * - onChange: 筛选条件变化回调
 * - onSearch: 搜索按钮回调
 * - onReset: 重置按钮回调
 * - orderStatusOptions: 订单状态下拉选项
 * - cropNames: 作物品种下拉选项
 */
import { Search, RotateCcw } from 'lucide-vue-next'
// 与生产模块共享按钮样式常量
import { btnDefault, btnWarning } from '@/views/production/constants/buttonStyles'

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
    default: () => []
  },
  cropNames: {
    type: Array,
    default: () => []
  }
})
</script>
