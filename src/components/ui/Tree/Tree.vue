<template>
  <div class="ui-tree">
    <TreeNode
      v-for="node in data"
      :key="node.key"
      :node="node"
      :level="0"
      :selectable="selectable"
      :checkable="checkable"
      :expanded-keys="expandedKeys"
      :checked-keys="checkedKeys"
      :selected-keys="selectedKeys"
      @toggle="handleToggle"
      @check="handleCheck"
      @select="handleSelect"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import TreeNode from './TreeNode.vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  selectable: { type: Boolean, default: false },
  checkable: { type: Boolean, default: false },
  expandedKeys: { type: Array, default: () => [] },
  checkedKeys: { type: Array, default: () => [] },
  selectedKeys: { type: Array, default: () => [] }
})

const emit = defineEmits(['expand', 'check', 'select', 'update:expandedKeys', 'update:checkedKeys', 'update:selectedKeys'])

const internalExpandedKeys = ref([...props.expandedKeys])
const internalCheckedKeys = ref([...props.checkedKeys])
const internalSelectedKeys = ref([...props.selectedKeys])

const handleToggle = (key) => {
  const index = internalExpandedKeys.value.indexOf(key)
  if (index > -1) {
    internalExpandedKeys.value.splice(index, 1)
  } else {
    internalExpandedKeys.value.push(key)
  }
  emit('update:expandedKeys', internalExpandedKeys.value)
  emit('expand', internalExpandedKeys.value)
}

const handleCheck = (key) => {
  const index = internalCheckedKeys.value.indexOf(key)
  if (index > -1) {
    internalCheckedKeys.value.splice(index, 1)
  } else {
    internalCheckedKeys.value.push(key)
  }
  emit('update:checkedKeys', internalCheckedKeys.value)
  emit('check', internalCheckedKeys.value)
}

const handleSelect = (key) => {
  internalSelectedKeys.value = [key]
  emit('update:selectedKeys', internalSelectedKeys.value)
  emit('select', internalSelectedKeys.value)
}
</script>

<style scoped>
.ui-tree {
  background: white;
  border-radius: 0.5rem;
  padding: 0.5rem;
}
</style>
