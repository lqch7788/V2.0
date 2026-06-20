<!--
  任务工人选择器
  对标 V1.1 src/components/labor/tasks/TaskWorkerSelect.tsx
-->
<template>
  <el-select
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    filterable
    multiple
    collapse-tags
    collapse-tags-tooltip
    placeholder="选择执行人（可多选）"
    class="w-full"
  >
    <el-option
      v-for="w in workers"
      :key="w.id"
      :label="w.name + ' (' + w.position + ')'"
      :value="w.id"
    >
      <div class="flex items-center justify-between">
        <span>{{ w.name }}</span>
        <span class="text-xs text-gray-400">{{ w.position }}</span>
      </div>
    </el-option>
  </el-select>
</template>

<script setup>
defineProps({
  modelValue: { type: Array, default: () => [] },
  workers: { type: Array, default: () => [] },
})

defineEmits(['update:modelValue'])
</script>