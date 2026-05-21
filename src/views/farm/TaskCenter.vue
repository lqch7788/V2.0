<template>
  <div class="task-tabs">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="全部任务" name="all">
        <div class="task-list">
          <el-empty v-if="tasks.length === 0" description="暂无任务" />
          <div v-else v-for="task in tasks" :key="task.id" class="task-item">
            <div class="task-info">
              <h4>{{ task.title }}</h4>
              <p>{{ task.description }}</p>
            </div>
            <div class="task-status">
              <el-tag :type="getStatusType(task.status)">{{ task.statusText }}</el-tag>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="待处理" name="pending">
        <div class="task-list">
          <el-empty v-if="pendingTasks.length === 0" description="暂无待处理任务" />
          <div v-else v-for="task in pendingTasks" :key="task.id" class="task-item">
            <div class="task-info">
              <h4>{{ task.title }}</h4>
              <p>{{ task.description }}</p>
            </div>
            <div class="task-status">
              <el-tag :type="getStatusType(task.status)">{{ task.statusText }}</el-tag>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="进行中" name="in_progress">
        <div class="task-list">
          <el-empty v-if="inProgressTasks.length === 0" description="暂无进行中任务" />
          <div v-else v-for="task in inProgressTasks" :key="task.id" class="task-item">
            <div class="task-info">
              <h4>{{ task.title }}</h4>
              <p>{{ task.description }}</p>
            </div>
            <div class="task-status">
              <el-tag :type="getStatusType(task.status)">{{ task.statusText }}</el-tag>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="已完成" name="completed">
        <div class="task-list">
          <el-empty v-if="completedTasks.length === 0" description="暂无已完成任务" />
          <div v-else v-for="task in completedTasks" :key="task.id" class="task-item">
            <div class="task-info">
              <h4>{{ task.title }}</h4>
              <p>{{ task.description }}</p>
            </div>
            <div class="task-status">
              <el-tag :type="getStatusType(task.status)">{{ task.statusText }}</el-tag>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeTab = ref('all')

const tasks = ref([
  { id: 1, title: '温室A1浇水任务', description: '需要对温室A1进行浇水', status: 'pending', statusText: '待处理' },
  { id: 2, title: '温室B2施肥任务', description: '需要对温室B2进行施肥', status: 'in_progress', statusText: '进行中' },
  { id: 3, title: '温室C1巡查任务', description: '需要对温室C1进行日常巡查', status: 'completed', statusText: '已完成' },
])

const pendingTasks = computed(() => tasks.value.filter(t => t.status === 'pending'))
const inProgressTasks = computed(() => tasks.value.filter(t => t.status === 'in_progress'))
const completedTasks = computed(() => tasks.value.filter(t => t.status === 'completed'))

const handleTabChange = (tab) => {
  console.log('切换到:', tab)
}

const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    in_progress: 'primary',
    completed: 'success'
  }
  return typeMap[status] || 'info'
}
</script>

<style scoped>
.task-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 20px;
  background: linear-gradient(to right, #3b82f6, #2563eb);
}

.task-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.task-tabs :deep(.el-tabs__item) {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  height: 40px;
  line-height: 40px;
}

.task-tabs :deep(.el-tabs__item:hover) {
  color: #fff;
}

.task-tabs :deep(.el-tabs__item.is-active) {
  color: #fff;
  font-weight: 600;
}

.task-tabs :deep(.el-tabs__active-bar) {
  background-color: #fff;
  height: 3px;
}

.task-list {
  padding: 16px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 8px;
}

.task-info h4 {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 500;
}

.task-info p {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}
</style>
