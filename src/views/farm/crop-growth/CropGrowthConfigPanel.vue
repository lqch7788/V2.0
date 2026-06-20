<!--
  作物生长配置面板
  对标 V1.1 src/components/farm/crop-growth/CropGrowthConfigPanel.tsx
-->
<template>
  <div class="bg-white rounded-xl p-4 shadow-sm space-y-4">
    <h3 class="font-semibold flex items-center gap-2">
      <el-icon :size="18" color="#059669"><TrendCharts /></el-icon>
      生长阶段配置
    </h3>
    <el-table :data="stages" border size="small">
      <el-table-column prop="name" label="阶段" min-width="100" />
      <el-table-column prop="duration" label="天数" width="80" align="right" />
      <el-table-column prop="temperature" label="适宜温度(℃)" width="120" align="right" />
      <el-table-column prop="humidity" label="湿度(%)" width="100" align="right" />
      <el-table-column prop="light" label="光照(h)" width="100" align="right" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="$emit('edit', row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-button type="primary" dashed class="w-full" @click="$emit('add')">
      <el-icon><Plus /></el-icon>
      添加阶段
    </el-button>
  </div>
</template>

<script setup>
import { Plus, TrendCharts } from '@element-plus/icons-vue'

defineProps({
  stages: { type: Array, default: () => [] },
})

defineEmits(['edit', 'add'])
</script>