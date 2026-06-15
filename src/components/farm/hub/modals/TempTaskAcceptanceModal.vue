<!--
  农事任务中心 - 临时任务验收弹窗
  1:1 翻译自 V1.1 src/components/farm/hub/modals/TempTaskAcceptanceAdapter.tsx
       + VerifyTempTaskModal.tsx (396 行)
  V1.1 头部：bg-emerald-500 实色 + "任务验收 - {taskCode}" + × 关闭按钮
  V1.1 内容：任务基本信息卡 + 操作记录时间线 + 双 Tab 模式切换（验收通过 / 驳回返工）
       + 备注/原因 textarea + 警示信息（emerald-50 / red-50 配色）
       + 底部按钮（取消 + 确认验收通过/确认驳回）
  修复项：
  1. 顶部改为实色 emerald-500 + 任务编号 + 文字关闭按钮 (P0)
  2. 弹窗宽度 max-w-2xl (672px)（P1）
  3. 任务类型字段用 tempTaskType || '其他' (P1)
  4. 驳回次数文案 "驳回次数" 而非 "返工次数" (P0)
  5. 模式切换为双 Tab 样式（验收通过/驳回返工）(P0)
  6. label 文案 "验收备注 (选填)" / "驳回原因 *" (P1)
  7. 添加警示信息区（emerald-50 / red-50）(P0)
  8. records 字段兼容 actionTime/action_time、fromStatus/from_status、toStatus/to_status 双格式 (P1)
  9. 反馈内容完整解析 (text/images/gps/voice/materials) (P1)
  10. onConfirm/onReject 双事件保留 (P0)
