<template>
  <!-- 编辑订单弹窗组件 - V1.1样式（纯div自定义弹窗） -->
  <Teleport to="body">
    <div v-if="isOpen && record" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="handleClose">
      <div
        id="order-edit-dialog"
        class="bg-white rounded-xl w-full shadow-xl flex flex-col relative"
        :style="{ width: '700px', height: '600px', maxWidth: '90vw', maxHeight: '90vh', minWidth: '40rem' }"
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

        <!-- 头部 — 绿色渐变（与 V1.1 Modal.tsx L265 from-emerald-500 via-emerald-600 to-emerald-500 三色渐变一致） -->
        <div
          class="px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 flex items-center justify-between rounded-t-xl cursor-move flex-shrink-0"
          @mousedown="handleDragStart"
        >
          <h3 class="text-lg font-semibold text-white flex items-center gap-2 select-none">
            编辑订单
          </h3>
          <div class="flex items-center gap-1">
            <!-- 最大化/还原按钮 -->
            <el-button
              link
              @click="toggleMaximize"
              @mousedown.stop
              class="hover:bg-white/10"
              style="color: rgba(255,255,255,0.8);"
            >
              <el-icon style="color: white;">
                <component :is="isMaximized ? 'ScaleToOriginal' : 'FullScreen'" />
              </el-icon>
            </el-button>
            <!-- 关闭按钮 -->
            <el-button link class="hover:bg-white/10" style="color: rgba(255,255,255,0.8);" @click="handleClose" @mousedown.stop>
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
              <el-input v-model="form.orderCode" readonly class="bg-gray-50 text-gray-600 border-gray-300" />
            </div>

            <!-- 订单名称 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">订单名称 <span class="text-red-500">*</span></label>
              <el-input v-model="form.orderName" placeholder="请输入订单名称" />
              <p v-if="errors.orderName" class="text-xs text-red-500 mt-1">{{ errors.orderName }}</p>
            </div>

            <!-- 订单类型（与 V1.1 EditModal.tsx L301-308 一致：动态渲染 orderTypeOptions） -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">订单类型</label>
              <el-select v-model="form.orderType" class="w-full">
                <el-option
                  v-for="opt in orderTypeOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </div>

            <!-- 订单日期 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">订单日期</label>
              <el-date-picker
                v-model="form.orderDate"
                type="date"
                value-format="YYYY-MM-DD"
                class="w-full"
              />
            </div>

            <!-- 作物品种 - 搜索下拉选择（与V1.1一致） -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">作物品种 <span class="text-red-500">*</span></label>
              <div class="relative">
                <div class="relative">
                  <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <el-input
                    v-model="searchKeyword"
                    placeholder="搜索作物品种..."
                    :class="errors.cropVariety ? 'border-red-500' : ''"
                    class="pl-10"
                    @focus="showDropdown = true"
                  />
                  <button
                    v-if="searchKeyword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    @click.stop="clearSearch"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
                <!-- 下拉选择列表 -->
                <div
                  v-if="showDropdown && filteredVarieties.length > 0"
                  class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  <div
                    v-for="(variety, index) in filteredVarieties"
                    :key="`${variety.value}-${index}`"
                    class="px-3 py-2 hover:bg-emerald-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    @click="handleSelectVariety(variety)"
                  >
                    <div class="text-sm font-medium text-gray-900">{{ variety.label }}</div>
                    <div class="text-xs text-gray-500 truncate">{{ variety.fullPath }}</div>
                  </div>
                </div>
              </div>
              <p v-if="errors.cropVariety" class="text-xs text-red-500 mt-1">{{ errors.cropVariety }}</p>
            </div>

            <!-- 品种路径 -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">品种路径</label>
              <el-input v-model="form.cropCategory" placeholder="选择作物品种后自动填充" readonly class="bg-gray-50 text-gray-600 border-gray-300" />
            </div>

            <!-- 单位 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">单位</label>
              <el-select v-model="form.unit" class="w-full">
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
              <el-input-number v-model="form.plannedQuantity" :min="0" placeholder="请输入计划数量" class="w-full" />
              <p v-if="errors.plannedQuantity" class="text-xs text-red-500 mt-1">{{ errors.plannedQuantity }}</p>
            </div>

            <!-- 完成数量（与V1.1 EditModal L425-436 标签一致："完成数量"） -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">完成数量</label>
              <el-input-number v-model="form.completedQuantity" :min="0" placeholder="请输入完成数量" class="w-full" />
            </div>

            <!-- 客户下拉（与V1.1 EditModal.tsx L438-466 客户下拉选择器一致） -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">客户</label>
              <el-select
                v-model="form.customerId"
                placeholder="请选择客户"
                clearable
                class="w-full"
                @change="handleCustomerChange"
              >
                <el-option
                  v-for="customer in customerOptions"
                  :key="customer.id"
                  :label="customer.customerName"
                  :value="customer.id"
                />
              </el-select>
            </div>

            <!-- 客户电话 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">客户电话</label>
              <el-input v-model="form.customerPhone" placeholder="请输入客户电话" />
            </div>

            <!-- 收货地址 -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">收货地址</label>
              <el-input v-model="form.deliveryAddress" placeholder="请输入收货地址" />
            </div>

            <!-- 预计完成日期（统一为 expectedCompletionDate） -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">预计完成日期</label>
              <el-date-picker
                v-model="form.expectedCompletionDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                class="w-full"
              />
            </div>

            <!-- 订单状态 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">订单状态</label>
              <el-select v-model="form.orderStatus" class="w-full">
                <el-option label="进行中" value="in_progress" />
                <el-option label="已完成" value="completed" />
                <el-option label="已取消" value="cancelled" />
              </el-select>
              <p v-if="form.orderStatus === 'completed' || form.orderStatus === 'cancelled'" class="text-xs text-orange-500 mt-1">⚠️ 选择终态后订单将无法编辑</p>
            </div>

            <!-- 备注 -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
              <el-input v-model="form.remarks" type="textarea" :rows="3" placeholder="请输入备注信息" />
            </div>
          </div>
        </div>

        <!-- 底部按钮（修复轮 8 P0-I1-1：提交期按钮 disabled + 文案变化） -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0 rounded-b-xl">
          <el-button size="small" @click="handleClose" @mousedown.stop :disabled="isSubmitting">取消</el-button>
          <el-button type="primary" size="small" @click="handleSubmit" @mousedown.stop :disabled="isSubmitting">
            {{ isSubmitting ? '保存中...' : '保存修改' }}
          </el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { Edit, Close, FullScreen, ScaleToOriginal } from '@element-plus/icons-vue'
