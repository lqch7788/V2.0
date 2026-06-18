<!--
  TaskCard.vue - 智能派工任务卡片
  V1.1 SmartDispatch.tsx TaskCard 1:1 对齐
-->
<template>
  <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
    <!-- 头部：任务编号 + 来源 -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <span class="text-sm font-semibold text-blue-600">{{ task.taskCode }}</span>
        <span class="px-2 py-0.5 text-xs rounded" :class="sourceColorClass">
          {{ sourceLabel }}
        </span>
      </div>
      <span class="px-2 py-0.5 text-xs rounded font-medium" :class="priorityClass">
        {{ priorityLabel }}
      </span>
    </div>

    <!-- 标题 -->
    <h3 class="text-sm font-medium text-gray-900 mb-2 line-clamp-2">{{ task.title }}</h3>

    <!-- 信息：类型/位置 -->
    <div class="space-y-1 text-xs text-gray-600 mb-3">
      <div class="flex items-center gap-1">
        <el-icon><Location /></el-icon>
        <span>{{ task.typeName }} · {{ task.workZone || '未指定' }}</span>
      </div>
      <div v-if="task.estimatedHours" class="flex items-center gap-1">
        <el-icon><Timer /></el-icon>
        <span>预计 {{ task.estimatedHours }} 小时</span>
      </div>
    </div>

    <!-- AI 推荐信息（V1.1 完整结构） -->
    <div v-if="recommendation" class="bg-emerald-50 rounded p-2 mb-3 text-xs">
      <div class="font-medium text-emerald-700 mb-1">AI 推荐：{{ recommendation.worker?.name || '智能匹配' }}</div>
      <div class="flex items-center gap-2 text-emerald-600">
        <span>匹配度 {{ recommendation.matchScore }}%</span>
        <span>·</span>
        <span>置信度 {{ recommendation.confidenceLevel }}</span>
      </div>
    </div>

    <!-- 优化建议 -->
    <div v-if="recommendation?.reasons?.length" class="mb-3">
      <div class="text-xs text-gray-500 mb-1">推荐理由：</div>
      <ul class="text-xs text-gray-700 space-y-0.5">
        <li v-for="(r, i) in recommendation.reasons.slice(0, 2)" :key="i">· {{ r }}</li>
      </ul>
    </div>

    <!-- 操作按钮 -->
    <div class="flex items-center gap-2">
      <el-button size="small" type="success" @click="$emit('accept', task)">
        <el-icon><Check /></el-icon>接受
      </el-button>
      <el-button size="small" @click="$emit('replace', task)">更换</el-button>
      <el-button size="small" @click="$emit('delay', task)">延后</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Location, Timer, Check } from '@element-plus/icons-vue'

const props = defineProps({
  task: { type: Object, required: true },
  recommendation: { type: Object, default: null },
})

defineEmits(['accept', 'replace', 'delay', 'ignore'])

const sourceColors = {
  farm: 'bg-blue-100 text-blue-700',
  tempTask: 'bg-amber-100 text-amber-700',
  inspection: 'bg-purple-100 text-purple-700',
}
const sourceLabels = {
  farm: '农事任务',
  tempTask: '临时任务',
  inspection: '巡查问题',
}
const priorityClasses = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-amber-100 text-amber-700',
  normal: 'bg-blue-100 text-blue-700',
  low: 'bg-gray-100 text-gray-700',
}
const priorityLabels = {
  urgent: '紧急',
  high: '高',
  normal: '一般',
  low: '低',
}

const sourceColorClass = computed(() => sourceColors[props.task.source] || sourceColors.farm)
const sourceLabel = computed(() => sourceLabels[props.task.source] || sourceLabels.farm)
const priorityClass = computed(() => priorityClasses[props.task.priority] || priorityClasses.normal)
const priorityLabel = computed(() => priorityLabels[props.task.priority] || priorityLabels.normal)
</script>
