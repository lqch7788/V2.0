<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <!-- 头部 -->
    <div
      class="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
      @click="showDetails = !showDetails"
    >
      <div class="flex items-center gap-3">
        <span v-if="workerName" class="font-medium text-gray-900">{{ workerName }}</span>
        <div :class="['flex items-center gap-1 px-2 py-0.5 rounded', level.bg]">
          <el-icon v-if="rate >= 70" :size="16" :class="level.color"><CircleCheckFilled /></el-icon>
          <el-icon v-else-if="rate >= 50" :size="16" :class="level.color"><WarnTriangleFilled /></el-icon>
          <el-icon v-else :size="16" :class="level.color"><CircleCloseFilled /></el-icon>
          <span :class="['text-sm font-medium', level.color]">{{ level.text }}</span>
        </div>
        <span v-if="matchRate !== undefined" class="text-2xl font-bold text-gray-900">{{ matchRate }}%</span>
      </div>
      <el-icon :class="['transition-transform', showDetails ? 'rotate-180' : '']"><Top /></el-icon>
    </div>

    <!-- 详情 -->
    <div v-if="showDetails" class="p-3 border-t border-gray-200">
      <!-- 匹配技能 -->
      <div v-if="matchedSkills.length > 0" class="mb-3">
        <div class="text-xs text-gray-500 mb-1.5">已匹配技能</div>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="skill in matchedSkills"
            :key="skill"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-emerald-50 text-emerald-700 border border-emerald-200"
          >
            <el-icon :size="12"><CircleCheckFilled /></el-icon>
            {{ skill }}
          </span>
        </div>
      </div>

      <!-- 缺失技能 -->
      <div v-if="missingSkills.length > 0">
        <div class="text-xs text-gray-500 mb-1.5">缺失技能</div>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="skill in missingSkills"
            :key="skill"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-red-50 text-red-700 border border-red-200"
          >
            <el-icon :size="12"><CircleCloseFilled /></el-icon>
            {{ skill }}
          </span>
        </div>
      </div>

      <!-- 员工所有技能 -->
      <div class="mt-3 pt-3 border-t border-gray-100">
        <div class="text-xs text-gray-500 mb-1.5">员工持有技能</div>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="skill in workerSkills"
            :key="skill"
            class="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
          >
            {{ skill }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { CircleCheckFilled, WarnTriangleFilled, CircleCloseFilled, Top } from '@element-plus/icons-vue'

const props = defineProps({
  workerName: String,
  workerSkills: Array,
  requiredSkills: Array,
  matchRate: Number
})

const showDetails = ref(false)

const matchedSkills = computed(() => {
  return props.requiredSkills.filter((skill) => props.workerSkills.includes(skill))
})

const missingSkills = computed(() => {
  return props.requiredSkills.filter((skill) => !props.workerSkills.includes(skill))
})

const rate = computed(() => {
  return props.requiredSkills.length > 0
    ? Math.round((matchedSkills.value.length / props.requiredSkills.length) * 100)
    : 100
})

const level = computed(() => {
  if (rate.value >= 90) return { text: '完全匹配', color: 'text-emerald-600', bg: 'bg-emerald-50' }
  if (rate.value >= 70) return { text: '高度匹配', color: 'text-blue-600', bg: 'bg-blue-50' }
  if (rate.value >= 50) return { text: '部分匹配', color: 'text-amber-600', bg: 'bg-amber-50' }
  return { text: '匹配度低', color: 'text-red-600', bg: 'bg-red-50' }
})
</script>
