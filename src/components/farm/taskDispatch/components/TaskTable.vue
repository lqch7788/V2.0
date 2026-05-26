<template>
  <!-- 任务表格组件 - 从V1.1 TaskTable.tsx 1:1迁移 -->
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- 表头 + 操作按钮 -->
    <div class="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">农事任务表</h3>
      <div class="flex items-center gap-2">
        <!-- 导出模式 -->
        <template v-if="exportMode">
          <el-button size="small" type="primary" :disabled="selectedRows.length === 0" @click="$emit('confirmExport')">
            <el-icon><Download /></el-icon>确认导出
          </el-button>
          <el-button size="small" @click="$emit('cancelExport')">取消</el-button>
        </template>
        <!-- 批量编辑模式 -->
        <template v-else-if="batchEditMode">
          <el-button size="small" type="primary" :disabled="selectedRows.length === 0" @click="$emit('confirmBatchEdit')">
            <el-icon><Edit /></el-icon>确认编辑
          </el-button>
          <el-button size="small" @click="$emit('cancelBatchEdit')">取消</el-button>
        </template>
        <!-- 批量删除模式 -->
        <template v-else-if="batchDeleteMode">
          <el-button size="small" type="danger" :disabled="selectedRows.length === 0" @click="$emit('batchDelete')">
            <el-icon><Delete /></el-icon>确认删除
          </el-button>
          <el-button size="small" @click="$emit('cancelBatchEdit')">取消</el-button>
        </template>
        <!-- 正常模式 -->
        <template v-else>
          <el-button v-if="$attrs.onCreate" size="small" type="primary" @click="$emit('create')">
            <el-icon><Plus /></el-icon>新建
          </el-button>
          <el-button v-if="$attrs.onBatchEdit" size="small" type="primary" @click="$emit('batchEdit')">
            <el-icon><Edit /></el-icon>编辑
          </el-button>
          <el-button v-if="$attrs.onBatchDelete" size="small" type="danger" @click="$emit('batchDelete')">
            <el-icon><Delete /></el-icon>删除
          </el-button>
          <el-button v-if="$attrs.onExport" size="small" @click="$emit('export')">
            <el-icon><Download /></el-icon>导出
          </el-button>
        </template>
      </div>
    </div>

    <!-- 表格 -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <th v-if="showCheckbox" class="px-3 py-3 text-center text-sm font-semibold w-12">
              <input type="checkbox" :checked="isAllSelected" @change="$emit('selectAll')" class="w-4 h-4 rounded" />
            </th>
            <th class="px-4 py-3 text-center text-sm font-semibold">任务编号</th>
            <th class="px-4 py-3 text-center text-sm font-semibold">类型</th>
            <th class="px-4 py-3 text-center text-sm font-semibold">田地/温室</th>
            <th class="px-4 py-3 text-center text-sm font-semibold">作物</th>
            <th class="px-4 py-3 text-center text-sm font-semibold">执行人</th>
            <th class="px-4 py-3 text-center text-sm font-semibold">计划开始</th>
            <th class="px-4 py-3 text-center text-sm font-semibold">计划结束</th>
            <th class="px-4 py-3 text-center text-sm font-semibold">进度</th>
            <th class="px-4 py-3 text-center text-sm font-semibold">状态</th>
            <th class="px-4 py-3 text-center text-sm font-semibold">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <tr v-for="(task, idx) in paginatedTasks" :key="task.id" class="hover:bg-gray-50 transition-colors"
            :class="{ 'bg-blue-50': selectedRows.includes(globalIndex(idx)) }">
            <td v-if="showCheckbox" class="px-3 py-3 text-center">
              <input type="checkbox" :checked="selectedRows.includes(globalIndex(idx))"
                :disabled="!isRowSelectable(task)" @change="$emit('selectRow', globalIndex(idx))"
                class="w-4 h-4 rounded" />
            </td>
            <td class="px-4 py-3 text-sm font-medium text-gray-900 text-center">
              <el-button link type="primary" size="small" @click="$emit('viewDetail', task)">{{ task.taskCode || '-' }}</el-button>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500 text-center">{{ task.typeLabel || task.typeName || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-500 text-center">{{ task.field || task.greenhouseName || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-700 text-center">{{ task.crop || task.cropName || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-500 text-center">{{ task.assigneeName || task.assignee || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-500 text-center">{{ task.planStart || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-500 text-center">{{ task.planEnd || '-' }}</td>
            <td class="px-4 py-3 text-center">
              <div class="w-full h-2 bg-gray-200 rounded-full">
                <div class="h-full bg-emerald-500 rounded-full" :style="{ width: (task.progress || 0) + '%' }" />
              </div>
              <span class="text-xs text-gray-500">{{ task.progress || 0 }}%</span>
            </td>
            <td class="px-4 py-3 text-center">
              <span :class="['inline-flex px-2 py-0.5 rounded text-xs font-medium', statusStyle(task.status).bg, statusStyle(task.status).color]">
                {{ statusStyle(task.status).label }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <div class="flex items-center gap-1 justify-center">
                <el-button link type="primary" size="small" @click="$emit('viewDetail', task)">详情</el-button>
                <el-button v-if="canAccept(task)" link type="success" size="small" @click="$emit('accept', task)">接受</el-button>
                <el-button v-if="canReassign(task)" link type="warning" size="small" @click="$emit('reassign', task)">重分派</el-button>
                <el-button v-if="canWithdraw(task)" link type="danger" size="small" @click="$emit('withdraw', task)">撤回</el-button>
              </div>
            </td>
          </tr>
          <tr v-if="paginatedTasks.length === 0">
            <td :colspan="showCheckbox ? 11 : 10" class="px-4 py-8 text-center text-gray-400">暂无任务数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <span class="text-sm text-gray-500">共 {{ tasks.length }} 条</span>
      <div class="flex items-center gap-2">
        <el-select v-model="localPageSize" size="small" style="width: 80px" @change="handlePageSizeChange">
          <el-option v-for="s in [10, 20, 50]" :key="s" :value="s" :label="`${s}条`" />
        </el-select>
        <el-button :disabled="currentPage <= 1" size="small" @click="$emit('pageChange', currentPage - 1)">上一页</el-button>
        <span class="text-sm">{{ currentPage }} / {{ totalPages }}</span>
        <el-button :disabled="currentPage >= totalPages" size="small" @click="$emit('pageChange', currentPage + 1)">下一页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Download, Edit, Delete, Plus } from '@element-plus/icons-vue'
import { STATUS_MAP } from '../constants/taskDispatchConstants'

const props = defineProps({
  tasks: { type: Array, default: () => [] },
  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  selectedRows: { type: Array, default: () => [] },
  exportMode: { type: Boolean, default: false },
  batchEditMode: { type: Boolean, default: false },
  batchDeleteMode: { type: Boolean, default: false },
})

defineEmits([
  'selectRow', 'selectAll', 'viewDetail', 'accept', 'withdraw', 'cancel', 'reassign', 'continue',
  'pageChange', 'pageSizeChange', 'confirmExport', 'cancelExport', 'confirmBatchEdit', 'cancelBatchEdit',
  'batchDelete', 'export', 'create',
])

const localPageSize = ref(props.pageSize)

const showCheckbox = computed(() => props.exportMode || props.batchEditMode || props.batchDeleteMode)
const totalPages = computed(() => Math.ceil(props.tasks.length / localPageSize.value) || 1)

const paginatedTasks = computed(() => {
  const start = (props.currentPage - 1) * localPageSize.value
  return props.tasks.slice(start, start + localPageSize.value)
})

const isAllSelected = computed(() => {
  const pageStart = (props.currentPage - 1) * localPageSize.value
  const pageIndexes = paginatedTasks.value.map((_, i) => pageStart + i)
  return pageIndexes.length > 0 && pageIndexes.every(idx => props.selectedRows.includes(idx))
})

const globalIndex = (idx) => (props.currentPage - 1) * localPageSize.value + idx

const statusStyle = (status) => ({
  label: STATUS_MAP[status]?.label || status,
  color: STATUS_MAP[status]?.color || 'text-gray-600',
  bg: STATUS_MAP[status]?.bg || 'bg-gray-100',
})

const isRowSelectable = (task) => {
  if (props.batchEditMode) return ['draft', 'pending', 'accepted', 'in_progress', 'waiting_acceptance'].includes(task.status)
  if (props.batchDeleteMode) return true
  return true
}

const canAccept = (task) => ['pending'].includes(task.status)
const canReassign = (task) => ['pending', 'accepted', 'in_progress'].includes(task.status)
const canWithdraw = (task) => ['accepted', 'in_progress'].includes(task.status)

const handlePageSizeChange = (size) => {
  localPageSize.value = size
}
</script>
