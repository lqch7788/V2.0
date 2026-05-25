<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- 右上角操作按钮栏 - 根据模式显示不同内容 (V1.1结构) -->
    <div class="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">种源列表</h3>
      <div class="flex items-center gap-2">
        <!-- 导出模式 -->
        <template v-if="exportMode">
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            :disabled="selectedRows.length === 0"
            @click="$emit('confirm-export')"
          >
            <Download class="w-4 h-4" />
            确认导出
          </button>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200"
            @click="$emit('export-cancel')"
          >
            取消
          </button>
        </template>
        <!-- 编辑模式 -->
        <template v-else-if="operationMode === 'edit'">
          <span class="text-sm text-gray-500 mr-2">请在表格中选择一条记录</span>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            :disabled="selectedRows.length === 0"
            @click="executeOperation('edit')"
          >
            <Edit2 class="w-4 h-4" />
            确认编辑
          </button>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200"
            @click="cancelOperation"
          >
            取消
          </button>
        </template>
        <!-- 删除模式 -->
        <template v-else-if="operationMode === 'delete'">
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            :disabled="selectedRows.length === 0"
            @click="executeOperation('delete')"
          >
            <Trash2 class="w-4 h-4" />
            确认删除
          </button>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200"
            @click="cancelOperation"
          >
            取消
          </button>
        </template>
        <!-- 打印模式 -->
        <template v-else-if="printMode">
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
            :disabled="selectedRows.length === 0"
            @click="confirmPrint"
          >
            <Printer class="w-4 h-4" />
            确认打印
          </button>
          <button
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200"
            @click="cancelPrintMode"
          >
            取消
          </button>
        </template>
        <!-- 正常模式 - 显示所有操作按钮 -->
        <template v-else>
          <button
            v-if="canCreate"
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            @click="$emit('add')"
          >
            <Plus class="w-4 h-4" />
            新增
          </button>
          <button
            v-if="canEdit"
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
            @click="$emit('operation-mode-change', 'edit')"
          >
            <Edit2 class="w-4 h-4" />
            编辑
          </button>
          <button
            v-if="canDelete"
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700"
            @click="$emit('operation-mode-change', 'delete')"
          >
            <Trash2 class="w-4 h-4" />
            删除
          </button>
          <button
            v-if="canExport"
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            @click="$emit('operation-mode-change', 'export')"
          >
            <Download class="w-4 h-4" />
            导出
          </button>
          <button
            v-if="canPrint"
            class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-purple-600 text-white hover:bg-purple-700"
            @click="$emit('print-mode-change', true)"
          >
            <Printer class="w-4 h-4" />
            标签打印
          </button>
        </template>
      </div>
    </div>

    <!-- 数据表格 - 横向滚动容器 -->
    <div class="overflow-x-auto overflow-y-auto max-h-[calc(100vh-380px)]">
      <table class="min-w-[1600px] w-full table-fixed">
        <!-- 表头 -->
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
          <tr>
            <th v-if="showCheckbox" class="px-4 py-3 text-left text-sm font-semibold w-12 whitespace-nowrap">
              <el-checkbox
                :model-value="selectedRows.length === data.length && data.length > 0"
                class="seed-checkbox"
                @change="onSelectAll"
              />
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold w-36 whitespace-nowrap">种源批号</th>
            <th class="px-4 py-3 text-left text-sm font-semibold w-36 whitespace-nowrap">关联生产计划</th>
            <th class="px-4 py-3 text-left text-sm font-semibold w-28 whitespace-nowrap">作物编码</th>
            <th class="px-4 py-3 text-left text-sm font-semibold w-24 whitespace-nowrap">作物品种</th>
            <th class="px-4 py-3 text-left text-sm font-semibold w-36 whitespace-nowrap">品种路径</th>
            <th class="px-4 py-3 text-left text-sm font-semibold w-24 whitespace-nowrap">种源类型</th>
            <th class="px-4 py-3 text-left text-sm font-semibold w-28 whitespace-nowrap">来源途径</th>
            <th class="px-4 py-3 text-left text-sm font-semibold w-28 whitespace-nowrap">供应商</th>
            <th class="px-4 py-3 text-left text-sm font-semibold w-28 whitespace-nowrap">采购/入库日期</th>
            <th class="px-4 py-3 text-left text-sm font-semibold w-24 whitespace-nowrap">入库数量</th>
            <th class="px-4 py-3 text-left text-sm font-semibold w-24 whitespace-nowrap">剩余数量</th>
            <th class="px-4 py-3 text-left text-sm font-semibold w-20 whitespace-nowrap">完成比例</th>
            <th class="px-4 py-3 text-left text-sm font-semibold w-20 whitespace-nowrap">状态</th>
            <th class="px-4 py-3 text-left text-sm font-semibold w-32 whitespace-nowrap">操作</th>
            <th class="px-4 py-3 text-left text-sm font-semibold w-32 whitespace-nowrap">备注</th>
            <th class="px-4 py-3 text-left text-sm font-semibold w-20 whitespace-nowrap">创建人</th>
          </tr>
        </thead>
        <!-- 表体 -->
        <tbody class="divide-y divide-gray-300">
          <tr v-if="paginatedData.length === 0">
            <td :colspan="showCheckbox ? 17 : 16" class="px-4 py-8 text-center text-gray-500">
              暂无数据
            </td>
          </tr>
          <tr
            v-for="record in paginatedData"
            :key="record.id"
            class="hover:bg-emerald-50 transition-colors"
          >
            <!-- 复选框 -->
            <td v-if="showCheckbox" class="px-4 py-3 w-12">
              <el-checkbox
                :model-value="selectedRows.includes(record.id)"
                class="seed-checkbox"
                @change="() => handleSelectRow(record.id)"
              />
            </td>
            <!-- 种源批号 -->
            <td class="px-4 py-3 text-sm w-36 whitespace-nowrap">
              <button class="text-sm text-blue-600 hover:text-blue-800 hover:underline" title="点击查看详情" @click="$emit('detail', record)">
                {{ record.seedCode || '-' }}
              </button>
            </td>
            <!-- 关联生产计划 -->
            <td class="px-4 py-3 text-sm w-36 whitespace-nowrap">
              <span v-if="record.productionPlanCode" class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                {{ record.productionPlanCode }}
              </span>
              <span v-else class="text-gray-400">-</span>
            </td>
            <!-- 作物编码 -->
            <td class="px-4 py-3 text-sm w-28 whitespace-nowrap">
              <span class="font-mono text-orange-600">{{ record.cropCode || '-' }}</span>
            </td>
            <!-- 作物品种 -->
            <td class="px-4 py-3 text-sm text-gray-900 w-24 whitespace-nowrap">{{ record.cropName || '-' }}</td>
            <!-- 品种路径 -->
            <td class="px-4 py-3 text-sm text-gray-600 w-36 whitespace-nowrap overflow-hidden text-ellipsis" :title="record.typeName ? `${record.cropCategory || ''} > ${record.typeName}` : (record.cropCategory || '-')">
              {{ record.typeName ? `${record.cropCategory || ''} > ${record.typeName}` : (record.cropCategory || '-') }}
            </td>
            <!-- 种源类型 -->
            <td class="px-4 py-3 text-sm text-gray-600 w-24 whitespace-nowrap">{{ getSourceTypeLabel(record.sourceType) }}</td>
            <!-- 来源途径 -->
            <td class="px-4 py-3 w-28 whitespace-nowrap">
              <div class="flex flex-col gap-1">
                <template v-if="record.propagationType && record.propagationType !== 'external'">
                  <span :class="getPropagationTypeClass(record.propagationType)">
                    {{ getPropagationTypeLabel(record.propagationType) }}
                  </span>
                  <span v-if="record.propagationStatus" :class="getPropagationStatusClass(record.propagationStatus)">
                    {{ getPropagationStatusLabel(record.propagationStatus) }}
                  </span>
                </template>
                <span v-else class="text-sm text-gray-600">{{ getSourceOriginLabel(record.sourceOrigin) }}</span>
              </div>
            </td>
            <!-- 供应商 -->
            <td class="px-4 py-3 text-sm text-gray-600 w-28 whitespace-nowrap overflow-hidden text-ellipsis" :title="record.supplierName">{{ record.supplierName || '-' }}</td>
            <!-- 采购/入库日期 -->
            <td class="px-4 py-3 text-sm text-gray-600 w-28 whitespace-nowrap">{{ record.purchaseDate || '-' }}</td>
            <!-- 入库数量 -->
            <td class="px-4 py-3 text-sm text-emerald-600 font-medium w-24 whitespace-nowrap">
              {{ (record.initialCount || 0).toLocaleString() }} {{ record.unit || '' }}
            </td>
            <!-- 剩余数量 -->
            <td class="px-4 py-3 text-sm text-gray-600 w-24 whitespace-nowrap">
              {{ (record.availableCount || 0).toLocaleString() }} {{ record.unit || '' }}
            </td>
            <!-- 完成比例 -->
            <td class="px-4 py-3 text-sm w-20 whitespace-nowrap" :class="getCompletionRateClass(record)">
              {{ getCompletionRate(record) }}
            </td>
            <!-- 状态 -->
            <td class="px-4 py-3 w-20 whitespace-nowrap">
              <span :class="getStatusClass(record.status)">
                {{ getStatusLabel(record.status) }}
              </span>
            </td>
            <!-- 操作 (V1.1: 查看详情、繁殖记录、阶段推进、正常结束、异常结束 - 无行内编辑) -->
            <td class="px-4 py-3 w-32 whitespace-nowrap">
              <div class="flex items-center gap-1">
                <button class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="查看详情" @click="$emit('detail', record)">
                  <Image class="w-4 h-4" />
                </button>
                <template v-if="record.propagationType && record.propagationType !== 'external' && record.propagationStatus !== 'completed'">
                  <button class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="过程记录" @click="$emit('propagationRecord', record)">
                    <ClipboardList class="w-4 h-4" />
                  </button>
                  <button class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors" title="阶段推进" @click="$emit('propagationStage', record)">
                    <GitBranch class="w-4 h-4" />
                  </button>
                </template>
                <button class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors" title="正常结束" @click="$emit('end', record, 'normal')">
                  <CheckCircle class="w-4 h-4" />
                </button>
                <button class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="异常结束" @click="$emit('end', record, 'abnormal')">
                  <XCircle class="w-4 h-4" />
                </button>
              </div>
            </td>
            <!-- 备注 -->
            <td class="px-4 py-3 text-sm text-gray-500 w-32 whitespace-nowrap overflow-hidden text-ellipsis" :title="record.remarks">
              {{ record.remarks || '-' }}
            </td>
            <!-- 创建人 -->
            <td class="px-4 py-3 text-sm text-gray-600 w-20 whitespace-nowrap">{{ record.createBy || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">每页</span>
        <el-select v-model="localPagination.pageSize" class="w-20" size="small" @change="handlePageSizeChange">
          <el-option label="10" :value="10" />
          <el-option label="20" :value="20" />
          <el-option label="50" :value="50" />
        </el-select>
        <span class="text-sm text-gray-500">条</span>
        <span class="text-sm text-gray-500 ml-2">共 {{ data.length }} 条</span>
      </div>
      <div class="flex items-center gap-1">
        <button
          class="p-2 rounded-lg transition-colors"
          :class="localPagination.current === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'"
          :disabled="localPagination.current === 1"
          @click="onPageChange(1)"
        >
          <ChevronsLeft class="w-4 h-4" />
        </button>
        <button
          class="p-2 rounded-lg transition-colors"
          :class="localPagination.current === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'"
          :disabled="localPagination.current === 1"
          @click="onPageChange(localPagination.current - 1)"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
        <template v-for="(page, index) in visiblePages" :key="`${page}-${index}`">
          <button
            v-if="typeof page === 'number'"
            class="min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors"
            :class="localPagination.current === page ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'"
            @click="onPageChange(page)"
          >
            {{ page }}
          </button>
          <span v-else class="px-2 text-gray-400">{{ page }}</span>
        </template>
        <button
          class="p-2 rounded-lg transition-colors"
          :class="localPagination.current >= totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'"
          :disabled="localPagination.current >= totalPages"
          @click="onPageChange(localPagination.current + 1)"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
        <button
          class="p-2 rounded-lg transition-colors"
          :class="localPagination.current >= totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'"
          :disabled="localPagination.current >= totalPages"
          @click="onPageChange(totalPages)"
        >
          <ChevronsRight class="w-4 h-4" />
        </button>
        <span class="text-sm text-gray-500 ml-2">共 {{ totalPages }} 页</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import { Image, ClipboardList, GitBranch, CheckCircle, XCircle, Download, Edit2, Trash2, Printer, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  pagination: {
    type: Object,
    default: () => ({ current: 1, pageSize: 10 })
  },
  selectedRows: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  operationMode: {
    type: String,
    default: 'normal'
  },
  exportMode: {
    type: Boolean,
    default: false
  },
  printMode: {
    type: Boolean,
    default: false
  },
  canCreate: Boolean,
  canEdit: Boolean,
  canDelete: Boolean,
  canExport: Boolean,
  canPrint: Boolean
})

const emit = defineEmits([
  'selection-change', 'page-change', 'size-change', 'add', 'edit', 'delete', 'batch-edit',
  'detail', 'export', 'print', 'confirm-export', 'export-cancel',
  'operation-mode-change', 'print-mode-change', 'confirm-print',
  'image-click', 'end', 'propagation-record', 'propagation-stage',
  'update:pagination', 'update:selectedRows',
  'propagation-record', 'propagation-stage'
])

// 本地分页状态
const localPagination = ref({ ...props.pagination })

watch(() => props.pagination, (val) => {
  localPagination.value = { ...val }
}, { deep: true })

watch(localPagination, (val) => {
  emit('update:pagination', { ...val })
}, { deep: true })

// 是否显示复选框
const showCheckbox = computed(() => {
  return props.operationMode !== 'normal' || props.exportMode || props.printMode
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(props.data.length / localPagination.value.pageSize) || 1
})

// 可见页码
const visiblePages = computed(() => {
  const current = localPagination.value.current
  const total = totalPages.value
  const pages = []
  const showEllipsis = total > 7

  if (!showEllipsis) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    if (current > 3) {
      pages.push('...')
    }
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    if (current < total - 2) {
      pages.push('...')
    }
    if (total > 1) {
      pages.push(total)
    }
  }
  return pages
})

