<template>
  <!-- 任务验收弹窗 - 从V1.1 TaskAcceptanceModal.tsx 1:1迁移 -->
  <el-dialog :model-value="isOpen" @update:model-value="$emit('close')"
    :title="`任务验收 - ${task.taskCode || ''}`" width="800px" top="5vh"
    :show-footer="false">
    <div v-if="task" class="space-y-6">
      <!-- 任务基本信息 -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="font-semibold text-gray-900 mb-3">{{ task.title || task.taskName }}</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span class="text-gray-500 block text-xs">执行人</span>
            <p class="font-medium">{{ task.assigneeName || task.assignee }}</p>
          </div>
          <div>
            <span class="text-gray-500 block text-xs">任务类型</span>
            <p class="font-medium">{{ task.typeName || task.typeLabel }}</p>
          </div>
          <div>
            <span class="text-gray-500 block text-xs">当前进度</span>
            <p class="font-medium">{{ task.progress }}%</p>
          </div>
          <div>
            <span class="text-gray-500 block text-xs">返工次数</span>
            <p class="font-medium">{{ task.reworkCount || 0 }}次</p>
          </div>
        </div>
      </div>

      <!-- 操作记录时间线 -->
      <div>
        <h4 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <el-icon :size="16"><Clock /></el-icon>操作记录
        </h4>
        <div class="space-y-4 max-h-[400px] overflow-y-auto">
          <p v-if="sortedRecords.length === 0" class="text-gray-500 text-sm text-center py-8">暂无操作记录</p>
          <div v-for="(record, index) in sortedRecords" :key="record.id"
            class="relative pl-6 pb-4"
            :class="{ 'border-l-2 border-gray-200': index !== sortedRecords.length - 1 }">
            <!-- 时间线节点 -->
            <div class="absolute left-0 top-0 w-3 h-3 rounded-full -translate-x-[7px]"
              :class="index === 0 ? 'bg-emerald-500' : 'bg-gray-300'" />

            <!-- 记录内容 -->
            <div class="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded text-xs font-medium"
                    :class="[actionConfig(record.action).bg, actionConfig(record.action).color]">
                    {{ actionConfig(record.action).label }}
                  </span>
                  <template v-if="record.fromStatus">
                    <span class="text-gray-400 text-xs">→</span>
                    <span class="px-2 py-0.5 rounded text-xs font-medium"
                      :class="[statusConfig(record.toStatus).bg, statusConfig(record.toStatus).color]">
                      {{ statusConfig(record.toStatus).label }}
                    </span>
                  </template>
                </div>
                <span class="text-xs text-gray-500">{{ formatTime(record.actionTime) }}</span>
              </div>

              <!-- 操作人 -->
              <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <el-icon :size="12"><User /></el-icon>
                <span>{{ record.operatorName }}</span>
              </div>

              <!-- 进度信息 -->
              <div v-if="record.progress !== undefined" class="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <el-icon :size="12"><Files /></el-icon>
                <span>
                  进度：{{ record.progress }}%
                  <span v-if="record.progressIncrement > 0" class="text-emerald-600 ml-1">(+{{ record.progressIncrement }}%)</span>
                </span>
              </div>

              <!-- 反馈内容 -->
              <div v-if="record.feedback" class="mt-3 space-y-2">
                <div v-if="record.feedback.text" class="bg-blue-50 rounded p-2 text-sm">
                  <p class="text-gray-700">{{ record.feedback.text }}</p>
                </div>
                <div v-if="record.feedback.images?.length" class="flex gap-2 flex-wrap">
                  <div v-for="(img, i) in record.feedback.images" :key="i"
                    class="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                    <el-icon :size="24" class="text-gray-400"><Camera /></el-icon>
                  </div>
                </div>
                <div v-if="record.feedback.gpsLocation" class="flex items-center gap-2 text-sm text-gray-600">
                  <el-icon :size="12"><MapLocation /></el-icon>
                  <span>GPS: {{ record.feedback.gpsLocation.lat?.toFixed(4) }}, {{ record.feedback.gpsLocation.lng?.toFixed(4) }}</span>
                </div>
                <div v-if="record.feedback.voiceNote" class="flex items-center gap-2 text-sm text-gray-600">
                  <el-icon :size="12"><Microphone /></el-icon>
                  <span>语音备注</span>
                </div>
                <div v-if="record.feedback.materials?.length" class="text-sm text-gray-600">
                  <span class="font-medium">物料：</span>
                  <span v-for="(m, i) in record.feedback.materials" :key="i" class="mr-2">{{ m.name }}×{{ m.qty }}</span>
                </div>
              </div>

              <!-- 备注/原因 -->
              <p v-if="record.comment" class="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">{{ record.comment }}</p>
              <p v-if="record.reason" class="mt-2 text-sm text-red-600 bg-red-50 rounded p-2">原因：{{ record.reason }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 验收操作区 -->
      <div class="border-t border-gray-200 pt-4">
        <div v-if="!showRejectForm" class="flex gap-3 justify-end">
          <el-button type="danger" plain @click="showRejectForm = true">
            <el-icon><Close /></el-icon>驳回
          </el-button>
          <el-button type="primary" @click="handleAccept">
            <el-icon><CircleCheck /></el-icon>通过验收
          </el-button>
        </div>
        <div v-else class="bg-red-50 rounded-lg p-4">
          <h5 class="font-medium text-red-700 mb-3">驳回原因（必填）</h5>
          <el-input v-model="rejectReason" type="textarea" :rows="3"
            placeholder="请输入驳回原因，说明需要返工的具体问题..." />
          <div class="flex gap-3 justify-end mt-3">
            <el-button @click="cancelReject">取消</el-button>
            <el-button type="danger" :disabled="!rejectReason.trim()" @click="handleReject">确认驳回</el-button>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Clock, User, Files, Camera, MapLocation, Microphone, CircleCheck, Close } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  task: { type: Object, default: null },
  taskRecords: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'accept', 'reject'])

