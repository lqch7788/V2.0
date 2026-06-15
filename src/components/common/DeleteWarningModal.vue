<!--
  通用删除警告弹窗
  1:1 翻译自 V1.1 src/components/ui/DeleteConfirmModal.tsx（DeleteConfirmModal 主体，96 行）
  - props: isOpen (Boolean) / selectedCount (Number, 默认 0) / title (String, 默认 '删除警告')
          / description (String, 自定义描述)
  - emits: close / confirm / update:isOpen
  V1.1 头部：bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 + AlertTriangle 图标 + 白字
  V1.1 按钮：取消(secondary) + 确认删除(destructive, 含 Trash2 图标)
  修复项：
  1. 头部改为绿色渐变 + AlertTriangle 图标 + 白字 (P0)
  2. 宽度改为 V1.1 w-96 = 384px (P0)
  3. 移除强制 :height="450"，恢复 V1.1 自由高度 (P1)
  4. 确认按钮文案从"确认"改为"确认删除" + 添加 Trash2 图标 (P0)
  5. 取消/确认按钮改为非 flex-1 普通按钮 (P1)
-->
<template>
  <!-- 通用删除警告弹窗 - V1.1 风格：固定宽度 384px，无固定高度 -->
  <ElModal
    :model-value="isOpen"
    :title="null"
    :width="384"
    :show-header="false"
    :show-footer="false"
    @update:model-value="(v) => { if (!v) emit('update:isOpen', false) }"
    @close="onClose"
  >
    <!-- 标题区 - 绿色渐变背景 + AlertTriangle 图标 + 白字 -->
    <template #header>
      <div class="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 rounded-t-lg -mx-6 -mt-4">
        <div class="flex items-center gap-2 text-white">
          <AlertTriangle :size="20" class="text-white" />
          <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
        </div>
        <button
          class="text-white hover:bg-emerald-500 transition-colors rounded p-1"
          aria-label="关闭"
          @click="onClose"
        >
          <X :size="20" class="text-white" />
        </button>
      </div>
    </template>

    <!-- 内容区 - V1.1: 描述或默认文案 -->
    <div class="px-6 py-5 text-sm text-gray-600 space-y-2">
      <p v-if="description" v-html="description"></p>
      <template v-else>
        <p>确定要删除选中的 <strong>{{ selectedCount }}</strong> 个项目吗？</p>
        <p>此操作 <strong class="text-red-600">无法恢复</strong>，删除后数据将永久丢失。</p>
      </template>
    </div>

    <!-- 底部 footer - V1.1: border-t + bg-gray-50 + 取消(secondary) + 确认删除(destructive 含 Trash2) -->
    <template #footer>
      <div class="flex items-center justify-end gap-3 px-6 py-4 -mx-6 -mb-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <el-button size="small" @click="onClose">
          <X :size="14" class="mr-1" />取消
        </el-button>
        <el-button size="small" type="danger" @click="onConfirm">
          <Trash2 :size="14" class="mr-1" />确认删除
        </el-button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { AlertTriangle, Trash2, X } from 'lucide-vue-next'
import { ElModal } from '@/components/ui'

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
