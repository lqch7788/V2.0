<template>
  <ElModal
    :model-value="show"
    :title="title || '删除警告'"
    :width="500"
    :height="320"
    :show-submit="false"
    :show-cancel="false"
    :close-on-click-modal="false"
    @update:model-value="(v) => { if (!v) handleCancel() }"
    @close="handleCancel"
  >
    <div class="text-sm text-gray-600 space-y-2">
      <p v-if="description" v-html="description" />
      <template v-else>
        <p>删除后可能存在以下问题：</p>
        <ul class="list-disc list-inside space-y-1">
          <li v-if="selectedCount > 1">所有选中的 {{ selectedCount }} 条领料单将被永久删除</li>
          <li v-else>该领料单将被永久删除</li>
          <li>相关的物料明细也将被删除</li>
          <li>历史数据将无法恢复</li>
        </ul>
      </template>
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

const props = defineProps({
  show: { type: Boolean, default: false },
  isOpen: { type: Boolean, default: undefined },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  selectedCount: { type: Number, default: 1 }
})

const emit = defineEmits(['close', 'confirm', 'update:is-open'])

// 兼容 v-model:is-open 写法
import { computed } from 'vue'
const show = computed({
  get() {
    return props.isOpen !== undefined ? props.isOpen : props.show
  },
  set(v) {
    emit('update:is-open', v)
  }
})

const handleCancel = () => {
  emit('close')
  emit('update:is-open', false)
}
const handleConfirm = () => {
  emit('confirm')
  emit('update:is-open', false)
}
</script>
