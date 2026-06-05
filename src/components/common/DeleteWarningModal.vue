<!--
  通用删除警告弹窗
  1:1 翻译自 V1.1 src/components/common/DeleteWarningModal.tsx
  - props: isOpen (Boolean) / selectedCount (Number, 默认 0) / title (String, 默认 '删除警告')
  - emits: close / confirm
-->
<template>
  <el-dialog
    :model-value="isOpen"
    :title="title"
    width="400px"
    :close-on-click-modal="false"
    @close="onClose"
  >
    <div class="flex items-center gap-3 mb-4">
      <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
        <el-icon :size="24" class="text-red-600"><WarningFilled /></el-icon>
      </div>
      <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
    </div>
    <div class="text-sm text-gray-600 space-y-2 mb-6">
      <p v-if="description">{{ description }}</p>
      <template v-else>
        <p>确定要删除选中的 <strong>{{ selectedCount }}</strong> 个项目吗？</p>
        <p>此操作 <strong class="text-red-600">无法恢复</strong>，删除后数据将永久丢失。</p>
      </template>
    </div>
    <template #footer>
      <div class="flex gap-3">
        <button
          class="h-8 px-4 rounded-md text-sm bg-gray-100 text-gray-900 hover:bg-gray-200"
          @click="onClose"
        >
          取消
        </button>
        <button
          class="h-8 px-4 rounded-md text-sm bg-red-600 text-white hover:bg-red-700"
          @click="onConfirm"
        >
          确认
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { WarningFilled } from '@element-plus/icons-vue'

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

const emit = defineEmits(['close', 'confirm'])

function onClose() {
  emit('close')
}

function onConfirm() {
  emit('confirm')
}
</script>
