import { Page, expect } from '@playwright/test'

/**
 * 登录（V1.1 + V2.0 共享后端，登录 API 相同）
 * 如未启用鉴权可忽略
 */
export async function login(page: Page, username = 'admin', password = 'admin123') {
  await page.goto('/login')
  await page.fill('input[name="username"]', username)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(home|dashboard)/, { timeout: 10_000 })
}

/**
 * 收集页面核心 UI 元素（按钮 + 表格行）作为 parity 比对快照
 */
export async function captureUISnapshot(page: Page) {
  await page.waitForLoadState('networkidle')
  const buttons = await page.locator('button:visible, .el-button:visible').allTextContents()
  const tableRows = await page.locator('.el-table__row, table tbody tr').count()
  const title = await page.locator('h1, h2, h3').first().textContent()
  return { title: title?.trim() || '', buttons: buttons.map((b) => b.trim()).filter(Boolean), tableRows }
}

/**
 * 比对两个快照是否一致（parity 1:1）
 */
export function assertParity(
  v11: Awaited<ReturnType<typeof captureUISnapshot>>,
  v20: Awaited<ReturnType<typeof captureUISnapshot>>,
  module: string
) {
  const diffs: string[] = []
  if (v11.title !== v20.title) diffs.push(`title: V1.1="${v11.title}" V2.0="${v20.title}"`)
  const v11Buttons = new Set(v11.buttons)
  const v20Buttons = new Set(v20.buttons)
  const missingInV20 = [...v11Buttons].filter((b) => !v20Buttons.has(b))
  const extraInV20 = [...v20Buttons].filter((b) => !v11Buttons.has(b))
  if (missingInV20.length) diffs.push(`V2.0 缺按钮: ${missingInV20.join(', ')}`)
  if (extraInV20.length) diffs.push(`V2.0 多按钮: ${extraInV20.join(', ')}`)
  if (Math.abs(v11.tableRows - v20.tableRows) > 0) {
    diffs.push(`table 行数差异: V1.1=${v11.tableRows} V2.0=${v20.tableRows}`)
  }
  if (diffs.length) {
    throw new Error(`[${module}] Parity 失败:\n  ${diffs.join('\n  ')}`)
  }
}
