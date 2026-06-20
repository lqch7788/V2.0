<!--
  我的任务页面
  对标 V1.1 src/components/labor/myTasks/MyTasksPage.tsx
-->
<template>
  <div class="space-y-4">
    <TaskFilterTabs v-model="activeTab" :tabs="tabs" />
    <div class="bg-white rounded-xl shadow-sm p-4">
      <el-table :data="filteredTasks" v-loading="loading" border stripe>
        <el-table-column prop="code" label="任务编号" width="140">
          <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }"><el-tag size="small">{{ row.type }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="plannedDate" label="计划日期" width="120" />
        <el-table-column label="优先级" width="80">
          <template #default="{ row }">
            <el-tag :type="priorityTagType(row.priority)" size="small">{{ priorityText(row.priority) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="$emit('view', row)">查看</el-button>
            <el-button link type="success" size="small" @click="$emit('feedback', row)">反馈</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import TaskFilterTabs from './TaskFilterTabs.vue'

const props = defineProps({
  tasks: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['view', 'feedback'])

const activeTab = ref('all')

const tabs = [
  { key: 'all', label: '全部', icon: 'List' },
  { key: 'production', label: '生产任务', icon: 'Box' },
  { key: 'temp', label: '临时任务', icon: 'Timer' },
  { key: 'problem', label: '问题整改', icon: 'WarningFilled' },
]

const PRIORITY_MAP = { urgent: { tag: 'danger', text: '加急' }, high: { tag: 'warning', text: '高' }, normal: { tag: 'info', text: '普通' } }
const STATUS_MAP = {
  pending: { tag: 'warning', text: '待执行' },
  executing: { tag: 'primary', text: '执行中' },
  completed: { tag: 'success', text: '已完成' },
  overdue: { tag: 'danger', text: '已超时' },
}

const priorityTagType = (p) => PRIORITY_MAP[p]?.tag || ''
const priorityText = (p) => PRIORITY_MAP[p]?.text || p
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s

const filteredTasks = computed(() => {
  if (activeTab.value === 'all') return props.tasks
  if (activeTab.value === 'production') return props.tasks.filter((t) => t.type === 'production')
  if (activeTab.value === 'temp') return props.tasks.filter((t) => t.type === 'temp')
  if (activeTab.value === 'problem') return props.tasks.filter((t) => t.type === 'problem')
  return props.tasks
})
</script>