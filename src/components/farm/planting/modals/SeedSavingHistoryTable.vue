<!--
  2026-07-03 v4：留种历史记录表（模式自适应 + 分页）1:1 迁移自 V1.1 SeedSavingHistoryTable.tsx
  - 种子模式显示: 发芽率 / 千粒重 / 纯度 / 含水率 / 处理 / 成熟度 / 预估贮藏期
  - 营养体模式显示: 规格 / 芽眼数 / 检疫 / 休眠 / 繁殖潜力
-->
<template>
  <div>
    <div class="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
      <table class="w-full text-sm">
        <thead class="bg-blue-500 text-white sticky top-0">
          <tr>
            <th class="px-2 py-2 text-left">日期</th>
            <th class="px-2 py-2 text-left">批次号</th>
            <th class="px-2 py-2 text-left">株号</th>
            <th class="px-2 py-2 text-left">采收部位</th>
            <th class="px-2 py-2 text-left">数量</th>
            <th class="px-2 py-2 text-left">用途</th>
            <th class="px-2 py-2 text-left">模式</th>
            <th class="px-2 py-2 text-left">关键指标</th>
            <th class="px-2 py-2 text-left">存储</th>
            <th class="px-2 py-2 text-left">操作人</th>
            <th class="px-2 py-2 text-left">备注</th>
            <th class="px-2 py-2 text-center w-24">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="r in pageRecords" :key="r.id" class="hover:bg-gray-50">
            <td class="px-2 py-1.5 whitespace-nowrap">{{ r.recordDate }}</td>
            <td class="px-2 py-1.5 font-mono text-xs">{{ r.lotNumber || '-' }}</td>
            <td class="px-2 py-1.5 font-mono text-amber-700 text-xs">{{ r.plantMarker }}</td>
            <td class="px-2 py-1.5">{{ r.harvestPart ? HARVEST_PART_LABELS[r.harvestPart] || r.harvestPart : '-' }}</td>
            <td class="px-2 py-1.5 text-right">{{ r.quantity != null ? `${r.quantity}${r.unit || ''}` : '-' }}</td>
            <td class="px-2 py-1.5 text-xs">{{ r.purpose ? PURPOSE_LABEL_MAP[r.purpose] || r.purpose : '-' }}</td>
            <td class="px-2 py-1.5">
              <span :class="['px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap',
                isVeg(r) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700']">
                {{ isVeg(r) ? '营养体' : '种子' }}
              </span>
            </td>
            <td class="px-2 py-1.5 text-xs">
              <div v-if="isVeg(r)" class="space-y-0.5">
                <div v-if="r.sizeGrade">规格: {{ SIZE_GRADE_LABEL_MAP[r.sizeGrade] || r.sizeGrade }}</div>
                <div v-if="r.budNodeCount != null">芽眼/节: <span class="font-medium">{{ r.budNodeCount }}</span></div>
                <div v-if="r.healthStatus">检疫: {{ HEALTH_STATUS_LABEL_MAP[r.healthStatus] || r.healthStatus }}</div>
                <div v-if="r.dormancyState">休眠: {{ DORMANCY_LABEL_MAP[r.dormancyState] || r.dormancyState }}</div>
                <span v-if="!r.sizeGrade && r.budNodeCount == null && !r.healthStatus && !r.dormancyState">-</span>
              </div>
              <div v-else class="space-y-0.5">
                <div v-if="r.germinationRate != null" :class="getSeedSavingRateColor(r.germinationRate)">
                  发芽率 <span class="font-medium">{{ r.germinationRate }}%</span>
                </div>
                <div v-if="r.thousandSeedWeight != null">千粒重: <span class="font-medium">{{ r.thousandSeedWeight }}g</span></div>
                <div v-if="r.purity != null">纯度: {{ r.purity }}%</div>
                <div v-if="r.moistureContent != null">含水率: {{ r.moistureContent }}%</div>
                <div v-if="r.seedTreatment">处理: {{ SEED_TREATMENT_LABEL_MAP[r.seedTreatment] || r.seedTreatment }}</div>
                <div v-if="r.maturityStage">成熟度: {{ MATURITY_LABEL_MAP[r.maturityStage] || r.maturityStage }}</div>
                <span v-if="r.germinationRate == null && r.thousandSeedWeight == null && r.purity == null && r.moistureContent == null && !r.seedTreatment && !r.maturityStage">-</span>
              </div>
            </td>
            <td class="px-2 py-1.5 text-xs">
              <div v-if="r.storageLocation">{{ r.storageLocation }}</div>
              <div v-if="r.processingMethod" class="text-gray-400">{{ PROCESSING_LABEL_MAP[r.processingMethod] || r.processingMethod }}</div>
              <div v-if="r.containerType" class="text-gray-400">{{ CONTAINER_LABEL_MAP[r.containerType] || r.containerType }}</div>
              <span v-if="!r.storageLocation && !r.processingMethod && !r.containerType">-</span>
            </td>
            <td class="px-2 py-1.5">{{ r.operator || '-' }}</td>
            <td class="px-2 py-1.5 text-gray-500 truncate max-w-[150px]">{{ r.remarks || '-' }}</td>
            <td class="px-2 py-1.5 text-center">
              <span v-if="editingId === r.id" class="text-xs text-amber-600">编辑中</span>
              <div v-else class="flex items-center justify-center gap-1">
                <Button variant="ghost" size="icon" :class="'text-blue-600 hover:text-blue-700 hover:bg-blue-50'" @click="onEdit(r)">
                  <Edit2 class="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" :class="'text-red-600 hover:text-red-700 hover:bg-red-50'" @click="onDelete(r.id)">
                  <Trash2 class="w-4 h-4" />
                </Button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="records.length > pageSize" class="mt-2 flex items-center justify-between text-xs text-gray-500">
      <span>共 {{ records.length }} 条 · 第 {{ safePage }}/{{ totalPages }} 页</span>
      <div class="flex items-center gap-2">
        <button type="button" :disabled="safePage <= 1" @click="prevPage"
          class="px-2 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50">上一页</button>
        <span>{{ safePage }} / {{ totalPages }}</span>
        <button type="button" :disabled="safePage >= totalPages" @click="nextPage"
          class="px-2 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50">下一页</button>
        <select :value="pageSize" @change="(e) => onPageSizeChange(Number(e.target.value))"
          class="px-2 py-1 border border-gray-300 rounded">
          <option :value="10">10/页</option>
          <option :value="20">20/页</option>
          <option :value="50">50/页</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 2026-07-22 1:1 迁移自 V1.1 SeedSavingHistoryTable.tsx
 */
