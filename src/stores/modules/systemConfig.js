/**
 * 系统配置 Store — V2.0 Vue3 版本
 * 功能：系统配置的增删改查、分类筛选、导出
 * 数据流：Store → 组件 → API → 后端
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

// ==================== 字段映射 ====================

/** 后端(snake_case) → 前端(camelCase) 字段名映射 */
const FIELD_MAP = {
  config_key: 'configKey',
  config_value: 'configValue',
  config_type: 'configType',
  category: 'category',
  description: 'description',
  is_active: 'isActive',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
}

/**
 * 后端数据 → 前端数据（API 响应处理）
 * @param {Record<string, unknown>} raw - 后端返回的原始数据
 * @returns {SystemConfig} 规范化后的配置对象
 */
function normalize(raw) {
  const result = { ...raw }
  for (const [snake, camel] of Object.entries(FIELD_MAP)) {
    if (snake in result && !(camel in result)) {
      result[camel] = result[snake]
    }
  }
  // 设置默认值
  result.id = result.id || `CFG_${Date.now()}`
  result.configType = result.configType || 'string'
  result.category = result.category || 'system'
  result.description = result.description || ''
  result.isActive = result.isActive ?? true
  result.createdAt = result.createdAt || new Date().toISOString()
  result.updatedAt = result.updatedAt || new Date().toISOString()
  return result
}

/**
 * 前端数据 → 后端数据（API 请求体处理）
 * @param {Partial<SystemConfig>} data - 前端配置数据
 * @returns {Record<string, unknown>} 后端格式的数据
 */
function denormalize(data) {
  const result = {}
  const reverse = {}
  for (const [snake, camel] of Object.entries(FIELD_MAP)) {
    reverse[camel] = snake
  }
  for (const [key, value] of Object.entries(data)) {
    const backendKey = reverse[key] || key
    result[backendKey] = value
  }
  return result
}

// ==================== 类型定义 ====================

/**
 * @typedef {Object} SystemConfig
 * @property {string} id - 配置ID
 * @property {string} configKey - 配置键
 * @property {string} configValue - 配置值
 * @property {string} configType - 配置类型：'string' | 'number' | 'boolean' | 'json'
 * @property {string} category - 分类：'system' | 'ui' | 'feature' | 'demo' | 'task' | 'approval' | 'business' | 'crop'
 * @property {string} description - 描述说明
 * @property {boolean} isActive - 是否启用
 * @property {string} createdAt - 创建时间
 * @property {string} updatedAt - 更新时间
 */

// ==================== 分类配置 ====================

/** 分类Tab配置 */
export const CATEGORY_TABS = [
  { value: 'system', label: '系统设置' },
  { value: 'ui', label: '界面设置' },
  { value: 'feature', label: '功能设置' },
  { value: 'demo', label: '演示设置' },
  { value: 'task', label: '农事任务' },
  { value: 'approval', label: '审批流程' },
  { value: 'business', label: '业务参数' },
  { value: 'crop', label: '生长引擎' }
]

// ==================== Store ====================

export const useSystemConfigStore = defineStore('systemConfig', () => {
  // ---------- 状态 ----------
  const configs = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastFetch = ref(null)

  // ---------- Getters ----------
  /** 按分类筛选配置 */
  const getConfigsByCategory = computed(() => {
    return (category) => configs.value.filter(c => c.category === category)
  })

  /** 获取单个配置 */
  const getConfigById = computed(() => {
    return (id) => configs.value.find(c => c.id === id)
  })

  // ---------- Actions ----------

  /**
   * 加载配置列表
   * 调用真实API：GET /api/dictionary/system-configs
   */
  const loadConfigs = async () => {
    const now = Date.now()
    // 30秒内不重复请求
    if (lastFetch.value && now - lastFetch.value < 30 * 1000 && configs.value.length > 0) {
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await enhancedApiClient.get('/basic-data/system-configs')

      let rawData = []
      if (Array.isArray(response)) {
        rawData = response
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        rawData = response.data
      }

      configs.value = rawData.map(normalize)
      lastFetch.value = now
    } catch (err) {
      console.warn('[SystemConfigStore] 加载配置失败:', err)
      error.value = err.message || '加载配置失败'
    } finally {
      loading.value = false
    }
  }

  /**
   * 添加配置
   * 调用真实API：POST /api/dictionary/system-configs
   * @param {Partial<SystemConfig>} data - 配置数据
   * @returns {Promise<SystemConfig|null>}
   */
  const addConfig = async (data) => {
    loading.value = true
    error.value = null

    try {
      const body = denormalize(data)
      const response = await enhancedApiClient.post('/basic-data/system-configs', body)

      // 后端返回完整记录时用它，否则用乐观数据
      let newItem
      if (response && typeof response === 'object' && 'data' in response) {
        const saved = response.data
        if (saved && saved.id) {
          newItem = normalize(saved)
        } else {
          newItem = normalize({ ...body, id: `CFG_${Date.now()}` })
        }
      } else {
        newItem = normalize({ ...body, id: `CFG_${Date.now()}` })
      }

      configs.value = [newItem, ...configs.value]
      return newItem
    } catch (err) {
      console.warn('[SystemConfigStore] 创建配置失败:', err)
      error.value = err.message || '创建配置失败'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新配置
   * 调用真实API：PUT /api/dictionary/system-configs/:id
   * @param {string} id - 配置ID
   * @param {Partial<SystemConfig>} data - 更新数据
   */
  const updateConfig = async (id, data) => {
    // 乐观更新
    const index = configs.value.findIndex(c => c.id === id)
    if (index !== -1) {
      configs.value[index] = {
        ...configs.value[index],
        ...data,
        updatedAt: new Date().toISOString()
      }
    }

    try {
      const body = denormalize(data)
      await enhancedApiClient.put(`/basic-data/system-configs/${id}`, body)
    } catch (err) {
      console.warn('[SystemConfigStore] 更新配置失败:', err)
    }
  }

  /**
   * 删除配置
   * 调用真实API：DELETE /api/dictionary/system-configs/:id
   * @param {string} id - 配置ID
   * @returns {Promise<boolean>}
   */
  const removeConfig = async (id) => {
    // 乐观更新
    const original = configs.value.find(c => c.id === id)
    configs.value = configs.value.filter(c => c.id !== id)

    try {
      await enhancedApiClient.delete(`/basic-data/system-configs/${id}`)
      return true
    } catch (err) {
      console.warn('[SystemConfigStore] 删除配置失败:', err)
      // 回滚
      if (original) {
        configs.value = [original, ...configs.value]
      }
      return false
    }
  }

  /**
   * 刷新所有配置
   */
  const refreshAll = async () => {
    lastFetch.value = null
    await loadConfigs()
  }

  return {
    // 状态
    configs,
    loading,
    error,
    lastFetch,
    // Getters
    getConfigsByCategory,
    getConfigById,
    // Actions
    loadConfigs,
    addConfig,
    updateConfig,
    removeConfig,
    refreshAll
  }
})
