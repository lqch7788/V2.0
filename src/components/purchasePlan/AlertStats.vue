<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- 已逾期 -->
    <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-500">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500 mb-1">已逾期</p>
          <p class="text-2xl font-bold text-red-600">{{ overdueCount }}</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <el-icon :size="24" color="#ef4444">
            <WarningFilled />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 即将到期 -->
    <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-amber-500">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500 mb-1">即将到期</p>
          <p class="text-2xl font-bold text-amber-600">{{ warningCount }}</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
          <el-icon :size="24" color="#f59e0b">
            <Clock />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 待审批 -->
    <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500 mb-1">待审批</p>
          <p class="text-2xl font-bold text-blue-600">{{ pendingCount }}</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <el-icon :size="24" color="#3b82f6">
            <Document />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 采购中 -->
    <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-emerald-500">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500 mb-1">采购中</p>
          <p class="text-2xl font-bold text-emerald-600">{{ purchasingCount }}</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
          <el-icon :size="24" color="#10b981">
            <ShoppingCart />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { WarningFilled, Clock, Document, ShoppingCart } from '@element-plus/icons-vue'
import { calculateOverdueAlert } from '@/types/purchase'

const props = defineProps({})

const overdueCount = computed(() => {
  return props.purchasePlansData.filter(plan => {
    const alert = calculateOverdueAlert(plan)
    return alert.level === 'overdue'
  }).length
})

const warningCount = computed(() => {
  return props.purchasePlansData.filter(plan => {
    const alert = calculateOverdueAlert(plan)
    return alert.level === 'warning'
  }).length
})

const pendingCount = computed(() => {
  return props.purchasePlansData.filter(plan => plan.status === 'pending').length
})

const purchasingCount = computed(() => {
  return props.purchasePlansData.filter(plan => plan.status === 'purchasing').length
})
</script>
