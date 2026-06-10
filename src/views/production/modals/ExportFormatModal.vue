<template>
  <!-- 技术方案导出弹窗 - 统一使用 ElModal（V1.1 width=500 → 统一800） -->
  <ElModal
    :model-value="visible"
    title="选择导出格式"
    :width="500"
    :height="400"
    @update:model-value="(v) => emit('update:visible', v)"
    @close="emit('close')"
  >
    <div class="p-2">
      <div class="space-y-4">
        <p class="text-sm text-gray-500">已选择 {{ selectedCount }} 条数据</p>
        <div class="space-y-3">
          <div
            v-for="item in formats"
            :key="item.value"
            @click="emit('update:format', item.value)"
            :class="['flex items-center p-4 border rounded-lg cursor-pointer transition-all', format === item.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300']"
          >
            <div :class="['w-4 h-4 rounded-full border-2 flex items-center justify-center', format === item.value ? 'border-emerald-500' : 'border-gray-300']">
              <div v-if="format === item.value" class="w-2 h-2 rounded-full bg-emerald-500"></div>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-900">{{ item.label }}</p>
              <p class="text-xs text-gray-500">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-3">
        <button :class="btnSecondary" @click="emit('close')">取消</button>
        <button :class="btnDefault" @click="emit('confirm')">导出</button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { ElModal } from '@/components/ui'
// 第二阶段 Y2 重构：按钮样式抽常量
import { btnDefault, btnSecondary } from '../constants/buttonStyles'

defineProps({
  visible: Boolean,
  // 第二阶段 Y4 修复：与父组件 v-model:format 契约对齐，prop 名必须叫 format
  format: { type: String, default: '' },
  selectedCount: { type: Number, default: 0 },
  formats: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'confirm', 'update:format', 'update:visible'])
</script>
