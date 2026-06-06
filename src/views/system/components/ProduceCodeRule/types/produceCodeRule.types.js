/**
 * 作物编码规则页面类型定义
 * 镜像 V1.1 src/pages/components/ProduceCodeRule/types/produceCodeRule.types.ts
 * 对应 V1.1 ProduceCategory / ProduceType / ProduceSubType
 */

/** 编辑单元格类型 */
export const EDIT_CELL_TYPE = {
  CATEGORY: 'category',
  TYPE: 'type',
  SUB: 'sub',
}

/** 编辑状态 */
export function createEditingCell(type, categoryCode, typeCode, subCode) {
  return { type, categoryCode, typeCode, subCode }
}

/** 添加类型弹窗状态 */
export function createAddTypeState(categoryCode) {
  return { categoryCode }
}

/** 添加品种弹窗状态 */
export function createAddSubState(categoryCode, typeCode) {
  return { categoryCode, typeCode }
}

/** 添加子品种1弹窗状态 */
export function createAddSubVariety1State(categoryCode, typeCode, subCode) {
  return { categoryCode, typeCode, subCode }
}

/** 深拷贝函数 */
export function deepCloneCategories(obj) {
  return JSON.parse(JSON.stringify(obj))
}