import { Search, X } from 'lucide-vue-next'
import { useOrderDataStore } from '@/stores/modules/orderData'
import { useCustomerStore } from '@/stores/modules/customer'
import { CropOrderStatus } from '@/types/crop'
import { showAlert, showConfirm } from '@/lib/dialogService'
import { initVarieties, getVarietyOptions } from '@/services/cropVarietyService'

const props = defineProps({
  isOpen: Boolean,
  record: Object,
  orderTypeOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'success'])

const orderDataStore = useOrderDataStore()
const customerStore = useCustomerStore()

// 客户下拉选项（与 V1.1 EditModal.tsx L461 一致）
const customerOptions = computed(() => customerStore.customers || [])

// 客户选择变更时自动填充（与 V1.1 EditModal.tsx L444-455 一致）
const handleCustomerChange = (customerId) => {
  const customer = customerOptions.value.find(c => c.id === customerId)
  if (customer) {
    form.value.customerName = customer.customerName || ''
    form.value.customerPhone = customer.contactPhone || customer.customerPhone || ''
    form.value.deliveryAddress = customer.deliveryAddress || ''
  }
}

// 最大化状态
const isMaximized = ref(false)

// 拖动状态
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0, left: 0, top: 0 })

// 缩放状态
const isResizing = ref(false)
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 })

// 表单数据（与V1.1 EditModal.tsx L40-59 一致 - 无 customerName/customerPhone 显式字段）
const form = ref({
  orderCode: '',
  orderName: '',
  orderType: 'production',
  cropCategory: '',
  cropVariety: '',
  plannedQuantity: 0,
  completedQuantity: 0,
  unit: '株',
  customerId: '',
  customerPhone: '',
  deliveryAddress: '',
  orderDate: '',
  expectedCompletionDate: '',
  remarks: '',
  orderStatus: 'in_progress'
})

// 错误信息
const errors = ref({})

// 搜索相关状态（与V1.1一致）
const searchKeyword = ref('')
const showDropdown = ref(false)

// 初始化品种数据
initVarieties()
const varietyOptions = computed(() => getVarietyOptions())

// 过滤品种选项
const filteredVarieties = computed(() => {
  if (!searchKeyword.value.trim()) {
    return varietyOptions.value.slice(0, 20)
  }
  const keyword = searchKeyword.value.toLowerCase()
  return varietyOptions.value.filter(opt =>
    opt.label.toLowerCase().includes(keyword) ||
    opt.fullPath.toLowerCase().includes(keyword) ||
    opt.varietyCode.toLowerCase().includes(keyword)
  ).slice(0, 20)
})

