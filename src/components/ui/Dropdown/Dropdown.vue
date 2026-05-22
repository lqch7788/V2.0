<template>
  <el-dropdown
    v-model:visible="visible"
    :trigger="trigger"
    :disabled="disabled"
    :placement="placement"
    :popper-class="popperClass"
    @visible-change="handleVisibleChange"
  >
    <slot name="default" />
    <template #dropdown>
      <el-dropdown-menu class="ui-dropdown-menu">
        <template v-for="(item, index) in options" :key="index">
          <el-dropdown-item
            v-if="!item.divider && !item.disabled"
            :command="item"
            :divided="item.divided"
            @click="handleCommand(item)"
          >
            <span v-if="item.icon" class="dropdown-item-icon">
              <el-icon :size="16"><component :is="item.icon" /></el-icon>
            </span>
            {{ item.label }}
          </el-dropdown-item>
          <el-dropdown-item v-else-if="item.divider" :disabled="true" divided />
          <el-dropdown-item v-else-if="item.disabled" :disabled="true">
            <span class="text-gray-400">{{ item.label }}</span>
          </el-dropdown-item>
        </template>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  options: {
    type: Array,
    default: () => []
  },
  trigger: {
    type: String,
    default: 'hover' // click, hover, focus, contextmenu
  },
  disabled: {
    type: Boolean,
    default: false
  },
  placement: {
    type: String,
    default: 'bottom' // top, top-start, top-end, bottom, bottom-start, bottom-end
  },
  popperClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['command', 'visible-change'])

const visible = ref(false)

const handleCommand = (item) => {
  if (item.handler) {
    item.handler(item)
  }
  emit('command', item)
}

const handleVisibleChange = (val) => {
  emit('visible-change', val)
}
</script>

<style scoped>
/* V1.1 Dropdown 样式 */
.ui-dropdown-menu {
  padding: 0.25rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  border: 1px solid #e5e7eb;
}

:deep(.el-dropdown-menu__item) {
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

:deep(.el-dropdown-menu__item:hover) {
  background: #f3f4f6;
  color: #059669;
}

:deep(.el-dropdown-menu__item.is-disabled) {
  color: #d1d5db;
  cursor: not-allowed;
}

:deep(.el-dropdown-menu__item.is-disabled:hover) {
  background: transparent;
  color: #d1d5db;
}

.dropdown-item-icon {
  display: inline-flex;
  align-items: center;
  color: inherit;
}
</style>
