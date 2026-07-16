/**
 * 全局指令注册
 * 引入 v-dialog-draggable / v-dialog-resizable / v-dialog-maximizable 后在 main.js 统一注册
 */
import { vDialogDraggable } from './vDialogDraggable'
import { vDialogResizable } from './vDialogResizable'
import { vDialogMaximizable } from './vDialogMaximizable'

export function registerDirectives(app) {
  app.directive('dialog-draggable', vDialogDraggable)
  app.directive('dialog-resizable', vDialogResizable)
  app.directive('dialog-maximizable', vDialogMaximizable)
}

export { vDialogDraggable, vDialogResizable, vDialogMaximizable }