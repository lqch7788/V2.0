/**
 * 采购计划 Composable（兼容层）
 * 1:1 翻译自 V1.1 src/hooks/usePurchasePlanStore.ts
 *
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\hooks\usePurchasePlanStore.ts
 *
 * V1.1 文件名虽然带 "Store" 后缀但实际是一个 React hook 兼容层
 * （不是 Zustand store），它包装了 V1.1 主 store
 * （src/stores/usePurchasePlanStore.ts）。
 *
 * V2.0 主 store 已在 L1 任务 7 翻译为 src/stores/modules/purchasePlan.js（Pinia），
 * 本 composable 是对 Pinia store 的薄封装，保持与 V1.1 hook 完全一致的对外接口。
 *
 * 为避免命名冲突，V2.0 composable 取名 `usePurchasePlan`（V1.1 的 hook 函数叫
 * `usePurchasePlanStore`，与 Pinia store 同名，V2.0 中已占用）。
 *
 * 翻译覆盖：
 * - V1.1 usePurchasePlanStore() hook         → usePurchasePlan() composable
 * - V1.1 updatePurchasePlanStatus() 独立函数  → 同名导出
 * - V1.1 getStatusUpdates() 独立函数          → 同名导出
 * - V1.1 clearAllStatusUpdates() 独立函数     → 同名导出
 * - V1.1 getPurchasePlansWithStatus()         → 同名导出
 * - V1.1 getPurchasePlansWithStatusAsync()    → 同名导出
 * - V1.1 subscribeToStatusChanges()          → 同名导出
 */
import { watch } from 'vue'
import { usePurchasePlanStore as usePurchasePlanPiniaStore } from '@/stores/modules/purchasePlan'

/**
 * 采购计划状态联动更新条目（来自 L1 Pinia store，已 JSDoc 化）
 * @typedef {import('@/stores/modules/purchasePlan').PurchasePlanStatusUpdate} PurchasePlanStatusUpdate
 */

/**
 * 采购计划主体（来自 L1 Pinia store）
 * @typedef {import('@/stores/modules/purchasePlan').PurchasePlan} PurchasePlan
 */

/**
 * 采购计划 Composable（1:1 翻译 V1.1 usePurchasePlanStore hook）
 *
 * V1.1 hook 返回 3 个方法：updatePurchasePlanStatus / getStatusUpdates / clearAllUpdates
 * V2.0 同样返回这 3 个方法（来自 L1 Pinia store）。
 *
 * @returns {{
 *   updatePurchasePlanStatus: (planId: string, status: string, statusText: string) => void,
 *   getStatusUpdates: () => Record<string, PurchasePlanStatusUpdate>,
 *   clearAllUpdates: () => void
 * }}
 */
export function usePurchasePlan() {
  const store = usePurchasePlanPiniaStore()

  return {
    updatePurchasePlanStatus: store.updatePurchasePlanStatus,
    getStatusUpdates: store.getStatusUpdates,
    clearAllUpdates: store.clearAllUpdates
  }
}

/**
 * 向后兼容的独立函数：更新采购计划状态
 * 1:1 翻译自 V1.1 updatePurchasePlanStatus
 * @param {string} planId  采购计划 ID
 * @param {string} status  状态值
 * @param {string} statusText  状态中文文本
 * @returns {void}
 */
export function updatePurchasePlanStatus(planId, status, statusText) {
  const store = usePurchasePlanPiniaStore()
  store.updatePurchasePlanStatus(planId, status, statusText)
}

/**
 * 向后兼容的独立函数：获取所有状态联动更新
 * 1:1 翻译自 V1.1 getStatusUpdates
 * @returns {Record<string, PurchasePlanStatusUpdate>}
 */
export function getStatusUpdates() {
  const store = usePurchasePlanPiniaStore()
  return store.getStatusUpdates()
}

/**
 * 向后兼容的独立函数：清空所有状态联动更新
 * 1:1 翻译自 V1.1 clearAllStatusUpdates
 * V1.1 命名差异：hook 中方法名 `clearAllUpdates`，独立函数名 `clearAllStatusUpdates`。
 * 翻译后保留两个名字以 1:1 对应。
 * @returns {void}
 */
export function clearAllStatusUpdates() {
  const store = usePurchasePlanPiniaStore()
  store.clearAllUpdates()
}

/**
 * 向后兼容的独立函数：获取应用状态更新后的采购计划数据
 * 1:1 翻译自 V1.1 getPurchasePlansWithStatus
 * V1.1 调用 store.getPlansWithStatus()，V2.0 Pinia store 暴露为 computed `getPlansWithStatus`
 * @returns {PurchasePlan[]}
 */
export function getPurchasePlansWithStatus() {
  const store = usePurchasePlanPiniaStore()
  return store.getPlansWithStatus
}

/**
 * 异步获取采购计划数据（向后兼容 - 从 Store 刷新后返回带状态的数据）
 * 1:1 翻译自 V1.1 getPurchasePlansWithStatusAsync
 * V1.1 实现：先 await store.fetchPlans()，再返回 store.getPlansWithStatus()
 * V2.0 同样调用 L1 store 的 fetchPlans + getPlansWithStatus
 * @returns {Promise<PurchasePlan[]>}
 */
export async function getPurchasePlansWithStatusAsync() {
  const store = usePurchasePlanPiniaStore()
  await store.fetchPlans()
  return store.getPlansWithStatus
}

/**
 * 监听状态变化（向后兼容）
 *
 * 1:1 翻译自 V1.1 subscribeToStatusChanges
 * V1.1 实现：通过 Zustand subscribe 在 statusUpdates 变化时触发回调
 * V2.0 实现：通过 Vue watch 监听 statusUpdates computed 变化时触发回调
 *
 * 注意：V1.1 中 Pinia store 的 statusUpdates 暴露为 ref（不是 computed），
 * 因此 watch 的 source 必须是返回 ref 值的函数形式 `() => store.statusUpdates`。
 *
 * @param {() => void} callback  状态更新时的回调
 * @returns {() => void} 取消订阅的函数
 */
export function subscribeToStatusChanges(callback) {
  const store = usePurchasePlanPiniaStore()
  // 立即订阅 statusUpdates ref 变化
  const stopHandle = watch(
    () => store.statusUpdates,
    () => {
      callback()
    },
    { deep: true }
  )
  // 返回取消订阅的句柄（Vue watch 返回的 stop 函数）
  return stopHandle
}
