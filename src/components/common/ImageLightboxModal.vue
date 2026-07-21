<!--
  图片预览弹窗（重写 - 对齐 V1.1 ImageLightboxModal.tsx）
-->
<template>
  <div v-if="visible" class="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" @click.self="handleClose">
    <button type="button" class="absolute top-4 right-4 text-white hover:bg-white/20 rounded p-2 z-10" @click="handleClose">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <button v-if="images.length > 1" type="button" class="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded p-2" @click="prev">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <button v-if="images.length > 1" type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded p-2" @click="next">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
    <img :src="images[currentIndex]" class="max-w-[90vw] max-h-[90vh] object-contain" />
    <div v-if="images.length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">{{ currentIndex + 1 }} / {{ images.length }}</div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  images: { type: Array, default: () => [] }
})

const emit = defineEmits(['close'])

const currentIndex = ref(0)

watch(() => props.visible, (val) => {
  if (val) currentIndex.value = 0
})

const prev = () => { if (currentIndex.value > 0) currentIndex.value-- }
const next = () => { if (currentIndex.value < props.images.length - 1) currentIndex.value++ }
const handleClose = () => emit('close')
</script>
