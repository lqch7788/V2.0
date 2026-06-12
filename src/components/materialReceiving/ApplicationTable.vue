<template>
  <!-- 数据表格 -->
  <div class="bg-white rounded-xl shadow-sm overflow-hidden mt-4">
    <!-- 表格头部操作区 -->
    <div class="p-4 border-b border-gray-100 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">领料申请单列表</h3>
      <!-- 导出模式 -->
      <div v-if="exportMode" class="flex gap-2">
        <el-button size="small" type="primary" @click="$emit('export-click')">
          <el-icon><Download /></el-icon>
          确认导出
        </el-button>
        <el-button size="small" @click="$emit('cancel-export')">取消</el-button>
      </div>
      <!-- 批量编辑模式 -->
      <div v-else-if="batchEditMode === 'edit'" class="flex gap-2">
        <el-button
          size="small"
          type="primary"
          @click="handleBatchEditConfirm"
        >
          确认编辑
        </el-button>
        <el-button size="small" @click="$emit('batch-cancel')">取消</el-button>
      </div>
      <!-- 批量删除模式 -->
      <div v-else-if="batchEditMode === 'delete'" class="flex gap-2">
        <el-button size="small" type="danger" @click="$emit('batch-delete-confirm')">
          确认删除
        </el-button>
        <el-button size="small" @click="$emit('batch-cancel')">取消</el-button>
      </div>
      <!-- 默认模式 -->
      <div v-else class="flex gap-2">
        <el-button size="small" type="primary" @click="$emit('add-modal-open')">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
        <el-button size="small" type="primary" @click="handleBatchEditClick">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
        <el-button size="small" type="danger" @click="$emit('batch-delete')">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
        <el-button size="small" @click="$emit('export-mode-change', true)">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <!-- 表格内容 -->
    <el-table
      :data="paginatedData"
      stripe
      @expand-change="handleExpandChange"
      :expand-row-keys="expandedRows"
      row-key="id"
    >
      <!-- 选择列 -->
      <el-table-column
        v-if="exportMode || batchEditMode"
        type="selection"
        width="55"
      />
      <!-- 展开列 -->
      <el-table-column type="expand" width="50">
        <template #default="{ row }">
          <div class="p-4 bg-gray-50">
            <div class="text-sm">
              <div class="font-medium text-blue-800 mb-2">物料明细</div>
              <el-table :data="row.materials" size="small" border>
                <el-table-column prop="materialCode" label="物料编码" min-width="120">
                  <template #default="{ row }">
                    <span class="font-mono">{{ row.materialCode }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="materialName" label="物料名称" min-width="100" />
                <el-table-column prop="batchNo" label="批次号" min-width="100" />
                <el-table-column prop="spec" label="规格" min-width="80" />
                <el-table-column prop="unit" label="单位" width="60" />
                <el-table-column prop="requestedQuantity" label="申领数量" width="90">
                  <template #default="{ row }">
                    <span :class="row.requestedQuantity > row.stockQuantity ? 'text-red-600 font-bold' : ''">
                      {{ row.requestedQuantity }}
                      <span v-if="row.requestedQuantity > row.stockQuantity" class="text-red-600">⚠️</span>
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="stockQuantity" label="当前库存" width="90" />
                <el-table-column prop="unitPrice" label="单价(元)" width="90">
                  <template #default="{ row }">
                    {{ (row.unitPrice || 0).toFixed(2) }}
                  </template>
                </el-table-column>
                <el-table-column label="小计(元)" width="90">
                  <template #default="{ row }">
                    {{ (row.requestedQuantity * row.unitPrice || 0).toFixed(2) }}
                  </template>
                </el-table-column>
                <el-table-column prop="warehousePosition" label="仓库货位" min-width="100" />
                <el-table-column prop="remark" label="备注" min-width="100" />
              </el-table>
            </div>
          </div>
        </template>
      </el-table-column>

      <!-- 数据列 -->
      <el-table-column prop="code" label="领料单号" min-width="150">
        <template #default="{ row }">
          <span
            class="text-blue-600 cursor-pointer hover:text-blue-800 underline font-medium"
            @click="$emit('view', row)"
          >
            {{ row.code }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="date" label="申请日期" min-width="120" />
      <el-table-column prop="applicant" label="申请人" min-width="100" />
      <el-table-column prop="department" label="部门" min-width="100" />
      <el-table-column prop="warehouseLocation" label="库存地点" min-width="100" />
      <el-table-column label="物料种类" min-width="100">
        <template #default="{ row }">
          {{ row.materials?.length > 0 ? `${row.materials.length}种` : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="plantArea" label="种植区域/用途" min-width="120" />
      <el-table-column prop="reviewer" label="审核人" min-width="100" />
      <el-table-column prop="productionBatchCode" label="生产计划批次号" min-width="140" />
      <el-table-column label="状态" min-width="120">
        <template #default="{ row }">
          <span
            class="inline-flex px-2 py-1 rounded-full text-xs font-medium"
            :class="getStatusBadgeClass(row.statusClass)"
          >
            {{ row.status }}
          </span>
          <div v-if="row.statusClass === 'rejected' && row.rejectReason" class="text-xs text-red-600 mt-1 max-w-[150px] truncate" :title="row.rejectReason">
            原因：{{ row.rejectReason }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="100">
        <template #default="{ row }">
          {{ row.materials?.length > 0 ? row.materials[0].remark : '-' }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 导出模式底部选择栏 -->
    <div
      v-if="exportMode && selectedRows.length > 0"
      class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50"
    >
      <div class="flex items-center gap-4">
        <el-button link size="small" @click="$emit('select-all')">
          {{ selectedRows.length === filteredData.length ? '全不选' : '全选' }}
        </el-button>
        <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
      </div>
    </div>

    <!-- 分页 -->
    <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">每页</span>
        <el-select
          v-model="localPageSize"
          style="width: 80px"
          @change="handlePageSizeChange"
        >
          <el-option :value="10" label="10" />
          <el-option :value="20" label="20" />
          <el-option :value="50" label="50" />
        </el-select>
        <span class="text-sm text-gray-500">条</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">
          共 {{ filteredData.length }} 条，第 {{ currentPage }} / {{ totalPages }} 页
        </span>
        <el-pagination
          v-model:current-page="localCurrentPage"
          :page-size="localPageSize"
          :total="filteredData.length"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Plus, Edit, Delete, Download } from '@element-plus/icons-vue'

const props = defineProps({
  filteredData: { type: Array, default: () => [] },
  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  exportMode: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  batchEditMode: { type: String, default: null },
  expandedRows: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'update:currentPage',
  'update:pageSize',
  'page-change',
  'page-size-change',
  'export-mode-change',
  'export-click',
  'cancel-export',
  'batch-edit',
  'batch-delete',
  'batch-delete-confirm',
  'batch-cancel',
  'select-all',
  'view',
  'edit',
  'add-modal-open',
  'expand-change'
])

// 本地分页状态
const localCurrentPage = ref(props.currentPage)
const localPageSize = ref(props.pageSize)

watch(() => props.currentPage, (val) => { localCurrentPage.value = val })
watch(() => props.pageSize, (val) => { localPageSize.value = val })

// 计算属性
const totalPages = computed(() => Math.ceil(props.filteredData.length / localPageSize.value) || 1)

const paginatedData = computed(() => {
  const start = (localCurrentPage.value - 1) * localPageSize.value
  const end = start + localPageSize.value
  return props.filteredData.slice(start, end)
})

// 方法
const handlePageChange = (page) => {
  localCurrentPage.value = page
  emit('page-change', page)
}

const handlePageSizeChange = () => {
  localCurrentPage.value = 1
  emit('page-size-change', localPageSize.value)
}

const handleExpandChange = (row, expanded) => {
  emit('expand-change', row, expanded)
}

const handleBatchEditClick = () => {
  emit('batch-edit')
}

const getStatusTagType = (statusClass) => {
  const typeMap = {
    'approved': 'success',
    'pending': 'warning',
    'rejected': 'danger',
    'cancelled': 'info',
    'voided': 'info',
    'partial': 'primary'
  }
  return typeMap[statusClass] || 'info'
}

// 状态徽章颜色对齐 V1.1（精确 Tailwind class）
const getStatusBadgeClass = (statusClass) => {
  const classMap = {
    'approved': 'bg-green-100 text-green-700',
    'pending': 'bg-amber-100 text-amber-700',
    'rejected': 'bg-red-100 text-red-700',
    'cancelled': 'bg-gray-100 text-blue-700',
    'voided': 'bg-gray-200 text-gray-600',
    'partial': 'bg-blue-100 text-blue-700'
  }
  return classMap[statusClass] || 'bg-gray-100 text-blue-700'
}
</script>
