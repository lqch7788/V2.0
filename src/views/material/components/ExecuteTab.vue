<!--
  ExecuteTab - 领料出库 Tab 2 子组件
  从 MaterialReceiving.vue 整体拆分
-->
<template>
  <div class="space-y-4">
    <div class="bg-gray-50 rounded-lg p-4">
      <div class="flex items-end gap-4">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-900 mb-1">出库单号</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="exSearchCode" placeholder="搜索出库单号..." class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-900 mb-1">申领人</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="exSearchApplicant" placeholder="搜索申领人..." class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-900 mb-1">生产计划批次号</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="exSearchBatchCode" placeholder="搜索生产计划批次号..." class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-900 mb-1">库存地点</label>
          <select v-model="exSearchWarehouse" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
            <option value="">全部</option>
            <option v-for="w in warehouses" :key="w" :value="w">{{ w }}</option>
          </select>
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-900 mb-1">执行状态</label>
          <select v-model="exStatusFilter" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
            <option value="all">全部状态</option>
            <option value="已出库">已出库</option>
            <option value="部分出库">部分出库</option>
            <option value="待出库">待出库</option>
            <option value="已取消">已取消</option>
          </select>
        </div>
        <button class="h-8 px-3 rounded-md text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 inline-flex items-center gap-1" @click="exSearchCode = ''; exSearchApplicant = ''; exSearchBatchCode = ''; exSearchWarehouse = ''; exStatusFilter = 'all'"><RotateCcw class="w-4 h-4" />重置</button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">出库单列表</h3>
        <div class="flex gap-2">
          <button class="h-8 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="handleOpenExAdd"><Plus class="w-4 h-4" />新增</button>
          <button v-if="!exBatchEditMode" class="h-8 px-3 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="exBatchEditMode = 'edit'; exSelectedRows = []"><Pencil class="w-4 h-4" />编辑</button>
          <button v-if="!exBatchEditMode" class="h-8 px-3 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1" @click="exBatchEditMode = 'delete'; exSelectedRows = []"><Trash2 class="w-4 h-4" />删除</button>
          <button v-if="!exBatchEditMode" class="h-8 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="exExportMode = true; exSelectedRows = []"><Download class="w-4 h-4" />导出</button>
          <button v-if="exBatchEditMode === 'edit' && exSelectedRows.length > 0" class="h-8 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="exShowBatchEditModal = true">确认编辑 ({{ exSelectedRows.length }}条)</button>
          <button v-if="exBatchEditMode === 'delete' && exSelectedRows.length > 0" class="h-8 px-3 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1" @click="exShowBatchDeleteConfirm = true">确认删除 ({{ exSelectedRows.length }}条)</button>
          <button v-if="exBatchEditMode || exExportMode" class="h-8 px-3 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-1" @click="exBatchEditMode = null; exExportMode = false; exSelectedRows = []">取消</button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <tr>
              <th v-if="exBatchEditMode || exExportMode" class="px-4 py-3 text-left text-sm font-semibold w-14 whitespace-nowrap">
                <input type="checkbox" :checked="paginatedExecuteData.length > 0 && exSelectedRows.length === paginatedExecuteData.length" @change="toggleExSelectAll" class="w-4 h-4 rounded border-white" />
              </th>
              <th class="px-4 py-3 text-left text-sm font-semibold w-12 whitespace-nowrap"></th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">出库单号</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">申请日期</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">申请人</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">库存地点</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">审核人</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作人</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">生产计划批次号</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">执行状态</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr v-if="paginatedExecuteData.length === 0">
              <td :colspan="(exBatchEditMode || exExportMode) ? 11 : 10" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
            </tr>
            <template v-for="row in paginatedExecuteData" :key="row.id">
              <tr class="hover:bg-blue-100 transition-colors">
                <td v-if="exBatchEditMode || exExportMode" class="px-4 py-3">
                  <input type="checkbox" :checked="exSelectedRows.includes(row.id)" @change="toggleExRow(row.id)" class="w-4 h-4 rounded border-gray-400" />
                </td>
                <td class="px-4 py-3">
                  <button class="text-gray-500 hover:text-blue-600 p-1" @click="toggleExExpandRow(row.id)">
                    <ChevronDown v-if="exExpandedRowsId.includes(row.id)" class="w-4 h-4" />
                    <ChevronRight v-else class="w-4 h-4" />
                  </button>
                </td>
                <td class="px-4 py-3 text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-700 whitespace-nowrap" @click="handleExViewDetail(row)">{{ row.code }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.date }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.applicant }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.warehouseLocation }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.reviewer }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.operator }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.productionBatchCode }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="getExStatusClass(row.executeStatus)">{{ row.executeStatus }}</span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="flex items-center gap-1">
                    <button class="text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 p-1" @click="handleExViewDetail(row)" title="查看">
                      <Eye class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="exExpandedRowsId.includes(row.id)" class="bg-white">
                <td :colspan="(exBatchEditMode || exExportMode) ? 11 : 10" class="px-4 py-3">
                  <div class="text-sm">
                    <div class="font-medium text-blue-800 mb-2">物料明细</div>
                    <div class="overflow-x-auto rounded-lg border border-gray-200">
                      <table class="w-full text-xs">
                        <thead class="bg-[#F2F6FA]">
                          <tr>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">来源领料单号</th>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">物料编码</th>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">物料名称</th>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">批次号</th>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">规格</th>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">单位</th>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">申请数量</th>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">实际库存</th>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">本次实发</th>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">单价(元)</th>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">小计(元)</th>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">仓库货位</th>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">差异</th>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">备注</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                          <tr v-for="m in row.materials" :key="m.materialCode" class="hover:bg-[#F2F6FA]/50">
                            <td class="px-3 py-2 text-sm text-blue-800 font-mono whitespace-nowrap">{{ m.applicationCode }}</td>
                            <td class="px-3 py-2 text-sm text-blue-800 font-mono whitespace-nowrap">{{ m.materialCode }}</td>
                            <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.materialName }}</td>
                            <td class="px-3 py-2 text-sm text-blue-800 font-mono whitespace-nowrap">{{ m.batchNo || '' }}</td>
                            <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.spec }}</td>
                            <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.unit }}</td>
                            <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.requestedQuantity }}</td>
                            <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">
                              <span :class="m.stockQuantity < m.requestedQuantity ? 'text-red-600 font-medium' : 'text-green-600'">{{ m.stockQuantity }}</span>
                            </td>
                            <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">
                              <span v-if="m.actualQuantity > 0" :class="m.actualQuantity < m.requestedQuantity ? 'text-amber-600 font-medium' : 'text-green-600'">{{ m.actualQuantity }}</span>
                              <span v-else :class="m.stockQuantity === 0 ? 'text-red-600 font-medium' : 'text-gray-400'">{{ m.actualQuantity }}</span>
                            </td>
                            <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ (m.unitPrice || 0).toFixed(2) }}</td>
                            <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ ((m.requestedQuantity || 0) * (m.unitPrice || 0)).toFixed(2) }}</td>
                            <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.warehousePosition || '-' }}</td>
                            <td class="px-3 py-2 text-sm whitespace-nowrap">
                              <span v-if="(m.requestedQuantity || 0) - (m.actualQuantity || 0) > 0" class="text-red-600 font-medium">-{{ (m.requestedQuantity || 0) - (m.actualQuantity || 0) }}</span>
                              <span v-else class="text-green-600">0</span>
                            </td>
                            <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.remark }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <span class="text-sm text-gray-500">共 {{ exFilteredData.length }} 条记录</span>
        <el-pagination
          v-model:current-page="exCurrentPage"
          :total="exFilteredData.length"
          v-model:page-size="exPageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="() => { exCurrentPage = 1 }"
        />
      </div>
    </div>

    <!-- ============ 出库 - 详情弹窗 ============ -->
    <ExecuteDetailModal :is-open="exShowDetailModal" :record="exSelectedRecord" @close="exShowDetailModal = false" />
    <!-- ============ 出库 - 新增弹窗 ============ -->
    <ExecuteAddModal :is-open="exShowAddModal" @close="exShowAddModal = false" />
    <!-- ============ 出库 - 编辑弹窗 ============ -->
    <ExecuteEditModal :is-open="exShowEditModal" @close="exShowEditModal = false" />
    <!-- ============ 出库 - 删除确认弹窗 ============ -->
    <DeleteWarningModal v-model:is-open="exShowDeleteConfirm" :selected-count="1" title="删除出库单警告" @close="exShowDeleteConfirm = false" @confirm="confirmExDelete" />
    <!-- ============ 出库导出弹窗 ============ -->
    <ExportFormatModal v-model:visible="exShowExportTypeModal" :export-file-type="exExportFileType" :selected-count="exSelectedRows.length" @update:export-file-type="(val) => exExportFileType = val" @confirm="confirmExExport" />
    <!-- ============ 出库 - 批量编辑弹窗 ============ -->
    <ExecuteBatchEditModal :is-open="exShowBatchEditModal" @close="exShowBatchEditModal = false" />
    <!-- ============ 出库 - 批量删除确认弹窗 ============ -->
    <DeleteWarningModal v-model:is-open="exShowBatchDeleteConfirm" :selected-count="exSelectedRows.length" title="批量删除出库单" @close="exShowBatchDeleteConfirm = false" @confirm="handleExBatchDelete" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Pencil, Trash2, Download, ChevronDown, ChevronRight, RotateCcw, Search, Eye } from 'lucide-vue-next'
