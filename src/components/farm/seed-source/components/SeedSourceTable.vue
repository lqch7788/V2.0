<template>
  <!--
    种源数据表格组件（V1.1 1:1 迁移版）
    V1.1源文件：src/components/farm/seed-source/components/SeedSourceTable.tsx

    使用原生 HTML table（对齐 V1.1 原生 table 结构，列宽完全内容自适应）
    2026-06-25 v3: 种源是纯仓库 — 操作列只保留：调拨 / 退库 / 编辑 / 标签
    2026-07-07 V3.4：取消「商品种源入库（外购）」入口
  -->
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- 右上角操作按钮栏（对齐 V1.1 L274-387）-->
    <div class="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">种源列表</h3>
      <div class="flex items-center gap-2">
        <template v-if="exportMode">
          <el-button size="small" @click="onExportSelectAll">全选</el-button>
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <el-button type="primary" :icon="Download" size="small" :disabled="selectedRows.length === 0" @click="onConfirmExport">确认导出</el-button>
          <el-button :icon="Close" size="small" @click="handleExportCancel">取消</el-button>
        </template>
        <template v-else-if="operationMode === 'delete'">
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <el-button type="danger" :icon="Delete" size="small" :disabled="selectedRows.length === 0" @click="onDelete(selectedRows)">确认删除</el-button>
          <el-button :icon="Close" size="small" @click="cancelOperation">取消</el-button>
        </template>
        <template v-else-if="printMode">
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <el-button type="primary" :icon="Printer" size="small" :disabled="selectedRows.length === 0" @click="confirmPrint">确认打印</el-button>
          <el-button :icon="Close" size="small" @click="cancelPrintMode">取消</el-button>
        </template>
        <template v-else>
          <el-button v-if="canCreate && onAdd" type="primary" :icon="Plus" size="small" @click="onAdd">新增</el-button>
          <el-button v-if="canDelete" type="danger" :icon="Delete" size="small" @click="onOperationModeChange('delete')">删除</el-button>
          <el-button v-if="canExport" class="sst-btn-export" :icon="Download" size="small" @click="onOperationModeChange('export')">导出</el-button>
          <el-button v-if="canPrint" :icon="Printer" size="small" class="sst-btn-print" @click="onPrintModeChange(true)">标签打印</el-button>
        </template>
      </div>
    </div>

    <!-- 表格（对齐 V1.1 L389-622: overflow-x-auto + 原生 Table）-->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <!-- 表头（对齐 V1.1 L392-444）-->
        <thead>
          <tr class="sst-thead-tr">
            <th v-if="showCheckbox" class="sst-th sst-th-check">
              <input type="checkbox" :checked="currentData.length > 0 && currentData.every(r => selectedIds.has(r.id))" @change="togglePageSelection" class="w-4 h-4 rounded border-gray-300" />
            </th>
            <th class="sst-th">种源批号</th>
            <th class="sst-th">作物编码</th>
            <th class="sst-th">作物品种</th>
            <th class="sst-th">品种路径</th>
            <th class="sst-th">形态</th>
            <th class="sst-th">来源途径</th>
            <th class="sst-th">供应商</th>
            <th class="sst-th">采购/入库日期</th>
            <th class="sst-th">入库数量</th>
            <th class="sst-th">剩余数量</th>
            <th class="sst-th">单位</th>
            <th class="sst-th"><span class="sst-help">状态<span class="sst-sup">?</span></span></th>
            <th class="sst-th">备注</th>
            <th class="sst-th">创建人</th>
            <th class="sst-th sst-th-op">操作</th>
          </tr>
        </thead>
        <!-- 表体（对齐 V1.1 L447-621: divide-y divide-gray-300）-->
        <tbody>
          <tr v-if="currentData.length === 0">
            <td :colspan="showCheckbox ? 17 : 16" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
          </tr>
          <tr v-for="row in currentData" :key="row.id" class="sst-tr">
            <td v-if="showCheckbox" class="sst-td sst-td-check">
              <input type="checkbox" :checked="selectedIds.has(row.id)" @change="toggleRow(row.id, $event)" class="w-4 h-4 rounded border-gray-300" />
            </td>
            <td class="sst-td">
              <button type="button" class="sst-link" @click="onDetail(row)" :title="`${row.seedCode}（点击详情）`">{{ truncateText(row.seedCode) }}</button>
            </td>
            <td class="sst-td" :title="getStandardCropCode(row) || undefined">
              <span class="font-mono text-orange-600">{{ truncateText(getStandardCropCode(row)) }}</span>
            </td>
            <td class="sst-td" :title="getCropVarietyName(row)">{{ truncateText(getCropVarietyName(row)) }}</td>
            <td class="sst-td" :title="getVarietyPath(row)">{{ truncateText(getVarietyPath(row)) }}</td>
            <td class="sst-td">
              <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded-full font-medium whitespace-nowrap">{{ truncateText(resolveForm(row)) }}</span>
            </td>
            <td class="sst-td" :title="SOURCE_ORIGIN_MAP[row.sourceOrigin]?.label || row.sourceOrigin">{{ truncateText(SOURCE_ORIGIN_MAP[row.sourceOrigin]?.label || row.sourceOrigin) }}</td>
            <td class="sst-td" :title="row.supplierName || undefined">{{ truncateText(row.supplierName) }}</td>
            <td class="sst-td" :title="row.purchaseDate || row.createTime">{{ truncateText(row.purchaseDate || row.createTime) }}</td>
            <td class="sst-td sst-num" title="种源入库数量（采购/调拨一次性入库）">{{ row.quantity?.toLocaleString() ?? row.initialCount.toLocaleString() }}</td>
            <td class="sst-td sst-num" title="当前可用库存 = 入库数量 - 已使用">{{ row.availableCount.toLocaleString() }}</td>
            <td class="sst-td sst-center">{{ formatUnit(row.unit) || '-' }}</td>
            <td class="sst-td">
              <span class="px-2 py-1 rounded-full text-xs font-medium" :class="STOCK_STATUS_MAP[computeStockStatus(row.availableCount, row.initialCount)]?.color || ''">
                {{ STOCK_STATUS_MAP[computeStockStatus(row.availableCount, row.initialCount)]?.label || '' }}
              </span>
              <span v-if="row.endTime" class="ml-1 px-2 py-1 rounded-full text-xs font-medium" :class="row.endType === 'abnormal' ? 'text-red-700 bg-red-100' : 'text-gray-500 bg-gray-100'" :title="`${row.endType === 'abnormal' ? '异常' : '正常'}结束于 ${row.endTime}`">
                {{ row.endType === 'abnormal' ? '已异常结束' : '已结束' }}
              </span>
            </td>
            <td class="sst-td" :title="row.remarks || undefined">{{ truncateText(row.remarks) }}</td>
            <td class="sst-td" :title="row.createBy">{{ truncateText(row.createBy) }}</td>
            <td class="sst-td sst-td-op">
              <div class="flex gap-1">
                <!-- 2026-07-15: 操作列图标 lucide-vue-next 1:1 对齐 V1.1（Tag/Edit2/ArrowLeftRight/Undo2） -->
                <!-- 颜色由 .sst-op-* 类名控制（text-purple-600 / text-emerald-600 / text-amber-600 / text-blue-600）-->
                <button v-if="onLabelManage" type="button" class="sst-op-btn sst-op-tag" title="标签管理" @click="onLabelManage(row)">
                  <Tag :size="16" />
                </button>
                <button v-if="canEdit" type="button" class="sst-op-btn sst-op-edit" title="编辑" @click="onEdit(row)">
                  <Edit2 :size="16" />
                </button>
                <button type="button" class="sst-op-btn sst-op-transfer" title="调拨入库（从作物库存追加）" @click="onTransfer(row)">
                  <ArrowLeftRight :size="16" />
                </button>
                <button v-if="onReturn" type="button" class="sst-op-btn sst-op-return" title="退库（退回原作物库存）" @click="onReturn(row)">
                  <Undo2 :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination（对齐 V1.1 L625-639）-->
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 rounded-b-xl">
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
import { Plus, Delete, Download, Printer, Close } from '@element-plus/icons-vue'
// 操作列图标 1:1 对齐 V1.1 lucide-react 图标（Tag / Edit2 / ArrowLeftRight / Undo2）
import { Tag, Edit2, ArrowLeftRight, Undo2 } from 'lucide-vue-next'
import { STOCK_STATUS_MAP, SOURCE_TYPE_MAP, SOURCE_ORIGIN_MAP, UNIT_MAP, computeStockStatus, safeLabel } from '@/constants/seedSourceDict'
import { getAllVarieties } from '@/services/cropVarietyService'
import { ElMessage } from 'element-plus'

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
  'update:pagination', 'update:selected-rows', 'selection-change',
  'add', 'edit', 'detail', 'delete', 'print', 'image-click',
  'transfer', 'return', 'label-manage', 'operation-mode-change',
  'export-cancel', 'confirm-export', 'print-mode-change', 'confirm-print',
  'export-select-all'
])

