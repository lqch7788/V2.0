<template>
  <!-- 物料编辑弹窗 - 对应V1.1 MaterialEditModal.tsx -->
  <el-dialog
    v-model="dialogVisible"
    title="编辑物料库存"
    width="900px"
    :close-on-click-modal="false"
  >
    <div v-if="material && localForm">
      <!-- 条形码标识 -->
      <div class="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-xs text-blue-600 block font-medium">条形码</span>
            <span class="text-2xl font-mono font-bold text-blue-700">{{ material.barcode }}</span>
          </div>
          <el-icon :size="48" class="text-blue-600"><Collection /></el-icon>
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
          <el-input-number
            v-model="localForm.quantity"
            :precision="2"
            :step="1"
            :min="0"
            controls-position="right"
          />
        </div>

        <!-- 单位 -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">单位</label>
          <el-input v-model="localForm.unit" placeholder="请输入单位" />
        </div>

        <!-- 规格型号 -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">规格型号</label>
          <el-input v-model="localForm.specification" placeholder="请输入规格型号" />
        </div>

        <!-- 最低库存 -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">最低库存限值</label>
          <el-input-number
            v-model="localForm.minStock"
            :precision="2"
            :step="1"
            :min="0"
            controls-position="right"
          />
        </div>

        <!-- 最高库存 -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">最高库存限值</label>
          <el-input-number
            v-model="localForm.maxStock"
            :precision="2"
            :step="1"
            :min="0"
            controls-position="right"
          />
        </div>

        <!-- 单价 -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">单价</label>
          <el-input v-model="localForm.price" placeholder="请输入单价" />
        </div>

        <!-- 供应商 -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">供应商</label>
          <el-input v-model="localForm.supplier" placeholder="请输入供应商" />
        </div>

        <!-- 存放位置 -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">存放位置</label>
          <el-input v-model="localForm.location" placeholder="请输入存放位置" />
        </div>

        <!-- 批次号 -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">批次号</label>
          <el-input v-model="localForm.batchNo" placeholder="请输入批次号" />
        </div>

        <!-- 生产日期 -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">生产日期</label>
          <el-date-picker
            v-model="localForm.productionDate"
            type="date"
            placeholder="选择生产日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </div>

        <!-- 过期日期 -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">过期日期</label>
          <el-date-picker
            v-model="localForm.expiryDate"
            type="date"
            placeholder="选择过期日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, watch, reactive } from 'vue'
import { Collection } from '@element-plus/icons-vue'

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

const dialogVisible = computed({
  get: () => props.isOpen,
  set: (val) => {
    if (!val) emit('close')
  }
})

const handleClose = () => {
  emit('close')
}

const handleSave = () => {
  emit('save', { ...localForm })
}
</script>
