<!--
  库存调拨选择面板（V1.1 1:1 迁移版 — 596行）
  V1.1源文件：D:\TMcrop\yuanxingtu\V1.1\src\components\farm\seed-source\modals\InventoryTransferPanel.tsx
  业务：
    - 拉取 GET /api/inventory/transferable-sources 列出 3 种 stock_type 可调拨库存
    - 多选 + 每行调拨数量调整（默认 = currentQuantity，单位继承）
    - 校验：quantity > 0 且 ≤ currentQuantity，unit 必须等于原库存 unit
    - 确认 → emit confirm(items) → 父组件触发后续调拨提交
      - mode='create_new'（默认）→ 父组件调 createFromTransfer 创建新种源
      - mode='append_existing' → 父组件调 appendToExistingSeedSource 追加到目标种源
  数据流（V2.1 铁律）：
    组件 → seedSourceTransferService → enhancedApiClient → API（无缓存）
-->
<template>
  <div class="space-y-4 inventory-transfer-panel">
    <!-- ============ 顶部状态条 ============ -->
    <div class="flex items-center gap-2 flex-wrap">
      <span
        v-if="mode === 'append_existing'"
        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800"
      >
        模式：追加到现有种源（不创建新记录）
      </span>
      <span
        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-gray-300 text-gray-700"
      >
        {{ loading ? '加载中…' : `共 ${rows.length} 条可调拨` }}
      </span>
      <span
        v-if="totalCount > 0"
        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500 text-white"
      >
        已选 {{ totalCount }} 条
      </span>
    </div>

    <!-- ============ 筛选器 ============ -->
    <div class="p-4 bg-white border border-gray-200 rounded-lg">
      <div class="space-y-3">
        <!-- stockType 多选 toggle -->
        <div class="flex items-center gap-3 flex-wrap">
          <label class="text-sm text-gray-700 whitespace-nowrap">库存类型：</label>
          <button
            v-for="type in stockTypeOptions"
            :key="type.value"
            type="button"
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            :class="stockTypeFilter.includes(type.value)
              ? `${stockTypeBadge[type.value]} ring-1 ring-offset-1 ring-emerald-300`
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
            @click="toggleStockType(type.value)"
          >
            {{ stockTypeLabel[type.value] }}
          </button>
        </div>

        <!-- 关键字 + 日期范围 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="relative">
            <el-icon class="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
              <Search />
            </el-icon>
            <el-input
              v-model="keyword"
              placeholder="搜索品种/作物名/库存编号"
              clearable
              class="pl-8"
              @input="markInteracted"
            />
          </div>
          <el-date-picker
            v-model="dateFrom"
            type="date"
            placeholder="开始日期"
            value-format="YYYY-MM-DD"
            @change="markInteracted"
          />
          <el-date-picker
            v-model="dateTo"
            type="date"
            placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="markInteracted"
          />
        </div>
      </div>
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
    <div v-if="loading" class="p-8 bg-white border border-gray-200 rounded-lg">
      <el-skeleton :rows="3" animated />
    </div>
    <div
      v-else-if="rows.length === 0"
      class="flex flex-col items-center justify-center py-12 bg-white border border-gray-200 rounded-lg"
    >
      <el-empty
        v-if="hasInteracted"
        description="暂无可调拨库存"
      >
        <template #default>
          <p class="text-gray-500">暂无可调拨库存</p>
          <p class="text-xs text-gray-400 mt-2">
            作物库存中没有符合条件的记录，请调整筛选条件或先去库存页登记入库
          </p>
        </template>
      </el-empty>
      <el-empty v-else description="请选择筛选条件">
        <template #default>
          <p class="text-gray-500">请选择筛选条件</p>
          <p class="text-xs text-gray-400 mt-2">
            调整库存类型、输入作物名称或设置日期范围后查询（避免一次性加载大量库存数据）
          </p>
        </template>
      </el-empty>
    </div>
    <div v-else class="bg-white border border-gray-200 rounded-lg overflow-x-auto p-0">
      <!-- 2026-07-21：表格自适应弹窗宽度（去掉固定 1100px，改 w-full + table-fixed 列宽控制列宽） -->
      <table class="table-fixed w-full text-sm">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600">
          <tr class="hover:from-blue-500 hover:to-blue-600">
            <th class="w-10 text-center text-white text-sm font-semibold px-3 py-2">
              <el-checkbox
                :model-value="allVisibleSelected"
                @change="toggleSelectAll"
              />
            </th>
            <th class="w-44 text-white text-sm font-semibold px-3 py-2 text-left">库存编号</th>
            <th class="w-24 text-white text-sm font-semibold px-3 py-2 text-left">类型</th>
            <th class="w-52 text-white text-sm font-semibold px-3 py-2 text-left">作物 / 品种</th>
            <th class="w-28 text-white text-sm font-semibold px-3 py-2 text-left">形态</th>
            <th class="w-32 text-white text-sm font-semibold px-3 py-2 text-right">可用数量</th>
            <th class="w-48 text-white text-sm font-semibold px-3 py-2 text-left">调拨数量</th>
            <th class="w-32 text-white text-sm font-semibold px-3 py-2 text-left">入库日期</th>
            <th class="w-40 text-white text-sm font-semibold px-3 py-2 text-left">采收来源</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in pagedRows"
            :key="row.id"
            :class="selected.has(row.id) ? 'bg-emerald-50/40' : ''"
          >
            <td class="text-center px-3 py-2">
              <el-checkbox
                :model-value="selected.has(row.id)"
                @change="(c) => toggleRow(row, c)"
              />
            </td>
            <td class="px-3 py-2">
              <code class="text-xs text-gray-700 whitespace-nowrap block truncate" :title="row.instanceId">
                {{ row.instanceId }}
              </code>
            </td>
            <td class="px-3 py-2">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
                :class="stockTypeBadge[row.stockType]"
              >
                {{ stockTypeLabel[row.stockType] }}
              </span>
            </td>
            <td class="px-3 py-2">
              <div
                class="text-sm font-medium text-gray-900 truncate"
                :title="`${row.cropName}${row.varietyName ? ' (' + row.varietyName + ')' : ''}`"
              >
                <span>{{ row.cropName }}</span>
                <span v-if="row.varietyName" class="text-gray-500 ml-1">
                  ({{ row.varietyName }})
                </span>
              </div>
            </td>
            <!-- 2026-06-30 Bug 13：形态列 — 调拨面板列出作物形态方便挑选 -->
            <!-- 2026-07-16 修复：兜底 sourceForm（种源/育苗库存的形态字段，DB product_form=null 时仍能显示） -->
            <td class="px-3 py-2">
              <span
                v-if="row.productForm || row.sourceForm"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 whitespace-nowrap"
              >
                {{ row.productForm || row.sourceForm }}
              </span>
              <span v-else class="text-gray-300 text-xs">—</span>
            </td>
            <td class="px-3 py-2 text-right">
              <span class="text-sm font-medium text-gray-900 whitespace-nowrap">
                {{ row.currentQuantity }}
              </span>
              <span class="text-xs text-gray-500 ml-1">{{ row.unit }}</span>
            </td>
            <td class="px-3 py-2">
              <div v-if="selected.has(row.id)" class="flex items-center gap-1">
                <el-input-number
                  :model-value="selected.get(row.id)?.quantity ?? 0"
                  @update:model-value="(v) => updateQuantity(row.id, v)"
                  :min="0"
                  :max="row.currentQuantity"
                  :step="1"
                  :precision="2"
                  :controls="false"
                  size="small"
                  class="w-24"
                  placeholder="0"
                />
                <span class="text-xs text-gray-500 whitespace-nowrap">{{ row.unit }}</span>
                <span
                  v-if="(selected.get(row.id)?.quantity ?? 0) > row.currentQuantity"
                  class="text-xs text-red-500 ml-1 whitespace-nowrap"
                >
                  超出
                </span>
              </div>
              <span v-else class="text-xs text-gray-400">—</span>
            </td>
            <td class="px-3 py-2">
              <span class="text-xs text-gray-600 whitespace-nowrap">
                {{ row.inboundDate || '—' }}
              </span>
            </td>
            <td class="px-3 py-2">
              <span
                class="text-xs text-gray-600 truncate block"
                :title="formatSource(row)"
              >
                {{ formatSource(row) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div
      v-if="rows.length > 0"
      class="flex items-center justify-between px-4 py-3 bg-white rounded-xl"
    >
      <div class="text-sm text-gray-500">
        显示 {{ (page - 1) * pageSize + 1 }} - {{ Math.min(page * pageSize, rows.length) }} 条，共 {{ rows.length }} 条
      </div>
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="rows.length"
        :page-sizes="[10, 20, 50]"
        :pager-count="5"
        layout="sizes, prev, pager, next, jumper"
        background
        small
      />
    </div>

    <!-- ============ 底部操作栏（仅确认调拨）==========
        「切换入库方式」/「取消」由顶部 grid 和 modal 关闭按钮承担，这里不重复 -->
    <div class="p-4 sticky bottom-0 bg-white shadow-md border-t border-gray-200">
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center gap-1 text-sm text-gray-700">
            <el-icon class="w-4 h-4 text-emerald-500">
              <Check />
            </el-icon>
            <span>已选 <strong class="text-emerald-600">{{ totalCount }}</strong> 条</span>
          </div>
          <span
            v-for="(qty, unit) in totalQuantityByUnit"
            :key="unit"
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-gray-300"
          >
            {{ Number(qty).toFixed(2) }} {{ unit }}
          </span>
        </div>
        <!-- 2020-07-19 P1：提交期间禁用按钮 + loading 状态 -->
        <el-button
          type="primary"
          :loading="submitting"
          :disabled="totalCount === 0 || loading || submitting"
          class="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
          @click="handleConfirm"
        >
          <template v-if="submitting">
            <el-icon class="is-loading"><RotateCcw /></el-icon>
            <span class="ml-1">调拨中...</span>
          </template>
          <template v-else>
            <el-icon class="mr-1"><ArrowLeftRight /></el-icon>
            确认调拨 {{ totalCount > 0 ? `(${totalCount})` : '' }}
          </template>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 库存调拨选择面板（V1.1 InventoryTransferPanel.tsx 1:1 迁移）
 * 2026-06-24: B4 实施（种源新增弹窗 — 创建新种源）
 * 2026-06-25 v3: 加 mode='append_existing' 模式（种源操作列 — 追加现有种源库存）
 *
 * props:
 *   mode - 'create_new' | 'append_existing'（默认 'create_new'）
 *   targetSeedSourceId - mode='append_existing' 时必填：目标种源 ID
 *   targetCropName - 2026-06-26 修复：按目标种源的作物名过滤库存
 *   targetCropVariety - 2026-06-26 修复：按目标种源的作物品种名过滤库存
 * emit:
 *   confirm(items: TransferItem[]) - 确认调拨：返回选中的明细给父组件
 *   cancel() - 取消
 */
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Check, RotateCcw } from '@element-plus/icons-vue'
import { ArrowLeftRight } from 'lucide-vue-next'
import { seedSourceTransferService } from '@/services/seedSourceTransferService'

// ============ Props / Emits ============
const props = defineProps({
  /** 调拨模式：
   *  - 'create_new'（默认）: 父组件（AddModal）调 createFromTransfer 创建新种源
   *  - 'append_existing': 父组件（SeedSourcePage 操作列弹窗）调 appendToExistingSeedSource 追加到目标种源
   */
  mode: { type: String, default: 'create_new' },
  /** 模式 = 'append_existing' 时必填：目标种源 ID */
  targetSeedSourceId: { type: String, default: '' },
  /** 2026-06-26 修复：模式 = 'append_existing' 时按目标种源的作物名过滤库存 */
  targetCropName: { type: String, default: '' },
  /** 2026-06-26 修复：模式 = 'append_existing' 时按目标种源的作物品种名过滤库存 */
  targetCropVariety: { type: String, default: '' }
})

const emit = defineEmits(['confirm', 'cancel'])

// ============ stockType 中文映射 ============
const stockTypeLabel = {
  seed: '种源',
  seedling: '种苗',
  product: '产品'
}

const stockTypeBadge = {
  seed: 'bg-emerald-100 text-emerald-700',
  seedling: 'bg-blue-100 text-blue-700',
  product: 'bg-amber-100 text-amber-700'
}

const stockTypeOptions = [
  { value: 'seed', label: '种源' },
  { value: 'seedling', label: '种苗' },
  { value: 'product', label: '产品' }
]

/**
 * 来源信息格式化
 * 优先级: businessCode（采收/入库单号）> supplierName（供应商）> productionPlanCode（生产计划）> sourceType（来源类型）
 * 老数据 sourceModule/sourceId 可能为 NULL（schema 迁移前入库的），用 businessCode 等兜底
 */
function formatSource(row) {
  if (row.businessCode) return row.businessCode
  if (row.supplierName) return `供应商:${row.supplierName}`
  if (row.productionPlanCode) return row.productionPlanCode
  if (row.sourceType) return row.sourceType
  return '—'
}

// ============ 状态 ============
// 2026-07-19 P0-6：提交锁（防止双击/快速重复触发）
const submitting = ref(false)
const submitLockRef = ref(false)

// ============ 筛选状态 ============
const stockTypeFilter = ref(['seed', 'seedling', 'product'])
const keyword = ref('')
const dateFrom = ref('')
const dateTo = ref('')

// ============ 列表状态 ============
const rows = ref([])
const loading = ref(false)
const error = ref(null)
const page = ref(1)
const pageSize = ref(20)

// 客户端分页
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return rows.value.slice(start, start + pageSize.value)
})

