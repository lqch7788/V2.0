/**
 * 2026-07-22 1:1 迁移自 V1.1 recordModalValidators.ts
 * RecordModal 校验器（仅有性繁殖）
 * 无性繁殖（组培/扦插/嫁接/压条/分株）已迁移至育苗模块
 */

/** 扩展 form 状态（v5 缩简：仅含有性字段） */
export const BreedingFormState = {
  recordDate: '',
  operationType: 'cross',
  generation: null,
  parentMaleCode: null,
  parentFemaleCode: null,
  parentMaleSource: null,
  parentFemaleSource: null,
  operator: null,
  remarks: null,
  targetTraits: null,
  fruitCount: null,
  seedCount: null,
  pollinatedFlowerCount: null,
  /** @deprecated v5：保留字段兼容历史数据，UI 不再使用 */
  motherPlantCode: null,
  propagationMethod: null,
  inoculationCount: null,
  survivalCount: null,
  reproductionMode: 'sexual'
}

/**
 * 育种表单前端校验（仅有性繁殖）
 * @returns null = 通过；string = 错误信息
 */
export function validateBreedingForm(form) {
  if (!form.recordDate) return '请选择记录日期'
  if (form.parentMaleCode && form.parentFemaleCode && form.parentMaleCode === form.parentFemaleCode) {
    return '父本编码不能与母本编码相同'
  }
  return null
}
