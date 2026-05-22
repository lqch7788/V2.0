<template>
  <!-- 编辑订单弹窗组件 - V1.1样式（纯div自定义弹窗） -->
  <Teleport to="body">
    <div v-if="isOpen && record" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="handleClose">
      <div
        id="order-edit-dialog"
        class="bg-white rounded-xl w-full shadow-xl flex flex-col relative"
        :style="{ maxWidth: '48rem', maxHeight: '85vh', minWidth: '40rem' }"
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

        <!-- 头部 — 绿色渐变 -->
        <div
          class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-between rounded-t-xl cursor-move flex-shrink-0"
          style="background: linear-gradient(to right, #10b981, #059669);"
          @mousedown="handleDragStart"
        >
          <h3 class="font-semibold flex items-center gap-2 select-none" style="color: white;">
            <el-icon style="color: white;"><Edit /></el-icon>
            <span style="color: white;">编辑订单</span>
          </h3>
          <div class="flex items-center gap-1">
            <!-- 最大化/还原按钮 -->
            <el-button
              link
              @click="toggleMaximize"
              class="hover:bg-white/10"
              style="color: rgba(255,255,255,0.8);"
            >
              <el-icon style="color: white;">
                <component :is="isMaximized ? 'ScaleToOriginal' : 'FullScreen'" />
              </el-icon>
            </el-button>
            <!-- 关闭按钮 -->
            <el-button link class="hover:bg-white/10" style="color: rgba(255,255,255,0.8);" @click="handleClose">
              <el-icon style="color: white;"><Close /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 表单内容 -->
        <div class="p-6 overflow-y-auto flex-1" style="max-height: calc(85vh - 140px);">
          <div class="grid grid-cols-2 gap-4">
            <!-- 订单编号 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">订单编号</label>
              <el-input v-model="form.orderCode" disabled class="bg-gray-50 text-gray-600" />
            </div>

            <!-- 订单名称 -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">订单名称 <span class="text-red-500">*</span></label>
              <el-input v-model="form.orderName" placeholder="请输入订单名称" />
              <p v-if="errors.orderName" class="text-xs text-red-500 mt-1">{{ errors.orderName }}</p>
            </div>

            <!-- 订单类型 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">订单类型</label>
              <el-select v-model="form.orderType" placeholder="请选择" class="w-full">
                <el-option label="育种订单" value="breeding" />
                <el-option label="育苗订单" value="seedling" />
                <el-option label="生产订单" value="production" />
                <el-option label="研发订单" value="research" />
                <el-option label="其他" value="other" />
              </el-select>
            </div>

            <!-- 订单日期 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">订单日期</label>
              <el-date-picker
                v-model="form.orderDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                class="w-full"
              />
            </div>

            <!-- 作物品种 -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">作物品种 <span class="text-red-500">*</span></label>
              <el-input v-model="form.cropVariety" placeholder="请输入作物品种" />
              <p v-if="errors.cropVariety" class="text-xs text-red-500 mt-1">{{ errors.cropVariety }}</p>
            </div>

            <!-- 品种路径 -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">品种路径</label>
              <el-input v-model="form.cropCategory" placeholder="选择作物品种后自动填充" disabled class="bg-gray-50 text-gray-600" />
            </div>

            <!-- 单位 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">单位</label>
              <el-select v-model="form.unit" placeholder="请选择" class="w-full">
                <el-option label="株" value="株" />
                <el-option label="棵" value="棵" />
                <el-option label="袋" value="袋" />
                <el-option label="公斤" value="公斤" />
                <el-option label="吨" value="吨" />
              </el-select>
            </div>

            <!-- 计划数量 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">计划数量 <span class="text-red-500">*</span></label>
              <el-input-number v-model="form.plannedQuantity" :min="0" class="w-full" />
              <p v-if="errors.plannedQuantity" class="text-xs text-red-500 mt-1">{{ errors.plannedQuantity }}</p>
            </div>

            <!-- 实际数量 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">实际数量</label>
              <el-input-number v-model="form.actualQuantity" :min="0" class="w-full" />
            </div>

            <!-- 供应商 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
              <el-input v-model="form.supplierName" placeholder="请输入供应商名称" />
            </div>

            <!-- 预计采收日期 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">预计采收日期</label>
              <el-date-picker
                v-model="form.expectedHarvestDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                class="w-full"
              />
            </div>

            <!-- 是否完成 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">订单完成</label>
              <el-select v-model="form.isCompleted" placeholder="请选择" class="w-full">
                <el-option label="否" :value="false" />
                <el-option label="是" :value="true" />
              </el-select>
              <p v-if="form.isCompleted" class="text-xs text-orange-500 mt-1">⚠️ 选择"是"后订单将无法编辑</p>
            </div>

            <!-- 备注 -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
              <el-input v-model="form.remarks" type="textarea" :rows="3" placeholder="请输入备注信息" />
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0 rounded-b-xl">
          <el-button size="small" @click="handleClose">取消</el-button>
          <el-button type="primary" size="small" @click="handleSubmit">保存修改</el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Edit, Close, FullScreen, ScaleToOriginal } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrderDataStore } from '@/stores/modules/orderData'
