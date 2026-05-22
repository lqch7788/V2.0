<template>
  <div class="p-6 space-y-4">
    <!-- 标题卡片 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" color="white"><Barcode /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">作物实例追溯</h1>
          <p class="text-gray-500">追溯作物全生命周期和供应链信息</p>
        </div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div class="flex gap-4">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">搜索实例编码/作物品种</label>
          <el-input
            v-model="searchCode"
            type="text"
            placeholder="请输入实例编码、作物品种或品种"
            clearable
            @input="handleSearch"
          />
        </div>
        <div class="flex items-end">
          <el-button type="primary" @click="handleQuery">
            <el-icon class="mr-1"><Search /></el-icon>
            查询
          </el-button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <!-- 左侧：实例列表 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h3 class="text-sm font-bold text-gray-700">作物实例列表</h3>
        </div>
        <div class="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          <div v-if="filteredInstances.length === 0" class="px-4 py-8 text-center text-gray-500">
            暂无数据
          </div>
          <div
            v-for="inst in filteredInstances"
            :key="inst.id"
            :class="[
              'px-4 py-3 hover:bg-emerald-50 cursor-pointer transition-colors',
              selectedInstance?.id === inst.id ? 'bg-emerald-50 border-l-4 border-emerald-500' : ''
            ]"
            @click="handleSelect(inst)"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-mono font-medium text-emerald-600">
                {{ inst.instanceCode }}
              </span>
              <span :class="getStatusBadgeClass(inst.status)">
                {{ getStatusLabel(inst.status) }}
              </span>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <span>{{ inst.cropName }}</span>
              <span>-</span>
              <span>{{ inst.cropVariety }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-400 mt-1">
              <span>{{ inst.initialQuantity }} {{ inst.unit || '株' }}</span>
              <template v-if="inst.orderCode">
                <span>-</span>
                <span>订单: {{ inst.orderCode }}</span>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：溯源详情 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h3 class="text-sm font-bold text-gray-700">溯源详情</h3>
        </div>
        <div class="p-4 max-h-[600px] overflow-y-auto">
          <div v-if="!selectedInstance" class="text-center text-gray-500 py-8">
            请从左侧选择一个实例查看溯源详情
          </div>
          <div v-else class="space-y-4">
            <!-- 实例基本信息 -->
            <div class="bg-emerald-50 rounded-lg p-4">
              <h4 class="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2">
                <el-icon><Goods /></el-icon>
                实例信息
              </h4>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-xs text-gray-500">实例编码</p>
                  <p class="font-mono font-medium text-emerald-600">{{ selectedInstance.instanceCode }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">状态</p>
                  <span :class="getStatusBadgeClass(selectedInstance.status)">
                    {{ getStatusLabel(selectedInstance.status) }}
                  </span>
                </div>
                <div>
                  <p class="text-xs text-gray-500">作物名称</p>
                  <p class="font-medium">{{ selectedInstance.cropName }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">作物品种</p>
                  <p class="font-medium">{{ selectedInstance.cropVariety }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">来源类型</p>
                  <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {{ getSourceLabel(selectedInstance.sourceOrigin) }}
                  </span>
                </div>
                <div>
                  <p class="text-xs text-gray-500">初始数量</p>
                  <p class="font-medium">{{ selectedInstance.initialQuantity }}</p>
                </div>
              </div>
              <div v-if="selectedInstance.sourceDescription" class="mt-3 text-sm">
                <p class="text-xs text-gray-500">来源描述</p>
                <p class="text-gray-700">{{ selectedInstance.sourceDescription }}</p>
              </div>
            </div>

            <!-- 时间节点 -->
            <div class="bg-blue-50 rounded-lg p-4">
              <h4 class="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
                <el-icon><Calendar /></el-icon>
                时间节点
              </h4>
              <div class="space-y-2 text-sm">
                <div v-if="selectedInstance.seedEntryDate" class="flex items-center gap-2">
                  <el-icon color="#10b981"><Check /></el-icon>
                  <span class="text-gray-600">种源入库：</span>
                  <span class="text-gray-900">{{ selectedInstance.seedEntryDate }}</span>
                </div>
                <div v-if="selectedInstance.seedlingStartDate" class="flex items-center gap-2">
                  <el-icon color="#10b981"><Check /></el-icon>
                  <span class="text-gray-600">育苗开始：</span>
                  <span class="text-gray-900">{{ selectedInstance.seedlingStartDate }}</span>
                </div>
                <div v-if="selectedInstance.plantingDate" class="flex items-center gap-2">
                  <el-icon color="#10b981"><Check /></el-icon>
                  <span class="text-gray-600">定植日期：</span>
                  <span class="text-gray-900">{{ selectedInstance.plantingDate }}</span>
                </div>
                <div v-if="selectedInstance.harvestDate" class="flex items-center gap-2">
                  <el-icon color="#10b981"><Check /></el-icon>
                  <span class="text-gray-600">首次采收：</span>
                  <span class="text-gray-900">{{ selectedInstance.harvestDate }}</span>
                </div>
                <div v-if="selectedInstance.outboundDate" class="flex items-center gap-2">
                  <el-icon color="#10b981"><Check /></el-icon>
                  <span class="text-gray-600">出库日期：</span>
                  <span class="text-gray-900">{{ selectedInstance.outboundDate }}</span>
                </div>
                <p v-if="!selectedInstance.seedEntryDate && !selectedInstance.seedlingStartDate &&
                         !selectedInstance.plantingDate && !selectedInstance.harvestDate && !selectedInstance.outboundDate"
                   class="text-gray-500 text-xs">
                  暂无时间记录
                </p>
              </div>
            </div>

            <!-- 数量追踪 -->
            <div class="bg-amber-50 rounded-lg p-4">
              <h4 class="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
                <el-icon><Location /></el-icon>
                数量追踪
              </h4>
              <div class="space-y-2 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">初始数量</span>
                  <span class="font-medium">{{ selectedInstance.initialQuantity }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">当前剩余</span>
                  <span class="font-medium">{{ selectedInstance.currentQuantity }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">已定植</span>
                  <span class="font-medium">{{ selectedInstance.plantedQuantity }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">已采收</span>
                  <span class="font-medium">{{ selectedInstance.harvestedQuantity }}</span>
                </div>
              </div>
            </div>

            <!-- 关联订单 -->
            <div v-if="selectedInstance.orderCode" class="bg-purple-50 rounded-lg p-4">
              <h4 class="text-sm font-bold text-purple-700 mb-3">关联订单</h4>
              <div class="text-sm">
                <p class="text-gray-600">订单编号：</p>
                <p class="font-medium text-purple-600">{{ selectedInstance.orderCode }}</p>
              </div>
            </div>

            <!-- 关联记录 -->
            <div v-if="traceChain" class="space-y-3">
              <div v-if="traceChain.seedSources && traceChain.seedSources.length > 0" class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs text-gray-500 mb-1">关联种源（{{ traceChain.seedSources.length }}条）</p>
                <p v-for="s in traceChain.seedSources" :key="s.id" class="text-sm font-medium text-gray-900">
                  {{ s.seedCode }}
                </p>
              </div>
              <div v-if="traceChain.seedlings && traceChain.seedlings.length > 0" class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs text-gray-500 mb-1">关联育苗</p>
                <p v-for="s in traceChain.seedlings" :key="s.id" class="text-sm font-medium text-gray-900">
                  {{ s.seedlingCode }}
                </p>
              </div>
              <div v-if="traceChain.plantings && traceChain.plantings.length > 0" class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs text-gray-500 mb-1">关联种植</p>
                <p v-for="p in traceChain.plantings" :key="p.id" class="text-sm font-medium text-gray-900">
                  {{ p.plantCode }}
                </p>
              </div>
              <div v-if="traceChain.harvests && traceChain.harvests.length > 0" class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs text-gray-500 mb-1">关联采收</p>
                <p v-for="h in traceChain.harvests" :key="h.id" class="text-sm font-medium text-gray-900">
                  {{ h.harvestCode }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Goods, Calendar, Location, Collection, Check } from '@element-plus/icons-vue'
import {  CropInstance, CropInstanceStatus, SourceOrigin, CropTraceChain  } from '@/types/crop'
import { CROP_INSTANCE_STATUS_MAP, SOURCE_ORIGIN_MAP } from '@/constants/cropConstants'

// 搜索关键词
const searchCode = ref('')
// 选中的实例
const selectedInstance = ref(null)
// 溯源链数据
const traceChain = ref(null)
// 作物实例列表
const instances = ref([])

// 作物实例状态映射（与V1.1保持一致）
const STATUS_MAP = {
  seedling: { label: '育苗中', bg: 'bg-blue-100', text: 'text-blue-700' },
  planted: { label: '已定植', bg: 'bg-amber-100', text: 'text-amber-700' },
  growing: { label: '生长期', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  harvested: { label: '已采收', bg: 'bg-purple-100', text: 'text-purple-700' },
  outbound: { label: '已出库', bg: 'bg-cyan-100', text: 'text-cyan-700' },
  cancelled: { label: '已取消', bg: 'bg-red-100', text: 'text-red-700' },
}

// 获取状态标签
const getStatusLabel = (status) => {
  return STATUS_MAP[status]?.label || status
}

// 获取状态样式类
const getStatusBadgeClass = (status) => {
  const style = STATUS_MAP[status]
  if (!style) return ''
  return `${style.bg} ${style.text} px-2 py-1 text-xs rounded-full`
}

// 获取来源类型标签
const getSourceLabel = (source) => {
  return SOURCE_ORIGIN_MAP[source] || String(source)
}

// 筛选后的实例列表
const filteredInstances = computed(() => {
  if (!searchCode.value) {
    return instances.value.slice(0, 50) // 默认显示前50条
  }
  return instances.value.filter(inst =>
    inst.instanceCode.toLowerCase().includes(searchCode.value.toLowerCase()) ||
    inst.cropName.includes(searchCode.value) ||
    inst.cropVariety.includes(searchCode.value)
  ).slice(0, 50)
})

// 搜索处理
const handleSearch = () => {
  // 搜索时会自动通过computed更新
}

// 选择实例
const handleSelect = (inst) => {
  selectedInstance.value = inst
  // 查询溯源链（模拟）
  queryTraceChain(inst.id)
}

// 查询溯源链
const queryTraceChain = async (id) => {
  // 模拟数据，实际应调用API
  traceChain.value = {
    instance: selectedInstance.value,
    seedSources: [],
    seedlings: [],
    plantings: [],
    harvests: []
  }
}

// 加载实例数据
const loadInstances = async () => {
  // 模拟数据，实际应从API获取
  instances.value = [
    {
      id: '1',
      instanceCode: 'PD030100400240426001',
      cropCategory: '蔬菜类',
      cropName: '番茄',
      cropVariety: '红果番茄',
      categoryCode: 'PD',
      typeCode: '03',
      subCode: '01',
      sourceOrigin: 'external_purchase',
      sourceDescription: '从XX供应商采购',
      initialQuantity: 1000,
      currentQuantity: 800,
      plantedQuantity: 500,
      harvestedQuantity: 200,
      status: 'growing',
      seedEntryDate: '2024-04-01',
      seedlingStartDate: '2024-04-15',
      plantingDate: '2024-05-01',
      harvestDate: '2024-07-01',
      unit: '株',
      createBy: 'admin',
      createTime: '2024-04-01 10:00:00',
      updateTime: '2024-07-01 10:00:00'
    },
    {
      id: '2',
      instanceCode: 'PD030100400240427002',
      cropCategory: '蔬菜类',
      cropName: '番茄',
      cropVariety: '樱桃番茄',
      categoryCode: 'PD',
      typeCode: '03',
      subCode: '01',
      sourceOrigin: 'internal_seed',
      sourceDescription: '内部留种',
      initialQuantity: 1000,
      currentQuantity: 800,
      plantedQuantity: 500,
      harvestedQuantity: 200,
      status: 'planted',
      seedEntryDate: '2024-04-10',
      seedlingStartDate: '2024-04-20',
      plantingDate: '2024-05-15',
      unit: '株',
      createBy: 'admin',
      createTime: '2024-04-10 10:00:00',
      updateTime: '2024-05-15 10:00:00'
    },
    {
      id: '3',
      instanceCode: 'PD020100400240428003',
      cropCategory: '蔬菜类',
      cropName: '黄瓜',
      cropVariety: '水果黄瓜',
      categoryCode: 'PD',
      typeCode: '02',
      subCode: '01',
      sourceOrigin: 'external_purchase',
      sourceDescription: '从YY供应商采购',
      initialQuantity: 1000,
      currentQuantity: 800,
      plantedQuantity: 500,
      harvestedQuantity: 200,
      status: 'harvested',
      seedEntryDate: '2024-03-01',
      seedlingStartDate: '2024-03-15',
      plantingDate: '2024-04-10',
      harvestDate: '2024-06-01',
      outboundDate: '2024-06-15',
      unit: '株',
      createBy: 'admin',
      createTime: '2024-03-01 10:00:00',
      updateTime: '2024-06-15 10:00:00'
    }
  ]
}

// 查询按钮处理
const handleQuery = () => {
  // V1.1中查询按钮点击后刷新列表，这里保持一致
}

// 页面加载时获取数据
onMounted(() => {
  loadInstances()
})
</script>
