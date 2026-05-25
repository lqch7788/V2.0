# 库存管理模块迁移设计文档

**创建时间**: 2026-05-25
**更新**: 2026-05-25（融入用户澄清意见后修订）
**源参考版本**: V1.1最新提交更新版本（而非任何备份或历史版本）
**迁移范围**: 包含MaterialApproval审批模块完整迁移
**Server目录结构**: 必须与V1.1完全一致
**项目**: V1.1 → V2.0 库存管理模块迁移
**状态**: 修订中
**版本**: V2.0

---

## 一、背景与目标

### 1.1 问题描述

V2.0项目的库存管理模块之前通过AI子代理进行了部分迁移，但存在以下严重问题：

1. **功能丢失**：大量V1.1功能未被迁移
2. **内容造假**：子代理自行创造了部分页面内容，而非从V1.1严格迁移
3. **质量缺陷**：创建的页面存在语法错误，无法正常运行
4. **架构不完整**：缺少关键的Store层和类型定义
5. **遗漏文件**：设计文档初版遗漏了50+个文件

### 1.2 审核发现的问题

| 问题类别 | 发现 | 严重程度 |
|----------|------|----------|
| 源文件路径错误 | `materialCategoryPage.tsx` 实际在 `src/components/materials/` | CRITICAL |
| 遗漏核心页面 | MaterialApproval、MaterialManagement、WarehouseManagement 未列入 | CRITICAL |
| 数量统计失准 | 物料管理 ~25个 → 实际11个 | MAJOR |
| 后端文件遗漏 | 应列13个，实际仅列5个 | MAJOR |
| modals目录位置 | materials/ 下无 modals，实际在 materialReceiving/materialReturn/ | MAJOR |

### 1.3 迁移原则

| 原则 | 说明 |
|------|------|
| **逐文件对照** | 每个V2.0文件必须有明确的V1.1源文件 |
| **禁止自创** | 除非V1.1中不存在，否则不得自行创建新功能 |
| **完整迁移** | 保持V3.0统一库存架构的完整性 |
| **功能验证** | 每迁移一个模块，对照V1.1进行功能测试 |

### 1.4 迁移范围

**源版本说明**: 本次迁移以 **V1.1最新提交更新版本** 为唯一参考基准，不使用任何备份目录或历史版本作为迁移依据。如有任何差异，以V1.1最新版本为准。

**MaterialApproval模块**: 必须完整迁移物料审批模块，包含所有相关页面、组件、Modals和审批流程。

**Server目录结构**: 必须与V1.1的Server目录结构完全一致，包括所有子目录、路由文件、服务文件等。

V1.1库存管理模块包含**7个子模块**：

| 序号 | 子模块 | 实际文件数 | 说明 |
|------|--------|------------|------|
| 1 | 采收产品库存 | 11个 | 采收入库的成品库存管理 |
| 2 | V3.0统一库存 | 15个 | 核心库存架构（instance_id追溯、事务日志、冻结管理、乐观锁） |
| 3 | 物料管理 | 35+个 | 农药、化肥、工具等物料管理（含pages/components） |
| 4 | 物料领用 | 28+个 | 领用申请、执行和统计（含tabs/stats） |
| 5 | 物料退库 | 18个 | 物料退库处理（含modals） |
| 6 | 物料分类 | 5个 | 物料分类维护 |
| 7 | 仓库管理 | 20+个 | 仓库基础设施管理和入库作业 |

---

## 二、V1.1 源文件完整清单（审核修订版）

### 2.1 页面文件 (.tsx → .vue) - 共11个

#### 主页面（8个）

