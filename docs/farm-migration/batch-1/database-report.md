# 数据库逻辑专项报告（V1.1 vs V2.0 后端 SQL 逐行核对）

> 批：1 ｜ 范围：班组 + 排班 后端 API 与 SQL 字段
> 比对日期：2026-06-15
> **结论：V2.0 后端 8 路由 100% 存在，但字段模型与 V1.1 差异大，需逐行核对**

## 一、后端路由核查（100% 存在）

| V2.0 路由 | basicData.js 行 | SQL 类型 | 状态 |
|----------|---------------|---------|------|
| `GET /api/teams` | L773 | SELECT | ✅ 存在 |
| `POST /api/teams` | L807 | INSERT | ✅ 存在 |
| `PUT /api/teams/:id` | L832 | UPDATE | ✅ 存在 |
| `DELETE /api/teams/:id` | L862 | UPDATE 软删除 | ✅ 存在 |
| `GET /api/shifts` | L1783 | SELECT | ✅ 存在 |
| `POST /api/shifts` | L1815 | INSERT | ✅ 存在 |
| `PUT /api/shifts/:id` | L1850 | UPDATE | ✅ 存在 |
| `DELETE /api/shifts/:id` | L1879 | UPDATE 软删除 | ✅ 存在 |

## 二、Teams 表 SQL 字段（逐行核对）

### V1.1 Team 类型（types.ts L6-17）
```typescript
interface Team {
  id: string;              // 班组ID
  name: string;            // 班组名称
  leaderId: string;        // 负责人ID
  leaderName: string;      // 负责人姓名
  memberIds: string[];     // 成员ID列表
  memberCount: number;     // 成员数量
  description?: string;    // 班组描述
  workZone?: string;       // 作业区域
  createdAt: string;
  updatedAt: string;
}
```

### V2.0 Teams 表 SELECT（L777-783）
```sql
SELECT t.id, t.oid, t.team_code, t.team_name, t.department_oid, t.leader_id, t.leader_name, t.shift_type, t.member_count, t.status, t.created_at,
       d.name as department_name
FROM teams t
LEFT JOIN departments d ON t.department_oid = d.oid
WHERE t.status = 'active'
ORDER BY t.team_code
```

### V2.0 Teams 表 INSERT（L818-820）
```sql
INSERT INTO teams (id, oid, team_code, team_name, department_oid, leader_name, shift_type, member_count, description, status, created_at, updated_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
```

### V2.0 Teams 表 UPDATE（L839-850）
```sql
UPDATE teams
SET team_name = COALESCE(?, team_name),
    team_code = COALESCE(?, team_code),
    department_oid = COALESCE(?, department_oid),
    leader_name = COALESCE(?, leader_name),
    shift_type = COALESCE(?, shift_type),
    member_count = COALESCE(?, member_count),
    description = COALESCE(?, description),
    status = COALESCE(?, status),
    updated_at = ?
WHERE id = ?
```

### 字段差异逐行对照

| # | V1.1 字段 | V2.0 字段 | V1.1 类型 | V2.0 类型 | 状态 |
|---|----------|----------|----------|----------|------|
| 1 | `id` | `id` | string | TEXT PRIMARY KEY | ✅ 1:1 |
| 2 | - | `oid` | - | TEXT（外部ID） | V2.0 新增 |
| 3 | `name` | `team_name` | string | TEXT | ⚠️ 命名差异 |
| 4 | - | `team_code` | - | TEXT | V2.0 新增 |
| 5 | - | `department_oid` | - | TEXT (FK→departments) | V2.0 新增（关联部门） |
| 6 | - | `shift_type` | - | TEXT | V2.0 新增（关联班次） |
| 7 | `leaderId` | `leader_id` | string | TEXT | ⚠️ snake_case |
| 8 | `leaderName` | `leader_name` | string | TEXT | ⚠️ snake_case |
| 9 | - | - | - | - | **❌ memberIds 缺失**（V1.1 数组，V2.0 完全没存具体成员） |
| 10 | `memberCount` | `member_count` | number | INTEGER | ⚠️ snake_case |
| 11 | `description?` | `description` | string? | TEXT | ✅ 1:1 |
| 12 | `workZone?` | - | string? | - | **❌ V2.0 缺失 workZone**（V2.0 用 department_oid 替代） |
| 13 | `createdAt` | `created_at` | string | TEXT | ⚠️ snake_case |
| 14 | `updatedAt` | `updated_at` | string | TEXT | ⚠️ snake_case |
| 15 | - | `status` | - | TEXT ('active'/'inactive') | V2.0 新增（软删除） |

