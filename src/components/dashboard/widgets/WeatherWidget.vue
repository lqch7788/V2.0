<template>
  <div class="bg-white rounded-xl shadow-none border border-gray-100 overflow-hidden">
    <!-- Tab 选择 -->
    <div class="flex border-b border-gray-100">
      <button
        @click="weatherTab = 'forecast'"
        :class="[
          'flex-1 py-2 text-sm font-bold text-center transition-colors',
          weatherTab === 'forecast'
            ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        ]"
      >
        天气预报
      </button>
      <button
        @click="weatherTab = 'station'"
        :class="[
          'flex-1 py-2 text-sm font-bold text-center transition-colors',
          weatherTab === 'station'
            ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        ]"
      >
        本地气象站
      </button>
    </div>

    <!-- 天气预报内容 -->
    <div v-if="weatherTab === 'forecast'" class="bg-[#F2F6FA] p-3 text-gray-900">
      <!-- 当天天气 -->
      <div class="flex items-center justify-between">
        <div>
          <p class="text-2xl font-bold text-gray-900">18°</p>
          <p class="text-sm text-gray-600">晴转多云</p>
          <p class="text-xs text-gray-500 mt-1">上海市崇明区 · 3月18日</p>
        </div>
        <div class="flex items-start gap-2 -mt-2">
          <el-icon :size="40" class="text-yellow-500">
            <Sunny />
          </el-icon>
          <button class="p-1 hover:bg-gray-200 rounded" @click="refresh">
            <el-icon :size="12" class="text-gray-600">
              <RefreshRight />
            </el-icon>
          </button>
        </div>
      </div>

      <!-- 5天预报 -->
      <div class="grid grid-cols-5 gap-1 mt-3 pt-3 border-t border-gray-200">
        <div class="text-center">
          <p class="text-xs text-gray-500">今天</p>
          <el-icon :size="20" class="mx-auto mt-1 text-yellow-500">
            <Sunny />
          </el-icon>
          <p class="text-sm font-medium text-gray-900 mt-1">18°</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-500">明天</p>
          <el-icon :size="20" class="mx-auto mt-1 text-blue-500">
            <Cloudy />
          </el-icon>
          <p class="text-sm font-medium text-gray-900 mt-1">15°</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-500">周四</p>
          <el-icon :size="20" class="mx-auto mt-1 text-gray-400">
            <Cloudy />
          </el-icon>
          <p class="text-sm font-medium text-gray-900 mt-1">12°</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-500">周五</p>
          <el-icon :size="20" class="mx-auto mt-1 text-yellow-500">
            <Sunny />
          </el-icon>
          <p class="text-sm font-medium text-gray-900 mt-1">16°</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-500">周六</p>
          <el-icon :size="20" class="mx-auto mt-1 text-yellow-500">
            <Sunny />
          </el-icon>
          <p class="text-sm font-medium text-gray-900 mt-1">19°</p>
        </div>
      </div>
    </div>

    <!-- 本地气象站内容 -->
    <div v-if="weatherTab === 'station'" class="p-3">
      <div class="grid grid-cols-2 gap-2">
        <div v-for="param in stationParams" :key="param.id" class="bg-[#F2F6FA] rounded-lg p-2">
          <div class="flex items-center gap-2 mb-1">
            <div
              class="w-6 h-6 rounded flex items-center justify-center"
              :style="{ backgroundColor: param.color }"
            >
              <el-icon :size="12" class="text-white">
                <component :is="param.icon" />
              </el-icon>
            </div>
            <span class="text-xs text-gray-600">{{ param.name }}</span>
          </div>
          <div class="text-center">
            <p class="text-sm font-bold text-gray-900">
              {{ param.value }}<span class="text-xs font-normal text-gray-500 ml-1">{{ param.unit }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Sunny, Cloudy, RefreshRight } from '@element-plus/icons-vue'

const weatherTab = ref('station')

const refresh = () => {
  // 刷新数据
}

// 气象站参数 - 使用Element Plus图标名称
const stationParams = [
  { id: 1, name: '大气温度', value: 18.5, unit: '°C', icon: 'Sunny', color: '#ef4444' },
  { id: 2, name: '大气湿度', value: 65, unit: '%RH', icon: 'DArrowRight', color: '#3b82f6' },
  { id: 3, name: '光照强度', value: 25000, unit: 'Lux', icon: 'Sunny', color: '#f59e0b' },
  { id: 4, name: '风速', value: 2.1, unit: 'm/s', icon: 'Wind', color: '#06b6d4' },
  { id: 5, name: '风向', value: '东南风', unit: '', icon: 'Aim', color: '#14b8a6' },
  { id: 6, name: '降雨量', value: 0, unit: 'mm', icon: 'HeavyRain', color: '#6366f1' },
  { id: 7, name: '大气压力', value: 1013.2, unit: 'hPa', icon: 'DataLine', color: '#8b5cf6' },
  { id: 8, name: '雨雪状态', value: '无', unit: '', icon: 'Sunny', color: '#22d3ee' }
]
</script>