| V1.1源文件路径 | V2.0目标文件路径 | 功能 | 备注 |
|----------------|------------------|------|------|
| `src/pages/InventoryV3.tsx` | `src/views/inventory/InventoryV3.vue` | V3.0统一库存主页 | **P0优先级** |
| `src/pages/ProduceInventory.tsx` | `src/views/inventory/ProduceInventory.vue` | 采收产品库存 | **P0优先级** |
| `src/pages/Materials.tsx` | `src/views/warehouse/Materials.vue` | 物料管理主页 | V2.0已存在 |
| `src/pages/warehouse/WarehouseInboundPage.tsx` | `src/views/warehouse/WarehouseInbound.vue` | 仓库入库 | V2.0已存在 |
| `src/pages/warehouse/WarehouseOverviewPage.tsx` | `src/views/warehouse/WarehouseOverview.vue` | 仓库概览 | V2.0已存在 |
| `src/components/materialReturn/MaterialReturnPage.tsx` | `src/views/material/MaterialReturn.vue` | 物料退库 | V2.0已存在 |
| `src/components/materialReceiving/MaterialReceivingPage.tsx` | `src/views/material/MaterialReceiving.vue` | 物料领用 | V2.0已存在 |
| `src/components/materials/materialCategoryPage.tsx` | `src/views/material/MaterialCategory.vue` | 物料分类 | **修正路径** |

#### 额外页面（3个）- 审核补充

| V1.1源文件路径 | V2.0目标文件路径 | 功能 | 优先级 |
|----------------|------------------|------|--------|
| `src/pages/MaterialApproval.tsx` | `src/views/material/MaterialApproval.vue` | 物料审批 | P1 |
| `src/pages/MaterialManagement.tsx` | `src/views/material/MaterialManagement.vue` | 物料管理主页 | P1 |
| `src/pages/warehouse/WarehouseManagement.tsx` | `src/views/warehouse/WarehouseManagement.vue` | 仓库管理主页 | P1 |

---

### 2.2 组件文件 (.tsx → .vue) - 按目录分类

#### 2.2.1 物料管理组件 (src/components/materials/) - 11个

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `MaterialsTable.tsx` | `MaterialsTable.vue` | 物料表格 |
| `MaterialsFilters.tsx` | `MaterialsFilters.vue` | 物料筛选 |
| `MaterialsHeader.tsx` | `MaterialsHeader.vue` | 页面头部 |
| `MaterialsCodeGenerator.tsx` | `MaterialsCodeGenerator.vue` | 编码生成器 |
| `InboundTable.tsx` | `InboundTable.vue` | 入库记录表 |
| `AddInboundModal.tsx` | `AddInboundModal.vue` | 新增进库弹窗 |
| `ExportFormatModal.tsx` | `ExportFormatModal.vue` | 导出格式弹窗 |
| `materialsPage.tsx` | `MaterialsPage.vue` | 物料页面 |
| `materialCategoryPage.tsx` | `materialCategoryPage.vue` | 物料分类页面 |
| `mockData.ts` | `mockData.js` | Mock数据 |
| `types.ts` | `types.js` | 类型定义 |

#### 2.2.2 采收库存组件 (src/components/inventory/) - 11个

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `ProduceInventoryPage.tsx` | `ProduceInventoryPage.vue` | 采收库存主页 |
| `ProduceInventoryToolbar.tsx` | `ProduceInventoryToolbar.vue` | 工具栏 |
| `ProduceInventoryAddModal.tsx` | `ProduceInventoryAddModal.vue` | 新增弹窗 |
| `ProduceInventoryBatchEditModal.tsx` | `ProduceInventoryBatchEditModal.vue` | 批量编辑弹窗 |
| `ProduceDetailModal.tsx` | `ProduceDetailModal.vue` | 详情弹窗 |
| `DeleteWarningModal.tsx` | `DeleteWarningModal.vue` | 删除警告弹窗 |
| `ActionToolbar.tsx` | `ActionToolbar.vue` | 操作工具栏 |
| `BatchDeleteConfirmDialog.tsx` | `BatchDeleteConfirmDialog.vue` | 批量删除确认 |
| `InboundModals.tsx` | `InboundModals.vue` | 入库弹窗集合 |
| `OutboundModal.tsx` | `OutboundModal.vue` | 出库弹窗 |
| `TabSwitch.tsx` | `TabSwitch.vue` | Tab切换 |

#### 2.2.3 物料领用组件 (src/components/materialReceiving/) - 6个基础+18个modals

**基础组件**：

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `MaterialReceivingPage.tsx` | `MaterialReceivingPage.vue` | 领用主页 |
| `ApplicationTab.tsx` | `ApplicationTab.vue` | 申请Tab |
| `ExecuteTab.tsx` | `ExecuteTab.vue` | 执行Tab |
| `StatisticsTab.tsx` | `StatisticsTab.vue` | 统计Tab |
| `MaterialReceivingHeader.tsx` | `MaterialReceivingHeader.vue` | 页面头部 |
| `CostTab.tsx` | `CostTab.vue` | 成本Tab |

