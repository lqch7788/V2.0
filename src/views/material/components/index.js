/**
 * 物料模块业务组件统一导出
 * 修复 P0-CMP: 之前未提供 index.js，导致父页面无法批量 import
 */
// 申请领料相关（MaterialReceiving.vue 使用）
export { default as ApplicationDetailModal } from './ApplicationDetailModal.vue'
export { default as ExecuteDetailModal } from './ExecuteDetailModal.vue'
// 退料相关（MaterialReturn.vue 使用）
export { default as ReturnDetailModal } from './ReturnDetailModal.vue'
export { default as ReturnAddModal } from './ReturnAddModal.vue'
export { default as ReturnEditModal } from './ReturnEditModal.vue'
export { default as ReturnVoidModal } from './ReturnVoidModal.vue'
export { default as ReturnMaterialSelectModal } from './ReturnMaterialSelectModal.vue'
export { default as ReturnBatchEditModal } from './ReturnBatchEditModal.vue'
