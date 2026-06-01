<!--
  @file 采购计划页面入口 - 1:1 翻译自 V1.1 src/pages/PurchasePlan.tsx
  @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\pages\PurchasePlan.tsx
  @description V1.1 是 import + default 导出：`import { PurchasePlanPage } from '../components/purchasePlan/PurchasePlanPage'; export default PurchasePlanPage;`
           V2.0 保持一致：路由入口仅承载 L4 复合组件
-->
<template>
  <PurchasePlanPage />
</template>

<script setup>
/**
 * @description 采购计划主页面
 * 1:1 翻译 V1.1 src/pages/PurchasePlan.tsx 的重导出模式
 * 实际组件逻辑在 @/components/purchasePlan/PurchasePlanPage.vue（L4）
 */
import PurchasePlanPage from '@/components/purchasePlan/PurchasePlanPage.vue'
</script>
