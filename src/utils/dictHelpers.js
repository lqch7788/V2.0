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
