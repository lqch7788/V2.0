/**
 * 种源形态字段翻译工具（V1.1 DetailModal.tsx formatSeedForm 1:1 迁移）
 *
 * 2026-07-16：种源形态字段 seedForm 后端可能存中文（来自 product_form）或英文（来自 stock_type），
 * 统一在前端兜底翻译成中文显示
 *
 * 使用场景：
 * - 种源详情弹窗「基本信息」/「种植留种信息」/「使用记录」中的「形态」字段
 *
 * @param {string|null|undefined} sf - 原始 seedForm 值（中文或英文）
 * @returns {string} 中文标签（未匹配则原样回显）
 *
 * @example
 * formatSeedForm('种子')   // '种子'
 * formatSeedForm('seed')   // '种子'
 * formatSeedForm(null)     // '—'
 * formatSeedForm('unknown') // 'unknown'
 */
import { SEED_FORM_OPTIONS } from '@/constants/seedFormDict'
import { SOURCE_TYPE_MAP } from '@/constants/cropConstants'

/**
 * @param {string|null|undefined} sf
 * @returns {string}
 */
export function formatSeedForm(sf) {
  if (!sf) return '—'
  // 已在中文词典中 → 原样返回
  if (SEED_FORM_OPTIONS.some((opt) => opt.value === sf)) return sf
  // 走英文 → 中文映射
  return SOURCE_TYPE_MAP[sf] || sf
}

export default formatSeedForm
