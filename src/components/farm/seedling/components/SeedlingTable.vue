<template>
  <!--
    育苗数据表格组件（V1.1 1:1 迁移版）
    V1.1源文件：src/components/farm/seedling/components/SeedlingTable.tsx
    使用原生 HTML table（对齐 V1.1 原生 table 结构，列宽完全内容自适应）
    操作列 fixed 对齐 V1.1：sticky right-0 + 渐变背景 + 阴影
    2026-07-25 修复：完全照搬 SeedSourceTable layout 方案（w-full + CSS sticky）
  -->
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- 右上角操作按钮栏 -->
    <div class="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">育苗列表</h3>
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
          <el-button v-if="canEdit" type="primary" plain :icon="Edit" size="small" @click="onOperationModeChange('edit')">编辑</el-button>
          <el-button v-if="canDelete" type="danger" :icon="Delete" size="small" @click="onOperationModeChange('delete')">删除</el-button>
          <el-button v-if="canExport" class="slt-btn-export" :icon="Download" size="small" @click="onOperationModeChange('export')">导出</el-button>
          <el-button v-if="canPrint" :icon="Printer" size="small" class="slt-btn-print" @click="onPrintModeChange(true)">标签打印</el-button>
        </template>
      </div>
    </div>

    <!-- 表格（对齐 V1.1 L442-454：固定宽度 2400px + 强制横向滚动 + colgroup 百分比分配）-->
    <div class="overflow-x-auto" style="overflow-x: auto; width: 100%;">
      <table style="width: 2400px; table-layout: fixed; min-width: 2400px;" class="text-sm">
        <!-- 列宽分配（对齐 V1.1 L454：121% 触发横向滚动）
             基本9列 64% + 数值4列 32% + 完成6% + 状态5% + 操作14% + checkbox 2.5% -->
        <colgroup>
          <col v-if="showCheckbox" class="slt-col" style="width: 2.5%;" />
          <col class="slt-col" style="width: 8%;" />
          <col class="slt-col" style="width: 5%;" />
          <col class="slt-col" style="width: 6%;" />
          <col class="slt-col" style="width: 10%;" />
          <col class="slt-col" style="width: 9%;" />
          <col class="slt-col" style="width: 6%;" />
          <col class="slt-col" style="width: 9%;" />
          <col class="slt-col" style="width: 7%;" />
          <col class="slt-col" style="width: 4%;" />
          <col class="slt-col" style="width: 8%;" />
          <col class="slt-col" style="width: 8%;" />
          <col class="slt-col" style="width: 8%;" />
          <col class="slt-col" style="width: 8%;" />
          <col class="slt-col" style="width: 8%;" />
          <col class="slt-col" style="width: 8%;" />
          <col class="slt-col" style="width: 8%;" />
          <col class="slt-col" style="width: 6%;" />
          <col class="slt-col" style="width: 5%;" />
          <col class="slt-col slt-col-op" style="width: 14%;" />
        </colgroup>
        <!-- 表头（对齐 V1.1 L455-486）-->
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <tr class="slt-thead-tr">
            <th v-if="showCheckbox" class="slt-th slt-th-check">
              <input type="checkbox" :checked="currentData.length > 0 && currentData.every(r => selectedIds.has(r.id))" @change="togglePageSelection" class="w-4 h-4 rounded border-gray-300" />
            </th>
            <th class="slt-th">育苗批号</th>
            <th class="slt-th">繁殖模式</th>
            <th class="slt-th">关联生产计划</th>
            <th class="slt-th">关联种源</th>
            <th class="slt-th">作物编码</th>
            <th class="slt-th">作物品种</th>
            <th class="slt-th">品种路径</th>
            <th class="slt-th">育苗区域</th>
            <th class="slt-th">单位</th>
            <!-- ===== 母株池（4 列） — 蓝色半透明背景 ===== -->
            <th class="slt-th slt-th-pond" title="母株池初始数量（建档时投入）">初始数量</th>
            <th class="slt-th slt-th-pond" title="母株池当前存活数">母株存活数</th>
            <th class="slt-th slt-th-pond" title="母株池累计损耗">母株累计损耗</th>
            <th class="slt-th slt-th-pond" title="母株池累计补栽">补苗累计</th>
            <!-- ===== 小苗池（5 列） — 绿色半透明背景 ===== -->
            <th class="slt-th slt-th-seedling" title="小苗池累计产出">小苗累计产出</th>
            <th class="slt-th slt-th-seedling" title="小苗池累计损耗">小苗累计损耗</th>
            <th class="slt-th slt-th-seedling" title="小苗池剩余 = 产出 - 损耗 - 采收入库">小苗剩余数量</th>
            <!-- ===== 派生 ===== -->
            <th class="slt-th">目标成苗数</th>
            <th class="slt-th" title="完成比例 = (小苗累计产出 − 小苗累计损耗) / 目标成苗数">完成比例</th>
            <th class="slt-th">状态</th>
            <!-- 操作列 sticky right-0 -->
            <th class="slt-th slt-th-op">操作</th>
          </tr>
        </thead>
        <!-- 表体 -->
        <tbody>
          <tr v-if="currentData.length === 0">
            <td :colspan="showCheckbox ? 21 : 20" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
          </tr>
          <tr v-for="row in currentData" :key="row.id" class="slt-tr">
            <td v-if="showCheckbox" class="slt-td slt-td-check">
              <input type="checkbox" :checked="selectedIds.has(row.id)" @change="toggleRow(row.id, $event)" class="w-4 h-4 rounded border-gray-300" />
            </td>
            <!-- 1. 育苗批号 -->
            <td class="slt-td">
              <button type="button" class="slt-link" @click="onDetail(row)" :title="`${row.seedlingCode}（点击详情）`">{{ truncateText(row.seedlingCode) }}</button>
            </td>
            <!-- 2. 繁殖模式 -->
            <td class="slt-td">
              <span :class="['px-1.5 py-0.5 rounded text-xs font-medium', getPropagationModeClass(row.propagationMode)]">{{ getPropagationModeLabel(row.propagationMode) }}</span>
            </td>
            <!-- 3. 关联生产计划 -->
            <td class="slt-td" :title="row.productionPlanCode || undefined">
              <span v-if="row.productionPlanCode" class="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs font-medium">{{ truncateText(row.productionPlanCode) }}</span>
              <span v-else>-</span>
            </td>
            <!-- 4. 关联种源 -->
            <td class="slt-td" :title="row.sourceCode || undefined">{{ truncateText(row.sourceCode) }}</td>
            <!-- 5. 作物编码 -->
            <td class="slt-td">
              <span class="font-mono text-orange-600">{{ truncateText(row.cropCode) }}</span>
            </td>
            <!-- 6. 作物品种（对齐 V1.1 L200-214：优先 subVarietyName → varietyName → cropVariety）-->
            <td class="slt-td" :title="getCropVarietyName(row)">{{ truncateText(getCropVarietyName(row)) }}</td>
            <!-- 7. 品种路径（对齐 V1.1 L554-568：category-type-variety-subVariety 四段式）-->
            <td class="slt-td" :title="getCropVarietyPathText(row)">{{ truncateText(getCropVarietyPathText(row)) }}</td>
            <!-- 8. 育苗区域 -->
            <td class="slt-td" :title="row.siteName || undefined">{{ truncateText(row.siteName) }}</td>
            <!-- 9. 单位 -->
            <td class="slt-td">{{ truncateText(row.unit) }}</td>
            <!-- 10. 初始数量（母株池，对齐 V1.1 L574-576：toLocaleString 千位分隔）-->
            <td class="slt-td slt-num">{{ (row.initialCount || 0).toLocaleString() }}</td>
            <!-- 11. 母株存活数（对齐 V1.1 L577-579：motherPlantCount）-->
            <td class="slt-td slt-num">{{ (row.motherPlantCount || 0).toLocaleString() }}</td>
            <!-- 12. 母株累计损耗（对齐 V1.1 L581-583：motherLossCount）-->
            <td class="slt-td slt-num text-red-600">{{ (row.motherLossCount || 0).toLocaleString() }}</td>
            <!-- 13. 补苗累计（对齐 V1.1 L585-587：replantCount）-->
            <td class="slt-td slt-num text-emerald-600">{{ (row.replantCount || 0).toLocaleString() }}</td>
            <!-- 14. 小苗累计产出（对齐 V1.1 L590-592：expandedPlantCount）-->
            <td class="slt-td slt-num">{{ (row.expandedPlantCount || 0).toLocaleString() }}</td>
            <!-- 15. 小苗累计损耗（对齐 V1.1 L594-596：seedlingLossCount）-->
            <td class="slt-td slt-num text-red-600">{{ (row.seedlingLossCount || 0).toLocaleString() }}</td>
            <!-- 16. 小苗剩余数量（对齐 V1.1 L598-606：expanded - loss - harvest 派生）-->
            <td class="slt-td slt-num text-emerald-600">{{ Math.max(0, (row.expandedPlantCount || 0) - (row.seedlingLossCount || 0) - (row.harvestStockedCount || 0)).toLocaleString() }}</td>
            <!-- 17. 目标成苗数（对齐 V1.1 L609-611）-->
            <td class="slt-td slt-num">{{ (row.targetSurvivalCount ?? 0).toLocaleString() }}</td>
            <!-- 18. 完成比例（对齐 V1.1 L614-625：(累计产出 - 累计损耗) / 目标成苗数）-->
            <td class="slt-td">
              <span v-if="row.targetSurvivalCount > 0" :class="getCompletionRateClass(row)">{{ Math.round(Math.max(0, Math.min((row.expandedPlantCount || 0) - (row.seedlingLossCount || 0), 9.99 * row.targetSurvivalCount) / row.targetSurvivalCount * 100)) }}%</span>
              <span v-else class="text-gray-400">-</span>
            </td>
            <!-- 19. 状态 -->
            <td class="slt-td">
              <div class="flex items-center gap-1.5 justify-center">
                <span class="px-2 py-1 rounded text-xs font-medium" :class="getStatusClass(row.status)">{{ getStatusLabel(row.status) }}</span>
                <span v-if="row.endTime" class="px-2 py-1 rounded text-xs font-medium" :class="row.endType === 'abnormal' ? 'text-red-700 bg-red-100' : 'text-gray-500 bg-gray-100'" :title="`${row.endType === 'abnormal' ? '异常' : '正常'}结束于 ${row.endTime}`">{{ row.endType === 'abnormal' ? '已异常结束' : '已结束' }}</span>
              </div>
            </td>
            <!-- 20. 操作列：sticky right-0，宽度 14% = 336px 容纳所有图标
                 2026-07-21 v3：完全简化 @click 直接调用 onXxx 函数，移除中间函数包装 -->
            <td class="slt-td slt-td-op">
              <div class="flex gap-1 justify-center">
                <button v-if="row.pictures && row.pictures.length > 0" type="button" class="slt-op-btn slt-op-image" title="查看图片" @click.stop="onImageClick(row.pictures)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </button>
                <button type="button" class="slt-op-btn slt-op-record" :class="isEnded(row) ? 'slt-op-ended' : ''" :title="`每日记录${isEnded(row)?'（只读）':''}`" @click.stop="onDailyRecord(row)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </button>
                <button v-if="row.propagationMode === 'one_to_many'" type="button" class="slt-op-btn slt-op-breeding" :class="isEnded(row) ? 'slt-op-ended' : ''" :title="`无性繁殖记录${isEnded(row)?'（只读）':''}`" @click.stop="onPropagation(row)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
                </button>
                <button type="button" class="slt-op-btn slt-op-tag" :title="`标签管理${isEnded(row)?'（只读）':''}`" @click.stop="onLabelManage(row)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                </button>
                <button type="button" class="slt-op-btn slt-op-edit" :class="isEnded(row) ? 'slt-op-disabled' : ''" :title="isEnded(row) ? '已结束，禁止编辑' : '编辑'" :disabled="isEnded(row)" @click.stop="onEdit(row)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>
                </button>
                <button v-if="!row.isHarvestLocked" type="button" class="slt-op-btn slt-op-inbound" :class="{ 'abnormal': row.endType === 'abnormal', 'cancelled': row.status === 'cancelled' }" :title="getInboundTitle(row)" @click.stop="onInbound(row)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                </button>
                <button v-if="!isEnded(row)" type="button" class="slt-op-btn slt-op-end" title="结束" @click.stop="onEnd(row)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 rounded-b-xl">
      <el-pagination
        v-model:current-page="localPagination.current"
        v-model:page-size="localPagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
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
import { ref, computed, watch } from 'vue'
import { Plus, Delete, Download, Printer, Close, Edit } from '@element-plus/icons-vue'
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
  'propagation', 'label-manage', 'operation-mode-change',
  'export-cancel', 'confirm-export', 'print-mode-change', 'confirm-print',
  'export-select-all', 'end', 'inbound', 'daily-record', 'transplant'
])

