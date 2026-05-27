<template>
  <el-tree
    :data="data"
    :props="treeProps"
    :node-key="nodeKey"
    :default-expanded-keys="defaultExpandedKeys"
    :default-checked-keys="defaultCheckedKeys"
    :show-checkbox="showCheckbox"
    :highlight-current="highlightCurrent"
    :expand-on-click-node="expandOnClickNode"
    :check-on-click-node="checkOnClickNode"
    :class="className"
    @node-click="handleNodeClick"
    @check="handleCheck"
  >
    <template #default="{ node, data: nodeData }">
      <slot :node="node" :data="nodeData" />
    </template>
  </el-tree>
</template>

<script setup>
import { ElTree } from 'element-plus'

const props = defineProps({
  data: { type: Array, default: () => [] },
  treeProps: { type: Object, default: () => ({ children: 'children', label: 'label' }) },
  nodeKey: { type: String, default: 'id' },
  defaultExpandedKeys: { type: Array, default: () => [] },
  defaultCheckedKeys: { type: Array, default: () => [] },
  showCheckbox: { type: Boolean, default: false },
  highlightCurrent: { type: Boolean, default: false },
  expandOnClickNode: { type: Boolean, default: true },
  checkOnClickNode: { type: Boolean, default: false },
  className: { type: String, default: '' }
})

const emit = defineEmits(['node-click', 'check'])

const handleNodeClick = (data, node) => emit('node-click', data, node)
const handleCheck = (data, checkedInfo) => emit('check', data, checkedInfo)
</script>
