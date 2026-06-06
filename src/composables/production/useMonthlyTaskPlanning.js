/**
 * 月度任务规划 Composable
 * 1:1 翻译自 V1.1 src/hooks/useMonthlyTaskPlanning.ts
 * 实现智能派工系统阶段三：月度任务规划功能
 *
 * 功能：
 * 1. generateMonthlyPlan - 生成月度规划
 * 2. aggregateByWeek - 按周汇总任务
 * 3. analyzeMaterialRequirements - 物资需求分析
 * 4. analyzeToolRequirements - 工具需求分析
 * 5. analyzeWorkerRequirements - 人员需求分析
 * 6. estimateCost - 成本预估
 *
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\hooks\useMonthlyTaskPlanning.ts
 */
import { ref, computed, onMounted } from 'vue'
import { useProductionPlanStore } from '@/stores/modules/productionPlan'
import { useMonthlyPlanningStore } from '@/stores/modules/monthlyPlanning'
import { loadFromStorage, saveToStorage } from '@/composables/useLocalStorage'

// ============================================
// 类型定义（JSDoc）
// ============================================

/**
 * 作物批次
 * @typedef {import('@/services/apiProductionPlanService').CropBatch} CropBatch
 */

/**
 * 任务配置项
 * @typedef {Object} StageTaskConfig
 * @property {string} taskType
 * @property {string} taskTypeName
 * @property {number} intervalDays
 * @property {number} baseHours
 * @property {number} baseWorkers
 */

/**
 * @typedef {Object} PredictedTask
 * @property {string} id
 * @property {string} batchId
 * @property {string} batchCode
 * @property {string} cropName
 * @property {string} greenhouseId
 * @property {string} greenhouseName
 * @property {number} plantingArea
 * @property {string} stage
 * @property {string} stageName
 * @property {string} taskType
 * @property {string} taskTypeName
 * @property {string} suggestedDate
 * @property {number} estimatedHours
 * @property {number} estimatedWorkers
 * @property {'high'|'medium'|'low'} priority
 * @property {'urgent'|'high'|'normal'} urgency
 * @property {string} reason
 * @property {boolean} isOverdue
 * @property {number} daysSinceLastTask
 * @property {number} intervalDays
 */

/**
 * @typedef {Object} WeeklySummary
 * @property {number} weekNumber
 * @property {string} startDate
 * @property {string} endDate
 * @property {number} taskCount
 * @property {number} totalHours
 * @property {string[]} keyCrops
 * @property {string[]} keyTasks
 * @property {number} requiredWorkers
 */

/**
 * @typedef {Object} MaterialRequirement
 * @property {string} materialName
 * @property {string} specification
 * @property {number} quantity
 * @property {string} unit
 * @property {number} estimatedUnitPrice
 * @property {number} estimatedTotalPrice
 */

/**
 * @typedef {Object} ToolRequirement
 * @property {string} toolName
 * @property {string} specification
 * @property {number} quantity
 * @property {string} unit
 * @property {number} estimatedUnitPrice
 * @property {number} estimatedTotalPrice
 */

/**
 * @typedef {Object} WorkerRequirement
 * @property {string} role
 * @property {string} skill
 * @property {number} requiredCount
 * @property {number} estimatedHours
 */

/**
 * @typedef {Object} CostBreakdown
 * @property {number} materialCost
 * @property {number} toolCost
 * @property {number} laborCost
 * @property {number} total
 */

/**
 * @typedef {Object} DailyPlan
 * @property {string} date
 * @property {PredictedTask[]} tasks
 * @property {number} totalTasks
 * @property {number} totalHours
 * @property {number} requiredWorkers
 */

/**
 * @typedef {Object} MonthlyPlan
 * @property {string} month
 * @property {string[]} batches
 * @property {number} totalTasks
 * @property {number} totalHours
 * @property {number} totalCost
 * @property {WeeklySummary[]} weeklySummaries
 * @property {Record<string, number>} taskTypeBreakdown
 * @property {Record<string, DailyPlan>} dailyPlans
 * @property {MaterialRequirement[]} materialRequirements
 * @property {ToolRequirement[]} toolRequirements
 * @property {WorkerRequirement[]} workerRequirements
 * @property {CostBreakdown} costBreakdown
 * @property {string} generatedAt
 * @property {string} generatedBy
 * @property {'monthly'} planningHorizon
 */

// ============================================
// 内部数据：作物阶段任务配置（V1.1 1:1 移植）
// ============================================
// 注：V1.1 中此配置位于 src/data/cropStageTaskConfig.ts。
// V2.0 暂无对应 data 文件，按 1:1 翻译原则内联在此处（保持与 V1.1 一致的数据内容）。
// 待后续 L3 任务提取为独立模块时再替换 import。

