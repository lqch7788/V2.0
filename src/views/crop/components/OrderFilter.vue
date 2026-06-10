<template>
  <!-- 订单筛选工具栏组件 - V1.1 OrderFilter.tsx 1:1 翻译（grid 布局防溢出） -->
  <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <!-- 字段区：响应式 grid - sm 2 列 / md 3 列 / lg 4 列 / xl 7 列（一行平铺） -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-end">
      <!-- 订单编号 -->
      <div class="min-w-0">
        <label class="block text-sm font-medium text-gray-700 mb-1">订单编号</label>
        <el-input
          :model-value="filters.orderCode"
          placeholder="请输入订单编号"
          clearable
          style="width: 100%"
          @update:model-value="(val) => onChange({ ...filters, orderCode: val })"
        />
      </div>

      <!-- 订单名称 -->
      <div class="min-w-0">
        <label class="block text-sm font-medium text-gray-700 mb-1">订单名称</label>
        <el-input
          :model-value="filters.orderName"
          placeholder="请输入订单名称"
          clearable
          style="width: 100%"
          @update:model-value="(val) => onChange({ ...filters, orderName: val })"
        />
      </div>

      <!-- 作物品种 -->
      <div class="min-w-0">
        <label class="block text-sm font-medium text-gray-700 mb-1">作物品种</label>
        <el-select
          :model-value="filters.cropName"
          placeholder="请选择"
          clearable
          style="width: 100%"
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
      <div class="min-w-0">
        <label class="block text-sm font-medium text-gray-700 mb-1">订单状态</label>
        <el-select
          :model-value="filters.status"
          placeholder="请选择"
          clearable
          style="width: 100%"
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

      <!-- 开始日期 - 显式 width:100% 防 el-date-picker 默认 220px 溢出 -->
      <div class="min-w-0">
        <label class="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
        <el-date-picker
          :model-value="filters.startDate"
          type="date"
          placeholder="开始日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          @update:model-value="(val) => onChange({ ...filters, startDate: val || '' })"
        />
      </div>

      <!-- 结束日期 -->
      <div class="min-w-0">
        <label class="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
        <el-date-picker
          :model-value="filters.endDate"
          type="date"
          placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          @update:model-value="(val) => onChange({ ...filters, endDate: val || '' })"
        />
      </div>

      <!-- 创建人 -->
      <div class="min-w-0">
        <label class="block text-sm font-medium text-gray-700 mb-1">创建人</label>
        <el-input
          :model-value="filters.createBy"
          placeholder="请输入创建人"
          clearable
          style="width: 100%"
          @update:model-value="(val) => onChange({ ...filters, createBy: val })"
        />
      </div>
    </div>

    <!-- 按钮区：单独一行（与 V1.1 按钮组分离，避免与字段挤在同一 flex 行） -->
    <div class="flex justify-end gap-2 mt-4">
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
</template>

<script setup>
/**
 * OrderFilter 订单筛选工具栏组件
 * 对应 V1.1 src/components/farm/order/components/OrderFilter.tsx 1:1 翻译
 *
 * 布局策略：grid 二维网格（替代 flex-wrap），保证：
 * - el-date-picker 默认 220px 宽度不撑破容器
 * - 7 字段在 xl 屏 1 行（grid-cols-7），lg 屏 2 行（4+3），md 屏 3 行（3+3+1）
 * - 按钮组独立一行，不与字段争夺空间
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

<style scoped>
/* 防 el-date-picker / el-input 在小屏溢出 */
:deep(.el-date-editor.el-input),
:deep(.el-date-editor.el-input__wrapper),
:deep(.el-input),
:deep(.el-select) {
  width: 100% !important;
  max-width: 100%;
}
:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  min-width: 0;
}
</style>
