<template>
  <!-- Building2 图标 - 基地/办公楼 -->
  <svg v-if="name === 'Building2'" xmlns="http://www.w3.org/2000/svg" :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
    <path d="M9 22v-4h6v4"/>
    <path d="M8 6h.01"/><path d="M16 6h.01"/>
    <path d="M12 6h.01"/><path d="M12 10h.01"/>
    <path d="M12 14h.01"/><path d="M16 10h.01"/>
    <path d="M16 14h.01"/><path d="M8 10h.01"/>
    <path d="M8 14h.01"/>
  </svg>

  <!-- Trash2 图标 - 删除 -->
  <svg v-else-if="name === 'Trash2'" xmlns="http://www.w3.org/2000/svg" :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>

  <!-- Edit2 图标 - 编辑 -->
  <svg v-else-if="name === 'Edit2'" xmlns="http://www.w3.org/2000/svg" :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    <path d="m15 5 4 4"/>
  </svg>

  <!-- Loader2 图标 - 加载 -->
  <svg v-else-if="name === 'Loader2'" xmlns="http://www.w3.org/2000/svg" :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="spin ? 'animate-spin' : ''">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>

  <!-- Network 图标 - 网络/树状 -->
  <svg v-else-if="name === 'Network'" xmlns="http://www.w3.org/2000/svg" :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="16" y="16" width="6" height="6" rx="1"/>
    <rect x="2" y="16" width="6" height="6" rx="1"/>
    <rect x="9" y="2" width="6" height="6" rx="1"/>
    <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/>
    <path d="M12 12V8"/>
  </svg>

  <!-- 默认：使用Element Plus图标 -->
  <el-icon v-else :size="size"><component :is="getElIcon" /></el-icon>
</template>

<script setup>
import * as ElIcons from '@element-plus/icons-vue'
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 16 }
})

const iconMap = {
  'OfficeBuilding': 'Office',
  'HomeFilled': 'HomeFilled',
  'Grid': 'Grid',
  'Box': 'Box',
  'Search': 'Search',
  'List': 'List',
  'Connection': 'Connection',
  'Loading': 'Loading',
  'Edit': 'Edit',
  'Delete': 'Delete',
  'Plus': 'Plus',
  'ArrowLeft': 'ArrowLeft'
}

const getElIcon = computed(() => {
  const iconName = iconMap[props.name] || 'CircleClose'
  return ElIcons[iconName] || ElIcons.CircleClose
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
