<template>
  <!-- 重新派发任务弹窗 - 从V1.1 ReassignTaskModal.tsx 1:1迁移 -->
  <el-dialog :model-value="isOpen" @update:model-value="$emit('close')"
    title="重新派发任务" width="520px" top="5vh"
    :show-footer="false">
    <div v-if="task" class="space-y-5">
      <!-- 警示信息 -->
      <div class="flex items-start gap-3 p-4 rounded-lg border"
        :class="mustChangeExecutor ? 'border-red-200 bg-red-50' : 'border-orange-100 bg-orange-50'">
        <el-icon :size="20" class="flex-shrink-0 mt-0.5"
          :class="mustChangeExecutor ? 'text-red-600' : 'text-orange-600'">
          <Warning />
        </el-icon>
        <div>
          <p class="font-medium" :class="mustChangeExecutor ? 'text-red-900' : 'text-orange-900'">
            {{ mustChangeExecutor
              ? `执行人已拒绝任务${task.executorRejectCount || 0}次，必须更换执行人！`
              : `任务 "${task.title || task.taskName}" 需要重新派发` }}
          </p>
          <p class="text-sm mt-1" :class="mustChangeExecutor ? 'text-red-700' : 'text-orange-700'">
            {{ mustChangeExecutor
              ? '请选择新的执行人'
              : `请选择新的执行人。原执行人：${task.assigneeName || task.assignee || '(已清空)'}` }}
          </p>
        </div>
      </div>

      <!-- 任务信息 -->
      <div class="bg-gray-50 rounded-lg p-3">
        <div class="grid grid-cols-2 gap-2 text-sm text-gray-500">
          <p>任务编号：{{ task.taskCode || task.id }}</p>
          <p>执行人：{{ task.assigneeName || task.assignee || '(已清空)' }}</p>
          <p>任务类型：{{ task.typeName || task.typeLabel }}</p>
          <p>当前状态：
            <span class="text-red-600 font-medium">
              {{ task.status === 'failed' ? '任务失败' : task.status === 'rejected' ? '已拒绝' : '已放弃' }}
            </span>
          </p>
          <p v-if="task.rejectReason" class="col-span-2 text-red-600">拒绝原因：{{ task.rejectReason }}</p>
        </div>
      </div>

      <!-- 执行人选择 -->
      <div>
        <span class="text-gray-700 mb-2 block font-medium">选择新执行人</span>
        <el-select v-model="selectedAssignee" class="w-full" placeholder="请选择执行人">
          <el-option v-for="user in availableAssignees" :key="user.id"
            :value="user.id" :label="`${user.name} (${user.role || '员工'})`" />
        </el-select>
      </div>

      <!-- 确认提示 -->
      <div v-if="selectedAssignee" class="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
        <p class="text-sm text-emerald-800">
          确认将任务派发给：
          <span class="font-medium">{{ selectedUserName }}</span>
        </p>
      </div>

      <!-- 操作按钮 -->
      <div class="flex justify-end gap-3 pt-2 border-t border-gray-200">
        <el-button @click="$emit('close')">取消</el-button>
        <el-button type="primary" :disabled="!selectedAssignee" @click="handleSubmit">
          <el-icon><UserPlus /></el-icon>确认派发
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Warning, UserPlus } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  task: { type: Object, default: null },
})

const emit = defineEmits(['close', 'confirm'])

const selectedAssignee = ref('')

const users = computed(() => {
  // 模拟用户列表数据
  return props.task?._users || []
})

const mustChangeExecutor = computed(() => (props.task?.executorRejectCount || 0) >= 2)

const availableAssignees = computed(() => {
  if (mustChangeExecutor.value) return users.value
  return users.value.filter(u => u.id !== props.task?.assigneeId)
})

const selectedUserName = computed(() => {
  const user = users.value.find(u => u.id === selectedAssignee.value)
  return user?.name || ''
})

const handleSubmit = () => {
  if (selectedAssignee.value) {
    const user = users.value.find(u => u.id === selectedAssignee.value)
    if (user) {
      emit('confirm', selectedAssignee.value, user.name)
      selectedAssignee.value = ''
    }
  }
}
</script>