import ExecuteDetailModal from './ExecuteDetailModal.vue'
import ExecuteAddModal from '@/components/materialReceiving/modals/ExecuteAddModal.vue'
import ExecuteEditModal from '@/components/materialReceiving/modals/ExecuteEditModal.vue'
import ExecuteBatchEditModal from '@/components/materialReceiving/modals/ExecuteBatchEditModal.vue'
import DeleteWarningModal from '@/components/materialReceiving/modals/DeleteWarningModal.vue'
import ExportFormatModal from '@/components/materialReceiving/modals/ExportTypeModal.vue'
import { getExecuteList, createExecute as apiCreateExe, updateExecute as apiUpdateExe, deleteExecute as apiDeleteExe } from '@/api/material/apiMaterialRequestService'
import { warehouses, getExStatusClass } from '../utils/materialReceivingConfig'

const mapExRecord = (r) => ({
  id: r.id || r.code, code: r.code || '', date: r.date || '', applicant: r.applicant || '',
  warehouseLocation: r.warehouse_location || r.warehouseLocation || '', reviewer: r.reviewer || '',
  operator: r.operator || '', productionBatchCode: r.production_batch_code || r.productionBatchCode || '',
  sourceApplicationCodes: Array.isArray(r.source_application_codes) ? r.source_application_codes : (typeof r.source_application_codes === 'string' ? JSON.parse(r.source_application_codes || '[]') : []),
  executeStatus: r.execute_status || r.executeStatus || '已出库',
  executeStatusClass: r.execute_status_class || r.executeStatusClass || 'completed',
  materials: Array.isArray(r.materials) ? r.materials : (typeof r.materials === 'string' ? JSON.parse(r.materials || '[]') : [])
})

