<template>
  <el-dialog
    v-model="visible"
    title="新增库存记录"
    width="800px"
    @close="handleClose"
  >
    <el-form :model="formData" label-width="100px" class="max-h-[70vh] overflow-y-auto pr-2">
      <!-- 作物形态 -->
      <el-form-item label="作物形态" required>
        <el-select v-model="formData.stockType" placeholder="选择作物形态" @change="handleStockTypeChange">
          <el-option label="种源" value="seed" />
          <el-option label="种苗" value="seedling" />
          <el-option label="成品" value="product" />
        </el-select>
      </el-form-item>

      <!-- 作物名称和品种 -->
      <el-form-item label="作物名称" required>
        <el-input v-model="formData.cropName" placeholder="如：草莓、番茄、黄瓜" />
      </el-form-item>

      <el-form-item label="品种" required>
        <el-input v-model="formData.variety" placeholder="如：红颜、千禧果" />
      </el-form-item>

      <!-- 产品编码和批次号 -->
      <el-form-item label="产品编码">
        <el-input v-model="formData.productCode" placeholder="自动生成或手动输入" />
      </el-form-item>

      <el-form-item label="批次号">
        <el-input v-model="formData.batchCode" placeholder="系统自动生成" readonly class="bg-gray-50" />
      </el-form-item>

      <!-- 数量和单位 -->
      <el-form-item label="数量" required>
        <el-input-number v-model="formData.quantity" :min="0" placeholder="请输入数量" />
      </el-form-item>

      <el-form-item label="单位">
        <el-select v-model="formData.unit" placeholder="选择单位">
          <el-option label="公斤" value="公斤" />
          <el-option label="粒" value="粒" />
          <el-option label="株" value="株" />
          <el-option label="个" value="个" />
          <el-option label="箱" value="箱" />
        </el-select>
      </el-form-item>

      <!-- 品质等级 -->
      <el-form-item label="品质等级">
        <div class="flex gap-2">
          <el-button
            v-for="g in ['A', 'B', 'C']"
            :key="g"
            :type="formData.grade === g ? 'primary' : 'default'"
            size="small"
            @click="formData.grade = g"
          >
            {{ g }}级
          </el-button>
        </div>
      </el-form-item>

      <!-- 品质评定 -->
      <el-form-item label="品质评定">
        <el-select v-model="formData.quality" placeholder="选择品质">
          <el-option label="优秀" value="excellent" />
          <el-option label="良好" value="good" />
          <el-option label="一般" value="average" />
          <el-option label="较差" value="poor" />
        </el-select>
      </el-form-item>

      <!-- 仓库和存放位置 -->
      <el-form-item label="仓库" required>
        <el-select v-model="formData.warehouseId" placeholder="请选择仓库" @change="handleWarehouseChange">
          <el-option
            v-for="w in filteredWarehouses"
            :key="w.id"
            :label="w.name"
            :value="w.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="存放位置">
        <el-input v-model="formData.storageLocation" placeholder="如：A区-01-01" />
      </el-form-item>

      <!-- 入库时间和保质期 -->
      <el-form-item label="入库日期">
        <el-date-picker
          v-model="formData.storageDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="保质期（天）">
        <el-input-number v-model="formData.expirationDays" :min="1" />
      </el-form-item>

      <!-- 采收日期和过期日期 -->
      <el-form-item label="采收日期">
        <el-date-picker
          v-model="formData.harvestDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="过期日期">
        <el-input v-model="computedExpirationDate" readonly class="bg-gray-50" />
      </el-form-item>

      <!-- 操作人 -->
      <el-form-item label="操作人">
        <el-input v-model="formData.operator" placeholder="默认为系统管理员" />
      </el-form-item>

      <!-- 种植区域和种植模式 -->
      <el-form-item label="种植区域">
        <el-input v-model="formData.greenhouseName" placeholder="如：日光温室1号" />
      </el-form-item>

      <el-form-item label="种植模式">
        <el-select v-model="formData.plantingMode" placeholder="选择种植模式" clearable>
          <el-option label="露天" value="露天" />
          <el-option label="大棚" value="大棚" />
          <el-option label="温室" value="温室" />
          <el-option label="水培" value="水培" />
          <el-option label="基质栽培" value="基质栽培" />
        </el-select>
      </el-form-item>

      <!-- 备注 -->
      <el-form-item label="备注">
        <el-input v-model="formData.remarks" type="textarea" :rows="2" placeholder="可选填写备注信息" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :disabled="!isValid" @click="handleSubmit">确认添加</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useWarehouseStore } from '@/stores/modules/inventory/useWarehouseStore'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'add'])

const warehouseStore = useWarehouseStore()

const visible = computed({
  get: () => props.show,
  set: () => handleClose()
})

// 表单数据
const formData = ref({
  stockType: 'product',
  cropName: '',
  variety: '',
  productCode: '',
  quantity: 0,
  unit: '公斤',
  grade: 'A',
  quality: 'good',
  warehouseId: '',
  warehouseName: '',
  storageLocation: '',
  storageDate: new Date().toISOString().split('T')[0],
  expirationDays: 30,
  harvestDate: new Date().toISOString().split('T')[0],
  batchCode: '',
  greenhouseName: '',
  plantingMode: '',
  operator: '系统管理员',
  remarks: ''
})

// 加载仓库列表
watch(() => props.show, (isOpen) => {
  if (isOpen) {
    if (warehouseStore.warehouses.length === 0) {
      warehouseStore.loadWarehouses()
    }
    generateBatchCode()
    updateDefaultsByStockType()
  }
})

