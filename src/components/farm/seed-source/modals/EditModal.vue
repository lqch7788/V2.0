<template>
  <!-- 纯div自定义弹窗 -->
  <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center">
    <!-- 遮罩层 -->
    <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>

    <!-- 弹窗内容 -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
      <!-- 头部 -->
      <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold" style="color: white;">编辑种源</h3>
        <el-button link @click="handleClose" style="color: white;">
          <el-icon :size="20"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto p-6">
        <el-form :model="form" label-width="100px" ref="formRef">
          <!-- 种源批号 -->
          <el-form-item label="种源批号">
            <el-input v-model="form.seedCode" disabled class="bg-gray-50" />
          </el-form-item>

          <!-- 种源类型 -->
          <el-form-item label="种源类型">
            <el-select v-model="form.sourceType" placeholder="请选择" class="w-full">
              <el-option label="种子" value="seed" />
              <el-option label="种苗/实生苗" value="seedling" />
              <el-option label="扦插苗" value="cutting" />
              <el-option label="嫁接苗" value="grafting" />
              <el-option label="组培苗" value="tissue_culture" />
              <el-option label="分株苗" value="split" />
              <el-option label="种球/球根" value="bulb" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>

          <!-- 来源途径 -->
          <el-form-item label="来源途径">
            <el-select v-model="form.sourceOrigin" placeholder="请选择" class="w-full">
              <el-option label="外部采购" value="external_purchase" />
              <el-option label="自产" value="self_produced" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>

          <!-- 作物类别 -->
          <el-form-item label="作物类别">
            <el-select v-model="form.cropCategory" placeholder="请选择" class="w-full">
              <el-option v-for="item in cropCategories" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>

          <!-- 作物名称 -->
          <el-form-item label="作物名称">
            <el-input v-model="form.cropName" placeholder="请输入" />
          </el-form-item>

          <!-- 作物品种 -->
          <el-form-item label="作物品种">
            <el-input v-model="form.cropVariety" placeholder="请输入" />
          </el-form-item>

          <!-- 供应商 -->
          <el-form-item label="供应商">
            <el-select v-model="form.supplierId" placeholder="请选择" class="w-full" filterable>
              <el-option v-for="item in suppliers" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>

          <!-- 采购/入库日期 -->
          <el-form-item label="采购日期">
            <el-date-picker
              v-model="form.purchaseDate"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
          </el-form-item>

          <!-- 登记数量 -->
          <el-form-item label="登记数量">
            <div class="flex gap-2 w-full">
              <el-input-number v-model="form.quantity" :min="0" class="flex-1" />
              <el-select v-model="form.unit" placeholder="单位" class="w-32">
                <el-option label="粒" value="粒" />
                <el-option label="株" value="株" />
                <el-option label="kg" value="kg" />
                <el-option label="g" value="g" />
                <el-option label="袋" value="袋" />
              </el-select>
            </div>
          </el-form-item>

          <!-- 单价 -->
          <el-form-item label="单价（元）">
            <el-input-number v-model="form.unitPrice" :min="0" :precision="2" class="w-full" />
          </el-form-item>

          <!-- 备注 -->
          <el-form-item label="备注">
            <el-input v-model="form.remarks" type="textarea" :rows="3" placeholder="请输入备注信息" />
          </el-form-item>
        </el-form>
      </div>

      <!-- 底部按钮 -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import { useSeedSourceStore } from '@/stores'

const props = defineProps({
  visible: Boolean,
  record: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'success'])

const seedSourceStore = useSeedSourceStore()

const formRef = ref()
const submitting = ref(false)

const cropCategories = ['蔬菜类', '茄果类', '瓜类', '叶菜类', '豆类', '根茎类', '水果类', '花卉类']

const suppliers = ref([
  { id: 'S001', name: '寿光种业', code: 'SGZY', contact: '张经理' },
  { id: 'S002', name: '农科院种业', code: 'NKKY', contact: '李经理' },
  { id: 'S003', name: '山东蔬菜研究所', code: 'SSSC', contact: '王经理' }
])

const form = ref({
  seedCode: '',
  sourceType: 'seed',
  sourceOrigin: 'external_purchase',
  cropCategory: '',
  typeName: '',
  varietyName: '',
  cropName: '',
  cropVariety: '',
  cropCode: '',
  supplierId: '',
  supplierName: '',
  purchaseDate: '',
  quantity: 0,
  unit: '粒',
  unitPrice: 0,
  pictures: [],
  remarks: '',
  status: 'sufficient'
})

// 监听 visible 和 record 变化
watch(() => props.visible, (val) => {
  if (val && props.record) {
    form.value = {
      seedCode: props.record.seedCode || '',
      sourceType: props.record.sourceType || 'seed',
      sourceOrigin: props.record.sourceOrigin || 'external_purchase',
      cropCategory: props.record.cropCategory || '',
      typeName: props.record.typeName || '',
      varietyName: props.record.varietyName || '',
      cropName: props.record.cropName || '',
      cropVariety: props.record.cropVariety || '',
      cropCode: props.record.cropCode || '',
      supplierId: props.record.supplierId || '',
      supplierName: props.record.supplierName || '',
      purchaseDate: props.record.purchaseDate || '',
      quantity: props.record.quantity || 0,
      unit: props.record.unit || '粒',
      unitPrice: props.record.unitPrice || 0,
      pictures: props.record.pictures || [],
      remarks: props.record.remarks || '',
      status: props.record.status || 'sufficient'
    }
  }
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!form.value.cropCategory || !form.value.cropName) {
    ElMessage.warning('请填写必填项')
    return
  }

  submitting.value = true
  try {
    // 计算总金额
    const totalAmount = (form.value.quantity || 0) * (form.value.unitPrice || 0)

    // 判断库存状态
    let status = form.value.status
    if (form.value.quantity === 0) {
      status = 'depleted'
    } else if (form.value.quantity < (props.record.initialCount || 0) * 0.2) {
      status = 'low'
    } else {
      status = 'sufficient'
    }

    // 获取供应商名称
    const supplier = suppliers.value.find(s => s.id === form.value.supplierId)
    const supplierName = supplier?.name || form.value.supplierName || ''

    await seedSourceStore.updateItem(props.record.id, {
      ...form.value,
      supplierName,
      totalAmount,
      status
    })
    ElMessage.success('更新成功')
    emit('success')
    handleClose()
  } catch {
    ElMessage.error('更新失败')
  } finally {
    submitting.value = false
  }
}
</script>
