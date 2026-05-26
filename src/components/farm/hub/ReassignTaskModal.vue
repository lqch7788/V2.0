<template>
  <el-dialog
    :model-value="isOpen"
    width="600px"
    :close-on-click-modal="false"
    class="farm-modal"
    @close="handleClose"
  >
    <template #header>
      <div class="farm-modal-header">
        <span class="text-white text-lg font-semibold">重新派发任务</span>
      </div>
    </template>
    <div v-if="!task" class="text-center py-8 text-gray-500">
      加载中...
    </div>

    <div v-else class="space-y-5">
      <!-- 警示信息 -->
      <div
        :class="[
          'flex items-start gap-3 p-4 rounded-lg border',
          mustChangeExecutor
            ? 'border-red-200 bg-red-50'
            : 'border-orange-100 bg-orange-50'
        ]"
      >
        <el-icon :size="20" class="mt-0.5 flex-shrink-0" :class="mustChangeExecutor ? 'text-red-600' : 'text-orange-600'">
          <WarningFilled />
        </el-icon>
        <div>
          <p :class="['font-medium', mustChangeExecutor ? 'text-red-900' : 'text-orange-900']">
            {{ mustChangeExecutor
              ? `执行人已拒绝任务${task.executorRejectCount}次，必须更换执行人！`
              : `任务 "${task.title}" 需要重新派发`
            }}
          </p>
          <p :class="['text-sm mt-1', mustChangeExecutor ? 'text-red-700' : 'text-orange-700']">
            {{ mustChangeExecutor
              ? '请选择新的执行人'
              : `请选择新的执行人。原执行人：${task.assigneeName || '(已清空)'}`
            }}
          </p>
        </div>
      </div>

      <!-- 任务信息 -->
      <div class="bg-gray-50 rounded-lg p-3">
        <div class="grid grid-cols-2 gap-2 text-sm text-gray-500">
          <p>任务编号：{{ task.taskCode }}</p>
          <p>执行人：{{ task.assigneeName || '(已清空)' }}</p>
          <p>任务类型：{{ task.typeName }}</p>
          <p>
            当前状态：
            <span class="text-red-600 font-medium">
              {{ statusMap[task.status] || task.status }}
            </span>
          </p>
          <p v-if="task.rejectReason" class="col-span-2 text-red-600">
            拒绝原因：{{ task.rejectReason }}
          </p>
        </div>
      </div>

      <!-- 执行人选择 -->
      <div>
        <p class="text-gray-700 mb-2 font-medium">选择新执行人</p>
        <el-select
          v-model="selectedAssignee"
          placeholder="请选择执行人"
          class="w-full"
          filterable
        >
          <el-option
            v-for="user in availableAssignees"
            :key="user.id"
            :label="`${user.name} (${user.role || '员工'})`"
            :value="String(user.id)"
          />
        </el-select>
      </div>

      <!-- 确认提示 -->
      <div v-if="selectedAssignee" class="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
        <p class="text-sm text-emerald-800">
          确认将任务派发给：
          <span class="font-medium">
            {{ selectedAssigneeName }}
          </span>
        </p>
      </div>

      <!-- 操作按钮 -->
      <div class="flex justify-end gap-3 pt-2 border-t border-gray-200">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :disabled="!selectedAssignee"
          @click="handleSubmit"
        >
          确认派发
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
/**
 * 重新派发任务弹窗组件
 * 功能：任务失败/放弃后，选择新执行人重新派发
 */
import { ref, computed, onMounted } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  task: { type: Object, default: null },
  onConfirm: { type: Function, default: () => {} },
  onClose: { type: Function, default: () => {} },
})

const userStore = useUserStore()
const selectedAssignee = ref('')

// 状态映射
const statusMap = {
  failed: '任务失败',
  rejected: '已拒绝',
  abandoned: '已放弃',
}

// 是否必须更换执行人（拒绝次数 >= 2）
const mustChangeExecutor = computed(() => {
  return (props.task?.executorRejectCount || 0) >= 2
})

// 可选执行人列表（排除当前执行人，但必须更换时不过滤）
const availableAssignees = computed(() => {
  const users = userStore.users || []
  if (mustChangeExecutor.value) {
    return users
  }
  return users.filter(u => String(u.id) !== String(props.task?.assigneeId))
})

// 选中执行人名称
const selectedAssigneeName = computed(() => {
  const users = userStore.users || []
  const user = users.find(u => String(u.id) === String(selectedAssignee.value))
  return user?.name || ''
})

// 加载用户列表
onMounted(() => {
  if (!userStore.users || userStore.users.length === 0) {
    userStore.loadUsers()
  }
})

// 提交
const handleSubmit = () => {
  if (selectedAssignee.value) {
    const user = (userStore.users || []).find(u => String(u.id) === String(selectedAssignee.value))
    if (user) {
      props.onConfirm(String(user.id), user.name)
      selectedAssignee.value = ''
    }
  }
}

// 关闭弹窗
const handleClose = () => {
  selectedAssignee.value = ''
  props.onClose()
}
</script>

<style scoped>
:deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
  border-radius: 8px 8px 0 0;
}
.farm-modal-header {
  background: linear-gradient(to right, #059669, #10b981);
  padding: 16px 24px;
  border-radius: 8px 8px 0 0;
}
</style>
