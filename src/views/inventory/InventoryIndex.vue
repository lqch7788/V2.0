<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white">
              <Box />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">库存管理</h1>
            <p class="text-gray-500">库存数据统计与预警管理</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-4">
      <!-- 物料总数 -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="28" color="white">
              <Goods />
            </el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">物料种类</p>
            <p class="text-3xl font-bold text-gray-900">{{ totalMaterials }}</p>
          </div>
        </div>
      </div>

      <!-- 库存预警 -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <el-icon :size="28" color="white">
              <Warning />
            </el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">库存预警</p>
            <p class="text-3xl font-bold text-gray-900">{{ alertCount }}</p>
          </div>
        </div>
      </div>

      <!-- 本月入库 -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <el-icon :size="28" color="white">
              <Bottom />
            </el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">本月入库</p>
            <p class="text-3xl font-bold text-gray-900">{{ inboundCount }}</p>
          </div>
        </div>
      </div>

      <!-- 本月出库 -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <el-icon :size="28" color="white">
              <Top />
            </el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">本月出库</p>
            <p class="text-3xl font-bold text-gray-900">{{ outboundCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">快捷入口</h3>
      <div class="grid grid-cols-4 gap-4">
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
      </div>
    </div>

    <!-- 库存预警列表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">库存预警</h3>
        <el-button type="primary" link @click="handleViewAllAlerts">查看全部</el-button>
      </div>

      <el-table :data="alertList" stripe>
        <el-table-column prop="code" label="物料编号" width="120" />
        <el-table-column prop="name" label="物料名称" min-width="150" />
        <el-table-column prop="category" label="分类" width="100" />
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
        <el-table-column label="预警状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.alertType" size="small">
              {{ row.alertType === 'danger' ? '紧急' : '预警' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleReplenish(row)">补充库存</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 最近入库记录 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">最近入库记录</h3>
        <router-link to="/warehouse/inbound">
          <el-button type="primary" link>查看全部</el-button>
        </router-link>
      </div>

      <el-table :data="recentInbound" stripe>
        <el-table-column prop="code" label="入库单号" width="150" />
        <el-table-column prop="materialCode" label="物料编号" width="120" />
        <el-table-column prop="materialName" label="物料名称" min-width="150" />
        <el-table-column label="数量" width="80">
          <template #default="{ row }">
            {{ row.quantity }}{{ row.unit }}
          </template>
        </el-table-column>
        <el-table-column prop="supplier" label="供应商" width="120" />
        <el-table-column prop="inboundDate" label="入库日期" width="120" />
        <el-table-column prop="operator" label="操作员" width="100" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Box, Goods, Warning, Bottom, Top, Collection, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 统计数据
const totalMaterials = ref(156)
const alertCount = ref(8)
const inboundCount = ref(42)
const outboundCount = ref(38)

// 预警列表数据
const alertList = ref([
  { id: 1, code: '010101001', name: '番茄种子', category: '种子', quantity: 5, minStock: 20, alertType: 'danger' },
  { id: 2, code: '010201001', name: '尿素', category: '肥料', quantity: 15, minStock: 30, alertType: 'warning' },
  { id: 3, code: '010301001', name: '多菌灵', category: '农药', quantity: 8, minStock: 15, alertType: 'warning' },
  { id: 4, code: '020101001', name: '纸箱(大)', category: '资材', quantity: 20, minStock: 50, alertType: 'danger' },
])

// 最近入库记录
const recentInbound = ref([
  { id: 1, code: 'RK20260522-001', materialCode: '010101001', materialName: '番茄种子', quantity: 50, unit: '袋', supplier: '种子公司A', inboundDate: '2026-05-22', operator: '张三' },
  { id: 2, code: 'RK20260521-001', materialCode: '010201001', materialName: '尿素', quantity: 100, unit: '袋', supplier: '肥料公司B', inboundDate: '2026-05-21', operator: '李四' },
  { id: 3, code: 'RK20260520-001', materialCode: '010301001', materialName: '多菌灵', quantity: 30, unit: '瓶', supplier: '农药公司C', inboundDate: '2026-05-20', operator: '王五' },
])

// 方法
const handleViewAllAlerts = () => {
  ElMessage.info('查看全部预警记录')
}

const handleReplenish = (row) => {
  ElMessage.info(`补充库存: ${row.name}`)
}
</script>
