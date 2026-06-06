/**
 * 每日任务规划 Composable
 * 1:1 翻译自 V1.1 src/hooks/useDailyTaskPlanning.ts
 * 实现智能派工系统阶段二：每日任务规划功能
 * 提供每日派工计划生成、确认与派发功能
 *
 * 数据流：useTasks/useTempTasks/usePersistentAttendance → 本组合式 → useDailyPlanningStore → useProductionPlanStore
 *
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\hooks\useDailyTaskPlanning.ts
 */
import { ref, computed, onMounted, watch } from 'vue'
import { useTasks } from '@/composables/useTasks'
import { usePersistentAttendance } from '@/composables/usePersistentAttendance'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useProductionPlanStore } from '@/stores/modules/productionPlan'
import { useDailyPlanningStore } from '@/stores/modules/dailyPlanning'

// ============================================
// 类型定义（JSDoc）
// ============================================

/**
 * @typedef {Object} Task
 * @property {string} [id]
 * @property {string} [taskCode]
 * @property {string} [title]
 * @property {string} [type]
 * @property {string} [typeName]
 * @property {string} [status]
 * @property {string} [priority]
 * @property {string} [assigneeId]
 * @property {string} [assigneeName]
 * @property {string} [dueDate]
 * @property {string} [batchId]
 * @property {string} [batchCode]
 * @property {string} [greenhouseId]
 * @property {string} [greenhouseName]
 * @property {string} [cropName]
 * @property {string} [stage]
 * @property {string} [stageName]
 * @property {string} [plantingArea]
 * @property {number} [estimatedHours]
 * @property {number} [estimatedWorkers]
 * @property {string} [taskType]
 * @property {string} [taskTypeName]
 * @property {'low'|'medium'|'high'} [urgency]
 */

/**
 * @typedef {Object} TempTask
 * @property {string} [id]
 * @property {string} [title]
 * @property {string} [status]
 * @property {string} [assigneeId]
 * @property {string} [assigneeName]
 * @property {string} [dueDate]
 */

/**
 * @typedef {Object} CropBatch
 * @property {string} [id]
 * @property {string} [batchCode]
 * @property {string} [batchStatus]
 * @property {string} [status]
 * @property {string} [cropName]
 * @property {string} [greenhouseId]
 * @property {string} [greenhouseName]
 * @property {string|number} [plantingArea]
 * @property {string} [stage]
 * @property {string} [stageName]
 */

/**
 * 工人负荷分析
 * @typedef {Object} WorkerLoadAnalysis
 * @property {string} workerId
 * @property {string} workerName
 * @property {number} todayTasks
 * @property {number} completedTasks
 * @property {number} completionRate
 * @property {'normal'|'busy'|'overloaded'} loadStatus
 * @property {'available'|'busy'} availability
 * @property {string[]} [currentTasks]
 */

/**
 * 天气信息
 * @typedef {Object} WeatherData
 * @property {string} date
 * @property {number} temperature
 * @property {string} condition
 * @property {string} forecast
 * @property {string} recommendation
 */

/**
 * 待派发任务
 * @typedef {Object} PredictedTask
 * @property {string} id
 * @property {string} [batchId]
 * @property {string} [batchCode]
 * @property {string} [cropName]
 * @property {string} [greenhouseId]
 * @property {string} [greenhouseName]
 * @property {string|number} [plantingArea]
 * @property {string} [stage]
 * @property {string} [stageName]
 * @property {string} [taskType]
 * @property {string} [taskTypeName]
 * @property {string} suggestedDate
 * @property {number} [estimatedHours]
 * @property {number} [estimatedWorkers]
 * @property {'low'|'medium'|'high'} priority
 * @property {'normal'|'high'|'urgent'} urgency
 * @property {string} reason
 * @property {boolean} [isOverdue]
 * @property {number} [daysSinceLastTask]
 * @property {number} [intervalDays]
 */

/**
 * 工人建议
 * @typedef {Object} WorkerSuggestion
 * @property {string} workerId
 * @property {string} workerName
 * @property {string} taskId
 * @property {number} confidenceScore
 */

