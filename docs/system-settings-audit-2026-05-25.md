# V2.0 系统设置模块完整审核报告与修复规划

> 审核日期：2026-05-25
> 审核目的：对比 V1.1 和 V2.0 系统设置模块，找出功能缺失和不完整之处，制定详细修复规划
> **重要：本规划供 AI 子代理执行，必须确保不遗漏任何功能**

---

## 一、系统设置模块结构对比

### 1.1 Store/状态管理层对比

| V1.1 Store 文件 | V2.0 Store 文件 | 状态 |
|----------------|-----------------|------|
| useAuthStore.ts | user.js | ⚠️ **严重缺失** - V2.0 user.js 缺少完整的认证权限系统 |
| useOrganizationStore.ts | authority.js | ⚠️ **部分缺失** - 缺少角色权限管理 |
| useDepartmentStore.ts | department.js | ✅ 存在 |
| useDictionaryStore.ts | - | ❌ **缺失** |
| useSystemConfigStore.ts | systemConfig.js | ✅ 存在 |
| useSettingsStore.ts | - | ❌ **缺失** |
| useAlarmConfigStore.ts | alarmConfig.js | ✅ 存在 |
| useAreaSystemStore.ts | areaSystem.js | ✅ 存在 |
| useDeviceSystemStore.ts | deviceSystem.js | ✅ 存在 |
| useEnergyConfigStore.ts | energyConfig.js | ✅ 存在 |
| useNotificationSettingsStore.ts | notificationSettings.js | ✅ 存在 |
| usePositionStore.ts | - | ❌ **缺失** |
| useGreenhouseStore.ts | greenhouse.js | ✅ 存在 |
| useWarehouseStore.ts | (在 inventory 下) | ✅ 存在 |
| useZoneStore.ts | zone.js | ✅ 存在 |
| useBlockStore.ts | blockStore.js | ✅ 存在 |
| useFarmPartitionStore.ts | farmPartition.js | ✅ 存在 |
| useCameraStore.ts | camera.js | ✅ 存在 |
| usePlantSettingStore.ts | plantSetting.js | ✅ 存在 |
| useProcessDefinitionStore.ts | processDefinition.js | ✅ 存在 |
| - | cropVariety.js | 🆕 V2.0 新增 |

**Store 层缺失统计：**
- 完全缺失：useSettingsStore, useDictionaryStore, usePositionStore
- 严重缺失：useAuthStore（核心认证权限系统）

### 1.2 页面文件对比

#### 权限管理模块 (authority/)

| V1.1 页面 | V2.0 页面 | 状态 |
|-----------|-----------|------|
| UserManagement.tsx | UserManagement.vue | ⚠️ 功能不完整 |
| RoleManagement.tsx | RoleManagement.vue | ⚠️ 功能不完整 |
| OrganizationManagement.tsx | OrganizationManagement.vue | ⚠️ 功能不完整 |
| AuthorityConfiguration.tsx | AuthorityConfiguration.vue | ⚠️ 功能不完整 |
| UserAuthorityConfig.tsx | UserAuthorityConfig.vue | ❌ **严重缺失** - 用户权限分配功能 |
| UserPermissionHub.tsx | UserPermissionHub.vue | ⚠️ 功能不完整 |
| BaseManagement.tsx | - | ❌ **缺失** |
| DictionaryManagement.tsx | DictionaryManagement.vue | ⚠️ 功能不完整 |
| SystemConfigManagement.tsx | SystemConfig.vue | ⚠️ 功能不完整 |
| WarehouseManagement.tsx | WarehouseManagement.vue | ⚠️ 功能不完整 |
| GreenhouseManagement.tsx | - | ❌ **缺失** |

#### 系统管理模块 (system/)

| V1.1 页面 | V2.0 页面 | 状态 |
|-----------|-----------|------|
| AlarmConfigManagement.tsx | AlarmConfigManagement.vue | ✅ 基本完整 |
| AreaSystemManagement.tsx | AreaSystemManagement.vue | ✅ 基本完整 |
| BackupRecovery.tsx | BackupRecovery.vue | ✅ 基本完整 |
| CameraManagement.tsx | CameraManagement.vue | ✅ 基本完整 |
| DataMigration.tsx | - | ❌ **缺失** |
| DeviceDistributionManagement.tsx | DeviceDistributionManagement.vue | ✅ 基本完整 |
| DeviceSystemManagement.tsx | DeviceSystemManagement.vue | ✅ 基本完整 |
| EnergyConfigManagement.tsx | EnergyConfigManagement.vue | ✅ 基本完整 |
| FarmPartitionManagement.tsx | FarmPartitionManagement.vue | ✅ 基本完整 |
| PlantSettingManagement.tsx | PlantSettingManagement.vue | ✅ 基本完整 |
| ProjectDebugManagement.tsx | ProjectDebugManagement.vue | ✅ 基本完整 |
| SystemMonitor.tsx | SystemMonitor.vue | ✅ 基本完整 |
| WaterFertilizerManagement.tsx | WaterFertilizerManagement.vue | ✅ 基本完整 |

