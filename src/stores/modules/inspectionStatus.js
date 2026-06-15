/**
 * 巡查状态联动 Pinia Store
 * 从 V1.1 src/stores/useInspectionStore.ts 1:1 翻译
 *
 * 用于审批联动：审批通过后更新巡查问题状态
 *
 * V1.1 状态机（5 态）：
 *   pending → dispatched → processing → resolved → closed
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * @typedef {{
 *   inspectionId: string,
 *   status: 'pending' | 'dispatched' | 'processing' | 'resolved' | 'closed',
 *   updatedAt: string,
 *   updatedBy?: string
 * }} InspectionStatusUpdate
 *
 * @typedef {{
 *   id: string,
 *   code: string,
 *   inspectionDate: string,
 *   location: string,
 *   inspectorId: string,
 *   inspectorName: string,
 *   findings: string,
 *   severity: 'low' | 'medium' | 'high' | 'critical',
 *   status: 'pending' | 'dispatched' | 'processing' | 'resolved' | 'closed',
 *   assignedTo?: string,
 *   assignedToName?: string,
 *   resolvedAt?: string,
 *   remark?: string
 * }} Inspection
 */

export const useInspectionStatusStore = defineStore('inspectionStatus', () => {
  /** @type {import('vue').Ref<Record<string, InspectionStatusUpdate>>} */
  const statusUpdates = ref({})

  /**
   * 更新巡查问题状态
   * V1.1 L40-50 等价
   */
  function updateInspectionStatus(inspectionId, status, updatedBy) {
    const update = {
      inspectionId,
      status,
      updatedAt: new Date().toISOString(),
      updatedBy,
    }
    statusUpdates.value = { ...statusUpdates.value, [inspectionId]: update }
  }

  /**
   * 合并状态到巡查记录
   * V1.1 L52-55 等价
   */
  function getInspectionWithStatus(inspection) {
    const update = statusUpdates.value[inspection.id]
    return update ? { ...inspection, status: update.status } : inspection
  }

  /**
   * 获取全部状态更新
   * V1.1 L57 等价
   */
  function getStatusUpdates() {
    return statusUpdates.value
  }

  /**
   * 清空全部状态更新
   * V1.1 L59 等价
   */
  function clearAllUpdates() {
    statusUpdates.value = {}
  }

  return {
    statusUpdates,
    updateInspectionStatus,
    getInspectionWithStatus,
    getStatusUpdates,
    clearAllUpdates,
  }
})
