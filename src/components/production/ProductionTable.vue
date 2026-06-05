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
                class="text-blue-600 hover:text-blue-800 hover:underline"
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
            <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{{ batch.cropName }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ batch.variety }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
              {{ batch.greenhouseName || batch.supplierName || batch.seedlingSiteName || '-' }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ batch.startDate }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ batch.expectedHarvestDate || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ batch.responsiblePerson }}</td>
            <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-medium">
              {{ `${batch.targetYield || 0} ${batch.unit || 'kg'}` }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ batch.publisher || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ batch.publishDate || '-' }}</td>
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
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ batch.orderCode || '-' }}</td>
            <td
              class="px-4 py-3 text-sm text-gray-600 max-w-xs truncate"
              :title="batch.remarks || ''"
            >
              {{ batch.remarks || '-' }}
            </td>
            <td class="px-4 py-3 text-sm whitespace-nowrap">
              <template v-if="batch.planDetailFileName">
                <button
                  class="text-blue-600 hover:text-blue-800"
                  title="点击下载生产计划文件"
                  @click="downloadPlanFile(batch)"
                >
                  {{ batch.planDetailFileName }}
                </button>
              </template>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <button
                  v-if="batch.batchStatus !== 'completed' && batch.batchStatus !== 'cancelled'"
                  class="inline-flex h-8 w-8 items-center justify-center rounded text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  title="编辑"
                  @click="onEdit(batch)"
                >
                  <Pencil class="w-4 h-4" />
                </button>
                <button
                  class="inline-flex h-8 w-8 items-center justify-center rounded text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
                  title="删除"
                  @click="onDeleteClick(batch)"
                >
                  <Trash2 class="w-4 h-4" />
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
            class="text-sm text-blue-600 hover:text-blue-800 hover:underline"
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
            class="text-sm text-blue-600 hover:text-blue-800 hover:underline"
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
            class="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            @click="onBatchDeleteSelectAll"
          >
            {{ allSelectedForBatchDelete ? '全不选' : '全选' }}
          </button>
          <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项（草稿/已作废可删除）</span>
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
 * ProductionTable - 生产计划列表表格（复合组件）
 * 1:1 翻译自 V1.1 src/components/production/ProductionTable.tsx
 *
 * Props:
 * - filteredBatches: 过滤后的批次列表
 * - currentPage: 当前页
 * - pageSize: 每页条数
 * - exportMode: 是否处于导出模式
 * - batchEditMode: 是否处于批量编辑模式
 * - batchDeleteMode: 是否处于批量删除模式
 * - selectedRows: 已选中的批次 ID 列表
 *
 * Emits:
 * - pageChange(page): 页码变化
 * - pageSizeChange(size): 每页条数变化
 * - selectRow(id): 单行选择
 * - selectAll(): 全选/全不选（导出模式）
 * - batchSelectAll(): 全选/全不选（批量编辑模式）
 * - batchDeleteSelectAll(): 全选/全不选（批量删除模式）
 * - batchCodeClick(batch): 点击批次号查看详情
 * - edit(batch): 编辑单行
 * - delete(batch): 删除单行
 */