## 三、Shifts 表 SQL 字段（逐行核对）

### V1.1 ShiftConfig（types.ts L23-28）
```typescript
interface ShiftConfig {
  name: ShiftType;     // '早班' | '中班' | '晚班' | '全天' | '弹性'
  startTime: string;
  endTime: string;
  color: string;
}
```

### V2.0 Shifts 表 SELECT（L1787-1790）
```sql
SELECT id, oid, shift_code, shift_name, start_time, end_time, shift_type, description, status, created_at, updated_at
FROM shifts
WHERE status != 'deleted'
ORDER BY start_time
```

### V2.0 Shifts 表 INSERT（L1825-1826）
```sql
INSERT INTO shifts (oid, shift_code, shift_name, start_time, end_time, shift_type, description, status, created_at, updated_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
```

### 字段差异逐行对照

| # | V1.1 字段 | V2.0 字段 | V1.1 类型 | V2.0 类型 | 状态 |
|---|----------|----------|----------|----------|------|
| 1 | - | `id` | - | INTEGER PRIMARY KEY | V2.0 新增 |
| 2 | - | `oid` | - | TEXT（外部ID） | V2.0 新增 |
| 3 | - | `shift_code` | - | TEXT | V2.0 新增 |
| 4 | `name` | `shift_name` | string | TEXT | ⚠️ 命名差异 |
| 5 | `startTime` | `start_time` | string | TEXT | ⚠️ snake_case |
| 6 | `endTime` | `end_time` | string | TEXT | ⚠️ snake_case |
| 7 | - | `shift_type` | - | TEXT | V2.0 新增（与 name 重复？） |
| 8 | - | `description` | - | TEXT | V2.0 新增 |
| 9 | - | `status` | - | TEXT | V2.0 新增 |
| 10 | - | `created_at` | - | TEXT | V2.0 新增 |
| 11 | - | `updated_at` | - | TEXT | V2.0 新增 |
| 12 | `color` | - | string | - | **❌ V2.0 缺失 color**（前端写死颜色） |

## 四、关键问题（P0 必修复）

### 问题 1：两套班组数据模型并存（架构性）

V2.0 项目内部存在**两套班组数据模型**：

| 来源 | 模型字段 | 持久化 | 页面 |
|------|---------|--------|------|
| `stores/modules/team.js` | `name, leaderId, leaderName, memberIds[], memberCount, description, workZone` | localStorage | Team.vue 班组分配 |
| `stores/modules/teamShift.js` | `teamName, teamCode, departmentOid, leaderName, shiftType, memberCount, description` | API | TeamManagement.vue 班组管理 |

**两套模型字段命名不同，调用 API 不同**。同一项目内不同页面看到的"班组"数据不一致！

**修复方向**：
1. 统一为一套模型（推荐 API 版，因为 V2.0 后端架构更先进）
2. team.js 改为调 API 而非 localStorage
3. V2.0 Team.vue 班组分配改成走 teamShift.js（API）

### 问题 2：V1.1 memberIds[] 在 V2.0 缺失

V1.1 班组类型有 `memberIds: string[]`（具体成员 ID 列表），V2.0 Teams 表只存 `member_count`（成员数量）不存具体 ID。

**影响**：
- 班组分配功能（V2.0 Team.vue）的"分配工人"操作无法真正持久化
- 班组详情弹窗（L48 `getMemberName(memberId)`）显示的成员姓名无法回查

