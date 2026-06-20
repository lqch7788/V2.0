<!--
  人效删除警告弹窗
  对标 V1.1 src/components/labor/efficiency/DeleteWarningModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="删除警告" width="480px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <div class="flex items-start gap-3">
      <el-icon :size="32" color="#f59e0b"><WarningFilled /></el-icon>
      <div>
        <p class="font-semibold mb-2">确定删除 {{ records?.length || 1 }} 条人效记录？</p>
        <p class="text-sm text-red-600">⚠️ 删除后无法恢复</p>
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