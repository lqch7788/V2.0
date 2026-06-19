<!--
  MaterialReturn 表格主体子组件（含展开行 + 物料明细子表）
  从 MaterialReturn.vue 拆分（保持 1:1 模板和样式）
-->
<template>
  <div class="overflow-auto max-h-[calc(100vh-400px)]">
    <table class="w-full">
      <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
        <tr>
          <th v-if="exportMode || batchEditMode || deleteMode" class="px-4 py-3 text-left text-sm font-semibold w-14 whitespace-nowrap">
            <input type="checkbox" :checked="paginatedReturns.length > 0 && selectedRows.length === paginatedReturns.length" @change="$emit('toggleSelectAll')" class="w-4 h-4 rounded border-white" />
          </th>
          <th class="px-4 py-3 text-left text-sm font-semibold w-12 whitespace-nowrap"></th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">退料单号</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">退料日期</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">退料类型</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">申请人</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作人</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">退料部门</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">仓库位置</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">审批状态</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">审核人</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">备注</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-300">
        <tr v-if="paginatedReturns.length === 0">
          <td :colspan="(exportMode || batchEditMode || deleteMode) ? 12 : 11" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
        </tr>
        <template v-for="row in paginatedReturns" :key="row.id">
          <tr class="hover:bg-blue-100 transition-colors">
            <td v-if="exportMode || batchEditMode || deleteMode" class="px-4 py-3">
              <input type="checkbox" :checked="selectedRows.includes(row.id)" :disabled="!checkSelectable(row)" @change="$emit('toggleRow', row.id)" class="w-4 h-4 rounded border-gray-400" />
            </td>
            <td class="px-4 py-3">
              <button class="text-gray-500 hover:text-blue-600 p-1" @click="$emit('toggleExpand', row.id)">
                <ChevronDown v-if="expandedRows.has(row.id)" class="w-4 h-4" />
                <ChevronRight v-else class="w-4 h-4" />
              </button>
            </td>
            <td class="px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer whitespace-nowrap" @click="$emit('view', row)">{{ row.code }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.date }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.type }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.applicant }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.operator || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.department }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.warehouseLocation }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="getStatusClass(row)">{{ row.status }}</span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.reviewer || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.remark || '-' }}</td>
          </tr>
          <!-- 展开行：物料明细 -->
          <tr v-if="expandedRows.has(row.id)" :key="'exp-' + row.id" class="bg-gray-50">
            <td :colspan="(exportMode || batchEditMode || deleteMode) ? 12 : 11" class="p-4">
              <h4 class="font-medium mb-2 text-gray-700">退料物料明细</h4>
              <div class="overflow-x-auto">
                <table class="w-full border border-gray-200">
                  <thead class="bg-[#F2F6FA] text-gray-700">
                    <tr>
                      <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">来源领料单号</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">物料编码</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">物料分类</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">物料名称</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">规格</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">单位</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">本次退料数量</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">单价(元)</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">小计(元)</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">仓库货位</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">退料原因</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr v-if="!row.materials || row.materials.length === 0">
                      <td colspan="11" class="px-3 py-4 text-center text-sm text-gray-500">暂无物料</td>
                    </tr>
                    <tr v-for="mr in row.materials" :key="mr.id || mr.materialCode" class="hover:bg-white">
                      <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ mr.sourceApplicationCode }}</td>
                      <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ mr.materialCode }}</td>
                      <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ mr.category }}</td>
                      <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ mr.materialName }}</td>
                      <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ mr.spec }}</td>
                      <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ mr.unit }}</td>
                      <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ mr.returnQuantity }}</td>
                      <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ mr.unitPrice }}</td>
                      <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ ((mr.returnQuantity || 0) * (mr.unitPrice || 0)).toFixed(2) }}</td>
                      <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ mr.warehousePosition }}</td>
                      <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ mr.reason }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import { getStatusClass } from '../utils/materialReturnConfig'

defineProps({
  paginatedReturns: { type: Array, default: () => [] },
  selectedRows: { type: Array, default: () => [] },
  expandedRows: { type: Set, default: () => new Set() },
  exportMode: { type: Boolean, default: false },
  batchEditMode: { type: Boolean, default: false },
  deleteMode: { type: Boolean, default: false },
  checkSelectable: { type: Function, required: true }
})

defineEmits(['toggleSelectAll', 'toggleRow', 'toggleExpand', 'view'])
</script>