**修复方向**：
- 在 teams 表加 `member_ids` TEXT 字段存 JSON 数组
- 或新建 `team_members` 关联表

### 问题 3：V1.1 workZone 在 V2.0 缺失

V1.1 班组有 `workZone`（作业区域），V2.0 改用 `department_oid` 关联部门表。

**修复方向**：
- 保留 V2.0 department_oid 架构（更规范）
- 在前端 team.js 加 `workZone` 字段，从 `department_oid → departments.name` 解析

### 问题 4：snake_case vs camelCase

V2.0 后端 SQL 全 snake_case（`team_name`），前端响应通过 `replace(/_([a-z])/g, ...)` 转 camelCase（`teamName`）。

**V1.1 无此问题**（V1.1 全程 camelCase + TypeScript 类型）。

**修复方向**：
- 已自动转换（V2.0 L791-792），但前端消费时仍需 `normalizeRecord` 兼容

### 问题 5：V1.1 ShiftConfig.color 在 V2.0 缺失

V1.1 ShiftConfig 有 `color: string`（如 `'bg-blue-500'`），V2.0 shifts 表无 color 字段。

**修复方向**：
- 前端从 shift_name 推导颜色（如 '早班'=blue, '中班'=green）
- 或加 color 字段

## 五、整体结论

| 维度 | V1.1 | V2.0 | 评价 |
|------|------|------|------|
| **后端持久化** | ❌ localStorage | ✅ SQLite | V2.0 优势 |
| **字段模型** | camelCase 完整 | snake_case 含冗余 | V1.1 简洁 |
| **memberIds 持久化** | ✅ 完整 | ❌ 缺失 | V1.1 优势 |
| **workZone 字段** | ✅ 显式 | ⚠️ 改用关联表 | V2.0 更规范 |
| **审计字段** | ⚠️ 仅 created/updated | ✅ + status + oid | V2.0 优势 |
| **多用户共享** | ❌ | ✅ | V2.0 优势 |

**修复策略**：
1. **保留 V2.0 后端架构**（数据持久化是 V2.0 优势）
2. **修复 V2.0 缺失字段**：teams 表加 `member_ids` 列 + shifts 表加 `color` 列
3. **统一数据模型**：team.js 改为调 API（消除双轨并存）
4. **前端兼容**：team.js store 增加 `normalizeRecord` 工具

## 六、P0 修复清单

1. **V2.0 team.js 改为 API 调用**（与 teamShift.js 合并或统一）
2. **basicData.js POST /api/teams 加 member_ids 字段**
3. **basicData.js POST /api/shifts 加 color 字段**
4. **V2.0 Team.vue 增加 `normalizeRecord` 兼容工具**
5. **V2.0 班组数据从 localStorage 迁移到 API**（用户首次打开页面时把 localStorage 数据 POST 到后端）
6. **V2.0 班组数据统一为 teamShift.js 调用**，废弃 team.js localStorage 版

## 七、P1 修复清单

- teams 表加索引（team_code, status）
- shifts 表加索引（shift_code, status）
- API 加缓存（5 分钟内不重复 GET）
- PUT 加乐观锁（updated_at 检查）

## 总结

| 项 | 数量 |
|----|------|
| 后端路由核查 | 8/8 ✅ |
| SQL 实现核查 | 8/8 ✅ |
| V1.1 字段 1:1 对齐 | 3/15（20%） |
| V2.0 字段缺失（vs V1.1） | 2 项（memberIds, workZone） |
| V1.1 字段缺失（vs V2.0） | 0 项（V2.0 比 V1.1 多 oid/code/status 等） |
| 双轨并存问题 | 1 项严重（team.js vs teamShift.js） |

**核心结论**：V2.0 后端**架构领先 V1.1**，但**字段模型有差异**（memberIds/workZone 缺失）+ **项目内双轨并存**（localStorage vs API）。修复策略 = 保留后端架构 + 补字段 + 统一双轨。
