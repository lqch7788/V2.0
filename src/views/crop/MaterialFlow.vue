<template>
  <div class="space-y-4">
    <div class="bg-white rounded-xl p-6 shadow-sm flex items-center gap-3">
      <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
        <TrendingUp :size="24" class="text-white" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">流转追溯</h1>
        <p class="text-gray-500 text-sm">全链路物料流转记录与统计分析</p>
      </div>
    </div>
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 px-6 pt-4 pb-4">
      <div class="border-b border-gray-200">
        <div :class="['flex items-center px-3 py-0.5 transition-colors', activeTab === 'logs' ? 'bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50' : 'bg-gray-50/50']">
          <button @click="activeTab = 'logs'" :class="['relative py-3 text-sm font-semibold rounded-none flex items-center gap-1.5 px-3', activeTab === 'logs' ? 'text-emerald-700' : 'text-gray-600 hover:text-emerald-600']">
            <Package :size="16" />流转记录<span class="ml-2 text-xs font-normal text-gray-400">全部物料流转原始明细</span>
            <div v-if="activeTab === 'logs'" class="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-500 rounded-full" />
          </button>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 bg-gray-50/70 border-t border-gray-100">
          <span class="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1"><span class="text-gray-300">└</span>基于以上数据</span>
          <div class="flex items-center gap-1">
            <button v-for="t in subTabs" :key="t.key" @click="activeTab = t.key" :title="t.hint" :class="['relative py-1.5 px-3 text-sm font-bold rounded-md transition-all flex items-center gap-1', activeTab === t.key ? `${t.bg} ${t.text} border ${t.border} shadow-sm` : 'text-gray-500 hover:text-gray-700 hover:bg-white/60 border border-transparent']">
              <component :is="t.icon" :size="16" />{{ t.label }}
            </button>
          </div>
        </div>
      </div>
      <div class="py-4">
        <div v-if="activeTab === 'logs'">
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
            <div class="flex items-end gap-4 flex-wrap">
              <div><label class="text-sm text-gray-700 block mb-1">流转类型</label><el-select v-model="flowType" placeholder="请选择" class="!w-[150px]" @change="handleSearch"><el-option v-for="o in FLOW_TYPE_OPTIONS" :key="o.value" :label="o.label" :value="o.value" /></el-select></div>
              <div class="flex-1 min-w-[150px]"><label class="text-sm text-gray-700 block mb-1">开始日期</label><el-date-picker v-model="startDate" type="date" placeholder="开始日期" value-format="YYYY-MM-DD" class="!w-full" /></div>
              <div class="flex-1 min-w-[150px]"><label class="text-sm text-gray-700 block mb-1">结束日期</label><el-date-picker v-model="endDate" type="date" placeholder="结束日期" value-format="YYYY-MM-DD" class="!w-full" /></div>
              <div class="flex-1 min-w-[150px]"><label class="text-sm text-gray-700 block mb-1">作物</label><el-input v-model="cropName" placeholder="品种名模糊搜索" clearable /></div>
              <div class="flex gap-2"><el-button type="primary" @click="handleSearch"><Search :size="16" class="mr-1" />查询</el-button><el-button @click="handleReset"><RotateCw :size="16" class="mr-1" />重置</el-button></div>
            </div>
          </div>
          <MFlowToolbar title="流转记录列表" :delete-mode="deleteMode" :export-mode="exportMode" :selected-ids="selectedIds" :is-stats-tab="false" @delete="onDelete" @export="onExport" @confirm-delete="onConfirmDelete" @cancel-delete="onCancelSel" @confirm-export="onConfirmExport" @cancel-export="onCancelSel" />
          <MFlowLogsTable :data="pagedData" :loading="loading && logs.length === 0" :has-mode="effectiveHasActiveMode" :all-selected="allSelected" :some-selected="someSelected" :selected-ids="selectedIds" @toggle-row="toggleRow" @toggle-all="toggleAll" @view-inv="onViewInv" />
          <MFlowPagination :total="activeTab === 'logs' ? total : currentRows.length" :page="page" :page-size="pageSize" @page-change="setPage" @size-change="setPageSize" />
        </div>
        <div v-else-if="activeTab === 'trace'">
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
            <div class="flex items-end gap-4 flex-wrap">
              <div class="flex-1 min-w-[200px]"><label class="text-sm text-gray-700 block mb-1">批次号<span class="text-gray-400 text-xs ml-2">输入种源/育苗/种植/计划编码，追溯完整流转链路</span></label><el-input v-model="traceCode" placeholder="如: ZZ20260630-001" clearable @keyup.enter="handleTrace" /></div>
              <el-button type="primary" @click="handleTrace"><Search :size="16" class="mr-1" />追溯</el-button>
            </div>
          </div>
          <MFlowToolbar title="批次追溯结果" :delete-mode="deleteMode" :export-mode="exportMode" :selected-ids="selectedIds" :is-stats-tab="false" @delete="onDelete" @export="onExport" @confirm-delete="onConfirmDelete" @cancel-delete="onCancelSel" @confirm-export="onConfirmExport" @cancel-export="onCancelSel" />
          <MFlowTraceTable :data="pagedData" :loading="loading && traceData.length === 0" :has-mode="effectiveHasActiveMode" :all-selected="allSelected" :some-selected="someSelected" :selected-ids="selectedIds" @toggle-row="toggleRow" @toggle-all="toggleAll" @view-inv="onViewInv" />
          <MFlowPagination :total="activeTab === 'logs' ? total : currentRows.length" :page="page" :page-size="pageSize" @page-change="setPage" @size-change="setPageSize" />
        </div>
        <div v-else-if="activeTab === 'seedling'">
          <MFlowToolbar :title="statTitle('育苗用料统计')" :delete-mode="deleteMode" :export-mode="exportMode" :selected-ids="selectedIds" :is-stats-tab="true" :stat-year="statYear" @delete="onDelete" @export="onExport" @confirm-delete="onConfirmDelete" @cancel-delete="onCancelSel" @confirm-export="onConfirmExport" @cancel-export="onCancelSel" />
          <MFlowStatsTable :data="pagedData" :loading="loading && pagedData.length === 0" :headers="SEEDLING_HEADERS" :row-mapper="seedlingRow" />
          <MFlowPagination :total="activeTab === 'logs' ? total : currentRows.length" :page="page" :page-size="pageSize" @page-change="setPage" @size-change="setPageSize" />
        </div>
        <div v-else-if="activeTab === 'planting'">
          <MFlowToolbar :title="statTitle('种植用料统计')" :delete-mode="deleteMode" :export-mode="exportMode" :selected-ids="selectedIds" :is-stats-tab="true" :stat-year="statYear" @delete="onDelete" @export="onExport" @confirm-delete="onConfirmDelete" @cancel-delete="onCancelSel" @confirm-export="onConfirmExport" @cancel-export="onCancelSel" />
          <MFlowStatsTable :data="pagedData" :loading="loading && pagedData.length === 0" :headers="PLANTING_HEADERS" :row-mapper="plantingRow" />
          <MFlowPagination :total="activeTab === 'logs' ? total : currentRows.length" :page="page" :page-size="pageSize" @page-change="setPage" @size-change="setPageSize" />
        </div>
        <div v-else-if="activeTab === 'annual'">
          <MFlowToolbar :title="statTitle('年度总览')" :delete-mode="deleteMode" :export-mode="exportMode" :selected-ids="selectedIds" :is-stats-tab="true" :stat-year="statYear" @delete="onDelete" @export="onExport" @confirm-delete="onConfirmDelete" @cancel-delete="onCancelSel" @confirm-export="onConfirmExport" @cancel-export="onCancelSel" />
          <MFlowStatsTable :data="pagedData" :loading="loading && pagedData.length === 0" :headers="ANNUAL_HEADERS" :row-mapper="annualRow" />
          <MFlowPagination :total="activeTab === 'logs' ? total : currentRows.length" :page="page" :page-size="pageSize" @page-change="setPage" @size-change="setPageSize" />
        </div>
      </div>
    </div>
    <DeleteWarningModal :is-open="showDeleteModal" :selected-count="selectedIds.length" title="⚠️ 确认删除流转记录" :description="`确定要删除 ${selectedIds.length} 条流转记录吗？此操作不可恢复。`" @update:is-open="showDeleteModal = $event" @confirm="onDeleteConfirmed" />
    <MFlowExportModal :is-open="showExportModal" :selected-count="selectedIds.length" :total-count="currentRows.length" @update:is-open="showExportModal = $event" @confirm="onDoExport" />
    <el-dialog v-model="detailOpen" title="库存详情" width="600px" append-to-body><div v-if="detailInstanceId" class="text-sm"><p>实例ID: <code>{{ detailInstanceId }}</code></p></div></el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Search, TrendingUp, Package, BarChart3, RotateCw } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { useMaterialFlowStore } from '@/stores/modules/materialFlow'
