<template>
  <!-- 任务执行卡片 - 从V1.1 TaskExecuteCard.tsx 1:1迁移 -->
  <el-dialog
    :model-value="isOpen"
    @update:model-value="$emit('close')"
    :title="`执行任务 - ${task.taskCode || ''}`"
    width="640px"
    top="5vh"
  >
    <div class="space-y-6">
      <!-- 任务基本信息 -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="font-semibold text-gray-900 mb-2">{{ task.title || task.taskName }}</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span class="text-gray-500 block text-xs">执行人</span>
            <p class="font-medium">{{ task.assigneeName || task.assignee }}</p>
          </div>
          <div>
            <span class="text-gray-500 block text-xs">任务类型</span>
            <p class="font-medium">{{ task.typeName || task.typeLabel }}</p>
          </div>
          <div>
            <span class="text-gray-500 block text-xs">当前状态</span>
            <p class="font-medium">
              <span class="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">处理中</span>
            </p>
          </div>
          <div>
            <span class="text-gray-500 block text-xs">截止日期</span>
            <p class="font-medium">{{ task.dueDate || task.planEnd || '未设置' }}</p>
          </div>
        </div>
      </div>

      <!-- 执行进度 -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-gray-700 flex items-center gap-2">
            <el-icon :size="16"><Clock /></el-icon>
            执行进度
          </span>
          <span class="text-sm font-medium text-gray-700">{{ progress }}%</span>
        </div>
        <el-slider v-model="progress" :min="0" :max="100" :step="5" :disabled="!canSubmit" />
        <div class="flex justify-between text-xs text-gray-400 mt-1">
          <span>0%</span><span>50%</span><span>100%</span>
        </div>
        <p class="text-center text-sm text-gray-500 mt-2">{{ statusLabel }}</p>
      </div>

      <!-- 必填反馈项 -->
      <div v-if="task.feedbackRequirements && task.feedbackRequirements.length > 0">
        <span class="text-gray-700 block mb-3 font-medium">必填反馈项</span>
        <div class="grid grid-cols-2 gap-3">
          <div v-for="(req, index) in task.feedbackRequirements" :key="index" class="border border-gray-200 rounded-lg p-3">
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <el-icon :size="16" :class="reqIconClass(req.type)"><component :is="reqIcon(req.type)" /></el-icon>
              {{ req.label }}
              <span v-if="req.required" class="text-red-500">*</span>
            </div>
            <el-input v-if="req.type === 'text'" :placeholder="`请输入${req.label}...`" size="small" />
            <div v-else-if="req.type === 'gps'" class="flex items-center gap-2">
              <el-button size="small" @click="getGpsLocation">获取GPS</el-button>
              <span v-if="gpsLocation" class="text-xs text-green-600">{{ gpsLocation }}</span>
            </div>
            <el-button v-else size="small">上传</el-button>
          </div>
        </div>
      </div>

      <!-- 进度说明 -->
      <div>
        <span class="text-gray-700 block mb-2 font-medium">
          进度说明 <span v-if="progress < 100" class="text-gray-400">(选填)</span>
        </span>
        <el-input
          v-model="submitText"
          type="textarea"
          :rows="3"
          :placeholder="progress === 100 ? '请描述完成情况，准备提交验收...' : '请描述当前进度和下一步计划...'"
        />
      </div>

      <!-- 提示 -->
      <div :class="['rounded-lg p-3', progress === 100 ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50 border border-blue-200']">
        <p :class="['text-sm', progress === 100 ? 'text-amber-800' : 'text-blue-800']">
          {{ progress === 100 ? '提交反馈后，任务将进入"待验收"状态，等待管理者确认完成。' : '提交进度反馈后，任务将继续进行，可再次提交直到100%。' }}
        </p>
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button :type="progress === 100 ? 'success' : 'primary'" :disabled="!canSubmit" @click="handleSubmit">
        <el-icon><component :is="progress === 100 ? 'CircleCheck' : 'VideoPlay'" /></el-icon>
        {{ progress === 100 ? '提交验收' : '提交进度' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Clock, MapLocation, Camera, Microphone, Document, Goods, CircleCheck, VideoPlay } from '@element-plus/icons-vue'

const props = defineProps({
  task: { type: Object, default: () => ({}) },
  isOpen: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'submitProgress'])

const progress = ref(props.task.progress || 0)
const submitText = ref('')
const materialCode = ref('')
const gpsLocation = ref('')

const isCompleted = computed(() => props.task.status === 'completed' || props.task.status === 'waiting_acceptance')
const canSubmit = computed(() => props.task.status === 'accepted' || props.task.status === 'in_progress')

const statusLabel = computed(() => {
  if (isCompleted.value) return '已完成'
  if (progress.value === 100) return '可提交验收'
  if (progress.value > 0) return '进行中'
  return '未开始'
})

const reqIconMap = { gps: MapLocation, image_before: Camera, image_after: Camera, voice: Microphone, text: Document, materials: Goods }
const reqIconClassMap = { gps: 'text-blue-500', image_before: 'text-purple-500', image_after: 'text-green-500', voice: 'text-red-500', text: 'text-gray-500', materials: 'text-orange-500' }

const reqIcon = (type) => reqIconMap[type] || Document
const reqIconClass = (type) => reqIconClassMap[type] || 'text-gray-500'

const getGpsLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      gpsLocation.value = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
    })
  }
}

const handleSubmit = () => {
  emit('submitProgress', progress.value, { text: submitText.value, materials: materialCode.value ? [{ name: materialCode.value, qty: 1, unit: '个' }] : undefined })
  emit('close')
}
</script>
