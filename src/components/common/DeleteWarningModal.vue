<!--
  通用删除警告弹窗
  1:1 翻译自 V1.1 src/components/ui/DeleteConfirmModal.tsx
  - props: isOpen (Boolean) / selectedCount (Number, 默认 0) / title (String, 默认 '删除警告')
          / description (String, 自定义描述) / impactHint (String, 业务影响提示)
  - emits: close / confirm / update:isOpen

  V1.1 实现：纯 div + backdrop（不使用 ElModal）
  - 标题区：绿色渐变背景 + AlertTriangle 图标 + 白字 + 右上角 X 关闭按钮
  - 内容区：描述或默认删除提示文案
  - 底部 footer：border-t + bg-gray-50 + 取消(secondary) + 确认删除(destructive 含 Trash2)

  ⚠️ 修复历史（2026-07-15）：
  - P0: 放弃 <ElModal> 包装，因其默认开启拖拽/调整大小/最大化导致样式串扰
  - P0: 关闭符号被 ElModal 默认 header 遮挡（`:show-header` 不是有效 prop，应为 `plainHeader`）
  - P0: `:show-footer="false"` 让 footer slot 完全隐藏，导致取消/确认删除按钮不可见
  - 修复：直接用原生 div 1:1 翻译 V1.1 实现
-->
<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="fixed inset-0 z-50" @keydown.esc="onClose">
        <!-- 遮罩层 - 点击关闭 -->
        <div
          class="absolute inset-0 bg-black/50"
          @click="onClose"
        />
        <!-- 弹窗本体 - 居中显示 (与 V1.1 Modal 组件一致) -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl w-96 shadow-xl flex flex-col max-h-[90vh]">
          <!-- 标题区 - 绿色渐变背景，与 V1.1 Modal/新增弹窗风格一致 -->
          <div class="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 flex-shrink-0 rounded-t-xl">
            <div class="flex items-center gap-2 text-white">
              <AlertTriangle :size="20" class="text-white" />
              <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
            </div>
            <!-- 关闭按钮 - 固定在 header 右上角 (P0 修复点) -->
            <button
              class="text-white hover:bg-emerald-500 transition-colors rounded p-1"
              aria-label="关闭"
              @click="onClose"
            >
              <X :size="20" class="text-white" />
            </button>
          </div>

          <!-- 内容区 - 与 V1.1 Modal 一致 -->
          <div class="px-6 py-5 text-sm text-gray-600 space-y-2 flex-1 overflow-y-auto">
            <p v-if="description" style="white-space: pre-line">{{ description }}</p>
            <template v-else>
              <p>确定要删除选中的 <strong>{{ selectedCount }}</strong> 个项目吗？</p>
              <p>此操作 <strong class="text-red-600">无法恢复</strong>，删除后数据将永久丢失。</p>
            </template>

            <!-- 业务影响提示（追溯链破坏风险等） -->
            <div
              v-if="impactHint"
              class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2"
            >
              <Info :size="16" class="mt-0.5 flex-shrink-0 text-amber-600" />
              <span class="flex-1">{{ impactHint }}</span>
            </div>
          </div>

          <!-- 底部 footer - 固定在弹窗底部，与 V1.1 Modal 一致 -->
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
            <!-- 取消按钮 -->
            <el-button size="small" @click="onClose">
              <X :size="14" class="mr-1" />取消
            </el-button>
            <!-- 确认删除按钮 (P0 修复点) -->
            <el-button size="small" type="danger" @click="onConfirm">
              <Trash2 :size="14" class="mr-1" />确认删除
            </el-button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { AlertTriangle, Info, Trash2, X } from 'lucide-vue-next'

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
  /**
   * 业务影响提示（追溯链破坏风险等）
   * 传入时，弹窗会在 description 下方显示一个 amber 色块提醒用户谨慎删除
   */
  impactHint: {
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

<style scoped>
/* 弹窗淡入淡出动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>