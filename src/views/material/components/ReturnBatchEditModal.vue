<template>
  <ElModal
    :model-value="show"
    title="批量编辑退料记录"
    :width="900"
    :height="650"
    @update:model-value="(v) => { if (!v) $emit('close') }"
    @close="$emit('close')"
  >
 { if (!v) closeBatchEditModal() }"
      @close="closeBatchEditModal"
    >
      <div class="p-2">
        <!-- 进度提示 -->
        <div class="bg-blue-50 rounded-lg p-3 mb-3">
          <p class="text-sm text-blue-800">已选择 <strong>{ selectedRows.length }</strong> 条退料记录进行批量编辑，已编辑 <strong>{ Object.keys(batchEditedRecords).length }</strong> 条</p>
        </div>

        <!-- 退料单选择下拉 -->
        <div class="mb-3">
          <select
            :value="selectedRows[currentBatchEditIndex]"
            @change="(e) => { const idx = selectedRows.indexOf(Number(e.target.value)); if (idx >= 0) currentBatchEditIndex = idx }"
            class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"
          >
            <option v-for="id in selectedRows" :key="id" :value="id">
              { getRecordById(id)?.code || '-' } ({ getRecordById(id)?.applicant || '-' }){ batchEditedRecords[id] ? ' [已编辑]' : '' }
            </option>
          </select>
        </div>

        <template v-if="currentBatchRecord">
          <!-- 基本信息 -->
          <div class="bg-gray-100 rounded-lg p-3 mb-3">
            <div class="grid grid-cols-3 gap-y-2 text-sm">
              <div class="flex items-center gap-2">
                <span class="text-gray-500 w-20 shrink-0">退料单号：</span>
                <span class="font-mono font-medium text-gray-900">{ currentBatchRecord.code || '-' }</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-gray-500 w-20 shrink-0">日期：</span>
                <input :value="currentBatchRecord.date" @input="batchHandleFieldChange(currentBatchId, 'date', $event.target.value)" type="date" class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-gray-500 w-20 shrink-0">退料类型：</span>
                <select :value="currentBatchRecord.type" @change="batchHandleFieldChange(currentBatchId, 'type', $event.target.value)" class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm bg-white">
                  <option v-for="t in RETURN_TYPES" :key="t" :value="t">{ t }</option>
                </select>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-gray-500 w-20 shrink-0">申请人：</span>
                <input :value="currentBatchRecord.applicant" @input="batchHandleFieldChange(currentBatchId, 'applicant', $event.target.value)" class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-gray-500 w-20 shrink-0">部门：</span>
                <select :value="currentBatchRecord.department" @change="batchHandleFieldChange(currentBatchId, 'department', $event.target.value)" class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm bg-white">
                  <option v-for="d in departmentOptions" :key="d" :value="d">{ d }</option>
                </select>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-gray-500 w-20 shrink-0">仓库位置：</span>
                <input :value="currentBatchRecord.warehouseLocation" @input="batchHandleFieldChange(currentBatchId, 'warehouseLocation', $event.target.value)" class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" placeholder="请输入" />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-gray-500 w-20 shrink-0">操作人：</span>
                <input :value="currentBatchRecord.operator" @input="batchHandleFieldChange(currentBatchId, 'operator', $event.target.value)" class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" placeholder="请输入" />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-gray-500 w-20 shrink-0">审核人：</span>
                <input :value="currentBatchRecord.reviewer" @input="batchHandleFieldChange(currentBatchId, 'reviewer', $event.target.value)" class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" placeholder="请输入" />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-gray-500 w-20 shrink-0">状态：</span>
                <span class="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-sm text-gray-600">{ currentBatchRecord.status || '-' }</span>
                <span class="text-xs text-gray-400">（审批状态由系统自动生成）</span>
              </div>
              <div class="flex items-center gap-2 col-span-3">
                <span class="text-gray-500 w-20 shrink-0">备注：</span>
                <input :value="currentBatchRecord.remark" @input="batchHandleFieldChange(currentBatchId, 'remark', $event.target.value)" class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" placeholder="请输入" />
              </div>
            </div>
          </div>

          <!-- 物料明细 -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700">物料明细</label>
              <span class="text-xs text-gray-500">共 { currentBatchRecord.materials?.length || 0 } 条</span>
            </div>
            <div v-if="currentBatchRecord.materials?.length" class="border border-gray-200 rounded-lg overflow-hidden">
              <div class="overflow-auto max-h-[320px]">
                <table class="text-xs w-full" style="min-width: 1200px">
                  <thead class="bg-emerald-100 text-gray-700">
                    <tr>
                      <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">来源领料单号</th>
                      <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">物料编码</th>
                      <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">物料分类</th>
                      <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">物料名称</th>
                      <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">规格</th>
                      <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">单位</th>
                      <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">退料数量</th>
                      <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">单价</th>
                      <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">仓库货位</th>
                      <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">退料原因</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr v-for="(mr, $index) in currentBatchRecord.materials" :key="$index">
                      <td class="px-1 py-1"><input v-model="mr.sourceApplicationCode" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" @input="batchHandleMaterialChange(currentBatchId, $index, 'sourceApplicationCode', $event.target.value)" /></td>
                      <td class="px-1 py-1"><input v-model="mr.materialCode" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" @input="batchHandleMaterialChange(currentBatchId, $index, 'materialCode', $event.target.value)" /></td>
                      <td class="px-1 py-1"><input v-model="mr.category" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" @input="batchHandleMaterialChange(currentBatchId, $index, 'category', $event.target.value)" placeholder="中类-小类" /></td>
                      <td class="px-1 py-1"><input v-model="mr.materialName" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" @input="batchHandleMaterialChange(currentBatchId, $index, 'materialName', $event.target.value)" /></td>
                      <td class="px-1 py-1"><input v-model="mr.spec" class="w-16 h-6 px-1 border border-gray-200 rounded text-xs" @input="batchHandleMaterialChange(currentBatchId, $index, 'spec', $event.target.value)" /></td>
                      <td class="px-1 py-1"><input v-model="mr.unit" class="w-12 h-6 px-1 border border-gray-200 rounded text-xs" @input="batchHandleMaterialChange(currentBatchId, $index, 'unit', $event.target.value)" /></td>
                      <td class="px-1 py-1"><input v-model.number="mr.returnQuantity" type="number" min="0" class="w-16 h-6 px-1 border border-gray-200 rounded text-xs" @change="batchHandleMaterialChange(currentBatchId, $index, 'returnQuantity', $event.target.value)" /></td>
                      <td class="px-1 py-1"><input v-model.number="mr.unitPrice" type="number" min="0" class="w-16 h-6 px-1 border border-gray-200 rounded text-xs" @change="batchHandleMaterialChange(currentBatchId, $index, 'unitPrice', $event.target.value)" /></td>
                      <td class="px-1 py-1"><input v-model="mr.warehousePosition" class="w-16 h-6 px-1 border border-gray-200 rounded text-xs" @input="batchHandleMaterialChange(currentBatchId, $index, 'warehousePosition', $event.target.value)" placeholder="仓库-区-位" /></td>
                      <td class="px-1 py-1">
                        <select v-model="mr.reason" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs bg-white" @change="batchHandleMaterialChange(currentBatchId, $index, 'reason', $event.target.value)">
                          <option value="">请选择</option>
                          <option v-for="r in RETURN_REASONS" :key="r" :value="r">{ r }</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500 italic border border-gray-200 rounded-lg p-4 text-center">暂无物料明细</div>
          </div>
        </template>
      </div>

      <template #footer>
        <el-button size="small" @click="closeBatchEditModal">取消</el-button>
        <el-button size="small" @click="batchGoToNext">下一条</el-button>
        <el-button type="primary" size="small" @click="handleBatchSaveAll">保存全部 ({ Object.keys(batchEditedRecords).length } 个)</el-button>
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
