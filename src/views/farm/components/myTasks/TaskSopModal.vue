<template>
  <el-dialog
    :model-value="isOpen"
    :title="`作业标准文件 - ${task?.id || ''}`"
    width="700px"
    :show-close="true"
    @close="onClose"
  >
    <div v-if="task" class="bg-gray-50 rounded-lg p-4">
      <div class="mb-3">
        <span class="text-sm font-medium text-gray-700">任务类型：</span>
        <div class="flex flex-wrap gap-2 mt-1">
          <span
            v-for="t in (task.types || [])"
            :key="t"
            :class="['px-2 py-1 rounded text-xs text-white', getTypeColor(t)]"
          >
            {{ getTypeLabel(t) }}
          </span>
        </div>
      </div>
      <div class="bg-white rounded-lg p-4 border border-gray-200">
        <pre class="text-sm text-gray-700 whitespace-pre-wrap font-sans">{{ task.sopContent || '暂无SOP内容' }}</pre>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end">
        <button
          class="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
          @click="onClose"
        >
          <el-icon class="w-4 h-4"><Close /></el-icon>
          关闭
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * SOP 文件查看弹窗组件
 * 1:1 迁移自 V1.1 src/components/labor/myTasks/TaskSopModal.tsx
 */
import { Close } from '@element-plus/icons-vue'
import { getTypeColor, getTypeLabel } from './constants.js'

defineProps({
  isOpen: { type: Boolean, required: true },
  onClose: { type: Function, required: true },
  task: { type: Object, default: null },
})
</script>