import { CropOrderStatus } from '@/types/crop'

const props = defineProps({
  isOpen: Boolean,
  record: Object
})

const emit = defineEmits(['close', 'success'])

const orderDataStore = useOrderDataStore()

// 最大化状态
const isMaximized = ref(false)

// 拖动状态
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0, left: 0, top: 0 })

// 缩放状态
const isResizing = ref(false)
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 })

// 表单数据
const form = ref({
  orderCode: '',
  orderName: '',
  orderType: 'production',
  cropCategory: '',
  cropVariety: '',
  plannedQuantity: 0,
  actualQuantity: 0,
  unit: '株',
  supplierName: '',
  orderDate: '',
  expectedHarvestDate: '',
  remarks: '',
  isCompleted: false
})

// 错误信息
const errors = ref({})

// 监听打开和记录变化
watch(() => props.isOpen, (val) => {
  if (val && props.record) {
    // 如果订单已完成，禁止编辑
    if (props.record.status === CropOrderStatus.COMPLETED) {
      ElMessage.warning('该订单已完成，无法编辑')
      emit('close')
      return
    }
    // 初始化表单
    form.value = {
      orderCode: props.record.orderCode || '',
      orderName: props.record.orderName || '',
      orderType: props.record.orderType || 'production',
      cropCategory: props.record.cropCategory || '',
      cropVariety: props.record.cropVariety || '',
      plannedQuantity: props.record.plannedQuantity || 0,
      actualQuantity: props.record.actualQuantity || 0,
      unit: props.record.unit || '株',
      supplierName: props.record.supplierName || '',
      orderDate: props.record.orderDate || '',
      expectedHarvestDate: props.record.expectedHarvestDate || '',
      remarks: props.record.remarks || '',
      isCompleted: props.record.status === CropOrderStatus.COMPLETED
    }
    errors.value = {}
    isMaximized.value = false
  }
})

// 拖动开始
const handleDragStart = (e) => {
  if (isMaximized.value) return
  if (e.target.closest('button')) return
  e.preventDefault()
  isDragging.value = true
  const dialog = document.getElementById('order-edit-dialog')
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
    const dialog = document.getElementById('order-edit-dialog')
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
  const dialog = document.getElementById('order-edit-dialog')
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
    const dialog = document.getElementById('order-edit-dialog')
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
  const dialog = document.getElementById('order-edit-dialog')
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

// 提交
const handleSubmit = async () => {
  // 如果订单已完成，禁止编辑
  if (props.record && props.record.status === CropOrderStatus.COMPLETED) {
    ElMessage.warning('该订单已完成，无法编辑')
    return
  }

  // 如果选择完成订单，弹出确认警告
  if (form.value.isCompleted) {
    try {
      await ElMessageBox.confirm(
        '⚠️ 重要提示：\n\n' +
        '确认将订单标记为完成吗？\n\n' +
        '完成后该订单将进入保存档案状态：\n' +
        '• 无法进行任何编辑操作\n' +
        '• 无法删除订单\n' +
        '• 无法关联新的作物实例\n\n' +
        '此操作不可逆，请确认！',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    } catch {
      return
    }
  }

  // 验证
  errors.value = {}
  if (!form.value.orderName) errors.value.orderName = '请输入订单名称'
  if (!form.value.cropVariety) errors.value.cropVariety = '请输入作物品种'
  if (form.value.plannedQuantity <= 0) errors.value.plannedQuantity = '请输入计划数量'

  if (Object.keys(errors.value).length > 0) return

  if (!props.record) return

  try {
    const updates = {
      orderCode: form.value.orderCode,
      orderName: form.value.orderName,
      orderType: form.value.orderType,
      orderDate: form.value.orderDate,
      expectedHarvestDate: form.value.expectedHarvestDate || undefined,
      cropCategory: form.value.cropCategory,
      cropName: '',
      cropVariety: form.value.cropVariety,
      plannedQuantity: form.value.plannedQuantity,
      actualQuantity: form.value.actualQuantity,
      unit: form.value.unit,
      supplierName: form.value.supplierName,
      remarks: form.value.remarks,
      status: form.value.isCompleted ? CropOrderStatus.COMPLETED : props.record.status
    }

    await orderDataStore.updateOrder(props.record.id, updates)
    ElMessage.success('更新成功')
    emit('success')
    handleClose()
  } catch (error) {
    console.error('更新订单失败:', error)
    ElMessage.error('更新失败')
  }
}
</script>

<style scoped>
/* V1.1样式保持 */
</style>