**Modals** (`modals/*.tsx` - 18个)：

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `modals/DetailModal.tsx` | `DetailModal.vue` | 详情弹窗 |
| `modals/AddModal.tsx` | `AddModal.vue` | 新增弹窗 |
| `modals/EditModal.tsx` | `EditModal.vue` | 编辑弹窗 |
| `modals/BatchEditModal.tsx` | `BatchEditModal.vue` | 批量编辑弹窗 |
| `modals/ApproveModal.tsx` | `ApproveModal.vue` | 审批弹窗 |
| `modals/RejectModal.tsx` | `RejectModal.vue` | 拒绝弹窗 |
| `modals/ExportModal.tsx` | `ExportModal.vue` | 导出弹窗 |
| `modals/...` (12个) | `modals/...vue` | 其他弹窗 |

**Stats组件** (`stats/*.tsx` - 6个)：

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `stats/StatTabHeader.tsx` | `StatTabHeader.vue` | 统计Tab头部 |
| `stats/StatSearchBar.tsx` | `StatSearchBar.vue` | 统计搜索栏 |
| `stats/StatMonthlyTable.tsx` | `StatMonthlyTable.vue` | 月度统计表 |
| `stats/StatMaterialTable.tsx` | `StatMaterialTable.vue` | 物料统计表 |
| `stats/StatCards.tsx` | `StatCards.vue` | 统计卡片 |
| `stats/StatFiltersForm.tsx` | `StatFiltersForm.vue` | 统计筛选表单 |

#### 2.2.4 物料退库组件 (src/components/materialReturn/) - 7个基础+11个modals

**基础组件**：

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `MaterialReturnPage.tsx` | `MaterialReturnPage.vue` | 退库主页 |
| `MaterialReturnTable.tsx` | `MaterialReturnTable.vue` | 退库记录表 |
| `MaterialReturnSearch.tsx` | `MaterialReturnSearch.vue` | 搜索组件 |
| `MaterialReturnHeader.tsx` | `MaterialReturnHeader.vue` | 页面头部 |
| `config.ts` | `config.js` | 配置文件 |
| `types.ts` | `types.js` | 类型定义 |
| `mockData.ts` | `mockData.js` | Mock数据 |

**Modals** (`modals/*.tsx` - 11个)：

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `modals/DetailModal.tsx` | `DetailModal.vue` | 详情弹窗 |
| `modals/AddModal.tsx` | `AddModal.vue` | 新增弹窗 |
| `modals/EditModal.tsx` | `EditModal.vue` | 编辑弹窗 |
| `modals/BatchEditModal.tsx` | `BatchEditModal.vue` | 批量编辑弹窗 |
| `modals/VoidModal.tsx` | `VoidModal.vue` | 作废弹窗 |
| `modals/...` (6个) | `modals/...vue` | 其他弹窗 |

#### 2.2.5 仓库管理组件 (src/components/warehouse/) - 14个

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `WarehouseMaterialsPage.tsx` | `WarehouseMaterialsPage.vue` | 仓库物料页面 |
| `OutboundModal.tsx` | `OutboundModal.vue` | 出库弹窗 |
| `MaterialsTable.tsx` | `MaterialsTable.vue` | 物料表格 |
| `MaterialInboundTab.tsx` | `MaterialInboundTab.vue` | 入库Tab |
| `MaterialFilters.tsx` | `MaterialFilters.vue` | 筛选组件 |
| `MaterialEditModal.tsx` | `MaterialEditModal.vue` | 编辑弹窗 |
| `MaterialDetailModal.tsx` | `MaterialDetailModal.vue` | 详情弹窗 |
| `MaterialBatchEditModal.tsx` | `MaterialBatchEditModal.vue` | 批量编辑弹窗 |
| `InboundModals.tsx` | `InboundModals.vue` | 入库弹窗集合 |
| `BatchDeleteConfirmDialog.tsx` | `BatchDeleteConfirmDialog.vue` | 批量删除确认 |
| `ActionToolbar.tsx` | `ActionToolbar.vue` | 操作工具栏 |
| `PageHeader.tsx` | `PageHeader.vue` | 页面头部 |
| `MaterialExportModal.tsx` | `MaterialExportModal.vue` | 导出弹窗 |
| `TabSwitch.tsx` | `TabSwitch.vue` | Tab切换 |

