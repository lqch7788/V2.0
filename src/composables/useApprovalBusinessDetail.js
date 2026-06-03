// ============================================================
// 审批业务详情联动 Composable
// 文件路径：src/composables/useApprovalBusinessDetail.js
// 功能：根据 approval.businessLink.type 自动调用对应业务Store加载实际数据
// 架构：审批详情弹窗 → useApprovalBusinessDetail(approval) → 业务Store → 业务数据
// 对应 V1.1 src/hooks/useApprovalBusinessDetail.ts 1:1 翻译
// ============================================================

import { ref, watch } from 'vue'

// ============================================================
// 业务详情返回类型
// ============================================================

/**
 * @typedef {Object} BusinessDetailData
 * @property {unknown} data - 业务数据（各Store返回的原始对象）
 * @property {string} typeName - 业务类型名称
 * @property {boolean} isLoading - 加载状态
 * @property {string|null} error - 错误信息
 */

// ============================================================
// 审批类型 → 业务Store 映射表
// ============================================================

/**
 * 业务Store加载器函数类型
 * @typedef {(requestId: string) => Promise<unknown>} StoreLoader
 */

/**
 * businessLink.type → { 类型名称, 加载函数 }
 * 1:1 翻译 V1.1 useApprovalBusinessDetail.ts L34-386
 * 注意：V2.0 路径与 V1.1 不同（stores/modules），未配置的审批类型静默跳过
 */
