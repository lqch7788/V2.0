<template>
  <!-- 物料表格组件 - 对应V1.1 MaterialsTable.tsx -->
  <div class="bg-white rounded-xl shadow-sm overflow-hidden" :style="{ maxHeight: 'calc(100vh - 400px)', display: 'flex', flexDirection: 'column' }">
    <!-- 操作栏 - 编辑/删除/导出模式下显示 -->
    <div v-if="exportMode || batchEditMode || deleteMode" class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
      <div class="flex items-center gap-4">
        <button class="text-emerald-600 hover:text-emerald-700 p-0 h-auto text-sm" @click="handleSelectAll">
          {{ isAllSelected ? '全不选' : '全选' }}
        </button>
        <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="overflow-auto flex-1 min-h-0">
      <table class="w-full" style="min-width: 1500px;">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
          <tr>
            <th
              v-if="exportMode || batchEditMode || deleteMode"
              class="px-4 py-3 text-left text-sm font-semibold w-14 whitespace-nowrap"
            >
              <input type="checkbox" :checked="isAllSelected" @change="handleSelectAll" class="w-4 h-4 rounded border-white" />
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">物料编号</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">物料名称</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">分类</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">规格型号</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">条形码</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">单位</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">库存数量</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">最低库存</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">最高库存</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">单价（元）</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">供应商</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">存放位置</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">批次号</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">生产日期</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">有效期至</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">最后更新时间</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">数据状态</th>
            <th
              v-if="!exportMode && !batchEditMode && !deleteMode"
              class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
            >操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <tr v-if="displayedMaterials.length === 0">
            <td :colspan="(exportMode || batchEditMode || deleteMode) ? 18 : 18" class="px-4 py-8 text-center text-gray-500">
              暂无数据
            </td>
          </tr>
          <tr
            v-for="row in displayedMaterials"
            :key="row.id"
            class="hover:bg-blue-100 transition-colors"
          >
            <td v-if="exportMode || batchEditMode || deleteMode" class="px-4 py-3">
              <input
                type="checkbox"
                :checked="selectedRows.includes(row.id)"
                @change="$emit('selectRow', selectedRows.includes(row.id) ? selectedRows.filter(id => id !== row.id) : [...selectedRows, row.id])"
                class="w-4 h-4 rounded border-gray-400"
              />
            </td>
            <td class="px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer underline whitespace-nowrap" @click="handleView(row)">
              {{ row.code }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.name }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.category }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.specification }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.barcode }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.unit }}</td>
            <td class="px-4 py-3 text-sm whitespace-nowrap">
              <span :class="row.quantity < row.minStock ? 'text-red-600 font-medium' : 'text-gray-900'">
                {{ row.quantity }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.minStock }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.maxStock }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.price ? row.price.replace('元', '') : '' }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.supplier }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.location }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span
                class="inline-flex px-2 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-green-100 text-green-700': row.dataStatus === '启用',
                  'bg-red-100 text-red-700': row.dataStatus !== '启用'
                }"
              >
                {{ row.dataStatus }}
              </span>
            </td>
            <td v-if="!exportMode && !batchEditMode && !deleteMode" class="px-4 py-3 whitespace-nowrap">
              <div class="flex items-center gap-1">
                <button class="h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700" @click="handleView(row)">查看</button>
                <button class="h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700" @click="handleEdit(row)">编辑</button>
                <button class="h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1 bg-red-600 text-white hover:bg-red-700" @click="handleDelete(row)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100 flex-shrink-0">
      <Pagination
        :current-page="localCurrentPage"
        :total-pages="totalPages"
        :page-size="localPageSize"
        :page-size-options="[10, 20, 50]"
        :show-page-size="true"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Pagination from '@/components/ui/Pagination/Pagination.vue'

/**
 * 物料表格组件
 * 展示物料列表，支持选择、分页、排序等功能
 */

const props = defineProps({
  // 物料列表
  materials: {
    type: Array,
    default: () => []
  },
  // 当前页码
  currentPage: {
    type: Number,
    default: 1
  },
  // 每页数量
  pageSize: {
    type: Number,
    default: 10
  },
  // 已选择的行ID列表
  selectedRows: {
    type: Array,
    default: () => []
  },
  // 是否为导出模式
  exportMode: {
    type: Boolean,
    default: false
  },
  // 是否为批量编辑模式
  batchEditMode: {
    type: Boolean,
    default: false
  },
  // 是否为删除模式
  deleteMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'pageChange',
  'pageSizeChange',
  'selectAll',
  'selectRow',
  'view',
  'edit',
  'delete',
  'cancelSelection',
  'confirmExport'
])

// 本地状态
const localCurrentPage = ref(props.currentPage)
const localPageSize = ref(props.pageSize)

// 监听 props 变化
watch(() => props.currentPage, (val) => { localCurrentPage.value = val })
watch(() => props.pageSize, (val) => { localPageSize.value = val })

// 计算属性
const totalPages = computed(() => Math.ceil(props.materials.length / localPageSize.value) || 1)
const startIdx = computed(() => (localCurrentPage.value - 1) * localPageSize.value)
const endIdx = computed(() => Math.min(startIdx.value + localPageSize.value, props.materials.length))
const displayedMaterials = computed(() => props.materials.slice(startIdx.value, endIdx.value))
const isAllSelected = computed(() => props.materials.length > 0 && props.selectedRows.length === props.materials.length)

// 方法
const handlePageChange = (page) => {
  localCurrentPage.value = page
  emit('pageChange', page)
}

const handlePageSizeChange = (size) => {
  localPageSize.value = size
  localCurrentPage.value = 1
  emit('pageSizeChange', size)
  emit('pageChange', 1)
}

const handleSelectAll = () => {
  emit('selectAll')
}

const handleSelectionChange = (selection) => {
  emit('selectRow', selection.map(item => item.id))
}

const handleView = (material) => {
  emit('view', material)
}

const handleEdit = (material) => {
  emit('edit', material)
}

const handleDelete = (material) => {
  emit('delete', material)
}
</script>
