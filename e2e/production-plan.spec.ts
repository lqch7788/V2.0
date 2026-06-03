import { test, expect } from '@playwright/test'
import { captureUISnapshot, assertParity, captureStatusValues, assertStatusParity, createV11V20Contexts } from './helpers'

/**
 * 生产计划 V1.1 vs V2.0 parity E2E
 * URL: /production + /crop/planting
 *
 * 业务流程覆盖：
 * - 列表页 parity
 * - 批次状态机 parity（draft/pending/approved/in_progress/completed/cancelled/rejected）
 * - 种植子模块 parity
 */
test.describe('生产计划 parity (V1.1 vs V2.0)', () => {
  test('生产计划主页 UI 元素 1:1', async ({ browser }) => {
    const { p11, p20, cleanup } = await createV11V20Contexts(browser)
    try {
      const s11 = await captureUISnapshot(await p11.goto('/production').then(() => p11))
      const s20 = await captureUISnapshot(await p20.goto('/production').then(() => p20))
      assertParity(s11, s20, 'production-plan-home')
    } finally {
      await cleanup()
    }
  })

  test('种植子模块 UI 元素 1:1', async ({ browser }) => {
    const { p11, p20, cleanup } = await createV11V20Contexts(browser)
    try {
      const s11 = await captureUISnapshot(await p11.goto('/crop/planting').then(() => p11))
      const s20 = await captureUISnapshot(await p20.goto('/crop/planting').then(() => p20))
      assertParity(s11, s20, 'planting')
    } finally {
      await cleanup()
    }
  })

  test('批次状态机 1:1', async ({ browser }) => {
    const { p11, p20, cleanup } = await createV11V20Contexts(browser)
    try {
      await p11.goto('/production')
      const s11 = await captureStatusValues(p11)
      await p20.goto('/production')
      const s20 = await captureStatusValues(p20)
      assertStatusParity(s11, s20, 'batch-status')
    } finally {
      await cleanup()
    }
  })
})
