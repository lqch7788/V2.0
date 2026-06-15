<!--
  巡查问题验收弹窗
  对应 V1.1 InspectionAcceptanceModal.tsx 1:1 迁移（V1.1 line 1-459）
  功能：查看问题处理流转记录、通过验收、驳回返工
  样式与农事任务验收弹窗 TaskAcceptanceModal 保持一致
-->
<template>
  <div v-if="isOpen && problem" class="fixed inset-0 z-50">
    <div class="fixed inset-0 bg-black/50" @click="handleClose"></div>
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <!-- 顶部标题栏 - 绿色底色（与V1.1 line 159-166 一致） -->
        <div class="flex items-center justify-between px-6 py-4 bg-emerald-500 flex-shrink-0">
          <h2 class="text-lg font-semibold text-white">
            问题验收 - {{ problem.problemCode || problem.problem_code }}
          </h2>
          <el-button link size="default" @click="handleClose" class="text-white hover:bg-emerald-600">
            ×
          </el-button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- 问题基本信息（V1.1 line 169-190） -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="font-semibold text-gray-900 mb-3">
              {{ problem.issueText || problem.remarks || '问题处理' }}
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span class="text-gray-500">问题类型</span>
                <p class="font-medium">{{ getProblemTypeLabel() }}</p>
              </div>
              <div>
                <span class="text-gray-500">处理人</span>
                <p class="font-medium">{{ problem.handler || '-' }}</p>
              </div>
              <div>
                <span class="text-gray-500">问题状态</span>
                <p class="font-medium">
                  <span
                    :class="getProblemStatusBadgeClass(problem.status)"
                    class="px-2 py-0.5 text-xs rounded"
                  >
                    {{ getProblemStatusLabel(problem.status) }}
                  </span>
                </p>
              </div>
              <div>
                <span class="text-gray-500">返工次数</span>
                <p class="font-medium">{{ (problem.reworkCount || 0) }}次</p>
              </div>
            </div>
          </div>

          <!-- 操作记录时间线（V1.1 line 192-363） -->
          <div>
            <h4 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <el-icon><Clock /></el-icon>
              操作记录
            </h4>
            <div class="space-y-4 max-h-[300px] overflow-y-auto">
              <p v-if="isLoadingRecords" class="text-gray-500 text-sm text-center py-8">正在加载操作记录...</p>
              <p v-else-if="sortedRecords.length === 0" class="text-gray-500 text-sm text-center py-8">暂无操作记录</p>
              <template v-else>
                <div
                  v-for="(record, index) in sortedRecords"
                  :key="record.id"
                  class="relative pl-6 pb-4"
                  :class="index !== sortedRecords.length - 1 ? 'border-l-2 border-gray-200' : ''"
                >
                  <!-- 时间线节点 -->
                  <div
                    class="absolute left-0 top-0 w-3 h-3 rounded-full -translate-x-[7px]"
                    :class="index === 0 ? 'bg-emerald-500' : 'bg-gray-300'"
                  ></div>

                  <!-- 记录内容 -->
                  <div class="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                    <div class="flex items-start justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <span
                          :class="`px-2 py-0.5 rounded text-xs font-medium ${getActionBg(record.action)} ${getActionColor(record.action)}`"
                        >
                          {{ getActionLabel(record.action) }}
                        </span>
                        <template v-if="record.fromStatus">
                          <span class="text-gray-400 text-xs">→</span>
                          <span
                            :class="`px-2 py-0.5 rounded text-xs font-medium ${getStatusBg(record.toStatus)} ${getStatusColor(record.toStatus)}`"
                          >
                            {{ getStatusLabel(record.toStatus) }}
                          </span>
                        </template>
                      </div>
                      <span class="text-xs text-gray-500">{{ formatDate(record.actionTime) }}</span>
                    </div>

                    <!-- 操作人 -->
                    <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <el-icon><User /></el-icon>
                      <span>{{ record.operatorName }}</span>
                    </div>

                    <!-- 进度信息 -->
                    <div v-if="record.progress !== undefined && record.progress !== null" class="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <el-icon><Document /></el-icon>
                      <span>进度：{{ record.progress }}%</span>
                    </div>

                    <!-- 反馈内容（V1.1 line 264-344） -->
                    <div v-if="parseFeedback(record.feedbackData)" class="mt-3 space-y-2">
                      <!-- GPS位置 -->
                      <div
                        v-if="parseFeedback(record.feedbackData).gpsLocation"
                        class="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded p-2"
                      >
                        <el-icon><Location /></el-icon>
                        <span>
                          GPS: {{
                            (parseFeedback(record.feedbackData).gpsLocation.lat ?? 0).toFixed(6)
                          }}, {{
                            (parseFeedback(record.feedbackData).gpsLocation.lng ?? 0).toFixed(6)
                          }}
                        </span>
                      </div>

                      <!-- 作业前照片 -->
                      <div
                        v-if="parseFeedback(record.feedbackData).photosBefore && parseFeedback(record.feedbackData).photosBefore.length > 0"
                        class="text-sm text-blue-600 bg-blue-50 rounded p-2"
                      >
                        <span class="flex items-center gap-1 mb-1">
                          <el-icon><Camera /></el-icon>
                          <span>作业前照片：{{ parseFeedback(record.feedbackData).photosBefore.length }}张</span>
                        </span>
                        <div class="flex gap-1 flex-wrap">
                          <div
                            v-for="(img, i) in parseFeedback(record.feedbackData).photosBefore"
                            :key="i"
                            class="w-12 h-12 bg-gray-100 rounded flex items-center justify-center"
                          >
                            <el-icon><Camera /></el-icon>
                          </div>
                        </div>
                      </div>

                      <!-- 作业后照片 -->
                      <div
                        v-if="parseFeedback(record.feedbackData).photosAfter && parseFeedback(record.feedbackData).photosAfter.length > 0"
                        class="text-sm text-orange-600 bg-orange-50 rounded p-2"
                      >
                        <span class="flex items-center gap-1 mb-1">
                          <el-icon><Camera /></el-icon>
                          <span>作业后照片：{{ parseFeedback(record.feedbackData).photosAfter.length }}张</span>
                        </span>
                        <div class="flex gap-1 flex-wrap">
                          <div
                            v-for="(img, i) in parseFeedback(record.feedbackData).photosAfter"
                            :key="i"
                            class="w-12 h-12 bg-gray-100 rounded flex items-center justify-center"
                          >
                            <el-icon><Camera /></el-icon>
                          </div>
                        </div>
                      </div>

                      <!-- 物资编码 -->
                      <div
                        v-if="parseFeedback(record.feedbackData).materialCode"
                        class="text-sm text-purple-600 bg-purple-50 rounded p-2"
                      >
                        <span class="font-medium">物资编码：</span>
                        <span class="font-mono">{{ parseFeedback(record.feedbackData).materialCode }}</span>
                      </div>

                      <!-- 语音备注 -->
                      <div
                        v-if="parseFeedback(record.feedbackData).voiceNote"
                        class="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded p-2"
                      >
                        <el-icon><Microphone /></el-icon>
                        <span>语音备注</span>
                      </div>

                      <!-- 工作量 -->
                      <div
                        v-if="parseFeedback(record.feedbackData).workloadDays !== undefined
                          || parseFeedback(record.feedbackData).workloadHours !== undefined
                          || parseFeedback(record.feedbackData).workers !== undefined"
                        class="text-sm text-cyan-600 bg-cyan-50 rounded p-2"
                      >
                        <span class="font-medium">工作量：</span>
                        <span v-if="parseFeedback(record.feedbackData).workloadDays !== undefined">
                          {{ parseFeedback(record.feedbackData).workloadDays }}天
                        </span>
                        <span v-if="parseFeedback(record.feedbackData).workloadDays !== undefined && parseFeedback(record.feedbackData).workloadHours !== undefined"> + </span>
                        <span v-if="parseFeedback(record.feedbackData).workloadHours !== undefined">
                          {{ parseFeedback(record.feedbackData).workloadHours }}小时
                        </span>
                        <span v-if="parseFeedback(record.feedbackData).workers !== undefined">，{{ parseFeedback(record.feedbackData).workers }}人</span>
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
              </template>
            </div>
          </div>

          <!-- 验收操作区 - Tab 切换布局（V1.1 line 365-453） -->
          <div class="border-t border-gray-200 pt-4 space-y-4">
            <!-- 模式切换 Tab -->
            <div class="flex gap-2">
              <button
                @click="setMode('confirm')"
                :class="[
                  'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                  mode === 'confirm' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                ]"
              >
                验收通过
              </button>
              <button
                @click="setMode('reject')"
                :class="[
                  'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                  mode === 'reject' ? 'bg-red-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                ]"
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

            <!-- 警示信息 -->
            <div
              class="flex items-start gap-3 p-4 rounded-lg border"
              :class="mode === 'confirm' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'"
            >
              <el-icon class="mt-0.5 flex-shrink-0"><Warning /></el-icon>
              <div>
                <p class="font-medium">
                  {{ mode === 'confirm' ? '确认验收通过后，问题将标记为已处理' : '驳回后问题将返回给处理人重新处理' }}
                </p>
                <p class="text-sm mt-1 opacity-80">
                  {{ mode === 'confirm' ? '此操作不可撤销' : '请填写具体的驳回原因' }}
                </p>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex justify-end gap-3 pt-2">
              <el-button @click="handleClose">取消</el-button>
              <el-button
                @click="handleConfirm"
                :disabled="mode === 'reject' && !rejectReason.trim()"
                :class="mode === 'confirm' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'"
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
/**
 * 巡查问题验收弹窗 - 从V1.1 InspectionAcceptanceModal.tsx 1:1迁移
 * 字段、状态机、回调必须与V1.1 line 1-459 完全一致
 */
