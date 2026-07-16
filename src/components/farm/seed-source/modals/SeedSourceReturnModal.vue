<template>
  <!--
    种源退库面板（V1.1 1:1 迁移版）
    V1.1源文件：src/components/farm/seed-source/modals/SeedSourceReturnModal.tsx
    业务：把种源数量退回原作物库存，严格 1:1 关联 inventory_inbound_records
  -->
  <div class="seed-source-return-modal">
    <!-- 顶部状态条（V1.1: 退库模式 Badge + 共 X 条 + 已选 X 条）-->
    <div class="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 flex-wrap">
      <span class="px-2 py-1 rounded-md bg-amber-100 text-amber-800 text-xs">
        模式：退库到原作物库存（严格 1:1 关联调拨流水）
      </span>
      <span class="px-2 py-1 rounded-md border border-gray-300 text-xs text-gray-700">
        {{ loading ? '加载中…' : `共 ${rows.length} 条可退流水` }}
      </span>
      <span v-if="selectedCount > 0" class="px-2 py-1 rounded-md bg-emerald-500 text-white text-xs">
        已选 {{ selectedCount }} 条
      </span>
    </div>

    <!-- 错误 Alert -->
    <el-alert v-if="error" :title="error" type="error" :closable="false" class="m-4" show-icon />

    <!-- 加载 Skeleton -->
    <div v-if="loading && rows.length === 0" class="p-4 space-y-2">
      <el-skeleton v-for="i in 3" :key="i" :rows="1" animated />
    </div>

    <!-- 空态 -->
    <div v-else-if="rows.length === 0" class="flex items-center justify-center py-12">
      <el-empty description="暂无可退库流水" />
    </div>

    <!-- 表格 -->
    <div v-else class="px-4 py-2 overflow-x-auto">
      <el-table
        :data="rows"
        @selection-change="handleSelectionChange"
        :row-key="(row) => row.id"
        border
        :row-class-name="rowClass"
        style="width: 1100px"
      >
        <el-table-column type="selection" width="55" />
        <!-- P0-11 修复：V1.1 优先显示 sourceInstanceId（physical 库存实例 ID），fallback 到 sourceCode 业务编号 -->
        <el-table-column label="原库存单号" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <code class="text-xs text-gray-700">{{ row.sourceInstanceId || row.sourceCode }}</code>
          </template>
        </el-table-column>
        <el-table-column label="类型" min-width="80">
          <template #default="{ row }">
            <el-tag size="small">{{ stockTypeLabel(row.stockType) }}</el-tag>
          </template>
        </el-table-column>
        <!-- V1.1 1:1：列名"作物 / 品种"显示 cropName + cropVariety -->
        <el-table-column label="作物 / 品种" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            {{ [row.cropName, row.cropVariety].filter(Boolean).join(' / ') || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="仓库" prop="warehouseName" min-width="100" show-overflow-tooltip />
        <el-table-column label="原始数量" min-width="100" align="right">
          <template #default="{ row }">
            {{ row.quantity }} {{ row.unit }}
          </template>
        </el-table-column>
        <el-table-column label="已退" min-width="80" align="right">
          <template #default="{ row }">
            <span :class="row.returnedQuantity > 0 ? 'text-amber-600' : 'text-gray-500'">
              {{ row.returnedQuantity || 0 }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="可退" min-width="80" align="right">
          <template #default="{ row }">
            <span class="text-emerald-600 font-medium">{{ row.returnableQuantity || (row.quantity - (row.returnedQuantity || 0)) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="退库数量" min-width="160">
          <template #default="{ row }">
            <el-input-number
              :model-value="selectedMap.get(row.id)?.quantity || 0"
              @update:model-value="(v) => updateQuantity(row.id, v)"
              :min="0"
              :max="row.returnableQuantity || (row.quantity - (row.returnedQuantity || 0))"
              :step="1"
              size="small"
              :disabled="!selectedIds.includes(row.id)"
            />
            <div v-if="isOverLimit(row)" class="text-xs text-red-500 mt-1">超出</div>
          </template>
        </el-table-column>
        <el-table-column label="入库日期" prop="recordDate" min-width="120" />
      </el-table>
    </div>

    <!-- 底部 sticky 操作栏（V1.1: bg-amber-600 深琥珀确认按钮）-->
    <div class="sticky bottom-0 px-4 py-3 bg-white border-t border-gray-200 shadow-md flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3 flex-wrap">
        <span class="text-sm text-gray-700">
          已选 <strong class="text-emerald-600">{{ selectedCount }}</strong> 条
        </span>
        <span v-for="(qty, unit) in totalQuantityByUnit" :key="unit" class="px-2 py-0.5 border border-gray-300 rounded text-xs">
          {{ qty.toFixed(2) }} {{ unit }}
        </span>
      </div>
      <el-button class="bg-amber-600 hover:bg-amber-700 text-white border-amber-600" :disabled="!canConfirm" :loading="submitting" @click="handleConfirm">
        <el-icon><Undo2 /></el-icon>确认退库{{ selectedCount > 0 ? ` (${selectedCount})` : '' }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Undo2 } from 'lucide-vue-next'
import { seedSourceTransferService } from '@/services/seedSourceTransferService'

const props = defineProps({
  targetSeedSourceId: { type: String, required: true },
  targetSeedSourceCode: { type: String, default: '' }
})

const emit = defineEmits(['confirm', 'cancel'])

const rows = ref([])
const loading = ref(false)
const submitting = ref(false)
const error = ref(null)
const selectedIds = ref([])
const selectedMap = ref(new Map())

const selectedCount = computed(() => selectedIds.value.length)

const canConfirm = computed(() => {
  if (selectedIds.value.length === 0) return false
  if (selectedIds.value.length > 100) return false
  return selectedIds.value.every(id => {
    const item = selectedMap.value.get(id)
    return item && item.quantity > 0 && !isOverLimitById(id)
  })
})

const totalQuantityByUnit = computed(() => {
  const map = {}
  for (const id of selectedIds.value) {
    const item = selectedMap.value.get(id)
    if (item && item.quantity > 0 && !isOverLimitById(id)) {
      map[item.unit] = (map[item.unit] || 0) + item.quantity
    }
  }
  return map
})

const stockTypeLabel = (type) => {
  const map = { seed: '种源', seedling: '种苗', product: '成品' }
  return map[type] || type
}

const isOverLimit = (row) => {
  const item = selectedMap.value.get(row.id)
  if (!item) return false
  const max = row.returnableQuantity || (row.quantity - (row.returnedQuantity || 0))
  return item.quantity > max
}

const isOverLimitById = (id) => {
  const row = rows.value.find(r => r.id === id)
  if (!row) return false
  return isOverLimit(row)
}

const rowClass = ({ row }) => {
  if (selectedIds.value.includes(row.id)) return 'bg-emerald-50/40'
  return ''
}

const handleSelectionChange = (selected) => {
  selectedIds.value = selected.map(r => r.id)
  for (const row of selected) {
    if (!selectedMap.value.has(row.id)) {
      const max = row.returnableQuantity || (row.quantity - (row.returnedQuantity || 0))
      selectedMap.value.set(row.id, { quantity: max, unit: row.unit })
    }
  }
  for (const id of Array.from(selectedMap.value.keys())) {
    if (!selectedIds.value.includes(id)) {
      selectedMap.value.delete(id)
    }
  }
}

const updateQuantity = (inboundRecordId, qty) => {
  const item = selectedMap.value.get(inboundRecordId) || { quantity: 0, unit: '' }
  item.quantity = parseInt(qty) || 0
  selectedMap.value.set(inboundRecordId, item)
  error.value = null
}

const handleConfirm = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要退库的入库记录')
    return
  }
  if (selectedIds.value.length > 100) {
    ElMessage.warning('单次最多退库 100 条')
    return
  }
  // P0-F-RETURN-01：聚合所有错误，不静默跳过
  const items = []
  const errors = []
  for (const id of selectedIds.value) {
    const sel = selectedMap.value.get(id)
    const row = rows.value.find(r => r.id === id)
    if (!sel || sel.quantity <= 0) {
      errors.push(`${row?.sourceCode || id}: 退库数量必须大于 0`)
      continue
    }
    const max = row?.returnableQuantity || ((row?.quantity || 0) - (row?.returnedQuantity || 0))
    if (sel.quantity > max) {
      errors.push(`${row?.sourceCode || id}: 退库 ${sel.quantity} 超过可退 ${max}`)
      continue
    }
    items.push({
      inboundRecordId: id,
      quantity: sel.quantity,
      unit: sel.unit
    })
  }
  if (errors.length > 0) {
    ElMessage.warning(`校验失败：${errors.join('；')}`)
    return
  }
  if (items.length === 0) {
    ElMessage.warning('请填写有效的退库数量')
    return
  }
  emit('confirm', items)
}

const loadRows = async () => {
  if (!props.targetSeedSourceId) return
  loading.value = true
  error.value = null
  try {
    const data = await seedSourceTransferService.listReturnableInboundRecords(props.targetSeedSourceId)
    rows.value = Array.isArray(data) ? data : []
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载可退库记录失败'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRows()
})

watch(() => props.targetSeedSourceId, () => {
  loadRows()
})
</script>
