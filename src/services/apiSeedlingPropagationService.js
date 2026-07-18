/**
 * 2026-07-04 v2: 育苗无性繁殖记录子表 Service（V1.1 apiSeedlingPropagationService.ts 1:1 迁移）
 * 复用现有 propagation_records 表（带 seedling_id 列）
 * 与种植/RecordModal 的 asexual 分支对齐：完整记录无性繁殖全过程
 *
 * 2026-07-18 P0-MISS-007 修复：V2.0 此前缺失此 service
 */
import { enhancedApiClient } from '@/lib/apiClient'

/**
 * @typedef {'healthy'|'weak'|'diseased'} SeedlingHealthStatus
 */
/** 7 个有性 + 6 个无性 = 13 种繁殖操作类型 */
/**
 * @typedef {'clonal'|'cutting'|'grafting'|'layering'|'tissue'|'division'} AsexualOperationType
 */
/**
 * @typedef {'cross'|'self'|'backcross'|'selection'|'marker'|'other'} SexualOperationType
 */
/**
 * @typedef {SexualOperationType|AsexualOperationType} PropagationOperationType
 */
/**
 * @typedef {'sexual'|'asexual'} ReproductionMode
 */

/**
 * @typedef {Object} SeedlingPropagationRecord
 * @property {string} id
 * @property {string} seedlingId
 * @property {string} recordDate
 * @property {number|null} temperature
 * @property {number|null} humidity
 * @property {number|null} motherPlantCount
 * @property {number|null} seedlingOutput
 * @property {SeedlingHealthStatus|null} seedlingStatus
 * @property {string|null} transplantPosition
 * @property {string|null} operator
 * @property {string|null} remarks
 * @property {PropagationOperationType|string|null} operationType
 * @property {ReproductionMode|null} reproductionMode
 * @property {string|null} motherPlantCode
 * @property {string|string|null} propagationMethod
 * @property {number|null} inoculationCount
 * @property {number|null} survivalCountAsexual
 * @property {string[]|null} targetTraits
 * @property {string|null} generation
 * @property {string|null} parentMaleCode
 * @property {string|null} parentFemaleCode
 * @property {string} createTime
 */

/**
 * @typedef {Object} PropagationRecordInput
 * @property {string} recordDate
 * @property {number|null} [temperature]
 * @property {number|null} [humidity]
 * @property {number|null} [motherPlantCount]
 * @property {number|null} [seedlingOutput]
 * @property {SeedlingHealthStatus|null} [seedlingStatus]
 * @property {string|null} [transplantPosition]
 * @property {string|null} [operator]
 * @property {string|null} [remarks]
 * @property {PropagationOperationType|string|null} [operationType]
 * @property {ReproductionMode|null} [reproductionMode]
 * @property {string|null} [motherPlantCode]
 * @property {string|string|null} [propagationMethod]
 * @property {number|null} [inoculationCount]
 * @property {number|null} [survivalCountAsexual]
 * @property {string[]|null} [targetTraits]
 * @property {string|null} [generation]
 * @property {string|null} [parentMaleCode]
 * @property {string|null} [parentFemaleCode]
 */

/**
 * 关键服务端响应字段映射：服务端用 snake_case（record_date、mother_plant_count），
 * 前端 camelCase。enhancedApiClient 自动解包 data，但字段名需手工转换。
 * @param {Object} row
 * @returns {SeedlingPropagationRecord}
 */
function rowToRecord(row) {
  // 2026-07-04 修复：camelCaseResponseMiddleware 已把所有 snake_case → camelCase
  // targetTraits 在 DB 中是 JSON 字符串，中间件把它转成了 camelCase 键 "targetTraits"
  const rawTraits = row.targetTraits ?? row.target_traits ?? null
  let targetTraits = rawTraits ?? null
  if (typeof targetTraits === 'string') {
    try {
      const parsed = JSON.parse(targetTraits)
      if (Array.isArray(parsed)) targetTraits = parsed
    } catch {
      targetTraits = null
    }
  }
  return {
    id: row.id,
    seedlingId: row.seedlingId ?? row.seedling_id ?? '',
    recordDate: row.recordDate ?? row.record_date ?? '',
    temperature: row.temperature ?? null,
    humidity: row.humidity ?? null,
    motherPlantCount: row.motherPlantCount ?? row.mother_plant_count ?? null,
    seedlingOutput: row.seedlingOutput ?? row.seedling_output ?? null,
    seedlingStatus: row.seedlingStatus ?? row.seedling_status ?? null,
    transplantPosition: row.transplantPosition ?? row.transplant_position ?? null,
    operator: row.operator ?? null,
    remarks: row.remarks ?? null,
    operationType: row.operationType ?? row.operation_type ?? null,
    reproductionMode: row.reproductionMode ?? row.reproduction_mode ?? null,
    motherPlantCode: row.motherPlantCode ?? row.mother_plant_code ?? null,
    propagationMethod: row.propagationMethod ?? row.propagation_method ?? null,
    inoculationCount: row.inoculationCount ?? row.inoculation_count ?? null,
    survivalCountAsexual: row.survivalCountAsexual ?? row.survival_count_asexual ?? null,
    targetTraits,
    generation: row.generation ?? null,
    parentMaleCode: row.parentMaleCode ?? row.parent_male_code ?? null,
    parentFemaleCode: row.parentFemaleCode ?? row.parent_female_code ?? null,
    createTime: row.createTime ?? row.create_time ?? ''
  }
}

export const apiSeedlingPropagationService = {
  /**
   * @param {string|number} seedlingId
   * @returns {Promise<SeedlingPropagationRecord[]>}
   */
  async list(seedlingId) {
    const data = await enhancedApiClient.get(`/seedlings/${seedlingId}/propagation-records`)
    if (!Array.isArray(data)) return []
    return data.map(rowToRecord)
  },

  /**
   * @param {string|number} seedlingId
   * @param {PropagationRecordInput} input
   * @returns {Promise<{id: string}>}
   */
  async create(seedlingId, input) {
    return await enhancedApiClient.post(`/seedlings/${seedlingId}/propagation-records`, input)
  },

  /**
   * @param {string|number} seedlingId
   * @param {string} recordId
   * @param {Partial<PropagationRecordInput>} input
   * @returns {Promise<void>}
   */
  async update(seedlingId, recordId, input) {
    await enhancedApiClient.put(`/seedlings/${seedlingId}/propagation-records/${recordId}`, input)
  },

  /**
   * @param {string|number} seedlingId
   * @param {string} recordId
   * @returns {Promise<void>}
   */
  async delete(seedlingId, recordId) {
    await enhancedApiClient.delete(`/seedlings/${seedlingId}/propagation-records/${recordId}`)
  }
}

export default apiSeedlingPropagationService