// V1.1 SeedSourcePage.tsx L86: pageSize=10（表格自身默认也对齐）
const localPagination = ref({ current: 1, pageSize: 10, ...props.pagination })
watch(() => props.pagination, (val) => { localPagination.value = { ...val } }, { deep: true })

// 选中状态（使用 Set 实现 O(1) 查找，对齐 V1.1 selectedRows.includes）
const selectedIds = computed(() => new Set(props.selectedRows))

// 品种库缓存
const varietyCache = ref(new Map())
onMounted(async () => {
  try {
    const varieties = await getAllVarieties()
    const cache = new Map()
    varieties.forEach((v) => {
      const k1 = v.subVariety1Name || ''
      if (k1 && !cache.has(k1)) cache.set(k1, v)
      const k2 = v.varietyName || ''
      if (k2 && !cache.has(k2)) cache.set(k2, v)
      const k3 = v.cropCode || ''
      if (k3 && !cache.has(k3)) cache.set(k3, v)
    })
    varietyCache.value = cache
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    ElMessage.warning(`品种库加载失败：${msg}，作物路径列可能不完整`)
  }
})

const getVarietyByAny = (record) => {
  if (record.cropCode) { const v = varietyCache.value.get(record.cropCode); if (v) return v }
  if (record.cropName) { for (const [, variety] of varietyCache.value.entries()) { const fn = variety.subVariety1Name || variety.varietyName || ''; if (fn.includes(record.cropName) || record.cropName.includes(fn)) return variety } }
  if (record.cropVariety) { for (const [, variety] of varietyCache.value.entries()) { const fn = variety.subVariety1Name || variety.varietyName || ''; if (fn.includes(record.cropVariety) || record.cropVariety.includes(fn)) return variety } }
  return null
}