/** @type {Record<string, Record<string, StageTaskConfig[]>>} */
const CROP_STAGE_TASK_CONFIG = {
  '番茄': {
    'seedling': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 7, baseHours: 2, baseWorkers: 1 },
    ],
    'vegetative': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 1, baseHours: 1.5, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 5, baseHours: 2.5, baseWorkers: 2 },
      { taskType: 'pruning', taskTypeName: '修剪', intervalDays: 7, baseHours: 3, baseWorkers: 2 },
      { taskType: 'weeding', taskTypeName: '除草', intervalDays: 10, baseHours: 2, baseWorkers: 1 },
    ],
    'flowering': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 1, baseHours: 1.5, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 5, baseHours: 2.5, baseWorkers: 2 },
      { taskType: 'plant_protection', taskTypeName: '植保', intervalDays: 7, baseHours: 2, baseWorkers: 2 },
    ],
    'fruiting': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 1, baseHours: 1.5, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 5, baseHours: 2.5, baseWorkers: 2 },
      { taskType: 'plant_protection', taskTypeName: '植保', intervalDays: 7, baseHours: 2, baseWorkers: 2 },
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 2, baseHours: 4, baseWorkers: 3 },
    ],
    'harvest': [
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 1, baseHours: 5, baseWorkers: 4 },
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1, baseWorkers: 1 },
    ],
  },
  '茄子': {
    'seedling': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 7, baseHours: 2, baseWorkers: 1 },
    ],
    'vegetative': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1.5, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 5, baseHours: 2.5, baseWorkers: 2 },
      { taskType: 'pruning', taskTypeName: '修剪', intervalDays: 10, baseHours: 2.5, baseWorkers: 2 },
    ],
    'flowering': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1.5, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 5, baseHours: 2.5, baseWorkers: 2 },
      { taskType: 'plant_protection', taskTypeName: '植保', intervalDays: 7, baseHours: 2, baseWorkers: 2 },
    ],
    'fruiting': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1.5, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 5, baseHours: 2.5, baseWorkers: 2 },
      { taskType: 'plant_protection', taskTypeName: '植保', intervalDays: 7, baseHours: 2, baseWorkers: 2 },
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 2, baseHours: 4, baseWorkers: 3 },
    ],
    'harvest': [
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 1, baseHours: 5, baseWorkers: 4 },
    ],
  },
  '辣椒': {
    'seedling': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 7, baseHours: 2, baseWorkers: 1 },
    ],
    'vegetative': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 5, baseHours: 2, baseWorkers: 2 },
      { taskType: 'pruning', taskTypeName: '修剪', intervalDays: 10, baseHours: 2, baseWorkers: 1 },
    ],
    'flowering': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 5, baseHours: 2, baseWorkers: 2 },
      { taskType: 'plant_protection', taskTypeName: '植保', intervalDays: 7, baseHours: 2, baseWorkers: 2 },
    ],
    'fruiting': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 5, baseHours: 2, baseWorkers: 2 },
      { taskType: 'plant_protection', taskTypeName: '植保', intervalDays: 7, baseHours: 2, baseWorkers: 2 },
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 2, baseHours: 3.5, baseWorkers: 3 },
    ],
    'harvest': [
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 1, baseHours: 4, baseWorkers: 3 },
    ],
  },
  '黄瓜': {
    'seedling': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 7, baseHours: 2, baseWorkers: 1 },
    ],
    'vegetative': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 1, baseHours: 1.5, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 5, baseHours: 2, baseWorkers: 2 },
      { taskType: 'pruning', taskTypeName: '修剪', intervalDays: 7, baseHours: 2.5, baseWorkers: 2 },
    ],
    'flowering': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 1, baseHours: 1.5, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 5, baseHours: 2, baseWorkers: 2 },
      { taskType: 'plant_protection', taskTypeName: '植保', intervalDays: 7, baseHours: 2, baseWorkers: 2 },
    ],
    'fruiting': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 1, baseHours: 1.5, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 4, baseHours: 2, baseWorkers: 2 },
      { taskType: 'plant_protection', taskTypeName: '植保', intervalDays: 7, baseHours: 2, baseWorkers: 2 },
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 1, baseHours: 4, baseWorkers: 3 },
    ],
    'harvest': [
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 1, baseHours: 5, baseWorkers: 4 },
    ],
  },
  '西瓜': {
    'seedling': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 7, baseHours: 2, baseWorkers: 1 },
    ],
    'vegetative': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1.5, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 5, baseHours: 2.5, baseWorkers: 2 },
      { taskType: 'pruning', taskTypeName: '修剪', intervalDays: 7, baseHours: 3, baseWorkers: 2 },
    ],
    'flowering': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1.5, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 5, baseHours: 2.5, baseWorkers: 2 },
      { taskType: 'plant_protection', taskTypeName: '植保', intervalDays: 7, baseHours: 2, baseWorkers: 2 },
    ],
    'fruiting': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 2, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 5, baseHours: 2.5, baseWorkers: 2 },
      { taskType: 'plant_protection', taskTypeName: '植保', intervalDays: 7, baseHours: 2, baseWorkers: 2 },
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 2, baseHours: 4, baseWorkers: 3 },
    ],
    'harvest': [
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 1, baseHours: 5, baseWorkers: 4 },
    ],
  },
  '甜瓜': {
    'seedling': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 7, baseHours: 2, baseWorkers: 1 },
    ],
    'vegetative': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1.5, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 5, baseHours: 2, baseWorkers: 2 },
      { taskType: 'pruning', taskTypeName: '修剪', intervalDays: 7, baseHours: 2.5, baseWorkers: 2 },
    ],
    'flowering': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1.5, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 5, baseHours: 2, baseWorkers: 2 },
      { taskType: 'plant_protection', taskTypeName: '植保', intervalDays: 7, baseHours: 2, baseWorkers: 2 },
    ],
    'fruiting': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1.5, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 5, baseHours: 2, baseWorkers: 2 },
      { taskType: 'plant_protection', taskTypeName: '植保', intervalDays: 7, baseHours: 2, baseWorkers: 2 },
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 2, baseHours: 4, baseWorkers: 3 },
    ],
    'harvest': [
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 1, baseHours: 5, baseWorkers: 4 },
    ],
  },
  '生菜': {
    'seedling': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 1, baseHours: 0.5, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 7, baseHours: 1.5, baseWorkers: 1 },
    ],
    'vegetative': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 1, baseHours: 0.8, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 5, baseHours: 1.5, baseWorkers: 1 },
      { taskType: 'weeding', taskTypeName: '除草', intervalDays: 10, baseHours: 1.5, baseWorkers: 1 },
    ],
    'harvest': [
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 1, baseHours: 3, baseWorkers: 2 },
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 1, baseHours: 0.5, baseWorkers: 1 },
    ],
  },
  '菠菜': {
    'seedling': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 0.5, baseWorkers: 1 },
    ],
    'vegetative': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 1, baseHours: 0.5, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 7, baseHours: 1, baseWorkers: 1 },
    ],
    'harvest': [
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 1, baseHours: 2.5, baseWorkers: 2 },
    ],
  },
  '白菜': {
    'seedling': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 0.5, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 7, baseHours: 1.5, baseWorkers: 1 },
    ],
    'vegetative': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 1, baseHours: 0.8, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 5, baseHours: 2, baseWorkers: 1 },
      { taskType: 'weeding', taskTypeName: '除草', intervalDays: 10, baseHours: 1.5, baseWorkers: 1 },
    ],
    'harvest': [
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 1, baseHours: 3, baseWorkers: 2 },
    ],
  },
  '油菜': {
    'seedling': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 0.5, baseWorkers: 1 },
    ],
    'vegetative': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 1, baseHours: 0.5, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 7, baseHours: 1.5, baseWorkers: 1 },
    ],
    'harvest': [
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 1, baseHours: 2.5, baseWorkers: 2 },
    ],
  },
  '甘蓝': {
    'seedling': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 0.5, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 7, baseHours: 1.5, baseWorkers: 1 },
    ],
    'vegetative': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 5, baseHours: 2, baseWorkers: 1 },
      { taskType: 'weeding', taskTypeName: '除草', intervalDays: 10, baseHours: 1.5, baseWorkers: 1 },
    ],
    'harvest': [
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 1, baseHours: 3.5, baseWorkers: 2 },
    ],
  },
  '豆角': {
    'seedling': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 7, baseHours: 1.5, baseWorkers: 1 },
    ],
    'vegetative': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 5, baseHours: 2, baseWorkers: 1 },
      { taskType: 'pruning', taskTypeName: '修剪', intervalDays: 10, baseHours: 2, baseWorkers: 1 },
    ],
    'flowering': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 5, baseHours: 2, baseWorkers: 1 },
      { taskType: 'plant_protection', taskTypeName: '植保', intervalDays: 7, baseHours: 1.5, baseWorkers: 2 },
    ],
    'fruiting': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1, baseWorkers: 1 },
      { taskType: 'plant_protection', taskTypeName: '植保', intervalDays: 7, baseHours: 1.5, baseWorkers: 2 },
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 1, baseHours: 3, baseWorkers: 2 },
    ],
    'harvest': [
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 1, baseHours: 4, baseWorkers: 3 },
    ],
  },
  '豌豆': {
    'seedling': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 0.5, baseWorkers: 1 },
    ],
    'vegetative': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 0.8, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 7, baseHours: 1.5, baseWorkers: 1 },
    ],
    'flowering': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 0.8, baseWorkers: 1 },
      { taskType: 'plant_protection', taskTypeName: '植保', intervalDays: 7, baseHours: 1.5, baseWorkers: 1 },
    ],
    'harvest': [
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 1, baseHours: 3, baseWorkers: 2 },
    ],
  },
  '萝卜': {
    'seedling': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 0.5, baseWorkers: 1 },
    ],
    'vegetative': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 7, baseHours: 1.5, baseWorkers: 1 },
      { taskType: 'weeding', taskTypeName: '除草', intervalDays: 10, baseHours: 1.5, baseWorkers: 1 },
    ],
    'harvest': [
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 1, baseHours: 3, baseWorkers: 2 },
    ],
  },
  '胡萝卜': {
    'seedling': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 0.5, baseWorkers: 1 },
    ],
    'vegetative': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 0.8, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 7, baseHours: 1.5, baseWorkers: 1 },
    ],
    'harvest': [
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 1, baseHours: 3.5, baseWorkers: 2 },
    ],
  },
  '土豆': {
    'seedling': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 3, baseHours: 0.5, baseWorkers: 1 },
    ],
    'vegetative': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 7, baseHours: 2, baseWorkers: 1 },
      { taskType: 'weeding', taskTypeName: '除草', intervalDays: 10, baseHours: 1.5, baseWorkers: 1 },
    ],
    'harvest': [
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 1, baseHours: 4, baseWorkers: 3 },
    ],
  },
  '水稻': {
    'seedling': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 7, baseHours: 2, baseWorkers: 2 },
    ],
    'vegetative': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1.5, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 7, baseHours: 2.5, baseWorkers: 2 },
      { taskType: 'weeding', taskTypeName: '除草', intervalDays: 10, baseHours: 2, baseWorkers: 2 },
    ],
    'flowering': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1.5, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 7, baseHours: 2, baseWorkers: 2 },
    ],
    'harvest': [
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 1, baseHours: 5, baseWorkers: 4 },
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 3, baseHours: 1, baseWorkers: 1 },
    ],
  },
  '小麦': {
    'seedling': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 3, baseHours: 1, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 10, baseHours: 2, baseWorkers: 2 },
    ],
    'vegetative': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 3, baseHours: 1, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 10, baseHours: 2.5, baseWorkers: 2 },
      { taskType: 'plant_protection', taskTypeName: '植保', intervalDays: 14, baseHours: 2, baseWorkers: 2 },
    ],
    'harvest': [
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 1, baseHours: 5, baseWorkers: 4 },
    ],
  },
  '玉米': {
    'seedling': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 3, baseHours: 1, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 10, baseHours: 2, baseWorkers: 2 },
    ],
    'vegetative': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1.5, baseWorkers: 1 },
      { taskType: 'fertilization', taskTypeName: '施肥', intervalDays: 7, baseHours: 2.5, baseWorkers: 2 },
      { taskType: 'weeding', taskTypeName: '除草', intervalDays: 14, baseHours: 2, baseWorkers: 2 },
    ],
    'flowering': [
      { taskType: 'irrigation', taskTypeName: '灌溉', intervalDays: 2, baseHours: 1.5, baseWorkers: 1 },
      { taskType: 'plant_protection', taskTypeName: '植保', intervalDays: 10, baseHours: 2, baseWorkers: 2 },
    ],
    'harvest': [
      { taskType: 'harvest', taskTypeName: '采收', intervalDays: 1, baseHours: 5, baseWorkers: 4 },
    ],
  },
}

