<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="overflow-auto max-h-[calc(100vh-280px)]">
      <table class="w-full text-sm">
        <colgroup v-if="hasMode"><col class="w-12" /></colgroup>
        <colgroup><col class="w-24" /><col class="w-28" /><col class="w-20" /><col class="w-32" /><col class="w-24" /><col class="w-32" /><col class="w-24" /><col class="w-20" /></colgroup>
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
          <tr>
            <th v-if="hasMode" class="px-2 py-3 text-center text-xs font-semibold"><input type="checkbox" :checked="allSelected" @change="$emit('toggle-all')" class="w-4 h-4 rounded" /></th>
            <th class="px-2 py-3 text-center text-xs font-semibold">时间</th>
            <th class="px-2 py-3 text-center text-xs font-semibold">流转类型</th>
            <th class="px-2 py-3 text-center text-xs font-semibold">作物</th>
            <th class="px-2 py-3 text-center text-xs font-semibold">起点</th>
            <th class="px-2 py-3 text-center text-xs font-semibold">消耗量</th>
            <th class="px-2 py-3 text-center text-xs font-semibold">去向</th>
            <th class="px-2 py-3 text-center text-xs font-semibold">产出量</th>
            <th class="px-2 py-3 text-center text-xs font-semibold">来源</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="loading"><td colspan="9" class="px-4 py-8 text-center text-gray-500">加载中...</td></tr>
          <tr v-else-if="data.length === 0"><td colspan="9" class="px-4 py-8 text-center text-gray-500">暂无流转记录</td></tr>
          <tr v-for="(log, i) in data" :key="log.id || i" :class="['hover:bg-emerald-50 transition-colors', selectedIds.includes(log.id || `__idx_${i}`) ? 'bg-emerald-50' : '']">
            <td v-if="hasMode" class="px-2 py-3 text-center"><input type="checkbox" :checked="selectedIds.includes(log.id || `__idx_${i}`)" @change="$emit('toggle-row', log.id || `__idx_${i}`)" class="w-4 h-4 rounded" /></td>
            <td class="px-2 py-3 text-center text-gray-600 tabular-nums">{{ log.createdAt?.split('T')[0] || '-' }}</td>
            <td class="px-2 py-3 text-center"><span :class="['px-2 py-0.5 text-white text-xs rounded-full inline-block whitespace-nowrap', FLOW_TYPE_COLOR[log.flowType] || 'bg-slate-500']">{{ labelFlowType(log.flowType) }}</span></td>
            <td class="px-2 py-3 text-center text-gray-900">{{ log.cropName || '-' }}</td>
            <td class="px-2 py-3 text-center"><CodeCell :type="log.sourceType" :code="log.sourceCode" @click="onViewInv" /></td>
            <td class="px-2 py-3 text-center font-medium text-emerald-600 tabular-nums">{{ log.sourceQuantity != null ? `${log.sourceQuantity} ${log.sourceUnit || ''}` : '-' }}</td>
            <td class="px-2 py-3 text-center"><CodeCell :type="log.targetType" :code="log.targetCode" @click="onViewInv" /></td>
            <td class="px-2 py-3 text-center font-medium text-emerald-600 tabular-nums">{{ log.targetQuantity != null ? `${log.targetQuantity} ${log.targetUnit || ''}` : '-' }}</td>
            <td class="px-2 py-3 text-center"><span class="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full inline-block whitespace-nowrap">{{ labelCategory(log.sourceCategory) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import CodeCell from './CodeCell.vue'

const FLOW_TYPE_COLOR = { 'seed_source→seedling':'bg-blue-500','seed_source→planting':'bg-indigo-500','seed_source→harvest':'bg-blue-600','seedling→planting':'bg-emerald-500','seedling→harvest':'bg-emerald-600','planting→harvest':'bg-orange-500','inventory→external':'bg-red-500','inventory→planting':'bg-cyan-500','inventory→seedling':'bg-cyan-600','inventory→seed_source':'bg-cyan-700','external→planting':'bg-purple-500','external→seedling':'bg-purple-600','correction':'bg-gray-500','manual_correction':'bg-gray-500','plan→seed_source':'bg-sky-500','planting→seed_source':'bg-teal-500','inventory→freeze':'bg-rose-500','harvest→inventory':'bg-orange-600','other':'bg-slate-500' }
const FLOW_TYPE_LABELS = { 'seed_source→seedling':'种源→育苗','seed_source→planting':'种源→种植','seedling→planting':'育苗→种植','planting→harvest':'种植→采收','seedling→harvest':'育苗→采收','inventory→external':'库存→出库','inventory→planting':'库存→种植','inventory→seedling':'库存→育苗','inventory→seed_source':'库存→种源','external→planting':'外部→种植','external→seedling':'外部→育苗','seed_source→harvest':'种源→采收','correction':'修正','manual_correction':'手动修正','plan→seed_source':'计划→种源','planting→seed_source':'种植→种源','inventory→freeze':'库存→冻结','harvest→inventory':'采收→入库','other':'其他' }
const CATEGORY_LABELS = { external_purchase:'外购',self_produced:'自产',breeding:'育种',external_seed:'外部种子',seed_saving:'自留种',asexual:'无性繁殖',grafting:'嫁接',tissue_culture:'组培',cutting:'扦插',division:'分株',layering:'压条',bulb:'种球',external:'外部',manual:'手动',gift:'赠送',transfer:'调拨',planting:'种植',other:'其他' }
const labelFlowType = (v) => FLOW_TYPE_LABELS[v] || v || '-'
const labelCategory = (v) => CATEGORY_LABELS[v] || v || '-'

defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  hasMode: { type: Boolean, default: false },
  allSelected: { type: Boolean, default: false },
  someSelected: { type: Boolean, default: false },
  selectedIds: { type: Array, default: () => [] }
})
defineEmits(['toggle-row', 'toggle-all', 'view-inv'])
const onViewInv = () => {}
</script>