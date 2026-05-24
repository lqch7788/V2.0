<template>
  <el-dialog
    v-model="visible"
    :title="`批量${actionText}确认`"
    width="600px"
    :close-on-click-modal="false"
    @close="handleCancel"
  >
    <!-- 警告提示 -->
    <div
      :class="[
        'flex items-start gap-3 p-4 rounded-lg mb-4',
        isApprove ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
      ]"
    >
      <el-icon :size="20" :class="isApprove ? 'text-emerald-600' : 'text-red-600'" class="flex-shrink-0 mt-0.5">
        <WarningFilled />
      </el-icon>
      <div class="text-sm">
        <p :class="['font-medium', isApprove ? 'text-emerald-800' : 'text-red-800']">
          确认要批量{{ actionText }}这 {{ selectedApprovals.length }} 项审批吗？
        </p>
        <p :class="['mt-1', isApprove ? 'text-emerald-700' : 'text-red-700']">
          {{ isApprove
            ? '审批通过后，业务数据将自动更新，请确保已核实每项审批的内容。'
            : '审批拒绝后，申请人将收到拒绝通知，请填写拒绝原因。' }}
        </p>
      </div>
    </div>

    <!-- 按类型统计 -->
    <div class="mb-4">
      <div class="text-sm font-medium text-gray-700 mb-2">审批单类型分布：</div>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="([typeName, count], index) in Object.entries(typeStats)"
          :key="index"
          class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
        >
          {{ typeName }} × {{ count }}
        </span>
      </div>
    </div>

    <!-- 审批单列表 -->
    <div class="border border-gray-200 rounded-lg max-h-48 overflow-y-auto mb-4">
      <el-table :data="selectedApprovals" size="small" class="approval-table">
        <el-table-column prop="code" label="单号" min-width="120" />
        <el-table-column prop="typeName" label="类型" min-width="100" />
        <el-table-column prop="applicantName" label="申请人" min-width="100" />
      </el-table>
    </div>

    <!-- 审批意见 -->
    <div class="mt-4">
      <label class="text-gray-700 mb-1 block text-sm">
        {{ isApprove ? '审批意见（可选）' : '拒绝原因（必填）' }}
      </label>
      <el-input
        v-model="comment"
        type="textarea"
        :placeholder="isApprove ? '可填写审批意见...' : '请填写拒绝原因...'"
        :rows="3"
        class="w-full"
        @input="handleCommentInput"
      />
      <p v-if="!isApprove && comment.trim() === ''" class="mt-1 text-sm text-red-600">
        请填写拒绝原因
      </p>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          :type="isApprove ? 'primary' : 'danger'"
          :disabled="!isApprove && comment.trim() === ''"
          :class="isApprove ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'"
          @click="handleConfirm"
        >
          确认批量{{ actionText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'
import { ElDialog, ElTable, ElTableColumn, ElInput, ElButton, ElIcon } from 'element-plus'

// ============================================================
// 批量确认弹窗组件
// 文件路径：src/components/approval/BatchConfirmModal.vue
// 组件化结构：批量审批操作前的确认弹窗
// ============================================================

const props = defineProps({
  // 是否打开
  isOpen: {
    type: Boolean,
    default: false
  },
  // 操作类型：approve-通过，reject-拒绝
  action: {
    type: String,
    default: 'approve'
  },
  // 选中的审批列表
  selectedApprovals: {
    type: Array,
    default: () => []
  },
  // 确认回调
  onConfirm: {
    type: Function,
    required: true
  },
  // 取消回调
  onCancel: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['update:isOpen'])

// 本地评论
const comment = ref('')

// 是否通过操作
const isApprove = computed(() => props.action === 'approve')

// 操作文本
const actionText = computed(() => isApprove.value ? '通过' : '拒绝')

// 可见性
const visible = computed({
  get() {
    return props.isOpen
  },
  set(val) {
    emit('update:isOpen', val)
  }
})

// 监听打开状态，重置评论
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    comment.value = ''
  }
})

// 按类型分组统计
const typeStats = computed(() => {
  return props.selectedApprovals.reduce((acc, approval) => {
    const typeName = approval.typeName || approval.type
    acc[typeName] = (acc[typeName] || 0) + 1
    return acc
  }, {})
})

// 评论输入处理
const handleCommentInput = (val) => {
  comment.value = val
}

// 确认处理
const handleConfirm = () => {
  props.onConfirm(comment.value)
  comment.value = ''
}

// 取消处理
const handleCancel = () => {
  comment.value = ''
  props.onCancel()
}
</script>

<style scoped>
:deep(.approval-table .el-table__header th) {
  background-color: #f9fafb !important;
}
:deep(.approval-table .el-table__row) {
  background-color: transparent;
}
</style>
