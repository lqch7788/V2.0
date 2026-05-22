<template>
  <div class="bg-white rounded-xl p-6 shadow-none border border-gray-100">
    <h3 class="text-base font-semibold text-gray-900 mb-4">月度产量统计</h3>
    <div class="flex gap-4 mb-4">
      <select
        :value="region"
        @change="$emit('region-change', ($event.target as HTMLSelectElement).value)"
        class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
      >
        <option value="">全部区域</option>
        <option value="G001">玻璃温室A区</option>
        <option value="G002">玻璃温室B区</option>
        <option value="G003">玻璃温室C区</option>
        <option value="G004">日光温室1号</option>
      </select>
      <select
        :value="crop"
        @change="$emit('crop-change', ($event.target as HTMLSelectElement).value)"
        class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
      >
        <option value="">全部作物</option>
        <option value="C001">番茄</option>
        <option value="C002">黄瓜</option>
        <option value="C003">辣椒</option>
        <option value="C004">草莓</option>
      </select>
    </div>
    <div class="h-48">
      <div class="relative w-full h-full">
        <!-- Y轴坐标 -->
        <div class="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between py-3 pr-2 text-right">
          <span class="text-xs" style="color: #9ca3af">{{ maxYield }}kg</span>
          <span class="text-xs" style="color: #9ca3af">{{ Math.round(maxYield * 0.75) }}kg</span>
          <span class="text-xs" style="color: #9ca3af">{{ Math.round(maxYield * 0.5) }}kg</span>
          <span class="text-xs" style="color: #9ca3af">{{ Math.round(maxYield * 0.25) }}kg</span>
          <span class="text-xs" style="color: #9ca3af">0kg</span>
        </div>
        <!-- 图表区域 -->
        <div class="ml-12 h-full flex items-end justify-around gap-2 relative">
          <!-- 网格线 -->
          <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div class="border-b" style="border-color: #f0f0f0"></div>
            <div class="border-b" style="border-color: #f0f0f0"></div>
            <div class="border-b" style="border-color: #f0f0f0"></div>
            <div class="border-b" style="border-color: #f0f0f0"></div>
            <div class="border-b" style="border-color: #f0f0f0"></div>
          </div>
          <!-- 柱状图 -->
          <div
            v-for="item in data"
            :key="item.month"
            class="flex flex-col items-center flex-1 relative z-10 group"
            @mouseenter="hoveredMonth = item.month"
            @mouseleave="hoveredMonth = null"
          >
            <!-- Tooltip -->
            <div
              v-if="hoveredMonth === item.month"
              class="absolute bottom-full mb-2 px-3 py-2 bg-white border rounded-lg shadow-lg text-sm whitespace-nowrap z-20"
              style="border-color: #e5e7eb; border-radius: 8px;"
            >
              <div style="color: #374151">{{ item.yield }}kg</div>
              <div style="color: #6b7280; font-size: 12px;">产量</div>
            </div>
            <!-- 柱子 -->
            <div
              class="w-6 mx-auto rounded-t cursor-pointer transition-all group-hover:opacity-80 relative"
              style="background-color: #10b981; min-height: 5px"
              :style="{ height: Math.max((item.yield / maxYield) * 160, 5) + 'px' }"
            >
              <!-- 柱子顶部的label (V1.1样式) -->
              <div
                v-if="item.yield > 0"
                class="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap"
                style="color: #6b7280; font-size: 10px;"
              >
                {{ item.yield }}kg
              </div>
            </div>
            <!-- X轴标签 -->
            <span class="text-xs mt-2" style="color: #6b7280;">{{ item.month }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  region?: string
  crop?: string
  data?: Array<{ month: string; yield: number }>
}>()

defineEmits<{
  (e: 'region-change', value: string): void
  (e: 'crop-change', value: string): void
}>()

const maxYield = 3000
const hoveredMonth = ref<string | null>(null)
</script>
