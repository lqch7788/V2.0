<template>
  <div v-if="visible" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/50" @click="emit('close')"></div>
    <div class="bg-white rounded-xl shadow-xl flex flex-col fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style="width: 500px; max-height: 90vh;">
      <div class="modal-header flex items-center justify-between px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 flex-shrink-0 rounded-t-xl cursor-default select-none">
        <h3 class="text-lg font-semibold text-white">选择导出格式</h3>
        <button class="text-white hover:bg-emerald-500 rounded-lg p-1" @click="emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col">
        <div class="space-y-4">
          <p class="text-sm text-gray-500">已选择 {{ selectedCount }} 条数据</p>
          <div class="space-y-3">
            <div
              v-for="format in formats"
              :key="format.value"
              @click="emit('update:format', format.value)"
              :class="['flex items-center p-4 border rounded-lg cursor-pointer transition-all', modelValue === format.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300']"
            >
              <div :class="['w-4 h-4 rounded-full border-2 flex items-center justify-center', modelValue === format.value ? 'border-emerald-500' : 'border-gray-300']">
                <div v-if="modelValue === format.value" class="w-2 h-2 rounded-full bg-emerald-500"></div>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">{{ format.label }}</p>
                <p class="text-xs text-gray-500">{{ format.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
        <button :class="btnSecondary" @click="emit('close')">取消</button>
        <button :class="btnDefault" @click="emit('confirm')">导出</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 样式常量
const btnBase = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
const btnDefault = `${btnBase} bg-emerald-600 text-white hover:bg-emerald-700 h-8 rounded-md px-3 text-xs`
const btnSecondary = `${btnBase} bg-gray-100 text-gray-900 hover:bg-gray-200 h-8 rounded-md px-3 text-xs`

interface Props {
  visible: boolean
  modelValue: string
  selectedCount: number
  formats: { value: string; label: string; desc: string }[]
}

defineProps<Props>()
const emit = defineEmits<{
  'close': []
  'confirm': []
  'update:format': [val: string]
}>()
</script>
