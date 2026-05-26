/**
 * 集中式表单验证工具库
 * 与V1.1 validators.ts 验证逻辑完全一致
 */

/** 手机号: ^1[3|4|5|7|8][0-9]{9}$ */
export function validateMobilePhone(value) {
  if (!value) return true
  return /^1[3|4|5|7|8][0-9]{9}$/.test(value)
}

/** 工作电话: (\d{3,4}-)\d{7,8} */
export function validateWorkPhone(value) {
  if (!value) return true
  return /^(\d{3,4}-)\d{7,8}$/.test(value) || /^\(\d{3,4}\)\d{7,8}$/.test(value)
}

/** 传真: 工作电话格式 或 手机号格式 */
export function validateFax(value) {
  if (!value) return true
  return validateWorkPhone(value) || validateMobilePhone(value)
}

/** 银行卡号: 15位或17-18位，首位非0 */
export function validateBankCard(value) {
  if (!value) return true
  return /^([1-9])(\d{14}|\d{17,18})$/.test(value)
}

/** 标识码: 字母/数字/下划线/连字符 */
export function validateCode(value) {
  if (!value) return true
  return /^[\w-]+$/.test(value)
}

/** 重量/数量: 最多7位整数+1位小数，≤1000000 */
export function validateWeight(value) {
  if (value <= 0) return false
  if (value > 1000000) return false
  return /^\d{1,7}\.?\d{0,1}$/.test(String(value))
}

/** 单价: 最多7位整数+2位小数，≤1000000 */
export function validateUnitPrice(value) {
  if (value < 0) return false
  if (value > 1000000) return false
  return /^\d{1,7}\.?\d{0,2}$/.test(String(value))
}

/** 日期不能超过今天 */
export function validateDateNotFuture(dateStr) {
  if (!dateStr) return true
  const d = new Date(dateStr)
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return d <= today
}

/** 运行一组验证规则，返回所有错误 */
export function runValidations(rules) {
  return rules.filter((r) => !r.valid).map((r) => ({ field: r.field, message: r.message }))
}
