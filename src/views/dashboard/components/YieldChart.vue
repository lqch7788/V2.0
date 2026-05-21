<template>
  <div class="bg-white rounded-xl p-6 shadow-none border border-gray-100">
    <h3 class="text-base font-semibold text-gray-900 mb-4">月度产量统计</h3>
    <div class="flex gap-4 mb-4">
      <el-select :model-value="region" @change="$emit('region-change', $event)" placeholder="全部区域" size="small" style="width: 120px">
        <el-option label="全部区域" value="" />
        <el-option label="玻璃温室A区" value="G001" />
        <el-option label="玻璃温室B区" value="G002" />
        <el-option label="玻璃温室C区" value="G003" />
        <el-option label="日光温室1号" value="G004" />
      </el-select>
      <el-select :model-value="crop" @change="$emit('crop-change', $event)" placeholder="全部作物" size="small" style="width: 100px">
        <el-option label="全部作物" value="" />
        <el-option label="番茄" value="C001" />
        <el-option label="黄瓜" value="C002" />
        <el-option label="辣椒" value="C003" />
        <el-option label="草莓" value="C004" />
      </el-select>
    </div>
    <div class="h-48">
      <div class="relative w-full h-full">
        <!-- Y轴坐标 -->
        <div class="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between py-3 pr-2 text-right">
          <span class="text-xs text-gray-400">{{ maxYield }}kg</span>
          <span class="text-xs text-gray-400">{{ Math.round(maxYield * 0.75) }}kg</span>
          <span class="text-xs text-gray-400">{{ Math.round(maxYield * 0.5) }}kg</span>
          <span class="text-xs text-gray-400">{{ Math.round(maxYield * 0.25) }}kg</span>
          <span class="text-xs text-gray-400">0kg</span>
        </div>
        <!-- 图表区域 -->
        <div class="ml-12 h-full flex items-end justify-around gap-2 relative">
          <!-- 网格线 -->
          <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div class="border-b border-gray-100"></div>
            <div class="border-b border-gray-100"></div>
            <div class="border-b border-gray-100"></div>
            <div class="border-b border-gray-100"></div>
            <div class="border-b border-gray-100"></div>
          </div>
          <!-- 柱状图 -->
          <div v-for="item in data" :key="item.month" class="flex flex-col items-center flex-1 relative z-10">
            <div
              class="w-full bg-emerald-500 rounded-t transition-all hover:bg-emerald-600 relative group"
              :style="{ height: getBarHeight(item.yield) + '%' }"
            >
              <span class="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-gray-600 font-medium whitespace-nowrap">
                {{ item.yield }}kg
              </span>
            </div>
            <span class="text-xs text-gray-500 mt-2">{{ item.month }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  region: String,
  crop: String,
  data: {
    type: Array,
    default: () => []
  }
})

defineEmits(['region-change', 'crop-change'])

const maxYield = 3000

const getBarHeight = (yieldValue) => {
  return Math.max((yieldValue / maxYield) * 100, 5)
}
</script>
