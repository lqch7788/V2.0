<template>
  <el-dialog
    :model-value="isOpen"
    width="700px"
    :close-on-click-modal="false"
    class="farm-modal"
    @close="onClose"
  >
    <template #header>
      <div class="farm-modal-header">
        <span class="text-white text-lg font-semibold">任务验收</span>
      </div>
    </template>
    <div v-if="!task" class="text-center py-8 text-gray-500">
      加载中...
    </div>

    <div v-else class="space-y-5">
      <!-- 任务基本信息 -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold text-gray-900">{{ task.title }}</h3>
          <span :class="['px-2 py-0.5 rounded text-xs', statusConfig.bg, statusConfig.color]">
            {{ statusConfig.label }}
          </span>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span class="text-gray-500">任务编号</span>
            <p class="font-medium">{{ task.taskCode }}</p>
          </div>
          <div>
            <span class="text-gray-500">执行人</span>
            <p class="font-medium">{{ task.assigneeName }}</p>
          </div>
          <div>
            <span class="text-gray-500">任务类型</span>
            <p class="font-medium">{{ task.typeName }}</p>
          </div>
          <div>
            <span class="text-gray-500">当前进度</span>
            <p class="font-medium">{{ task.progress }}%</p>
          </div>
        </div>
        <div v-if="task.dueDate" class="mt-2 text-sm text-gray-500">
          截止日期：{{ task.dueDate }}
        </div>
      </div>

      <!-- 进度历史（使用 TaskProgressTimeline） -->
      <div>
        <label class="text-gray-700 mb-2 flex items-center gap-2">
          <el-icon :size="16"><Clock /></el-icon>
          执行记录
        </label>
        <div class="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
          <div v-if="records && records.length > 0" class="p-4">
            <TaskProgressTimeline :records="records" :show-task-info="false" />
          </div>
          <div v-else class="p-4 text-center text-gray-500 text-sm">
            暂无执行记录
          </div>
        </div>
      </div>

      <!-- 驳回原因提示 -->
      <div v-if="handleType === 'reject'" class="bg-red-50 border border-red-200 rounded-lg p-3">
        <p class="text-sm text-red-800">
          <strong>注意：</strong>驳回后任务将返回给执行人，执行人需要继续执行或放弃。连续驳回2次后任务将变为"任务失败"状态，需要重新派发。
        </p>
      </div>

      <!-- 验收意见 -->
      <div>
        <label class="text-gray-700 text-sm mb-2 block">
          {{ handleType === 'reject' ? '驳回原因' : '验收意见' }}
          <span v-if="handleType === 'reject'" class="text-red-500">*</span>
        </label>
        <el-input
          v-model="comments"
          type="textarea"
          :rows="3"
          :placeholder="handleType === 'reject' ? '请填写驳回原因，说明需要返工的内容...' : '选填，可添加验收备注...'"
        />
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-3 justify-end pt-2 border-t border-gray-200">
        <el-button size="small" @click="onClose">
          取消
        </el-button>

        <!-- 驳回按钮 -->
        <el-button
          :type="handleType === 'reject' ? 'danger' : ''"
          size="small"
          text
          :disabled="handleType === 'approve'"
          :class="handleType !== 'reject' ? 'text-red-600 hover:bg-red-100' : ''"
          @click="handleType = 'reject'"
        >
          <el-icon :size="16"><CircleCloseFilled /></el-icon>
          驳回返工
        </el-button>

        <!-- 通过按钮 -->
        <el-button
          :type="handleType === 'approve' ? 'primary' : ''"
          size="small"
          text
          :disabled="handleType === 'reject'"
          :class="handleType !== 'approve' ? 'text-emerald-600 hover:bg-emerald-100' : ''"
          @click="handleType = 'approve'"
        >
          <el-icon :size="16"><CircleCheckFilled /></el-icon>
          验收通过
        </el-button>
      </div>

      <!-- 确认操作 -->
      <div v-if="handleType" class="flex gap-3 justify-end pt-2 border-t border-gray-100">
        <el-button size="small" @click="resetForm">
          上一步
        </el-button>
        <el-button
          :type="handleType === 'reject' ? 'danger' : 'primary'"
          size="small"
          :disabled="handleType === 'reject' && !comments.trim()"
          @click="handleSubmit"
        >
          {{ handleType === 'reject' ? '确认驳回' : '确认通过' }}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
/**
 * 任务验收弹窗组件
 * 功能：验收人查看任务记录，选择通过验收或驳回返工
 * 对应 V1.1 src/components/farm/hub/modals/VerifyTaskModal.tsx 1:1 映射
 */
import { ref, computed } from 'vue'
import { Clock, CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import TaskProgressTimeline from './TaskProgressTimeline.vue'
import { TASK_STATUS_CONFIG } from '@/config/taskConfig'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  task: { type: Object, default: null },
  records: { type: Array, default: () => [] },
  onVerify: { type: Function, default: () => {} },
  onClose: { type: Function, default: () => {} },
})

const handleType = ref(null) // 'approve' | 'reject' | null
const comments = ref('')

/** 当前任务状态配置 */
const statusConfig = computed(() => {
  if (!props.task) return { label: '', bg: '', color: '' }
  return TASK_STATUS_CONFIG[props.task.status] || { label: props.task.status, bg: 'bg-gray-100', color: 'text-gray-600' }
})

/** 提交验收 */
function handleSubmit() {
  if (handleType.value === 'approve') {
    props.onVerify(true, comments.value || undefined)
  } else if (handleType.value === 'reject') {
    if (comments.value.trim()) {
      props.onVerify(false, comments.value)
    }
  }
  resetForm()
}

/** 重置表单 */
function resetForm() {
  handleType.value = null
  comments.value = ''
}
</script>

<style scoped>
:deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
  border-radius: 8px 8px 0 0;
}
.farm-modal-header {
  background: linear-gradient(to right, #059669, #10b981);
  padding: 16px 24px;
  border-radius: 8px 8px 0 0;
}
</style>
