<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :fullscreen="fullscreen"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="showClose"
    :class="['ui-dialog', className]"
    @close="handleClose"
  >
    <slot />
    <template #footer v-if="$slots.footer">
      <slot name="footer" />
    </template>
  </el-dialog>
</template>

<script setup>
import { ElDialog } from 'element-plus'
import { computed } from 'vue'

const props = defineProps({"title":"''","width":"'50%'","fullscreen":"false","closeOnClickModal":"false","closeOnPressEscape":"true","showClose":"true","className":"''"})

const emit = defineEmits(['update'])

const visible = computed({
  get() {
    return props.modelValue
  },
  set: (val) => emit('update:modelValue', val)
})

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.ui-dialog {
  /* 可自定义样式 */
}
</style>
