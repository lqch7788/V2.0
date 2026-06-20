<!--
  育苗移栽历史弹窗
  对标 V1.1 src/components/farm/seedling/modals/TransplantHistoryModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="移栽历史" width="720px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-timeline>
      <el-timeline-item
        v-for="(h, idx) in history"
        :key="idx"
        :timestamp="h.date"
        placement="top"
        color="#10b981"
      >
        <el-card shadow="never">
          <div class="font-semibold">{{ h.action }}</div>
          <p class="text-sm text-gray-500 mt-1">{{ h.description }}</p>
          <p v-if="h.operator" class="text-xs text-gray-400 mt-1">操作人：{{ h.operator }}</p>
        </el-card>
      </el-timeline-item>
    </el-timeline>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  history: { type: Array, default: () => [] },
})

defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
</script>