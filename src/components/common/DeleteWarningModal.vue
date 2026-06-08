<!--
  通用删除警告弹窗
  1:1 翻译自 V1.1 src/components/common/DeleteWarningModal.tsx
  - props: isOpen (Boolean) / selectedCount (Number, 默认 0) / title (String, 默认 '删除警告')
  - emits: close / confirm
  统一使用 ElModal（统一800）
-->
<template>
  <!-- 通用删除警告弹窗 - 缩小一半 (560×450)，按钮固定在底部 #footer 插槽 -->
  <ElModal
    :model-value="isOpen"
    :title="title"
    :width="560"
    :height="450"
    :show-footer="true"
    :show-submit="false"
    :show-cancel="false"
    @update:model-value="(v) => { if (!v) emit('update:isOpen', false) }"
    @close="onClose"
  >
    <div class="p-2">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle :size="24" class="text-red-600" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
      </div>
      <div class="text-sm text-gray-600 space-y-2">
        <p v-if="description" v-html="description"></p>
        <template v-else>
          <p>确定要删除选中的 <strong>{{ selectedCount }}</strong> 个项目吗？</p>
          <p>此操作 <strong class="text-red-600">无法恢复</strong>，删除后数据将永久丢失。</p>
        </template>
      </div>
    </div>

    <!-- footer 插槽：取消/确认按钮固定在弹窗底部 -->
    <template #footer>
      <div class="flex gap-3 w-full">
        <button :class="btnSecondary + ' flex-1 h-9'" @click="onClose">取消</button>
        <button :class="btnDestructive + ' flex-1 h-9'" @click="onConfirm">确认</button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { AlertTriangle } from 'lucide-vue-next'
import { ElModal } from '@/components/ui'
// 与技术方案共享按钮样式常量
import { btnSecondary, btnDestructive } from '@/views/production/constants/buttonStyles'

/**
 * @typedef {Object} DeleteWarningModalProps
 * @property {boolean} isOpen - 弹窗显示状态
 * @property {number} [selectedCount=0] - 选中数量
 * @property {string} [title='删除警告'] - 弹窗标题
 * @property {string} [description] - 自定义描述（可选）
 */

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  selectedCount: {
    type: Number,
    default: 0,
  },
  title: {
    type: String,
    default: '删除警告',
  },
  description: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'confirm', 'update:isOpen'])

function onClose() {
  emit('update:isOpen', false)
  emit('close')
}

function onConfirm() {
  emit('confirm')
}
</script>
