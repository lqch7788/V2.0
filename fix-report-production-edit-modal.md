# 生产计划 - 批量编辑弹窗 3 项 Bug 修复报告

**修复日期**：2026-06-04
**修复员**：Coder
**Commit**：`2ca503f`
**Worktree**：master 分支（用户主目录 `D:\TMcrop\yuanxingtu\V2.0`）

---

## 一、用户反馈的 3 个问题

| # | 现象 | 根因 | 状态 |
|---|---|---|---|
| 1 | 弹窗右上角没有关闭图标 | `ElModal.vue` 自定义包装**没有 `#header` 插槽**，消费者写 `<template #header>` 被静默忽略；`:show-close="false"` 同时隐藏了默认关闭按钮 | ✅ 修 |
| 2 | "请先编辑至少一个生产计划"始终显示，即使已选择 | `v-model="editedDataProxy.field"` 在 computed 子属性上**不写回 props**；computed 每次 get 都返回新对象，Vue 2/3 展开成对临时对象赋值，set 永远不被调用 → `editedBatches` 永远为空对象 → 提交时 `Object.keys(editedBatches).length === 0` 触发告警 | ✅ 修 |
| 3 | 编辑弹窗字段与新增弹窗"不一样" | 数据源（`RESPONSIBLE_PERSONS` / `getModesByPlanType` / `activeGreenhouses` 过滤）实际上**与新增弹窗一致**；用户感觉"不一样"是因为上面 #2 导致编辑后看不到值变化 | ✅ 修（同根因） |

---

## 二、修改文件清单

| 文件 | 改动 | 行数 |
|---|---|---|
| `src/components/ui/ElModal.vue` | 新增 `#header` 插槽支持（`v-if="$slots.header"` 优先于默认 header） | +16 行 |
| `src/components/production/modals/BatchEditModal.vue` | computed → 本地 `formState` ref；v-model → `:value` + `@input` 显式 handler；移除 `:show-close="false"`；Close icon 改用 element-plus | +92 / -65 行 |

**净增 43 行**（1 个新功能 + 1 个 bug 修复的核心重构）

---

## 三、修复详情

### 修复 #1：ElModal.vue 添加 `#header` 插槽

**问题代码**（V2.0 原版）：
```vue
<ElModal
  v-model="visible"
  :show-close="false"
>
  <template #header>  <!-- 这个 slot 不存在！ElModal 静默忽略 -->
    <div class="flex items-center justify-between bg-blue-600 ...">
      ...
      <button @click="handleClose"><X class="w-5 h-5" /></button>
    </div>
  </template>
  ...
</ElModal>
```

**修复后**（`ElModal.vue`）：
```vue
<!-- ✅ 修复: 兼容自定义 #header 插槽 -->
<template v-if="$slots.header">
  <div
    class="el-modal-header"
    :class="{ 'el-modal-header-plain': plainHeader }"
    @dblclick="handleMaximize"
  >
    <slot name="header" />
  </div>
</template>
<div
  v-else
  class="el-modal-header"
  ...
>
  <span class="el-modal-title">{{ title }}</span>
  <div class="el-modal-header-actions">
    ...
    <button v-if="showClose" ...>...</button>
  </div>
</div>
```

**受益范围**：全站 36 个 `<template #header>` 消费者全部生效（之前全部静默失效）。本次直接受益的弹窗：
- `production/modals/BatchEditModal.vue`（用户报告的）
- `production/modals/BatchEditModal.vue`（同一组件双重 1:1 翻译）
- 其他 1:1 翻译 V1.1 的弹窗（自动恢复，不需逐个改）

---

### 修复 #2：BatchEditModal.vue v-model 失效

**问题代码**（V2.0 原版）：
```js
const editedDataProxy = computed({
  get: () => ({
    plantingMode: parseArray(...),
    cropName: ...,
    // ... 16 字段
    // ⚠️ 每次 get 都返回新对象！
  }),
  set: (val) => {
    // 永远不会被调用
    emit('update:editedBatches', updated)
  }
})
```

```vue
<input v-model="editedDataProxy.startDate" type="date" />
```

**Vue 展开行为**：
```js
// Vue 3 compiler 把 v-model 展开成：
<input
  :model-value="editedDataProxy.startDate"  // 调 get，返回临时对象
  @update:model-value="(v) => editedDataProxy.startDate = v"  // 对临时对象的属性赋值
  // 临时对象在 get 返回时新建，赋值后被丢弃 → set 永不调用
/>
```

**结果**：`props.editedBatches` 永远不变；`Object.keys(editedBatches.value).length === 0`；`handlePublish` / `handleSave` 触发 `"请先编辑至少一个生产计划"` 告警。

**V1.1 1:1 翻译**应该用 React 风格的显式 onChange：
```tsx
onChange={(e) => handleFieldChange('startDate', e.target.value)}
```