const executeData = ref([])
const isLoadingEx = ref(false)
const loadExecuteData = async () => {
  isLoadingEx.value = true
  try { const res = await getExecuteList(); executeData.value = (res || []).map(mapExRecord) }
  catch { }
  finally { isLoadingEx.value = false }
}

const exSearchCode = ref(''); const exSearchApplicant = ref(''); const exSearchBatchCode = ref('')
const exSearchWarehouse = ref(''); const exStatusFilter = ref('all')
const exCurrentPage = ref(1); const exPageSize = ref(10)
const exSelectedRows = ref([]); const exBatchEditMode = ref(null)
const exExportMode = ref(false); const exShowDetailModal = ref(false)
const exShowAddModal = ref(false); const exShowEditModal = ref(false)
const exShowDeleteConfirm = ref(false); const exShowBatchEditModal = ref(false)
const exShowBatchDeleteConfirm = ref(false); const exShowExportTypeModal = ref(false)
const exExportFileType = ref('xlsx'); const exSelectedRecord = ref(null)
const exExpandedRowsId = ref([])

const exFilteredData = computed(() => {
  return executeData.value.filter(item => {
    if (exSearchCode.value && !item.code.toLowerCase().includes(exSearchCode.value.toLowerCase())) return false
    if (exSearchApplicant.value && !item.applicant.toLowerCase().includes(exSearchApplicant.value.toLowerCase())) return false
    if (exSearchBatchCode.value && !item.productionBatchCode.toLowerCase().includes(exSearchBatchCode.value.toLowerCase())) return false
    if (exSearchWarehouse.value && !item.warehouseLocation.toLowerCase().includes(exSearchWarehouse.value.toLowerCase())) return false
    if (exStatusFilter.value !== 'all' && item.executeStatus !== exStatusFilter.value) return false
    return true
  })
})

