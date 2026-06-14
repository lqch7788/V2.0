<template>
  <ElModal
    :model-value="show"
    title="确认删除"
    :width="500"
    :height="320"
    :show-submit="false"
    :show-cancel="false"
    @update:model-value="(v) => { if (!v) handleCancel() }"
    @close="handleCancel"
  >
    <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <p class="text-sm text-amber-800">
        <strong>警告：</strong> 删除此领料记录可能会导致相关数据丢失，无法恢复。请确认是否继续删除操作。
      </p>
    </div>
    <p class="text-sm text-gray-600">确定要删除这条领料记录吗？</p>

    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button size="small" @click="handleCancel">取消</el-button>
        <el-button type="danger" size="small" @click="handleConfirm">确认删除</el-button>
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

const handleCancel = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
  handleCancel()
}
</script>
