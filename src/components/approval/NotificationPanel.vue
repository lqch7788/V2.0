<template>
  <el-dialog
    v-model="visible"
    title="审批通知"
    width="700px"
    :close-on-click-modal="true"
    @close="handleClose"
  >
    <!-- Tab切换 -->
    <div class="flex border-b border-gray-200">
      <button
        @click="activeTab = 'notifications'"
        :class="[
          'flex-1 py-3 text-sm font-medium text-center transition-colors',
          activeTab === 'notifications'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        ]"
      >
        通知消息
      </button>
      <button
        @click="activeTab = 'delegations'"
        :class="[
          'flex-1 py-3 text-sm font-medium text-center transition-colors',
          activeTab === 'delegations'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        ]"
      >
        委托管理
        <span
          v-if="activeDelegations.length > 0"
          class="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded"
        >
          {{ activeDelegations.length }}
        </span>
      </button>
    </div>

    <!-- 内容区 -->
    <div class="flex-1 overflow-y-auto max-h-[60vh]">
      <!-- 通知消息Tab -->
      <div v-if="activeTab === 'notifications'">
        <!-- 批量操作 -->
        <div
          v-if="unreadCount > 0"
          class="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between"
        >
          <span class="text-sm text-gray-500">
            有 {{ unreadCount }} 条未读消息
          </span>
          <el-button size="small" link @click="handleMarkAllAsRead">
            <el-icon class="mr-1"><Check /></el-icon>
            全部已读
          </el-button>
        </div>

        <!-- 通知列表 -->
        <div class="divide-y divide-gray-100">
          <!-- 空状态 -->
          <div v-if="notifications.length === 0" class="p-8 text-center text-gray-500">
            <el-icon :size="48" class="text-gray-300 mb-3"><Bell /></el-icon>
            <p>暂无通知消息</p>
          </div>

          <!-- 通知项 -->
          <div
            v-for="notification in notifications"
            :key="notification.id"
            :class="[
              'p-4 hover:bg-gray-50 transition-colors',
              !notification.isRead ? 'bg-blue-50/50' : ''
            ]"
          >
            <div class="flex items-start gap-3">
              <!-- 通知图标 -->
              <div class="flex-shrink-0 mt-0.5 text-xl">
                {{ getNotificationIcon(notification.type) }}
              </div>

              <!-- 通知内容 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <el-icon :size="16" :class="getLevelIconColor(notification.level)">
                    <component :is="getLevelIcon(notification.level)" />
                  </el-icon>
                  <h3 class="text-sm font-medium text-gray-900 truncate">
                    {{ notification.title }}
                  </h3>
                  <span
                    v-if="!notification.isRead"
                    class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"
                  />
                </div>
                <p class="text-sm text-gray-500 mt-1 line-clamp-2">
                  {{ notification.content }}
                </p>
                <div class="flex items-center gap-3 mt-2">
                  <span class="text-xs text-gray-400">
                    {{ formatNotificationTime(notification.createdAt) }}
                  </span>
                  <span
                    v-if="notification.approvalType"
                    class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                  >
                    {{ getApprovalTypeName(notification.approvalType) }}
                  </span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <el-button
                v-if="!notification.isRead"
                link
                size="small"
                @click="handleMarkAsRead(notification.id)"
                title="标记为已读"
              >
                <el-icon class="text-gray-400"><Check /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 委托管理Tab -->
      <div v-else class="p-4">
        <!-- 空状态 -->
        <div v-if="activeDelegations.length === 0" class="text-center py-8">
          <el-icon :size="48" class="text-gray-300 mb-3"><User /></el-icon>
          <p class="text-gray-500 mb-2">暂无生效的委托</p>
          <p class="text-sm text-gray-400">
            您可以将审批权限委托给其他同事
          </p>
        </div>

        <!-- 委托列表 -->
        <div v-else class="space-y-3">
          <h3 class="text-sm font-medium text-gray-700">当前生效的委托</h3>
          <div
            v-for="delegation in activeDelegations"
            :key="delegation.id"
            class="p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">
                  委托给 {{ delegation.delegateeName }}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  <el-icon class="w-3 h-3"><Clock /></el-icon>
                  {{ formatDate(delegation.startTime) }} -
                  {{ formatDate(delegation.endTime) }}
                </p>
              </div>
              <el-tag size="small" type="success">生效中</el-tag>
            </div>
            <p v-if="delegation.reason" class="text-xs text-gray-500 mt-2">
              {{ delegation.reason }}
            </p>
          </div>
        </div>

        <!-- 创建委托按钮 -->
        <el-button type="primary" class="w-full mt-4 bg-blue-600 hover:bg-blue-700">
          创建新委托
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Bell, Check, Clock, User, WarningFilled, Info, CircleCheckFilled } from '@element-plus/icons-vue'
import { ElDialog, ElButton, ElIcon, ElTag } from 'element-plus'