#### 2.2.6 pages/material/ 目录组件 - 13个（审核补充）

**Tabs组件**：

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `tabs/StatisticsTab.tsx` | `StatisticsTab.vue` | 统计Tab |
| `tabs/ExecuteTab.tsx` | `ExecuteTab.vue` | 执行Tab |
| `tabs/ApplicationTab.tsx` | `ApplicationTab.vue` | 申请Tab |

**Tabs子组件**：

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `tabs/components/MonthlyDashboard.tsx` | `MonthlyDashboard.vue` | 月度仪表盘 |
| `tabs/components/MaterialTable.tsx` | `MaterialTable.vue` | 物料表格 |
| `tabs/components/MaterialFilters.tsx` | `MaterialFilters.vue` | 物料筛选 |

**ExecuteTab子组件**：

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `tabs/components/ExecuteTab/ExecuteTabTable.tsx` | `ExecuteTabTable.vue` | 执行表格 |
| `tabs/components/ExecuteTab/ExecuteTabFilters.tsx` | `ExecuteTabFilters.vue` | 执行筛选 |
| `tabs/components/ExecuteTab/ExecuteTabModals/DetailModal.tsx` | `DetailModal.vue` | 详情弹窗 |
| `tabs/components/ExecuteTab/ExecuteTabModals/BatchEditModal.tsx` | `BatchEditModal.vue` | 批量编辑弹窗 |
| `tabs/components/ExecuteTab/ExecuteTabModals/AddModal.tsx` | `AddModal.vue` | 新增弹窗 |

**Application子组件**：

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `tabs/components/ApplicationTable.tsx` | `ApplicationTable.vue` | 申请表格 |
| `tabs/components/ApplicationModals.tsx` | `ApplicationModals.vue` | 申请弹窗集合 |

#### 2.2.7 pages/components/ 目录组件 - 7个（审核补充）

**Materials组件**：

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `Materials/MaterialsTable.tsx` | `MaterialsTable.vue` | 物料表格 |
| `Materials/MaterialsFilters.tsx` | `MaterialsFilters.vue` | 物料筛选 |
| `Materials/MaterialsCodeGenerator.tsx` | `MaterialsCodeGenerator.vue` | 编码生成器 |
| `Materials/MaterialsModals/AddInboundModal.tsx` | `AddInboundModal.vue` | 新增进库弹窗 |

**MaterialApproval组件**：

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `MaterialApproval/MaterialApprovalTable.tsx` | `MaterialApprovalTable.vue` | 审批表格 |
| `MaterialApproval/MaterialApprovalFilters.tsx` | `MaterialApprovalFilters.vue` | 审批筛选 |
| `MaterialApproval/MaterialApprovalModals/DetailModal.tsx` | `DetailModal.vue` | 详情弹窗 |

#### 2.2.8 仪表盘组件

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `src/components/dashboard/cards/InventoryAlertCard.tsx` | `InventoryAlertCard.vue` | 库存预警卡片 |

---

### 2.3 Store文件 (.ts → .ts) - 5个

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `src/stores/useInboundStore.ts` | `src/stores/modules/inventory/useInboundStore.js` | 入库记录状态 |
| `src/stores/useMaterialReturnStore.ts` | `src/stores/modules/inventory/useMaterialReturnStore.js` | 退库状态 |
| `src/stores/useWarehouseMaterialStore.ts` | `src/stores/modules/inventory/useWarehouseMaterialStore.js` | 仓库物料状态 |
| `src/stores/useWarehouseStore.ts` | `src/stores/modules/inventory/useWarehouseStore.js` | 仓库状态 |
| `src/stores/useMaterialTypeStore.ts` | `src/stores/modules/inventory/useMaterialTypeStore.js` | 物料类型状态 |

**V2.0 Store目录结构**：
```
src/stores/modules/inventory/
├── index.js
├── useInboundStore.js
├── useMaterialReturnStore.js
├── useWarehouseMaterialStore.js
├── useWarehouseStore.js
└── useMaterialTypeStore.js
```

---

