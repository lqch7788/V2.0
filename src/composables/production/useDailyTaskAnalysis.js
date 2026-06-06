/**
 * 每日工单分析 composable（第二阶段 Y9 重构）
 * 1:1 翻译自 V1.1 useDailyWorkOrderAnalysis
 * 从 DailyPlanning.vue 中抽出 6 个纯函数：isTaskOverdue / calculateOverdueDays / isCompletedAhead / isCompletedOnTime / generateAIRecommendations / generateDailyReport
 *
 * 设计：纯函数导出 + 单一 composable 聚合，便于单独测试和复用
 */

// 已完成任务状态集合（避免重复字面量）
const COMPLETED_STATUSES = ['completed']
const CANCELLED_STATUSES = ['cancelled', 'abandoned', 'failed']
const INACTIVE_STATUSES = [...COMPLETED_STATUSES, ...CANCELLED_STATUSES]
const IN_PROGRESS_STATUSES = ['accepted', 'in_progress']

/**
 * 判断任务是否超期
 * @param {{ status: string, dueDate?: string }} task
 * @param {string} targetDate
 * @returns {boolean}
 */
export function isTaskOverdue(task, targetDate) {
  if (INACTIVE_STATUSES.includes(task.status)) {
    return false
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
 * @param {string} dueDate
 * @param {string} targetDate
 * @returns {number}
 */
export function calculateOverdueDays(dueDate, targetDate) {
  const due = new Date(dueDate)
  const target = new Date(targetDate)
  due.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const diffTime = target.getTime() - due.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

/**
 * 判断是否提前完成
 * @param {{ completedAt?: string }} task
 * @param {string} targetDate
 * @returns {boolean}
 */
export function isCompletedAhead(task, targetDate) {
  if (!task.completedAt) return false
  const completionDate = new Date(task.completedAt)
  const target = new Date(targetDate)
  completionDate.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return completionDate < target
}

/**
 * 判断是否按时完成
 * @param {{ completedAt?: string }} task
 * @param {string} targetDate
 * @returns {boolean}
 */
export function isCompletedOnTime(task, targetDate) {
  if (!task.completedAt) return false
  const completionDate = new Date(task.completedAt)
  const target = new Date(targetDate)
  completionDate.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return completionDate.getTime() === target.getTime()
}

/**
 * 生成AI建议（1:1 翻译自 V1.1）
 * @param {TaskProgressAnalysis[]} aheadTasks
 * @param {TaskProgressAnalysis[]} delayedTasks
 * @param {TaskProgressAnalysis[]} unfinishedTasks
 * @param {WorkerLoadAnalysis[]} workerLoadAnalysis
 * @returns {string[]}
 */
export function generateAIRecommendations(aheadTasks, delayedTasks, unfinishedTasks, workerLoadAnalysis) {
  const recommendations = []

  if (delayedTasks.length > 0) {
    recommendations.push(`【紧急】当前有 ${delayedTasks.length} 个任务已超期，建议优先处理超期任务，可考虑增加执行人员或调整任务分配。`)
    const mostDelayed = delayedTasks.reduce((max, task) =>
      (task.delayDays || 0) > (max.delayDays || 0) ? task : max
    )
    if (mostDelayed.delayDays && mostDelayed.delayDays > 3) {
      recommendations.push(`【重点关注】任务"${mostDelayed.taskName}"已超期${mostDelayed.delayDays}天，建议主管介入协调资源。`)
    }
  }

  if (unfinishedTasks.length > 0) {
    recommendations.push(`【提醒】有 ${unfinishedTasks.length} 个任务截止日期已到但尚未完成，建议及时跟进处理。`)
  }

  const overloadedWorkers = workerLoadAnalysis.filter(w => w.loadStatus === 'overloaded')
  if (overloadedWorkers.length > 0) {
    const names = overloadedWorkers.map(w => w.workerName).join('、')
    recommendations.push(`【人员调整】${names} 等人当前任务过重，建议将部分任务重新分配给其他人员。`)
  }

  const busyWorkers = workerLoadAnalysis.filter(w => w.loadStatus === 'busy')
  if (busyWorkers.length > 0) {
    recommendations.push(`【注意】${busyWorkers.length} 名员工当前工作负荷较高，建议关注任务进度。`)
  }

  if (aheadTasks.length > 0) {
    recommendations.push(`【表扬】有 ${aheadTasks.length} 个任务提前完成，表现优异，可作为标杆鼓励团队。`)
  }

  const availableWorkers = workerLoadAnalysis.filter(w => w.availability === 'available')
  if (delayedTasks.length > 0 && availableWorkers.length > 0) {
    const availableNames = availableWorkers.map(w => w.workerName).join('、')
    recommendations.push(`【资源调配】${availableNames} 等人当前可用，建议将部分超期任务分配给他们加快进度。`)
  }

  if (delayedTasks.length === 0 && unfinishedTasks.length === 0 && workerLoadAnalysis.length > 0) {
    recommendations.push(`【正常】今日任务执行情况良好，所有任务进度正常，无特殊建议。`)
  }

  return recommendations
}

// 工人负荷阈值（V1.1 useDailyWorkOrderAnalysis L162-170 行为 1:1）
const WORKER_OVERLOAD_THRESHOLD = 5
const WORKER_OVERLOAD_LOW_COMPLETION = 60
const WORKER_BUSY_THRESHOLD = 3
const WORKER_BUSY_LOW_COMPLETION = 70

/**
 * @param {string} targetDate
 * @param {any[]} tasks
 * @param {any[]} tempTasks
 * @returns {DailyWorkOrderReport}
 */
export function generateDailyReport(targetDate, tasks, tempTasks) {
  // 分析提前完成任务
  const aheadTasks = []
  tasks.forEach(task => {
    if (task.status === 'completed' && isCompletedAhead(task, targetDate)) {
      aheadTasks.push({
        taskId: task.id,
        taskName: task.title,
        plannedDate: task.dueDate || '',
        actualCompletionDate: task.completedAt,
        progressStatus: 'ahead',
        actualAssignee: task.assigneeName,
      })
    }
  })

  // 分析推迟完成任务
  const delayedTasks = []
  tasks.forEach(task => {
    if (task.status !== 'completed' && isTaskOverdue(task, targetDate)) {
      const delayDays = task.dueDate ? calculateOverdueDays(task.dueDate, targetDate) : 0
      delayedTasks.push({
        taskId: task.id,
        taskName: task.title,
        plannedDate: task.dueDate || '',
        progressStatus: 'delayed',
        delayDays,
        delayReason: `超期${delayDays}天`,
        actualAssignee: task.assigneeName,
      })
    }
  })

  // 分析未完成任务
  const unfinishedTasks = []
  tasks.forEach(task => {
    if (task.status !== 'completed' && isTaskOverdue(task, targetDate)) {
      const delayDays = task.dueDate ? calculateOverdueDays(task.dueDate, targetDate) : 0
      unfinishedTasks.push({
        taskId: task.id,
        taskName: task.title,
        plannedDate: task.dueDate || '',
        progressStatus: task.status === 'cancelled' ? 'cancelled' : 'delayed',
        delayDays,
        delayReason: delayDays > 0 ? `已超期${delayDays}天未完成` : '截止日期已到未完成',
        actualAssignee: task.assigneeName,
      })
    }
  })

  // 分析人员负荷
  const workerMap = new Map()
  tasks.forEach(task => {
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
      })
    }
    const analysis = workerMap.get(task.assigneeName)
    analysis.todayTasks++
    if (task.status === 'completed') {
      analysis.completedTasks++
    }
  })

  const workerLoadAnalysis = Array.from(workerMap.values()).map(analysis => {
    const completionRate = analysis.todayTasks > 0
      ? Math.round((analysis.completedTasks / analysis.todayTasks) * 100)
      : 0
    let loadStatus = 'normal'
    if (analysis.todayTasks >= WORKER_OVERLOAD_THRESHOLD) {
      loadStatus = completionRate < WORKER_OVERLOAD_LOW_COMPLETION ? 'overloaded' : 'busy'
    } else if (analysis.todayTasks >= WORKER_BUSY_THRESHOLD) {
      loadStatus = completionRate < WORKER_BUSY_LOW_COMPLETION ? 'busy' : 'normal'
    }
    const availability = analysis.completedTasks < analysis.todayTasks ? 'busy' : 'available'
    return { ...analysis, completionRate, loadStatus, availability }
  })

  // 统计任务数量
  const totalTasks = tasks.length + (tempTasks?.length || 0)
  const pendingTasks = tasks.filter(t => t.status === 'pending').length + (tempTasks?.filter(t => t.status === 'pending').length || 0)
  const inProgressTasks = tasks.filter(t => IN_PROGRESS_STATUSES.includes(t.status)).length
  const completedTasks = tasks.filter(t => t.status === 'completed').length + (tempTasks?.filter(t => t.status === 'completed').length || 0)
  const overdueTaskIds = new Set([...delayedTasks.map(t => t.taskId), ...unfinishedTasks.map(t => t.taskId)])
  const overdueTasks = overdueTaskIds.size

  // 生成AI建议
  const aiRecommendations = generateAIRecommendations(aheadTasks, delayedTasks, unfinishedTasks, workerLoadAnalysis)

  return {
    date: targetDate,
    totalTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    overdueTasks,
    aheadTasks,
    delayedTasks,
    unfinishedTasks,
    workerLoadAnalysis,
    aiRecommendations,
  }
}

/**
 * Composable 形式聚合（方便主页面一次 import 全部）
 */
export function useDailyTaskAnalysis() {
  return {
    isTaskOverdue,
    calculateOverdueDays,
    isCompletedAhead,
    isCompletedOnTime,
    generateAIRecommendations,
    generateDailyReport,
  }
}