/** 默认配置（当作物没有特定配置时使用） */
/** @type {StageTaskConfig} */
const DEFAULT_TASK_CONFIG = {
  taskType: 'irrigation',
  taskTypeName: '灌溉',
  intervalDays: 2,
  baseHours: 1.5,
  baseWorkers: 1,
}

// ============================================
// 内部数据：成本配置（V1.1 1:1 移植）
// ============================================
/** 成本配置 - 1:1 翻译自 V1.1 src/data/costConfig.ts */
const COST_CONFIG = {
  /** 默认人工费率（元/小时） */
  LABOR_RATE_PER_HOUR: 15,
  /** 工具成本比例（按物资成本的百分比估算磨损） */
  TOOL_COST_RATIO: 0.1,
}

// ============================================
// 内部依赖：useLocalStorage tuple 形式封装
// ============================================
// 注：V1.1 中 useMonthlyTaskPlanning 通过 React hook 形式 `[value, setter] = useLocalStorage(key, default)` 读取。
// V2.0 中 src/composables/useLocalStorage.js 仅导出工具函数 loadFromStorage/saveToStorage，
// 此处按 V1.1 tuple 行为进行最小封装：返回 [ref, setter]。
// setter 支持函数式更新（与 V1.1 useCallback 闭包行为 1:1）。

