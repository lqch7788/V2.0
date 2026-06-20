<!--
  考勤删除警告弹窗
  对标 V1.1 src/components/labor/attendance/modals/DeleteWarningModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="删除警告" width="480px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <div class="flex items-start gap-3">
      <el-icon :size="32" color="#f59e0b" class="mt-1"><WarningFilled /></el-icon>
      <div>
        <p class="font-semibold text-gray-900 mb-2">确定要删除以下考勤记录吗？</p>
        <ul v-if="records?.length" class="text-sm text-gray-600 list-disc pl-5 space-y-1">
          <li v-for="r in records" :key="r.id">
            {{ r.workerName }} - {{ r.date }} ({{ r.checkIn || '未打卡' }} ~ {{ r.checkOut || '未打卡' }})
          </li>
        </ul>
        <p class="text-sm text-red-600 mt-3">⚠️ 删除后无法恢复，请谨慎操作</p>
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="danger" :loading="loading" @click="$emit('confirm')">确认删除</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  records: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
</script>