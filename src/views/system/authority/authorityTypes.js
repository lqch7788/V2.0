/**
 * 权限模块 TypeScript 类型定义
 * 1:1 对齐 V1.1 src/services/authorityService.ts 中的类型
 * 提供给 .vue 文件做 JSDoc 引用
 */

/**
 * 组织接口
 * @typedef {Object} Organization
 * @property {string} oid - 组织 OID
 * @property {string} [oidParent] - 父组织 OID
 * @property {string} aid - 组织编码
 * @property {string} name - 组织名称
 * @property {string} [description] - 描述
 * @property {string} [orgType] - 组织类型 (company/base/region/department/workshop)
 * @property {string} [departmentId] - 关联部门ID
 * @property {string} [departmentName] - 关联部门名称
 * @property {number} [sortNumber] - 排序号
 * @property {Array<Organization>} [children] - 子组织
 */

/**
 * 角色接口
 * @typedef {Object} Role
 * @property {string} oid - 角色 OID
 * @property {string} aid - 角色编码
 * @property {string} [role_name] - 角色名称(V1.1 字段)
 * @property {string} [name] - 角色名称(兼容)
 * @property {string} [orgOid] - 所属组织OID
 * @property {string} [description] - 描述
 * @property {number} [sortNumber] - 排序号
 * @property {string} [status] - 状态 active/inactive
 * @property {number} [isSystem] - 是否系统角色
 */

/**
 * 用户接口
 * @typedef {Object} AuthorityUser
 * @property {string} oid - 用户 OID
 * @property {string} [username] - 用户名(V1.1 字段)
 * @property {string} [aid] - 用户名(兼容)
 * @property {string} [real_name] - 真实姓名(V1.1 字段)
 * @property {string} [name] - 真实姓名(兼容)
 * @property {string} [org_oid] - 所属组织OID(V1.1 字段)
 * @property {string} [orgOid] - 所属组织OID(兼容)
 * @property {string} [department_oid] - 部门OID(V1.1 字段)
 * @property {string} [departmentOid] - 部门OID(兼容)
 * @property {string} [email] - 邮箱
 * @property {string} [phone] - 电话
 * @property {string} [status] - 状态 active/inactive
 * @property {string} [passwordHash] - 密码哈希
 */

export {}
