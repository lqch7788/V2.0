/**
 * 生产报表数据 Composable
 * 1:1 翻译自 V1.1 src/hooks/useProductionReports.ts
 * 用于生产报表(Reports)页面的数据聚合
 * 支持后端 API 和本地 store 回退
 *
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\hooks\useProductionReports.ts
 */
import { ref, computed, onMounted } from 'vue'
import { useProductionPlanStore } from '@/stores/modules/productionPlan'
import { useFarmTaskStore } from '@/stores/modules/farmTask'
import { useSummaryStore } from '@/stores/modules/summary'
import { useCostStore } from '@/stores/modules/cost'
import { usePersistentAttendance } from '@/composables/usePersistentAttendance'

// ============================================
// 类型定义（JSDoc）
// ============================================

/**
 * 产量统计行
 * @typedef {Object} YieldStatRow
 * @property {string} month
 * @property {number} yield
 * @property {string} [region]
 * @property {string} [crop]
 */

/**
 * 成本分析行
 * @typedef {Object} CostAnalysisRow
 * @property {string} name
 * @property {number} value
 * @property {string} period
 * @property {string} [crop]
 */

/**
 * 月度工时行
 * @typedef {Object} MonthlyLaborRow
 * @property {string} month
 * @property {number} hours
 */

/**
 * 作物产量行
 * @typedef {Object} CropYieldRow
 * @property {string} name
 * @property {number} value
 */

/**
 * 报表统计卡片
 * @typedef {Object} ReportStatCard
 * @property {string} label
 * @property {string|number} value
 * @property {string} icon
 * @property {string} iconBgColor
 */

/**
 * 生产概览
 * @typedef {Object} ProductionOverview
 * @property {Object} [batch]
 * @property {number} [batch.activeCount]
 * @property {Object} [yield]
 * @property {number} [yield.monthTotalYield]
 * @property {Object} [task]
 * @property {number} [task.completionRate]
 * @property {Object} [labor]
 * @property {number} [labor.totalHours]
 */

/**
 * 产量统计项（API 响应）
 * @typedef {Object} YieldStatsItem
 * @property {string} [name]
 * @property {number} [value]
 * @property {number} [count]
 */

/**
 * 人工统计项
 * @typedef {Object} LaborStatsItem
 * @property {string} [name]
 * @property {string} [month]
 * @property {number} [hours]
 * @property {number} [amount]
 */

/**
 * 人工统计汇总
 * @typedef {Object} LaborStatsSummary
 * @property {number} totalHours
 * @property {number} totalAmount
 * @property {number} avgHourlyRate
 */

/**
 * 劳动统计包装
 * @typedef {Object} LaborStatsData
 * @property {LaborStatsItem[]} details
 * @property {LaborStatsSummary} summary
 */

/**
 * 成本类型标签映射（英文 -> 中文）
 * @param {string} [type]
 * @returns {string}
 */
function getCostTypeLabel(type) {
  if (!type) return '其他'
  const labelMap = {
    'fertilizer': '肥料',
    'pesticide': '农药',
    'seed': '种子种苗',
    'film': '基质农膜',
    'electricity': '电费',
    'water': '水费',
    'gas': '燃气费',
    'utility': '水电费',
    'maintenance': '维修费',
    'other': '其他',
  }
  return labelMap[type] || type
}

/**
 * 生产报表数据 Composable
 * @returns {{
 *   loading: import('vue').Ref<boolean>,
 *   error: import('vue').Ref<string | null>,
 *   yieldStats: import('vue').ComputedRef<YieldStatRow[]>,
 *   cropYieldData: import('vue').ComputedRef<CropYieldRow[]>,
 *   costAnalysis: import('vue').ComputedRef<CostAnalysisRow[]>,
 *   monthlyLabor: import('vue').ComputedRef<MonthlyLaborRow[]>,
 *   statCards: import('vue').ComputedRef<ReportStatCard[]>,
 *   overview: import('vue').Ref<ProductionOverview | null>,
 *   refresh: () => Promise<void>
 * }}
 */
