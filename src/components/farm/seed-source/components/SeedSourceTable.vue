<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- 右上角操作按钮栏 -->
    <div class="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">种源列表</h3>
      <div class="flex items-center gap-2">
        <!-- 导出模式 -->
        <template v-if="exportMode">
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <el-button type="primary" size="small" @click="$emit('confirmExport')" :disabled="selectedRows.length === 0">
            <el-icon><Download /></el-icon>
            确认导出
          </el-button>
          <el-button size="small" @click="$emit('cancelExport')">
            取消
          </el-button>
        </template>

        <!-- 编辑模式 -->
        <template v-else-if="operationMode === 'edit'">
          <span class="text-sm text-gray-500 mr-2">请在表格中选择一条记录</span>
          <el-button type="primary" size="small" @click="executeOperation('edit')" :disabled="selectedRows.length === 0">
            <el-icon><Edit /></el-icon>
            确认编辑
          </el-button>
          <el-button size="small" @click="cancelOperation">
            取消
          </el-button>
        </template>

        <!-- 删除模式 -->
        <template v-else-if="operationMode === 'delete'">
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <el-button type="danger" size="small" @click="executeOperation('delete')" :disabled="selectedRows.length === 0">
            <el-icon><Delete /></el-icon>
            确认删除
          </el-button>
          <el-button size="small" @click="cancelOperation">
            取消
          </el-button>
        </template>

        <!-- 打印模式 -->
        <template v-else-if="printMode">
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <el-button type="primary" size="small" @click="confirmPrint" :disabled="selectedRows.length === 0">
            <el-icon><Printer /></el-icon>
            确认打印
          </el-button>
          <el-button size="small" @click="cancelPrintMode">
            取消
          </el-button>
        </template>

        <!-- 正常模式 -->
        <template v-else>
          <el-button v-if="canCreate" type="primary" size="small" @click="$emit('add')">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
          <el-button v-if="canEdit" size="small" @click="$emit('operationModeChange', 'edit')">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button v-if="canDelete" type="danger" size="small" @click="$emit('operationModeChange', 'delete')">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
          <el-button v-if="canExport" size="small" @click="$emit('export')">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <el-button v-if="canPrint" size="small" @click="$emit('printModeChange', true)">
            <el-icon><Printer /></el-icon>
            标签打印
          </el-button>
        </template>
      </div>
    </div>

    <!-- 表格 -->
    <el-table
      :data="paginatedData"
      @selection-change="handleSelectionChange"
      style="width: 100%"
      v-loading="loading"
      row-key="id"
      :header-cell-style="{ background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: 'white', fontWeight: '600' }"
    >
      <el-table-column v-if="showCheckbox" type="selection" width="55" align="center" />
      <el-table-column prop="seedCode" label="种源批号" width="150" align="center">
        <template #default="{ row }">
          <el-button type="primary" link @click="$emit('detail', row)">{{ row.seedCode }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="productionPlanCode" label="关联生产计划" width="150" align="center">
        <template #default="{ row }">
          <span v-if="row.productionPlanCode" class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium">
            {{ row.productionPlanCode }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="cropCode" label="作物编码" width="120" align="center">
        <template #default="{ row }">
          <span class="font-mono text-orange-600">{{ row.cropCode || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="cropName" label="作物品种" width="120" align="center" />
      <el-table-column prop="cropCategory" label="品种路径" width="120" align="center">
        <template #default="{ row }">
          <span>{{ row.typeName ? `${row.cropCategory} > ${row.typeName}` : row.cropCategory }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="sourceType" label="种源类型" width="100" align="center">
        <template #default="{ row }">
          {{ getSourceTypeLabel(row.sourceType) }}
        </template>
      </el-table-column>
      <el-table-column prop="propagationType" label="来源途径" width="120" align="center">
        <template #default="{ row }">
          <div class="flex flex-col gap-1">
            <template v-if="row.propagationType && row.propagationType !== 'external'">
              <span :class="getPropagationTypeClass(row.propagationType)">
                {{ getPropagationTypeLabel(row.propagationType) }}
              </span>
              <span v-if="row.propagationStatus" :class="getPropagationStatusClass(row.propagationStatus)">
                {{ getPropagationStatusLabel(row.propagationStatus) }}
              </span>
            </template>
            <span v-else>{{ row.sourceOrigin || '-' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="supplierName" label="供应商" width="120" align="center">
        <template #default="{ row }">
          {{ row.supplierName || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="purchaseDate" label="采购/入库日期" width="120" align="center" />
      <el-table-column prop="initialCount" label="入库数量" width="100" align="right">
        <template #default="{ row }">
          <span class="text-emerald-600">{{ row.initialCount.toLocaleString() }} {{ row.unit }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="availableCount" label="剩余数量" width="100" align="right">
        <template #default="{ row }">
          {{ row.availableCount.toLocaleString() }} {{ row.unit }}
        </template>
      </el-table-column>
      <el-table-column prop="completionRate" label="完成比例" width="100" align="center">
        <template #default="{ row }">
          <span :class="getCompletionRateClass(row)">
            {{ getCompletionRate(row) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right" align="center">
        <template #default="{ row }">
          <div class="flex gap-1 justify-center">
            <el-button link type="primary" size="small" @click="$emit('detail', row)" title="查看详情">
              <el-icon><View /></el-icon>
            </el-button>
            <!-- 繁殖途径操作按钮（非外购 + 未完成时显示） -->
            <template v-if="row.propagationType && row.propagationType !== 'external' && row.propagationStatus !== 'completed'">
              <el-button link type="primary" size="small" @click="$emit('propagationRecord', row)" title="过程记录">
                <el-icon><Document /></el-icon>
              </el-button>
              <el-button link type="primary" size="small" @click="$emit('propagationStage', row)" title="阶段推进">
                <el-icon><Connection /></el-icon>
              </el-button>
            </template>
            <el-button link type="success" size="small" @click="$emit('end', row, 'normal')" title="正常结束">
              <el-icon><CircleCheck /></el-icon>
            </el-button>
            <el-button link type="warning" size="small" @click="$emit('end', row, 'abnormal')" title="异常结束">
              <el-icon><CircleClose /></el-icon>
            </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="remarks" label="备注" width="120" align="center">
        <template #default="{ row }">
          {{ row.remarks || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="createBy" label="创建人" width="100" align="center" />
    </el-table>

    <!-- 分页 -->
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="data.length"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Plus, Download, View, Edit, Delete, Printer, Filter, Document, Connection, CircleCheck, CircleClose } from '@element-plus/icons-vue'

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
  'selectionChange', 'pageChange', 'sizeChange', 'add', 'edit', 'delete',
  'detail', 'export', 'print', 'confirmExport', 'cancelExport',
  'operationModeChange', 'printModeChange', 'confirmPrint',
  'imageClick', 'end', 'propagationRecord', 'propagationStage'
])

// 是否显示复选框
const showCheckbox = computed(() => {
  return props.operationMode !== 'normal' || props.exportMode || props.printMode
})

// 分页数据
const paginatedData = computed(() => {
  const start = (props.pagination.current - 1) * props.pagination.pageSize
  const end = start + props.pagination.pageSize
  return props.data.slice(start, end)
})

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

// 库存状态映射
const STOCK_STATUS_MAP = {
  'sufficient': { label: '充足', type: 'success' },
  'low': { label: '不足', type: 'warning' },
  'depleted': { label: '耗尽', type: 'danger' }
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

const getStatusLabel = (status) => STOCK_STATUS_MAP[status]?.label || status || '-'
const getStatusType = (status) => STOCK_STATUS_MAP[status]?.type || 'info'

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

const handleSelectionChange = (selection) => {
  emit('selectionChange', selection.map(item => item.id))
}

const handlePageChange = (page) => {
  emit('pageChange', page)
}

const handleSizeChange = (size) => {
  emit('sizeChange', size)
}

const getFirstSelectedRecord = () => {
  if (props.selectedRows.length === 0) return null
  return props.data.find(r => r.id === props.selectedRows[0]) || null
}

const executeOperation = (op) => {
  const record = getFirstSelectedRecord()
  if (!record) {
    return
  }
  if (op === 'edit') {
    emit('edit', record)
  } else if (op === 'delete') {
    emit('delete', props.selectedRows)
  }
  emit('operationModeChange', 'normal')
  emit('selectionChange', [])
}

const cancelOperation = () => {
  emit('operationModeChange', 'normal')
  emit('selectionChange', [])
}

const cancelPrintMode = () => {
  emit('printModeChange', false)
  emit('selectionChange', [])
}

const confirmPrint = () => {
  const selectedRecords = props.data.filter(item => props.selectedRows.includes(item.id))
  emit('confirmPrint', selectedRecords)
}
</script>
