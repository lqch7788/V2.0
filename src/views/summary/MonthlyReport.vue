<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><Memo /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">月度报告</h1>
          <p class="text-xs text-gray-500">月度生产统计报告</p>
        </div>
      </div>
    </div>

    <!-- 月份选择 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center justify-between">
        <el-date-picker
          v-model="selectedMonth"
          type="month"
          placeholder="选择月份"
          format="YYYY年MM月"
          value-format="YYYY-MM"
          size="default"
          @change="loadMonthReport"
        />
        <div class="flex items-center gap-2">
          <el-button type="primary" @click="handleExport">导出报告</el-button>
          <el-button @click="handlePrint">打印</el-button>
        </div>
      </div>
    </div>

    <!-- 生产概况 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h3 class="text-base font-semibold text-gray-800 mb-4">生产概况</h3>
      <div class="grid grid-cols-4 gap-4">
        <div class="bg-emerald-50 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <el-icon :size="20" color="#10b981"><TrendCharts /></el-icon>
            <span class="text-sm font-medium text-gray-700">采收产量</span>
          </div>
          <p class="text-2xl font-bold text-gray-800">{{ report.yield?.total || 0 }} kg</p>
          <p class="text-xs text-gray-500 mt-1">本月采收总量</p>
        </div>
        <div class="bg-blue-50 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <el-icon :size="20" color="#3b82f6"><Coin /></el-icon>
            <span class="text-sm font-medium text-gray-700">总产值</span>
          </div>
          <p class="text-2xl font-bold text-gray-800">¥{{ report.yield?.amount?.toLocaleString() || 0 }}</p>
          <p class="text-xs text-gray-500 mt-1">本月销售金额</p>
        </div>
        <div class="bg-purple-50 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <el-icon :size="20" color="#a855f7"><Check /></el-icon>
            <span class="text-sm font-medium text-gray-700">完成任务</span>
          </div>
          <p class="text-2xl font-bold text-gray-800">{{ report.task?.completed || 0 }} / {{ report.task?.total || 0 }}</p>
          <p class="text-xs text-gray-500 mt-1">完成率 {{ report.task?.rate || 0 }}%</p>
        </div>
        <div class="bg-orange-50 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <el-icon :size="20" color="#f97316"><Wallet /></el-icon>
            <span class="text-sm font-medium text-gray-700">总成本</span>
          </div>
          <p class="text-2xl font-bold text-gray-800">¥{{ report.cost?.total?.toLocaleString() || 0 }}</p>
          <p class="text-xs text-gray-500 mt-1">本月支出成本</p>
        </div>
      </div>
    </div>

    <!-- 产量统计 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h3 class="text-base font-semibold text-gray-800 mb-4">产量统计</h3>
      <el-table :data="report.yieldDetail || []" stripe style="width: 100%" :header-cell-style="headerCellStyle">
        <el-table-column prop="cropName" label="作物名称" width="120" />
        <el-table-column prop="greenhouse" label="温室/区域" width="120" />
        <el-table-column prop="harvestArea" label="采收面积(㎡)" width="120" />
        <el-table-column prop="harvestCount" label="采收次数" width="100" />
        <el-table-column prop="yield" label="采收产量(kg)" width="130" />
        <el-table-column prop="avgYield" label="平均单次产量(kg)" width="150" />
        <el-table-column prop="price" label="单价(元/kg)" width="120" />
        <el-table-column prop="amount" label="金额(元)">
          <template #default="{ row }">
            ¥{{ row.amount.toLocaleString() }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 成本构成 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h3 class="text-base font-semibold text-gray-800 mb-4">成本构成</h3>
      <div class="grid grid-cols-3 gap-6">
        <div class="space-y-4">
          <div class="bg-blue-50 rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">人工成本</span>
              <span class="text-lg font-bold text-blue-600">¥{{ report.cost?.labor?.toLocaleString() || 0 }}</span>
            </div>
            <div class="w-full h-2 bg-blue-200 rounded-full">
              <div class="h-full bg-blue-500 rounded-full" :style="{ width: `${report.cost?.laborPercent || 0}%` }" />
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ report.cost?.laborPercent || 0 }}%</p>
          </div>
          <div class="bg-emerald-50 rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">物料成本</span>
              <span class="text-lg font-bold text-emerald-600">¥{{ report.cost?.material?.toLocaleString() || 0 }}</span>
            </div>
            <div class="w-full h-2 bg-emerald-200 rounded-full">
              <div class="h-full bg-emerald-500 rounded-full" :style="{ width: `${report.cost?.materialPercent || 0}%` }" />
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ report.cost?.materialPercent || 0 }}%</p>
          </div>
          <div class="bg-amber-50 rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">能源成本</span>
              <span class="text-lg font-bold text-amber-600">¥{{ report.cost?.energy?.toLocaleString() || 0 }}</span>
            </div>
            <div class="w-full h-2 bg-amber-200 rounded-full">
              <div class="h-full bg-amber-500 rounded-full" :style="{ width: `${report.cost?.energyPercent || 0}%` }" />
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ report.cost?.energyPercent || 0 }}%</p>
          </div>
        </div>

        <div class="col-span-2">
          <div class="h-64 flex items-end justify-around gap-4">
            <div v-for="(item, index) in report.yieldDetail || []" :key="index" class="flex flex-col items-center flex-1">
              <div
                class="w-full bg-emerald-500 rounded-t transition-all hover:bg-emerald-600"
                :style="{ height: `${(item.yield / maxYield) * 180}px`, minHeight: '8px' }"
              />
              <span class="text-xs text-gray-500 mt-2">{{ item.cropName }}</span>
              <span class="text-xs text-gray-400">{{ item.yield }}kg</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 农事记录汇总 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h3 class="text-base font-semibold text-gray-800 mb-4">农事记录汇总</h3>
      <el-table :data="report.taskList || []" stripe style="width: 100%" :header-cell-style="headerCellStyle">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="taskName" label="任务名称" min-width="150" />
        <el-table-column prop="greenhouse" label="执行区域" width="120" />
        <el-table-column prop="assignee" label="执行人" width="100" />
        <el-table-column prop="workHours" label="工时(h)" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'completed' ? 'success' : 'warning'" size="small">
              {{ row.status === 'completed' ? '已完成' : '进行中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120" />
      </el-table>
    </div>

    <!-- 问题汇总 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h3 class="text-base font-semibold text-gray-800 mb-4">问题汇总</h3>
      <div class="grid grid-cols-3 gap-4 mb-4">
        <div class="bg-red-50 rounded-xl p-4">
          <p class="text-xs text-red-600 font-medium">问题总数</p>
          <p class="text-2xl font-bold text-red-700 mt-1">{{ report.problem?.total || 0 }}</p>
        </div>
        <div class="bg-emerald-50 rounded-xl p-4">
          <p class="text-xs text-emerald-600 font-medium">已解决</p>
          <p class="text-2xl font-bold text-emerald-700 mt-1">{{ report.problem?.resolved || 0 }}</p>
        </div>
        <div class="bg-gray-50 rounded-xl p-4">
          <p class="text-xs text-gray-600 font-medium">解决率</p>
          <p class="text-2xl font-bold text-gray-700 mt-1">{{ report.problem?.rate || 0 }}%</p>
        </div>
      </div>
      <el-table :data="report.problemList || []" stripe style="width: 100%" :header-cell-style="headerCellStyle">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="type" label="问题类型" width="120" />
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)" size="small">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="问题描述" min-width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'resolved' ? 'success' : 'danger'" size="small">
              {{ row.status === 'resolved' ? '已解决' : '未解决' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Memo, TrendCharts, Coin, Check, Wallet } from '@element-plus/icons-vue'

/** 表格表头蓝色渐变样式（与V1.1一致） */
const headerCellStyle = {
  background: 'linear-gradient(to right, #3b82f6, #2563eb)',
  color: '#ffffff',
  fontWeight: '600',
  fontSize: '14px'
}

// 选择的月份
const selectedMonth = ref('2026-05')

// 月度报告数据
const report = ref({
  yield: {
    total: 12580,
    amount: 87500
  },
  task: {
    total: 156,
    completed: 98,
    rate: 62.8
  },
  cost: {
    total: 198500,
    labor: 135600,
    laborPercent: 68,
    material: 42800,
    materialPercent: 22,
    energy: 20100,
    energyPercent: 10
  },
  yieldDetail: [
    { cropName: '番茄', greenhouse: '1号棚', harvestArea: 1000, harvestCount: 8, yield: 5200, avgYield: 650, price: 6.5, amount: 33800 },
    { cropName: '黄瓜', greenhouse: '2号棚', harvestArea: 800, harvestCount: 6, yield: 3800, avgYield: 633, price: 5.0, amount: 19000 },
    { cropName: '辣椒', greenhouse: '3号棚', harvestArea: 600, harvestCount: 5, yield: 2100, avgYield: 420, price: 8.0, amount: 16800 },
    { cropName: '茄子', greenhouse: '1号棚-B区', harvestArea: 500, harvestCount: 4, yield: 1480, avgYield: 370, price: 7.0, amount: 10360 },
  ],
  taskList: [
    { date: '2026-05-01', taskName: '番茄浇水', greenhouse: '1号棚', assignee: '张伟民', workHours: 2, status: 'completed', remark: '正常完成' },
    { date: '2026-05-02', taskName: '黄瓜施肥', greenhouse: '2号棚', assignee: '李明轩', workHours: 3, status: 'completed', remark: '正常完成' },
    { date: '2026-05-03', taskName: '辣椒巡查', greenhouse: '3号棚', assignee: '王建国', workHours: 1.5, status: 'completed', remark: '发现虫害' },
    { date: '2026-05-15', taskName: '茄子采收', greenhouse: '1号棚-B区', assignee: '赵俊杰', workHours: 4, status: 'completed', remark: '采收500kg' },
    { date: '2026-05-20', taskName: '温室维护', greenhouse: '全部温室', assignee: '张伟民', workHours: 6, status: 'in_progress', remark: '设备检修中' },
  ],
  problem: {
    total: 12,
    resolved: 10,
    rate: 83.3
  },
  problemList: [
    { date: '2026-05-03', type: '病虫害', level: '重要', description: '3号棚发现蚜虫病虫害', status: 'resolved' },
    { date: '2026-05-10', type: '设备', level: '一般', description: '2号棚空调故障', status: 'resolved' },
    { date: '2026-05-15', type: '环境', level: '一般', description: '温度偏高提醒', status: 'resolved' },
    { date: '2026-05-20', type: '其他', level: '提示', description: '浇水计划执行中', status: 'in_progress' },
  ]
})

// 计算最大产量
const maxYield = computed(() => {
  if (!report.value.yieldDetail || report.value.yieldDetail.length === 0) return 100
  return Math.max(...report.value.yieldDetail.map(d => d.yield))
})

const loadMonthReport = () => {
  console.log('加载月份报告:', selectedMonth.value)
}

const handleExport = () => {
  console.log('导出报告')
}

const handlePrint = () => {
  console.log('打印报告')
}

const getLevelType = (level) => {
  const map = { '紧急': 'danger', '重要': 'warning', '一般': 'info', '提示': 'success' }
  return map[level] || 'info'
}

onMounted(() => {
  loadMonthReport()
})
</script>
