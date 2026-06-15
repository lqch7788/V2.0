<!--
  TempTaskFormModal.vue - 临时任务表单弹窗（新增/编辑）
  V1.1 TempTaskFormModal.tsx (527行) 1:1 迁移
  包含 8 段：编号/名称、类型/紧急、地点/执行人/发布人、开始/截止/优先级、天数/小时/人工/总工时、描述、备注、必填反馈
-->
<template>
  <el-dialog
    :model-value="isOpen"
    @update:model-value="(v) => !v && emit('close')"
    :title="title"
    width="900px"
    :close-on-click-modal="false"
    destroy-on-close
    top="3vh"
  >
    <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
      <!-- 第一行：任务编号 + 任务名称 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">任务编号</label>
          <div class="flex gap-2">
            <input
              type="text"
              :value="formData.taskCode"
              @input="emit('change', 'taskCode', $event.target.value)"
              placeholder="点击生成获取编号"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button type="button"
              class="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 inline-flex items-center gap-1"
              @click="emit('generate-code')">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              生成
            </button>
          </div>
          <p v-if="errors.taskCode" class="text-xs text-red-600 mt-1">{{ errors.taskCode }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            任务名称 <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            :value="formData.title"
            @input="emit('change', 'title', $event.target.value)"
            placeholder="请输入任务名称"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p v-if="errors.title" class="text-xs text-red-600 mt-1">{{ errors.title }}</p>
        </div>
      </div>

      <!-- 第二行：任务类型 + 紧急程度（"其他"时显示备注） -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            任务类型 <span class="text-red-500">*</span>
          </label>
          <select :value="formData.tempTaskType"
            @change="emit('change', 'tempTaskType', $event.target.value)"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
            <option v-for="t in TEMP_TASK_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
          <p v-if="errors.tempTaskType" class="text-xs text-red-600 mt-1">{{ errors.tempTaskType }}</p>
        </div>

        <div v-if="formData.tempTaskType === 'other'">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            备注说明 <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            :value="formData.notes"
            @input="emit('change', 'notes', $event.target.value)"
            placeholder="请输入具体任务内容"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p v-if="errors.notes" class="text-xs text-red-600 mt-1">{{ errors.notes }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">紧急程度</label>
          <select :value="formData.urgency"
            @change="handleUrgencyChange($event.target.value)"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
            <option value="normal">普通</option>
            <option value="urgent">紧急</option>
            <option value="critical">非常紧急</option>
          </select>
        </div>
      </div>

      <!-- 第三行：工作地点 + 执行人 + 发布人 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            工作地点 <span class="text-red-500">*</span>
          </label>
          <select :value="formData.greenhouseId || formData.workLocation"
            @change="handleWorkLocationChange($event.target.value)"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
            <option value="" disabled>请选择</option>
            <option disabled>━━━━━━━━ 温室 ━━━━━━━━</option>
            <option v-for="g in greenhouses" :key="g.id" :value="g.id">{{ g.name }}</option>
            <option disabled>━━━━━━━━ 其他地点 ━━━━━━━━</option>
            <option v-for="loc in OTHER_LOCATIONS" :key="loc.value" :value="loc.value">{{ loc.label }}</option>
          </select>
          <p v-if="errors.workLocation" class="text-xs text-red-600 mt-1">{{ errors.workLocation }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            执行人 <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-4 mb-3">
            <label class="flex items-center gap-2 cursor-pointer text-sm text-gray-700"
              @click.prevent="emit('dispatch-mode-change', 'manual')">
              <div :class="['w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                dispatchMode === 'manual' ? 'border-emerald-600' : 'border-gray-400']">
                <div v-if="dispatchMode === 'manual'" class="w-2 h-2 rounded-full bg-emerald-600" />
              </div>
              <span>👤 手动选择</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer text-sm text-gray-700"
              @click.prevent="emit('dispatch-mode-change', 'ai_assisted')">
              <div :class="['w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                dispatchMode === 'ai_assisted' ? 'border-emerald-600' : 'border-gray-400']">
                <div v-if="dispatchMode === 'ai_assisted'" class="w-2 h-2 rounded-full bg-emerald-600" />
              </div>
              <span>🤖 待智能推荐</span>
            </label>
          </div>
          <select :value="formData.assigneeId"
            @change="handleAssigneeChange($event.target.value)"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
            <option value="" disabled>请选择执行人</option>
            <option v-for="u in workerUsers" :key="u.id" :value="u.id">{{ u.name }}</option>
          </select>
          <p v-if="errors.assigneeId" class="text-xs text-red-600 mt-1">{{ errors.assigneeId }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">发布人</label>
          <div class="flex items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
            <span class="font-medium">{{ currentUserName }}</span>
            <span class="ml-2 text-xs text-gray-500">（当前登录用户）</span>
          </div>
        </div>
      </div>

      <!-- 第四行：计划开始 + 截止时间 + 优先级 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">计划开始时间</label>
          <input
            type="datetime-local"
            :value="formData.planStart"
            @input="emit('change', 'planStart', $event.target.value)"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            截止时间 <span class="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            :value="formData.dueDate"
            @input="emit('change', 'dueDate', $event.target.value)"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p v-if="errors.dueDate" class="text-xs text-red-600 mt-1">{{ errors.dueDate }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">优先级</label>
          <select :value="formData.priority"
            @change="handlePriorityChange($event.target.value)"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
            <option value="high">高优先级</option>
            <option value="medium">中优先级</option>
            <option value="low">低优先级</option>
          </select>
        </div>
      </div>

      <!-- 第五行：预计天数 + 预计小时 + 人工数量 + 总工时 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">预计天数（8小时/天）</label>
          <input
            type="number"
            :value="formData.estimatedDays"
            @input="emit('change', 'estimatedDays', parseInt($event.target.value) || 0)"
            min="0"
            placeholder="0"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">预计小时</label>
          <input
            type="number"
            :value="formData.estimatedHours"
            @input="emit('change', 'estimatedHours', parseInt($event.target.value) || 0)"
            min="0"
            placeholder="0"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">人工数量</label>
          <input
            type="number"
            :value="formData.workerCount"
            @input="emit('change', 'workerCount', parseInt($event.target.value) || 1)"
            min="1"
            placeholder="1"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">总工时</label>
          <div class="flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-medium">
            <span class="text-sm">共</span>
            <span class="text-lg">{{ totalEstimatedHours }}</span>
            <span class="text-sm">小时</span>
          </div>
        </div>
      </div>

      <!-- 第六行：任务描述 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">任务描述</label>
        <textarea
          :value="formData.description"
          @input="emit('change', 'description', $event.target.value)"
          placeholder="请输入任务描述"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <!-- 第七行：备注 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
        <textarea
          :value="formData.notes"
          @input="emit('change', 'notes', $event.target.value)"
          placeholder="备注信息"
          rows="2"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <!-- 第八行：必填反馈选项 -->
      <div>
        <label class="block text-sm font-bold text-red-600 mb-2">
          必填反馈 <span class="text-red-500">*</span>
        </label>
        <div class="grid grid-cols-2 gap-3">
          <label
            v-for="item in FEEDBACK_OPTIONS"
            :key="item.key"
            :class="['flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all',
              formData.requiredFeedback.includes(item.key)
                ? 'bg-gray-100 border-2 border-emerald-300'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100']"
          >
            <input
              type="checkbox"
              :checked="formData.requiredFeedback.includes(item.key)"
              @change="toggleFeedback(item.key)"
              class="sr-only"
            />
            <div :class="['w-8 h-8 rounded-lg flex items-center justify-center',
              formData.requiredFeedback.includes(item.key) ? item.iconBg : 'bg-gray-200']">
              <span :class="formData.requiredFeedback.includes(item.key) ? 'text-white' : 'text-gray-400'">
                {{ item.icon }}
              </span>
            </div>
            <span :class="['text-sm font-medium',
              formData.requiredFeedback.includes(item.key) ? 'text-gray-900' : 'text-gray-500']">
              {{ item.label }}
            </span>
          </label>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3">
        <button type="button"
          class="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 inline-flex items-center gap-1"
          @click="emit('submit-draft')">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          存为草稿
        </button>
        <button type="button"
          class="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1"
          @click="emit('submit')">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          发布
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * 临时任务表单弹窗（新增/编辑）
 * V1.1 src/components/labor/tempTask/TempTaskFormModal.tsx 1:1 迁移
 *
 * 字段 17 个（与 V1.1 formData 1:1）：
 *   taskCode / title / urgency / tempTaskType / workLocation
 *   estimatedHours / assigneeId / assigneeName / planStart / dueDate
 *   description / notes / priority / estimatedDays / greenhouseId
 *   workerCount / requiredFeedback
 *
 * Emits:
 *   close / submit-draft / submit / change / generate-code / dispatch-mode-change
 */
import { computed } from 'vue'
import { useUserStore } from '@/stores/modules/user'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: '新建临时任务' },
  task: { type: Object, default: null },
  formData: {
    type: Object,
    required: true,
    // 字段 1:1 对齐 V1.1
  },
  errors: { type: Object, default: () => ({}) },
  workerUsers: { type: Array, default: () => [] },
  greenhouses: { type: Array, default: () => [] },
  dispatchMode: { type: String, default: 'manual' },
})

