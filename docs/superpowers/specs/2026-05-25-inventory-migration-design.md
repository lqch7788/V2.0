# 库存管理模块迁移设计文档

**创建时间**: 2026-05-25
**项目**: V1.1 → V2.0 库存管理模块迁移
**状态**: 已批准
**版本**: V1.0

---

## 一、背景与目标

### 1.1 问题描述

V2.0项目的库存管理模块之前通过AI子代理进行了部分迁移，但存在以下严重问题：

1. **功能丢失**：大量V1.1功能未被迁移
2. **内容造假**：子代理自行创造了部分页面内容，而非从V1.1严格迁移
3. **质量缺陷**：创建的页面存在语法错误，无法正常运行
4. **架构不完整**：缺少关键的Store层和类型定义

### 1.2 迁移原则

| 原则 | 说明 |
|------|------|
| **逐文件对照** | 每个V2.0文件必须有明确的V1.1源文件 |
| **禁止自创** | 除非V1.1中不存在，否则不得自行创建新功能 |
| **完整迁移** | 保持V3.0统一库存架构的完整性 |
| **功能验证** | 每迁移一个模块，对照V1.1进行功能测试 |

### 1.3 迁移范围

V1.1库存管理模块包含**7个子模块**：

| 序号 | 子模块 | V1.1文件数 | 说明 |
|------|--------|------------|------|
| 1 | 采收产品库存 | ~10个 | 采收入库的成品库存管理 |
| 2 | V3.0统一库存 | ~15个 | 核心库存架构（instance_id追溯、事务日志、冻结管理、乐观锁） |
| 3 | 物料管理 | ~25个 | 农药、化肥、工具等物料管理 |
| 4 | 物料领用 | ~20个 | 领用申请、执行和统计 |
| 5 | 物料退库 | ~15个 | 物料退库处理 |
| 6 | 物料分类 | ~5个 | 物料分类维护 |
| 7 | 仓库管理 | ~10个 | 仓库基础设施管理和入库作业 |

---

## 二、V1.1 源文件完整清单

### 2.1 页面文件 (.tsx → .vue)

#### 主页面

| V1.1源文件路径 | V2.0目标文件路径 | 功能 |
|----------------|------------------|------|
| `src/pages/InventoryV3.tsx` | `src/views/inventory/InventoryV3.vue` | V3.0统一库存主页 |
| `src/pages/ProduceInventory.tsx` | `src/views/inventory/ProduceInventory.vue` | 采收产品库存 |
| `src/pages/Materials.tsx` | `src/views/material/Materials.vue` | 物料管理主页 |
| `src/pages/warehouse/WarehouseInboundPage.tsx` | `src/views/warehouse/WarehouseInbound.vue` | 仓库入库 |
| `src/pages/warehouse/WarehouseOverviewPage.tsx` | `src/views/warehouse/WarehouseOverview.vue` | 仓库概览 |
| `src/components/materialReturn/MaterialReturnPage.tsx` | `src/views/material/MaterialReturn.vue` | 物料退库 |
| `src/components/materialReceiving/MaterialReceivingPage.tsx` | `src/views/material/MaterialReceiving.vue` | 物料领用 |
| `src/components/materialCategory/materialCategoryPage.tsx` | `src/views/material/MaterialCategory.vue` | 物料分类 |

### 2.2 组件文件 (.tsx → .vue)

#### 物料管理组件 (materials/)

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `MaterialsTable.tsx` | `MaterialsTable.vue` | 物料表格 |
| `MaterialsFilters.tsx` | `MaterialsFilters.vue` | 物料筛选 |
| `MaterialsHeader.tsx` | `MaterialsHeader.vue` | 页面头部 |
| `MaterialsCodeGenerator.tsx` | `MaterialsCodeGenerator.vue` | 编码生成器 |
| `InboundTable.tsx` | `InboundTable.vue` | 入库记录表 |
| `AddInboundModal.tsx` | `AddInboundModal.vue` | 新增进库弹窗 |
| `ExportFormatModal.tsx` | `ExportFormatModal.vue` | 导出格式弹窗 |
| `modals/*.tsx` (18个) | `modals/*.vue` | 增删改查弹窗 |

#### 采收库存组件 (inventory/)

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `ProduceInventoryPage.tsx` | `ProduceInventoryPage.vue` | 采收库存主页 |
| `ProduceInventoryToolbar.tsx` | `ProduceInventoryToolbar.vue` | 工具栏 |
| `ProduceInventoryAddModal.tsx` | `ProduceInventoryAddModal.vue` | 新增弹窗 |
| `ProduceInventoryBatchEditModal.tsx` | `ProduceInventoryBatchEditModal.vue` | 批量编辑弹窗 |
| `ProduceDetailModal.tsx` | `ProduceDetailModal.vue` | 详情弹窗 |
| `ActionToolbar.tsx` | `ActionToolbar.vue` | 操作工具栏 |
| `BatchDeleteConfirmDialog.tsx` | `BatchDeleteConfirmDialog.vue` | 批量删除确认 |
| `InboundModals.tsx` | `InboundModals.vue` | 入库弹窗集合 |
| `OutboundModal.tsx` | `OutboundModal.vue` | 出库弹窗 |
| `MaterialFilters.tsx` | `MaterialFilters.vue` | 筛选组件 |
| `TabSwitch.tsx` | `TabSwitch.vue` | Tab切换 |

