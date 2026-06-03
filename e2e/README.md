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

需要 4 个 dev server 同时跑：
1. V1.1 后端：`cd D:/TMcrop/yuanxingtu/V1.1/server && npm run dev` （port 3001）
2. V2.0 后端：`cd D:/TMcrop/yuanxingtu/V2.0/server && npm run dev` （port 3002）
3. V1.1 前端：`cd D:/TMcrop/yuanxingtu/V1.1 && npm run dev` （port 5188）
4. V2.0 前端：`cd D:/TMcrop/yuanxingtu/V2.0 && npm run dev` （port 5000）

如果 V1.1 没装依赖：`cd D:/TMcrop/yuanxingtu/V1.1 && npm install`

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

# 看 HTML 报告
npx playwright show-report
```

## 测试覆盖

| Spec | URL | 业务流程 |
|------|-----|----------|
| `purchase-plan.spec.ts` | `/purchase-plan` | 列表 parity + 创建弹窗字段 parity |
| `production-plan.spec.ts` | `/production` + `/crop/planting` | 主页 + 种植子模块 + 批次状态机 |
| `tech-solution.spec.ts` | `/tech-solution` | 列表 parity + 审批状态机 |
| `order-management.spec.ts` | `/crop/order` | 列表 parity + 订单状态机 + 创建弹窗 |

## Parity 验证维度

每个 spec 调用以下函数抓取快照：

- **`captureUISnapshot()`** 抓取：
  - 页面标题（h1/h2/h3）
  - 所有可见按钮文本
  - 表格行数
  - 表单字段（placeholder + label）

- **`captureStatusValues()`** 抓取：
  - 状态徽章/标签
  - select 当前值

- **`assertParity()`** / **`assertStatusParity()`** 比对 V1.1 vs V2.0 上述维度。

## 业务流程覆盖

| 流程 | 模块 | test |
|------|------|------|
| 列表页 UI 1:1 | 4 模块 | 各 spec "列表页 UI 元素 1:1" |
| 创建弹窗字段 1:1 | 采购计划 + 订单 | "创建...弹窗字段 1:1" |
| 状态机 1:1 | 生产批次 + 技术方案审批 + 订单 | "...状态机 1:1" |
| 种植子模块 1:1 | 生产计划 | "种植子模块 UI 元素 1:1" |

## 已知限制

- **业务流（创建/审批/删除）只验证弹窗字段和入口**，不模拟"填表 → 提交"完整链路（需 V1.1 + V2.0 表单字段 ID 适配）
- **依赖 sponsor 启 4 个 dev server**（V1.1 依赖可能没装）
- **鉴权**：如 V1.1/V2.0 启用登录会卡在 login（可用 `login()` helper 适配）

## 扩展建议

后续可加：
- 完整创建流程（点"新建" → 填表 → 提交 → 验证列表新增项）
- 审批状态转换（pending → approved 状态机推进）
- 数据持久化 parity（创建后 V1.1 和 V2.0 看到同一数据）
- 字段名 inline snapshot（用 toMatchInlineSnapshot 验证关键字段）