const getVarietyPath = (record) => {
  const v = getVarietyByAny(record)
  if (!v) { const p = []; if (record.cropCategory) p.push(record.cropCategory); if (record.cropName) p.push(record.cropName); if (record.cropVariety && record.cropVariety !== record.cropName) p.push(record.cropVariety); return p.length > 0 ? p.join(' > ') : '-' }
  const p = []; if (v.categoryName) p.push(v.categoryName); if (v.typeName) p.push(v.typeName); if (v.varietyName) p.push(v.varietyName); if (v.subVariety1Name) p.push(v.subVariety1Name); return p.join(' > ') || '-'
}
const getStandardCropCode = (record) => getVarietyByAny(record)?.cropCode || record.cropCode || ''
const getCropVarietyName = (record) => { const v = getVarietyByAny(record); return v ? (v.subVariety1Name || v.varietyName || record.cropName || '') : (record.cropVariety || record.cropName || '') }
const resolveForm = (record) => {
  // 优先 seedForm（V1.1 已是中文：种子/种苗/花朵/枝条/其他），其次 sourceType
  // 返回中文 label 字符串以兼容 truncateText 调用
  const sf = record.seedForm
  if (sf && SOURCE_TYPE_MAP[sf]) return SOURCE_TYPE_MAP[sf].label || sf
  const st = record.sourceType
  if (st && SOURCE_TYPE_MAP[st]) return SOURCE_TYPE_MAP[st].label || st
  return '其他'
}
const formatUnit = (unit) => UNIT_MAP[unit] || unit || ''
const truncateText = (text, maxLen = 16) => { if (text == null || text === '') return '-'; const s = String(text); return s.length <= maxLen ? s : `${s.slice(0, maxLen)}…` }