#### 物料领用组件 (materialReceiving/)

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `MaterialReceivingPage.tsx` | `MaterialReceivingPage.vue` | 领用主页 |
| `ApplicationTab.tsx` | `ApplicationTab.vue` | 申请Tab |
| `ExecuteTab.tsx` | `ExecuteTab.vue` | 执行Tab |
| `StatisticsTab.tsx` | `StatisticsTab.vue` | 统计Tab |
| `MaterialReceivingHeader.tsx` | `MaterialReceivingHeader.vue` | 页面头部 |
| `modals/*.tsx` (18个) | `modals/*.vue` | 弹窗组件 |

#### 物料退库组件 (materialReturn/)

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `MaterialReturnPage.tsx` | `MaterialReturnPage.vue` | 退库主页 |
| `MaterialReturnTable.tsx` | `MaterialReturnTable.vue` | 退库记录表 |
| `MaterialReturnSearch.tsx` | `MaterialReturnSearch.vue` | 搜索组件 |
| `MaterialReturnHeader.tsx` | `MaterialReturnHeader.vue` | 页面头部 |
| `modals/*.tsx` (11个) | `modals/*.vue` | 弹窗组件 |

#### 仪表盘组件

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `InventoryAlertCard.tsx` | `InventoryAlertCard.vue` | 库存预警卡片 |

### 2.3 Store文件 (.ts → .ts)

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `useInboundStore.ts` | `useInboundStore.js` | 入库记录状态 |
| `useMaterialReturnStore.ts` | `useMaterialReturnStore.js` | 退库状态 |
| `useWarehouseMaterialStore.ts` | `useWarehouseMaterialStore.js` | 仓库物料状态 |
| `useWarehouseStore.ts` | `useWarehouseStore.js` | 仓库状态 |
| `useMaterialTypeStore.ts` | `useMaterialTypeStore.js` | 物料类型状态 |

### 2.4 Service文件

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `inventoryService.ts` | `inventory/inventoryService.js` | V3.0核心库存服务 |
| `inventoryIntegration.ts` | `inventory/inventoryIntegration.js` | 模块集成层 |
| `apiInventoryService.ts` | `inventory/apiInventoryService.js` | 库存API |
| `apiWarehouseMaterialService.ts` | `material/apiWarehouseMaterialService.js` | 物料API |
| `apiMaterialReturnService.ts` | `material/apiMaterialReturnService.js` | 退库API |
| `warehouseService.ts` | `warehouse/warehouseService.js` | 仓库API |

### 2.5 类型定义文件

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `types/inventory.ts` | `types/inventory.js` | 核心库存类型 |
| `types/warehouseInbound.types.ts` | `types/warehouseInbound.js` | 入库类型 |
| `components/materials/types.ts` | `types/materials.js` | 物料类型 |

### 2.6 后端文件

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `server/src/services/inventory.service.ts` | `server/src/services/inventory.service.js` | 库存服务 |
| `server/src/repositories/inventory.repository.ts` | `server/src/repositories/inventory.repository.js` | 库存Repository |
| `server/src/repositories/inventory-tx.repository.ts` | `server/src/repositories/inventory-tx.repository.js` | 流水Repository |
| `server/src/controllers/inventory.controller.ts` | `server/src/controllers/inventory.controller.js` | 库存控制器 |
| `server/src/routes/inventory.ts` | `server/src/routes/inventory.js` | 库存路由 |

---

## 三、迁移执行计划

### 阶段1：清理（1天）

**任务**：删除子代理自创的不可信文件

| 操作 | 文件 | 原因 |
|------|------|------|
| 删除 | `src/views/inventory/InventoryIndex.vue` | 子代理自创，非V1.1源文件，含语法错误 |

### 阶段2：基础设施（2天）

**任务**：建立迁移所需的基础设施

1. **创建库存Store模块** (`src/stores/modules/inventory/`)
   - `useInboundStore.js`
   - `useMaterialReturnStore.js`
   - `useWarehouseMaterialStore.js`
   - `useWarehouseStore.js`
   - `useMaterialTypeStore.js`
   - `index.js`

2. **完善API服务层** (`src/api/`)
   - `inventory/` - 库存相关API
   - `material/` - 物料相关API
   - `warehouse/` - 仓库相关API

3. **迁移类型定义** (`src/types/`)
   - `inventory.js`
   - `warehouseInbound.js`
   - `materials.js`

### 阶段3：核心页面迁移（3天）

**任务**：迁移主页面组件

