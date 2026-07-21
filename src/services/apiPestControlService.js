/**
 * 2026-07-21 v2: 病虫害防治记录 Service（V1.1 apiPestControlService.ts 1:1 迁移）
 * 对接后端 /api/pest-records 路由（V1.1/V2.0 共用 server）
 *
 * 后端 SQL 表：pesticide_records（39 列，含 6 个 JSON 列）
 * 前端 JS 无类型，使用 JSDoc + 字段映射保证与 DB 一致
 */
import { enhancedApiClient } from '@/lib/apiClient'

/**
 * @typedef {Object} PesticideRecord
 * @property {string} id
 * @property {string} recordCode
 * @property {string} sprayTime                    - 防治日期 YYYY-MM-DD HH:MM:SS
 * @property {string|null} operatorId
 * @property {string|null} operatorName
 * @property {string} cropName                      - 主作物名
 * @property {string|null} cropNames                - JSON 字符串，多作物
 * @property {string|null} greenhouseName           - 温室区域
 * @property {string|null} plantingId               - 关联种植 ID（逗号分隔多值）
 * @property {string|null} plantingCode
 * @property {string|null} seedlingId               - 关联育苗 ID
 * @property {string|null} seedlingCode
 * @property {string|null} pesticideId
 * @property {string|null} pesticideName
 * @property {string[]|null} pesticideType          - 药剂类型数组
 * @property {string|null} specId
 * @property {string|null} specContent
 * @property {number|null} dosage
 * @property {string|null} dosageUnit
 * @property {string|null} dilutionRatio
 * @property {string[]|null} targetPest             - 目标病虫害数组
 * @property {string|null} applicationMethod
 * @property {string|null} bioAgentId
 * @property {string|null} bioAgentName
 * @property {string|null} bioAgentType
 * @property {string|null} equipmentName
 * @property {number|null} equipmentCount
 * @property {Array|null} pesticideList             - 药剂池
 * @property {Array|null} bioAgentList              - 生物制剂池
 * @property {Array|null} equipmentList             - 设备池
 * @property {'yes'|'no'} useLeafFertilizer         - 是否联用叶面肥
 * @property {string|null} leafFertilizerName
 * @property {number|null} leafFertilizerDosage
 * @property {string|null} leafFertilizerUnit
 * @property {Array|null} leafFertilizerList        - 肥料池
 * @property {string|null} description
 * @property {string|null} photos                   - JSON 字符串
 * @property {string} createTime
 * @property {string} updateTime
 */

/** DB snake_case → 前端 camelCase 转换 */
function mapRow(row) {
  if (!row) return null
  return {
    id: row.id,
    recordCode: row.record_code || row.recordCode || '',
    sprayTime: row.spray_time || row.sprayTime || '',
    operatorId: row.operator_id || row.operatorId || null,
    operatorName: row.operator_name || row.operatorName || null,
    cropName: row.crop_name || row.cropName || '',
    cropNames: row.crop_names || row.cropNames || null,
    greenhouseName: row.greenhouse_name || row.greenhouseName || null,
    plantingId: row.planting_id || row.plantingId || null,
    plantingCode: row.planting_code || row.plantingCode || null,
    seedlingId: row.seedling_id || row.seedlingId || null,
    seedlingCode: row.seedling_code || row.seedlingCode || null,
    pesticideId: row.pesticide_id || row.pesticideId || null,
    pesticideName: row.pesticide_name || row.pesticideName || null,
    pesticideType: parseJsonArray(row.pesticide_type || row.pesticideType),
    specId: row.spec_id || row.specId || null,
    specContent: row.spec_content || row.specContent || null,
    dosage: row.dosage ?? null,
    dosageUnit: row.dosage_unit || row.dosageUnit || null,
    dilutionRatio: row.dilution_ratio || row.dilutionRatio || null,
    targetPest: parseJsonArray(row.target_pest || row.targetPest),
    applicationMethod: row.application_method || row.applicationMethod || null,
    bioAgentId: row.bio_agent_id || row.bioAgentId || null,
    bioAgentName: row.bio_agent_name || row.bioAgentName || null,
    bioAgentType: row.bio_agent_type || row.bioAgentType || null,
    equipmentName: row.equipment_name || row.equipmentName || null,
    equipmentCount: row.equipment_count ?? row.equipmentCount ?? null,
    pesticideList: parseJsonArray(row.pesticide_list || row.pesticideList),
    bioAgentList: parseJsonArray(row.bio_agent_list || row.bioAgentList),
    equipmentList: parseJsonArray(row.equipment_list || row.equipmentList),
    useLeafFertilizer: row.use_leaf_fertilizer || row.useLeafFertilizer || 'no',
    leafFertilizerName: row.leaf_fertilizer_name || row.leafFertilizerName || null,
    leafFertilizerDosage: row.leaf_fertilizer_dosage ?? row.leafFertilizerDosage ?? null,
    leafFertilizerUnit: row.leaf_fertilizer_unit || row.leafFertilizerUnit || null,
    leafFertilizerList: parseJsonArray(row.leaf_fertilizer_list || row.leafFertilizerList),
    description: row.description || '',
    photos: row.photos || null,
    createTime: row.create_time || row.createTime || '',
    updateTime: row.update_time || row.updateTime || ''
  }
}

