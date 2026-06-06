<template>
  <div class="space-y-4">
    <!-- Tab 按键行 -->
    <div class="flex items-center gap-2 border-b border-gray-200 pb-2">
      <button
        v-for="tab in tabConfigs"
        :key="tab.key"
        class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all"
        :class="activeTab === tab.key
          ? 'bg-blue-500 text-white shadow-sm'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        @click="activeTab = tab.key"
      >
        <component :is="tab.icon" class="w-4 h-4" />
        <span>{{ tab.title }}</span>
        <span
          class="text-xs px-1.5 py-0.5 rounded-full"
          :class="activeTab === tab.key ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-500'"
        >
          {{ getTabTotal(tab.key) }}
        </span>
      </button>
    </div>

    <!-- 统计信息栏 -->
    <div class="flex items-center gap-4 bg-gray-50 rounded-lg px-4 py-3">
      <span class="text-gray-600">当前环节：</span>
      <span class="font-semibold text-gray-900">{{ activeConfig?.title }}</span>
      <span class="text-gray-300">|</span>
      <span class="text-gray-600">总数：</span>
      <span class="font-semibold text-blue-600">{{ currentStats.total }}</span>
      <span class="text-gray-300">|</span>
      <span class="text-gray-600">已关联：</span>
      <span class="font-semibold text-green-600">{{ currentStats.related }}</span>
    </div>

    <!-- 表格区域 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ activeConfig?.title }} - 详情列表
        </h3>
        <button
          class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          @click="handleViewDetail"
        >
          <Eye class="w-4 h-4" />
          查看详情
        </button>
      </div>
      <!-- 修复 P0: 移除冗余 :tech-solutions（ProductionChainTable 内部 onMounted 自行 fetch，此 prop 未被声明为可接收） -->
      <!-- 修复 P0: @view 改为真实导航（与顶部"查看详情"按钮行为一致，调用 router.push） -->
      <ProductionChainTable
        :type="activeConfig?.tableType || 'plans'"
        :data="tableData"
        @view="handleViewRecord"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ClipboardList, Sprout, Flower2, Trees, Package, Warehouse, Eye } from 'lucide-vue-next'
import request from '@/api/request'
import ProductionChainTable from './ProductionChainTable.vue'

const router = useRouter()

// 6个Tab配置
const tabConfigs = [
  { key: 'productionPlans', title: '生产计划', icon: ClipboardList, tableType: 'plans', routePath: '/production' },
  { key: 'seedlings', title: '种源管理', icon: Sprout, tableType: 'seedlings', routePath: '/crop/seedling' },
  { key: 'plantings', title: '育苗管理', icon: Flower2, tableType: 'seedlings', routePath: '/crop/planting' },
  { key: 'plantingOperations', title: '种植管理', icon: Trees, tableType: 'plantings', routePath: '/crop/planting' },
  { key: 'harvests', title: '采收入库', icon: Package, tableType: 'harvests', routePath: '/crop/harvest' },
  { key: 'inventory', title: '库存管理', icon: Warehouse, tableType: 'inventory', routePath: '/crop-inventory' },
]

const activeTab = ref('productionPlans')
const isLoading = ref(false)

// 原始数据
const productionPlans = ref([])
const seedlings = ref([])
const plantings = ref([])
const harvestRecords = ref([])
const inventoryRecords = ref([])
const techSolutions = ref([])