/**
 * 每日计划
 * @typedef {Object} DailyPlan
 * @property {string} date
 * @property {PredictedTask[]} tasks
 * @property {number} totalTasks
 * @property {number} totalHours
 * @property {number} requiredWorkers
 * @property {WorkerSuggestion[]} [workerSuggestions]
 */

/**
 * @typedef {Object} WorkerRecommendation
 * @property {Object} worker
 * @property {string} worker.id
 * @property {string} worker.name
 */

// ============================================
// 工具函数（1:1 翻译 V1.1）
// ============================================

/**
 * 判断任务是否超期
 * 1:1 翻译自 V1.1 isTaskOverdue
 * @param {Task|TempTask} task 任务对象
 * @param {string} targetDate 目标日期 YYYY-MM-DD
 * @returns {boolean}
 */
function isTaskOverdue(task, targetDate) {
  if ('status' in task) {
    if (['completed', 'cancelled', 'abandoned', 'failed'].includes(/** @type {Task} */ (task).status)) {
      return false
    }
  } else {
    if (['completed', 'cancelled'].includes(/** @type {TempTask} */ (task).status)) {
      return false
    }
  }

  if (!task.dueDate) return false

  const dueDate = new Date(task.dueDate)
  const target = new Date(targetDate)
  dueDate.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)

  return dueDate < target
}

/**
 * 计算超期天数
 * 1:1 翻译自 V1.1 calculateOverdueDays
 * @param {string} dueDate 截止日期
 * @param {string} targetDate 目标日期
 * @returns {number}
 */
function calculateOverdueDays(dueDate, targetDate) {
  const due = new Date(dueDate)
  const target = new Date(targetDate)
  due.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)

  const diffTime = target.getTime() - due.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

// ============================================
// 内部依赖：临时任务（V1.1 useTempTasks 占位）
// ============================================
// 注：useTempTasks 在 V1.1 中读取 Zustand store 并维护本地 tempTasks 状态。
// V2.0 中独立 composable 翻译尚未完成（L2 其他任务），此处提供最小占位实现：
// - 保持与 V1.1 相同的返回接口（tempTasks ref）
// - 行为：返回空数组，与 V1.1 在未加载临时任务时行为一致
// 待 useTempTasks composable 翻译完成后，将 import 替换为 @/composables/useTempTasks 即可。

/**
 * 临时任务 composable 占位（待 useTempTasks 独立翻译后替换）
 * @returns {{ tempTasks: import('vue').Ref<TempTask[]> }}
 */
function useTempTasksPlaceholder() {
  // 占位：V1.1 初始化时 tempTasks 默认为空数组
  const tempTasks = ref([])
  return { tempTasks }
}

// ============================================
// 内部依赖：综合派工引擎（V1.1 useComprehensiveDispatch 占位）
// ============================================
// 注：V1.1 中 useDailyTaskPlanning 仅解构了 getRecommendations 但未实际调用，
// 此处提供最小占位返回空数组以保留 1:1 接口形状。

/**
 * 综合派工 composable 占位（待 useComprehensiveDispatch 独立翻译后替换）
 * @returns {{ getRecommendations: (task: Task, topN?: number) => WorkerRecommendation[] }}
 */
function useComprehensiveDispatchPlaceholder() {
  /**
   * @param {Task} _task
   * @param {number} [_topN]
   * @returns {WorkerRecommendation[]}
   */
  function getRecommendations(_task, _topN) {
    return []
  }
  return { getRecommendations }
}

// ============================================
// useDailyTaskPlanning Composable
// ============================================

/**
 * 每日任务规划 composable
 * 1:1 翻译自 V1.1 useDailyTaskPlanning
 * @returns {{
 *   generateDailyPlan: (targetDate: string) => Promise<DailyPlan>,
 *   confirmAndDispatch: (plan: DailyPlan) => Promise<{ success: boolean, dispatchedTasks: number }>,
 *   getTodayPlan: () => DailyPlan,
 *   getWorkerLoadAnalysis: (targetDate: string) => WorkerLoadAnalysis[],
 *   getWeatherForecast: (targetDate: string) => WeatherData | null,
 *   getPendingDispatchTasks: (targetDate: string) => PredictedTask[]
 * }}
 */
