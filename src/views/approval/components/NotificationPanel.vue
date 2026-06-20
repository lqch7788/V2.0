<!--
  审批通知面板组件
  对标 V1.1 src/components/approval/NotificationPanel.tsx
  功能：审批相关通知列表（待审批提醒/已审批结果/超时提醒等）
-->
<template>
  <div class="notification-panel">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0">
          <el-icon :size="20" color="#059669"><Bell /></el-icon>
        </el-badge>
        <span class="font-semibold text-gray-900">审批通知</span>
      </div>
      <el-button v-if="unreadCount > 0" link type="primary" size="small" @click="$emit('mark-all-read')">
        全部已读
      </el-button>
    </div>

    <el-empty v-if="notifications.length === 0" description="暂无通知" :image-size="80" />

    <div v-else class="space-y-2 max-h-96 overflow-y-auto">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        class="flex gap-3 p-3 rounded-lg cursor-pointer transition-colors"
        :class="notif.read ? 'bg-white hover:bg-gray-50' : 'bg-emerald-50 hover:bg-emerald-100'"
        @click="$emit('click', notif)"
      >
        <div class="flex-shrink-0 mt-1">
          <el-icon :size="18" :color="getNotifColor(notif.type)">
            <component :is="getNotifIcon(notif.type)" />
          </el-icon>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-medium text-sm text-gray-900 truncate">{{ notif.title }}</span>
            <el-tag v-if="!notif.read" type="danger" size="small" effect="dark">新</el-tag>
          </div>
          <p class="text-xs text-gray-600 mt-1 line-clamp-2">{{ notif.content }}</p>
          <div class="text-xs text-gray-400 mt-1">{{ notif.time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bell, CircleCheck, InfoFilled, WarningFilled } from '@element-plus/icons-vue'

const props = defineProps({
  notifications: { type: Array, default: () => [] },
})

defineEmits(['click', 'mark-all-read'])

const unreadCount = computed(() => props.notifications.filter((n) => !n.read).length)

const ICON_MAP = {
  approval_pending: InfoFilled,
  approval_approved: CircleCheck,
  approval_rejected: WarningFilled,
  approval_overdue: WarningFilled,
  system: Bell,
}

const COLOR_MAP = {
  approval_pending: '#f59e0b',
  approval_approved: '#10b981',
  approval_rejected: '#ef4444',
  approval_overdue: '#ef4444',
  system: '#3b82f6',
}

const getNotifIcon = (type) => ICON_MAP[type] || Bell
const getNotifColor = (type) => COLOR_MAP[type] || '#6b7280'
</script>

<style scoped>
.notification-panel .line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>