
强制铁律，所有回答问题必须用中文回答！！！
强制铁律，所有回答问题必须用中文回答！！！
强制铁律，所有回答问题必须用中文回答！！！
强制铁律，所有回答问题必须用中文回答！！！

# CLAUDE.md - V2.0 项目开发规范

## 核心优先级（2026-05-23更新）

### ⚡ 当前改造优先级（按重要性排序）

**第一优先：功能与逻辑完整性**
- 所有业务功能必须完整实现
- 计算逻辑、数据处理、API调用必须与V1.1完全一致
- 用户交互流程不能改变

**第二优先：架构合理性**
- 正确的Vue3 + Pinia状态管理模式
- 清晰的组件拆分和复用
- 良好的JavaScript类型定义

**第三优先：UI适配（可后续统一调整）**
- 允许使用Element Plus封装UI组件
- 样式选择最接近V1.1的实现方案
- UI细节差异待后续专项整改

---

## ⚠️ 必读：重构检查标准

**【强制】每次进行V1.1→V2.0功能对比时，必须执行完整检查：**

1. **首先读取**：`docs/superpowers/specs/V2-MIGRATION-CHECKLIST.md`（89维度完整检查清单）
2. **按模块检查**：每个模块产出差异报告，分类P0/P1/P2
3. **P0必须修复**：阻断级差异（功能缺失/数据丢失）修复后才能通过
4. **禁止跳过**：不能只检查UI，必须检查全部89维度

**检查清单路径**：
```
D:\TMcrop\yuanxingtu\V2.0\docs\superpowers\specs\V2-MIGRATION-CHECKLIST.md
```

---

## 技术栈

- 前端：Vue3 + javaScript + Vite + Element Plus + Tailwind CSS
- 后端：Express + SQLite (与V1.1共用)
- 状态管理：Pinia
- 端口：前端5000/5001，后端3002

## 开发规范

1. **Git提交规则**：没有用户允许，禁止主动提交本地Git
2. **组件模式**：所有数据、配置、枚举值必须从mockData或types中导入使用
2. **中文注释**：便于理解代码逻辑
3. **不删除文件**：删除前必须获得用户明确授权
4. **Git安全规则**：禁止主动执行git reset等危险命令

## V1.1源文件路径

