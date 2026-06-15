<template>
  <el-dialog
    :model-value="isOpen"
    title="任务处理"
    width="800px"
    :show-close="true"
    top="5vh"
    @close="onClose"
  >
    <div v-if="task" class="space-y-6">
      <!-- 基本信息 -->
      <div>
        <h4 class="text-sm font-semibold text-gray-900 mb-3">基本信息</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label class="text-xs text-gray-500">任务区域</label>
            <p class="font-semibold text-gray-900">{{ task.field || '-' }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-500">作物</label>
            <p class="font-semibold text-gray-900">{{ task.crop || '-' }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-500">负责人</label>
            <p class="font-semibold text-gray-900">陆启闯</p>
          </div>
          <div>
            <label class="text-xs text-gray-500">优先级</label>
            <p :class="['font-semibold', PRIORITY_MAP[task.priority]?.color || '']">
              {{ PRIORITY_MAP[task.priority]?.label || task.priority }}
            </p>
          </div>
        </div>
      </div>

      <!-- 时间信息 -->
      <div>
        <h4 class="text-sm font-semibold text-gray-900 mb-3">时间信息</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label class="text-xs text-gray-500">计划开始</label>
            <p class="font-semibold text-gray-900">{{ task.planStart || '-' }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-500">计划结束</label>
            <p class="font-semibold text-gray-900">{{ task.planEnd || '-' }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-500">状态</label>
            <p>
              <span
                :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  STATUS_MAP[task.status]?.bg || '',
                  STATUS_MAP[task.status]?.color || ''
                ]"
              >
                {{ STATUS_MAP[task.status]?.label || task.status }}
              </span>
            </p>
          </div>
          <div>
            <label class="text-xs text-gray-500">任务类型</label>
            <p class="font-semibold text-gray-900">{{ getTypeLabel(task.types?.[0] || '') }}</p>
          </div>
        </div>
      </div>

      <!-- 流转记录 -->
      <div v-if="task.sourceProblemId && problemFlowRecords.length > 0">
        <h4 class="text-sm font-semibold text-gray-900 mb-3">流转记录</h4>
        <TaskFlowTimeline :records="problemFlowRecords" />
      </div>

      <!-- 执行进度（可操作） -->
      <div>
        <h4 class="text-sm font-semibold text-gray-900 mb-3">执行进度</h4>
        <div class="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            :value="feedbackForm.progress"
            class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            @input="onProgressInput($event.target.value)"
          />
          <span class="w-14 text-sm font-medium text-gray-700 text-center bg-gray-100 rounded px-2 py-1">
            {{ feedbackForm.progress }}%
          </span>
        </div>
        <p class="text-xs text-gray-400 mt-1">
          <span v-if="feedbackForm.progress === 100">已完成，可提交反馈</span>
          <span v-else-if="feedbackForm.progress === 0">未开始</span>
          <span v-else>进行中</span>
        </p>
      </div>

      <!-- 处理结果（统一使用下拉选择） -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          处理结果 <span class="text-red-500">*</span>
        </label>
        <select
          :value="feedbackForm.resultStatus"
          :class="deepInputClass"
          @change="onResultStatusChange($event.target.value)"
        >
          <option value="">请选择处理结果</option>
          <option value="全部完成">全部完成</option>
          <option value="部分完成">部分完成</option>
          <option value="延迟完成">延迟完成</option>
          <option value="无法继续">无法继续</option>
          <option value="其他">其他</option>
        </select>
      </div>

      <!-- 备注输入框 - 仅当选择"其他"或"无法继续"时显示 -->
      <div v-if="feedbackForm.resultStatus === '其他' || feedbackForm.resultStatus === '无法继续'">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          备注说明 <span class="text-red-500">*</span>
        </label>
        <textarea
          :value="feedbackForm.resultText"
          rows="4"
          placeholder="请详细说明处理情况和原因..."
          :class="deepInputClass"
          @input="onResultTextInput($event.target.value)"
        />
      </div>

      <!-- 无法继续原因输入区域 -->
      <div v-if="feedbackForm.cannotContinue" class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <label class="block text-sm font-medium text-red-700 mb-2">
          请说明无法继续的原因 <span class="text-red-500">*</span>
        </label>
        <textarea
          :value="feedbackForm.cannotContinueReason"
          rows="3"
          placeholder="请详细描述无法继续的原因（如：天气原因、设备故障、物料不足、其他紧急任务等）..."
          class="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          @input="onCannotContinueReasonInput($event.target.value)"
        />
        <p class="text-xs text-red-600 mt-2">
          提交后任务将变为"已拒绝"状态，等待重新分派给其他执行人。
        </p>
      </div>

      <!-- 必填反馈输入区域（无法继续模式下不显示） -->
      <div v-if="!feedbackForm.cannotContinue && task.requiredFeedback && task.requiredFeedback.length > 0" class="space-y-3">
        <label class="block text-sm font-medium text-gray-700">
          必填反馈项
        </label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="fb in task.requiredFeedback"
            :key="fb"
            class="border-2 border-gray-200 rounded-lg p-4 bg-white"
          >
            <div class="flex items-center gap-2 mb-2">
              <span class="font-medium text-gray-700 text-sm">{{ getFeedbackLabel(fb) }}</span>
            </div>
            <textarea
              v-if="fb === 'workload_confirm'"
              :value="feedbackForm.workloadConfirm ? JSON.stringify(feedbackForm.workloadConfirm) : ''"
              rows="2"
              placeholder="请填写工作量（天/小时/人数）"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              @input="onWorkloadInput($event.target.value)"
            />
            <input
              v-else-if="fb === 'gps'"
              type="text"
              :value="feedbackForm.gpsLocation ? `${feedbackForm.gpsLocation.lat},${feedbackForm.gpsLocation.lng}` : ''"
              placeholder="点击按钮获取位置..."
              readonly
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 mb-2"
            />
            <button
              v-if="fb === 'gps'"
              class="w-full px-3 py-1.5 text-white bg-blue-500 hover:bg-blue-600 rounded text-xs"
              @click="captureGps"
            >
              获取当前位置
            </button>
            <div v-else-if="fb === 'photo_before'">
              <input
                type="file"
                accept="image/*"
                multiple
                class="text-xs mb-2"
                @change="onPhotoBeforeChange($event)"
              />
              <div v-if="feedbackForm.photosBefore.length > 0" class="text-xs text-gray-500">
                已上传 {{ feedbackForm.photosBefore.length }} 张
              </div>
            </div>
            <div v-else-if="fb === 'photo_after'">
              <input
                type="file"
                accept="image/*"
                multiple
                class="text-xs mb-2"
                @change="onPhotoAfterChange($event)"
              />
              <div v-if="feedbackForm.photosAfter.length > 0" class="text-xs text-gray-500">
                已上传 {{ feedbackForm.photosAfter.length }} 张
              </div>
            </div>
            <input
              v-else-if="fb === 'material'"
              type="text"
              :value="feedbackForm.materialCode"
              placeholder="物资编码"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              @input="onMaterialInput($event.target.value)"
            />
            <input
              v-else-if="fb === 'voice'"
              type="text"
              :value="feedbackForm.voiceNote"
              placeholder="语音备注（输入文本替代录音）"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              @input="onVoiceInput($event.target.value)"
            />
          </div>
        </div>
      </div>

      <!-- 反馈提示信息 -->
      <div
        :class="[
          'rounded-lg p-3',
          feedbackForm.cannotContinue
            ? 'bg-red-50 border border-red-200'
            : 'bg-amber-50 border border-amber-200'
        ]"
      >
        <div
          :class="['text-sm', feedbackForm.cannotContinue ? 'text-red-800' : 'text-amber-800']"
        >
          <span v-if="feedbackForm.cannotContinue">
            确认无法继续后，任务将变为"已拒绝"状态，等待重新分派。
          </span>
          <span v-else-if="task.progress === 100">
            提交反馈后，任务将进入"待验收"状态，等待管理者确认完成。
          </span>
          <span v-else>
            提交进度反馈后，任务将继续进行，可再次提交直到100%。
          </span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          class="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
          @click="onClose"
        >
          <el-icon class="w-4 h-4"><Close /></el-icon>
          取消
        </button>
        <button
          :class="[
            'flex items-center gap-1 px-3 py-1.5 rounded text-sm text-white transition-colors',
            feedbackForm.cannotContinue
              ? (feedbackForm.cannotContinueReason.trim() ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-300 cursor-not-allowed')
              : (validateRequiredFeedback().valid && feedbackForm.resultStatus &&
                  ((feedbackForm.resultStatus === '其他' || feedbackForm.resultStatus === '无法继续') ? feedbackForm.resultText.trim() : true)
                  ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gray-300 cursor-not-allowed')
          ]"
          :disabled="!canSubmit"
          @click="onSubmit"
        >
          <span v-if="feedbackForm.cannotContinue">确认无法继续</span>
          <span v-else>提交反馈</span>
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * 任务反馈表单弹窗组件
 * 1:1 迁移自 V1.1 src/components/labor/myTasks/TaskFeedbackModal.tsx
 */
import { computed } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { STATUS_MAP, PRIORITY_MAP, getTypeLabel } from './constants.js'
import TaskFlowTimeline from '@/components/common/TaskFlowTimeline.vue'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  onClose: { type: Function, required: true },
  task: { type: Object, default: null },
  feedbackForm: { type: Object, required: true },
  setFeedbackForm: { type: Function, required: true },
  problemFlowRecords: { type: Array, default: () => [] },
  validateRequiredFeedback: { type: Function, required: true },
  onSubmit: { type: Function, required: true },
})

// 深度输入框样式（与 V1.1 一致）
const deepInputClass = 'px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner w-full'

// 反馈项中文标签
const FEEDBACK_LABELS = {
  workload_confirm: '工作量确认',
  gps: '位置打卡',
  photo_before: '作业前照片',
  photo_after: '作业后照片',
  material: '物资扫码',
  voice: '语音备注',
}
function getFeedbackLabel(key) {
  return FEEDBACK_LABELS[key] || key
}

// 是否可提交（与 V1.1 disabled 逻辑一致）
const canSubmit = computed(() => {
  if (!props.task) return false
  if (props.feedbackForm.cannotContinue) {
    return !!props.feedbackForm.cannotContinueReason.trim()
  }
  if (!props.feedbackForm.resultStatus) return false
  if (props.feedbackForm.resultStatus === '其他' || props.feedbackForm.resultStatus === '无法继续') {
    if (!props.feedbackForm.resultText.trim()) return false
  }
  return props.validateRequiredFeedback().valid
})

// ============ 输入回调（统一更新 form 状态）============
function updateForm(patch) {
  props.setFeedbackForm({ ...props.feedbackForm, ...patch })
}

function onProgressInput(value) {
  updateForm({ progress: parseInt(value, 10) })
}
function onResultStatusChange(value) {
  updateForm({
    resultStatus: value,
    resultText: '',
    cannotContinue: value === '无法继续',
    cannotContinueReason: value === '无法继续' ? props.feedbackForm.cannotContinueReason : '',
  })
}
function onResultTextInput(value) {
  updateForm({ resultText: value })
}
function onCannotContinueReasonInput(value) {
  updateForm({ cannotContinueReason: value })
}
function onWorkloadInput(value) {
  // 解析 "天数,小时数,人数" 格式
  const parts = value.split(',').map(p => parseFloat(p.trim()) || 0)
  updateForm({
    workloadConfirm: {
      days: parts[0] || 0,
      hours: parts[1] || 0,
      workers: parts[2] || 1,
    },
  })
}
function onMaterialInput(value) {
  updateForm({ materialCode: value })
}
function onVoiceInput(value) {
  updateForm({ voiceNote: value })
}
function onPhotoBeforeChange(event) {
  const files = Array.from(event.target.files || [])
  if (files.length === 0) return
  // 简化为只存文件名（实际生产环境应使用 FileReader 转 base64）
  const newPhotos = files.map(f => f.name)
  updateForm({ photosBefore: [...props.feedbackForm.photosBefore, ...newPhotos] })
}
function onPhotoAfterChange(event) {
  const files = Array.from(event.target.files || [])
  if (files.length === 0) return
  const newPhotos = files.map(f => f.name)
  updateForm({ photosAfter: [...props.feedbackForm.photosAfter, ...newPhotos] })
}
function captureGps() {
  if (!navigator.geolocation) {
    return
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      updateForm({
        gpsLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude },
      })
    },
    () => {
      // 失败时使用默认坐标（演示用）
      updateForm({ gpsLocation: { lat: 39.9042, lng: 116.4074 } })
    },
    { enableHighAccuracy: true, timeout: 10000 },
  )
}
</script>