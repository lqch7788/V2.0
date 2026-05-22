/**
 * 地块管理 Store - 对应V1.1 useBlockStore
 * 地块(Blocks)管理
 * 数据流：Store → 组件 → API → 后端
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

// API基础URL
const API_BASE = '/basic-data/blocks'

// 字段映射：snake_case (后端) <-> camelCase (前端)
const FIELD_MAP = {
  id: 'id',
  oid: 'oid',
  block_code: 'blockCode',
  block_name: 'blockName',
  zone_oid: 'zoneOid',
  zone_name: 'zoneName',
  block_type: 'blockType',
  area: 'area',
  sort_order: 'sortOrder',
  status: 'status',
  description: 'description',
  created_at: 'createdAt',
  updated_at: 'updatedAt'
}

/**
 * 后端数据 → 前端数据（API 响应处理）
 */
function normalize(raw) {
  const result = { ...raw }
  for (const [snake, camel] of Object.entries(FIELD_MAP)) {
    if (snake in result && !(camel in result)) {
      result[camel] = result[snake]
    }
  }
  result.id = result.id || result.oid || String(Date.now())
  result.status = result.status || 'active'
  return result
}

/**
 * 前端数据 → 后端数据（API 请求体处理）
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

export const useBlockStore = defineStore('block', () => {
  // 状态
  const blocks = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 地块类型选项
  const blockTypes = [
    { dictCode: 'planting', dictLabel: '种植区' },
    { dictCode: 'fallow', dictLabel: '休耕区' },
    { dictCode: 'nursery', dictLabel: '育苗区' },
    { dictCode: 'experimental', dictLabel: '试验区' }
  ]

  /**
   * 加载地块数据
   * 调用真实API：GET /api/basic-data/blocks
   */
  const loadBlocks = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await enhancedApiClient.get(API_BASE)
      const data = Array.isArray(response) ? response : (response?.data || [])
      blocks.value = data.map(normalize)
    } catch (err) {
      error.value = err.message || '加载地块数据失败'
      console.warn('[BlockStore] 加载失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 添加地块
   * 调用真实API：POST /api/basic-data/blocks
   */
  const addBlock = async (blockData) => {
    try {
      const body = denormalize(blockData)
      const response = await enhancedApiClient.post(API_BASE, body)
      const saved = response?.data || response
      const newBlock = normalize({ ...blockData, ...saved })
      blocks.value = [newBlock, ...blocks.value]
      return newBlock
    } catch (err) {
      error.value = err.message || '添加地块失败'
      console.warn('[BlockStore] 添加失败:', err)
      throw err
    }
  }

  /**
   * 编辑地块
   * 调用真实API：PUT /api/basic-data/blocks/:id
   */
  const editBlock = async (id, blockData) => {
    blocks.value = blocks.value.map(b =>
      (b.id === id || b.oid === id) ? { ...b, ...blockData } : b
    )
    try {
      const body = denormalize(blockData)
      await enhancedApiClient.put(`${API_BASE}/${id}`, body)
    } catch (err) {
      error.value = err.message || '编辑地块失败'
      console.warn('[BlockStore] 编辑失败:', err)
      throw err
    }
  }

  /**
   * 删除地块
   * 调用真实API：DELETE /api/basic-data/blocks/:id
   */
  const removeBlock = async (id) => {
    const original = [...blocks.value]
    blocks.value = blocks.value.filter(b => b.id !== id && b.oid !== id)
    try {
      await enhancedApiClient.delete(`${API_BASE}/${id}`)
      return true
    } catch (err) {
      error.value = err.message || '删除地块失败'
      blocks.value = original
      console.warn('[BlockStore] 删除失败:', err)
      return false
    }
  }

  return {
    blocks,
    loading,
    error,
    blockTypes,
    loadBlocks,
    addBlock,
    editBlock,
    removeBlock
  }
})
