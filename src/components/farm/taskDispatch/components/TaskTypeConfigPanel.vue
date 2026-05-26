<template>
  <!-- 任务类型配置面板 - 从V1.1 TaskTypeConfigPanel.tsx 1:1迁移 -->
  <!-- 未选择任务类型 -->
  <div v-if="taskTypes.length === 0" class="bg-gray-50 rounded-lg p-6 text-center">
    <p class="text-gray-500 text-sm">请先选择任务类型</p>
  </div>

  <!-- 多选任务类型 -->
  <div v-else-if="taskTypes.length > 1" class="bg-gray-50 rounded-lg p-6 text-center">
    <p class="text-gray-500 text-sm">
      已选择 <span class="font-semibold">{{ taskTypes.length }}</span> 个任务类型
    </p>
    <p class="text-base font-semibold text-blue-600 mt-2">
      请在作业标准SOP中详细描述任务类型的具体操作方式
    </p>
  </div>

  <!-- 未找到配置 -->
  <div v-else-if="!config" class="bg-red-50 rounded-lg p-4 flex items-center gap-2 text-red-600">
    <el-icon :size="16"><Warning /></el-icon>
    <span class="text-sm">未找到任务类型配置</span>
  </div>

  <!-- 无需配置 -->
  <div v-else-if="visibleFields.length === 0" class="bg-gray-50 rounded-lg p-6 text-center">
    <p class="text-gray-500 text-sm">该任务类型无需额外配置</p>
  </div>

  <!-- 配置面板 -->
  <div v-else class="bg-gray-50 rounded-lg p-4 space-y-4">
    <h4 class="font-medium text-gray-800 flex items-center gap-2">
      <span class="w-3 h-3 rounded-full" :class="config.color" />
      {{ config.label }} - 详细配置
    </h4>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="field in visibleFields" :key="field.key"
        :class="{ 'md:col-span-2': field.type === 'textarea' || field.type === 'multiSelect' }">
        <ConfigFieldRenderer
          :field="field"
          :value="configValues[field.key]"
          :error="field.key === 'remarks' && hasOtherSelected ? remarksError : errors[field.key]"
          @update="(key, value) => $emit('configChange', key, value)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Warning } from '@element-plus/icons-vue'
import ConfigFieldRenderer from './ConfigFieldRenderer.vue'

const props = defineProps({
  taskTypes: { type: Array, default: () => [] },
  configValues: { type: Object, default: () => ({}) },
  errors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['configChange'])

const taskTypeConfigs = {
  fertilization: {
    label: '施肥', color: 'bg-emerald-500',
    configFields: [
      { key: 'fertilizerType', label: '肥料类型', required: true, type: 'select', options: [
        { value: 'organic', label: '有机肥' }, { value: 'chemical', label: '化肥' },
        { value: 'compound', label: '复合肥' }, { value: 'other', label: '其他' },
      ]},
      { key: 'dosage', label: '用量', required: true, type: 'number', unit: 'kg/亩', min: 0 },
      { key: 'method', label: '施肥方式', type: 'select', options: [
        { value: 'broadcasting', label: '撒施' }, { value: 'drip', label: '滴灌施' },
        { value: 'foliar', label: '叶面喷施' }, { value: 'other', label: '其他' },
      ]},
      { key: 'fertilizerName', label: '肥料名称', type: 'text', placeholder: '请输入肥料名称', dependsOn: ['fertilizerType:other'] },
    ],
  },
  irrigation: {
    label: '灌溉', color: 'bg-blue-500',
    configFields: [
      { key: 'waterSource', label: '水源类型', required: true, type: 'select', options: [
        { value: 'well', label: '井水' }, { value: 'river', label: '河水' },
        { value: 'reservoir', label: '水库' }, { value: 'other', label: '其他' },
      ]},
      { key: 'waterAmount', label: '灌溉量', required: true, type: 'number', unit: '吨/亩', min: 0 },
      { key: 'irrigationMethod', label: '灌溉方式', type: 'select', options: [
        { value: 'drip', label: '滴灌' }, { value: 'sprinkler', label: '喷灌' },
        { value: 'flood', label: '漫灌' }, { value: 'other', label: '其他' },
      ]},
    ],
  },
  spraying: {
    label: '农药喷洒', color: 'bg-indigo-500',
    configFields: [
      { key: 'pesticideName', label: '农药名称', required: true, type: 'text', placeholder: '请输入农药名称' },
      { key: 'pesticideType', label: '农药类型', required: true, type: 'select', options: [
        { value: 'insecticide', label: '杀虫剂' }, { value: 'fungicide', label: '杀菌剂' },
        { value: 'herbicide', label: '除草剂' }, { value: 'other', label: '其他' },
      ]},
      { key: 'dosage', label: '用量', required: true, type: 'number', unit: 'ml/亩', min: 0 },
      { key: 'concentration', label: '稀释倍数', type: 'number', unit: '倍', min: 1 },
    ],
  },
  harvest: {
    label: '采收', color: 'bg-amber-500',
    configFields: [
      { key: 'harvestMethod', label: '采收方式', type: 'select', options: [
        { value: 'manual', label: '人工' }, { value: 'mechanical', label: '机械' },
      ]},
      { key: 'estimatedYield', label: '预估产量', type: 'number', unit: 'kg', min: 0 },
    ],
  },
  weeding: {
    label: '除草', color: 'bg-red-500',
    configFields: [
      { key: 'weedType', label: '杂草类型', type: 'text', placeholder: '请输入杂草类型' },
      { key: 'method', label: '除草方式', type: 'select', options: [
        { value: 'manual', label: '人工除草' }, { value: 'herbicide', label: '化学除草' },
      ]},
    ],
  },
  sowing: {
    label: '播种', color: 'bg-purple-500',
    configFields: [
      { key: 'seedVariety', label: '种子品种', required: true, type: 'text' },
      { key: 'sowingMethod', label: '播种方式', type: 'select', options: [
        { value: 'direct', label: '直播' }, { value: 'transplant', label: '移栽' },
        { value: 'drill', label: '条播' }, { value: 'other', label: '其他' },
      ]},
      { key: 'seedDensity', label: '播种密度', type: 'number', unit: '株/亩' },
    ],
  },
  pruning: {
    label: '修剪', color: 'bg-teal-500',
    configFields: [
      { key: 'pruningType', label: '修剪类型', type: 'select', options: [
        { value: 'shaping', label: '整形修剪' }, { value: 'thinning', label: '疏枝修剪' },
        { value: 'renewal', label: '更新修剪' }, { value: 'other', label: '其他' },
      ]},
    ],
  },
}

const taskConfigMap = taskTypeConfigs

const config = computed(() => taskConfigMap[props.taskTypes[0]] || null)

const visibleFields = computed(() => {
  if (!config.value) return []
  return config.value.configFields.filter(field => {
    if (!field.dependsOn || field.dependsOn.length === 0) return true
    return field.dependsOn.some(dep => {
      if (dep.includes(':')) {
        const [depKey, depValue] = dep.split(':')
        return props.configValues[depKey] === depValue
      }
      const depValue = props.configValues[dep]
      return depValue !== undefined && depValue !== '' && depValue !== 'none'
    })
  })
})

const hasOtherSelected = computed(() => {
  return Object.values(props.configValues || {}).some(
    v => v === 'other' || (Array.isArray(v) && v.includes('other'))
  )
})

const remarksError = computed(() => hasOtherSelected.value ? '选择"其他"时必填' : undefined)
</script>
