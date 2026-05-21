<template>
  <div class="bg-white rounded-xl shadow-none border border-gray-100 hover:shadow-md transition-shadow p-4">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="rounded-lg p-2 bg-gradient-to-br from-orange-500 to-red-600">
          <el-icon :size="20" class="text-white">
            <Box />
          </el-icon>
        </div>
        <span class="font-semibold text-gray-900">库存预警</span>
      </div>
    </div>
    <div class="space-y-2">
      <div class="flex items-center gap-2">
        <span class="text-2xl font-bold text-red-500">{{ stats.lowStockCount }}</span>
        <span class="text-sm text-gray-500">种物料库存不足</span>
      </div>
      <p class="text-xs text-gray-400">低于安全库存，请及时采购</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Box } from '@element-plus/icons-vue'

const stats = ref({
  lowStockCount: 3,
  materials: [
    { name: '番茄种子', stock: 30, safeStock: 50 },
    { name: '复合肥', stock: 150, safeStock: 200 }
  ]
})
</script>