const showCheckbox = computed(() => props.operationMode !== 'normal' || props.exportMode || props.printMode)
const currentData = computed(() => { const s = (localPagination.value.current - 1) * localPagination.value.pageSize; return props.data.slice(s, Math.min(s + localPagination.value.pageSize, props.data.length)) })

// 选中逻辑（对齐 V1.1 Checkbox onChange）
const togglePageSelection = (e) => {
  const ids = currentData.value.map(r => r.id)
  if (e.target.checked) { emit('update:selected-rows', [...new Set([...props.selectedRows, ...ids])]) } else { emit('update:selected-rows', props.selectedRows.filter(id => !ids.includes(id))) }
}
const toggleRow = (id, e) => {
  if (e.target.checked) { emit('update:selected-rows', [...props.selectedRows, id]) } else { emit('update:selected-rows', props.selectedRows.filter(x => x !== id)) }
}

const handleSizeChange = (size) => { localPagination.value.pageSize = size; localPagination.value.current = 1; emit('update:pagination', { ...localPagination.value }) }
const handleCurrentChange = (page) => { localPagination.value.current = page; emit('update:pagination', { ...localPagination.value }) }
const cancelOperation = () => { emit('operation-mode-change', 'normal'); emit('update:selected-rows', []) }
const cancelPrintMode = () => { emit('print-mode-change', false); emit('update:selected-rows', []) }
const confirmPrint = () => { if (props.selectedRows.length === 0) { ElMessage.warning('请先选择要打印的记录'); return } emit('confirm-print', props.data.filter(item => props.selectedRows.includes(item.id))); emit('print-mode-change', false); emit('update:selected-rows', []) }
const handleExportCancel = () => { emit('export-cancel'); emit('update:selected-rows', []) }
const onAdd = () => emit('add')
const onEdit = (row) => {
  // V1.1 L218-246：多选编辑时，仅取第一条进行编辑
  if (Array.isArray(row)) {
    const first = getFirstSelectedRecord(row)
    if (!first) {
      ElMessage.warning('请选择一条记录进行编辑')
      return
    }
    emit('edit', first)
    return
  }
  emit('edit', row)
}
const onDetail = (row) => emit('detail', row)
const onDelete = (ids) => emit('delete', ids)
const onTransfer = (row) => emit('transfer', row)
const onReturn = (row) => emit('return', row)
const onLabelManage = (row) => emit('label-manage', row)
const onConfirmExport = () => emit('confirm-export')
const onOperationModeChange = (mode) => emit('operation-mode-change', mode)
const onPrintModeChange = (val) => emit('print-mode-change', val)
const onExportSelectAll = () => emit('export-select-all')

/**
 * 多选编辑时获取第一条选中的记录（V1.1 SeedSourceTable.tsx L218-226 兼容）
 * @param {Array|string} ids - 选中的 id 数组或单条 id
 * @returns {Object|null}
 */
const getFirstSelectedRecord = (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) return null
  const firstId = ids[0]
  return props.data.find(r => r.id === firstId) || null
}

/**
 * 批量操作执行器（V1.1 L228-246）：多选时给出提示；单选时正常执行
 * @param {Object} row - 单条记录
 * @param {string} action - 'edit' | 'detail' | 'transfer' | 'return' | 'label-manage' 等
 */
const executeOperation = (row, action) => {
  if (Array.isArray(row) && row.length > 1) {
    ElMessage.warning(`批量 ${action} 仅支持单条操作，已选择 ${row.length} 条，请重新选择 1 条`)
    return false
  }
  emit(action, Array.isArray(row) ? row[0] : row)
  return true
}
</script>

