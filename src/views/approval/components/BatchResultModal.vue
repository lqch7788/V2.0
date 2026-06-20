<!--
  批量审批结果弹窗组件
  对标 V1.1 src/components/approval/BatchResultModal.tsx
  功能：展示批量操作结果（成功数/失败数/失败原因列表）
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
      <!-- 结果汇总 -->
      <div class="flex items-center gap-3">
        <el-icon :size="32" :color="allSuccess ? '#10b981' : hasFail ? '#f59e0b' : '#6b7280'">
          <component :is="allSuccess ? 'CircleCheck' : hasFail ? 'WarningFilled' : 'InfoFilled'" />
        </el-icon>
        <div>
          <p class="font-semibold text-gray-900">{{ summaryText }}</p>
          <p class="text-sm text-gray-500 mt-1">
            共 {{ total }} 项 · 成功
            <span class="font-semibold text-emerald-600">{{ successCount }}</span>
            · 失败
            <span class="font-semibold text-red-600">{{ failCount }}</span>
          </p>
        </div>
      </div>

      <!-- 失败明细 -->
      <div v-if="failures.length">
        <div class="text-sm font-semibold text-gray-700 mb-2">失败明细</div>
        <el-table :data="failures" size="small" max-height="300">
          <el-table-column prop="code" label="单号" width="140" />
          <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
          <el-table-column prop="reason" label="失败原因" min-width="200" show-overflow-tooltip />
        </el-table>
      </div>
    </div>

    <template #footer>
      <el-button type="primary" @click="visible = false">我知道了</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { CircleCheck, InfoFilled, WarningFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  results: { type: Array, default: () => [] }, // [{ id, code, title, success, reason }]
  width: { type: String, default: '560px' },
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const total = computed(() => props.results.length)
const successCount = computed(() => props.results.filter((r) => r.success).length)
const failCount = computed(() => total.value - successCount.value)
const failures = computed(() => props.results.filter((r) => !r.success))

const allSuccess = computed(() => failCount.value === 0 && successCount.value > 0)
const hasFail = computed(() => failCount.value > 0)

const title = computed(() => {
  if (allSuccess.value) return '批量操作成功'
  if (hasFail.value && successCount.value === 0) return '批量操作失败'
  return '批量操作部分成功'
})

const summaryText = computed(() => {
  if (allSuccess.value) return '所有审批单已成功处理'
  if (hasFail.value && successCount.value === 0) return '所有审批单处理失败'
  return '部分审批单处理失败，请查看下方明细'
})
</script>