// 分页数据
const paginatedData = computed(() => {
  const start = (localPagination.value.current - 1) * localPagination.value.pageSize
  const end = start + localPagination.value.pageSize
  return props.data.slice(start, end)
})

// 获取选中的第一条记录
const getFirstSelectedRecord = () => {
  if (props.selectedRows.length === 0) return null
  return props.data.find(r => r.id === props.selectedRows[0]) || null
}

// 执行业务操作
const executeOperation = (op) => {
  if (props.selectedRows.length === 0) {
    ElMessage.warning('请先在表格中选择记录')
    return
  }
  if (op === 'edit') {
    if (props.selectedRows.length > 1) {
      // 批量编辑模式
      emit('batch-edit', props.selectedRows)
    } else {
      // 单条编辑模式
      const record = getFirstSelectedRecord()
      if (record) {
        emit('edit', record)
      }
    }
  } else if (op === 'delete') {
    emit('delete', props.selectedRows)
  }
  // 操作完成后重置模式
  emit('operation-mode-change', 'normal')
  emit('selection-change', [])
}

// 取消操作
const cancelOperation = () => {
  emit('operation-mode-change', 'normal')
  emit('selection-change', [])
}

// 取消打印模式
const cancelPrintMode = () => {
  emit('print-mode-change', false)
  emit('selection-change', [])
}