-->
<template>
  <!-- V1.1 风格：max-w-2xl (672px) max-h-[90vh] rounded-2xl -->
  <div
    v-if="isOpen && task"
    class="fixed inset-0 z-50"
  >
    <div class="fixed inset-0 bg-black/50" @click="handleClose"></div>
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <!-- 顶部标题栏 - V1.1 风格 bg-emerald-500 实色 + × 关闭按钮 -->
        <div class="flex items-center justify-between px-6 py-4 bg-emerald-500 flex-shrink-0">
          <h2 class="text-lg font-semibold text-white">任务验收 - {{ task.taskCode }}</h2>
          <button
            class="text-white hover:bg-emerald-600 transition-colors rounded p-1"
            aria-label="关闭"
            @click="handleClose"
          >
            <span class="text-white text-xl leading-none">×</span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- 任务基本信息 -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="font-semibold text-gray-900 mb-3">{{ task.title }}</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span class="text-gray-500">执行人</span>
                <p class="font-medium">{{ task.assigneeName }}</p>
              </div>
              <div>
                <span class="text-gray-500">任务类型</span>
                <p class="font-medium">{{ task.tempTaskType || '其他' }}</p>
              </div>
              <div>
                <span class="text-gray-500">当前进度</span>
                <p class="font-medium">{{ task.progress || 0 }}%</p>
              </div>
              <div>
                <span class="text-gray-500">驳回次数</span>
                <p class="font-medium">{{ task.rejectCount || 0 }}次</p>
              </div>
            </div>
          </div>

          <!-- 操作记录时间线 -->
          <div>
            <h4 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock :size="16" />
              操作记录
            </h4>
            <div class="space-y-4 max-h-[300px] overflow-y-auto">
              <p v-if="isLoadingRecords" class="text-gray-500 text-sm text-center py-8">正在加载操作记录...</p>
              <p v-else-if="sortedRecords.length === 0" class="text-gray-500 text-sm text-center py-8">暂无操作记录</p>
              <div
                v-for="(record, index) in sortedRecords"
                v-else
                :key="record.id"
                class="relative pl-6 pb-4"
                :class="index !== sortedRecords.length - 1 ? 'border-l-2 border-gray-200' : ''"
              >
                <!-- 时间线节点 -->
                <div
                  class="absolute left-0 top-0 w-3 h-3 rounded-full -translate-x-[7px]"
                  :class="index === 0 ? 'bg-emerald-500' : 'bg-gray-300'"
                />

                <!-- 记录内容 -->
                <div class="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span
                        class="px-2 py-0.5 rounded text-xs font-medium"
                        :class="[actionConfigOf(record).bg, actionConfigOf(record).color]"
                      >
                        {{ actionConfigOf(record).label }}
                      </span>
                      <template v-if="record.fromStatus || record.from_status">
                        <span class="text-gray-400 text-xs">→</span>
                        <span
                          class="px-2 py-0.5 rounded text-xs font-medium"
                          :class="[statusConfigOf(record).bg, statusConfigOf(record).color]"
                        >
                          {{ statusConfigOf(record).label }}
                        </span>
                      </template>
                    </div>
                    <span class="text-xs text-gray-500">{{ formatDate(record.actionTime || record.action_time) }}</span>
                  </div>

                  <!-- 操作人 -->
                  <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <User :size="12" />
                    <span>{{ record.operatorName || record.operator_name || '-' }}</span>
                  </div>

                  <!-- 进度信息 -->
                  <div v-if="record.progress !== undefined && record.progress !== null" class="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <FileText :size="12" />
                    <span>进度：{{ record.progress }}%</span>
                  </div>

                  <!-- 反馈内容 -->
                  <div v-if="parseFeedback(record.feedback)" class="mt-3 space-y-2">
                    <div v-if="parseFeedback(record.feedback).text" class="bg-blue-50 rounded p-2 text-sm">
                      <p class="text-gray-700">{{ parseFeedback(record.feedback).text }}</p>
                    </div>
                    <div v-if="parseFeedback(record.feedback).images && parseFeedback(record.feedback).images.length > 0" class="flex gap-2 flex-wrap">
                      <div
                        v-for="(img, i) in parseFeedback(record.feedback).images"
                        :key="i"
                        class="w-16 h-16 bg-gray-100 rounded flex items-center justify-center"
                      >
                        <Camera :size="24" class="text-gray-400" />
                      </div>
                    </div>
                    <div v-if="parseFeedback(record.feedback).gpsLocation" class="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin :size="12" />
                      <span>
                        GPS: {{ parseFeedback(record.feedback).gpsLocation.lat?.toFixed(4) || '-' }},
                        {{ parseFeedback(record.feedback).gpsLocation.lng?.toFixed(4) || '-' }}
                      </span>
                    </div>
                    <div v-if="parseFeedback(record.feedback).voiceNote" class="flex items-center gap-2 text-sm text-gray-600">
                      <Mic :size="12" />
                      <span>语音备注</span>
                    </div>
                    <div v-if="parseFeedback(record.feedback).materials && parseFeedback(record.feedback).materials.length > 0" class="text-sm text-gray-600">
                      <span class="font-medium">物料：</span>
                      <span
                        v-for="(m, i) in parseFeedback(record.feedback).materials"
                        :key="i"
                        class="mr-2"
                      >
                        {{ m.name }}×{{ m.qty }}
                      </span>
                    </div>
                  </div>

                  <!-- 备注/原因 -->
                  <p v-if="record.comment" class="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">{{ record.comment }}</p>
                  <p v-if="record.reason" class="mt-2 text-sm text-red-600 bg-red-50 rounded p-2">原因：{{ record.reason }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 验收操作区 - V1.1 双 Tab 模式切换 -->
          <div class="border-t border-gray-200 pt-4 space-y-4">
            <!-- 模式切换 Tab -->
            <div class="flex gap-2">
              <button
                @click="mode = 'confirm'"
                class="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                :class="mode === 'confirm' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                验收通过
              </button>
              <button
                @click="mode = 'reject'"
                class="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                :class="mode === 'reject' ? 'bg-red-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                驳回返工
              </button>
            </div>

            <!-- 验收通过：备注（选填） -->
            <div v-if="mode === 'confirm'">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                验收备注 <span class="text-gray-400">(选填)</span>
              </label>
              <textarea
                :value="remarks"
                @input="(e) => remarks = e.target.value"
                placeholder="请输入验收备注..."
                class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                rows="3"
              ></textarea>
            </div>

            <!-- 驳回：原因（必填） -->
            <div v-if="mode === 'reject'">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                驳回原因 <span class="text-red-500">*</span>
              </label>
              <textarea
                :value="rejectReason"
                @input="(e) => rejectReason = e.target.value"
                placeholder="请输入驳回原因..."
                class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                rows="3"
              ></textarea>
            </div>

            <!-- 警示信息 -->
            <div
              class="flex items-start gap-3 p-4 rounded-lg border"
              :class="mode === 'confirm' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'"
            >
              <AlertTriangle :size="20" class="mt-0.5 flex-shrink-0" />
              <div>
                <p class="font-medium">
                  {{ mode === 'confirm' ? '确认验收通过后，任务将标记为已完成' : '驳回后任务将返回给执行人重新处理' }}
                </p>
                <p class="text-sm mt-1 opacity-80">
                  {{ mode === 'confirm' ? '此操作不可撤销' : '请填写具体的驳回原因' }}
                </p>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex justify-end gap-3 pt-2">
              <el-button size="small" @click="handleClose">
                <X :size="14" class="mr-1" />取消
              </el-button>
              <el-button
                size="small"
                :type="mode === 'confirm' ? 'primary' : 'danger'"
                :disabled="mode === 'reject' && !rejectReason.trim()"
                @click="handleConfirm"
              >
                {{ mode === 'confirm' ? '确认验收通过' : '确认驳回' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { AlertTriangle, Camera, Clock, FileText, MapPin, Mic, User, X } from 'lucide-vue-next'

// V1.1 操作类型配置（与 VerifyTempTaskModal TEMP_TASK_ACTION_CONFIG 一致）
const TEMP_TASK_ACTION_CONFIG = {
  create: { bg: 'bg-blue-100', color: 'text-blue-700', label: '创建任务' },
  accept: { bg: 'bg-blue-100', color: 'text-blue-700', label: '接受任务' },
  progress: { bg: 'bg-blue-100', color: 'text-blue-700', label: '进度更新' },
  submit_progress: { bg: 'bg-blue-100', color: 'text-blue-700', label: '提交进度' },
  submit: { bg: 'bg-blue-100', color: 'text-blue-700', label: '提交验收' },
  complete: { bg: 'bg-green-100', color: 'text-green-700', label: '验收通过' },
  reject: { bg: 'bg-red-100', color: 'text-red-700', label: '验收驳回' },
  accept_confirm: { bg: 'bg-green-100', color: 'text-green-700', label: '审核通过' },
  withdraw: { bg: 'bg-gray-100', color: 'text-gray-700', label: '撤回任务' },
  cancel: { bg: 'bg-gray-100', color: 'text-gray-700', label: '取消任务' },
  reassign: { bg: 'bg-orange-100', color: 'text-orange-700', label: '重新派发' },
  overtime_continue: { bg: 'bg-orange-100', color: 'text-orange-700', label: '超时继续' },
  overtime_abandon: { bg: 'bg-red-100', color: 'text-red-700', label: '超时放弃' },
  status_change: { bg: 'bg-purple-100', color: 'text-purple-700', label: '状态变更' },
}

// V1.1 状态配置
const TEMP_TASK_STATUS_CONFIG = {
  draft: { bg: 'bg-gray-100', color: 'text-gray-700', label: '草稿' },
  pending: { bg: 'bg-gray-100', color: 'text-gray-700', label: '待接受' },
  accepted: { bg: 'bg-blue-100', color: 'text-blue-700', label: '已接受' },
  in_progress: { bg: 'bg-blue-100', color: 'text-blue-700', label: '进行中' },
  waiting_acceptance: { bg: 'bg-amber-100', color: 'text-amber-700', label: '待验收' },
  completed: { bg: 'bg-green-100', color: 'text-green-700', label: '已完成' },
  rejected: { bg: 'bg-red-100', color: 'text-red-700', label: '已拒绝' },
  cancelled: { bg: 'bg-gray-100', color: 'text-gray-500', label: '已取消' },
  abandoned: { bg: 'bg-red-50', color: 'text-red-400', label: '已放弃' },
  failed: { bg: 'bg-purple-100', color: 'text-purple-700', label: '任务失败' },
}

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  task: { type: Object, default: null },
})

const emit = defineEmits(['close', 'confirm', 'reject'])

const mode = ref('confirm')
const remarks = ref('')
const rejectReason = ref('')
const records = ref([])
const isLoadingRecords = ref(false)

// 计算属性：过滤有效日期记录
const sortedRecords = computed(() => {
  return records.value
    .filter((r) => {
      const actionTime = r.actionTime || r.action_time
      return actionTime && !isNaN(new Date(actionTime).getTime())
    })
    .sort((a, b) => {
      const aTime = new Date(a.actionTime || a.action_time).getTime()
      const bTime = new Date(b.actionTime || b.action_time).getTime()
      return bTime - aTime
    })
})

// 操作类型 / 状态配置
const actionConfigOf = (record) => {
  const action = record.action
  return TEMP_TASK_ACTION_CONFIG[action] || {
    bg: 'bg-gray-100',
    color: 'text-gray-700',
    label: record.actionName || record.action_name || action,
  }
}
const statusConfigOf = (record) => {
  const toStatus = record.toStatus || record.to_status
  return TEMP_TASK_STATUS_CONFIG[toStatus] || {
    bg: 'bg-gray-100',
    color: 'text-gray-700',
    label: toStatus,
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleString('zh-CN')
  } catch {
    return '-'
  }
}

// 解析反馈内容
const parseFeedback = (feedback) => {
  if (!feedback) return null
  if (typeof feedback === 'object') return feedback
  try {
    return JSON.parse(feedback)
  } catch {
    return null
  }
}

// 加载任务操作记录（与 V1.1 enhancedApiClient.get('/temp-tasks/{id}/records') 对齐）
const loadRecords = async (taskId) => {
  if (!taskId) {
    records.value = []
    return
  }
  isLoadingRecords.value = true
  try {
    const { default: apiClient } = await import('@/lib/apiClient')
    const resp = await apiClient.get(`/temp-tasks/${taskId}/records`)
    const list = Array.isArray(resp) ? resp : (resp?.data || [])
    records.value = Array.isArray(list) ? list : []
  } catch (e) {
    console.warn('[TempTaskAcceptanceModal] 加载任务记录失败:', e)
    records.value = []
  } finally {
    isLoadingRecords.value = false
  }
}

// 监听 isOpen + task.id
watch(
  () => [props.isOpen, props.task?.id],
  ([open, taskId]) => {
    if (open && taskId) {
      loadRecords(taskId)
    } else if (!open) {
      records.value = []
      remarks.value = ''
      rejectReason.value = ''
      mode.value = 'confirm'
    }
  },
  { immediate: true }
)

// 确认操作
const handleConfirm = () => {
  if (mode.value === 'confirm') {
    emit('confirm', remarks.value || undefined)
  } else {
    if (!rejectReason.value.trim()) return
    emit('reject', rejectReason.value)
  }
  remarks.value = ''
  rejectReason.value = ''
  mode.value = 'confirm'
}

// 关闭
const handleClose = () => {
  remarks.value = ''
  rejectReason.value = ''
  mode.value = 'confirm'
  emit('close')
}
</script>
