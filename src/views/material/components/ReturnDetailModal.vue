<template>
  <ElModal
    :model-value="show"
    title="退料单详情"
    :width="700"
    :height="600"
    @update:model-value="(v) => { if (!v) $emit('close') }"
    @close="$emit('close')"
  >
 showDetailModal = v"
      @close="showDetailModal = false"
    >
      <div v-if="selectedRecord" class="p-2">
        <!-- 基本信息 - 紧凑排布，每行3个 -->
        <div class="bg-gray-100 rounded-lg p-3 mb-4">
          <div class="grid grid-cols-3 gap-y-2 text-sm">
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-20 shrink-0">退料单号：</span>
              <span class="font-mono font-medium text-gray-900">{ selectedRecord.code }</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-20 shrink-0">退料日期：</span>
              <span class="font-medium text-gray-900">{ selectedRecord.date }</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-20 shrink-0">退料类型：</span>
              <span class="font-medium text-gray-900">{ selectedRecord.type }</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-20 shrink-0">申请人：</span>
              <span class="font-medium text-gray-900">{ selectedRecord.applicant }</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-20 shrink-0">退料部门：</span>
              <span class="font-medium text-gray-900">{ selectedRecord.department }</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-20 shrink-0">仓库位置：</span>
              <span class="font-medium text-gray-900">{ selectedRecord.warehouseLocation }</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-20 shrink-0">审批状态：</span>
              <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" :class="getStatusClass(selectedRecord)">{ selectedRecord.status }</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-20 shrink-0">操作人：</span>
              <span class="font-medium text-gray-900">{ selectedRecord.operator || '-' }</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-20 shrink-0">审核人：</span>
              <span class="font-medium text-gray-900">{ selectedRecord.reviewer || '-' }</span>
            </div>
            <div class="flex items-center gap-2 col-span-3">
              <span class="text-gray-500 w-20 shrink-0">审核日期：</span>
              <span class="font-medium text-gray-900">{ selectedRecord.reviewDate || '-' }</span>
            </div>
            <div v-if="selectedRecord.rejectReason" class="flex items-center gap-2 col-span-3">
              <span class="text-gray-500 w-20 shrink-0">驳回原因：</span>
              <span class="font-medium text-red-600">{ selectedRecord.rejectReason }</span>
            </div>
            <div v-if="selectedRecord.remark" class="flex items-center gap-2 col-span-3">
              <span class="text-gray-500 w-20 shrink-0">备注：</span>
              <span class="font-medium text-gray-900">{ selectedRecord.remark }</span>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <h4 class="font-medium mb-2">退料物料明细</h4>
          <div class="overflow-x-auto rounded-lg border border-gray-200">
            <table class="w-full text-xs">
              <thead>
                <tr class="bg-emerald-100 text-gray-700">
                  <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">来源领料单号</th>
                  <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">物料编码</th>
                  <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">物料分类</th>
                  <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">物料名称</th>
                  <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">规格</th>
                  <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">单位</th>
                  <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">退料数量</th>
                  <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">单价(元)</th>
                  <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">小计(元)</th>
                  <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">仓库货位</th>
                  <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">退料原因</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="mr in selectedRecord.materials" :key="mr.id || mr.materialCode" class="hover:bg-gray-50">
                  <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{ mr.sourceApplicationCode }</td>
                  <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{ mr.materialCode }</td>
                  <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{ mr.category }</td>
                  <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{ mr.materialName }</td>
                  <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{ mr.spec }</td>
                  <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{ mr.unit }</td>
                  <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{ mr.returnQuantity }</td>
                  <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{ mr.unitPrice }</td>
                  <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{ ((mr.returnQuantity || 0) * (mr.unitPrice || 0)).toFixed(2) }</td>
                  <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{ mr.warehousePosition }</td>
                  <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{ mr.reason }</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button size="small" @click="showDetailModal = false">关闭</el-button>
      </template>
    
  </ElModal>
</template>

<script setup>
import { ElModal } from '@/components/ui'
defineProps({
  show: { type: Boolean, default: false }
})
defineEmits(['close'])
</script>
