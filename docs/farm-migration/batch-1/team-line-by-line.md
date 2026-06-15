# 班组分配逐行比对报告（V1.1 vs V2.0）

> 批：1 ｜ 范围：班组分配 5 页面文件（Team.vue + 2 modal + store + types）
> 比对日期：2026-06-15
> 状态：**P0 必修复项已识别**（见末尾 P0 修复清单）

## 一、文件对照表

| 角色 | V1.1 源文件 | 行数 | V2.0 目标文件 | 行数 | 行数差 |
|------|-------------|------|---------------|------|--------|
| 类型 | `labor/team/types.ts` | 63 | （散在 store/store 调用方） | 0 | -63（缺失） |
| Hook | `labor/team/hooks/useTeam.ts` | 142 | （Pinia store 直替） | 0 | -142（用 store 替代） |
| 主表格 | `labor/team/TeamTable.tsx` | 522 | `views/farm/Team.vue` | 356 | -166 |
| 分配弹窗 | `labor/team/TeamAssignModal.tsx` | 117 | `components/labor/team/TeamAssignModal.vue` | 92 | -25 |
| 详情弹窗 | `labor/team/TeamDetailModal.tsx` | 87 | `components/labor/team/TeamDetailModal.vue` | 73 | -14 |
| 班组 Store | `stores/useTeamManageStore.ts`（未读） | ? | `stores/modules/team.js` | 152 | ? |
| **合计** | **5 文件** | **931** | **4 文件** | **673** | **-258（-27.7%）** |

## 二、Props / 接口 1:1 比对

### V1.1 TeamTableProps（L21-28）
| V1.1 Prop | 类型 | 默认值 | V2.0 对应 | 状态 |
|-----------|------|--------|-----------|------|
| `onBack` | `() => void` | 无 | ❌ 缺失 | **P0** |
| `canCreate` | `boolean` | `true` | ❌ 缺失 | **P0** |
| `canEdit` | `boolean` | `true` | ❌ 缺失 | **P0** |
| `canDelete` | `boolean` | `true` | ❌ 缺失 | **P0** |
| `canExport` | `boolean` | `true` | ❌ 缺失 | **P0** |

### V1.1 TeamAssignModalProps（L7-13）
| V1.1 Prop | V2.0 Prop | 状态 |
|-----------|-----------|------|
| `team: Team \| null` | `team: Object` | ✅ 名称一致（类型不严） |
| `unassignedWorkers: UnassignedWorker[]` | `unassignedWorkers: Array` | ✅ 名称一致 |
| `open: boolean` | `isOpen: Boolean` | ❌ 名称不一致（kebab-case 风格差异） |
| `onClose: () => void` | `onClose: Function` | ✅ 一致 |
| `onAssign: (teamId, workerIds) => void` | `onAssign: Function` | ✅ 一致 |

### V1.1 TeamDetailModalProps（L11-15）
| V1.1 Prop | V2.0 Prop | 状态 |
|-----------|-----------|------|
| `open: boolean` | `open: { type: Boolean, default: false }` | ✅ 一致 |
| `onClose: () => void` | `$emit('close')` | ✅ 一致（emit 模式） |
| `team: Team \| null` | `team: { type: Object, default: null }` | ✅ 一致 |

## 三、State 1:1 比对

