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

1. **组件模式**：所有数据、配置、枚举值必须从mockData或types中导入使用
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
