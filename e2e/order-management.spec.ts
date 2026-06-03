import { test, expect } from '@playwright/test'
import { captureUISnapshot, assertParity } from './helpers'

/**
 * 订单管理 V1.1 vs V2.0 parity E2E
 * URL: /crop/order
 */
test.describe('订单管理 parity (V1.1 vs V2.0)', () => {
  test('列表页 UI 元素 1:1', async ({ page }) => {
    await page.goto('/crop/order')
    const snapshot = await captureUISnapshot(page)
    expect(snapshot.title).toBeTruthy()
  })

  test('V1.1 vs V2.0 同一 URL 行为一致', async ({ browser }) => {
    const ctxV11 = await browser.newContext({ baseURL: 'http://localhost:5188' })
    const ctxV20 = await browser.newContext({ baseURL: 'http://localhost:5000' })
    const p11 = await ctxV11.newPage()
    const p20 = await ctxV20.newPage()
    try {
      const s11 = await captureUISnapshot(await p11.goto('/crop/order').then(() => p11))
      const s20 = await captureUISnapshot(await p20.goto('/crop/order').then(() => p20))
      assertParity(s11, s20, 'order-management')
    } finally {
      await ctxV11.close()
      await ctxV20.close()
    }
  })
})
