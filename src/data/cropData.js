/**
 * 2026-07-22 1:1 迁移自 V1.1 data/cropData.ts
 * 作物管理模块常量（仅保留 Vue 组件依赖的 OPERATORS）
 *
 * 注：V1.1 包含大量 Mock 数据，但 V2.0 已不需要（V2.1 铁律无缓存降级）
 */

/** 操作人员选项（新增） */
export const OPERATORS = [
  { value: '李明辉', label: '李明辉' },
  { value: '王建国', label: '王建国' },
  { value: '张伟', label: '张伟' },
  { value: '刘洋', label: '刘洋' },
  { value: '陈静', label: '陈静' }
]