import DeleteWarningModal from '@/components/common/DeleteWarningModal.vue'
import MFlowToolbar from './material-flow/MFlowToolbar.vue'
import MFlowLogsTable from './material-flow/MFlowLogsTable.vue'
import MFlowTraceTable from './material-flow/MFlowTraceTable.vue'
import MFlowStatsTable from './material-flow/MFlowStatsTable.vue'
import MFlowPagination from './material-flow/MFlowPagination.vue'
import MFlowExportModal from './material-flow/MFlowExportModal.vue'
import * as XLSX from 'xlsx'

// V1.1 constants 1:1
const FLOW_TYPE_OPTIONS = [{ value: 'all', label: '全部流转' },{ value: 'planting→seed_source', label: '种植→种源' },{ value: 'seed_source→seedling', label: '种源→育苗' },{ value: 'seed_source→planting', label: '种源→种植' },{ value: 'seedling→planting', label: '育苗→种植' },{ value: 'plan→seed_source', label: '计划→种源' },{ value: 'correction', label: '修正' },{ value: 'inventory→external', label: '库存→出库' },{ value: 'inventory→freeze', label: '库存→冻结' },{ value: 'inventory→planting', label: '库存→种植' },{ value: 'external→planting', label: '外部→种植' },{ value: 'seedling→harvest', label: '育苗→采收' },{ value: 'external→seedling', label: '外部→育苗' }]
const FLOW_TYPE_LABELS = { 'seed_source→seedling':'种源→育苗','seed_source→planting':'种源→种植','seedling→planting':'育苗→种植','planting→harvest':'种植→采收','seedling→harvest':'育苗→采收','inventory→external':'库存→出库','inventory→planting':'库存→种植','inventory→seedling':'库存→育苗','inventory→seed_source':'库存→种源','external→planting':'外部→种植','external→seedling':'外部→育苗','seed_source→harvest':'种源→采收','correction':'修正','manual_correction':'手动修正','plan→seed_source':'计划→种源','planting→seed_source':'种植→种源','inventory→freeze':'库存→冻结','harvest→inventory':'采收→入库','other':'其他' }
const _FLOW_TYPE_COLOR = { 'seed_source→seedling':'bg-blue-500','seed_source→planting':'bg-indigo-500','seed_source→harvest':'bg-blue-600','seedling→planting':'bg-emerald-500','seedling→harvest':'bg-emerald-600','planting→harvest':'bg-orange-500','inventory→external':'bg-red-500','inventory→planting':'bg-cyan-500','inventory→seedling':'bg-cyan-600','inventory→seed_source':'bg-cyan-700','external→planting':'bg-purple-500','external→seedling':'bg-purple-600','correction':'bg-gray-500','manual_correction':'bg-gray-500','plan→seed_source':'bg-sky-500','planting→seed_source':'bg-teal-500','inventory→freeze':'bg-rose-500','harvest→inventory':'bg-orange-600','other':'bg-slate-500' }
const CATEGORY_LABELS = { external_purchase:'外购',self_produced:'自产',breeding:'育种',external_seed:'外部种子',seed_saving:'自留种',asexual:'无性繁殖',grafting:'嫁接',tissue_culture:'组培',cutting:'扦插',division:'分株',layering:'压条',bulb:'种球',external:'外部',manual:'手动',gift:'赠送',transfer:'调拨',planting:'种植',other:'其他' }
const TYPE_LABELS = { seed_source:'种源',seedling:'育苗',planting:'种植',harvest:'采收',plan:'计划',inventory:'库存',inventory_stock:'库存',seed:'种源',external_seed:'外部种',external:'外部',internal_planting:'内部种植',transfer_out:'调拨出库',correction:'修正',manual_freeze:'手动冻结',order:'订单冻结',customer_sale:'客户销售' }
const CODE_PREFIX_TYPE = { SS:'种源',SD:'育苗',PL:'种植',HS:'采收',YM:'育苗',ZZ:'计划',EXT:'外部',STG:'阶段',R:'区域',F:'农场',P:'区域',DEL:'删除',D:'调试' }
const TYPE_BADGE_COLOR = { '种源':'bg-blue-100 text-blue-700','育苗':'bg-emerald-100 text-emerald-700','种植':'bg-indigo-100 text-indigo-700','采收':'bg-orange-100 text-orange-700','计划':'bg-sky-100 text-sky-700','库存':'bg-cyan-100 text-cyan-700','外部种':'bg-purple-100 text-purple-700','外部':'bg-purple-100 text-purple-700','内部种植':'bg-teal-100 text-teal-700','调拨出库':'bg-rose-100 text-rose-700','手动冻结':'bg-blue-100 text-blue-700','订单冻结':'bg-purple-100 text-purple-700','客户销售':'bg-emerald-100 text-emerald-700','阶段':'bg-slate-100 text-slate-700','区域':'bg-slate-100 text-slate-700','农场':'bg-slate-100 text-slate-700','删除':'bg-rose-100 text-rose-700','调试':'bg-gray-200 text-gray-700' }
const labelFlowType = (v) => FLOW_TYPE_LABELS[v] || v || '-'
const labelCategory = (v) => CATEGORY_LABELS[v] || v || '-'
const _badgeOf = (type, code) => { let l = type ? (TYPE_LABELS[type]||null) : null; if(!l && code){ const m=String(code).match(/^([A-Z]{2,3})/); if(m) l=CODE_PREFIX_TYPE[m[1]]||null } return { label:l, color:l?(TYPE_BADGE_COLOR[l]||'bg-gray-100 text-gray-600'):'bg-gray-100 text-gray-500' } }
const SEEDLING_HEADERS = [{key:'targetCode',label:'育苗批次号'},{key:'cropName',label:'作物'},{key:'sourceCategory',label:'来源'},{key:'totalQty',label:'总用量'},{key:'sourceUnit',label:'单位'}]
const PLANTING_HEADERS = [{key:'targetCode',label:'种植批次号'},{key:'cropName',label:'作物'},{key:'flowType',label:'方式'},{key:'sourceCategory',label:'来源'},{key:'totalQty',label:'消耗量'},{key:'sourceUnit',label:'单位'}]
const ANNUAL_HEADERS = [{key:'flowType',label:'流转环节'},{key:'cropName',label:'作物'},{key:'sourceCode',label:'来源批次'},{key:'targetCode',label:'去向批次'},{key:'sourceCategory',label:'来源类型'},{key:'flowCount',label:'流转次数'},{key:'totalQty',label:'总量'},{key:'unit',label:'单位'}]
const todayLocal = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }

