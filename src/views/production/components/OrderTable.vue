<template>
  <div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <!-- 表格 -->
    <el-table
      :data="paginatedData"
      stripe
      @selection-change="handleSelectionChange"
      :row-class-name="tableRowClassName"
    >
      <!-- 导出模式复选框 -->
      <el-table-column v-if="exportMode" type="selection" width="50" />

      <el-table-column prop="orderCode" label="订单编号" width="150">
        <template #default="{ row }">
          <el-button link type="primary" @click="$emit('detail', row)">
            {{ row.orderCode }}
          </el-button>
        </template>
      </el-table-column>

      <el-table-column prop="orderName" label="订单名称" min-width="150">
        <template #default="{ row }">
          <span class="font-medium text-gray-900">{{ row.orderName }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="orderType" label="订单类型" width="120">
        <template #default="{ row }">
          <span>{{ getOrderTypeName(row.orderType) }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="cropName" label="作物名称" width="120" />

      <el-table-column prop="plannedQuantity" label="计划数量" width="100">
        <template #default="{ row }">
          {{ row.plannedQuantity }} {{ row.unit }}
        </template>
      </el-table-column>

      <el-table-column prop="actualQuantity" label="实际数量" width="100">
        <template #default="{ row }">
          {{ row.actualQuantity }} {{ row.unit }}
        </template>
      </el-table-column>

      <el-table-column prop="orderDate" label="订单日期" width="120" />

      <el-table-column prop="expectedHarvestDate" label="预计采收日期" width="140" />

      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusName(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="createBy" label="创建人" width="100" />

      <el-table-column prop="createTime" label="创建时间" width="160" />

      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <div class="flex gap-1">
            <el-button link type="primary" size="small" @click="$emit('detail', row)">
              详情
            </el-button>
            <el-button link type="primary" size="small" @click="$emit('edit', row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleDeleteRow(row)">
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">每页</span>
        <el-select
          :model-value="pagination.pageSize"
          @update:model-value="handlePageSizeChange"
          style="width: 80px"
        >
          <el-option :value="10" label="10" />
          <el-option :value="20" label="20" />
          <el-option :value="50" label="50" />
        </el-select>
        <span class="text-sm text-gray-500">条</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">共 {{ data.length }} 条</span>
        <el-button
          :disabled="pagination.current === 1"
          size="small"
          @click="handlePageChange(pagination.current - 1)"
        >
          上一页
        </el-button>
        <span class="text-sm">{{ pagination.current }} / {{ totalPages }}</span>
        <el-button
          :disabled="pagination.current >= totalPages"
          size="small"
          @click="handlePageChange(pagination.current + 1)"
        >
          下一页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {  CropOrder, CropOrderStatus  } from '@/types/crop'

const props = defineProps({})

const emit = defineEmits(['selection-change', 'detail', 'edit', 'delete', 'add', 'export-select-all', 'export-cancel', 'confirm-export', 'page-change'])

const totalPages = computed(() => Math.ceil(props.data.length / props.pagination.pageSize))

const paginatedData = computed(() => {
  const start = (props.pagination.current - 1) * props.pagination.pageSize
  const end = start + props.pagination.pageSize
  return props.data.slice(start, end)
})

const getOrderTypeName = (type) => {
  const typeMap = {
    breeding: '育种订单',
    seedling: '育苗订单',
    production: '生产订单',
    research: '研发订单',
    other: '其他'
  }
  return typeMap[type] || type
}

const getStatusName = (status) => {
  const statusMap = {
    planned: '已计划',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    planned: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || 'info'
}

const handleSelectionChange = (selection) => {
  emit('selection-change', selection.map(item => item.id))
}

const handlePageChange = (page) => {
  emit('page-change', { current, pageSize: props.pagination.pageSize })
}

const handlePageSizeChange = (size) => {
  emit('page-change', { current, pageSize: size })
}

const handleDeleteRow = (row) => {
  emit('delete', [row.id])
}

const tableRowClassName = ({ row }) => {
  return 'hover:bg-blue-50 transition-colors'
}
</script>

<style scoped>
:deep(.el-table tr) {
  transition: background-color 0.2s;
}
</style>
