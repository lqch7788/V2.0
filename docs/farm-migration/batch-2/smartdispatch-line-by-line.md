# 智能任务中心逐行比对报告（V1.1 vs V2.0）

> 批：2-B ｜ 范围：智能任务中心（taskDispatch 25 文件）
> 比对日期：2026-06-15
> **架构差异：V1.1 任务派发为中心，V2.0 智能推荐为中心**

## 一、文件对照表

| 角色 | V1.1 源文件 | 行数 | V2.0 目标 | 行数 |
|------|-------------|------|-----------|------|
| 类型/常量 | constants/taskDispatchConstants.ts | ? | （散在） | 0 |
| 13 components | ConfigFieldRenderer / FilterToolbar / OvertimeBadge / PageHeader / StatsCards / TaskExecuteCard / TaskProgressTimeline / TaskTable*3 / TaskTypeConfig*2 | ~2500 | （集成在 SmartDispatch.vue） | 0 |
| 9 modals | BatchEdit / CreateTask / DeleteWarning / ExportFormat / OvertimeHandle / ReassignTask / TaskAcceptance / VerifyTask / WithdrawCancel | ~1800 | （5 modal 集成） | 0 |
| 主页 | useTaskTypeConfig hook | ? | SmartDispatch.vue | 711 |
| **合计** | **25 文件** | **~5000+** | **1 文件** | **711** |

## 二、架构差异（核心）

| 维度 | V1.1 任务派发 | V2.0 智能推荐 |
|------|-------------|---------------|
| 核心流程 | 创建任务→筛选→派发→执行→验收 | 智能推荐→接受/更换/延后→派发 |
| 主页面 | 表格 + 筛选 + 批量操作 | 智能推荐卡片 + 任务池 |
| 视图 | 列表/日历切换 | 列表/任务池切换 |
| 统计 | StatsCards 6 个 | 推荐/已派发/待执行统计 |
| 5 筛选 | FilterToolbar 5 字段 | sourceFilter 1 字段 |

## 三、V1.1 CreateTaskModal 11 字段（V2.0 严重缺失）

| 字段 | V1.1 | V2.0 |
|------|------|------|
| 任务编号 | ✅ | ❌ |
| 任务类型 | ✅ | ❌ |
| 温室/大田 | ✅ | ❌ |
| 作物 | ✅ | ❌ |
| 执行人 | ✅ | ⚠️ 简化 |
| 优先级 | ✅ | ❌ |
| 计划开始时间 | ✅ | ⚠️ |
| 计划结束时间 | ✅ | ⚠️ |
| 预计天数 | ✅ | ❌ |
| 预计小时 | ✅ | ❌ |

## 四、V1.1 FilterToolbar 5 筛选

| 筛选 | V1.1 | V2.0 |
|------|------|------|
| 任务ID 搜索 | ✅ | ❌ |
| 时间范围 | ✅ | ❌ |
| 任务区域 | ✅ | ❌ |
| 执行人 | ✅ | ❌ |
| 状态 | ✅ | ⚠️ 简化 |

## 五、5 Modal 实现对比

| Modal | V1.1 | V2.0 | 状态 |
|-------|------|------|------|
| CreateTaskModal 11 字段 | ✅ | ❌ | **P0** |
| BatchEditModal | ✅ | ⚠️ 部分 | ⚠️ |
| DeleteWarningModal | ✅ | ❌ | **P0** |
| ExportFormatModal | ✅ | ❌ | **P0** |
| OvertimeHandleModal | ✅ | ❌ | **P0** |
| ReassignTaskModal | ✅ | ⚠️ showReplaceModal | ✅ 简化版 |
| TaskAcceptanceModal | ✅ | ⚠️ handleAccept | ✅ 简化版 |
| VerifyTaskModal | ✅ | ❌ | **P0** |
| WithdrawCancelModal | ✅ | ❌ | **P0** |
| showDelayModal（V2.0 独有） | ❌ | ✅ | V2.0 优势 |
| showSplitModal（V2.0 独有） | ❌ | ✅ | V2.0 优势 |
| showConfigPanel | ❌ | ✅ | V2.0 优势 |

## 六、Components 对比（V1.1 13 / V2.0 0）

| V1.1 Component | V2.0 对应 | 状态 |
|---------------|----------|------|
| ConfigFieldRenderer | ❌ | **P0** |
| FilterToolbar | ⚠️ 简化 | **P0** |
| OvertimeBadge | ❌ | **P0** |
| PageHeader | ⚠️ 简化 | **P0** |
| StatsCards | ⚠️ 简化 | **P0** |
| TaskExecuteCard | ❌ | **P0** |
| TaskProgressTimeline | ❌ | **P0** |
| TaskTable + Header + Row | ⚠️ 简化 | **P0** |
| TaskTypeConfigDisplay | ❌ | **P0** |
| TaskTypeConfigPanel | ⚠️ showConfigPanel | ⚠️ |

## 七、真实 P0 缺失清单

### A. 核心 Modal 缺失（5 项）
1. CreateTaskModal 11 字段（任务创建基础功能）
2. DeleteWarningModal（删除确认）
3. ExportFormatModal（导出格式）
4. OvertimeHandleModal（超时处理）
5. VerifyTaskModal（任务验收）
6. WithdrawCancelModal（撤回/取消）

### B. 筛选工具栏（1 项）
7. FilterToolbar 5 字段完整版（任务ID/时间/区域/执行人/状态）

### C. 13 组件（10 项）
8. ConfigFieldRenderer
9. OvertimeBadge
10. PageHeader
11. StatsCards
12. TaskExecuteCard
13. TaskProgressTimeline
14. TaskTable/Header/Row（拆分）
15. TaskTypeConfigDisplay
16. TaskTypeConfigPanel

## 八、修复策略

**最小修补清单**（保留 V2.0 智能推荐架构，补充 V1.1 缺失）：
- A 段：补 CreateTaskModal 11 字段（最关键）
- B 段：补 FilterToolbar 5 筛选
- C 段：补 DeleteWarning/ExportFormat/VerifyTask 3 Modal
- D 段：补 OvertimeBadge/TaskProgressTimeline 2 关键组件

## 九、V2.0 优势保留项

- 智能推荐 4 状态（recommended/optimization/dispatched/pending）
- 任务池/推荐池双视图
- showDelayModal（V1.1 无）
- showSplitModal（V1.1 无）
- 实时推荐 worker 匹配

## 总结

| 项 | 数量 |
|----|------|
| V1.1 源文件 | 25 |
| V2.0 实现 | 1 文件（711 行） |
| P0 缺失 | 16 项 |
| V2.0 优势 | 智能推荐+任务池双视图 |
| 架构差异 | 任务派发 vs 智能推荐 |

**修复策略**：保留 V2.0 智能推荐架构，补 V1.1 缺失的 16 项关键功能（重点：CreateTaskModal 11 字段 + 5 Modal + FilterToolbar）。