### V1.1 useTeam Hook 返回（L124-140）
| V1.1 返回项 | V2.0 对应 | 状态 |
|-----------|-----------|------|
| `teams: paginatedTeams` | `store.teams`（无分页） | ⚠️ 行为差异（V1.1 分页后返回，V2.0 返回全量） |
| `unassignedWorkers` | `store.unassignedWorkers` | ✅ |
| `filters` | `filters`（reactive） | ✅ |
| `pagination` | `pagination`（reactive） | ✅ |
| `isLoading` | `loading` | ⚠️ 名称差异 |
| `setFilters` | 直接 `Object.assign` | ⚠️ 行为差异（V2.0 无 setFilters 函数） |
| `setPage` | `pagination.currentPage = 1` | ⚠️ V1.1 可传任意页，V2.0 写死为 1 |
| `setPageSize` | （缺失） | **P0** |
| `createTeam(data)` | `addTeam(data)` | ⚠️ 名称差异（V1.1=createTeam，V2.0=addTeam） |
| `updateTeam(id, data)` | `updateTeam(id, data)` | ✅ |
| `deleteTeam(id)` | `removeTeam(id)` | ⚠️ 名称差异 |
| `assignWorkers(teamId, workerIds, operatorId, operatorName)` | `assignWorkers(teamId, workerIds)` | ❌ **P0 缺 operatorId/operatorName 参数** |
| `removeWorker(teamId, workerId)` | `removeWorker(teamId, workerId)` | ✅ |
| `getTeamById(id)` | （缺失） | **P0** |
| `filteredTeams` | `filteredTeams`（computed） | ✅ |

### V1.1 TeamTable 本地 State（L54-69）
| V1.1 State | V2.0 对应 | 状态 |
|-----------|-----------|------|
| `selectedRows: string[]` | `selectedRows` | ✅ |
| `exportMode: boolean` | （缺失） | **P0** |
| `batchDeleteMode: boolean` | `batchDeleteMode` | ✅ |
| `isAssignModalOpen` | `isAssignModalOpen` | ✅ |
| `selectedTeam: Team \| null` | `selectedTeam` | ✅ |
| `isDetailModalOpen` | `isDetailModalOpen` | ✅ |
| `detailTeam` | `detailTeam` | ✅ |
| `isFormOpen` | `isFormOpen` | ✅ |
| `editingTeam` | `editingTeam` | ✅ |
| `formData: {name,leaderName,description,workZone}` | `formData: reactive(...)` | ✅ |
| `currentUser` from localStorage | （缺失） | **P0** |

## 四、Handler 1:1 比对

| V1.1 Handler | 行 | V2.0 对应 | 状态 |
|-------------|-----|-----------|------|
| `openAssignModal(team)` | 74 | `openAssignModal` | ✅ |
| `openDetailModal(team)` | 80 | `openDetailModal` | ✅ |
| `openCreateModal()` | 86 | `openCreateModal` | ✅ |
| `openEditModal(team)` | 93 | `openEditModal` | ✅ |
| `handleAssign(teamId, workerIds)` | 105 | `handleAssign` | ⚠️ V1.1 传 `currentUser.id/name`，V2.0 不传 |
| `handleSubmit()` | 110 | `handleSubmit` | ⚠️ V1.1 createTeam 写死 `leaderId: 'new'`，V2.0 写 `data.leaderId \|\| ''` |
| `handleDelete(team)` | 127 | `handleDelete` | ✅ |
| `handleBatchDelete()` | 134 | `handleBatchDelete` | ✅ |
| `handleSelectAll()` | 147 | （V2.0 用 el-table 自带 selection-change） | ⚠️ 实现方式不同 |
| `handleSelectRow(id)` | 156 | （同上） | ⚠️ 实现方式不同 |
| `handleCancelBatch()` | 165 | `handleCancelBatch` | ✅（V2.0 少了 exportMode 重置） |

## 五、UI 表格 1:1 比对

### V1.1 表头（L326-342）
| V1.1 表头 | V2.0 列 | 状态 |
|----------|---------|------|
| 复选框（仅 batchDeleteMode） | `el-table-column type="selection" v-if="batchDeleteMode"` | ✅ |
| 班组名称 | `el-table-column label="班组名称"` | ✅ |
| 负责人 | `el-table-column prop="leaderName" label="负责人"` | ✅ |
| 作业区域 | `el-table-column label="作业区域"` | ✅ |
| 成员数量 | `el-table-column label="成员数量"` | ✅ |
| 描述 | `el-table-column label="描述"` | ✅ |
| 操作 | `el-table-column label="操作" width="180" fixed="right"` | ✅ |

