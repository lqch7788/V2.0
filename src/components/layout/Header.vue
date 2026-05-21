<template>
  <header class="header">
    <div class="header-left">
      <!-- Logo和系统名称 -->
      <div class="logo-area">
        <router-link to="/" class="home-link" title="返回主页">
          <img src="/弘智耘LOGO.png" alt="弘智耘Logo" class="logo-img" />
        </router-link>
        <div class="logo-text">
          <span class="system-name">弘讯智能种植云</span>
          <span class="system-subtitle">Techmation Intelligent Crop Cloud</span>
        </div>
        <!-- 返回主页图标 - 使用与V1.1一致的lucide-react Home图标样式 -->
        <a @click="goHome" class="home-btn" title="返回主页" style="cursor: pointer;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </a>
      </div>
    </div>

    <div class="header-right">
      <!-- 通知 -->
      <div class="notification-wrapper">
        <el-popover
          placement="bottom-end"
          :width="320"
          trigger="click"
          v-model:visible="showNotifications"
        >
          <template #reference>
            <button class="action-btn">
              <el-badge :value="3" :hidden="true">
                <el-icon :size="20">
                  <Bell />
                </el-icon>
              </el-badge>
            </button>
          </template>
          <div class="notification-panel">
            <div class="notification-header">
              <h3>消息通知</h3>
            </div>
            <div class="notification-list">
              <div v-for="msg in recentNotices" :key="msg.id" class="notification-item">
                <div class="notification-dot" :class="msg.type"></div>
                <div class="notification-content">
                  <p class="notification-title">{{ msg.title }}</p>
                  <p class="notification-time">{{ msg.sendTime }}</p>
                </div>
              </div>
            </div>
            <div class="notification-footer">
              <router-link to="/messages" @click="showNotifications = false">查看全部消息</router-link>
            </div>
          </div>
        </el-popover>
      </div>

      <!-- 用户信息 -->
      <div class="user-wrapper">
        <el-dropdown @command="handleUserCommand" trigger="click">
          <span class="user-dropdown">
            <div class="user-avatar">LQC</div>
            <span class="username">陆启闯</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="settings">系统设置</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()

defineProps({ title: '' })

const emit = defineEmits(['command'])

const showNotifications = ref(false)

// 返回主页
const goHome = () => {
  router.push('/')
}

const recentNotices = ref([
  { id: 1, title: '系统更新通知', content: '系统将于今晚进行更新', sendTime: '2024-01-15 10:30', type: 'notice' },
  { id: 2, title: '审批提醒', content: '您有3条待审批任务', sendTime: '2024-01-15 09:15', type: 'approval' },
  { id: 3, title: '任务提醒', content: '温室A1浇水任务即将到期', sendTime: '2024-01-14 16:20', type: 'task' }
])

const handleUserCommand = (command) => {
  emit('command', command)
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1030;
  height: 48px;
  background: var(--header-bg);
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-img {
  height: 32px;
  width: auto;
}

.home-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.2s;
}

.home-link:hover {
  opacity: 0.8;
}

.home-btn {
  margin-left: 12px;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.home-btn:hover {
  background-color: #d1fae5;
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.system-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.system-subtitle {
  font-size: 10px;
  color: #6b7280;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notification-wrapper {
  position: relative;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #f3f4f6;
}

.user-wrapper {
  margin-left: 8px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
}

.user-dropdown:hover {
  background: #f3f4f6;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #059669;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

/* 通知面板样式 */
.notification-panel {
  margin: -12px -16px;
}

.notification-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.notification-header h3 {
  font-weight: 600;
  color: #111827;
  margin: 0;
  font-size: 14px;
}

.notification-list {
  max-height: 320px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #fafafa;
  cursor: pointer;
}

.notification-item:hover {
  background: #f9fafb;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.notification-dot.notice {
  background: #9ca3af;
}

.notification-dot.approval {
  background: #3b82f6;
}

.notification-dot.task {
  background: #059669;
}

.notification-dot.alert {
  background: #ef4444;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-time {
  font-size: 12px;
  color: #6b7280;
  margin: 4px 0 0 0;
}

.notification-footer {
  padding: 12px 16px;
  text-align: center;
  border-top: 1px solid #f3f4f6;
}

.notification-footer a {
  color: #059669;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
}

.notification-footer a:hover {
  color: #047857;
}
</style>