<style scoped>
/* ===== 表头整行渐变（对齐 V1.1 TableHeader bg-gradient-to-r from-blue-500 to-blue-600）====== */
.sst-thead-tr {
  background: linear-gradient(to right, #3b82f6, #2563eb);
  color: #ffffff;
}

/* ===== 表头单元格（对齐 V1.1 TableHead px-4 py-3 text-sm font-semibold whitespace-nowrap）====== */
.sst-th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  color: #ffffff;
  border-bottom: none;
}
.sst-th-check { width: 3rem; }

/* ===== 状态列帮助图标（对齐 V1.1）====== */
.sst-help { cursor: help; border-bottom: 1px dotted rgba(255, 255, 255, 0.5); }
.sst-sup { font-size: 0.625rem; opacity: 0.7; margin-left: 0.125rem; vertical-align: super; }

/* ===== 操作列表头（对齐 V1.1 sticky right-0 bg-blue-700 shadow z-20）====== */
.sst-th-op {
  position: sticky;
  right: 0;
  background: #1d4ed8;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.15);
  z-index: 20;
}

/* ===== 表格行（对齐 V1.1 TableRow divide-y hover:bg-emerald-50）====== */
.sst-tr { border-bottom: 1px solid #d1d5db; transition: background-color 0.15s; }
.sst-tr:hover { background-color: #ecfdf5; }

/* ===== 单元格（对齐 V1.1 TableCell px-4 py-3 text-sm whitespace-nowrap）====== */
.sst-td {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  white-space: nowrap;
  vertical-align: middle;
}
.sst-td-check { width: 3rem; }
.sst-num { text-align: right; color: #2563eb; font-weight: 500; }
.sst-center { text-align: center; }

/* ===== 操作列固定（对齐 V1.1 sticky right-0 bg-white shadow z-10）====== */
.sst-td-op {
  position: sticky;
  right: 0;
  background: #ffffff;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.05);
  z-index: 10;
}
.sst-tr:hover .sst-td-op { background: #f9fafb; }

/* ===== 链接按钮（对齐 V1.1 Button variant=link text-blue-600）====== */
.sst-link { color: #059669; text-decoration: none; font-weight: 500; background: none; border: none; padding: 0; cursor: pointer; font-size: 0.875rem; }
.sst-link:hover { text-decoration: underline; }

/* ===== 操作列按钮（1:1 对齐 V1.1 ActionIconButton ghost + 彩色图标 + hover 浅色背景）====== */
/* V1.1 源：src/constants/actionIconTokens.ts
 *   tag      → text-purple-600 hover:text-purple-700 hover:bg-purple-50
 *   transfer → text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50
 *   return_  → text-amber-600 hover:text-amber-700 hover:bg-amber-50
 *   edit     → text-blue-600 hover:text-blue-700 hover:bg-blue-50
 */
.sst-op-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 6px;
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}
.sst-op-tag      { color: #9333ea; } .sst-op-tag:hover      { color: #7e22ce; background-color: #faf5ff; }
.sst-op-transfer { color: #059669; } .sst-op-transfer:hover { color: #047857; background-color: #ecfdf5; }
.sst-op-return   { color: #d97706; } .sst-op-return:hover   { color: #b45309; background-color: #fffbeb; }
.sst-op-edit     { color: #2563eb; } .sst-op-edit:hover     { color: #1d4ed8; background-color: #eff6ff; }

/* 复选框 */
.sst-th-check input[type="checkbox"],
.sst-td-check input[type="checkbox"] { border-radius: 0.25rem; border: 1px solid #d1d5db; }

/* ===== 顶部按钮：标签打印 1:1 对齐 V1.1 variant="purple" ===== */
.sst-btn-print {
  background-color: #9333ea !important;
  border-color: #9333ea !important;
  color: #ffffff !important;
}
.sst-btn-print:hover {
  background-color: #7e22ce !important;
  border-color: #7e22ce !important;
  color: #ffffff !important;
}

/* ===== 顶部按钮：导出 1:1 对齐 V1.1 variant="blue" ===== */
.sst-btn-export {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
  color: #ffffff !important;
}
.sst-btn-export:hover {
  background-color: #1d4ed8 !important;
  border-color: #1d4ed8 !important;
  color: #ffffff !important;
}
</style>
