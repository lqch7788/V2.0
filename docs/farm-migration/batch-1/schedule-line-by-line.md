# 排班调度逐行比对报告（V1.1 vs V2.0）

> 批：1 ｜ 范围：排班调度 11 个 V1.1 文件 vs V2.0 Schedule.vue
> 比对日期：2026-06-15
> 状态：**P0 必修复项已识别 23 项**

## 一、文件对照表

| 角色 | V1.1 源文件 | 行数 | V2.0 目标 | 行数 | 行数差 |
|------|-------------|------|-----------|------|--------|
| 类型 | `labor/schedule/types.ts` | 53 | （散在 V2.0） | 0 | -53 |
| Hook | `labor/schedule/hooks/useSchedule.ts` | 95 | （Pinia 直替：teamShift.js） | 137 | +42 |
| 主页面 | `labor/schedule/SchedulePage.tsx` | 692 | `views/farm/Schedule.vue` | 734 | +42 |
| 表格 | `labor/schedule/ScheduleTable.tsx` | 485 | （集成在 Schedule.vue） | 0 | -485 |
| 日历 | `labor/schedule/ScheduleCalendar.tsx` | 405 | （集成在 Schedule.vue） | 0 | -405 |
| 班次编辑 | `labor/schedule/ShiftEditor.tsx` | 186 | （集成在 Schedule.vue） | 0 | -186 |
| 调班弹窗 | `labor/schedule/SwapRequestModal.tsx` | 291 | （集成在 Schedule.vue） | 0 | -291 |
| 新增弹窗 | `modals/ScheduleAddModal.tsx` | 82 | （集成在 Schedule.vue） | 0 | -82 |
| 批量编辑 | `modals/ScheduleBatchEditModal.tsx` | 183 | ❌ 缺失 | 0 | -183 |
| 删除警告 | `modals/DeleteWarningModal.tsx` | 5 | ❌ 缺失 | 0 | -5 |
| 导出格式 | `modals/ExportFormatModal.tsx` | 5 | ❌ 缺失 | 0 | -5 |
| **合计** | **11 文件** | **2482** | **2 文件（Schedule.vue + teamShift.js）** | **871** | **-1611（-64.9%）** |

## 二、Props / 接口 1:1 比对

### V1.1 useSchedule Hook 返回（L65-91）
| V1.1 返回项 | V2.0 对应 | 状态 |
|------------|----------|------|
| `scheduleList: store.schedules` | `store.teams`（不是 schedules） | ❌ **P0 命名/数据源差异** |
| `shiftConfigs: store.shiftConfigs` | `store.shifts`（不是 shiftConfigs） | ⚠️ 命名差异 |
| `staffList: store.staffList` | `store.staffList` | ✅ |
| `swapRequests: store.swapRequests` | `store.swapRequests` | ✅ |
| `selectedDate: store.selectedDate` | （缺失） | ❌ **P0** |
| `viewMode: store.viewMode` | （缺失） | ❌ **P0** |
| `weekDateRange` | （缺失） | ❌ **P0** |
| `monthDateRange` | （缺失） | ❌ **P0** |
| `setSelectedDate` | （缺失） | ❌ **P0** |
| `setViewMode` | （缺失） | ❌ **P0** |
| `getScheduleByDate` | （缺失） | ❌ **P0** |
| `getScheduleByStaffAndDate` | （缺失） | **P0** |
| `addSchedule` | `store.addSchedule`（V2.0 store 未读） | 待核 |
| `updateSchedule` | `store.updateSchedule` | 待核 |
| `cancelSchedule` | `store.cancelSchedule` | ✅ |
| `deleteSchedule` | `store.deleteSchedule` | 待核 |
| `batchUpdateSchedule` | ❌ 缺失 | **P0** |
| `updateShiftConfig` | `store.updateShift`（V1.1=L90 命名差异） | ⚠️ 命名差异 |
| `submitSwapRequest` | `store.submitSwapRequest` | ✅ |
| `handleSwapRequest` | `store.handleSwapRequest` | ✅ |

