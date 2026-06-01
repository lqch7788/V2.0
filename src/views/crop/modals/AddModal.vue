<template>
  <!-- 新增订单弹窗组件 - V1.1样式（纯div自定义弹窗） -->
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="handleClose">
      <div
        id="order-add-dialog"
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

        <!-- 头部 — 绿色渐变（与 V1.1 Modal.tsx L265 from-emerald-500 via-emerald-600 to-emerald-500 三色渐变一致） -->
        <div
          class="px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 flex items-center justify-between rounded-t-xl cursor-move flex-shrink-0"
          @mousedown="handleDragStart"
        >
          <h3 class="text-lg font-semibold text-white flex items-center gap-2 select-none">
            新增订单
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
              <div class="flex gap-2">
                <el-input v-model="form.orderCode" placeholder="点击生成获取编号" class="flex-1" />
                <el-button type="primary" size="small" @click="generateOrderCode">生成</el-button>
              </div>
              <p v-if="errors.orderCode" class="text-xs text-red-500 mt-1">{{ errors.orderCode }}</p>
            </div>

            <!-- 订单名称 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">订单名称 <span class="text-red-500">*</span></label>
              <el-input v-model="form.orderName" placeholder="请输入订单名称" />
              <p v-if="errors.orderName" class="text-xs text-red-500 mt-1">{{ errors.orderName }}</p>
            </div>

            <!-- 订单类型（与 V1.1 AddModal.tsx L258-265 一致：动态渲染 orderTypeOptions） -->
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

            <!-- 创建人（与V1.1 AddModal L278-286 自动填充一致 - 改用 useUserStore） -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">创建人</label>
              <el-input :model-value="currentUsername" disabled class="bg-gray-50 text-gray-600" />
            </div>

            <!-- 作物品种 - 使用 CropCodeSelector（与V1.1 AddModal.tsx L289-314 完全一致） -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1"><span class="text-red-500">*</span> 作物选择</label>
              <CropCodeSelector
                v-model="form.cropCode"
                placeholder="搜索或选择作物品种..."
                size="md"
                show-full-path
                @change="handleCropChange"
              />
              <div v-if="selectedCrop" class="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                <div class="text-emerald-700 flex items-center gap-1">
                  <el-icon class="w-3 h-3 flex-shrink-0"><Leaf /></el-icon>
                  {{ selectedCrop.categoryName }} > {{ selectedCrop.typeName }} > {{ selectedCrop.varietyName }}
                  <template v-if="selectedCrop.subVariety1Name"> > {{ selectedCrop.subVariety1Name }}</template>
                </div>
                <div class="text-emerald-600 mt-0.5">
                  编码：{{ selectedCrop.cropCode }}
                </div>
              </div>
              <p v-if="errors.cropVariety" class="text-xs text-red-500 mt-1">{{ errors.cropVariety }}</p>
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

            <!-- 完成数量（与V1.1 L353-365 标签一致："完成数量"不是"实际数量"） -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">完成数量</label>
              <el-input-number v-model="form.completedQuantity" :min="0" placeholder="请输入完成数量" class="w-full" />
            </div>

            <!-- 客户下拉（与V1.1 AddModal.tsx L367-396 客户下拉选择器一致） -->
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
                value-format="YYYY-MM-DD"
                class="w-full"
              />
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
          <el-button type="primary" size="small" @click="handleSubmit">确认创建</el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { Plus, Close, FullScreen, ScaleToOriginal } from '@element-plus/icons-vue'
import { useOrderDataStore } from '@/stores/modules/orderData'
import { useCustomerStore } from '@/stores/modules/customer'
import { useUserStore } from '@/stores/modules/user'
import { showAlert } from '@/lib/dialogService'
import CropCodeSelector from '@/components/crop/CropCodeSelector.vue'
import { Leaf } from 'lucide-vue-next'

const props = defineProps({
  isOpen: Boolean,
  orderTypeOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'success'])

const orderDataStore = useOrderDataStore()
const customerStore = useCustomerStore()
const userStore = useUserStore()

// 当前登录用户名（V2.0 第6轮 P0 修复：改用 useUserStore 替代直接 localStorage 读，与 V1.1 AddModal.tsx L91 useAuthStore 一致）
const currentUsername = computed(() => {
  return userStore.userInfo?.username
    || userStore.userInfo?.name
    || JSON.parse(localStorage.getItem('currentUser') || '{}').username
    || '未知用户'
})

// 客户下拉选项（与 V1.1 AddModal.tsx L391 一致）
const customerOptions = computed(() => customerStore.customers || [])