// ============================================================
// 审批通知面板组件
// 文件路径：src/components/approval/NotificationPanel.vue
// ============================================================

// 通知类型枚举
const NotificationType = {
  APPROVAL_PENDING: 'approval_pending',
  APPROVAL_RESULT: 'approval_result',
  DELEGATION: 'delegation',
  REMINDER: 'reminder',
  SYSTEM: 'system'
}

// 通知级别枚举
const NotificationLevel = {
  INFO: 'info',
  WARNING: 'warning',
  IMPORTANT: 'important',
  URGENT: 'urgent'
}

// 审批类型
const ApprovalType = {
  PURCHASE_ORDER: 'purchase_order',
  PURCHASE_PLAN: 'purchase_plan',
  MATERIAL_REQUISITION: 'material_requisition',
  PRODUCTION_PLAN: 'production_plan',
  HARVEST_RECORD: 'harvest_record'
}

const props = defineProps({
  // 是否打开
  isOpen: {
    type: Boolean,
    default: false
  },
  // 关闭回调
  onClose: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['update:isOpen'])

// 可见性
const visible = computed({
  get() {
    return props.isOpen
  },
  set(val) {
    emit('update:isOpen', val)
  }
})

// 当前Tab
const activeTab = ref('notifications')

// 模拟通知数据（实际使用时替换为真实数据）
const notifications = ref([])
const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

// 模拟委托数据
const activeDelegations = ref([])

// 获取通知图标
const getNotificationIcon = (type) => {
  switch (type) {
    case NotificationType.APPROVAL_PENDING:
      return '📋'
    case NotificationType.APPROVAL_RESULT:
      return '✅'
    case NotificationType.DELEGATION:
      return '👤'
    case NotificationType.REMINDER:
      return '⏰'
    default:
      return '📢'
  }
}

// 获取级别图标
const getLevelIcon = (level) => {
  switch (level) {
    case NotificationLevel.WARNING:
      return WarningFilled
    case NotificationLevel.URGENT:
      return WarningFilled
    case NotificationLevel.IMPORTANT:
      return Info
    default:
      return Info
  }
}

// 获取级别图标颜色
const getLevelIconColor = (level) => {
  switch (level) {
    case NotificationLevel.WARNING:
      return 'text-yellow-500'
    case NotificationLevel.URGENT:
      return 'text-red-500'
    case NotificationLevel.IMPORTANT:
      return 'text-orange-500'
    default:
      return 'text-blue-500'
  }
}

// 获取审批类型名称
const getApprovalTypeName = (type) => {
  if (!type) return ''
  const typeMap = {
    [ApprovalType.PURCHASE_ORDER]: '采购订单',
    [ApprovalType.PURCHASE_PLAN]: '采购计划',
    [ApprovalType.MATERIAL_REQUISITION]: '领料申请',
    [ApprovalType.PRODUCTION_PLAN]: '生产计划',
    [ApprovalType.HARVEST_RECORD]: '采收记录'
  }
  return typeMap[type] || type
}

// 格式化通知时间
const formatNotificationTime = (timeStr) => {
  try {
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    return date.toLocaleDateString('zh-CN')
  } catch {
    return timeStr
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  try {
    return new Date(dateStr).toLocaleDateString('zh-CN')
  } catch {
    return dateStr
  }
}

// 标记已读
const handleMarkAsRead = (id) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.isRead = true
  }
}

// 全部标记已读
const handleMarkAllAsRead = () => {
  notifications.value.forEach(n => {
    n.isRead = true
  })
}

// 关闭处理
const handleClose = () => {
  props.onClose()
}
</script>

<style scoped>
:deep(.el-dialog__body) {
  padding: 0 !important;
}
</style>
