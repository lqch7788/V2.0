<!--
  作物品种树
  对标 V1.1 src/components/farm/crop-variety/VarietyTree.tsx
-->
<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <el-tree
      :data="treeData"
      :props="defaultProps"
      node-key="id"
      default-expand-all
      :expand-on-click-node="false"
      @node-click="handleNodeClick"
    >
      <template #default="{ node, data }">
        <div class="flex items-center justify-between w-full">
          <span class="flex items-center gap-2">
            <el-icon :size="14" :color="data.children ? '#059669' : '#6b7280'">
              <component :is="data.children ? 'Folder' : 'Document'" />
            </el-icon>
            {{ node.label }}
            <el-tag v-if="data.code" size="small" type="info">{{ data.code }}</el-tag>
          </span>
          <span class="text-xs text-gray-400">{{ data.count || 0 }}</span>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Document, Folder } from '@element-plus/icons-vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
})

const emit = defineEmits(['select'])

const defaultProps = {
  children: 'children',
  label: 'name',
}

const treeData = computed(() => props.data)

const handleNodeClick = (data) => emit('select', data)
</script>