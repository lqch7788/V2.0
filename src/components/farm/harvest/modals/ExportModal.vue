<template>
  <!-- 导出格式选择弹窗组件 - V1.1样式（纯div自定义弹窗） -->
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="handleClose">
      <div
        id="harvest-export-dialog"
        class="bg-white rounded-xl w-full shadow-xl flex flex-col"
        :style="{ maxWidth: '28rem', minWidth: '20rem' }"
        @click.stop
      >
        <!-- 头部 — 绿色渐变 -->
        <div
          class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-between rounded-t-xl cursor-move flex-shrink-0"
          style="background: linear-gradient(to right, #10b981, #059669);"
          @mousedown="handleDragStart"
        >
          <h3 class="font-semibold flex items-center gap-2 select-none" style="color: white;">
            <el-icon style="color: white;"><Download /></el-icon>
            <span style="color: white;">导出数据</span>
          </h3>
          <el-button link class="hover:bg-white/10" style="color: rgba(255,255,255,0.8);" @click="handleClose">
            <el-icon style="color: white;"><Close /></el-icon>
          </el-button>
        </div>

        <!-- 内容区域 -->
        <div class="p-6">
          <div class="space-y-4">
            <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p class="text-sm text-blue-800">
                已选择 <strong>{{ selectedCount }}</strong> 条记录进行导出
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">导出格式</label>
              <el-radio-group v-model="localFormat" class="flex flex-col gap-2">
                <el-radio label="excel">
                  <span class="text-sm">Excel 工作簿 (.xls)</span>
                </el-radio>
                <el-radio label="csv">
                  <span class="text-sm">CSV 文件 (.csv)</span>
                </el-radio>
                <el-radio label="word">
                  <span class="text-sm">Word 文档 (.doc)</span>
                </el-radio>
              </el-radio-group>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0 rounded-b-xl">
          <el-button size="small" @click="handleClose">取消</el-button>
          <el-button size="small" type="primary" @click="handleConfirm">确定</el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Download, Close } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: Boolean,
  exportFormat: {
    type: String,
    default: 'excel'
  },
  selectedCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close', 'confirm', 'format-change'])

// 本地格式
const localFormat = ref(props.exportFormat)

// 拖动状态
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0, left: 0, top: 0 })

// 监听打开状态
watch(() => props.isOpen, (val) => {
  if (val) {
    localFormat.value = props.exportFormat
  }
})

// 监听格式变化
watch(localFormat, (val) => {
  emit('format-change', val)
})

// 确认导出
const handleConfirm = () => {
  emit('confirm', localFormat.value)
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
  const dialog = document.getElementById('harvest-export-dialog')
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
    const dialog = document.getElementById('harvest-export-dialog')
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