// ============ 选择状态 ============
// Map<stockId, { quantity: number }> — unit 继承自原库存（无需存储）
const selected = reactive(new Map())

// 2026-07-01 P2-6：用 ref 替代 useState（避免不必要 re-render，且对 useEffect 严格模式双跑更稳定）
const hasInteractedRef = ref(false)
// 兼容旧版 setHasInteracted 调用点（保留为 setter wrapper）
const setHasInteracted = (v) => { hasInteractedRef.value = v }

// 计算 hasInteracted（用于空态文案）
const hasInteracted = computed(() => hasInteractedRef.value)

// 用户操作时标记已交互 → 触发首次加载
const markInteracted = () => setHasInteracted(true)

// ============ 加载可调拨库存 ============
const loadRows = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await seedSourceTransferService.listTransferableSources({
      stockType: stockTypeFilter.value,
      keyword: keyword.value.trim() || undefined,
      dateFrom: dateFrom.value || undefined,
      dateTo: dateTo.value || undefined,
      // 2026-06-26 修复：追加模式按目标种源作物名/品种名过滤，避免显示不相关作物库存
      cropName: props.mode === 'append_existing' ? props.targetCropName : undefined,
      cropVariety: props.mode === 'append_existing' ? props.targetCropVariety : undefined
    })
    rows.value = data
  } catch (err) {
    console.error('[InventoryTransferPanel] 加载可调拨库存失败:', err)
    const msg = err instanceof Error ? err.message : '加载可调拨库存失败'
    error.value = msg
    // 2026-07-01 P2-17：去掉 ElMessage.error，保留 Alert 即可（避免双重展示）
  } finally {
    loading.value = false
  }
}

