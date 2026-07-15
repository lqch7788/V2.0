<template>
  <!--
    调拨入库面板（V1.1 1:1 迁移版）
    V1.1源文件：src/components/farm/seed-source/modals/InventoryTransferPanel.tsx
    业务：从作物库存调入种源（append_existing 模式），不创建新种源
  -->
  <div class="inventory-transfer-panel">
    <!-- 顶部状态条（V1.1: mode badge + 共 X 条 + 已选 X 条）-->
    <div class="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200 flex-wrap">
      <el-tag v-if="mode === 'append_existing'" type="warning" size="small" class="text-xs">
        模式：追加到现有种源（不创建新记录）
      </el-tag>
      <el-tag v-else type="info" size="small" class="text-xs">新建模式</el-tag>
      <el-tag size="small" class="text-xs">共 {{ total }} 条可调拨</el-tag>
      <el-tag v-if="selectedCount > 0" type="success" class="text-xs text-white">已选 {{ selectedCount }} 条</el-tag>
    </div>

    <!-- 错误 Alert -->
    <el-alert v-if="error" :title="error" type="error" :closable="false" class="m-4" show-icon />

    <!-- 筛选区 -->
    <div class="px-4 py-3 border-b border-gray-100">
      <div class="flex flex-wrap gap-3 items-end">
        <!-- stockType 多选 toggle（V1.1: 自定义 button + ring）-->
        <div class="flex items-center gap-3 flex-wrap">
          <label class="text-sm text-gray-700 whitespace-nowrap">库存类型：</label>
          <button
            v-for="t in stockTypeOptions"
            :key="t.value"
            type="button"
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            :class="stockTypeFilter.includes(t.value)
              ? `${stockTypeBadge[t.value]} ring-1 ring-offset-1 ring-emerald-300`
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
            @click="toggleStockType(t.value)"
          >
            {{ t.label }}
          </button>
        </div>
        <!-- 关键字 -->
        <el-input
          v-model="keywordInput"
          placeholder="搜索库存编号/品种..."
          clearable
          size="default"
          style="width: 220px"
        />
        <!-- 日期起止 -->
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          size="default"
        />
        <el-button type="primary" @click="handleFilterChange" size="default">查询</el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading && rows.length === 0" class="p-4 space-y-2">
      <el-skeleton v-for="i in 3" :key="i" :rows="1" animated />
    </div>

    <!-- 空态 -->
    <div v-else-if="rows.length === 0" class="flex items-center justify-center py-12">
      <el-empty :description="hasInteracted ? '暂无可调拨库存' : '请选择筛选条件'" />
    </div>

    <!-- 表格 -->
    <div v-else class="px-4 py-2 overflow-x-auto">
      <el-table
        :data="paginatedRows"
        @selection-change="handleSelectionChange"
        :row-key="(row) => row.id"
        border
        style="width: 1100px"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="库存编号" prop="businessCode" min-width="140" show-overflow-tooltip />
        <el-table-column label="类型" min-width="80">
          <template #default="{ row }">
            <el-tag size="small">{{ stockTypeLabel(row.stockType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="作物/品种" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.cropName }}{{ row.varietyName ? ' / ' + row.varietyName : '' }}
          </template>
        </el-table-column>
        <el-table-column label="形态" prop="productForm" min-width="80" show-overflow-tooltip />
        <el-table-column label="可用数量" min-width="100" align="right">
          <template #default="{ row }">
            <span class="text-emerald-600 font-medium">{{ row.availableQuantity }} {{ row.unit }}</span>
          </template>
        </el-table-column>
        <el-table-column label="调拨数量" min-width="160">
          <template #default="{ row }">
            <el-input-number
              :model-value="selectedMap.get(row.id)?.quantity || 0"
              @update:model-value="(v) => updateQuantity(row.id, v)"
              :min="0"
              :max="row.availableQuantity"
              :step="1"
              size="small"
              :disabled="!selectedIds.includes(row.id)"
            />
          </template>
        </el-table-column>
        <el-table-column label="入库日期" prop="inboundDate" min-width="120" />
        <el-table-column label="采收来源" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            {{ formatSource(row) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 客户端分页 -->
      <div class="mt-3 flex items-center justify-end">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredRows.length"
          layout="total, sizes, prev, pager, next"
          background
          small
        />
      </div>
    </div>

    <!-- 底部 sticky 操作栏（V1.1: bg-emerald-600 绿色确认按钮）-->
    <div class="sticky bottom-0 px-4 py-3 bg-white border-t border-gray-200 shadow-md flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3 flex-wrap">
        <span class="text-sm text-gray-700">
          已选 <strong class="text-emerald-600">{{ selectedCount }}</strong> 条
        </span>
        <span v-for="(qty, unit) in totalQuantityByUnit" :key="unit" class="px-2 py-0.5 border border-gray-300 rounded text-xs">
          {{ qty }} {{ unit }}
        </span>
      </div>
      <el-button class="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600" :disabled="!canConfirm" :loading="submitting" @click="handleConfirm">
        确认调拨{{ selectedCount > 0 ? ` (${selectedCount})` : '' }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { seedSourceTransferService } from '@/services/seedSourceTransferService'

const props = defineProps({
  mode: { type: String, default: 'append_existing' },
  targetSeedSourceId: { type: String, default: '' },
  targetCropName: { type: String, default: '' },
  targetCropVariety: { type: String, default: '' }
})

const emit = defineEmits(['confirm', 'cancel'])

const stockTypeOptions = [
  { value: 'seed', label: '种子' },
  { value: 'seedling', label: '种苗' },
  { value: 'product', label: '产品' }
]

const stockTypeFilter = ref(['seed', 'seedling', 'product'])
const keywordInput = ref('')
const keywordDebounced = ref('')
const dateRange = ref([])
const rows = ref([])
const loading = ref(false)
const submitting = ref(false)
const error = ref(null)
const page = ref(1)
const pageSize = ref(20)
const selectedIds = ref([])
const selectedMap = ref(new Map())
const hasInteracted = ref(false)

// 关键字 debounce 300ms
let keywordTimer = null
watch(keywordInput, (val) => {
  if (keywordTimer) clearTimeout(keywordTimer)
  keywordTimer = setTimeout(() => {
    keywordDebounced.value = val
    hasInteracted.value = true
    loadRows()
  }, 300)
})

const filteredRows = computed(() => rows.value)

const paginatedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

const selectedCount = computed(() => selectedIds.value.length)

const canConfirm = computed(() => {
  return selectedIds.value.length > 0 && selectedIds.value.every(id => {
    const item = selectedMap.value.get(id)
    return item && item.quantity > 0
  })
})

const totalQuantityByUnit = computed(() => {
  const map = {}
  for (const id of selectedIds.value) {
    const item = selectedMap.value.get(id)
    if (item && item.quantity > 0) {
      map[item.unit] = (map[item.unit] || 0) + item.quantity
    }
  }
  return map
})

const stockTypeLabel = (type) => {
  const map = { seed: '种源', seedling: '种苗', product: '产品' }
  return map[type] || type
}

const stockTypeBadge = {
  seed: 'bg-emerald-100 text-emerald-700',
  seedling: 'bg-blue-100 text-blue-700',
  product: 'bg-amber-100 text-amber-700'
}

const formatSource = (row) => {
  return row.businessCode || row.supplierName || row.productionPlanCode || stockTypeLabel(row.stockType) || row.sourceType || '—'
}

const toggleStockType = (type) => {
  const idx = stockTypeFilter.value.indexOf(type)
  if (idx > -1) {
    stockTypeFilter.value.splice(idx, 1)
  } else {
    stockTypeFilter.value.push(type)
  }
  hasInteracted.value = true
  loadRows()
}

const handleFilterChange = () => {
  hasInteracted.value = true
  loadRows()
}

const loadRows = async () => {
  loading.value = true
  error.value = null
  try {
    const filters = {
      stockType: stockTypeFilter.value,
      keyword: keywordDebounced.value || undefined,
      dateFrom: dateRange.value?.[0],
      dateTo: dateRange.value?.[1],
      limit: 200
    }
    if (props.mode === 'append_existing') {
      if (props.targetCropName) filters.cropName = props.targetCropName
      if (props.targetCropVariety) filters.cropVariety = props.targetCropVariety
    }
    const data = await seedSourceTransferService.listTransferableSources(filters)
    rows.value = Array.isArray(data) ? data : []
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载可调拨库存失败'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (selected) => {
  selectedIds.value = selected.map(r => r.id)
  // 新增的行：默认 quantity = availableQuantity
  for (const row of selected) {
    if (!selectedMap.value.has(row.id)) {
      selectedMap.value.set(row.id, { quantity: row.availableQuantity, unit: row.unit })
    }
  }
  // 取消选中：从 Map 移除
  for (const id of Array.from(selectedMap.value.keys())) {
    if (!selectedIds.value.includes(id)) {
      selectedMap.value.delete(id)
    }
  }
}

const updateQuantity = (stockId, qty) => {
  const item = selectedMap.value.get(stockId) || { quantity: 0, unit: '' }
  item.quantity = Math.floor(Number(qty) || 0)
  selectedMap.value.set(stockId, item)
  error.value = null
}

const handleConfirm = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要调拨的库存')
    return
  }
  if (selectedIds.value.length > 100) {
    ElMessage.warning('单次最多调拨 100 条')
    return
  }
  const items = selectedIds.value
    .map(id => {
      const sel = selectedMap.value.get(id)
      const stock = rows.value.find(r => r.id === id)
      if (!sel || sel.quantity <= 0) return null
      if (sel.quantity > (stock?.availableQuantity || 0)) {
        error.value = `调拨数量超出可用库存：${stock?.businessCode || id}`
        return null
      }
      return {
        sourceStockId: id,
        transferQuantity: sel.quantity,
        unit: sel.unit,
        seedForm: stock?.productForm
      }
    })
    .filter(Boolean)
  if (items.length === 0) {
    if (!error.value) ElMessage.warning('请填写有效的调拨数量')
    return
  }
  emit('confirm', items)
}

onMounted(() => {
  loadRows()
})

watch(() => props.targetSeedSourceId, () => {
  if (props.mode === 'append_existing') loadRows()
})
</script>