/** JSON 字符串/数组兼容解析 */
function parseJsonArray(v) {
  if (v == null) return []
  if (Array.isArray(v)) return v
  if (typeof v === 'string' && v.trim()) {
    try { const p = JSON.parse(v); return Array.isArray(p) ? p : [] } catch { return [] }
  }
  return []
}

/** camelCase → snake_case payload（与 DB 列一致） */
function toApiPayload(record) {
  return {
    spray_time: record.sprayTime,
    operator_id: record.operatorId,
    operator_name: record.operatorName,
    crop_name: record.cropName,
    crop_names: record.cropNames ? JSON.stringify(record.cropNames) : null,
    greenhouse_name: record.greenhouseName,
    planting_id: record.plantingId,
    planting_code: record.plantingCode,
    seedling_id: record.seedlingId,
    seedling_code: record.seedlingCode,
    pesticide_id: record.pesticideId,
    pesticide_name: record.pesticideName,
    pesticide_type: Array.isArray(record.pesticideType) ? JSON.stringify(record.pesticideType) : (record.pesticideType || null),
    spec_id: record.specId,
    spec_content: record.specContent,
    dosage: record.dosage,
    dosage_unit: record.dosageUnit,
    dilution_ratio: record.dilutionRatio,
    target_pest: Array.isArray(record.targetPest) ? JSON.stringify(record.targetPest) : (record.targetPest || null),
    application_method: record.applicationMethod,
    bio_agent_id: record.bioAgentId,
    bio_agent_name: record.bioAgentName,
    bio_agent_type: record.bioAgentType,
    equipment_name: record.equipmentName,
    equipment_count: record.equipmentCount,
    pesticide_list: Array.isArray(record.pesticideList) ? JSON.stringify(record.pesticideList) : null,
    bio_agent_list: Array.isArray(record.bioAgentList) ? JSON.stringify(record.bioAgentList) : null,
    equipment_list: Array.isArray(record.equipmentList) ? JSON.stringify(record.equipmentList) : null,
    use_leaf_fertilizer: record.useLeafFertilizer || 'no',
    leaf_fertilizer_name: record.leafFertilizerName,
    leaf_fertilizer_dosage: record.leafFertilizerDosage,
    leaf_fertilizer_unit: record.leafFertilizerUnit,
    leaf_fertilizer_list: Array.isArray(record.leafFertilizerList) ? JSON.stringify(record.leafFertilizerList) : null,
    description: record.description,
    photos: record.photos
  }
}

export const apiPestControlService = {
  /** GET /pest-records/generate-code — 生成记录编号 */
  async generateCode() {
    const res = await enhancedApiClient.get('/pest-records/generate-code')
    return res?.code || res?.data?.code || ''
  },

  /** GET /pest-records — 分页查询 */
  async list(filters = {}, page = 1, limit = 20) {
    const res = await enhancedApiClient.get('/pest-records', {
      params: { ...filters, page, limit }
    })
    if (Array.isArray(res)) {
      return { items: res.map(mapRow), total: res.length, page, limit }
    }
    return {
      items: (res.items || res.data || []).map(mapRow),
      total: res.meta?.total ?? (res.data?.length || 0),
      page: res.meta?.page ?? page,
      limit: res.meta?.limit ?? limit
    }
  },

  /** GET /pest-records/:id — 详情 */
  async getById(id) {
    const res = await enhancedApiClient.get(`/pest-records/${id}`)
    const row = res?.data || res
    return mapRow(row)
  },

  /** POST /pest-records — 新增（事务+扣库存） */
  async create(record) {
    const payload = toApiPayload(record)
    const res = await enhancedApiClient.post('/pest-records', payload)
    const row = res?.data || res
    return mapRow(row)
  },

  /** PUT /pest-records/:id — 更新（diff 库存调整） */
  async update(id, record) {
    const payload = toApiPayload(record)
    const res = await enhancedApiClient.put(`/pest-records/${id}`, payload)
    const row = res?.data || res
    return mapRow(row)
  },

  /** DELETE /pest-records/:id — 删除（恢复库存） */
  async remove(id) {
    await enhancedApiClient.delete(`/pest-records/${id}`)
    return { id }
  },

  /** POST /pest-records/batch-delete — 批量删除 */
  async removeBatch(ids) {
    return await enhancedApiClient.post('/pest-records/batch-delete', { ids })
  },

  /** GET /pest-records/stats — 按药剂类型统计 */
  async stats(filters = {}) {
    const res = await enhancedApiClient.get('/pest-records/stats', { params: filters })
    return res?.data || res || []
  }
}

export default apiPestControlService