### 2.4 Service文件 - 8个（审核补充2个）

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `src/services/inventoryService.ts` | `src/api/inventory/inventoryService.js` | V3.0核心库存服务 |
| `src/services/inventoryIntegration.ts` | `src/api/inventory/inventoryIntegration.js` | 模块集成层 |
| `src/services/apiInventoryService.ts` | `src/api/inventory/apiInventoryService.js` | 库存API |
| `src/services/apiWarehouseMaterialService.ts` | `src/api/material/apiWarehouseMaterialService.js` | 物料API |
| `src/services/apiMaterialReturnService.ts` | `src/api/material/apiMaterialReturnService.js` | 退库API |
| `src/services/apiMaterialRequestService.ts` | `src/api/material/apiMaterialRequestService.js` | 物料申请API |
| `src/services/apiMaterialCodeCategoryService.ts` | `src/api/material/apiMaterialCodeCategoryService.js` | 物料分类API |
| `src/services/warehouseService.ts` | `src/api/warehouse/warehouseService.js` | 仓库API |

---

### 2.5 类型定义文件 - 6个（审核补充3个）

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `src/types/inventory.ts` | `src/types/inventory.js` | 核心库存类型 |
| `src/types/warehouseInbound.types.ts` | `src/types/warehouseInbound.js` | 入库类型 |
| `src/types/material.ts` | `src/types/material.js` | 物料类型 |
| `src/types/materialReceiving.ts` | `src/types/materialReceiving.js` | 领用类型 |
| `src/components/materials/types.ts` | `src/types/materials.js` | 物料类型 |
| `src/components/materialReturn/types.ts` | `src/types/materialReturn.js` | 退库类型 |

---

### 2.6 后端文件 - 13个（审核补充8个）

#### 2.6.1 核心后端文件

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `server/src/services/inventory.service.ts` | `server/src/services/inventory.service.js` | 库存服务 |
| `server/src/repositories/inventory.repository.ts` | `server/src/repositories/inventory.repository.js` | 库存Repository |
| `server/src/repositories/inventory-tx.repository.ts` | `server/src/repositories/inventory-tx.repository.js` | 流水Repository |
| `server/src/controllers/inventory.controller.ts` | `server/src/controllers/inventory.controller.js` | 库存控制器 |
| `server/src/routes/inventory.ts` | `server/src/routes/inventory.js` | 库存路由 |

#### 2.6.2 物料相关后端路由（审核补充）

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `server/src/routes/materialReturn.ts` | `server/src/routes/materialReturn.js` | 物料退库路由 |
| `server/src/routes/materials.ts` | `server/src/routes/materials.js` | 物料管理路由 |
| `server/src/routes/materialRequest.ts` | `server/src/routes/materialRequest.js` | 物料申请路由 |
| `server/src/routes/materialCost.ts` | `server/src/routes/materialCost.js` | 物料成本路由 |
| `server/src/routes/materialExecute.ts` | `server/src/routes/materialExecute.js` | 物料执行路由 |
| `server/src/routes/materialStatistics.ts` | `server/src/routes/materialStatistics.js` | 物料统计路由 |
| `server/src/routes/materialCodeCategories.ts` | `server/src/routes/materialCodeCategories.js` | 物料编码分类路由 |
| `server/src/db/materials.ts` | `server/src/db/materials.js` | 物料数据库模块 |

---

### 2.7 数据文件

| V1.1源文件 | V2.0目标文件 | 功能 |
|------------|--------------|------|
| `src/data/materialReceivingData.ts` | `src/data/materialReceivingData.js` | 物料领用数据 |
| `src/data/warehouse/warehouseData.ts` | `src/data/warehouse/warehouseData.js` | 仓库数据 |

---

## 三、迁移执行计划（修订版）

### 阶段1：清理与验证（1天）

**任务**：删除子代理自创的不可信文件

| 操作 | 文件 | 原因 | 优先级 |
|------|------|------|--------|
| 验证后删除 | `src/views/inventory/InventoryIndex.vue` | 非V1.1源文件，需先验证是否有语法错误 | P0 |
| 删除 | `src/views/dashboard/components/InventoryAlertCard.vue` | 与 `src/components/dashboard/cards/` 下文件重复 | P1 |