// 确认打印
const confirmPrint = () => {
  if (props.selectedRows.length === 0) {
    ElMessage.warning('请先选择要打印的记录')
    return
  }
  const selectedRecords = props.data.filter(item => props.selectedRows.includes(item.id))
  emit('confirm-print', selectedRecords)
  emit('print-mode-change', false)
  emit('selection-change', [])
}

// 选择行
function handleSelectRow(id) {
  const rows = [...props.selectedRows]
  const index = rows.indexOf(id)
  if (index > -1) {
    rows.splice(index, 1)
  } else {
    rows.push(id)
  }
  emit('update:selectedRows', rows)
  emit('selection-change', rows)
}

// 全选
function onSelectAll() {
  if (props.selectedRows.length === props.data.length) {
    emit('update:selectedRows', [])
    emit('selection-change', [])
  } else {
    const allIds = props.data.map(item => item.id)
    emit('update:selectedRows', allIds)
    emit('selection-change', allIds)
  }
}

// 翻页
function onPageChange(page) {
  if (page < 1 || page > totalPages.value) return
  localPagination.value = { ...localPagination.value, current: page }
  emit('page-change', page)
}

// 每页条数变化
function handlePageSizeChange(size) {
  localPagination.value = { pageSize: size, current: 1 }
  emit('size-change', size)
}

