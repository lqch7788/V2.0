<!--
  农事任务中心 - 临时任务验收弹窗（适配器）
  1:1 翻译自 V1.1 src/components/farm/hub/modals/TempTaskAcceptanceAdapter.tsx
  - 加载任务操作记录（GET /temp-tasks/{id}/records）
  - 复用 taskDispatch/modals/VerifyTaskModal.vue 渲染验收界面
  - props: isOpen / task
  - emits: close / confirm(remarks) / reject(reason)
-->
<template>
  <VerifyTaskModal
    v-if="isOpen && task"
    :is-open="isOpen"
    :task="task"
    :records="records"
    @close="handleClose"
    @verify="handleVerify"
  />
</template>

<script setup>
import { ref, watch } from 'vue'
import VerifyTaskModal from '@/components/farm/taskDispatch/modals/VerifyTaskModal.vue'

// ============================================
// Props
// ============================================
const props = defineProps({
  isOpen: { type: Boolean, default: false },
  task: { type: Object, default: null },
})

const emit = defineEmits(['close', 'confirm', 'reject'])

// ============================================
// 状态
// ============================================
const records = ref([])
const isLoadingRecords = ref(false)

// ============================================
// 加载任务操作记录
// ============================================
const loadRecords = async (taskId) => {
  if (!taskId) {
    records.value = []
    return
  }
  isLoadingRecords.value = true
  try {
    // V1.1: enhancedApiClient.get(`/temp-tasks/${taskId}/records`)
    // V2.0: 使用统一 apiClient，路径 /temp-tasks/{id}/records
    const { default: apiClient } = await import('@/lib/apiClient')
    const resp = await apiClient.get(`/temp-tasks/${taskId}/records`)
    const list = Array.isArray(resp) ? resp : (resp?.data || [])
    records.value = Array.isArray(list) ? list : []
  } catch (e) {
    // 静默失败，记录为空数组（与 V1.1 行为一致）
    console.warn('[TempTaskAcceptanceModal] 加载任务记录失败:', e)
    records.value = []
  } finally {
    isLoadingRecords.value = false
  }
}

// ============================================
// 监听 isOpen + task.id
// ============================================
watch(
  () => [props.isOpen, props.task?.id],
  ([open, taskId]) => {
    if (open && taskId) {
      loadRecords(taskId)
    } else if (!open) {
      records.value = []
    }
  },
  { immediate: true }
)

// ============================================
// 事件处理
// ============================================
const handleClose = () => {
  emit('close')
}

const handleVerify = (approved, comments) => {
  if (approved) {
    emit('confirm', comments)
  } else {
    emit('reject', comments || '')
  }
}
</script>
