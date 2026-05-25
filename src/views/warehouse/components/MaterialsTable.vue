<template>
  <!-- 物料表格组件 - 对应V1.1 MaterialsTable.tsx -->
  <div class="bg-white rounded-xl shadow-sm overflow-hidden" :style="{ maxHeight: 'calc(100vh - 400px)', display: 'flex', flexDirection: 'column' }">
    <!-- 操作栏 - 编辑/删除/导出模式下显示 -->
    <div v-if="exportMode || batchEditMode || deleteMode" class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
      <div class="flex items-center gap-4">
        <el-button link type="primary" @click="handleSelectAll" class="text-emerald-600 hover:text-emerald-700 p-0 h-auto">
          {{ isAllSelected ? '全不选' : '全选' }}
        </el-button>
        <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
      </div>
    </div>

    <!-- 表格区域 -->
    <div style="overflow-x: auto; overflow-y: auto; flex: 1; minHeight: 0;">
      <el-table
        :data="displayedMaterials"
        stripe
        :style="{ minWidth: '1500px', tableLayout: 'fixed' }"
        @selection-change="handleSelectionChange"
      >
        <!-- 选择列 -->
        <el-table-column
          v-if="exportMode || batchEditMode || deleteMode"
          type="selection"
          width="55"
        />

        <!-- 物料编号 -->
        <el-table-column prop="code" label="物料编号" width="140">
          <template #default="{ row }">
            <span
              class="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer underline whitespace-nowrap"
              @click="handleView(row)"
            >
              {{ row.code }}
            </span>
          </template>
        </el-table-column>

        <!-- 物料名称 -->
        <el-table-column prop="name" label="物料名称" width="140" />

        <!-- 分类 -->
        <el-table-column prop="category" label="分类" width="160" />

        <!-- 规格型号 -->
        <el-table-column prop="specification" label="规格型号" width="120" />

        <!-- 条形码 -->
        <el-table-column prop="barcode" label="条形码" width="120" />

        <!-- 单位 -->
        <el-table-column prop="unit" label="单位" width="80" />

        <!-- 库存数量 -->
        <el-table-column prop="quantity" label="库存数量" width="100">
          <template #default="{ row }">
            <span :class="row.quantity < row.minStock ? 'text-red-600 font-medium' : 'text-gray-900'">
              {{ row.quantity }}
            </span>
          </template>
        </el-table-column>

        <!-- 最低库存 -->
        <el-table-column prop="minStock" label="最低库存" width="100" />

        <!-- 最高库存 -->
        <el-table-column prop="maxStock" label="最高库存" width="100" />

        <!-- 单价 -->
        <el-table-column prop="price" label="单价（元）" width="100">
          <template #default="{ row }">
            {{ row.price ? row.price.replace('元', '') : '' }}
          </template>
        </el-table-column>

        <!-- 供应商 -->
        <el-table-column prop="supplier" label="供应商" width="120" />

        <!-- 存放位置 -->
        <el-table-column prop="location" label="存放位置" width="100" />

        <!-- 批次号 -->
        <el-table-column prop="batchNo" label="批次号" width="120" />

        <!-- 生产日期 -->
        <el-table-column prop="productionDate" label="生产日期" width="120" />

        <!-- 有效期至 -->
        <el-table-column prop="expiryDate" label="有效期至" width="120" />

        <!-- 最后更新时间 -->
        <el-table-column prop="lastUpdateTime" label="最后更新时间" width="140">
          <template #default="{ row }">
            {{ row.lastUpdateTime ? row.lastUpdateTime.slice(0, 10) : '' }}
          </template>
        </el-table-column>

        <!-- 数据状态 - V1.1圆角胶囊样式 -->
        <el-table-column prop="dataStatus" label="数据状态" width="100">
          <template #default="{ row }">
            <span
              class="inline-flex px-2 py-1 rounded-full text-xs font-medium"
              :class="{
                'bg-green-100 text-green-700': row.dataStatus === '启用',
                'bg-red-100 text-red-700': row.dataStatus !== '启用'
              }"
            >
              {{ row.dataStatus }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="px-4 py-3 border-t border-gray-100 flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">每页</span>
          <el-select
            v-model="localPageSize"
            style="width: 80px"
            @change="handlePageSizeChange"
          >
            <el-option :value="10" label="10" />
            <el-option :value="20" label="20" />
            <el-option :value="50" label="50" />
          </el-select>
          <span class="text-sm text-gray-500">条</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">
            共 {{ materials.length }} 条，第 {{ currentPage }} / {{ totalPages }} 页
          </span>
          <el-pagination
            v-model:current-page="localCurrentPage"
            :page-size="localPageSize"
            :total="materials.length"
            layout="prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

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
