/**
 * 全局对话框服务 — 使用 Element Plus MessageBox（替代原生 alert/confirm）
 */
import { ElMessageBox, ElMessage } from 'element-plus'

export function showConfirm(message: string): Promise<boolean> {
  return ElMessageBox.confirm(message, '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => true)
    .catch(() => false)
}

export function showAlert(message: string): Promise<void> {
  return ElMessageBox.alert(message, '提示', {
    confirmButtonText: '确定',
    type: 'info',
  }).catch(() => {
    // 用户点击关闭
  })
}

export function showSuccess(message: string): void {
  ElMessage.success(message)
}

export function showError(message: string): void {
  ElMessage.error(message)
}
