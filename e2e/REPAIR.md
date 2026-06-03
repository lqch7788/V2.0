# E2E Parity 失败修复工作流

## 目标
E2E parity 跑出 fail 时，定位 + 修复 V2.0 与 V1.1 差异，让两者 1:1 一致。

## 4 步工作流

### Step 1: 跑 E2E 看 fail

```bash
cd D:/TMcrop/yuanxingtu/V2.0
npx playwright test --reporter=list

# 输出形如：
#   ✘ [v11] purchase-plan-list > 列表页 UI 元素 + 表单字段 1:1 (5s)
#   ✘ [v20] purchase-plan-list > 列表页 UI 元素 + 表单字段 1:1 (5s)
#   Error: [purchase-plan-list] Parity 失败:
#     V2.0 缺按钮: 删除
#     V2.0 多按钮: 批量转移
#     table 行数差异: V1.1=42 V2.0=38
#     form 字段差异:
#       V1.1: 采购编号, 采购日期, 供应商, ...
#       V2.0: 采购单号, 日期, 供应商, ...
```

### Step 2: 定位差异点

每个 fail 对应一种差异类型：

| 差异类型 | 定位方法 |
|----------|----------|
| 按钮差异（缺/多） | `git diff src/components/purchasePlan/` 找按钮渲染处 |
| 字段名差异 | grep V2.0 字段 placeholder/label vs V1.1 同位置 |
| 状态机值差异 | grep V2.0 状态枚举 vs V1.1 同枚举 |
| 表格行数差异 | 检查筛选条件/分页参数是否一致 |
| 标题差异 | 检查 h1/h2/h3 文案 |

**核心命令**：
```bash
# V1.1 找对应文件
grep -rn "采购编号" D:/TMcrop/yuanxingtu/V1.1/src/components/purchasePlan/
grep -rn "采购单号" D:/TMcrop/yuanxingtu/V1.1/src/components/purchasePlan/

# V2.0 找差异点
grep -rn "采购编号" src/components/purchasePlan/
grep -rn "采购单号" src/components/purchasePlan/
```

### Step 3: 决策修复策略

按 design 决策树：

```
V2.0 差异来自哪？
├── V1.1 实际行为（commit 历史可查）
│   ├── V1.1 有但 V2.0 误删/改 → 改 V2.0 1:1 对齐
│   └── V1.1 没但 V2.0 加（V2.0 扩展） → 保留 V2.0 扩展
└── V1.1 也无对应（dead code 推测）
    ├── grep V1.1 caller = 0 → V1.1 dead code → V2.0 移除
    └── grep V1.1 caller > 0 → 漏迁移 → 补
```

**核心原则**（来自 design doc）：
- "V1.1 是真理标准"（含 bug 也要搬）
- "100% 一致"指用户行为 + 视觉，不指实现
- 修复 commit 拓扑：先 shared services/stores，后 module 页面

### Step 4: 修 + 验证

```bash
# 修 V2.0
# 1. 编辑文件
# 2. 跑 build 确认编译通过
npm run build

# 3. 重跑对应 spec
npx playwright test e2e/purchase-plan.spec.ts

# 4. 全过 → commit
git add src/components/purchasePlan/...
git commit -m "fix(plan): 1:1 对齐 V1.1 按钮文案 [purchase-plan-list]"
```

## 常见差异 + 修法

### 类型 A: 按钮文案差异

**症状**：`V2.0 缺按钮: 删除` / `V2.0 多按钮: 批量转移`

**修法**：
1. grep V1.1 对应文件找 button 文本
2. V2.0 找到对应位置改文案
3. 不要新增 V1.1 没有的按钮（除非是 V2.0 独有扩展，标 P0-EX 注释）

### 类型 B: 字段名差异

**症状**：`form 字段差异: V1.1: 采购编号 V2.0: 采购单号`

**修法**：
1. V1.1 grep 找到字段定义
2. V2.0 改 placeholder/label 1:1 对齐
3. 改完看 store schema 是否需要同步更新

