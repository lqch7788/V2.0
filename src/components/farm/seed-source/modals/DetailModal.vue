<!--
  种源详情弹窗 — V1.1 DetailModal.tsx 1:1 对齐版
  V1.1 源文件：src/components/farm/seed-source/modals/DetailModal.tsx
  V2.0 风格：el-dialog + el-tabs + el-descriptions（参考订单管理 DetailModal pattern）
  4 Tab：基本信息 / 调拨来源（条件）/ 入库记录 / 使用记录
-->
<template>
  <el-dialog
    v-model="visible"
    title="种源详情"
    width="1350px"
    height="700px"
    top="5vh"
    :close-on-click-modal="true"
    v-dialog-draggable
    v-dialog-resizable
    v-dialog-maximizable
    @close="handleClose"
  >
    <template #header>
      <div class="flex items-center gap-3 pr-12">
        <span class="text-lg font-semibold">种源详情</span>
        <!-- 入库模式 badge（对齐 V1.1 MODE_CONFIG） -->
        <span
          v-if="modeConfig"
          :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border border-current', modeConfig.color]"
        >
          <el-icon :size="14"><component :is="modeConfig.icon" /></el-icon>
          {{ modeConfig.label }}
        </span>
      </div>
    </template>

    <el-tabs v-model="activeTab" v-if="record">
      <!-- Tab 1: 基本信息 -->
      <el-tab-pane label="基本信息" name="info">
        <!-- 基本信息 -->
        <el-descriptions :column="2" border>
          <el-descriptions-item label="种源批号">
            <span class="font-mono text-blue-600">{{ record.seedCode }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="作物编码">
            <span class="font-mono text-orange-600">{{ record.cropCode || '—' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="作物品种">
            {{ record.cropName }}{{ record.cropVariety ? `（${record.cropVariety}）` : '' }}
          </el-descriptions-item>
          <el-descriptions-item label="品种路径">
            {{ varietyPath }}
          </el-descriptions-item>
          <el-descriptions-item label="来源途径">
            {{ sourceOriginLabel }}
          </el-descriptions-item>
          <el-descriptions-item label="形态">
            {{ record.seedForm || '—' }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 库存信息 -->
        <el-descriptions :column="2" border class="mt-4" title="库存信息">
          <el-descriptions-item label="入库日期">{{ record.purchaseDate || '—' }}</el-descriptions-item>
          <el-descriptions-item label="入库数量">
            {{ record.quantity.toLocaleString() }} {{ formatUnit(record.unit) }}
          </el-descriptions-item>
          <template v-if="isExternal">
            <el-descriptions-item label="单价">¥{{ record.unitPrice }}/{{ formatUnit(record.unit) }}</el-descriptions-item>
            <el-descriptions-item label="总金额">¥{{ (record.totalAmount || 0).toLocaleString() }}</el-descriptions-item>
            <el-descriptions-item label="供应商">{{ record.supplierName || '—' }}</el-descriptions-item>
          </template>
          <el-descriptions-item label="可用数量">
            <span class="font-medium text-emerald-600">{{ record.availableCount.toLocaleString() }} {{ formatUnit(record.unit) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="库存状态">
            <el-tag :type="statusTagType" size="small">{{ statusLabel }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 种植留种信息（条件显示） -->
        <el-descriptions v-if="isPlantingKept" :column="2" border class="mt-4" title="种植留种信息">
          <el-descriptions-item label="关联种植">{{ record.linkedPlantingCode || '—' }}</el-descriptions-item>
          <el-descriptions-item label="世代">{{ record.generation || '—' }}</el-descriptions-item>
          <el-descriptions-item label="采收形态">{{ record.seedForm || '—' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 其他信息 -->
        <el-descriptions :column="2" border class="mt-4" title="其他信息">
          <el-descriptions-item label="创建人">{{ record.createBy || '—' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ record.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ record.updateTime }}</el-descriptions-item>
          <el-descriptions-item label="打印次数">{{ record.printCount || 0 }} 次</el-descriptions-item>
          <el-descriptions-item v-if="record.remarks" label="备注" :span="2">{{ record.remarks }}</el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <!-- Tab 2: 调拨来源（条件显示） -->
      <el-tab-pane v-if="hasTransferSource" label="调拨来源" name="transfer-source">
        <el-descriptions :column="2" border title="原库存信息">
          <el-descriptions-item label="原库存 ID">
            <code class="text-xs font-mono text-gray-700">{{ record.transferredFromStockId }}</code>
          </el-descriptions-item>
          <el-descriptions-item label="来源业务类型">{{ record.transferredFromBusinessType || '—' }}</el-descriptions-item>
          <el-descriptions-item label="来源业务 ID">
            <code class="text-xs font-mono text-gray-700">{{ record.transferredFromBusinessId || '—' }}</code>
          </el-descriptions-item>
          <el-descriptions-item label="原始入库日期">{{ record.originalInboundDate || '—' }}</el-descriptions-item>
          <el-descriptions-item label="原始来源模块">{{ record.originalSourceModule || '—' }}</el-descriptions-item>
          <el-descriptions-item label="原始来源 ID">
            <code class="text-xs font-mono text-gray-700">{{ record.originalSourceId || '—' }}</code>
          </el-descriptions-item>
        </el-descriptions>

        <el-descriptions :column="2" border class="mt-4" title="作物 / 品种 / 价格">
          <el-descriptions-item label="原始作物">{{ record.originalCropName || record.cropName || '—' }}</el-descriptions-item>
          <el-descriptions-item label="原始品种">{{ record.originalVarietyName || record.cropVariety || '—' }}</el-descriptions-item>
          <el-descriptions-item label="原始单位">{{ record.originalUnit || record.unit || '—' }}</el-descriptions-item>
          <el-descriptions-item label="原始单价">
            {{ record.originalUnitPrice != null ? `¥${record.originalUnitPrice}` : '—' }}
          </el-descriptions-item>
          <el-descriptions-item label="原始供应商">{{ record.originalSupplierName || '—' }}</el-descriptions-item>
          <el-descriptions-item label="原始生产计划">
            <code class="text-xs font-mono text-gray-700">{{ record.originalProductionPlanCode || '—' }}</code>
          </el-descriptions-item>
        </el-descriptions>

        <el-alert
          v-if="record.originalHarvestRecordId"
          type="info"
          :closable="false"
          class="mt-4"
        >
          <strong>采收记录：</strong>
          <code class="font-mono">{{ record.originalHarvestRecordId }}</code>
          <span class="ml-2">（调拨前的入库来源）</span>
        </el-alert>
      </el-tab-pane>

      <!-- Tab 3: 入库记录（对齐 V1.1 InboundRecordsPanel） -->
      <el-tab-pane label="入库记录" name="inbound-records">
        <div v-if="inboundLoading" class="text-center py-8 text-gray-500">加载中…</div>
        <el-alert v-else-if="inboundError" :title="inboundError" type="error" :closable="false" show-icon class="mb-3" />
        <template v-else-if="inboundRecords.length > 0">
          <!-- 顶部汇总条 -->
          <div class="grid grid-cols-4 gap-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg mb-3">
            <div>
              <div class="text-xs text-amber-700">入库条数</div>
              <div class="text-lg font-semibold text-amber-900">{{ inboundSummary.count }} <span class="text-xs font-normal">条</span></div>
            </div>
            <div>
              <div class="text-xs text-amber-700">原始数量</div>
              <div class="text-lg font-semibold text-amber-900">
                {{ inboundSummary.totalOriginal.toLocaleString() }} <span class="text-xs font-normal">{{ inboundSummary.unit }}</span>
              </div>
            </div>
            <div>
              <div class="text-xs text-amber-700">已退数量</div>
              <div class="text-lg font-semibold text-amber-900">
                <span v-if="inboundSummary.totalReturned > 0" class="text-red-600">
                  {{ inboundSummary.totalReturned.toLocaleString() }} <span class="text-xs font-normal">{{ inboundSummary.unit }}</span>
                </span>
                <span v-else class="text-gray-400 text-sm">—</span>
              </div>
            </div>
            <div>
              <div class="text-xs text-amber-700">可退数量</div>
              <div class="text-lg font-semibold text-amber-900">
                {{ inboundSummary.totalReturnable.toLocaleString() }} <span class="text-xs font-normal">{{ inboundSummary.unit }}</span>
              </div>
            </div>
          </div>

          <!-- 操作栏 -->
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
              入库记录（共 {{ inboundRecords.length }} 条）
            </h4>
            <el-button size="small" class="!bg-emerald-600 !text-white" @click="exportInboundExcel">
              <el-icon class="mr-1"><Download /></el-icon>导出 Excel
            </el-button>
          </div>

          <!-- 表格 -->
          <div class="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <table class="w-full text-sm">
              <thead class="bg-blue-500 text-white sticky top-0">
                <tr>
                  <th class="px-2 py-2 text-left">日期</th>
                  <th class="px-2 py-2 text-left">入库方式</th>
                  <th class="px-2 py-2 text-left">入库单号</th>
                  <th class="px-2 py-2 text-left">作物</th>
                  <th class="px-2 py-2 text-left">品种</th>
                  <th class="px-2 py-2 text-left">仓库</th>
                  <th class="px-2 py-2 text-right">原始数量</th>
                  <th class="px-2 py-2 text-right">已退数量</th>
                  <th class="px-2 py-2 text-right">可退数量</th>
                  <th class="px-2 py-2 text-right">单价</th>
                  <th class="px-2 py-2 text-right">总金额</th>
                  <th class="px-2 py-2 text-left">供应商</th>
                  <th class="px-2 py-2 text-left">操作员</th>
                  <th class="px-2 py-2 text-left">备注</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in inboundRecords" :key="r.id" class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="px-2 py-1.5">{{ r.recordDate || '-' }}</td>
                  <td class="px-2 py-1.5">
                    <span class="px-1.5 py-0.5 bg-cyan-50 text-cyan-700 rounded text-xs">
                      {{ SOURCE_MODULE_MAP[r.sourceModule || ''] || r.sourceModule || '-' }}
                    </span>
                  </td>
                  <td class="px-2 py-1.5"><code class="text-xs">{{ r.id || '-' }}</code></td>
                  <td class="px-2 py-1.5">{{ r.cropName || '-' }}</td>
                  <td class="px-2 py-1.5">{{ r.varietyName || '-' }}</td>
                  <td class="px-2 py-1.5">{{ r.warehouseName || '-' }}</td>
                  <td class="px-2 py-1.5 text-right font-medium">{{ (r.quantity || 0).toLocaleString() }}</td>
                  <td class="px-2 py-1.5 text-right">
                    <span v-if="(r.returnedQuantity || 0) > 0" class="text-amber-600 font-medium">
                      {{ (r.returnedQuantity || 0).toLocaleString() }}
                    </span>
                    <span v-else class="text-gray-400">—</span>
                  </td>
                  <td class="px-2 py-1.5 text-right">
                    <span :class="((r.quantity || 0) - (r.returnedQuantity || 0)) > 0 ? 'text-emerald-600 font-medium' : 'text-gray-400'">
                      {{ ((r.quantity || 0) - (r.returnedQuantity || 0)).toLocaleString() }}
                    </span>
                  </td>
                  <td class="px-2 py-1.5 text-right">{{ (r.unitPrice || 0).toFixed(2) }}</td>
                  <td class="px-2 py-1.5 text-right">{{ (r.totalAmount || 0).toFixed(2) }}</td>
                  <td class="px-2 py-1.5">{{ r.supplierName || '-' }}</td>
                  <td class="px-2 py-1.5">{{ r.operatorName || '-' }}</td>
                  <td class="px-2 py-1.5 text-gray-500 truncate max-w-[200px]" :title="r.notes || ''">{{ r.notes || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <el-empty v-else description="暂无入库记录" />
      </el-tab-pane>

      <!-- Tab 4: 使用记录（对齐 V1.1 UsageRecordsPanel） -->
      <el-tab-pane label="使用记录" name="usage-records">
        <div v-if="usageLoading" class="text-center py-8 text-gray-500">加载中…</div>
        <el-alert v-else-if="usageError" :title="usageError" type="error" :closable="false" show-icon class="mb-3" />
        <template v-else-if="usageRecords.length > 0">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-semibold text-gray-900">使用记录（共 {{ usageRecords.length }} 条）</h4>
            <el-button size="small" class="!bg-emerald-600 !text-white" @click="exportUsageExcel">
              <el-icon class="mr-1"><Download /></el-icon>导出 Excel
            </el-button>
          </div>
          <div class="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <table class="w-full text-sm">
              <thead class="bg-blue-500 text-white sticky top-0">
                <tr>
                  <th class="px-2 py-2 text-left">日期</th>
                  <th class="px-2 py-2 text-left">类型</th>
                  <th class="px-2 py-2 text-left">种源批号</th>
                  <th class="px-2 py-2 text-left">作物名称</th>
                  <th class="px-2 py-2 text-left">作物编码</th>
                  <th class="px-2 py-2 text-left">形态</th>
                  <th class="px-2 py-2 text-right">数量</th>
                  <th class="px-2 py-2 text-left">目标种植单</th>
                  <th class="px-2 py-2 text-left">目标区域</th>
                  <th class="px-2 py-2 text-left">操作员</th>
                  <th class="px-2 py-2 text-left">备注</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in usageRecords" :key="r.id" class="hover:bg-gray-50 border-b border-gray-100">
                  <td class="px-2 py-1.5 whitespace-nowrap">{{ r.operationDate || '-' }}</td>
                  <td class="px-2 py-1.5">
                    <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs', r.operationType === 'move_in' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600']">
                      {{ r.operationType === 'move_in' ? '调入' : '调出' }}
                    </span>
                  </td>
                  <td class="px-2 py-1.5"><code class="text-xs">{{ r.sourceCode || '-' }}</code></td>
                  <td class="px-2 py-1.5 whitespace-nowrap">{{ r.cropName || '-' }}</td>
                  <td class="px-2 py-1.5"><code class="text-xs text-orange-600">{{ r.cropCode || '-' }}</code></td>
                  <td class="px-2 py-1.5">{{ r.seedForm || '-' }}</td>
                  <td class="px-2 py-1.5 text-right font-medium">{{ (r.quantity || 0).toLocaleString() }}</td>
                  <td class="px-2 py-1.5"><code class="text-xs">{{ r.plantingCode || '-' }}</code></td>
                  <td class="px-2 py-1.5">{{ r.toAreaName || '-' }}</td>
                  <td class="px-2 py-1.5">{{ r.operatorName || '-' }}</td>
                  <td class="px-2 py-1.5 text-gray-500 truncate max-w-[200px]" :title="r.remarks || ''">{{ r.remarks || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <el-empty v-else description="暂无使用记录" />
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * 种源详情弹窗 — V1.1 DetailModal.tsx 1:1 对齐
 * 使用 Element Plus 内置组件（el-dialog + el-tabs + el-descriptions）
 * 参考 V2.0 订单管理 DetailModal 的极简 pattern
 */
import { ref, computed, watch, onMounted } from 'vue'
import { Download, Shop, Sort, Sunny } from '@element-plus/icons-vue'
import { enhancedApiClient } from '@/lib/apiClient'
import { getSeedSourceUsageRecords } from '@/services/apiSeedSourceService'
import { STOCK_STATUS_MAP, SOURCE_TYPE_MAP, SOURCE_ORIGIN_MAP, computeStockStatus, safeLabel } from '@/constants/seedSourceDict'
import * as XLSX from 'xlsx'

const props = defineProps({
  visible: { type: Boolean, default: false },
  record: { type: Object, default: null }
})
const emit = defineEmits(['update:visible', 'close'])

// v-model 兼容（对齐订单管理 DetailModal pattern）
const visible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})

const activeTab = ref('info')

// ===== 入库模式配置（对齐 V1.1 MODE_CONFIG）=====
const MODE_CONFIG = {
  planting_self_kept:      { label: '种植留种', color: 'text-green-700 bg-green-50 border-green-300', icon: Sunny },
  inventory_transfer:      { label: '库存调拨', color: 'text-cyan-700 bg-cyan-50 border-cyan-300', icon: Sort },
  transfer_from_inventory: { label: '库存调拨', color: 'text-cyan-700 bg-cyan-50 border-cyan-300', icon: Sort },
  external_purchase:       { label: '外购入库', color: 'text-blue-700 bg-blue-50 border-blue-300', icon: Shop },
  external:                { label: '外购入库', color: 'text-blue-700 bg-blue-50 border-blue-300', icon: Shop }
}

const SOURCE_MODULE_MAP = {
  seed_source: '商品种源入库',
  inventory: '库存调拨'
}

const handleClose = () => emit('update:visible', false)

// ===== 计算属性（对齐 V1.1） =====
const hasTransferSource = computed(() => !!props.record?.transferredFromStockId)
const originKey = computed(() => props.record?.sourceOrigin || (props.record?.transferredFromStockId ? 'transfer_from_inventory' : 'external'))
const modeConfig = computed(() => MODE_CONFIG[originKey.value] || MODE_CONFIG.external)
const isExternal = computed(() => originKey.value === 'external' || originKey.value === 'external_purchase')
const isPlantingKept = computed(() => originKey.value === 'planting_self_kept')

const varietyPath = computed(() => {
  const r = props.record
  if (!r) return '—'
  if (r.typeName && r.varietyName) return `${r.typeName} › ${r.varietyName}`
  return r.varietyName || r.typeName || '—'
})
const sourceOriginLabel = computed(() => {
  if (!props.record) return ''
  return safeLabel(SOURCE_ORIGIN_MAP, originKey.value, modeConfig.value.label)
})

const statusInfo = computed(() => {
  if (!props.record) return { label: '-', tagType: 'info' }
  const key = computeStockStatus(props.record.availableCount, props.record.initialCount)
  return { label: STOCK_STATUS_MAP[key]?.label || key, tagType: STOCK_STATUS_MAP[key]?.tagType || 'info' }
})
const statusLabel = computed(() => statusInfo.value.label)
const statusTagType = computed(() => statusInfo.value.tagType)

const formatUnit = (unit) => safeLabel(SOURCE_TYPE_MAP, unit, unit || '')

// ===== 入库记录 =====
const inboundRecords = ref([])
const inboundLoading = ref(false)
const inboundError = ref(null)

const inboundSummary = computed(() => {
  const records = inboundRecords.value
  const totalOriginal = records.reduce((s, r) => s + (Number(r.quantity) || 0), 0)
  const totalReturned = records.reduce((s, r) => s + (Number(r.returnedQuantity) || 0), 0)
  const totalReturnable = totalOriginal - totalReturned
  const unit = records.find(r => r.unit)?.unit || ''
  return { totalOriginal, totalReturned, totalReturnable, unit, count: records.length }
})

const fetchInboundRecords = async () => {
  if (!props.record?.id) return
  inboundLoading.value = true
  inboundError.value = null
  try {
    const data = await enhancedApiClient.get(`/seed-sources/${props.record.id}/history-inbound`)
    inboundRecords.value = Array.isArray(data) ? data : (data?.data || [])
  } catch (e) {
    inboundError.value = (e && e.message) || '加载失败'
  } finally {
    inboundLoading.value = false
  }
}

// ===== 使用记录 =====
const usageRecords = ref([])
const usageLoading = ref(false)
const usageError = ref(null)

const fetchUsageRecords = async () => {
  if (!props.record?.id) return
  usageLoading.value = true
  usageError.value = null
  try {
    const data = await getSeedSourceUsageRecords(props.record.id)
    usageRecords.value = Array.isArray(data) ? data : []
  } catch (e) {
    usageError.value = (e && e.message) || '加载失败'
  } finally {
    usageLoading.value = false
  }
}

// ===== 导出 Excel =====
const todayLocal = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const exportInboundExcel = () => {
  const headers = ['日期', '入库方式', '入库单号', '作物', '品种', '仓库', '原始数量', '已退数量', '可退数量', '单价', '总金额', '供应商', '操作员', '备注']
  const data = inboundRecords.value.map(r => [
    r.recordDate || '', SOURCE_MODULE_MAP[r.sourceModule || ''] || r.sourceModule || '',
    r.id || '', r.cropName || '', r.varietyName || '', r.warehouseName || '',
    r.quantity ?? 0, r.returnedQuantity ?? 0, (r.quantity || 0) - (r.returnedQuantity || 0),
    r.unitPrice ?? 0, r.totalAmount ?? 0, r.supplierName || '', r.operatorName || '', r.notes || ''
  ])
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
  ws['!cols'] = headers.map(() => ({ wch: 16 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '入库记录')
  XLSX.writeFile(wb, `入库记录_${todayLocal().replace(/-/g, '')}_${inboundRecords.value.length}条.xlsx`)
}

const exportUsageExcel = () => {
  const headers = ['日期', '类型', '种源批号', '作物名称', '作物编码', '形态', '数量', '目标种植单', '目标区域', '操作员', '备注']
  const data = usageRecords.value.map(r => [
    r.operationDate || '', r.operationType === 'move_in' ? '调入' : '调出',
    r.sourceCode || '', r.cropName || '', r.cropCode || '', r.seedForm || '',
    r.quantity ?? 0, r.plantingCode || '', r.toAreaName || r.fromAreaName || '',
    r.operatorName || '', r.remarks || ''
  ])
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
  ws['!cols'] = headers.map(() => ({ wch: 16 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '使用记录')
  XLSX.writeFile(wb, `使用记录_${todayLocal().replace(/-/g, '')}_${usageRecords.value.length}条.xlsx`)
}

// ===== 加载数据 =====
const fetchAllData = () => {
  fetchInboundRecords()
  fetchUsageRecords()
}

watch(() => [props.visible, props.record?.id], ([visible, id]) => {
  if (visible && id) {
    fetchAllData()
  }
})

onMounted(() => {
  if (props.visible && props.record?.id) fetchAllData()
})
</script>