const emit = defineEmits([
  'close',
  'submit-draft',
  'submit',
  'change',
  'generate-code',
  'dispatch-mode-change',
])

// ========== 任务类型（与 V1.1 TEMP_TASK_TYPES 1:1）==========
const TEMP_TASK_TYPES = [
  { value: 'fertilization', label: '施肥' },
  { value: 'irrigation', label: '灌溉' },
  { value: 'pruning', label: '修剪' },
  { value: 'pesticide', label: '植保' },
  { value: 'rootIrrigation', label: '灌根' },
  { value: 'planting', label: '定植' },
  { value: 'harvest', label: '采收' },
  { value: 'weeding', label: '除草' },
  { value: 'other', label: '其他' },
]

// ========== 其他地点选项 ==========
const OTHER_LOCATIONS = [
  { value: '外出协助', label: '外出协助' },
  { value: '总部办公', label: '总部办公' },
  { value: '仓库', label: '仓库' },
  { value: '其他', label: '其他' },
]

// ========== 必填反馈选项（与 V1.1 1:1）==========
const FEEDBACK_OPTIONS = [
  { key: 'workload_confirm', label: '工作量确认', icon: '📊', iconBg: 'bg-emerald-500' },
  { key: 'gps', label: '位置打卡', icon: '📍', iconBg: 'bg-blue-500' },
  { key: 'material', label: '物资扫码', icon: '📦', iconBg: 'bg-amber-500' },
  { key: 'photo_before', label: '作业前照片', icon: '📷', iconBg: 'bg-purple-500' },
  { key: 'photo_after', label: '作业后照片', icon: '📷', iconBg: 'bg-pink-500' },
  { key: 'voice', label: '语音备注', icon: '🎤', iconBg: 'bg-teal-500' },
]

