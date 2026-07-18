/**
 * 实体历史服务（V1.1 entityHistoryService.ts 1:1 迁移）
 * 前端服务层 — 调后端 /history 端点 + 合并 material_flow_log
 *
 * 2026-07-18 P0-DETAIL-005 修复：V2.0 缺失此文件导致操作历史 Tab 功能缩水
 */
import { enhancedApiClient } from '@/lib/apiClient'

/**
 * @typedef {Object} HistoryItem
 * @property {string} id
 * @property {string} occurredAt
 * @property {'entity'|'flow'} source
 * @property {'lifecycle'|'inbound'|'transaction'|'circulation'|'flow'} category
 * @property {string} action
 * @property {number} [quantityDelta]
 * @property {string} [unit]
 * @property {string} [refCode]
 * @property {string} [refModule]
 * @property {string} [operatorName]
 * @property {string} [remarks]
 * @property {string} [cropName]
 * @property {string} [inboundSource]
 * @property {Object} [raw]
 */

/**
 * 查询实体历史（调 /api/{entity}/:id/history）
 * @param {string} entity - 'seed-sources' | 'seedlings' | 'plantings'
 * @param {string} entityId
 * @returns {Promise<HistoryItem[]>}
 */
async function fetchEntityHistory(entity, entityId) {
  const res = await enhancedApiClient.get(`/${entity}/${entityId}/history`)
  const data = Array.isArray(res) ? res : res?.data || []
  return data.map((r) => ({
    ...r,
    source: 'entity'
  }))
}

/** material_flow_log flowType → 中文 */
const FLOW_TYPE_CN = {
  'seed_source→seedling': '种源 → 育苗',
  'seed_source→planting': '种源 → 种植',
  'seedling→planting': '育苗 → 种植',
  'planting→harvest': '种植 → 采收',
  'seedling→harvest': '育苗 → 采收',
  'external→seedling': '外部种源 → 育苗',
  'external→planting': '外部 → 种植',
  'inventory→external': '库存 → 出库',
  'inventory→planting': '库存 → 种植',
  'inventory→seedling': '库存 → 育苗',
  'inventory→seed_source': '库存 → 种源',
  'seed_source→harvest': '种源 → 采收',
  'plan→seed_source': '计划 → 种源',
  'planting→seed_source': '种植 → 种源',
  correction: '数量修正'
}

/**
 * 2026-07-16：flowType 第一段（来源） → 中文
 * 让 EntityHistoryTimeline 表格"来源"列能展示有意义的标签（如「种源」「库存」）
 */
const FLOW_SOURCE_CN = {
  seed_source: '种源',
  inventory: '库存',
  external: '外部',
  planting: '种植',
  correction: '数量修正',
  plan: '计划'
}

/**
 * 查询 material_flow_log（调已有 /material-flow-log/trace 端点）
 * @param {string} code
 * @returns {Promise<HistoryItem[]>}
 */
async function fetchFlowLogs(code) {
  if (!code) return []
  try {
    const res = await enhancedApiClient.get(`/material-flow-log/trace?code=${encodeURIComponent(code)}`)
    const rows = Array.isArray(res) ? res : res?.data || []
    return rows.map((r) => {
      const sourceKey = r.flowType ? r.flowType.split('→')[0] : ''
      return {
        id: r.id,
        occurredAt: r.createdAt,
        source: 'flow',
        category: 'flow',
        action: FLOW_TYPE_CN[r.flowType] || r.flowType || '流转',
        quantityDelta: r.targetQuantity || r.sourceQuantity || undefined,
        unit: r.targetUnit || r.sourceUnit,
        refCode: r.sourceCode || r.targetCode,
        refModule: undefined,
        operatorName: r.createdBy,
        cropName: r.cropName,
        inboundSource: FLOW_SOURCE_CN[sourceKey] || sourceKey || undefined,
        remarks: r.cropName
      }
    })
  } catch {
    return []
  }
}

/**
 * 查询完整实体历史（实体级 + material_flow_log 合并，按时间倒序）
 * V1.1 源：src/services/entityHistoryService.ts fetchFullHistory
 * @param {'seed-sources'|'seedlings'|'plantings'} entity
 * @param {string} entityId
 * @param {string} entityCode
 * @returns {Promise<HistoryItem[]>}
 */
export async function fetchFullHistory(entity, entityId, entityCode) {
  const [entityHistory, flowLogs] = await Promise.all([
    fetchEntityHistory(entity, entityId),
    fetchFlowLogs(entityCode)
  ])

  // 合并 + 去重（按 id）
  const seen = new Set()
  const merged = []
  for (const item of [...entityHistory, ...flowLogs]) {
    if (!item.id) continue
    if (seen.has(item.id)) continue
    seen.add(item.id)
    merged.push(item)
  }

  // 按时间倒序
  merged.sort((a, b) => (b.occurredAt || '').localeCompare(a.occurredAt || ''))
  return merged
}

export default { fetchFullHistory }
