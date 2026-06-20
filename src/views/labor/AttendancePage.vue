<!--
  考勤管理聚合页面（V1.1 风格 1:1）
  对标 V1.1 src/pages/Labor/AttendancePage.tsx
  包含 3 个 Tab：工人考勤、请假管理、加班管理
-->
<template>
  <div class="space-y-6">
    <TabHeader
      title="考勤管理"
      subtitle="工人考勤、请假与加班管理"
      v-model="activeTab"
      :tabs="tabs"
    />
    <div>
      <WorkerAttendancePage v-if="activeTab === 'worker-attendance'" />
      <LeavePage v-else-if="activeTab === 'leave'" />
      <OvertimePage v-else-if="activeTab === 'overtime'" />
    </div>
  </div>
</template>

<script setup>
import { ref, markRaw } from 'vue'
import { User, Calendar, Clock } from '@element-plus/icons-vue'
import TabHeader from './components/TabHeader.vue'
import WorkerAttendancePage from './attendance/WorkerAttendancePage.vue'
import LeavePage from './leave/LeavePage.vue'
import OvertimePage from './overtime/OvertimePage.vue'

const activeTab = ref('worker-attendance')

const tabs = [
  { key: 'worker-attendance', label: '工人考勤', icon: markRaw(User) },
  { key: 'leave', label: '请假管理', icon: markRaw(Calendar) },
  { key: 'overtime', label: '加班管理', icon: markRaw(Clock) },
]
</script>