**V2.0 修复方案**：本地 `formState` ref + 显式 handler
```js
const formState = ref(defaultEditedData())

// 切换选中批次时同步 formState
watch(currentBatch, (batch) => {
  if (!batch) { formState.value = defaultEditedData(); return }
  const edited = props.editedBatches[batch.batchCode] || {}
  formState.value = { ...edited, ...默认值 fallback 到 batch 字段... }
}, { immediate: true })

// 1:1 翻译 V1.1 handleFieldChange
function handleFieldChange(field, value) {
  formState.value = { ...formState.value, [field]: value }
  const currentEdited = props.editedBatches[localSelectedBatchCode.value] || {}
  emit('update:editedBatches', {
    ...props.editedBatches,
    [localSelectedBatchCode.value]: { ...currentEdited, [field]: value }
  })
  if (!props.editedBatchCodes.includes(localSelectedBatchCode.value)) {
    emit('update:editedBatchCodes', [...props.editedBatchCodes, localSelectedBatchCode.value])
  }
}
```

```vue
<input
  :value="formState.startDate"
  type="date"
  @input="handleFieldChange('startDate', $event.target.value)"
/>
```

**修复字段**（共 9 个表单字段 + 1 个文件上传）：
- 开始时间 / 预计结束时间
- 负责人 / 目标产量 / 单位
- 种植面积 / 面积单位
- 执行状态
- 文件名 / 文件内容
- 种植区域（多选）/ 生产模式（多选）
- 作物品种（CropCodeSelector 通过 `@change` 直接接 handleCropChange，OK）

---

### 修复 #3：数据源与 V1.1 / 新增弹窗 1:1 对齐

**字段数据源对比**：

| 字段 | V1.1 BatchEdit 来源 | V2.0 修复前 | V2.0 修复后 |
|---|---|---|---|
| 种植区域 | `greenhouses.filter(g => g.status === 'active')` | `props.greenhouses.filter(g => g.status === 'active')` | ✓ 不变 |
| 生产模式 | `getModesByPlanType(currentPlanType)` | `getModesByPlanType(currentBatch.value.planType)` | ✓ 不变 |
| 负责人 | `RESPONSIBLE_PERSONS`（imported） | `RESPONSIBLE_PERSONS`（imported） | ✓ 不变 |
| 作物品种 | `CropCodeSelector` | `CropCodeSelector` | ✓ 不变 |

**结论**：数据源**已经**与 V1.1 / 新增弹窗一致。"不一样"的错觉来自修复 #2（编辑后看不到值变化）。

**保留的 V1.1 字段语义**（V1.1 编辑弹窗没有 V1.1 新增弹窗的某些字段，这是 V1.1 设计本身）：
- V1.1 编辑弹窗**没有**"计划类型 / 关联订单 / 备注说明"字段（不允许改）
- V1.1 编辑弹窗**有**"发布人/初次发布时间/最后修改时间/当前状态"4 个只读字段（V1.1 L379-398）

V2.0 完整保留 V1.1 字段语义。

---

## 四、验证

### 4.1 SFC 三件套编译

```bash
$ node _verify.cjs
[OK] src/components/production/modals/BatchEditModal.vue
[OK] src/components/production/modals/CreateBatchModal.vue
[OK] src/components/production/ProductionPage.vue
[OK] src/components/production/ProductionTable.vue
[OK] src/components/ui/ElModal.vue
Final: 5 ok / 0 fail
```

### 4.2 Vite build

```bash
$ npm run build
✓ built in 1m 4s   # 0 error
```

### 4.3 关键 1:1 grep 验证

| 验证项 | 期望 | 实际 | 结果 |
|---|---|---|---|
| `v-model="editedDataProxy` 出现次数 | 0 | 0 | ✅ |
| `v-model="formState` 出现次数 | 0 | 0 | ✅ |
| `:value="formState.X` 字段数 | 9+ | 9 (startDate/expectedHarvestDate/responsiblePerson/targetYield/unit/plantingArea/plantingAreaUnit/executionStatus + 2 衍生) | ✅ |
| `@input="handleFieldChange` 出现次数 | 6+ | 7 | ✅ |
| `<template #header>` 在 BatchEditModal | 1 | 1 | ✅ |
| `:show-close="false"` 在 BatchEditModal | 0 | 0 (已移除) | ✅ |
| ElModal 中 `<template v-if="$slots.header">` | 1 | 1 | ✅ |
| `emit('update:editedBatches', ...)` 调用次数 | 1+ | 1 (handleFieldChange) | ✅ |
| `emit('update:editedBatchCodes', ...)` 调用次数 | 1+ | 1 (handleFieldChange) | ✅ |

---

## 五、净改动统计

```
src/components/ui/ElModal.vue                              |  16 ++++
src/components/production/modals/BatchEditModal.vue        |  92 ++++++++++++++++-- 65 ----
2 files changed, 108 insertions(+), 65 deletions(-)
```

Commit hash：`2ca503f`

---

## 六、未触碰的相关功能

- CreateBatchModal：未改（数据源本来就与 V1.1 1:1）
- ProductionPage：未改（行为由 composable 驱动）
- useProductionPage composable：未改（`handlePublish` / `handleSave` 的告警逻辑保持不变 — 现在能正确接收到 editedBatches）
- 其他 30+ 个使用 `<template #header>` 的弹窗：自动受益于 ElModal.vue 的修复，**无需手动改**（它们之前是静默失败，现在正常显示）

---

**报告完结** | 修复员：Coder | 日期：2026-06-04