import { ref, computed } from 'vue'
import { Edit2, Trash2 } from 'lucide-vue-next'
import { Button, Badge } from '@/components/ui'
import {
  HARVEST_PART_LABELS,
  VEGETATIVE_HARVEST_PARTS,
  getSeedSavingRateColor,
  PURPOSE_LABEL_MAP,
  PROCESSING_LABEL_MAP,
  SIZE_GRADE_LABEL_MAP,
  HEALTH_STATUS_LABEL_MAP,
  DORMANCY_LABEL_MAP,
  CONTAINER_LABEL_MAP,
  SEED_TREATMENT_LABEL_MAP,
  MATURITY_LABEL_MAP
} from './seedSavingConstants'

const props = defineProps({
  records: { type: Array, required: true },
  editingId: { type: String, default: null },
  onEdit: { type: Function, required: true },
  onDelete: { type: Function, required: true }
})

const page = ref(1)
const pageSize = ref(10)

const totalPages = computed(() => Math.max(1, Math.ceil(props.records.length / pageSize.value)))
const safePage = computed(() => Math.min(page.value, totalPages.value))
const pageRecords = computed(() => {
  const start = (safePage.value - 1) * pageSize.value
  return props.records.slice(start, start + pageSize.value)
})

const prevPage = () => { page.value = Math.max(1, page.value - 1) }
const nextPage = () => { page.value = Math.min(totalPages.value, page.value + 1) }
const onPageSizeChange = (size) => { pageSize.value = size; page.value = 1 }

const isVeg = (r) => r.preservationMode === 'vegetative' || VEGETATIVE_HARVEST_PARTS.includes(r.harvestPart)
</script>