// 根据库存类型过滤仓库
const filteredWarehouses = computed(() => {
  const stockType = formData.value.stockType
  const warehouses = warehouseStore.warehouses

  if (stockType === 'seed') {
    return warehouses.filter(w => w.name.includes('种源') || w.name.includes('常温'))
  } else if (stockType === 'seedling') {
    return warehouses.filter(w => w.name.includes('种苗') || w.name.includes('常温'))
  } else if (stockType === 'product') {
    return warehouses.filter(w => w.name.includes('成品') || w.name.includes('冷库'))
  }
  return warehouses
})

// 库存类型变化时更新默认值
const handleStockTypeChange = () => {
  updateDefaultsByStockType()
  generateBatchCode()
}

// 更新默认值
const updateDefaultsByStockType = () => {
  const stockType = formData.value.stockType

  if (stockType === 'seed') {
    formData.value.unit = '粒'
  } else if (stockType === 'seedling') {
    formData.value.unit = '株'
  } else {
    formData.value.unit = '公斤'
  }

  // 尝试选择对应类型的仓库
  const warehouses = warehouseStore.warehouses
  if (warehouses.length > 0) {
    let targetWarehouse = null
    if (stockType === 'seed') {
      targetWarehouse = warehouses.find(w => w.name.includes('种源')) || warehouses.find(w => w.name.includes('常温'))
    } else if (stockType === 'seedling') {
      targetWarehouse = warehouses.find(w => w.name.includes('种苗')) || warehouses.find(w => w.name.includes('常温'))
    } else {
      targetWarehouse = warehouses.find(w => w.name.includes('成品')) || warehouses.find(w => w.name.includes('冷库'))
    }

    if (targetWarehouse) {
      formData.value.warehouseId = targetWarehouse.id
      formData.value.warehouseName = targetWarehouse.name
    }
  }
}

// 仓库变化时更新仓库名称
const handleWarehouseChange = (id) => {
  const warehouse = warehouseStore.warehouses.find(w => w.id === id)
  if (warehouse) {
    formData.value.warehouseName = warehouse.name
  }
}

// 生成批次号
const generateBatchCode = () => {
  const stockType = formData.value.stockType
  const prefix = stockType === 'seed' ? 'SZ' : stockType === 'seedling' ? 'SM' : 'FQ'
  const year = new Date().getFullYear()
  const ts = String(Date.now() % 10000).padStart(4, '0')
  formData.value.batchCode = `${prefix}${year}-${ts}`
}

// 计算过期日期
const computedExpirationDate = computed(() => {
  if (!formData.value.storageDate || !formData.value.expirationDays) return '-'
  const date = new Date(formData.value.storageDate)
  date.setDate(date.getDate() + formData.value.expirationDays)
  return date.toISOString().split('T')[0]
})

// 生成业务ID
const generateBusinessId = (stockType) => {
  const prefix = stockType === 'seed' ? 'SR' : stockType === 'seedling' ? 'SL' : 'H'
  const ts = String(Date.now() % 100000).padStart(5, '0')
  return `${prefix}${ts}`
}

// 验证
const isValid = computed(() => {
  return formData.value.cropName && formData.value.variety && formData.value.warehouseId && formData.value.quantity > 0
})

// 重置表单
const resetForm = () => {
  formData.value = {
    stockType: 'product',
    cropName: '',
    variety: '',
    productCode: '',
    quantity: 0,
    unit: '公斤',
    grade: 'A',
    quality: 'good',
    warehouseId: '',
    warehouseName: '',
    storageLocation: '',
    storageDate: new Date().toISOString().split('T')[0],
    expirationDays: 30,
    harvestDate: new Date().toISOString().split('T')[0],
    batchCode: '',
    greenhouseName: '',
    plantingMode: '',
    operator: '系统管理员',
    remarks: ''
  }
}

// 提交表单
const handleSubmit = () => {
  if (!isValid.value) return

  const newRecord = {
    harvestRecordId: generateBusinessId(formData.value.stockType),
    productCode: formData.value.productCode || `XX${Date.now()}`.slice(-8),
    cropName: formData.value.cropName,
    variety: formData.value.variety,
    stockType: formData.value.stockType,
    quantity: formData.value.quantity,
    unit: formData.value.unit,
    grade: formData.value.grade,
    quality: formData.value.quality,
    warehouseId: formData.value.warehouseId,
    warehouseName: formData.value.warehouseName,
    storageLocation: formData.value.storageLocation,
    harvestDate: formData.value.harvestDate,
    storageDate: formData.value.storageDate,
    expirationDate: computedExpirationDate.value,
    alertSettings: {
      enableStorageTimeAlert: true,
      storageTimeThreshold: Math.floor(formData.value.expirationDays * 0.8),
      enableQuantityAlert: true,
      minQuantityThreshold: Math.floor(formData.value.quantity * 0.3),
      maxQuantityThreshold: Math.floor(formData.value.quantity * 1.5),
      minStock: Math.floor(formData.value.quantity * 0.3),
      maxStock: Math.floor(formData.value.quantity * 1.5),
      expirationDays: formData.value.expirationDays
    },
    batchCode: formData.value.batchCode,
    greenhouseName: formData.value.greenhouseName,
    plantingMode: formData.value.plantingMode,
    status: 'in_stock',
    inboundRecords: [
      {
        id: `IT${Date.now()}`.slice(-8),
        type: 'inbound',
        quantity: formData.value.quantity,
        date: formData.value.storageDate,
        operator: formData.value.operator || '系统管理员',
        remarks: formData.value.remarks || '新增入库'
      }
    ],
    outboundRecords: []
  }

  emit('add', newRecord)
  resetForm()
  handleClose()
}

// 关闭弹窗
const handleClose = () => {
  resetForm()
  emit('close')
}
</script>