- 作物管理模块：`D:\TMcrop\yuanxingtu\V1.1\src\components\farm\`
- 页面组件：`*.tsx` 文件
- 组件目录：`components/`、`modals/`、`components/*/`

---

## 🚨 执行原则（铁律 - 最高优先级）

**【强制规则】每次进行Vue3重构迁移时，必须严格遵循以下原则：**

### 核心原则

1. **逐文件映射转换**：V1.1每个TSX文件 → V2.0对应Vue文件，一一对应，不遗漏
2. **逻辑100%保留**：不删减任何功能、业务规则、计算逻辑
3. **功能优先**：UI细节差异可后续调整，功能逻辑不能妥协
4. **React→Vue语法转换**：
   - `useState` → `ref/reactive`
   - `useEffect` → `onMounted/onUnmounted/watch`
   - `useContext + Provider` → `Pinia Store / provide/inject`
   - `React Props` → `defineProps/defineEmits`
   - `children prop` → `slot`
   - `className` → `class` (Tailwind一致)
   - `onClick/onChange` → `@click/@change`
   - `conditional render {cond && <X />}` → `v-if/v-show`
   - `map render {list.map(x => <X />)}` → `v-for`
5. **类型内联**：TS类型转换为JS+JSDoc或Vue Props类型

### 架构映射表

| V1.1 (React) | V2.0 (Vue3) |
|---------------|---------------|
| .tsx 组件 | .vue SFC (template/script/style) |
| Zustand Store | Pinia Store (Composition API) |
| Custom Hook | Vue Composable (useXxx.js) |
| useState/useReducer | ref/reactive |
| useEffect | onMounted/onUnmounted/watch |
| useMemo/useCallback | computed |
| useContext + Provider | Pinia Store / provide/inject |
| React Props | Vue defineProps/defineEmits |
| children prop | slot |
| className | class (Tailwind一致) |
| onClick/onChange | @click/@change |
| conditional render {cond && <X />} | v-if/v-show |
| map render {list.map(x => <X />)} | v-for |

### UI组件选择策略

1. **允许使用Element Plus**：V2.0允许使用Element Plus官方组件库进行UI封装
2. **选择最接近样式**：当有多种UI实现方案时，选择样式最接近V1.1的方案
3. **差异后续整改**：UI样式与V1.1的细节差异记录在案，后续专项统一调整
4. **保持颜色一致**：Element Plus主题色必须配置为与V1.1一致的颜色（#059669等）

### 迁移检查清单（每次迁移前必读）

- [ ] 确认V1.1源文件路径和内容
- [ ] 确认V2.0目标文件路径
- [ ] 逐文件进行1:1映射转换
- [ ] 验证业务逻辑完全一致
- [ ] 验证交互行为与V1.1完全一致
- [ ] 验证API调用与V1.1完全一致
- [ ] UI样式差异记录待后续整改

### 禁止事项

- ❌ 禁止跳过任何V1.1文件不迁移
- ❌ 禁止简化或省略任何业务逻辑
- ❌ 禁止改变V1.1的交互流程
- ❌ 禁止改变API端点和数据结构

### Bug修复规范

**【强制规则】每次修复bug前，必须执行以下步骤：**

1. **查找V1.1源文件** - 在 `D:\TMcrop\yuanxingtu\V1.1` 中找到对应的React组件文件
2. **查看实际代码** - 读取V1.1的jsx/ts文件，获取正确的功能逻辑
3. **对比V2.0代码** - 找出V2.0与V1.1的逻辑差异点
4. **原样修复** - 按照V1.1的逻辑修复，确保功能一致

---

## 🧪 扩展对比检查清单（V2.0 深度校验框架）

**【强制规则】每次对比V1.1和V2.0文件时，必须逐维度检查，禁止只检查UI/样式差异：**

> 📌 **检查清单文档位置**：`docs/superpowers/specs/V2-MIGRATION-CHECKLIST.md`
>
> 该文档包含完整的**13大类 × 96维度 × 200+检查点**清单，是本章节的完整版本。
> 本章节仅为摘要导读，完整检查必须参照上述文档。
>
> ⚠️ **【强制】必须执行U系列UI元素完整性检查**：
> - 逐个统计V1.1页面的button/可点击元素数量
> - 逐个对比每个按钮的文案和位置
> - 检查每个功能入口是否存在（配置基地架构等按钮遗漏）
> - U系列是防止按钮/入口丢失的关键检查

---

### 一、数据正确性（Data Integrity）

| 维度 | 检查内容 | 优先级 |
|------|---------|--------|
| **D1. API端点** | URL路径、HTTP方法、query参数、body参数名/个数完全一致 | P0 |
| **D2. API响应结构** | 响应数据的字段名、类型、嵌套结构与前端消费完全匹配 | P0 |
| **D3. Store状态** | state初始值、getter计算逻辑、action处理逻辑与V1.1一致 | P0 |
| **D4. 数据边界** | 超长字符串(>255)、超大数字、超大数组(>1000)、特殊Unicode字符 | P1 |
| **D5. 数值精度** | 货币计算精度(0.1+0.2问题)、浮点数比较、百分号处理 | P1 |
| **D6. 时间日期** | 时区、夏令时、跨年/跨月边界、日期格式化字符串 | P1 |
| **D7. 乐观更新** | 成功/失败回滚逻辑、并发冲突处理 | P1 |

### 二、业务逻辑正确性（Business Logic）

| 维度 | 检查内容 | 优先级 |
|------|---------|--------|
| **B1. 弹窗字段** | 字段名、label、placeholder、默认值、必填校验规则完全一致 | P0 |
| **B2. 业务计算** | 指标计算公式、聚合逻辑、排序规则与V1.1完全一致 | P0 |
| **B3. 状态机流转** | 审核流程、审批流程的状态节点和转换条件完整 | P1 |
| **B4. 批量操作** | 批量删除/审批的原子性、全选/取消全选联动 | P1 |
| **B5. 导入导出** | 文件格式校验、大小限制、必填字段、导出完整性 | P1 |
| **B6. 表单暂存** | 填写一半刷新是否保留、暂存数据与最终提交一致性 | P2 |

### 三、交互行为正确性（Interaction Behavior）

| 维度 | 检查内容 | 优先级 |
|------|---------|--------|
| **I1. 事件链路** | 点击→API→状态更新→UI响应的完整链路逐个对比 | P0 |
| **I2. 键盘操作** | Tab顺序、Enter确认、Escape取消、快捷键与V1.1一致 | P1 |
| **I3. 鼠标操作** | 右键菜单、双击、拖拽、拖拽中断恢复 | P1 |
| **I4. 多选联动** | 全选/取消全选、跨页多选、选中状态与URL同步 | P1 |
| **I5. 路由导航** | 页面跳转、参数传递、返回恢复、浏览器前进后退 | P1 |
| **I6. 标签页状态** | 切换标签数据保留、刷新重置、URL同步 | P2 |

### 四、组件状态正确性（Component States）

| 维度 | 检查内容 | 优先级 |
|------|---------|--------|
| **S1. 加载态** | skeleton/loading动画/进度条与V1.1一致 | P0 |
| **S2. 空态** | 无数据时的提示文案、插图、引导操作 | P0 |
| **S3. 错误态** | 网络错误/服务不可用/权限不足的提示和操作 | P0 |
| **S4. 超时态** | 长时间无响应的超时处理和用户提示 | P1 |
| **S5. 成功态** | 操作完成的反馈方式、跳转行为 | P1 |
| **S6. 边界态** | 数据量为0/1/最大值的展示和处理 | P1 |

### ⚠️ 【强制】UI元素完整性（U系列）- 防止按钮/入口遗漏

| 维度 | 检查内容 | 优先级 |
|------|---------|--------|
| **U1. 按钮数量** | 逐个统计V1.1的button/el-button数量，V2.0必须有相同数量 | P0 |
| **U2. 按钮文案** | 每个按钮的文字逐字对比，不能有任何差异 | P0 |
| **U3. 按钮位置** | 按钮在页面中的位置顺序与V1.1一致 | P1 |
| **U4. 链接入口** | 每个可跳转的链接/按钮必须存在（如"配置基地架构"按钮） | P0 |
| **U5. 图标对比** | 每个图标是否存在且size/color一致 | P1 |
| **U6. 布局区块** | 页面所有区块/card数量与V1.1一致 | P0 |
| **U7. 功能入口** | V1.1中所有的功能入口按钮/链接，V2.0必须有对应入口 | P0 |
| **U8. 弹窗元素** | 弹窗trigger、字段、按钮文案与V1.1一致 | P1 |

**【案例教训】园区导览页面V1.1有"配置基地架构"按钮，V2.0完全缺失 → 必须在U4/U7中检查**

### 五、路由与权限（Route & Permission）

| 维度 | 检查内容 | 优先级 |
|------|---------|--------|
| **R1. 路由拓扑** | 路由层级、嵌套关系、redirect规则、layout包裹 | P0 |
| **R2. URL参数** | params/query的解析和使用方式 | P0 |
| **R3. 权限守卫** | 路由守卫的判断条件、跳转逻辑 | P0 |
| **R4. 角色UI差异** | 不同角色看到的按钮/字段/数据差异 | P1 |
| **R5. 接口越权** | 绕前端直接调API的防护检查 | P1 |
| **R6. 数据级权限** | 只能看到自己有权限的数据 | P1 |

### 六、安全与容错（Security & Fault Tolerance）

| 维度 | 检查内容 | 优先级 |
|------|---------|--------|
| **F1. SQL注入** | 参数化查询、特殊字符转义 | P0 |
| **F2. XSS防护** | 用户输入HTML/JS转义、富文本处理 | P0 |
| **F3. CSRF防护** | Token验证、请求来源校验 | P1 |
| **F4. 敏感数据** | 日志脱敏、导出脱敏、密码不可见 | P1 |
| **F5. 网络重试** | 超时重试次数、间隔、退避策略 | P1 |
| **F6. 断网恢复** | 离线数据暂存、恢复后同步 | P2 |
| **F7. 操作审计** | 关键操作的日志记录 | P2 |

### 七、性能与资源（Performance）

| 维度 | 检查内容 | 优先级 |
|------|---------|--------|
| **P1. 首屏加载** | 首次加载时间与V1.1对比 | P1 |
| **P2. 大数据量** | 千行表格渲染、虚拟滚动、分页加载 | P1 |
| **P3. 内存泄漏** | 定时器清理、事件订阅取消、离开页面清理 | P1 |
| **P4. 请求优化** | 防抖/节流、重复请求取消、缓存策略 | P1 |
| **P5. 图片资源** | 懒加载、尺寸预知、格式优化 | P2 |

### 八、可访问性与适配（Accessibility & Responsive）

| 维度 | 检查内容 | 优先级 |
|------|---------|--------|
| **A1. 键盘操作** | 完全可用键盘操作、焦点管理 | P1 |
| **A2. 屏幕阅读** | ARIA标签、角色定义、描述文字 | P1 |
| **A3. 色彩对比** | 文字/背景对比度满足WCAG标准 | P1 |
| **A4. 减弱动画** | 尊重系统减弱动画偏好 | P2 |
| **A5. 响应式** | 1920/1440/1366/768/375各分辨率布局 | P1 |
| **A6. 超长截断** | 表格文本/标题/提示的省略号处理 | P1 |
| **A7. 打印样式** | 打印预览的布局和内容完整性 | P2 |

### 九、错误处理完整性（Error Handling）

| 维度 | 检查内容 | 优先级 |
|------|---------|--------|
| **E1. try/catch** | 所有async操作的完整异常捕获 | P0 |
| **E2. 空值保护** | undefined/null的链式调用保护、数组空检查 | P0 |
| **E3. 类型转换** | 隐式类型转换、JSON.parse失败处理 | P1 |
| **E4. 降级策略** | 第三方服务失败时的降级方案 | P1 |
| **E5. 用户提示** | 错误时的ElMessage/弹窗提示 | P0 |

---

### 执行流程（扩展维度版）

```
1. 读取完整检查清单：docs/superpowers/specs/V2-MIGRATION-CHECKLIST.md
2. 按模块分组执行检查，每个模块产出《差异报告》
3. 差异分类：P0(阻断)/P1(严重)/P2(一般)
4. P0必须全部修复后才能通过检查
5. P1/P2按优先级排入修复计划
6. 每个模块检查完成后更新系统地图
```

### 禁止事项

- ❌ 禁止只检查UI/样式差异
- ❌ 禁止跳过P0级别的差异
- ❌ 禁止不读完整检查清单就声称"检查完成"
- ❌ 禁止在依赖未就绪时迁移上层组件
- ❌ 禁止不更新系统地图标记

---

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore


ule 1: Think Before Coding
State your assumptions explicitly; ask questions instead of guessing when uncertain; surface tradeoffs by listing pros and cons of multiple approaches; push back if a simpler method exists.

Rule 2: Simplicity First
Write only the minimum code needed to solve the problem; no speculative features; no abstractions for single-use logic; if a senior engineer would call it over-engineered—simplify it.

Rule 3: Surgical Changes
Only touch what must be changed; don't "improve" unrelated code, comments, or formatting on the side; don't refactor what isn't broken; match the existing style.

Rule 4: Goal-Driven Execution
Define success criteria and loop until they are verified; don't tell Claude what steps to take—define what success looks like and let it iterate; if the goal can be reached in fewer steps, use fewer steps.

II. 8 Advanced Rules (for AI Agent Collaboration)
Rule 5: No Non-Language Work for the Model
Deterministic decisions—retry policies, routing logic, threshold checks, escalation rules—must be explicit code (conditionals, config values, lookup tables); if the answer is the same every time, it's not a language task; the model handles only classification, summarization, drafting, and ambiguity resolution.

Rule 6: Hard Token Budgets, No Exceptions
Every iteration loop (debugging, refactoring, generation) must have a defined budget (max iterations, max tokens, or max time), with specific values set per project. Stop immediately and present current results when the budget is exhausted; do not re-suggest a fix that has already been rejected.

Rule 7: Surface Conflicts, Don't Blend
When the codebase has two contradictory patterns, call out the conflict explicitly ("Module A uses pattern X, Module B uses pattern Y. Which should the new code follow?") and wait for a human decision; never blend the two patterns, and never choose on your own.

Rule 8: Read Before You Write
Before adding code, read the current file and its import graph; check whether an identical function, utility, or constant already exists; if a duplicate implementation exists, use it—don't create a second version.

Rule 9: Tests Are Required, but Not the Goal
Tests must verify meaningful properties of correct behavior (values, structure, side effects, error types), not merely that "the function returns something" or "doesn't throw"; "all tests pass" is necessary but not sufficient; flag it explicitly when tests are too weak.

Rule 10: Checkpoints for Long Tasks
Any task spanning more than 3 steps or touching more than 3 files requires a checkpoint after each step (what was done + what changed + current state); roll back to the last checkpoint if a step fails—don't build on a broken state; if you lose track of the overall logic, stop immediately and restate.

Rule 11: Convention Beats Novelty
Even if you think your approach is better, follow the codebase's existing naming and architectural conventions (e.g., snake_case vs camelCase); introducing a second pattern is worse than either pattern alone; if you believe a convention should change, propose it explicitly and wait for approval before acting.

Rule 12: Fail Loud
Errors must be thrown, returned, or reported—never swallowed or hidden behind default values; when migrations, batch jobs, or loops skip records, the skip count and reasons must appear in the output, not buried in logs; if you cannot confirm 100% success, say so explicitly—silent "default success" is forbidden.




<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->