**验证步骤**：
1. 运行 `npm run build` 或 `vue-tsc` 验证 InventoryIndex.vue 是否有编译错误
2. 如有编译错误 → 直接删除
3. 如无编译错误 → 评估功能是否来自V1.1，是则保留，否则删除

---

### 阶段2：基础设施层（2天）

**任务**：建立迁移所需的底层依赖

#### 2.1 类型定义（types/）

| 文件 | 依赖 | 优先级 |
|------|------|--------|
| `types/inventory.js` | 无 | P0 |
| `types/warehouseInbound.js` | 无 | P0 |
| `types/material.js` | 无 | P0 |
| `types/materialReceiving.js` | 无 | P1 |
| `types/materials.js` | 无 | P1 |
| `types/materialReturn.js` | 无 | P1 |

#### 2.2 后端Repository层

| 文件 | 依赖 | 优先级 |
|------|------|--------|
| `server/src/repositories/inventory.repository.js` | types/inventory | P0 |
| `server/src/repositories/inventory-tx.repository.js` | types/inventory | P0 |
| `server/src/db/materials.js` | 无 | P1 |

#### 2.3 后端Service层

| 文件 | 依赖 | 优先级 |
|------|------|--------|
| `server/src/services/inventory.service.js` | repositories | P0 |

---

### 阶段3：API服务层（2天）

**任务**：前后端API服务的迁移和创建

#### 3.1 前端API服务

| 文件 | 依赖 | 优先级 |
|------|------|--------|
| `src/api/inventory/apiInventoryService.js` | types/inventory | P0 |
| `src/api/inventory/inventoryService.js` | types/inventory | P0 |
| `src/api/inventory/inventoryIntegration.js` | inventoryService | P0 |
| `src/api/material/apiWarehouseMaterialService.js` | types/material | P1 |
| `src/api/material/apiMaterialReturnService.js` | types/materialReturn | P1 |
| `src/api/material/apiMaterialRequestService.js` | types/materialReceiving | P2 |
| `src/api/material/apiMaterialCodeCategoryService.js` | types/material | P2 |
| `src/api/warehouse/warehouseService.js` | types | P1 |

#### 3.2 后端路由

| 文件 | 依赖 | 优先级 |
|------|------|--------|
| `server/src/routes/inventory.js` | services | P0 |
| `server/src/routes/materialReturn.js` | services | P1 |
| `server/src/routes/materials.js` | services | P1 |
| `server/src/routes/materialRequest.js` | services | P2 |
| `server/src/routes/materialCost.js` | services | P2 |
| `server/src/routes/materialExecute.js` | services | P2 |
| `server/src/routes/materialStatistics.js` | services | P2 |
| `server/src/routes/materialCodeCategories.js` | services | P2 |

#### 3.3 后端控制器

| 文件 | 依赖 | 优先级 |
|------|------|--------|
| `server/src/controllers/inventory.controller.js` | services | P0 |

---

### 阶段4：Store层（1天）

| 文件 | 依赖API | 优先级 |
|------|---------|--------|
| `src/stores/modules/inventory/useInboundStore.js` | apiWarehouseMaterialService | P0 |
| `src/stores/modules/inventory/useMaterialReturnStore.js` | apiMaterialReturnService | P0 |
| `src/stores/modules/inventory/useWarehouseMaterialStore.js` | apiWarehouseMaterialService | P0 |
| `src/stores/modules/inventory/useWarehouseStore.js` | warehouseService | P1 |
| `src/stores/modules/inventory/useMaterialTypeStore.js` | apiMaterialCodeCategoryService | P1 |
| `src/stores/modules/inventory/index.js` | 各Store | P0 |

---

### 阶段5：组件迁移（5天）

**任务**：按依赖顺序迁移组件（从底层到上层）

#### 5.1 基础组件（无外部依赖）

| 子模块 | 组件数 | 预计时间 |
|--------|--------|----------|
| 物料表格类 | 8个 | 0.5天 |
| 筛选器类 | 6个 | 0.5天 |
| 头部类 | 5个 | 0.5天 |

#### 5.2 功能组件

| 子模块 | 组件数 | 预计时间 |
|--------|--------|----------|
| 编码生成器 | 2个 | 0.5天 |
| Tab组件 | 8个 | 1天 |
| 统计组件 | 6个 | 0.5天 |

