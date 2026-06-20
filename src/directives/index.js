/**
 * 全局指令注册
 * 引入 v-dialog-draggable / v-dialog-resizable 后在 main.js 统一注册
 */
import { vDialogDraggable } from './vDialogDraggable'
import { vDialogResizable } from './vDialogResizable'

export function registerDirectives(app) {
  app.directive('dialog-draggable', vDialogDraggable)
  app.directive('dialog-resizable', vDialogResizable)
}

export { vDialogDraggable, vDialogResizable }