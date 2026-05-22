<template>
  <div class="ui-kanban">
    <div
      v-for="column in columns"
      :key="column.key"
      class="kanban-column"
    >
      <div class="column-header">
        <span class="column-title">{{ column.title }}</span>
        <span class="column-count">{{ column.items.length }}</span>
      </div>
      <div class="column-content">
        <div
          v-for="item in column.items"
          :key="item.id"
          class="kanban-item"
          draggable="true"
          @dragstart="handleDragStart($event, item)"
          @dragend="handleDragEnd"
          @dragover.prevent
          @drop="handleDrop($event, column.key)"
        >
          <slot :name="'item-' + column.key" :item="item">
            <div class="item-title">{{ item.title }}</div>
            <div v-if="item.description" class="item-desc">{{ item.description }}</div>
          </slot>
        </div>
      </div>
      <div v-if="column.addable" class="column-footer">
        <button class="add-btn" @click="$emit('add', column.key)">
          <el-icon :size="16"><Plus /></el-icon>
          添加
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  columns: { type: Array, default: () => [] }
})

const emit = defineEmits(['add', 'change', 'drag-start', 'drag-end', 'drop'])

const draggedItem = ref(null)

const handleDragStart = (e, item) => {
  draggedItem.value = item
  e.dataTransfer.effectAllowed = 'move'
  emit('drag-start', item)
}

const handleDragEnd = () => {
  emit('drag-end', draggedItem.value)
  draggedItem.value = null
}

const handleDrop = (e, columnKey) => {
  if (draggedItem.value) {
    emit('drop', { item: draggedItem.value, toColumn: columnKey })
  }
}
</script>

<style scoped>
.ui-kanban {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 0.5rem;
}

.kanban-column {
  min-width: 280px;
  max-width: 320px;
  background: #f3f4f6;
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.column-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.column-count {
  font-size: 0.75rem;
  color: #6b7280;
  background: white;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}

.column-content {
  flex: 1;
  padding: 0.75rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.kanban-item {
  background: white;
  border-radius: 0.5rem;
  padding: 0.75rem;
  cursor: grab;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.15s, transform 0.15s;
}

.kanban-item:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.kanban-item:active {
  cursor: grabbing;
  transform: scale(1.02);
}

.item-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}

.item-desc {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.column-footer {
  padding: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  width: 100%;
  padding: 0.5rem;
  background: transparent;
  border: 1px dashed #d1d5db;
  border-radius: 0.375rem;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s;
}

.add-btn:hover {
  border-color: #059669;
  color: #059669;
  background: #ecfdf5;
}
</style>
