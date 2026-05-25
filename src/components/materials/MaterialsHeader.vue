<template>
  <div class="bg-white rounded-xl p-6 shadow-none">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" color="#fff"><Package /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">仓库物料</h1>
          <p class="text-gray-500">仓库物料库存管理</p>
        </div>
      </div>
      <div v-if="lowStockCount > 0">
        <el-button
          :type="showLowStock ? 'danger' : 'warning'"
          :plain="!showLowStock"
          @click="onLowStockClick"
        >
          <el-icon><AlertTriangle /></el-icon>
          <span class="ml-1">库存不足</span>
          <el-badge :value="lowStockCount" type="danger" class="ml-2" />
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Package, AlertTriangle } from '@element-plus/icons-vue'

defineProps({
  lowStockCount: {
    type: Number,
    default: 0
  },
  showLowStock: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['low-stock-click'])

const onLowStockClick = () => {
  emit('low-stock-click')
}
</script>
