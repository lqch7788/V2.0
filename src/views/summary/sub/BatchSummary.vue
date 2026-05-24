<template>
  <!-- 批次汇总子页面 -->
  <div class="space-y-6">
    <!-- 页面标题 - 仅当hideHeader为false时显示 -->
    <div v-if="!hideHeader" class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center gap-3">
        <div
          class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center"
        >
          <el-icon :size="24" color="white"><Layers /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">批次汇总</h1>
          <p class="text-gray-500">种植批次全生命周期数据汇总与状态跟踪</p>
        </div>
      </div>
    </div>

    <!-- KPI 指标卡片 -->
    <KpiCardGrid :columns="4" compact>
      <KpiCard
        :icon="Layers"
        label="总批次"
        :value="kpiCounts.total"
        colorScheme="slate"
        compact
      />
      <KpiCard
        :icon="Activity"
        label="进行中"
        :value="kpiCounts.inProgress"
        :trend="
          kpiCounts.total > 0
            ? Math.round((kpiCounts.inProgress / kpiCounts.total) * 100)
            : 0
        "
        colorScheme="purple"
        compact
      />
      <KpiCard
        :icon="CheckCircle"
        label="已完成"
        :value="kpiCounts.completed"
        :trend="
          kpiCounts.total > 0
            ? Math.round((kpiCounts.completed / kpiCounts.total) * 100)
            : 0
        "
        colorScheme="emerald"
        compact
      />
      <KpiCard
        :icon="AlertTriangle"
        label="逾期"
        :value="kpiCounts.overdue"
        colorScheme="red"
        compact
      />
    </KpiCardGrid>

    <!-- 筛选器 + 刷新 -->
    <div class="flex items-center justify-between">
      <div class="relative">
        <el-select
          v-model="statusFilter"
          placeholder="批次状态"
          clearable
          size="default"
          style="width: 200px"
          @change="handleStatusFilter"
        >
          <el-option label="全部状态" value="" />
          <el-option label="草稿" value="draft" />
          <el-option label="已发布" value="published" />
          <el-option label="规划中" value="planning" />
          <el-option label="进行中" value="in_progress" />
          <el-option label="已完成" value="completed" />
          <el-option label="已逾期" value="overdue" />
        </el-select>
      </div>
      <el-button @click="handleRefresh">
        刷新数据
      </el-button>
    </div>

    <!-- 批次甘特图（纯 CSS 实现） -->
    <div
      v-if="ganttData.bars.length > 0"
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <h2
        class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"
      >
        <el-icon :size="20" color="#8b5cf6"><Calendar /></el-icon>
        批次甘特图
      </h2>
      <!-- 图例 -->
      <div class="flex items-center gap-4 mb-4">
        <div class="flex items-center gap-1.5 text-xs text-gray-500">
          <div class="w-3 h-3 rounded bg-purple-500" />
          进行中
        </div>
        <div class="flex items-center gap-1.5 text-xs text-gray-500">
          <div class="w-3 h-3 rounded bg-emerald-500" />
          已完成
        </div>
        <div class="flex items-center gap-1.5 text-xs text-gray-500">
          <div class="w-3 h-3 rounded bg-red-500" />
          逾期
        </div>
        <div class="flex items-center gap-1.5 text-xs text-gray-500">
          <div class="w-3 h-3 rounded bg-gray-400" />
          规划中
        </div>
      </div>
      <!-- 甘特图主体 -->
      <div class="overflow-x-auto">
        <div class="min-w-[700px]">
          <div
            v-for="bar in ganttData.bars"
            :key="bar.id"
            class="flex items-center mb-2"
          >
            <!-- 批次标签 -->
            <div
              class="w-32 flex-shrink-0 text-xs text-gray-700 pr-3 truncate"
              :title="bar.batchName"
            >
              {{ bar.batchCode || bar.batchName }}
            </div>
            <!-- 甘特条轨道 -->
            <div
              class="flex-1 h-8 relative bg-gray-100 rounded-full overflow-hidden"
            >
              <!-- 甘特条 -->
              <div
                :class="[
                  'absolute top-1/2 -translate-y-1/2 h-6 rounded-full',
                  bar.color.bg,
                  bar.color.isAnimated ? 'gantt-stripe-animated' : '',
                ]"
                :style="{
                  left: `${bar.leftPct}%`,
                  width: `${bar.widthPct}%`,
                  minWidth: '4px',
                }"
              >
                <!-- 条内日期提示 -->
                <span
                  v-if="bar.widthPct > 8"
                  class="absolute inset-0 flex items-center justify-center text-[10px] text-white font-medium truncate px-1"
                >
                  {{ bar.startStr }} → {{ bar.endStr }}
                </span>
              </div>
            </div>
          </div>
          <!-- 时间轴 -->
          <div class="flex items-center mt-3">
            <div class="w-32 flex-shrink-0" />
            <div class="flex-1 flex justify-between text-[10px] text-gray-400">
              <span>{{ ganttData.minDateStr }}</span>
              <span>{{ ganttData.maxDateStr }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无数据提示 -->
    <div
      v-else-if="!isLoading"
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400"
    >
      暂无批次数据
    </div>

    <!-- 加载状态 -->
    <div
      v-if="isLoading && batchItems.length === 0"
      class="flex items-center justify-center h-64"
    >
      <el-icon class="is-loading" :size="32" color="#10b981"
        ><Loading
      /></el-icon>
    </div>

    <!-- 批次汇总表 -->
    <div
      v-if="batchItems.length > 0"
      class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div class="px-6 py-4 border-b border-gray-100">
        <h2 class="text-lg font-semibold text-gray-900">批次明细数据</h2>
      </div>
      <div class="overflow-x-auto">
        <el-table
          :data="paginatedBatches"
          style="width: 100%"
          @row-click="handleViewDetail"
        >
          <el-table-column prop="batchCode" label="批次编号" min-width="120" />
          <el-table-column prop="batchName" label="批次名称" min-width="120" />
          <el-table-column prop="cropName" label="作物" min-width="100" />
          <el-table-column prop="greenhouse" label="温室" min-width="120" />
          <el-table-column prop="status" label="状态" min-width="100">
            <template #default="{ row }">
              <span
                :class="[
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  STATUS_BADGE[row.status] || 'bg-gray-100 text-gray-500',
                ]"
              >
                {{ STATUS_LABEL[row.status] || row.status || "-" }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="targetYield"
            label="目标产量(kg)"
            min-width="120"
            align="right"
          >
            <template #default="{ row }">
              {{ formatNumber(row.targetYield) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="actualQuantity"
            label="实际产量(kg)"
            min-width="120"
            align="right"
          >
            <template #default="{ row }">
              {{ formatNumber(row.actualQuantity) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="completionRate"
            label="完成率"
            min-width="120"
            align="center"
          >
            <template #default="{ row }">
              <div class="flex items-center gap-2 justify-center">
                <div
                  class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden min-w-[60px] max-w-[80px]"
                >
                  <div
                    :class="[
                      'h-full rounded-full transition-all',
                      row.completionRate >= 100
                        ? 'bg-emerald-500'
                        : row.completionRate >= 50
                          ? 'bg-purple-500'
                          : row.completionRate >= 20
                            ? 'bg-amber-500'
                            : 'bg-red-500',
                    ]"
                    :style="{
                      width: `${Math.min(row.completionRate || 0, 100)}%`,
                    }"
                  />
                </div>
                <span class="text-xs text-gray-500 w-10 text-right">
                  {{ (row.completionRate || 0).toFixed(0) }}%
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="totalWorkHours"
            label="总工时(h)"
            min-width="100"
            align="right"
          >
            <template #default="{ row }">
              {{ row.totalWorkHours ? row.totalWorkHours.toFixed(1) : "-" }}
            </template>
          </el-table-column>
          <el-table-column
            prop="laborCost"
            label="人工成本(元)"
            min-width="120"
            align="right"
          >
            <template #default="{ row }">
              {{ row.laborCost ? formatCurrency(row.laborCost) : "-" }}
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="100" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                size="small"
                @click.stop="handleViewDetail(row)"
              >
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div
        v-if="totalCount > 0"
        class="px-4 py-3 border-t border-gray-100 flex items-center justify-between"
      >
        <div class="text-sm text-gray-500">
          显示 {{ paginationStart }} - {{ paginationEnd }} 条，共
          {{ totalCount }} 条
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalCount"
          layout="total, sizes, prev, pager, next, jumper"
          background
          small
          @current-change="handlePageChange"
          @size-change="handlePageSizeChange"
        />
      </div>
    </div>

    <!-- 批次详情抽屉 -->
    <ElDrawer
      v-model="drawerVisible"
      :title="`批次详情 - ${selectedBatch?.batchCode || ''}`"
      direction="rtl"
      :size="'500px'"
      :show-footer="false"
    >
      <div v-if="selectedBatch" class="space-y-4">
        <!-- 基本信息 -->
        <div>
          <h3
            class="text-sm font-semibold text-gray-700 mb-2 pb-2 border-b border-gray-100"
          >
            基本信息
          </h3>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-gray-400">批次编号：</span>
              <span class="text-gray-900 font-medium">{{
                selectedBatch.batchCode
              }}</span>
            </div>
            <div>
              <span class="text-gray-400">批次名称：</span>
              <span class="text-gray-900">{{ selectedBatch.batchName }}</span>
            </div>
            <div>
              <span class="text-gray-400">作物品种：</span>
              <span class="text-gray-900">{{ selectedBatch.cropName }}</span>
            </div>
            <div>
              <span class="text-gray-400">品种：</span>
              <span class="text-gray-900">{{
                selectedBatch.variety || "-"
              }}</span>
            </div>
            <div>
              <span class="text-gray-400">温室：</span>
              <span class="text-gray-900">{{ selectedBatch.greenhouse }}</span>
            </div>
            <div>
              <span class="text-gray-400">种植面积：</span>
              <span class="text-gray-900">{{
                selectedBatch.plantingArea || "-"
              }}</span>
            </div>
            <div>
              <span class="text-gray-400">状态：</span>
              <span
                :class="[
                  'inline-block px-2.5 py-0.5 rounded-full text-xs font-medium',
                  STATUS_BADGE[selectedBatch.status] ||
                    'bg-gray-100 text-gray-700',
                ]"
              >
                {{ STATUS_LABEL[selectedBatch.status] || selectedBatch.status }}
              </span>
            </div>
          </div>
        </div>

        <!-- 产量信息 -->
        <div>
          <h3
            class="text-sm font-semibold text-gray-700 mb-2 pb-2 border-b border-gray-100"
          >
            产量信息
          </h3>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-gray-400">目标产量：</span>
              <span class="text-gray-900 font-medium"
                >{{ formatNumber(selectedBatch.targetYield) }} kg</span
              >
            </div>
            <div>
              <span class="text-gray-400">实际产量：</span>
              <span class="text-gray-900 font-medium"
                >{{ formatNumber(selectedBatch.actualQuantity) }} kg</span
              >
            </div>
            <div>
              <span class="text-gray-400">采收数量：</span>
              <span class="text-gray-900"
                >{{ formatNumber(selectedBatch.harvestQuantity) }} kg</span
              >
            </div>
            <div>
              <span class="text-gray-400">剩余产量：</span>
              <span class="text-gray-900"
                >{{ formatNumber(selectedBatch.remainingYield) }} kg</span
              >
            </div>
            <div class="col-span-2">
              <span class="text-gray-400">完成率：</span>
              <div class="inline-flex items-center gap-2 ml-1">
                <div class="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full bg-purple-500"
                    :style="{
                      width: `${Math.min(selectedBatch.completionRate || 0, 100)}%`,
                    }"
                  />
                </div>
                <span class="text-gray-900 font-medium"
                  >{{ (selectedBatch.completionRate || 0).toFixed(1) }}%</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- 日期信息 -->
        <div>
          <h3
            class="text-sm font-semibold text-gray-700 mb-2 pb-2 border-b border-gray-100"
          >
            时间节点
          </h3>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-gray-400">种植日期：</span>
              <span class="text-gray-900">{{
                selectedBatch.plantingDate || "-"
              }}</span>
            </div>
            <div>
              <span class="text-gray-400">预计采收：</span>
              <span class="text-gray-900">{{
                selectedBatch.expectedHarvestDate || "-"
              }}</span>
            </div>
            <div>
              <span class="text-gray-400">实际采收：</span>
              <span class="text-gray-900">{{
                selectedBatch.actualHarvestDate || "-"
              }}</span>
            </div>
          </div>
        </div>

        <!-- 任务信息 -->
        <div>
          <h3
            class="text-sm font-semibold text-gray-700 mb-2 pb-2 border-b border-gray-100"
          >
            任务统计
          </h3>
          <div class="grid grid-cols-3 gap-3 text-sm">
            <div class="text-center p-3 bg-purple-50 rounded-lg">
              <p class="text-lg font-bold text-purple-700">
                {{ selectedBatch.taskCount || 0 }}
              </p>
              <p class="text-xs text-purple-500">总任务</p>
            </div>
            <div class="text-center p-3 bg-emerald-50 rounded-lg">
              <p class="text-lg font-bold text-emerald-700">
                {{ selectedBatch.completedTaskCount || 0 }}
              </p>
              <p class="text-xs text-emerald-500">已完成</p>
            </div>
            <div class="text-center p-3 bg-amber-50 rounded-lg">
              <p class="text-lg font-bold text-amber-700">
                {{ selectedBatch.pendingTaskCount || 0 }}
              </p>
              <p class="text-xs text-amber-500">待处理</p>
            </div>
          </div>
        </div>

        <!-- 成本信息 -->
        <div>
          <h3
            class="text-sm font-semibold text-gray-700 mb-2 pb-2 border-b border-gray-100"
          >
            人力成本
          </h3>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-gray-400">总工时：</span>
              <span class="text-gray-900 font-medium">
                {{
                  selectedBatch.totalWorkHours
                    ? selectedBatch.totalWorkHours.toFixed(1) + " 小时"
                    : "-"
                }}
              </span>
            </div>
            <div>
              <span class="text-gray-400">人工成本：</span>
              <span class="text-gray-900 font-medium">
                {{
                  selectedBatch.laborCost
                    ? formatCurrency(selectedBatch.laborCost)
                    : "-"
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </ElDrawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  Layers,
  Activity,
  CheckCircle,
  AlertTriangle,
} from "lucide-vue-next";
import { useSummaryStore } from "@/stores/modules/summary";
import { KpiCard, KpiCardGrid } from "@/components/summary";
import ElDrawer from "@/components/ui/ElDrawer.vue";

// ========== Props ==========
const props = defineProps({
  hideHeader: {
    type: Boolean,
    default: false
  }
});

// ========== 状态 Badge 样式映射 ==========
const STATUS_BADGE = {
  draft: "bg-gray-100 text-gray-600",
  planning: "bg-gray-100 text-gray-700",
  published: "bg-blue-100 text-blue-600",
  in_progress: "bg-purple-100 text-purple-700",
  completed: "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
};

const STATUS_LABEL = {
  draft: "草稿",
  planning: "规划中",
  published: "已发布",
  in_progress: "进行中",
  completed: "已完成",
  overdue: "已逾期",
};

// ========== 甘特图颜色映射 ==========
const GANTT_COLORS = {
  draft: { bg: "bg-gray-300" },
  planning: { bg: "bg-gray-400" },
  published: { bg: "bg-blue-400" },
  in_progress: { bg: "bg-purple-500" },
  completed: { bg: "bg-emerald-500" },
  overdue: { bg: "bg-red-500", isAnimated: true },
};

// ========== Store ==========
const summaryStore = useSummaryStore();

const batchItems = computed(() => summaryStore.batchItems);
const isLoading = computed(() => summaryStore.isLoading);

// ========== 本地状态 ==========
const statusFilter = ref("");
const selectedBatch = ref(null);
const drawerVisible = ref(false);

// ========== 分页状态 ==========
const currentPage = ref(1);
const pageSize = ref(10);

// ========== 工具函数 ==========
/** 格式化金额为千分位 */
function formatCurrency(value) {
  return (
    value.toLocaleString("zh-CN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }) + " 元"
  );
}

/** 格式化数字 */
function formatNumber(value) {
  return value?.toLocaleString("zh-CN") || "0";
}

/** 解析日期字符串为 Date 对象 */
function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

/** 日期天数差 */
function daysBetween(a, b) {
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/** 格式化日期为 YYYY-MM-DD */
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ========== KPI 计算 ==========
const kpiCounts = computed(() => {
  const planning = batchItems.value.filter(
    (b) => b.status === "planning",
  ).length;
  const inProgress = batchItems.value.filter(
    (b) => b.status === "in_progress",
  ).length;
  const completed = batchItems.value.filter(
    (b) => b.status === "completed",
  ).length;
  const overdue = batchItems.value.filter((b) => b.status === "overdue").length;
  return {
    total: batchItems.value.length,
    planning,
    inProgress: inProgress + planning, // 进行中 = in_progress + planning
    completed,
    overdue,
  };
});

// ========== 筛选后的批次数据 ==========
const filteredBatches = computed(() => {
  if (!statusFilter.value) return batchItems.value;
  return batchItems.value.filter((b) => b.status === statusFilter.value);
});

// ========== 分页后的批次数据 ==========
const totalCount = computed(() => filteredBatches.value.length);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalCount.value / pageSize.value)),
);
const paginatedBatches = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredBatches.value.slice(start, end);
});
const paginationStart = computed(() =>
  Math.min((currentPage.value - 1) * pageSize.value + 1, totalCount.value),
);
const paginationEnd = computed(() =>
  Math.min(currentPage.value * pageSize.value, totalCount.value),
);