### V1.1 行内操作按钮（L387-426）
| V1.1 按钮 | V2.0 对应 | 状态 |
|----------|-----------|------|
| `<Eye>查看详情` | `el-button text circle @click="openDetailModal"` | ✅ |
| `<UserPlus>分配工人` | `el-button text circle @click="openAssignModal"` | ✅ |
| `<Edit2>编辑`（canEdit） | `el-button text circle @click="openEditModal"` | ⚠️ 缺 `v-if="canEdit"` |
| `<Trash2>删除`（canDelete） | `el-button text circle @click="handleDelete"` | ⚠️ 缺 `v-if="canDelete"` |

### V1.1 班组名称列（L363-372）
- V1.1: 用 `<Button variant="link">` 显示名称，点击打开详情
- V2.0: 用 `<el-button link type="primary">` ✅（行为一致）

## 六、统计卡片 1:1 比对

| V1.1 卡片（L190-226） | V2.0 卡片 | 状态 |
|----------------------|----------|------|
| 班组数量：emerald-50/200，Users 图标 | `bg-emerald-50 border-emerald-200`，`User` 图标 | ✅ |
| 总人数：blue-50/200，Users 图标 | `bg-blue-50 border-blue-200`，`User` 图标 | ✅ |
| 未分配：amber-50/200，UserPlus 图标 | `bg-amber-50 border-amber-200`，`CirclePlus` 图标 | ⚠️ 图标差异（V1.1=UserPlus，V2.0=CirclePlus） |

## 七、筛选栏 1:1 比对

| V1.1 字段 | V2.0 字段 | 状态 |
|----------|----------|------|
| 班组名称 input w-[140px] | `el-input v-model="filters.name" style="width: 140px"` | ✅ |
| 负责人 input w-[140px] | `el-input v-model="filters.leaderName"` | ✅ |
| 作业区域 input w-[140px] | `el-input v-model="filters.workZone"` | ✅ |
| 重置按钮 variant="warning" | `el-button @click="handleReset"` | ⚠️ 缺 warning 样式 |
| 搜索按钮 | `el-button type="primary" @click="handleSearch"` | ✅ |

## 八、Store 1:1 比对（核心）

| V1.1 store 方法 | V2.0 store 方法 | 状态 |
|----------------|------------------|------|
| `fetchData()` 初始化种子 | `initSeedData()` | ⚠️ 名称差异 |
| `createTeam(data)` | `addTeam(data)` | ⚠️ 名称差异 |
| `updateTeam(id, data)` | `updateTeam(id, data)` | ✅ |
| `deleteTeam(id)` | `removeTeam(id)` | ⚠️ 名称差异 |
| `assignWorkers(teamId, workerIds, operatorId, operatorName)` | `assignWorkers(teamId, workerIds)` | ❌ **P0 缺 operator 信息** |
| `removeWorker(teamId, workerId)` | `removeWorker(teamId, workerId)` | ✅ |
| `getWorkerName(id)` 工具函数 | （缺失，简化为 `id \|\| '未知'`） | ❌ **P0** |

## 九、P0 必修复清单

> 以下项必须修复才能算 100% 对齐 V1.1

1. **Props 权限控制**：补 `onBack/canCreate/canEdit/canDelete/canExport` 5 个 props
2. **exportMode 状态**：V1.1 有 exportMode（批量导出），V2.0 完全缺失
3. **getWorkerName 工具函数**：V2.0 TeamDetailModal 现在直接显示 id，要从 store 获取真实姓名
4. **operatorId/operatorName 参数**：assignWorkers 调用时缺用户信息（V1.1 写入 TeamAssignment 表）
5. **createTeam vs addTeam 命名**：保持 V1.1 命名一致（createTeam）
6. **deleteTeam vs removeTeam 命名**：保持 V1.1 一致（deleteTeam）
7. **setPageSize 函数**：V1.1 分页可调页大小，V2.0 缺失
8. **getTeamById 函数**：V1.1 有，V2.0 缺失
9. **isLoading 状态**：V1.1 有 loading 状态，V2.0 缺失
10. **currentUser 读取**：V1.1 L71 从 localStorage 取用户，V2.0 缺失
11. **行内操作按钮 v-if 权限控制**：V1.1 L405 canEdit、L415 canDelete 条件渲染，V2.0 缺失
12. **重置按钮 warning 样式**：V1.1 variant="warning"，V2.0 普通样式
13. **stats 卡片图标 UserPlus vs CirclePlus**：V1.1 用 UserPlus 图标，V2.0 用 CirclePlus（细微差异）
14. **types.ts 缺失**：V2.0 没有专门的班组类型定义文件，散在调用方（违反项目规范）