// 选择品种
const handleSelectVariety = (variety) => {
  form.value.cropVariety = variety.label
  form.value.cropCategory = variety.fullPath
  searchKeyword.value = variety.label
  showDropdown.value = false
  errors.value = { ...errors.value, cropVariety: '' }
}

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = ''
  form.value.cropVariety = ''
  form.value.cropCategory = ''
}

// 监听下拉框显示状态
watch(showDropdown, (val) => {
  if (val) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})

function handleClickOutside() {
  showDropdown.value = false
}

// 监听打开和记录变化（V2.0 第6轮 P0 修复：添加 immediate: true + 修复轮 8 P0-I1-3：弹窗打开时刷新客户列表）
watch([() => props.isOpen, () => props.record], ([isOpenVal, recordVal]) => {
  if (isOpenVal && recordVal) {
    // 如果订单已完成或已取消，禁止编辑
    if (recordVal.status === CropOrderStatus.COMPLETED || recordVal.status === CropOrderStatus.CANCELLED) {
      const msg = recordVal.status === CropOrderStatus.COMPLETED ? '已完成' : '已取消'
      showAlert(`该订单已${msg}，无法编辑`)
      emit('close')
      return
    }
    // 修复轮 8 P0-I1-3：弹窗打开时刷新客户列表，确保客户下拉有数据
    if (customerStore.fetchCustomers) customerStore.fetchCustomers()
    // 初始化表单
    form.value = {
      orderCode: recordVal.orderCode || '',
      orderName: recordVal.orderName || '',
      orderType: recordVal.orderType || 'production',
      cropCategory: recordVal.cropCategory || '',
      cropVariety: recordVal.cropVariety || '',
      plannedQuantity: recordVal.plannedQuantity || 0,
      completedQuantity: recordVal.completedQuantity || 0,
      unit: recordVal.unit || '株',
      customerId: recordVal.customerId || '',
      customerName: recordVal.customerName || '',
      customerPhone: recordVal.customerPhone || '',
      deliveryAddress: recordVal.deliveryAddress || '',
      orderDate: recordVal.orderDate || '',
      expectedCompletionDate: recordVal.expectedCompletionDate || '',
      remarks: recordVal.remarks || '',
      orderStatus: recordVal.status === CropOrderStatus.COMPLETED
        ? 'completed'
        : recordVal.status === CropOrderStatus.CANCELLED
        ? 'cancelled'
        : 'in_progress'
    }
    searchKeyword.value = recordVal.cropVariety || ''
    errors.value = {}
    isMaximized.value = false
  }
}, { immediate: true })

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

// 关闭（V2.0 第6轮 P0 修复：清理拖动/缩放监听器防内存泄漏）
const handleClose = () => {
  isDragging.value = false
  isResizing.value = false
  if (moveHandler) {
    document.removeEventListener('mousemove', moveHandler)
    document.removeEventListener('mouseup', upHandler)
    moveHandler = null
    upHandler = null
  }
  if (resizeMoveHandler) {
    document.removeEventListener('mousemove', resizeMoveHandler)
    document.removeEventListener('mouseup', resizeUpHandler)
    resizeMoveHandler = null
    resizeUpHandler = null
  }
  // 重置状态（防止下次打开残留旧数据）
  errors.value = {}
  isMaximized.value = false
  showDropdown.value = false
  emit('close')
}

// 拖动/缩放状态（V2.0 第6轮 P0 修复：声明具名变量，handleClose 能正确清理）
let moveHandler = null
let upHandler = null
let resizeMoveHandler = null
let resizeUpHandler = null

// ESC 键关闭弹窗（V2.0 第6轮 P0 修复 - 与 V1.1 Modal.tsx L97-105 行为一致）
const handleEscKey = (e) => {
  if (e.key === 'Escape' && props.isOpen) handleClose()
}
onMounted(() => document.addEventListener('keydown', handleEscKey))
onUnmounted(() => document.removeEventListener('keydown', handleEscKey))

