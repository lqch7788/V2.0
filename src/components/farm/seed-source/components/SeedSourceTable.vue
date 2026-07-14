<template>
  <!--
    种源数据表格组件（V1.1 1:1 迁移版）
    V1.1源文件：src/components/farm/seed-source/components/SeedSourceTable.tsx

    右上角按钮逻辑：编辑/删除/导出 → 需要选择记录后确认
    行内按钮逻辑：查看详情/调拨/退库/标签/打印/图片 → 直接执行
    2026-06-25 v3: 种源是纯仓库 — 操作列只保留：调拨 / 退库 / 编辑 / 标签
    2026-07-07 V3.4：取消「商品种源入库（外购）」入口
  -->
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- 右上角操作按钮栏 - 根据模式显示不同内容 -->
    <div class="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">种源列表</h3>
      <div class="flex items-center gap-2">
        <!-- 导出模式 -->
        <template v-if="exportMode">
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <el-button type="primary" :icon="Download" size="small" :disabled="selectedRows.length === 0" @click="onConfirmExport">
            确认导出
          </el-button>
          <el-button :icon="Close" size="small" @click="handleExportCancel">取消</el-button>
        </template>

        <!-- 删除模式 -->
        <template v-else-if="operationMode === 'delete'">
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <el-button type="danger" :icon="Delete" size="small" :disabled="selectedRows.length === 0" @click="onDelete(selectedRows)">
            确认删除
          </el-button>
          <el-button :icon="Close" size="small" @click="cancelOperation">取消</el-button>
        </template>

        <!-- 打印模式 -->
        <template v-else-if="printMode">
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <el-button type="primary" :icon="Printer" size="small" :disabled="selectedRows.length === 0" @click="confirmPrint">
            确认打印
          </el-button>
          <el-button :icon="Close" size="small" @click="cancelPrintMode">取消</el-button>
        </template>

        <!-- 正常模式 - 显示所有操作按钮 -->
        <template v-else>
          <el-button v-if="canCreate && onAdd" type="primary" :icon="Plus" size="small" @click="onAdd">
            新增
          </el-button>
          <el-button v-if="canDelete" type="danger" :icon="Delete" size="small" @click="onOperationModeChange('delete')">
            删除
          </el-button>
          <el-button v-if="canExport" type="primary" plain :icon="Download" size="small" @click="onOperationModeChange('export')">
            导出
          </el-button>
          <el-button v-if="canPrint" type="primary" plain :icon="Printer" size="small" @click="onPrintModeChange(true)">
            标签打印
          </el-button>
        </template>
      </div>
    </div>

    <!-- 表格 -->
    <div class="overflow-x-auto">
      <el-table
        :data="currentData"
        @selection-change="handleSelectionChange"
        :row-key="(record) => record.id"
        style="width: 100%"
        stripe
        v-loading="loading"
      >
        <el-table-column v-if="showCheckbox" type="selection" width="55" />
        <el-table-column label="种源批号" min-width="120" prop="seedCode" show-overflow-tooltip>
          <template #default="{ row }">
            <!-- V1.1: 绿色字体 + 点击查看详情 -->
            <el-button type="success" link size="small" @click="onDetail(row)">
              {{ truncateText(row.seedCode) }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="作物编码" min-width="100" prop="cropCode" show-overflow-tooltip>
          <template #default="{ row }">
            <!-- V1.1: 橙色等宽字体 -->
            <span class="font-mono text-orange-600">{{ truncateText(getStandardCropCode(row)) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="作物品种" min-width="120" prop="cropName" show-overflow-tooltip>
          <template #default="{ row }">
            {{ truncateText(getCropVarietyName(row)) }}
          </template>
        </el-table-column>
        <el-table-column label="品种路径" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ truncateText(getVarietyPath(row)) }}
          </template>
        </el-table-column>
        <el-table-column label="形态" min-width="100" prop="sourceType">
          <template #default="{ row }">
            <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded-full font-medium whitespace-nowrap">
              {{ truncateText(resolveForm(row)) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="来源途径" min-width="100" prop="sourceOrigin" show-overflow-tooltip>
          <template #default="{ row }">
            {{ truncateText(SOURCE_ORIGIN_MAP[row.sourceOrigin]?.label || row.sourceOrigin) }}
          </template>
        </el-table-column>
        <el-table-column label="供应商" min-width="120" prop="supplierName" show-overflow-tooltip>
          <template #default="{ row }">
            {{ truncateText(row.supplierName) }}
          </template>
        </el-table-column>
        <el-table-column label="采购/入库日期" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ truncateText(row.purchaseDate || row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="入库数量" min-width="100" align="right">
          <template #default="{ row }">
            <!-- V1.1: 蓝色加粗数字 -->
            <span class="text-blue-600 font-medium">{{ (row.quantity ?? row.initialCount).toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="剩余数量" min-width="100" align="right">
          <template #default="{ row }">
            <!-- V1.1: 蓝色数字 -->
            <span class="text-blue-600 font-medium">{{ row.availableCount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="单位" min-width="60" prop="unit" align="center">
          <template #default="{ row }">
            {{ formatUnit(row.unit) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <div class="flex items-center gap-1.5">
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="STOCK_STATUS_MAP[computeStockStatus(row.availableCount, row.initialCount)]?.color || ''"
              >
                {{ STOCK_STATUS_MAP[computeStockStatus(row.availableCount, row.initialCount)]?.label || '' }}
              </span>
              <span
                v-if="row.endTime"
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="row.endType === 'abnormal' ? 'text-red-700 bg-red-100' : 'text-gray-500 bg-gray-100'"
                :title="`${row.endType === 'abnormal' ? '异常' : '正常'}结束于 ${row.endTime}`"
              >
                {{ row.endType === 'abnormal' ? '已异常结束' : '已结束' }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="120" prop="remarks" show-overflow-tooltip>
          <template #default="{ row }">
            {{ truncateText(row.remarks) }}
          </template>
        </el-table-column>
        <el-table-column label="创建人" min-width="100" prop="createBy" show-overflow-tooltip>
          <template #default="{ row }">
            {{ truncateText(row.createBy) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-1">
              <el-tooltip content="标签管理" placement="top" v-if="onLabelManage">
                <el-button type="primary" link :icon="PriceTag" size="small" @click="onLabelManage(row)" />
              </el-tooltip>
              <el-tooltip content="编辑" placement="top" v-if="canEdit">
                <el-button type="primary" link :icon="Edit" size="small" @click="onEdit(row)" />
              </el-tooltip>
              <el-tooltip content="调拨入库（从作物库存追加）" placement="top">
                <el-button type="primary" link :icon="Refresh" size="small" @click="onTransfer(row)" />
              </el-tooltip>
              <el-tooltip v-if="onReturn" content="退库（退回原作物库存）" placement="top">
                <el-button type="warning" link :icon="RefreshLeft" size="small" @click="onReturn(row)" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Pagination - 表格外部底部 -->
    <div class="flex items-center justify-end px-4 py-3 bg-white border-t border-gray-100">
      <el-pagination
        v-model:current-page="localPagination.current"
        v-model:page-size="localPagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="data.length"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import {
  Plus, Delete, Download, Printer, Close, Edit, Refresh, RefreshLeft, PriceTag
} from '@element-plus/icons-vue'
import {
  STOCK_STATUS_MAP,
  SOURCE_TYPE_MAP,
  SOURCE_ORIGIN_MAP,
  computeStockStatus
} from '@/constants/seedSourceDict'
import { getAllVarieties } from '@/services/cropVarietyService'
import { ElMessage } from 'element-plus'

// Props（V1.1 SeedSourceTableProps 1:1）
const props = defineProps({
  data: { type: Array, default: () => [] },
  pagination: { type: Object, required: true },
  selectedRows: { type: Array, default: () => [] },
  operationMode: { type: String, default: 'normal' },
  exportMode: { type: Boolean, default: false },
  printMode: { type: Boolean, default: false },
  canCreate: { type: Boolean, default: true },
  canEdit: { type: Boolean, default: true },
  canDelete: { type: Boolean, default: true },
  canExport: { type: Boolean, default: true },
  canPrint: { type: Boolean, default: true },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits([
  'update:pagination',
  'update:selected-rows',
  'selection-change',
  'add',
  'edit',
  'detail',
  'delete',
  'print',
  'image-click',
  'transfer',
  'return',
  'label-manage',
  'operation-mode-change',
  'export-select-all',
  'export-cancel',
  'confirm-export',
  'print-mode-change',
  'confirm-print'
])

// 分页本地状态
const localPagination = ref({ current: 1, pageSize: 10, ...props.pagination })
watch(() => props.pagination, (val) => {
  localPagination.value = { ...val }
}, { deep: true })

// 品种库缓存（V1.1 SeedSourceTable useEffect）
const varietyCache = ref(new Map())
onMounted(async () => {
  try {
    const varieties = await getAllVarieties()
    const cache = new Map()
    varieties.forEach((v) => {
      const key1 = v.subVariety1Name || ''
      if (key1 && !cache.has(key1)) cache.set(key1, v)
      const key2 = v.varietyName || ''
      if (key2 && !cache.has(key2)) cache.set(key2, v)
      const key3 = v.cropCode || ''
      if (key3 && !cache.has(key3)) cache.set(key3, v)
    })
    varietyCache.value = cache
  } catch (e) {
    console.warn('[SeedSourceTable] 加载品种库失败:', e)
  }
})

// 从品种库查找完整品种信息
const getVarietyByAny = (record) => {
  if (record.cropCode) {
    const v = varietyCache.value.get(record.cropCode)
    if (v) return v
  }
  if (record.cropName) {
    for (const [key, variety] of varietyCache.value.entries()) {
      const fullName = variety.subVariety1Name || variety.varietyName || ''
      if (fullName.includes(record.cropName) || record.cropName.includes(fullName)) {
        return variety
      }
    }
  }
  if (record.cropVariety) {
    for (const [key, variety] of varietyCache.value.entries()) {
      const fullName = variety.subVariety1Name || variety.varietyName || ''
      if (fullName.includes(record.cropVariety) || record.cropVariety.includes(fullName)) {
        return variety
      }
    }
  }
  return null
}

// 品种完整路径
const getVarietyPath = (record) => {
  const variety = getVarietyByAny(record)
  if (!variety) {
    const parts = []
    if (record.cropCategory) parts.push(record.cropCategory)
    if (record.cropName) parts.push(record.cropName)
    if (record.cropVariety && record.cropVariety !== record.cropName) parts.push(record.cropVariety)
    return parts.length > 0 ? parts.join(' > ') : '-'
  }
  const parts = []
  if (variety.categoryName) parts.push(variety.categoryName)
  if (variety.typeName) parts.push(variety.typeName)
  if (variety.varietyName) parts.push(variety.varietyName)
  if (variety.subVariety1Name) parts.push(variety.subVariety1Name)
  return parts.join(' > ') || '-'
}

const getStandardCropCode = (record) => {
  const variety = getVarietyByAny(record)
  return variety?.cropCode || record.cropCode || ''
}

const getCropVarietyName = (record) => {
  const variety = getVarietyByAny(record)
  if (variety) return variety.subVariety1Name || variety.varietyName || record.cropName || ''
  return record.cropVariety || record.cropName || ''
}

// 形态解析（seedForm → SOURCE_TYPE_MAP）
const resolveForm = (record) => {
  const sf = record.seedForm
  if (sf && SOURCE_TYPE_MAP[sf]) return SOURCE_TYPE_MAP[sf].label
  const st = record.sourceType
  if (st && SOURCE_TYPE_MAP[st]) return SOURCE_TYPE_MAP[st].label
  return '其他'
}

// 单位格式化
const formatUnit = (unit) => {
  return SOURCE_TYPE_MAP[unit]?.label || unit || ''
}

// 文本截断（V1.1 truncateText maxLen=16）
const truncateText = (text, maxLen = 16) => {
  if (text === null || text === undefined || text === '') return '-'
  const s = String(text)
  return s.length <= maxLen ? s : `${s.slice(0, maxLen)}…`
}

// 选中行同步
const showCheckbox = computed(() => props.operationMode !== 'normal' || props.exportMode || props.printMode)

// 当前页数据
const currentData = computed(() => {
  const start = (localPagination.value.current - 1) * localPagination.value.pageSize
  const end = Math.min(start + localPagination.value.pageSize, props.data.length)
  return props.data.slice(start, end)
})

// 处理选择变化
const handleSelectionChange = (rows) => {
  emit('update:selected-rows', rows.map(r => r.id))
  emit('selection-change', rows.map(r => r.id))
}

// 分页变更
const handleSizeChange = (size) => {
  localPagination.value.pageSize = size
  localPagination.value.current = 1
  emit('update:pagination', { ...localPagination.value })
}

const handleCurrentChange = (page) => {
  localPagination.value.current = page
  emit('update:pagination', { ...localPagination.value })
}

// 取消操作
const cancelOperation = () => {
  emit('operation-mode-change', 'normal')
  emit('update:selected-rows', [])
}

// 取消打印
const cancelPrintMode = () => {
  emit('print-mode-change', false)
  emit('update:selected-rows', [])
}

// 确认打印
const confirmPrint = () => {
  if (props.selectedRows.length === 0) {
    ElMessage.warning('请先选择要打印的记录')
    return
  }
  const selectedRecords = props.data.filter(item => props.selectedRows.includes(item.id))
  emit('confirm-print', selectedRecords)
  emit('print-mode-change', false)
  emit('update:selected-rows', [])
}

// 导出取消
const handleExportCancel = () => {
  emit('export-cancel')
  emit('update:selected-rows', [])
}

// 事件透传
const onAdd = () => emit('add')
const onEdit = (row) => emit('edit', row)
const onDetail = (row) => emit('detail', row)
const onDelete = (ids) => emit('delete', ids)
const onTransfer = (row) => emit('transfer', row)
const onReturn = (row) => emit('return', row)
const onLabelManage = (row) => emit('label-manage', row)
const onConfirmExport = () => emit('confirm-export')
const onOperationModeChange = (mode) => emit('operation-mode-change', mode)
const onPrintModeChange = (val) => emit('print-mode-change', val)
</script>
