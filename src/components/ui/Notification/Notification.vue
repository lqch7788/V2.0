<template>
  <div class="relative" ref="notifRef">
    <div v-if="visible" class="fixed top-4 right-4 z-[9998] w-80 rounded-lg border bg-white shadow-lg p-4" :class="typeClass">
      <div class="flex items-start gap-3">
        <el-icon :size="20" class="flex-shrink-0 mt-0.5" :class="iconColor"><component :is="iconComp" /></el-icon>
        <div class="flex-1 min-w-0">
          <h4 v-if="title" class="text-sm font-medium text-gray-900">{{ title }}</h4>
          <p v-if="message" class="text-sm text-gray-600 mt-1">{{ message }}</p>
        </div>
        <button class="p-1 rounded hover:bg-black/5 flex-shrink-0" @click="close">
          <el-icon :size="14"><Close /></el-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Close, CircleCheckFilled, CircleCloseFilled, WarningFilled, InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  type: { type: String, default: 'info' },
  duration: { type: Number, default: 3000 }
})

const emit = defineEmits(['close'])

const notifRef = ref(null)
let timer = null

const configMap = {
  success: { border: 'border-green-200', icon: CircleCheckFilled, iconColor: 'text-green-600' },
  error: { border: 'border-red-200', icon: CircleCloseFilled, iconColor: 'text-red-600' },
  warning: { border: 'border-orange-200', icon: WarningFilled, iconColor: 'text-orange-600' },
  info: { border: 'border-blue-200', icon: InfoFilled, iconColor: 'text-blue-600' }
}

const typeClass = computed(() => configMap[props.type]?.border || 'border-gray-200')
const iconComp = computed(() => configMap[props.type]?.icon || InfoFilled)
const iconColor = computed(() => configMap[props.type]?.iconColor || 'text-gray-500')

const close = () => { clearTimeout(timer); emit('close') }

watch(() => props.visible, (v) => {
  if (v && props.duration > 0) timer = setTimeout(close, props.duration)
})

onBeforeUnmount(() => clearTimeout(timer))
</script>
