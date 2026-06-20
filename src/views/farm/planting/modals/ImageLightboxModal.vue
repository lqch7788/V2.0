<!--
  图片灯箱弹窗
  对标 V1.1 src/components/farm/planting/modals/ImageLightboxModal.tsx
-->
<template>
  <el-dialog v-model="visible" :title="title" width="80%" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <div class="text-center">
      <img v-if="imageUrl" :src="imageUrl" class="max-w-full max-h-[70vh] mx-auto" />
      <el-empty v-else description="暂无图片" />
    </div>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  imageUrl: { type: String, default: '' },
  title: { type: String, default: '图片预览' },
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
</script>