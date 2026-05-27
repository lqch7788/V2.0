<template>
  <div class="w-full">
    <div class="border border-gray-200 rounded-lg overflow-auto" :style="{ maxHeight: scroll?.y ? scroll.y + 'px' : undefined }">
      <el-table
        :data="data"
        :border="border"
        :stripe="stripe"
        :size="size"
        :class="className"
        @select="handleSelect"
        @select-all="handleSelectAll"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <slot />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ElTable } from 'element-plus'

const props = defineProps({
  data: { type: Array, default: () => [] },
  border: { type: Boolean, default: true },
  stripe: { type: Boolean, default: false },
  size: { type: String, default: 'default' },
  className: { type: String, default: '' },
  scroll: Object
})

const emit = defineEmits(['select', 'select-all', 'selection-change', 'sort-change'])

const handleSelect = (selection, row) => emit('select', selection, row)
const handleSelectAll = (selection) => emit('select-all', selection)
const handleSelectionChange = (selection) => emit('selection-change', selection)
const handleSortChange = ({ column, prop, order }) => emit('sort-change', column, prop, order)
</script>
