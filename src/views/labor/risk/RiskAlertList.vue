<!--
  风险预警列表
  对标 V1.1 src/components/labor/risk/RiskAlertList.tsx
-->
<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <el-table :data="alerts" v-loading="loading" border stripe>
      <el-table-column prop="code" label="预警编号" width="140">
        <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
      </el-table-column>
      <el-table-column label="等级" width="80">
        <template #default="{ row }">
          <el-tag :type="levelTagType(row.level)" size="small">{{ levelText(row.level) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" min-width="100" />
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
      <el-table-column prop="department" label="部门" min-width="100" />
      <el-table-column prop="date" label="时间" width="120" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="$emit('view', row)">查看</el-button>
          <el-button link type="success" size="small" @click="$emit('handle', row)">处理</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
defineProps({
  alerts: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['view', 'handle'])

const LEVEL_MAP = { high: 'danger', medium: 'warning', low: 'info' }
const LEVEL_TEXT = { high: '高', medium: '中', low: '低' }
const STATUS_MAP = {
  pending: { tag: 'warning', text: '待处理' },
  handling: { tag: 'primary', text: '处理中' },
  resolved: { tag: 'success', text: '已处理' },
  ignored: { tag: 'info', text: '已忽略' },
}

const levelTagType = (l) => LEVEL_MAP[l] || 'info'
const levelText = (l) => LEVEL_TEXT[l] || l
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s
</script>