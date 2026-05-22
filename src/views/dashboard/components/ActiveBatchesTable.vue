<template>
  <div class="bg-white rounded-xl p-6 shadow-none border border-gray-100">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-semibold text-gray-900">活跃种植批次</h3>
      <router-link to="/production" class="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
        查看全部 <el-icon :size="16"><CaretRight /></el-icon>
      </router-link>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <tr class="border-b border-blue-600">
            <th class="text-left py-3 px-4 text-sm font-semibold whitespace-nowrap">批次号</th>
            <th class="text-left py-3 px-4 text-sm font-semibold whitespace-nowrap">作物</th>
            <th class="text-left py-3 px-4 text-sm font-semibold whitespace-nowrap">区域</th>
            <th class="text-left py-3 px-4 text-sm font-semibold whitespace-nowrap">生长阶段</th>
            <th class="text-left py-3 px-4 text-sm font-semibold whitespace-nowrap">进度</th>
            <th class="text-left py-3 px-4 text-sm font-semibold whitespace-nowrap">状态</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <tr v-for="batch in batches.slice(0, 5)" :key="batch.id" class="hover:bg-blue-100 transition-colors">
            <td class="py-3 font-medium text-gray-900 whitespace-nowrap">{{ batch.batchCode }}</td>
            <td class="py-3 text-gray-600 whitespace-nowrap">{{ batch.cropName }}</td>
            <td class="py-3 text-gray-600 whitespace-nowrap">{{ batch.greenhouseName }}</td>
            <td class="py-3 text-gray-600 whitespace-nowrap">{{ batch.stageName }}</td>
            <td class="py-3 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <div class="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-emerald-500 rounded-full"
                    :style="{ width: getProgress(batch.stage) + '%' }"
                  />
                </div>
                <span class="text-gray-500">{{ getProgress(batch.stage) }}%</span>
              </div>
            </td>
            <td class="py-3 whitespace-nowrap">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700">
                进行中
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { CaretRight } from '@element-plus/icons-vue'

defineProps({
  batches: {
    type: Array,
    default: () => []
  }
})

const stageProgress = {
  seedling: 15,
  vegetative: 40,
  flowering: 65,
  fruiting: 85,
  harvest: 100
}

const getProgress = (stage) => stageProgress[stage] || 0
</script>