import { ref, computed } from 'vue'
import {
  Camera, Clock, Document, Location, Microphone, User, Warning,
} from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  problem: { type: Object, default: null },
  records: { type: Array, default: () => [] },
  isLoadingRecords: { type: Boolean, default: false },
  onAccept: { type: Function, default: () => {} },
  onReject: { type: Function, default: () => {} },
  onClose: { type: Function, default: () => {} },
})

// 模式：confirm=验收通过 / reject=驳回返工（V1.1 line 59）
const mode = ref('confirm')
const remarks = ref('')
const rejectReason = ref('')

// 动作配置（V1.1 line 26-38）：11种操作类型
const INSPECTION_ACTION_CONFIG = {
  report: { bg: 'bg-purple-100', color: 'text-purple-700', label: '上报问题' },
  dispatch: { bg: 'bg-blue-100', color: 'text-blue-700', label: '分派任务' },
  accept: { bg: 'bg-blue-100', color: 'text-blue-700', label: '接单' },
  reject: { bg: 'bg-red-100', color: 'text-red-700', label: '拒绝任务' },
  start: { bg: 'bg-blue-100', color: 'text-blue-700', label: '开始处理' },
  submit: { bg: 'bg-amber-100', color: 'text-amber-700', label: '提交反馈' },
  approve: { bg: 'bg-green-100', color: 'text-green-700', label: '验收通过' },
  reject_acceptance: { bg: 'bg-red-100', color: 'text-red-700', label: '验收返工' },
  complete: { bg: 'bg-emerald-100', color: 'text-emerald-700', label: '完成' },
  comment: { bg: 'bg-gray-100', color: 'text-gray-700', label: '添加备注' },
  progress: { bg: 'bg-blue-100', color: 'text-blue-700', label: '进度更新' },
}

