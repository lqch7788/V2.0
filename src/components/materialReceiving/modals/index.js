/**
 * 物料领用Modals组件统一导出
 * 修复 P0-MD: 之前只导出 AddModal/DetailModal，导致 MaterialExecute.vue 等页面 import Execute* Modal 报 SyntaxError
 */
export { default as DetailModal } from './DetailModal.vue'
export { default as AddModal } from './AddModal.vue'
export { default as EditModal } from './EditModal.vue'
export { default as EditWarningModal } from './EditWarningModal.vue'
export { default as DeleteConfirm } from './DeleteConfirm.vue'
export { default as DeleteWarningModal } from './DeleteWarningModal.vue'
export { default as BatchEditModal } from './BatchEditModal.vue'
export { default as BatchDeleteConfirmModal } from './BatchDeleteConfirmModal.vue'
export { default as VoidModal } from './VoidModal.vue'
export { default as ExportTypeModal } from './ExportTypeModal.vue'
export { default as StatDetailModal } from './StatDetailModal.vue'
// 出库相关
export { default as ExecuteAddModal } from './ExecuteAddModal.vue'
export { default as ExecuteEditModal } from './ExecuteEditModal.vue'
export { default as ExecuteEditWarningModal } from './ExecuteEditWarningModal.vue'
export { default as ExecuteDeleteWarningModal } from './ExecuteDeleteWarningModal.vue'
export { default as ExecuteBatchEditModal } from './ExecuteBatchEditModal.vue'
export { default as ExecuteBatchDeleteConfirmModal } from './ExecuteBatchDeleteConfirmModal.vue'
export { default as ExecuteDetailModal } from './ExecuteDetailModal.vue'
