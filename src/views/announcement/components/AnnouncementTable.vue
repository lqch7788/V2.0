<template>
  <!-- 公告表格组件 -->
  <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
    <el-table
      :data="notices"
      :row-key="(row) => row.id"
      :header-cell-style="{ background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: 'white', fontWeight: 600 }"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <!-- 选择列（导出模式） -->
      <el-table-column v-if="exportMode" type="selection" width="55" />

      <!-- 展开列 -->
      <el-table-column type="index" width="50">
        <template #default="{ row }">
          <el-button link @click="handleToggleExpand(row.id)">
            <el-icon v-if="expandedRow === row.id">
              <DArrowLeft style="transform: rotate(90deg)" />
            </el-icon>
            <el-icon v-else>
              <DArrowRight />
            </el-icon>
          </el-button>
        </template>
      </el-table-column>

      <!-- 公告编号 -->
      <el-table-column prop="code" label="公告编号" width="150">
        <template #default="{ row }">
          <span class="text-sm text-gray-600 font-mono">{{ row.code }}</span>
        </template>
      </el-table-column>

      <!-- 公告标题 -->
      <el-table-column prop="title" label="公告标题" min-width="200">
        <template #default="{ row }">
          <div class="flex items-center gap-2">
            <el-icon class="text-blue-600"><Bell /></el-icon>
            <span class="text-sm font-medium text-gray-900">{{ row.title }}</span>
          </div>
        </template>
      </el-table-column>

      <!-- 类型 -->
      <el-table-column prop="type" label="类型" width="120">
        <template #default="{ row }">
          <el-tag size="small" type="info" class="bg-blue-50 text-blue-700 border-blue-200">
            {{ row.type }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 优先级 -->
      <el-table-column prop="priority" label="优先级" width="100">
        <template #default="{ row }">
          <span :class="['px-2 py-1 text-xs rounded-full border', getPriorityColor(row.priority)]">
            {{ row.priority }}
          </span>
        </template>
      </el-table-column>

      <!-- 状态 -->
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <span :class="['px-2 py-1 text-xs rounded-full border', getStatusColor(row.status)]">
            {{ row.status }}
          </span>
        </template>
      </el-table-column>

      <!-- 发布日期 -->
      <el-table-column prop="date" label="发布日期" width="120">
        <template #default="{ row }">
          <span class="text-sm text-gray-600">{{ row.date }}</span>
        </template>
      </el-table-column>

      <!-- 阅读数 -->
      <el-table-column prop="readCount" label="阅读数" width="100">
        <template #default="{ row }">
          <span class="text-sm text-gray-600 font-mono">{{ row.readCount }}</span>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <div class="flex items-center gap-1">
            <el-button link @click="handleView(row)">
              <el-icon><View /></el-icon>
            </el-button>
            <el-button v-if="row.status === '草稿'" link @click="handleSend(row)">
              <el-icon><Promotion /></el-icon>
            </el-button>
            <el-button link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </template>
      </el-table-column>

      <!-- 展开行内容 -->
      <el-table-column type="expand" width="1">
        <template #default="{ row }">
          <div class="p-4 bg-gray-50">
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <h4 class="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <el-icon class="text-blue-600"><Bell /></el-icon>
                公告详情
              </h4>
              <div class="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <span class="text-gray-500">发布部门：</span>
                  <span class="text-gray-900 font-medium">{{ row.sender }}</span>
                </div>
                <div>
                  <span class="text-gray-500">接收对象：</span>
                  <span class="text-gray-900 font-medium">{{ row.recipients }}</span>
                </div>
                <div>
                  <span class="text-gray-500">截止日期：</span>
                  <span class="text-gray-900 font-medium">{{ row.deadline }}</span>
                </div>
                <div>
                  <span class="text-gray-500">分类：</span>
                  <span class="text-gray-900 font-medium">{{ row.category }}</span>
                </div>
              </div>
              <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p class="text-sm text-gray-700">{{ row.content }}</p>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空状态 -->
    <div v-if="notices.length === 0" class="text-center py-12">
      <el-icon class="text-6xl text-gray-400 mb-4"><Bell /></el-icon>
      <p class="text-gray-500">暂无数据</p>
    </div>

    <!-- 分页控件 -->
    <div v-if="notices.length > 0" class="mt-4 flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-600">
          共 <span class="text-blue-600 font-medium">{{ totalCount }}</span> 条记录
        </span>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">每页</span>
          <el-select v-model="pageSizeValue" size="default" @change="handlePageSizeChange">
            <el-option value="5" label="5" />
            <el-option value="10" label="10" />
            <el-option value="20" label="20" />
            <el-option value="50" label="50" />
          </el-select>
          <span class="text-sm text-gray-600">条</span>
        </div>
      </div>
      <el-pagination
        v-model:current-page="currentPageValue"
        :page-size="pageSize"
        :total="totalCount"
        :page-sizes="[5, 10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  Bell,
  View,
  Edit,
  Delete,
  Promotion,
  DArrowLeft,
  DArrowRight,
  Search
} from '@element-plus/icons-vue'
import {  Notice  } from '@/types/announcement'
import { getStatusColor, getPriorityColor } from '../utils'

// Props 定义

const props = defineProps({})

// Emits 定义
const emit = defineEmits(['update'])

// 本地分页状态
const currentPageValue = ref(props.currentPage)
const pageSizeValue = ref(props.pageSize)

// 监听 props 变化
watch(() => props.currentPage, (val) => {
  currentPageValue.value = val
})

watch(() => props.pageSize, (val) => {
  pageSizeValue.value = val
})

// 选择处理
const handleSelectionChange = (selection) => {
  const ids = selection.map(item => item.id)
  emit('update:selectedIds', ids)
}

// 分页处理
const handlePageChange = (page) => {
  emit('update:currentPage', page)
  emit('pageChange', page)
}

const handlePageSizeChange = (size) => {
  emit('update:pageSize', size)
  emit('pageSizeChange', size)
}

// 展开行
const handleToggleExpand = (id) => {
  emit('update:expandedRow', props.expandedRow === id ? null : undefined)
  emit('toggleExpand', id)
}

// 操作处理
const handleView = (item) => emit('view', item)
const handleSend = (item) => emit('send', item)
const handleEdit = (item) => emit('edit', item)
const handleDelete = (item) => emit('delete', item)
</script>

<style scoped>
/* V1.1 样式保持 */
:deep(.el-table th.el-table__cell) {
  background: linear-gradient(to right, #3b82f6, #2563eb) !important;
  color: white !important;
}

:deep(.el-table--enable-row-hover) {
  --el-table-row-hover-bg-color: rgba(59, 130, 246, 0.1);
}
</style>
