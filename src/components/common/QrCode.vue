<!--
  通用二维码组件（基于 qrcode 库）
  用法：<QrCode :value="text" :size="120" />
-->
<template>
  <canvas ref="canvasRef" :width="size" :height="size" :style="{ width: size + 'px', height: size + 'px' }"></canvas>
</template>

<script>
import { defineComponent, ref, watch, onMounted } from 'vue'
import QRCode from 'qrcode'

export default defineComponent({
  name: 'QrCode',
  props: {
    value: { type: String, required: true },
    size: { type: Number, default: 120 },
    bgColor: { type: String, default: '#ffffff' },
    fgColor: { type: String, default: '#000000' }
  },
  setup(props) {
    const canvasRef = ref(null)
    const render = async () => {
      if (!canvasRef.value) return
      try {
        await QRCode.toCanvas(canvasRef.value, props.value, {
          width: props.size,
          margin: 1,
          color: { dark: props.fgColor, light: props.bgColor }
        })
      } catch (e) { console.warn('[QrCode] 渲染失败:', e) }
    }
    onMounted(render)
    watch(() => [props.value, props.size, props.bgColor, props.fgColor], render)
    return { canvasRef }
  }
})
</script>