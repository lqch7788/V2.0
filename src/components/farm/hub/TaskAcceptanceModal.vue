<template>
  <!--
    任务验收弹窗
    对应 V1.1 src/components/farm/hub/modals/TaskAcceptanceModal.tsx
    1:1 映射：头部纯色 emerald-500 + Tab切换模式 + 完整反馈字段
  -->
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50">
      <!-- 遮罩 -->
      <div class="fixed inset-0 bg-black/50" @click="handleClose" />
      <!-- 对话框容器 -->
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <!-- 顶部标题栏 - 纯色 emerald-500（V1.1 line 98 一致） -->
          <div class="flex items-center justify-between px-6 py-4 bg-emerald-500 flex-shrink-0">
            <h2 class="text-lg font-semibold text-white">任务验收 - {{ task?.taskCode || '' }}</h2>
            <button
              class="text-white hover:bg-emerald-600 rounded p-1 transition-colors"
              @click="handleClose"
            >
              <span class="text-xl leading-none px-1">×</span>
            </button>
          </div>

          <!-- 加载中状态 -->
          <div v-if="!task" class="flex-1 flex items-center justify-center py-12 text-gray-500">
            加载中...
          </div>

          <div v-else class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- 任务基本信息（V1.1 line 107-127） -->
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

            <!-- 操作记录时间线（V1.1 line 129-291） -->
            <div>
              <h4 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <el-icon :size="16"><Clock /></el-icon>
                操作记录
              </h4>
              <div class="space-y-4 max-h-[300px] overflow-y-auto">
                <p v-if="sortedRecords.length === 0" class="text-gray-500 text-sm text-center py-8">
                  暂无操作记录
                </p>
                <div
                  v-for="(record, index) in sortedRecords"
                  v-else
                  :key="record.id"
                  :class="[
                    'relative pl-6 pb-4',
                    index !== sortedRecords.length - 1 ? 'border-l-2 border-gray-200' : ''
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

                    <!-- 反馈内容（V1.1 line 212-272 完整字段） -->
                    <div v-if="record.feedback" class="mt-3 space-y-2">
                      <!-- 文字反馈 -->
                      <div v-if="record.feedback.text" class="bg-blue-50 rounded p-2 text-sm">
                        <p class="text-gray-700">{{ record.feedback.text }}</p>
                      </div>
                      <!-- 图片 -->
                      <div v-if="record.feedback.images && record.feedback.images.length > 0" class="flex gap-2 flex-wrap">
                        <div
                          v-for="(img, i) in record.feedback.images"
                          :key="i"
                          class="w-16 h-16 bg-gray-100 rounded flex items-center justify-center"
                        >
                          <el-icon :size="24" color="#9ca3af"><PictureFilled /></el-icon>
                        </div>
                      </div>
                      <!-- GPS -->
                      <div v-if="record.feedback.gpsLocation" class="flex items-center gap-2 text-sm text-gray-600">
                        <el-icon :size="12" color="#3b82f6"><Location /></el-icon>
                        <span>
                          GPS: {{ (record.feedback.gpsLocation.lat || 0).toFixed(4) }},
                          {{ (record.feedback.gpsLocation.lng || 0).toFixed(4) }}
                        </span>
                      </div>
                      <!-- 语音 -->
                      <div v-if="record.feedback.voiceNote" class="flex items-center gap-2 text-sm text-gray-600">
                        <el-icon :size="12" color="#a855f7"><Microphone /></el-icon>
                        <span>语音备注</span>
                      </div>
                      <!-- 物料列表 -->
                      <div v-if="record.feedback.materials && record.feedback.materials.length > 0" class="text-sm text-gray-600">
                        <span class="font-medium">物料：</span>
                        <span v-for="(m, i) in record.feedback.materials" :key="i" class="mr-2">
                          {{ m.name }}×{{ m.qty }}
                        </span>
                      </div>
                      <!-- 物资编码 -->
                      <div v-if="record.feedback.materialCode" class="text-sm text-purple-600">
                        <span class="font-medium">物资编码：</span>
                        <span class="font-mono">{{ record.feedback.materialCode }}</span>
                      </div>
                      <!-- 工作量（V1.1 line 262-270） -->
                      <div v-if="record.feedback.workloadDays !== undefined || record.feedback.workloadHours !== undefined || record.feedback.workers !== undefined" class="text-sm text-cyan-600">
                        <span class="font-medium">工作量：</span>
                        <template v-if="record.feedback.workloadDays !== undefined">
                          <span>{{ record.feedback.workloadDays }}天</span>
                        </template>
                        <template v-if="record.feedback.workloadDays !== undefined && record.feedback.workloadHours !== undefined">
                          <span> + </span>
                        </template>
                        <template v-if="record.feedback.workloadHours !== undefined">
                          <span>{{ record.feedback.workloadHours }}小时</span>
                        </template>
                        <template v-if="record.feedback.workers !== undefined">
                          <span>，{{ record.feedback.workers }}人</span>
                        </template>
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

            <!-- 验收操作区 - Tab 切换布局（V1.1 line 293-381） -->
            <div class="border-t border-gray-200 pt-4 space-y-4">
              <!-- 模式切换 Tab -->
              <div class="flex gap-2">
                <button
                  type="button"
                  :class="[
                    'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                    mode === 'confirm'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  ]"
                  @click="setMode('confirm')"
                >
                  验收通过
                </button>
                <button
                  type="button"
                  :class="[
                    'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                    mode === 'reject'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  ]"
                  @click="setMode('reject')"
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
                  v-model="remarks"
                  placeholder="请输入验收备注..."
                  class="px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner w-full"
                  rows="3"
                />
              </div>

              <!-- 驳回：原因（必填） -->
              <div v-if="mode === 'reject'">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  驳回原因 <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="rejectReason"
                  placeholder="请输入驳回原因..."
                  class="px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner w-full"
                  rows="3"
                />
              </div>

              <!-- 警示信息（V1.1 line 352-366） -->
              <div :class="[
                'flex items-start gap-3 p-4 rounded-lg border',
                mode === 'confirm'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              ]">
                <el-icon :size="20" class="mt-0.5 flex-shrink-0">
                  <WarningFilled />
                </el-icon>
                <div>
                  <p class="font-medium">
                    {{ mode === 'confirm' ? '确认验收通过后，任务将标记为已完成' : '驳回后任务将返回给执行人重新处理' }}
                  </p>
                  <p class="text-sm mt-1 opacity-80">
                    {{ mode === 'confirm' ? '此操作不可撤销' : '请填写具体的驳回原因' }}
                  </p>
                </div>
              </div>

              <!-- 操作按钮（V1.1 line 369-380） -->
              <div class="flex justify-end gap-3 pt-2">
                <el-button @click="handleClose">
                  <el-icon :size="16"><Close /></el-icon>
                  取消
                </el-button>
                <el-button
                  :type="mode === 'confirm' ? 'success' : 'danger'"
                  :disabled="mode === 'reject' && !rejectReason.trim()"
                  :class="mode === 'confirm' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'"
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
  </Teleport>
