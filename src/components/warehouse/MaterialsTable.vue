<template>
  <div class="bg-white rounded-xl shadow-sm overflow-hidden" style="max-height: calc(100vh - 400px)">
    <!-- 操作栏 -->
    <div v-if="showSelection" class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
      <div class="flex items-center gap-4">
        <el-button text @click="onSelectAll" class="text-emerald-600">{{ isAllSelected ? '全不选' : '全选' }}</el-button>
        <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
      </div>
    </div>

    <!-- 表格 -->
    <el-table
      :data="displayedMaterials"
      style="width: 100%"
      stripe
      :max-height="600"
    >
      <el-table-column type="selection" width="55" v-if="showSelection" />
      <el-table-column prop="code" label="物料编号" min-width="130" fixed>
        <template #default="{ row }">
          <span class="text-blue-600 cursor-pointer hover:text-blue-800 underline" @click="$emit('view', row)">{{ row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="物料名称" min-width="130" />
      <el-table-column prop="category" label="分类" min-width="160" />
      <el-table-column prop="specification" label="规格型号" min-width="130" />
      <el-table-column prop="barcode" label="条形码" min-width="130" />
      <el-table-column prop="unit" label="单位" width="65" />
      <el-table-column prop="quantity" label="库存数量" width="85">
        <template #default="{ row }">
          <span :class="row.quantity < row.minStock ? 'text-red-600 font-medium' : 'text-gray-900'">{{ row.quantity }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="minStock" label="最低库存" width="85" />
      <el-table-column prop="maxStock" label="最高库存" width="85" />
      <el-table-column label="单价（元）" width="100">
        <template #default="{ row }">{{ row.price?.replace('元', '') }}</template>
      </el-table-column>
      <el-table-column prop="supplier" label="供应商" min-width="130" />
      <el-table-column prop="location" label="存放位置" min-width="100" />
      <el-table-column prop="batchNo" label="批次号" min-width="100" />
      <el-table-column prop="productionDate" label="生产日期" min-width="100" />
      <el-table-column prop="expiryDate" label="有效期至" min-width="100" />
      <el-table-column label="最后更新时间" min-width="130">
        <template #default="{ row }">{{ row.lastUpdateTime?.slice(0, 10) }}</template>
      </el-table-column>
      <el-table-column label="数据状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.dataStatus === '启用' ? 'success' : 'danger'" size="small">{{ row.dataStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="!showSelection" label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button text size="small" @click="$emit('view', row)">查看</el-button>
          <el-button text size="small" @click="$emit('edit', row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="px-4 py-3 border-t border-gray-100">
      <el-pagination
        v-model:current-page="localCurrentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="materials.length"
        layout="total, sizes, prev, pager, next"
        @size-change="onPageSizeChange"
        @current-change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  materials: { type: Array, default: () => [] },
  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 20 },
  selectedRows: { type: Array, default: () => [] },
  exportMode: { type: Boolean, default: false },
  batchEditMode: { type: Boolean, default: false },
  deleteMode: { type: Boolean, default: false }
})

const emit = defineEmits(['page-change', 'page-size-change', 'select-all', 'select-row', 'view', 'edit', 'delete', 'cancel-selection', 'confirm-export'])

const showSelection = computed(() => props.exportMode || props.batchEditMode || props.deleteMode)
const isAllSelected = computed(() => props.materials.length > 0 && props.selectedRows.length === props.materials.length)
const localCurrentPage = ref(props.currentPage)

const startIdx = computed(() => (localCurrentPage.value - 1) * props.pageSize)
const endIdx = computed(() => Math.min(startIdx.value + props.pageSize, props.materials.length))
const displayedMaterials = computed(() => props.materials.slice(startIdx.value, endIdx.value))

const onPageChange = (page) => {
  localCurrentPage.value = page
  emit('page-change', page)
}

const onPageSizeChange = (size) => {
  emit('page-size-change', size)
  emit('page-change', 1)
}

const onSelectAll = () => {
  emit('select-all')
}
</script>
