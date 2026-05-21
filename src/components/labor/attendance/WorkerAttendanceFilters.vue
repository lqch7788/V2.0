<template>
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
    <div class="flex flex-wrap gap-4 items-end">
      <!-- 时间筛选 -->
      <div class="flex-1 min-w-[250px]">
        <span class="block text-sm font-medium text-gray-700 mb-1">时间</span>
        <div class="flex items-center gap-2">
          <el-date-picker
            :model-value="filters.startDate"
            type="date"
            placeholder="开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="(val) => onFiltersChange({ startDate: val })"
          />
          <span class="text-gray-500">至</span>
          <el-date-picker
            :model-value="filters.endDate"
            type="date"
            placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="(val) => onFiltersChange({ endDate: val })"
          />
        </div>
      </div>

      <!-- 部门筛选 -->
      <div class="min-w-[150px]">
        <span class="block text-sm font-medium text-gray-700 mb-1">部门</span>
        <el-select
          :model-value="filters.dept"
          @change="(val) => onFiltersChange({ dept: val })"
          placeholder="选择部门"
          class="w-full"
        >
          <el-option v-for="dept in deptOptions" :key="dept" :label="dept" :value="dept" />
        </el-select>
      </div>

      <!-- 姓名/工号筛选 -->
      <div class="flex-1 min-w-[180px]">
        <span class="block text-sm font-medium text-gray-700 mb-1">姓名/工号</span>
        <el-input
          :model-value="filters.keyword"
          @input="(val) => onFiltersChange({ keyword: val })"
          placeholder="请输入"
        />
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-2">
        <el-button type="primary" size="small">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'

defineProps({})

const deptOptions = ['全部', '生产部', '运维部', '后勤部']
</script>
