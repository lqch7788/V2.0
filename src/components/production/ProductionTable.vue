<template>
  <div>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <tr>
            <th
              v-if="exportMode"
              class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-12"
            >
              <el-checkbox
                :model-value="allSelectedForExport"
                class="header-checkbox"
                @change="onSelectAll"
              />
            </th>
            <th
              v-if="batchEditMode"
              class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-12"
            >
              <el-checkbox
                :model-value="allSelectedForBatchEdit"
                class="header-checkbox"
                @change="onBatchSelectAll"
              />
            </th>
            <th
              v-if="batchDeleteMode"
              class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-12"
            >
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
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">种植区域</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">生产模式</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">开始时间</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">预计结束</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">负责人</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">目标产量</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">发布人</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">发布时间</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">当前状态</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">执行状态</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">关联订单</th>
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
                @change="handleBatchEditRowToggle(batch)"
              />
            </td>
            <td v-if="batchDeleteMode" class="px-4 py-3">
              <el-checkbox
                :model-value="selectedRows.includes(batch.id)"
                @change="onSelectRow(batch.id)"
              />
            </td>
            <td class="px-4 py-3 text-sm font-medium whitespace-nowrap">
              <button
                :class="btnGhost + ' text-blue-600 hover:text-blue-800 hover:underline'"
                title="点击查看详情"
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
            <td
              class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
              :title="batch.cropName || ''"
            >{{ truncateForTable(batch.cropName) }}</td>
            <td
              class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap"
              :title="batch.variety || ''"
            >{{ truncateForTable(batch.variety) }}</td>
            <td
              class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap"
              :title="batch.greenhouseName || batch.supplierName || batch.seedlingSiteName || ''"
            >{{ truncateForTable(batch.greenhouseName || batch.supplierName || batch.seedlingSiteName) }}</td>
            <td
              class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap"
              :title="renderPlantingMode(batch)"
            >{{ truncateForTable(renderPlantingMode(batch)) }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ batch.startDate }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ batch.expectedHarvestDate || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ batch.responsiblePerson }}</td>
            <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-medium">
              <!-- 2026-06-14: 育苗计划显示"投入→产出"，育种/种植显示"目标产量+单位" - 1:1 V1.1 L214-223 -->
              <span v-if="batch.planType === 'seedling'" class="text-blue-700">
                {{ batch.targetInputCount || 0 }}株投入 → {{ batch.targetOutputCount || 0 }}株产出
              </span>
              <template v-else>
                {{ `${batch.targetQuantity || batch.targetYield || 0} ${batch.unit || 'kg'}` }}
              </template>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ batch.publisher || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
              <!-- 发布时间只显示年月日(YYYY-MM-DD);为空时 fallback 到创建时间 - 1:1 V1.1 L226-231 -->
              {{ formatPublishDate(batch) }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span :class="`px-2 py-1 rounded-full text-xs font-medium ${batchStatusColors[batch.batchStatus || 'draft']}`">
                {{ batchStatusLabels[batch.batchStatus || 'draft'] }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span
                v-if="batch.executionStatus"
                :class="`px-2 py-1 rounded-full text-xs font-medium ${executionStatusColors[batch.executionStatus]}`"
              >
                {{ executionStatusLabels[batch.executionStatus] }}
              </span>
            </td>
            <td
              class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap"
              :title="batch.orderCode || ''"
            >{{ truncateForTable(batch.orderCode) }}</td>
            <td
              class="px-4 py-3 text-sm text-gray-600 max-w-xs truncate"
              :title="batch.remarks || ''"
            >{{ truncateForTable(batch.remarks) }}</td>
            <td class="px-4 py-3 text-sm whitespace-nowrap">
              <template v-if="batch.planDetailFileName">
                <span :title="batch.planDetailFileName">
                  {{ truncateForTable(batch.planDetailFileName) }}
                  <button
                    :class="btnGhost + ' text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 ml-1'"
                    title="点击下载生产计划文件"
                    @click="downloadPlanFile(batch)"
                  >
                    <Download class="w-4 h-4" />
                  </button>
                </span>
              </template>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <button
                  v-if="batch.batchStatus !== 'completed' && batch.batchStatus !== 'cancelled'"
                  :class="btnGhost + ' text-gray-600 hover:text-blue-600 p-1'"
                  title="编辑"
                  @click="onEdit(batch)"
                >
                  <Edit2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Selection footer -->
      <div
        v-if="exportMode"
        class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50"
      >
        <div class="flex items-center gap-4">
          <button
            :class="btnGhost + ' text-blue-600 hover:text-blue-800'"
            @click="onSelectAll"
          >
            {{ allSelectedForExport ? '全不选' : '全选' }}
          </button>
          <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
        </div>
      </div>
      <div
        v-if="batchEditMode"
        class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50"
      >
        <div class="flex items-center gap-4">
          <button
            :class="btnGhost + ' text-blue-600 hover:text-blue-800'"
            @click="onBatchSelectAll"
          >
            {{ allSelectedForBatchEdit ? '全不选' : '全选' }}
          </button>
          <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
        </div>
      </div>
      <div
        v-if="batchDeleteMode"
        class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50"
      >
        <div class="flex items-center gap-4">
          <button
            :class="btnGhost + ' text-blue-600 hover:text-blue-800'"
            @click="onBatchDeleteSelectAll"
          >
            {{ allSelectedForBatchDelete ? '全不选' : '全选' }}
          </button>
          <!-- L-04: 文案与实际行为一致（所有状态都可删除） - 1:1 V1.1 L329-330 -->
          <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 rounded-b-xl">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">每页</span>
        <el-select
          v-model="localPageSize"
          class="w-20"
          size="small"
        >
          <el-option
            v-for="opt in pageSizeOptions"
            :key="opt"
            :label="String(opt)"
            :value="opt"
          />
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

<script>
/**
 * ProductionTable - 生产计划列表表格
 * 1:1 翻译自 V1.1 src/components/production/ProductionTable.tsx
 *
 * 修复 P0:
 *  - 补"生产模式"列 (V1.1 L140 / 2026-06-10)
 *  - 育苗计划目标产量分流 (V1.1 L214-223)
 *  - 发布时间截 YYYY-MM-DD (V1.1 L226-231)
 *  - truncateForTable 8 字截断 (V1.1 L82-87)
 *  - 文件名 .docx → .md 强制 (V1.1 L261)
 */
import { computed, defineComponent } from 'vue'
import { Edit2, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'
import { btnGhost } from '@/views/production/constants/buttonStyles'
import {
  batchStatusColors,
  batchStatusLabels,
  executionStatusColors,
  executionStatusLabels,
  PlanTypeLabels as planTypeLabels,
  PlanTypeColors as planTypeColors,
  SEED_BREEDING_MODES,
  SEEDLING_MODES,
  PLANTING_MODES,
} from './constants'

// 2026-06-10: 全局 plantingMode value→label 映射兜底（旧数据/拼写不一致都能命中）
// 1:1 V1.1 L60-66
const ALL_MODE_LABELS = (() => {
  const m = {}
  ;[...SEED_BREEDING_MODES, ...SEEDLING_MODES, ...PLANTING_MODES].forEach(opt => {
    m[opt.value] = opt.label
  })
  return m
})()

export default defineComponent({
  name: 'ProductionTable',
  components: {
    Edit2,
    Download,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
  },
  props: {
    filteredBatches: { type: Array, default: () => [] },
    currentPage: { type: Number, default: 1 },
    pageSize: { type: Number, default: 10 },
    exportMode: { type: Boolean, default: false },
    batchEditMode: { type: Boolean, default: false },
    batchDeleteMode: { type: Boolean, default: false },
    selectedRows: { type: Array, default: () => [] },
    pageChangeHandler: { type: Function, required: true },
    pageSizeChangeHandler: { type: Function, required: true },
    selectRowHandler: { type: Function, required: true },
    selectAllHandler: { type: Function, required: true },
    batchSelectAllHandler: { type: Function, required: true },
    batchDeleteSelectAllHandler: { type: Function, required: true },
    batchCodeClickHandler: { type: Function, required: true },
    editHandler: { type: Function, required: true },
    deleteHandler: { type: Function, required: true },
  },
  emits: [
    'pageChange',
    'pageSizeChange',
    'selectRow',
    'selectAll',
    'batchSelectAll',
    'batchDeleteSelectAll',
    'batchCodeClick',
    'edit',
    'delete',
  ],
  setup(props, { emit }) {
    const pageSizeOptions = [10, 20, 50]

    const pageCount = computed(() => Math.ceil(props.filteredBatches.length / props.pageSize))

    const displayedBatches = computed(() =>
      props.filteredBatches.slice(
        (props.currentPage - 1) * props.pageSize,
        props.currentPage * props.pageSize
      )
    )

    const allSelectedForExport = computed(
      () => props.selectedRows.length === props.filteredBatches.length && props.filteredBatches.length > 0
    )

    // 1:1 V1.1 L91：批量编辑全选只统计可编辑批次（非 completed/cancelled）
    const allSelectedForBatchEdit = computed(() => {
      const selectable = props.filteredBatches.filter(
        (b) => b.batchStatus !== 'completed' && b.batchStatus !== 'cancelled'
      )
      return props.selectedRows.length === selectable.length && selectable.length > 0
    })

    // 1:1 V1.1 L93-94：所有批次都可删除
    const allSelectedForBatchDelete = computed(
      () => props.selectedRows.length === props.filteredBatches.length && props.filteredBatches.length > 0
    )

    const visiblePages = computed(() => {
      const pages = []
      const total = pageCount.value || 1
      const current = props.currentPage
      const maxVisible = 5
      let start = Math.max(1, current - Math.floor(maxVisible / 2))
      const end = Math.min(total, start + maxVisible - 1)
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
        props.pageSizeChangeHandler(v)
        props.pageChangeHandler(1)
      },
    })

    function getRowClassName(batch) {
      let className = 'hover:bg-blue-100 transition-colors '
      if (
        props.batchEditMode &&
        (batch.batchStatus === 'completed' || batch.batchStatus === 'cancelled')
      ) {
        className += 'bg-gray-50 '
      }
      return className
    }

    function handleBatchEditRowToggle(batch) {
      if (batch.batchStatus !== 'completed' && batch.batchStatus !== 'cancelled') {
        props.selectRowHandler(batch.id)
      }
    }

    /**
     * 渲染生产模式 - 1:1 V1.1 L68-76
     * @param {Object} batch
     * @returns {string}
     */
    function renderPlantingMode(batch) {
      const raw = batch.plantingMode
      if (!raw) return '-'
      const labels = String(raw)
        .split(',')
        .map(v => v.trim())
        .filter(Boolean)
        .map(v => ALL_MODE_LABELS[v] || v)
      return labels.length > 0 ? labels.join('、') : '-'
    }

    /**
     * 列表长字段截断（默认最多 8 个汉字 + …） - 1:1 V1.1 L82-87
     * @param {string|null|undefined} text
     * @param {number} [maxChars]
     * @returns {string}
     */
    function truncateForTable(text, maxChars = 8) {
      if (text === null || text === undefined) return '-'
      const s = String(text)
      if (s.length <= maxChars) return s
      return s.slice(0, maxChars) + '…'
    }

    /**
     * 发布时间截 YYYY-MM-DD - 1:1 V1.1 L226-231
     * @param {Object} batch
     * @returns {string}
     */
    function formatPublishDate(batch) {
      const v = batch.publishDate || batch.createTime
      if (!v) return '-'
      return v.includes('T') ? v.split('T')[0] : v.slice(0, 10)
    }

    /**
     * 下载生产计划文件 - 1:1 V1.1 L258-274
     * M-05: 一律下载为 .md 文件（planDetail 是 markdown 字符串）
     * 之前后缀保留 .docx 但内容是 markdown，Word 打开报错
     * @param {Object} batch
     */
    function downloadPlanFile(batch) {
      const fileName = batch.planDetailFileName.replace(/\.docx$/i, '.md')
      const content =
        batch.planDetail ||
        `# ${batch.batchCode}\n\n批次号：${batch.batchCode}\n作物名称：${batch.cropName}\n作物品种：${batch.variety}\n种植区域：${batch.greenhouseName}\n种植面积：${batch.plantingArea} m²\n种植模式：${batch.plantingMode}\n负责人：${batch.responsiblePerson}\n开始时间：${batch.startDate}\n预计结束时间：${batch.expectedHarvestDate}\n目标产量：${batch.targetYield} kg\n当前状态：${batchStatusLabels[batch.batchStatus || 'draft']}`
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    function onPageChange(page) {
      props.pageChangeHandler(page)
    }
    function onSelectRow(id) {
      props.selectRowHandler(id)
    }
    function onSelectAll() {
      props.selectAllHandler()
    }
    function onBatchSelectAll() {
      props.batchSelectAllHandler()
    }
    function onBatchDeleteSelectAll() {
      props.batchDeleteSelectAllHandler()
    }
    function onBatchCodeClick(batch) {
      props.batchCodeClickHandler(batch)
    }
    function onEdit(batch) {
      props.editHandler(batch)
    }

    return {
      pageSizeOptions,
      pageCount,
      displayedBatches,
      allSelectedForExport,
      allSelectedForBatchEdit,
      allSelectedForBatchDelete,
      visiblePages,
      localPageSize,
      getRowClassName,
      handleBatchEditRowToggle,
      renderPlantingMode,
      truncateForTable,
      formatPublishDate,
      downloadPlanFile,
      onPageChange,
      onSelectRow,
      onSelectAll,
      onBatchSelectAll,
      onBatchDeleteSelectAll,
      onBatchCodeClick,
      onEdit,
      Edit2,
      Download,
      ChevronLeft,
      ChevronRight,
      ChevronsLeft,
      ChevronsRight,
      btnGhost,
      batchStatusColors,
      batchStatusLabels,
      executionStatusColors,
      executionStatusLabels,
      planTypeColors,
      planTypeLabels,
    }
  },
})
</script>

<style scoped>
/* 表头复选框样式 - 白色边框（蓝底白字风格） */
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

/* 表格内容复选框样式 - 默认边框颜色加深 */
:deep(.el-checkbox__inner) {
  border-color: #374151;
}
:deep(.el-checkbox:hover .el-checkbox__inner) {
  border-color: #1e3a8a;
}
</style>
