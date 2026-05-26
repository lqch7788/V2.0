<template>
  <!-- 数据表格组件 - 与V1.1 SummaryTable.tsx 完全一致 -->
  <div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <!-- 标题 -->
    <div v-if="title" class="px-4 py-3 border-b border-gray-100">
      <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
    </div>

    <div class="overflow-x-auto">
      <el-table
        :data="paginatedData"
        style="width: 100%"
        :header-cell-style="headerCellStyle"
        @row-click="handleRowClick"
      >
        <!-- 导出模式选择列 -->
        <el-table-column v-if="exportMode" width="48" align="center">
          <template #header>
            <el-checkbox
              :model-value="isAllSelected"
              @change="onSelectAll"
            />
          </template>
          <template #default="{ row }">
            <el-checkbox
              :model-value="selectedRows.includes(row.id)"
              @change="() => onSelectRow(row.id)"
            />
          </template>
        </el-table-column>

        <!-- 数据列 -->
        <el-table-column
          v-for="col in columns"
          :key="col.key"
          :prop="col.key"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
        >
          <template v-if="col.render" #default="{ row }">
            {{ col.render(row[col.key], row) }}
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column v-if="!exportMode" label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click.stop="handleView(row)">
              <el-icon><View /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 导出模式选中信息栏 -->
      <div
        v-if="exportMode && selectedRows.length > 0"
        class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50"
      >
        <div class="flex items-center gap-4">
          <el-button type="primary" link class="text-sm" @click="onSelectAll">
            {{ isAllSelected ? '全不选' : '全选' }}
          </el-button>
          <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="flex justify-end px-4 py-3 border-t border-gray-100">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="totalCount"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @update:current-page="onPageChange"
        @update:page-size="onPageSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { View } from '@element-plus/icons-vue'

const props = defineProps({
  title: { type: String, default: '' },
  columns: { type: Array, required: true },
  data: { type: Array, default: () => [] },
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  pageSize: { type: Number, default: 20 },
  exportMode: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  onSelectAll: { type: Function, required: true },
  onSelectRow: { type: Function, required: true },
  onView: { type: Function, default: null }
})

const emit = defineEmits(['page-change', 'page-size-change'])

/** 表头蓝色渐变样式（与V1.1一致：bg-gradient-to-r from-blue-500 to-blue-600） */
const headerCellStyle = {
  background: 'linear-gradient(to right, #3b82f6, #2563eb)',
  color: '#ffffff',
  fontWeight: '600',
  fontSize: '14px'
}

const totalCount = computed(() => props.data.length)

const isAllSelected = computed(() =>
  props.data.length > 0 && props.selectedRows.length === props.data.length
)

const paginatedData = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize
  return props.data.slice(start, start + props.pageSize)
})

function onPageChange(page) {
  emit('page-change', page)
}

function onPageSizeChange(size) {
  emit('page-size-change', size)
}

function handleView(row) {
  if (props.onView) {
    props.onView(row)
  }
}

function handleRowClick(row) {
  // 行点击可被子组件覆盖
}
</script>