// 加载所有数据
onMounted(async () => {
  isLoading.value = true
  try {
    const [plans, sdl, plts, harv, inv, tech] = await Promise.all([
      request.get('/production-plans', { params: { limit: 500 } }).catch(() => []),
      request.get('/seedlings', { params: { limit: 500 } }).catch(() => []),
      request.get('/plantings', { params: { limit: 500 } }).catch(() => []),
      request.get('/harvest', { params: { limit: 500 } }).catch(() => []),
      request.get('/inventory', { params: { limit: 500 } }).catch(() => []),
      request.get('/tech-solutions', { params: { limit: 200 } }).catch(() => []),
    ])
    productionPlans.value = Array.isArray(plans) ? plans : (plans?.data || plans?.records || [])
    seedlings.value = Array.isArray(sdl) ? sdl : (sdl?.data || sdl?.records || [])
    plantings.value = Array.isArray(plts) ? plts : (plts?.data || plts?.records || [])
    harvestRecords.value = Array.isArray(harv) ? harv : (harv?.data || harv?.records || [])
    inventoryRecords.value = Array.isArray(inv) ? inv : (inv?.data || inv?.records || [])
    techSolutions.value = Array.isArray(tech) ? tech : (tech?.data || tech?.records || [])
  } catch (e) {
    console.error('加载生产链条数据失败:', e)
  } finally {
    isLoading.value = false
  }
})

// 获取当前激活的Tab配置
const activeConfig = computed(() => tabConfigs.find(t => t.key === activeTab.value) || tabConfigs[0])

// 收集所有已关联的生产计划批次号
const relatedPlanCodes = computed(() => {
  const codes = new Set()
  seedlings.value.forEach(s => { if (s.productionPlanCode) codes.add(s.productionPlanCode) })
  plantings.value.forEach(p => { if (p.productionPlanCode) codes.add(p.productionPlanCode) })
  harvestRecords.value.forEach(r => { if (r.productionPlanCode) codes.add(r.productionPlanCode) })
  inventoryRecords.value.forEach(inv => {
    const code = inv.batchCode || inv.productionPlanCode
    if (code) codes.add(code)
  })
  return codes
})

// 统计数据
const stats = computed(() => {
  const planRelated = productionPlans.value.filter(p => relatedPlanCodes.value.has(p.batchCode)).length
  const seedlingRelated = seedlings.value.filter(s => s.productionPlanCode && relatedPlanCodes.value.has(s.productionPlanCode)).length
  const plantingRelated = plantings.value.filter(p => p.productionPlanCode && relatedPlanCodes.value.has(p.productionPlanCode)).length
  const harvestRelated = harvestRecords.value.filter(r => r.productionPlanCode && relatedPlanCodes.value.has(r.productionPlanCode)).length
  const inventoryRelated = inventoryRecords.value.filter(inv => {
    const code = inv.batchCode || inv.productionPlanCode
    return code && relatedPlanCodes.value.has(code)
  }).length

  return {
    productionPlans: { total: productionPlans.value.length, related: planRelated },
    seedlings: { total: seedlings.value.length, related: seedlingRelated },
    plantings: { total: plantings.value.length, related: plantingRelated },
    plantingOperations: { total: plantings.value.length, related: plantingRelated },
    harvests: { total: harvestRecords.value.length, related: harvestRelated },
    inventory: { total: inventoryRecords.value.length, related: inventoryRelated },
  }
})

// 获取Tab对应数据总数
function getTabTotal(key) {
  return stats.value[key]?.total || 0
}

// 当前Tab统计数据
const currentStats = computed(() => {
  const stat = stats.value[activeTab.value]
  return stat || { total: 0, related: 0 }
})

// 表格数据
const tableData = computed(() => {
  switch (activeTab.value) {
    case 'productionPlans': return productionPlans.value
    case 'seedlings': return seedlings.value
    case 'plantings': return seedlings.value // 育苗管理使用seedlings数据
    case 'plantingOperations': return plantings.value
    case 'harvests': return harvestRecords.value
    case 'inventory': return inventoryRecords.value
    default: return []
  }
})

// 查看详情跳转（顶部"查看详情"按钮）
function handleViewDetail() {
  if (activeConfig.value) {
    router.push(activeConfig.value.routePath)
  }
}

// 修复 P0: 行级"查看"按钮：与顶部按钮行为一致，跳转到当前 Tab 对应页面
function handleViewRecord() {
  handleViewDetail()
}
</script>
