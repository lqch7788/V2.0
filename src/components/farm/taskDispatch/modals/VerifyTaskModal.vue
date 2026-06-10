<template>
  <!-- 任务验收弹窗(验收人视角) - 从V1.1 VerifyTaskModal.tsx 1:1迁移 -->
  <el-dialog :model-value="isOpen" @update:model-value="$emit('close')"
    title="任务验收" width="720px" top="5vh">
    <div v-if="task" class="space-y-5">
      <!-- 任务基本信息 -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold text-gray-900">{{ task.title || task.taskName }}</h3>
          <span class="px-2 py-0.5 rounded text-xs" :class="[statusCfg.bg, statusCfg.color]">
            {{ statusCfg.label }}
          </span>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span class="text-gray-500 text-xs">任务编号</span>
            <p class="font-medium">{{ task.taskCode }}</p>
          </div>
          <div>
            <span class="text-gray-500 text-xs">执行人</span>
            <p class="font-medium">{{ task.assigneeName || task.assignee }}</p>
          </div>
          <div>
            <span class="text-gray-500 text-xs">任务类型</span>
            <p class="font-medium">{{ task.typeName || task.typeLabel }}</p>
          </div>
          <div>
            <span class="text-gray-500 text-xs">当前进度</span>
            <p class="font-medium">{{ task.progress }}%</p>
          </div>
        </div>
        <div v-if="task.dueDate || task.planEnd" class="mt-2 text-sm text-gray-500">
          截止日期：{{ task.dueDate || task.planEnd }}
        </div>
      </div>

      <!-- 执行记录 -->
      <div>
        <span class="text-gray-700 mb-2 block flex items-center gap-2 font-medium">
          <el-icon :size="16"><Clock /></el-icon>执行记录
        </span>
        <div class="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
          <div v-if="records.length > 0" class="p-3">
            <TaskProgressTimeline :status="task.status" :progress="task.progress" :timelines="records" />
          </div>
          <div v-else class="p-4 text-center text-gray-500 text-sm">暂无执行记录</div>
        </div>
      </div>

      <!-- 驳回提示 -->
      <div v-if="handleType === 'reject'" class="bg-red-50 border border-red-200 rounded-lg p-3">
        <p class="text-sm text-red-800">
          <strong>注意：</strong>驳回后任务将返回给执行人，执行人需要继续执行或放弃。连续驳回2次后任务将变为"任务失败"状态，需要重新派发。
        </p>
      </div>

      <!-- 验收意见 -->
      <div>
        <span class="text-gray-700 mb-2 block font-medium">
          {{ handleType === 'reject' ? '驳回原因' : '验收意见' }}
          <span v-if="handleType === 'reject'" class="text-red-500">*</span>
        </span>
        <el-input v-model="comments" type="textarea" :rows="3"
          :placeholder="handleType === 'reject' ? '请填写驳回原因，说明需要返工的内容...' : '选填，可添加验收备注...'" />
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-3 justify-end pt-2 border-t border-gray-200">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="danger" :disabled="handleType === 'approve'"
          :plain="handleType !== 'reject'"
          @click="handleType = 'reject'">
          <el-icon><Close /></el-icon>驳回返工
        </el-button>
        <el-button type="primary" :disabled="handleType === 'reject'"
          :plain="handleType !== 'approve'"
          @click="handleType = 'approve'">
          <el-icon><CircleCheck /></el-icon>验收通过
        </el-button>
      </div>

      <!-- 确认操作 -->
      <div v-if="handleType" class="flex gap-3 justify-end pt-2 border-t border-gray-100">
        <el-button @click="resetForm">上一步</el-button>
        <el-button :type="handleType === 'reject' ? 'danger' : 'primary'"
          :disabled="handleType === 'reject' && !comments.trim()"
          @click="handleSubmit">
          {{ handleType === 'reject' ? '确认驳回' : '确认通过' }}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Clock, CircleCheck, Close } from '@element-plus/icons-vue'
import { STATUS_MAP } from '../constants/taskDispatchConstants'
import TaskProgressTimeline from '../components/TaskProgressTimeline.vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  task: { type: Object, default: null },
  records: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'verify'])

const handleType = ref(null)
const comments = ref('')

const statusCfg = computed(() =>
  STATUS_MAP[props.task?.status] || { label: props.task?.status, bg: 'bg-gray-100', color: 'text-gray-600' }
)

const handleSubmit = () => {
  if (handleType.value === 'approve') {
    emit('verify', true, comments.value || undefined)
  } else if (handleType.value === 'reject') {
    if (comments.value.trim()) {
      emit('verify', false, comments.value)
    }
  }
  resetForm()
}

const resetForm = () => {
  handleType.value = null
  comments.value = ''
}

const handleCancel = () => {
  resetForm()
  emit('close')
}
</script>
