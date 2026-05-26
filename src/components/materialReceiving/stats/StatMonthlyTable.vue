<template>
  <div v-if="activeTab === 'monthly'">
    <!-- 仪表盘 -->
    <div class="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl p-6 mb-6 shadow-lg shadow-cyan-500/10">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <el-icon color="#fff"><DataAnalysis /></el-icon>
          </div>
          <div>
            <h4 class="font-bold text-gray-800 text-lg">领料统计概览</h4>
            <p class="text-sm text-gray-500">{{ currentYear }}年度物料领取分析</p>
          </div>
        </div>
        <!-- 月份切换器 -->
        <el-select v-model="localSelectedMonth" placeholder="选择月份" size="default" @change="onMonthChange">
          <el-option label="全部月份" value="all" />
          <el-option v-for="m in 12" :key="m" :label="`${m}月`" :value="`${currentYear}-${String(m).padStart(2, '0')}`" />
        </el-select>
      </div>
    </div>

    <!-- 月度汇总表格 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">月度领料统计</h3>
        <div class="flex gap-2">
          <template v-if="exportMode">
            <el-button type="primary" size="small" @click="onExportConfirm">
              <el-icon><Download /></el-icon>
              确认导出
            </el-button>
            <el-button size="small" @click="onExportCancel">取消</el-button>
          </template>
          <template v-else>
            <el-button size="small" @click="onToggleExportMode">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </template>
        </div>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" style="width: 100%" stripe>
        <el-table-column type="selection" width="55" v-if="exportMode" />
        <el-table-column prop="month" label="月份" width="120" />
        <el-table-column prop="category" label="物料分类" width="150" />
        <el-table-column prop="quantity" label="领料数量" width="120" sortable />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="amount" label="金额" width="120" sortable>
          <template #default="{ row }">
            ¥{{ row.amount?.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="rank" label="排名" width="80" />
        <el-table-column prop="percent" label="占比" width="100" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button text size="small" @click="$emit('view-detail', row)">查看明细</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 合计行 -->
      <div class="p-4 border-t border-gray-100 bg-gray-50">
        <div class="flex justify-between items-center">
          <span class="font-medium">合计</span>
          <div class="flex gap-8">
            <span>总量: {{ totalQuantity }}</span>
            <span>总金额: ¥{{ totalAmount?.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { DataAnalysis, Download } from '@element-plus/icons-vue'

const props = defineProps({
  activeTab: { type: String, default: 'monthly' },
  selectedMonth: { type: String, default: 'all' },
  yearFilter: { type: String, default: '' },
  monthFilter: { type: String, default: '' },
  exportMode: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  data: { type: Array, default: () => [] },
  categorySummaryData: { type: Array, default: () => [] },
  monthlyStatisticsData: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'month-change', 'year-filter-change', 'month-filter-change',
  'toggle-month-expand', 'sort', 'toggle-export-mode', 'export-confirm', 'export-cancel',
  'select-all', 'select-row', 'view-detail'
])

const currentYear = new Date().getFullYear()
const localSelectedMonth = ref(props.selectedMonth)

watch(() => props.selectedMonth, (val) => { localSelectedMonth.value = val })

const tableData = computed(() => {
  return props.monthlyStatisticsData || []
})

const totalQuantity = computed(() => {
  return tableData.value.reduce((sum, row) => sum + (row.quantity || 0), 0)
})

const totalAmount = computed(() => {
  return tableData.value.reduce((sum, row) => sum + (row.amount || 0), 0)
})

const onMonthChange = (val) => emit('month-change', val)
const onToggleExportMode = () => emit('toggle-export-mode')
const onExportConfirm = () => emit('export-confirm')
const onExportCancel = () => emit('export-cancel')
const onSelectAll = () => emit('select-all')
const onSelectRow = (idx) => emit('select-row', idx)
</script>
