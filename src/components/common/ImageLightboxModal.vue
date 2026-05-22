<template>
  <!-- 纯div自定义弹窗 -->
  <div v-if="visible" class="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center">
    <!-- 关闭按钮 -->
    <el-button
      link
      @click="handleClose"
      class="absolute top-4 right-4 text-white hover:bg-white/20"
      style="color: white;"
    >
      <el-icon :size="24"><Close /></el-icon>
    </el-button>

    <!-- 上一张 -->
    <el-button
      v-if="images && images.length > 1"
      link
      @click="handlePrev"
      class="absolute left-4 text-white hover:bg-white/20"
      style="color: white;"
    >
      <el-icon :size="32"><ArrowLeft /></el-icon>
    </el-button>

    <!-- 图片 -->
    <div class="max-w-4xl max-h-[90vh] mx-4">
      <img
        v-if="images && images[currentIndex]"
        :src="images[currentIndex]"
        alt=""
        class="max-w-full max-h-[85vh] object-contain rounded-lg"
      />
    </div>

    <!-- 下一张 -->
    <el-button
      v-if="images && images.length > 1"
      link
      @click="handleNext"
      class="absolute right-4 text-white hover:bg-white/20"
      style="color: white;"
    >
      <el-icon :size="32"><ArrowRight /></el-icon>
    </el-button>

    <!-- 图片计数 -->
    <div v-if="images && images.length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
      {{ currentIndex + 1 }} / {{ images.length }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Close, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  visible: Boolean,
  images: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible'])

const currentIndex = ref(0)

watch(() => props.visible, (val) => {
  if (val) {
    currentIndex.value = 0
  }
})

const handlePrev = () => {
  if (props.images && props.images.length > 0) {
    currentIndex.value = currentIndex.value === 0 ? props.images.length - 1 : currentIndex.value - 1
  }
}

const handleNext = () => {
  if (props.images && props.images.length > 0) {
    currentIndex.value = currentIndex.value === props.images.length - 1 ? 0 : currentIndex.value + 1
  }
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>