import { computed, defineComponent } from 'vue'
import { Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'
import {
  batchStatusColors,
  batchStatusLabels,
  executionStatusColors,
  executionStatusLabels,
  PlanTypeLabels as planTypeLabels,
  PlanTypeColors as planTypeColors,
} from './constants'
import { showConfirm } from '@/lib/dialogService'

/**
 * @typedef {import('./constants').PlanType} PlanType
 */

/**
 * @typedef {Object} CropBatch
 * @property {string} id
 * @property {string} batchCode
 * @property {string} cropName
 * @property {string} variety
 * @property {string} [greenhouseName]
 * @property {string} [supplierName]
 * @property {string} [seedlingSiteName]
 * @property {string} startDate
 * @property {string} [expectedHarvestDate]
 * @property {string} responsiblePerson
 * @property {number} [targetYield]
 * @property {string} [unit]
 * @property {string} [publisher]
 * @property {string} [publishDate]
 * @property {'draft' | 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled' | 'rejected'} [batchStatus]
 * @property {PlanType} [planType]
 * @property {'pending_execution' | 'in_progress' | 'completed'} [executionStatus]
 * @property {string} [orderCode]
 * @property {string} [planDetailFileName]
 * @property {string} [planDetail]
 * @property {number} [plantingArea]
 * @property {string} [plantingMode]
 */

export default defineComponent({
  name: 'ProductionTable',
  // 显式注册 lucide-vue-next 组件到 components map（template 中 <Pencil> 需要这里注册）
  components: {
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
  },
  props: {
    /** @type {{ type: import('vue').PropType<CropBatch[]>, default: () => CropBatch[] }} */
    filteredBatches: { type: Array, default: () => [] },
    /** @type {{ type: Number, default: number }} */
    currentPage: { type: Number, default: 1 },
    /** @type {{ type: Number, default: number }} */
    pageSize: { type: Number, default: 10 },
    /** @type {{ type: Boolean, default: boolean }} */
    exportMode: { type: Boolean, default: false },
    /** @type {{ type: Boolean, default: boolean }} */
    batchEditMode: { type: Boolean, default: false },
    /** @type {{ type: Boolean, default: boolean }} */
    batchDeleteMode: { type: Boolean, default: false },
    /** @type {{ type: import('vue').PropType<string[]>, default: () => string[] }} */
    selectedRows: { type: Array, default: () => [] },
    // 1:1 对应 V1.1 ProductionTableProps line 17-26 所有 callback props
    // 注意：Vue 3 规则 - prop 名以 'on' 开头会被当作 emit 监听器自动 unwrap
    // 所以全部用 xxxHandler 命名避开 'on' 前缀
    /** @type {{ type: Function, required: true }} */
    pageChangeHandler: { type: Function, required: true },
    /** @type {{ type: Function, required: true }} */
    pageSizeChangeHandler: { type: Function, required: true },
    /** @type {{ type: Function, required: true }} */
    selectRowHandler: { type: Function, required: true },
    /** @type {{ type: Function, required: true }} */
    selectAllHandler: { type: Function, required: true },
    /** @type {{ type: Function, required: true }} */
    batchSelectAllHandler: { type: Function, required: true },
    /** @type {{ type: Function, required: true }} */
    batchDeleteSelectAllHandler: { type: Function, required: true },
    /** @type {{ type: Function, required: true }} */
    batchCodeClickHandler: { type: Function, required: true },
    /** @type {{ type: Function, required: true }} */
    editHandler: { type: Function, required: true },
    /** @type {{ type: Function, required: true }} */
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
    // 分页大小选项
    const pageSizeOptions = [10, 20, 50]

    // 总页数
    const pageCount = computed(() => Math.ceil(props.filteredBatches.length / props.pageSize))

    // 当前页显示的批次列表
    const displayedBatches = computed(() =>
      props.filteredBatches.slice(
        (props.currentPage - 1) * props.pageSize,
        props.currentPage * props.pageSize
      )
    )

    // 全选状态 - 导出模式
    const allSelectedForExport = computed(
      () => props.selectedRows.length === props.filteredBatches.length && props.filteredBatches.length > 0
    )

    // 全选状态 - 批量编辑模式（仅统计可编辑的批次：非 completed/cancelled）
    const allSelectedForBatchEdit = computed(() => {
      const selectable = props.filteredBatches.filter(
        (b) => b.batchStatus !== 'completed' && b.batchStatus !== 'cancelled'
      )
      return props.selectedRows.length === selectable.length && selectable.length > 0
    })

    // 全选状态 - 批量删除模式（V1.1逻辑：所有批次都可删除）
    const allSelectedForBatchDelete = computed(
      () => props.selectedRows.length === props.filteredBatches.length && props.filteredBatches.length > 0
    )

    // 可见的页码（用于分页按钮）
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

    // 每页条数（双向同步）
    const localPageSize = computed({
      get: () => props.pageSize,
      set: (v) => {
        // 修复 P0: 与 V1.1 React 风格一致，调用 props.xxxHandler 而非 emit
        props.pageSizeChangeHandler(v)
        props.pageChangeHandler(1)
      },
    })

    /**
     * 获取行 className
     * V1.1 逻辑：编辑模式下，已完成/已作废的行加灰色背景
     * @param {CropBatch} batch
     * @returns {string}
     */
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

    /**
     * 批量编辑模式下，单行 checkbox 切换
     * V1.1 逻辑：仅当批次不是 completed/cancelled 时才触发选中
     * @param {CropBatch} batch
     */
    function handleBatchEditRowToggle(batch) {
      if (batch.batchStatus !== 'completed' && batch.batchStatus !== 'cancelled') {
        // 修复 P0: 与 V1.1 React 风格一致，调用 props.selectRowHandler 而非 emit
        // 之前 emit('selectRow', batch.id) 没有父级监听（父级用 :select-row-handler 接收）
        // 导致单选/多选失效，只能依赖"全选"按钮
        props.selectRowHandler(batch.id)
      }
    }

    /**
     * 处理删除按钮点击（弹确认框后调用 props.deleteHandler 回调）
     * 1:1 对应 V1.1 line 232-236 onClick 内联逻辑
     * @param {CropBatch} batch
     */
    async function onDeleteClick(batch) {
      if (await showConfirm(`确定要删除生产计划 ${batch.batchCode} 吗？`)) {
        props.deleteHandler(batch)
      }
    }

    /**
     * 下载生产计划文件
     * 根据文件名后缀判断 docx / markdown，构造 Blob 下载
     * @param {CropBatch} batch
     */
    function downloadPlanFile(batch) {
      const fileName = batch.planDetailFileName
      const isDocx = fileName.endsWith('.docx')
      const content =
        batch.planDetail ||
        `# ${batch.batchCode}\n\n批次号：${batch.batchCode}\n作物名称：${batch.cropName}\n作物品种：${batch.variety}\n种植区域：${batch.greenhouseName}\n种植面积：${batch.plantingArea} m²\n种植模式：${batch.plantingMode}\n负责人：${batch.responsiblePerson}\n开始时间：${batch.startDate}\n预计结束时间：${batch.expectedHarvestDate}\n目标产量：${batch.targetYield} kg\n当前状态：${batchStatusLabels[batch.batchStatus || 'draft']}`
      const blob = new Blob([content], {
        type: isDocx
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : 'text/markdown',
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

    // ============ 事件透传（callback props 包装）============
    // 1:1 对应 V1.1 onXxx props
    function onPageChange(page) {
      props.pageChangeHandler(page)
    }
    function onPageSizeChange(size) {
      props.pageSizeChangeHandler(size)
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
    // 1:1 对应 V1.1 line 222 onClick={() => onEdit(batch)}
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
      onDeleteClick,
      downloadPlanFile,
      onPageChange,
      onSelectRow,
      onSelectAll,
      onBatchSelectAll,
      onBatchDeleteSelectAll,
      onBatchCodeClick,
      onEdit,
      Pencil,
      Trash2,
      ChevronLeft,
      ChevronRight,
      ChevronsLeft,
      ChevronsRight,
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