const store = useMaterialFlowStore()

const activeTab = ref('logs')
const page = ref(1)
const pageSize = ref(20)
const flowType = ref('all')
const cropName = ref('')
const startDate = ref('')
const endDate = ref('')
const traceCode = ref('')
const statYear = ref(new Date().getFullYear())
const deleteMode = ref(false)
const exportMode = ref(false)
const selectedIds = ref([])
const showDeleteModal = ref(false)
const showExportModal = ref(false)
const detailInstanceId = ref(null)
const detailOpen = ref(false)

const subTabs = [
  { key:'trace', label:'批次追溯', icon:Search, hint:'按批次号追踪完整链路', bg:'bg-blue-50', border:'border-blue-200', text:'text-blue-700' },
  { key:'seedling', label:'育苗用料', icon:BarChart3, hint:'种源→育苗消耗统计', bg:'bg-emerald-50', border:'border-emerald-200', text:'text-emerald-700' },
  { key:'planting', label:'种植用料', icon:BarChart3, hint:'种源/种苗→种植消耗统计', bg:'bg-amber-50', border:'border-amber-200', text:'text-amber-700' },
  { key:'annual', label:'年度总览', icon:TrendingUp, hint:'全链路年度汇总', bg:'bg-purple-50', border:'border-purple-200', text:'text-purple-700' }
]

