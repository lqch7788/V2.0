<!--
  图片放大弹窗 - V2.0 兼容层（2026-07-18 修复）
  Vue 3 script setup 不允许 ES module exports。
  兼容旧 import { ImageLightboxModal } from '.../seedling/modals' 的写法。
  实际渲染通用组件 @/components/common/ImageLightboxModal.vue。
-->
<template>
  <ImageLightboxModal v-bind="$attrs" />
</template>

<script setup>
import ImageLightboxModal from '@/components/common/ImageLightboxModal.vue'
</script>
