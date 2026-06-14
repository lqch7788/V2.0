<template>
  <!--
    物料编辑弹窗 - 严格 1:1 对齐 V1.1 MaterialEditModal.tsx
    V1.1: <UnifiedModal title="编辑物料库存" size="xl" (900x600) showFooter=true onSubmit=handleSubmit submitText="保存" cancelText="取消">
    V1.1 未传 showMaximize/enableDrag/enableResize → UnifiedModal 默认全是 true
    V1.1 UnfiedModal 默认 closeOnClickModal=false（用户点遮罩不关闭）
  -->
  <ElModal
    :model-value="isOpen"
    title="编辑物料库存"
    :width="900"
    :height="600"
    :show-footer="true"
    :show-submit="true"
    :show-cancel="true"
    :close-on-click-modal="false"
    submit-text="保存"
    cancel-text="取消"
    @update:model-value="(v) => { if (!v) handleClose() }"
    @close="handleClose"
    @submit="handleSave"
  >
    <div v-if="material && localForm" class="overflow-y-auto">
      <!-- 1. 条形码标识 - 对应V1.1: bg-blue-50 / blue-200 border -->
      <div class="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-xs text-blue-600 block font-medium">条形码</span>
            <span class="text-2xl font-mono font-bold text-blue-700">{{ material.barcode }}</span>
          </div>
          <Barcode class="w-12 h-12 text-blue-600" />
        </div>
      </div>

      <!-- 2. 只读信息 - 对应V1.1: bg-gray-50 + 4列(物料编码/名称/分类/最后更新) -->
      <div class="bg-gray-50 rounded-lg p-4 mb-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span class="text-xs text-gray-500 block">物料编码</span>
            <span class="text-sm font-medium text-gray-900">{{ material.code }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">物料名称</span>
            <span class="text-sm font-medium text-gray-900">{{ material.name }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">物料分类</span>
            <span class="text-sm font-medium text-gray-900">{{ material.category }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">最后更新</span>
            <span class="text-sm font-medium text-gray-900">{{ material.lastUpdateTime || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 3. 可编辑字段 - 对应V1.1: grid-cols-2 md:grid-cols-3 gap-4 紧凑输入 -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <!-- 3.1 当前库存 - NumberInput h-8 px-2 -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">当前库存</label>
          <input
            v-model.number="localForm.quantity"
            type="number"
            step="0.01"
            min="0"
            class="h-8 px-2 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
          />
        </div>

        <!-- 3.2 单位 - Input deepInputClass py-1.5 -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">单位</label>
          <input
            v-model="localForm.unit"
            type="text"
            class="w-full px-4 py-1.5 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
          />
        </div>

        <!-- 3.3 规格型号 - Input py-1.5 -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">规格型号</label>
          <input
            v-model="localForm.specification"
            type="text"
            class="w-full px-4 py-1.5 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
          />
        </div>

        <!-- 3.4 最低库存限值 - NumberInput h-8 px-2 -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">最低库存限值</label>
          <input
            v-model.number="localForm.minStock"
            type="number"
            step="0.01"
            min="0"
            class="h-8 px-2 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
          />
        </div>

        <!-- 3.5 最高库存限值 - NumberInput h-8 px-2 -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">最高库存限值</label>
          <input
            v-model.number="localForm.maxStock"
            type="number"
            step="0.01"
            min="0"
            class="h-8 px-2 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
          />
        </div>

        <!-- 3.6 单价 - Input py-1.5 -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">单价</label>
          <input
            v-model="localForm.price"
            type="text"
            class="w-full px-4 py-1.5 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
          />
        </div>

        <!-- 3.7 供应商 - Input py-1.5 -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">供应商</label>
          <input
            v-model="localForm.supplier"
            type="text"
            class="w-full px-4 py-1.5 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
          />
        </div>

        <!-- 3.8 存放位置 - Input py-1.5 -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">存放位置</label>
          <input
            v-model="localForm.location"
            type="text"
            class="w-full px-4 py-1.5 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
          />
        </div>

        <!-- 3.9 批次号 - Input py-1.5 -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">批次号</label>
          <input
            v-model="localForm.batchNo"
            type="text"
            class="w-full px-4 py-1.5 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
          />
        </div>

        <!-- 3.10 生产日期 - DatePicker -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">生产日期</label>
          <input
            v-model="localForm.productionDate"
            type="date"
            class="w-full px-4 py-1.5 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
          />
        </div>

        <!-- 3.11 过期日期 - DatePicker -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">过期日期</label>
          <input
            v-model="localForm.expiryDate"
            type="date"
            class="w-full px-4 py-1.5 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
          />
        </div>
      </div>
    </div>
  </ElModal>
</template>

<script setup>
/**
 * 物料编辑弹窗组件
 * 严格 1:1 对齐 V1.1 MaterialEditModal.tsx
 * - 容器: ElModal (默认行为继承 UnifiedModal 默认 size=xl 900x600)
 * - 头部: 蓝底条形码块 + 4列只读信息 + 3列可编辑字段
 * - 11 个可编辑字段顺序: 库存→单位→规格→最低→最高→单价→供应商→位置→批次→生产日期→过期日期
 * - 数字字段: h-8 px-2 紧凑;文本字段: px-4 py-1.5
 * - 提交: ElModal 内置 footer(取消+保存),@submit=handleSave
 */
import { watch, reactive } from 'vue'
import { Barcode } from 'lucide-vue-next'
import { ElModal } from '@/components/ui'

const props = defineProps({
  // V1.1: material: Material | null
  material: {
    type: Object,
    default: null
  },
  // V1.1: isOpen: boolean
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save'])

// V1.1: useState<Material|null> + useEffect 同步
const localForm = reactive({
  id: null,
  code: '',
  name: '',
  category: '',
  specification: '',
  unit: '',
  quantity: 0,
  minStock: 0,
  maxStock: 0,
  price: '',
  supplier: '',
  location: '',
  barcode: '',
  batchNo: '',
  productionDate: '',
  expiryDate: '',
  lastUpdateTime: '',
  dataStatus: ''
})

// V1.1: useEffect(() => { if (material) setForm({ ...material }) }, [material])
watch(() => props.material, (newVal) => {
  if (newVal) {
    Object.assign(localForm, { ...newVal })
  }
}, { immediate: true, deep: true })

// V1.1: onClose
const handleClose = () => {
  emit('close')
}

// V1.1: handleSubmit -> onSave(form)
const handleSave = () => {
  emit('save', { ...localForm })
}
</script>