export function useDailyTaskPlanning() {
  // 获取农事任务数据（V1.1 1:1 翻译）
  // - tasks: 在 getWorkerLoadAnalysis + getPendingDispatchTasks 消费
  // - createTask: 在 confirmAndDispatch 消费
  // - updateTask: V1.1 解构但本文件未使用，修复 P0 删除避免 lint 抑制
  const { tasks, createTask } = useTasks()

  // 获取临时任务数据（V1.1 行为：tempTasks 列表，用于 getWorkerLoadAnalysis 统计）
  const { tempTasks } = useTempTasksPlaceholder()

  // 修复 P0: 删除 V1.1 解构但本文件未使用的变量（保持代码清爽）
  // - attendance: usePersistentAttendance 的返回值在本文件未消费
  // - getRecommendations: useComprehensiveDispatchPlaceholder 的返回值未使用
  // - fetchProductionPlans: computed 包装的 fetchPlans 未在文件内调用

  // 响应式订阅生产计划 Store 数据（V1.1: useProductionPlanStore selector）
  const productionPlanStore = useProductionPlanStore()
  const storeBatches = computed(() => productionPlanStore.plans || [])

  // 每日计划 Store（持久化到服务器）
  const dailyPlanStore = useDailyPlanningStore()

  // 存储上次任务执行日期记录（仍使用 localStorage）
  // - lastTaskDates 未在文件内直接读取（仅 setLastTaskDates 在 confirmAndDispatch 消费）
  // 修复 P0：移除未使用的 lastTaskDates 解构
  const [, setLastTaskDates] = useLocalStorage('yuanxingtu_daily_planning_last_tasks', {})

  // 初始化时从服务器获取每日计划
  // 1:1 翻译 V1.1 useEffect(() => { dailyPlanStore.fetchPlans(); }, [])
  onMounted(() => {
    dailyPlanStore.fetchPlans()
  })

  // ============================================
  // 获取人员负荷分析
  // 1:1 翻译 V1.1 getWorkerLoadAnalysis
  // ============================================
  /**
   * @param {string} targetDate 目标日期 YYYY-MM-DD
   * @returns {WorkerLoadAnalysis[]}
   */
  function getWorkerLoadAnalysis(targetDate) {
    const workerMap = new Map()

    // 统计农事任务
    tasks.value.forEach(task => {
      if (!task.assigneeName) return

      if (!workerMap.has(task.assigneeName)) {
        workerMap.set(task.assigneeName, {
          workerId: task.assigneeId || task.assigneeName,
          workerName: task.assigneeName,
          todayTasks: 0,
          completedTasks: 0,
          completionRate: 0,
          loadStatus: 'normal',
          availability: 'available',
          currentTasks: [],
        })
      }

      const analysis = workerMap.get(task.assigneeName)
      analysis.todayTasks++
      if (Array.isArray(analysis.currentTasks)) {
        analysis.currentTasks.push(task.title)
      }

      if (task.status === 'completed') {
        analysis.completedTasks++
      }
    })

    // 统计临时任务
    tempTasks.value.forEach(task => {
      if (!task.assigneeName) return

      if (!workerMap.has(task.assigneeName)) {
        workerMap.set(task.assigneeName, {
          workerId: task.assigneeId || task.assigneeName,
          workerName: task.assigneeName,
          todayTasks: 0,
          completedTasks: 0,
          completionRate: 0,
          loadStatus: 'normal',
          availability: 'available',
          currentTasks: [],
        })
      }

      const analysis = workerMap.get(task.assigneeName)
      analysis.todayTasks++
      if (Array.isArray(analysis.currentTasks)) {
        analysis.currentTasks.push(task.title)
      }

      if (task.status === 'completed') {
        analysis.completedTasks++
      }
    })

    // 计算完成率和负荷状态
    return Array.from(workerMap.values()).map(analysis => {
      const completionRate = analysis.todayTasks > 0
        ? Math.round((analysis.completedTasks / analysis.todayTasks) * 100)
        : 0

      let loadStatus = 'normal'
      if (analysis.todayTasks >= 5) {
        loadStatus = completionRate < 60 ? 'overloaded' : 'busy'
      } else if (analysis.todayTasks >= 3) {
        loadStatus = completionRate < 70 ? 'busy' : 'normal'
      }

      const availability = analysis.completedTasks < analysis.todayTasks ? 'busy' : 'available'

      return {
        ...analysis,
        completionRate,
        loadStatus,
        availability,
      }
    })
  }

  // ============================================
  // 获取天气信息（模拟数据）
  // 1:1 翻译 V1.1 getWeatherForecast
  // ============================================
  /**
   * @param {string} targetDate 目标日期
   * @returns {WeatherData | null}
   */
  function getWeatherForecast(targetDate) {
    // 模拟天气数据，实际应从天气API获取
    const weatherConditions = ['晴', '多云', '阴', '小雨', '大雨']
    const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)]
    const randomTemp = Math.floor(Math.random() * 15) + 15 // 15-30度

    return {
      date: targetDate,
      temperature: randomTemp,
      condition: randomCondition,
      forecast: `${randomCondition} ${randomTemp}°C`,
      recommendation: randomCondition.includes('雨')
        ? '今日有降雨，户外作业建议调整到明日或使用避雨设施'
        : '天气良好，适合各类农事作业',
    }
  }

  // ============================================
  // 获取待派发任务（超期或今日待处理）
  // 1:1 翻译 V1.1 getPendingDispatchTasks
  // ============================================
  /**
   * @param {string} targetDate 目标日期
   * @returns {PredictedTask[]}
   */
  function getPendingDispatchTasks(targetDate) {
    const pendingTasks = []

    // 使用响应式订阅的批次数据
    const batches = storeBatches.value || []

    // 过滤执行中批次
    const activeBatches = batches.filter(
      b => b.batchStatus === 'in_progress' || b.batchStatus === 'published' || b.status === 'in_progress'
    )

    // 为每个批次生成待处理任务
    for (const batch of activeBatches) {
      // 检查超期任务
      const batchTasks = tasks.value.filter(t =>
        t.batchId === batch.id ||
        t.batchCode === batch.batchCode
      )

      for (const task of batchTasks) {
        if (task.status !== 'completed' && isTaskOverdue(task, targetDate)) {
          const delayDays = task.dueDate ? calculateOverdueDays(task.dueDate, targetDate) : 0

          pendingTasks.push({
            id: `PRED_${task.id}_${Date.now()}`,
            batchId: batch.id,
            batchCode: batch.batchCode,
            cropName: batch.cropName,
            greenhouseId: batch.greenhouseId,
            greenhouseName: batch.greenhouseName,
            plantingArea: batch.plantingArea,
            stage: batch.stage,
            stageName: batch.stageName,
            taskType: (/** @type {Task} */ (task)).taskType || 'irrigation',
            taskTypeName: (/** @type {Task} */ (task)).taskTypeName || '灌溉',
            suggestedDate: targetDate,
            estimatedHours: (/** @type {Task} */ (task)).taskHours || (/** @type {Task} */ (task)).estimatedHours || 2,
            estimatedWorkers: 1,
            priority: delayDays > 3 ? 'high' : 'medium',
            urgency: delayDays > 3 ? 'urgent' : 'high',
            reason: `超期${delayDays}天未完成，需要立即处理`,
            isOverdue: true,
            daysSinceLastTask: delayDays,
            intervalDays: delayDays,
          })
        }
      }
    }

    return pendingTasks
  }

  // ============================================
  // 生成每日派工计划
  // 1:1 翻译 V1.1 generateDailyPlan
  // ============================================
  /**
   * @param {string} targetDate 目标日期
   * @returns {Promise<DailyPlan>}
   */
  async function generateDailyPlan(targetDate) {
    // 获取超期待处理任务
    const pendingTasks = getPendingDispatchTasks(targetDate)

    // 获取人员负荷
    const workerLoads = getWorkerLoadAnalysis(targetDate)

    // 获取天气信息
    const weather = getWeatherForecast(targetDate)

    // 计算可用人员
    const availableWorkers = workerLoads.filter(w => w.availability === 'available')

    // 为每个任务生成派工建议
    const workerSuggestions = []

    for (const task of pendingTasks) {
      if (availableWorkers.length === 0) break

      // 找到负荷最低的可用工人
      const bestWorker = availableWorkers.reduce((best, current) =>
        current.todayTasks < best.todayTasks ? current : best
      )

      workerSuggestions.push({
        workerId: bestWorker.workerId,
        workerName: bestWorker.workerName,
        taskId: task.id,
        confidenceScore: 75, // 模拟置信度
      })

      // 更新可用工人列表（标记为已分配）
      bestWorker.todayTasks++
      if (bestWorker.todayTasks >= 3) {
        const index = availableWorkers.indexOf(bestWorker)
        if (index > -1) availableWorkers.splice(index, 1)
      }
    }

    // 天气建议
    let weatherRecommendation = ''
    if (weather) {
      if (weather.condition && weather.condition.includes('雨')) {
        weatherRecommendation = '有雨天气，灌溉任务建议延后'
      }
    }

    const plan = {
      date: targetDate,
      tasks: pendingTasks,
      totalTasks: pendingTasks.length,
      totalHours: pendingTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0),
      requiredWorkers: Math.max(1, Math.ceil(pendingTasks.length / 3)),
      workerSuggestions,
    }

    // 保存计划到服务器
    await dailyPlanStore.savePlan(targetDate, plan)

    return plan
  }

  // ============================================
  // 确认并派发计划
  // 1:1 翻译 V1.1 confirmAndDispatch
  // ============================================
  /**
   * @param {DailyPlan} plan 日计划
   * @returns {Promise<{ success: boolean, dispatchedTasks: number }>}
   */
  async function confirmAndDispatch(plan) {
    let dispatchedCount = 0
    const errors = []

    try {
      for (const task of plan.tasks) {
        // 找到对应的派工建议
        const suggestion = (plan.workerSuggestions || []).find(s => s.taskId === task.id)

        if (suggestion) {
          try {
            // 创建任务：正确映射 PredictedTask 字段到 createTask 需要的字段
            await createTask({
              title: `${task.greenhouseName}-${task.taskTypeName}`,
              type: task.taskType,
              typeName: task.taskTypeName,
              assigneeId: suggestion.workerId,
              assigneeName: suggestion.workerName,
              dueDate: task.suggestedDate,
              priority: task.priority,
              estimatedHours: task.estimatedHours,
              status: 'pending',
              sourceType: 'dispatch',
              dispatchMode: 'farm',
              greenhouseId: task.greenhouseId,
              greenhouseName: task.greenhouseName,
              cropName: task.cropName,
              batchId: task.batchId,
              batchCode: task.batchCode,
            })

            dispatchedCount++

            // 更新最后任务执行日期
            const key = `${task.batchId}_${task.taskType}`
            setLastTaskDates(prev => ({
              ...prev,
              [key]: task.suggestedDate,
            }))
          } catch (taskError) {
            errors.push(`任务 ${task.taskTypeName} 创建失败: ${taskError && taskError.message ? taskError.message : String(taskError)}`)
          }
        }
      }

      // 更新计划状态为已派发（保存到服务器）
      await dailyPlanStore.savePlan(plan.date, plan)

      // 如果有任何错误，返回 false
      if (errors.length > 0) {
        // 部分任务派发失败
        return { success: false, dispatchedTasks: dispatchedCount }
      }

      return { success: true, dispatchedTasks: dispatchedCount }
    } catch (error) {
      // 派发失败
      return { success: false, dispatchedTasks: dispatchedCount }
    }
  }

  // ============================================
  // 获取今日计划
  // 1:1 翻译 V1.1 getTodayPlan（保留 V1.1 的非 await 行为：fallback 时返回 Promise 而非 DailyPlan）
  // ============================================
  /**
   * @returns {DailyPlan}
   */
  function getTodayPlan() {
    const today = new Date().toISOString().split('T')[0]

    // 从 Store 获取计划
    const storedPlan = dailyPlanStore.getPlan(today)
    if (storedPlan) {
      return storedPlan
    }

    // 否则生成新计划（V1.1 行为：未 await，返回 Promise<DailyPlan>，1:1 保留）
    return generateDailyPlan(today)
  }

  // ============================================
  // 修复 P0: 移除 V1.1 行为约定的 5 个 void 抑制（未使用解构已在上方清理）
  // ============================================

  return {
    generateDailyPlan,
    confirmAndDispatch,
    getTodayPlan,
    getWorkerLoadAnalysis,
    getWeatherForecast,
    getPendingDispatchTasks,
  }
}