// 状态配置（V1.1 line 41-48）：6种状态
const INSPECTION_STATUS_CONFIG = {
  待处理: { bg: 'bg-yellow-100', color: 'text-yellow-700', label: '待处理' },
  处理中: { bg: 'bg-blue-100', color: 'text-blue-700', label: '处理中' },
  待验收: { bg: 'bg-amber-100', color: 'text-amber-700', label: '待验收' },
  已处理: { bg: 'bg-green-100', color: 'text-green-700', label: '已处理' },
  已拒绝: { bg: 'bg-red-100', color: 'text-red-700', label: '已拒绝' },
  已完成: { bg: 'bg-emerald-100', color: 'text-emerald-700', label: '已完成' },
}

// 过滤无效日期记录（V1.1 line 65-66）
const validRecords = computed(() => {
  return (props.records || []).filter((r) => r.actionTime && !Number.isNaN(new Date(r.actionTime).getTime()))
})

// 按时间倒序（V1.1 line 68-71）
const sortedRecords = computed(() => {
  return [...validRecords.value].sort(
    (a, b) => new Date(b.actionTime).getTime() - new Date(a.actionTime).getTime()
  )
})

// 安全格式化日期（V1.1 line 74-83）
function formatDate(dateStr) {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return '-'
    return d.toLocaleString('zh-CN')
  } catch {
    return '-'
  }
}

