<template>
  <!-- 来源模块筛选 - 从V1.1 SourceFilter.tsx 1:1迁移 -->
  <div class="flex items-center gap-2">
    <span class="text-sm text-gray-500">来源：</span>
    <el-select :model-value="value" @update:model-value="(v) => $emit('change', v)"
      class="w-auto" size="small" placeholder="全部">
      <el-option v-for="opt in sourceOptions" :key="opt.value" :value="opt.value" :label="opt.label" />
    </el-select>
  </div>
</template>

<script setup>
import { SOURCE_MODULE_OPTIONS } from '../constants/sourceConfig'

defineProps({
  value: { type: String, default: 'all' },
})

defineEmits(['change'])

const sourceOptions = SOURCE_MODULE_OPTIONS
</script>
