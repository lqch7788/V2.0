<template>
  <el-dialog
    :model-value="visible"
    title="新增种源"
    width="600px"
    @close="handleClose"
  >
    <el-form :model="form" label-width="100px" ref="formRef">
      <el-form-item label="种源批号" required>
        <el-input v-model="form.seedCode" placeholder="系统自动生成" disabled />
      </el-form-item>
      <el-form-item label="种源类型" required>
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
      <el-form-item label="作物类别" required>
        <el-select v-model="form.cropCategory" placeholder="请选择" class="w-full">
          <el-option v-for="item in cropCategories" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="作物名称" required>
        <el-input v-model="form.cropName" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="作物品种">
        <el-input v-model="form.cropVariety" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="供应商" required>
        <el-select v-model="form.supplierName" placeholder="请选择" class="w-full">
          <el-option v-for="item in suppliers" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="采购日期" required>
        <el-date-picker
          v-model="form.purchaseDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          class="w-full"
        />
      </el-form-item>
      <el-form-item label="采购数量" required>
        <el-input-number v-model="form.quantity" :min="0" class="w-full" />
      </el-form-item>
      <el-form-item label="单位" required>
        <el-select v-model="form.unit" placeholder="请选择" class="w-full">
          <el-option label="粒" value="粒" />
          <el-option label="株" value="株" />
          <el-option label="kg" value="kg" />
          <el-option label="g" value="g" />
        </el-select>
      </el-form-item>
      <el-form-item label="单价(元)">
        <el-input-number v-model="form.unitPrice" :min="0" :precision="2" class="w-full" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remarks" type="textarea" :rows="3" placeholder="请输入" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useSeedSourceStore } from '@/stores'
import {  SeedSource  } from '@/types/crop'

const props = defineProps({})

const emit = defineEmits(['(e', 'value'])

const seedSourceStore = useSeedSourceStore()

const formRef = ref()
const submitting = ref(false)
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
  quantity,
  unit: '粒',
  unitPrice,
  totalAmount,
  initialCount,
  availableCount,
  pictures: [],
  remarks: '',
  status: 'sufficient',
  traceabilityCode: '',
  printCount,
  createBy: '管理员'
})

const cropCategories = ['蔬菜类', '茄果类', '瓜类', '叶菜类', '豆类', '根茎类']
const suppliers = ['寿光种业', '农科院种业', '山东蔬菜研究所', '其他']

watch(() => props.visible, (val) => {
  if (val) {
    // 重置表单
    form.value = {
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
      quantity,
      unit: '粒',
      unitPrice,
      totalAmount,
      initialCount,
      availableCount,
      pictures: [],
      remarks: '',
      status: 'sufficient',
      traceabilityCode: '',
      printCount,
      createBy: '管理员'
    }
  }
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!form.value.cropCategory || !form.value.cropName || !form.value.supplierName || !form.value.purchaseDate) {
    ElMessage.warning('请填写必填项')
    return
  }

  submitting.value = true
  try {
    // 计算总金额
    form.value.totalAmount = (form.value.quantity || 0) * (form.value.unitPrice || 0)
    form.value.initialCount = form.value.quantity || 0
    form.value.availableCount = form.value.quantity || 0

    await seedSourceStore.addItem(form.value)
    ElMessage.success('创建成功')
    emit('success')
    handleClose()
  } catch {
    ElMessage.error('创建失败')
  } finally {
    submitting.value = false
  }
}
</script>
