/**
 * 综合智能派工引擎 Composable（V2.0）
 * V1.1 1:1 接口对齐：useComprehensiveDispatch.ts (983 行)
 * 实现简化：保留 V1.1 全部 API 入口，使用本地计算/推荐逻辑
 */
import { ref, computed, watch } from 'vue'
import { useTasks } from './useTasks.js'
import { useTempTaskStore } from '@/stores/modules/tempTask.js'
import { useProblemStore } from '@/stores/modules/problem.js'
import { useUserStore } from '@/stores/modules/user.js'
import { useEnvironmentData } from './useEnvironmentData.js'

const DEFAULT_DISPATCH_CONFIG = {
  weights: {
    skillMatch: 0.30,
    location: 0.20,
    currentLoad: 0.20,
    historicalPerformance: 0.15,
    urgency: 0.10,
    batchFamiliarity: 0.03,
    cycleAdaptation: 0.02,
  },
}

export function useComprehensiveDispatch() {
  const tasksHook = useTasks()
  const tempTaskStore = useTempTaskStore()
  const problemStore = useProblemStore()
  const userStore = useUserStore()
  const envData = useEnvironmentData()

  // 任务池：合并农事 + 临时 + 巡查问题
  const taskPool = computed(() => {
    const pool = []
    // 农事任务
    if (tasksHook.tasks?.value) {
      tasksHook.tasks.value.forEach(t => {
        if (['pending', 'recommended'].includes(t.status)) {
          pool.push({
            id: t.id,
            source: 'farm',
            sourceId: t.id,
            taskCode: t.taskCode || t.id,
            title: t.title || t.typeName,
            type: t.types?.[0] || t.type || 'task',
            typeName: t.typeName || '',
            priority: t.priority || 'normal',
            workZone: t.field || t.greenhouseName || '',
            greenhouse: t.greenhouseName || '',
            cropName: t.crop || t.cropName || '',
            batchId: t.batchId,
            batchCode: t.batchCode,
            requiredSkills: t.skills || [],
            estimatedHours: (t.estimatedDays || 0) * 8 + (t.estimatedHours || 0),
            dueDate: t.dueDate || t.planEnd,
            description: t.remarks,
            createdAt: t.createdAt,
            assigneeId: t.assigneeId,
            assigneeName: t.assigneeName,
          })
        }
      })
    }
    // 临时任务
    if (tempTaskStore.tasks) {
      tempTaskStore.tasks.forEach(t => {
        if (['pending', 'draft'].includes(t.status)) {
          pool.push({
            id: `temp-${t.id}`,
            source: 'tempTask',
            sourceId: t.id,
            taskCode: t.taskCode || `TT${t.id}`,
            title: t.title || t.name || '',
            type: t.type || t.tempTaskType || 'task',
            typeName: t.typeName || t.tempTaskType || '',
            priority: t.urgency === 'critical' ? 'urgent' : (t.urgency || 'normal'),
            workZone: t.workLocation || t.workZone || '',
            greenhouse: t.greenhouse || '',
            cropName: t.crop || '',
            requiredSkills: t.skills || [],
            estimatedHours: (t.estimatedDays || 0) * 8 + (t.estimatedHours || 0),
            dueDate: t.dueDate,
            description: t.description,
            createdAt: t.createdAt,
            assigneeId: t.assigneeId,
            assigneeName: t.assigneeName,
          })
        }
      })
    }
    // 巡查问题
    if (problemStore.problems) {
      problemStore.problems.forEach(p => {
        if (['pending', 'open'].includes(p.status)) {
          pool.push({
            id: `problem-${p.id}`,
            source: 'inspection',
            sourceId: p.id,
            taskCode: p.code || `INSP${p.id}`,
            title: p.title || p.description || '巡查问题',
            type: p.type || 'problem',
            typeName: p.typeName || '巡查问题',
            priority: p.severity === 'high' ? 'urgent' : (p.severity || 'normal'),
            workZone: p.location || '',
            greenhouse: p.greenhouse || '',
            cropName: p.crop || '',
            requiredSkills: [],
            estimatedHours: p.estimatedHours || 2,
            dueDate: p.dueDate,
            description: p.description,
            createdAt: p.createdAt,
            assigneeId: p.assigneeId,
            assigneeName: p.assigneeName,
          })
        }
      })
    }
    return pool
  })

  // 员工列表
  const workers = computed(() => {
    return (userStore.users || []).map(u => ({
      id: u.id || u.userId,
      name: u.name || u.userName,
      workerType: u.workerType || u.role || '正式工',
      workZone: u.workZone || u.department || '',
      skills: u.skills || [],
      currentLoad: u.currentLoad || 0,
      availableHoursToday: u.availableHours || 8,
      recentPerformance: u.performance || 80,
      distance: u.distance || {},
      batchFamiliarity: u.batchFamiliarity || {},
      attendanceStatus: u.attendanceStatus || 'working',
    }))
  })

  // 统计
  const stats = computed(() => ({
    total: taskPool.value.length,
    farm: taskPool.value.filter(t => t.source === 'farm').length,
    tempTask: taskPool.value.filter(t => t.source === 'tempTask').length,
    inspection: taskPool.value.filter(t => t.source === 'inspection').length,
  }))

  // 按来源筛选
  const filterBySource = (source) => {
    if (!source) return taskPool.value
    return taskPool.value.filter(t => t.source === source)
  }

  // 单任务 AI 推荐（基于多因子评分 V1.1 L401-500 1:1 对齐：完整 reasonsDetail + riskWarnings + factorsDetail）
  const getRecommendations = (task) => {
    if (!task) return []
    return workers.value.map(worker => {
      // 1. 技能匹配度
      const skillMatch = task.requiredSkills.length === 0 ? 80 :
        (task.requiredSkills.filter(s => worker.skills.includes(s)).length / task.requiredSkills.length) * 100

      // 2. 位置匹配
      const locationScore = worker.workZone === task.workZone ? 100 :
        (worker.workZone && task.workZone ? 60 : 50)

      // 3. 负荷得分
      const loadScore = Math.max(0, 100 - worker.currentLoad)

      // 4. 历史表现
      const performanceScore = worker.recentPerformance

      // 5. 紧急程度
      const urgencyScore = task.priority === 'urgent' ? 100 : (task.priority === 'high' ? 80 : 60)

      // 6. 批次熟悉度
      const batchFamiliarity = worker.batchFamiliarity?.[task.batchId] || 70

      // 7. 周期适配（简化为经验加成）
      const cycleAdaptation = worker.recentPerformance > 70 ? 80 : 50

      // 8. 天气影响
      const weatherScore = envData.todayWeather?.value?.isSuitable ? 100 : 70

      // 综合得分（V1.1 7 因子权重）
      const score =
        skillMatch * DEFAULT_DISPATCH_CONFIG.weights.skillMatch +
        locationScore * DEFAULT_DISPATCH_CONFIG.weights.location +
        loadScore * DEFAULT_DISPATCH_CONFIG.weights.currentLoad +
        performanceScore * DEFAULT_DISPATCH_CONFIG.weights.historicalPerformance +
        urgencyScore * DEFAULT_DISPATCH_CONFIG.weights.urgency +
        batchFamiliarity * DEFAULT_DISPATCH_CONFIG.weights.batchFamiliarity +
        cycleAdaptation * DEFAULT_DISPATCH_CONFIG.weights.cycleAdaptation

      const confidenceLevel = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low'

      // 详细推荐理由（V1.1 reasonsDetail）
      const positive = []
      const warning = []
      if (skillMatch >= 80) positive.push(`技能完全匹配（${Math.round(skillMatch)}%）`)
      else if (skillMatch >= 50) positive.push(`部分技能匹配（${Math.round(skillMatch)}%）`)
      else warning.push(`技能匹配度低（${Math.round(skillMatch)}%）`)
      if (locationScore === 100) positive.push('工作区域一致')
      else if (locationScore === 60) warning.push('跨区域作业')
      if (loadScore >= 70) positive.push(`当前负荷较低（${worker.currentLoad}%）`)
      else if (loadScore < 40) warning.push(`当前负荷较高（${worker.currentLoad}%）`)
      if (batchFamiliarity >= 80) positive.push('批次熟悉度高')
      if (performanceScore >= 80) positive.push('历史表现优秀')
      else if (performanceScore < 60) warning.push('历史表现一般')

      // 风险预警
      const riskWarnings = []
      if (worker.currentLoad > 90) riskWarnings.push('当前负荷过高')
      if (worker.attendanceStatus !== 'working') riskWarnings.push('非在岗状态')
      if (task.priority === 'urgent' && score < 70) riskWarnings.push('紧急任务匹配度不足')
      if (worker.skills.length === 0) riskWarnings.push('未登记技能')

      // 因素详情（V1.1 factorsDetail）
      const factorsDetail = {
        production: task.cropName ? [`作物：${task.cropName}`, `批次：${task.batchCode || '未指定'}`] : [],
        environment: [
          `天气：${envData.todayWeather?.value?.condition || '未知'}`,
          `气温：${envData.todayWeather?.value?.temperature || '--'}°C`,
          `湿度：${envData.todayWeather?.value?.humidity || '--'}%`,
        ],
        worker: [
          `员工：${worker.name}`,
          `类型：${worker.workerType}`,
          `当前负荷：${worker.currentLoad}%`,
        ],
      }

      return {
        worker,
        matchScore: Math.round(score),
        skillMatchRate: Math.round(skillMatch),
        locationScore: Math.round(locationScore),
        loadScore: Math.round(loadScore),
        performanceScore: Math.round(performanceScore),
        urgencyScore: Math.round(urgencyScore),
        batchFamiliarityScore: Math.round(batchFamiliarity),
        weatherScore: Math.round(weatherScore),
        reasons: [
          `技能匹配度 ${Math.round(skillMatch)}%`,
          `位置匹配 ${worker.workZone === task.workZone ? '同区' : '跨区'}`,
          `当前负荷 ${worker.currentLoad}%`,
        ],
        confidenceLevel,
        confidenceScore: Math.round(score),
        suggestedAction: score >= 70 ? 'dispatch' : 'review',
        reasonsDetail: { positive, warning },
        riskWarnings,
        isAvailable: worker.attendanceStatus === 'working' && worker.currentLoad < 90,
        factorsDetail,
      }
    }).sort((a, b) => b.matchScore - a.matchScore)
  }

  // 执行派发
  const executeDispatch = async (taskId, workerId) => {
    const task = taskPool.value.find(t => t.id === taskId)
    if (!task) return { success: false, message: '任务不存在' }
    try {
      if (task.source === 'farm' && tasksHook.acceptTask) {
        await tasksHook.acceptTask(task.sourceId, workerId)
      } else if (task.source === 'tempTask' && tempTaskStore.acceptTempTask) {
        await tempTaskStore.acceptTempTask(task.sourceId, workerId)
      } else if (task.source === 'inspection' && problemStore.acceptProblem) {
        await problemStore.acceptProblem(task.sourceId, workerId, '')
      }
      return { success: true, message: '派发成功' }
    } catch (err) {
      return { success: false, message: err?.message || '派发失败' }
    }
  }

  // 批量派发建议
  const batchSuggestions = computed(() => {
    const zones = {}
    taskPool.value.forEach(t => {
      if (t.workZone) {
        zones[t.workZone] = (zones[t.workZone] || 0) + 1
      }
    })
    return Object.entries(zones)
      .filter(([_, count]) => count >= 3)
      .map(([zone, count]) => ({
        zone,
        taskCount: count,
        suggestedWorkers: workers.value.filter(w => w.workZone === zone).slice(0, 3),
      }))
  })

  return {
    taskPool,
    filterBySource,
    stats,
    workers,
    getRecommendations,
    batchSuggestions,
    executeDispatch,
    todayWeather: envData.todayWeather,
    getCurrentWeatherRecommendation: envData.getCurrentWeatherRecommendation,
    unacknowledgedAlerts: envData.unacknowledgedAlerts,
    criticalAlerts: envData.criticalAlerts,
  }
}
