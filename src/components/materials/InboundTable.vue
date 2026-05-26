<template>
  <div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <!-- 表格头部 -->
    <div class="p-4 border-b border-gray-100 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">物料入库记录</h3>
      <el-button v-if="canCreate" type="primary" size="small" @click="onAddClick">
        <el-icon><Plus /></el-icon>
        新增入库
      </el-button>
    </div>

    <!-- 表格内容 -->
    <div class="overflow-x-auto">
      <el-table :data="paginatedRecords" style="width: 100%" stripe>
        <el-table-column prop="code" label="入库单号" width="150" />
        <el-table-column prop="materialCode" label="物料编号" width="120" />
        <el-table-column prop="materialName" label="物料名称" width="120" />
        <el-table-column label="入库数量" width="100">
          <template #default="{ row }">
            {{ row.quantity }}{{ row.unit }}
          </template>
        </el-table-column>
        <el-table-column prop="supplier" label="供应商" width="120" />
        <el-table-column prop="inboundDate" label="入库日期" width="120" />
        <el-table-column prop="operator" label="操作员" width="100" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'completed' ? 'success' : 'warning'" size="small">
              {{ row.status === 'completed' ? '已完成' : '待审核' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <div class="flex items-center gap-1">
              <el-button v-if="can('PROC_MATERIALS', 'view')" text size="small" title="查看" @click="$emit('view', row)">
                <el-icon><View /></el-icon>
              </el-button>
              <el-button v-if="canEdit" text size="small" title="编辑" @click="$emit('edit', row)">
                <el-icon><Edit /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
      <div class="text-sm text-gray-500">共 {{ records.length }} 条</div>
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="records.length"
        layout="sizes, prev, pager, next"
        @size-change="onPageSizeChange"
        @current-change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { View, Edit, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  records: { type: Array, default: () => [] },
  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 20 },
  canCreate: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
  can: { type: Function, default: () => false }
})

const emit = defineEmits(['page-change', 'page-size-change', 'add-click', 'view', 'edit'])

const totalPages = computed(() => Math.ceil(props.records.length / props.pageSize) || 1)

const paginatedRecords = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize
  return props.records.slice(start, start + props.pageSize)
})

const onPageChange = (page) => emit('page-change', page)
const onPageSizeChange = (size) => emit('page-size-change', size)
const onAddClick = () => emit('add-click')
</script>