const paginatedExecuteData = computed(() => {
  const start = (exCurrentPage.value - 1) * exPageSize.value
  return exFilteredData.value.slice(start, start + exPageSize.value)
})

const toggleExSelectAll = () => {
  if (exSelectedRows.value.length === paginatedExecuteData.value.length) {
    const pageIds = new Set(paginatedExecuteData.value.map(r => r.id))
    exSelectedRows.value = exSelectedRows.value.filter(id => !pageIds.has(id))
  } else {
    const currentIds = new Set(exSelectedRows.value)
    const newRows = paginatedExecuteData.value.filter(r => !currentIds.has(r.id))
    exSelectedRows.value = [...exSelectedRows.value, ...newRows.map(r => r.id)]
  }
}

const toggleExRow = (id) => {
  const idx = exSelectedRows.value.indexOf(id)
  if (idx > -1) exSelectedRows.value.splice(idx, 1)
  else exSelectedRows.value.push(id)
}

const toggleExExpandRow = (id) => {
  const idx = exExpandedRowsId.value.indexOf(id)
  if (idx > -1) exExpandedRowsId.value.splice(idx, 1)
  else exExpandedRowsId.value.push(id)
}

const handleExViewDetail = (row) => { exSelectedRecord.value = row; exShowDetailModal.value = true }
const handleOpenExAdd = () => { exShowAddModal.value = true }

const confirmExDelete = async () => {
  // 通过模态内部记录 id 删除
  try { await apiDeleteExe(exSelectedRecord.value?.id); await loadExecuteData() } catch {}
  exShowDeleteConfirm.value = false
}

const confirmExExport = () => {
  const exportData = exSelectedRows.value.length > 0 ? executeData.value.filter(item => exSelectedRows.value.includes(item.id)) : exFilteredData.value
  const headers = ['出库单号', '日期', '申领人', '仓库地点', '审核人', '操作人', '生产批次号', '执行状态']
  const fields = ['code', 'date', 'applicant', 'warehouseLocation', 'reviewer', 'operator', 'productionBatchCode', 'executeStatus']
  const content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(r => `<tr>${fields.map(f => `<td>${r[f] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
  const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `出库_${new Date().toISOString().slice(0,10)}.xlsx`
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  exShowExportTypeModal.value = false; exExportMode.value = false; exSelectedRows.value = []
}

const handleExBatchDelete = async () => {
  try {
    for (const id of exSelectedRows.value) { await apiDeleteExe(id) }
    exShowBatchDeleteConfirm.value = false; exBatchEditMode.value = null; exSelectedRows.value = []
    await loadExecuteData()
  } catch {}
}

onMounted(() => { loadExecuteData() })
</script>
