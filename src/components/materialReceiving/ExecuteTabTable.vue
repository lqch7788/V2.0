<template>
  <!-- 数据表格 -->
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
    <!-- 表格头部操作区 -->
    <div class="p-4 border-b border-gray-100 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">领料出库单列表</h3>
      <!-- 导出模式 -->
      <div v-if="exportMode" class="flex gap-2">
        <el-button size="small" type="primary" @click="$emit('export-confirm')">
          <el-icon><Download /></el-icon>
          确认导出
        </el-button>
        <el-button size="small" @click="$emit('cancel-export')">取消</el-button>
      </div>
      <!-- 批量编辑模式 -->
      <div v-else-if="batchEditMode === 'edit'" class="flex gap-2">
        <el-button size="small" type="primary" @click="$emit('batch-edit-confirm')">
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
        <el-button size="small" type="primary" @click="$emit('add')">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
        <el-button size="small" type="primary" @click="$emit('batch-edit-click')">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
        <el-button size="small" type="danger" @click="$emit('batch-delete-click')">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
        <el-button size="small" @click="$emit('export-click')">
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
                <el-table-column prop="applicationCode" label="来源领料单号" width="140">
                  <template #default="{ row }">
                    <span class="font-mono">{{ row.applicationCode }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="materialCode" label="物料编码" width="120">
                  <template #default="{ row }">
                    <span class="font-mono">{{ row.materialCode }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="materialName" label="物料名称" width="120" />
                <el-table-column prop="spec" label="规格" width="80" />
                <el-table-column prop="unit" label="单位" width="60" />
                <el-table-column prop="requestedQuantity" label="申请数量" width="90" />
                <el-table-column label="本次实发" width="90">
                  <template #default="{ row }">
                    <span :class="row.actualQuantity < row.requestedQuantity ? 'text-amber-600 font-medium' : 'text-green-600'">
                      {{ row.actualQuantity }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="warehousePosition" label="仓库货位" width="100" />
                <el-table-column prop="remark" label="备注" width="100" />
              </el-table>
            </div>
          </div>
        </template>
      </el-table-column>

      <!-- 数据列 -->
      <el-table-column prop="code" label="出库单号" width="150">
        <template #default="{ row }">
          <span
            class="text-blue-600 cursor-pointer hover:text-blue-800 underline font-medium"
            @click="$emit('view', row)"
          >
            {{ row.code }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="date" label="出库日期" width="120" />
      <el-table-column prop="applicant" label="申领人" width="100" />
      <el-table-column prop="warehouseLocation" label="库存地点" width="110" />
      <el-table-column prop="reviewer" label="审核人" width="100" />
      <el-table-column prop="operator" label="操作人" width="100" />
      <el-table-column prop="productionBatchCode" label="生产批次号" width="140" />
      <el-table-column label="物料种类" width="90">
        <template #default="{ row }">
          {{ row.materials?.length > 0 ? `${row.materials.length}种` : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="执行状态" width="100">
        <template #default="{ row }">
          <span
            class="inline-flex px-2 py-1 rounded-full text-xs font-medium"
            :class="getExecuteStatusBadgeClass(row.executeStatusClass)"
          >
            {{ row.executeStatus }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="$emit('view', row)">查看</el-button>
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
          {{ selectedRows.length === data.length ? '全不选' : '全选' }}
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
          共 {{ data.length }} 条，第 {{ currentPage }} / {{ totalPages }} 页
        </span>
        <el-pagination
          v-model:current-page="localCurrentPage"
          :page-size="localPageSize"
          :total="data.length"
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
  data: { type: Array, default: () => [] },
  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  totalCount: { type: Number, default: 0 },
  expandedRows: { type: Array, default: () => [] },
  exportMode: { type: Boolean, default: false },
  batchEditMode: { type: String, default: null },
  selectedRows: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'update:currentPage',
  'update:pageSize',
  'page-change',
  'page-size-change',
  'export-click',
  'export-confirm',
  'cancel-export',
  'batch-edit-click',
  'batch-delete-click',
  'batch-edit-confirm',
  'batch-delete-confirm',
  'batch-cancel',
  'select-all',
  'view',
  'edit',
  'delete',
  'add',
  'expand-change'
])

// 本地分页状态
const localCurrentPage = ref(props.currentPage)
const localPageSize = ref(props.pageSize)

watch(() => props.currentPage, (val) => { localCurrentPage.value = val })
watch(() => props.pageSize, (val) => { localPageSize.value = val })

// 计算属性
const totalPages = computed(() => Math.ceil(props.data.length / localPageSize.value) || 1)

const paginatedData = computed(() => {
  const start = (localCurrentPage.value - 1) * localPageSize.value
  const end = start + localPageSize.value
  return props.data.slice(start, end)
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

const getStatusTagType = (statusClass) => {
  const typeMap = {
    'completed': 'success',
    'pending_out': 'warning',
    'partial': 'info',
    'cancelled': 'info'
  }
  return typeMap[statusClass] || 'info'
}

// 执行状态徽章颜色对齐 V1.1（精确 Tailwind class）
const getExecuteStatusBadgeClass = (statusClass) => {
  const classMap = {
    'completed': 'bg-green-100 text-green-700',
    'pending_out': 'bg-amber-100 text-amber-700',
    'partial': 'bg-blue-100 text-blue-700',
    'cancelled': 'bg-gray-100 text-gray-700'
  }
  return classMap[statusClass] || 'bg-gray-100 text-gray-700'
}
</script>
