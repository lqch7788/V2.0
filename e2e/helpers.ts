import { Page, expect, Browser, BrowserContext } from '@playwright/test'

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
 * 收集页面核心 UI 元素（按钮 + 表格行 + 表单字段）作为 parity 比对快照
 */
export async function captureUISnapshot(page: Page) {
  await page.waitForLoadState('networkidle')
  const buttons = await page.locator('button:visible, .el-button:visible').allTextContents()
  const tableRows = await page.locator('.el-table__row, table tbody tr').count()
  const title = await page.locator('h1, h2, h3').first().textContent()
  const formFields = await page.locator('input[placeholder]:visible, textarea[placeholder]:visible, .el-form-item label:visible')
    .allTextContents()
  return {
    title: title?.trim() || '',
    buttons: buttons.map((b) => b.trim()).filter(Boolean).sort(),
    tableRows,
    formFields: formFields.map((f) => f.trim()).filter(Boolean).sort(),
  }
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
  if (v11.formFields.join('|') !== v20.formFields.join('|')) {
    diffs.push(`form 字段差异:\n  V1.1: ${v11.formFields.join(', ')}\n  V2.0: ${v20.formFields.join(', ')}`)
  }
  if (diffs.length) {
    throw new Error(`[${module}] Parity 失败:\n  ${diffs.join('\n  ')}`)
  }
}

/**
 * 创建双上下文（V1.1 + V2.0）
 */
export async function createV11V20Contexts(browser: Browser) {
  const ctxV11 = await browser.newContext({ baseURL: 'http://localhost:5188' })
  const ctxV20 = await browser.newContext({ baseURL: 'http://localhost:5000' })
  const p11 = await ctxV11.newPage()
  const p20 = await ctxV20.newPage()
  return {
    ctxV11,
    ctxV20,
    p11,
    p20,
    cleanup: async () => {
      await ctxV11.close()
      await ctxV20.close()
    },
  }
}

/**
 * 捕获页面状态机（订单/批次等的状态字段值）
 * 用于验证状态机转换 1:1
 */
export async function captureStatusValues(page: Page) {
  await page.waitForLoadState('networkidle')
  // 尝试从状态徽章/标签捕获常见状态
  const statusBadges = await page.locator(
    '.el-tag, .status-badge, [class*="status"], .badge'
  ).allTextContents()
  // 尝试从 select 捕获当前选中值
  const selectValues = await page.locator('select, .el-select').evaluateAll((els) =>
    els.map((el: any) => el.value || el.textContent || '').filter(Boolean)
  )
  return {
    statusBadges: statusBadges.map((s) => s.trim()).filter(Boolean).sort(),
    selectValues: selectValues.map((s) => String(s).trim()).filter(Boolean).sort(),
  }
}

/**
 * 状态机 parity 比对
 */
export function assertStatusParity(
  v11: Awaited<ReturnType<typeof captureStatusValues>>,
  v20: Awaited<ReturnType<typeof captureStatusValues>>,
  module: string
) {
  const v11Set = new Set(v11.statusBadges)
  const v20Set = new Set(v20.statusBadges)
  const missing = [...v11Set].filter((s) => !v20Set.has(s))
  const extra = [...v20Set].filter((s) => !v11Set.has(s))
  if (missing.length || extra.length) {
    throw new Error(
      `[${module}] 状态值差异:\n  V1.1 状态: ${[...v11Set].join(', ')}\n  V2.0 状态: ${[...v20Set].join(', ')}\n  V2.0 缺: ${missing.join(', ') || '无'}\n  V2.0 多: ${extra.join(', ') || '无'}`
    )
  }
}
