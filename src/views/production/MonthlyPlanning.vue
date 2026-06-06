<template>
  <div class="space-y-4">
    <!-- 页面标题 - 紧凑型 -->
    <div class="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="20" class="text-white"><Calendar /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">月度任务规划</h1>
          <p class="text-sm text-gray-500">未来一个月任务规划与物资需求</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 - 淡彩底 -->
    <div class="grid grid-cols-4 gap-4">
      <div v-for="stat in statsData" :key="stat.label" :class="[stat.bgColor, 'rounded-lg px-3 py-2.5']">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="20" :class="stat.iconColor"><component :is="stat.icon" /></el-icon>
          </div>
          <div>
            <div class="text-xl font-bold text-gray-900">{{ stat.value }}</div>
            <div class="text-xs text-gray-500">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 日期选择和操作按钮 -->
    <div class="bg-[#F2F6FA] rounded-xl shadow-sm border border-gray-100 p-4">
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-4 flex-wrap">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">选择月份:</span>
            <el-date-picker
              v-model="selectedMonth"
              type="month"
              placeholder="选择月份"
              value-format="YYYY-MM"
              @change="handleMonthChange"
            />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出规划
          </el-button>
        </div>
      </div>
    </div>

    <!-- 生产批次选择表格 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">生产批次选择</h3>
          <p class="text-sm text-gray-500 mt-0.5">
            勾选要纳入月度规划的批次（仅显示进行中/已发布），已选 {{ selectedBatches.length }} / {{ availableBatches.length }} 个批次
          </p>
        </div>
        <el-button v-if="selectedBatches.length > 0" link type="danger" @click="selectedBatches = []">
          清除选择
        </el-button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <th class="px-3 py-3 text-center text-sm font-semibold whitespace-nowrap w-12">
                <input
                  type="checkbox"
                  :checked="paginatedBatches.length > 0 && paginatedBatches.every(b => selectedBatches.includes(b.id))"
                  @change="togglePageBatches"
                  class="w-4 h-4 rounded border-white/30 bg-white/20"
                />
              </th>
              <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">批次编号</th>
              <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">作物名称</th>
              <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">品种</th>
              <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">位置</th>
              <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">面积(亩)</th>
              <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">生长阶段</th>
              <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">开始日期</th>
              <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">预计采收</th>
              <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">状态</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr v-if="paginatedBatches.length === 0">
              <td colspan="10" class="px-4 py-8 text-center text-gray-400">暂无进行中或已发布的生产批次</td>
            </tr>
            <tr
              v-for="batch in paginatedBatches"
              :key="batch.id"
              @click="toggleBatch(batch.id)"
              class="cursor-pointer transition-colors"
              :class="selectedBatches.includes(batch.id) ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'"
            >
              <td class="px-3 py-3 text-center" @click.stop>
                <input
                  type="checkbox"
                  :checked="selectedBatches.includes(batch.id)"
                  @change="toggleBatch(batch.id)"
                  class="w-4 h-4 rounded border-gray-400 text-emerald-600"
                />
              </td>
              <td class="px-4 py-3 text-sm font-medium text-gray-900 text-center whitespace-nowrap">{{ batch.batchCode || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-700 text-center whitespace-nowrap">{{ batch.cropName || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-500 text-center whitespace-nowrap">{{ batch.variety || batch.cropType || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-500 text-center whitespace-nowrap">{{ batch.greenhouseName || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-500 text-center whitespace-nowrap">{{ batch.plantingArea || '-' }}</td>
              <td class="px-4 py-3 text-center whitespace-nowrap">
                <span class="inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-sm font-semibold bg-blue-100 text-blue-800">
                  {{ batch.stageName || batch.stage || '-' }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-500 text-center whitespace-nowrap">{{ batch.startDate || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-500 text-center whitespace-nowrap">{{ batch.expectedHarvestDate || '-' }}</td>
              <td class="px-4 py-3 text-center whitespace-nowrap">
                <span :class="[
                  'inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-sm font-semibold',
                  batch.batchStatus === 'in_progress' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                ]">
                  {{ batchStatusLabel(batch.batchStatus) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <span class="text-sm text-gray-500">共 {{ availableBatches.length }} 条</span>
        <div class="flex items-center gap-2">
          <el-button :disabled="batchPage <= 1" size="small" @click="batchPage--">上一页</el-button>
          <span class="text-sm">{{ batchPage }} / {{ batchTotalPages }}</span>
          <el-button :disabled="batchPage >= batchTotalPages" size="small" @click="batchPage++">下一页</el-button>
          <el-select v-model="batchPageSize" size="small" style="width: 80px" @change="batchPage = 1">
            <el-option v-for="s in [5, 10, 20]" :key="s" :value="s" :label="`${s}条`" />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 子Tab切换 - 5个标签 -->
    <div class="bg-white rounded-xl shadow-sm">
      <div class="border-b border-gray-200 px-4 py-3">
        <nav class="flex gap-2 flex-wrap">
          <button
            v-for="tab in subTabs"
            :key="tab.key"
            @click="activeSubTab = tab.key"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            :class="activeSubTab === tab.key ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
          >
            <el-icon :size="16"><component :is="tab.icon" /></el-icon>
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Tab内容 -->
      <div class="p-4">
        <!-- 规划概览 -->
        <!-- 修复 Y11: 统一空态守卫（5 个 tab 共享） -->
        <div v-if="!monthlyPlan" class="bg-white rounded-xl shadow-sm p-12 text-center">
          <el-icon class="text-6xl text-gray-300 mb-4"><Document /></el-icon>
          <p class="text-gray-500 text-lg">暂无月度计划数据</p>
          <p class="text-gray-400 text-sm mt-2">请选择月份和批次后点击"重新生成"按钮</p>
        </div>
        <div v-else-if="activeSubTab === 'overview' && monthlyPlan" class="space-y-6">
          <h3 class="text-lg font-semibold text-gray-900">任务类型分布</h3>
          <div class="grid grid-cols-4 gap-4">
            <div v-for="(item, index) in taskTypeSummary.slice(0, 4)" :key="index" class="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">{{ item.taskTypeName }}</span>
                <span class="text-lg font-bold text-gray-900">{{ item.count }}</span>
              </div>
              <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div :class="['h-full', progressColors[index % progressColors.length], 'rounded-full']" :style="{ width: item.percentage + '%' }" />
              </div>
              <div class="text-xs text-gray-500 mt-1">{{ item.percentage }}%</div>
            </div>
          </div>

          <!-- 本周重点任务 -->
          <div v-if="monthlyPlan.weeklySummaries.length > 0" class="bg-gray-50 rounded-lg border border-gray-100 p-4">
            <h4 class="text-sm font-semibold text-gray-900 mb-3">第 {{ monthlyPlan.weeklySummaries[0].weekNumber }} 周重点任务</h4>
            <div class="flex flex-wrap gap-2">
              <span v-for="(task, idx) in monthlyPlan.weeklySummaries[0].keyTasks" :key="idx"
                class="inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-sm font-semibold bg-blue-100 text-blue-800">
                {{ task }}
              </span>
            </div>
          </div>

          <!-- 生成信息 -->
          <div class="bg-gray-50 rounded-lg border border-gray-100 p-4">
            <h4 class="text-sm font-semibold text-gray-900 mb-2">生成信息</h4>
            <div class="text-sm text-gray-600 space-y-1">
              <p>生成时间：{{ dayjs(monthlyPlan.generatedAt).format('YYYY-MM-DD HH:mm:ss') }}</p>
              <p>生成方式：{{ monthlyPlan.generatedBy }}</p>
            </div>
          </div>
        </div>

        <!-- 按周汇总 -->
        <div v-if="activeSubTab === 'weekly' && monthlyPlan">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 class="text-lg font-semibold text-gray-900">按周汇总</h3>
              <p class="text-sm text-gray-500 mt-0.5">共 {{ monthlyPlan.weeklySummaries.length }} 周数据</p>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <th class="px-4 py-3 text-center text-sm font-semibold">周次</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">开始日期</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">结束日期</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">任务数</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">总工时</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">所需人数</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">重点作物</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">重点任务</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-300">
                  <tr v-for="item in paginatedWeeklyData" :key="item.weekNumber" class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-sm font-semibold text-gray-900 text-center">第 {{ item.weekNumber }} 周</td>
                    <td class="px-4 py-3 text-sm text-gray-500 text-center">{{ item.startDate }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500 text-center">{{ item.endDate }}</td>
                    <td class="px-4 py-3 text-center"><span class="inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-sm font-semibold bg-blue-100 text-blue-800">{{ item.taskCount }}</span></td>
                    <td class="px-4 py-3 text-sm text-gray-500 text-center">{{ item.totalHours }}h</td>
                    <td class="px-4 py-3 text-sm text-gray-500 text-center">{{ item.requiredWorkers }} 人</td>
                    <td class="px-4 py-3 text-center">
                      <div class="flex flex-wrap gap-1 justify-center">
                        <span v-for="crop in item.keyCrops" :key="crop" class="inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-sm font-semibold bg-green-100 text-green-800">{{ crop }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <div class="flex flex-wrap gap-1 justify-center">
                        <span v-for="task in item.keyTasks" :key="task" class="inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-sm font-semibold bg-gray-100 text-gray-900">{{ task }}</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="monthlyPlan.weeklySummaries.length > weeklyPageSize" class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span class="text-sm text-gray-500">共 {{ monthlyPlan.weeklySummaries.length }} 条</span>
              <div class="flex items-center gap-2">
                <el-button :disabled="weeklyPage <= 1" size="small" @click="weeklyPage--">上一页</el-button>
                <span class="text-sm">{{ weeklyPage }} / {{ weeklyTotalPages }}</span>
                <el-button :disabled="weeklyPage >= weeklyTotalPages" size="small" @click="weeklyPage++">下一页</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 物资需求 -->
        <div v-if="activeSubTab === 'materials' && monthlyPlan">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 class="text-lg font-semibold text-gray-900">物资需求计划</h3>
              <p class="text-sm text-gray-500 mt-0.5">基于月度任务规划，预测所需的物资消耗</p>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <th class="px-4 py-3 text-center text-sm font-semibold">物资名称</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">规格</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">数量</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">预估单价</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">预估总价</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-300">
                  <tr v-for="(item, idx) in paginatedMaterialData" :key="idx" class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-sm text-gray-900 text-center">{{ item.materialName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500 text-center">{{ item.specification }}</td>
                    <td class="px-4 py-3 text-sm font-semibold text-gray-900 text-center">{{ item.quantity }} {{ item.unit }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500 text-center">¥{{ item.estimatedUnitPrice.toFixed(2) }}</td>
                    <td class="px-4 py-3 text-sm font-semibold text-red-500 text-center">¥{{ item.estimatedTotalPrice.toFixed(2) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="bg-gray-50 border-t-2 border-gray-400">
                    <td class="px-4 py-3"></td>
                    <td class="px-4 py-3"></td>
                    <td class="px-4 py-3"></td>
                    <td class="px-4 py-3 text-sm font-semibold text-gray-900 text-center">合计</td>
                    <td class="px-4 py-3 text-sm font-bold text-red-500 text-center">¥{{ materialTotalPrice.toFixed(2) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div v-if="monthlyPlan.materialRequirements.length > materialPageSize" class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span class="text-sm text-gray-500">共 {{ monthlyPlan.materialRequirements.length }} 条</span>
              <div class="flex items-center gap-2">
                <el-button :disabled="materialPage <= 1" size="small" @click="materialPage--">上一页</el-button>
                <span class="text-sm">{{ materialPage }} / {{ materialTotalPages }}</span>
                <el-button :disabled="materialPage >= materialTotalPages" size="small" @click="materialPage++">下一页</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 人员需求 -->
        <div v-if="activeSubTab === 'workers' && monthlyPlan">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 class="text-lg font-semibold text-gray-900">人员需求计划</h3>
              <p class="text-sm text-gray-500 mt-0.5">基于月度任务规划，预测所需的人员配置</p>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <th class="px-4 py-3 text-center text-sm font-semibold">角色</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">技能要求</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">需求人数</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold">预估工时</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-300">
                  <tr v-for="(item, idx) in paginatedWorkerData" :key="idx" class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-sm font-medium text-gray-900 text-center">{{ item.role }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500 text-center">{{ item.skill }}</td>
                    <td class="px-4 py-3 text-center"><span class="inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-sm font-semibold bg-blue-100 text-blue-800">{{ item.requiredCount }} 人</span></td>
                    <td class="px-4 py-3 text-sm text-gray-500 text-center">{{ item.estimatedHours }}h</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="monthlyPlan.workerRequirements.length > workerPageSize" class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span class="text-sm text-gray-500">共 {{ monthlyPlan.workerRequirements.length }} 条</span>
              <div class="flex items-center gap-2">
                <el-button :disabled="workerPage <= 1" size="small" @click="workerPage--">上一页</el-button>
                <span class="text-sm">{{ workerPage }} / {{ workerTotalPages }}</span>
                <el-button :disabled="workerPage >= workerTotalPages" size="small" @click="workerPage++">下一页</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 成本预估 -->
        <div v-if="activeSubTab === 'cost' && monthlyPlan" class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">成本预估</h3>
          <div class="grid grid-cols-3 gap-4">
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <div class="text-sm text-gray-500 mb-1">物资成本</div>
              <div class="text-2xl font-bold text-orange-600">¥{{ monthlyPlan.costBreakdown.materialCost.toFixed(2) }}</div>
            </div>
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <div class="text-sm text-gray-500 mb-1">工具成本</div>
              <div class="text-2xl font-bold text-purple-600">¥{{ monthlyPlan.costBreakdown.toolCost.toFixed(2) }}</div>
            </div>
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <div class="text-sm text-gray-500 mb-1">人工成本</div>
              <div class="text-2xl font-bold text-cyan-600">¥{{ monthlyPlan.costBreakdown.laborCost.toFixed(2) }}</div>
            </div>
          </div>

          <!-- 总成本 -->
          <div class="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100 p-4">
            <div class="text-sm text-red-600 mb-1">总成本</div>
            <div class="text-3xl font-bold text-red-600">¥{{ monthlyPlan.costBreakdown.total.toFixed(2) }}</div>
          </div>

          <!-- 成本构成进度条 -->
          <div class="bg-gray-50 rounded-lg border border-gray-100 p-4 space-y-3">
            <h4 class="text-sm font-semibold text-gray-900">成本构成</h4>
            <div v-for="item in costBreakdownItems" :key="item.label" class="flex items-center gap-3">
              <div class="w-24 text-sm text-gray-600">{{ item.label }}</div>
              <div class="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                <div :class="['h-full rounded-full', item.color]" :style="{ width: item.percent + '%' }" />
              </div>
              <div class="w-16 text-sm text-gray-600">{{ item.percent }}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Calendar, Files, ShoppingCart, User, Coin,
  Refresh, Download, List, Timer
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { useProductionPlanStore } from '@/stores/modules/productionPlan'
import { useMonthlyTaskPlanning } from '@/composables/production/useMonthlyTaskPlanning'

// ============================================
// 真实数据与业务逻辑（1:1 对应 V1.1 useMonthlyTaskPlanning hook）
// ============================================

/** 获取真实生产批次数据 */
const productionPlanStore = useProductionPlanStore()
const { generateMonthlyPlan } = useMonthlyTaskPlanning()

// 初始化时从 API 加载批次数据
onMounted(async () => {
  // 修复 P0-3: 删除 loading.value 引用（loading 变量已删除）
  try {
    await productionPlanStore.fetchPlans()
    regeneratePlan()
  } catch (e) {
    console.error('[MonthlyPlanning] 加载批次数据失败:', e)
  }
})

// ============================================
// 主状态
// ============================================
const selectedMonth = ref(dayjs().format('YYYY-MM'))
const selectedBatches = ref([])
const activeSubTab = ref('overview')
const monthlyPlan = ref(null)
// 修复 P0-3: 删除 unused loading 变量（页面无 v-loading 守卫）

// 批次分页
const batchPage = ref(1)
const batchPageSize = ref(5)

// 子表分页
const weeklyPage = ref(1)
const weeklyPageSize = ref(10)
const materialPage = ref(1)
const materialPageSize = ref(10)
const workerPage = ref(1)
const workerPageSize = ref(10)

// ============================================
// 计算属性
// ============================================

/** 可用批次（仅进行中和已发布）- 使用真实 Store 数据 */
const availableBatches = computed(() =>
  (productionPlanStore.plans || []).filter(b => b.batchStatus === 'in_progress' || b.batchStatus === 'published')
)

/** 分页后的批次 */
const paginatedBatches = computed(() => {
  const start = (batchPage.value - 1) * batchPageSize.value
  return availableBatches.value.slice(start, start + batchPageSize.value)
})

const batchTotalPages = computed(() => Math.ceil(availableBatches.value.length / batchPageSize.value) || 1)

/** 统计卡片数据 */
const statsData = computed(() => {
  if (!monthlyPlan.value) return []
  return [
    { label: '总任务数', value: monthlyPlan.value.totalTasks, icon: List, bgColor: 'bg-blue-50 border border-blue-200', iconColor: 'text-blue-500' },
    { label: '预估工时', value: `${monthlyPlan.value.totalHours}h`, icon: Timer, bgColor: 'bg-purple-50 border border-purple-200', iconColor: 'text-purple-500' },
    { label: '所需人员', value: Math.round(monthlyPlan.value.totalHours / 8), icon: User, bgColor: 'bg-cyan-50 border border-cyan-200', iconColor: 'text-cyan-500' },
    { label: '预估成本', value: `¥${monthlyPlan.value.totalCost.toFixed(0)}`, icon: Coin, bgColor: 'bg-orange-50 border border-orange-200', iconColor: 'text-orange-500' },
  ]
})

/** 任务类型分布 */
const taskTypeSummary = computed(() => {
  if (!monthlyPlan.value) return []
  return Object.entries(monthlyPlan.value.taskTypeBreakdown)
    .map(([taskType, count]) => ({
      taskType,
      taskTypeName: taskTypeNameMap[taskType] || taskType,
      count,
      percentage: monthlyPlan.value.totalTasks > 0 ? Math.round((count / monthlyPlan.value.totalTasks) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
})

const progressColors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500']

/** 分页后的周汇总 */
const paginatedWeeklyData = computed(() => {
  if (!monthlyPlan.value) return []
  const start = (weeklyPage.value - 1) * weeklyPageSize.value
  return monthlyPlan.value.weeklySummaries.slice(start, start + weeklyPageSize.value)
})
const weeklyTotalPages = computed(() => Math.ceil((monthlyPlan.value?.weeklySummaries.length || 0) / weeklyPageSize.value))

/** 分页后的物资需求 */
const paginatedMaterialData = computed(() => {
  if (!monthlyPlan.value) return []
  const start = (materialPage.value - 1) * materialPageSize.value
  return monthlyPlan.value.materialRequirements.slice(start, start + materialPageSize.value)
})
const materialTotalPages = computed(() => Math.ceil((monthlyPlan.value?.materialRequirements.length || 0) / materialPageSize.value))
// 修复 Y7: 直接用 plan.costBreakdown.materialCost（避免双重聚合）
// 原 materialTotalPrice computed 与 plan.costBreakdown.materialCost 重复计算同一份数据
const materialTotalPrice = computed(() => monthlyPlan.value?.costBreakdown?.materialCost || 0)

/** 分页后的人员需求 */
const paginatedWorkerData = computed(() => {
  if (!monthlyPlan.value) return []
  const start = (workerPage.value - 1) * workerPageSize.value
  return monthlyPlan.value.workerRequirements.slice(start, start + workerPageSize.value)
})
const workerTotalPages = computed(() => Math.ceil((monthlyPlan.value?.workerRequirements.length || 0) / workerPageSize.value))

/** 成本构成进度条数据 */
const costBreakdownItems = computed(() => {
  if (!monthlyPlan.value) return []
  const total = monthlyPlan.value.costBreakdown.total
  if (total === 0) return []
  return [
    { label: '物资成本', percent: Math.round(monthlyPlan.value.costBreakdown.materialCost / total * 100), color: 'bg-orange-500' },
    { label: '工具成本', percent: Math.round(monthlyPlan.value.costBreakdown.toolCost / total * 100), color: 'bg-purple-500' },
    { label: '人工成本', percent: Math.round(monthlyPlan.value.costBreakdown.laborCost / total * 100), color: 'bg-cyan-500' },
  ]
})

// ============================================
// 常量
// ============================================
const taskTypeNameMap = {
  irrigation: '灌溉', fertilization: '施肥', plant_protection: '植保',
  pruning: '修剪', harvest: '采收', weeding: '除草',
}

const subTabs = [
  { key: 'overview', label: '规划概览', icon: Files },
  { key: 'weekly', label: '按周汇总', icon: Calendar },
  { key: 'materials', label: '物资需求', icon: ShoppingCart },
  { key: 'workers', label: '人员需求', icon: User },
  { key: 'cost', label: '成本预估', icon: Coin },
]

// ============================================
// 方法
// ============================================
const batchStatusLabel = (status) => {
  const map = { draft: '草稿', pending: '待审核', published: '已发布', in_progress: '进行中', completed: '已完成', cancelled: '已取消' }
  return map[status] || status
}

const toggleBatch = (id) => {
  const idx = selectedBatches.value.indexOf(id)
  if (idx >= 0) {
    selectedBatches.value = selectedBatches.value.filter(bid => bid !== id)
  } else {
    selectedBatches.value = [...selectedBatches.value, id]
  }
}

const togglePageBatches = () => {
  const pageIds = paginatedBatches.value.map(b => b.id)
  const allSelected = paginatedBatches.value.every(b => selectedBatches.value.includes(b.id))
  if (allSelected) {
    selectedBatches.value = selectedBatches.value.filter(id => !pageIds.includes(id))
  } else {
    selectedBatches.value = [...new Set([...selectedBatches.value, ...pageIds])]
  }
}

const handleMonthChange = () => {
  regeneratePlan()
}

const handleRefresh = () => {
  regeneratePlan()
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const regeneratePlan = () => {
  monthlyPlan.value = generateMonthlyPlan(selectedMonth.value, selectedBatches.value)
}

// 修复 P0-1: 删除模块级 regeneratePlan() 调用
// 初始化由上方 onMounted (line 412) 统一处理：先 fetch plans 再 regeneratePlan

// 批次选择变化时重新生成
watch(selectedBatches, () => {
  regeneratePlan()
}, { deep: true })
</script>
