<template>
  <el-dropdown :trigger="trigger" :placement="placement" :class="className" @command="handleCommand">
    <slot />
    <template #dropdown>
      <el-dropdown-menu>
        <slot name="content" />
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { ElDropdown, ElDropdownMenu } from 'element-plus'

const props = defineProps({
  trigger: { type: String, default: 'click' },
  placement: { type: String, default: 'bottom-start' },
  className: { type: String, default: '' }
})

const emit = defineEmits(['command'])

const handleCommand = (cmd) => emit('command', cmd)
</script>