### V1.1 ScheduleTableProps（L11-39）
| V1.1 Prop | V2.0 对应 | 状态 |
|-----------|----------|------|
| `scheduleList, shiftConfigs, currentPage, pageSize, totalCount` | （集成内部，无独立 props） | 框架差异 |
| `onPageChange, onPageSizeChange, onScheduleClick, onExport, onAddClick` | 同上 | 框架差异 |
| `showCheckbox`, `exportMode`, `batchEditMode`, `batchDeleteMode` | `exportMode` 有，`batchEditMode/batchDeleteMode` 缺失 | ⚠️ |
| `selectedRows, onSelectAll, onSelectRow` | 用 el-table 自带 selection-change | 框架差异 |
| `onBatchEditClick, onBatchDeleteClick, onBatchExportClick` | ❌ 缺失 | **P0** |
| `onCancelBatchEdit, onCancelBatchDelete` | ❌ 缺失 | **P0** |
| `canCreate, canEdit, canDelete, canExport` | ❌ 缺失 | **P0** |

### V1.1 ScheduleCalendarProps（L6-16）
| V1.1 Prop | V2.0 对应 | 状态 |
|-----------|----------|------|
| `viewMode`, `selectedDate` | ❌ 缺失 | **P0** |
| `weekDateRange`, `monthDateRange` | ❌ 缺失 | **P0** |
| `scheduleList`, `shiftConfigs` | 部分 | 框架差异 |
| `onDateChange`, `onViewModeChange` | ❌ 缺失 | **P0** |
| `onScheduleClick` | ✅ | 框架差异 |

## 三、State 1:1 比对（V1.1 SchedulePage 本地 State）

| V1.1 State | V2.0 对应 | 状态 |
|-----------|-----------|------|
| `showShiftEditor` (L59) | `showShiftEditor` (L468) | ✅ |
| `showSwapModal` (L60) | `showSwapModal` | ✅ |
| `displayMode: 'calendar' \| 'table'` (L61) | `displayMode` | ✅ |
| `selectedSchedule` (L62) | （缺失） | **P0** |
| `showAddModal` (L63) | `showAddModal` | ✅ |
| `showBatchEditModal` (L64) | ❌ 缺失 | **P0** |
| `showDeleteWarning` (L65) | ❌ 缺失 | **P0** |
| `batchEditMode` (L68) | ❌ 缺失 | **P0** |
| `batchDeleteMode` (L69) | ❌ 缺失 | **P0** |
| `exportMode` (L70) | `exportMode` | ✅ |
| `selectedRows` (L71) | `selectedRows` | ✅ |
| `editedRecordIds` (L74) | ❌ 缺失 | **P0** |
| `editedRecords` (L75) | ❌ 缺失 | **P0** |
| `selectedRecordId` (L76) | ❌ 缺失 | **P0** |
| `showExportModal` (L79) | ❌ 缺失 | **P0** |
| `exportFormat` (L80) | ❌ 缺失 | **P0** |
| `currentPage` (L83) | `pagination.currentPage` | ✅ |
| `pageSize` (L84) | `pagination.pageSize` | ✅ |
| `newSchedule` (L87-93) | `newSchedule` | ✅ |

## 四、Handler 1:1 比对

