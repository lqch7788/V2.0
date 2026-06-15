<!--
  ReassignTaskModal.vue - 重新派发任务弹窗
  V1.1 TempTaskPage.tsx 中 ReassignTaskModal 函数 1:1 迁移
-->
<template>
  <el-dialog
    :model-value="isOpen"
    @update:model-value="(v) => !v && emit('close')"
    title="重新派发任务"
    width="520px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div class="space-y-5">
      <div class="flex items-start gap-3 p-4 rounded-lg border border-orange-100 bg-orange-50">
        <svg class="w-5 h-5 mt-0.5 flex-shrink-0 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <p class="font-medium text-orange-900">任务 "{{ task?.title }}" 需要重新派发</p>
          <p class="text-sm mt-1 text-orange-700">
            请选择新的执行人。原执行人：{{ task?.assigneeName || '(已清空)' }}
          </p>
        </div>
      </div>

      <div class="bg-gray-50 rounded-lg p-3">
        <div class="grid grid-cols-2 gap-2 text-sm text-gray-500">
          <p>任务编号：{{ task?.taskCode }}</p>
          <p>执行人：{{ task?.assigneeName || '(已清空)' }}</p>
          <p>任务类型：{{ task?.tempTaskType || '其他' }}</p>
          <p>当前状态：
            <span class="text-red-600 font-medium">
              {{ task?.status === 'rejected' ? '已拒绝' : task?.status === 'pending_reassign' ? '待重新派发' : '进行中' }}
            </span>
          </p>
          <p v-if="task?.rejectReason" class="col-span-2 text-red-600">拒绝原因：{{ task.rejectReason }}</p>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">选择新执行人</label>
        <select v-model="selectedAssignee"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">请选择执行人</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.name }}{{ user.role ? `(${user.role})` : '' }}
          </option>
        </select>
      </div>

      <div v-if="selectedAssignee" class="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
        <p class="text-sm text-emerald-800">
          确认将任务派发给：
          <span class="font-medium">{{ users.find(u => u.id === selectedAssignee)?.name }}</span>
        </p>
      </div>
    </div>
    <template #footer>
      <div class="flex gap-3">
        <button type="button"
          class="px-3 py-1.5 rounded text-sm border border-gray-300 hover:bg-gray-50"
          @click="emit('close')">取消</button>
        <button type="button"
          :disabled="!selectedAssignee"
          class="px-3 py-1.5 rounded text-sm bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          @click="handleSubmit">确认派发</button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * 重新派发任务弹窗
 * V1.1 TempTaskPage.tsx 中 ReassignTaskModal 函数 1:1 迁移
 *
 * Emits:
 *   close / confirm(newAssigneeId, newAssigneeName)
 */
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  task: { type: Object, default: null },
  users: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'confirm'])

const selectedAssignee = ref('')

watch(() => props.isOpen, (v) => {
  if (!v) selectedAssignee.value = ''
})

function handleSubmit() {
  if (!selectedAssignee.value) return
  const user = props.users.find(u => u.id === selectedAssignee.value)
  if (user) {
    emit('confirm', selectedAssignee.value, user.name)
    selectedAssignee.value = ''
  }
}
</script>