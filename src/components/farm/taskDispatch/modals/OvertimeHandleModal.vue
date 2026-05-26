<template>
  <!-- 超时处理弹窗 - 从V1.1 OvertimeHandleModal.tsx 1:1迁移 -->
  <el-dialog :model-value="isOpen" @update:model-value="$emit('close')"
    title="超时处理" width="540px" top="5vh"
    :show-footer="false">
    <div v-if="task && timeout" class="space-y-5">
      <!-- 超时警示 -->
      <div class="flex items-start gap-3 p-4 rounded-lg border"
        :class="severityClass">
        <el-icon :size="20" class="flex-shrink-0 mt-0.5"><Warning /></el-icon>
        <div>
          <p class="font-medium">任务{{ timeoutLabel }}</p>
          <p class="text-sm mt-1 opacity-80">
            {{ timeout.severity === 'critical' ? '已超时，请及时处理' : '即将超时，请注意' }}
          </p>
          <p class="text-xs mt-1 opacity-60">
            开始时间：{{ formatTime(timeout.startedAt) }}
          </p>
        </div>
      </div>

      <!-- 任务信息 -->
      <div class="bg-gray-50 rounded-lg p-3">
        <p class="font-medium text-gray-900">{{ task.title || task.taskName }}</p>
        <p class="text-sm text-gray-500 mt-1">
          任务编号：{{ task.taskCode || task.id }} · 执行人：{{ task.assigneeName || task.assignee }}
        </p>
        <p class="text-sm text-gray-500">
          原截止日期：{{ task.dueDate || task.planEnd || '未设置' }}
        </p>
        <p class="text-sm text-gray-500">
          延期次数：{{ (task.deadlineExtensions || []).length }} / {{ maxExtensions }}
        </p>
      </div>

      <!-- 处理方式选择 -->
      <div>
        <span class="text-gray-700 mb-2 block font-medium">选择处理方式</span>
        <div class="grid grid-cols-2 gap-3">
          <div class="p-4 rounded-lg cursor-pointer border-2 transition-colors flex flex-col items-center"
            :class="handleType === 'continue' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-400'"
            @click="handleType = 'continue'">
            <el-icon :size="24" :class="handleType === 'continue' ? 'text-emerald-500' : 'text-gray-400'">
              <PlayCircle />
            </el-icon>
            <p class="font-medium mt-2" :class="handleType === 'continue' ? 'text-emerald-700' : 'text-gray-700'">继续执行</p>
            <p class="text-xs text-gray-500 mt-1">填写原因并延期</p>
          </div>
          <div class="p-4 rounded-lg cursor-pointer border-2 transition-colors flex flex-col items-center"
            :class="handleType === 'abandon' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-400'"
            @click="handleType = 'abandon'">
            <el-icon :size="24" :class="handleType === 'abandon' ? 'text-red-500' : 'text-gray-400'">
              <Close />
            </el-icon>
            <p class="font-medium mt-2" :class="handleType === 'abandon' ? 'text-red-700' : 'text-gray-700'">放弃执行</p>
            <p class="text-xs text-gray-500 mt-1">需重新派发</p>
          </div>
        </div>
      </div>

      <!-- 继续执行表单 -->
      <div v-if="handleType === 'continue'" class="space-y-3">
        <div>
          <span class="text-gray-700 mb-1 block font-medium">超时原因 <span class="text-red-500">*</span></span>
          <el-input v-model="reason" type="textarea" :rows="2" placeholder="请说明超时原因..." />
        </div>
        <div>
          <span class="text-gray-700 mb-1 block font-medium">新截止日期 <span class="text-red-500">*</span></span>
          <el-date-picker v-model="newDeadline" type="date" class="w-full" placeholder="选择新截止日期" />
          <p class="text-xs text-gray-500 mt-1">每次最多延期 {{ maxExtensionHours }} 小时</p>
        </div>
        <p v-if="!canExtend" class="text-sm text-red-600">
          已达最大延期次数（{{ maxExtensions }}次），无法继续延期
        </p>
      </div>

      <!-- 放弃执行表单 -->
      <div v-if="handleType === 'abandon'">
        <span class="text-gray-700 mb-1 block font-medium">放弃原因 <span class="text-red-500">*</span></span>
        <el-input v-model="reason" type="textarea" :rows="3" placeholder="请说明放弃执行的原因..." />
        <p class="text-xs text-gray-500 mt-1">放弃后任务将变为"已放弃"状态，需要管理员重新派发</p>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-3 justify-end pt-2">
        <el-button @click="handleCancel">取消</el-button>
        <el-button :type="handleType === 'abandon' ? 'danger' : 'primary'"
          :disabled="!canSubmit"
          @click="handleSubmit">
          确认{{ handleType === 'continue' ? '继续执行' : '放弃执行' }}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Warning, PlayCircle, Close } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  task: { type: Object, default: null },
  timeout: { type: Object, default: null },
})

const emit = defineEmits(['close', 'continue', 'abandon'])

const handleType = ref(null)
const reason = ref('')
const newDeadline = ref('')

const maxExtensions = 3
const maxExtensionHours = 72

const timeoutLabel = computed(() => {
  const labels = { accept: '接受超时', execution: '执行超时', acceptance: '验收超时' }
  return labels[props.timeout?.type] || '超时'
})

const severityClass = computed(() => {
  return props.timeout?.severity === 'critical'
    ? 'text-red-600 bg-red-50 border-red-200'
    : 'text-amber-600 bg-amber-50 border-amber-200'
})

const canExtend = computed(() => (props.task?.deadlineExtensions || []).length < maxExtensions)

const canSubmit = computed(() => {
  if (!handleType.value || !reason.value.trim()) return false
  if (handleType.value === 'continue') return !!newDeadline.value && canExtend.value
  return true
})

const handleSubmit = () => {
  if (handleType.value === 'continue') {
    if (reason.value.trim() && newDeadline.value) {
      emit('continue', reason.value, newDeadline.value)
      resetForm()
    }
  } else if (handleType.value === 'abandon') {
    if (reason.value.trim()) {
      emit('abandon', reason.value)
      resetForm()
    }
  }
}

const resetForm = () => {
  handleType.value = null
  reason.value = ''
  newDeadline.value = ''
}

const handleCancel = () => {
  resetForm()
  emit('close')
}

const formatTime = (time) => {
  try { return new Date(time).toLocaleString('zh-CN') } catch { return time }
}
</script>
