<template>
  <el-dialog
    :model-value="isOpen"
    @update:model-value="(v) => !v && onClose()"
    :title="`执行任务 - ${task.taskCode}`"
    width="680px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div class="space-y-6">
      <!-- 任务基本信息 -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="font-semibold text-gray-900 mb-2">{{ task.title }}</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span class="text-gray-500 text-xs">执行人</span>
            <p class="font-medium">{{ task.assigneeName }}</p>
          </div>
          <div>
            <span class="text-gray-500 text-xs">任务类型</span>
            <p class="font-medium">{{ task.typeName }}</p>
          </div>
          <div>
            <span class="text-gray-500 text-xs">当前状态</span>
            <p class="font-medium">
              <span :class="['px-2 py-0.5 rounded text-xs', statusStyle.bg, statusStyle.color]">
                {{ statusStyle.label }}
              </span>
            </p>
          </div>
          <div>
            <span class="text-gray-500 text-xs">截止日期</span>
            <p class="font-medium">{{ task.dueDate || '未设置' }}</p>
          </div>
        </div>
      </div>

      <!-- 执行进度 -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-gray-700 flex items-center gap-2 text-sm font-medium">
            <el-icon :size="16"><Clock /></el-icon>
            执行进度
          </label>
          <span class="text-sm font-medium text-gray-700">{{ progress }}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          v-model.number="progress"
          :disabled="!canSubmit"
          :class="['w-full h-2 rounded-lg appearance-none cursor-pointer progress-slider', !canSubmit ? 'opacity-50 cursor-not-allowed' : '']"
        />
        <div class="flex justify-between text-xs text-gray-400 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
        <p class="text-center text-sm text-gray-500 mt-2">{{ statusLabel }}</p>
      </div>

      <!-- 必填反馈项 -->
      <div v-if="task.feedbackRequirements && task.feedbackRequirements.length > 0">
        <label class="text-gray-700 text-sm font-medium mb-3 block">必填反馈项</label>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="(req, index) in task.feedbackRequirements"
            :key="index"
            class="border border-gray-200 rounded-lg p-3"
          >
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <el-icon v-if="req.type === 'gps'" :size="16" class="text-blue-500"><Location /></el-icon>
              <el-icon v-else-if="req.type === 'image_before'" :size="16" class="text-purple-500"><Camera /></el-icon>
              <el-icon v-else-if="req.type === 'image_after'" :size="16" class="text-green-500"><Camera /></el-icon>
              <el-icon v-else-if="req.type === 'voice'" :size="16" class="text-red-500"><Microphone /></el-icon>
              <el-icon v-else-if="req.type === 'text'" :size="16" class="text-gray-500"><Document /></el-icon>
              <el-icon v-else-if="req.type === 'materials'" :size="16" class="text-orange-500"><Box /></el-icon>
              {{ req.label }}
              <span v-if="req.required" class="text-red-500">*</span>
            </div>

            <!-- GPS定位 -->
            <div v-if="req.type === 'gps'" class="flex items-center gap-2">
              <el-input
                placeholder="点击获取GPS"
                size="small"
                class="flex-1"
                @focus="handleGetGPS"
                readonly
                :model-value="gpsDisplayText"
              />
              <span v-if="feedback.gpsLocation" class="text-xs text-green-600">
                {{ feedback.gpsLocation.lat.toFixed(4) }}, {{ feedback.gpsLocation.lng.toFixed(4) }}
              </span>
            </div>

            <!-- 作业前照片 -->
            <div v-if="req.type === 'image_before'" class="flex items-center gap-2">
              <el-button size="small" @click="triggerFileInput('image_before')">拍照</el-button>
              <span v-if="beforeImages.length > 0" class="text-xs text-gray-500">{{ beforeImages.length }}张</span>
              <input
                ref="imageBeforeInput"
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                class="hidden"
                @change="(e) => handleImageChange(e, 'image_before')"
              />
            </div>

            <!-- 作业后照片 -->
            <div v-if="req.type === 'image_after'" class="flex items-center gap-2">
              <el-button size="small" @click="triggerFileInput('image_after')">拍照</el-button>
              <span v-if="afterImages.length > 0" class="text-xs text-gray-500">{{ afterImages.length }}张</span>
              <input
                ref="imageAfterInput"
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                class="hidden"
                @change="(e) => handleImageChange(e, 'image_after')"
              />
            </div>

            <!-- 语音备注 -->
            <div v-if="req.type === 'voice'" class="flex items-center gap-2">
              <el-button size="small" @click="handleVoiceRecord">
                <el-icon :size="12" class="mr-1"><Microphone /></el-icon>
                {{ recording ? '停止录音' : '录音' }}
              </el-button>
              <span v-if="recording" class="text-xs text-red-500 animate-pulse">录音中...</span>
              <span v-if="feedback.voiceNote" class="text-xs text-green-600">已录音</span>
            </div>

            <!-- 文本反馈 -->
            <div v-if="req.type === 'text'">
              <textarea
                :placeholder="`请输入${req.label}...`"
                class="w-full px-2 py-1 border border-gray-200 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                rows="2"
                @input="(e) => handleTextInput(e, index)"
              ></textarea>
            </div>

            <!-- 物资扫码 -->
            <div v-if="req.type === 'materials'">
              <el-input
                v-model="materialCode"
                placeholder="扫描或输入物资编码"
                size="small"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 进度反馈文本 -->
      <div>
        <label class="text-gray-700 text-sm font-medium mb-2 block">
          进度说明 {{ progress < 100 ? '(选填)' : '' }}
        </label>
        <textarea
          v-model="submitText"
          :placeholder="progress === 100 ? '请描述完成情况，准备提交验收...' : '请描述当前进度和下一步计划...'"
          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows="3"
        ></textarea>
      </div>

      <!-- 提示信息 -->
      <div :class="['rounded-lg p-3', progress === 100 ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50 border border-blue-200']">
        <p :class="['text-sm', progress === 100 ? 'text-amber-800' : 'text-blue-800']">
          {{ progress === 100
            ? '提交反馈后，任务将进入"待验收"状态，等待管理者确认完成。'
            : '提交进度反馈后，任务将继续进行，可再次提交直到100%。'
          }}
        </p>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <template #footer>
      <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <el-button @click="onClose">取消</el-button>
        <el-button
          :type="progress === 100 ? 'primary' : 'primary'"
          @click="handleSubmit"
          :disabled="!canSubmit"
        >
          <el-icon v-if="progress === 100" class="mr-1"><CircleCheck /></el-icon>
          <el-icon v-else class="mr-1"><VideoPlay /></el-icon>
          {{ progress === 100 ? '提交验收' : '提交进度' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import {
  Clock, Location, Camera, Microphone, Document, Box,
  CircleCheck, VideoPlay
} from '@element-plus/icons-vue'
import { TASK_STATUS_MAP } from '@/constants/taskDispatch'

const props = defineProps({
  task: { type: Object, required: true },
  isOpen: { type: Boolean, default: false },
  onClose: { type: Function, default: () => {} },
  onSubmitProgress: { type: Function, default: () => {} }
})

/** 本地状态：执行进度 */
const progress = ref(props.task.progress || 0)

/** 本地状态：反馈数据 */
const feedback = reactive({
  text: '',
  images: [],
  voiceNote: null,
  gpsLocation: null,
  materials: []
})

/** 提交文本 */
const submitText = ref('')

/** 物资编码 */
const materialCode = ref('')

/** 语音录制状态 */
const recording = ref(false)
let mediaRecorder = null
let audioChunks = []

/** 作业前/后照片列表 */
const beforeImages = ref([])
const afterImages = ref([])

// 文件选择器引用
const imageBeforeInput = ref(null)
const imageAfterInput = ref(null)

/** 任务是否已完成 */
const isCompleted = computed(() => {
  return props.task.status === 'completed' || props.task.status === 'waiting_acceptance'
})

/** 是否可以提交进度 */
const canSubmit = computed(() => {
  return props.task.status === 'accepted' || props.task.status === 'in_progress'
})

/** 状态标签样式 */
const statusStyle = computed(() => {
  const config = TASK_STATUS_MAP[props.task.status]
  return config || { label: '未知', color: 'text-gray-600', bg: 'bg-gray-100' }
})

/** 状态标签文本 */
const statusLabel = computed(() => {
  if (isCompleted.value) return statusStyle.value.label
  if (progress.value === 100) return '可提交验收'
  if (progress.value > 0) return '进行中'
  return '未开始'
})

/** GPS显示文本 */
const gpsDisplayText = computed(() => {
  if (feedback.gpsLocation) {
    return '已获取位置'
  }
  return '点击获取GPS'
})

/** 获取GPS定位 */
const handleGetGPS = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        feedback.gpsLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }
      },
      () => {
        console.error('获取GPS位置失败')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }
}

