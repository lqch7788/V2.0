<template>
  <div class="bg-white rounded-xl shadow-none overflow-hidden border border-gray-100">
    <div class="p-4 border-b border-gray-100">
      <h3 class="text-base font-semibold text-gray-900">种植区环境参数表</h3>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <tr>
            <th class="px-2 py-2 text-center text-sm font-semibold whitespace-nowrap">区域选择</th>
            <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap" colspan="4">空气环境参数</th>
            <th class="px-1 py-3"></th>
            <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap" colspan="4">土壤环境参数</th>
            <th class="px-4 py-3"></th>
          </tr>
          <tr class="bg-gray-50">
            <th class="px-2 py-2">
              <el-select
                :model-value="selectedRegion"
                @change="$emit('region-change', $event)"
                placeholder="全部区域"
                size="small"
                style="width: 100%"
              >
                <el-option label="全部区域" value="" />
                <el-option v-for="gh in greenhouseList" :key="gh.id" :label="gh.name" :value="gh.id" />
              </el-select>
            </th>
            <th class="px-4 py-2 text-center text-sm font-semibold whitespace-nowrap text-gray-700">温度(°C)</th>
            <th class="px-4 py-2 text-center text-sm font-semibold whitespace-nowrap text-gray-700">湿度(%)</th>
            <th class="px-4 py-2 text-center text-sm font-semibold whitespace-nowrap text-gray-700">光照度(Lux)</th>
            <th class="px-4 py-2 text-center text-sm font-semibold whitespace-nowrap text-gray-700">CO2(ppm)</th>
            <th class="px-1 py-2"></th>
            <th class="px-4 py-2 text-center text-sm font-semibold whitespace-nowrap text-gray-700">温度(°C)</th>
            <th class="px-4 py-2 text-center text-sm font-semibold whitespace-nowrap text-gray-700">湿度(%)</th>
            <th class="px-4 py-2 text-center text-sm font-semibold whitespace-nowrap text-gray-700">EC值</th>
            <th class="px-4 py-2 text-center text-sm font-semibold whitespace-nowrap text-gray-700">PH值</th>
            <th class="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <tr v-for="gh in paginatedData" :key="gh.id" class="hover:bg-blue-100 transition-colors">
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <el-icon :size="16" class="text-emerald-600">
                  <LocationInformation />
                </el-icon>
                <span class="font-medium text-gray-900">{{ gh.name }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-center whitespace-nowrap">
              <span :class="['text-sm font-medium', getStatusColor(gh.airTemp?.status)]">
                {{ gh.airTemp?.value ?? '-' }}{{ gh.airTemp?.unit ? ' ' + gh.airTemp.unit : '' }}
              </span>
            </td>
            <td class="px-4 py-3 text-center whitespace-nowrap">
              <span :class="['text-sm font-medium', getStatusColor(gh.airHumidity?.status)]">
                {{ gh.airHumidity?.value ?? '-' }}{{ gh.airHumidity?.unit ? ' ' + gh.airHumidity.unit : '' }}
              </span>
            </td>
            <td class="px-4 py-3 text-center whitespace-nowrap">
              <span :class="['text-sm font-medium', getStatusColor(gh.light?.status)]">
                {{ gh.light?.value ?? '-' }}{{ gh.light?.unit ? ' ' + gh.light.unit : '' }}
              </span>
            </td>
            <td class="px-4 py-3 text-center whitespace-nowrap">
              <span :class="['text-sm font-medium', getStatusColor(gh.co2?.status)]">
                {{ gh.co2?.value ?? '-' }}{{ gh.co2?.unit ? ' ' + gh.co2.unit : '' }}
              </span>
            </td>
            <td class="px-1 py-3"></td>
            <td class="px-4 py-3 text-center whitespace-nowrap">
              <span :class="['text-sm font-medium', getStatusColor(gh.soilTemp?.status)]">
                {{ gh.soilTemp?.value ?? '-' }}{{ gh.soilTemp?.unit ? ' ' + gh.soilTemp.unit : '' }}
              </span>
            </td>
            <td class="px-4 py-3 text-center whitespace-nowrap">
              <span :class="['text-sm font-medium', getStatusColor(gh.soilMoisture?.status)]">
                {{ gh.soilMoisture?.value ?? '-' }}{{ gh.soilMoisture?.unit ? ' ' + gh.soilMoisture.unit : '' }}
              </span>
            </td>
            <td class="px-4 py-3 text-center whitespace-nowrap">
              <span :class="['text-sm font-medium', getStatusColor(gh.soilEc?.status)]">
                {{ gh.soilEc?.value ?? '-' }}{{ gh.soilEc?.unit ? ' ' + gh.soilEc.unit : '' }}
              </span>
            </td>
            <td class="px-4 py-3 text-center whitespace-nowrap">
              <span :class="['text-sm font-medium', getStatusColor(gh.soilPh?.status)]">
                {{ gh.soilPh?.value ?? '-' }}{{ gh.soilPh?.unit ? ' ' + gh.soilPh.unit : '' }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <el-button size="small" text class="text-emerald-600 hover:text-emerald-700 font-medium text-sm" @click="$emit('detail-click', gh.id)">
                详情&gt;&gt;
              </el-button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Pagination -->
    <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">每页</span>
        <el-select :model-value="pageSize" @change="$emit('page-size-change', $event)" size="small" style="width: 80px">
          <el-option :value="5" label="5" />
          <el-option :value="10" label="10" />
          <el-option :value="20" label="20" />
        </el-select>
        <span class="text-sm text-gray-500">条</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">共 {{ envData.length }} 条</span>
        <el-button size="small" :disabled="page === 1" @click="$emit('page-change', page - 1)">
          <el-icon><CaretLeft /></el-icon>
        </el-button>
        <span class="text-sm">{{ page }} / {{ totalPages || 1 }}</span>
        <el-button size="small" :disabled="page >= totalPages" @click="$emit('page-change', page + 1)">
          <el-icon><CaretRight /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { LocationInformation, CaretLeft, CaretRight } from '@element-plus/icons-vue'

defineProps({
  greenhouseList: Array,
  envData: Array,
  paginatedData: Array,
  selectedRegion: String,
  page: Number,
  pageSize: Number,
  totalPages: Number
})

defineEmits(['region-change', 'page-change', 'page-size-change', 'detail-click'])

const getStatusColor = (status) => {
  if (status === 'normal') return 'text-gray-900'
  if (status === 'warning') return 'text-yellow-600'
  if (status === 'critical') return 'text-red-600'
  return 'text-gray-900'
}
</script>