#### 主目录页面

| V1.1 页面 | V2.0 页面 | 状态 |
|-----------|-----------|------|
| SystemConfig.tsx | SystemConfig.vue | ✅ 基本完整 |
| BaseSettings.tsx | BaseSettings.vue | ✅ 基本完整 |
| DictionaryManagement.tsx | DictionaryManagement.vue | ⚠️ 功能不完整 |
| AuditLog.tsx | AuditLog.vue | ✅ 基本完整 |
| NotificationSettings.tsx | NotificationSettings.vue | ✅ 基本完整 |
| ApprovalLevelConfig.tsx | ApprovalLevelConfig.vue | ✅ 基本完整 |
| ApprovalWorkflowConfig.tsx | ApprovalWorkflowConfig.vue | ✅ 基本完整 |
| PositionManagement.tsx | - | ❌ **缺失** |
| PersonnelManagement.tsx | - | ❌ **缺失** |
| StaffManagement.tsx | - | ❌ **缺失** |
| ProcessManagement.tsx | ProcessManagement.vue | ✅ 基本完整 |
| UserPermission.tsx | - | ❌ **缺失** |

---

## 二、详细功能缺失分析

### 2.1 【严重】useAuthStore 认证权限系统

**V1.1 useAuthStore.ts 完整功能：**
```typescript
// 完整类型
interface CurrentUser { oid, username, realName, orgOid, email, phone, status }
interface RoleSummary { oid, code, name, isSystem }
interface AuthorityEntry { processOid, actionOid, value }
interface UserAuthorityEntry { userOid, processOid, actionOid, value }
interface MyPermissionsResponse { user, roles, isAdmin, authorities, userAuthorities, dataOrgOids }

// 完整状态
token, currentUser, isAuthenticated
roles[], authorities[], userAuthorities[], dataOrgOids[]
isLoading, error

// 完整方法
login(), logout(), loadPermissions(), verifyToken()
hasPermission(processRoute, actionCode) // 权限检查核心方法
canAccessProcess(processRoute) // 进程访问检查
getAccessibleMenuRoutes(allRoutes[]) // 获取可访问菜单
```

**V2.0 user.js 当前状态：**
```javascript
// 只有简单状态
token, userInfo, permissions, users, loading, error

// 只有简单方法
setToken(), setUserInfo(), logout()
loadUsers() // 简单加载用户列表
login() // 简单登录
```

**缺失的核心里程碑功能：**
1. ❌ CurrentUser 完整类型
2. ❌ roles, authorities, userAuthorities, dataOrgOids 状态
3. ❌ hasPermission() - 权限检查核心方法
4. ❌ canAccessProcess() - 进程访问检查
5. ❌ getAccessibleMenuRoutes() - 动态菜单过滤
6. ❌ 三级降级架构（enhancedApiClient → API → IndexedDB → localStorage）

---

### 2.2 【严重】useOrganizationStore 角色权限管理

**V1.1 useOrganizationStore.ts 完整功能：**
```typescript
// 组织管理
organizations[], loadOrganizations(), saveOrganization(), deleteOrganization()

// 角色管理
roles[], loadRoles(), saveRole(), deleteRole()

// 用户管理
users[], loadUsers(), saveUser(), deleteUser()
getUserRoles(userOid), assignUserRoles(userOid, roleOids)

// 工序管理
processes[], loadProcesses(), saveProcess(), deleteProcess()

// 动作管理
actions[], loadActions()

// 角色权限管理
roleAuthorities[], loadRoleAuthority(), saveRoleAuthority()
roleDataAuthorities[], loadRoleDataAuthority(), saveRoleDataAuthority()
```

**V2.0 authority.js 当前状态：**
```javascript
// 只有 CRUD 基本操作
organizations[], loadOrganizations(), saveOrganization(), deleteOrganization()
roles[], loadRoles(), saveRole(), deleteRole()
users[], loadUsers(), saveUser(), deleteUser()
// 缺失：getUserRoles, assignUserRoles, 角色权限管理
```