// ========== 当前用户（从 useUserStore）==========
const userStore = useUserStore()
const currentUserName = computed(() => {
  const u = userStore.users?.[0] || userStore.currentUser || { name: '管理员' }
  return u.name || u.userName || '管理员'
})

// ========== 紧急程度 <-> 优先级 双向映射（与 V1.1 1:1）==========
const URGENCY_TO_PRIORITY = { critical: 'high', urgent: 'medium', normal: 'low' }
const PRIORITY_TO_URGENCY = { high: 'critical', medium: 'urgent', low: 'normal' }

function handleUrgencyChange(value) {
  emit('change', 'urgency', value)
  emit('change', 'priority', URGENCY_TO_PRIORITY[value] || 'low')
}

function handlePriorityChange(value) {
  emit('change', 'priority', value)
  emit('change', 'urgency', PRIORITY_TO_URGENCY[value] || 'normal')
}

// ========== 工作地点切换（与 V1.1 handleWorkLocationChange 1:1）==========
function handleWorkLocationChange(value) {
  const selectedGreenhouse = props.greenhouses.find(g => g.id === value)
  if (selectedGreenhouse) {
    emit('change', 'greenhouseId', value)
    emit('change', 'workLocation', selectedGreenhouse.name)
  } else {
    emit('change', 'greenhouseId', '')
    emit('change', 'workLocation', value)
  }
}

// ========== 执行人切换 ==========
function handleAssigneeChange(value) {
  const selectedUser = props.workerUsers.find(u => u.id === value)
  emit('change', 'assigneeId', value)
  emit('change', 'assigneeName', selectedUser?.name || '')
}

// ========== 必填反馈切换 ==========
function toggleFeedback(key) {
  const current = props.formData.requiredFeedback || []
  if (current.includes(key)) {
    emit('change', 'requiredFeedback', current.filter(f => f !== key))
  } else {
    emit('change', 'requiredFeedback', [...current, key])
  }
}

// ========== 总工时计算（与 V1.1 1:1）==========
const totalEstimatedHours = computed(() => {
  const days = props.formData.estimatedDays || 0
  const hours = props.formData.estimatedHours || 0
  const workers = props.formData.workerCount || 1
  return (days * 8 + hours) * workers
})
</script>