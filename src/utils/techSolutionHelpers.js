/**
 * 技术方案辅助工具
 *
 * 修复 P1-3：合并 2 处重复的 generateCode 实现
 * - TechSolution.vue L463-465
 * - TechSolutionCreateModal.vue L227-229
 *
 * 行为 1:1 保留：生成 T+YYYYMM+3 位随机数的方案编号。
 */

/**
 * @returns {string}
 */
export function generateTechSolutionCode() {
  return `T${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
}