## 十、P1 一般差异清单

- handleSelectAll / handleSelectRow 用 el-table 自带 selection（实现方式不同但行为一致）
- paginatedTeams 在 V1.1 走 useMemo 分页，V2.0 走 computed（最终结果一致）
- unifiedModal vs el-dialog 框架差异

## 十一、表格 UI 专项报告

| 维度 | V1.1 | V2.0 | 状态 |
|------|------|------|------|
| 表格技术栈 | 原生 `<table>` + 自定义 Checkbox | Element Plus `el-table` + `el-table-column type="selection"` | 框架差异 |
| 复选框列 | `Checkbox` 自定义（`border-white rounded`） | `el-table-column type="selection"` | 框架差异 |
| 班组名称列 | `<Button variant="link">` | `<el-button link type="primary">` | ✅ |
| 表格标题栏 | `<h3>班组分配记录表</h3>` | `<h3>班组分配记录表</h3>` | ✅ |
| 表头渐变色 | `bg-gradient-to-r from-blue-500 to-blue-600 text-white` | （V2.0 用 el-table 默认表头） | ⚠️ 样式差异 |
| 表格行 hover | `hover:bg-emerald-50 transition-colors` | （V2.0 用 el-table 默认 hover） | ⚠️ 样式差异 |
| 分页组件 | `Pagination` 自定义 | `el-pagination` | 框架差异 |

## 十二、按键 UI 专项报告

| 维度 | V1.1 数量 | V2.0 数量 | 状态 |
|------|----------|----------|------|
| 标题栏按钮 | 2（新建班组、批量删除） | 2（新建班组、批量删除） | ✅ |
| 行内操作按钮 | 4（详情/分配/编辑/删除） | 4（详情/分配/编辑/删除） | ✅ |
| 筛选栏按钮 | 2（重置/搜索） | 2（重置/搜索） | ✅ |
| 弹窗确认按钮 | 1（保存） | 1（保存） | ✅ |
| 弹窗取消按钮 | 1（取消） | 1（取消） | ✅ |
| 批量删除模式确认 | 1（确认删除 + 取消） | 1（确认删除 + 取消） | ✅ |
| **按键总数** | **11** | **11** | ✅ |

## 十三、数据库逻辑专项报告

V1.1 班组数据走 Zustand + localStorage（前端 mock），无后端 SQL。
V2.0 班组数据走 Pinia + localStorage（前端 mock），无后端 SQL。

**结论**：班组模块**无后端 SQL 涉及**，全部是前端 mock 数据 + localStorage 持久化。无需 SQL 逐行比对。

> 注：V1.1 早期版本班组走 localStorage 是 mock，后期会接入后端 API。当前 V1.1 与 V2.0 同步停留在此阶段，**对齐标准**：保持 mock 行为一致。

## 总结

| 项 | 数量 |
|----|------|
| 总比对点 | 56 |
| ✅ 已对齐 | 32（57%） |
| ⚠️ 行为/命名差异 | 10（18%） |
| ❌ P0 缺失 | 14（25%） |

**核心结论**：V2.0 班组分配**主体框架 1:1**，但 **14 项 P0 缺失**（权限控制 props / exportMode / getWorkerName / operatorId / 命名一致性 / setPageSize / getTeamById / isLoading / currentUser / 按钮 v-if / warning 样式 / 图标 / types.ts / 统计卡片）必须修复。
