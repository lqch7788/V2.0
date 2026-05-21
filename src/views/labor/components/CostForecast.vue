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
            <h1 class="text-lg font-bold text-gray-900">工资预算预测</h1>
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
          <div class="h-64 flex items-center justify-center text-gray-400">
            图表区域
          </div>
        </div>
      </div>
    </div>

    <!-- 年度汇总 -->
    <div class="bg-white p-4 rounded-lg border border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ inputParams.year }}年度预算汇总</h3>
      <div class="grid grid-cols-5 gap-4">
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-600 mb-2">
            年度总成本
          </div>
          <div class="text-xl font-bold text-gray-900">{{ (yearlyBudget.totalLaborCost / 10000).toFixed(2) }}万元</div>
          <div class="text-xs text-gray-500 mt-1">¥{{ yearlyBudget.totalLaborCost.toLocaleString() }}</div>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 mb-2">
            正式工成本
          </div>
          <div class="text-xl font-bold text-gray-900">{{ (yearlyBudget.formalWorkerCost / 10000).toFixed(2) }}万元</div>
          <div class="text-xs text-gray-500 mt-1">占比{{ yearlyBudget.formalWorkerRatio }}%</div>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-600 mb-2">
            临时工成本
          </div>
          <div class="text-xl font-bold text-gray-900">{{ (yearlyBudget.tempWorkerCost / 10000).toFixed(2) }}万元</div>
          <div class="text-xs text-gray-500 mt-1">占比{{ yearlyBudget.tempWorkerRatio }}%</div>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-600 mb-2">
            预计采收量
          </div>
          <div class="text-xl font-bold text-gray-900">{{ (yearlyBudget.totalYield / 10000).toFixed(2) }}万斤</div>
          <div class="text-xs text-gray-500 mt-1">人均{{ yearlyBudget.avgYieldPerPerson }}斤/人</div>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
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
          <div v-for="quarter in quarterlyBudget" :key="quarter.quarter" class="p-3 bg-gray-50 rounded-lg">
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
      <el-table :data="monthlyBudget" border stripe>
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
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { TrendCharts, Download, Plus, Warning, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 输入参数
const inputParams = reactive({
  year: '2024',
  formalWorkerCount,
  tempWorkerCount,
  avgSalary,
  tempHourlyRate,
  warningThreshold: 80
})

// 预警信息
const warnings = ref([
  { level: 'warning', message: '6月份临时工成本预计超过预算的85%，请关注', class: 'bg-amber-50 border-amber-200 text-amber-700' },
  { level: 'info', message: '年度平均单位成本处于正常范围', class: 'bg-blue-50 border-blue-200 text-blue-700' }
])

// 年度预算汇总
const yearlyBudget = reactive({
  totalLaborCost,
  formalWorkerCost,
  formalWorkerRatio,
  tempWorkerCost,
  tempWorkerRatio,
  totalYield,
  avgYieldPerPerson,
  avgCostPerUnit: 1.94
})

// 季度分布
const quarterlyBudget = ref([
  { quarter: 'Q1', laborCost, headcount, yieldPrediction: 450000 },
  { quarter: 'Q2', laborCost, headcount, yieldPrediction: 680000 },
  { quarter: 'Q3', laborCost, headcount, yieldPrediction: 820000 },
  { quarter: 'Q4', laborCost, headcount, yieldPrediction: 550000 }
])

// 月度明细
const monthlyBudget = ref([
  { month: '2024-01', laborCost, formalWorkerCost, tempWorkerCost, socialSecurity, benefits, headcount, yieldPrediction, costPerUnit: 1.78 },
  { month: '2024-02', laborCost, formalWorkerCost, tempWorkerCost, socialSecurity, benefits, headcount, yieldPrediction, costPerUnit: 1.74 },
  { month: '2024-03', laborCost, formalWorkerCost, tempWorkerCost, socialSecurity, benefits, headcount, yieldPrediction, costPerUnit: 1.75 },
  { month: '2024-04', laborCost, formalWorkerCost, tempWorkerCost, socialSecurity, benefits, headcount, yieldPrediction, costPerUnit: 1.91 },
  { month: '2024-05', laborCost, formalWorkerCost, tempWorkerCost, socialSecurity, benefits, headcount, yieldPrediction, costPerUnit: 1.92 },
  { month: '2024-06', laborCost, formalWorkerCost, tempWorkerCost, socialSecurity, benefits, headcount, yieldPrediction, costPerUnit: 1.83 }
])

// 弹窗状态
const addModalVisible = ref(false)
const formData = reactive({
  month: '',
  totalCost,
  formalWorkerCost,
  tempWorkerCost,
  headcount: 0
})

// 计算
const handleCalculate = () => {
  ElMessage.success('计算完成')
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
  ElMessage.success('导出功能开发中')
}

// 新增
const handleAdd = () => {
  Object.assign(formData, {
    month: '',
    totalCost,
    formalWorkerCost,
    tempWorkerCost,
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
  const totalCost = formData.totalCost * 10000
  const socialSecurity = totalCost * 0.08
  const benefits = totalCost * 0.03
  const yieldPrediction = formData.headcount * 3000
  const costPerUnit = totalCost / yieldPrediction

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
