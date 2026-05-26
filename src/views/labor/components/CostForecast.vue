<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <el-icon :size="20" color="white"><TrendCharts /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">工资预算预测</h1>
            <p class="text-xs text-gray-500">基于种植批次计划的人工成本预算分析</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
        </div>
      </div>
    </div>

    <!-- 预警信息 -->
    <div v-if="warnings.length > 0" class="space-y-2">
      <div
        v-for="(warning, idx) in warnings"
        :key="idx"
        :class="['flex items-center gap-3 px-4 py-3 rounded-lg border', warning.class]"
      >
        <el-icon :size="20">
          <WarningFilled v-if="warning.level === 'critical'" />
          <Warning v-else />
        </el-icon>
        <span class="text-sm">{{ warning.message }}</span>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <!-- 左侧：参数设置 -->
      <div class="col-span-1">
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h3 class="text-sm font-medium text-gray-700 mb-4">参数设置</h3>
          <el-form label-width="80px" :model="inputParams">
            <el-form-item label="年份">
              <el-select v-model="inputParams.year" class="w-full">
                <el-option label="2024" value="2024" />
                <el-option label="2023" value="2023" />
              </el-select>
            </el-form-item>
            <el-form-item label="正式工人数">
              <el-input-number v-model="inputParams.formalWorkerCount" :min="0" class="w-full" />
            </el-form-item>
            <el-form-item label="临时工人数">
              <el-input-number v-model="inputParams.tempWorkerCount" :min="0" class="w-full" />
            </el-form-item>
            <el-form-item label="平均工资">
              <el-input-number v-model="inputParams.avgSalary" :min="0" :precision="2" class="w-full" />
            </el-form-item>
            <el-form-item label="临时工时薪">
              <el-input-number v-model="inputParams.tempHourlyRate" :min="0" :precision="2" class="w-full" />
            </el-form-item>
            <el-form-item label="预警阈值">
              <el-input-number v-model="inputParams.warningThreshold" :min="0" :max="100" class="w-full" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleCalculate">计算</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 右侧：图表 -->
      <div class="col-span-2 space-y-4">
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h3 class="text-sm font-medium text-gray-700 mb-4">月度成本趋势</h3>
          <div class="h-64 flex flex-col items-center justify-center text-gray-400">
            <p>月度成本趋势图表</p>
            <p class="text-xs mt-2 text-gray-300">(需要集成recharts图表库，V1.1使用recharts渲染4个图表：月度成本趋势、成本构成饼图、采收量柱状图、单位成本折线图)</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 年度汇总 -->
    <div class="bg-white p-4 rounded-lg border border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ inputParams.year }}年度预算汇总</h3>
      <div class="grid grid-cols-5 gap-4">
        <div class="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg">
          <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-600 mb-2">
            年度总成本
          </div>
          <div class="text-xl font-bold text-gray-900">{{ (yearlyBudget.totalLaborCost / 10000).toFixed(2) }}万元</div>
          <div class="text-xs text-gray-500 mt-1">¥{{ yearlyBudget.totalLaborCost.toLocaleString() }}</div>
        </div>
        <div class="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
          <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 mb-2">
            正式工成本
          </div>
          <div class="text-xl font-bold text-gray-900">{{ (yearlyBudget.formalWorkerCost / 10000).toFixed(2) }}万元</div>
          <div class="text-xs text-gray-500 mt-1">占比{{ yearlyBudget.formalWorkerRatio }}%</div>
        </div>
        <div class="p-4 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg">
          <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-600 mb-2">
            临时工成本
          </div>
          <div class="text-xl font-bold text-gray-900">{{ (yearlyBudget.tempWorkerCost / 10000).toFixed(2) }}万元</div>
          <div class="text-xs text-gray-500 mt-1">占比{{ yearlyBudget.tempWorkerRatio }}%</div>
        </div>
        <div class="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
          <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-600 mb-2">
            预计采收量
          </div>
          <div class="text-xl font-bold text-gray-900">{{ (yearlyBudget.totalYield / 10000).toFixed(2) }}万斤</div>
          <div class="text-xs text-gray-500 mt-1">人均{{ yearlyBudget.avgYieldPerPerson }}斤/人</div>
        </div>
        <div class="p-4 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg">
          <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-600 mb-2">
            平均单位成本
          </div>
          <div class="text-xl font-bold text-gray-900">¥{{ yearlyBudget.avgCostPerUnit.toFixed(2) }}/斤</div>
          <div class="text-xs text-gray-500 mt-1">预警阈值{{ inputParams.warningThreshold }}%</div>
        </div>
      </div>

      <!-- 季度分布 -->
      <div class="mt-6">
        <h4 class="text-sm font-medium text-gray-700 mb-3">季度成本分布</h4>
        <div class="grid grid-cols-4 gap-4">
          <div v-for="quarter in quarterlyBudget" :key="quarter.quarter" class="p-3 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-lg">
            <div class="text-sm text-gray-500 mb-1">{{ quarter.quarter }}</div>
            <div class="text-lg font-semibold text-gray-900">
              {{ (quarter.laborCost / 10000).toFixed(2) }}万元
            </div>
            <div class="text-xs text-gray-400 mt-1">
              用工{{ quarter.headcount }}人 | 采收{{ quarter.yieldPrediction.toLocaleString() }}斤
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 月度明细表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table :data="monthlyBudget" border stripe v-loading="loading" :header-cell-style="{ background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: '#fff', fontWeight: '600', fontSize: '14px' }">
        <el-table-column prop="month" label="月份" width="100" />
        <el-table-column prop="totalCost" label="总成本(万元)" width="130" align="right">
          <template #default="{ row }">
            {{ (row.laborCost / 10000).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="formalWorkerCost" label="正式工(万元)" width="130" align="right">
          <template #default="{ row }">
            {{ (row.formalWorkerCost / 10000).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="tempWorkerCost" label="临时工(万元)" width="130" align="right">
          <template #default="{ row }">
            {{ (row.tempWorkerCost / 10000).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="socialSecurity" label="社保(万元)" width="110" align="right">
          <template #default="{ row }">
            {{ (row.socialSecurity / 10000).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="benefits" label="福利(万元)" width="110" align="right">
          <template #default="{ row }">
            {{ (row.benefits / 10000).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="headcount" label="人数" width="80" align="center" />
        <el-table-column prop="yieldPrediction" label="采收量(万斤)" width="130" align="right">
          <template #default="{ row }">
            {{ (row.yieldPrediction / 10000).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="costPerUnit" label="单位成本" width="100" align="right">
          <template #default="{ row }">
            ¥{{ row.costPerUnit.toFixed(2) }}
          </template>
        </el-table-column>
        <template #empty>
          <div class="text-center py-8">
            <p class="text-gray-400">{{ error || '暂无数据' }}</p>
          </div>
        </template>
      </el-table>
    </div>

    <!-- 新增弹窗 -->
    <el-dialog v-model="addModalVisible" title="新建月度预算" width="600px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="月份">
          <el-date-picker
            v-model="formData.month"
            type="month"
            format="YYYY-MM"
            value-format="YYYY-MM"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="总成本(万元)">
          <el-input-number v-model="formData.totalCost" :min="0" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="正式工成本">
          <el-input-number v-model="formData.formalWorkerCost" :min="0" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="临时工成本">
          <el-input-number v-model="formData.tempWorkerCost" :min="0" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="人数">
          <el-input-number v-model="formData.headcount" :min="0" class="w-full" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAdd">确定</el-button>
      </template>
    </el-dialog>

    <!-- 导出格式选择弹窗 -->
    <el-dialog v-model="exportModalVisible" title="选择导出格式" width="400px">
      <el-radio-group v-model="exportFormat" class="flex flex-col gap-3">
        <el-radio value="excel">Excel (.xls)</el-radio>
        <el-radio value="csv">CSV (.csv)</el-radio>
        <el-radio value="word">Word (.doc)</el-radio>
      </el-radio-group>
      <template #footer>
        <el-button @click="exportModalVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmExport">确认导出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { TrendCharts, Download, Plus, Warning, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useLaborStore } from '@/stores/modules/labor'
import { useExport } from '@/composables/useExport'

// Labor Store
const laborStore = useLaborStore()

// 导出功能
const { exportWithFormatSelect } = useExport({ fileName: '成本预测' })
// 导出列配置（与表格列对应，key使用实际数据字段名）
const exportColumns = [
  { key: 'month', label: '月份' },
  { key: 'laborCost', label: '总成本(万元)' },
  { key: 'formalWorkerCost', label: '正式工(万元)' },
  { key: 'tempWorkerCost', label: '临时工(万元)' },
  { key: 'socialSecurity', label: '社保(万元)' },
  { key: 'benefits', label: '福利(万元)' },
  { key: 'headcount', label: '人数' },
  { key: 'yieldPrediction', label: '采收量(万斤)' },
  { key: 'costPerUnit', label: '单位成本' }
]

// 输入参数
const inputParams = reactive({
  year: '2024',
  formalWorkerCount: 50,
  tempWorkerCount: 30,
  avgSalary: 5000,
  tempHourlyRate: 25,
  warningThreshold: 80
})

// 预警信息
const warnings = ref([])

// 年度预算汇总
const yearlyBudget = reactive({
  totalLaborCost: 0,
  formalWorkerCost: 0,
  formalWorkerRatio: 0,
  tempWorkerCost: 0,
  tempWorkerRatio: 0,
  totalYield: 0,
  avgYieldPerPerson: 0,
  avgCostPerUnit: 0
})

// 季度分布
const quarterlyBudget = ref([])

// 月度明细
const monthlyBudget = ref([])
const loading = ref(false)
const error = ref('')

// 弹窗状态
const addModalVisible = ref(false)
// 导出弹窗状态
const exportModalVisible = ref(false)
const exportFormat = ref('excel')
const formData = reactive({
  month: '',
  totalCost: 0,
  formalWorkerCost: 0,
  tempWorkerCost: 0,
  headcount: 0
})

// 加载成本统计数据
const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    const params = { year: inputParams.year }
    await laborStore.fetchLaborCostStats(params)
    const stats = laborStore.laborCostStats
    if (stats) {
      // 年度汇总
      if (stats.yearlyBudget) {
        Object.assign(yearlyBudget, stats.yearlyBudget)
      }
      // 季度分布
      if (stats.quarterlyBudget) {
        quarterlyBudget.value = stats.quarterlyBudget
      }
      // 月度明细
      if (stats.monthlyBudget) {
        monthlyBudget.value = stats.monthlyBudget
      }
      // 预警信息
      if (stats.warnings) {
        warnings.value = stats.warnings
      }
    }
  } catch (e) {
    console.error('加载成本统计数据失败:', e)
    error.value = '加载数据失败'
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 计算
const handleCalculate = async () => {
  try {
    await loadData()
    ElMessage.success('计算完成')
  } catch (e) {
    ElMessage.error('计算失败')
  }
}

// 重置
const handleReset = () => {
  inputParams.formalWorkerCount = 50
  inputParams.tempWorkerCount = 30
  inputParams.avgSalary = 5000
  inputParams.tempHourlyRate = 25
  inputParams.warningThreshold = 80
}

// 导出
const handleExport = () => {
  if (!monthlyBudget.value || monthlyBudget.value.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  exportModalVisible.value = true
}

// 确认导出
const confirmExport = () => {
  exportWithFormatSelect(monthlyBudget.value, exportColumns, exportFormat.value, '成本预测')
  exportModalVisible.value = false
}

// 新增
const handleAdd = () => {
  Object.assign(formData, {
    month: '',
    totalCost: 0,
    formalWorkerCost: 0,
    tempWorkerCost: 0,
    headcount: 0
  })
  addModalVisible.value = true
}

// 确认新增
const handleConfirmAdd = () => {
  if (!formData.month) {
    ElMessage.warning('请填写月份')
    return
  }
  const laborCost = formData.totalCost * 10000
  const socialSecurity = laborCost * 0.08
  const benefits = laborCost * 0.03
  const yieldPrediction = formData.headcount * 3000
  const costPerUnit = laborCost / yieldPrediction

  monthlyBudget.value.push({
    month: formData.month,
    laborCost,
    formalWorkerCost: formData.formalWorkerCost * 10000,
    tempWorkerCost: formData.tempWorkerCost * 10000,
    socialSecurity,
    benefits,
    headcount: formData.headcount,
    yieldPrediction,
    costPerUnit
  })

  addModalVisible.value = false
  ElMessage.success('新增成功')
}

onMounted(() => { loadData() })
</script>

<style scoped>
.bg-white {
  background-color: white;
}

.rounded-xl {
  border-radius: 0.75rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.space-y-4 > * + * {
  margin-top: 16px;
}

.grid {
  display: grid;
}

.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.grid-cols-5 {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.gap-4 {
  gap: 16px;
}

.bg-amber-50 {
  background-color: #fffbeb;
}

.border-amber-200 {
  border-color: #fde68a;
}

.text-amber-700 {
  color: #b45309;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.border-blue-200 {
  border-color: #bfdbfe;
}

.text-blue-700 {
  color: #1d4ed8;
}
</style>
