<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white"><Bell /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">消息中心</h1>
            <p class="text-gray-500">查看系统通知和提醒</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选按钮 -->
    <div class="bg-white rounded-xl p-1 inline-flex shadow-sm">
      <button
        v-for="item in filterOptions"
        :key="item.value"
        @click="activeFilter = item.value"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          activeFilter === item.value
            ? 'bg-emerald-500 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100'
        ]"
      >
        {{ item.label }}
      </button>
    </div>

    <!-- 消息列表 -->
    <div class="space-y-2" v-loading="store.isLoading">
      <div v-if="paginatedMessages.length === 0" class="bg-white rounded-xl p-12 shadow-sm text-center">
        <el-empty description="暂无消息" />
      </div>

      <div
        v-for="msg in paginatedMessages"
        :key="msg.id"
        :class="[
          'bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all',
          { 'border-l-4 border-l-emerald-500': !msg.isRead }
        ]"
      >
        <div class="flex items-start gap-4">
          <div class="p-2 bg-gray-50 rounded-lg">
            <el-icon :size="20" :color="getIconColor(msg.type)">
              <component :is="getIconComp(msg.type)" />
            </el-icon>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-semibold text-gray-900">{{ msg.title }}</h3>
              <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{{ getTypeLabel(msg.type) }}</span>
              <span v-if="!msg.isRead" class="w-2 h-2 bg-emerald-500 rounded-full"></span>
            </div>
            <p class="text-sm text-gray-600 mt-1">{{ msg.content }}</p>
            <div class="flex items-center justify-between mt-2">
              <p class="text-xs text-gray-400">{{ msg.sendTime }}</p>
              <div class="flex gap-2">
                <button
                  v-if="!msg.isRead"
                  class="text-xs text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
                  @click="markAsRead(msg)"
                >
                  标为已读
                </button>
                <button
                  class="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  @click="deleteMessage(msg)"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="filteredMessages.length > 0" class="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-100">
        <span class="text-sm text-gray-500">共 {{ filteredMessages.length }} 条记录</span>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredMessages.length"
          :page-sizes="[5, 10, 20, 50]"
          layout="sizes, prev, pager, next"
          @size-change="onPageSizeChange"
          background
          small
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Bell, Clock, WarningFilled, List, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAnnouncementStore } from '@/stores/modules/announcement.js'

const store = useAnnouncementStore()

// 筛选选项
const activeFilter = ref('all')
const filterOptions = [
  { value: 'all', label: '全部' },
  { value: 'task', label: '任务' },
  { value: 'approval', label: '审批' },
  { value: 'alert', label: '告警' },
  { value: 'notice', label: '公告' },
]

// 分页
const currentPage = ref(1)
const pageSize = ref(5)

// 组件挂载时获取公告数据
onMounted(() => {
  if (store.notices.length === 0) {
    store.fetchNotices()
  }
})

// 将公告转为消息格式
const messages = computed(() => {
  return store.notices.map(notice => ({
    id: notice.id,
    type: notice.type || 'notice',
    title: notice.title,
    content: notice.content || '',
    sendTime: notice.createTime || notice.date || '',
    isRead: notice.status === '已发布' || notice.status === 'published' || notice.status === '已读',
    rawData: notice
  }))
})

// 筛选后的消息
const filteredMessages = computed(() => {
  if (activeFilter.value === 'all') return messages.value
  return messages.value.filter(m => m.type === activeFilter.value)
})

// 分页后的消息
const paginatedMessages = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredMessages.value.slice(start, start + pageSize.value)
})

// 类型图标
const iconMap = {
  task: List,
  approval: Clock,
  alert: WarningFilled,
  notice: InfoFilled,
}
const iconColorMap = {
  task: '#10b981',
  approval: '#3b82f6',
  alert: '#ef4444',
  notice: '#f59e0b',
}

function getIconComp(type) {
  return iconMap[type] || Bell
}

function getIconColor(type) {
  return iconColorMap[type] || '#6b7280'
}

function getTypeLabel(type) {
  const labels = { task: '任务', approval: '审批', alert: '告警', notice: '公告', system: '系统' }
  return labels[type] || '其他'
}

function onPageSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
}

// 标为已读
function markAsRead(msg) {
  const notice = store.notices.find(n => n.id === msg.id)
  if (notice) {
    store.updateNoticeStatus(msg.id, '已发布').then(() => {
      ElMessage.success('已标记为已读')
    }).catch(() => {
      ElMessage.warning('操作失败')
    })
  }
}

// 删除消息
function deleteMessage(msg) {
  ElMessageBox.confirm('确定要删除这条消息吗？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    store.deleteNotice(msg.id).then(() => {
      ElMessage.success('删除成功')
    }).catch(() => {
      ElMessage.error('删除失败')
    })
  }).catch(() => {})
}
</script>