const showRejectForm = ref(false)
const rejectReason = ref('')
const acceptComments = ref('')

const sortedRecords = computed(() =>
  [...props.taskRecords].sort((a, b) => new Date(b.actionTime).getTime() - new Date(a.actionTime).getTime())
)

const actionConfigMap = {
  create: { label: '创建', bg: 'bg-blue-100', color: 'text-blue-700' },
  assign: { label: '派发', bg: 'bg-purple-100', color: 'text-purple-700' },
  accept: { label: '接受', bg: 'bg-green-100', color: 'text-green-700' },
  execute: { label: '执行', bg: 'bg-indigo-100', color: 'text-indigo-700' },
  submit: { label: '提交验收', bg: 'bg-amber-100', color: 'text-amber-700' },
  verify: { label: '验收通过', bg: 'bg-emerald-100', color: 'text-emerald-700' },
  reject: { label: '驳回', bg: 'bg-red-100', color: 'text-red-700' },
  withdraw: { label: '撤回', bg: 'bg-gray-100', color: 'text-gray-700' },
  cancel: { label: '取消', bg: 'bg-red-100', color: 'text-red-700' },
  reassign: { label: '重分派', bg: 'bg-orange-100', color: 'text-orange-700' },
}

const statusConfigMap = {
  draft: { label: '草稿', bg: 'bg-gray-100', color: 'text-gray-600' },
  pending: { label: '待接受', bg: 'bg-blue-100', color: 'text-blue-700' },
  accepted: { label: '已接受', bg: 'bg-indigo-100', color: 'text-indigo-700' },
  in_progress: { label: '处理中', bg: 'bg-amber-100', color: 'text-amber-700' },
  waiting_acceptance: { label: '待验收', bg: 'bg-purple-100', color: 'text-purple-700' },
  completed: { label: '已完成', bg: 'bg-emerald-100', color: 'text-emerald-700' },
  rejected: { label: '已驳回', bg: 'bg-red-100', color: 'text-red-700' },
  cancelled: { label: '已取消', bg: 'bg-gray-100', color: 'text-gray-600' },
}

const actionConfig = (action) => actionConfigMap[action] || { label: action, bg: 'bg-gray-100', color: 'text-gray-600' }
const statusConfig = (status) => statusConfigMap[status] || { label: status, bg: 'bg-gray-100', color: 'text-gray-600' }

const formatTime = (time) => {
  try { return new Date(time).toLocaleString('zh-CN') } catch { return time }
}

const handleAccept = () => {
  emit('accept', acceptComments.value || undefined)
  acceptComments.value = ''
}

const handleReject = () => {
  if (rejectReason.value.trim()) {
    emit('reject', rejectReason.value)
    rejectReason.value = ''
    showRejectForm.value = false
  }
}

const cancelReject = () => {
  showRejectForm.value = false
  rejectReason.value = ''
}
</script>
