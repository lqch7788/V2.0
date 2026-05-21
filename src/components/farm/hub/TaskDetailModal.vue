<template>
  <el-dialog
    :model-value="isOpen"
    title="任务详情"
    width="800px"
    @close="onClose"
  >
    <div v-if="task" class="space-y-4">
      <!-- 基本信息 -->
      <div>
        <h4 class="text-sm font-semibold text-gray-900 mb-3">基本信息</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span class="text-xs text-gray-500 block">任务类型</span>
            <span class="font-semibold text-gray-900">{{ task.typeName || '-' }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">任务区域</span>
            <span class="font-semibold text-gray-900">{{ task.greenhouseName || '-' }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">作物</span>
            <span class="font-semibold text-gray-900">{{ task.cropName || '-' }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">执行人</span>
            <span class="font-semibold text-gray-900">{{ task.assigneeName || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 时间信息 -->
      <div>
        <h4 class="text-sm font-semibold text-gray-900 mb-3">时间信息</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span class="text-xs text-gray-500 block">计划开始</span>
            <span class="font-semibold text-gray-900">{{ task.planStart || '-' }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">计划结束</span>
            <span class="font-semibold text-gray-900">{{ task.planEnd || '-' }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">状态</span>
            <el-tag :type="getStatusType(task.status)" size="small">
              {{ getStatusText(task.status) }}
            </el-tag>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">进度</span>
            <span class="font-semibold text-gray-900">{{ task.progress || 0 }}%</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="onClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>

defineProps({})

const getStatusType = (status) => {
  const types = {
    pending: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger',
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待执行',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消',
  }
  return texts[status] || status
}
</script>
