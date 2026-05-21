<template>
  <el-dialog
    :model-value="isOpen"
    :title="`${record?.staffName || ''} - ${record?.month || ''}月绩效考核`"
    width="600px"
    @close="onClose"
  >
    <div v-if="record">
      <!-- 基本信息 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-gray-50 rounded-lg p-3">
          <p class="text-xs text-gray-500 mb-1">工号</p>
          <p class="text-sm font-medium text-gray-900">{{ record.staffId }}</p>
        </div>
        <div class="bg-gray-50 rounded-lg p-3">
          <p class="text-xs text-gray-500 mb-1">姓名</p>
          <p class="text-sm font-medium text-gray-900">{{ record.staffName }}</p>
        </div>
        <div class="bg-gray-50 rounded-lg p-3">
          <p class="text-xs text-gray-500 mb-1">部门</p>
          <p class="text-sm font-medium text-gray-900">{{ record.department }}</p>
        </div>
        <div class="bg-gray-50 rounded-lg p-3">
          <p class="text-xs text-gray-500 mb-1">月份</p>
          <p class="text-sm font-medium text-gray-900">{{ record.month }}</p>
        </div>
      </div>

      <!-- 综合得分 -->
      <div class="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-6 mb-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-emerald-100 mb-1">综合得分</p>
            <p class="text-4xl font-bold">{{ record.totalScore }}</p>
          </div>
          <div v-if="record.rank" class="text-right">
            <p class="text-sm text-emerald-100 mb-1">排名</p>
            <p class="text-2xl font-bold">第{{ record.rank }}名</p>
          </div>
        </div>
      </div>

      <!-- 各项维度得分 -->
      <div class="mb-6">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">各项维度得分</h3>
        <div class="space-y-4">
          <div v-for="dim in dimensions" :key="dim.key">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-700">{{ dim.name }}</span>
                <span class="text-xs text-gray-400">权重: {{ dim.weight }}%</span>
              </div>
              <span :class="['text-sm font-semibold', getScoreColor(dim.score).text]">
                {{ dim.score }}分
              </span>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                :class="['h-full rounded-full transition-all', getScoreColor(dim.score).bar]"
                :style="{ width: `${dim.score}%` }"
              />
            </div>
            <p class="text-xs text-gray-400 mt-1">
              {{ dim.description }} | 加权得分: {{ dim.weightedScore.toFixed(1) }}
            </p>
          </div>
        </div>
      </div>

      <!-- 权重说明 -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-700 mb-2">考核权重说明</h4>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div v-for="dim in performanceDimensions" :key="dim.key" class="text-xs">
            <span class="text-gray-500">{{ dim.name }}:</span>
            <span class="font-medium text-gray-700 ml-1">{{ dim.weight }}%</span>
          </div>
        </div>
        <div class="mt-2 pt-2 border-t border-gray-200">
          <span class="text-xs text-gray-500">加权总分: </span>
          <span class="text-xs font-medium text-emerald-600">{{ totalWeightedScore.toFixed(1) }}</span>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="onClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

// 考核维度配置
const performanceDimensions = [
  { key: 'workQuality', name: '工作质量', weight, description: '工作成果的质量和准确性' },
  { key: 'workEfficiency', name: '工作效率', weight, description: '任务完成的速度和效率' },
  { key: 'teamwork', name: '团队协作', weight, description: '与同事的配合程度' },
  { key: 'attendance', name: '出勤情况', weight, description: '考勤记录的准时性' },
  { key: 'safety', name: '安全生产', weight, description: '安全规范执行情况' },
  { key: 'learning', name: '学习成长', weight, description: '技能提升和学习态度' },
]

const props = defineProps({})

// 计算维度得分
const dimensions = computed(() => {
  if (!props.record) return []
  return performanceDimensions.map(dim => ({
    ...dim,
    score: (props.record)[dim.key] || 0,
    weightedScore: ((props.record)[dim.key] || 0) * dim.weight / 100,
  }))
})

// 总加权得分
const totalWeightedScore = computed(() => {
  return dimensions.value.reduce((sum, d) => sum + d.weightedScore, 0)
})

// 得分颜色
const getScoreColor = (score) => {
  if (score >= 90) return { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' }
  if (score >= 80) return { bg: 'bg-emerald-100', text: 'text-emerald-700', bar: 'bg-emerald-500' }
  if (score >= 70) return { bg: 'bg-amber-100', text: 'text-amber-700', bar: 'bg-amber-500' }
  return { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' }
}
</script>
