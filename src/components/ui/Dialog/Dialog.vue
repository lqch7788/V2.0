<template>
  <teleport to="body">
    <transition name="dialog-fade">
      <div v-if="visible" class="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50" @click.self="closeOnClickModal && handleClose()">
        <div class="relative flex flex-col bg-white rounded-xl shadow-xl overflow-hidden" :style="containerStyle">
          <!-- Header -->
          <div class="flex items-center justify-between py-3 px-6 bg-gradient-to-r from-emerald-400 via-emerald-600 to-emerald-400 text-white flex-shrink-0 select-none">
            <h2 class="text-lg font-semibold text-white">{{ title }}</h2>
            <div class="flex items-center gap-1">
              <slot name="header-action" />
              <button class="flex items-center justify-center w-7 h-7 rounded bg-transparent text-white hover:bg-white/20 transition-colors" @click="handleClose">
                <el-icon :size="18"><Close /></el-icon>
              </button>
            </div>
          </div>
          <!-- Body -->
          <div class="flex-1 overflow-auto p-4 sm:p-6" :class="bodyClassName">
            <slot />
          </div>
          <!-- Footer -->
          <div v-if="showFooter" class="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <slot name="footer">
              <el-button @click="handleCancel">{{ cancelText }}</el-button>
              <el-button v-if="showOk" type="primary" :loading="submitting" @click="handleOk">{{ okText }}</el-button>
            </slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Close } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: String, default: '500px' },
  closeOnClickModal: { type: Boolean, default: false },
  closeOnPressEscape: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: true },
  showOk: { type: Boolean, default: true },
  okText: { type: String, default: '保存' },
  cancelText: { type: String, default: '取消' },
  submitting: { type: Boolean, default: false },
  bodyClassName: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'close', 'ok', 'cancel', 'opened', 'closed'])

const visible = ref(false)
const containerStyle = computed(() => ({ width: props.width, maxHeight: '90vh' }))

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) emit('opened'); else emit('closed')
}, { immediate: true })

const handleClose = () => { visible.value = false; emit('update:modelValue', false); emit('close') }
const handleOk = () => emit('ok')
const handleCancel = () => { emit('cancel'); handleClose() }

const handleKeyDown = (e) => {
  if (e.key === 'Escape' && props.closeOnPressEscape && visible.value) handleClose()
}

onMounted(() => document.addEventListener('keydown', handleKeyDown))
onBeforeUnmount(() => document.removeEventListener('keydown', handleKeyDown))
</script>

<style scoped>
.dialog-fade-enter-active, .dialog-fade-leave-active { transition: opacity 0.2s ease; }
.dialog-fade-enter-from, .dialog-fade-leave-to { opacity: 0; }
</style>
