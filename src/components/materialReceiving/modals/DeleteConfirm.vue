<template>
  <el-dialog
    v-model="visible"
    title="确认删除"
    width="500px"
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
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="danger" @click="handleConfirm">确认删除</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'confirm'])

const visible = computed({
  get: () => props.show,
  set: () => handleCancel()
})

const handleCancel = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
  handleCancel()
}
</script>