const localPagination = ref({ current: 1, pageSize: 10, ...props.pagination })
watch(() => props.pagination, (val) => { localPagination.value = { ...val } }, { deep: true })

const selectedIds = computed(() => new Set(props.selectedRows))

const showCheckbox = computed(() => props.operationMode !== 'normal' || props.exportMode || props.printMode)
const currentData = computed(() => {
  const s = (localPagination.value.current - 1) * localPagination.value.pageSize
  return props.data.slice(s, Math.min(s + localPagination.value.pageSize, props.data.length))
})

const isEnded = (r) => (r.status==='completed'||r.status==='abnormal'||r.status==='cancelled'||r.endType==='normal'||r.endType==='abnormal')

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
const handleExportCancel = () => { emit('cancel-export'); emit('update:selected-rows', []) }
const onAdd = () => emit('add')
const onEdit = (row) => emit('edit', row)
const onDetail = (row) => emit('detail', row)
const onDelete = (ids) => {
  // 对齐 V1.1 SeedlingTable.tsx L248-265 executeOperation：emit delete 后立即 reset
  // 否则弹窗打开期间顶部按钮栏仍停留在"已选择 X 项"状态，与 V1.1 行为不一致
  emit('delete', ids)
  emit('operation-mode-change', 'normal')
  emit('update:selected-rows', [])
}
const onImageClick = (images) => { console.log('[SeedlingTable] onImageClick', images); emit('image-click', images) }
const onDailyRecord = (row) => { console.log('[SeedlingTable] onDailyRecord', row.id, row.seedlingCode); emit('daily-record', row) }
const onPropagation = (row) => { console.log('[SeedlingTable] onPropagation', row.id); emit('propagation', row) }
const onLabelManage = (row) => { console.log('[SeedlingTable] onLabelManage', row.id); emit('label-manage', row) }
const onEnd = (row) => { console.log('[SeedlingTable] onEnd', row.id); emit('end', row) }
const onInbound = (row) => { console.log('[SeedlingTable] onInbound', row.id); emit('inbound', row) }
const onConfirmExport = () => emit('confirm-export')
const onOperationModeChange = (mode) => emit('operation-mode-change', mode)
const onPrintModeChange = (val) => emit('print-mode-change', val)
const onExportSelectAll = () => emit('export-select-all')