// 解析反馈数据（V1.1 line 86-104）
function parseFeedback(feedback) {
  if (!feedback) return null
  let parsed = feedback
  if (typeof feedback === 'string') {
    try {
      parsed = JSON.parse(feedback)
    } catch {
      return null
    }
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  // 规范化 workloadConfirm 嵌套结构
  if (parsed.workloadConfirm && typeof parsed.workloadConfirm === 'object') {
    parsed.workloadDays = parsed.workloadConfirm.days ?? parsed.workloadDays
    parsed.workloadHours = parsed.workloadConfirm.hours ?? parsed.workloadHours
    parsed.workers = parsed.workloadConfirm.workers ?? parsed.workers
  }
  return parsed
}

// 确认/驳回处理（V1.1 line 106-116）
function handleConfirm() {
  if (mode.value === 'confirm') {
    props.onAccept(remarks.value || undefined)
  } else {
    if (!rejectReason.value.trim()) return
    props.onReject(rejectReason.value)
  }
  remarks.value = ''
  rejectReason.value = ''
  mode.value = 'confirm'
}

// 关闭处理（V1.1 line 118-123）
function handleClose() {
  remarks.value = ''
  rejectReason.value = ''
  mode.value = 'confirm'
  props.onClose()
}

function setMode(m) {
  mode.value = m
}

// 获取问题类型标签（V1.1 line 126-138）
function getProblemTypeLabel() {
  const sourceModule = props.problem?.sourceModule
  switch (sourceModule) {
    case 'inspection': return '巡查问题'
    case 'tempTask': return '临时任务问题'
    case 'farmTask': return '农事任务问题'
    default: return '问题'
  }
}

// 获取问题状态徽章样式（V1.1 line 141-151）
function getProblemStatusBadgeClass(status) {
  const config = INSPECTION_STATUS_CONFIG[status]
  if (!config) return 'bg-gray-100 text-gray-700'
  return `${config.bg} ${config.color}`
}

// 动作辅助方法
function getActionBg(action) {
  return INSPECTION_ACTION_CONFIG[action]?.bg || 'bg-gray-100'
}
function getActionColor(action) {
  return INSPECTION_ACTION_CONFIG[action]?.color || 'text-gray-700'
}
function getActionLabel(action) {
  return INSPECTION_ACTION_CONFIG[action]?.label || action
}
function getStatusBg(status) {
  return INSPECTION_STATUS_CONFIG[status]?.bg || 'bg-gray-100'
}
function getStatusColor(status) {
  return INSPECTION_STATUS_CONFIG[status]?.color || 'text-gray-700'
}
function getStatusLabel(status) {
  return INSPECTION_STATUS_CONFIG[status]?.label || status
}
function getProblemStatusLabel(status) {
  return INSPECTION_STATUS_CONFIG[status]?.label || status
}
</script>
