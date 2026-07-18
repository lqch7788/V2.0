<!--
  EntityHistoryTimeline — 实体历史双视图组件（V1.1 EntityHistoryTimeline.tsx 1:1 迁移）
  功能：
  - 双视图切换：时间线 ↔ 表格
  - 分类筛选：全部 / 创建修改 / 入库 / 库存流水 / 回流 / 流转
  - 导出 Excel（表格视图下可用）
  - 刷新按钮
  2026-07-18 P0-DETAIL-007 修复：V2.0 DetailModal 操作历史 Tab 功能缩水，已升级
-->
<template>
  <div class="space-y-3">
    <!-- 工具栏：拆成两行，用文字标签明确维度（视图 / 数据分类） -->
    <div class="space-y-2.5">
      <!-- 第一行：视图切换（左侧） + 操作按钮（右侧） -->
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-gray-500 shrink-0">视图：</span>
          <!-- 视图切换：pill 风格，强互斥二选一 -->
          <div class="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
            <button
              type="button"
              :class="['px-4 py-1.5 text-sm font-semibold rounded-md flex items-center gap-1.5 transition-colors',
                view === 'timeline' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500 hover:text-gray-700']"
              @click="view = 'timeline'"
            >
              <Clock :size="16" />时间线
            </button>
            <button
              type="button"
              :class="['px-4 py-1.5 text-sm font-semibold rounded-md flex items-center gap-1.5 transition-colors',
                view === 'table' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500 hover:text-gray-700']"
              @click="view = 'table'"
            >
              <Table2 :size="16" />表格
            </button>
          </div>
        </div>
        <!-- 操作按钮（独立于筛选） -->
        <div class="flex items-center gap-2">
          <el-button size="small" @click="load">
            <el-icon class="mr-1"><RefreshCw /></el-icon>刷新
          </el-button>
          <el-button
            type="primary"
            size="small"
            :disabled="filtered.length === 0"
            @click="handleExport"
          >
            <el-icon class="mr-1"><Download /></el-icon>导出 Excel
          </el-button>
        </div>
      </div>

      <!-- 第二行：数据分类筛选 -->
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-xs font-semibold text-gray-500 shrink-0">数据分类：</span>
        <button
          v-for="f in CATEGORY_FILTERS"
          :key="f.key"
          type="button"
          :title="f.description"
          :class="['px-3 py-1.5 text-sm font-semibold rounded-full border transition-colors',
            filter === f.key
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
              : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700']"
          @click="filter = f.key"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- 统计摘要 -->
    <div class="text-xs text-gray-500">
      共 {{ filtered.length }} 条记录
      <span v-if="filter !== 'all'">（已筛选：{{ currentFilterLabel }}）</span>
    </div>

    <!-- 内容区 -->
    <div v-if="loading && items.length === 0" class="flex items-center justify-center py-12 text-gray-400">
      <el-icon class="animate-spin mr-2"><Loading /></el-icon>加载中…
    </div>
    <div v-else-if="filtered.length === 0" class="text-center py-12 text-gray-500 text-sm">
      暂无追溯记录
    </div>
    <!-- ===== 时间线模式 ===== -->
    <div v-else-if="view === 'timeline'" class="relative pl-6 border-l-2 border-emerald-200 space-y-3">
      <div v-for="(item, idx) in filtered" :key="item.id || idx" class="relative">
        <!-- 时间线圆点 -->
        <div class="absolute -left-[calc(1.5rem+3px)] top-1.5 w-3 h-3 rounded-full border-2 border-emerald-400 bg-white" />
        <!-- 卡片 -->
        <div class="bg-white border border-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs text-gray-400 font-mono">{{ fmtTime(item.occurredAt) }}</span>
            <span :class="['px-1.5 py-0.5 text-xs rounded border', catBadge(item.category)]">{{ item.action }}</span>
            <span v-if="item.quantityDelta != null" :class="['text-xs font-medium', item.quantityDelta >= 0 ? 'text-emerald-600' : 'text-red-600']">
              {{ fmtDelta(item.quantityDelta, item.unit) }}
            </span>
            <span v-if="item.refCode" class="text-xs text-gray-500 font-mono">{{ item.refCode }}</span>
            <span v-if="item.operatorName" class="text-xs text-gray-400 ml-auto">by {{ item.operatorName }}</span>
          </div>
          <div v-if="item.remarks" class="text-xs text-gray-500 mt-1">{{ item.remarks }}</div>
        </div>
      </div>
    </div>
    <!-- ===== 表格模式 ===== -->
    <div v-else class="border border-gray-200 rounded-lg overflow-hidden">
      <div class="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table class="w-full text-sm">
          <colgroup>
            <col v-if="typeColumn" class="w-[17%]" />
            <col v-if="!typeColumn" class="w-[18%]" />
            <col class="w-[9%]" />
            <col class="w-[12%]" />
            <col :class="typeColumn ? 'w-[10%]' : 'w-[11%]'" />
            <col v-if="typeColumn" class="w-[10%]" />
            <col :class="typeColumn ? 'w-[11%]' : 'w-[13%]'" />
            <col :class="typeColumn ? 'w-[16%]' : 'w-[17%]'" />
            <col :class="typeColumn ? 'w-[7%]' : 'w-[8%]'" />
            <col :class="typeColumn ? 'w-[9%]' : 'w-[12%]'" />
          </colgroup>
          <thead class="bg-blue-500 text-white sticky top-0 z-10">
            <tr>
              <th class="px-2 py-2 text-left whitespace-nowrap">时间</th>
              <th class="px-2 py-2 text-left whitespace-nowrap">类型</th>
              <th class="px-2 py-2 text-left whitespace-nowrap">来源</th>
              <th class="px-2 py-2 text-left whitespace-nowrap">作物品种</th>
              <th v-if="typeColumn" class="px-2 py-2 text-left whitespace-nowrap">{{ typeColumn.label }}</th>
              <th class="px-2 py-2 text-left whitespace-nowrap">数量变化</th>
              <th class="px-2 py-2 text-left whitespace-nowrap">关联单号</th>
              <th class="px-2 py-2 text-left whitespace-nowrap">操作员</th>
              <th class="px-2 py-2 text-left whitespace-nowrap">备注</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="(r, idx) in filtered" :key="r.id || idx" class="hover:bg-gray-50">
              <td class="px-2 py-1.5 text-xs text-gray-500 font-mono truncate" :title="fmtTime(r.occurredAt)">{{ fmtTime(r.occurredAt) }}</td>
              <td class="px-2 py-1.5">
                <span :class="['px-1.5 py-0.5 text-xs rounded border whitespace-nowrap', catBadge(r.category)]">{{ r.action }}</span>
              </td>
              <td class="px-2 py-1.5 text-xs text-gray-600 truncate" :title="fmtInboundSource(r.inboundSource)">{{ fmtInboundSource(r.inboundSource) }}</td>
              <td class="px-2 py-1.5 text-xs text-gray-700 truncate" :title="r.cropName || '-'">{{ r.cropName || '-' }}</td>
              <td v-if="typeColumn" class="px-2 py-1.5 text-xs text-gray-600 truncate" :title="typeColumn.value || '-'">{{ typeColumn.value || '-' }}</td>
              <td :class="['px-2 py-1.5 text-xs font-medium whitespace-nowrap', (r.quantityDelta ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600']">
                {{ fmtDelta(r.quantityDelta, r.unit) }}
              </td>
              <td class="px-2 py-1.5 text-xs font-mono text-gray-600 truncate" :title="r.refCode || '-'">{{ r.refCode || '-' }}</td>
              <td class="px-2 py-1.5 text-xs text-gray-600 truncate" :title="r.operatorName || '-'">{{ r.operatorName || '-' }}</td>
              <td class="px-2 py-1.5 text-xs text-gray-500 truncate" :title="r.remarks || '-'">{{ r.remarks || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * EntityHistoryTimeline — 实体历史双视图组件（V1.1 EntityHistoryTimeline.tsx 1:1 迁移）
 */
import { ref, computed, watch, onMounted } from 'vue'
import { Clock, Table2, Download, RefreshCw } from 'lucide-vue-next'
import { fetchFullHistory } from '@/services/entityHistoryService'
import * as XLSX from 'xlsx'
import { ElMessage } from 'element-plus'

/** 入库来源类型 → 中文（V1.1 L18-60 1:1 迁移） */
const INBOUND_SOURCE_LABELS = {
  external_purchased: '外购入库',
  self_produced: '自产入库',
  self_use: '自用入库',
  external_sale: '外售入库',
  transfer_inbound: '调拨入库',
  transfer_out: '调拨出库',
  transfer_in: '退库入库',
  inventory_transfer: '库存调拨入库',
  circulation: '回流',
  seed_saving: '留种',
  seed_source: '种源入库',
  seedling: '育苗入库',
  planting: '种植入库',
  inventory: '库存调拨',
  manual: '手动入库',
  correction: '数量修正',
  external: '外部入库',
  inbound: '入库',
  outbound: '出库',
  harvest: '采收',
  freeze: '冻结',
  unfreeze: '解冻',
  damaged: '报损',
  adjustment: '库存调整',
  commissioned: '委托生产',
  external_purchase: '外购入库',
  gift: '赠送',
  transfer: '库存调拨',
  customer_sale: '客户销售',
  damage_loss: '报损',
  gift_sample: '赠送/样品',
  internal_planting: '内部种植',
  other: '其他',
  purchase: '采购',
  return_inbound: '退库入库'
}

/** 类型列配置（V1.1 L69-74 1:1 迁移） */
const props = defineProps({
  /** 实体标识（seed-sources / seedlings / plantings） */
  entity: { type: String, required: true },
  /** 实体 ID */
  entityId: { type: String, required: true },
  /** 实体编码（用于关联 material_flow_log） */
  entityCode: { type: String, default: '' },
  /**
   * 实体的"类型"列配置
   * - 不传则不显示"类型"列
   * - 传了则按 label 显示列标题，value 显示单元格内容
   */
  typeColumn: { type: Object, default: null }
})

/** 分类筛选配置（V1.1 L92-103 1:1 迁移） */
const CATEGORY_FILTERS = [
  { key: 'all',          label: '全部',              description: '显示所有类型的追溯记录，不做分类筛选。' },
  { key: 'lifecycle',    label: '创建/修改/删除',     description: '记录本身的生命周期变更：创建、修改、删除等基础操作。' },
  { key: 'inbound',      label: '入库',              description: '实体相关的入库记录，如外购入库、调拨入库、自产入库、自用入库、外售入库等。' },
  { key: 'transaction',  label: '库存流水',          description: '库存数量进出流水：领料出库、退料入库、库存调拨、采收入库、库存修正等。' },
  { key: 'circulation',  label: '回流',              description: '种源自身的状态变更账：无性繁殖、留种、G0/G1 育种、数量回填、废弃处置等（数据源：crop_circulation_records）。' },
  { key: 'flow',         label: '流转',              description: '全链路物料流日志：种源↔育苗、种源↔种植、库存↔种源、外部↔育苗等业务流转事件（数据源：material_flow_log）。' }
]

const view = ref('timeline')
const filter = ref('all')
const loading = ref(false)
const items = ref([])

const currentFilterLabel = computed(() => CATEGORY_FILTERS.find((f) => f.key === filter.value)?.label || '')

const filtered = computed(() => filter.value === 'all' ? items.value : items.value.filter((i) => i.category === filter.value))

const load = async () => {
  if (!props.entityId) return
  loading.value = true
  try {
    const data = await fetchFullHistory(props.entity, props.entityId, props.entityCode)
    items.value = data || []
  } catch (e) {
    console.error('[EntityHistoryTimeline] load failed:', e)
    ElMessage.error('追溯历史加载失败')
  } finally {
    loading.value = false
  }
}

watch(() => [props.entityId, props.entityCode], () => { void load() })
onMounted(() => { void load() })

/** 时间格式化（V1.1 L106-111 1:1 迁移） */
function fmtTime(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString('zh-CN', { hour12: false })
}

/** 数量变化显示（V1.1 L114-118 1:1 迁移） */
function fmtDelta(delta, unit) {
  if (delta == null) return '-'
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta}${unit ? ' ' + unit : ''}`
}

/** 入库来源 → 中文（V1.1 L121-124 1:1 迁移） */
function fmtInboundSource(t) {
  if (!t) return '-'
  return INBOUND_SOURCE_LABELS[t] || t
}

/** 分类标签颜色（V1.1 L127-136 1:1 迁移） */
function catBadge(cat) {
  switch (cat) {
    case 'lifecycle': return 'bg-gray-100 text-gray-700 border-gray-300'
    case 'inbound': return 'bg-emerald-100 text-emerald-700 border-emerald-300'
    case 'transaction': return 'bg-blue-100 text-blue-700 border-blue-300'
    case 'circulation': return 'bg-amber-100 text-amber-700 border-amber-300'
    case 'flow': return 'bg-purple-100 text-purple-700 border-purple-300'
    default: return 'bg-gray-100 text-gray-500 border-gray-200'
  }
}

/** 导出 Excel（V1.1 L166-201 1:1 迁移） */
function handleExport() {
  if (filtered.value.length === 0) return
  const typeLabel = props.typeColumn?.label
  const typeValue = props.typeColumn?.value || '-'
  const rows = filtered.value.map((r, i) => {
    const row = {
      '序号': i + 1,
      '时间': fmtTime(r.occurredAt),
      '类型': r.action,
      '来源': fmtInboundSource(r.inboundSource),
      '作物品种': r.cropName || '-',
      '数量变化': fmtDelta(r.quantityDelta, r.unit),
      '关联单号': r.refCode || '-',
      '关联模块': r.refModule || '-',
      '操作员': r.operatorName || '-',
      '备注': r.remarks || '-'
    }
    if (typeLabel) row[typeLabel] = typeValue
    return row
  })
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [
    { wch: 6 }, { wch: 20 }, { wch: 14 }, { wch: 12 }, { wch: 14 },
    { wch: 14 }, { wch: 22 }, { wch: 14 }, { wch: 12 }, { wch: 30 }
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '追溯历史')
  XLSX.writeFile(wb, `追溯历史_${props.entityCode}_${new Date().toISOString().split('T')[0]}.xlsx`)
}
</script>