const isStatsTab = computed(() => ['seedling','planting','annual'].includes(activeTab.value))
const effectiveHasActiveMode = computed(() => isStatsTab.value ? false : (deleteMode.value || exportMode.value))
const currentRows = computed(() => { if(activeTab.value==='logs') return store.logs; if(activeTab.value==='trace') return store.traceData; return store.statsData })
const pagedData = computed(() => { if(activeTab.value==='logs') return currentRows.value; const s=(page.value-1)*pageSize.value; return currentRows.value.slice(s,s+pageSize.value) })
const allSelected = computed(() => !isStatsTab.value && pagedData.value.length>0 && selectedIds.value.length===pagedData.value.length)
const someSelected = computed(() => !isStatsTab.value && selectedIds.value.length>0 && !allSelected.value)
const keyOf = (item, idx) => item.id || `__idx_${idx}`
const toggleRow = (id) => { selectedIds.value = selectedIds.value.includes(id) ? selectedIds.value.filter(x=>x!==id) : [...selectedIds.value,id] }
const toggleAll = () => { selectedIds.value = allSelected.value ? [] : pagedData.value.map((r,i)=>keyOf(r,i)) }
const cancelSel = () => { deleteMode.value=false; exportMode.value=false; selectedIds.value=[] }
const setPage = (p) => { page.value = p }
const setPageSize = (s) => { pageSize.value=s; page.value=1 }
const handleSearch = () => { page.value=1; cancelSel(); store.loadLogs({page:1,pageSize:pageSize.value,flowType:flowType.value==='all'?undefined:flowType.value,cropName:cropName.value,startDate:startDate.value,endDate:endDate.value}) }
const handleReset = () => { flowType.value='all'; cropName.value=''; startDate.value=''; endDate.value=''; page.value=1; cancelSel(); store.loadLogs({page:1,pageSize:pageSize.value}) }
const handleTrace = () => { if(traceCode.value.trim()) store.loadTrace(traceCode.value.trim()) }
const statTitle = (t) => t

