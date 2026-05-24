<template>
  <div class="space-y-6">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      <span class="ml-3 text-gray-500">加载追溯链...</span>
    </div>

    <template v-else>
      <!-- 上游追溯 -->
      <div v-if="upstream.length > 0">
        <div class="flex items-center gap-2 mb-3">
          <el-icon :size="20" class="text-gray-600"><Clock /></el-icon>
          <h4 class="text-sm font-semibold text-gray-700">上游来源</h4>
          <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
            {{ upstream.length }} 条
          </span>
        </div>
        <div class="space-y-1">
          <div v-for="node in upstream" :key="node.instanceId" class="relative">
            <TraceNodeCard :node="node" :level="0" @navigate="onNavigate" />
          </div>
        </div>
      </div>

      <!-- 当前节点 -->
      <div>
        <div class="flex items-center gap-2 mb-3">
          <el-icon :size="20" class="text-emerald-600"><Box /></el-icon>
          <h4 class="text-sm font-semibold text-gray-700">当前节点</h4>
        </div>
        <div class="p-3 bg-emerald-100 border border-emerald-300 rounded-lg">
          <div class="text-sm text-emerald-800">
            当前记录为追溯链的一部分，请查看上方来源了解完整流程
          </div>
        </div>
      </div>

      <!-- 下游追溯 -->
      <div v-if="downstream.length > 0">
        <div class="flex items-center gap-2 mb-3">
          <el-icon :size="20" class="text-gray-600"><Right /></el-icon>
          <h4 class="text-sm font-semibold text-gray-700">下游去向</h4>
          <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
            {{ downstream.length }} 条
          </span>
        </div>
        <div class="space-y-1">
          <div v-for="node in downstream" :key="node.instanceId" class="relative">
            <TraceNodeCard :node="node" :level="0" @navigate="onNavigate" />
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="upstream.length === 0 && downstream.length === 0" class="text-center py-8 text-gray-500">
        <el-icon :size="48" class="mx-auto mb-3 text-gray-300"><Clock /></el-icon>
        <p>暂无追溯数据</p>
        <p class="text-xs mt-1">该记录尚未关联库存服务</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Clock, Box, Right } from '@element-plus/icons-vue'

// StockType: 'seed' | 'seedling' | 'product'
// BusinessType: 'seed_source' | 'seedling' | 'planting' | 'harvest' | 'purchase'

const props = defineProps({
  batchCode: String,
  cropName: String
})

const loading = ref(true)
const upstream = ref([])
const downstream = ref([])

onMounted(() => {
  loadTraceData()
})

const loadTraceData = async () => {
  loading.value = true
  // 模拟加载
  setTimeout(() => {
    upstream.value = []
    downstream.value = []
    loading.value = false
  }, 500)
}

const TraceNodeCard = {
  props: ['node', 'level'],
  emits: ['navigate'],
  template: `
    <div
      :class="[
        'flex items-center gap-2 p-2 rounded-lg mb-1 transition-colors',
        level === 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-white border border-gray-200 hover:bg-gray-50'
      ]"
      :style="{ marginLeft: level * 24 + 'px' }"
    >
      <div class="w-6" />
      <el-icon :size="16" class="text-amber-600"><Sunny /></el-icon>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-sm font-medium text-gray-900 truncate">{{ node.cropName }}</span>
          <span v-if="node.varietyName" class="text-xs text-gray-500 truncate">{{ node.varietyName }}</span>
          <span class="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
            {{ node.stockType === 'seed' ? '种源' : node.stockType === 'seedling' ? '育苗' : '成品' }}
          </span>
          <span class="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
            {{ node.businessType }}
          </span>
        </div>
        <div class="flex items-center gap-4 text-xs text-gray-500 mt-0.5">
          <span>批次: {{ node.businessCode || node.businessId }}</span>
          <span>数量: {{ node.quantity }}</span>
          <span>入库: {{ formatDate(node.inboundDate) }}</span>
        </div>
      </div>
    </div>
  `
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}
</script>
