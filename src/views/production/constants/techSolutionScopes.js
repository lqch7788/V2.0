/**
 * 技术方案适用范围常量
 * 1:1 翻译自 V1.1 src/components/techSolution/constants.ts
 * 统一管理 28 个选项（被 EditModal、CreateModal 共享）
 *
 * 后续可改为从 dictionaries 表加载（category: tech_solution_scope）
 */
export const TECH_SOLUTION_SCOPES = [
  '品种选育', '种子生产', '种源采集', '种子加工', '种子检测',
  '播种育苗', '催芽管理', '苗期管理', '出圃管理', '嫁接育苗', '组培育苗',
  '土壤准备', '定植移栽', '生长期管理', '开花结果期', '采收期管理',
  '温室环境调控', '大棚管理', '灌溉管理', '施肥管理', '病虫害防治',
  '采收管理', '分级包装', '贮藏保鲜', '加工处理',
  '全周期管理', '综合技术方案', '应急处理', '其他',
]

/** @typedef {typeof TECH_SOLUTION_SCOPES[number]} TechSolutionScope */

/**
 * 种植模式 fallback 列表
 * 用于字典加载失败时的兜底（与 V1.1 保持一致）
 */
export const PLANTING_MODE_FALLBACK = ['水培', '土培', '基质培', '雾培']
