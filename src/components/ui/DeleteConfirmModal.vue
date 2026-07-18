<template>
  <!--
    统一删除警告弹窗组件
    V1.1 → V2.0 1:1 移植（src/components/ui/DeleteConfirmModal.tsx）
    2026-07-08 V3.4：影响提示（追溯链破坏风险等）
  -->
  <div v-if="isOpen" class="fixed inset-0 z-50">
    <!-- 遮罩层 - 点击关闭 -->
    <div class="absolute inset-0 bg-black/50" @click="onClose"></div>
    <!-- 弹窗本体 - 居中显示 -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl w-96 shadow-xl flex flex-col max-h-[90vh]">
      <!-- 标题区 - 绿色渐变背景 -->
      <div class="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 flex-shrink-0 rounded-t-xl">
        <div class="flex items-center gap-2 text-white">
          <el-icon :size="20" style="color: white;">
            <WarningFilled />
          </el-icon>
          <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
        </div>
        <el-button v-if="onClose" link size="small" class="!text-white hover:!bg-emerald-500" @click="onClose">
          <el-icon :size="20" style="color: white;"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 内容区 -->
      <div class="px-6 py-5 text-sm text-gray-600 space-y-2 flex-1">
        <p v-if="description" class="whitespace-pre-line">{{ description }}</p>
        <template v-else>
          <p>确定要删除选中的 <strong class="text-red-600">{{ selectedCount }}</strong> 个项目吗？</p>
          <p>此操作 <strong class="text-red-600">无法恢复</strong>，删除后数据将永久丢失。</p>
        </template>

        <!-- 2026-07-08 V3.4：业务影响提示 -->
        <div v-if="impactHint" class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
          <el-icon :size="16" class="text-amber-600 flex-shrink-0 mt-0.5"><InfoFilled /></el-icon>
          <span class="flex-1">{{ impactHint }}</span>
        </div>
      </div>

      <!-- 底部 footer -->
      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
        <el-button size="small" @click="onClose">
          <el-icon><Close /></el-icon> 取消
        </el-button>
        <el-button type="danger" size="small" @click="onConfirm">
          <el-icon><Delete /></el-icon> 确认删除
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 统一删除警告弹窗组件
 * V1.1 → V2.0 1:1 移植
 */
import { WarningFilled, Close, InfoFilled, Delete } from '@element-plus/icons-vue'

defineProps({
  isOpen: { type: Boolean, required: true },
  selectedCount: { type: Number, default: 0 },
  onClose: { type: Function, default: null },
  onConfirm: { type: Function, required: true },
  title: { type: String, default: '删除警告' },
  description: { type: String, default: null },
  impactHint: { type: String, default: null }
})

defineOptions({ name: 'DeleteConfirmModal' })
</script>