// 客户选择变更时自动填充电话/地址（与 V1.1 AddModal.tsx L375-384 一致 + 容错）
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

// 表单数据（与V1.1 AddModal.tsx L50-67 一致 - 不含 supplierName）
const form = ref({
  orderCode: '',
  orderName: '',
  orderType: 'production',
  cropCode: '',
  cropCategory: '',
  cropVariety: '',
  plannedQuantity: 0,
  completedQuantity: 0,
  unit: '株',
  customerId: '',
  customerName: '',
  customerPhone: '',
  deliveryAddress: '',
  orderDate: new Date().toISOString().slice(0, 10),
  expectedCompletionDate: '',
  remarks: ''
})

// 选中的作物品种详情
const selectedCrop = ref(null)

// 作物品种选择回调（修复轮 8 P0-I1-5：选中后清 errors.cropVariety 红字）
const handleCropChange = (code, varietyInfo) => {
  form.value.cropCode = code
  selectedCrop.value = varietyInfo
  if (varietyInfo) {
    // 构建完整路径
    const fullPath = [
      varietyInfo.categoryName,
      varietyInfo.typeName,
      varietyInfo.varietyName,
      varietyInfo.subVariety1Name,
    ].filter(Boolean).join(' > ')
    // 取最细化的品种名称
    const cropName = varietyInfo.subVariety1Name || varietyInfo.varietyName
    form.value.cropVariety = cropName
    form.value.cropCategory = fullPath
    // 清除错误（与 V1.1 L113 setErrors(prev => ({ ...prev, cropVariety: '' })) 一致）
    errors.value = { ...errors.value, cropVariety: '' }
  } else {
    form.value.cropVariety = ''
    form.value.cropCategory = ''
  }
}

// 错误信息
const errors = ref({})

// 生成订单编号
const generateOrderCode = () => {
  const now = new Date()
  const year = now.getFullYear().toString()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const timestampStr = `${year}${month}${day}`
  form.value.orderCode = `DD${timestampStr}0001`
}