#### 5.3 Modal组件

| 子模块 | 组件数 | 预计时间 |
|--------|--------|----------|
| 物料领用Modals | 18个 | 0.5天 |
| 物料退库Modals | 11个 | 0.5天 |
| 采收库存Modals | 8个 | 0.5天 |
| 仓库管理Modals | 6个 | 0.5天 |

---

### 阶段6：页面迁移（3天）

| 序号 | 页面 | 优先级 | 依赖完整性 |
|------|------|--------|-----------|
| 1 | InventoryV3.vue | P0 | 依赖inventoryService + OutboundModal |
| 2 | ProduceInventory.vue | P0 | 依赖最完整(10+组件+Stores+Services) |
| 3 | Materials.vue | P1 | 依赖components+hooks |
| 4 | WarehouseInbound.vue | P1 | 依赖hooks+components |
| 5 | WarehouseOverview.vue | P1 | 依赖store+components |
| 6 | MaterialReceiving.vue | P1 | 依赖tabs+hooks |
| 7 | MaterialReturn.vue | P1 | 依赖components+hooks |
| 8 | MaterialCategory.vue | P2 | 简单页面 |
| 9 | MaterialApproval.vue | P1 | 审核补充 |
| 10 | MaterialManagement.vue | P1 | 审核补充 |
| 11 | WarehouseManagement.vue | P1 | 审核补充 |

---

### 阶段7：业务集成（2天）

**任务**：实现V3.0库存架构

1. **V3.0核心服务**：`inventoryService.js`
   - instance_id追溯
   - 事务日志
   - 冻结管理
   - 乐观锁

2. **模块集成**：`inventoryIntegration.js`
   - 与种源/种苗/种植/采收模块联动

---

## 四、迁移顺序依赖图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         迁移顺序依赖图                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [阶段2: 基础设施]                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────────┐  ┌──────────┐              │
│  │ Types   │→ │Backend  │→ │Backend      │→ │Backend   │              │
│  │ (6个)   │  │Repos    │  │Services     │  │Routes    │              │
│  └─────────┘  └─────────┘  └─────────────┘  └──────────┘              │
│       │                                                    │              │
│       └──────────────┬───────────────────────────────────┘              │
│                      ↓                                                    │
│  [阶段3: API服务层]                                                       │
│  ┌──────────────────────────┐  ┌──────────────────────────┐           │
│  │ Frontend APIs (8个)       │  │ Backend Controllers (1个)│           │
│  └──────────────┬───────────┘  └──────────────┬───────────┘           │
│                 │                                 │                     │
│                 └───────────────┬─────────────────┘                     │
│                                 ↓                                          │
│  [阶段4: Store层]                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐      │
│  │ 5个Pinia Stores (useInbound, useMaterialReturn, useWarehouse...)│      │
│  └─────────────────────────────────────────────────────────────────┘      │
│                                 │                                          │
│                                 ↓                                          │
│  [阶段5: 组件层]                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Tables   │→ │ Filters  │→ │ Headers  │→ │ Tabs     │→ │ Modals   │ │
│  │ (8个)    │  │ (6个)    │  │ (5个)    │  │ (8个)    │  │ (43个)   │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│                                 │                                          │
│                                 ↓                                          │
│  [阶段6: 页面层]                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐      │
│  │ 11个Vue页面 (InventoryV3, ProduceInventory, Materials...)        │      │
│  └─────────────────────────────────────────────────────────────────┘      │
│                                 │                                          │
│                                 ↓                                          │
│  [阶段7: 业务集成]                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐      │
│  │ V3.0核心服务 + 模块集成                                              │      │
│  └─────────────────────────────────────────────────────────────────┘      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 五、V3.0统一库存架构说明

### 5.1 核心设计

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

### 5.2 关键特性

| 特性 | 说明 |
|------|------|
| **instance_id追溯** | 库存实例唯一标识，格式：`类型-日期-序号`（如 INS-20260430-001） |
| **事务日志** | 每次库存变动均记录InventoryTransaction |
| **冻结管理** | 支持任务冻结/预留冻结/质检冻结 |
| **乐观锁** | version字段防止并发更新冲突 |
| **三种库存类型** | 种子/种苗/成品 |

---