const BUSINESS_STORE_MAP = {
  // ========== 物料相关 ==========
  material_request: {
    typeName: '领料申请',
    loader: async (requestId) => {
      const mod = await import('@/stores/modules/inventory').catch(() => null)
      // 优先用 materialRequest 子模块
      try {
        const { useMaterialRequestDataStore } = await import('@/services/apiMaterialRequestService').catch(() => ({}))
        if (useMaterialRequestDataStore) {
          const state = useMaterialRequestDataStore.getState?.() || useMaterialRequestDataStore()
          if (state.items?.length === 0) await state.loadItems?.()
          return (state.items || []).find((i) => i.id === requestId || i.requestId === requestId)
        }
      } catch { /* fallback */ }
      return mod ? null : null
    },
  },
  return_material: {
    typeName: '退料单',
    loader: async (requestId) => {
      try {
        const { useMaterialReturnStore } = await import('@/services/apiMaterialReturnService').catch(() => ({}))
        if (useMaterialReturnStore) {
          const state = useMaterialReturnStore.getState?.() || useMaterialReturnStore()
          return (state.items || []).find((i) => i.id === requestId)
        }
      } catch { /* fallback */ }
      return null
    },
  },
  material_inbound: {
    typeName: '入库记录',
    loader: async () => null,
  },
  material_transfer: {
    typeName: '库存调拨',
    loader: async () => null,
  },

  // ========== 生产相关 ==========
  purchase: {
    typeName: '采购计划',
    loader: async (requestId) => {
      try {
        const { usePurchasePlanStore } = await import('@/stores/modules/purchasePlan')
        const store = usePurchasePlanStore()
        if (store.plans?.length === 0) await store.fetchPlans?.()
        return (store.plans || []).find((p) => p.id === requestId)
      } catch { return null }
    },
  },
  production_plan: {
    typeName: '生产计划',
    loader: async (requestId) => {
      try {
        const { useProductionPlanStore } = await import('@/stores/modules/productionPlan')
        const store = useProductionPlanStore()
        if (store.plans?.length === 0) await store.fetchPlans?.()
        return (store.plans || []).find((p) => p.id === requestId)
      } catch { return null }
    },
  },
  production: {
    typeName: '生产计划',
    loader: async (requestId) => {
      try {
        const { useProductionPlanStore } = await import('@/stores/modules/productionPlan')
        const store = useProductionPlanStore()
        if (store.plans?.length === 0) await store.fetchPlans?.()
        return (store.plans || []).find((p) => p.id === requestId)
      } catch { return null }
    },
  },
  production_batch: {
    typeName: '生产批次',
    loader: async (requestId) => {
      try {
        const { useProductionPlanStore } = await import('@/stores/modules/productionPlan')
        const store = useProductionPlanStore()
        return (store.plans || []).find((p) => p.id === requestId)
      } catch { return null }
    },
  },
  tech_solution: {
    typeName: '技术方案',
    loader: async (requestId) => {
      try {
        const { useTechSolutionStore } = await import('@/stores/modules/techSolution')
        const store = useTechSolutionStore()
        if (store.items?.length === 0) await store.loadItems?.()
        return (store.items || []).find((i) => i.id === requestId)
      } catch { return null }
    },
  },

  // ========== 农事相关 ==========
  task_dispatch: {
    typeName: '农事任务',
    loader: async (requestId) => {
      try {
        const { useFarmTaskStore } = await import('@/stores/modules/farmTask')
        const store = useFarmTaskStore()
        if (store.tasks?.length === 0) await store.fetchTasks?.()
        return (store.tasks || []).find((t) => t.id === requestId)
      } catch { return null }
    },
  },
  task_change: {
    typeName: '任务变更',
    loader: async (requestId) => {
      try {
        const { useFarmTaskStore } = await import('@/stores/modules/farmTask')
        const store = useFarmTaskStore()
        return (store.tasks || []).find((t) => t.id === requestId)
      } catch { return null }
    },
  },
  inspection: {
    typeName: '巡查记录',
    loader: async (requestId) => {
      try {
        const { useInspectionDataStore } = await import('@/stores/modules/inspectionData')
        const store = useInspectionDataStore()
        if (store.items?.length === 0) await store.loadItems?.()
        return (store.items || []).find((i) => i.id === requestId)
      } catch { return null }
    },
  },
  inspection_issue: {
    typeName: '巡查问题',
    loader: async (requestId) => {
      try {
        const { useInspectionDataStore } = await import('@/stores/modules/inspectionData')
        const store = useInspectionDataStore()
        return (store.items || []).find((i) => i.id === requestId)
      } catch { return null }
    },
  },
  resolve: {
    typeName: '问题整改',
    loader: async (requestId) => {
      try {
        const { useProblemStore } = await import('@/stores/modules/problem')
        const store = useProblemStore()
        if (store.problems?.length === 0) await store.loadItems?.()
        return (store.problems || []).find((p) => p.id === requestId)
      } catch { return null }
    },
  },
  issue_resolve: {
    typeName: '问题整改',
    loader: async (requestId) => {
      try {
        const { useProblemStore } = await import('@/stores/modules/problem')
        const store = useProblemStore()
        return (store.problems || []).find((p) => p.id === requestId)
      } catch { return null }
    },
  },

  // ========== 采收相关 ==========
  harvest: {
    typeName: '采收记录',
    loader: async (requestId) => {
      try {
        const { useHarvestStore } = await import('@/stores/modules/harvest')
        const store = useHarvestStore()
        if (store.items?.length === 0) await store.loadItems?.()
        return (store.items || []).find((i) => i.id === requestId)
      } catch { return null }
    },
  },

  // ========== HR相关 ==========
  leave: {
    typeName: '请假申请',
    loader: async (requestId) => {
      try {
        const { useLeaveStore } = await import('@/services/apiLeaveService').catch(() => ({}))
        if (useLeaveStore) {
          const state = useLeaveStore.getState?.() || useLeaveStore()
          return (state.leaves || []).find((l) => l.id === requestId)
        }
      } catch { /* fallback */ }
      return null
    },
  },
  overtime: {
    typeName: '加班申请',
    loader: async (requestId) => {
      try {
        const { useOvertimeStore } = await import('@/services/apiOvertimeService').catch(() => ({}))
        if (useOvertimeStore) {
          const state = useOvertimeStore.getState?.() || useOvertimeStore()
          return (state.overtimes || []).find((o) => o.id === requestId)
        }
      } catch { /* fallback */ }
      return null
    },
  },
  resignation: {
    typeName: '离职申请',
    loader: async (requestId) => {
      try {
        const { useResignationStore } = await import('@/services/apiResignationService').catch(() => ({}))
        if (useResignationStore) {
          const state = useResignationStore.getState?.() || useResignationStore()
          return (state.resignations || []).find((r) => r.id === requestId)
        }
      } catch { /* fallback */ }
      return null
    },
  },
  resign: {
    typeName: '离职申请',
    loader: async () => null,
  },
  recruitment: {
    typeName: '招聘需求',
    loader: async (requestId) => {
      try {
        const { useRecruitmentStore } = await import('@/services/apiRecruitmentService').catch(() => ({}))
        if (useRecruitmentStore) {
          const state = useRecruitmentStore.getState?.() || useRecruitmentStore()
          return (state.recruitments || []).find((r) => r.id === requestId)
        }
      } catch { /* fallback */ }
      return null
    },
  },
  onboarding: {
    typeName: '入职办理',
    loader: async (requestId) => {
      try {
        const { useOnboardingStore } = await import('@/services/apiOnboardingService').catch(() => ({}))
        if (useOnboardingStore) {
          const state = useOnboardingStore.getState?.() || useOnboardingStore()
          return (state.onboardings || []).find((o) => o.id === requestId)
        }
      } catch { /* fallback */ }
      return null
    },
  },
  attendance_repair: {
    typeName: '考勤补录',
    loader: async () => null,
  },
  salary_adjustment: {
    typeName: '调薪申请',
    loader: async () => null,
  },
  contract_renewal: {
    typeName: '合同续签',
    loader: async () => null,
  },
  salary_budget: {
    typeName: '工资预算',
    loader: async () => null,
  },
  transfer: {
    typeName: '转岗申请',
    loader: async () => null,
  },

  // ========== 指标/预算相关 ==========
  indicator: {
    typeName: '指标数据',
    loader: async (requestId) => {
      try {
        const { useIndicatorStore } = await import('@/stores/modules/indicators')
        const store = useIndicatorStore()
        if (store.indicators?.length === 0) await store.loadItems?.()
        return (store.indicators || []).find((i) => i.id === requestId)
      } catch { return null }
    },
  },
  budget_create: {
    typeName: '预算编制',
    loader: async () => null,
  },
  budget_adjust: {
    typeName: '预算调整',
    loader: async () => null,
  },

  // ========== 作物补录相关 ==========
  seed_source: {
    typeName: '种源补录',
    loader: async (requestId) => {
      try {
        const { useSeedSourceStore } = await import('@/stores/modules/seedSource')
        const store = useSeedSourceStore()
        if (store.items?.length === 0) await store.loadItems?.()
        return (store.items || []).find((s) => s.id === requestId)
      } catch { return null }
    },
  },
  seed_source_inbound: {
    typeName: '种源入库',
    loader: async (requestId) => {
      try {
        const { useSeedSourceStore } = await import('@/stores/modules/seedSource')
        const store = useSeedSourceStore()
        return (store.items || []).find((s) => s.id === requestId)
      } catch { return null }
    },
  },
  seedling: {
    typeName: '育苗补录',
    loader: async (requestId) => {
      try {
        const { useSeedlingStore } = await import('@/stores/modules/seedling')
        const store = useSeedlingStore()
        if (store.items?.length === 0) await store.loadItems?.()
        return (store.items || []).find((s) => s.id === requestId)
      } catch { return null }
    },
  },
  seedling_plan: {
    typeName: '育苗计划',
    loader: async (requestId) => {
      try {
        const { useSeedlingStore } = await import('@/stores/modules/seedling')
        const store = useSeedlingStore()
        return (store.items || []).find((s) => s.id === requestId)
      } catch { return null }
    },
  },
  planting_plan: {
    typeName: '种植计划',
    loader: async (requestId) => {
      try {
        const { usePlantingStore } = await import('@/stores/modules/planting')
        const store = usePlantingStore()
        if (store.items?.length === 0) await store.loadItems?.()
        return (store.items || []).find((p) => p.id === requestId)
      } catch { return null }
    },
  },
  crop_storage: {
    typeName: '作物入库补录',
    loader: async () => null,
  },

  // ========== 订单相关 ==========
  order_create: {
    typeName: '订单创建',
    loader: async (requestId) => {
      try {
        const { useOrderStore } = await import('@/stores/modules/order')
        const store = useOrderStore()
        return (store.orders || []).find((o) => o.id === requestId)
      } catch { return null }
    },
  },
  order: {
    typeName: '订单',
    loader: async (requestId) => {
      try {
        const { useOrderStore } = await import('@/stores/modules/order')
        const store = useOrderStore()
        return (store.orders || []).find((o) => o.id === requestId)
      } catch { return null }
    },
  },

  // ========== 公告 ==========
  announcement: {
    typeName: '公告',
    loader: async (requestId) => {
      try {
        const { useAnnouncementStore } = await import('@/stores/modules/announcement')
        const store = useAnnouncementStore()
        if (store.announcements?.length === 0) await store.loadItems?.()
        return (store.announcements || []).find((a) => a.id === requestId)
      } catch { return null }
    },
  },
}

