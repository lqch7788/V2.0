<template>
  <teleport to="body">
    <transition name="sheet-fade">
      <div v-if="open" class="fixed inset-0 z-50">
        <div class="fixed inset-0 bg-black/50 transition-opacity" @click="$emit('close')" />
        <div ref="sheetRef" class="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl max-h-[90vh] overflow-y-auto">
          <div class="flex flex-col p-4 pb-0">
            <div class="flex justify-center pb-2">
              <div class="w-10 h-1 rounded-full bg-gray-300" />
            </div>
          </div>
          <slot />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const sheetRef = ref(null)
</script>

<style scoped>
.sheet-fade-enter-active, .sheet-fade-leave-active { transition: opacity 0.3s ease; }
.sheet-fade-enter-from, .sheet-fade-leave-to { opacity: 0; }
</style>
