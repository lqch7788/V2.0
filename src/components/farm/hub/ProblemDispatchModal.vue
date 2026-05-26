<template>
  <!-- 问题分派弹窗 -->
  <el-dialog
    :model-value="!!problemId"
    title="问题分派"
    width="600px"
    :close-on-click-modal="false"
    @close="onClose"
  >
    <!-- 加载中 -->
    <div v-if="!problem" class="text-center py-12 text-gray-500">
      <p>加载中...</p>
    </div>

    <div v-else class="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
      <!-- 问题信息 -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-700 mb-3">问题信息</h4>
        <div class="space-y-2 text-sm">
          <div>
            <span class="text-gray-500">问题描述:</span>
            <p class="mt-1 text-gray-900">{{ issueText }}</p>
          </div>
          <div class="flex items-center gap-4">
            <div>
              <span class="text-gray-500">问题编号:</span>
              <span class="ml-2 text-gray-900">{{ problemCode }}</span>
            </div>
            <div>
              <span class="text-gray-500">状态:</span>
              <span class="ml-2 text-gray-900">{{ statusLabel }}</span>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div>
              <span class="text-gray-500">温室区域:</span>
              <span class="ml-2 text-gray-900">{{ greenhouseName }}</span>
            </div>
            <div>
              <span class="text-gray-500">严重程度:</span>
              <span :class="severityConfig.bgClass + ' ' + severityConfig.textClass + ' ml-2 px-2 py-0.5 text-xs rounded'">
                {{ severity }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 执行人选择 -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-700 mb-3">执行人选择</h4>
        <div class="space-y-2">
          <label
            v-for="worker in availableWorkers"
            :key="worker.id"
            :class="[
              'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
              selectedWorkerId === worker.id ? 'bg-emerald-50 border border-emerald-200' : 'bg-white border border-gray-200 hover:bg-gray-50'
            ]"
          >
            <input
              type="radio"
              name="worker"
              :value="worker.id"
              :checked="selectedWorkerId === worker.id"
              class="w-4 h-4 text-emerald-600"
              @change="selectedWorkerId = worker.id"
            />
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">{{ worker.name }}（{{ worker.position }}）</p>
            </div>
          </label>
        </div>
      </div>

      <!-- 分派设置 -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-700 mb-3">分派设置</h4>
        <div class="space-y-3">
          <!-- 优先级 -->
          <div>
            <label class="block text-sm text-gray-600 mb-2">优先级:</label>
            <div class="flex gap-2">
              <el-button
                v-for="level in ['高', '中', '低']"
                :key="level"
                size="small"
                :class="priority === level ? priorityButtonClass(level) : 'bg-gray-100 hover:bg-gray-200 text-gray-600'"
                @click="priority = level"
              >
                {{ level }}
              </el-button>
            </div>
          </div>

          <!-- 期望完成日期 -->
          <div>
            <label class="block text-sm text-gray-600 mb-2">期望完成日期:</label>
            <el-date-picker
              v-model="expectedDateProxy"
              type="date"
              placeholder="选择日期"
              class="w-full"
              value-format="YYYY-MM-DD"
            />
          </div>

          <!-- 必填项 -->
          <div>
            <label class="block text-sm text-gray-600 mb-2">必填项:</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="requireCheckin"
                  class="w-4 h-4 text-emerald-600 rounded"
                />
                <span class="text-sm text-gray-700">位置打卡</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="requirePhoto"
                  class="w-4 h-4 text-emerald-600 rounded"
                />
                <span class="text-sm text-gray-700">作业照片</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <el-button @click="onClose">取消</el-button>
        <el-button
          type="primary"
          :disabled="!selectedWorkerId || isSubmitting"
          @click="handleSubmit"
        >
          {{ isSubmitting ? '分派中...' : '确认分派' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// ============================================
// 严重程度配置（与V1.1完全一致）
// ============================================
const SEVERITY_CONFIG: Record<string, { bgClass: string; textClass: string; color: string }> = {
  '轻微': { bgClass: 'bg-green-100', textClass: 'text-green-700', color: 'green' },
  '中等': { bgClass: 'bg-yellow-100', textClass: 'text-yellow-700', color: 'yellow' },
  '严重': { bgClass: 'bg-red-100', textClass: 'text-red-700', color: 'red' },
}

// 状态中文映射
const STATUS_CN_MAP: Record<string, string> = {
  'pending': '待处理',
  'in_progress': '处理中',
  'waiting_acceptance': '待验收',
  'completed': '已处理',
}

// ============================================
// Props 定义
// ============================================
const props = defineProps({
  problemId: { type: Number, default: 0 },
  onClose: { type: Function, required: true },
  onDispatched: { type: Function, required: true },
  /** 问题数据（从外部传入） */
  problem: { type: Object, default: null },
  /** 可用工人列表 */
  availableWorkers: { type: Array, default: () => [] },
})

const emit = defineEmits(['dispatch'])

// ============================================
// 状态
// ============================================
const problem = computed(() => props.problem)
const availableWorkers = computed(() => props.availableWorkers || [])

const selectedWorkerId = ref<string | null>(null)
const priority = ref<'高' | '中' | '低'>('中')
const expectedDate = ref<string>('')
const requireCheckin = ref(false)
const requirePhoto = ref(false)
const isSubmitting = ref(false)

// 弹窗打开时初始化默认日期为明天
watch(() => props.problemId, (newVal) => {
  if (newVal) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    expectedDate.value = tomorrow.toISOString().split('T')[0]
    selectedWorkerId.value = null
    priority.value = '中'
    requireCheckin.value = false
    requirePhoto.value = false
    isSubmitting.value = false
  }
})

// ============================================
// 计算属性
// ============================================
const issueText = computed(() => {
  if (!problem.value) return ''
  return problem.value.issueText || problem.value.description || problem.value.title || ''
})

const severity = computed(() => {
  if (!problem.value) return '中等'
  return problem.value.issueSeverity || '中等'
})

const severityConfig = computed(() => {
  return SEVERITY_CONFIG[severity.value] || SEVERITY_CONFIG['轻微']
})

const statusLabel = computed(() => {
  if (!problem.value) return ''
  return problem.value.statusLabel || STATUS_CN_MAP[problem.value.status] || problem.value.status || ''
})

const greenhouseName = computed(() => {
  return problem.value?.greenhouseName || ''
})

const problemCode = computed(() => {
  if (!problem.value) return ''
  return problem.value.problemCode || `PD${props.problemId}`
})

// 日期代理
const expectedDateProxy = computed({
  get: () => expectedDate.value ? new Date(expectedDate.value) : null,
  set: (val) => {
    if (val instanceof Date) {
      expectedDate.value = val.toISOString().split('T')[0]
    } else if (typeof val === 'string') {
      expectedDate.value = val
    }
  },
})

// ============================================
// 方法
// ============================================
// 优先级按钮样式
const priorityButtonClass = (level: string) => {
  const classes: Record<string, string> = {
    '高': 'bg-red-600 hover:bg-red-700 text-white',
    '中': 'bg-yellow-600 hover:bg-yellow-600 text-white',
    '低': 'bg-green-600 hover:bg-green-600 text-white',
  }
  return classes[level] || ''
}

// 提交分派
const handleSubmit = () => {
  if (!problem.value || !selectedWorkerId.value) return

  // 构建必填反馈列表
  const requiredFeedback: string[] = []
  if (requireCheckin.value) requiredFeedback.push('gps')
  if (requirePhoto.value) {
    requiredFeedback.push('photo_before')
    requiredFeedback.push('photo_after')
  }

  // 向外发射分派事件
  emit('dispatch', {
    problemId: props.problemId,
    workerId: selectedWorkerId.value,
    priority: priority.value,
    expectedDate: expectedDate.value,
    requiredFeedback,
  })

  isSubmitting.value = true
  // 由父组件处理分派结果，成功后调用 onDispatched
  props.onDispatched()
}
</script>