/** 触发文件选择 */
const triggerFileInput = (type) => {
  if (type === 'image_before' && imageBeforeInput.value) {
    imageBeforeInput.value.click()
  } else if (type === 'image_after' && imageAfterInput.value) {
    imageAfterInput.value.click()
  }
}

/** 处理图片选择 */
const handleImageChange = (event, type) => {
  const files = event.target.files
  if (!files) return
  Array.from(files).forEach(file => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result
      if (type === 'image_before') {
        beforeImages.value.push(base64)
      } else {
        afterImages.value.push(base64)
      }
    }
    reader.readAsDataURL(file)
  })
  // 重置input以便重复选择同一文件
  event.target.value = ''
}

/** 处理文本输入 */
const handleTextInput = (event, index) => {
  // 文本反馈暂存到feedback中
  if (!feedback.text) {
    feedback.text = event.target.value
  }
}

/** 语音录制 */
const handleVoiceRecord = async () => {
  if (recording.value) {
    // 停止录音
    if (mediaRecorder) {
      mediaRecorder.stop()
    }
    recording.value = false
    return
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunks.push(e.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' })
      const reader = new FileReader()
      reader.onload = () => {
        feedback.voiceNote = reader.result
      }
      reader.readAsDataURL(blob)
      stream.getTracks().forEach(track => track.stop())
    }

    mediaRecorder.start()
    recording.value = true
  } catch (err) {
    console.error('无法访问麦克风，请检查权限设置', err)
  }
}

/** 提交进度 */
const handleSubmit = () => {
  // 构建materials数据
  const materialsWithCode = materialCode.value
    ? [{ name: materialCode.value, qty: 1, unit: '个' }]
    : feedback.materials

  // 合并所有图片
  const allImages = [...beforeImages.value, ...afterImages.value]

  props.onSubmitProgress(progress.value, {
    ...feedback,
    text: submitText.value || undefined,
    images: allImages.length > 0 ? allImages : undefined,
    materials: materialsWithCode
  })
  props.onClose()
}
</script>

<style scoped>
/* 进度条样式 - 模仿V1.1 emerald主题 */
.progress-slider {
  -webkit-appearance: none;
  appearance: none;
  background: #e5e7eb;
  outline: none;
}
.progress-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #10b981;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.progress-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #10b981;
  cursor: pointer;
  border: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.hidden {
  display: none;
}
</style>
