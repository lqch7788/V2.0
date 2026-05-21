<template>
  <el-table
    v-loading="loading"
    :data="data"
    :border="border"
    :stripe="stripe"
    :size="size"
    :height="height"
    :max-height="maxHeight"
    :class="['ui-table', className]"
    @select="handleSelect"
    @select-all="handleSelectAll"
    @selection-change="handleSelectionChange"
    @sort-change="handleSortChange"
  >
    <slot />
  </el-table>
</template>

<script setup>
import { ElTable } from 'element-plus'

const props = defineProps({"data":"() => []","loading":"false","border":"true","stripe":"false","size":"'default'","className":"''"})

const emit = defineEmits(['select', 'row', 'prop', 'order'])

const handleSelect = (selection, row) => {
  emit('select', selection, row)
}

const handleSelectAll = (selection) => {
  emit('select-all', selection)
}

const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}

const handleSortChange = ({ column, prop, order }) => {
  emit('sort-change', column, prop, order)
}
</script>

<style scoped>
.ui-table {
  /* 可自定义样式 */
}
</style>
