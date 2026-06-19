<!--
  MaterialApproval - 退料审批表格
  从 MaterialApproval.vue 拆分（保持 1:1 模板和样式）
-->
<template>
  <div class="overflow-auto max-h-[calc(100vh-400px)]">
    <table class="w-full">
      <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
        <tr>
          <th class="px-4 py-3 text-left text-sm font-semibold w-14 whitespace-nowrap"></th>
          <th class="px-4 py-3 text-left text-sm font-semibold w-12 whitespace-nowrap"></th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">退料单号</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">退料日期</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">退料类型</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">申请人</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">退料部门</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">仓库位置</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">审批状态</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">审核人</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">备注</th>
          <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-300">
        <tr v-if="data.length === 0">
          <td colspan="12" class="px-4 py-8 text-center text-gray-500">暂无审批记录</td>
        </tr>
        <template v-for="row in data" :key="row.id">
          <tr class="hover:bg-blue-100 transition-colors">
            <td class="px-4 py-3">
              <button v-if="row.status === 'pending'" class="p-1" @click="$emit('toggleSelect', row.id)">
                <Check v-if="selectedIds.has(row.id)" :size="16" class="text-emerald-600" />
                <PlusCircle v-else :size="16" class="text-gray-400" />
              </button>
            </td>
            <td class="px-4 py-3">
              <button class="text-gray-500 hover:text-blue-600 p-1" @click="$emit('expandRow', row.id)">
                <ChevronDown v-if="expandedRows.includes(row.id)" :size="14" />
                <ChevronRight v-else :size="14" />
              </button>
            </td>
            <td class="px-4 py-3 text-sm font-medium text-blue-600 whitespace-nowrap">{{ row.code }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.applyDate }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ getReturnType(row) }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.applicantName }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.applicantDepartment }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.warehouseLocation }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="{
                'bg-green-100 text-green-700': row.status === 'approved',
                'bg-red-100 text-red-700': row.status === 'rejected',
                'bg-amber-100 text-amber-700': row.status === 'pending'
              }">{{ getReturnStatusText(row.status) }}</span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.approvers?.[0]?.userName || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.description }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex items-center gap-1">
                <button v-if="row.status === 'pending' && canApprove" class="text-green-600 hover:text-green-800 p-1" title="通过" @click="$emit('approve', row)">
                  <CheckCircle :size="16" />
                </button>
                <button v-if="row.status === 'pending' && canApprove" class="text-red-600 hover:text-red-800 p-1" title="拒绝" @click="$emit('reject', row)">
                  <XCircle :size="16" />
                </button>
                <button class="text-blue-600 hover:text-blue-800 p-1" title="查看详情" @click="$emit('viewDetail', row)">
                  <Eye :size="16" />
                </button>
              </div>
            </td>
          </tr>
          <!-- 展开行：退料物料明细 -->
          <tr v-if="expandedRows.includes(row.id)" :key="'exp-' + row.id" class="bg-gray-50">
            <td colspan="12" class="p-4">
              <div class="font-medium text-blue-800 mb-2">退料物料明细</div>
              <div class="overflow-x-auto mb-3">
                <table class="w-full border border-gray-200">
                  <thead class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                    <tr>
                      <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">来源领料单号</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">物料编码</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">物料分类</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">物料名称</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">规格</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">单位</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">退料数量</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">单价(元)</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">小计(元)</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">仓库货位</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">退料原因</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr v-for="m in row.materials" :key="m.id || m.materialCode" class="hover:bg-white">
                      <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ m.sourceApplicationCode }}</td>
                      <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ m.materialCode }}</td>
                      <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ m.category }}</td>
                      <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ m.materialName }}</td>
                      <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ m.spec }}</td>
                      <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ m.unit }}</td>
                      <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ m.returnQuantity || m.requestedQuantity || 0 }}</td>
                      <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ m.unitPrice != null ? m.unitPrice.toFixed(2) : '-' }}</td>
                      <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ m.unitPrice != null ? ((m.returnQuantity || m.requestedQuantity || 0) * m.unitPrice).toFixed(2) : '-' }}</td>
                      <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ m.warehousePosition }}</td>
                      <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ m.reason }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-if="row.description" class="text-gray-600 mt-3">
                <span class="font-medium">退料说明：</span>{{ row.description }}
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { Check, PlusCircle, ChevronDown, ChevronRight, CheckCircle, XCircle, Eye } from 'lucide-vue-next'
import { getReturnStatusText, getReturnType } from '../utils/materialApprovalLabels'

defineProps({
  data: { type: Array, default: () => [] },
  selectedIds: { type: Set, default: () => new Set() },
  expandedRows: { type: Array, default: () => [] },
  canApprove: { type: Boolean, default: true }
})

defineEmits(['toggleSelect', 'expandRow', 'approve', 'reject', 'viewDetail'])
</script>
