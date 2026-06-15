<template>
  <!--
    任务详情弹窗（只读视图）
    对应 V1.1 src/components/farm/hub/TaskDetailModal.tsx
    1:1 映射：渐变头部 + 完整任务信息章节 + 流转记录
  -->
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- 遮罩 -->
      <div class="absolute inset-0 bg-black/50" @click="onClose" />

      <!-- 主内容区 -->
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <!-- 头部：渐变 emerald-600 → emerald-500（V1.1 line 215） -->
        <div class="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 flex-shrink-0 rounded-t-xl">
          <div class="flex items-center gap-3">
            <h3 class="text-lg font-semibold text-white">任务详情</h3>
            <span :class="['px-2 py-0.5 text-xs rounded', statusMap[task?.status]?.bg || 'bg-gray-100', statusMap[task?.status]?.color || 'text-gray-600']">
              {{ statusMap[task?.status]?.label || task?.status || '-' }}
            </span>
          </div>
          <button
            class="text-white hover:bg-emerald-600 rounded p-1 transition-colors"
            @click="onClose"
          >
            <el-icon :size="18"><Close /></el-icon>
          </button>
        </div>

        <!-- 加载中状态（V1.1 line 120-128） -->
        <div v-if="!task" class="flex-1 flex items-center justify-center py-12 text-gray-500">
          加载中...
        </div>

        <!-- 内容区域（V1.1 line 228-504） -->
        <div v-else class="flex-1 overflow-y-auto px-6 py-4">
          <div class="space-y-4">
            <!-- 基本信息 - 白色背景，蓝色标题（V1.1 line 231-260） -->
            <div class="bg-white rounded-lg p-4 border border-gray-100">
              <h4 class="text-sm font-bold text-blue-600 mb-3 flex items-center gap-2">
                <el-icon :size="16"><Document /></el-icon>
                基本信息
              </h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span class="text-xs text-gray-500 block">任务类型</span>
                  <p class="font-semibold text-gray-900">{{ task.typeName || task.type || '-' }}</p>
                </div>
                <div>
                  <span class="text-xs text-gray-500 block">任务区域</span>
                  <p class="font-semibold text-gray-900">{{ task.greenhouseName || task.field || '-' }}</p>
                </div>
                <div>
                  <span class="text-xs text-gray-500 block">作物</span>
                  <p class="font-semibold text-gray-900">{{ task.cropName || task.crop || '-' }}</p>
                </div>
                <div>
                  <span class="text-xs text-gray-500 block">执行人</span>
                  <p class="font-semibold text-gray-900">{{ task.assigneeName || task.assignee || '-' }}</p>
                </div>
                <div>
                  <span class="text-xs text-gray-500 block">优先级</span>
                  <p :class="['font-semibold', priorityMap[task.priority]?.color || 'text-gray-900']">
                    {{ priorityMap[task.priority]?.label || task.priority || '普通' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- 来源信息 - 蓝色背景（V1.1 line 263-295） -->
            <div v-if="task.sourceId" class="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h4 class="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
                <el-icon :size="16"><Document /></el-icon>
                来源信息
              </h4>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span class="text-xs text-blue-600 block">来源类型</span>
                  <p class="font-semibold text-gray-900">{{ getSourceTypeLabel(task) }}</p>
                </div>
                <div v-if="task.sourceCode">
                  <span class="text-xs text-blue-600 block">来源编号</span>
                  <p class="font-semibold text-gray-900">{{ task.sourceCode }}</p>
                </div>
                <div v-if="task.sourceId">
                  <span class="text-xs text-blue-600 block">关联ID</span>
                  <p class="font-semibold text-gray-900 text-xs">{{ task.sourceId }}</p>
                </div>
              </div>
              <!-- 工作内容 -->
              <div v-if="task.remarks" class="mt-3 pt-3 border-t border-blue-200">
                <span class="text-xs text-blue-600 block">工作内容</span>
                <p class="text-sm text-gray-700 whitespace-pre-line bg-white rounded p-2">{{ task.remarks }}</p>
              </div>
            </div>

            <!-- 任务类型配置 - 紫色背景（V1.1 line 297-304） -->
            <div class="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <h4 class="text-sm font-bold text-purple-700 mb-3 flex items-center gap-2">
                <el-icon :size="16"><Document /></el-icon>
                任务类型配置
              </h4>
              <!-- 渲染任务类型配置（V1.1 line 143-206） -->
              <div v-if="!task.types || task.types.length === 0" class="text-sm text-gray-400 text-center py-2">
                暂无任务类型配置
              </div>
              <div v-else-if="task.types.length === 1" class="space-y-2">
                <div class="bg-white rounded-lg p-3 border border-purple-100">
                  <p class="text-sm font-medium text-purple-700">{{ getTaskTypeLabel(task.types[0]) }}</p>
                  <div v-if="task.typeConfig" class="mt-2 space-y-1">
                    <div v-for="(value, key) in task.typeConfig" :key="key" class="text-xs text-gray-600">
                      <span class="text-gray-500">{{ key }}：</span>
                      <span class="text-gray-900">{{ value }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 多任务类型 - SOP信息（V1.1 line 157-205） -->
              <div v-else class="bg-blue-50 rounded-lg p-4">
                <div class="flex items-center gap-3 mb-3">
                  <el-icon :size="20" color="#3b82f6"><Document /></el-icon>
                  <span class="text-sm font-medium text-gray-700">作业标准文件</span>
                </div>
                <div v-if="task.sopContent" class="bg-white rounded-lg p-3 border border-blue-100">
                  <p class="text-sm text-gray-600 mb-2">已导入SOP文档</p>
                  <button
                    class="text-blue-600 hover:text-blue-800 underline text-sm flex items-center gap-1"
                    @click="downloadSop"
                  >
                    <el-icon :size="16"><Download /></el-icon>
                    下载SOP文件
                  </button>
                </div>
                <p v-else class="text-sm text-gray-500">暂无SOP文件</p>
                <div class="mt-3">
                  <p class="text-xs text-gray-500 mb-2">已选择的操作类型：</p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="t in task.types"
                      :key="t"
                      :class="['px-2 py-1 rounded text-xs text-white', getTaskTypeColor(t)]"
                    >
                      {{ getTaskTypeLabel(t) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 所需物资 - 橙色背景（V1.1 line 307-334） -->
            <div v-if="task.materials && task.materials.length > 0" class="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <h4 class="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
                <el-icon :size="16"><Document /></el-icon>
                所需物资
              </h4>
              <div class="bg-white rounded-lg">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-xs text-amber-600">
                      <th class="text-left pb-2">物资名称</th>
                      <th class="text-right pb-2">数量</th>
                      <th class="text-right pb-2">单位</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(m, i) in task.materials" :key="`mat-${m.name}-${i}`" class="border-t border-gray-100">
                      <td class="py-2 text-gray-900">{{ m.name }}</td>
                      <td class="py-2 text-gray-900 text-right">{{ m.qty }}</td>
                      <td class="py-2 text-gray-500 text-right">{{ m.unit }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 所需工具 - 灰色背景（V1.1 line 337-374） -->
            <div v-if="(task.tools && task.tools.length > 0) || task.toolsRemarks" class="bg-gray-100 rounded-lg p-4 border border-gray-200">
              <h4 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <el-icon :size="16"><Document /></el-icon>
                所需工具
              </h4>
              <div class="bg-white rounded-lg">
                <table v-if="task.tools && task.tools.length > 0" class="w-full text-sm mb-2">
                  <thead>
                    <tr class="text-xs text-gray-500">
                      <th class="text-left pb-2">工具名称</th>
                      <th class="text-right pb-2">数量</th>
                      <th class="text-right pb-2">单位</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(t, i) in task.tools" :key="`tool-${t.name}-${i}`" class="border-t border-gray-100">
                      <td class="py-2 text-gray-900">{{ t.name }}</td>
                      <td class="py-2 text-gray-900 text-right">{{ t.qty }}</td>
                      <td class="py-2 text-gray-500 text-right">{{ t.unit }}</td>
                    </tr>
                  </tbody>
                </table>
                <p v-else class="text-sm text-gray-400 text-center py-2">暂无所需工具</p>
                <div v-if="task.toolsRemarks" class="mt-2 pt-2 border-t border-gray-200">
                  <p class="text-xs text-gray-500">备注：</p>
                  <p class="text-sm text-gray-900">{{ task.toolsRemarks }}</p>
                </div>
              </div>
            </div>

            <!-- 时间信息 - 天蓝色背景（V1.1 line 377-408） -->
            <div class="bg-sky-50 rounded-lg p-4 border border-sky-100">
              <h4 class="text-sm font-bold text-sky-700 mb-3 flex items-center gap-2">
                <el-icon :size="16"><Clock /></el-icon>
                时间信息
              </h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span class="text-xs text-sky-600 block">计划开始</span>
                  <p class="font-semibold text-gray-900">{{ task.planStart || '-' }}</p>
                </div>
                <div>
                  <span class="text-xs text-sky-600 block">计划结束</span>
                  <p class="font-semibold text-gray-900">{{ task.planEnd || '-' }}</p>
                </div>
                <div>
                  <span class="text-xs text-sky-600 block">状态</span>
                  <p>
                    <span :class="['px-2 py-1 rounded-full text-xs font-medium', statusMap[task.status]?.bg || '', statusMap[task.status]?.color || '']">
                      {{ statusMap[task.status]?.label || task.status }}
                    </span>
                  </p>
                </div>
                <div>
                  <span class="text-xs text-sky-600 block">预计时长</span>
                  <p class="font-semibold text-gray-900">
                    <template v-if="task.estimatedDays > 0">{{ task.estimatedDays }}天</template>
                    <template v-if="task.estimatedHours > 0">{{ task.estimatedHours }}小时</template>
                    <template v-if="!task.estimatedDays && !task.estimatedHours">-</template>
                  </p>
                </div>
              </div>
            </div>

            <!-- 实际完成工作量 - 绿色背景（V1.1 line 410-451） -->
            <div v-if="hasActualWorkload" class="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <h4 class="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2">
                <el-icon :size="16"><Document /></el-icon>
                实际完成工作量
              </h4>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <span class="text-xs text-emerald-600 block">实际工日</span>
                  <p class="font-bold text-emerald-700 text-lg">
                    {{ actualWorkload.days > 0 ? `${actualWorkload.days}天` : '-' }}
                  </p>
                </div>
                <div>
                  <span class="text-xs text-emerald-600 block">实际工时</span>
                  <p class="font-bold text-emerald-700 text-lg">
                    {{ actualWorkload.hours > 0 ? `${actualWorkload.hours}小时` : '-' }}
                  </p>
                </div>
                <div>
                  <span class="text-xs text-emerald-600 block">作业人数</span>
                  <p class="font-bold text-emerald-700 text-lg">
                    {{ actualWorkload.workers > 0 ? `${actualWorkload.workers}人` : '-' }}
                  </p>
                </div>
              </div>
              <div v-if="task.estimatedDays !== undefined && task.estimatedHours !== undefined" class="mt-3 pt-3 border-t border-emerald-200">
                <p class="text-xs text-emerald-600">
                  预估总工时：{{ task.estimatedDays * 8 + task.estimatedHours }}小时 → 实际总工时：{{ actualWorkload.days * 8 + actualWorkload.hours }}小时
                  <span
                    v-if="actualWorkload.days * 8 + actualWorkload.hours > 0"
                    :class="['ml-2', actualWorkload.days * 8 + actualWorkload.hours > task.estimatedDays * 8 + task.estimatedHours ? 'text-red-600' : 'text-emerald-600']"
                  >
                    ({{ actualWorkload.days * 8 + actualWorkload.hours > task.estimatedDays * 8 + task.estimatedHours ? '超出' : '节省' }}{{ Math.abs((actualWorkload.days * 8 + actualWorkload.hours) - (task.estimatedDays * 8 + task.estimatedHours)).toFixed(1) }}小时)
                  </span>
                </p>
              </div>
            </div>

            <!-- 必填反馈 - 粉色背景（V1.1 line 453-472） -->
            <div v-if="task.requiredFeedback && task.requiredFeedback.length > 0" class="bg-pink-50 rounded-lg p-4 border border-pink-100">
              <h4 class="text-sm font-bold text-pink-700 mb-3 flex items-center gap-2">
                <el-icon :size="16"><Document /></el-icon>
                必填反馈
              </h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="fb in task.requiredFeedback"
                  :key="fb"
                  class="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs"
                >
                  <template v-if="fb === 'gps'">位置打卡</template>
                  <template v-else-if="fb === 'material'">物资扫码</template>
                  <template v-else-if="fb === 'photo_before'">作业前照片</template>
                  <template v-else-if="fb === 'photo_after'">作业后照片</template>
                  <template v-else-if="fb === 'voice'">语音备注</template>
                  <template v-else>{{ fb }}</template>
                </span>
              </div>
            </div>

            <!-- 执行进度 - 青色背景（V1.1 line 474-489） -->
            <div class="bg-cyan-50 rounded-lg p-4 border border-cyan-100">
              <h4 class="text-sm font-bold text-cyan-700 mb-3 flex items-center gap-2">
                <el-icon :size="16"><Document /></el-icon>
                执行进度
              </h4>
              <div class="flex items-center gap-4">
                <div class="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    :class="[
                      'h-full rounded-full transition-all',
                      task.progress === 100 ? 'bg-emerald-500' : task.progress > 0 ? 'bg-blue-500' : 'bg-gray-300'
                    ]"
                    :style="{ width: `${task.progress || 0}%` }"
                  />
                </div>
                <span class="text-sm font-bold text-cyan-700">{{ task.progress || 0 }}%</span>
              </div>
            </div>

            <!-- 处理流转记录 - 完整时间线（V1.1 line 491-496） -->
            <div v-if="sortedRecords.length > 0" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div class="p-4">
                <TaskProgressTimeline
                  :records="sortedRecords"
                  :show-task-info="false"
                />
              </div>
            </div>

            <!-- 无流转记录提示（V1.1 line 498-503） -->
            <div v-if="sortedRecords.length === 0" class="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">
              暂无处理流转记录
            </div>
          </div>
        </div>

        <!-- 底部操作（V1.1 line 507-520） -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <el-button @click="onClose">
            <el-icon :size="16"><Close /></el-icon>
            关闭
          </el-button>
          <el-button
            v-if="canVerify"
            type="success"
            @click="handleVerify"
          >
            <el-icon :size="16"><CheckCircle /></el-icon>
            验收
          </el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
/**
 * 任务详情弹窗（只读视图，仅供查看）
 * 对应 V1.1 src/components/farm/hub/TaskDetailModal.tsx 1:1 映射
 *
 * V1.1 props: { taskId, onClose, onVerify, tasks, getTaskRecordsByTaskId }
 * V2.0 props: { isOpen, task, onClose, records } - 由 FarmHub.vue 适配传入
 * （FarmHub 已在父组件调用 taskStore.fetchTaskRecords 加载 records）
 */
import { computed } from 'vue'
import {
  Document, Clock, Download, Close, Check as CheckCircle
} from '@element-plus/icons-vue'
import TaskProgressTimeline from './TaskProgressTimeline.vue'
import { TASK_STATUS_CONFIG } from '@/config/taskConfig'

// 状态映射（V1.1 STATUS_MAP，对应 TASK_STATUS_CONFIG）
const statusMap = TASK_STATUS_CONFIG

// 优先级映射（V1.1 PRIORITY_MAP）
const priorityMap = {
  urgent: { label: '紧急', color: 'text-red-600' },
  high: { label: '高', color: 'text-orange-600' },
  normal: { label: '普通', color: 'text-blue-600' },
  low: { label: '低', color: 'text-gray-500' },
}

// 任务类型映射（V1.1 TASK_TYPES）
const taskTypes = [
  { value: 'fertilization', label: '施肥', color: 'bg-green-500' },
  { value: 'irrigation', label: '灌溉', color: 'bg-blue-500' },
  { value: 'pruning', label: '修剪', color: 'bg-purple-500' },
  { value: 'pesticide', label: '植保', color: 'bg-red-500' },
  { value: 'rootIrrigation', label: '灌根', color: 'bg-cyan-500' },
  { value: 'planting', label: '定植', color: 'bg-emerald-500' },
  { value: 'harvest', label: '采收', color: 'bg-amber-500' },
  { value: 'weeding', label: '除草', color: 'bg-green-600' },
  { value: 'other', label: '其他', color: 'bg-gray-500' },
]

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  task: { type: Object, default: null },
  /** 执行反馈记录列表（FarmHub 通过 taskStore.fetchTaskRecords 加载） */
  records: { type: Array, default: () => [] },
  /** V1.1 props 兼容（保留以便外部使用） */
  taskId: { type: String, default: '' },
  onClose: { type: Function, default: () => {} },
})

const emit = defineEmits(['verify'])

/** 计算实际完成工作量（V1.1 line 106-118） */
const actualWorkload = computed(() => {
  let totalDays = 0
  let totalHours = 0
  let totalWorkers = 0
  const recordsList = props.records || []
  recordsList.forEach(record => {
    if (record.feedback) {
      if (record.feedback.workloadDays) totalDays += record.feedback.workloadDays
      if (record.feedback.workloadHours) totalHours += record.feedback.workloadHours
      if (record.feedback.workers && record.feedback.workers > totalWorkers) totalWorkers = record.feedback.workers
    }
  })
  return { days: totalDays, hours: totalHours, workers: totalWorkers }
})

const hasActualWorkload = computed(() => actualWorkload.value.days > 0 || actualWorkload.value.hours > 0)

/** 判断是否可以验收（V1.1 line 135） */
const canVerify = computed(() => props.task?.status === 'waiting_acceptance')

/** 按时间倒序排序记录（V1.1 line 138-140） */
const sortedRecords = computed(() => {
  return [...(props.records || [])].sort(
    (a, b) => new Date(b.actionTime).getTime() - new Date(a.actionTime).getTime()
  )
})

/** 获取来源类型标签（V1.1 line 273） */
function getSourceTypeLabel(task) {
  if (!task) return '-'
  if (task.type === 'seedling') return '育苗任务'
  if (task.sourceType === 'dispatch') return '任务派工'
  if (task.sourceType === 'tempTask') return '临时任务'
  if (task.sourceType === 'inspection') return '巡查任务'
  return task.sourceType || '-'
}

function getTaskTypeLabel(typeValue) {
  const found = taskTypes.find(t => t.value === typeValue)
  return found?.label || typeValue
}

function getTaskTypeColor(typeValue) {
  const found = taskTypes.find(t => t.value === typeValue)
  return found?.color || 'bg-gray-500'
}

/** SOP文件下载（V1.1 line 167-184） */
function downloadSop() {
  if (!props.task?.sopContent) return
  const blob = new Blob([props.task.sopContent || ''], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `任务SOP_${props.task.id}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

/** 触发验收事件（V1.1 line 515） */
function handleVerify() {
  if (!props.task) return
  emit('verify', props.task.id)
}
</script>

<style scoped>
/* 头部样式由模板内联控制：bg-gradient-to-r from-emerald-600 to-emerald-500 */
</style>
