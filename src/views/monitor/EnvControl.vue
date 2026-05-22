<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><Setting /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">环境控制</h1>
          <p class="text-xs text-gray-500">环境参数控制</p>
        </div>
      </div>
    </div>

    <!-- 控制概览 -->
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-cyan-600 font-medium">灌溉控制</p>
            <p class="text-lg font-bold text-cyan-700 mt-1">{{ irrigationCount }} 组</p>
          </div>
          <el-icon :size="32" color="#06b6d4"><Drizzling /></el-icon>
        </div>
      </div>
      <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-purple-600 font-medium">通风控制</p>
            <p class="text-lg font-bold text-purple-700 mt-1">{{ ventilationCount }} 组</p>
          </div>
          <el-icon :size="32" color="#a855f7"><WindPower /></el-icon>
        </div>
      </div>
      <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-orange-600 font-medium">温控设备</p>
            <p class="text-lg font-bold text-orange-700 mt-1">{{ temperatureCount }} 组</p>
          </div>
          <el-icon :size="32" color="#f97316"><HotWater /></el-icon>
        </div>
      </div>
      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-green-600 font-medium">施肥控制</p>
            <p class="text-lg font-bold text-green-700 mt-1">{{ fertilizationCount }} 组</p>
          </div>
          <el-icon :size="32" color="#22c55e"><Tools /></el-icon>
        </div>
      </div>
    </div>

    <!-- 环境控制面板 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-semibold text-gray-800">环境控制</h3>
        <el-select v-model="selectedGreenhouse" placeholder="选择温室" size="small" style="width: 150px">
          <el-option v-for="g in greenhouses" :key="g.id" :label="g.name" :value="g.id" />
        </el-select>
      </div>

      <!-- 灌溉控制 -->
      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <el-icon color="#06b6d4"><Drizzling /></el-icon>
          灌溉控制
        </h4>
        <div class="grid grid-cols-3 gap-4">
          <div v-for="zone in irrigationZones" :key="zone.id" class="bg-gray-50 rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">{{ zone.name }}</span>
              <el-tag :type="zone.status === 'running' ? 'success' : 'info'" size="small">
                {{ zone.status === 'running' ? '运行中' : '停止' }}
              </el-tag>
            </div>
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xs text-gray-500">土壤湿度:</span>
              <span class="text-sm font-medium">{{ zone.soilMoisture }}%</span>
            </div>
            <div class="flex items-center gap-2">
              <el-button size="small" type="primary" @click="controlIrrigation(zone.id, 'start')" :disabled="zone.status === 'running'">
                启动
              </el-button>
              <el-button size="small" @click="controlIrrigation(zone.id, 'stop')" :disabled="zone.status !== 'running'">
                停止
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 通风控制 -->
      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <el-icon color="#a855f7"><WindPower /></el-icon>
          通风控制
        </h4>
        <div class="grid grid-cols-3 gap-4">
          <div v-for="fan in ventilationFans" :key="fan.id" class="bg-gray-50 rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">{{ fan.name }}</span>
              <el-switch v-model="fan.enabled" @change="controlVentilation(fan.id, fan.enabled)" />
            </div>
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xs text-gray-500">风速:</span>
              <el-slider v-model="fan.speed" :min="0" :max="100" style="width: 100px" @change="setFanSpeed(fan.id, fan.speed)" />
              <span class="text-sm font-medium">{{ fan.speed }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 温控控制 -->
      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <el-icon color="#f97316"><Odometer /></el-icon>
          温控设备
        </h4>
        <div class="grid grid-cols-3 gap-4">
          <div v-for="ac in temperatureDevices" :key="ac.id" class="bg-gray-50 rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">{{ ac.name }}</span>
              <el-switch v-model="ac.enabled" @change="controlTemperature(ac.id, ac.enabled)" />
            </div>
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xs text-gray-500">目标温度:</span>
              <el-input-number v-model="ac.targetTemp" :min="10" :max="35" size="small" @change="setTargetTemp(ac.id, ac.targetTemp)" />
              <span class="text-sm">°C</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500">当前:</span>
              <span class="text-sm font-medium">{{ ac.currentTemp }}°C</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 施肥控制 -->
      <div>
        <h4 class="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <el-icon color="#22c55e"><Tools /></el-icon>
          施肥控制
        </h4>
        <div class="grid grid-cols-3 gap-4">
          <div v-for="fer in fertilizationDevices" :key="fer.id" class="bg-gray-50 rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">{{ fer.name }}</span>
              <el-tag :type="fer.status === 'running' ? 'success' : 'info'" size="small">
                {{ fer.status === 'running' ? '运行中' : '停止' }}
              </el-tag>
            </div>
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xs text-gray-500">施肥比例:</span>
              <el-input-number v-model="fer.ratio" :min="1" :max="10" :step="0.1" size="small" />
            </div>
            <div class="flex items-center gap-2">
              <el-button size="small" type="success" @click="controlFertilization(fer.id, 'start')" :disabled="fer.status === 'running'">
                开始施肥
              </el-button>
              <el-button size="small" type="danger" @click="controlFertilization(fer.id, 'stop')" :disabled="fer.status !== 'running'">
                停止
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Setting, Drizzling, WindPower, Odometer, Tools, HotWater } from '@element-plus/icons-vue'

