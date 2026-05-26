/**
 * 任务类型配置 Composable
 * 从V1.1 useTaskTypeConfig.ts 1:1迁移
 * 用于获取和管理任务类型的动态配置
 */

import { computed } from 'vue'

/** 任务类型配置定义 */
const TASK_TYPE_CONFIGS = [
  {
    type: 'fertilization', label: '施肥', color: 'bg-emerald-500',
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
      { key: 'fertilizerName', label: '肥料名称', type: 'text', dependsOn: ['fertilizerType:other'] },
      { key: 'remarks', label: '备注', type: 'textarea' },
    ],
  },
  {
    type: 'irrigation', label: '灌溉', color: 'bg-blue-500',
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
  {
    type: 'spraying', label: '农药喷洒', color: 'bg-indigo-500',
    configFields: [
      { key: 'pesticideName', label: '农药名称', required: true, type: 'text' },
      { key: 'pesticideType', label: '农药类型', required: true, type: 'select', options: [
        { value: 'insecticide', label: '杀虫剂' }, { value: 'fungicide', label: '杀菌剂' },
        { value: 'herbicide', label: '除草剂' }, { value: 'other', label: '其他' },
      ]},
      { key: 'dosage', label: '用量', required: true, type: 'number', unit: 'ml/亩', min: 0 },
      { key: 'concentration', label: '稀释倍数', type: 'number', unit: '倍', min: 1 },
    ],
  },
  {
    type: 'harvest', label: '采收', color: 'bg-amber-500',
    configFields: [
      { key: 'harvestMethod', label: '采收方式', type: 'select', options: [
        { value: 'manual', label: '人工' }, { value: 'mechanical', label: '机械' },
      ]},
      { key: 'estimatedYield', label: '预估产量', type: 'number', unit: 'kg', min: 0 },
    ],
  },
  {
    type: 'weeding', label: '除草', color: 'bg-red-500',
    configFields: [
      { key: 'weedType', label: '杂草类型', type: 'text' },
      { key: 'method', label: '除草方式', type: 'select', options: [
        { value: 'manual', label: '人工除草' }, { value: 'herbicide', label: '化学除草' },
      ]},
    ],
  },
  {
    type: 'sowing', label: '播种', color: 'bg-purple-500',
    configFields: [
      { key: 'seedVariety', label: '种子品种', required: true, type: 'text' },
      { key: 'sowingMethod', label: '播种方式', type: 'select', options: [
        { value: 'direct', label: '直播' }, { value: 'transplant', label: '移栽' },
        { value: 'drill', label: '条播' }, { value: 'other', label: '其他' },
      ]},
      { key: 'seedDensity', label: '播种密度', type: 'number', unit: '株/亩' },
    ],
  },
  {
    type: 'pruning', label: '修剪', color: 'bg-teal-500',
    configFields: [
      { key: 'pruningType', label: '修剪类型', type: 'select', options: [
        { value: 'shaping', label: '整形修剪' }, { value: 'thinning', label: '疏枝修剪' },
        { value: 'renewal', label: '更新修剪' }, { value: 'other', label: '其他' },
      ]},
    ],
  },
]

const TASK_TYPE_CONFIG_MAP = {}
TASK_TYPE_CONFIGS.forEach(c => { TASK_TYPE_CONFIG_MAP[c.type] = c })

/**
 * useTaskTypeConfig composable
 */
export function useTaskTypeConfig() {
  const allConfigs = TASK_TYPE_CONFIGS

  const getConfig = (taskType) => TASK_TYPE_CONFIG_MAP[taskType]

  const getVisibleFields = (taskType, values = {}) => {
    const config = TASK_TYPE_CONFIG_MAP[taskType]
    if (!config) return []
    return config.configFields.filter(field => {
      if (!field.dependsOn || field.dependsOn.length === 0) return true
      return field.dependsOn.some(dep => {
        if (dep.includes(':')) {
          const [depKey, depValue] = dep.split(':')
          return values[depKey] === depValue
        }
        const depValue = values[dep]
        return depValue !== undefined && depValue !== '' && depValue !== 'none'
      })
    })
  }

  const validateConfig = (taskType, values) => {
    const config = TASK_TYPE_CONFIG_MAP[taskType]
    if (!config) return { valid: true, errors: {} }
    const errors = {}
    config.configFields.forEach(field => {
      if (field.required) {
        const value = values[field.key]
        if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
          errors[field.key] = `${field.label}为必填项`
        }
      }
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

  const getDefaultValues = (taskType) => {
    const config = TASK_TYPE_CONFIG_MAP[taskType]
    if (!config) return {}
    const defaults = {}
    config.configFields.forEach(field => {
      if (field.defaultValue !== undefined) {
        defaults[field.key] = field.defaultValue
      }
    })
    return defaults
  }

  const getOptionLabel = (field, value) => {
    if (!field.options) return value
    const option = field.options.find(opt => opt.value === value)
    return option?.label || value
  }

  return { allConfigs, getConfig, getVisibleFields, validateConfig, getDefaultValues, getOptionLabel }
}

export { TASK_TYPE_CONFIGS, TASK_TYPE_CONFIG_MAP }
