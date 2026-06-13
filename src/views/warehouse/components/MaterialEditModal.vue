<template>
  <!-- 物料编辑弹窗 - 对应V1.1 MaterialEditModal.tsx -->
  <ElModal
    :model-value="isOpen"
    title="编辑物料库存"
    :width="900"
    :height="650"
    :show-footer="true"
    :show-submit="false"
    :show-cancel="false"
    @update:model-value="(v) => { if (!v) $emit('close') }"
    @close="$emit('close')"
  >
    <div class="overflow-y-auto">
      <div v-if="material && localForm">
        <!-- 条形码标识 -->
        <div class="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs text-blue-600 block font-medium">条形码</span>
              <span class="text-2xl font-mono font-bold text-blue-700">{{ material.barcode }}</span>
            </div>
            <PackageOpen :size="48" class="text-blue-600" />
          </div>
        </div>

        <!-- 只读信息 -->
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

        <!-- 可编辑字段 -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <!-- 当前库存 -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">当前库存</label>
            <input
              v-model.number="localForm.quantity"
              type="number"
              step="0.01"
              min="0"
              class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm"
            />
          </div>

          <!-- 单位 -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">单位</label>
            <input
              v-model="localForm.unit"
              placeholder="请输入单位"
              class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm"
            />
          </div>

          <!-- 规格型号 -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">规格型号</label>
            <input
              v-model="localForm.specification"
              placeholder="请输入规格型号"
              class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm"
            />
          </div>

          <!-- 最低库存 -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">最低库存限值</label>
            <input
              v-model.number="localForm.minStock"
              type="number"
              step="0.01"
              min="0"
              class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm"
            />
          </div>

          <!-- 最高库存 -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">最高库存限值</label>
            <input
              v-model.number="localForm.maxStock"
              type="number"
              step="0.01"
              min="0"
              class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm"
            />
          </div>

          <!-- 单价 -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">单价</label>
            <input
              v-model="localForm.price"
              placeholder="请输入单价"
              class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm"
            />
          </div>

          <!-- 供应商 -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">供应商</label>
            <input
              v-model="localForm.supplier"
              placeholder="请输入供应商"
              class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm"
            />
          </div>

          <!-- 存放位置 -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">存放位置</label>
            <input
              v-model="localForm.location"
              placeholder="请输入存放位置"
              class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm"
            />
          </div>

          <!-- 批次号 -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">批次号</label>
            <input
              v-model="localForm.batchNo"
              placeholder="请输入批次号"
              class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm"
            />
          </div>

          <!-- 生产日期 -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">生产日期</label>
            <input
              v-model="localForm.productionDate"
              type="date"
              class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm"
            />
          </div>

          <!-- 过期日期 -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">过期日期</label>
            <input
              v-model="localForm.expiryDate"
              type="date"
              class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button size="small" @click="$emit('close')">取消</el-button>
      <el-button type="primary" size="small" @click="handleSave">保存</el-button>
    </template>
  </ElModal>
</template>

<script setup>
import { watch, reactive } from 'vue'
import { PackageOpen } from 'lucide-vue-next'
import { ElModal } from '@/components/ui'

/**
 * 物料编辑弹窗组件
 * 提供单个物料的编辑功能
 */

const props = defineProps({
  // 物料数据
  material: {
    type: Object,
    default: null
  },
  // 是否显示
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save'])

// 本地表单状态
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

// 监听 material 变化，初始化表单
watch(() => props.material, (newVal) => {
  if (newVal) {
    Object.assign(localForm, { ...newVal })
  }
}, { immediate: true, deep: true })

const handleSave = () => {
  emit('save', { ...localForm })
}
</script>