| 序号 | 页面 | 优先级 | 预计时间 |
|------|------|--------|----------|
| 1 | InventoryV3.vue | P0 | 1天 |
| 2 | ProduceInventory.vue | P0 | 0.5天 |
| 3 | Materials.vue | P1 | 0.5天 |
| 4 | WarehouseInbound.vue | P1 | 0.5天 |
| 5 | WarehouseOverview.vue | P1 | 0.5天 |

### 阶段4：组件迁移（5天）

**任务**：按子模块迁移组件

| 子模块 | 组件数 | 优先级 | 预计时间 |
|--------|--------|--------|----------|
| 物料管理 | ~25个 | P1 | 1.5天 |
| 采收库存 | ~10个 | P0 | 1天 |
| 物料领用 | ~20个 | P1 | 1.5天 |
| 物料退库 | ~15个 | P1 | 1天 |

### 阶段5：业务集成（2天）

**任务**：实现V3.0库存架构

1. **V3.0核心服务**：`inventoryService.js`
   - instance_id追溯
   - 事务日志
   - 冻结管理
   - 乐观锁

2. **模块集成**：`inventoryIntegration.js`
   - 与种源/种苗/种植/采收模块联动

---

## 四、V3.0统一库存架构说明

### 4.1 核心设计

```
┌─────────────────────────────────────────────────────────┐
│                    V3.0 统一库存架构                      │
├─────────────────────────────────────────────────────────┤
│  业务模块(种源/种苗/种植/采收)                           │
│         ↓                                              │
│  inventoryIntegration.ts (集成层)                        │
│         ↓                                              │
│  inventoryService.ts (核心服务)                        │
│         ↓                                              │
│  ┌──────────┬──────────────┬──────────────┐            │
│  ↓          ↓              ↓              │            │
│  Inventory  Inventory      Inventory      │            │
│  Stock      Transaction    Freeze         │            │
│  (库存中心)  (库存流水)     (冻结记录)      │            │
│         ↓                                              │
│  apiInventoryService.ts (API层)                         │
│         ↓                                              │
│  server/routes/inventory.ts (后端路由)                   │
│         ↓                                              │
│  inventory.controller.ts → inventory.service.ts         │
│         ↓                                              │
│  inventory.repository.ts / inventory-tx.repository.ts   │
│         ↓                                              │
│  SQLite数据库                                           │
└─────────────────────────────────────────────────────────┘
```

### 4.2 关键特性

| 特性 | 说明 |
|------|------|
| **instance_id追溯** | 库存实例唯一标识，格式：`类型-日期-序号`（如 INS-20260430-001） |
| **事务日志** | 每次库存变动均记录InventoryTransaction |
| **冻结管理** | 支持任务冻结/预留冻结/质检冻结 |
| **乐观锁** | version字段防止并发更新冲突 |
| **三种库存类型** | 种子/种苗/成品 |

---

## 五、质量保证措施

### 5.1 迁移前检查

- [ ] 确认V1.1源文件存在且内容完整
- [ ] 确认V2.0目标路径正确
- [ ] 记录文件对照关系

### 5.2 迁移中检查

- [ ] 逐文件对照：每个V2.0文件必须有V1.1源
- [ ] 语法验证：无语法错误
- [ ] 类型验证：类型定义正确
- [ ] API验证：接口调用正确

### 5.3 迁移后验证

- [ ] 功能对比：与V1.1功能一致
- [ ] 数据验证：数据结构一致
- [ ] 交互验证：用户交互流程一致

---

## 六、禁止事项

| 禁止 | 说明 |
|------|------|
| 禁止自创页面 | 不得在V1.1源文件不存在的情况下创建新页面 |
| 禁止简化功能 | 不得省略V1.1中已有的功能逻辑 |
| 禁止改变交互 | 不得改变V1.1的用户交互流程 |
| 禁止改变API | 不得改变API端点和数据结构 |

---

## 七、文件统计

| 类别 | V1.1源文件数 | V2.0目标文件数 |
|------|-------------|---------------|
| 页面文件 | 8 | 8 |
| 组件文件 | ~100+ | ~100+ |
| Store文件 | 5 | 5 |
| Service文件 | 6 | 6 |
| 类型定义 | 3 | 3 |
| 后端文件 | 5 | 5 |
| **总计** | **~127+** | **~127+** |

---

## 八、风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| V1.1文件丢失 | 迁移不完整 | 先备份V1.1库存模块到独立目录 |
| 类型转换错误 | 功能异常 | 严格对照V1.1类型定义 |
| 组件依赖复杂 | 迁移困难 | 按依赖顺序迁移，先基础设施后业务 |
| 子代理历史污染 | 遗留问题 | 彻底清理后重新开始 |

---

## 九、验收标准

1. **文件完整率**: 100% - 所有V1.1源文件都有对应的V2.0目标文件
2. **语法正确率**: 100% - 无语法错误，可正常运行
3. **功能一致率**: 100% - 与V1.1功能完全一致
4. **无自创内容**: 0 - 不存在V1.1源文件之外的文件

---

**审批状态**: 已审批（2026-05-25）
**下次审查**: 阶段1清理完成后
