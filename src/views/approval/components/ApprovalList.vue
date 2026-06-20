<!--
  通用审批列表组件
  对标 V1.1 src/components/approval/ApprovalList.tsx
  功能：通用审批列表展示，支持选择/操作/分页
-->
<template>
  <div class="approval-list">
    <el-table
      v-loading="loading"
      :data="paginatedData"
      :row-key="(row) => row.id"
      :max-height="maxHeight"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
    >
      <!-- 选择列 -->
      <el-table-column
        v-if="selectable"
        type="selection"
        width="48"
        :reserve-selection="true"
        :selectable="(row) => row.status === 'pending'"
      />

      <!-- 单号 -->
      <el-table-column prop="code" label="审批单号" min-width="160" show-overflow-tooltip>
        <template #default="{ row }">
          <span class="font-mono text-sm">{{ row.code }}</span>
        </template>
      </el-table-column>

      <!-- 类型 -->
      <el-table-column prop="typeName" label="类型" min-width="120">
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ row.typeName }}</el-tag>
        </template>
      </el-table-column>

      <!-- 标题 -->
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />

      <!-- 申请人 -->
      <el-table-column prop="applicantName" label="申请人" min-width="100" />

      <!-- 部门 -->
      <el-table-column prop="applicantDepartment" label="部门" min-width="120" show-overflow-tooltip />

      <!-- 状态 -->
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <span
            class="px-2 py-1 rounded-full text-xs font-medium"
            :class="statusClass(row.status)"
          >
            {{ statusText(row.status) }}
          </span>
        </template>
      </el-table-column>

      <!-- 优先级 -->
      <el-table-column label="优先级" width="80">
        <template #default="{ row }">
          <el-tag
            v-if="row.priority === 'urgent'"
            type="danger"
            size="small"
          >加急</el-tag>
          <el-tag
            v-else-if="row.priority === 'high'"
            type="warning"
            size="small"
          >高</el-tag>
          <span v-else class="text-gray-500 text-xs">普通</span>
        </template>
      </el-table-column>

      <!-- 申请时间 -->
      <el-table-column label="申请时间" min-width="140">
        <template #default="{ row }">
          <span class="text-sm text-gray-600">{{ row.applyDate }}</span>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column v-if="!readonly" label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click.stop="$emit('view', row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <template v-if="row.status === 'pending' && actionable">
            <el-button link type="success" size="small" @click.stop="$emit('approve', row)">
              通过
            </el-button>
            <el-button link type="danger" size="small" @click.stop="$emit('reject', row)">
              拒绝
            </el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="mt-4 flex justify-end">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredData.length"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="(val) => (pageSize = val)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { View } from '@element-plus/icons-vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  selectable: { type: Boolean, default: false },
  actionable: { type: Boolean, default: true },
  readonly: { type: Boolean, default: false },
  pageSize: { type: Number, default: 10 },
  filters: { type: Object, default: () => ({}) },
  maxHeight: { type: [String, Number], default: 'auto' },
})

const emit = defineEmits(['selection-change', 'view', 'approve', 'reject'])

const currentPage = ref(1)
const selectedRows = ref([])

const STATUS_CLASS = {
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  pending: 'bg-amber-100 text-amber-700',
  partially_approved: 'bg-blue-100 text-blue-700',
  draft: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

const STATUS_TEXT = {
  approved: '已通过',
  rejected: '已拒绝',
  pending: '待审批',
  partially_approved: '部分通过',
  draft: '草稿',
  cancelled: '已取消',
}

const statusClass = (s) => STATUS_CLASS[s] || 'bg-gray-100 text-gray-700'
const statusText = (s) => STATUS_TEXT[s] || s

const filteredData = computed(() => {
  const f = props.filters
  return props.data.filter((row) => {
    if (f.keyword) {
      const kw = f.keyword.toLowerCase()
      const matchKw =
        row.code?.toLowerCase().includes(kw) ||
        row.title?.toLowerCase().includes(kw) ||
        row.applicantName?.toLowerCase().includes(kw)
      if (!matchKw) return false
    }
    if (f.type?.length && !f.type.includes(row.type)) return false
    if (f.status?.length && !f.status.includes(row.status)) return false
    if (f.priority?.length && !f.priority.includes(row.priority)) return false
    if (f.dateRange?.length === 2 && row.applyDate) {
      if (row.applyDate < f.dateRange[0] || row.applyDate > f.dateRange[1]) return false
    }
    return true
  })
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize
  return filteredData.value.slice(start, start + props.pageSize)
})

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
  emit('selection-change', rows)
}

const handleRowClick = (row) => {
  if (props.readonly) emit('view', row)
}

watch(
  () => props.data,
  () => {
    currentPage.value = 1
  }
)
</script>

<style scoped>
.approval-list :deep(.el-table__row) {
  cursor: pointer;
}
.approval-list :deep(.el-table__row:hover) {
  background-color: #f0fdf4 !important;
}
</style>