// 初始化加载：面板打开时自动加载数据（不等待用户交互）
onMounted(() => {
  loadRows()
})

// 筛选条件变化时重载（仅在用户交互后才生效）
watch(
  () => [stockTypeFilter.value.join(','), dateFrom.value, dateTo.value, props.targetCropName, props.targetCropVariety, props.mode],
  () => {
    if (!hasInteractedRef.value) return
    page.value = 1
    loadRows()
  }
)

// 关键字用 debounce（300ms）
let keywordTimer = null
watch(keyword, () => {
  if (!hasInteractedRef.value) return
  page.value = 1
  if (keywordTimer) clearTimeout(keywordTimer)
  keywordTimer = setTimeout(() => {
    loadRows()
  }, 300)
})

// ============ 切换 stockType 筛选 ============
const toggleStockType = (type) => {
  markInteracted()
  const idx = stockTypeFilter.value.indexOf(type)
  if (idx > -1) {
    stockTypeFilter.value.splice(idx, 1)
  } else {
    stockTypeFilter.value.push(type)
  }
}

// ============ 选中行 ============
const toggleRow = (row, checked) => {
  if (checked) {
    // 默认数量 = currentQuantity
    selected.set(row.id, { quantity: row.currentQuantity })
  } else {
    selected.delete(row.id)
  }
  // 触发响应式
  selected.set = selected.set
}

