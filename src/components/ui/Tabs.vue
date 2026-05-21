<template>
  <el-tabs
    v-model="activeValue"
    :type="type"
    :tab-position="tabPosition"
    :class="['ui-tabs', className]"
    @tab-change="handleTabChange"
  >
    <slot />
  </el-tabs>
</template>

<script setup>
import { ElTabs } from 'element-plus'
import { computed } from 'vue'

const props = defineProps({"type":"''","tabPosition":"'top'","className":"''"})

const emit = defineEmits(['update'])

const activeValue = computed({
  get) => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleTabChange = (value) => {
  emit('tab-change', value)
}
</script>

<style scoped>
.ui-tabs {
  /* 可自定义样式 */
}
</style>
