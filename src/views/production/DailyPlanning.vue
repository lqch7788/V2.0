<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="20" class="text-white"><Calendar /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">每日工单汇总与规划</h1>
          <p class="text-sm text-gray-500">每日任务进度与人员负荷分析</p>
        </div>
      </div>
    </div>

    <!-- 日期选择和操作按钮 -->
    <div class="bg-[#F2F6FA] rounded-xl shadow-sm border border-gray-100 p-4">
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">选择日期:</span>
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              <!-- 修复 P0-2: 删除 @change 避免与 watch 双触发 -->
            />
          </div>
          <el-button @click="handleRefresh" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
        <el-button
          type="primary"
          :disabled="!todayPlan.tasks || todayPlan.tasks.length === 0"
          :loading="dispatching"
          @click="handleConfirmDispatch"
        >
          <el-icon><Promotion /></el-icon>
          一键确认派发 ({{ todayPlan.totalTasks || 0 }} 项)
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 - 5列 -->
    <div class="grid grid-cols-5 gap-3">
      <div v-for="stat in statsData" :key="stat.label" :class="[stat.bgColor, 'rounded-lg px-3 py-2.5']">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="16" :class="stat.iconColor"><component :is="stat.icon" /></el-icon>
          </div>
          <div>
            <div class="text-xl font-bold text-gray-900">{{ stat.value }}</div>
            <div class="text-xs text-gray-500">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI 建议 -->
    <div v-if="report && report.aiRecommendations && report.aiRecommendations.length > 0" class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
      <div class="flex items-center gap-2 mb-3">
        <el-icon :size="20" class="text-purple-600"><Cpu /></el-icon>
        <span class="font-semibold text-gray-900">AI 智能分析建议</span>
      </div>
      <div class="space-y-2">
        <div v-for="(item, index) in report.aiRecommendations" :key="index" class="flex items-start gap-2 text-sm text-gray-700">
          <span class="text-purple-500">•</span>
          <span>{{ item }}</span>
        </div>
      </div>
    </div>

    <!-- 子Tab切换 -->
    <div class="bg-white rounded-xl shadow-sm">
      <div class="border-b border-gray-200 px-4 py-3">
        <nav class="flex gap-2">
          <button
            v-for="tab in subTabs"
            :key="tab.key"
            @click="activeSubTab = tab.key"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            :class="activeSubTab === tab.key ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
          >
            <el-icon :size="16"><component :is="tab.icon" /></el-icon>
            {{ tab.label }}
            <span v-if="tab.count !== undefined">({{ tab.count }})</span>
          </button>
        </nav>
      </div>

      <div class="p-4">
        <!-- 任务概览 -->
        <div v-if="activeSubTab === 'overview' && report" class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">今日任务进度概览</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-emerald-700 font-medium">完成任务</span>
                <span class="text-2xl font-bold text-emerald-600">{{ report.completedTasks }}</span>
              </div>
              <div class="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-emerald-500 rounded-full transition-all"
                  :style="{ width: (report.totalTasks > 0 ? Math.round(report.completedTasks / report.totalTasks * 100) : 0) + '%' }"
                />
              </div>
              <div class="text-xs text-emerald-600 mt-1">共 {{ report.totalTasks }} 个任务</div>
            </div>
            <div :class="[report.overdueTasks > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100', 'rounded-lg p-4 border']">
              <div class="flex items-center justify-between mb-2">
                <span :class="['text-sm font-medium', report.overdueTasks > 0 ? 'text-red-700' : 'text-gray-700']">超期任务</span>
                <span :class="['text-2xl font-bold', report.overdueTasks > 0 ? 'text-red-600' : 'text-gray-600']">{{ report.overdueTasks }}</span>
              </div>
              <div v-if="report.overdueTasks > 0" class="text-xs text-red-600">需要及时处理</div>
            </div>
          </div>

          <!-- AI派工建议列表 -->
          <h3 class="text-lg font-semibold text-gray-900">AI 派工建议</h3>
          <div v-if="todayPlan.tasks && todayPlan.tasks.length > 0" class="bg-gray-50 rounded-lg border border-gray-100">
            <div v-for="(task, index) in todayPlan.tasks.slice(0, 5)" :key="index"
              class="flex items-center gap-3 p-3 border-b border-gray-100 last:border-b-0">
              <span :class="[
                'inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-sm font-semibold',
                task.priority === 'high' ? 'bg-red-500 text-gray-50' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              ]">
                {{ task.priority === 'high' ? '紧急' : task.priority === 'medium' ? '重要' : '普通' }}
              </span>
              <span class="font-medium text-gray-900">{{ task.taskTypeName }}</span>
              <span class="text-sm text-gray-500">- {{ task.greenhouseName }}</span>
              <template v-if="getSuggestion(task.id)">
                <span class="inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-sm font-semibold bg-blue-100 text-blue-800">
                  推荐: {{ getSuggestion(task.id).workerName }}
                </span>
                <span class="text-xs text-gray-400">置信度 {{ getSuggestion(task.id).confidenceScore }}%</span>
              </template>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">今日暂无待派发任务</div>
        </div>

        <!-- 提前完成 / 已推迟 / 未完成 - 共用任务进度表格 -->
        <div v-if="['ahead', 'delayed', 'unfinished'].includes(activeSubTab)">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 class="text-lg font-semibold text-gray-900">{{ subTableTitle }}</h3>
              <p class="text-sm text-gray-500 mt-0.5">{{ subTableDesc }}</p>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <th class="px-4 py-3 text-center text-sm font-semibold">任务名称</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">计划日期</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">实际完成</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">状态</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">延迟天数</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">执行人</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">延迟原因</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-300">
                  <tr v-for="item in paginatedSubTableData" :key="item.taskId" class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-sm font-medium text-gray-900 truncate max-w-[200px]">{{ item.taskName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500 text-center">{{ item.plannedDate }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500 text-center">{{ item.actualCompletionDate || '-' }}</td>
                    <td class="px-4 py-3 text-center">
                      <span :class="[
                        'inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-sm font-semibold',
                        item.progressStatus === 'ahead' ? 'bg-green-100 text-green-800' :
                        item.progressStatus === 'delayed' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-900'
                      ]">
                        {{ item.progressStatus === 'ahead' ? '提前完成' : item.progressStatus === 'delayed' ? '已推迟' : '已取消' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span v-if="item.delayDays" class="text-red-500 font-medium">{{ item.delayDays }}天</span>
                      <span v-else class="text-gray-400">-</span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-500 text-center">{{ item.actualAssignee }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500 truncate max-w-[150px]">{{ item.delayReason || '-' }}</td>
                  </tr>
                  <tr v-if="paginatedSubTableData.length === 0">
                    <td colspan="7" class="px-4 py-8 text-center text-gray-400">暂无数据</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="subTableDataTotal.length > subTablePageSize" class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span class="text-sm text-gray-500">共 {{ subTableDataTotal.length }} 条</span>
              <div class="flex items-center gap-2">
                <el-button :disabled="subTablePage <= 1" size="small" @click="subTablePage--">上一页</el-button>
                <span class="text-sm">{{ subTablePage }} / {{ Math.ceil(subTableDataTotal.length / subTablePageSize) }}</span>
                <el-button :disabled="subTablePage >= Math.ceil(subTableDataTotal.length / subTablePageSize)" size="small" @click="subTablePage++">下一页</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 人员负荷 -->
        <div v-if="activeSubTab === 'workers'">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 class="text-lg font-semibold text-gray-900">人员负荷分析</h3>
              <p class="text-sm text-gray-500 mt-0.5">各执行人员当前的工作负荷情况</p>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <th class="px-4 py-3 text-center text-sm font-semibold">员工姓名</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">今日任务数</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">已完成</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">完成率</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">负荷状态</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">可用性</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-300">
                  <tr v-for="item in paginatedWorkerData" :key="item.workerId" class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-sm font-medium text-gray-900 text-center">{{ item.workerName }}</td>
                    <td class="px-4 py-3 text-sm font-semibold text-gray-900 text-center">{{ item.todayTasks }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500 text-center">{{ item.completedTasks }} / {{ item.todayTasks }}</td>
                    <td class="px-4 py-3 text-center">
                      <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div :class="[
                          'h-full rounded-full',
                          item.completionRate >= 80 ? 'bg-emerald-500' : item.completionRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        ]" :style="{ width: item.completionRate + '%' }" />
                      </div>
                      <span class="text-xs text-gray-500">{{ item.completionRate }}%</span>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span :class="[
                        'inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-sm font-semibold',
                        item.loadStatus === 'normal' ? 'bg-green-100 text-green-800' :
                        item.loadStatus === 'busy' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-500 text-gray-50'
                      ]">
                        {{ item.loadStatus === 'normal' ? '正常' : item.loadStatus === 'busy' ? '较忙' : '过载' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span :class="[
                        'inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-sm font-semibold',
                        item.availability === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      ]">
                        {{ item.availability === 'available' ? '空闲' : '工作中' }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="paginatedWorkerData.length === 0">
                    <td colspan="6" class="px-4 py-8 text-center text-gray-400">暂无人员数据</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="workerLoadData.length > workerLoadPageSize" class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span class="text-sm text-gray-500">共 {{ workerLoadData.length }} 条</span>
              <div class="flex items-center gap-2">
                <el-button :disabled="workerLoadPage <= 1" size="small" @click="workerLoadPage--">上一页</el-button>
                <span class="text-sm">{{ workerLoadPage }} / {{ Math.ceil(workerLoadData.length / workerLoadPageSize) }}</span>
                <el-button :disabled="workerLoadPage >= Math.ceil(workerLoadData.length / workerLoadPageSize)" size="small" @click="workerLoadPage++">下一页</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 第二阶段 Y9 重构：每日工单分析函数抽 composable（798 → 600 行）
import { useDailyTaskAnalysis } from '@/composables/production/useDailyTaskAnalysis'
const {
  isTaskOverdue,
  calculateOverdueDays,
  isCompletedAhead,
  isCompletedOnTime,
  generateAIRecommendations,
  generateDailyReport,
} = useDailyTaskAnalysis()

import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Calendar, Refresh, Promotion, Cpu,
  Clock, CircleCheck, WarningFilled, Files
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { useTasks } from '@/composables/useTasks'
import { useProductionPlanStore } from '@/stores/modules/productionPlan'
import { useDailyPlanningStore } from '@/stores/modules/dailyPlanning'
import { useFarmTaskStore } from '@/stores/modules/farmTask'
import { useTempTaskStore } from '@/stores/modules/tempTask'

// ============================================
// 类型定义
// ============================================
/**
 * @typedef {Object} TaskProgressAnalysis
 * @property {string} taskId
 * @property {string} taskName
 * @property {string} plannedDate
 * @property {string} [actualCompletionDate]
 * @property {'on_track'|'ahead'|'delayed'|'cancelled'} progressStatus
 * @property {number} [delayDays]
 * @property {string} [delayReason]
 * @property {string} [actualAssignee]
 */

/**
 * @typedef {Object} WorkerLoadAnalysis
 * @property {string} workerId
 * @property {string} workerName
 * @property {number} todayTasks
 * @property {number} completedTasks
 * @property {number} completionRate
 * @property {'normal'|'busy'|'overloaded'} loadStatus
 * @property {'available'|'busy'} availability
 */

/**
 * @typedef {Object} DailyWorkOrderReport
 * @property {string} date
 * @property {number} totalTasks
 * @property {number} pendingTasks
 * @property {number} inProgressTasks
 * @property {number} completedTasks
 * @property {number} overdueTasks
 * @property {TaskProgressAnalysis[]} aheadTasks
 * @property {TaskProgressAnalysis[]} delayedTasks
 * @property {TaskProgressAnalysis[]} unfinishedTasks
 * @property {WorkerLoadAnalysis[]} workerLoadAnalysis
 * @property {string[]} aiRecommendations
 */


// ============================================
// 状态
// ============================================
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const report = ref(null)
const todayPlan = ref({ tasks: [], totalTasks: 0, workerSuggestions: [] })
const activeSubTab = ref('overview')
const loading = ref(false)
const dispatching = ref(false)

// 子表分页
const subTablePage = ref(1)
const subTablePageSize = ref(10)
const workerLoadPage = ref(1)
const workerLoadPageSize = ref(10)

// Stores
const productionPlanStore = useProductionPlanStore()
const dailyPlanStore = useDailyPlanningStore()
const farmTaskStore = useFarmTaskStore()
const tempTaskStore = useTempTaskStore()

// ============================================
// 计算属性
// ============================================
const statsData = computed(() => {
  if (!report.value) return []
  return [
    { label: '总任务数', value: report.value.totalTasks || 0, icon: Files, bgColor: 'bg-blue-50 border border-blue-200', iconColor: 'text-blue-500' },
    { label: '待处理', value: report.value.pendingTasks || 0, icon: Clock, bgColor: 'bg-orange-50 border border-orange-200', iconColor: 'text-orange-500' },
    { label: '进行中', value: report.value.inProgressTasks || 0, icon: WarningFilled, bgColor: 'bg-indigo-50 border border-indigo-200', iconColor: 'text-indigo-500' },
    { label: '已完成', value: report.value.completedTasks || 0, icon: CircleCheck, bgColor: 'bg-green-50 border border-green-200', iconColor: 'text-green-500' },
    { label: '已超期', value: report.value.overdueTasks || 0, icon: WarningFilled, bgColor: 'bg-red-50 border border-red-200', iconColor: 'text-red-500' },
  ]
})

const subTabs = computed(() => [
  { key: 'overview', label: '任务概览', icon: Calendar, count: undefined },
  { key: 'ahead', label: '提前完成', icon: CircleCheck, count: report.value?.aheadTasks?.length || 0 },
  { key: 'delayed', label: '已推迟', icon: WarningFilled, count: report.value?.delayedTasks?.length || 0 },
  { key: 'unfinished', label: '未完成', icon: WarningFilled, count: report.value?.unfinishedTasks?.length || 0 },
  { key: 'workers', label: '人员负荷', icon: Clock, count: workerLoadData.value?.length || 0 },
])

const subTableTitle = computed(() => {
  if (activeSubTab.value === 'ahead') return '提前完成任务'
  if (activeSubTab.value === 'delayed') return '已推迟任务'
  return '未完成任务'
})
const subTableDesc = computed(() => {
  if (activeSubTab.value === 'ahead') return '以下任务在实际完成时间之前完成'
  if (activeSubTab.value === 'delayed') return '以下任务未能按计划时间完成'
  return '截止日期已到但尚未完成的任务'
})

const subTableDataTotal = computed(() => {
  if (!report.value) return []
  if (activeSubTab.value === 'ahead') return report.value.aheadTasks || []
  if (activeSubTab.value === 'delayed') return report.value.delayedTasks || []
  if (activeSubTab.value === 'unfinished') return report.value.unfinishedTasks || []
  return []
})

const paginatedSubTableData = computed(() => {
  const start = (subTablePage.value - 1) * subTablePageSize.value
  return subTableDataTotal.value.slice(start, start + subTablePageSize.value)
})

const workerLoadData = computed(() => {
  if (!report.value) return []
  return report.value.workerLoadAnalysis || []
})

const paginatedWorkerData = computed(() => {
  const data = workerLoadData.value
  const start = (workerLoadPage.value - 1) * workerLoadPageSize.value
  return data.slice(start, start + workerLoadPageSize.value)
})

// ============================================
// 方法
// ============================================
const getSuggestion = (taskId) => {
  if (!todayPlan.value.workerSuggestions) return null
  return todayPlan.value.workerSuggestions.find(s => s.taskId === taskId)
}

const handleDateChange = () => {
  loadData()
}

const handleRefresh = () => {
  loadData()
}

const handleConfirmDispatch = async () => {
  // 修复 P0-8: 派发前加确认弹窗（避免误操作直接循环创建任务）
  try {
    await ElMessageBox.confirm(
      `将创建 ${pendingTasks.value.length} 个工单并写入数据库，确认继续？`,
      '确认派发',
      { type: 'warning', confirmButtonText: '确认派发', cancelButtonText: '取消' }
    )
  } catch {
    return // 用户取消
  }
  dispatching.value = true
  try {
    // 实际创建任务
    let dispatchedCount = 0
    for (const task of todayPlan.value.tasks) {
      const suggestion = (todayPlan.value.workerSuggestions || []).find(s => s.taskId === task.id)
      if (suggestion) {
        try {
          await farmTaskStore.createTask({
            title: `${task.greenhouseName}-${task.taskTypeName}`,
            type: task.taskType || 'irrigation',
            typeName: task.taskTypeName,
            assigneeId: suggestion.workerId,
            assigneeName: suggestion.workerName,
            dueDate: task.suggestedDate,
            priority: task.priority || 'medium',
            estimatedHours: task.estimatedHours || 2,
            status: 'pending',
            greenhouseId: task.greenhouseId,
            greenhouseName: task.greenhouseName,
            cropName: task.cropName,
            batchId: task.batchId,
            batchCode: task.batchCode,
          })
          dispatchedCount++
        } catch (err) {
          console.error(`创建任务失败: ${task.taskTypeName}`, err)
        }
      }
    }

    if (dispatchedCount > 0) {
      ElMessage.success(`成功派发 ${dispatchedCount} 个任务！`)
    } else {
      ElMessage.warning('未能成功派发任何任务')
    }
    loadData()
  } catch (error) {
    ElMessage.error('派发失败：' + (error.message || '未知错误'))
  } finally {
    dispatching.value = false
  }
}

const loadData = async () => {
  loading.value = true
  try {
    // 修复 P0-5: 删除 productionPlanStore.fetchPlans() 误调（结果未被消费）
    // 修复 P0-4: 临时任务数据从未拉取，补上 fetchTasks
    if (!farmTaskStore.tasks || farmTaskStore.tasks.length === 0) {
      await farmTaskStore.fetchTasks()
    }
    if (!tempTaskStore.tasks || tempTaskStore.tasks.length === 0) {
      await tempTaskStore.fetchTasks({})
    }

    const tasks = farmTaskStore.tasks || []
    const tempTasks = tempTaskStore.tasks || []

    // 生成每日报告
    const dailyReport = generateDailyReport(selectedDate.value, tasks, tempTasks)
    report.value = dailyReport

    // 生成今日派工计划
    const pendingTasks = dailyReport.delayedTasks.map(t => ({
      id: t.taskId,
      batchId: '',
      batchCode: '',
      cropName: '',
      greenhouseId: '',
      // 修复 P0-1: 派发任务时 greenhouseName 不能用 actualAssignee（那是执行人姓名）
      // 留空让 createTask 业务侧校验或后续从原始 farmTask 关联补全
      greenhouseName: '',
      plantingArea: 0,
      stage: '',
      stageName: '',
      taskType: 'irrigation',
      taskTypeName: t.taskName.split('-').pop() || '灌溉',
      suggestedDate: selectedDate.value,
      estimatedHours: 2,
      estimatedWorkers: 1,
      priority: t.delayDays > 3 ? 'high' : 'medium',
      urgency: t.delayDays > 3 ? 'urgent' : 'high',
      reason: t.delayReason,
      isOverdue: true,
      daysSinceLastTask: t.delayDays,
      intervalDays: t.delayDays,
    }))

    const workerSuggestions = workerLoadData.value
      .filter(w => w.availability === 'available')
      .slice(0, pendingTasks.length)
      .map((w, i) => ({
        workerId: w.workerId,
        workerName: w.workerName,
        taskId: pendingTasks[i]?.id || `task_${i}`,
        confidenceScore: 75,
      }))

    todayPlan.value = {
      date: selectedDate.value,
      tasks: pendingTasks,
      totalTasks: pendingTasks.length,
      totalHours: pendingTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0),
      requiredWorkers: Math.max(1, Math.ceil(pendingTasks.length / 3)),
      workerSuggestions,
    }
  } catch (error) {
    console.error('[DailyPlanning] 加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// ============================================
// 初始化
// ============================================
onMounted(() => {
  loadData()
})

watch(selectedDate, () => {
  loadData()
})

watch(activeSubTab, () => {
  subTablePage.value = 1
  workerLoadPage.value = 1
})
</script>
