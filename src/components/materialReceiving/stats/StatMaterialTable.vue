<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="p-4 border-b border-gray-100 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">物料领用统计</h3>
      <div class="flex gap-2">
        <template v-if="exportMode">
          <el-button type="primary" size="small" @click="$emit('export-confirm')">
            <el-icon><Download /></el-icon>
            确认导出
          </el-button>
          <el-button size="small" @click="$emit('export-cancel')">取消</el-button>
        </template>
        <template v-else>
          <el-button size="small" @click="$emit('toggle-export-mode')">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </template>
      </div>
    </div>

    <!-- 表格 -->
    <el-table :data="tableData" style="width: 100%" stripe>
      <el-table-column type="selection" width="55" v-if="exportMode" />
      <el-table-column prop="materialCode" label="物料编码" min-width="120" />
      <el-table-column prop="materialName" label="物料名称" min-width="150" />
      <el-table-column prop="category" label="分类" min-width="120" />
      <el-table-column prop="spec" label="规格" min-width="100" />
      <el-table-column prop="unit" label="单位" width="80" />
      <el-table-column prop="totalQuantity" label="领用总量" width="120" sortable />
      <el-table-column prop="totalAmount" label="总金额" width="120" sortable>
        <template #default="{ row }">
          ¥{{ row.totalAmount?.toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="supplier" label="供应商" min-width="120" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button text size="small" @click="$emit('view-detail', row)">查看明细</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="p-4 border-t border-gray-100 flex justify-end">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="$emit('page-size-change', $event)"
        @current-change="$emit('page-change', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Download } from '@element-plus/icons-vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 20 },
  total: { type: Number, default: 0 },
  exportMode: { type: Boolean, default: false }
})

defineEmits([
  'toggle-export-mode', 'export-confirm', 'export-cancel',
  'page-change', 'page-size-change', 'view-detail'
])

const currentPage = ref(props.currentPage)

const tableData = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize
  return props.data.slice(start, start + props.pageSize)
})
</script>
