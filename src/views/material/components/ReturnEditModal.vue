<template>
  <ElModal
    :model-value="show"
    title="编辑退料单"
    :width="900"
    :height="650"
    @update:model-value="(v) => { if (!v) $emit('close') }"
    @close="$emit('close')"
  >
 showEditModal = v"
      @close="showEditModal = false"
    >
      <div class="p-2">
        <!-- 退料单号提示 -->
        <div v-if="selectedRecord" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <Info class="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span class="text-sm text-blue-700">退料单号：<strong>{ selectedRecord.code }</strong></span>
        </div>

        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600 w-20 shrink-0">退料日期</label>
            <input v-model="editForm.date" type="date" class="flex-1 px-3 py-2 border border-gray-400 rounded-lg text-sm" />
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600 w-20 shrink-0">退料类型</label>
            <select v-model="editForm.type" class="flex-1 px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white">
              <option v-for="t in RETURN_TYPES" :key="t" :value="t">{ t }</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600 w-20 shrink-0">申请人</label>
            <select v-model="editForm.applicant" class="flex-1 px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white">
              <option v-for="a in APPLICANTS" :key="a" :value="a">{ a }</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600 w-20 shrink-0">退料部门</label>
            <select v-model="editForm.department" class="flex-1 px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white">
              <option v-for="d in departmentOptions" :key="d" :value="d">{ d }</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600 w-20 shrink-0">仓库位置</label>
            <select v-model="editForm.warehouseLocation" class="flex-1 px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white">
              <option v-for="w in WAREHOUSE_LOCATIONS" :key="w" :value="w">{ w }</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600 w-20 shrink-0">操作人</label>
            <input v-model="editForm.operator" class="flex-1 px-3 py-2 border border-gray-400 rounded-lg text-sm" />
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600 w-20 shrink-0">审核人</label>
            <select v-model="editForm.reviewer" class="flex-1 px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white">
              <option v-for="r in REVIEWERS" :key="r" :value="r">{ r }</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600 w-20 shrink-0">状态</label>
            <select v-model="editForm.status" class="flex-1 px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white">
              <option v-for="s in EDITABLE_STATUSES" :key="s" :value="s">{ s }</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600 w-20 shrink-0">备注</label>
            <input v-model="editForm.remark" class="flex-1 px-3 py-2 border border-gray-400 rounded-lg text-sm" />
          </div>
        </div>

        <!-- 物料明细 -->
        <div class="mb-2">
          <button class="h-8 px-3 rounded-md text-xs bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="handleEditAddMaterial">
            <Plus class="w-4 h-4" />添加物料
          </button>
        </div>
        <div v-if="editForm.materials.length > 0" class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="text-xs" style="min-width: 1400px">
            <thead class="bg-emerald-100 text-gray-700">
              <tr>
                <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">来源单号</th>
                <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">物料编码</th>
                <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">分类</th>
                <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">物料名称</th>
                <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">规格</th>
                <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">单位</th>
                <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">退料数量</th>
                <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">单价</th>
                <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">货位</th>
                <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">退料原因</th>
                <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="(mr, $index) in editForm.materials" :key="$index">
                <td class="px-1 py-1"><input v-model="mr.sourceApplicationCode" class="w-28 h-6 px-1 border border-gray-200 rounded text-xs" @input="v => handleEditMaterialChange($index, 'sourceApplicationCode', v.target.value)" /></td>
                <td class="px-1 py-1"><input v-model="mr.materialCode" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" @input="v => handleEditMaterialChange($index, 'materialCode', v.target.value)" /></td>
                <td class="px-1 py-1"><input v-model="mr.category" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" @input="v => handleEditMaterialChange($index, 'category', v.target.value)" /></td>
                <td class="px-1 py-1"><input v-model="mr.materialName" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" @input="v => handleEditMaterialChange($index, 'materialName', v.target.value)" /></td>
                <td class="px-1 py-1"><input v-model="mr.spec" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" @input="v => handleEditMaterialChange($index, 'spec', v.target.value)" /></td>
                <td class="px-1 py-1"><input v-model="mr.unit" class="w-14 h-6 px-1 border border-gray-200 rounded text-xs" @input="v => handleEditMaterialChange($index, 'unit', v.target.value)" /></td>
                <td class="px-1 py-1"><input v-model.number="mr.returnQuantity" type="number" min="0" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" @change="v => handleEditMaterialChange($index, 'returnQuantity', v.target.value)" /></td>
                <td class="px-1 py-1"><input v-model.number="mr.unitPrice" type="number" min="0" step="0.01" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" @change="v => handleEditMaterialChange($index, 'unitPrice', v.target.value)" /></td>
                <td class="px-1 py-1"><input v-model="mr.warehousePosition" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" @input="v => handleEditMaterialChange($index, 'warehousePosition', v.target.value)" /></td>
                <td class="px-1 py-1">
                  <select v-model="mr.reason" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs bg-white" @change="v => handleEditMaterialChange($index, 'reason', v.target.value)">
                    <option v-for="r in RETURN_REASONS" :key="r" :value="r">{ r }</option>
                  </select>
                </td>
                <td class="px-1 py-1"><button class="text-red-600 hover:text-red-800 text-xs" @click="handleEditRemoveMaterial($index)">删除</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center py-4 text-sm text-gray-500">暂未添加物料</div>
      </div>

      <template #footer>
        <el-button size="small" @click="showEditModal = false">取消</el-button>
        <el-button type="primary" size="small" @click="handleSaveEdit">保存</el-button>
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