// 作物品种名（对齐 V1.1 L200-214：优先 subVarietyName → varietyName → cropVariety）
const getCropVarietyName = (record) => record.subVarietyName || record.varietyName || record.cropVariety || record.cropName || '-'
// 品种路径 4 段式（对齐 V1.1 L165-191：category-type-variety-subVariety，用 '-' 分隔）
const getCropVarietyPathText = (record) => {
  const parts = [record.categoryName, record.typeName, record.varietyName, record.subVarietyName].filter(Boolean)
  return parts.length > 0 ? parts.join('-') : (record.cropVariety || '-')
}
const truncateText = (text, maxLen = 16) => { if (text == null || text === '') return '-'; const s = String(text); return s.length <= maxLen ? s : `${s.slice(0, maxLen)}…` }
// 完成比例颜色（对齐 V1.1 L622-624）
const getCompletionRateClass = (record) => {
  if (!record.targetSurvivalCount || record.targetSurvivalCount <= 0) return 'text-gray-400';
  const available = Math.max(0, (record.expandedPlantCount || 0) - (record.seedlingLossCount || 0));
  const ratio = available / record.targetSurvivalCount;
  return ratio >= 0.8 ? 'text-green-600' : ratio >= 0.5 ? 'text-amber-600' : 'text-red-600'
}
// 状态样式（对齐 V1.1 L228-237：6态完整映射）
const getStatusClass = (status) => {
  const map = {
    'sown': 'bg-blue-100 text-blue-700',
    'in_progress': 'bg-amber-100 text-amber-700',
    'transplant_ready': 'bg-emerald-100 text-emerald-700',
    'completed': 'bg-green-100 text-green-700',
    'cancelled': 'bg-gray-100 text-gray-600',
    'abnormal': 'bg-red-100 text-red-700'
  };
  return map[status] || 'bg-gray-100 text-gray-500'
}
// 状态标签（对齐 V1.1 L228-237：6态完整映射）
const getStatusLabel = (status) => {
  const map = {
    'sown': '已播种',
    'in_progress': '生长中',
    'transplant_ready': '待出圃',
    'completed': '已出圃',
    'cancelled': '已取消',
    'abnormal': '异常结束'
  };
  return map[status] || '未知'
}
/** 繁殖模式 label（对齐 V1.1 L529-532）*/
const getPropagationModeLabel = (mode) => mode === 'one_to_many' ? '1:多' : '1:1'
const getPropagationModeClass = (mode) => mode === 'one_to_many' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'

