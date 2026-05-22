<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="20" color="white">
            <UserFilled />
          </el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">考勤管理</h1>
          <p class="text-xs text-gray-500">工人考勤、请假与加班管理</p>
        </div>
      </div>
    </div>

    <!-- Tab 切换区域 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-tabs v-model="activeTab" class="labor-tabs" @tab-change="handleTabChange">
        <!-- 工人考勤 Tab -->
        <el-tab-pane label="工人考勤" name="worker-attendance">
          <WorkerAttendancePanel />
        </el-tab-pane>

        <!-- 请假管理 Tab -->
        <el-tab-pane label="请假管理" name="leave">
          <LeavePanel />
        </el-tab-pane>

        <!-- 加班管理 Tab -->
        <el-tab-pane label="加班管理" name="overtime">
          <OvertimePanel />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { UserFilled } from '@element-plus/icons-vue'
import WorkerAttendancePanel from './components/WorkerAttendancePanel.vue'
import LeavePanel from './components/LeavePanel.vue'
import OvertimePanel from './components/OvertimePanel.vue'

// 当前激活的Tab
const activeTab = ref('worker-attendance')

// Tab切换处理
const handleTabChange = (tabName) => {
  // noop
}
</script>

<style scoped>
/* 继承全局样式，使用Element Plus Tabs样式 */
.labor-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 16px;
  background: linear-gradient-to-r from-blue-500 to-blue-600;
}

.labor-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.labor-tabs :deep(.el-tabs__item) {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  height: 40px;
  line-height: 40px;
}

.labor-tabs :deep(.el-tabs__item:hover) {
  color: white;
}

.labor-tabs :deep(.el-tabs__item.is-active) {
  color: white;
  font-weight: 600;
}

.labor-tabs :deep(.el-tabs__active-bar) {
  background-color: white;
  height: 3px;
}

.labor-tabs :deep(.el-tabs__content) {
  padding: 16px;
}
</style>
