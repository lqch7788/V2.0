<template>
  <!-- 图片放大弹窗 - 纯div结构 -->
  <Teleport to="body">
    <div v-if="isOpen && images.length > 0" class="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center">
      <!-- 关闭按钮 -->
      <div class="absolute top-4 right-4 cursor-pointer text-white hover:bg-white/20 rounded-lg p-2" @click="onClose">
        <el-icon size="24"><Close /></el-icon>
      </div>

      <!-- 上一张 -->
      <div v-if="images.length > 1" class="absolute left-4 text-white hover:bg-white/20 rounded-lg p-2 cursor-pointer" @click="handlePrev">
        <el-icon size="32"><ArrowLeft /></el-icon>
      </div>

      <!-- 图片 -->
      <img :src="images[currentIndex]" alt="图片" class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" />

      <!-- 下一张 -->
      <div v-if="images.length > 1" class="absolute right-4 text-white hover:bg-white/20 rounded-lg p-2 cursor-pointer" @click="handleNext">
        <el-icon size="32"><ArrowRight /></el-icon>
      </div>

      <!-- 图片计数 -->
      <div v-if="images.length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Close, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: Boolean,
  images: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close'])

const currentIndex = ref(0)

watch(() => props.isOpen, (val) => {
  if (val) {
    currentIndex.value = 0
  }
})

const handlePrev = () => {
  currentIndex.value = currentIndex.value === 0 ? props.images.length - 1 : currentIndex.value - 1
}

const handleNext = () => {
  currentIndex.value = currentIndex.value === props.images.length - 1 ? 0 : currentIndex.value + 1
}

const onClose = () => {
  emit('close')
}
</script>