// ========== 2026-07-21 操作列守卫逻辑（严格对齐 V1.1 SeedlingTable.tsx L663-677） ==========
// 写读分离：写操作（编辑/结束）在结束态灰显+禁用；读操作（每日记录/标签/繁殖）始终可用
const isNormalEnded = (r) => r.status === 'completed' || r.endType === 'normal'
const isAbnormalEnded = (r) => r.status === 'abnormal' || r.endType === 'abnormal'
const isCancelled = (r) => r.status === 'cancelled'
// isEnded 函数已在 L250 定义：包含 3 种结束态（normal/abnormal/cancelled）

// 锁定原因文案（对齐 V1.1 L668）
const lockReasonText = (r) => {
  if (isCancelled(r)) return '已取消，禁止编辑/新增'
  if (isNormalEnded(r)) return '已正常结束，禁止编辑/新增'
  return '已异常结束，禁止编辑/新增'
}

// 编辑守卫（对齐 V1.1 L670-677 guardClick）
// 正常结束/已取消 → 弹提示并阻止；异常结束 → 写操作可正常通过
const guardEdit = (r, action) => {
  if (isNormalEnded(r) || isCancelled(r)) {
    ElMessage.warning(lockReasonText(r))
    return
  }
  action && action(r)
}

// 入库按钮样式（对齐 V1.1 L734-738）
const getInboundClass = (r) => {
  if (isAbnormalEnded(r)) return 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
  if (isCancelled(r)) return 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'
  return ''
}

