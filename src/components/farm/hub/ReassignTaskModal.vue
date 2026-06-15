<template>
  <el-dialog
    :model-value="isOpen"
    width="672px"
    :close-on-click-modal="false"
    class="farm-modal"
    @close="handleClose"
  >
    <template #header>
      <!-- 与V1.1 Modal.tsx line 265 完全一致：3段 emerald 渐变 -->
      <div class="farm-modal-header">
        <span class="text-white text-lg font-semibold">重新派发任务</span>
      </div>
    </template>
    <div v-if="!task" class="text-center py-8 text-gray-500">
      加载中...
    </div>

    <div v-else class="space-y-5">
      <!-- 警示信息 - 与V1.1 ReassignTaskModal.tsx line 72-96 完全一致 -->
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

      <!-- 任务信息 - 与V1.1 line 99-113 一致 -->
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

      <!-- 执行人选择 - 与V1.1 line 116-137 一致：含 Users 图标 + deepInputClass 深度样式 -->
      <div>
        <p class="text-gray-700 mb-2 font-medium">选择新执行人</p>
        <div class="relative">
          <el-icon :size="20" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
            <User />
          </el-icon>
          <el-select
            v-model="selectedAssignee"
            placeholder="请选择执行人"
            class="w-full deep-select"
            popper-class="reassign-select-popper"
          >
            <el-option
              v-for="user in availableAssignees"
              :key="user.id"
              :label="`${user.name} (${user.role || '员工'})`"
              :value="String(user.id)"
            />
          </el-select>
        </div>
      </div>

      <!-- 确认提示 - 与V1.1 line 140-149 一致 -->
      <div v-if="selectedAssignee" class="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
        <p class="text-sm text-emerald-800">
          确认将任务派发给：
          <span class="font-medium">
            {{ selectedAssigneeName }}
          </span>
        </p>
      </div>

      <!-- 操作按钮 - 与V1.1 line 152-169 一致：sm size + icon + border-t divider -->
      <div class="flex justify-end gap-3 pt-2 border-t border-gray-200">
        <el-button size="small" @click="handleClose">
          <el-icon class="mr-1"><Close /></el-icon>
          取消
        </el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="!selectedAssignee"
          @click="handleSubmit"
        >
          <el-icon class="mr-1"><UserFilled /></el-icon>
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
 * 对应 V1.1 src/components/farm/hub/modals/ReassignTaskModal.tsx 1:1 映射
 */
import { ref, computed, onMounted } from 'vue'
import { WarningFilled, User, UserFilled, Close } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  task: { type: Object, default: null },
  onConfirm: { type: Function, default: () => {} },
  onClose: { type: Function, default: () => {} },
})

const userStore = useUserStore()
const selectedAssignee = ref('')

// 状态映射 - 与V1.1 line 104-107 三元表达式一致
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

// 加载用户列表 - 与V1.1 useEffect 一致
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
/* 与V1.1 Modal.tsx line 265 一致：3段 emerald 渐变 */
.farm-modal-header {
  background: linear-gradient(to right, #10b981, #059669, #10b981);
  padding: 12px 24px;
  border-radius: 8px 8px 0 0;
}
/* 深度输入框样式 - 与V1.1 deepInputClass line 15 一致 */
:deep(.deep-select .el-input__wrapper) {
  padding: 4px 16px 4px 40px;
  border-radius: 8px;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
  min-height: 46px;
}
:deep(.deep-select .el-input__wrapper.is-focus) {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06), 0 0 0 2px rgba(16, 185, 129, 0.2);
}
</style>
