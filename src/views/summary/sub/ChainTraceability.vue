<!--
  全链条追溯页面 - 从种源到采收入库完整追溯
  V1.1 源文件：src/pages/summary/ChainTraceability.tsx
  1:1 对齐：6 个追溯环节 + Sankey 流程图 + 环节详情面板 + KPI 卡片 + 批次详情抽屉 + 全批次追溯列表
-->
<template>
  <div class="space-y-6">
    <!-- 页面头部（V1.1 L280-286） -->
    <div v-if="!hideHeader" class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-sm">
        <Link :size="24" class="text-white" />
      </div>
      <div>
        <h1 class="text-xl font-bold text-gray-900">全链条追溯</h1>
        <p class="text-sm text-gray-500">从种源→育苗→种植→采收入库完整追溯链，6环节批次追踪</p>
      </div>
    </div>

    <!-- 概览 KPI（V1.1 L289-318） - KpiCard 使用 #icon slot 传入 lucide 图标 -->
    <KpiCardGrid :columns="4" :compact="true">
      <KpiCard label="追踪批次数" :value="totalBatches" color-scheme="teal" :compact="true">
        <template #icon><Layers :size="16" class="text-white" /></template>
      </KpiCard>
      <KpiCard label="已完成" :value="completedBatches" color-scheme="emerald" :compact="true">
        <template #icon><CheckCircle2 :size="16" class="text-white" /></template>
      </KpiCard>
      <KpiCard label="进行中" :value="inProgressBatches" color-scheme="blue" :compact="true">
        <template #icon><Clock :size="16" class="text-white" /></template>
      </KpiCard>
      <KpiCard label="追溯环节" :value="6" color-scheme="purple" :compact="true">
        <template #icon><Link :size="16" class="text-white" /></template>
      </KpiCard>
    </KpiCardGrid>

    <!-- 错误提示（V1.1 L321-326） -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
      <Warning :size="20" />
      <span class="text-sm">数据加载失败：{{ error }}</span>
    </div>

    <!-- Sankey 流程示意（V1.1 L329-335） -->
    <div v-if="isLoading" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex items-center justify-center">
      <Loader :size="32" class="text-teal-600 animate-spin" />
    </div>
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
      <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Link :size="20" class="text-teal-600" />
        全链条流程示意
      </h3>
      <div class="flex items-start gap-0 min-w-[900px] py-4">
        <div v-for="(stage, idx) in stageStats" :key="stage.key" class="flex items-start flex-1">
          <div class="flex flex-col items-center flex-1">
            <!-- 环节图标卡片（V1.1 L95-99：w-24 h-24 rounded-2xl + bg-gradient-to-br） -->
            <div
              class="w-24 h-24 rounded-2xl shadow-lg mb-2 flex items-center justify-center text-white"
              :style="{ background: `linear-gradient(to bottom right, ${stage.colorStart}, ${stage.colorEnd})` }"
            >
              <div class="text-center">
                <component :is="stage.icon" :size="24" class="mb-1 mx-auto" />
                <p class="text-xs font-semibold">{{ stage.label }}</p>
              </div>
            </div>
            <!-- 数量统计（V1.1 L101-104） -->
            <div :class="['text-center', stage.textColorClass]">
              <p class="text-lg font-bold">{{ stage.count }}</p>
              <p class="text-xs">批次</p>
            </div>
            <!-- 进度条（V1.1 L105-112） -->
            <div class="w-full px-2 mt-1">
              <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500 ease-out"
                  :style="{ width: `${(stage.count / maxStageCount) * 100}%`, background: `linear-gradient(to right, ${stage.colorStart}, ${stage.colorEnd})` }"
                />
              </div>
            </div>
          </div>
          <!-- 箭头连接（V1.1 L114-118） -->
          <div v-if="idx < stageStats.length - 1" class="flex items-center pt-10 flex-shrink-0">
            <ArrowRightBold :size="20" class="text-gray-300" />
          </div>
        </div>
      </div>
    </div>

    <!-- 6 环节详情面板（V1.1 L338-348） -->
    <div v-if="!isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="stage in stageStats"
        :key="stage.key"
        class="rounded-xl border p-5"
        :style="{ backgroundColor: stage.bgColor }"
      >
        <!-- 环节头部（V1.1 L139-147） -->
        <div class="flex items-center gap-2 mb-3">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            :style="{ background: `linear-gradient(to bottom right, ${stage.colorStart}, ${stage.colorEnd})` }"
          >
            <component :is="stage.icon" :size="16" class="text-white" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">{{ stage.label }}</h3>
            <p class="text-xs text-gray-500">{{ stage.count }} 条记录</p>
          </div>
        </div>
        <!-- 批次卡片 + 环节记录卡片（V1.1 L148-203） -->
        <template v-if="stage.batches.length > 0 || stage.items.length > 0">
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <!-- 批次卡片（生产计划阶段 V1.1 L152-174） -->
            <button
              v-for="batch in stage.batches"
              :key="batch.id"
              class="w-full flex items-center justify-between bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow text-left"
              @click="handleViewBatch(batch)"
            >
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-gray-800 truncate">{{ batch.batchName || batch.batchCode }}</p>
                <div class="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                  <span>{{ batch.cropName }}</span>
                  <span>|</span>
                  <span>{{ batch.greenhouse }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0 ml-2">
                <span
                  :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', STATUS_BADGE[batch.status] || 'bg-gray-100 text-gray-700']"
                >
                  {{ STATUS_LABEL[batch.status] || batch.status }}
                </span>
                <ArrowRightBold :size="16" class="text-gray-300" />
              </div>
            </button>
            <!-- 环节记录卡片（种源/育苗/种植/采收/库存 V1.1 L176-201） -->
            <div
              v-for="item in stage.items"
              :key="item.id || item.code"
              class="w-full bg-white rounded-lg p-3 shadow-sm text-left"
            >
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-800 truncate">{{ item.name || item.code }}</p>
                <div class="flex items-center gap-2 text-xs text-gray-400 mt-0.5 flex-wrap">
                  <template v-for="(field, i) in itemMetaFields(item)" :key="field.key">
                    <span v-if="i > 0">|</span>
                    <span>{{ field.value }}</span>
                  </template>
                  <template v-if="item.totalAmount != null">
                    <span>|</span>
                    <span class="text-amber-600 font-medium">¥{{ Number(item.totalAmount).toLocaleString() }}</span>
                  </template>
                </div>
              </div>
              <div v-if="item.status" class="mt-1.5">
                <span
                  :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', STATUS_BADGE[item.status] || 'bg-gray-100 text-gray-700']"
                >
                  {{ STATUS_LABEL[item.status] || item.status }}
                </span>
              </div>
            </div>
          </div>
        </template>
        <p v-else class="text-sm text-gray-400 py-3 text-center">暂无该环节记录</p>
      </div>
    </div>

    <!-- 全批次追溯列表（V1.1 L351-441） -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100">
        <h3 class="font-semibold text-gray-900">全批次追溯列表</h3>
        <p class="text-xs text-gray-400 mt-1">所有批次按环节归类，点击查看批次详情</p>
      </div>
      <div class="overflow-x-auto">
        <el-table
          :data="paginatedBatches"
          style="width: 100%"
          :row-class-name="tableRowClassName"
          :header-cell-style="headerCellStyle"
          @row-click="handleRowClick"
        >
          <el-table-column prop="batchCode" label="批次编号" min-width="120" />
          <el-table-column prop="batchName" label="批次名称" min-width="120" />
          <el-table-column prop="cropName" label="作物" min-width="80" />
          <el-table-column prop="greenhouse" label="温室" min-width="120" />
          <!-- 当前环节（V1.1 L390-397） -->
          <el-table-column label="当前环节" min-width="120">
            <template #default="{ row }">
              <div
                v-if="getBatchStageInfo(row)"
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
                :style="{ backgroundColor: getBatchStageInfo(row).bgColor, color: getBatchStageInfo(row).textColor }"
              >
                <component :is="getBatchStageInfo(row).icon" :size="12" />
                {{ getBatchStageInfo(row).label }}
              </div>
            </template>
          </el-table-column>
          <!-- 状态（V1.1 L398-402） -->
          <el-table-column label="状态" min-width="100">
            <template #default="{ row }">
              <span
                :class="['text-xs px-2 py-0.5 rounded-full font-medium', STATUS_BADGE[row.status] || 'bg-gray-100 text-gray-700']"
              >
                {{ STATUS_LABEL[row.status] || row.status }}
              </span>
            </template>
          </el-table-column>
          <!-- 完成率（V1.1 L403-412） -->
          <el-table-column label="完成率" min-width="120">
            <template #default="{ row }">
              <div class="flex items-center gap-2">
                <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[50px]">
                  <div
                    :class="[
                      'h-full rounded-full',
                      row.completionRate >= 100 ? 'bg-emerald-500' : row.completionRate >= 50 ? 'bg-teal-500' : 'bg-amber-500'
                    ]"
                    :style="{ width: `${Math.min(row.completionRate || 0, 100)}%` }"
                  />
                </div>
                <span class="text-xs text-gray-500 w-9 text-right">{{ (row.completionRate || 0).toFixed(0) }}%</span>
              </div>
            </template>
          </el-table-column>
          <!-- 操作（V1.1 L414-416） -->
          <el-table-column label="操作" min-width="100" fixed="right">
            <template #default="{ row }">
              <span
                class="text-xs text-teal-600 font-medium cursor-pointer hover:text-teal-800"
                @click.stop="handleViewBatch(row)"
              >追溯详情</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页（V1.1 L426-440） -->
      <div v-if="totalCount > 0" class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <div class="text-sm text-gray-500">
          显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, totalCount) }} 条，共 {{ totalCount }} 条
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalCount"
          layout="sizes, prev, pager, next"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 批次详情抽屉（V1.1 L444-539） -->
    <el-drawer
      v-model="drawerOpen"
      :title="`批次追溯 - ${selectedBatch?.batchCode || ''}`"
      :size="480"
      direction="rtl"
    >
      <div v-if="selectedBatch" class="space-y-4">
        <!-- 当前环节（V1.1 L453-468） -->
        <div
          v-if="getBatchStageInfo(selectedBatch)"
          class="rounded-xl p-4 border"
          :style="{ backgroundColor: getBatchStageInfo(selectedBatch).bgColor }"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              :style="{ background: `linear-gradient(to bottom right, ${getBatchStageInfo(selectedBatch).colorStart}, ${getBatchStageInfo(selectedBatch).colorEnd})` }"
            >
              <component :is="getBatchStageInfo(selectedBatch).icon" :size="20" class="text-white" />
            </div>
            <div>
              <p :class="['text-sm font-semibold', getBatchStageInfo(selectedBatch).textColorClass]">
                当前环节：{{ getBatchStageInfo(selectedBatch).label }}
              </p>
              <p class="text-xs opacity-70 mt-0.5">点击对应环节卡片可跳转到该模块</p>
            </div>
          </div>
        </div>

        <!-- 基本信息（V1.1 L471-486） -->
        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-2 pb-2 border-b">基本信息</h3>
          <el-descriptions :column="2" size="small" border>
            <el-descriptions-item label="批次编号">{{ selectedBatch.batchCode }}</el-descriptions-item>
            <el-descriptions-item label="批次名称">{{ selectedBatch.batchName }}</el-descriptions-item>
            <el-descriptions-item label="作物品种">{{ selectedBatch.cropName }}</el-descriptions-item>
            <el-descriptions-item label="温室">{{ selectedBatch.greenhouse }}</el-descriptions-item>
            <el-descriptions-item label="种植面积">{{ selectedBatch.plantingArea || '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <span
                :class="['text-xs px-2 py-0.5 rounded-full font-medium', STATUS_BADGE[selectedBatch.status] || 'bg-gray-100 text-gray-700']"
              >
                {{ STATUS_LABEL[selectedBatch.status] || selectedBatch.status }}
              </span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 产量进度（V1.1 L489-507） -->
        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-2 pb-2 border-b">产量进度</h3>
          <el-descriptions :column="2" size="small" border>
            <el-descriptions-item label="目标产量">{{ selectedBatch.targetYield?.toLocaleString() }} kg</el-descriptions-item>
            <el-descriptions-item label="实际产量">{{ selectedBatch.actualQuantity?.toLocaleString() }} kg</el-descriptions-item>
          </el-descriptions>
          <div class="mt-2">
            <div class="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>完成度</span>
              <span>{{ (selectedBatch.completionRate || 0).toFixed(1) }}%</span>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full bg-teal-500"
                :style="{ width: `${Math.min(selectedBatch.completionRate || 0, 100)}%` }"
              />
            </div>
          </div>
        </div>

        <!-- 时间节点（V1.1 L509-516） -->
        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-2 pb-2 border-b">时间节点</h3>
          <el-descriptions :column="2" size="small" border>
            <el-descriptions-item label="种植日期">{{ selectedBatch.plantingDate || '-' }}</el-descriptions-item>
            <el-descriptions-item label="预计采收">{{ selectedBatch.expectedHarvestDate || '-' }}</el-descriptions-item>
            <el-descriptions-item label="实际采收">{{ selectedBatch.actualHarvestDate || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 任务统计（V1.1 L519-536） -->
        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-2 pb-2 border-b">任务统计</h3>
          <div class="grid grid-cols-3 gap-3 text-sm">
            <div class="text-center p-3 bg-teal-50 rounded-lg">
              <p class="text-lg font-bold text-teal-700">{{ selectedBatch.taskCount || 0 }}</p>
              <p class="text-xs text-teal-500">总任务</p>
            </div>
            <div class="text-center p-3 bg-emerald-50 rounded-lg">
              <p class="text-lg font-bold text-emerald-700">{{ selectedBatch.completedTaskCount || 0 }}</p>
              <p class="text-xs text-emerald-500">已完成</p>
            </div>
            <div class="text-center p-3 bg-amber-50 rounded-lg">
              <p class="text-lg font-bold text-amber-700">{{ selectedBatch.pendingTaskCount || 0 }}</p>
              <p class="text-xs text-amber-500">待处理</p>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
/**
 * 全链条追溯页面 - 1:1 对齐 V1.1 src/pages/summary/ChainTraceability.tsx
 * 数据源：useSummaryStore（Pinia）→ fetchBatchStats / fetchChainOverview
 * 架构：Component → Pinia Store → enhancedApiClient → Backend API（单向不可逆）
 */
import { ref, computed, onMounted } from 'vue'
import {
  Link,
  Layers,           // V1.1 用作 KPI#1 图标（lucide）
  CheckCircle2,     // V1.1 用作 KPI#2 图标（lucide）
  Clock,
  Sprout,           // lucide
  Leaf,             // lucide
  Package,          // lucide
  Warehouse,        // lucide
  ClipboardList,    // lucide
  AlertCircle as Warning,
  ArrowRight as ArrowRightBold,
  Loader
} from 'lucide-vue-next'
import { useSummaryStore } from '@/stores/modules/summary'
import KpiCard from '@/components/summary/KpiCard.vue'
import KpiCardGrid from '@/components/summary/KpiCardGrid.vue'

const props = defineProps({
  hideHeader: {
    type: Boolean,
    default: false
  }
})

const summaryStore = useSummaryStore()

// 状态
const selectedBatch = ref(null)
const drawerOpen = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

// 计算属性（从 V1.1 L213-218 1:1 对齐）
const batchItems = computed(() => summaryStore.batchItems)
const chainStages = computed(() => summaryStore.chainStages)
const isLoading = computed(() => summaryStore.isLoading)
const error = computed(() => summaryStore.error)

// ========== 常量（V1.1 L29-65 1:1 翻译） ==========

/** 6 个追溯环节配置 */
const CHAIN_STAGES_CONFIG = [
  {
    key: 'plan',
    label: '生产计划',
    icon: ClipboardList,
    colorStart: '#3b82f6', colorEnd: '#1d4ed8',
    bgColor: '#eff6ff', textColor: '#1d4ed8', textColorClass: 'text-blue-700'
  },
  {
    key: 'seed',
    label: '种源管理',
    icon: Sprout,
    colorStart: '#10b981', colorEnd: '#047857',
    bgColor: '#ecfdf5', textColor: '#047857', textColorClass: 'text-emerald-700'
  },
  {
    key: 'seedling',
    label: '育苗管理',
    icon: Sprout,
    colorStart: '#14b6b4', colorEnd: '#0d9488',
    bgColor: '#f0fdfa', textColor: '#0d9488', textColorClass: 'text-teal-700'
  },
  {
    key: 'planting',
    label: '种植管理',
    icon: Leaf,
    colorStart: '#22c55e', colorEnd: '#15803d',
    bgColor: '#f0fdf4', textColor: '#15803d', textColorClass: 'text-green-700'
  },
  {
    key: 'harvest',
    label: '采收入库',
    icon: Package,
    colorStart: '#f59e0b', colorEnd: '#d97706',
    bgColor: '#fffbeb', textColor: '#d97706', textColorClass: 'text-amber-700'
  },
  {
    key: 'inventory',
    label: '库存管理',
    icon: Warehouse,
    colorStart: '#a855f7', colorEnd: '#7c3aed',
    bgColor: '#faf5ff', textColor: '#7c3aed', textColorClass: 'text-purple-700'
  }
]

/** 状态样式映射（V1.1 L39-55 1:1） */
const STATUS_LABEL = {
  draft: '草稿',
  planning: '规划中',
  published: '已发布',
  in_progress: '进行中',
  completed: '已完成',
  overdue: '已逾期'
}

const STATUS_BADGE = {
  draft: 'bg-gray-100 text-gray-600',
  planning: 'bg-gray-100 text-gray-700',
  published: 'bg-blue-100 text-blue-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-red-100 text-red-700'
}

// ========== 方法（V1.1 L58-77 1:1） ==========

/** 确定批次处于哪个追溯环节（按种源→育苗→种植→采收→库存 优先级由后往前判断） */
function getBatchStage(batch) {
  if (batch.status === 'completed') return 'inventory'
  if (batch.actualQuantity > 0) return 'harvest'
  if (batch.hasPlanting) return 'planting'
  if (batch.hasSeedling) return 'seedling'
  if (batch.hasSeedSource) return 'seed'
  return 'plan'
}

/** 获取批次的环节信息 */
function getBatchStageInfo(batch) {
  if (!batch) return null
  const stageKey = getBatchStage(batch)
  return CHAIN_STAGES_CONFIG.find(s => s.key === stageKey) || null
}

/** 渲染 item 字段数组（用于阶段详情面板的环节记录卡片） */
function itemMetaFields(item) {
  const fields = []
  if (item.cropName) fields.push({ key: 'cropName', value: item.cropName })
  if (item.variety) fields.push({ key: 'variety', value: item.variety })
  if (item.greenhouse) fields.push({ key: 'greenhouse', value: item.greenhouse })
  if (item.supplierName) fields.push({ key: 'supplierName', value: item.supplierName })
  if (item.quantity != null) fields.push({ key: 'quantity', value: `${item.quantity}${item.unit || ''}` })
  return fields
}

// ========== 计算属性（V1.1 L233-247 1:1） ==========

/** 环节统计：优先使用API返回的独立统计数据，fallback到批次分类 */
const stageStats = computed(() => {
  if (chainStages.value.length > 0) {
    return CHAIN_STAGES_CONFIG.map(stage => {
      const apiStage = chainStages.value.find(s => s.key === stage.key)
      const stageBatches = batchItems.value.filter(b => getBatchStage(b) === stage.key)
      return {
        ...stage,
        count: apiStage ? apiStage.count : stageBatches.length,
        batches: stageBatches,
        items: apiStage?.items || []
      }
    })
  }
  return CHAIN_STAGES_CONFIG.map(stage => {
    const stageBatches = batchItems.value.filter(b => getBatchStage(b) === stage.key)
    return {
      ...stage,
      count: stageBatches.length,
      batches: stageBatches,
      items: []
    }
  })
})

/** 最大环节数量（用于进度条计算，V1.1 L83） */
const maxStageCount = computed(() => Math.max(...stageStats.value.map(s => s.count), 1))

// 整体统计（V1.1 L250-252）
const totalBatches = computed(() => batchItems.value.length)
const completedBatches = computed(() => batchItems.value.filter(b => b.status === 'completed').length)
const inProgressBatches = computed(() => batchItems.value.filter(b => b.status === 'in_progress').length)

// 分页数据（V1.1 L255-261）
const totalCount = computed(() => batchItems.value.length)
const paginatedBatches = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return batchItems.value.slice(start, end)
})

// ========== 事件处理（V1.1 L264-276） ==========

function handlePageChange(page) {
  currentPage.value = page
}

function handlePageSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
}

function handleViewBatch(batch) {
  selectedBatch.value = batch
  drawerOpen.value = true
}

function handleRowClick(row) {
  handleViewBatch(row)
}

/** 表格行 hover 样式（V1.1 L383：hover:bg-teal-50/50 transition-colors cursor-pointer） */
function tableRowClassName({ rowIndex }) {
  return 'chain-row cursor-pointer'
}

/** 表格表头蓝色渐变（V1.1 L358：bg-gradient-to-r from-blue-500 to-blue-600） */
function headerCellStyle() {
  return {
    background: 'linear-gradient(to right, #3b82f6, #2563eb)',
    color: '#ffffff',
    fontWeight: '600',
    borderBottom: 'none'
  }
}

// ========== 生命周期（V1.1 L227-230） ==========

onMounted(() => {
  summaryStore.fetchBatchStats({})
  summaryStore.fetchChainOverview()
})
</script>

<style scoped>
.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* el-drawer 内边距对齐 V1.1 DetailDrawer 默认 16px */
:deep(.el-drawer__body) {
  padding: 16px;
}

/* 表格行 hover 样式（对齐 V1.1 hover:bg-teal-50/50） */
:deep(.chain-row) {
  cursor: pointer;
  transition: background-color 0.15s ease;
}
:deep(.chain-row:hover) td {
  background-color: #f0fdfa !important;
}

/* el-table 表头 padding 调整 */
:deep(.el-table th) {
  padding: 12px 0;
}
</style>