<template>
  <div class="space-y-4">
    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 class="text-base font-semibold text-gray-800 mb-4">全链条追溯</h3>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex items-center justify-center h-64">
        <el-icon class="is-loading" :size="32" color="#10b981"><Loading /></el-icon>
      </div>

      <!-- 批次选择 -->
      <div v-else class="mb-4">
        <el-select v-model="selectedBatch" placeholder="选择种植批次" size="default" style="width: 300px" @change="handleBatchChange">
          <el-option v-for="batch in batches" :key="batch.id" :label="batch.batchCode" :value="batch.id" />
        </el-select>
      </div>

      <!-- 追溯链条展示 -->
      <div v-if="!isLoading && selectedBatch" class="space-y-6">
        <!-- 追溯流程图 -->
        <div class="p-6 bg-gray-50 rounded-xl">
          <div class="flex items-center justify-between">
            <div v-for="(step, index) in traceSteps" :key="index" class="flex items-center">
              <div class="flex flex-col items-center">
                <div class="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                  {{ index + 1 }}
                </div>
                <span class="text-xs text-gray-600 mt-2 max-w-20 text-center">{{ step.name }}</span>
                <span class="text-xs text-gray-400">{{ step.time }}</span>
              </div>
              <div v-if="index < traceSteps.length - 1" class="w-16 h-0.5 bg-gray-300 mx-2" />
            </div>
          </div>
        </div>

        <!-- 各环节详情 -->
        <div class="grid grid-cols-2 gap-4">
          <!-- 种子来源 -->
          <div class="bg-white rounded-xl p-4 border border-gray-200">
            <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <el-icon color="#10b981"><Shop /></el-icon>
              种子来源
            </h4>
            <el-descriptions :column="1" size="small">
              <el-descriptions-item label="种子名称">{{ currentTrace.seed?.name || '--' }}</el-descriptions-item>
              <el-descriptions-item label="品种">{{ currentTrace.seed?.variety || '--' }}</el-descriptions-item>
              <el-descriptions-item label="供应商">{{ currentTrace.seed?.supplier || '--' }}</el-descriptions-item>
              <el-descriptions-item label="采购日期">{{ currentTrace.seed?.purchaseDate || '--' }}</el-descriptions-item>
              <el-descriptions-item label="批次号">{{ currentTrace.seed?.batchNo || '--' }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 育苗记录 -->
          <div class="bg-white rounded-xl p-4 border border-gray-200">
            <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <el-icon color="#06b6d4"><Sunny /></el-icon>
              育苗记录
            </h4>
            <el-descriptions :column="1" size="small">
              <el-descriptions-item label="育苗基地">{{ currentTrace.seedling?.base || '--' }}</el-descriptions-item>
              <el-descriptions-item label="播种日期">{{ currentTrace.seedling?.sowingDate || '--' }}</el-descriptions-item>
              <el-descriptions-item label="发芽日期">{{ currentTrace.seedling?.germinationDate || '--' }}</el-descriptions-item>
              <el-descriptions-item label="成苗率">{{ currentTrace.seedling?.survivalRate || '--' }}</el-descriptions-item>
              <el-descriptions-item label="定植日期">{{ currentTrace.seedling?.transplantDate || '--' }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 种植记录 -->
          <div class="bg-white rounded-xl p-4 border border-gray-200">
            <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <el-icon color="#22c55e"><Grid /></el-icon>
              种植记录
            </h4>
            <el-descriptions :column="1" size="small">
              <el-descriptions-item label="种植区域">{{ currentTrace.planting?.greenhouse || '--' }}</el-descriptions-item>
              <el-descriptions-item label="种植面积">{{ currentTrace.planting?.area || '--' }}</el-descriptions-item>
              <el-descriptions-item label="种植日期">{{ currentTrace.planting?.date || '--' }}</el-descriptions-item>
              <el-descriptions-item label="负责人">{{ currentTrace.planting?.manager || '--' }}</el-descriptions-item>
              <el-descriptions-item label="生长周期">{{ currentTrace.planting?.growthCycle || '--' }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 施肥记录 -->
          <div class="bg-white rounded-xl p-4 border border-gray-200">
            <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <el-icon color="#a855f7"><Tools /></el-icon>
              施肥记录
            </h4>
            <el-descriptions :column="1" size="small">
              <el-descriptions-item label="肥料类型">{{ currentTrace.fertilization?.type || '--' }}</el-descriptions-item>
              <el-descriptions-item label="施肥方式">{{ currentTrace.fertilization?.method || '--' }}</el-descriptions-item>
              <el-descriptions-item label="施肥日期">{{ currentTrace.fertilization?.date || '--' }}</el-descriptions-item>
              <el-descriptions-item label="用肥量">{{ currentTrace.fertilization?.amount || '--' }}</el-descriptions-item>
              <el-descriptions-item label="执行人">{{ currentTrace.fertilization?.operator || '--' }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 采收记录 -->
          <div class="bg-white rounded-xl p-4 border border-gray-200">
            <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <el-icon color="#f97316"><Basketball /></el-icon>
              采收记录
            </h4>
            <el-descriptions :column="1" size="small">
              <el-descriptions-item label="采收日期">{{ currentTrace.harvest?.date || '--' }}</el-descriptions-item>
              <el-descriptions-item label="采收量">{{ currentTrace.harvest?.quantity || '--' }}</el-descriptions-item>
              <el-descriptions-item label="采收质量">{{ currentTrace.harvest?.quality || '--' }}</el-descriptions-item>
              <el-descriptions-item label="采收人">{{ currentTrace.harvest?.operator || '--' }}</el-descriptions-item>
              <el-descriptions-item label="检测报告">{{ currentTrace.harvest?.report || '--' }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 销售记录 -->
          <div class="bg-white rounded-xl p-4 border border-gray-200">
            <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <el-icon color="#3b82f6"><Sell /></el-icon>
              销售记录
            </h4>
            <el-descriptions :column="1" size="small">
              <el-descriptions-item label="销售日期">{{ currentTrace.sale?.date || '--' }}</el-descriptions-item>
              <el-descriptions-item label="销售渠道">{{ currentTrace.sale?.channel || '--' }}</el-descriptions-item>
              <el-descriptions-item label="销售数量">{{ currentTrace.sale?.quantity || '--' }}</el-descriptions-item>
              <el-descriptions-item label="销售价格">{{ currentTrace.sale?.price || '--' }}</el-descriptions-item>
              <el-descriptions-item label="客户名称">{{ currentTrace.sale?.customer || '--' }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-center gap-4">
          <el-button type="primary" @click="handleExport">导出追溯报告</el-button>
          <el-button @click="handlePrint">打印追溯码</el-button>
        </div>
      </div>

      <!-- 未选择批次 -->
      <div v-else-if="!isLoading && !selectedBatch" class="flex flex-col items-center justify-center h-64 text-gray-400">
        <el-icon :size="48"><Link /></el-icon>
        <span class="text-sm mt-2">请选择种植批次查看追溯信息</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Loading, Link, Shop, Sunny, Grid, Tools, Basketball, Sell } from '@element-plus/icons-vue'
import { useSummaryStore } from '@/stores/modules/summary'

const summaryStore = useSummaryStore()
const isLoading = computed(() => summaryStore.isLoading)

// 批次列表
const batches = ref([
  { id: 1, batchCode: 'B20260501', cropName: '番茄' },
  { id: 2, batchCode: 'B20260502', cropName: '黄瓜' },
  { id: 3, batchCode: 'B20260401', cropName: '茄子' },
])

const selectedBatch = ref(null)

// 追溯步骤
const traceSteps = ref([
  { name: '种子来源', time: '2026-02-01' },
  { name: '育苗记录', time: '2026-02-15' },
  { name: '种植记录', time: '2026-03-15' },
  { name: '施肥记录', time: '2026-04-01' },
  { name: '采收记录', time: '2026-05-10' },
  { name: '销售记录', time: '2026-05-15' },
])

// 当前追溯数据
const currentTrace = ref({
  seed: {
    name: '番茄种子-大红果',
    variety: '大红番茄',
    supplier: '北京种子公司',
    purchaseDate: '2026-02-01',
    batchNo: 'SD20260201001'
  },
  seedling: {
    base: '崇明岛育苗中心',
    sowingDate: '2026-02-15',
    germinationDate: '2026-02-22',
    survivalRate: '95%',
    transplantDate: '2026-03-15'
  },
  planting: {
    greenhouse: '1号棚-A区',
    area: '1000㎡',
    date: '2026-03-15',
    manager: '张伟民',
    growthCycle: '90天'
  },
  fertilization: {
    type: '有机肥+复合肥',
    method: '穴施+滴灌',
    date: '2026-04-01',
    amount: '有机肥500kg + 复合肥100kg',
    operator: '李明轩'
  },
  harvest: {
    date: '2026-05-10',
    quantity: '2500kg',
    quality: '一级品',
    operator: '王建国',
    report: '合格'
  },
  sale: {
    date: '2026-05-15',
    channel: '超市供应链',
    quantity: '2000kg',
    price: '¥6.5/kg',
    customer: '永辉超市'
  }
})

const handleBatchChange = (batchId) => {
  console.log('选择的批次:', batchId)
}

const handleExport = () => {
  console.log('导出追溯报告')
}

const handlePrint = () => {
  console.log('打印追溯码')
}

onMounted(() => {
  // 加载批次列表
})
</script>

<style scoped>
.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
