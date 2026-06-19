<template>
  <ElModal
    :model-value="show"
    title="作废申请"
    :width="500"
    :height="400"
    :show-submit="false"
    :show-cancel="false"
    :close-on-click-modal="false"
    @update:model-value="(v) => { if (!v) handleCancel() }"
    @close="handleCancel"
  >
    <div v-if="recordCode" class="mb-4">
      <label class="block text-sm font-medium text-gray-900 mb-1">领料单号</label>
      <p class="font-mono text-gray-900">{{ recordCode }}</p>
    </div>
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-900 mb-1">
        作废原因 <span class="text-red-500">*</span>
      </label>
      <el-input
        v-model="localReason"
        type="textarea"
        :rows="3"
        placeholder="请输入作废原因"
        @input="handleChange"
      />
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button size="small" @click="handleCancel">取消</el-button>
        <el-button size="small" type="warning" @click="handleSubmit">确认申请</el-button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElModal } from '@/components/ui'

const props = defineProps({
  show: { type: Boolean, default: false },
  record: { type: Object, default: null },
  recordCode: { type: String, default: '' },
  reason: { type: String, default: '' }
})

const emit = defineEmits(['close', 'update:reason', 'confirm'])

const localReason = ref(props.reason || '')

watch(() => props.reason, (val) => {
  localReason.value = val || ''
})

watch(() => props.show, (isOpen) => {
  if (isOpen) {
    localReason.value = props.reason || ''
  }
})

const handleChange = (val) => {
  emit('update:reason', val)
}

const handleCancel = () => {
  emit('close')
}

const handleSubmit = () => {
  emit('confirm', localReason.value)
  handleCancel()
}
</script>
