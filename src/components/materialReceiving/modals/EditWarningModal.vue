<template>
  <ElModal
    :model-value="show"
    title="批量编辑警告"
    :width="500"
    :height="320"
    :show-submit="false"
    :show-cancel="false"
    :close-on-click-modal="false"
    @update:model-value="(v) => { if (!v) handleCancel() }"
    @close="handleCancel"
  >
    <div class="text-sm text-gray-600 space-y-2">
      <p>编辑后可能存在以下问题：</p>
      <ul class="list-disc list-inside space-y-1">
        <li>该领料单的历史记录可能无法追溯</li>
        <li>已生成的出库单据数据可能不一致</li>
        <li>相关的统计报表数据可能需要重新核算</li>
      </ul>
    </div>

    <template #footer>
      <div class="flex gap-3">
        <el-button size="small" @click="handleCancel" class="flex-1">取消</el-button>
        <el-button size="small" type="primary" @click="handleConfirm" class="flex-1">确认</el-button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { ElModal } from '@/components/ui'

defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'confirm'])

const handleCancel = () => emit('close')
const handleConfirm = () => {
  emit('confirm')
  handleCancel()
}
</script>