/**
 * localStorage tuple 形式封装
 * @template T
 * @param {string} key
 * @param {T} initialValue
 * @returns {[import('vue').Ref<T>, (value: T | ((val: T) => T)) => void]}
 */
function useLocalStorageTuple(key, initialValue) {
  const stored = loadFromStorage(key, initialValue)
  const valueRef = ref(stored !== undefined && stored !== null ? stored : initialValue)

  /**
   * @param {T | ((val: T) => T)} value
   */
  function setValue(value) {
    const valueToStore = typeof value === 'function' ? value(valueRef.value) : value
    valueRef.value = valueToStore
    saveToStorage(key, valueToStore)
  }

  return [valueRef, setValue]
}

// ============================================
// 工具函数（1:1 翻译 V1.1）
// ============================================

/**
 * 获取月份结束日期
 * 1:1 翻译自 V1.1 getMonthEndDate
 * @param {string} month YYYY-MM
 * @returns {string} YYYY-MM-DD
 */
function getMonthEndDate(month) {
  const parts = month.split('-').map(Number)
  const year = parts[0]
  const m = parts[1]
  const lastDay = new Date(year, m, 0).getDate()
  return `${month}-${String(lastDay).padStart(2, '0')}`
}

/**
 * 获取指定日期是当年的第几周
 * 1:1 翻译自 V1.1 getWeekNumber
 * @param {Date} date
 * @returns {number}
 */
function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

/**
 * 获取日期所在周的开始日期（周一）
 * 1:1 翻译自 V1.1 getWeekStartDate
 * @param {Date} date
 * @returns {Date}
 */
