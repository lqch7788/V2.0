<template>
  <div class="space-y-6">
    <!-- Page Header - 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" class="text-white">
              <DataAnalysis />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">基地总览</h1>
            <p class="text-gray-500">实时监控农业生产运营状况</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Grid - 统计卡片网格 (与V1.1完全一致) -->
    <div class="grid grid-cols-6 gap-4">
      <TodayTasksCard />
      <AlertsCard />
      <EquipmentStatusCard />
      <InventoryAlertCard />
      <ProductionProgressCard />
      <EnergyCard />
    </div>

    <!-- Main Content Grid - 主内容网格 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column - 左侧列 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 崇明岛基地概况 -->
        <div class="card-garden rounded-xl overflow-hidden">
          <div class="px-5 py-4 border-b border-green-100">
            <div class="flex items-center justify-between flex-wrap gap-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
                  <el-icon :size="16" class="text-white">
                    <LocationInformation />
                  </el-icon>
                </div>
                <h3 class="text-base font-bold text-gray-800">崇明岛基地概况</h3>
              </div>
              <div class="flex items-center gap-6 text-sm">
                <span><span class="text-emerald-600 font-medium">总面积：</span><span class="font-semibold text-gray-700">1500亩</span></span>
                <span><span class="text-emerald-600 font-medium">温室区域：</span><span class="font-semibold text-gray-700">12个 (80000㎡)</span></span>
                <span><span class="text-amber-600 font-medium">大田面积：</span><span class="font-semibold text-gray-700">700亩</span></span>
                <span class="text-gray-400">|</span>
                <span class="text-gray-500">启用时间：2020年3月</span>
              </div>
            </div>
          </div>
          <div class="p-5 space-y-5">
            <!-- 基地总览图 - SVG科技风格地图 -->
            <GreenhouseMap :expanded="overviewExpanded" @toggle="overviewExpanded = !overviewExpanded" @map-click="greenhouseTableExpanded = true" />

            <!-- 温室区域表格 -->
            <GreenhouseTable
              :expanded="greenhouseTableExpanded"
              @toggle="greenhouseTableExpanded = !greenhouseTableExpanded"
              @detail-click="handleGreenhouseDetail"
            />

            <!-- 大田区域表格 -->
            <FieldTable
              :expanded="fieldTableExpanded"
              @toggle="fieldTableExpanded = !fieldTableExpanded"
              @detail-click="handleFieldDetail"
            />
          </div>
        </div>

        <!-- 种植区环境参数表 -->
        <EnvironmentTable
          :selected-region="selectedRegion"
          :greenhouse-list="greenhouseList"
          :paginated-data="paginatedGreenhouseData"
          :env-data="greenhouseEnvData"
          :page="greenhousePage"
          :page-size="greenhousePageSize"
          :total-pages="totalGreenhousePages"
          @region-change="selectedRegion = $event"
          @page-change="greenhousePage = $event"
          @page-size-change="handlePageSizeChange"
          @detail-click="handleEnvDetail"
        />

        <!-- 今日任务表格 -->
        <TodayTasksTable :tasks="todayTasks" />

        <!-- 活跃种植批次 -->
        <ActiveBatchesTable :batches="mappedBatches" />
      </div>

      <!-- Right Column - 右侧列 -->
      <div class="lg:col-span-1 space-y-6">
        <!-- 气象信息 -->
        <WeatherWidget />

        <!-- 月度产量统计图表 -->
        <YieldChart
          :region="yieldRegion"
          :crop="yieldCrop"
          :data="filteredYieldStats"
          @region-change="yieldRegion = $event"
          @crop-change="yieldCrop = $event"
        />

        <!-- 成本构成分析图表 -->
        <CostChart
          :period="costPeriod"
          :crop="costCrop"
          :area-type="costAreaType"
          :data="filteredCostAnalysis"
          @period-change="costPeriod = $event"
          @crop-change="costCrop = $event"
          @area-type-change="costAreaType = $event"
        />
      </div>
    </div>

    <!-- 温室内环境参数详情弹窗 -->
    <el-dialog v-model="showEnvDetailModal" title="温室环境详情" width="900px">
      <div v-if="selectedEnv">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="温室名称">{{ selectedEnv.name }}</el-descriptions-item>
          <el-descriptions-item label="空气温度">{{ selectedEnv.airTemp?.value }} {{ selectedEnv.airTemp?.unit }}</el-descriptions-item>
          <el-descriptions-item label="空气湿度">{{ selectedEnv.airHumidity?.value }} {{ selectedEnv.airHumidity?.unit }}</el-descriptions-item>
          <el-descriptions-item label="光照度">{{ selectedEnv.light?.value }} {{ selectedEnv.light?.unit }}</el-descriptions-item>
          <el-descriptions-item label="CO2浓度">{{ selectedEnv.co2?.value }} {{ selectedEnv.co2?.unit }}</el-descriptions-item>
          <el-descriptions-item label="土壤温度">{{ selectedEnv.soilTemp?.value }} {{ selectedEnv.soilTemp?.unit }}</el-descriptions-item>
          <el-descriptions-item label="土壤湿度">{{ selectedEnv.soilMoisture?.value }} {{ selectedEnv.soilMoisture?.unit }}</el-descriptions-item>
          <el-descriptions-item label="EC值">{{ selectedEnv.soilEc?.value }} {{ selectedEnv.soilEc?.unit }}</el-descriptions-item>
          <el-descriptions-item label="PH值">{{ selectedEnv.soilPh?.value }} {{ selectedEnv.soilPh?.unit }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 基地详情弹窗（温室/大田详情） -->
    <BaseDetailModal
      :is-open="showBaseDetailModal"
      :selected-detail="selectedDetail"
      :enlarged-image-index="enlargedImageIndex"
      @close="showBaseDetailModal = false"
      @enter="handleEnterClick"
      @image-click="handleImageClick"
      @update:is-open="showBaseDetailModal = $event"
    />

    <!-- 温室详情弹窗 -->
    <GreenhouseDetailModal
      :is-open="showGreenhouseDetailModal"
      :selected-greenhouse="selectedGreenhouse"
      :greenhouse-env-data="greenhouseEnvData"
      :get-crop-info="getCropInfo"
      @close="showGreenhouseDetailModal = false"
      @update:is-open="showGreenhouseDetailModal = $event"
    />

    <!-- 图片放大弹窗 -->
    <ImageEnlargementModal
      :is-open="enlargedImageIndex !== null"
      :image-index="enlargedImageIndex || 1"
      @close="enlargedImageIndex = null"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { DataAnalysis, LocationInformation } from '@element-plus/icons-vue'
import TodayTasksCard from './components/TodayTasksCard.vue'
import AlertsCard from './components/AlertsCard.vue'
import EquipmentStatusCard from './components/EquipmentStatusCard.vue'
import InventoryAlertCard from './components/InventoryAlertCard.vue'
import ProductionProgressCard from './components/ProductionProgressCard.vue'
import EnergyCard from './components/EnergyCard.vue'
import GreenhouseMap from './components/GreenhouseMap.vue'
import GreenhouseTable from './components/GreenhouseTable.vue'
import FieldTable from './components/FieldTable.vue'
import EnvironmentTable from './components/EnvironmentTable.vue'
import TodayTasksTable from './components/TodayTasksTable.vue'
import ActiveBatchesTable from './components/ActiveBatchesTable.vue'
import WeatherWidget from '@/components/dashboard/widgets/WeatherWidget.vue'
import YieldChart from './components/YieldChart.vue'
import CostChart from './components/CostChart.vue'
import BaseDetailModal from './components/BaseDetailModal.vue'
import GreenhouseDetailModal from './components/GreenhouseDetailModal.vue'
import ImageEnlargementModal from '@/components/dashboard/ImageEnlargementModal.vue'
import { useDashboard } from '@/composables/useDashboard'

// 使用Dashboard composable（对应V1.1 useDashboard Hook）
const {
  // 状态
  activeTab,
  greenhousePage,
  greenhousePageSize,
  selectedRegion,
  isDetailModalOpen,
  selectedGreenhouse,
  greenhouseTableExpanded,
  overviewExpanded,
  fieldTableExpanded,
  selectedDetail,
  enlargedImageIndex,
  yieldRegion,
  yieldCrop,
  costPeriod,
  costCrop,
  costAreaType,
  // 计算数据
  todayTasks,
  criticalSensors,
  filteredSensors,
  greenhouseList,
  greenhouseEnvData,
  totalGreenhousePages,
  paginatedGreenhouseData,
  mappedBatches,
  // 函数
  handleDetailClick,
  getDetailSensorData,
  getCropInfo,
  handleDetailClickWrapper,
} = useDashboard()

// 弹窗状态
const showEnvDetailModal = ref(false)
const selectedEnv = ref(null)
const showBaseDetailModal = ref(false)
const showGreenhouseDetailModal = ref(false)

// 产量统计数据（V1.1使用farmData静态数据）
const filteredYieldStats = ref([
  { month: '1月', yield: 1200 },
  { month: '2月', yield: 1500 },
  { month: '3月', yield: 1800 },
  { month: '4月', yield: 2200 },
  { month: '5月', yield: 2600 },
  { month: '6月', yield: 2400 },
])

// 成本分析数据（V1.1使用farmData静态数据）
const filteredCostAnalysis = ref([
  { name: '人工成本', value: 35 },
  { name: '肥料成本', value: 25 },
  { name: '水电成本', value: 15 },
  { name: '设备折旧', value: 15 },
  { name: '其他成本', value: 10 },
])

// 处理温室详情
const handleGreenhouseDetail = (data) => {
  handleDetailClickWrapper(data)
  showBaseDetailModal.value = true
}

const handleFieldDetail = (data) => {
  handleDetailClickWrapper(data)
  showBaseDetailModal.value = true
}

const handleEnvDetail = (greenhouseId) => {
  selectedGreenhouse.value = greenhouseId
  // 从greenhouseEnvData中查找对应的环境数据
  selectedEnv.value = greenhouseEnvData.value.find(g => g.id === greenhouseId) || null
  showGreenhouseDetailModal.value = true
}

const handlePageSizeChange = (size) => {
  greenhousePageSize.value = size
  greenhousePage.value = 1
}

const handleEnterClick = () => {
  showBaseDetailModal.value = false
  selectedDetail.value = null
}

const handleImageClick = (index) => {
  enlargedImageIndex.value = index
}
</script>

<style>
/* 田园风格卡片 */
.card-garden {
  background: linear-gradient(135deg, #f8faf7 0%, #f0f5eb 100%);
  border: 1px solid #d4e4c8;
  position: relative;
  overflow: hidden;
}

.card-garden::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #65a30d, #84cc16, #65a30d);
  opacity: 0.8;
}
</style>
