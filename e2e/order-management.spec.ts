import { test, expect } from '@playwright/test'
import { captureUISnapshot, assertParity, captureStatusValues, assertStatusParity, createV11V20Contexts } from './helpers'

/**
 * 订单管理 V1.1 vs V2.0 parity E2E
 * URL: /crop/order
 *
 * 业务流程覆盖：
 * - 列表页 parity
 * - 订单状态机 parity（pending/paid/shipped/received/cancelled/refunded）
 * - 创建订单弹窗字段 parity
 */
test.describe('订单管理 parity (V1.1 vs V2.0)', () => {
  test('列表页 UI 元素 1:1', async ({ browser }) => {
    const { p11, p20, cleanup } = await createV11V20Contexts(browser)
    try {
      const s11 = await captureUISnapshot(await p11.goto('/crop/order').then(() => p11))
      const s20 = await captureUISnapshot(await p20.goto('/crop/order').then(() => p20))
      assertParity(s11, s20, 'order-management-list')
    } finally {
      await cleanup()
    }
  })

  test('订单状态机 1:1', async ({ browser }) => {
    const { p11, p20, cleanup } = await createV11V20Contexts(browser)
    try {
      await p11.goto('/crop/order')
      const s11 = await captureStatusValues(p11)
      await p20.goto('/crop/order')
      const s20 = await captureStatusValues(p20)
      assertStatusParity(s11, s20, 'order-status')
    } finally {
      await cleanup()
    }
  })

  test('创建订单弹窗字段 1:1', async ({ browser }) => {
    const { p11, p20, cleanup } = await createV11V20Contexts(browser)
    try {
      // V1.1 创建弹窗
      await p11.goto('/crop/order')
      const v11NewBtn = p11.locator('button:has-text("新建"), button:has-text("添加")').first()
      if (await v11NewBtn.isVisible()) {
        await v11NewBtn.click()
        await p11.waitForTimeout(500)
      }
      const s11 = await captureUISnapshot(p11)

      // V2.0 创建弹窗
      await p20.goto('/crop/order')
      const v20NewBtn = p20.locator('button:has-text("新建"), button:has-text("添加")').first()
      if (await v20NewBtn.isVisible()) {
        await v20NewBtn.click()
        await p20.waitForTimeout(500)
      }
      const s20 = await captureUISnapshot(p20)

      assertParity(s11, s20, 'order-create-modal')
    } finally {
      await cleanup()
    }
  })
})
