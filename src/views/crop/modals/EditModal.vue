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
                  class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
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

            <!-- 完成数量（与V1.1一致） -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">完成数量</label>
              <el-input-number v-model="form.completedQuantity" :min="0" class="w-full" />
            </div>

            <!-- 客户名称 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">客户名称</label>
              <el-input v-model="form.customerName" placeholder="请输入客户名称" />
            </div>

            <!-- 客户电话 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">客户电话</label>
              <el-input v-model="form.customerPhone" placeholder="请输入客户电话" />
            </div>

            <!-- 供应商 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
              <el-input v-model="form.supplierName" placeholder="请输入供应商名称" />
            </div>

            <!-- 收货地址 -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">收货地址</label>
              <el-input v-model="form.deliveryAddress" placeholder="请输入收货地址" />
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

            <!-- 订单状态 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">订单状态</label>
              <el-select v-model="form.orderStatus" placeholder="请选择" class="w-full">
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
import { ref, watch, computed } from 'vue'
import { Edit, Close, FullScreen, ScaleToOriginal } from '@element-plus/icons-vue'
import { Search, X } from 'lucide-vue-next'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrderDataStore } from '@/stores/modules/orderData'
import { CropOrderStatus } from '@/types/crop'
import { initVarieties, getVarietyOptions } from '@/services/cropVarietyService'

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
  completedQuantity: 0,
  unit: '株',
  supplierName: '',
  customerName: '',
  customerPhone: '',
  deliveryAddress: '',
  orderDate: '',
  expectedHarvestDate: '',
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

// 监听打开和记录变化
watch(() => props.isOpen, (val) => {
  if (val && props.record) {
    // 如果订单已完成或已取消，禁止编辑
    if (props.record.status === CropOrderStatus.COMPLETED || props.record.status === CropOrderStatus.CANCELLED) {
      const msg = props.record.status === CropOrderStatus.COMPLETED ? '已完成' : '已取消'
      ElMessage.warning(`该订单已${msg}，无法编辑`)
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
      completedQuantity: props.record.completedQuantity || 0,
      unit: props.record.unit || '株',
      supplierName: props.record.supplierName || '',
      customerName: props.record.customerName || '',
      customerPhone: props.record.customerPhone || '',
      deliveryAddress: props.record.deliveryAddress || '',
      orderDate: props.record.orderDate || '',
      expectedHarvestDate: props.record.expectedHarvestDate || '',
      remarks: props.record.remarks || '',
      orderStatus: props.record.status === CropOrderStatus.COMPLETED
        ? 'completed'
        : props.record.status === CropOrderStatus.CANCELLED
        ? 'cancelled'
        : 'in_progress'
    }
    searchKeyword.value = props.record.cropVariety || ''
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
  // 如果订单已完成或已取消，禁止编辑
  if (props.record && (props.record.status === CropOrderStatus.COMPLETED || props.record.status === CropOrderStatus.CANCELLED)) {
    const msg = props.record.status === CropOrderStatus.COMPLETED ? '已完成' : '已取消'
    ElMessage.warning(`该订单已${msg}，无法编辑`)
    return
  }

  // 如果选择"已完成"或"已取消"，弹出确认警告
  if (form.value.orderStatus === 'completed') {
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
  if (form.value.orderStatus === 'cancelled') {
    try {
      await ElMessageBox.confirm(
        '⚠️ 重要提示：\n\n' +
        '确认取消该订单吗？\n\n' +
        '取消后该订单将无法操作：\n' +
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
      expectedHarvestDate: form.value.expectedHarvestDate || undefined,
      cropCategory: form.value.cropCategory,
      cropName: '',
      cropVariety: form.value.cropVariety,
      plannedQuantity: form.value.plannedQuantity,
      completedQuantity: form.value.completedQuantity,
      unit: form.value.unit,
      supplierName: form.value.supplierName,
      customerName: form.value.customerName,
      customerPhone: form.value.customerPhone,
      deliveryAddress: form.value.deliveryAddress,
      remarks: form.value.remarks,
      status: finalStatus
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