// click-outside 监听器卸载清理（V2.0 第6轮 P0 修复 - 防内存泄漏）
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 提交（修复轮 8 P0-I1-1：加 isSubmitting 状态，提交期间按钮 disabled + 文案变化）
const isSubmitting = ref(false)
const handleSubmit = async () => {
  // 如果订单已完成或已取消，禁止编辑
  if (props.record && (props.record.status === CropOrderStatus.COMPLETED || props.record.status === CropOrderStatus.CANCELLED)) {
    const msg = props.record.status === CropOrderStatus.COMPLETED ? '已完成' : '已取消'
    await showAlert(`该订单已${msg}，无法编辑`)
    return
  }

  // 如果选择"已完成"或"已取消"，弹出确认警告
  if (form.value.orderStatus === 'completed') {
    const confirmed = await showConfirm(
      '⚠️ 重要提示：\n\n' +
      '确认将订单标记为完成吗？\n\n' +
      '完成后该订单将进入保存档案状态：\n' +
      '• 无法进行任何编辑操作\n' +
      '• 无法删除订单\n' +
      '• 无法关联新的作物实例\n\n' +
      '此操作不可逆，请确认！'
    )
    if (!confirmed) {
      return
    }
  }
  if (form.value.orderStatus === 'cancelled') {
    const confirmed = await showConfirm(
      '⚠️ 重要提示：\n\n' +
      '确认取消该订单吗？\n\n' +
      '取消后该订单将无法操作：\n' +
      '• 无法进行任何编辑操作\n' +
      '• 无法删除订单\n' +
      '• 无法关联新的作物实例\n\n' +
      '此操作不可逆，请确认！'
    )
    if (!confirmed) {
      return
    }
  }

  // 验证（与 V1.1 EditModal.tsx L198-205 一致 - 4 项校验）
  errors.value = {}
  if (!form.value.orderCode) errors.value.orderCode = '请输入订单编号'
  if (!form.value.orderName) errors.value.orderName = '请输入订单名称'
  if (!form.value.cropVariety) errors.value.cropVariety = '请选择作物品种'
  if (form.value.plannedQuantity <= 0) errors.value.plannedQuantity = '请输入计划数量'

  if (Object.keys(errors.value).length > 0) return

  if (!props.record) return

  // 计算最终状态
  const finalStatus = form.value.orderStatus === 'completed'
    ? CropOrderStatus.COMPLETED
    : form.value.orderStatus === 'cancelled'
    ? CropOrderStatus.CANCELLED
    : form.value.completedQuantity > 0
      ? CropOrderStatus.IN_PROGRESS
      : CropOrderStatus.PLANNED

  try {
    const updates = {
      orderCode: form.value.orderCode,
      orderName: form.value.orderName,
      orderType: form.value.orderType,
      orderDate: form.value.orderDate,
      expectedCompletionDate: form.value.expectedCompletionDate || '',
      cropCategory: form.value.cropCategory,
      cropName: '',
      cropVariety: form.value.cropVariety,
      plannedQuantity: form.value.plannedQuantity,
      completedQuantity: form.value.completedQuantity,
      unit: form.value.unit,
      remarks: form.value.remarks,
      status: finalStatus,
      customerId: form.value.customerId || undefined
    }

    await orderDataStore.updateOrder(props.record.id, updates)
    emit('success')
    handleClose()
  } catch (error) {
    console.error('更新订单失败:', error)
    await showAlert('更新订单失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* V1.1 inputDeepClass 全局样式（修复轮 6 P0-008~016 inputDeepClass 缺失）
   V1.1 EditModal L66 deepInputClass 定义，与 AddModal 同一套样式 */
:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  padding: 0 11px !important;
  box-shadow: 0 0 0 1px #9ca3af inset !important;
  border-radius: 0.5rem !important;
  transition: box-shadow 0.15s ease-in-out;
  min-height: 38px;
}
:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px #10b981 inset !important;
}
:deep(.el-input__wrapper.is-focus),
:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #10b981 inset, 0 0 0 2px rgba(16, 185, 129, 0.2) inset !important;
  outline: none;
}
:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  font-size: 14px !important;
}
:deep(.el-select__wrapper) {
  padding: 0 11px !important;
  box-shadow: 0 0 0 1px #9ca3af inset !important;
  border-radius: 0.5rem !important;
  min-height: 38px;
  background: #fff;
}
:deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px #10b981 inset !important;
}
:deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #10b981 inset, 0 0 0 2px rgba(16, 185, 129, 0.2) inset !important;
}
:deep(.el-select__placeholder) {
  font-size: 14px;
  color: #9ca3af;
}
/* 错误状态（V1.1 errors 触发 border-red-500） */
:deep(.el-input__wrapper.is-error) {
  box-shadow: 0 0 0 1px #ef4444 inset !important;
}
</style>
