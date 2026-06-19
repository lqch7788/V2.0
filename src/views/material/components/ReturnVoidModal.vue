<template>
  <ElModal
    :model-value="show"
    title="作废申请"
    :width="560"
    :height="450"
    @update:model-value="(v) => { if (!v) $emit('close') }"
    @close="$emit('close')"
  >
 showVoidModal = v"
      @close="showVoidModal = false"
    >
      <div v-if="selectedRecord" class="p-2">
        <div class="grid grid-cols-1 border border-gray-200 rounded-lg overflow-hidden mb-4">
          <template v-for="(item, idx) in [
            { label: '退料单号', value: selectedRecord.code },
            { label: '申请人', value: selectedRecord.applicant },
            { label: '退料部门', value: selectedRecord.department },
            { label: '物料数量', value: (selectedRecord.materials?.length || 0) + ' 种' },
            { label: '物料预览', value: selectedRecord.materials?.slice(0, 3).map(m => m.materialName).join('、') + (selectedRecord.materials?.length > 3 ? '...' : '') }
          ]" :key="idx">
            <span class="w-24 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 shrink-0 border-r border-gray-200">{ item.label }</span>
            <span class="px-3 py-2 text-sm text-gray-900 flex-1">{ item.value }</span>
          </template>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">作废原因 <span class="text-red-500">*</span></label>
          <textarea v-model="voidReason" :rows="4" placeholder="请输入作废原因" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm resize-none"></textarea>
        </div>
      </div>

      <template #footer>
        <el-button size="small" @click="showVoidModal = false">取消</el-button>
        <el-button type="warning" size="small" @click="submitVoidApply">提交作废申请</el-button>
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
