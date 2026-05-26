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
- 良好的TypeScript类型定义

**第三优先：UI适配（可后续统一调整）**
- 允许使用Element Plus封装UI组件
- 样式选择最接近V1.1的实现方案
- UI细节差异待后续专项整改

---

## 技术栈

- 前端：Vue3 + TypeScript + Vite + Element Plus + Tailwind CSS
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

## 🧪 深度对比检查清单（铁律 - 每次文件对比强制执行）

**【强制规则】每次对比V1.1和V2.0文件时，必须逐维度检查，禁止只检查UI/样式差异：**

### 12维度检查清单

**【强制规则】迁移任何文件前，必须先读取系统全景地图 `docs/superpowers/specs/V1.1-SYSTEM-MAP.md`，确认当前文件在系统中的位置、上下游依赖、所属路由。**

#### 单文件级（维度1-6）

| 维度 | 检查内容 | 检查方法 |
|------|---------|---------|
| **1. 数据源** | API调用端点、参数名、参数个数、Store使用、props传递、computed依赖 | 对比每个API调用：URL路径、query/body参数名是否一致；Store中的state/getter/action是否对应 |
| **2. 状态流转** | 所有state/props的初始值、所有可能状态分支 | 对比 ref/reactive 初始值；确认加载态/空态/错误态/边界值/正常态5种状态是否都有处理 |
| **3. 弹窗逻辑** | 每个弹窗的所有字段、校验规则、提交/取消行为、弹窗嵌套 | 逐字段对比弹窗表单：字段名、label、placeholder、校验条件、提交API参数映射、关闭后的状态清理 |
| **4. 事件处理** | 每个@click/@change的完整链路：调了什么API → 更新了什么状态 → UI如何响应 | 从V1.1的事件处理函数追踪到API调用→state更新→UI更新的完整链路，逐链对比V2.0 |
| **5. 条件渲染** | 所有v-if/v-show/v-for的条件表达式、分支逻辑 | 对比每个条件分支的触发条件和渲染结果，确认边界条件完整 |
| **6. 错误处理** | try/catch、fallback数据、ElMessage提示、空数组兜底 | 对比每个API调用的错误处理：catch中有没有fallback、有没有用户提示、有没有localStorage回退 |

#### 跨文件/系统级（维度7-12）

| 维度 | 检查内容 | 检查方法 |
|------|---------|---------|
| **7. 路由拓扑** | 135条路由的完整层级、嵌套路由、路由守卫、redirect规则、URL参数约定 | 对比V1.1 App.tsx中每个Route的path与V2.0 router/index.js；确认嵌套路由的父子关系、layout组件包裹、权限守卫完全一致 |
| **8. 组件依赖图** | 每个文件的import链：被谁引用、引用了谁、Store依赖链、composable依赖链 | 从系统地图确认：迁移组件A前，A依赖的所有Store/Composable/子组件必须先完成迁移并验证通过；迁移后更新地图标记 |
| **9. 跨页面数据流** | 页面跳转时的数据传递方式（route params / query string / Store共享 / localStorage / sessionStorage）、返回上一页时的状态恢复逻辑 | 追踪V1.1中每个`navigate()`调用：跳转目标页面、传递的参数名和类型、目标页面如何消费参数、返回时源页面如何恢复状态 |
| **10. API契约一致性** | 同一API端点在不同组件中的调用方式（方法、参数名、请求体结构、响应结构、错误码处理）必须一致 | 从系统地图的API索引反向检查：列出所有调用同一API的组件，对比它们的入参/出参处理逻辑 |
| **11. 权限/角色分支** | 不同角色看到的UI差异、可执行的操作差异、路由守卫的权限规则 | 枚举V1.1中所有权限检查点（ActionGuard/PermissionGuard/条件渲染），逐点对比V2.0是否实现 |
| **12. 生命周期副作用** | onMounted/onUnmounted/watch/watchEffect中触发的异步请求、定时器/interval、事件订阅/取消订阅、DOM操作 | 对比V1.1 useEffect的依赖数组和cleanup函数，确认V2.0的watch/onMounted/onUnmounted逻辑完全对应 |

### V1.1系统全景地图（迁移前置依赖）

**【强制规则】迁移任何模块前，必须先确认系统全景地图 `docs/superpowers/specs/V1.1-SYSTEM-MAP.md` 已存在且完整。该地图是后续所有迁移的唯一权威参考。**

系统地图必须包含（按路由分组）：
1. **路由清单** — 135条路由的完整列表（path、页面组件、layout、守卫、redirect）
2. **组件依赖图** — 每个路由下所有组件的import树（深度遍历到叶子组件）
3. **Store依赖矩阵** — 每个路由使用了哪些Store，每个Store被哪些路由使用
4. **API调用索引** — 每个API端点被哪些文件调用，调用参数和响应结构
5. **跨页面数据流图** — 页面间导航的数据传递方式（params/query/store/localStorage）
6. **权限检查点清单** — 所有权限判断逻辑的位置和条件

### 迁移执行流程（12维度）

```
0. 确认系统全景地图已存在且已读取 ← 【新增前置步骤】
1. 从地图中确认当前文件的上下游依赖、所属路由、关联Store/API
2. 读V1.1源文件 → 提取所有12维度的信息（单文件6维 + 跨文件6维）
3. 读V2.0对应文件 → 逐维度对比每个逻辑点
4. 列出差异清单 → 按维度标记 MISSING / DIFFERENT / BUG / OK
5. 逐项修复 → 每修一个勾一个，修复完成后再build验证
6. 验证跨文件一致性 → 确认修改不影响上游调用者，下游依赖已就绪
7. 更新系统地图 → 标记该文件为"已迁移验证"
```

### 禁止事项

- ❌ 禁止只检查UI/样式差异就说"已修复"
- ❌ 禁止不追踪API调用链就下结论
- ❌ 禁止不检查弹窗内部字段和逻辑
- ❌ 禁止不验证后端数据格式与前端是否匹配
- ❌ 禁止跳过错误处理和fallback逻辑的对比
- ❌ 禁止不读系统全景地图就开始迁移任何文件 ← 【新增】
- ❌ 禁止在依赖的Store/子组件未迁移前迁移上层组件 ← 【新增】
- ❌ 禁止迁移完成后不更新系统地图标记 ← 【新增】

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
