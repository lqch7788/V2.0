# 4 模块 V1.1 vs V2.0 Parity E2E

## 目标
验证订单管理 / 生产计划 / 技术方案 / 采购计划 4 模块 V1.1 vs V2.0 100% UI 行为一致。

## 架构

| 系统 | 前端 | 端口 | 后端 | 端口 |
|------|------|------|------|------|
| V1.1 | React | 5188 | Express | 3001 |
| V2.0 | Vue3 | 5000 | Express | 3002 |

两个后端共享 SQLite 数据库 `server/data/yuanxingtu.db`。

## 跑测试前

需要 3 个 dev server 同时跑：
1. V1.1 后端：`cd D:/TMcrop/yuanxingtu/V1.1/server && npm run dev` （port 3001）
2. V2.0 后端：`cd D:/TMcrop/yuanxingtu/V2.0/server && npm run dev` （port 3002）
3. V1.1 前端：`cd D:/TMcrop/yuanxingtu/V1.1 && npm run dev` （port 5188）
4. V2.0 前端：`cd D:/TMcrop/yuanxingtu/V2.0 && npm run dev` （port 5000）

如果 V1.1 没装：`cd D:/TMcrop/yuanxingtu/V1.1 && npm install`

## 跑测试

```bash
cd D:/TMcrop/yuanxingtu/V2.0

# 第一次跑需要装浏览器
npx playwright install chromium

# 跑全部 parity E2E
npx playwright test

# 只跑 1 模块
npx playwright test e2e/purchase-plan.spec.ts

# UI 模式（可视化）
npx playwright test --ui
```

## 测试覆盖

| Spec | URL | V1.1 ↔ V2.0 验证 |
|------|-----|------------------|
| `purchase-plan.spec.ts` | `/purchase-plan` | 列表 UI 元素 + parity |
| `production-plan.spec.ts` | `/production` + `/crop/planting` | 主页 + 种植子模块 |
| `tech-solution.spec.ts` | `/tech-solution` | 列表 UI 元素 + parity |
| `order-management.spec.ts` | `/crop/order` | 列表 UI 元素 + parity |

## Parity 验证维度

每个 spec 调用 `captureUISnapshot()` 抓取：
- 页面标题（h1/h2/h3）
- 所有可见按钮文本
- 表格行数

然后 `assertParity()` 比对 V1.1 vs V2.0 三个维度是否一致。

## 已知限制

- **当前脚本只验证"列表页 UI 元素"**（按钮/标题/表格行数）—— 没验证创建/编辑/审批等业务流程
- **V1.1 dev server 必须 sponsor 手动启**（本环境 V1.1 依赖没装，npm install 耗时）
- **V1.1 / V2.0 鉴权机制如果不同**会卡 login

## 扩展建议

后续可加：
- 创建流程 parity（点 "新建" → 填表 → 提交 → 验证列表）
- 审批流程 parity（pending → approved）
- 状态机 parity（订单从待付款到已收货）
- 字段 parity（用 inline snapshot 验证关键字段名）
