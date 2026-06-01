<template>
  <!-- 订单详情弹窗组件 - V1.1样式（纯div自定义弹窗） -->
  <Teleport to="body">
    <div v-if="isOpen && record" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="handleClose">
      <div
        id="order-detail-dialog"
        class="bg-white rounded-xl w-full shadow-xl flex flex-col relative"
        :style="{ maxWidth: '48rem', maxHeight: '85vh', minWidth: '40rem', minHeight: '25rem' }"
        @click.stop
      >
        <!-- 右下角缩放拖动条 -->
        <div
          v-if="!isMaximized"
          class="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-10"
          @mousedown="handleResizeStart"
        >
          <svg class="w-full h-full text-gray-300 hover:text-gray-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM22 14H20V12H22V14ZM18 18H16V16H18V18ZM14 22H12V20H14V22Z" />
          </svg>
        </div>

        <!-- 头部 — 绿色渐变（与 V1.1 Modal.tsx L265 from-emerald-500 via-emerald-600 to-emerald-500 一致） -->
        <div
          class="px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 flex items-center justify-between rounded-t-xl cursor-move flex-shrink-0"
          @mousedown="handleDragStart"
        >
          <h3 class="text-lg font-semibold text-white select-none">
            订单详情
          </h3>
          <div class="flex items-center gap-1">
            <!-- 最大化/还原按钮 -->
            <el-button link @click="toggleMaximize" style="color: #6b7280;">
              <el-icon>
                <component :is="isMaximized ? 'ScaleToOriginal' : 'FullScreen'" />
              </el-icon>
            </el-button>
            <!-- 关闭按钮 -->
            <el-button link @click="handleClose" style="color: #6b7280;">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 内容 -->
        <div class="p-6 overflow-y-auto flex-1" style="max-height: calc(85vh - 140px);">
          <div class="space-y-4">
            <!-- 订单基本信息 -->
            <div>
              <h3 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <el-icon class="text-emerald-600"><Package /></el-icon>
                订单信息
              </h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-gray-500 mb-1">订单编号</p>
                    <p class="text-sm font-medium text-emerald-600">{{ record.orderCode }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">订单名称</p>
                    <p class="text-sm font-medium text-gray-900">{{ record.orderName }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">订单类型</p>
                    <span :class="getOrderTypeBadgeClass(record.orderType)">
                      {{ getOrderTypeLabel(record.orderType) }}
                    </span>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">订单状态</p>
                    <span :class="getStatusBadgeClass(record.status)">
                      {{ getStatusLabel(record.status) }}
                    </span>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">订单日期</p>
                    <p class="text-sm text-gray-900">{{ record.orderDate }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">预计完成日期</p>
                    <p class="text-sm text-gray-900">{{ record.expectedCompletionDate || '-' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 作物信息 -->
            <div>
              <h3 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <el-icon class="text-emerald-600"><Location /></el-icon>
                作物信息
              </h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-gray-500 mb-1">品种路径</p>
                    <p class="text-sm font-medium text-gray-900">{{ record.cropCategory || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">作物品种</p>
                    <p class="text-sm font-medium text-gray-900">{{ record.cropVariety }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 客户信息 -->
            <div>
              <h3 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <el-icon class="text-emerald-600"><User /></el-icon>
                客户信息
              </h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-gray-500 mb-1">客户名称</p>
                    <p class="text-sm font-medium text-gray-900">{{ record.customerName || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">客户电话</p>
                    <p class="text-sm text-gray-900">{{ record.customerPhone || '-' }}</p>
                  </div>
                  <div class="col-span-2">
                    <p class="text-xs text-gray-500 mb-1">收货地址</p>
                    <p class="text-sm text-gray-900">{{ record.deliveryAddress || '-' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 数量信息 -->
            <div>
              <h3 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <el-icon class="text-emerald-600"><Package /></el-icon>
                数量信息
              </h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <p class="text-xs text-gray-500 mb-1">计划数量</p>
                    <p class="text-sm font-medium text-gray-900">
                      {{ record.plannedQuantity }} {{ record.unit }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">完成数量</p>
                    <p class="text-sm font-medium text-gray-900">
                      {{ record.completedQuantity || 0 }} {{ record.unit }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">完成进度</p>
                    <p class="text-sm font-medium text-emerald-600">
                      {{ record.plannedQuantity > 0
                        ? Math.round((record.completedQuantity / record.plannedQuantity) * 100)
                        : 0 }}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 备注 -->
            <div v-if="record.remarks">
              <h3 class="text-sm font-bold text-gray-700 mb-3">备注</h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-900">{{ record.remarks }}</p>
              </div>
            </div>

            <!-- 关联作物实例 -->
            <div v-if="record.instanceIds && record.instanceIds.length > 0">
              <h3 class="text-sm font-bold text-gray-700 mb-3">关联作物实例</h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-900 mb-2">
                  已关联 {{ record.instanceIds.length }} 个作物实例
                </p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="id in record.instanceIds"
                    :key="id"
                    class="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded"
                  >
                    {{ id }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 创建信息 -->
            <div class="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-100">
              <span>创建人：{{ record.createBy }}</span>
              <span>创建时间：{{ record.createTime }}</span>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0 rounded-b-xl">
          <el-button size="small" @click="handleClose">关闭</el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Package } from 'lucide-vue-next'
import { View, Close, FullScreen, ScaleToOriginal, Location, User } from '@element-plus/icons-vue'
import { CropOrderStatus } from '@/types/crop'

const props = defineProps({
  isOpen: Boolean,
  record: Object
})

const emit = defineEmits(['close'])

// 最大化状态
const isMaximized = ref(false)

// 拖动状态
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0, left: 0, top: 0 })

// 缩放状态
const isResizing = ref(false)
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 })

// 获取状态标签（与V1.1一致：根据completedQuantity动态判断）
const getStatusLabel = (status) => {
  if (status === CropOrderStatus.COMPLETED) return '已完成'
  if (status === CropOrderStatus.CANCELLED) return '已取消'
  // 根据完成数量动态判断（统一为 completedQuantity）
  if (props.record && (props.record.completedQuantity || 0) > 0) return '进行中'
  return '已计划'
}

// 获取状态样式
const getStatusBadgeClass = (status) => {
  switch (status) {
    case CropOrderStatus.PLANNED:
      return 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
    case CropOrderStatus.IN_PROGRESS:
      return 'px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full'
    case CropOrderStatus.COMPLETED:
      return 'px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full'
    case CropOrderStatus.CANCELLED:
      return 'px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full'
    default:
      return 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
  }
}

// 获取订单类型标签
const getOrderTypeLabel = (type) => {
  switch (type) {
    case 'breeding': return '育种订单'
    case 'seedling': return '育苗订单'
    case 'production': return '生产订单'
    case 'research': return '研发订单'
    case 'other': return '其他'
    default: return type
  }
}

// 获取订单类型样式
const getOrderTypeBadgeClass = (type) => {
  switch (type) {
    case 'breeding':
      return 'px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full'
    case 'seedling':
      return 'px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full'
    case 'production':
      return 'px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full'
    case 'research':
      return 'px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full'
    case 'other':
      return 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
    default:
      return 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
  }
}

// 拖动开始
const handleDragStart = (e) => {
  if (isMaximized.value) return
  if (e.target.closest('button')) return
  e.preventDefault()
  isDragging.value = true
  const dialog = document.getElementById('order-detail-dialog')
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
    const dialog = document.getElementById('order-detail-dialog')
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

// 缩放开始
const handleResizeStart = (e) => {
  if (isMaximized.value) return
  e.preventDefault()
  e.stopPropagation()
  isResizing.value = true
  const dialog = document.getElementById('order-detail-dialog')
  resizeStart.value = {
    x: e.clientX,
    y: e.clientY,
    width: dialog?.clientWidth || 0,
    height: dialog?.clientHeight || 0,
  }
}

// 缩放中
watch(isResizing, (val) => {
  if (!val) return
  const handleMouseMove = (e) => {
    if (!isResizing.value) return
    const deltaX = e.clientX - resizeStart.value.x
    const deltaY = e.clientY - resizeStart.value.y
    const newWidth = Math.max(640, resizeStart.value.width + deltaX)
    const newHeight = Math.max(400, resizeStart.value.height + deltaY)
    const dialog = document.getElementById('order-detail-dialog')
    if (dialog) {
      dialog.style.width = `${newWidth}px`
      dialog.style.maxWidth = 'none'
      dialog.style.height = `${newHeight}px`
      dialog.style.maxHeight = 'none'
    }
  }
  const handleMouseUp = () => {
    isResizing.value = false
  }
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

// 最大化/还原
const toggleMaximize = () => {
  const dialog = document.getElementById('order-detail-dialog')
  if (!isMaximized.value && dialog) {
    dialog.style.width = '100vw'
    dialog.style.height = '100vh'
    dialog.style.maxWidth = 'none'
    dialog.style.maxHeight = 'none'
    dialog.style.borderRadius = '0'
    dialog.style.left = '0'
    dialog.style.top = '0'
    dialog.style.margin = '0'
  } else if (dialog) {
    dialog.style.width = ''
    dialog.style.height = ''
    dialog.style.maxWidth = ''
    dialog.style.maxHeight = ''
    dialog.style.borderRadius = ''
    dialog.style.left = ''
    dialog.style.top = ''
    dialog.style.margin = ''
  }
  isMaximized.value = !isMaximized.value
}

// 关闭
const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
/* V1.1样式保持 */
</style>