// ============================================================
// 主 Composable
// ============================================================

/**
 * 加载审批关联的业务数据
 * 1:1 翻译 V1.1 useApprovalBusinessDetail.ts L392-445
 *
 * 【重要 - cycle 3 修复 2026-06-03】响应式签名变更：
 * 入参从直接传 ref.value 改为传 getter 函数，避免初始化时快照到 null 后 watch 不再 fire。
 * - 原签名：useApprovalBusinessDetail(currentApproval.value)  // ❌ 静态快照
 * - 新签名：useApprovalBusinessDetail(() => currentApproval.value)  // ✅ 响应式
 *
 * getter 在每次依赖追踪时执行，watch 内部用 toValue/getter 调用拿最新值，确保
 * 点击行→打开弹窗→设置 currentApproval.value = row 时 watch 能正确触发。
 *
 * @param {(() => object|null)} approvalGetter - 返回审批对象的 getter 函数
 * @returns {{ data: import('vue').Ref, typeName: import('vue').Ref, isLoading: import('vue').Ref, error: import('vue').Ref }}
 */
export function useApprovalBusinessDetail(approvalGetter) {
  // 兼容：如果误传 ref 或原始对象，自动包成 getter
  const getter = typeof approvalGetter === 'function'
    ? approvalGetter
    : () => approvalGetter

  const businessData = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const typeName = ref('')

  async function loadBusinessData(a) {
    const businessType = a.businessLink?.type
    const requestId = a.businessLink?.requestId

    if (!businessType || !requestId) {
      businessData.value = null
      isLoading.value = false
      return
    }

    const storeConfig = BUSINESS_STORE_MAP[businessType]
    if (!storeConfig) {
      // 未配置的审批类型，静默跳过
      businessData.value = null
      isLoading.value = false
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await storeConfig.loader(requestId)
      businessData.value = data || null
    } catch (err) {
      console.error(`[useApprovalBusinessDetail] 加载业务数据失败 (${businessType}):`, err)
      error.value = (err && err.message) || String(err)
      businessData.value = null
    } finally {
      isLoading.value = false
    }
  }

  // 监听 approval 变化（V1.1 useEffect 1:1 翻译）
  // cycle 3 修复：getter 形式确保响应式追踪
  watch(
    () => getter(),
    (newVal) => {
      if (newVal) {
        loadBusinessData(newVal)
        typeName.value = newVal.businessLink?.type
          ? BUSINESS_STORE_MAP[newVal.businessLink.type]?.typeName || newVal.businessLink.type
          : ''
      } else {
        businessData.value = null
        isLoading.value = false
        error.value = null
        typeName.value = ''
      }
    },
    { immediate: true, deep: true }
  )

  return { data: businessData, typeName, isLoading, error }
}

// ============================================================
// 便捷函数：获取业务详情（非Composable，可在回调中使用）
// 1:1 翻译 V1.1 useApprovalBusinessDetail.ts fetchBusinessDetail L451-470
// ============================================================

/**
 * @param {object} approval
 * @returns {Promise<{ data: unknown, typeName: string, isLoading: false, error: string|null }>}
 */
export async function fetchBusinessDetail(approval) {
  const businessType = approval.businessLink?.type
  const requestId = approval.businessLink?.requestId

  if (!businessType || !requestId) {
    return { data: null, typeName: '', isLoading: false, error: null }
  }

  const storeConfig = BUSINESS_STORE_MAP[businessType]
  if (!storeConfig) {
    return { data: null, typeName: '', isLoading: false, error: null }
  }

  try {
    const data = await storeConfig.loader(requestId)
    return { data: data || null, typeName: storeConfig.typeName, isLoading: false, error: null }
  } catch (err) {
    return { data: null, typeName: storeConfig.typeName, isLoading: false, error: (err && err.message) || String(err) }
  }
}

export default useApprovalBusinessDetail
