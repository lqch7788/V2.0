# 每日工单汇总逐行比对报告

> 批：3 ｜ 范围：每日工单汇总（V1.1 agriculture 9 文件 vs V2.0 DailyWorkSummary.vue）
> 比对日期：2026-06-15
> **架构差异：V1.1 操作记录为中心，V2.0 工单状态汇总为中心**

## 一、文件对照表

| 角色 | V1.1 源文件 | 行数 | V2.0 目标 | 行数 |
|------|-------------|------|-----------|------|
| 主页面 | AgricultureRecordPage.tsx | 564 | DailyWorkSummary.vue | 587 |
| 4 components | FilterToolbar/PageHeader/Pagination/TableToolbar | ? | ⚠️ 集成在主页 | 0 |
| 4 modals | AddOperationRecord/BatchEdit/DeleteWarning/ExportFormat | ? | ⚠️ 集成在主页 | 0 |
| **合计** | **9 文件** | **~1500+** | **1 文件** | **587** |

## 二、架构差异（核心）

| 维度 | V1.1 操作记录 | V2.0 工单汇总 |
|------|--------------|---------------|
| 核心概念 | 操作记录（来源 task/tempTask/manual/inspection） | 工单状态汇总 |
| 5 来源 | sourceType: task/tempTask/manual/inspection | 单一工单 |
| 8 筛选 | sourceType/operationType/status/greenhouseId/operatorId/dateFrom/dateTo/searchText | 简化筛选 |
| 折叠子记录 | expandedIds/toggleChildren/renderChildren | ❌ 缺失 |
| 验收/驳回 | handleAcceptRecord/handleRejectRecord | ❌ 缺失 |
| 进度条 | getProgressBar | ⚠️ 简化 |
| 类型 Badge | getTypeBadge (8 颜色) | ⚠️ 简化 |
| 状态 Badge | getStatusBadge (6 状态) | statusColorMap (5 状态) |

## 三、V1.1 9 字段筛选 vs V2.0 简化

| 筛选 | V1.1 | V2.0 |
|------|------|------|
| sourceType 来源 | ✅ | ❌ |
| operationType 操作类型 | ✅ | ❌ |
| status 状态 | ✅ | ✅ |
| greenhouseId 大棚 | ✅ | ❌ |
| operatorId 操作人员 | ✅ | ❌ |
| dateFrom/to 日期范围 | ✅ | ⚠️ |
| searchText 搜索 | ✅ | ⚠️ |
| 5 来源聚合 | ✅ | ❌ |
| **8 字段 → 2 字段** |  |  |

## 四、V1.1 折叠子记录功能（V2.0 完全缺失）

V1.1 L324-361 `renderChildren(children)`：子记录连接线 + 6 字段展示（操作日期/时间/操作员/类型/进度/工作量/备注）。

V1.1 L441-456 折叠按钮：`<ChevronDown>` / `<ChevronRight>` + `<Button onClick={() => toggleChildren(record.id)}>`。

V2.0 DailyWorkSummary 完全没有这些功能。

## 五、Modal 实现对比

| Modal | V1.1 | V2.0 | 状态 |
|-------|------|------|------|
| AddOperationRecordModal | ✅ | ❌ | **P0** |
| BatchEditModal | ✅ | ❌ | **P0** |
| DeleteWarningModal | ✅ | ❌ | **P0** |
| ExportFormatModal | ✅ | ✅（简化） | ✅ |

## 六、真实 P0 缺失清单

### A. Modal 缺失（3 项）
1. AddOperationRecordModal（新增操作记录）
2. BatchEditModal（批量编辑）
3. DeleteWarningModal（删除确认）

### B. 筛选字段缺失（6 项）
4. sourceType 来源筛选
5. operationType 操作类型
6. greenhouseId 大棚
7. operatorId 操作人员
8. dateFrom/dateTo 日期范围
9. searchText 搜索

### C. 核心交互（3 项）
10. expandedIds/toggleChildren 折叠子记录
11. renderChildren 子记录渲染
12. handleAcceptRecord/handleRejectRecord 验收驳回

### D. UI 组件（2 项）
13. getTypeBadge 8 色 Badge
14. getProgressBar 进度条

## 七、V2.0 优势保留项

- ✅ 工单 5 状态汇总（已接受/处理中/返工中/待验收/待接受）
- ✅ 3 格式导出（csv/excel/word）
- ✅ 状态颜色映射

## 八、修复策略

**最小修补清单**（保留 V2.0 工单汇总架构，补充 V1.1 操作记录功能）：
- A 段：补 AddOperationRecordModal（最关键）
- B 段：补 6 字段筛选（sourceType/operationType/greenhouseId/operatorId/dateFrom/dateTo）
- C 段：补 DeleteWarningModal + BatchEditModal
- D 段：补折叠子记录（V1.1 特色功能）

## 总结

| 项 | 数量 |
|----|------|
| V1.1 源文件 | 9 |
| V2.0 实现 | 1 文件（587 行） |
| P0 缺失 | 14 项 |
| V2.0 优势 | 工单状态汇总 |
| 架构差异 | 操作记录 vs 工单状态 |

**修复策略**：保留 V2.0 工单汇总架构，补 V1.1 缺失的 14 项关键功能（重点：AddOperationRecordModal + 6 字段筛选 + 折叠子记录）。
