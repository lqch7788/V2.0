<template>
  <el-dialog
    v-model="visible"
    title="批量删除警告"
    width="500px"
    @close="handleCancel"
  >
    <div class="text-sm text-gray-600 space-y-2">
      <p>删除后可能存在以下问题：</p>
      <ul class="list-disc list-inside space-y-1">
        <li>所有选中的领料出库单将被永久删除</li>
        <li>相关的物料明细也将被删除</li>
        <li>历史数据将无法恢复</li>
      </ul>
    </div>

    <template #footer>
      <div class="flex gap-3">
        <el-button @click="handleCancel" class="flex-1">取消</el-button>
        <el-button type="danger" @click="handleConfirm" class="flex-1">确认</el-button>
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

const handleCancel = () => emit('close')

const handleConfirm = () => {
  emit('confirm')
  handleCancel()
}
</script>
