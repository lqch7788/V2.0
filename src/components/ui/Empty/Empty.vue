<template>
  <div class="ui-empty">
    <div class="empty-icon">
      <el-icon :size="imageSize"><component :is="image || 'FolderOpened'" /></el-icon>
    </div>
    <div class="empty-description">
      <slot name="image">
        <p v-if="description" class="empty-text">{{ description }}</p>
        <p v-else class="empty-text">暂无数据</p>
      </slot>
    </div>
    <div v-if="$slots.default" class="empty-actions">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { FolderOpened } from '@element-plus/icons-vue'

defineProps({
  image: {
    type: [String, Object],
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  imageSize: {
    type: Number,
    default: 64
  }
})
</script>

<style scoped>
.ui-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
}

.empty-icon {
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-description {
  margin-bottom: 1rem;
}

.empty-text {
  color: #9ca3af;
  font-size: 0.875rem;
  margin: 0;
}

.empty-actions {
  margin-top: 0.5rem;
}
</style>
