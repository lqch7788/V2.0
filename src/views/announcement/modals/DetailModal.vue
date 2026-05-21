<template>
  <!-- 公告详情弹窗 -->
  <el-dialog
    :model-value="visible"
    title=""
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="800px"
    class="announcement-detail-modal"
  >
    <!-- 头部 — 绿色渐变 -->
    <template #header>
      <div class="flex items-center justify-between bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-t-lg -mx-6 -mt-4 mb-6">
        <div class="flex items-center gap-2">
          <el-icon class="text-xl"><View /></el-icon>
          <span class="text-lg font-semibold">公告详情</span>
        </div>
        <div class="flex items-center gap-1">
          <el-button
            :icon="isMaximized ? 'ScaleToOriginal' : 'FullScreen'"
            link
            class="text-white/80 hover:text-white"
            @click="toggleMaximize"
          />
          <el-button icon="Close" link class="text-white/80 hover:text-white" @click="handleClose" />
        </div>
      </div>
    </template>

    <!-- 内容 -->
    <div v-if="notice" class="space-y-4">
      <div class="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <span class="text-emerald-600 text-lg">📢</span>
          </div>
          <div>
            <h4 class="text-lg font-bold text-gray-900">{{ notice.title }}</h4>
            <span class="text-sm text-gray-500 font-mono">{{ notice.code }}</span>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-xs text-gray-500">类型</p>
            <p class="text-sm font-medium text-gray-900">{{ notice.type }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">优先级</p>
            <span :class="['px-2 py-1 text-xs rounded-full border', getPriorityColor(notice.priority)]">
              {{ notice.priority }}
            </span>
          </div>
          <div>
            <p class="text-xs text-gray-500">发布部门</p>
            <p class="text-sm font-medium text-gray-900">{{ notice.sender }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">发布日期</p>
            <p class="text-sm font-medium text-gray-900">{{ notice.date }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">接收对象</p>
            <p class="text-sm font-medium text-gray-900">{{ notice.recipients }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">阅读数</p>
            <p class="text-sm font-medium text-gray-900 font-mono">{{ notice.readCount }}</p>
          </div>
        </div>
        <div class="mt-4">
          <p class="text-xs text-gray-500 mb-2">公告内容</p>
          <div class="bg-white rounded-lg p-3 border border-gray-200">
            <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ notice.content }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="flex justify-end">
        <el-button size="small" @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { View, Close, FullScreen, ScaleToOriginal } from '@element-plus/icons-vue'
import {  Notice  } from '@/types/announcement'
import { getPriorityColor } from '../utils'

// Props 定义

const props = defineProps({})

// Emits 定义
const emit = defineEmits(['update'])

// 最大化状态
const isMaximized = ref(false)

// 双向绑定
const visible = computed({
  get() {
    return props.modelValue
  },
  set: (val) => emit('update:modelValue', val)
})

// 切换最大化
const toggleMaximize = () => {
  isMaximized.value = !isMaximized.value
}

// 关闭
const handleClose = () => {
  visible.value = false
  emit('close')
}
</script>

<style scoped>
/* V1.1 样式保持 */
.announcement-detail-modal :deep(.el-dialog__header) {
  padding: 16px 20px;
  margin-right: 0;
}
</style>
