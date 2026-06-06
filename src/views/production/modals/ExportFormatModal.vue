<template>
  <!-- 第二阶段 Y3 重构：复用 BaseModal 弹窗外壳 -->
  <BaseModal
    :visible="visible"
    @update:visible="(v) => emit('update:visible', v)"
    title="选择导出格式"
    :width="500"
    @close="emit('close')"
  >
    <div class="p-6">
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
      <button :class="btnSecondary" @click="emit('close')">取消</button>
      <button :class="btnDefault" @click="emit('confirm')">导出</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '../components/BaseModal.vue'
// 第二阶段 Y2 重构：按钮样式抽常量
import { btnDefault, btnSecondary } from '../constants/buttonStyles'

interface Props {
  visible: boolean
  // 第二阶段 Y4 修复：与父组件 v-model:format 契约对齐，prop 名必须叫 format
  format: string
  selectedCount: number
  formats: { value: string; label: string; desc: string }[]
}

defineProps<Props>()
const emit = defineEmits<{
  'close': []
  'confirm': []
  'update:format': [val: string]
  'update:visible': [val: boolean]
}>()
</script>

</invoke>