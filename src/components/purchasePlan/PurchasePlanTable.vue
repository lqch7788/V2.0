<template>
  <div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <!-- 操作栏 -->
    <div class="p-4 border-b border-gray-100 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">采购计划列表</h3>
      <div class="flex gap-2">
        <template v-if="batchEditMode || batchDeleteMode || exportMode">
          <el-button v-if="batchEditMode" type="warning" @click="$emit('batchEditConfirm')">
            批量编辑
          </el-button>
          <el-button v-if="batchDeleteMode" type="danger" @click="$emit('batchDeleteConfirm')">
            确认删除
          </el-button>
          <el-button v-if="exportMode" type="success" @click="$emit('exportConfirm')">
            确认导出
          </el-button>
          <el-button @click="$emit('batchEditCancel')">取消</el-button>
        </template>
        <template v-else>
          <el-button v-if="canCreate" type="primary" @click="$emit('create')">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
          <el-button v-if="canEdit" type="warning" @click="$emit('batchEdit')">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button v-if="canDelete" type="danger" @click="$emit('batchDelete')">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
          <el-button v-if="canExport" type="success" @click="$emit('export')">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </template>
      </div>
    </div>

    <!-- 表格 -->
    <el-table :data="paginatedData" stripe>
      <el-table-column v-if="exportMode || batchEditMode || batchDeleteMode" type="selection" width="50" />

      <el-table-column prop="purchaseApplicationCode" label="计划编号" width="180">
        <template #default="{ row }">
          <el-button link type="primary" @click="$emit('viewDetail', row)">
            {{ row.purchaseApplicationCode }}
          </el-button>
        </template>
      </el-table-column>

      <el-table-column prop="planTitle" label="计划名称" min-width="150" />

      <el-table-column prop="purchaseTypeName" label="类型" width="120" />

      <el-table-column prop="applicant" label="申请人" width="100" />

      <el-table-column prop="applyDate" label="申请日期" width="120" />

      <el-table-column prop="totalAmount" label="总金额" width="120">
        <template #default="{ row }">
          ¥{{ row.totalAmount?.toFixed(2) || '0.00' }}
        </template>
      </el-table-column>

      <el-table-column prop="supplierName" label="供应商" width="120">
        <template #default="{ row }">
          {{ row.supplierName || '-' }}
        </template>
      </el-table-column>

      <el-table-column prop="requiredDate" label="交货日期" width="120" />

      <el-table-column prop="priorityText" label="优先级" width="80">
        <template #default="{ row }">
          <el-tag :type="getPriorityType(row.priority)" size="small">
            {{ row.priorityText }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="statusText" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ row.statusText }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <div class="flex gap-1">
            <el-button link type="primary" size="small" @click="$emit('viewDetail', row)">
              详情
            </el-button>
            <el-button link type="primary" size="small" @click="$emit('edit', row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="$emit('delete', row)">
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
          :model-value="pageSize"
          @update:model-value="$emit('pageSizeChange', $event)"
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
        <el-button :disabled="currentPage === 1" size="small" @click="$emit('pageChange', currentPage - 1)">
          上一页
        </el-button>
        <span class="text-sm">{{ currentPage }} / {{ totalPages }}</span>
        <el-button :disabled="currentPage >= totalPages" size="small" @click="$emit('pageChange', currentPage + 1)">
          下一页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Plus, Edit, Delete, Download } from '@element-plus/icons-vue'
import {  PurchasePlan  } from '@/types/purchase'

const props = defineProps({})

defineEmits(['toggleExpand'])

const totalPages = computed(() => Math.ceil(props.data.length / props.pageSize))

const paginatedData = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize
  const end = start + props.pageSize
  return props.data.slice(start, end)
})

const getPriorityType = (priority) => {
  if (priority === 'urgent') return 'danger'
  if (priority === 'high') return 'warning'
  if (priority === 'normal') return 'info'
  return 'info'
}

const getStatusType = (status) => {
  if (status === 'completed') return 'success'
  if (status === 'purchasing') return 'primary'
  if (status === 'pending') return 'warning'
  if (status === 'rejected') return 'danger'
  return 'info'
}
</script>
