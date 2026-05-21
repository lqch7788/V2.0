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
        <ActiveBatchesTable :batches="activeBatches" />
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
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

// 展开状态
const overviewExpanded = ref(true)
const greenhouseTableExpanded = ref(true)
const fieldTableExpanded = ref(true)

// 环境参数相关状态
const selectedRegion = ref('')
const greenhousePage = ref(1)
const greenhousePageSize = ref(10)
const showEnvDetailModal = ref(false)
const selectedEnv = ref(null)

// 产量统计筛选
const yieldRegion = ref('')
const yieldCrop = ref('')

// 成本分析筛选
const costPeriod = ref('month')
const costCrop = ref('')
const costAreaType = ref('')

// 温室列表
const greenhouseList = ref([
  { id: 'G001', name: '1号棚' },
  { id: 'G002', name: '2号棚' },
  { id: 'G003', name: '3号棚' },
  { id: 'G004', name: '4号棚' },
  { id: 'G005', name: '5号棚' },
  { id: 'G006', name: '6号棚' },
])

// 环境参数数据

const greenhouseEnvData = ref([
  { id: 'G001', name: '1号棚', airTemp: { value: '25.3', unit: '°C', status: 'normal' }, airHumidity: { value: '65', unit: '%', status: 'normal' }, light: { value: '12000', unit: 'Lux', status: 'normal' }, co2: { value: '450', unit: 'ppm', status: 'normal' }, soilTemp: { value: '22.1', unit: '°C', status: 'normal' }, soilMoisture: { value: '58', unit: '%', status: 'normal' }, soilEc: { value: '2.5', unit: 'ms/cm', status: 'normal' }, soilPh: { value: '6.8', unit: '', status: 'normal' } },
  { id: 'G002', name: '2号棚', airTemp: { value: '24.8', unit: '°C', status: 'normal' }, airHumidity: { value: '68', unit: '%', status: 'normal' }, light: { value: '11500', unit: 'Lux', status: 'normal' }, co2: { value: '420', unit: 'ppm', status: 'normal' }, soilTemp: { value: '21.5', unit: '°C', status: 'normal' }, soilMoisture: { value: '62', unit: '%', status: 'normal' }, soilEc: { value: '2.3', unit: 'ms/cm', status: 'normal' }, soilPh: { value: '6.5', unit: '', status: 'normal' } },
  { id: 'G003', name: '3号棚', airTemp: { value: '26.2', unit: '°C', status: 'warning' }, airHumidity: { value: '75', unit: '%', status: 'warning' }, light: { value: '15000', unit: 'Lux', status: 'warning' }, co2: { value: '520', unit: 'ppm', status: 'warning' }, soilTemp: { value: '23.5', unit: '°C', status: 'normal' }, soilMoisture: { value: '70', unit: '%', status: 'warning' }, soilEc: { value: '2.8', unit: 'ms/cm', status: 'normal' }, soilPh: { value: '7.0', unit: '', status: 'normal' } },
])

const totalGreenhousePages = computed(() => Math.ceil(greenhouseEnvData.value.length / greenhousePageSize.value))

const paginatedGreenhouseData = computed(() => {
  let data = greenhouseEnvData.value
  if (selectedRegion.value) {
    data = data.filter(g => g.id === selectedRegion.value)
  }
  const start = (greenhousePage.value - 1) * greenhousePageSize.value
  return data.slice(start, start + greenhousePageSize.value)
})

const handlePageSizeChange = (size) => {
  greenhousePageSize.value = size
  greenhousePage.value = 1
}

const handleEnvDetail = (greenhouseId) => {
  const env = greenhouseEnvData.value.find(g => g.id === greenhouseId)
  if (env) {
    selectedEnv.value = env
    showEnvDetailModal.value = true
  }
}

// 今日任务数据
const workDuration = '2小时'

const todayTasks = ref([
  { id: '1', title: '温室A1浇水', greenhouseName: '1号棚', priority: 'normal', status: 'in_progress', assigneeName: '张伟民', workDuration, dueDate: '2024-03-18' },
  { id: '2', title: '温室B2施肥', greenhouseName: '2号棚', priority: 'high', status: 'pending', assigneeName: '李明轩', workDuration, dueDate: '2024-03-18' },
  { id: '3', title: '温室C1巡查', greenhouseName: '3号棚', priority: 'normal', status: 'completed', assigneeName: '王建国', workDuration, dueDate: '2024-03-18' },
  { id: '4', title: '大田A区除草', greenhouseName: 'A区', priority: 'urgent', status: 'pending', assigneeName: '赵俊杰', workDuration, dueDate: '2024-03-18' },
])

// 活跃种植批次数据

const activeBatches = ref([
  { id: '1', batchCode: 'B2024001', cropName: '番茄', greenhouseName: '1号棚', stage: 'fruiting', stageName: '结果期' },
  { id: '2', batchCode: 'B2024002', cropName: '黄瓜', greenhouseName: '2号棚', stage: 'vegetative', stageName: '生长期' },
  { id: '3', batchCode: 'B2024003', cropName: '辣椒', greenhouseName: '3号棚', stage: 'flowering', stageName: '开花期' },
  { id: '4', batchCode: 'B2024004', cropName: '草莓', greenhouseName: '4号棚', stage: 'harvest', stageName: '采收期' },
  { id: '5', batchCode: 'B2024005', cropName: '生菜', greenhouseName: '5号棚', stage: 'seedling', stageName: '育苗期' },
])

// 产量统计数据
const filteredYieldStats = ref([
  { month: '1月', yield: 1200 },
  { month: '2月', yield: 1500 },
  { month: '3月', yield: 1800 },
  { month: '4月', yield: 2200 },
  { month: '5月', yield: 2600 },
  { month: '6月', yield: 2400 },
])

// 成本分析数据
const filteredCostAnalysis = ref([
  { name: '人工成本', value: 35 },
  { name: '肥料成本', value: 25 },
  { name: '水电成本', value: 15 },
  { name: '设备折旧', value: 15 },
  { name: '其他成本', value: 10 },
])

// 处理详情点击
const handleGreenhouseDetail = (data) => {
  console.log('温室详情:', data)
}

const handleFieldDetail = (data) => {
  console.log('大田详情:', data)
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
