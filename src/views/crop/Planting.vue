<!--
  @file 种植管理页面入口 - 1:1 翻译自 V1.1 src/pages/crop/Planting.tsx
  @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\pages\crop\Planting.tsx
  @description V1.1 是 re-export：`export { default } from '../../components/farm/planting/PlantingPage'`
           V2.0 保持一致：路由入口仅承载 L4 复合组件
-->
<template>
  <PlantingPage />
</template>

<script setup>
/**
 * @description 种植管理主页面入口
 * 1:1 翻译 V1.1 src/pages/crop/Planting.tsx 的重导出模式
 * 实际组件逻辑在 @/components/farm/planting/PlantingPage.vue（L4）
 */
import PlantingPage from '@/components/farm/planting/PlantingPage.vue'
</script>
