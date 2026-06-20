<!--
  技能匹配组件
  对标 V1.1 src/components/labor/skill/SkillMatch.tsx
-->
<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <h3 class="font-semibold mb-3 flex items-center gap-2">
      <el-icon :size="18" color="#059669"><Aim /></el-icon>
      技能匹配
    </h3>
    <el-table :data="matches" size="small" border>
      <el-table-column prop="workerName" label="员工" min-width="100" />
      <el-table-column prop="matchedSkills" label="已匹配技能" min-width="160" show-overflow-tooltip />
      <el-table-column prop="missingSkills" label="缺失技能" min-width="160" show-overflow-tooltip />
      <el-table-column label="匹配度" width="180">
        <template #default="{ row }">
          <el-progress :percentage="row.matchScore" :status="row.matchScore > 80 ? 'success' : 'warning'" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { Aim } from '@element-plus/icons-vue'

defineProps({
  matches: { type: Array, default: () => [] },
})
</script>