<!--
  MaterialSummaryTable - 物料汇总表 Tab 3 子组件（21 列对齐 V1.1）
  从 MaterialReceiving.vue 整体拆分
-->
<template>
  <div class="border border-gray-200 rounded-xl overflow-hidden bg-white">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <tr>
            <th v-if="statExportMode" class="px-3 py-3 text-left text-sm font-semibold w-12">
              <input type="checkbox" :checked="filteredMaterialStatData.length > 0 && statSelectedRows.length === filteredMaterialStatData.length" @change="handleMaterialStatSelectAll" class="w-4 h-4 rounded border-white" />
            </th>
            <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">物料编号</th>
            <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">物料名称</th>
            <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">分类</th>
            <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">规格型号</th>
            <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">条形码</th>
            <th class="px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">单位</th>
            <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">供应商</th>
            <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">批次号</th>
            <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">生产日期</th>
            <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">有效期至</th>
            <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">生产计划批次</th>
            <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">领料部门</th>
            <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">用途/区域</th>
            <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">领料人</th>
            <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">领料时间</th>
            <th class="px-3 py-3 text-right text-sm font-semibold whitespace-nowrap">领料次数</th>
            <th class="px-3 py-3 text-right text-sm font-semibold whitespace-nowrap">总数量</th>
            <th class="px-3 py-3 text-right text-sm font-semibold whitespace-nowrap">实际数量</th>
            <th class="px-3 py-3 text-right text-sm font-semibold whitespace-nowrap">总金额(元)</th>
            <th class="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">主要仓库</th>
            <th v-if="!statExportMode" class="px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <tr v-if="paginatedMaterialStatData.length === 0">
            <td :colspan="statExportMode ? 21 : 22" class="px-4 py-8 text-center text-gray-500">
              <span v-if="isLoadingStat">加载中…</span>
              <span v-else>暂无数据</span>
            </td>
          </tr>
          <tr v-for="(row, idx) in paginatedMaterialStatData" :key="(row.materialCode || '') + '-' + (row.batchCode || '') + '-' + idx" class="hover:bg-blue-50 transition-colors">
            <td v-if="statExportMode" class="px-3 py-2">
              <input type="checkbox" :checked="statSelectedRows.includes((statCurrentPage - 1) * 10 + idx)" @change="toggleStatRow((statCurrentPage - 1) * 10 + idx)" class="w-4 h-4 rounded border-gray-400" />
            </td>
            <td class="px-3 py-2 text-sm font-mono text-blue-600 whitespace-nowrap">{{ row.materialCode || '-' }}</td>
            <td class="px-3 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">{{ row.materialName || '-' }}</td>
            <td class="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{{ row.category || '-' }}</td>
            <td class="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{{ row.spec || '-' }}</td>
            <td class="px-3 py-2 text-sm font-mono text-gray-500 whitespace-nowrap">{{ row.barcode || '-' }}</td>
            <td class="px-3 py-2 text-sm text-center text-gray-700 whitespace-nowrap">{{ row.unit || '-' }}</td>
            <td class="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{{ row.supplier || '-' }}</td>
            <td class="px-3 py-2 text-sm font-mono text-gray-500 whitespace-nowrap">{{ row.batchCode || '-' }}</td>
            <td class="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{{ row.productionDate || '-' }}</td>
            <td class="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{{ row.expiryDate || '-' }}</td>
            <td class="px-3 py-2 text-sm font-mono text-cyan-600 whitespace-nowrap">{{ row.productionPlanBatchCode || '-' }}</td>
            <td class="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{{ row.requisitionDepartment || '-' }}</td>
            <td class="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{{ row.usageArea || '-' }}</td>
            <td class="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{{ row.requisitioner || '-' }}</td>
            <td class="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{{ row.requisitionTime || '-' }}</td>
            <td class="px-3 py-2 text-sm text-right font-medium text-blue-600 whitespace-nowrap">{{ row.requisitionCount || 0 }}</td>
            <td class="px-3 py-2 text-sm text-right font-medium text-gray-900 whitespace-nowrap">{{ formatNumber(row.totalQuantity) }}</td>
            <td class="px-3 py-2 text-sm text-right font-medium text-gray-900 whitespace-nowrap">{{ formatNumber(row.actualQuantity) }}</td>
            <td class="px-3 py-2 text-sm text-right font-bold text-emerald-600 whitespace-nowrap">¥{{ formatNumber(row.totalAmount) }}</td>
            <td class="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{{ row.mainWarehouse || '-' }}</td>
            <td v-if="!statExportMode" class="px-3 py-2 text-center whitespace-nowrap">
              <button class="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-1 inline-flex items-center gap-1 text-sm" @click="$emit('view-detail', row)" title="查看明细">
                <Eye class="w-4 h-4" />查看明细
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
      <span>共 {{ filteredMaterialStatData.length }} 条</span>
      <el-pagination
        :current-page="statCurrentPage"
        :total="filteredMaterialStatData.length"
        :page-size="statPageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @update:current-page="$emit('update:currentPage', $event)"
        @update:page-size="$emit('update:pageSize', $event)"
        @size-change="() => $emit('update:currentPage', 1)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Eye } from 'lucide-vue-next'

const props = defineProps({
  filteredMaterialStatData: { type: Array, default: () => [] },
  paginatedMaterialStatData: { type: Array, default: () => [] },
  statSelectedRows: { type: Array, default: () => [] },
  statExportMode: { type: Boolean, default: false },
  statCurrentPage: { type: Number, default: 1 },
  statPageSize: { type: Number, default: 10 },
  isLoadingStat: { type: Boolean, default: false },
  formatNumber: { type: Function, default: (n) => Number(n || 0).toLocaleString() }
})

const emit = defineEmits(['select-all', 'toggle-row', 'view-detail', 'update:currentPage', 'update:pageSize'])

const handleMaterialStatSelectAll = () => emit('select-all')
const toggleStatRow = (idx) => emit('toggle-row', idx)
</script>
