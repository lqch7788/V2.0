<template>
  <!-- 删除确认弹窗组件 - V1.1样式（纯div自定义弹窗） -->
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="handleClose">
      <div
        id="harvest-delete-dialog"
        class="bg-white rounded-xl w-full shadow-xl flex flex-col"
        :style="{ maxWidth: '28rem', minWidth: '20rem' }"
        @click.stop
      >
        <!-- 头部 — 红色渐变 -->
        <div
          class="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-between rounded-t-xl cursor-move flex-shrink-0"
          style="background: linear-gradient(to right, #ef4444, #dc2626);"
          @mousedown="handleDragStart"
        >
          <h3 class="font-semibold flex items-center gap-2 select-none" style="color: white;">
            <el-icon style="color: white;"><Warning /></el-icon>
            <span style="color: white;">确认删除</span>
          </h3>
          <el-button link class="hover:bg-white/10" style="color: rgba(255,255,255,0.8);" @click="handleClose">
            <el-icon style="color: white;"><Close /></el-icon>
          </el-button>
        </div>

        <!-- 内容区域 -->
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <el-icon class="text-red-600 text-2xl"><Warning /></el-icon>
              </div>
              <div>
                <p class="text-gray-900 font-medium">确定要删除选中的记录吗？</p>
                <p class="text-gray-500 text-sm mt-1">即将删除 <strong>{{ selectedCount }}</strong> 条采收记录</p>
              </div>
            </div>

            <div class="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <p class="text-sm text-amber-700">
                <el-icon class="align-middle"><Warning /></el-icon>
                此操作不可恢复，删除后数据将无法找回
              </p>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0 rounded-b-xl">
          <el-button size="small" @click="handleClose">取消</el-button>
          <el-button size="small" type="danger" @click="handleConfirm">确认删除</el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Warning, Close } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: Boolean,
  selectedCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close', 'confirm'])

// 拖动状态
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0, left: 0, top: 0 })

// 确认删除
const handleConfirm = () => {
  emit('confirm')
}

// 关闭
const handleClose = () => {
  emit('close')
}

// 拖动开始
const handleDragStart = (e) => {
  if (e.target.closest('button')) return
  e.preventDefault()
  isDragging.value = true
  const dialog = document.getElementById('harvest-delete-dialog')
  if (dialog) {
    const rect = dialog.getBoundingClientRect()
    dragStart.value = { x: e.clientX, y: e.clientY, left: rect.left, top: rect.top }
  }
}

// 拖动中
watch(isDragging, (val) => {
  if (!val) return
  const handleMouseMove = (e) => {
    if (!isDragging.value) return
    const deltaX = e.clientX - dragStart.value.x
    const deltaY = e.clientY - dragStart.value.y
    const dialog = document.getElementById('harvest-delete-dialog')
    if (dialog) {
      dialog.style.position = 'fixed'
      dialog.style.left = `${dragStart.value.left + deltaX}px`
      dialog.style.top = `${dragStart.value.top + deltaY}px`
      dialog.style.margin = '0'
    }
  }
  const handleMouseUp = () => {
    isDragging.value = false
  }
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})
</script>
