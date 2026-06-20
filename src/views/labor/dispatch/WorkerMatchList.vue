<!--
  工人匹配列表
  对标 V1.1 src/components/labor/dispatch/WorkerMatchList.tsx
-->
<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <h3 class="font-semibold mb-3 flex items-center gap-2">
      <el-icon :size="18" color="#059669"><UserFilled /></el-icon>
      匹配工人 ({{ workers?.length || 0 }})
    </h3>
    <el-empty v-if="!workers?.length" description="无匹配工人" />
    <el-table v-else :data="workers" size="small" border>
      <el-table-column prop="code" label="工号" width="100" />
      <el-table-column prop="name" label="姓名" min-width="100" />
      <el-table-column prop="skill" label="技能" min-width="120" show-overflow-tooltip />
      <el-table-column label="匹配度" width="120">
        <template #default="{ row }">
          <el-progress :percentage="row.matchScore" :stroke-width="6" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="$emit('select', row)">选择</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { UserFilled } from '@element-plus/icons-vue'

defineProps({
  workers: { type: Array, default: () => [] },
})

defineEmits(['select'])
</script>