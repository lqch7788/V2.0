/**
 * 全局对话框服务 — 使用 Element Plus MessageBox（替代原生 alert/confirm）
 */
import { ElMessageBox, ElMessage } from 'element-plus'

/**
 * 显示确认对话框
 * @param {string} message - 提示信息
 * @returns {Promise<boolean>} - 用户点击确定返回 true，取消或关闭返回 false
 */
export function showConfirm(message) {
  return ElMessageBox.confirm(message, '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => true)
    .catch(() => false)
}

/**
 * 显示提示对话框
 * @param {string} message - 提示信息
 * @returns {Promise<void>}
 */
export function showAlert(message) {
  return ElMessageBox.alert(message, '提示', {
    confirmButtonText: '确定',
    type: 'info',
  }).catch(() => {
    // 用户点击关闭
  })
}

/**
 * 显示成功消息（顶部提示）
 * @param {string} message - 成功信息
 * @returns {void}
 */
export function showSuccess(message) {
  ElMessage.success(message)
}

/**
 * 显示错误消息（顶部提示）
 * @param {string} message - 错误信息
 * @returns {void}
 */
export function showError(message) {
  ElMessage.error(message)
}
