<!--
  ScheduleTableView.vue - 排班表格视图
  V1.1 ScheduleTable.tsx 1:1 对齐
  从 Schedule.vue 提取（1454 行 → 多子组件拆分）
  包含：标题栏 + 批量按钮 + 工具栏（搜索/筛选）+ 表格 + 分页
-->
<template>
  <div class="bg-white rounded-lg shadow">
    <!-- 标题栏 + 批量按钮（V1.1 L149-257 1:1 对齐） -->
    <div class="p-4 border-b border-gray-100 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">排班记录</h3>
      <div class="flex gap-2">
        <template v-if="batchEditMode">
          <el-button size="small" type="primary" :disabled="selectedRows.length === 0" @click="$emit('batchEditClick')">
            <el-icon><Edit /></el-icon>批量编辑
          </el-button>
          <el-button size="small" @click="$emit('cancelBatch')">
            <el-icon><Close /></el-icon>取消
          </el-button>
        </template>
        <template v-else-if="batchDeleteMode">
          <el-button size="small" type="danger" :disabled="selectedRows.length === 0" @click="$emit('batchDeleteClick')">
            <el-icon><Delete /></el-icon>确认删除
          </el-button>
          <el-button size="small" @click="$emit('cancelBatch')">
            <el-icon><Close /></el-icon>取消
          </el-button>
        </template>
        <template v-else-if="exportMode">
          <el-button size="small" :disabled="selectedRows.length === 0" @click="$emit('batchExportClick')">
            <el-icon><Download /></el-icon>确认导出
          </el-button>
          <el-button size="small" @click="$emit('cancelBatch')">
            <el-icon><Close /></el-icon>取消
          </el-button>
        </template>
        <template v-else>
          <el-button size="small" @click="$emit('batchExportClick')">
            <el-icon><Download /></el-icon>导出
          </el-button>
          <el-button size="small" @click="$emit('batchEditClick')">
            <el-icon><Edit /></el-icon>编辑
          </el-button>
          <el-button size="small" type="danger" @click="$emit('batchDeleteClick')">
            <el-icon><Delete /></el-icon>删除
          </el-button>
        </template>
      </div>
    </div>

    <!-- 工具栏：搜索 + 筛选（V1.1 L260-363 1:1 对齐） -->
    <div class="p-4 space-y-3 border-b">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-2 flex-1">
          <el-input
            :model-value="searchTerm"
            @update:model-value="(v) => $emit('update:searchTerm', v)"
            placeholder="搜索员工、区域、日期..."
            size="small"
            clearable
            style="max-width: 320px"
            @input="$emit('search')"
          />
        </div>
        <div class="text-sm text-gray-500">共 {{ filteredSchedules.length }} 条记录</div>
      </div>
      <div class="flex items-center gap-4 flex-wrap">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">日期:</span>
          <el-date-picker
            :model-value="dateRange.start"
            @update:model-value="(v) => $emit('update:dateRange', { ...dateRange, start: v })"
            type="date"
            size="small"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 140px"
            @change="$emit('dateChange')"
          />
          <span class="text-gray-400">至</span>
          <el-date-picker
            :model-value="dateRange.end"
            @update:model-value="(v) => $emit('update:dateRange', { ...dateRange, end: v })"
            type="date"
            size="small"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 140px"
            @change="$emit('dateChange')"
          />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">班次:</span>
          <el-select
            :model-value="shiftFilter"
            @update:model-value="(v) => $emit('update:shiftFilter', v)"
            size="small"
            style="width: 120px"
            @change="$emit('filterChange')"
          >
            <el-option label="全部" value="all" />
            <el-option v-for="c in shiftConfigs" :key="c.name" :label="c.name" :value="c.name" />
          </el-select>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">状态:</span>
          <el-select
            :model-value="statusFilter"
            @update:model-value="(v) => $emit('update:statusFilter', v)"
            size="small"
            style="width: 120px"
            @change="$emit('filterChange')"
          >
            <el-option label="全部" value="all" />
            <el-option label="已排班" value="已排班" />
            <el-option label="已执行" value="已执行" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 表格（V1.1 L427-490 1:1 对齐） -->
    <el-table
      class="schedule-table"
      :data="pagedSchedules"
      style="width: 100%"
      :header-cell-style="{ background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: '#ffffff', fontWeight: 600 }"
      :row-style="{ cursor: 'pointer' }"
      @selection-change="(rows) => $emit('update:selectedRows', rows)"
      @row-click="(row) => $emit('rowClick', row)"
    >
      <el-table-column
        v-if="exportMode || batchEditMode || batchDeleteMode"
        type="selection"
        width="50"
      />
      <el-table-column label="日期" width="120">
        <template #default="{ row }">
          <div class="text-sm font-medium text-gray-900">{{ row.date }}</div>
          <div class="text-xs text-gray-500">{{ getWeekday(row.date) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="员工" width="100">
        <template #default="{ row }">
          <div class="text-sm font-medium text-gray-900">{{ row.staffName || row.staff_name || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="班次" width="100">
        <template #default="{ row }">
          <span :class="['px-2 py-0.5 rounded text-xs text-white', getShiftColor(row.shift)]">
            {{ row.shift }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="工作区" prop="workZone" width="120" />
      <el-table-column label="时间" width="140">
        <template #default="{ row }">
          <div class="text-xs text-gray-600">{{ getShiftTime(row.shift) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <span :class="['px-2 py-0.5 rounded text-xs', getStatusClass(row.status)]">
            {{ row.status }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="签到/签退" width="140">
        <template #default="{ row }">
          <div class="text-xs">
            <span v-if="row.checkIn" class="text-emerald-600">↓ {{ row.checkIn }}</span>
            <span v-if="row.checkOut" class="text-red-600 ml-1">↑ {{ row.checkOut }}</span>
            <span v-if="!row.checkIn && !row.checkOut" class="text-gray-400">-</span>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="p-4 border-t">
      <el-pagination
        :current-page="pagination.currentPage"
        :page-size="pagination.pageSize"
        :total="filteredSchedules.length"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="(p) => $emit('update:pagination', { ...pagination, currentPage: p })"
        @size-change="(s) => $emit('update:pagination', { ...pagination, pageSize: s, currentPage: 1 })"
      />
    </div>
  </div>
</template>

<script setup>
import { Edit, Close, Delete, Download } from '@element-plus/icons-vue'

const props = defineProps({
  searchTerm: { type: String, default: '' },
  dateRange: { type: Object, default: () => ({ start: '', end: '' }) },
  shiftFilter: { type: String, default: 'all' },
  statusFilter: { type: String, default: 'all' },
  batchEditMode: { type: Boolean, default: false },
  batchDeleteMode: { type: Boolean, default: false },
  exportMode: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  shiftConfigs: { type: Array, default: () => [] },
  filteredSchedules: { type: Array, required: true },
  pagedSchedules: { type: Array, required: true },
  pagination: { type: Object, required: true },
  getWeekday: { type: Function, required: true },
  getShiftColor: { type: Function, required: true },
  getShiftTime: { type: Function, required: true },
  getStatusClass: { type: Function, required: true },
})

defineEmits([
  'update:searchTerm', 'update:dateRange', 'update:shiftFilter', 'update:statusFilter',
  'update:selectedRows', 'update:pagination',
  'search', 'dateChange', 'filterChange',
  'batchEditClick', 'batchDeleteClick', 'batchExportClick', 'cancelBatch',
  'rowClick',
])
</script>
