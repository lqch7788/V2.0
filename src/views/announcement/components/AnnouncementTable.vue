<template>
  <!-- 公告表格组件 - V1.1样式 -->
  <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
    <table class="w-full">
      <!-- 表头 -->
      <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <tr>
          <!-- 导出模式选择列 -->
          <th v-if="exportMode" class="px-3 py-3 text-left text-sm font-semibold w-10">
            <el-checkbox
              :model-value="selectedIds.length === notices.length && notices.length > 0"
              @change="handleSelectAll"
            />
          </th>
          <th class="px-3 py-3 text-left text-sm font-semibold w-10"></th>
          <th class="px-3 py-3 text-left text-sm font-semibold">公告编号</th>
          <th class="px-3 py-3 text-left text-sm font-semibold">公告标题</th>
          <th class="px-3 py-3 text-left text-sm font-semibold">类型</th>
          <th class="px-3 py-3 text-left text-sm font-semibold">优先级</th>
          <th class="px-3 py-3 text-left text-sm font-semibold">状态</th>
          <th class="px-3 py-3 text-left text-sm font-semibold">发布日期</th>
          <th class="px-3 py-3 text-left text-sm font-semibold">阅读数</th>
          <th class="px-3 py-3 text-left text-sm font-semibold">操作</th>
        </tr>
      </thead>
      <!-- 表格主体 -->
      <tbody class="divide-y divide-gray-300">
        <template v-for="notice in notices" :key="notice.id">
          <tr
            :class="[
              'hover:bg-blue-50 transition-all duration-300',
              selectedIds.includes(notice.id) ? 'bg-blue-50' : ''
            ]"
          >
            <!-- 导出模式选择列 -->
            <td v-if="exportMode" class="px-3 py-3">
              <el-checkbox
                :model-value="selectedIds.includes(notice.id)"
                @change="() => onToggleSelect(notice.id)"
              />
            </td>
            <!-- 展开列 -->
            <td class="px-3 py-3">
              <el-button
                link
                @click="onToggleExpand(notice.id)"
              >
                <el-icon v-if="expandedRow === notice.id" class="text-gray-500">
                  <DArrowLeft style="transform: rotate(90deg)" />
                </el-icon>
                <el-icon v-else class="text-gray-500">
                  <DArrowRight />
                </el-icon>
              </el-button>
            </td>
            <!-- 公告编号 -->
            <td class="px-3 py-3 text-sm text-gray-600 font-mono">{{ notice.code }}</td>
            <!-- 公告标题 -->
            <td class="px-3 py-3">
              <div class="flex items-center gap-2">
                <el-icon class="text-blue-600"><Bell /></el-icon>
                <span class="text-sm font-medium text-gray-900">{{ notice.title }}</span>
              </div>
            </td>
            <!-- 类型 -->
            <td class="px-3 py-3">
              <span class="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {{ notice.type }}
              </span>
            </td>
            <!-- 优先级 -->
            <td class="px-3 py-3">
              <span :class="['px-2 py-1 text-xs rounded-full border', getPriorityColor(notice.priority)]">
                {{ notice.priority }}
              </span>
            </td>
            <!-- 状态 -->
            <td class="px-3 py-3">
              <span :class="['px-2 py-1 text-xs rounded-full border', getStatusColor(notice.status)]">
                {{ notice.status }}
              </span>
            </td>
            <!-- 发布日期 -->
            <td class="px-3 py-3 text-sm text-gray-600">{{ notice.date }}</td>
            <!-- 阅读数 -->
            <td class="px-3 py-3 text-sm text-gray-600 font-mono">{{ notice.readCount }}</td>
            <!-- 操作 -->
            <td class="px-3 py-3">
              <div class="flex items-center gap-1">
                <el-button link @click="onView(notice)" title="查看">
                  <el-icon><View /></el-icon>
                </el-button>
                <el-button v-if="notice.status === '草稿'" link @click="onSend(notice)" title="发送">
                  <el-icon><Promotion /></el-icon>
                </el-button>
                <el-button link @click="onEdit(notice)" title="编辑">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button link type="danger" @click="onDelete(notice)" title="删除">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </td>
          </tr>
          <!-- 展开行内容 -->
          <tr v-if="expandedRow === notice.id" class="bg-gray-50">
            <td colspan="10" class="px-6 py-4">
              <div class="bg-white rounded-lg border border-gray-200 p-4">
                <h4 class="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <el-icon class="text-blue-600"><Bell /></el-icon>
                  公告详情
                </h4>
                <div class="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span class="text-gray-500">发布部门：</span>
                    <span class="text-gray-900 font-medium">{{ notice.sender }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">接收对象：</span>
                    <span class="text-gray-900 font-medium">{{ notice.recipients }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">截止日期：</span>
                    <span class="text-gray-900 font-medium">{{ notice.deadline }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">分类：</span>
                    <span class="text-gray-900 font-medium">{{ notice.category }}</span>
                  </div>
                </div>
                <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ notice.content }}</p>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <!-- 空状态 -->
    <div v-if="notices.length === 0" class="text-center py-12">
      <el-icon class="text-6xl text-gray-400 mb-4"><Bell /></el-icon>
      <p class="text-gray-500">暂无数据</p>
    </div>

    <!-- 分页控件 - V1.1自定义样式 -->
    <div v-if="notices.length > 0" class="mt-4 flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-600">
          共 <span class="text-blue-600 font-medium">{{ totalCount }}</span> 条记录
        </span>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">每页</span>
          <el-select
            :model-value="pageSize"
            @change="(val) => onPageSizeChange(val)"
            style="width: 80px"
          >
            <el-option v-for="opt in pageSizeOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
          <span class="text-sm text-gray-600">条</span>
        </div>
      </div>

      <!-- 分页按钮组 -->
      <div class="flex items-center gap-2">
        <!-- 首页按钮 -->
        <el-button
          variant="text"
          size="small"
          @click="() => onPageChange(1)"
          :disabled="currentPage === 1"
          class="text-gray-600"
        >
          <el-icon><DArrowLeft /></el-icon>
        </el-button>
        <!-- 上一页按钮 -->
        <el-button
          variant="text"
          size="small"
          @click="() => onPageChange(currentPage - 1)"
          :disabled="currentPage === 1"
          class="text-gray-600"
        >
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <!-- 页码按钮 -->
        <template v-for="page in visiblePages" :key="page">
          <el-button
            size="small"
            :class="[
              page === currentPage
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none'
                : 'text-gray-700 hover:bg-blue-50 border-gray-300'
            ]"
            @click="() => onPageChange(page)"
          >
            {{ page }}
          </el-button>
        </template>
        <!-- 下一页按钮 -->
        <el-button
          variant="text"
          size="small"
          @click="() => onPageChange(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="text-gray-600"
        >
          <el-icon><ArrowRight /></el-icon>
        </el-button>
        <!-- 末页按钮 -->
        <el-button
          variant="text"
          size="small"
          @click="() => onPageChange(totalPages)"
          :disabled="currentPage === totalPages"
          class="text-gray-600"
        >
          <el-icon><DArrowRight /></el-icon>
        </el-button>
        <span class="text-sm text-gray-600 ml-2">
          第 <span class="text-blue-600 font-medium">{{ currentPage }}</span> / {{ totalPages }} 页
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Bell,
  View,
  Edit,
  Delete,
  Promotion,
  DArrowLeft,
  DArrowRight,
  ArrowLeft,
  ArrowRight
} from '@element-plus/icons-vue'
import { getStatusColor, getPriorityColor } from './utils'