// toolbar events
const onDelete = () => { if(isStatsTab.value){ ElMessage.warning('当前为统计聚合视图，无单条ID可删。请到"流转记录"tab筛选对应流水后删除。'); return } deleteMode.value=true; exportMode.value=false; selectedIds.value=[] }
const onExport = () => { exportMode.value=true; deleteMode.value=false; selectedIds.value=[] }
const onConfirmDelete = () => { if(selectedIds.value.length===0){ ElMessage.warning('请先选择要删除的记录'); return } showDeleteModal.value=true }
const onConfirmExport = () => { if(selectedIds.value.length===0){ ElMessage.warning('请先选择要导出的数据'); return } showExportModal.value=true }
const onCancelSel = () => cancelSel()
const onViewInv = (code) => { detailInstanceId.value=code; detailOpen.value=true }
const onDeleteConfirmed = async () => { await store.batchDeleteLogs(selectedIds.value); showDeleteModal.value=false; cancelSel(); store.loadLogs({page:page.value,pageSize:pageSize.value,flowType:flowType.value==='all'?undefined:flowType.value,cropName:cropName.value,startDate:startDate.value,endDate:endDate.value}) }
const seedlingRow = (i) => ({ targetCode:i.targetCode??i.target_code??'-', cropName:i.cropName, sourceCategory:labelCategory(i.sourceCategory), totalQty:Number(i.totalQty??i.total_qty??0).toLocaleString(), sourceUnit:i.sourceUnit||'-' })
const plantingRow = (i) => ({ targetCode:i.targetCode??i.target_code??'-', cropName:i.cropName, flowType:i.flowType==='seed_source→planting'?'直接播种':'育苗移栽', sourceCategory:labelCategory(i.sourceCategory), totalQty:Number(i.totalQty??i.total_qty??0).toLocaleString(), sourceUnit:i.sourceUnit||'-' })
const annualRow = (i) => ({ flowType:labelFlowType(i.flowType), cropName:i.cropName, sourceCode:i.sourceCode??i.source_code??'-', targetCode:i.targetCode??i.target_code??'-', sourceCategory:labelCategory(i.sourceCategory), flowCount:i.flowCount??i.flow_count??0, totalQty:Number(i.totalQty??i.total_qty??0).toLocaleString(), unit:i.unit||'-' })