**缺失功能：**
1. ❌ getUserRoles(userOid) - 获取用户角色
2. ❌ assignUserRoles(userOid, roleOids) - 分配用户角色
3. ❌ processes[], loadProcesses() - 工序管理
4. ❌ actions[], loadActions() - 动作管理
5. ❌ roleAuthorities[], loadRoleAuthority() - 角色权限
6. ❌ saveRoleAuthority() - 保存角色权限
7. ❌ roleDataAuthorities[], loadRoleDataAuthority() - 数据权限
8. ❌ saveRoleDataAuthority() - 保存数据权限

---

### 2.3 【中等】字典管理 DictionaryManagement

**V1.1 功能：**
- 字典类型管理（增删改查）
- 字典项管理（增删改查）
- 字典数据导入导出
- 字典缓存管理

**V2.0 现状：**
- V2.0 有 DictionaryManagement.vue 页面
- 但缺少对应的 Store（useDictionaryStore）
- 缺少完整的字典 CRUD API

---

### 2.4 【中等】用户权限配置 UserAuthorityConfig

**V1.1 功能：**
- 查看用户拥有的角色
- 分配/取消用户角色
- 设置用户特殊权限（覆盖角色权限）
- 数据权限范围设置

**V2.0 现状：**
- V2.0 有 UserAuthorityConfig.vue 页面
- 但页面调用的是简化的 user.js，没有完整的权限分配功能

---

## 三、修复优先级定义

### P0 - 核心系统（必须立即修复）

| 序号 | 模块 | 问题 | 影响 |
|------|------|------|------|
| 1 | useAuthStore | 缺少完整的认证权限系统 | **所有业务模块无法正确进行权限检查** |
| 2 | useOrganizationStore | 缺少角色权限管理 | 用户角色分配、权限配置功能失效 |
| 3 | UserManagement | 用户 CRUD、角色分配功能不完整 | 用户管理功能缺失 |
| 4 | RoleManagement | 角色 CRUD、权限分配功能不完整 | 角色管理功能缺失 |
| 5 | AuthorityConfiguration | 权限配置功能不完整 | 系统安全机制不完整 |

### P1 - 重要系统（尽快修复）

| 序号 | 模块 | 问题 | 影响 |
|------|------|------|------|
| 6 | useDictionaryStore | 字典管理 Store 缺失 | 字典数据无法统一管理 |
| 7 | OrganizationManagement | 组织管理功能不完整 | 组织结构无法正确配置 |
| 8 | UserAuthorityConfig | 用户权限分配功能缺失 | 无法为用户分配角色和权限 |
| 9 | BaseManagement | 页面完全缺失 | 基础管理功能缺失 |
| 10 | GreenhouseManagement | 大棚管理页面缺失 | 大棚配置功能缺失 |

### P2 - 一般系统（后续修复）

| 序号 | 模块 | 问题 | 影响 |
|------|------|------|------|
| 11 | PositionManagement | 岗位管理页面缺失 | 岗位配置功能缺失 |
| 12 | PersonnelManagement | 人员管理页面缺失 | 人员管理功能缺失 |
| 13 | UserPermission | 用户权限页面缺失 | 用户权限查看功能缺失 |
| 14 | DataMigration | 数据迁移页面缺失 | 数据迁移功能缺失 |

---

## 四、AI 执行审核核对清单

### 4.1 核心原则（强制执行）

1. **每次修复前**：必须先读取 V1.1 对应文件的完整代码
2. **对比要点**：逐个对比 V1.1 和 V2.0 的 Store/Service/页面组件
3. **功能验证**：修复后必须验证 V1.1 中的每个功能点都已实现
4. **不允许自创**：禁止凭想象构造功能，必须严格按 V1.1 原样迁移

### 4.2 修复 P0 模块审核清单

#### 4.2.1 修复 useAuthStore

**Step 1: 读取 V1.1 源文件**
```
D:\TMcrop\yuanxingtu\V1.1\src\stores\useAuthStore.ts
```
完整阅读，列出所有类型定义和函数

**Step 2: 检查 V2.0 缺失项**
- [ ] CurrentUser 类型（oid, username, realName, orgOid, email, phone, status）
- [ ] RoleSummary 类型（oid, code, name, isSystem）
- [ ] AuthorityEntry 类型（processOid, actionOid, value）
- [ ] UserAuthorityEntry 类型（userOid, processOid, actionOid, value）
- [ ] MyPermissionsResponse 类型
- [ ] roles[] 状态
- [ ] authorities[] 状态
- [ ] userAuthorities[] 状态
- [ ] dataOrgOids[] 状态
- [ ] login() 方法完整实现
- [ ] logout() 方法完整实现
- [ ] loadPermissions() 方法完整实现
- [ ] verifyToken() 方法完整实现
- [ ] hasPermission(processRoute, actionCode) 方法
- [ ] canAccessProcess(processRoute) 方法
- [ ] getAccessibleMenuRoutes(allRoutes[]) 方法

