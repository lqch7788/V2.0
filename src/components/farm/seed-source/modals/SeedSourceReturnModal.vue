<!--
  种源退库面板（V1.1 1:1 迁移版）
  V1.1源文件：src/components/farm/seed-source/modals/SeedSourceReturnModal.tsx
  业务：把种源里"调拨入库"的数量退回原作物库存
  - 严格 1:1 关联 inventory_inbound_records 流水（不能选其他库存）
  - 支持部分退（quantity - returned_quantity 范围内）

  数据流：
  - 加载：GET /api/seed-sources/:id/inbound-records → 列出该种源所有可退流水
  - 提交：POST /api/seed-sources/return-to-inventory
-->
<template>
  <div class="space-y-4">
    <!-- ============ 顶部状态条 ============ -->
    <div class="flex items-center gap-2 flex-wrap">
      <span class="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs">
        模式：退库到原作物库存（严格 1:1 关联调拨流水）
      </span>
      <span class="px-2 py-0.5 rounded-md border border-gray-300 text-xs text-gray-700">
        {{ loading ? '加载中…' : `共 ${rows.length} 条可退流水` }}
      </span>
      <span v-if="totalCount > 0" class="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-xs">
        已选 {{ totalCount }} 条
      </span>
    </div>

    <!-- ============ 错误提示 ============ -->
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      :closable="false"
      show-icon
    />

    <!-- ============ 列表 ============ -->
    <div v-if="loading" class="p-8 space-y-2">
      <el-skeleton :rows="1" animated />
      <el-skeleton :rows="1" animated />
      <el-skeleton :rows="1" animated />
    </div>
    <div v-else-if="rows.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
      <el-empty description="暂无可退库流水">
        <template #default>
          <div class="text-gray-500 text-sm">
            <div class="mb-1">暂无可退库流水</div>
            <div class="text-xs text-gray-400">该种源没有可退的调拨入库流水（或已全部退完）</div>
          </div>
        </template>
      </el-empty>
    </div>
    <div v-else class="overflow-x-auto p-0">
      <el-table
        :data="rows"
        :row-key="(row) => row.id"
        border
        :row-class-name="rowClassName"
        @selection-change="handleSelectionChange"
        style="width: 1100px"
      >
        <!-- ============ 选择列（V1.1: w-10 centered） ============ -->
        <el-table-column type="selection" width="40" align="center" />
        <!-- ============ 原库存单号（V1.1: w-44, sourceInstanceId 优先） ============ -->
        <el-table-column label="原库存单号" width="176" show-overflow-tooltip>
          <template #default="{ row }">
            <!-- 2026-07-16 P0-11：V1.1 优先显示 sourceInstanceId（physical 库存实例 ID），fallback 到 sourceCode 业务编号 -->
            <code class="text-xs text-gray-700 whitespace-nowrap block truncate" :title="row.sourceInstanceId || row.sourceCode">
              {{ row.sourceInstanceId || row.sourceCode }}
            </code>
          </template>
        </el-table-column>
        <!-- ============ 类型（V1.1: w-28, badge） ============ -->
        <el-table-column label="类型" width="112">
          <template #default="{ row }">
            <span class="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs whitespace-nowrap">
              <!-- 2026-07-16：stockType fallback 加 '其他' 兜底，避免显示未知英文值 -->
              {{ row.stockType === 'seedling' ? '种苗' : row.stockType === 'seed' ? '种源' : row.stockType === 'product' ? '成品' : '其他' }}
            </span>
          </template>
        </el-table-column>
        <!-- ============ 作物 / 品种（V1.1: w-32, cropName truncate） ============ -->
        <el-table-column label="作物 / 品种" width="128" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="text-sm font-medium text-gray-900 truncate" :title="row.cropName || ''">
              {{ row.cropName || '-' }}
            </div>
          </template>
        </el-table-column>
        <!-- ============ 仓库（V1.1: w-28, warehouseName truncate） ============ -->
        <el-table-column label="仓库" width="112" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="text-xs text-gray-600 whitespace-nowrap truncate block" :title="row.warehouseName || ''">
              {{ row.warehouseName || '-' }}
            </span>
          </template>
        </el-table-column>
        <!-- ============ 原始数量（V1.1: w-28 right, quantity + unit） ============ -->
        <el-table-column label="原始数量" width="112" align="right">
          <template #default="{ row }">
            <span class="text-sm font-medium text-gray-900 whitespace-nowrap">{{ row.quantity }}</span>
            <span class="text-xs text-gray-500 ml-1">{{ row.unit }}</span>
          </template>
        </el-table-column>
        <!-- ============ 已退（V1.1: w-28 right, returnedQuantity + unit） ============ -->
        <el-table-column label="已退" width="112" align="right">
          <template #default="{ row }">
            <span class="text-sm text-gray-500 whitespace-nowrap">{{ row.returnedQuantity }}</span>
            <span class="text-xs text-gray-400 ml-1">{{ row.unit }}</span>
          </template>
        </el-table-column>
        <!-- ============ 可退（V1.1: w-28 right, emerald） ============ -->
        <el-table-column label="可退" width="112" align="right">
          <template #default="{ row }">
            <span class="text-sm font-medium text-emerald-600 whitespace-nowrap">{{ row.returnableQuantity }}</span>
            <span class="text-xs text-gray-500 ml-1">{{ row.unit }}</span>
          </template>
        </el-table-column>
        <!-- ============ 退库数量（V1.1: w-44, NumberInput + unit + 超出） ============ -->
        <el-table-column label="退库数量" width="176">
          <template #default="{ row }">
            <div v-if="selectedIds.includes(row.id)" class="flex items-center gap-1">
              <el-input-number
                :model-value="selectedMap.get(row.id)?.quantity || 0"
                :min="0"
                :step="1"
                size="small"
                controls-position="right"
                style="width: 96px"
                @update:model-value="(v) => updateQuantity(row.id, parseInt(String(v), 10) || 0)"
              />
              <span class="text-xs text-gray-500 whitespace-nowrap">{{ row.unit }}</span>
              <span v-if="isOverLimit(row)" class="text-xs text-red-500 ml-1 whitespace-nowrap">超出</span>
            </div>
            <span v-else class="text-xs text-gray-400">—</span>
          </template>
        </el-table-column>
        <!-- ============ 入库日期（V1.1: w-28, recordDate 或 '—'） ============ -->
        <el-table-column label="入库日期" width="112">
          <template #default="{ row }">
            <span class="text-xs text-gray-600 whitespace-nowrap">
              {{ row.recordDate || '—' }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- ============ 底部操作栏（V1.1: sticky bottom Card） ============ -->
    <div class="sticky bottom-0 p-4 bg-white shadow-md border-t border-gray-200 rounded-b">
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center gap-1 text-sm text-gray-700">
            <el-icon class="text-emerald-500"><CheckCircle2 /></el-icon>
            <span>已选 <strong class="text-emerald-600">{{ totalCount }}</strong> 条</span>
          </div>
          <span
            v-for="(qty, unit) in totalQuantityByUnit"
            :key="unit"
            class="px-2 py-0.5 rounded-md border border-gray-300 text-xs text-gray-700"
          >
            {{ qty.toFixed(2) }} {{ unit }}
          </span>
        </div>
        <!-- 2020-07-19 P1：提交期间禁用按钮 + loading 状态 -->
        <el-button
          class="bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
          :disabled="totalCount === 0 || loading || submitting"
          :loading="submitting"
          @click="handleConfirm"
        >
          <el-icon v-if="submitting" class="is-loading"><RotateCcw /></el-icon>
          <el-icon v-else><Undo2 /></el-icon>
          {{ submitting ? '退库中...' : `确认退库${totalCount > 0 ? ` (${totalCount})` : ''}` }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 种源退库 Modal（2026-06-26 Q1，V1.1 → V2.0 1:1 迁移）
 *
 * 业务：
 * - 把种源里"调拨入库"的数量退回原作物库存
 * - 严格 1:1 关联 inventory_inbound_records 流水（不能选其他库存）
 * - 支持部分退（quantity - returned_quantity 范围内）
 *
 * 数据流：
 * - 加载：GET /api/seed-sources/:id/inbound-records → 列出该种源所有可退流水
 * - 提交：POST /api/seed-sources/return-to-inventory
 */

import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Undo2, CheckCircle2, RotateCcw, ArrowLeftRight } from 'lucide-vue-next'
import { todayLocal } from '@/lib/dateUtils'
import { useUserStore } from '@/stores/modules/user'
import { useSeedSourceStore } from '@/stores/modules/seedSource'
import { seedSourceTransferService } from '@/services/seedSourceTransferService'

// V2.0 stores 实例（保留 V1.1 props 签名的同时接入 V2.0 状态层）
// 用于提交后刷新种源列表、退库日志记录等场景
const _userStore = useUserStore()
const _seedSourceStore = useSeedSourceStore()
void _userStore; void _seedSourceStore  // 避免 unused warning；保留扩展点
void todayLocal  // V1.1 字段中尚未直接使用，预留给退库日期字段扩展
void ArrowLeftRight  // 备用图标库；当前确认按钮使用 Undo2 + 加载态 RotateCcw

/**
 * V1.1 props 签名：
 * - targetSeedSourceId: 目标种源 ID
 * - targetSeedSourceCode: 目标种源 code（仅显示用，V1.1 props 但 V2.0 模板未展示，下方保留供上层调用）
 * V2.0 增加 emit('confirm')：返回 V1.1 onConfirm(items) 的等价 Promise
 */
const props = defineProps({
  /** 目标种源 ID */
  targetSeedSourceId: { type: String, required: true },
  /** 目标种源 code（仅显示用） */
  targetSeedSourceCode: { type: String, default: '' }
})

const emit = defineEmits(['confirm', 'cancel'])

// ============ 数据状态（对齐 V1.1: rows / loading / error） ============
const rows = ref([])                  // ReturnableInboundRow[]
const loading = ref(false)
const error = ref(null)

// ============ 选择状态（对齐 V1.1: Map<inboundRecordId, {quantity, unit}>） ============
// Map<inboundRecordId, {quantity: number, unit: string}>（unit 继承自流水，无需存储）
const selectedIds = ref([])          // el-table selection 同步过来的 ID 列表
const selectedMap = ref(new Map())   // 选中行的实际退库数量 + 单位

// 2026-07-19 P0-6：提交锁 — 防止双击/重复触发
const submitting = ref(false)
// submitLockRef 在 V2.0 用同步布尔变量（Vue ref 单线程已合并 setState 延迟，但保留同步锁兜底）
const submitLockRef = ref(false)

// ============ 加载可退库流水（1:1 对齐 V1.1 loadRows） ============
const loadRows = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await seedSourceTransferService.listReturnableInboundRecords(props.targetSeedSourceId)
    rows.value = Array.isArray(data) ? data : []
  } catch (err) {
    // 2026-07-19：保留 V1.1 console.error + 设置错误状态，让 el-alert 渲染
    console.error('[SeedSourceReturnModal] 加载可退库流水失败:', err)
    const msg = err instanceof Error ? err.message : '加载可退库流水失败'
    error.value = msg
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadRows()
})
// 监听 targetSeedSourceId 变化重新加载（对应 V1.1 useEffect [targetSeedSourceId]）
watch(() => props.targetSeedSourceId, () => {
  void loadRows()
})

