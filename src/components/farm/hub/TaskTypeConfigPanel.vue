<template>
  <!-- 任务类型配置面板 - 根据选中任务类型显示配置项 -->
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
    <el-icon :size="16"><WarningFilled /></el-icon>
    <span class="text-sm">未找到任务类型配置</span>
  </div>

  <!-- 无需配置 -->
  <div v-else-if="visibleFields.length === 0" class="bg-gray-50 rounded-lg p-6 text-center">
    <p class="text-gray-500 text-sm">该任务类型无需额外配置</p>
  </div>

  <!-- 配置面板 -->
  <div v-else class="bg-gray-50 rounded-lg p-4 space-y-4">
    <!-- 配置面板标题 -->
    <h4 class="font-medium text-gray-800 flex items-center gap-2">
      <span :class="`w-3 h-3 rounded-full ${config.color}`" />
      {{ config.label }} - 详细配置
    </h4>

    <!-- 配置字段网格 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="field in visibleFields"
        :key="field.key"
        :class="field.type === 'textarea' || field.type === 'multiSelect' ? 'md:col-span-2' : ''"
      >
        <ConfigFieldRenderer
          :field="field"
          :value="configValues?.[field.key]"
          :on-change="onConfigChange"
          :error="getFieldError(field)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 任务类型配置面板
 * 根据选中的任务类型显示对应的配置项编辑器
 * 对应 V1.1 TaskTypeConfigPanel.tsx 1:1 映射
 */
import { computed } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'
import { useTaskTypeConfig } from '@/composables/useTaskTypeConfig'
import ConfigFieldRenderer from './ConfigFieldRenderer.vue'

const props = defineProps({
  /** 当前选中的任务类型列表 */
  taskTypes: { type: Array, default: () => [] },
  /** 当前配置值 */
  configValues: { type: Object, default: () => ({}) },
  /** 配置变化回调 */
  onConfigChange: { type: Function, default: () => {} },
  /** 验证错误 */
  errors: { type: Object, default: () => ({}) },
})

const { getConfig, getVisibleFields } = useTaskTypeConfig()

/** 当前任务类型对应的配置 */
const config = computed(() => {
  if (props.taskTypes.length !== 1) return null
  return getConfig(props.taskTypes[0])
})

/** 可见配置字段 */
const visibleFields = computed(() => {
  if (props.taskTypes.length !== 1) return []
  return getVisibleFields(props.taskTypes[0], props.configValues)
})

/** 检测是否有"其他"选项被选中 */
const hasOtherSelected = computed(() => {
  return Object.values(props.configValues || {}).some(
    v => v === 'other' || (Array.isArray(v) && v.includes('other'))
  )
})

/** 备注字段错误提示 */
const remarksError = computed(() => hasOtherSelected.value ? '选择"其他"时必填' : undefined)

/** 获取字段错误信息 */
const getFieldError = (field) => {
  if (field.key === 'remarks' && hasOtherSelected.value) {
    return remarksError.value
  }
  return props.errors[field.key]
}
</script>
