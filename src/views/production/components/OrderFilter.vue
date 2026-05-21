<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <div class="flex flex-wrap gap-4 items-end">
      <!-- 订单编号 -->
      <div class="flex-1 min-w-[180px]">
        <label class="block text-sm font-medium text-gray-500 mb-1">订单编号</label>
        <el-input
          :model-value="filters.orderCode"
          @update:model-value="$emit('change', { ...filters, orderCode: $event })"
          placeholder="请输入订单编号"
          clearable
        />
      </div>

      <!-- 订单名称 -->
      <div class="flex-1 min-w-[180px]">
        <label class="block text-sm font-medium text-gray-500 mb-1">订单名称</label>
        <el-input
          :model-value="filters.orderName"
          @update:model-value="$emit('change', { ...filters, orderName: $event })"
          placeholder="请输入订单名称"
          clearable
        />
      </div>

      <!-- 作物名称 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-500 mb-1">作物名称</label>
        <el-select
          :model-value="filters.cropName"
          @update:model-value="$emit('change', { ...filters, cropName: $event })"
          placeholder="请选择作物"
          clearable
          filterable
        >
          <el-option
            v-for="crop in cropNames"
            :key="crop.value"
            :label="crop.label"
            :value="crop.value"
          />
        </el-select>
      </div>

      <!-- 状态 -->
      <div class="min-w-[150px]">
        <label class="block text-sm font-medium text-gray-500 mb-1">状态</label>
        <el-select
          :model-value="filters.status"
          @update:model-value="$emit('change', { ...filters, status: $event })"
          placeholder="请选择状态"
          clearable
        >
          <el-option
            v-for="status in orderStatusOptions"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          />
        </el-select>
      </div>

      <!-- 开始日期 -->
      <div class="flex-1 min-w-[180px]">
        <label class="block text-sm font-medium text-gray-500 mb-1">开始日期</label>
        <el-date-picker
          :model-value="filters.startDate"
          @update:model-value="$emit('change', { ...filters, startDate: $event })"
          type="date"
          placeholder="请选择开始日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </div>

      <!-- 结束日期 -->
      <div class="flex-1 min-w-[180px]">
        <label class="block text-sm font-medium text-gray-500 mb-1">结束日期</label>
        <el-date-picker
          :model-value="filters.endDate"
          @update:model-value="$emit('change', { ...filters, endDate: $event })"
          type="date"
          placeholder="请选择结束日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </div>

      <!-- 创建人 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-500 mb-1">创建人</label>
        <el-input
          :model-value="filters.createBy"
          @update:model-value="$emit('change', { ...filters, createBy: $event })"
          placeholder="请输入创建人"
          clearable
        />
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-2">
        <el-button type="primary" @click="$emit('search')">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="$emit('reset')">重置</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
import {  CropOrderFilters  } from '@/types/crop'

defineProps({})

defineEmits(['change'])
</script>