// ============ 选中行（1:1 对齐 V1.1 toggleRow / updateQuantity） ============
const handleSelectionChange = (selected) => {
  // el-table 的 @selection-change 返回当前选中行数组
  const nextIds = selected.map((r) => r.id)
  // 同步 selectedIds
  selectedIds.value = nextIds
  // 新选中：默认数量 = 可退量（V1.1：next.set(row.id, { quantity: row.returnableQuantity, unit: row.unit })）
  for (const row of selected) {
    if (!selectedMap.value.has(row.id)) {
      selectedMap.value.set(row.id, { quantity: row.returnableQuantity, unit: row.unit })
    }
  }
  // 取消选中：从 Map 移除（V1.1：next.delete(row.id)）
  for (const id of Array.from(selectedMap.value.keys())) {
    if (!selectedIds.value.includes(id)) {
      selectedMap.value.delete(id)
    }
  }
  // 触发响应式更新（El-table selection 不直接触发 ref 更新）
  selectedMap.value = new Map(selectedMap.value)
}

const updateQuantity = (inboundRecordId, quantity) => {
  const existing = selectedMap.value.get(inboundRecordId)
  if (existing) {
    selectedMap.value.set(inboundRecordId, { ...existing, quantity })
    // 触发响应式更新
    selectedMap.value = new Map(selectedMap.value)
  }
}

