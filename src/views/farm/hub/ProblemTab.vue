<!--
  问题 Tab
  对标 V1.1 src/components/farm/hub/ProblemTab.tsx
-->
<template>
  <div class="space-y-4">
    <SourceFilter v-model="source" />
    <el-table :data="problems" border>
      <el-table-column prop="code" label="编号" width="140" />
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
      <el-table-column label="来源" width="120">
        <template #default="{ row }">
          <SourceBadge :source="row.source" />
        </template>
      </el-table-column>
      <el-table-column label="严重程度" width="120">
        <template #default="{ row }">
          <el-tag :type="severityType(row.severity)" size="small">{{ row.severity }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="$emit('dispatch', row)">派遣</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SourceFilter from './components/SourceFilter.vue'
import SourceBadge from './components/SourceBadge.vue'

defineProps({ problems: { type: Array, default: () => [] } })
defineEmits(['dispatch'])

const source = ref('')
const severityType = (s) => ({ low: 'info', medium: 'warning', high: 'danger' }[s] || 'info')
</script>