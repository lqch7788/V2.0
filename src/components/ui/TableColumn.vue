<template>
  <el-table-column
    :type="type"
    :index="index"
    :label="label"
    :prop="prop"
    :width="width"
    :min-width="minWidth"
    :fixed="fixed"
    :sortable="sortable"
    :resizable="resizable"
    :align="align"
    :header-align="headerAlign"
  >
    <template #default="scope">
      <slot :row="scope.row" :$index="scope.$index" :store="scope.store">
        {{ scope.row[scope.column.property] }}
      </slot>
    </template>
  </el-table-column>
</template>

<script setup>
import { ElTableColumn } from 'element-plus'

defineProps({
  type: String,
  index: [Number, Function],
  label: String,
  prop: String,
  width: [String, Number],
  minWidth: [String, Number],
  fixed: [String, Boolean],
  sortable: [Boolean, String],
  resizable: Boolean,
  align: String,
  headerAlign: String
})
</script>
