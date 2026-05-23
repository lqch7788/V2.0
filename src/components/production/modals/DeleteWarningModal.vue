<template>
  <el-dialog
    v-model="visible"
    width="420px"
    :show-close="false"
    align-center
    append-to-body
    class="delete-warning-dialog"
  >
    <div class="p-6">
      <div class="flex items-center gap-4 mb-4">
        <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <Trash2 class="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">删除生产计划警告</h3>
        </div>
      </div>
      <div class="text-sm text-gray-600 space-y-3 mb-6">
        <p>确定要删除选中的 <strong>{{ selectedCount }}</strong> 个生产计划吗？</p>
        <p>此操作 <strong class="text-red-600">无法恢复</strong>，删除后数据将永久丢失。</p>
      </div>
      <div class="flex gap-3">
        <button class="flex-1 h-9 px-4 rounded-md text-sm inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors" @click="handleClose">取消</button>
        <button class="flex-1 h-9 px-4 rounded-md text-sm inline-flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 transition-colors" @click="handleConfirm">确认删除</button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { Trash2 } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  selectedCount: { type: Number, default: 0 },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

function handleClose() {
  visible.value = false
}

function handleConfirm() {
  emit('confirm')
  visible.value = false
}
</script>

<style scoped>
.delete-warning-dialog :deep(.el-dialog__header) {
  display: none;
}
.delete-warning-dialog :deep(.el-dialog__body) {
  padding: 0;
}
</style>
