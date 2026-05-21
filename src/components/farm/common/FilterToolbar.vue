<template>
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
    <!-- 筛选字段插槽 -->
    <slot />

    <!-- 按钮行 -->
    <div class="flex justify-end gap-2 mt-4">
      <el-button
        v-if="showMore && onMoreToggle"
        @click="onMoreToggle"
      >
        <el-icon v-if="moreExpanded"><ArrowUp /></el-icon>
        <el-icon v-else><ArrowDown /></el-icon>
        {{ moreExpanded ? '收起' : '更多' }}
      </el-button>
      <el-button @click="onReset">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>
      <el-button type="primary" @click="onSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { Search, Refresh, ArrowUp, ArrowDown } from '@element-plus/icons-vue'

defineProps({"showMore":"false","moreExpanded":"false"})
</script>
