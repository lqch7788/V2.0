<template>
  <!-- 任务类型配置只读显示组件 -->
  <div class="bg-gray-50 rounded-lg p-4 space-y-4">
    <!-- 未找到配置 -->
    <div v-if="!config" class="text-center text-gray-500 text-sm">
      未找到任务类型配置
    </div>

    <!-- 无可见字段 -->
    <div v-else-if="visibleFields.length === 0" class="text-center text-gray-500 text-sm">
      暂无详细配置信息
    </div>

    <template v-else>
      <!-- 任务类型标题 -->
      <div class="flex items-center gap-2 border-b border-gray-200 pb-3">
        <span :class="`w-6 h-6 rounded flex items-center justify-center text-white text-xs ${config.color}`">
          {{ config.label.charAt(0) }}
        </span>
        <h4 class="font-semibold text-gray-900">{{ config.label }} - 详细配置</h4>
      </div>

      <!-- 普通配置项（网格布局） -->
      <div v-if="normalFields.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="field in normalFields" :key="field.key" class="space-y-1">
          <label class="text-xs text-gray-500 flex items-center gap-1">
            {{ field.label }}
            <span v-if="field.unit && field.type !== 'number'" class="text-gray-400">({{ field.unit }})</span>
          </label>
          <div class="text-sm">
            <!-- 下拉选择：显示中文标签 -->
            <span v-if="field.type === 'select' && field.options" class="text-gray-900">
              {{ getOptionLabelFromField(field, String(configValues[field.key])) }}
            </span>
            <!-- 多选：显示蓝色标签 -->
            <div v-else-if="field.type === 'multiSelect' && field.options && Array.isArray(configValues[field.key])" class="flex flex-wrap gap-1">
              <span
                v-for="(v, idx) in configValues[field.key]"
                :key="idx"
                class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
              >
                {{ getOptionLabelFromField(field, v) }}
              </span>
            </div>
            <!-- 多行文本 -->
            <div v-else-if="field.type === 'textarea'" class="text-gray-700 bg-white rounded p-2 border border-gray-200 whitespace-pre-wrap">
              {{ String(configValues[field.key]) }}
            </div>
            <!-- 数字类型：带单位 -->
            <span v-else-if="field.type === 'number'" class="text-gray-900">
              {{ configValues[field.key] }}
              <span v-if="field.unit" class="text-gray-400 text-xs ml-1">{{ field.unit }}</span>
            </span>
            <!-- 空值 -->
            <span v-else-if="isEmptyValue(configValues[field.key])" class="text-gray-400">-</span>
            <!-- 默认 -->
            <span v-else class="text-gray-900">{{ String(configValues[field.key]) }}</span>
          </div>
        </div>
      </div>

      <!-- 多条目配置（混合配比，全宽显示） -->
      <div v-if="multiEntryFields.length > 0" class="space-y-4">
        <div v-for="field in multiEntryFields" :key="field.key" class="space-y-2">
          <label class="text-xs text-gray-500">{{ field.label }}</label>

          <!-- 无数据 -->
          <span v-if="isEmptyValue(configValues[field.key])" class="text-gray-400">-</span>

          <!-- 多条目列表 -->
          <div v-else class="space-y-3">
            <div
              v-for="(entry, idx) in getMultiEntryArray(configValues[field.key])"
              :key="idx"
              class="bg-white rounded-lg p-3 border border-gray-200"
            >
              <div class="text-xs text-gray-400 mb-2 font-medium">
                {{ field.multiEntryDef?.entryLabel || '条目' }} {{ idx + 1 }}
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <template v-if="field.multiEntryDef">
                  <div
                    v-for="f in (field.multiEntryDef.fields || [])"
                    :key="f.key"
                    class="flex flex-col"
                  >
                    <span class="text-xs text-gray-500">{{ f.label }}</span>
                    <span class="text-sm text-gray-900">
                      <template v-if="!isEmptyValue(entry[f.key])">
                        <template v-if="f.options">{{ getOptionLabelFromFieldDef(f, String(entry[f.key])) }}</template>
                        <template v-else>{{ entry[f.key] }}</template>
                        <span v-if="f.unit" class="text-gray-400 text-xs ml-1">{{ f.unit }}</span>
                      </template>
                      <template v-else>-</template>
                    </span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
/**
 * 任务类型配置只读显示组件
 * 在详情弹窗中展示任务类型配置内容的只读视图
 * 对应 V1.1 TaskTypeConfigDisplay.tsx 1:1 映射
 */
import { computed } from 'vue'
import { getTaskTypeConfig } from '@/types/farm/taskTypeConfig'

const props = defineProps({
  /** 任务类型（如 'fertilization'） */
  taskType: { type: String, required: true },
  /** 配置值 */
  configValues: { type: Object, default: () => ({}) },
})

/** 任务类型配置 */
const config = computed(() => getTaskTypeConfig(props.taskType))

/** 有值的可见字段 */
const visibleFields = computed(() => {
  if (!config.value) return []
  return config.value.configFields.filter(field => {
    const value = props.configValues[field.key]
    return value !== undefined && value !== '' && value !== null
  })
})

/** 普通字段（非 multiEntry） */
const normalFields = computed(() => visibleFields.value.filter(f => f.type !== 'multiEntry'))

/** 多条目字段 */
const multiEntryFields = computed(() => visibleFields.value.filter(f => f.type === 'multiEntry'))

/** 判断是否为空值 */
const isEmptyValue = (val) => {
  return val === undefined || val === null || val === ''
}

/** 从字段定义中获取选项标签 */
const getOptionLabelFromField = (field, value) => {
  if (!field.options) return value
  const option = field.options.find(o => o.value === value)
  return option?.label || value
}

/** 从字段定义子项中获取选项标签 */
const getOptionLabelFromFieldDef = (fieldDef, value) => {
  if (!fieldDef.options) return value
  const option = fieldDef.options.find(o => o.value === value)
  return option?.label || value
}

/** 将多条目值转为数组 */
const getMultiEntryArray = (value) => {
  if (Array.isArray(value)) return value
  return []
}
</script>