</template>

<script setup>
/**
 * 任务验收弹窗组件
 * 功能：查看任务操作记录、通过验收、驳回返工
 * 对应 V1.1 src/components/farm/hub/modals/TaskAcceptanceModal.tsx 1:1 映射
 *
 * V1.1 关键差异点（已修复）：
 * 1. 头部：纯色 bg-emerald-500（非渐变）
 * 2. Tab 切换模式：confirm/reject 互斥切换
 * 3. 关闭按钮：左上 × 字符按钮
 * 4. 完整反馈字段：materialCode、工作量、parseFeedback
 * 5. 警示信息：emerald-50 / red-50 提示框
 */
import { ref, computed } from 'vue'
import {
  Clock, User, Document, PictureFilled, Location, Microphone,
  Close, WarningFilled
} from '@element-plus/icons-vue'
import { TASK_ACTION_CONFIG, TASK_STATUS_CONFIG } from '@/config/taskConfig'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  task: { type: Object, default: null },
  taskRecords: { type: Array, default: () => [] },
  isLoadingRecords: { type: Boolean, default: false },
  onAccept: { type: Function, default: () => {} },
  onReject: { type: Function, default: () => {} },
  onClose: { type: Function, default: () => {} },
})

const mode = ref('confirm') // 'confirm' | 'reject'
const remarks = ref('')
const rejectReason = ref('')

/** 防御性处理：过滤无效日期记录（V1.1 line 41） */
const validRecords = computed(() => {
  return (props.taskRecords || []).filter(
    r => r.actionTime && !isNaN(new Date(r.actionTime).getTime())
  )
})

/** 按时间倒序排列记录 */
const sortedRecords = computed(() => {
  return [...validRecords.value].sort(
    (a, b) => new Date(b.actionTime).getTime() - new Date(a.actionTime).getTime()
  )
})

/** 安全格式化日期（V1.1 line 49-58） */
function formatTime(dateStr) {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleString('zh-CN')
  } catch {
    return '-'
  }
}

/** 解析反馈内容，兼容字符串和已解析的对象（V1.1 line 61-71） */
function parseFeedback(feedback) {
  if (!feedback) return null
  if (typeof feedback === 'object') return feedback
  if (typeof feedback === 'string') {
    try {
      return JSON.parse(feedback)
    } catch {
      return null
    }
  }
  return null
}

/** 获取操作配置 */
function getActionConfig(action) {
  return TASK_ACTION_CONFIG[action] || { label: action, bg: 'bg-gray-100', color: 'text-gray-600' }
}

/** 获取状态配置 */
function getStatusConfig(status) {
  return TASK_STATUS_CONFIG[status] || { label: status, bg: 'bg-gray-100', color: 'text-gray-600' }
}

/** 切换模式 */
function setMode(newMode) {
  mode.value = newMode
}

/** 确认操作（V1.1 line 73-83） */
function handleConfirm() {
  if (mode.value === 'confirm') {
    props.onAccept(remarks.value || undefined)
  } else {
    if (!rejectReason.value.trim()) return
    props.onReject(rejectReason.value)
  }
  resetForm()
}

/** 关闭弹窗（V1.1 line 85-90） */
function handleClose() {
  resetForm()
  props.onClose()
}

/** 重置表单 */
function resetForm() {
  remarks.value = ''
  rejectReason.value = ''
  mode.value = 'confirm'
}
</script>

<style scoped>
/* 头部样式由模板内联控制：纯色 bg-emerald-500（与V1.1 line 98 一致） */
</style>