// 温室列表
const greenhouses = ref([
  { id: 'G001', name: '1号棚' },
  { id: 'G002', name: '2号棚' },
  { id: 'G003', name: '3号棚' },
])

const selectedGreenhouse = ref('G001')

// 控制概览数据
const irrigationCount = ref(6)
const ventilationCount = ref(8)
const temperatureCount = ref(4)
const fertilizationCount = ref(3)

// 灌溉控制区域
const irrigationZones = ref([
  { id: 1, name: '1号棚-A区', status: 'stopped', soilMoisture: 58 },
  { id: 2, name: '1号棚-B区', status: 'running', soilMoisture: 62 },
  { id: 3, name: '2号棚', status: 'stopped', soilMoisture: 55 },
  { id: 4, name: '3号棚', status: 'stopped', soilMoisture: 48 },
  { id: 5, name: '露天区-1', status: 'stopped', soilMoisture: 45 },
  { id: 6, name: '露天区-2', status: 'stopped', soilMoisture: 42 },
])

// 通风控制
const ventilationFans = ref([
  { id: 1, name: '1号棚-东侧', enabled: true, speed: 80 },
  { id: 2, name: '1号棚-西侧', enabled: false, speed: 60 },
  { id: 3, name: '2号棚-东侧', enabled: true, speed: 70 },
  { id: 4, name: '2号棚-西侧', enabled: false, speed: 50 },
  { id: 5, name: '3号棚-东侧', enabled: true, speed: 90 },
  { id: 6, name: '3号棚-西侧', enabled: false, speed: 60 },
])

// 温控设备
const temperatureDevices = ref([
  { id: 1, name: '1号棚-空调1', enabled: true, targetTemp: 25, currentTemp: 26.3 },
  { id: 2, name: '1号棚-空调2', enabled: false, targetTemp: 25, currentTemp: 25.8 },
  { id: 3, name: '2号棚-空调1', enabled: true, targetTemp: 24, currentTemp: 24.5 },
  { id: 4, name: '3号棚-空调1', enabled: false, targetTemp: 26, currentTemp: 28.2 },
])

// 施肥设备
const fertilizationDevices = ref([
  { id: 1, name: '1号棚-施肥机', status: 'stopped', ratio: 2.5 },
  { id: 2, name: '2号棚-施肥机', status: 'running', ratio: 2.0 },
  { id: 3, name: '3号棚-施肥机', status: 'stopped', ratio: 3.0 },
])

// 控制操作
const controlIrrigation = (zoneId, action) => {
  const zone = irrigationZones.value.find(z => z.id === zoneId)
  if (zone) {
    zone.status = action === 'start' ? 'running' : 'stopped'
  }
}

const controlVentilation = (fanId, enabled) => {
  console.log('通风控制:', fanId, enabled)
}

const setFanSpeed = (fanId, speed) => {
  console.log('设置风速:', fanId, speed)
}

const controlTemperature = (deviceId, enabled) => {
  console.log('温控设备控制:', deviceId, enabled)
}

const setTargetTemp = (deviceId, temp) => {
  console.log('设置目标温度:', deviceId, temp)
}

const controlFertilization = (deviceId, action) => {
  const device = fertilizationDevices.value.find(d => d.id === deviceId)
  if (device) {
    device.status = action === 'start' ? 'running' : 'stopped'
  }
}
</script>
