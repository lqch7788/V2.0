<!--
  批量审批确认弹窗组件
  对标 V1.1 src/components/approval/BatchConfirmModal.tsx
  功能：批量操作前确认（通过/拒绝）
-->
<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    v-dialog-draggable
    :close-on-click-modal="false"
    @close="$emit('update:modelValue', false)"
  >
    <div class="space-y-4">
      <div class="flex items-center gap-3">
        <el-icon :size="32" :color="action === 'approve' ? '#10b981' : '#ef4444'">
          <component :is="action === 'approve' ? 'CircleCheck' : 'WarningFilled'" />
        </el-icon>
        <div>
          <p class="font-semibold text-gray-900">{{ confirmText }}</p>
          <p class="text-sm text-gray-500 mt-1">
            共 <span class="font-semibold text-gray-900">{{ count }}</span> 项审批单
          </p>
        </div>
      </div>

      <!-- 拒绝原因（拒绝时必填） -->
      <div v-if="action === 'reject'">
        <label class="text-sm text-gray-700 mb-2 block">
          拒绝原因 <span class="text-red-500">*</span>
        </label>
        <el-input
          v-model="reason"
          type="textarea"
          :rows="3"
          placeholder="请输入拒绝原因（必填）"
          maxlength="200"
          show-word-limit
        />
      </div>

      <!-- 备注（通过时可选） -->
      <div v-else>
        <label class="text-sm text-gray-700 mb-2 block">备注（可选）</label>
        <el-input
          v-model="reason"
          type="textarea"
          :rows="3"
          placeholder="请输入审批意见"
          maxlength="200"
          show-word-limit
        />
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button
        :type="action === 'approve' ? 'primary' : 'danger'"
        :loading="loading"
        :disabled="action === 'reject' && !reason.trim()"
        @click="handleConfirm"
      >
        确认{{ action === 'approve' ? '通过' : '拒绝' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { CircleCheck, WarningFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  action: { type: String, default: 'approve' }, // approve | reject
  count: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  width: { type: String, default: '480px' },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const reason = ref('')

watch(
  () => props.modelValue,
  (v) => {
    if (v) reason.value = ''
  }
)

const title = computed(() =>
  props.action === 'approve' ? '批量通过确认' : '批量拒绝确认'
)

const confirmText = computed(() =>
  props.action === 'approve' ? '确认批量通过以下审批？' : '确认批量拒绝以下审批？'
)

const handleConfirm = () => {
  emit('confirm', { reason: reason.value.trim() })
}
</script>