// 监听打开
watch(() => props.isOpen, (val) => {
  if (val) {
    // 加载客户列表（与 V1.1 AddModal.tsx L86 一致）
    if (customerStore.fetchCustomers) {
      customerStore.fetchCustomers()
    }
    // 重置表单（与V1.1 AddModal.tsx L173-189 一致 - 不含 supplierName）
    form.value = {
      orderCode: generateOrderCode(),  // 与 V1.1 AddModal.tsx L78 useEffect 自动设置一致
      orderName: '',
      orderType: 'production',
      cropCode: '',
      cropCategory: '',
      cropVariety: '',
      plannedQuantity: 0,
      completedQuantity: 0,
      unit: '株',
      customerId: '',
      customerName: '',
      customerPhone: '',
      deliveryAddress: '',
      orderDate: new Date().toISOString().slice(0, 10),
      expectedCompletionDate: '',
      remarks: ''
    }
    selectedCrop.value = null
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
  const dialog = document.getElementById('order-add-dialog')
  if (dialog) {
    const rect = dialog.getBoundingClientRect()
    dragStart.value = { x: e.clientX, y: e.clientY, left: rect.left, top: rect.top }
  }
}

// 拖动中（V2.0 第5轮 P0 修复：addEventListener 提取为具名函数 + onUnmounted 清理防内存泄漏）
let moveHandler = null
let upHandler = null
watch(isDragging, (val) => {
  if (val) {
    moveHandler = (e) => {
      if (!isDragging.value) return
      const deltaX = e.clientX - dragStart.value.x
      const deltaY = e.clientY - dragStart.value.y
      const dialog = document.getElementById('order-add-dialog')
      if (dialog) {
        dialog.style.position = 'fixed'
        dialog.style.left = `${dragStart.value.left + deltaX}px`
        dialog.style.top = `${dragStart.value.top + deltaY}px`
        dialog.style.margin = '0'
      }
    }
    upHandler = () => {
      isDragging.value = false
    }
    document.addEventListener('mousemove', moveHandler)
    document.addEventListener('mouseup', upHandler)
  } else if (moveHandler) {
    document.removeEventListener('mousemove', moveHandler)
    document.removeEventListener('mouseup', upHandler)
    moveHandler = null
    upHandler = null
  }
})

// 缩放开始
const handleResizeStart = (e) => {
  if (isMaximized.value) return
  e.preventDefault()
  e.stopPropagation()
  isResizing.value = true
  const dialog = document.getElementById('order-add-dialog')
  resizeStart.value = {
    x: e.clientX,
    y: e.clientY,
    width: dialog?.clientWidth || 0,
    height: dialog?.clientHeight || 0,
  }
}

// 缩放中（V2.0 第5轮 P0 修复：addEventListener 提取为具名函数 + onUnmounted 清理防内存泄漏）
let resizeMoveHandler = null
let resizeUpHandler = null
watch(isResizing, (val) => {
  if (val) {
    resizeMoveHandler = (e) => {
      if (!isResizing.value) return
      const deltaX = e.clientX - resizeStart.value.x
      const deltaY = e.clientY - resizeStart.value.y
      const newWidth = Math.max(640, resizeStart.value.width + deltaX)
      const newHeight = Math.max(400, resizeStart.value.height + deltaY)
      const dialog = document.getElementById('order-add-dialog')
      if (dialog) {
        dialog.style.width = `${newWidth}px`
        dialog.style.maxWidth = 'none'
        dialog.style.height = `${newHeight}px`
        dialog.style.maxHeight = 'none'
      }
    }
    resizeUpHandler = () => {
      isResizing.value = false
    }
    document.addEventListener('mousemove', resizeMoveHandler)
    document.addEventListener('mouseup', resizeUpHandler)
  } else if (resizeMoveHandler) {
    document.removeEventListener('mousemove', resizeMoveHandler)
    document.removeEventListener('mouseup', resizeUpHandler)
    resizeMoveHandler = null
    resizeUpHandler = null
  }
})

// 最大化/还原
const toggleMaximize = () => {
  const dialog = document.getElementById('order-add-dialog')
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

// 关闭（V2.0 第5轮 P0 修复：清理拖动/缩放监听器）
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
  emit('close')
}

// ESC 键关闭弹窗（V2.0 第5轮 P0 修复 - 与 V1.1 Modal.tsx L97-105 行为一致）
const handleEscKey = (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    handleClose()
  }
}
onMounted(() => document.addEventListener('keydown', handleEscKey))
onUnmounted(() => document.removeEventListener('keydown', handleEscKey))

// 提交
const handleSubmit = async () => {
  // 验证（与 V1.1 AddModal.tsx L122-129 一致 - 4 项校验）
  errors.value = {}
  if (!form.value.orderCode) errors.value.orderCode = '请输入订单编号'
  if (!form.value.orderName) errors.value.orderName = '请输入订单名称'
  if (!form.value.cropVariety) errors.value.cropVariety = '请选择作物品种'
  if (form.value.plannedQuantity <= 0) errors.value.plannedQuantity = '请输入计划数量'

  if (Object.keys(errors.value).length > 0) return

  try {
    const newOrder = {
      orderCode: form.value.orderCode || `DD${Date.now()}`,
      orderName: form.value.orderName,
      orderType: form.value.orderType,
      cropCategory: form.value.cropCategory,
      cropName: '',
      cropVariety: form.value.cropVariety,
      plannedQuantity: form.value.plannedQuantity,
      completedQuantity: form.value.completedQuantity,
      unit: form.value.unit,
      orderDate: form.value.orderDate,
      expectedCompletionDate: form.value.expectedCompletionDate,
      status: 'planned',
      createBy: currentUsername.value,
      remarks: form.value.remarks,
      // 客户相关字段（与 V1.1 types/crop.ts CropOrder 完全一致 + customerName 容错 P0-EX-1）
      customerId: form.value.customerId || undefined,
      customerName: form.value.customerName || '',
      customerPhone: form.value.customerPhone,
      deliveryAddress: form.value.deliveryAddress,
      // 关联字段（V1.1 L604）
      instanceIds: [],
    }

    await orderDataStore.addOrder(newOrder)
    emit('success')
    handleClose()
  } catch (error) {
    console.error('创建订单失败:', error)
    await showAlert('创建订单失败，请重试')
  }
}
</script>

<style scoped>
/* V1.1 inputDeepClass 全局样式（修复轮 6 P0-001~007 inputDeepClass 缺失 22 处）
   V1.1 AddModal L199 定义：
   px-4 py-3 border border-gray-400 rounded-lg text-sm
   focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner
   通过 :deep 选择器全局覆盖 Element Plus 默认 el-input/select/textarea 样式 */
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
/* 错误状态（V1.1 errors.orderCode 触发 border-red-500） */
:deep(.el-input__wrapper.is-error) {
  box-shadow: 0 0 0 1px #ef4444 inset !important;
}
</style>