// ========== 甘特图计算 ==========
const ganttData = computed(() => {
  if (filteredBatches.value.length === 0) {
    return {
      bars: [],
      minDate: new Date(),
      maxDate: new Date(),
      totalDays: 1,
      minDateStr: "",
      maxDateStr: "",
    };
  }

  // 找到最早和最晚日期
  let minDate = null;
  let maxDate = null;

  const bars = filteredBatches.value.map((batch) => {
    const start = parseDate(batch.plantingDate);
    const endPlan = parseDate(batch.expectedHarvestDate);
    const endActual = parseDate(batch.actualHarvestDate);
    const end =
      (batch.status === "completed" || batch.status === "overdue") && endActual
        ? endActual
        : endPlan;

    if (start) {
      if (!minDate || start < minDate) minDate = start;
    }
    if (end) {
      if (!maxDate || end > maxDate) maxDate = end;
    }

    return {
      id: batch.id,
      batchCode: batch.batchCode,
      batchName: batch.batchName,
      start,
      end,
      startStr: start ? formatDate(start) : "",
      endStr: end ? formatDate(end) : "",
      status: batch.status,
      color: GANTT_COLORS[batch.status] || GANTT_COLORS.planning,
    };
  });

  const fallback = new Date();
  const effectiveMin = minDate || fallback;
  const effectiveMax =
    maxDate || new Date(fallback.getTime() + 30 * 24 * 60 * 60 * 1000);
  const totalDays = daysBetween(effectiveMin, effectiveMax) || 1;

  // 计算每条甘特条的位置和宽度
  const processedBars = bars
    .filter((bar) => bar.start && bar.end)
    .map((bar) => {
      const leftPct = Math.max(
        0,
        (daysBetween(effectiveMin, bar.start) / totalDays) * 100,
      );
      const widthPct = Math.max(
        1,
        (daysBetween(bar.start, bar.end) / totalDays) * 100,
      );
      return {
        ...bar,
        leftPct,
        widthPct,
      };
    });

  return {
    bars: processedBars,
    minDate: effectiveMin,
    maxDate: effectiveMax,
    totalDays,
    minDateStr: formatDate(effectiveMin),
    maxDateStr: formatDate(effectiveMax),
  };
});

// ========== 分页变化处理 ==========
const handlePageChange = (page) => {
  currentPage.value = page;
};

const handlePageSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
};

// ========== 筛选变更 ==========
const handleStatusFilter = (status) => {
  currentPage.value = 1;
  summaryStore.fetchBatchStats(status ? { status } : {});
};

// ========== 刷新数据 ==========
const handleRefresh = () => {
  summaryStore.fetchBatchStats(
    statusFilter.value ? { status: statusFilter.value } : {},
  );
};

// ========== 打开批次详情 ==========
const handleViewDetail = (row) => {
  selectedBatch.value = row;
  drawerVisible.value = true;
};

// ========== 初始加载 ==========
onMounted(() => {
  summaryStore.fetchBatchStats({});
});
</script>

<style scoped>
.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes ganttStripe {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 20px 0;
  }
}
.gantt-stripe-animated {
  background-image: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 5px,
    rgba(255, 255, 255, 0.2) 5px,
    rgba(255, 255, 255, 0.2) 10px
  );
  background-size: 20px 20px;
  animation: ganttStripe 1s linear infinite;
}
</style>