**Step 3: 补充缺失代码**
按 V1.1 原样补充缺失的类型定义和函数实现

**Step 4: 验证完整性**
在 V2.0 中执行以下检查：
1. 检查 useAuthStore 是否导出完整的类型
2. 检查权限检查是否正常工作
3. 检查登录流程是否完整

#### 4.2.2 修复 useOrganizationStore（角色权限管理）

**Step 1: 读取 V1.1 源文件**
```
D:\TMcrop\yuanxingtu\V1.1\src\stores\useOrganizationStore.ts
```

**Step 2: 检查 V2.0 缺失项**
- [ ] getUserRoles(userOid) 方法
- [ ] assignUserRoles(userOid, roleOids) 方法
- [ ] processes[] 状态
- [ ] loadProcesses() 方法
- [ ] saveProcess() 方法
- [ ] deleteProcess() 方法
- [ ] actions[] 状态
- [ ] loadActions() 方法
- [ ] roleAuthorities[] 状态
- [ ] loadRoleAuthority() 方法
- [ ] saveRoleAuthority() 方法
- [ ] roleDataAuthorities[] 状态
- [ ] loadRoleDataAuthority() 方法
- [ ] saveRoleDataAuthority() 方法

**Step 3: 补充缺失代码**

#### 4.2.3 修复 UserManagement.vue

**Step 1: 读取 V1.1 源文件**
```
D:\TMcrop\yuanxingtu\V1.1\src\pages\authority\UserManagement.tsx
```

**Step 2: 功能核对清单**
- [ ] 用户列表搜索功能
- [ ] 用户状态筛选（全部/启用/禁用）
- [ ] 分页功能
- [ ] 新增用户弹窗
- [ ] 编辑用户功能
- [ ] 删除用户功能
- [ ] 角色分配功能
- [ ] 启用/禁用用户功能
- [ ] 修改密码功能
- [ ] 弹窗拖拽功能
- [ ] 组织关联部门信息显示
- [ ] 调用 useOrganizationStore（而非仅用 useUserStore）

#### 4.2.4 修复 RoleManagement.vue

**Step 1: 读取 V1.1 源文件**
```
D:\TMcrop\yuanxingtu\V1.1\src\pages\authority\RoleManagement.tsx
```

**Step 2: 功能核对清单**
- [ ] 角色列表搜索功能
- [ ] 角色列表分页
- [ ] 新增角色弹窗
- [ ] 编辑角色功能
- [ ] 删除角色功能
- [ ] 角色权限分配功能
- [ ] 角色数据权限配置
- [ ] 弹窗拖拽功能

#### 4.2.5 修复 AuthorityConfiguration.vue

**Step 1: 读取 V1.1 源文件**
```
D:\TMcrop\yuanxingtu\V1.1\src\pages\authority\AuthorityConfiguration.tsx
```

**Step 2: 功能核对清单**
- [ ] 工序/菜单列表显示
- [ ] 动作权限配置
- [ ] 角色权限保存
- [ ] 数据权限配置

---

## 五、修复执行流程

### 5.1 AI 子代理执行步骤

```
1. 创建修复任务
   └─ 为每个 P0/P1 模块创建独立任务

2. 逐文件审核
   ├─ 读取 V1.1 源文件
   ├─ 读取 V2.0 目标文件
   ├─ 对比差异
   └─ 记录缺失项

3. 逐文件修复
   ├─ 按 V1.1 原样补充缺失代码
   ├─ 不改变已有的正确代码
   └─ 不自创任何功能

4. 功能验证
   ├─ 检查所有类型定义完整
   ├─ 检查所有方法存在且签名正确
   └─ 检查页面调用正确
```

### 5.2 禁止事项

- ❌ 禁止跳过 V1.1 文件直接修改 V2.0
- ❌ 禁止简化或省略 V1.1 中的任何功能
- ❌ 禁止自行构造 V1.1 中没有的功能
- ❌ 禁止删除 V2.0 中已有的正确代码
- ❌ 禁止改变 V1.1 的业务逻辑

### 5.3 异常处理

如果在审核过程中发现：
- V2.0 有更完整的实现：保留 V2.0 版本，但需验证是否包含 V1.1 所有功能
- V1.1 有 bug：记录并修复，但保持与 V1.1 一致的行为
- 功能冲突：暂停并报告，等待人工确认

---

## 六、分批次修复计划

### 第一批（P0 核心 - 预计 5 天）