## 六、质量保证措施

### 6.1 迁移前检查清单

- [ ] 确认V1.1源文件存在且内容完整
- [ ] 确认V2.0目标路径正确（已修正路径）
- [ ] 记录文件对照关系（本文档）
- [ ] 运行 `npm run build` 验证编译

### 6.2 迁移中检查清单

- [ ] 逐文件对照：每个V2.0文件必须有V1.1源
- [ ] 语法验证：无语法错误
- [ ] 类型验证：类型定义正确
- [ ] API验证：接口调用正确
- [ ] Store验证：状态管理正确

### 6.3 迁移后验证清单

- [ ] 功能对比：与V1.1功能一致
- [ ] 数据验证：数据结构一致
- [ ] 交互验证：用户交互流程一致
- [ ] 编译验证：`npm run build` 通过
- [ ] 运行验证：开发服务器正常启动

---

## 七、禁止事项

| 禁止 | 说明 |
|------|------|
| 禁止自创页面 | 不得在V1.1源文件不存在的情况下创建新页面 |
| 禁止简化功能 | 不得省略V1.1中已有的功能逻辑 |
| 禁止改变交互 | 不得改变V1.1的用户交互流程 |
| 禁止改变API | 不得改变API端点和数据结构 |
| 禁止跳过验证 | 必须逐文件对照V1.1验证 |

---

## 八、文件统计（审核修订版）

| 类别 | V1.1源文件数 | V2.0目标文件数 |
|------|-------------|---------------|
| 页面文件 | 11 | 11 |
| 组件文件 | ~120+ | ~120+ |
| Store文件 | 5 | 5 |
| Service文件 | 8 | 8 |
| 类型定义 | 6 | 6 |
| 后端文件 | 13 | 13 |
| 数据文件 | 2 | 2 |
| **总计** | **~165+** | **~165+** |

---

## 九、风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| V1.1文件分散在多个备份目录 | 可能遗漏 | 以 `V1.1/src/` 为准，其他备份作为参考 |
| 组件依赖复杂 | 迁移顺序错误导致编译失败 | 严格按本文档的迁移顺序执行 |
| 子代理历史污染 | 遗留问题 | 阶段1彻底清理后再开始迁移 |
| InventoryIndex.vue定性 | 可能误删正常文件 | 先验证编译错误再决定是否删除 |
| 后端路由遗漏 | API调用失败 | 补充8个后端路由文件 |

---

## 十、验收标准

1. **文件完整率**: 100% - 所有165+个V1.1源文件都有对应的V2.0目标文件
2. **语法正确率**: 100% - 无语法错误，`npm run build` 通过
3. **功能一致率**: 100% - 与V1.1功能完全一致
4. **无自创内容**: 0 - 不存在V1.1源文件之外的文件（除阶段1清理后的残留）
5. **编译通过**: `npm run build` 无错误
6. **开发启动**: `npm run dev` 正常启动

---

## 十一、审核修订记录

### V2.0 修订内容（2026-05-25）

| 修订项 | 原版 | 修订版 | 原因 |
|--------|------|--------|------|
| 版本 | V1.0 | V2.0 | 多路审核后修订 |
| materialCategoryPage路径 | `src/components/materialCategory/` | `src/components/materials/` | 路径错误 |
| 遗漏页面 | 8个 | 11个 | 补充MaterialApproval/Management/WarehouseManagement |
| 组件数量 | ~100+ | ~120+ | 精确统计 |
| 后端文件 | 5个 | 13个 | 补充物料相关路由 |
| modals位置 | materials/modals | materialReceiving/modals, materialReturn/modals | 实际位置 |
| 迁移顺序 | 模糊 | 详细依赖图 | 审核发现 |

### V2.0 融入用户澄清（2026-05-25）

| 澄清项 | 内容 |
|--------|------|
| 源版本基准 | V1.1最新提交更新版本（非备份/历史版本） |
| MaterialApproval | 完整纳入迁移范围 |
| Server目录结构 | 必须与V1.1完全一致 |

---

**文档状态**: 已完成（融入用户澄清意见）
**用户澄清**:
1. V1.1最新提交更新版本为迁移基准
2. MaterialApproval审批模块完整纳入迁移范围
3. Server目录结构必须与V1.1完全一致
