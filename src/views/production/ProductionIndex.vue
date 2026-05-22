<template>
  <div class="space-y-6">
    <!-- 页面标题卡片 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" color="white">
            <List />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">生产管理</h1>
          <p class="text-gray-500">管理生产批次、种植计划和采收任务</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <ProductionStatsCards :batches="batches" />

    <!-- 快捷入口卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 种植计划 -->
      <div
        class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-emerald-500 cursor-pointer hover:shadow-md transition-shadow"
        @click="goTo('/production')"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 mb-1">种植计划</p>
            <p class="text-lg font-bold text-gray-900">{{ plantingPlanCount }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <el-icon :size="24" color="#10b981">
              <Document />
            </el-icon>
          </div>
        </div>
        <div class="mt-3 flex items-center text-sm text-emerald-600">
          <span>查看详情</span>
          <el-icon class="ml-1"><ArrowRight /></el-icon>
        </div>
      </div>

      <!-- 采收管理 -->
      <div
        class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-orange-500 cursor-pointer hover:shadow-md transition-shadow"
        @click="goTo('/harvest')"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 mb-1">采收管理</p>
            <p class="text-lg font-bold text-gray-900">{{ harvestCount }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <el-icon :size="24" color="#f97316">
              <Basketball />
            </el-icon>
          </div>
        </div>
        <div class="mt-3 flex items-center text-sm text-orange-600">
          <span>查看详情</span>
          <el-icon class="ml-1"><ArrowRight /></el-icon>
        </div>
      </div>

      <!-- 质量检测 -->
      <div
        class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500 cursor-pointer hover:shadow-md transition-shadow"
        @click="goTo('/crop/instance')"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 mb-1">质量检测</p>
            <p class="text-lg font-bold text-gray-900">{{ qualityCheckCount }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <el-icon :size="24" color="#3b82f6">
              <CircleCheck />
            </el-icon>
          </div>
        </div>
        <div class="mt-3 flex items-center text-sm text-blue-600">
          <span>查看详情</span>
          <el-icon class="ml-1"><ArrowRight /></el-icon>
        </div>
      </div>

      <!-- 技术方案 -->
      <div
        class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500 cursor-pointer hover:shadow-md transition-shadow"
        @click="goTo('/tech-solution')"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 mb-1">技术方案</p>
            <p class="text-lg font-bold text-gray-900">{{ techSolutionCount }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <el-icon :size="24" color="#a855f7">
              <Memo />
            </el-icon>
          </div>
        </div>
        <div class="mt-3 flex items-center text-sm text-purple-600">
          <span>查看详情</span>
          <el-icon class="ml-1"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>

    <!-- 日计划和月计划入口 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 日计划 -->
      <div
        class="bg-white rounded-xl p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        @click="goTo('/daily-planning')"
      >
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <el-icon :size="28" color="white">
              <Calendar />
            </el-icon>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-900">日计划</h3>
            <p class="text-sm text-gray-500">管理每日生产计划任务</p>
          </div>
          <div class="flex items-center text-sm text-blue-600">
            <span>进入</span>
            <el-icon class="ml-1"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>

      <!-- 月计划 -->
      <div
        class="bg-white rounded-xl p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        @click="goTo('/monthly-planning')"
      >
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <el-icon :size="28" color="white">
              <Calendar />
            </el-icon>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-900">月计划</h3>
            <p class="text-sm text-gray-500">管理月度生产计划</p>
          </div>
          <div class="flex items-center text-sm text-purple-600">
            <span>进入</span>
            <el-icon class="ml-1"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近生产批次 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">最近生产批次</h3>
        <el-button type="primary" link @click="goTo('/production')">
          查看全部
          <el-icon class="ml-1"><ArrowRight /></el-icon>
        </el-button>
      </div>
      <el-table :data="recentBatches" stripe>
        <el-table-column prop="batchCode" label="批次编号" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click="goTo('/production')">
              {{ row.batchCode }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="cropName" label="作物名称" width="120" />
        <el-table-column prop="variety" label="品种" min-width="120" />
        <el-table-column prop="greenhouseName" label="种植区域" width="120" />
        <el-table-column prop="plantingArea" label="种植面积" width="100">
          <template #default="{ row }">
            {{ row.plantingArea }} m²
          </template>
        </el-table-column>
        <el-table-column prop="stageName" label="当前阶段" width="100">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.stageName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="batchStatus" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.batchStatus)" size="small">
              {{ getStatusName(row.batchStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="expectedHarvestDate" label="预计采收" width="120" />
      </el-table>
      <div v-if="recentBatches.length === 0" class="p-8 text-center text-gray-500">
        暂无生产批次数据
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { List, Document, Basketball, CircleCheck, Memo, Calendar, ArrowRight } from '@element-plus/icons-vue'
import ProductionStatsCards from '@/components/production/ProductionStatsCards.vue'
import { useProductionPlanStore } from '@/stores/modules/productionPlan'

const router = useRouter()
const productionPlanStore = useProductionPlanStore()

// 统计数据
const batches = computed(() => productionPlanStore.plans)

const plantingPlanCount = computed(() =>
  batches.value.filter(b => b.planType === 'planting').length
)

const harvestCount = computed(() =>
  batches.value.filter(b => b.batchStatus === 'approved').length
)

const qualityCheckCount = computed(() =>
  batches.value.filter(b => b.batchStatus === 'completed').length
)

const techSolutionCount = ref(0)

// 最近批次（取前5条）
const recentBatches = computed(() => {
  return [...batches.value]
    .sort((a, b) => (b.lastModifyDate || '').localeCompare(a.lastModifyDate || ''))
    .slice(0, 5)
})

// 状态标签映射
const getStatusName = (status) => {
  const statusMap = {
    draft: '草稿',
    pending: '待审批',
    approved: '已审批',
    rejected: '已拒绝',
    completed: '已完成',
    cancelled: '已作废'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    draft: 'info',
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    completed: 'success',
    cancelled: 'info'
  }
  return typeMap[status] || 'info'
}

// 路由跳转
const goTo = (path) => {
  router.push(path)
}

// 加载数据
onMounted(async () => {
  await productionPlanStore.fetchPlans()
})
</script>
