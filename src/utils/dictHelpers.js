/**
 * 字典辅助工具
 *
 * 修复 P1-1：合并 3 处重复的 getDictItemNameSync 实现
 * - TechSolution.vue L242-252
 * - TechSolutionTable.vue L219-229
 * - TechSolutionDetailModal.vue L153-163
 *
 * 行为 1:1 保留：字典 store 内部维护完整字典数据，可同步查询；
 * 找不到时降级返回 code 本身。
 */
import { useDictionaryStore } from '@/stores/modules/dictionary'

/**
 * @param {string} category
 * @param {string} code
 * @param {string} [fallback]
 * @returns {string}
 */
export function getDictItemNameSync(category, code, fallback = '') {
  if (!code) return fallback
  try {
    const dictionaryStore = useDictionaryStore()
    const item = (dictionaryStore.dictionaries || []).find(
      (d) => d.category === category && d.code === code
    )
    return item?.name || code
  } catch {
    return code
  }
}

/**
 * 修复 P0-T03：从技术方案记录解析适用范围 scopes 数组
 *
 * 背景：V2.0 后端 techSolution.js mapFieldsToFrontend L72 返回的是字符串
 *       `scopeNames`（逗号分隔），而前端 6 处代码还在按 V1.1 的数组 `scopes` 字段读取，
 *       导致"适用范围"显示永远为空（fallback 到 stage 字段）。
 *
 * 行为 1:1 兼容 V1.1：
 * - 优先用 V1.1 数组字段 `tech.scopes`（未来若后端改回关联表，前端不用再改）
 * - fallback 到 V2.0 字符串字段 `tech.scopeNames`（逗号分隔 → 数组）
 * - 全部为空时返回空数组
 *
 * @param {object} tech 技术方案记录
 * @returns {string[]} scopes 数组
 */
export function getScopesFromTech(tech) {
  if (!tech) return []
  // 优先 V1.1 字段（数组）
  if (Array.isArray(tech.scopes) && tech.scopes.length > 0) {
    return tech.scopes
  }
  // fallback V2.0 字符串字段
  if (tech.scopeNames && typeof tech.scopeNames === 'string') {
    return tech.scopeNames
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}
