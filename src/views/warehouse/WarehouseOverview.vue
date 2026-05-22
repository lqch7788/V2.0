<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <el-icon :size="24" color="white">
              <OfficeBuilding />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">仓库概览</h1>
            <p class="text-gray-500">仓库库存总览与统计</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="28" color="white">
              <Box />
            </el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">仓库总数</p>
            <p class="text-3xl font-bold text-gray-900">{{ warehouseStats.total }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <el-icon :size="28" color="white">
              <Goods />
            </el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">物料种类</p>
            <p class="text-3xl font-bold text-gray-900">{{ warehouseStats.materialTypes }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
            <el-icon :size="28" color="white">
              <Warning />
            </el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">库存预警</p>
            <p class="text-3xl font-bold text-gray-900">{{ warehouseStats.alerts }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <el-icon :size="28" color="white">
              <PieChart />
            </el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">库存利用率</p>
            <p class="text-3xl font-bold text-gray-900">{{ warehouseStats.utilization }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 仓库分布与状态 -->
    <div class="grid grid-cols-2 gap-6">
      <!-- 仓库列表 -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">仓库列表</h3>
          <router-link to="/warehouse/materials">
            <el-button type="primary" link>查看详情</el-button>
          </router-link>
        </div>

        <el-table :data="warehouseList" stripe>
          <el-table-column prop="name" label="仓库名称" min-width="120" />
          <el-table-column prop="type" label="类型" width="100" />
          <el-table-column prop="capacity" label="容量(㎡)" width="100" />
          <el-table-column prop="used" label="已用(㎡)" width="100">
            <template #default="{ row }">
              <div class="flex items-center gap-2">
                <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-emerald-500 rounded-full"
                    :style="{ width: `${(row.used / row.capacity) * 100}%` }"
                  />
                </div>
                <span class="text-xs">{{ Math.round((row.used / row.capacity) * 100) }}%</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 'normal' ? 'success' : 'warning'" size="small">
                {{ row.status === 'normal' ? '正常' : '紧张' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 库存预警 -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">库存预警</h3>
          <el-button type="primary" link @click="handleViewAllAlerts">查看全部</el-button>
        </div>

        <el-table :data="alertList" stripe>
          <el-table-column prop="code" label="物料编号" width="120" />
          <el-table-column prop="name" label="物料名称" min-width="120" />
          <el-table-column label="当前库存" width="100">
            <template #default="{ row }">
              <span class="text-red-600 font-medium">{{ row.quantity }}</span>
            </template>
          </el-table-column>
          <el-table-column label="最低库存" width="100">
            <template #default="{ row }">
              <span>{{ row.minStock }}</span>
            </template>
          </el-table-column>
          <el-table-column label="预警等级" width="100">
            <template #default="{ row }">
              <el-tag :type="row.level === 'urgent' ? 'danger' : 'warning'" size="small">
                {{ row.level === 'urgent' ? '紧急' : '预警' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 分类库存统计 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">分类库存统计</h3>
      </div>

      <div class="p-4">
        <div class="grid grid-cols-4 gap-4">
          <div
            v-for="category in categoryStats"
            :key="category.code"
            class="p-4 rounded-xl border border-gray-200 hover:border-emerald-500 transition-all cursor-pointer"
            @click="handleCategoryClick(category)"
          >
            <div class="flex items-center gap-3 mb-2">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                :style="{ backgroundColor: category.color }"
              >
                <el-icon :size="20" color="white">
                  <Goods />
                </el-icon>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ category.name }}</p>
                <p class="text-xs text-gray-500">{{ category.types }} 个分类</p>
              </div>
            </div>
            <div class="flex items-end justify-between">
              <div>
                <p class="text-2xl font-bold text-gray-900">{{ category.quantity }}</p>
                <p class="text-xs text-gray-500">件</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-medium text-emerald-600">{{ category.percentage }}%</p>
                <p class="text-xs text-gray-500">占比</p>
              </div>
            </div>
            <!-- 进度条 -->
            <div class="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                :style="{ width: `${category.percentage}%`, backgroundColor: category.color }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 库存走势 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">月度库存走势</h3>
        <div class="flex gap-2">
          <el-radio-group v-model="trendPeriod" size="small">
            <el-radio-button label="week">本周</el-radio-button>
            <el-radio-button label="month">本月</el-radio-button>
            <el-radio-button label="year">本年</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="p-4">
        <div class="h-64 flex items-end justify-around gap-4">
          <div
            v-for="(item, index) in trendData"
            :key="index"
            class="flex flex-col items-center gap-2"
          >
            <div
              class="w-16 rounded-t-lg transition-all hover:opacity-80"
              :style="{
                height: `${(item.value / maxTrendValue) * 200}px`,
                backgroundColor: item.color
              }"
            />
            <div class="text-center">
              <p class="text-sm font-medium text-gray-900">{{ item.label }}</p>
              <p class="text-xs text-gray-500">{{ item.value }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">快捷操作</h3>
      <div class="grid grid-cols-4 gap-4">
        <router-link
          to="/warehouse/inbound"
          class="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
        >
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <el-icon :size="20" color="white"><Bottom /></el-icon>
          </div>
          <div>
            <p class="font-medium text-gray-900">物料入库</p>
            <p class="text-xs text-gray-500">入库记录管理</p>
          </div>
        </router-link>

        <router-link
          to="/warehouse/materials"
          class="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all"
        >
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="20" color="white"><Goods /></el-icon>
          </div>
          <div>
            <p class="font-medium text-gray-900">仓库物料</p>
            <p class="text-xs text-gray-500">物料库存管理</p>
          </div>
        </router-link>

        <router-link
          to="/material/receiving"
          class="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all"
        >
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <el-icon :size="20" color="white"><Upload /></el-icon>
          </div>
          <div>
            <p class="font-medium text-gray-900">物料接收</p>
            <p class="text-xs text-gray-500">接收记录管理</p>
          </div>
        </router-link>

        <router-link
          to="/material/category"
          class="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all"
        >
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
            <el-icon :size="20" color="white"><Collection /></el-icon>
          </div>
          <div>
            <p class="font-medium text-gray-900">物料类别</p>
            <p class="text-xs text-gray-500">分类管理</p>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { OfficeBuilding, Box, Goods, Warning, PieChart, Bottom, Upload, Collection } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 仓库统计数据
const warehouseStats = ref({
  total: 4,
  materialTypes: 156,
  alerts: 8,
  utilization: 78
})

// 仓库列表数据
const warehouseList = ref([
  { id: 1, name: '原料仓库A', type: '原料仓', capacity: 500, used: 380, status: 'normal' },
  { id: 2, name: '原料仓库B', type: '原料仓', capacity: 400, used: 350, status: 'warning' },
  { id: 3, name: '成品仓库', type: '成品仓', capacity: 600, used: 420, status: 'normal' },
  { id: 4, name: '包材仓库', type: '资材仓', capacity: 300, used: 180, status: 'normal' },
])

// 预警列表数据
const alertList = ref([
  { id: 1, code: '010101001', name: '番茄种子', quantity: 5, minStock: 20, level: 'urgent' },
  { id: 2, code: '010201001', name: '尿素', quantity: 15, minStock: 30, level: 'warning' },
  { id: 3, code: '010301001', name: '多菌灵', quantity: 8, minStock: 15, level: 'warning' },
  { id: 4, code: '020101001', name: '纸箱(大)', quantity: 20, minStock: 50, level: 'urgent' },
  { id: 5, code: '020201001', name: '剪刀', quantity: 3, minStock: 10, level: 'urgent' },
])

// 分类统计数据
const categoryStats = ref([
  { code: '01', name: '种子', color: '#10b981', types: 12, quantity: 1250, percentage: 25 },
  { code: '02', name: '肥料', color: '#f59e0b', types: 18, quantity: 2100, percentage: 35 },
  { code: '03', name: '农药', color: '#ef4444', types: 15, quantity: 980, percentage: 20 },
  { code: '04', name: '资材', color: '#3b82f6', types: 25, quantity: 1200, percentage: 20 },
])

// 库存走势数据
const trendPeriod = ref('month')

const trendData = computed(() => {
  const monthData = [
    { label: '1月', value: 4200, color: '#10b981' },
    { label: '2月', value: 3800, color: '#10b981' },
    { label: '3月', value: 4500, color: '#10b981' },
    { label: '4月', value: 5200, color: '#10b981' },
    { label: '5月', value: 4800, color: '#10b981' },
    { label: '6月', value: 5530, color: '#10b981' },
  ]
  const weekData = [
    { label: '周一', value: 5200, color: '#10b981' },
    { label: '周二', value: 5350, color: '#10b981' },
    { label: '周三', value: 5100, color: '#10b981' },
    { label: '周四', value: 5480, color: '#10b981' },
    { label: '周五', value: 5530, color: '#10b981' },
  ]
  const yearData = [
    { label: 'Q1', value: 12500, color: '#10b981' },
    { label: 'Q2', value: 15800, color: '#10b981' },
    { label: 'Q3', value: 14200, color: '#10b981' },
    { label: 'Q4', value: 16530, color: '#10b981' },
  ]

  if (trendPeriod.value === 'week') return weekData
  if (trendPeriod.value === 'year') return yearData
  return monthData
})

const maxTrendValue = computed(() => {
  return Math.max(...trendData.value.map(item => item.value))
})

// 方法
const handleViewAllAlerts = () => {
  ElMessage.info('查看全部预警')
}

const handleCategoryClick = (category) => {
  ElMessage.info(`查看 ${category.name} 分类详情`)
}
</script>
