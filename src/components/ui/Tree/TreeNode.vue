<template>
  <div class="tree-node-wrapper">
    <!-- 节点行 -->
    <div
      :class="['tree-node-row', { 'is-selected': isSelected, 'is-disabled': node.disabled }]"
      :style="{ paddingLeft: `${level * 20 + 12}px` }"
      @click="handleClick"
    >
      <!-- 展开/收起按钮 -->
      <button
        v-if="hasChildren"
        class="toggle-btn"
        @click.stop="handleToggle"
      >
        <el-icon :size="14" class="toggle-icon" :class="{ 'is-expanded': isExpanded }">
          <CaretRight />
        </el-icon>
      </button>
      <span v-else class="toggle-placeholder" />

      <!-- 复选框 -->
      <button v-if="checkable" class="check-btn" @click.stop="handleCheck">
        <el-icon v-if="isChecked" :size="16" color="#059669"><Check /></el-icon>
        <el-icon v-else :size="16" color="#9ca3af"><Check /></el-icon>
      </button>

      <!-- 图标 -->
      <span class="node-icon">
        <el-icon v-if="hasChildren" :size="16"><FolderOpened /></el-icon>
        <el-icon v-else :size="16"><Document /></el-icon>
      </span>

      <!-- 标题 -->
      <span class="node-title">{{ node.title }}</span>
    </div>

    <!-- 子节点 -->
    <div v-if="hasChildren && isExpanded" class="tree-children">
      <TreeNode
        v-for="child in node.children"
        :key="child.key"
        :node="child"
        :level="level + 1"
        :selectable="selectable"
        :checkable="checkable"
        :expanded-keys="expandedKeys"
        :checked-keys="checkedKeys"
        :selected-keys="selectedKeys"
        @toggle="$emit('toggle', $event)"
        @check="$emit('check', $event)"
        @select="$emit('select', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CaretRight, FolderOpened, Document, Check } from '@element-plus/icons-vue'

const props = defineProps({
  node: { type: Object, required: true },
  level: { type: Number, default: 0 },
  selectable: { type: Boolean, default: false },
  checkable: { type: Boolean, default: false },
  expandedKeys: { type: Array, default: () => [] },
  checkedKeys: { type: Array, default: () => [] },
  selectedKeys: { type: Array, default: () => [] }
})

const emit = defineEmits(['toggle', 'check', 'select'])

const hasChildren = computed(() => props.node.children && props.node.children.length > 0)
const isExpanded = computed(() => props.expandedKeys.includes(props.node.key))
const isChecked = computed(() => props.checkedKeys.includes(props.node.key))
const isSelected = computed(() => props.selectedKeys.includes(props.node.key))

const handleToggle = () => emit('toggle', props.node.key)
const handleCheck = () => emit('check', props.node.key)
const handleClick = () => {
  if (!props.node.disabled) {
    if (props.checkable) emit('check', props.node.key)
    else if (props.selectable) emit('select', props.node.key)
  }
}
</script>

<style scoped>
.tree-node-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.15s;
}

.tree-node-row:hover:not(.is-disabled) {
  background: #f9fafb;
}

.tree-node-row.is-selected {
  background: #ecfdf5;
  color: #059669;
}

.tree-node-row.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-btn {
  padding: 2px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  border-radius: 2px;
}

.toggle-btn:hover {
  background: #e5e7eb;
}

.toggle-icon {
  transition: transform 0.2s;
}

.toggle-icon.is-expanded {
  transform: rotate(90deg);
}

.toggle-placeholder {
  width: 18px;
}

.check-btn {
  padding: 2px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-icon {
  color: #6b7280;
}

.node-title {
  font-size: 0.875rem;
  color: #374151;
}

.is-selected .node-title {
  font-weight: 500;
}

.tree-children {
  margin-left: 0;
}
</style>
