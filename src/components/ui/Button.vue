<template>
  <el-button
    :type="type"
    :size="size"
    :disabled="disabled"
    :loading="loading"
    :icon="icon"
    :round="round"
    :circle="circle"
    :class="['ui-button', className]"
    @click="handleClick"
  >
    <slot />
  </el-button>
</template>

<script setup>
import { ElButton } from 'element-plus'

const props = defineProps({"type":"'default'","size":"'default'","disabled":"false","loading":"false","round":"false","circle":"false","className":"''"})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.ui-button {
  /* 可自定义样式 */
}
</style>
