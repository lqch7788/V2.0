<!--
  作物品种树节点
  对标 V1.1 src/components/farm/crop-variety/VarietyTreeNode.tsx
-->
<template>
  <div class="flex items-center gap-2 py-1">
    <el-icon :size="14" :color="hasChildren ? '#059669' : '#6b7280'">
      <component :is="hasChildren ? 'Folder' : 'Document'" />
    </el-icon>
    <span>{{ node.name }}</span>
    <el-tag v-if="node.code" size="small" type="info">{{ node.code }}</el-tag>
    <span v-if="node.count" class="text-xs text-gray-400">({{ node.count }})</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Document, Folder } from '@element-plus/icons-vue'

const props = defineProps({
  node: { type: Object, required: true },
})

const hasChildren = computed(() => props.node.children?.length > 0)
</script>