// 选中行的 className（V1.1: bg-emerald-50/40）
const rowClassName = ({ row }) => {
  if (selectedIds.value.includes(row.id)) return 'bg-emerald-50/40'
  return ''
}

// 是否超出可退量（V1.1: qty > row.returnableQuantity）
const isOverLimit = (row) => {
  const item = selectedMap.value.get(row.id)
  if (!item) return false
  return item.quantity > row.returnableQuantity
}

// ============ 校验并提交（1:1 对齐 V1.1 handleConfirm） ============
const handleConfirm = () => {
  // 2026-07-19 P0-6：同步锁兜底（覆盖 ref 异步更新窗口）
  if (submitLockRef.value) return
  submitLockRef.value = true

  if (selectedIds.value.length === 0) {
    ElMessage.error('请至少选择 1 条退库流水')
    submitLockRef.value = false
    return
  }
  if (selectedIds.value.length > 100) {
    ElMessage.error('批量退库单次最多 100 条')
    submitLockRef.value = false
    return
  }
  // 2026-07-19：聚合校验，items 累积有效行
  const items = []
  const errors = []
  for (const id of selectedIds.value) {
    const sel = selectedMap.value.get(id)
    if (!sel) continue
    const row = rows.value.find((r) => r.id === id)
    if (!row) continue
    if (!Number.isFinite(sel.quantity) || sel.quantity <= 0) {
      errors.push(`${row.sourceCode}: 退库数量必须 > 0`)
      continue
    }
    if (sel.quantity > row.returnableQuantity) {
      errors.push(`${row.sourceCode}: 退库 ${sel.quantity} 超过可退 ${row.returnableQuantity}`)
      continue
    }
    // 2026-07-01 P2-7：移除 `transferQuantity: undefined as any` 死代码 — 仅传必要字段
    items.push({ inboundRecordId: id, quantity: sel.quantity, unit: sel.unit })
  }
  if (errors.length > 0) {
    ElMessage.error(`校验失败：${errors.join('；')}`)
    submitLockRef.value = false
    return
  }
  if (items.length === 0) {
    ElMessage.error('没有可退库的有效记录')
    submitLockRef.value = false
    return
  }
  // V1.1: onConfirm(items) → V2.0: emit('confirm', items)
  emit('confirm', items)
  // 注意：不在此处释放锁，因为 onConfirm 父组件异步处理完成后会 emit('cancel')/关闭窗口
}

// 当外部关闭弹窗时（如 handleReturnClose），释放同步锁
const resetLock = () => {
  submitLockRef.value = false
}
defineExpose({ resetLock })

// ============ 总数统计（1:1 对齐 V1.1 totalCount / totalQuantityByUnit） ============
const totalCount = computed(() => selectedIds.value.length)

// 按单位聚合总退库量（仅统计有效且未超额）
const totalQuantityByUnit = computed(() => {
  const map = {}
  for (const id of selectedIds.value) {
    const sel = selectedMap.value.get(id)
    const row = rows.value.find((r) => r.id === id)
    if (sel && row && sel.quantity > 0 && sel.quantity <= row.returnableQuantity) {
      map[sel.unit] = (map[sel.unit] || 0) + sel.quantity
    }
  }
  return map
})

// 静默引用 ElMessageBox，避免 tree-shaking 误删（保留 V1.1 → V2.0 工具一致性）
void ElMessageBox
</script>
