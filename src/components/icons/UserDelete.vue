<template>
  <!-- 用户删除图标：用户图标右上角带有删除标记 -->
  <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" :width="size" :height="size" :fill="color">
    <!-- 用户头像 -->
    <path d="M512 480a160 160 0 1 0 0-320 160 160 0 0 0 0 320zm0 96a256 256 0 1 1 0-512 256 256 0 0 1 0 512zm-48-344v160h96a128 128 0 0 1 128 128v48a32 32 0 0 0 32 32h256a32 32 0 0 0 32-32v-48a128 128 0 0 1 128-128h96V232a24 24 0 0 0-24-24h-48a24 24 0 0 0-24 24v48H136v-48a24 24 0 0 0-24-24H64a24 24 0 0 0-24 24v192a24 24 0 0 0 24 24h48a24 24 0 0 0 24-24v-48h544v48a24 24 0 0 0 24 24h48a24 24 0 0 0 24-24z" />
    <!-- 删除标记（右上角X） -->
    <circle cx="780" cy="260" r="120" fill="#dc2626" />
    <path d="M740 220l80 80M820 220l-80 80" stroke="#fff" stroke-width="24" stroke-linecap="round" />
  </svg>
</template>

<script setup>
defineProps({
  size: {
    type: [Number, String],
    default: 20
  },
  color: {
    type: String,
    default: 'currentColor'
  }
})
</script>
