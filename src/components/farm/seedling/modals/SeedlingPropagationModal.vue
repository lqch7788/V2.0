<!--
  育苗无性繁殖记录弹窗（重写 - 对齐 V1.1 SeedlingPropagationModal.tsx）
-->
<template>
  <SimpleModal
    :visible="visible"
    :title="`无性繁殖记录 - ${record?.seedlingCode || ''}`"
    width="1100px"
    :show-footer="false"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <div v-if="readOnly" class="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4b5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span class="text-sm text-gray-700">该育苗已结束，无性繁殖记录处于<strong>只读模式</strong></span>
      </div>
      <div class="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
        无性繁殖记录功能（1:多模式专用）<br/>
        <span class="text-xs text-gray-400">V1.1 对应功能模块：扦插/嫁接/分株/块茎/枝条/组培/匍匐茎</span>
      </div>
    </div>
  </SimpleModal>
</template>

<script setup>
import SimpleModal from '@/components/common/SimpleModal.vue'

defineProps({
  visible: Boolean,
  record: Object,
  readOnly: { type: Boolean, default: false }
})

defineEmits(['close', 'success'])
</script>