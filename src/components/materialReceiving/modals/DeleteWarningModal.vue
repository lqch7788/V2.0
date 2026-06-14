<template>
  <ElModal
    :model-value="show"
    title="删除警告"
    :width="500"
    :height="320"
    :show-submit="false"
    :show-cancel="false"
    :close-on-click-modal="false"
    @update:model-value="(v) => { if (!v) handleCancel() }"
    @close="handleCancel"
  >
    <div class="text-sm text-gray-600 space-y-2">
      <p>删除后可能存在以下问题：</p>
      <ul class="list-disc list-inside space-y-1">
        <li>所有选中的领料单将被永久删除</li>
        <li>相关的物料明细也将被删除</li>
        <li>历史数据将无法恢复</li>
      </ul>
    </div>

    <template #footer>
      <div class="flex gap-3">
        <el-button size="small" @click="handleCancel" class="flex-1">取消</el-button>
        <el-button size="small" type="danger" @click="handleConfirm" class="flex-1">确认</el-button>
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
