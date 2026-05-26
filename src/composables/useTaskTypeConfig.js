/**
 * 任务类型配置 Composable
 * 用于获取和管理任务类型的动态配置
 * 对应 V1.1 src/components/farm/hub/hooks/useTaskTypeConfig.ts
 */
import { computed } from 'vue'
import { TASK_TYPE_CONFIGS, TASK_TYPE_CONFIG_MAP } from '@/types/farm/taskTypeConfig'

/**
 * @typedef {import('@/types/farm/taskTypeConfig').MultiEntryRecord} MultiEntryRecord
 */

/**
 * 配置值类型
 * @typedef {Object<string, string|number|boolean|string[]|MultiEntryRecord[]>} TaskConfigValues
 */

/**
 * 验证结果
 * @typedef {Object} TaskConfigValidation
 * @property {boolean} valid - 是否通过验证
 * @property {Object<string, string>} errors - 各字段的错误信息
 */

/**
 * Composable 返回值
 * @typedef {Object} UseTaskTypeConfigReturn
 * @property {import('vue').ComputedRef<import('@/types/farm/taskTypeConfig').TaskTypeConfig[]>} allConfigs - 所有任务类型配置（响应式）
 * @property {function(string): import('@/types/farm/taskTypeConfig').TaskTypeConfig|undefined} getConfig - 根据任务类型获取配置
 * @property {function(string, TaskConfigValues=): import('@/types/farm/taskTypeConfig').TaskConfigField[]} getVisibleFields - 获取可见配置字段
 * @property {function(string, TaskConfigValues): TaskConfigValidation} validateConfig - 验证配置值
 * @property {function(string): TaskConfigValues} getDefaultValues - 获取默认值
 * @property {function(import('@/types/farm/taskTypeConfig').TaskConfigField, string): string} getOptionLabel - 根据值获取选项标签
 */

/**
 * 任务类型配置 Composable
 * @returns {UseTaskTypeConfigReturn}
 */
export function useTaskTypeConfig() {
  // 所有任务类型配置列表（响应式计算属性，对应 V1.1 useMemo）
  const allConfigs = computed(() => TASK_TYPE_CONFIGS)

  /**
   * 根据任务类型获取配置
   * @param {string} taskType - 任务类型值
   * @returns {import('@/types/farm/taskTypeConfig').TaskTypeConfig|undefined}
   */
  function getConfig(taskType) {
    return TASK_TYPE_CONFIG_MAP[taskType]
  }

  /**
   * 获取某任务类型的可见配置字段（考虑依赖关系）
   * 对应 V1.1 getVisibleFields
   * @param {string} taskType - 任务类型值
   * @param {TaskConfigValues} [values] - 当前已填写的字段值
   * @returns {import('@/types/farm/taskTypeConfig').TaskConfigField[]}
   */
  function getVisibleFields(taskType, values) {
    const config = TASK_TYPE_CONFIG_MAP[taskType]
    if (!config) return []

    return config.configFields.filter(field => {
      // 无依赖字段，始终可见
      if (!field.dependsOn || field.dependsOn.length === 0) return true

      // 检查依赖字段是否满足条件
      return field.dependsOn.some(dep => {
        // 支持 "key:value" 格式的条件（如 applicationMethod:physical）
        if (dep.includes(':')) {
          const [depKey, depValue] = dep.split(':')
          const actualValue = values?.[depKey]
          return actualValue === depValue
        }
        // 原来的逻辑：只要依赖字段有值就显示
        const depValue = values?.[dep]
        return depValue !== undefined && depValue !== '' && depValue !== 'none'
      })
    })
  }

  /**
   * 验证配置值
   * 对应 V1.1 validateConfig
   * @param {string} taskType - 任务类型值
   * @param {TaskConfigValues} values - 需要验证的字段值
   * @returns {TaskConfigValidation}
   */
  function validateConfig(taskType, values) {
    const config = TASK_TYPE_CONFIG_MAP[taskType]
    if (!config) return { valid: true, errors: {} }

    /** @type {Object<string, string>} */
    const errors = {}

    config.configFields.forEach(field => {
      // 必填验证
      if (field.required) {
        const value = values[field.key]
        if (
          value === undefined ||
          value === '' ||
          (Array.isArray(value) && value.length === 0)
        ) {
          errors[field.key] = `${field.label}为必填项`
        }
      }

      // 数值范围验证（仅对 number 类型进行）
      if (typeof values[field.key] === 'number') {
        if (field.min !== undefined && values[field.key] < field.min) {
          errors[field.key] = `${field.label}不能小于${field.min}`
        }
        if (field.max !== undefined && values[field.key] > field.max) {
          errors[field.key] = `${field.label}不能大于${field.max}`
        }
      }
    })

    return { valid: Object.keys(errors).length === 0, errors }
  }

  /**
   * 获取任务类型的默认值
   * 对应 V1.1 getDefaultValues
   * @param {string} taskType - 任务类型值
   * @returns {TaskConfigValues}
   */
  function getDefaultValues(taskType) {
    const config = TASK_TYPE_CONFIG_MAP[taskType]
    if (!config) return {}

    /** @type {TaskConfigValues} */
    const defaults = {}
    config.configFields.forEach(field => {
      if (field.defaultValue !== undefined) {
        defaults[field.key] = field.defaultValue
      }
    })
    return defaults
  }

  /**
   * 根据字段值和选项列表获取对应的显示标签
   * 对应 V1.1 getOptionLabel
   * @param {import('@/types/farm/taskTypeConfig').TaskConfigField} field - 配置字段
   * @param {string} value - 字段值
   * @returns {string}
   */
  function getOptionLabel(field, value) {
    if (!field.options) return value
    const option = field.options.find(opt => opt.value === value)
    return option?.label || value
  }

  return {
    allConfigs,
    getConfig,
    getVisibleFields,
    validateConfig,
    getDefaultValues,
    getOptionLabel,
  }
}