// ============ 更新选中行的数量 ============
const updateQuantity = (stockId, quantity) => {
  error.value = null  // 2026-07-01 P1-2：用户修改数量时清空错误提示
  const existing = selected.get(stockId)
  if (existing) {
    selected.set(stockId, { quantity })
  }
}

// ============ 全选 / 反选当前可见行 ============
const allVisibleSelected = computed(() => {
  return pagedRows.value.length > 0 && pagedRows.value.every((r) => selected.has(r.id))
})

const toggleSelectAll = () => {
  if (allVisibleSelected.value) {
    // 反选：移除所有当前可见
    pagedRows.value.forEach((r) => selected.delete(r.id))
  } else {
    // 全选：加入所有当前可见（数量 = currentQuantity）
    pagedRows.value.forEach((r) => {
      if (!selected.has(r.id)) {
        selected.set(r.id, { quantity: r.currentQuantity })
      }
    })
  }
}

// ============ 总数统计 ============
const totalCount = computed(() => selected.size)

const totalQuantityByUnit = computed(() => {
  const map = {}
  rows.value.forEach((r) => {
    const sel = selected.get(r.id)
    if (sel) {
      map[r.unit] = (map[r.unit] || 0) + sel.quantity
    }
  })
  return map
})

// ============ 校验并提交 ============
// 2026-07-19 P0-6：提交锁 — 防止双击/快速重复触发
const handleConfirm = async () => {
  if (submitLockRef.value || submitting.value) {
    return
  }
  submitLockRef.value = true
  submitting.value = true

  try {
    if (selected.size === 0) {
      ElMessage.error('请至少选择 1 条调拨记录')
      return
    }
    if (selected.size > 100) {
      ElMessage.error('批量调拨单次最多 100 条')
      return
    }

    // 校验：每条 quantity > 0 且 ≤ currentQuantity，unit 必须匹配
    const items = []
    const errors = []
    for (const [stockId, { quantity }] of selected.entries()) {
      const row = rows.value.find((r) => r.id === stockId)
      if (!row) continue
      if (!Number.isFinite(quantity) || quantity <= 0) {
        errors.push(`${row.instanceId}: 调拨数量必须 > 0`)
        continue
      }
      if (quantity > row.currentQuantity) {
        errors.push(`${row.instanceId}: 调拨数量 ${quantity} 超过当前可用 ${row.currentQuantity}`)
        continue
      }
      // unit 直接继承原库存（后端会二次校验是否匹配，这里不重复）
      items.push({
        sourceStockId: stockId,
        transferQuantity: Math.floor(quantity),  // 后端要求整数
        unit: row.unit
      })
    }

    if (errors.length > 0) {
      ElMessage.error(`校验失败：${errors.join('；')}`)
      return
    }
    if (items.length === 0) {
      ElMessage.error('没有可调拨的有效记录')
      return
    }

    // P0-6：await emit confirm（父组件必须支持 Promise<void>）
    await emit('confirm', items)
  } finally {
    submitLockRef.value = false
    submitting.value = false
  }
}
</script>