const props = defineProps({
  notices: Array,
  selectedIds: Array,
  exportMode: Boolean,
  expandedRow: String,
  currentPage: Number,
  pageSize: Number,
  totalPages: Number,
  totalCount: Number
})

const emit = defineEmits([
  'update:currentPage',
  'page-change',
  'page-size-change',
  'select-all',
  'toggle-select',
  'toggle-expand',
  'view',
  'send',
  'edit',
  'delete'
])

// 分页选项
const pageSizeOptions = [5, 10, 20, 50]

// 计算可见的页码（最多显示5页）
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let startPage = Math.max(1, props.currentPage - Math.floor(maxVisible / 2))
  const endPage = Math.min(props.totalPages, startPage + maxVisible - 1)

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  return pages
})

// 全选操作
const handleSelectAll = () => {
  emit('select-all')
}

// 页面变化
const onPageChange = (page) => {
  emit('update:currentPage', page)
  emit('page-change', page)
}

// 页面大小变化
const onPageSizeChange = (size) => {
  emit('page-size-change', size)
}

// 切换选择
const onToggleSelect = (id) => {
  emit('toggle-select', id)
}

// 切换展开
const onToggleExpand = (id) => {
  emit('toggle-expand', id)
}

// 查看
const onView = (item) => {
  emit('view', item)
}

// 发送
const onSend = (item) => {
  emit('send', item)
}

// 编辑
const onEdit = (item) => {
  emit('edit', item)
}

// 删除
const onDelete = (item) => {
  emit('delete', item)
}
</script>

<style scoped>
/* 表格行悬浮效果由hover:bg-blue-50 transition-all duration-300实现 */

/* 渐变按钮样式 */
:deep(.bg-gradient-to-r.from-blue-500.to-blue-600) {
  background: linear-gradient(to right, #3b82f6, #2563eb);
  color: white;
}
</style>