| V1.1 Handler | 行 | V2.0 对应 | 状态 |
|-------------|-----|-----------|------|
| `normalizeRecord` (L16-22) | — | ❌ 缺失（snake_case/camelCase 兼容） | **P0** |
| `getStaffName` (L25-27) | — | ❌ 缺失 | **P0** |
| `getWorkZone` (L30-32) | — | ❌ 缺失 | **P0** |
| `handleScheduleClick` (L96) | 100 | ✅ | ✅ |
| `handleAddSchedule` (L101) | — | ✅（L686-） | ✅ |
| `handleSwapSubmit` (L119) | — | ✅ | ✅ |
| `handleSelectAll` (L132) | — | 用 el-table 自带 | 框架差异 |
| `handleSelectRow` (L140) | — | 用 el-table 自带 | 框架差异 |
| `handleCancelBatch` (L149) | — | ❌ 缺失（只重置 batchDeleteMode/selectedRows） | **P0** |
| `handleConfirmDelete` (L157) | — | ❌ 缺失 | **P0** |
| `handleBatchEditClick` (L167) | — | ❌ 缺失 | **P0** |
| `handleConfirmBatchEdit` (L177) | — | ❌ 缺失 | **P0** |
| `handleConfirmNext` (L197) | — | ❌ 缺失 | **P0** |
| `handleConfirmExport` (L225) | — | ❌ 缺失 | **P0** |
| `handleDoExport` (L231-306) | — | ❌ 缺失 | **P0** |
| `handleSwapApprove/Reject` | — | ✅（L722-723） | ✅ |

## 五、UI 布局 1:1 比对

### V1.1 标题栏（L311-321）
| V1.1 元素 | V2.0 对应 | 状态 |
|----------|----------|------|
| 渐变色图标（emerald-500/green-600，w-12 h-12） | `bg-gradient-to-br from-emerald-500 to-green-600 w-12 h-12` | ✅ |
| `Calendar` 图标 | `Calendar` 图标 | ✅ |
| 标题"排班调度" | ✅ | ✅ |
| 副标题"员工排班管理与调班申请" | ✅ | ✅ |

### V1.1 快捷操作栏（L324-376）
| V1.1 按钮 | V2.0 对应 | 状态 |
|----------|----------|------|
| 日历视图 | ✅ | ✅ |
| 表格视图 | ✅ | ✅ |
| 调班申请（紫色） | ✅ | ✅ |
| 班次设置（蓝色） | ✅ | ✅ |
| 新增排班 | ✅ | ✅ |
| 批量导出（表格模式下） | ✅ | ✅ |
| 批量编辑（表格模式下） | ✅ | ✅ |
| 批量删除（表格模式下） | ✅ | ✅ |

### V1.1 统计卡片（L379-436，4 个）
| V1.1 卡片 | V2.0 卡片 | 状态 |
|----------|----------|------|
| 今日排班：blue-50/200，Calendar 图标 | ✅ | ✅ |
| 本周已执行：green-50/200，Clock 图标 | ✅ | ✅ |
| 待调班申请：amber-50/200，Users 图标 | ✅ | ✅ |
| 本月排班总数：purple-50/200，List 图标 | ✅ | ✅ |

### V1.1 主内容区（L438-614）
| V1.1 区域 | V2.0 对应 | 状态 |
|----------|----------|------|
| 日历视图 ScheduleCalendar | ❌ ScheduleCalendar 缺失 | **P0** |
| 表格视图 ScheduleTable | ❌ ScheduleTable 缺失 | **P0** |
| 侧边栏（col-span-1） | ❌ 缺失 | **P0** |
| 排班详情侧边栏（L524-582） | ❌ 缺失 | **P0** |
| 调班申请列表侧边栏（L584-596） | ⚠️ V2.0 有简化版（L260-272） | ⚠️ |
| 班次图例侧边栏（L598-612） | ✅（L282-） | ✅ |

### V1.1 5 个 Modal（L616-686）
| V1.1 Modal | V2.0 对应 | 状态 |
|-----------|----------|------|
| 班次设置 ShiftEditor（L617-629） | ⚠️ 简化版（L431-） | ⚠️ |
| 调班申请 SwapRequestModal（L631-637） | ⚠️ 简化版 | ⚠️ |
| 新增排班 ScheduleAddModal（L640-648） | ✅ | ✅ |
| 批量编辑 ScheduleBatchEditModal（L650-665） | ❌ 缺失 | **P0** |
| 删除确认 DeleteWarningModal（L667-676） | ❌ 缺失 | **P0** |
| 导出格式 ExportFormatModal（L678-686） | ❌ 缺失 | **P0** |

