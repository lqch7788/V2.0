<template>
  <el-dialog
    :model-value="isOpen"
    width="600px"
    :close-on-click-modal="false"
    class="farm-modal"
    @close="handleClose"
  >
    <template #header>
      <div class="farm-modal-header">
        <span class="text-white text-lg font-semibold">超时处理</span>
      </div>
    </template>
    <div v-if="!task || !timeout" class="text-center py-8 text-gray-500">
      加载中...
    </div>

    <div v-else class="space-y-5">
      <!-- 超时警示 -->
      <div
        :class="[
          'flex items-start gap-3 p-4 rounded-lg border',
          timeout.severity === 'critical'
            ? 'text-red-600 bg-red-50 border-red-200'
            : 'text-amber-600 bg-amber-50 border-amber-200'
        ]"
      >
        <el-icon :size="20" class="mt-0.5 flex-shrink-0">
          <WarningFilled />
        </el-icon>
        <div>
          <p class="font-medium">
            任务{{ getTimeoutLabel() }}
          </p>
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
        <p class="font-medium text-gray-900">{{ task.title }}</p>
        <p class="text-sm text-gray-500 mt-1">
          任务编号：{{ task.taskCode }} · 执行人：{{ task.assigneeName }}
        </p>
        <p class="text-sm text-gray-500">
          原截止日期：{{ task.dueDate || '未设置' }}
        </p>
        <p class="text-sm text-gray-500">
          延期次数：{{ (task.deadlineExtensions || []).length }} / {{ DEADLINE_CONFIG.maxExtensions }}
        </p>
      </div>

      <!-- 处理方式选择 -->
      <div>
        <p class="text-gray-700 mb-2 font-medium">选择处理方式</p>
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            @click="handleType = 'continue'"
            :class="[
              'p-4 rounded-lg border-2 transition-colors',
              handleType === 'continue'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-400'
            ]"
          >
            <el-icon :size="24" class="mx-auto mb-2 block" :class="handleType === 'continue' ? 'text-emerald-500' : 'text-gray-400'">
              <VideoPlay />
            </el-icon>
            <p :class="['font-medium', handleType === 'continue' ? 'text-emerald-700' : 'text-gray-700']">
              继续执行
            </p>
            <p class="text-xs text-gray-500 mt-1">填写原因并延期</p>
          </button>

          <button
            type="button"
            @click="handleType = 'abandon'"
            :class="[
              'p-4 rounded-lg border-2 transition-colors',
              handleType === 'abandon'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-gray-400'
            ]"
          >
            <el-icon :size="24" class="mx-auto mb-2 block" :class="handleType === 'abandon' ? 'text-red-500' : 'text-gray-400'">
              <CircleCloseFilled />
            </el-icon>
            <p :class="['font-medium', handleType === 'abandon' ? 'text-red-700' : 'text-gray-700']">
              放弃执行
            </p>
            <p class="text-xs text-gray-500 mt-1">需重新派发</p>
          </button>
        </div>
      </div>

      <!-- 继续执行表单 -->
      <div v-if="handleType === 'continue'" class="space-y-3">
        <div>
          <p class="text-gray-700 mb-1">
            超时原因 <span class="text-red-500">*</span>
          </p>
          <el-input
            v-model="reason"
            type="textarea"
            :rows="2"
            placeholder="请说明超时原因..."
          />
        </div>

        <div>
          <p class="text-gray-700 mb-1">
            新截止日期 <span class="text-red-500">*</span>
          </p>
          <el-date-picker
            v-model="newDeadline"
            type="date"
            placeholder="选择新截止日期"
            :disabled-date="disabledDate"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
          <p class="text-xs text-gray-500 mt-1">
            每次最多延期 {{ DEADLINE_CONFIG.maxExtensionHours }} 小时
          </p>
        </div>

        <p v-if="!canExtend" class="text-sm text-red-600">
          已达最大延期次数（{{ DEADLINE_CONFIG.maxExtensions }}次），无法继续延期
        </p>
      </div>

      <!-- 放弃执行表单 -->
      <div v-if="handleType === 'abandon'">
        <p class="text-gray-700 mb-1">
          放弃原因 <span class="text-red-500">*</span>
        </p>
        <el-input
          v-model="reason"
          type="textarea"
          :rows="3"
          placeholder="请说明放弃执行的原因..."
        />
        <p class="text-xs text-gray-500 mt-1">
          放弃后任务将变为"已放弃"状态，需要管理员重新派发
        </p>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-3 justify-end pt-2">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          :type="handleType === 'abandon' ? 'danger' : 'primary'"
          @click="handleSubmit"
          :disabled="!canSubmit"
        >
          确认{{ handleType === 'continue' ? '继续执行' : '放弃执行' }}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
/**
 * 超时处理弹窗组件
 * 功能：执行人超时后选择继续执行或放弃
 */
import { ref, computed } from 'vue'
import { WarningFilled, VideoPlay, CircleCloseFilled } from '@element-plus/icons-vue'

// 延期配置常量（与 V1.1 DEADLINE_DEFAULTS 保持一致）
const DEADLINE_CONFIG = {
  maxExtensions: 3,
  maxExtensionHours: 72,
}

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  task: { type: Object, default: null },
  timeout: { type: Object, default: null },
  onContinue: { type: Function, default: () => {} },
  onAbandon: { type: Function, default: () => {} },
  onClose: { type: Function, default: () => {} },
})

const handleType = ref(null)  // 'continue' | 'abandon' | null
const reason = ref('')
const newDeadline = ref('')

// 是否还能延期
const canExtend = computed(() => {
  if (!props.task) return false
  return (props.task.deadlineExtensions || []).length < DEADLINE_CONFIG.maxExtensions
})

// 是否可以提交
const canSubmit = computed(() => {
  if (!handleType.value) return false
  if (!reason.value.trim()) return false
  if (handleType.value === 'continue') {
    if (!newDeadline.value) return false
    if (!canExtend.value) return false
  }
  return true
})

// 获取超时类型标签
const getTimeoutLabel = () => {
  if (!props.timeout) return '超时'
  switch (props.timeout.type) {
    case 'accept': return '接受超时'
    case 'execution': return '执行超时'
    case 'acceptance': return '验收超时'
    default: return '超时'
  }
}

// 格式化时间
const formatTime = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 不可选日期（今天之前）
const disabledDate = (date) => {
  return date.getTime() < Date.now() - 86400000
}

// 重置表单
const resetForm = () => {
  handleType.value = null
  reason.value = ''
  newDeadline.value = ''
}

// 提交处理
const handleSubmit = () => {
  if (handleType.value === 'continue') {
    if (reason.value.trim() && newDeadline.value) {
      props.onContinue(reason.value, newDeadline.value)
      resetForm()
    }
  } else if (handleType.value === 'abandon') {
    if (reason.value.trim()) {
      props.onAbandon(reason.value)
      resetForm()
    }
  }
}

// 关闭弹窗
const handleClose = () => {
  resetForm()
  props.onClose()
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
button {
  background: none;
  cursor: pointer;
  font-family: inherit;
}
</style>
