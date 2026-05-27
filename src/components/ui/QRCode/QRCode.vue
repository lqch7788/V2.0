<template>
  <div class="inline-block bg-white p-2 rounded-lg border border-gray-200" :class="className">
    <canvas ref="canvasRef" :width="size" :height="size" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  value: { type: String, default: '' },
  size: { type: Number, default: 128 },
  className: { type: String, default: '' }
})

const canvasRef = ref(null)

async function renderQR() {
  if (!canvasRef.value || !props.value) return
  try {
    const QRCode = await import('qrcode')
    await QRCode.toCanvas(canvasRef.value, props.value, { width: props.size, margin: 2 })
  } catch (e) {
    // qrcode not available
  }
}

onMounted(renderQR)
watch(() => props.value, renderQR)
</script>
