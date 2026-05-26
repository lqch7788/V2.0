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

### 6维度检查清单

| 维度 | 检查内容 | 检查方法 |
|------|---------|---------|
| **1. 数据源** | API调用端点、参数名、参数个数、Store使用、props传递、computed依赖 | 对比每个API调用：URL路径、query/body参数名是否一致；Store中的state/getter/action是否对应 |
| **2. 状态流转** | 所有state/props的初始值、所有可能状态分支 | 对比 ref/reactive 初始值；确认加载态/空态/错误态/边界值/正常态5种状态是否都有处理 |
| **3. 弹窗逻辑** | 每个弹窗的所有字段、校验规则、提交/取消行为、弹窗嵌套 | 逐字段对比弹窗表单：字段名、label、placeholder、校验条件、提交API参数映射、关闭后的状态清理 |
| **4. 事件处理** | 每个@click/@change的完整链路：调了什么API → 更新了什么状态 → UI如何响应 | 从V1.1的事件处理函数追踪到API调用→state更新→UI更新的完整链路，逐链对比V2.0 |
| **5. 条件渲染** | 所有v-if/v-show/v-for的条件表达式、分支逻辑 | 对比每个条件分支的触发条件和渲染结果，确认边界条件完整 |
| **6. 错误处理** | try/catch、fallback数据、ElMessage提示、空数组兜底 | 对比每个API调用的错误处理：catch中有没有fallback、有没有用户提示、有没有localStorage回退 |

### 执行流程

```
1. 读V1.1源文件 → 提取所有: API调用、state、事件处理函数、条件分支、弹窗
2. 读V2.0对应文件 → 逐维度对比每个逻辑点
3. 列出差异清单 → 按维度标记 MISSING / DIFFERENT / BUG / OK
4. 逐项修复 → 每修一个勾一个，修复完成后再build验证
```

### 禁止事项

- ❌ 禁止只检查UI/样式差异就说"已修复"
- ❌ 禁止不追踪API调用链就下结论
- ❌ 禁止不检查弹窗内部字段和逻辑
- ❌ 禁止不验证后端数据格式与前端是否匹配
- ❌ 禁止跳过错误处理和fallback逻辑的对比

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
