import { test, expect } from '@playwright/test'
import { captureUISnapshot, assertParity, createV11V20Contexts } from './helpers'

/**
 * 采购计划 V1.1 vs V2.0 parity E2E
 * URL: /purchase-plan
 *
 * 业务流程覆盖：
 * - 列表页 UI 元素 parity
 * - 列表 + 表单字段 parity
 * - 创建流程入口 parity（"新建"按钮 → 表单字段）
 */
test.describe('采购计划 parity (V1.1 vs V2.0)', () => {
  test('列表页 UI 元素 + 表单字段 1:1', async ({ browser }) => {
    const { p11, p20, cleanup } = await createV11V20Contexts(browser)
    try {
      const s11 = await captureUISnapshot(await p11.goto('/purchase-plan').then(() => p11))
      const s20 = await captureUISnapshot(await p20.goto('/purchase-plan').then(() => p20))
      assertParity(s11, s20, 'purchase-plan-list')
    } finally {
      await cleanup()
    }
  })

  test('创建采购计划弹窗字段 1:1', async ({ browser }) => {
    const { p11, p20, cleanup } = await createV11V20Contexts(browser)
    try {
      // V1.1 创建弹窗
      await p11.goto('/purchase-plan')
      const v11NewBtn = p11.locator('button:has-text("新建"), button:has-text("添加")').first()
      if (await v11NewBtn.isVisible()) {
        await v11NewBtn.click()
        await p11.waitForTimeout(500)
      }
      const s11 = await captureUISnapshot(p11)

      // V2.0 创建弹窗
      await p20.goto('/purchase-plan')
      const v20NewBtn = p20.locator('button:has-text("新建"), button:has-text("添加")').first()
      if (await v20NewBtn.isVisible()) {
        await v20NewBtn.click()
        await p20.waitForTimeout(500)
      }
      const s20 = await captureUISnapshot(p20)

      assertParity(s11, s20, 'purchase-plan-create-modal')
    } finally {
      await cleanup()
    }
  })
})
