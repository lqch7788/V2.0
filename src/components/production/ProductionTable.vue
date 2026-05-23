<template>
  <div>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <tr>
            <th v-if="exportMode" class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-12">
              <el-checkbox
                :model-value="allSelectedForExport"
                class="header-checkbox"
                @change="onSelectAll"
              />
            </th>
            <th v-if="batchEditMode" class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-12">
              <el-checkbox
                :model-value="allSelectedForBatchEdit"
                class="header-checkbox"
                @change="onBatchSelectAll"
              />
            </th>
            <th v-if="batchDeleteMode" class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-12">
              <el-checkbox
                :model-value="allSelectedForBatchDelete"
                class="header-checkbox"
                @change="onBatchDeleteSelectAll"
              />
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">生产计划批次号</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">计划类型</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">作物名称</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">作物品种</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">场地/供应商</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">开始时间</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">预计结束</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">负责人</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">目标数量</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">发布人</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">发布时间</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">当前状态</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">版本号</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">备注</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">生产计划文件</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-24">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <tr
            v-for="batch in displayedBatches"
            :key="batch.id"
            :class="getRowClassName(batch)"
          >
            <td v-if="exportMode" class="px-4 py-3">
              <el-checkbox
                :model-value="selectedRows.includes(batch.id)"
                @change="onSelectRow(batch.id)"
              />
            </td>
            <td v-if="batchEditMode" class="px-4 py-3">
              <el-checkbox
                :model-value="selectedRows.includes(batch.id)"
                :disabled="batch.batchStatus === 'completed' || batch.batchStatus === 'cancelled'"
                @change="() => {
                  if (batch.batchStatus !== 'completed' && batch.batchStatus !== 'cancelled') {
                    onSelectRow(batch.id)
                  }
                }"
              />
            </td>
            <td v-if="batchDeleteMode" class="px-4 py-3">
              <el-checkbox
                :model-value="selectedRows.includes(batch.id)"
                @change="() => onSelectRow(batch.id)"
              />
            </td>
            <td class="px-4 py-3 text-sm font-medium whitespace-nowrap">
              <button
                class="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                @click="onBatchCodeClick(batch)"
              >
                {{ batch.batchCode }}
              </button>
            </td>
            <td class="px-4 py-3 text-sm whitespace-nowrap">
              <span
                v-if="batch.planType"
                :class="`px-2 py-0.5 rounded text-xs font-medium ${planTypeColors[batch.planType]?.bg} ${planTypeColors[batch.planType]?.text}`"
              >
                {{ planTypeLabels[batch.planType] }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{{ batch.cropName }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ batch.variety }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
              {{ batch.planType === 'seed_breeding'
                ? (batch.supplierName || '-')
                : batch.planType === 'seedling'
                ? (batch.seedlingSiteName || batch.greenhouseName || '-')
                : (batch.greenhouseName || '-') }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ batch.startDate }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ batch.expectedHarvestDate || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ batch.responsiblePerson }}</td>
            <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-medium">
              {{ batch.planType === 'seed_breeding'
                ? `${batch.seedQuantity || 0} ${batch.unit || 'kg'}`
                : batch.planType === 'seedling'
                ? `${batch.targetSeedlingCount || 0} 株`
                : `${batch.targetQuantity || 0} kg` }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ batch.publisher || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ batch.publishDate || '-' }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span :class="`px-2 py-1 rounded-full text-xs font-medium ${batchStatusColors[batch.batchStatus || 'draft']}`">
                {{ batchStatusLabels[batch.batchStatus || 'draft'] }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">V1.0</td>
            <td class="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">-</td>
            <td class="px-4 py-3 text-sm whitespace-nowrap">
              <template v-if="batch.planDetailFileName">
                <button
                  class="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  @click="downloadPlanFile(batch)"
                >
                  {{ batch.planDetailFileName }}
                </button>
              </template>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <template v-if="batch.batchStatus !== 'completed' && batch.batchStatus !== 'cancelled'">
                  <button
                    class="h-9 w-9 rounded-md flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                    title="编辑"
                    @click="onEdit(batch)"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button
                    class="h-9 w-9 rounded-md flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-gray-100 transition-colors"
                    title="删除"
                    @click="handleDelete(batch)"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </template>
                <span v-else class="text-xs text-gray-400">已归档</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Selection footer -->
      <div v-if="exportMode" class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
        <div class="flex items-center gap-4">
          <button class="text-sm text-blue-600 hover:text-blue-800 hover:underline" @click="onSelectAll">
            {{ allSelectedForExport ? '全不选' : '全选' }}
          </button>
          <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
        </div>
      </div>
      <div v-if="batchEditMode" class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
        <div class="flex items-center gap-4">
          <button class="text-sm text-blue-600 hover:text-blue-800 hover:underline" @click="onBatchSelectAll">
            {{ allSelectedForBatchEdit ? '全不选' : '全选' }}
          </button>
          <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
        </div>
      </div>
      <div v-if="batchDeleteMode" class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
        <div class="flex items-center gap-4">
          <button class="text-sm text-blue-600 hover:text-blue-800 hover:underline" @click="onBatchDeleteSelectAll">
            {{ allSelectedForBatchDelete ? '全不选' : '全选' }}
          </button>
          <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项（草稿/已作废可删除）</span>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 rounded-b-xl">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">每页</span>
        <el-select v-model="localPageSize" class="w-20" size="small">
          <el-option label="10" :value="10" />
          <el-option label="20" :value="20" />
          <el-option label="50" :value="50" />
        </el-select>
        <span class="text-sm text-gray-500">条</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">共 {{ pageCount || 1 }} 页</span>
        <button
          class="w-8 h-8 rounded-md inline-flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="currentPage === 1"
          title="首页"
          @click="onPageChange(1)"
        >
          <ChevronsLeft class="w-4 h-4" />
        </button>
        <button
          class="w-8 h-8 rounded-md inline-flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="currentPage === 1"
          @click="onPageChange(Math.max(1, currentPage - 1))"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          class="w-8 h-8 rounded-md inline-flex items-center justify-center text-sm font-medium"
          :class="currentPage === page ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'"
          @click="onPageChange(page)"
        >
          {{ page }}
        </button>
        <button
          class="w-8 h-8 rounded-md inline-flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="currentPage >= pageCount"
          @click="onPageChange(Math.min(pageCount || 1, currentPage + 1))"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
        <button
          class="w-8 h-8 rounded-md inline-flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="currentPage >= pageCount"
          title="末页"
          @click="onPageChange(pageCount || 1)"
        >
          <ChevronsRight class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'
import { batchStatusColors, batchStatusLabels, PlanTypeLabels as planTypeLabels, PlanTypeColors as planTypeColors } from './constants'
import { showConfirm } from '@/lib/dialogService'

const props = defineProps({
  filteredBatches: { type: Array, default: () => [] },
  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  exportMode: { type: Boolean, default: false },
  batchEditMode: { type: Boolean, default: false },
  batchDeleteMode: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
})

const emit = defineEmits([
  'pageChange',
  'pageSizeChange',
  'selectRow',
  'selectAll',
  'batchSelectAll',
  'batchDeleteSelectAll',
  'batchCodeClick',
  'edit',
  'delete',
])

const pageCount = computed(() => Math.ceil(props.filteredBatches.length / props.pageSize))
const displayedBatches = computed(() =>
  props.filteredBatches.slice((props.currentPage - 1) * props.pageSize, props.currentPage * props.pageSize)
)

const allSelectedForExport = computed(() =>
  props.selectedRows.length === props.filteredBatches.length && props.filteredBatches.length > 0
)
const allSelectedForBatchEdit = computed(() => {
  const selectable = props.filteredBatches.filter(b => b.batchStatus !== 'completed' && b.batchStatus !== 'cancelled')
  return props.selectedRows.length === selectable.length && selectable.length > 0
})
// V1.1逻辑：所有批次都可以删除，不过滤状态
const deletableBatches = computed(() => props.filteredBatches)
const allSelectedForBatchDelete = computed(() =>
  props.selectedRows.length === deletableBatches.value.length && deletableBatches.value.length > 0
)

const visiblePages = computed(() => {
  const pages = []
  const total = pageCount.value || 1
  const current = props.currentPage
  const maxVisible = 5
  let start = Math.max(1, current - Math.floor(maxVisible / 2))
  let end = Math.min(total, start + maxVisible - 1)
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const localPageSize = computed({
  get: () => props.pageSize,
  set: (v) => {
    emit('pageSizeChange', v)
    emit('pageChange', 1)
  },
})

function getRowClassName(batch) {
  let className = 'hover:bg-blue-100 transition-colors '
  // V1.1逻辑：只有编辑模式下已完成/已作废的行才加灰色背景
  if (props.batchEditMode && (batch.batchStatus === 'completed' || batch.batchStatus === 'cancelled')) {
    className += 'bg-gray-50 '
  }
  // V1.1逻辑：批量删除模式下，所有状态都可以删除，不加灰色遮罩
  return className
}

async function handleDelete(batch) {
  if (await showConfirm(`确定要删除生产计划 ${batch.batchCode} 吗？`)) {
    emit('delete', batch)
  }
}

function downloadPlanFile(batch) {
  const fileName = batch.planDetailFileName
  const isDocx = fileName.endsWith('.docx')
  const content = batch.planDetail || `# ${batch.batchCode}\n\n批次号：${batch.batchCode}\n作物名称：${batch.cropName}\n作物品种：${batch.variety}\n种植区域：${batch.greenhouseName}\n种植面积：${batch.plantingArea} m²\n种植模式：${batch.plantingMode}\n负责人：${batch.responsiblePerson}\n开始时间：${batch.startDate}\n预计结束时间：${batch.expectedHarvestDate}\n目标产量：${batch.targetYield} kg\n当前状态：${batchStatusLabels[batch.batchStatus || 'draft']}`
  const blob = new Blob([content], {
    type: isDocx ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'text/markdown'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function onPageChange(page) { emit('pageChange', page) }
function onSelectRow(id) { emit('selectRow', id) }
function onSelectAll() { emit('selectAll') }
function onBatchSelectAll() { emit('batchSelectAll') }
function onBatchDeleteSelectAll() { emit('batchDeleteSelectAll') }
function onBatchCodeClick(batch) { emit('batchCodeClick', batch) }
function onEdit(batch) { emit('edit', batch) }
</script>

<style scoped>
.header-checkbox :deep(.el-checkbox__inner) {
  border-color: white;
}
.header-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: white;
  border-color: white;
}
.header-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner::after) {
  border-color: #3b82f6;
}
</style>