const onDoExport = (fmt) => {
  const src = selectedIds.value.length>0 ? currentRows.value.filter((r,i)=>selectedIds.value.includes(keyOf(r,i))) : currentRows.value
  if(src.length===0) return
  let headers, title
  if(activeTab.value==='logs'){ headers={createdAt:'时间',flowType:'流转类型',cropName:'作物',sourceCode:'起点',sourceQuantity:'消耗量',targetCode:'去向',targetQuantity:'产出量',sourceCategory:'来源'}; title='物料流转记录' }
  else if(activeTab.value==='trace'){ headers={createdAt:'时间',flowType:'流转',sourceCode:'起点',sourceQuantity:'消耗',targetCode:'去向',sourceCategory:'来源'}; title='批次追溯' }
  else{ title={seedling:'育苗用料',planting:'种植用料',annual:'年度总览'}[activeTab.value]; headers={seedling:{cropName:'作物',sourceCategory:'来源',totalQty:'总用量',sourceUnit:'单位',batchCount:'批次数'},planting:{cropName:'作物',flowType:'方式',sourceCategory:'来源',totalQty:'消耗量',sourceUnit:'单位'},annual:{flowType:'流转环节',cropName:'作物',flowCount:'流转次数',totalQty:'总量',unit:'单位'}}[activeTab.value] }
  const rows = src.map(r => { const o={}; Object.entries(headers).forEach(([k,l]) => o[l]= r[k] ? (k==='flowType'?labelFlowType(r[k]):k==='sourceCategory'?labelCategory(r[k]):r[k]) : '' ); return o })
  const today = todayLocal().replace(/-/g,'')
  const filename = `${title}_${today}_${rows.length}条.${fmt==='excel'?'xlsx':fmt}`
  if(fmt==='excel'){ const ws=XLSX.utils.json_to_sheet(rows); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,title); XLSX.writeFile(wb,filename) }
  else if(fmt==='csv'){ const hdr=Object.values(headers); const csv='﻿'+[hdr.map(h=>`"${h}"`).join(','),...rows.map(r=>hdr.map(h=>`"${String(r[h]??'').replace(/"/g,'""')}"`).join(','))].join('\n'); const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click(); URL.revokeObjectURL(a.href) }
  showExportModal.value=false; cancelSel()
}

watch(activeTab, () => { page.value=1; cancelSel() })
watch([activeTab, page, pageSize, flowType, cropName, startDate, endDate, statYear], () => {
  if(activeTab.value==='logs') store.loadLogs({page:page.value,pageSize:pageSize.value,flowType:flowType.value==='all'?undefined:flowType.value,cropName:cropName.value,startDate:startDate.value,endDate:endDate.value})
  else if(activeTab.value==='seedling') store.loadCropStats(statYear.value)
  else if(activeTab.value==='planting') store.loadSourceStats(statYear.value)
  else if(activeTab.value==='annual') store.loadAnnualStats(statYear.value)
})

onMounted(() => store.loadLogs({page:1,pageSize:20}))
</script>