<!--
  2026-07-03 v3：育种历史记录表（模式自适应）1:1 迁移自 V1.1 BreedingHistoryTable.tsx
  - 10 列布局
  - 有性/无性 模式 badge（合并繁殖方式）
  - 父本/母本/母株 列：sexual 双 badge，asexual 单 badge
  - 关键指标 列：sexual 显示结实率，asexual 显示繁殖系数
  - 内置分页（10/20/50/页）
-->
<template>
  <div>
    <div class="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
      <table class="w-full text-sm">
        <thead class="bg-blue-500 text-white sticky top-0">
          <tr>
            <th class="px-2 py-2 text-left">日期</th>
            <th class="px-2 py-2 text-left">操作</th>
            <th class="px-2 py-2 text-left">世代</th>
            <th class="px-2 py-2 text-left">模式 / 方式</th>
            <th class="px-2 py-2 text-left">父本 / 母本（性）<br />母株（无性）</th>
            <th class="px-2 py-2 text-left">目标性状</th>
            <th class="px-2 py-2 text-left">关键指标</th>
            <th class="px-2 py-2 text-left">操作人</th>
            <th class="px-2 py-2 text-left">备注</th>
            <th class="px-2 py-2 text-center w-24">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="r in pageRecords" :key="r.id" class="hover:bg-gray-50">
            <td class="px-2 py-1.5 whitespace-nowrap">{{ r.recordDate }}</td>
            <td class="px-2 py-1.5">{{ OPERATION_TYPE_LABELS[r.operationType] || r.operationType }}</td>
            <td class="px-2 py-1.5">{{ r.generation || '-' }}</td>
            <td class="px-2 py-1.5">
              <span :class="['px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap',
                isAsexual(r) ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700']">
                {{ isAsexual(r)
                  ? `无性${r.propagationMethod ? '·' + (PROPAGATION_METHOD_LABELS[r.propagationMethod] || r.propagationMethod) : ''}`
                  : '有性' }}
              </span>
            </td>
            <td class="px-2 py-1.5 font-mono text-xs">
              <template v-if="isAsexual(r)">
                <Badge v-if="r.motherPlantCode" variant="outline" class="text-xs">{{ r.motherPlantCode }}</Badge>
                <span v-else>-</span>
              </template>
              <template v-else>
                <div class="flex flex-col gap-0.5">
                  <Badge v-if="r.parentMaleCode" variant="outline" class="text-xs">♂{{ r.parentMaleCode }}</Badge>
                  <Badge v-if="r.parentFemaleCode" variant="outline" class="text-xs">♀{{ r.parentFemaleCode }}</Badge>
                  <span v-if="!r.parentMaleCode && !r.parentFemaleCode">-</span>
                </div>
              </template>
            </td>
            <td class="px-2 py-1.5">
              <div v-if="traitList(r).length > 0" class="flex flex-wrap gap-0.5">
                <span v-for="t in traitList(r)" :key="t" class="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded">{{ t }}</span>
              </div>
              <span v-else>-</span>
            </td>
            <td class="px-2 py-1.5 text-xs">
              <template v-if="isAsexual(r)">
                <div class="space-y-0.5">
                  <div>
                    <span class="text-gray-500">接种 </span>
                    <span class="text-blue-700 font-medium">{{ r.inoculationCount ?? '-' }}</span>
                    <span class="text-gray-400 mx-1">/</span>
                    <span class="text-gray-500">成活 </span>
                    <span class="text-emerald-700 font-medium">{{ r.survivalCount ?? '-' }}</span>
                  </div>
                  <div v-if="r.inoculationCount && r.inoculationCount > 0"
                       :class="getRateColor(((r.survivalCount || 0) / r.inoculationCount) * 100, 'asexual')">
                    繁殖系数 <span class="font-medium">{{ (((r.survivalCount || 0) / r.inoculationCount) * 100).toFixed(1) }}%</span>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="space-y-0.5">
                  <div>
                    <span class="text-gray-500">结实 </span>
                    <span class="text-emerald-700 font-medium">{{ r.fruitCount ?? '-' }}</span>
                    <span class="text-gray-400 mx-1">/</span>
                    <span class="text-gray-500">种子 </span>
                    <span class="text-amber-700 font-medium">{{ r.seedCount ?? '-' }}</span>
                  </div>
                  <div v-if="r.pollinatedFlowerCount && r.pollinatedFlowerCount > 0"
                       :class="getRateColor(((r.fruitCount || 0) / r.pollinatedFlowerCount) * 100, 'sexual')">
                    结实率 <span class="font-medium">{{ (((r.fruitCount || 0) / r.pollinatedFlowerCount) * 100).toFixed(1) }}%</span>
                    <span class="text-gray-400 ml-1">({{ r.fruitCount || 0 }}/{{ r.pollinatedFlowerCount }})</span>
                  </div>
                </div>
              </template>
            </td>
            <td class="px-2 py-1.5">{{ r.operator || '-' }}</td>
            <td class="px-2 py-1.5 text-gray-500 truncate max-w-[200px]">{{ r.remarks || '-' }}</td>
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
        <button
          type="button"
          :disabled="safePage <= 1"
          @click="prevPage"
          class="px-2 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
        >
          上一页
        </button>
        <span>{{ safePage }} / {{ totalPages }}</span>
        <button
          type="button"
          :disabled="safePage >= totalPages"
          @click="nextPage"
          class="px-2 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
        >
          下一页
        </button>
        <select
          :value="pageSize"
          @change="(e) => onPageSizeChange(Number(e.target.value))"
          class="px-2 py-1 border border-gray-300 rounded"
        >
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
 * 2026-07-22 1:1 迁移自 V1.1 BreedingHistoryTable.tsx
 */
import { ref, computed } from 'vue'
import { Edit2, Trash2 } from 'lucide-vue-next'
import { Button, Badge } from '@/components/ui'
import { ASEXUAL_OPERATION_TYPES, OPERATION_TYPE_LABELS, PROPAGATION_METHOD_LABELS, getRateColor } from './recordModalConstants'

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
  const startIdx = (safePage.value - 1) * pageSize.value
  return props.records.slice(startIdx, startIdx + pageSize.value)
})

const prevPage = () => { page.value = Math.max(1, page.value - 1) }
const nextPage = () => { page.value = Math.min(totalPages.value, page.value + 1) }
const onPageSizeChange = (size) => { pageSize.value = size; page.value = 1 }

const isAsexual = (r) => r.reproductionMode === 'asexual' || ASEXUAL_OPERATION_TYPES.includes(r.operationType)

const traitList = (r) => {
  if (!r.targetTraits) return []
  if (typeof r.targetTraits === 'string') {
    try { return JSON.parse(r.targetTraits) } catch { return [] }
  }
  return Array.isArray(r.targetTraits) ? r.targetTraits : []
}
</script>