| 序号 | 任务 | V1.1 源文件 | V2.0 目标文件 |
|------|------|------------|--------------|
| 1 | 修复 useAuthStore | useAuthStore.ts | user.js + 新建 auth.js |
| 2 | 修复角色权限管理 | useOrganizationStore.ts | authority.js |
| 3 | 修复 UserManagement | UserManagement.tsx | UserManagement.vue |
| 4 | 修复 RoleManagement | RoleManagement.tsx | RoleManagement.vue |
| 5 | 修复 AuthorityConfiguration | AuthorityConfiguration.tsx | AuthorityConfiguration.vue |

### 第二批（P1 重要 - 预计 3 天）

| 序号 | 任务 | V1.1 源文件 | V2.0 目标文件 |
|------|------|------------|--------------|
| 6 | 修复/创建 useDictionaryStore | useDictionaryStore.ts | 新建 dictionary.js |
| 7 | 修复 OrganizationManagement | OrganizationManagement.tsx | OrganizationManagement.vue |
| 8 | 修复 UserAuthorityConfig | UserAuthorityConfig.tsx | UserAuthorityConfig.vue |
| 9 | 创建 BaseManagement | BaseManagement.tsx | 新建 BaseManagement.vue |
| 10 | 创建 GreenhouseManagement | GreenhouseManagement.tsx | 新建 GreenhouseManagement.vue |

### 第三批（P2 一般 - 预计 2 天）

| 序号 | 任务 | V1.1 源文件 | V2.0 目标文件 |
|------|------|------------|--------------|
| 11 | 创建 PositionManagement | PositionManagement.tsx | 新建 PositionManagement.vue |
| 12 | 创建 PersonnelManagement | PersonnelManagement.tsx | 新建 PersonnelManagement.vue |
| 13 | 创建 UserPermission | UserPermission.tsx | 新建 UserPermission.vue |
| 14 | 创建 DataMigration | DataMigration.tsx | 新建 DataMigration.vue |

---

## 七、验收标准

### 7.1 P0 模块验收

每个 P0 模块修复完成后，必须通过以下验证：

1. **类型完整性**：所有 V1.1 中定义的类型在 V2.0 中都存在
2. **方法完整性**：所有 V1.1 中的方法在 V2.0 中都有实现
3. **功能一致性**：V2.0 实现的功能与 V1.1 完全一致
4. **无功能丢失**：V1.1 中的任何功能都不会在 V2.0 中丢失

### 7.2 整体验收

所有批次修复完成后，执行整体验证：

1. 登录系统，进入系统设置模块
2. 逐个模块验证功能完整性
3. 检查权限控制是否正确生效
4. 检查与其他业务模块的关联是否正常

---

## 八、附件：完整文件映射表

### 8.1 Store 文件映射

| V1.1 路径 | V2.0 路径 | 修复状态 |
|-----------|----------|---------|
| stores/useAuthStore.ts | stores/modules/auth.js (需新建) | ❌ 待修复 |
| stores/useOrganizationStore.ts | stores/modules/authority.js | ❌ 待修复 |
| stores/useDepartmentStore.ts | stores/modules/department.js | ✅ 已存在 |
| stores/useDictionaryStore.ts | stores/modules/dictionary.js (需新建) | ❌ 待修复 |
| stores/useSystemConfigStore.ts | stores/modules/systemConfig.js | ✅ 已存在 |
| stores/useSettingsStore.ts | - | ❌ 待修复 |
| stores/useAlarmConfigStore.ts | stores/modules/alarmConfig.js | ✅ 已存在 |
| stores/useAreaSystemStore.ts | stores/modules/areaSystem.js | ✅ 已存在 |
| stores/useDeviceSystemStore.ts | stores/modules/deviceSystem.js | ✅ 已存在 |
| stores/useEnergyConfigStore.ts | stores/modules/energyConfig.js | ✅ 已存在 |
| stores/useNotificationSettingsStore.ts | stores/modules/notificationSettings.js | ✅ 已存在 |
| stores/usePositionStore.ts | stores/modules/position.js (需新建) | ❌ 待修复 |

### 8.2 API/Service 文件映射

| V1.1 路径 | V2.0 路径 | 修复状态 |
|-----------|----------|---------|
| services/authorityService.ts | api/system/authority.js | ⚠️ 需补充 |
| services/departmentService.ts | api/department.js | ✅ 已存在 |
| services/dictionaryService.ts | api/dictionary.js (需新建) | ❌ 待修复 |

### 8.3 页面文件映射

见 1.2 节页面对比表

---

**报告生成时间**：2026-05-25
**审核执行人**：Claude AI
**状态**：待执行修复
