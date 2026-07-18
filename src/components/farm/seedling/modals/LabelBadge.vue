<!--
  标签状态徽章 — 显示数量 + 状态标记（V1.1 LabelBadge.tsx 1:1 迁移）
  用于 LabelTable 数量列
  2026-07-18 P0-MISS-004 修复：V2.0 此前缺失此组件
-->
<template>
  <span v-if="!cfg?.label" class="text-xs">{{ quantity ?? '-' }} {{ unit }}</span>
  <span v-else class="inline-flex items-center gap-1">
    <span class="text-xs">{{ quantity ?? '-' }} {{ unit }}</span>
    <span :class="['px-1.5 py-0.5 rounded text-xs font-medium', cfg.bg, cfg.text]">{{ cfg.label }}</span>
  </span>
</template>

<script setup>
const props = defineProps({
  status: { type: String, default: 'active' },
  quantity: { type: Number, default: null },
  /** 标签单位（默认"株"，种源可能为"粒/颗/kg"等） */
  unit: { type: String, default: '株' }
})

const STATUS_MAP = {
  active: { label: '', bg: '', text: '' },
  moved_out: { label: '已移出', bg: 'bg-orange-100', text: 'text-orange-700' },
  voided: { label: '已作废', bg: 'bg-gray-100', text: 'text-gray-500' }
}

const cfg = STATUS_MAP[props.status] || STATUS_MAP.active
</script>