// 源类型映射
const SOURCE_TYPE_MAP = {
  'seed': '种子',
  'seedling': '种苗/实生苗',
  'cutting': '扦插苗',
  'grafting': '嫁接苗',
  'tissue_culture': '组培苗',
  'split': '分株苗',
  'bulb': '种球/球根',
  'self_produced': '自繁苗',
  'external': '外购苗',
  'other': '其他'
}

// 来源途径映射
const SOURCE_ORIGIN_MAP = {
  'external_purchase': '外部采购',
  'self_produced': '自产',
  'other': '其他'
}

// 库存状态映射
const STOCK_STATUS_MAP = {
  'sufficient': { label: '充足', bg: 'bg-green-100', text: 'text-green-700' },
  'low': { label: '不足', bg: 'bg-amber-100', text: 'text-amber-700' },
  'depleted': { label: '耗尽', bg: 'bg-red-100', text: 'text-red-700' },
  'active': { label: '活跃', bg: 'bg-blue-100', text: 'text-blue-700' },
  'inactive': { label: '已用完', bg: 'bg-gray-100', text: 'text-gray-500' }
}

// 繁殖途径映射
const PROPAGATION_TYPE_LABELS = {
  'external': '外购入库',
  'breeding': '育种计划',
  'seed_saving': '种植留种',
  'asexual': '无性繁殖'
}

