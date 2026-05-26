<template>
  <!-- 任务类型配置只读显示 - 从V1.1 TaskTypeConfigDisplay.tsx 1:1迁移 -->
  <div v-if="!config" class="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">
    未找到任务类型配置
  </div>

  <div v-else-if="visibleFields.length === 0" class="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">
    暂无详细配置信息
  </div>

  <div v-else class="bg-gray-50 rounded-lg p-4 space-y-4">
    <!-- 标题 -->
    <div class="flex items-center gap-2 border-b border-gray-200 pb-3">
      <span class="w-6 h-6 rounded flex items-center justify-center text-white text-xs" :class="config.color">
        {{ config.label.charAt(0) }}
      </span>
      <h4 class="font-semibold text-gray-900">{{ config.label }} - 详细配置</h4>
    </div>

    <!-- 普通配置项 -->
    <div v-if="normalFields.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="field in normalFields" :key="field.key" class="space-y-1">
        <span class="text-xs text-gray-500 flex items-center gap-1">
          {{ field.label }}
          <span v-if="field.unit && field.type !== 'number'" class="text-gray-400">({{ field.unit }})</span>
        </span>
        <div class="text-sm">
          <!-- 下拉选择 -->
          <span v-if="field.type === 'select' && field.options" class="text-gray-900">
            {{ getOptionLabel(field.options, String(configValues[field.key])) }}
          </span>
          <!-- 多选 -->
          <div v-else-if="field.type === 'multiSelect' && field.options && Array.isArray(configValues[field.key])"
            class="flex flex-wrap gap-1">
            <span v-for="(v, idx) in configValues[field.key]" :key="idx"
              class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
              {{ getOptionLabel(field.options, v) }}
            </span>
          </div>
          <!-- 多行文本 -->
          <div v-else-if="field.type === 'textarea'"
            class="text-gray-700 bg-white rounded p-2 border border-gray-200 whitespace-pre-wrap">
            {{ String(configValues[field.key]) }}
          </div>
          <!-- 数字 -->
          <span v-else-if="field.type === 'number'" class="text-gray-900">
            {{ configValues[field.key] }}
            <span v-if="field.unit" class="text-gray-400 text-xs ml-1">{{ field.unit }}</span>
          </span>
          <!-- 默认 -->
          <span v-else class="text-gray-900">{{ configValues[field.key] !== undefined ? String(configValues[field.key]) : '-' }}</span>
        </div>
      </div>
    </div>

    <!-- 多条目配置 -->
    <div v-if="multiEntryFields.length > 0" class="space-y-4">
      <div v-for="field in multiEntryFields" :key="field.key" class="space-y-2">
        <span class="text-xs text-gray-500">{{ field.label }}</span>
        <div v-if="!configValues[field.key] || !Array.isArray(configValues[field.key]) || configValues[field.key].length === 0"
          class="text-gray-400 text-sm">-</div>
        <div v-else class="space-y-3">
          <div v-for="(entry, idx) in configValues[field.key]" :key="idx"
            class="bg-white rounded-lg p-3 border border-gray-200">
            <div class="text-xs text-gray-400 mb-2 font-medium">
              {{ field.multiEntryDef?.entryLabel || '条目' }} {{ idx + 1 }}
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div v-for="f in (field.multiEntryDef?.fields || [])" :key="f.key" class="flex flex-col">
                <span class="text-xs text-gray-500">{{ f.label }}</span>
                <span class="text-sm text-gray-900">
                  {{ getEntryDisplayValue(f, entry) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  taskType: { type: String, required: true },
  configValues: { type: Object, default: () => ({}) },
})

const config = computed(() => {
  // 从constants获取任务类型配置
  const configs = {
    fertilization: {
      label: '施肥', color: 'bg-emerald-500',
      configFields: [
        { key: 'fertilizerType', label: '肥料类型', type: 'select', options: [
          { value: 'organic', label: '有机肥' }, { value: 'chemical', label: '化肥' },
          { value: 'compound', label: '复合肥' }, { value: 'other', label: '其他' }
        ]},
        { key: 'dosage', label: '用量', type: 'number', unit: 'kg/亩' },
        { key: 'method', label: '施肥方式', type: 'select', options: [
          { value: 'broadcasting', label: '撒施' }, { value: 'drip', label: '滴灌施' },
          { value: 'foliar', label: '叶面喷施' }, { value: 'other', label: '其他' }
        ]},
        { key: 'remarks', label: '备注', type: 'textarea' },
      ]
    },
    irrigation: {
      label: '灌溉', color: 'bg-blue-500',
      configFields: [
        { key: 'waterSource', label: '水源类型', type: 'select', options: [
          { value: 'well', label: '井水' }, { value: 'river', label: '河水' },
          { value: 'reservoir', label: '水库' }, { value: 'other', label: '其他' }
        ]},
        { key: 'waterAmount', label: '灌溉量', type: 'number', unit: '吨/亩' },
      ]
    },
    spraying: {
      label: '农药喷洒', color: 'bg-indigo-500',
      configFields: [
        { key: 'pesticideName', label: '农药名称', type: 'text' },
        { key: 'pesticideType', label: '农药类型', type: 'select', options: [
          { value: 'insecticide', label: '杀虫剂' }, { value: 'fungicide', label: '杀菌剂' },
          { value: 'herbicide', label: '除草剂' }, { value: 'other', label: '其他' }
        ]},
        { key: 'dosage', label: '用量', type: 'number', unit: 'ml/亩' },
        { key: 'concentration', label: '稀释倍数', type: 'number', unit: '倍' },
      ]
    },
    harvest: {
      label: '采收', color: 'bg-amber-500',
      configFields: [
        { key: 'harvestMethod', label: '采收方式', type: 'select', options: [
          { value: 'manual', label: '人工' }, { value: 'mechanical', label: '机械' },
        ]},
        { key: 'estimatedYield', label: '预估产量', type: 'number', unit: 'kg' },
      ]
    },
    weeding: {
      label: '除草', color: 'bg-red-500',
      configFields: [
        { key: 'weedType', label: '杂草类型', type: 'text' },
        { key: 'method', label: '除草方式', type: 'select', options: [
          { value: 'manual', label: '人工除草' }, { value: 'herbicide', label: '化学除草' },
        ]},
      ]
    },
  }
  return configs[props.taskType] || null
})

const visibleFields = computed(() => {
  if (!config.value) return []
  return config.value.configFields.filter(field => {
    const value = props.configValues[field.key]
    return value !== undefined && value !== '' && value !== null
  })
})

const normalFields = computed(() => visibleFields.value.filter(f => f.type !== 'multiEntry'))
const multiEntryFields = computed(() => visibleFields.value.filter(f => f.type === 'multiEntry'))

const getOptionLabel = (options, value) => {
  const opt = options?.find(o => o.value === value)
  return opt?.label || value
}

const getEntryDisplayValue = (fieldDef, entry) => {
  const val = entry[fieldDef.key]
  if (!val) return '-'
  if (fieldDef.options) return getOptionLabel(fieldDef.options, String(val))
  const display = String(val)
  if (fieldDef.unit) return `${display} ${fieldDef.unit}`
  return display
}
</script>
