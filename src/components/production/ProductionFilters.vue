<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <div class="flex flex-wrap gap-4 items-end">
      <!-- 批次号 -->
      <div class="flex-1 min-w-[180px]">
        <label class="block text-sm font-medium text-gray-500 mb-1">批次号</label>
        <el-input
          :model-value="batchCodeSearch"
          @update:model-value="$emit('batchCodeChange', $event)"
          placeholder="请输入批次号"
          clearable
        />
      </div>

      <!-- 种植模式 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-500 mb-1">种植模式</label>
        <el-input
          :model-value="plantingModeSearch"
          @update:model-value="$emit('plantingModeChange', $event)"
          placeholder="请输入种植模式"
          clearable
        />
      </div>

      <!-- 作物名称 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-500 mb-1">作物名称</label>
        <el-input
          :model-value="cropNameSearch"
          @update:model-value="$emit('cropNameChange', $event)"
          placeholder="请输入作物名称"
          clearable
        />
      </div>

      <!-- 品种 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-500 mb-1">品种</label>
        <el-input
          :model-value="varietySearch"
          @update:model-value="$emit('varietyChange', $event)"
          placeholder="请输入品种"
          clearable
        />
      </div>

      <!-- 种植区域 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-500 mb-1">种植区域</label>
        <el-input
          :model-value="greenhouseSearch"
          @update:model-value="$emit('greenhouseChange', $event)"
          placeholder="请输入种植区域"
          clearable
        />
      </div>

      <!-- 状态 -->
      <div class="min-w-[120px]">
        <label class="block text-sm font-medium text-gray-500 mb-1">状态</label>
        <el-select
          :model-value="statusFilter"
          @update:model-value="$emit('statusChange', $event)"
          style="width: 100%"
        >
          <el-option label="全部" value="all" />
          <el-option label="草稿" value="draft" />
          <el-option label="待审批" value="pending" />
          <el-option label="已审批" value="approved" />
          <el-option label="已完成" value="completed" />
          <el-option label="已作废" value="cancelled" />
        </el-select>
      </div>

      <!-- 计划类型 -->
      <div class="min-w-[120px]">
        <label class="block text-sm font-medium text-gray-500 mb-1">计划类型</label>
        <el-select
          :model-value="planTypeFilter"
          @update:model-value="$emit('planTypeChange', $event)"
          style="width: 100%"
        >
          <el-option label="全部" value="all" />
          <el-option label="种植计划" value="planting" />
          <el-option label="育苗计划" value="seedling" />
          <el-option label="种源计划" value="seed_source" />
        </el-select>
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

defineProps({})

defineEmits(['batchCodeChange'])
</script>
