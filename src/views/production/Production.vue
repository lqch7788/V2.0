<!--
  @file 生产计划页面入口 - 1:1 翻译自 V1.1 src/pages/Production.tsx
  @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\pages\Production.tsx
  @description V1.1 是 re-export：`export { default } from '../components/production/ProductionPage'`
           V2.0 保持一致：路由入口仅承载 L4 复合组件
-->
<template>
  <ProductionPage />
</template>

<script setup>
/**
 * @description 生产计划主页面
 * 1:1 翻译 V1.1 src/pages/Production.tsx 的重导出模式
 * 实际组件逻辑在 @/components/production/ProductionPage.vue（L4）
 */
import ProductionPage from '@/components/production/ProductionPage.vue'
</script>
