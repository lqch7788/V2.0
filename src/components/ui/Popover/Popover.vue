<template>
  <el-popover
    :visible="visible"
    :placement="placement"
    :trigger="trigger"
    :width="width"
    :popper-class="'v11-popover ' + className"
    @show="handleShow"
    @hide="handleHide"
  >
    <template #reference>
      <slot name="trigger" />
    </template>
    <slot />
  </el-popover>
</template>

<script setup>
import { ElPopover } from 'element-plus'

const props = defineProps({
  visible: { type: Boolean, default: undefined },
  placement: { type: String, default: 'bottom' },
  trigger: { type: String, default: 'click' },
  width: { type: [String, Number], default: 'auto' },
  className: { type: String, default: '' }
})

const emit = defineEmits(['show', 'hide'])

const handleShow = () => emit('show')
const handleHide = () => emit('hide')
</script>

<style>
/* V1.1 Popover 样式: rounded-lg border border-gray-200 bg-white p-4 shadow-md */
.v11-popover {
  border-radius: 8px !important;
  border: 1px solid #e5e7eb !important;
  padding: 16px !important;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1) !important;
  font-size: 14px !important;
}
</style>