const PROPAGATION_TYPE_CLASSES = {
  'external': 'bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs',
  'breeding': 'bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-xs',
  'seed_saving': 'bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs',
  'asexual': 'bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-xs'
}

const PROPAGATION_STATUS_LABELS = {
  'planned': '已计划',
  'in_progress': '进行中',
  'harvested': '已采收',
  'quality_checked': '已质检',
  'completed': '已入库',
  'failed': '失败'
}

const PROPAGATION_STATUS_CLASSES = {
  'planned': 'bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs',
  'in_progress': 'bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs',
  'harvested': 'bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs',
  'quality_checked': 'bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-xs',
  'completed': 'bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-xs',
  'failed': 'bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-xs'
}

// 方法
const getSourceTypeLabel = (type) => SOURCE_TYPE_MAP[type] || type || '-'
const getSourceOriginLabel = (origin) => SOURCE_ORIGIN_MAP[origin] || origin || '-'

const getStatusLabel = (status) => STOCK_STATUS_MAP[status]?.label || status || '-'
const getStatusClass = (status) => {
  const style = STOCK_STATUS_MAP[status]
  if (!style) return 'px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full'
  return `${style.bg} ${style.text} px-2 py-1 text-xs rounded-full`
}

const getPropagationTypeLabel = (type) => PROPAGATION_TYPE_LABELS[type] || type || '-'
const getPropagationTypeClass = (type) => PROPAGATION_TYPE_CLASSES[type] || 'bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs'
const getPropagationStatusLabel = (status) => PROPAGATION_STATUS_LABELS[status] || status || '-'
const getPropagationStatusClass = (status) => PROPAGATION_STATUS_CLASSES[status] || 'bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs'

const getCompletionRate = (row) => {
  if (row.initialCount > 0) {
    return Math.round(row.availableCount / row.initialCount * 100) + '%'
  }
  return '-'
}

const getCompletionRateClass = (row) => {
  if (row.initialCount <= 0) return 'text-gray-400'
  const rate = row.availableCount / row.initialCount
  if (rate >= 0.8) return 'text-green-600 font-medium'
  if (rate >= 0.5) return 'text-amber-600 font-medium'
  return 'text-red-600 font-medium'
}

// 引入ElMessage用于提示
import { ElMessage } from 'element-plus'
</script>

<style scoped>
/* 加深导出模式复选框默认边框颜色 */
:deep(.seed-checkbox .el-checkbox__inner) {
  border-color: #374151;
}

:deep(.seed-checkbox:hover .el-checkbox__inner) {
  border-color: #059669;
}
</style>
