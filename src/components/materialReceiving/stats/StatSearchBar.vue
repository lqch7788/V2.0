<template>
  <div class="bg-white rounded-xl border border-gray-200 p-3 mb-4">
    <!-- 第一行：基础筛选条件 -->
    <div class="flex items-center gap-3 flex-wrap">
      <!-- 物料编码/名称搜索 -->
      <div class="flex items-center gap-1.5">
        <el-icon color="#9ca3af"><Search /></el-icon>
        <el-input
          v-model="localMaterialSearch"
          placeholder="物料编码/名称"
          class="w-32"
          size="small"
          clearable
          @change="(val) => onMaterialSearchChange(val)"
        />
      </div>

      <!-- 部门筛选 -->
      <div class="flex items-center gap-1.5">
        <span class="text-xs text-gray-500">部门</span>
        <el-select v-model="localDepartment" placeholder="输入搜索" size="small" class="w-36" clearable filterable @change="onDepartmentChange">
          <el-option v-for="opt in departmentOptions" :key="opt" :label="opt" :value="opt" />
        </el-select>
      </div>

      <!-- 时间范围 -->
      <div class="flex items-center gap-1.5">
        <span class="text-xs text-gray-500">时间</span>
        <el-date-picker
          v-model="localDateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="开始"
          end-placeholder="结束"
          size="small"
          value-format="YYYY-MM-DD"
          @change="onDateRangeChange"
        />
      </div>

      <!-- 快捷筛选按钮 -->
      <div class="flex items-center gap-0.5 bg-gray-100 rounded-md p-0.5">
        <el-button
          v-for="option in quickFilterOptions"
          :key="option.value"
          size="small"
          :type="quickFilterPeriod === option.value ? 'primary' : 'default'"
          :plain="quickFilterPeriod !== option.value"
          @click="onQuickFilterChange(option.value)"
        >
          {{ option.label }}
        </el-button>
      </div>

      <!-- 重置按钮 -->
      <el-button size="small" @click="onReset">
        <el-icon><RefreshRight /></el-icon>
        重置
      </el-button>

      <!-- 高级筛选切换 -->
      <el-button size="small" text type="primary" @click="showAdvanced = !showAdvanced">
        <el-icon v-if="showAdvanced"><ArrowUp /></el-icon>
        <el-icon v-else><ArrowDown /></el-icon>
        {{ showAdvanced ? '收起' : '高级筛选' }}
      </el-button>
    </div>

    <!-- 高级筛选展开区域 -->
    <div v-if="showAdvanced" class="mt-3 pt-3 border-t border-gray-100">
      <div class="flex items-center gap-3 flex-wrap">
        <!-- 分类筛选 -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-500">分类</span>
          <el-select v-model="localCategory" placeholder="输入搜索" size="small" class="w-36" clearable filterable @change="onCategoryChange">
            <el-option v-for="opt in categoryOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
        </div>

        <!-- 仓库筛选 -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-500">仓库</span>
          <el-select v-model="localWarehouse" placeholder="输入搜索" size="small" class="w-36" clearable filterable @change="onWarehouseChange">
            <el-option v-for="opt in warehouseOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
        </div>

        <!-- 供应商筛选 -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-500">供应商</span>
          <el-select v-model="localSupplier" placeholder="输入搜索" size="small" class="w-36" clearable filterable @change="onSupplierChange">
            <el-option v-for="opt in supplierOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
        </div>

        <!-- 批次号筛选 -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-500">批次</span>
          <el-select v-model="localBatchCode" placeholder="输入搜索" size="small" class="w-36" clearable filterable @change="onBatchCodeChange">
            <el-option v-for="opt in batchCodeOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
        </div>

        <!-- 生产计划批次筛选 -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-500">计划批次</span>
          <el-select v-model="localProductionPlan" placeholder="输入搜索" size="small" class="w-36" clearable filterable @change="onProductionPlanChange">
            <el-option v-for="opt in productionPlanOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
        </div>

        <!-- 用途/区域筛选 -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-500">用途</span>
          <el-select v-model="localUsageArea" placeholder="输入搜索" size="small" class="w-36" clearable filterable @change="onUsageAreaChange">
            <el-option v-for="opt in usageAreaOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
        </div>

        <!-- 领料人筛选 -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-500">领料人</span>
          <el-select v-model="localRequisitioner" placeholder="输入搜索" size="small" class="w-36" clearable filterable @change="onRequisitionerChange">
            <el-option v-for="opt in requisitionerOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search, RefreshRight, ArrowUp, ArrowDown } from '@element-plus/icons-vue'

