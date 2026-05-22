<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><Monitor /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">环境监控</h1>
          <p class="text-xs text-gray-500">种植环境实时监控</p>
        </div>
      </div>
    </div>

    <!-- 环境参数概览卡片 -->
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-orange-600 font-medium">空气温度</p>
            <p class="text-2xl font-bold text-orange-700 mt-1">{{ envOverview.avgTemp }}°C</p>
            <p class="text-xs text-gray-500 mt-1">平均温度</p>
          </div>
          <el-icon :size="36" color="#f97316"><Sunny /></el-icon>
        </div>
      </div>
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-blue-600 font-medium">空气湿度</p>
            <p class="text-2xl font-bold text-blue-700 mt-1">{{ envOverview.avgHumidity }}%</p>
            <p class="text-xs text-gray-500 mt-1">平均湿度</p>
          </div>
          <el-icon :size="36" color="#3b82f6"><Cloudy /></el-icon>
        </div>
      </div>
      <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-yellow-600 font-medium">光照强度</p>
            <p class="text-2xl font-bold text-yellow-700 mt-1">{{ envOverview.avgLight }} Lux</p>
            <p class="text-xs text-gray-500 mt-1">平均光照</p>
          </div>
          <el-icon :size="36" color="#eab308"><Sunrise /></el-icon>
        </div>
      </div>
      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-green-600 font-medium">CO2浓度</p>
            <p class="text-2xl font-bold text-green-700 mt-1">{{ envOverview.avgCO2 }} ppm</p>
            <p class="text-xs text-gray-500 mt-1">平均浓度</p>
          </div>
          <el-icon :size="36" color="#22c55e"><Odometer /></el-icon>
        </div>
      </div>
    </div>

    <!-- 温室环境列表 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-semibold text-gray-800">温室环境详情</h3>
        <el-select v-model="selectedGreenhouse" placeholder="选择温室" size="small" style="width: 150px">
          <el-option label="全部温室" value="" />
          <el-option v-for="g in greenhouses" :key="g.id" :label="g.name" :value="g.id" />
        </el-select>
      </div>

      <el-table :data="filteredEnvData" stripe style="width: 100%">
        <el-table-column prop="name" label="温室名称" min-width="100" />
        <el-table-column prop="airTemp" label="空气温度" width="120">
          <template #default="{ row }">
            <span :class="getTempClass(row.airTemp)">
              {{ row.airTemp }}°C
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="airHumidity" label="空气湿度" width="100">
          <template #default="{ row }">
            <span :class="getHumidityClass(row.airHumidity)">
              {{ row.airHumidity }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="light" label="光照强度" width="100">
          <template #default="{ row }">
            <span :class="getLightClass(row.light)">
              {{ row.light }} Lux
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="co2" label="CO2浓度" width="100">
          <template #default="{ row }">
            <span :class="getCO2Class(row.co2)">
              {{ row.co2 }} ppm
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="soilTemp" label="土壤温度" width="100">
          <template #default="{ row }">
            {{ row.soilTemp }}°C
          </template>
        </el-table-column>
        <el-table-column prop="soilMoisture" label="土壤湿度" width="100">
          <template #default="{ row }">
            {{ row.soilMoisture }}%
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 环境趋势图 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-semibold text-gray-800">环境参数趋势</h3>
        <el-radio-group v-model="trendPeriod" size="small">
          <el-radio-button label="24h">24小时</el-radio-button>
          <el-radio-button label="7d">7天</el-radio-button>
          <el-radio-button label="30d">30天</el-radio-button>
        </el-radio-group>
      </div>

      <div class="h-72 flex items-end justify-around gap-4">
        <div v-for="(item, index) in trendData" :key="index" class="flex flex-col items-center flex-1">
          <div class="w-full flex flex-col items-center gap-1">
            <div class="w-4 bg-emerald-500 rounded-t" :style="{ height: `${(item.temp / 40) * 120}px` }" />
            <div class="w-4 bg-blue-400 rounded-t" :style="{ height: `${(item.humidity / 100) * 120}px` }" />
          </div>
          <span class="text-xs text-gray-500 mt-2">{{ item.time }}</span>
        </div>
      </div>

      <div class="flex items-center justify-center gap-6 mt-4">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-emerald-500 rounded-full" />
          <span class="text-xs text-gray-600">温度 (°C)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-blue-400 rounded-full" />
          <span class="text-xs text-gray-600">湿度 (%)</span>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="showDetail" title="环境详情" width="800px">
      <div v-if="selectedEnv">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="温室名称">{{ selectedEnv.name }}</el-descriptions-item>
          <el-descriptions-item label="空气温度">{{ selectedEnv.airTemp }}°C</el-descriptions-item>
          <el-descriptions-item label="空气湿度">{{ selectedEnv.airHumidity }}%</el-descriptions-item>
          <el-descriptions-item label="光照强度">{{ selectedEnv.light }} Lux</el-descriptions-item>
          <el-descriptions-item label="CO2浓度">{{ selectedEnv.co2 }} ppm</el-descriptions-item>
          <el-descriptions-item label="土壤温度">{{ selectedEnv.soilTemp }}°C</el-descriptions-item>
          <el-descriptions-item label="土壤湿度">{{ selectedEnv.soilMoisture }}%</el-descriptions-item>
          <el-descriptions-item label="土壤EC">{{ selectedEnv.soilEc }} ms/cm</el-descriptions-item>
          <el-descriptions-item label="土壤PH">{{ selectedEnv.soilPh }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Monitor, Sunny, Cloudy, Sunrise, Odometer } from '@element-plus/icons-vue'

// 环境概览数据
const envOverview = ref({
  avgTemp: 25.3,
  avgHumidity: 68,
  avgLight: 12500,
  avgCO2: 450
})

// 温室列表
const greenhouses = ref([
  { id: 'G001', name: '1号棚' },
  { id: 'G002', name: '2号棚' },
  { id: 'G003', name: '3号棚' },
  { id: 'G004', name: '4号棚' },
])

const selectedGreenhouse = ref('')

// 趋势时间选择
const trendPeriod = ref('24h')

// 温室环境数据
const envData = ref([
  { id: 'G001', name: '1号棚', airTemp: 25.3, airHumidity: 65, light: 12000, co2: 450, soilTemp: 22.1, soilMoisture: 58, soilEc: 2.5, soilPh: 6.8, status: 'normal' },
  { id: 'G002', name: '2号棚', airTemp: 24.8, airHumidity: 68, light: 11500, co2: 420, soilTemp: 21.5, soilMoisture: 62, soilEc: 2.3, soilPh: 6.5, status: 'normal' },
  { id: 'G003', name: '3号棚', airTemp: 28.5, airHumidity: 78, light: 18000, co2: 550, soilTemp: 24.2, soilMoisture: 72, soilEc: 2.8, soilPh: 7.0, status: 'warning' },
  { id: 'G004', name: '4号棚', airTemp: 23.5, airHumidity: 55, light: 9800, co2: 380, soilTemp: 20.8, soilMoisture: 48, soilEc: 2.1, soilPh: 6.4, status: 'normal' },
])

// 趋势数据
const trendData = ref([
  { time: '00:00', temp: 23.5, humidity: 72 },
  { time: '04:00', temp: 22.8, humidity: 75 },
  { time: '08:00', temp: 24.2, humidity: 68 },
  { time: '12:00', temp: 27.5, humidity: 60 },
  { time: '16:00', temp: 28.3, humidity: 58 },
  { time: '20:00', temp: 26.5, humidity: 65 },
  { time: '24:00', temp: 25.3, humidity: 68 },
])

// 筛选后的环境数据
const filteredEnvData = computed(() => {
  if (!selectedGreenhouse.value) return envData.value
  return envData.value.filter(e => e.id === selectedGreenhouse.value)
})

// 详情弹窗
const showDetail = ref(false)
const selectedEnv = ref(null)

const getTempClass = (temp) => {
  if (temp > 30 || temp < 15) return 'text-red-600 font-medium'
  if (temp > 28 || temp < 18) return 'text-amber-600 font-medium'
  return 'text-gray-700'
}

const getHumidityClass = (humidity) => {
  if (humidity > 85 || humidity < 40) return 'text-red-600 font-medium'
  if (humidity > 80 || humidity < 50) return 'text-amber-600 font-medium'
  return 'text-gray-700'
}

const getLightClass = (light) => {
  if (light > 20000 || light < 3000) return 'text-red-600 font-medium'
  if (light > 18000 || light < 5000) return 'text-amber-600 font-medium'
  return 'text-gray-700'
}

const getCO2Class = (co2) => {
  if (co2 > 800 || co2 < 250) return 'text-red-600 font-medium'
  if (co2 > 600 || co2 < 300) return 'text-amber-600 font-medium'
  return 'text-gray-700'
}

const getStatusType = (status) => {
  const map = { normal: 'success', warning: 'warning', danger: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { normal: '正常', warning: '警告', danger: '危险' }
  return map[status] || status
}

const handleDetail = (row) => {
  selectedEnv.value = row
  showDetail.value = true
}
</script>
