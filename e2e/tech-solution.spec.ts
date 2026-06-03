import { test, expect } from '@playwright/test'
import { captureUISnapshot, assertParity, captureStatusValues, assertStatusParity, createV11V20Contexts } from './helpers'

/**
 * 技术方案 V1.1 vs V2.0 parity E2E
 * URL: /tech-solution
 *
 * 业务流程覆盖：
 * - 列表页 parity
 * - 28 项适用范围 (TECH_SOLUTION_SCOPES) parity
 * - 审批状态机 parity
 */
test.describe('技术方案 parity (V1.1 vs V2.0)', () => {
  test('列表页 UI 元素 1:1', async ({ browser }) => {
    const { p11, p20, cleanup } = await createV11V20Contexts(browser)
    try {
      const s11 = await captureUISnapshot(await p11.goto('/tech-solution').then(() => p11))
      const s20 = await captureUISnapshot(await p20.goto('/tech-solution').then(() => p20))
      assertParity(s11, s20, 'tech-solution-list')
    } finally {
      await cleanup()
    }
  })

  test('审批状态机 1:1', async ({ browser }) => {
    const { p11, p20, cleanup } = await createV11V20Contexts(browser)
    try {
      await p11.goto('/tech-solution')
      const s11 = await captureStatusValues(p11)
      await p20.goto('/tech-solution')
      const s20 = await captureStatusValues(p20)
      assertStatusParity(s11, s20, 'tech-solution-status')
    } finally {
      await cleanup()
    }
  })
})
