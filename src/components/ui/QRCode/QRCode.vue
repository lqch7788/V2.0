<template>
  <div class="ui-qrcode" :style="{ width: size + 'px', height: size + 'px' }">
    <canvas ref="canvasRef" />
    <div v-if="$slots.default" class="qrcode-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
  value: { type: String, required: true },
  size: { type: Number, default: 128 },
  colorDark: { type: String, default: '#000000' },
  colorLight: { type: String, default: '#ffffff' },
  errorCorrectionLevel: { type: String, default: 'M' } // L, M, Q, H
})

const canvasRef = ref(null)

const generateQR = () => {
  if (!canvasRef.value) return

  QRCode.toCanvas(canvasRef.value, props.value, {
    width: props.size,
    margin: 2,
    color: {
      dark: props.colorDark,
      light: props.colorLight
    },
    errorCorrectionLevel: props.errorCorrectionLevel
  })
}

onMounted(() => {
  generateQR()
})

watch(() => [props.value, props.size], () => {
  generateQR()
})
</script>

<style scoped>
.ui-qrcode {
  position: relative;
  display: inline-block;
}

.qrcode-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
</style>
