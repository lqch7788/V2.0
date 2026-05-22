<template>
  <div :class="['ui-avatar', sizeClass, shapeClass, { 'avatar-group': isGroup }]" :style="containerStyle">
    <img
      v-if="src && !imageError"
      :src="src"
      :alt="name || 'avatar'"
      class="avatar-image"
      @error="handleImageError"
    />
    <span v-else class="avatar-initials">{{ initials }}</span>
    <span v-if="status" :class="['avatar-status', statusClass]" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  name: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm, md, lg, xl
  status: { type: String, default: '' }, // online, offline, away
  shape: { type: String, default: 'circle' }, // circle, square
  isGroup: { type: Boolean, default: false }
})

const imageError = ref(false)

const sizeClass = computed(() => {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg' }
  return sizes[props.size] || sizes.md
})

const shapeClass = computed(() => props.shape === 'square' ? 'rounded-lg' : 'rounded-full')

const statusClass = computed(() => {
  const statusMap = { online: 'bg-green-500', offline: 'bg-gray-400', away: 'bg-yellow-500' }
  return statusMap[props.status] || ''
})

const containerStyle = computed(() => ({
  position: props.status ? 'relative' : undefined
}))

const initials = computed(() => {
  if (!props.name) return '?'
  return props.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
})

const handleImageError = () => {
  imageError.value = true
}
</script>

<style scoped>
.ui-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f3f4f6;
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-weight: 500;
  color: #6b7280;
}

.avatar-status {
  position: absolute;
  bottom: 0;
  right: 0;
  border-radius: 50%;
  border: 2px solid white;
}

.avatar-group {
  margin-left: -0.5rem;
}

.avatar-group:first-child {
  margin-left: 0;
}
</style>