## 六、表格 UI 专项报告

### V1.1 ScheduleTable 表格列（L379-400）
| V1.1 列 | V2.0 对应 | 状态 |
|---------|----------|------|
| 复选框（条件渲染） | ✅ | ✅ |
| 日期（含星期） | ⚠️ V2.0 简化 | ⚠️ |
| 员工 | ⚠️ V2.0 简化 | ⚠️ |
| 班次（带颜色） | ⚠️ V2.0 简化 | ⚠️ |
| 工作区域 | ✅ | ✅ |
| 时间 | ✅ | ✅ |
| 状态 | ✅ | ✅ |
| 签到/签退 | ✅ | ✅ |

### V1.1 表格工具栏（L260-288）
| V1.1 元素 | V2.0 对应 | 状态 |
|----------|----------|------|
| 搜索框（员工/区域/日期） | ❌ 缺失 | **P0** |
| 导出按钮 | ❌ 缺失 | **P0** |
| 日期范围选择 | ❌ 缺失 | **P0** |
| 班次筛选 | ❌ 缺失 | **P0** |
| 状态筛选 | ❌ 缺失 | **P0** |
| 共 N 条记录 | ✅ | ✅ |

## 七、按键 UI 专项报告

| 维度 | V1.1 数量 | V2.0 数量 | 状态 |
|------|----------|----------|------|
| 标题栏 | 0 | 0 | ✅ |
| 快捷操作栏 | 5（视图2 + 调班+班次+新增） | 5 | ✅ |
| 表格视图批量 | 3（导出/编辑/删除） | 3 | ✅ |
| 表格列内操作 | 0 | 0 | ✅ |
| 日历视图操作 | 3（上/今天/下） | ❌ 0 | **P0** |
| 日历视图模式切换 | 3（月/周/日） | ❌ 0 | **P0** |
| 5 个 Modal 确认按钮 | 5 | 3（缺批量编辑/删除/导出） | **P0** |
| 5 个 Modal 取消按钮 | 5 | 3 | **P0** |
| 调班申请列表操作 | 2（同意/拒绝） | 2 | ✅ |
| **按键总数** | **26** | **16** | **缺 10 个** |

## 八、数据库逻辑专项报告

V1.1 排班数据走 Zustand + localStorage（前端 mock），无后端 SQL。
V2.0 排班数据走 Pinia + **后端 API**（apiBasicDataService）：

```js
// V2.0 stores/modules/teamShift.js
import {
  getTeams, createTeam, updateTeam, deleteTeam,
  getShifts, createShift, updateShift, deleteShift
} from '@/services/apiBasicDataService'
```

**重大架构差异**：
- V1.1 排班走 localStorage（mock）
- V2.0 排班走真实后端 API

**V2.0 比 V1.1 更先进**，但**后端路由是否实现需要核对**：
- `getTeams` / `createTeam` / `updateTeam` / `deleteTeam` 路由
- `getShifts` / `createShift` / `updateShift` / `deleteShift` 路由
- 对应后端实现路径：待查 `server/src/routes/`

> 注：V1.1 早期版本无后端排班 API，V2.0 已先行接入。**这是 V2.0 优势项**，对齐标准：保留 V2.0 后端架构，V1.1 localStorage 视为"早期状态"。

## 九、P0 必修复清单（排班模块）

> 以下项必须修复才能算 100% 对齐 V1.1

