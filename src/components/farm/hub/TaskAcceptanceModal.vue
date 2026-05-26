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
        <span class="text-white text-lg font-semibold">任务验收 - {{ task?.taskCode || '' }}</span>
      </div>
    </template>
    <div v-if="!task" class="text-center py-8 text-gray-500">
      加载中...
    </div>

    <div v-else class="space-y-6">
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
            <p class="font-medium">{{ task.typeName }}</p>
          </div>
          <div>
            <span class="text-gray-500">当前进度</span>
            <p class="font-medium">{{ task.progress }}%</p>
          </div>
          <div>
            <span class="text-gray-500">返工次数</span>
            <p class="font-medium">{{ task.reworkCount }}次</p>
          </div>
        </div>
      </div>

      <!-- 操作记录时间线 -->
      <div>
        <h4 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <el-icon :size="16"><Clock /></el-icon>
          操作记录
        </h4>
        <div class="space-y-4 max-h-[400px] overflow-y-auto">
          <p v-if="sortedRecords.length === 0" class="text-gray-500 text-sm text-center py-8">
            暂无操作记录
          </p>
          <div
            v-for="(record, index) in sortedRecords"
            :key="record.id"
            :class="[
              'relative pl-6',
              index !== sortedRecords.length - 1 ? 'border-l-2 border-gray-200 pb-4' : 'pb-0'
            ]"
          >
            <!-- 时间线节点 -->
            <div
              :class="[
                'absolute left-0 top-0 w-3 h-3 rounded-full -translate-x-[7px]',
                index === 0 ? 'bg-emerald-500' : 'bg-gray-300'
              ]"
            />

            <!-- 记录内容 -->
            <div class="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span :class="['px-2 py-0.5 rounded text-xs font-medium', getActionConfig(record.action).bg, getActionConfig(record.action).color]">
                    {{ getActionConfig(record.action).label }}
                  </span>
                  <template v-if="record.fromStatus">
                    <span class="text-gray-400 text-xs">→</span>
                    <span :class="['px-2 py-0.5 rounded text-xs font-medium', getStatusConfig(record.toStatus).bg, getStatusConfig(record.toStatus).color]">
                      {{ getStatusConfig(record.toStatus).label }}
                    </span>
                  </template>
                </div>
                <span class="text-xs text-gray-500">
                  {{ formatTime(record.actionTime) }}
                </span>
              </div>

              <!-- 操作人 -->
              <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <el-icon :size="12"><User /></el-icon>
                <span>{{ record.operatorName }}</span>
              </div>

              <!-- 进度信息 -->
              <div v-if="record.progress !== undefined" class="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <el-icon :size="12"><Document /></el-icon>
                <span>
                  进度：{{ record.progress }}%
                  <span v-if="record.progressIncrement !== undefined && record.progressIncrement > 0" class="text-emerald-600 ml-1">
                    (+{{ record.progressIncrement }}%)
                  </span>
                </span>
              </div>

              <!-- 反馈内容 -->
              <div v-if="record.feedback" class="mt-3 space-y-2">
                <div v-if="record.feedback.text" class="bg-blue-50 rounded p-2 text-sm">
                  <p class="text-gray-700">{{ record.feedback.text }}</p>
                </div>
                <div v-if="record.feedback.images && record.feedback.images.length > 0" class="flex gap-2 flex-wrap">
                  <div
                    v-for="(img, i) in record.feedback.images"
                    :key="i"
                    class="w-16 h-16 bg-gray-100 rounded flex items-center justify-center"
                  >
                    <el-icon :size="24" color="#9ca3af"><PictureFilled /></el-icon>
                  </div>
                </div>
                <div v-if="record.feedback.gpsLocation" class="flex items-center gap-2 text-sm text-gray-600">
                  <el-icon :size="12" color="#3b82f6"><Location /></el-icon>
                  <span>
                    GPS: {{ record.feedback.gpsLocation.lat.toFixed(4) }},
                    {{ record.feedback.gpsLocation.lng.toFixed(4) }}
                  </span>
                </div>
                <div v-if="record.feedback.voiceNote" class="flex items-center gap-2 text-sm text-gray-600">
                  <el-icon :size="12" color="#a855f7"><Microphone /></el-icon>
                  <span>语音备注</span>
                </div>
                <div v-if="record.feedback.materials && record.feedback.materials.length > 0" class="text-sm text-gray-600">
                  <span class="font-medium">物料：</span>
                  <span v-for="(m, i) in record.feedback.materials" :key="i" class="mr-2">
                    {{ m.name }}×{{ m.qty }}
                  </span>
                </div>
              </div>

              <!-- 备注/原因 -->
              <p v-if="record.comment" class="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">
                {{ record.comment }}
              </p>
              <p v-if="record.reason" class="mt-2 text-sm text-red-600 bg-red-50 rounded p-2">
                原因：{{ record.reason }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 验收操作区 -->
      <div class="border-t border-gray-200 pt-4">
        <div v-if="!showRejectForm" class="flex gap-3 justify-end">
          <el-button
            type="danger"
            size="small"
            plain
            @click="showRejectForm = true"
          >
            <el-icon :size="16"><CircleCloseFilled /></el-icon>
            驳回
          </el-button>
          <el-button
            type="primary"
            size="small"
            @click="handleAccept"
          >
            <el-icon :size="16"><CircleCheckFilled /></el-icon>
            通过验收
          </el-button>
        </div>
        <div v-else class="bg-red-50 rounded-lg p-4">
          <h5 class="font-medium text-red-700 mb-3">驳回原因（必填）</h5>
          <el-input
            v-model="rejectReason"
            type="textarea"
            :rows="3"
            placeholder="请输入驳回原因，说明需要返工的具体问题..."
            class="mb-3"
          />
          <div class="flex gap-3 justify-end">
            <el-button size="small" @click="cancelReject">
              取消
            </el-button>
            <el-button
              type="danger"
              size="small"
              :disabled="!rejectReason.trim()"
              @click="handleReject"
            >
              确认驳回
            </el-button>
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
/**
 * 任务验收弹窗组件
 * 功能：查看任务操作记录、通过验收、驳回返工
 * 对应 V1.1 src/components/farm/hub/modals/TaskAcceptanceModal.tsx 1:1 映射
 */
import { ref, computed } from 'vue'
import {
  Clock, User, Document, PictureFilled, Location, Microphone,
  CircleCheckFilled, CircleCloseFilled
} from '@element-plus/icons-vue'

// 操作行为配置映射（与 V1.1 TASK_ACTION_CONFIG 一致）
const TASK_ACTION_CONFIG = {
  create: { label: '创建任务', bg: 'bg-blue-50', color: 'text-blue-600' },
  publish: { label: '派发任务', bg: 'bg-blue-50', color: 'text-blue-600' },
  assign: { label: '派发任务', bg: 'bg-purple-50', color: 'text-purple-600' },
  accept: { label: '接受任务', bg: 'bg-emerald-50', color: 'text-emerald-600' },
  start: { label: '开始执行', bg: 'bg-green-50', color: 'text-green-600' },
  reject: { label: '拒绝任务', bg: 'bg-red-50', color: 'text-red-600' },
  progress: { label: '进度更新', bg: 'bg-amber-50', color: 'text-amber-600' },
  submit: { label: '提交验收', bg: 'bg-indigo-50', color: 'text-indigo-600' },
  complete: { label: '验收通过', bg: 'bg-green-50', color: 'text-green-600' },
  verify: { label: '验收通过', bg: 'bg-green-50', color: 'text-green-600' },
  rework: { label: '驳回返工', bg: 'bg-orange-50', color: 'text-orange-600' },
  withdraw: { label: '撤回任务', bg: 'bg-gray-50', color: 'text-gray-600' },
  cancel: { label: '取消任务', bg: 'bg-red-50', color: 'text-red-600' },
  continue: { label: '继续执行', bg: 'bg-blue-50', color: 'text-blue-600' },
  reassign: { label: '重新派发', bg: 'bg-purple-50', color: 'text-purple-600' },
  remind: { label: '催办', bg: 'bg-red-50', color: 'text-red-600' },
  extend_deadline: { label: '延期', bg: 'bg-amber-50', color: 'text-amber-600' },
  overtime_continue: { label: '超时继续', bg: 'bg-amber-50', color: 'text-amber-600' },
  overtime_abandon: { label: '超时放弃', bg: 'bg-red-50', color: 'text-red-600' },
}

// 状态配置映射（与 V1.1 TASK_STATUS_CONFIG 一致）
const TASK_STATUS_CONFIG = {
  draft: { label: '草稿', bg: 'bg-gray-100', color: 'text-gray-500' },
  pending: { label: '待接受', bg: 'bg-gray-100', color: 'text-gray-600' },
  accepted: { label: '已接受', bg: 'bg-blue-50', color: 'text-blue-600' },
  in_progress: { label: '处理中', bg: 'bg-blue-100', color: 'text-blue-700' },
  waiting_acceptance: { label: '待验收', bg: 'bg-orange-50', color: 'text-orange-600' },
  completed: { label: '已完成', bg: 'bg-green-50', color: 'text-green-600' },
  rejected: { label: '返工中', bg: 'bg-red-50', color: 'text-red-600' },
  failed: { label: '已失败', bg: 'bg-purple-50', color: 'text-purple-600' },
  cancelled: { label: '已取消', bg: 'bg-gray-100', color: 'text-gray-500' },
  abandoned: { label: '已放弃', bg: 'bg-red-50', color: 'text-red-400' },
}

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  task: { type: Object, default: null },
  taskRecords: { type: Array, default: () => [] },
  onAccept: { type: Function, default: () => {} },
  onReject: { type: Function, default: () => {} },
  onClose: { type: Function, default: () => {} },
})

const rejectReason = ref('')
const showRejectForm = ref(false)

/** 按时间倒序排列记录 */
const sortedRecords = computed(() => {
  return [...props.taskRecords].sort(
    (a, b) => new Date(b.actionTime).getTime() - new Date(a.actionTime).getTime()
  )
})

/** 格式化时间 */
function formatTime(time) {
  try {
    return new Date(time).toLocaleString('zh-CN')
  } catch {
    return time
  }
}

/** 获取操作配置 */
function getActionConfig(action) {
  return TASK_ACTION_CONFIG[action] || { label: action, bg: 'bg-gray-100', color: 'text-gray-600' }
}

/** 获取状态配置 */
function getStatusConfig(status) {
  return TASK_STATUS_CONFIG[status] || { label: status, bg: 'bg-gray-100', color: 'text-gray-600' }
}

/** 通过验收 */
function handleAccept() {
  props.onAccept()
}

/** 驳回 */
function handleReject() {
  if (rejectReason.value.trim()) {
    props.onReject(rejectReason.value)
    rejectReason.value = ''
    showRejectForm.value = false
  }
}

/** 取消驳回 */
function cancelReject() {
  showRejectForm.value = false
  rejectReason.value = ''
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
