/**
 * 全局对话框服务 — 替代原生 alert/confirm
 */

export function showConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    resolve(window.confirm(message))
  })
}

export function showAlert(message: string): Promise<void> {
  return new Promise((resolve) => {
    window.alert(message)
    resolve()
  })
}