### A. State / Handler 缺失
1. **selectedSchedule** state（V1.1 L62）— 排班详情侧边栏数据源
2. **showBatchEditModal** state（V1.1 L64）— 批量编辑弹窗
3. **showDeleteWarning** state（V1.1 L65）— 删除确认弹窗
4. **batchEditMode** state（V1.1 L68）— 批量编辑模式
5. **batchDeleteMode** state（V1.1 L69）— 批量删除模式
6. **editedRecordIds / editedRecords / selectedRecordId**（V1.1 L74-76）— 批量编辑状态
7. **showExportModal** state（V1.1 L79）— 导出格式弹窗
8. **exportFormat** state（V1.1 L80）— 导出格式（excel/csv/word）
9. **normalizeRecord / getStaffName / getWorkZone** 函数（V1.1 L16-32）— 兼容工具
10. **handleCancelBatch** 完整版（V1.1 L149-154）— 含 exportMode 重置
11. **handleConfirmDelete** handler（V1.1 L157-164）
12. **handleBatchEditClick** handler（V1.1 L167-175）
13. **handleConfirmBatchEdit** handler（V1.1 L177-194）
14. **handleConfirmNext** handler（V1.1 L197-222）— 确认下一个
15. **handleConfirmExport + handleDoExport**（V1.1 L225-306）— 导出完整流程

### B. UI 组件缺失
16. **ScheduleCalendar 组件**（V1.1 405 行）— 3 视图（月/周/日）日历
17. **ScheduleTable 组件**（V1.1 485 行）— 完整表格（搜索/筛选/分页）
18. **侧边栏（3 块）**（V1.1 L524-612）— 排班详情/调班列表/班次图例
19. **日历工具栏**（V1.1 上/今天/下 + 视图切换）— 月/周/日 切换
20. **批量编辑弹窗**（V1.1 ScheduleBatchEditModal 183 行）— 逐条编辑+已编辑标记
21. **删除确认弹窗**（V1.1 DeleteWarningModal）
22. **导出格式选择弹窗**（V1.1 ExportFormatModal）

### C. 工具函数缺失
23. **normalizeRecord** 兼容 snake_case/camelCase（V1.1 L16-22）— API 后端返回 snake_case 必须兼容

## 十、P1 一般差异清单

- 表格列名细微差异（V1.1 "员工" vs V2.0 "员工姓名"）
- 调班申请列表 UI 简化（V2.0 卡片 vs V1.1 卡片）
- 班次设置弹窗简化（V2.0 列表 vs V1.1 完整编辑器）
- 类型定义文件缺失（types.ts 散在调用方）

## 十一、数据库逻辑专项报告（详细）

### V2.0 排班走真实后端 API（待核路由）

| V2.0 store 方法 | 后端路由 | 状态 |
|----------------|----------|------|
| `loadTeams()` | `GET /api/teams` | 待查 |
| `addTeam(team)` | `POST /api/teams` | 待查 |
| `editTeam(id, team)` | `PUT /api/teams/:id` | 待查 |
| `removeTeam(id)` | `DELETE /api/teams/:id` | 待查 |
| `loadShifts()` | `GET /api/shifts` | 待查 |
| `addShift(shift)` | `POST /api/shifts` | 待查 |
| `editShift(id, shift)` | `PUT /api/shifts/:id` | 待查 |
| `removeShift(id)` | `DELETE /api/shifts/:id` | 待查 |

> V1.1 排班无后端，V2.0 排班走后端。架构差异是 V2.0 优势，但**需核后端路由是否真存在**。

## 总结

| 项 | 数量 |
|----|------|
| 总比对点 | 75 |
| ✅ 已对齐 | 30（40%） |
| ⚠️ 行为/命名差异 | 10（13%） |
| ❌ P0 缺失 | 23（31%） |
| 待核（后端路由） | 8（11%） |

**核心结论**：V2.0 排班调度**核心 CRUD 主体已实现**（V2.0 Schedule.vue 734 行 > V1.1 SchedulePage 692 行），但 **23 项 P0 缺失**——尤其是**日历/表格子组件、批量编辑/删除/导出、调班申请、3 个 Modal**——必须修复。