// 入库按钮标题（对齐 V1.1 L739）
const getInboundTitle = (r) => {
  if (isAbnormalEnded(r)) return '出圃入库（补录）'
  if (isCancelled(r)) return '出圃入库（已取消，仅查看）'
  return '出圃入库 / 采收'
}
</script>

<style scoped>
/* ===== 表格 colgroup 基础样式 ===== */
.slt-col { background: transparent; }

/* ===== 表头整行渐变 ===== */
.slt-thead-tr { background: linear-gradient(to right, #3b82f6, #2563eb); color: #ffffff; }

/* ===== 表头单元格 ===== */
.slt-th { padding: 0.75rem 1rem; text-align: left; font-size: 0.875rem; font-weight: 600; white-space: nowrap; color: #ffffff; border-bottom: none; }
.slt-th-check { width: 3rem; }

/* ===== 双池列头（对齐 V1.1 L473-480）====== */
.slt-th-pond { background: rgba(99, 102, 241, 0.3); }
.slt-th-seedling { background: rgba(16, 185, 129, 0.3); }

/* ===== 操作列表头（sticky right-0，对齐 V1.1 + SeedSourceTable）====== */
.slt-th-op { position: sticky; right: 0; background: #1d4ed8; box-shadow: -2px 0 4px rgba(0, 0, 0, 0.15); z-index: 20; }

/* ===== 表格行 ===== */
.slt-tr { border-bottom: 1px solid #d1d5db; transition: background-color 0.15s; }
.slt-tr:hover { background-color: #f9fafb; }

/* ===== 单元格 ===== */
.slt-td { padding: 0.75rem 1rem; font-size: 0.875rem; white-space: nowrap; vertical-align: middle; }
.slt-td-check { width: 3rem; }
.slt-num { text-align: right; color: #2563eb; font-weight: 500; }

/* ===== 操作列固定（sticky right-0，对齐 V1.1 + SeedSourceTable）====== */
.slt-td-op { position: sticky; right: 0; background: #ffffff; box-shadow: -2px 0 4px rgba(0, 0, 0, 0.05); z-index: 10; }
.slt-tr:hover .slt-td-op { background: #f9fafb; }

/* ===== 链接按钮 ===== */
.slt-link { color: #059669; text-decoration: none; font-weight: 500; background: none; border: none; padding: 0; cursor: pointer; font-size: 0.875rem; }
.slt-link:hover { text-decoration: underline; }

/* ===== 操作列按钮（对齐 SeedSourceTable 风格）====== */
.slt-op-btn { width: 32px; height: 32px; padding: 0; border-radius: 6px; border: none; background: transparent; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: background-color 0.15s, color 0.15s; }
.slt-op-image { color: #6b7280; } .slt-op-image:hover { color: #3b82f6; background-color: #eff6ff; }
.slt-op-record { color: #3b82f6; } .slt-op-record:hover { color: #2563eb; background-color: #eff6ff; }
.slt-op-breeding { color: #059669; } .slt-op-breeding:hover { color: #047857; background-color: #ecfdf5; }
.slt-op-tag { color: #9333ea; } .slt-op-tag:hover { color: #7e22ce; background-color: #faf5ff; }
.slt-op-edit { color: #3b82f6; } .slt-op-edit:hover { color: #2563eb; background-color: #eff6ff; }
.slt-op-inbound { color: #f97316; } .slt-op-inbound:hover { color: #ea580c; background-color: #fff7ed; }
.slt-op-inbound.abnormal { color: #6b7280; } .slt-op-inbound.abnormal:hover { color: #2563eb; background-color: #eff6ff; }
.slt-op-inbound.cancelled { color: #9ca3af; } .slt-op-inbound.cancelled:hover { color: #6b7280; background-color: #f3f4f6; }
.slt-op-end { color: #4b5563; } .slt-op-end:hover { color: #374151; background-color: #f3f4f6; }
.slt-op-disabled { color: #9ca3af !important; cursor: not-allowed !important; opacity: 0.4; }
.slt-op-disabled:hover { background-color: transparent !important; color: #9ca3af !important; }
/* 已结束态的读操作按钮（每日记录/繁殖）颜色淡化（对齐 V1.1 text-blue-400 / text-emerald-400）*/
.slt-op-ended { opacity: 0.6; }

/* ===== 顶部按钮 ===== */
.slt-btn-print { background-color: #9333ea !important; border-color: #9333ea !important; color: #ffffff !important; }
.slt-btn-print:hover { background-color: #7e22ce !important; border-color: #7e22ce !important; color: #ffffff !important; }
.slt-btn-export { background-color: #2563eb !important; border-color: #2563eb !important; color: #ffffff !important; }
.slt-btn-export:hover { background-color: #1d4ed8 !important; border-color: #1d4ed8 !important; color: #ffffff !important; }
</style>
