<!--
  标签打印弹窗（重写 - 对齐 V1.1 PrintLabelModal.tsx）
-->
<template>
  <SimpleModal
    :visible="visible"
    title="标签打印与导出"
    width="1170px"
    submit-text="关闭"
    @close="$emit('close')"
    @submit="$emit('close')"
  >
    <div class="space-y-4">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="text-sm font-semibold text-blue-900 mb-2">育苗批号：{{ record?.seedlingCode }}</div>
        <div class="text-sm text-blue-700">作物：{{ record?.cropName }} - {{ record?.cropVariety }}</div>
      </div>
      <div class="text-sm text-gray-600">标签打印功能待对接打印机硬件。</div>
    </div>
  </SimpleModal>
</template>

<script setup>
import SimpleModal from '@/components/common/SimpleModal.vue'

defineProps({ visible: Boolean, record: Object })
defineEmits(['close'])
</script>
