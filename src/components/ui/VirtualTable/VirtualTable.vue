<template>
  <el-table-v2
    v-if="useVirtual"
    :columns="columns"
    :data="data"
    :width="width || 1200"
    :height="height || 400"
    :row-height="rowHeight"
    :fixed="fixed"
  />
  <el-table v-else :data="data" :border="border" :stripe="stripe" :size="size" :height="height">
    <slot />
  </el-table>
</template>

<script setup>
import { ElTableV2 } from 'element-plus'

const props = defineProps({
  data: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  useVirtual: { type: Boolean, default: true },
  border: { type: Boolean, default: true },
  stripe: { type: Boolean, default: false },
  size: { type: String, default: 'default' },
  width: { type: Number, default: undefined },
  height: { type: Number, default: 400 },
  rowHeight: { type: Number, default: 50 },
  fixed: { type: Boolean, default: false }
})
</script>