### 类型 C: 状态机值差异

**症状**：`V2.0 缺状态: 待审批` / `V2.0 多状态: 已撤销`

**修法**：
1. grep V1.1 状态枚举定义
2. V2.0 改枚举定义 + 所有引用
3. 通常涉及 constants.js + store + 页面 badge 渲染

### 类型 D: 表格行数差异

**症状**：`table 行数差异: V1.1=42 V2.0=38`

**修法**：
1. 检查 V1.1/V2.0 默认分页大小（pageSize）
2. 检查 V1.1/V2.0 默认筛选条件
3. 检查后端 API 返回数量限制（后端共享 = 必然一致）
4. 最可能：V2.0 默认 pageSize 比 V1.1 小，或 V2.0 漏了一个 tab/筛选器

### 类型 E: 标题差异

**症状**：`title: V1.1="采购计划" V2.0="采购计划管理"`

**修法**：最简单 — V2.0 改 title 文案 1:1 对齐

## 工具链速查

```bash
# V1.1 vs V2.0 文本比对
diff <(grep -rh "placeholder=\"" D:/TMcrop/yuanxingtu/V1.1/src/components/purchasePlan/) \
     <(grep -rh "placeholder=\"" src/components/purchasePlan/) | less

# V1.1 按钮清单
grep -rE "Button.*children|<el-button|<Button" D:/TMcrop/yuanxingtu/V1.1/src/components/purchasePlan/ | head -30

# V2.0 按钮清单
grep -rE "<el-button" src/components/purchasePlan/ | head -30

# V1.1 状态枚举
grep -rE "Status = \{|enum Status" D:/TMcrop/yuanxingtu/V1.1/src/ | head -10

# V2.0 状态枚举
grep -rE "Status = \{|enum Status" src/ | head -10
```

## 完整修例：按钮差异

**症状**：
```
[purchase-plan-list] Parity 失败:
  V2.0 缺按钮: 删除
```

**Step 1: V1.1 grep 找"删除"按钮**
```bash
grep -rn "删除" D:/TMcrop/yuanxingtu/V1.1/src/components/purchasePlan/
# → PurchasePlanTable.tsx:243 <Button>删除</Button>
```

**Step 2: V2.0 grep 找对应位置**
```bash
grep -rn "删除" src/components/purchasePlan/
# → PurchasePlanTable.vue:189 <el-button @click="handleDelete">删除</el-button>  ← 已有
# → 但 V2.0 用 v-if 条件渲染：v-if="selectedRows.length > 0"
```

**Step 3: 决策**
V2.0 有"删除"按钮但被 `v-if` 隐藏（因为 `selectedRows.length === 0` 没选行）。
V1.1 是**始终渲染**（只是 disabled 状态）。

**修法**：去掉 v-if 或改 always render + disabled
```vue
<!-- V2.0 修改前 -->
<el-button v-if="canDelete" @click="handleBatchDelete">删除</el-button>

<!-- V2.0 修改后 -->
<el-button :disabled="!canDelete" @click="handleBatchDelete">删除</el-button>
```

**Step 4: 验证**
```bash
npm run build
npx playwright test e2e/purchase-plan.spec.ts
# → 通过
git add src/components/purchasePlan/PurchasePlanTable.vue
git commit -m "fix(plan): 删除按钮改为 always render + disabled (1:1 V1.1)"
```

## 修复后 commit message 模板

```
fix(plan): 1:1 对齐 V1.1 [差异类型] [模块名]

E2E parity 失败:
[V1.1 vs V2.0 差异描述]

修法：[具体改了什么]

验证：npx playwright test e2e/[spec] 通过

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

## 重要提醒

- **不要改 V1.1 源码**（V1.1 是真理标准，不能改）
- **不要改后端**（V1.1 + V2.0 共享 Express + SQLite 后端，改后端会影响两边）
- **commit 拓扑**：先 shared services/stores，后 module 页面
- **每个 P0 修复单独 commit**（保持可回滚）
