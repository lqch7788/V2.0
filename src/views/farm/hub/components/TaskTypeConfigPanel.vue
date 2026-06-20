<!--
  农场 Hub 任务类型配置面板
  对标 V1.1 src/components/farm/hub/components/TaskTypeConfigPanel.tsx
-->
<template>
  <div class="bg-white rounded-xl p-4 shadow-sm space-y-3">
    <h3 class="font-semibold flex items-center gap-2">
      <el-icon :size="18" color="#059669"><Setting /></el-icon>
      任务类型配置
    </h3>
    <el-table :data="types" border size="small">
      <el-table-column prop="name" label="类型名" min-width="120" />
      <el-table-column prop="code" label="编码" width="100" />
      <el-table-column prop="priority" label="默认优先级" width="120">
        <template #default="{ row }">
          <el-tag size="small">{{ row.priority }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="预计时长(h)" width="120" align="right" />
      <el-table-column label="启用" width="80">
        <template #default="{ row }">
          <el-switch v-model="row.enabled" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="$emit('edit', row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-button type="primary" dashed class="w-full" @click="$emit('add')">
      <el-icon><Plus /></el-icon>
      添加任务类型
    </el-button>
  </div>
</template>

<script setup>
import { Plus, Setting } from '@element-plus/icons-vue'

defineProps({
  types: { type: Array, default: () => [] },
})

defineEmits(['edit', 'add'])
</script>