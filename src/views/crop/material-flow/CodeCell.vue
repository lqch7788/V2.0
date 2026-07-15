<template>
  <span v-if="!code" class="text-gray-400 text-xs">{{ emptyLabel }}</span>
  <span v-else class="inline-flex items-center justify-center gap-1 whitespace-nowrap">
    <span v-if="badge.label" :class="`px-1.5 py-0.5 ${badge.color} text-[10px] rounded font-medium`">{{ badge.label }}</span>
    <button v-if="isInventory" type="button" class="text-blue-600 hover:text-blue-800 hover:underline font-mono text-xs cursor-pointer" @click="$emit('click', code)">{{ code }}</button>
    <span v-else class="text-gray-600 font-mono text-xs">{{ code }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ type: String, code: String, emptyLabel: { type: String, default: '-' } })
defineEmits(['click'])

const TYPE_LABELS = { seed_source:'种源',seedling:'育苗',planting:'种植',harvest:'采收',plan:'计划',inventory:'库存',inventory_stock:'库存',seed:'种源',external_seed:'外部种',external:'外部',internal_planting:'内部种植',transfer_out:'调拨出库',correction:'修正',manual_freeze:'手动冻结',order:'订单冻结',customer_sale:'客户销售' }
const CODE_PREFIX_TYPE = { SS:'种源',SD:'育苗',PL:'种植',HS:'采收',YM:'育苗',ZZ:'计划',EXT:'外部',STG:'阶段',R:'区域',F:'农场',P:'区域',DEL:'删除',D:'调试' }
const TYPE_BADGE_COLOR = { '种源':'bg-blue-100 text-blue-700','育苗':'bg-emerald-100 text-emerald-700','种植':'bg-indigo-100 text-indigo-700','采收':'bg-orange-100 text-orange-700','计划':'bg-sky-100 text-sky-700','库存':'bg-cyan-100 text-cyan-700','外部种':'bg-purple-100 text-purple-700','外部':'bg-purple-100 text-purple-700','内部种植':'bg-teal-100 text-teal-700','调拨出库':'bg-rose-100 text-rose-700','手动冻结':'bg-blue-100 text-blue-700','订单冻结':'bg-purple-100 text-purple-700','客户销售':'bg-emerald-100 text-emerald-700','阶段':'bg-slate-100 text-slate-700','区域':'bg-slate-100 text-slate-700','农场':'bg-slate-100 text-slate-700','删除':'bg-rose-100 text-rose-700','调试':'bg-gray-200 text-gray-700' }

const badge = computed(() => {
  let label = props.type ? (TYPE_LABELS[props.type] || null) : null
  if (!label && props.code) {
    const m = String(props.code).match(/^([A-Z]{2,3})/)
    if (m) label = CODE_PREFIX_TYPE[m[1]] || null
  }
  return { label, color: label ? (TYPE_BADGE_COLOR[label] || 'bg-gray-100 text-gray-600') : 'bg-gray-100 text-gray-500' }
})
const isInventory = computed(() => props.type === 'inventory_stock' || props.type === 'inventory')
</script>