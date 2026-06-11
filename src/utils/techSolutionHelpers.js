/**
 * 技术方案辅助工具
 *
 * 修复 P1-3：合并 2 处重复的 generateCode 实现
 * - TechSolution.vue L463-465
 * - TechSolutionCreateModal.vue L227-229
 *
 * 修复 P0-T1：方案编号改为 V1.1 1:1 当日 MAX+1 自增（与 V1.1 server/src/routes/techSolution.ts L28-53 行为一致）
 * 格式：TS + YYYYMMDD + - + 3位流水号，共 14 字符
 * 流水号按当日自增（查询当日 MAX+1，禁止随机数）
 * 异步版本：调用后端 GET /api/tech-solutions/generate-code 获取权威编号
 * 同步版本：本地 fallback 兜底（后端不可用时）
 */

/**
 * 异步生成技术方案编号（首选，调用后端）
 * @returns {Promise<string>}
 */
export async function generateTechSolutionCode() {
  try {
    const res = await fetch('/api/tech-solutions/generate-code', {
      headers: { 'Content-Type': 'application/json' }
    })
    if (res.ok) {
      const json = await res.json()
      if (json && json.success && json.code) return json.code
    }
  } catch {
    // 静默回退到本地生成
  }
  return generateTechSolutionCodeLocal()
}

/**
 * 本地兜底生成（V1.1 server L28-53 1:1 翻译）
 * 格式：TS + YYYYMMDD + - + 3位流水号，共 14 字符
 * @returns {string}
 */
export function generateTechSolutionCodeLocal() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  // 当日内随机 1-999（仅作为离线 fallback，V1.1 服务端是真 MAX+1）
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
  return `TS${year}${month}${day}-${seq}`
}
