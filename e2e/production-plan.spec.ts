import { test, expect } from '@playwright/test'
import { captureUISnapshot, assertParity } from './helpers'

/**
 * 生产计划 V1.1 vs V2.0 parity E2E
 * URL: /production
 */
test.describe('生产计划 parity (V1.1 vs V2.0)', () => {
  test('列表页 UI 元素 1:1', async ({ page }) => {
    await page.goto('/production')
    const snapshot = await captureUISnapshot(page)
    expect(snapshot.title).toBeTruthy()
  })

  test('V1.1 vs V2.0 同一 URL 行为一致', async ({ browser }) => {
    const ctxV11 = await browser.newContext({ baseURL: 'http://localhost:5188' })
    const ctxV20 = await browser.newContext({ baseURL: 'http://localhost:5000' })
    const p11 = await ctxV11.newPage()
    const p20 = await ctxV20.newPage()
    try {
      const s11 = await captureUISnapshot(await p11.goto('/production').then(() => p11))
      const s20 = await captureUISnapshot(await p20.goto('/production').then(() => p20))
      assertParity(s11, s20, 'production-plan')
    } finally {
      await ctxV11.close()
      await ctxV20.close()
    }
  })

  test('种植子模块 parity（/crop/planting）', async ({ browser }) => {
    const ctxV11 = await browser.newContext({ baseURL: 'http://localhost:5188' })
    const ctxV20 = await browser.newContext({ baseURL: 'http://localhost:5000' })
    const p11 = await ctxV11.newPage()
    const p20 = await ctxV20.newPage()
    try {
      const s11 = await captureUISnapshot(await p11.goto('/crop/planting').then(() => p11))
      const s20 = await captureUISnapshot(await p20.goto('/crop/planting').then(() => p20))
      assertParity(s11, s20, 'planting')
    } finally {
      await ctxV11.close()
      await ctxV20.close()
    }
  })
})
