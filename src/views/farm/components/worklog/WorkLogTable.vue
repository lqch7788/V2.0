<template>
  <div class="border border-gray-200 rounded-xl overflow-hidden">
    <!-- 表格标题栏 -->
    <div class="p-4 border-b border-gray-100 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">工作日志列表</h3>
      <div class="flex gap-2">
        <el-button v-if="onAddClick && !batchMode" size="small" @click="onAddClick">
          <el-icon class="mr-1"><Plus /></el-icon>
          新增
        </el-button>
        <el-button
          v-if="!exportMode && !batchDeleteMode && onBatchEditClick"
          size="small"
          :type="batchEditMode ? undefined : 'primary'"
          @click="batchEditMode ? undefined : onBatchEditClick"
        >
          <el-icon class="mr-1"><Edit /></el-icon>
          {{ batchEditMode ? '编辑' : '编辑' }}
        </el-button>
        <el-button
          v-if="!exportMode && !batchEditMode && onBatchDeleteClick"
          size="small"
          type="danger"
          @click="onBatchDeleteClick"
        >
          <el-icon class="mr-1"><Delete /></el-icon>
          删除
        </el-button>
        <el-button
          v-if="!batchEditMode && !batchDeleteMode && onExportClick"
          size="small"
          @click="onExportClick"
        >
          <el-icon class="mr-1"><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <el-table
        :data="paginatedData"
        style="width: 100%"
        class="min-w-[1400px]"
        @selection-change="onSelectionChange"
      >
        <!-- 批量选择列 -->
        <el-table-column
          v-if="showCheckbox"
          type="selection"
          width="50"
          :selectable="() => true"
        />

        <el-table-column prop="code" label="日志编号" width="140" />
        <el-table-column prop="taskCode" label="任务编号" width="150">
          <template #default="{ row }">
            {{ row.taskCode || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="任务类型" width="100">
          <template #default="{ row }">
            {{ row.taskTypeName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="工作量" width="130">
          <template #default="{ row }">
            <template v-if="row.workloadDays || row.workloadHours">
              {{ row.workloadDays ? `${row.workloadDays}天` : '' }}
              {{ row.workloadHours ? `${row.workloadHours}小时` : '' }}
              {{ row.workers ? `，${row.workers}人` : '' }}
            </template>
            <template v-else>-</template>
          </template>
        </el-table-column>
        <el-table-column label="进度" width="80">
          <template #default="{ row }">
            {{ row.progress !== undefined ? `${row.progress}%` : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="crop" label="作物" width="80" />
        <el-table-column prop="greenhouse" label="工作区域" width="100" />
        <el-table-column prop="tasks" label="工作内容" width="150" show-overflow-tooltip />
        <el-table-column prop="problems" label="问题描述" width="120" show-overflow-tooltip />
        <el-table-column prop="solutions" label="处理措施" width="120" show-overflow-tooltip />
        <el-table-column label="提交时间" width="110">
          <template #default="{ row }">
            {{ row.submitTime ? formatTime(row.submitTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="70" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="onViewDetail(row)">
              <el-icon><View /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="px-4 pb-4 flex justify-center">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="(p) => $emit('pageChange', p)"
        @size-change="(s) => $emit('pageSizeChange', s)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Plus, Edit, Delete, Download, View } from '@element-plus/icons-vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  pagination: { type: Object, required: true },
  showCheckbox: { type: Boolean, default: false },
  exportMode: { type: Boolean, default: false },
  batchEditMode: { type: Boolean, default: false },
  batchDeleteMode: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  onAddClick: { type: Function, default: null },
  onBatchEditClick: { type: Function, default: null },
  onBatchDeleteClick: { type: Function, default: null },
  onExportClick: { type: Function, default: null },
})

const emit = defineEmits(['viewDetail', 'selectAll', 'selectRow', 'pageChange', 'pageSizeChange', 'update:selectedRows'])

const { currentPage: _cp, pageSize: _ps, total: _t } = props.pagination
const currentPage = computed({
  get: () => props.pagination.currentPage,
  set: (v) => emit('pageChange', v)
})
const pageSize = computed({
  get: () => props.pagination.pageSize,
  set: (v) => emit('pageSizeChange', v)
})
const total = computed(() => props.pagination.total)

const batchMode = computed(() => props.exportMode || props.batchEditMode || props.batchDeleteMode)

const paginatedData = computed(() => {
  const start = (props.pagination.currentPage - 1) * props.pagination.pageSize
  return props.data.slice(start, start + props.pagination.pageSize)
})

function onSelectionChange(selection) {
  emit('update:selectedRows', selection.map(r => r.id))
}

function formatTime(timeStr) {
  if (!timeStr) return '-'
  const d = new Date(timeStr)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}
</script>
