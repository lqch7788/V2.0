import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E 配置
 * 验证 4 模块 V1.1 vs V2.0 100% parity
 *
 * 跑测试前需启：
 * - V1.1 后端 (port 3001) + V1.1 dev server (port 5188)
 * - V2.0 后端 (port 3002) + V2.0 dev server (port 5000)
 * - 两个后端共享 SQLite 数据库（见 server/data/yuanxingtu.db）
 *
 * 跑命令：npx playwright test
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'v11',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5188',
      },
    },
    {
      name: 'v20',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5000',
      },
    },
  ],
})