function getWeekStartDate(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

/**
 * 生成唯一ID
 * 1:1 翻译自 V1.1 generateId
 * @returns {string}
 */
function generateId() {
  return `PRED_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

// ============================================
// 任务预测核心逻辑（1:1 翻译 V1.1 predictTasksForBatchAndDate）
// ============================================

/**
 * 根据批次预测指定日期的任务
 * @param {CropBatch} batch
 * @param {string} dateStr
 * @param {Record<string, string>} lastTaskDates
 * @returns {PredictedTask[]}
 */
function predictTasksForBatchAndDate(batch, dateStr, lastTaskDates) {
  /** @type {PredictedTask[]} */
  const tasks = []
  const stageConfig = (CROP_STAGE_TASK_CONFIG[batch.cropName] && CROP_STAGE_TASK_CONFIG[batch.cropName][batch.stage])

  if (!stageConfig) {
    // 使用默认配置（V1.1 行为：把单条对象包成数组遍历）
    const defaultConfig = [DEFAULT_TASK_CONFIG]
    for (const config of defaultConfig) {
      const lastDate = lastTaskDates[`${batch.id}_${config.taskType}`]
      const daysSinceLastTask = lastDate
        ? Math.floor((new Date(dateStr).getTime() - new Date(lastDate).getTime()) / 86400000)
        : config.intervalDays

      if (daysSinceLastTask >= config.intervalDays) {
        const taskId = generateId()
        tasks.push({
          id: taskId,
          batchId: batch.id,
          batchCode: batch.batchCode,
          cropName: batch.cropName,
          greenhouseId: batch.greenhouseId,
          greenhouseName: batch.greenhouseName,
          plantingArea: batch.plantingArea,
          stage: batch.stage,
          stageName: batch.stageName,
          taskType: config.taskType,
          taskTypeName: config.taskTypeName,
          suggestedDate: dateStr,
          estimatedHours: config.baseHours * Math.ceil(batch.plantingArea / 100),
          estimatedWorkers: config.baseWorkers,
          priority: 'medium',
          urgency: 'normal',
          reason: `根据生长阶段例行任务`,
          isOverdue: daysSinceLastTask > config.intervalDays * 1.5,
          daysSinceLastTask,
          intervalDays: config.intervalDays,
        })
      }
    }
    return tasks
  }

  // 遍历该生长阶段的所有任务配置
  for (const config of stageConfig) {
    const lastDate = lastTaskDates[`${batch.id}_${config.taskType}`]
    const daysSinceLastTask = lastDate
      ? Math.floor((new Date(dateStr).getTime() - new Date(lastDate).getTime()) / 86400000)
      : config.intervalDays

    // 判断是否应该执行该任务
    if (daysSinceLastTask >= config.intervalDays) {
      const taskId = generateId()

      // 根据面积计算实际工时和人数
      const areaFactor = Math.ceil(batch.plantingArea / 100)
      const estimatedHours = config.baseHours * areaFactor
      const estimatedWorkers = Math.max(1, Math.min(config.baseWorkers, Math.ceil(areaFactor / 2)))

      // 判断优先级和紧急程度
      let priority = /** @type {'high'|'medium'|'low'} */ ('medium')
      let urgency = /** @type {'urgent'|'high'|'normal'} */ ('normal')

      if (daysSinceLastTask > config.intervalDays * 2) {
        priority = 'high'
        urgency = 'urgent'
      } else if (daysSinceLastTask > config.intervalDays * 1.5) {
        priority = 'medium'
        urgency = 'high'
      }

      tasks.push({
        id: taskId,
        batchId: batch.id,
        batchCode: batch.batchCode,
        cropName: batch.cropName,
        greenhouseId: batch.greenhouseId,
        greenhouseName: batch.greenhouseName,
        plantingArea: batch.plantingArea,
        stage: batch.stage,
        stageName: batch.stageName,
        taskType: config.taskType,
        taskTypeName: config.taskTypeName,
        suggestedDate: dateStr,
        estimatedHours,
        estimatedWorkers,
        priority,
        urgency,
        reason: `根据生长阶段例行任务，距上次${config.taskTypeName}已过${daysSinceLastTask}天`,
        isOverdue: daysSinceLastTask > config.intervalDays * 1.5,
        daysSinceLastTask,
        intervalDays: config.intervalDays,
      })
    }
  }

  return tasks
}

// ============================================
// useMonthlyTaskPlanning Composable
// ============================================

/**
 * 月度任务规划 composable
 * 1:1 翻译自 V1.1 useMonthlyTaskPlanning
 * @returns {{
 *   generateMonthlyPlan: (month: string, batchIds: string[]) => MonthlyPlan,
 *   aggregateByWeek: (tasks: PredictedTask[], startDate: string, endDate: string) => WeeklySummary[],
 *   analyzeMaterialRequirements: (tasks: PredictedTask[]) => MaterialRequirement[],
 *   analyzeToolRequirements: (tasks: PredictedTask[]) => ToolRequirement[],
 *   analyzeWorkerRequirements: (tasks: PredictedTask[]) => WorkerRequirement[],
 *   estimateCost: (tasks: PredictedTask[], materialRequirements: MaterialRequirement[]) => CostBreakdown,
 *   predictTasks: (startDate: string, endDate: string, batches: CropBatch[]) => PredictedTask[],
 *   getLastTaskDates: () => Record<string, string>,
 *   saveLastTaskDate: (batchId: string, taskType: string, date: string) => void
 * }}
 */
export function useMonthlyTaskPlanning() {
  // 响应式订阅生产计划 Store 数据
  // V1.1: useProductionPlanStore((state) => state.plans)
  // V2.0: 用 computed 包装保证响应性（与 useDailyTaskPlanning.js 一致）
  const productionPlanStore = useProductionPlanStore()
  const storeBatches = computed(() => productionPlanStore.plans || [])

  // 月度计划 Store（持久化到服务器）
  const monthlyPlanStore = useMonthlyPlanningStore()

  // 使用 localStorage 存储上次任务执行日期
  // 1:1 翻译 V1.1 useLocalStorage('yuanxingtu_monthly_planning_last_tasks', {})
  const [lastTaskDates, setLastTaskDates] = useLocalStorageTuple(
    'yuanxingtu_monthly_planning_last_tasks',
    {}
  )

  // 初始化时从服务器获取月度计划
  // 1:1 翻译 V1.1 useEffect(() => { monthlyPlanStore.fetchPlans(); }, [])
  onMounted(() => {
    monthlyPlanStore.fetchPlans()
  })

  // ============================================
  // 预测任务
  // 1:1 翻译 V1.1 predictTasks
  // ============================================
  /**
   * @param {string} startDate
   * @param {string} endDate
   * @param {CropBatch[]} batches
   * @returns {PredictedTask[]}
   */
  function predictTasks(startDate, endDate, batches) {
    /** @type {PredictedTask[]} */
    const allTasks = []
    const currentDate = new Date(startDate)
    const endDateObj = new Date(endDate)

    // 只处理执行中或已发布的批次
    // 修复 P0-2: 与 view 端过滤条件一致（去掉冗余的 status 字段判断）
    const activeBatches = batches.filter(
      b => b.batchStatus === 'in_progress' || b.batchStatus === 'published'
    )

    while (currentDate <= endDateObj) {
      const dateStr = currentDate.toISOString().split('T')[0]

      // 遍历每个活跃批次，预测该日期的任务
      for (const batch of activeBatches) {
        const tasks = predictTasksForBatchAndDate(batch, dateStr, lastTaskDates.value)
        allTasks.push(...tasks)
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return allTasks
  }

  // ============================================
  // 按周汇总
  // 1:1 翻译 V1.1 aggregateByWeek
  // ============================================
  /**
   * @param {PredictedTask[]} tasks
   * @param {string} startDate
   * @param {string} endDate
   * @returns {WeeklySummary[]}
   */
  function aggregateByWeek(tasks, startDate, endDate) {
    /** @type {Record<number, WeeklySummary>} */
    const weeklyMap = {}

    // 遍历日期范围，初始化每周汇总
    const currentDate = new Date(startDate)
    const endDateObj = new Date(endDate)

    while (currentDate <= endDateObj) {
      const weekNum = getWeekNumber(currentDate)
      const weekStart = getWeekStartDate(currentDate)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      if (!weeklyMap[weekNum]) {
        weeklyMap[weekNum] = {
          weekNumber: weekNum,
          startDate: weekStart.toISOString().split('T')[0],
          endDate: weekEnd.toISOString().split('T')[0],
          taskCount: 0,
          totalHours: 0,
          keyCrops: [],
          keyTasks: [],
          requiredWorkers: 0,
        }
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    // 汇总任务到对应周
    /** @type {Record<number, Record<string, number>>} */
    const cropCountMap = {}
    /** @type {Record<number, Record<string, number>>} */
    const taskCountMap = {}

    for (const task of tasks) {
      const taskDate = new Date(task.suggestedDate)
      const weekNum = getWeekNumber(taskDate)
      const weekSummary = weeklyMap[weekNum]

      if (weekSummary) {
        weekSummary.taskCount++
        weekSummary.totalHours += task.estimatedHours
        weekSummary.requiredWorkers += task.estimatedWorkers

        // 记录作物和任务类型计数
        if (!cropCountMap[weekNum]) cropCountMap[weekNum] = {}
        if (!taskCountMap[weekNum]) taskCountMap[weekNum] = {}

        cropCountMap[weekNum][task.cropName] = (cropCountMap[weekNum][task.cropName] || 0) + 1
        taskCountMap[weekNum][task.taskTypeName] = (taskCountMap[weekNum][task.taskTypeName] || 0) + 1
      }
    }

    // 生成关键作物和关键任务列表
    for (const [weekNum, summary] of Object.entries(weeklyMap)) {
      const num = Number(weekNum)
      const crops = cropCountMap[num] || {}
      const tasks_map = taskCountMap[num] || {}

      // 取数量最多的3种作物
      summary.keyCrops = Object.entries(crops)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([crop]) => crop)

      // 取数量最多的3种任务类型
      summary.keyTasks = Object.entries(tasks_map)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([taskType]) => taskType)
    }

    return Object.values(weeklyMap).sort((a, b) => a.weekNumber - b.weekNumber)
  }

  // ============================================
  // 物资需求分析
  // 1:1 翻译 V1.1 analyzeMaterialRequirements
  // ============================================
  /**
   * @param {PredictedTask[]} tasks
   * @returns {MaterialRequirement[]}
   */
  function analyzeMaterialRequirements(tasks) {
    /** @type {Record<string, MaterialRequirement>} */
    const materialMap = {}

    for (const task of tasks) {
      const area = task.plantingArea

      if (task.taskType === 'fertilization') {
        // 施肥：每10m²需要1kg复合肥
        const quantity = Math.ceil(area / 10)
        const key = '复合肥'
        if (!materialMap[key]) {
          materialMap[key] = {
            materialName: '复合肥',
            specification: 'NPK含量45%',
            quantity: 0,
            unit: 'kg',
            estimatedUnitPrice: 3.5,
            estimatedTotalPrice: 0,
          }
        }
        materialMap[key].quantity += quantity
      }

      if (task.taskType === 'plant_protection' || task.taskType === 'pesticide') {
        // 植保：每20m²需要1L农药
        const quantity = Math.ceil(area / 20)
        const key = '农药'
        if (!materialMap[key]) {
          materialMap[key] = {
            materialName: '农药',
            specification: '高效低毒',
            quantity: 0,
            unit: 'L',
            estimatedUnitPrice: 25,
            estimatedTotalPrice: 0,
          }
        }
        materialMap[key].quantity += quantity
      }

      if (task.taskType === 'irrigation') {
        // 灌溉：每2m²需要1m³水
        const quantity = Math.ceil(area / 2)
        const key = '灌溉水'
        if (!materialMap[key]) {
          materialMap[key] = {
            materialName: '灌溉水',
            specification: '清洁水源',
            quantity: 0,
            unit: 'm³',
            estimatedUnitPrice: 0.5,
            estimatedTotalPrice: 0,
          }
        }
        materialMap[key].quantity += quantity
      }
    }

    // 计算总价
    for (const material of Object.values(materialMap)) {
      material.estimatedTotalPrice = material.quantity * material.estimatedUnitPrice
    }

    return Object.values(materialMap).sort((a, b) => b.estimatedTotalPrice - a.estimatedTotalPrice)
  }

  // ============================================
  // 工具需求分析
  // 1:1 翻译 V1.1 analyzeToolRequirements
  // ============================================
  /**
   * @param {PredictedTask[]} tasks
   * @returns {ToolRequirement[]}
   */
  function analyzeToolRequirements(tasks) {
    /** @type {Record<string, ToolRequirement>} */
    const toolMap = {}

    for (const task of tasks) {
      const area = task.plantingArea

      if (task.taskType === 'irrigation') {
        // 灌溉需要水管、喷头
        const key = '灌溉设备'
        if (!toolMap[key]) {
          toolMap[key] = {
            toolName: '灌溉设备',
            specification: '浇水壶/水管',
            quantity: 0,
            unit: '套',
            estimatedUnitPrice: 15,
            estimatedTotalPrice: 0,
          }
        }
        toolMap[key].quantity += Math.ceil(area / 100)
      }

      if (task.taskType === 'fertilization') {
        // 施肥需要施肥器
        const key = '施肥器'
        if (!toolMap[key]) {
          toolMap[key] = {
            toolName: '施肥器',
            specification: '手持式',
            quantity: 0,
            unit: '个',
            estimatedUnitPrice: 20,
            estimatedTotalPrice: 0,
          }
        }
        toolMap[key].quantity += Math.ceil(area / 100)
      }

      if (task.taskType === 'plant_protection' || task.taskType === 'pesticide') {
        // 植保需要喷雾器
        const key = '喷雾器'
        if (!toolMap[key]) {
          toolMap[key] = {
            toolName: '喷雾器',
            specification: '背负式',
            quantity: 0,
            unit: '台',
            estimatedUnitPrice: 80,
            estimatedTotalPrice: 0,
          }
        }
        toolMap[key].quantity += Math.ceil(area / 200)
      }

      if (task.taskType === 'pruning') {
        // 修剪需要剪刀
        const key = '修剪剪刀'
        if (!toolMap[key]) {
          toolMap[key] = {
            toolName: '修剪剪刀',
            specification: '园艺专用',
            quantity: 0,
            unit: '把',
            estimatedUnitPrice: 35,
            estimatedTotalPrice: 0,
          }
        }
        toolMap[key].quantity += Math.ceil(area / 100)
      }

      if (task.taskType === 'harvest') {
        // 采收需要篮子、剪刀
        const basketKey = '采收篮'
        if (!toolMap[basketKey]) {
          toolMap[basketKey] = {
            toolName: '采收篮',
            specification: '塑料周转箱',
            quantity: 0,
            unit: '个',
            estimatedUnitPrice: 25,
            estimatedTotalPrice: 0,
          }
        }
        toolMap[basketKey].quantity += Math.ceil(area / 50)

        const scissorsKey = '采摘剪刀'
        if (!toolMap[scissorsKey]) {
          toolMap[scissorsKey] = {
            toolName: '采摘剪刀',
            specification: '水果专用',
            quantity: 0,
            unit: '把',
            estimatedUnitPrice: 18,
            estimatedTotalPrice: 0,
          }
        }
        toolMap[scissorsKey].quantity += Math.ceil(area / 100)
      }
    }

    // 计算总价
    for (const tool of Object.values(toolMap)) {
      tool.estimatedTotalPrice = tool.quantity * tool.estimatedUnitPrice
    }

    return Object.values(toolMap).sort((a, b) => b.estimatedTotalPrice - a.estimatedTotalPrice)
  }

  // ============================================
  // 人员需求分析
  // 1:1 翻译 V1.1 analyzeWorkerRequirements
  // ============================================
  /**
   * @param {PredictedTask[]} tasks
   * @returns {WorkerRequirement[]}
   */
  function analyzeWorkerRequirements(tasks) {
    // 按技能类型汇总
    /** @type {Record<string, WorkerRequirement>} */
    const skillMap = {}

    // 任务类型到技能的映射
    /** @type {Record<string, { role: string, skill: string }>} */
    const taskTypeToSkill = {
      'irrigation': { role: '浇水工', skill: '浇水灌溉' },
      'fertilization': { role: '施肥工', skill: '施肥作业' },
      'plant_protection': { role: '植保工', skill: '病虫害防治' },
      'pesticide': { role: '植保工', skill: '打药操作' },
      'pruning': { role: '修剪工', skill: '修剪整枝' },
      'harvest': { role: '采收工', skill: '采摘技能' },
      'weeding': { role: '除草工', skill: '除草作业' },
    }

    for (const task of tasks) {
      const mapping = taskTypeToSkill[task.taskType] || { role: '杂工', skill: '基础农活' }
      const key = mapping.skill

      if (!skillMap[key]) {
        skillMap[key] = {
          role: mapping.role,
          skill: key,
          requiredCount: 0,
          estimatedHours: 0,
        }
      }

      skillMap[key].requiredCount += task.estimatedWorkers
      skillMap[key].estimatedHours += task.estimatedHours * task.estimatedWorkers
    }

    return Object.values(skillMap).sort((a, b) => b.estimatedHours - a.estimatedHours)
  }

  // ============================================
  // 成本预估
  // 1:1 翻译 V1.1 estimateCost
  // ============================================
  /**
   * @param {PredictedTask[]} tasks
   * @param {MaterialRequirement[]} materialRequirements
   * @returns {CostBreakdown}
   */
  function estimateCost(tasks, materialRequirements) {
    // 物资成本
    const materialCost = materialRequirements.reduce((sum, m) => sum + m.estimatedTotalPrice, 0)

    // 工具成本（按物资成本的比例估算磨损）
    const toolCost = materialCost * COST_CONFIG.TOOL_COST_RATIO

    // 人工成本（按配置的人工费率计算）
    const laborCost = tasks.reduce((sum, t) => sum + t.estimatedHours * COST_CONFIG.LABOR_RATE_PER_HOUR, 0)

    return {
      materialCost: Math.round(materialCost * 100) / 100,
      toolCost: Math.round(toolCost * 100) / 100,
      laborCost: Math.round(laborCost * 100) / 100,
      total: Math.round((materialCost + toolCost + laborCost) * 100) / 100,
    }
  }

  // ============================================
  // 生成月度计划
  // 1:1 翻译 V1.1 generateMonthlyPlan
  // ============================================
  /**
   * @param {string} month YYYY-MM
   * @param {string[]} batchIds
   * @returns {MonthlyPlan}
   */
  function generateMonthlyPlan(month, batchIds) {
    const startDate = `${month}-01`
    const endDate = getMonthEndDate(month)

    // 使用响应式订阅的批次数据
    const batches = storeBatches.value || []

    // 过滤指定批次的执行中/已发布批次
    const targetBatches = batchIds.length > 0
      ? batches.filter(b => batchIds.includes(b.id))
      : batches.filter(b => b.batchStatus === 'in_progress' || b.batchStatus === 'published')

    // 预测未来30天任务
    const allTasks = predictTasks(startDate, endDate, targetBatches)

    // 按周汇总
    const weeklySummaries = aggregateByWeek(allTasks, startDate, endDate)

    // 物资需求分析
    const materialRequirements = analyzeMaterialRequirements(allTasks)

    // 工具需求分析
    const toolRequirements = analyzeToolRequirements(allTasks)

    // 人员需求分析
    const workerRequirements = analyzeWorkerRequirements(allTasks)

    // 成本预估
    const costBreakdown = estimateCost(allTasks, materialRequirements)

    // 按日期分组生成日计划
    /** @type {Record<string, DailyPlan>} */
    const dailyPlans = {}
    /** @type {Record<string, PredictedTask[]>} */
    const dailyTasksMap = {}

    for (const task of allTasks) {
      if (!dailyTasksMap[task.suggestedDate]) {
        dailyTasksMap[task.suggestedDate] = []
      }
      dailyTasksMap[task.suggestedDate].push(task)
    }

    for (const [date, dailyTasks] of Object.entries(dailyTasksMap)) {
      dailyPlans[date] = {
        date,
        tasks: dailyTasks,
        totalTasks: dailyTasks.length,
        totalHours: dailyTasks.reduce((sum, t) => sum + t.estimatedHours, 0),
        requiredWorkers: dailyTasks.reduce((sum, t) => sum + t.estimatedWorkers, 0),
      }
    }

    // 任务类型分布统计
    /** @type {Record<string, number>} */
    const taskTypeBreakdown = {}
    for (const task of allTasks) {
      taskTypeBreakdown[task.taskType] = (taskTypeBreakdown[task.taskType] || 0) + 1
    }

    /** @type {MonthlyPlan} */
    const plan = {
      month,
      batches: batchIds,
      totalTasks: allTasks.length,
      totalHours: allTasks.reduce((sum, t) => sum + t.estimatedHours, 0),
      totalCost: costBreakdown.total,
      weeklySummaries,
      taskTypeBreakdown,
      dailyPlans,
      materialRequirements,
      toolRequirements,
      workerRequirements,
      costBreakdown,
      generatedAt: new Date().toISOString(),
      generatedBy: 'AI Planning Engine',
      planningHorizon: 'monthly',
    }

    // 保存到服务器
    monthlyPlanStore.savePlan(month, plan)

    return plan
  }

  // ============================================
  // 保存任务执行日期记录
  // 1:1 翻译 V1.1 saveLastTaskDate
  // ============================================
  /**
   * @param {string} batchId
   * @param {string} taskType
   * @param {string} date
   */
  function saveLastTaskDate(batchId, taskType, date) {
    const key = `${batchId}_${taskType}`
    setLastTaskDates(prev => ({
      ...prev,
      [key]: date,
    }))
  }

  // ============================================
  // 获取上次任务执行日期
  // 1:1 翻译 V1.1 getLastTaskDates
  // ============================================
  /**
   * @returns {Record<string, string>}
   */
  function getLastTaskDates() {
    return lastTaskDates.value
  }

  return {
    generateMonthlyPlan,
    aggregateByWeek,
    analyzeMaterialRequirements,
    analyzeToolRequirements,
    analyzeWorkerRequirements,
    estimateCost,
    predictTasks,
    getLastTaskDates,
    saveLastTaskDate,
  }
}