export function useProductionReports() {
  // ============== 1:1 翻译 V1.1 state ==============
  /** @type {import('vue').Ref<boolean>} */
  const loading = ref(true)
  /** @type {import('vue').Ref<string | null>} */
  const error = ref(null)
  /** @type {import('vue').Ref<ProductionOverview | null>} */
  const overview = ref(null)
  /** @type {import('vue').Ref<YieldStatsItem[]>} */
  const yieldStats = ref([])
  /** @type {import('vue').Ref<LaborStatsData | null>} */
  const laborStats = ref(null)

  // 新增：成本统计数据（来自 costService/store，包含物料和能源成本）
  // 1:1 翻译 V1.1：API 返回的驼峰命名保持一致
  /**
   * @type {import('vue').Ref<{
   *   labor: Array<{ costCategory: string; costType: string; month: string; workHours: number; totalAmount: number; workerCount: number }>,
   *   material: Array<{ costCategory: string; costType: string; costTypeCode: string; month: string; totalQuantity: number; totalAmount: number; recordCount: number }>,
   *   energy: Array<{ costCategory: string; costType: string; costTypeCode: string; month: string; totalQuantity: number; totalAmount: number; recordCount: number }>
   * } | null>}
   */
  const costStatsData = ref(null)
  /**
   * @type {import('vue').Ref<{
   *   total_labor_cost: number,
   *   total_material_cost: number,
   *   total_energy_cost: number,
   *   total_cost: number,
   *   total_work_hours: number,
   *   avg_hourly_rate: number
   * } | null>}
   */
  const costStatsSummary = ref(null)

  // 1:1 翻译 V1.1：考勤数据
  const { attendance } = usePersistentAttendance()

  // 1:1 翻译 V1.1：依赖的 Pinia store（V1.1 用 Zustand，V2.0 用 Pinia）
  const productionPlanStore = useProductionPlanStore()
  const farmTaskStore = useFarmTaskStore()
  const summaryStore = useSummaryStore()
  const costStore = useCostStore()

  // ============== 1:1 翻译 V1.1 loadData ==============
  // V1.1: const loadData = useCallback(async () => { ... }, [])
  // V2.0: 函数引用直接挂在实例上即可，调用方按需触发 refresh
  /**
   * 从后端加载生产报表数据
   * @returns {Promise<void>}
   */
  async function loadData() {
    loading.value = true
    error.value = null

    try {
      // 并行获取所有数据（包括成本统计）
      // 1:1 翻译 V1.1 Promise.all([getProductionOverview, getYieldStats, getLaborStats, getCostStats])
      // V2.0 改用对应的 Pinia store 方法
      const [overviewData, yieldData, laborData, costData] = await Promise.all([
        summaryStore.fetchOverview({}).then(() => summaryStore.overview),
        summaryStore.fetchYieldStats({ group_by: 'month' }).then(() => summaryStore.yieldItems),
        summaryStore.fetchLaborStats({ group_by: 'month' }).then(() => ({
          details: summaryStore.laborItems || [],
          summary: {
            totalHours: (summaryStore.laborItems || []).reduce((s, x) => s + (Number(x.hours) || 0), 0),
            totalAmount: (summaryStore.laborItems || []).reduce((s, x) => s + (Number(x.amount) || 0), 0),
            avgHourlyRate: 0,
          },
        })),
        costStore.loadStats({ cost_type: 'all' }),
      ])

      overview.value = overviewData
      yieldStats.value = Array.isArray(yieldData) ? yieldData : []
      laborStats.value = laborData

      // 设置成本统计数据
      // 1:1 翻译 V1.1：if (costData?.data) { setCostStatsData(costData.data); setCostStatsSummary(costData.summary) }
      if (costData && costData.data) {
        costStatsData.value = costData.data
        costStatsSummary.value = costData.summary
      } else if (costData) {
        // 兼容后端直接返回 {labor, material, energy, summary} 的情况
        const { labor, material, energy, summary } = costData
        if (labor || material || energy) {
          costStatsData.value = { labor: labor || [], material: material || [], energy: energy || [] }
          costStatsSummary.value = summary || null
        }
      }
    } catch (err) {
      // 加载生产报表数据失败
      // V1.1 原文：console.error('加载生产报表数据失败', err)
      console.error('加载生产报表数据失败', err)
      error.value = '加载数据失败'
      // 回退到本地数据
      fallbackToLocalData()
    } finally {
      loading.value = false
    }
  }

  // ============== 1:1 翻译 V1.1 fallbackToLocalData ==============
  /**
   * 回退到本地数据
   * @returns {void}
   */
  function fallbackToLocalData() {
    // 产量统计数据（从 useProductionPlanStore 获取）
    const plans = productionPlanStore.plans || []
    const activeBatches = plans.filter(b => b.status === 'in_progress' || b.status === 'completed')
    /** @type {Record<string, { yield: number, count: number }>} */
    const byCrop = {}
    activeBatches.forEach((batch) => {
      if (!byCrop[batch.cropName]) {
        byCrop[batch.cropName] = { yield: 0, count: 0 }
      }
      byCrop[batch.cropName].yield += batch.actualYield
      byCrop[batch.cropName].count += 1
    })

    const months = ['1月', '2月', '3月', '4月', '5月', '6月']
    const cropNames = Object.keys(byCrop)

    /** @type {YieldStatRow[]} */
    const localYieldStats = months.map((month, idx) => {
      const baseYield = cropNames.reduce((sum, crop) => sum + byCrop[crop].yield, 0)
      const monthRatio = [0.12, 0.15, 0.18, 0.20, 0.18, 0.17]
      const randomFactor = 0.9 + Math.random() * 0.2

      return {
        month,
        yield: Math.round(baseYield * monthRatio[idx] * randomFactor),
        region: 'G001',
        crop: cropNames[idx % cropNames.length] || '番茄',
      }
    })

    yieldStats.value = localYieldStats.map(s => ({
      name: s.month,
      value: s.yield,
      count: 1,
    }))

    // 人工统计数据
    const baseHours = attendance.value.reduce((sum, a) => sum + a.hours, 0)
    /** @type {MonthlyLaborRow[]} */
    const localLaborStats = months.map((month, idx) => {
      const monthRatio = [0.85, 0.92, 1.0]
      return {
        month,
        hours: Math.round(baseHours * 10 * monthRatio[idx]),
      }
    })

    laborStats.value = {
      details: localLaborStats.map(s => ({
        name: s.month,
        hours: s.hours,
        amount: s.hours * 30,
      })),
      summary: {
        totalHours: localLaborStats.reduce((sum, m) => sum + m.hours, 0),
        totalAmount: localLaborStats.reduce((sum, m) => sum + m.hours * 30, 0),
        avgHourlyRate: 30,
      },
    }
  }

  // ============== 1:1 翻译 V1.1 useEffect ==============
  // V1.1: useEffect(() => { loadData() }, [loadData])
  onMounted(() => {
    loadData()
  })

  // ============== 1:1 翻译 V1.1 yieldStatsConverted ==============
  /**
   * 转换产量统计数据
   * @type {import('vue').ComputedRef<YieldStatRow[]>}
   */
  const yieldStatsConverted = computed(() => {
    if (!yieldStats.value || yieldStats.value.length === 0) {
      return []
    }

    return yieldStats.value.map(s => ({
      month: s.name || /** @type {any} */ (s).month,  // API 返回 name="2026-04" 格式
      yield: s.value,
      region: 'G001',
      crop: s.name,
    }))
  })

  // ============== 1:1 翻译 V1.1 cropYieldData ==============
  /**
   * 作物产量占比
   * @type {import('vue').ComputedRef<CropYieldRow[]>}
   */
  const cropYieldData = computed(() => {
    if (!yieldStats.value || yieldStats.value.length === 0) {
      // 回退到 store 数据
      const plans = productionPlanStore.plans || []
      const activeBatches = plans.filter(b => b.status === 'in_progress' || b.status === 'completed')
      /** @type {Record<string, number>} */
      const byCrop = {}
      activeBatches.forEach((batch) => {
        if (!byCrop[batch.cropName]) {
          byCrop[batch.cropName] = 0
        }
        byCrop[batch.cropName] += batch.actualYield
      })

      return Object.entries(byCrop).map(([name, value]) => ({
        name,
        value,
      }))
    }

    // 按作物分组聚合
    /** @type {Record<string, number>} */
    const byCrop = {}
    yieldStats.value.forEach(s => {
      const name = s.name
      if (!byCrop[name]) {
        byCrop[name] = 0
      }
      byCrop[name] += s.value
    })

    return Object.entries(byCrop).map(([name, value]) => ({
      name,
      value,
    }))
  })

  // ============== 1:1 翻译 V1.1 costAnalysis ==============
  /**
   * 成本分析数据 - 使用真实的成本统计数据
   * @type {import('vue').ComputedRef<CostAnalysisRow[]>}
   */
  const costAnalysis = computed(() => {
    // 如果有从 API 获取的真实成本数据，则使用真实数据
    if (costStatsData.value) {
      /** @type {CostAnalysisRow[]} */
      const result = []

      // 人工成本
      if (costStatsData.value.labor && costStatsData.value.labor.length > 0) {
        const totalLabor = costStatsData.value.labor.reduce((sum, item) => sum + Number(item.totalAmount), 0)
        result.push({ name: '人工成本', value: Math.round(totalLabor), period: 'month' })
      }

      // 物料成本（按类型汇总）
      if (costStatsData.value.material && costStatsData.value.material.length > 0) {
        /** @type {Record<string, number>} */
        const materialByType = {}
        costStatsData.value.material.forEach((item) => {
          // costType 是英文，需要转换为中文标签
          const typeName = getCostTypeLabel(item.costType) || '其他物料'
          materialByType[typeName] = (materialByType[typeName] || 0) + Number(item.totalAmount)
        })

        Object.entries(materialByType).forEach(([type, amount]) => {
          result.push({ name: type, value: Math.round(amount), period: 'month' })
        })
      }

      // 能源成本（按类型汇总）
      if (costStatsData.value.energy && costStatsData.value.energy.length > 0) {
        /** @type {Record<string, number>} */
        const energyByType = {}
        costStatsData.value.energy.forEach((item) => {
          const typeName = getCostTypeLabel(item.costType) || '其他能源'
          energyByType[typeName] = (energyByType[typeName] || 0) + Number(item.totalAmount)
        })

        Object.entries(energyByType).forEach(([type, amount]) => {
          result.push({ name: type, value: Math.round(amount), period: 'month' })
        })
      }

      // 如果没有真实数据，返回空数组让 UI 显示"暂无数据"
      if (result.length === 0) {
        return []
      }

      return result
    }

    // 如果有 laborStats 但没有 costStatsData，使用 laborStats 数据
    if (laborStats.value) {
      return [
        { name: '人工成本', value: Math.round(laborStats.value.summary.totalAmount), period: 'month' },
        { name: '化肥成本', value: 28000, period: 'month', crop: 'C001' },
        { name: '农药成本', value: 15000, period: 'month', crop: 'C002' },
        { name: '种子种苗', value: 22000, period: 'quarter' },
        { name: '基质农膜', value: 18000, period: 'quarter', crop: 'C001' },
        { name: '能源成本', value: 15000, period: 'year' },
        { name: '其他成本', value: 13800, period: 'month', crop: 'C003' },
      ]
    }

    // 回退到考勤数据计算
    const totalLaborHours = attendance.value.reduce((sum, a) => sum + a.hours, 0)
    const laborCost = totalLaborHours * 30

    return [
      { name: '人工成本', value: Math.round(laborCost), period: 'month' },
      { name: '化肥成本', value: 28000, period: 'month', crop: 'C001' },
      { name: '农药成本', value: 15000, period: 'month', crop: 'C002' },
      { name: '种子种苗', value: 22000, period: 'quarter' },
      { name: '基质农膜', value: 18000, period: 'quarter', crop: 'C001' },
      { name: '能源成本', value: 15000, period: 'year' },
      { name: '其他成本', value: 13800, period: 'month', crop: 'C003' },
    ]
  })

  // ============== 1:1 翻译 V1.1 monthlyLabor ==============
  /**
   * 月度工时数据
   * @type {import('vue').ComputedRef<MonthlyLaborRow[]>}
   */
  const monthlyLabor = computed(() => {
    if (laborStats.value && laborStats.value.details) {
      return laborStats.value.details.map(d => ({
        month: /** @type {any} */ (d).month || d.name,
        hours: d.hours,
      }))
    }

    // 回退到考勤数据
    const baseHours = attendance.value.reduce((sum, a) => sum + a.hours, 0)
    const months = ['1月', '2月', '3月']
    return months.map((month, idx) => {
      const monthRatio = [0.85, 0.92, 1.0]
      return {
        month,
        hours: Math.round(baseHours * 10 * monthRatio[idx]),
      }
    })
  })

  // ============== 1:1 翻译 V1.1 statCards ==============
  /**
   * 统计卡片数据
   * @type {import('vue').ComputedRef<ReportStatCard[]>}
   */
  const statCards = computed(() => {
    if (overview.value) {
      return [
        { label: '生产批次', value: (overview.value.batch && overview.value.batch.activeCount) || 0, icon: '📦', iconBgColor: 'bg-blue-500' },
        { label: '总产量', value: ((overview.value.yield && overview.value.yield.monthTotalYield) || 0 / 10000).toFixed(1) + '万kg', icon: '📈', iconBgColor: 'bg-green-500' },
        { label: '任务完成率', value: ((overview.value.task && overview.value.task.completionRate) || 0) + '%', icon: '✅', iconBgColor: 'bg-purple-500' },
        { label: '总工时', value: ((overview.value.labor && overview.value.labor.totalHours) || 0).toLocaleString(), icon: '⏱️', iconBgColor: 'bg-amber-500' },
      ]
    }

    // 回退到 store 数据
    const plans = productionPlanStore.plans || []
    const allTasks = farmTaskStore.tasks || []
    const totalBatches = plans.length
    const totalYield = plans.reduce((sum, b) => sum + b.actualYield, 0)
    const avgCompletion = plans.length > 0
      ? (plans.reduce((sum, b) => {
          const batchTasks = allTasks.filter((/** @type {any} */ t) => t.batchId === b.id)
          const completed = batchTasks.filter((/** @type {any} */ t) => t.status === 'completed').length
          return sum + (batchTasks.length > 0 ? (completed / batchTasks.length) * 100 : 0)
        }, 0) / plans.length).toFixed(1)
      : '0'

    return [
      { label: '生产批次', value: totalBatches, icon: '📦', iconBgColor: 'bg-blue-500' },
      { label: '总产量', value: (totalYield / 10000).toFixed(1) + '万kg', icon: '📈', iconBgColor: 'bg-green-500' },
      { label: '平均完成率', value: avgCompletion + '%', icon: '✅', iconBgColor: 'bg-purple-500' },
      { label: '总工时', value: monthlyLabor.value.reduce((sum, m) => sum + m.hours, 0), icon: '⏱️', iconBgColor: 'bg-amber-500' },
    ]
  })

  // 静默引用未使用的解构/变量以保持 V1.1 解构完整性
  void costStatsSummary
  void farmTaskStore

  return {
    loading,
    error,
    yieldStats: yieldStatsConverted,
    cropYieldData,
    costAnalysis,
    monthlyLabor,
    statCards,
    overview,
    refresh: loadData,
  }
}
