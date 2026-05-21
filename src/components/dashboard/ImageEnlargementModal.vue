<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]"
      @click="onClose"
    >
      <div class="relative max-w-4xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center p-4">
        <!-- 关闭按钮 -->
        <button
          @click="onClose"
          class="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white text-2xl z-10"
        >
          ×
        </button>
        <!-- 图片显示区域 -->
        <div class="bg-[#F2F6FA] rounded-lg w-full h-full max-h-[80vh] flex items-center justify-center">
          <div class="text-center text-gray-400">
            <div class="w-32 h-32 mx-auto mb-4 rounded-lg bg-gray-200 flex items-center justify-center">
              <span class="text-5xl">📷</span>
            </div>
            <p class="text-xl">图片 {{ imageIndex }}</p>
            <p class="text-sm mt-2">{{ placeholderText }}</p>
          </div>
        </div>
        <!-- 图片计数器 -->
        <div class="mt-4 text-white text-sm">
          {{ imageIndex }} / {{ totalImages }}
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>

defineProps({"totalImages":"5","placeholderText":"'（当前为占位图片）'"})
</script>
