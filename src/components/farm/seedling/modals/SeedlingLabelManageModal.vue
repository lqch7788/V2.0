<!--
  育苗标签管理弹窗（重写 - 对齐 V1.1 SeedlingLabelManageModal.tsx）
  用简单 div 弹窗替代 el-dialog，避免 directive 问题
-->
<template>
  <div v-if="visible" class="fixed inset-0 z-[60] flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
    <div class="relative bg-white rounded-xl w-full max-w-4xl shadow-xl max-h-[85vh] flex flex-col">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 rounded-t-xl flex-shrink-0">
        <h3 class="text-lg font-semibold text-white">育苗标签管理 - {{ seedlingCode }}</h3>
        <button type="button" class="text-white hover:bg-emerald-700 rounded p-1" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div v-if="readOnly" class="px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-center gap-2 flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span class="text-sm text-amber-700">该育苗已结束，标签管理处于<strong>只读模式</strong></span>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="loading" class="text-center py-8 text-gray-400">加载中...</div>
        <div v-else-if="labels.length === 0" class="text-center py-8 text-gray-400">暂无标签</div>
        <div v-else class="space-y-3">
          <div v-for="label in labels" :key="label.id" class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-gray-900">{{ label.labelNumber }}</div>
                <div class="text-sm text-gray-500">{{ label.cropName }} - {{ label.cropVariety }}</div>
              </div>
              <span :class="['px-2 py-1 rounded text-xs font-medium', label.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600']">
                {{ label.status === 'active' ? '有效' : '无效' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  visible: Boolean,
  seedlingId: String,
  seedlingCode: String,
  autoSelectLabelNumber: String,
  readOnly: { type: Boolean, default: false }
})

defineEmits(['close'])

const labels = ref([])
const loading = ref(false)

const loadLabels = async () => {
  loading.value = true
  try {
    // 模拟加载标签数据
    labels.value = []
  } catch {
    labels.value = []
  } finally {
    loading.value = false
  }
}

watch(() => props.visible, (val) => {
  if (val) loadLabels()
})

onMounted(() => { if (props.visible) loadLabels() })
</script>