const quickFilterOptions = [
  { value: 'currentWeek', label: '本周' },
  { value: 'currentMonth', label: '本月' },
  { value: 'currentQuarter', label: '本季' },
  { value: 'currentYear', label: '本年' },
]

const props = defineProps({
  materialSearch: { type: String, default: '' },
  departmentFilter: { type: Array, default: () => [] },
  dateRange: { type: Array, default: () => [] },
  categoryFilter: { type: Array, default: () => [] },
  warehouseFilter: { type: Array, default: () => [] },
  supplierFilter: { type: Array, default: () => [] },
  batchCodeFilter: { type: Array, default: () => [] },
  productionPlanFilter: { type: Array, default: () => [] },
  usageAreaFilter: { type: Array, default: () => [] },
  requisitionerFilter: { type: Array, default: () => [] },
  quickFilterPeriod: { type: String, default: '' },
  departmentOptions: { type: Array, default: () => [] },
  categoryOptions: { type: Array, default: () => [] },
  warehouseOptions: { type: Array, default: () => [] },
  supplierOptions: { type: Array, default: () => [] },
  batchCodeOptions: { type: Array, default: () => [] },
  productionPlanOptions: { type: Array, default: () => [] },
  usageAreaOptions: { type: Array, default: () => [] },
  requisitionerOptions: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'update:materialSearch', 'update:departmentFilter', 'update:dateRange', 'update:categoryFilter',
  'update:warehouseFilter', 'update:supplierFilter', 'update:batchCodeFilter',
  'update:productionPlanFilter', 'update:usageAreaFilter', 'update:requisitionerFilter',
  'update:quickFilterPeriod', 'reset'
])

const showAdvanced = ref(true)

// 本地状态
const localMaterialSearch = ref(props.materialSearch)
const localDepartment = ref(props.departmentFilter[0] || '')
const localDateRange = ref(props.dateRange)
const localCategory = ref(props.categoryFilter[0] || '')
const localWarehouse = ref(props.warehouseFilter[0] || '')
const localSupplier = ref(props.supplierFilter[0] || '')
const localBatchCode = ref(props.batchCodeFilter[0] || '')
const localProductionPlan = ref(props.productionPlanFilter[0] || '')
const localUsageArea = ref(props.usageAreaFilter[0] || '')
const localRequisitioner = ref(props.requisitionerFilter[0] || '')

// 监听props变化
watch(() => props.materialSearch, (val) => { localMaterialSearch.value = val })
watch(() => props.departmentFilter, (val) => { localDepartment.value = val[0] || '' })
watch(() => props.dateRange, (val) => { localDateRange.value = val })
watch(() => props.categoryFilter, (val) => { localCategory.value = val[0] || '' })
watch(() => props.warehouseFilter, (val) => { localWarehouse.value = val[0] || '' })
watch(() => props.supplierFilter, (val) => { localSupplier.value = val[0] || '' })
watch(() => props.batchCodeFilter, (val) => { localBatchCode.value = val[0] || '' })
watch(() => props.productionPlanFilter, (val) => { localProductionPlan.value = val[0] || '' })
watch(() => props.usageAreaFilter, (val) => { localUsageArea.value = val[0] || '' })
watch(() => props.requisitionerFilter, (val) => { localRequisitioner.value = val[0] || '' })

// 事件处理
const onMaterialSearchChange = (val) => emit('update:materialSearch', val)
const onDepartmentChange = (val) => emit('update:departmentFilter', val ? [val] : [])
const onDateRangeChange = (val) => emit('update:dateRange', val || [])
const onCategoryChange = (val) => emit('update:categoryFilter', val ? [val] : [])
const onWarehouseChange = (val) => emit('update:warehouseFilter', val ? [val] : [])
const onSupplierChange = (val) => emit('update:supplierFilter', val ? [val] : [])
const onBatchCodeChange = (val) => emit('update:batchCodeFilter', val ? [val] : [])
const onProductionPlanChange = (val) => emit('update:productionPlanFilter', val ? [val] : [])
const onUsageAreaChange = (val) => emit('update:usageAreaFilter', val ? [val] : [])
const onRequisitionerChange = (val) => emit('update:requisitionerFilter', val ? [val] : [])
const onQuickFilterChange = (val) => emit('update:quickFilterPeriod', val)
const onReset = () => {
  localMaterialSearch.value = ''
  localDepartment.value = ''
  localDateRange.value = []
  localCategory.value = ''
  localWarehouse.value = ''
  localSupplier.value = ''
  localBatchCode.value = ''
  localProductionPlan.value = ''
  localUsageArea.value = ''
  localRequisitioner.value = ''
  emit('reset')
}
</script>
