<template>
  <!--
    快速新增品种弹窗（V1.1 1:1 迁移版）
    V1.1源文件：components/farm/crop-variety/modals/QuickAddModal.tsx
    功能：快速创建新品种（4级联动：类别>类型>品种>子品种）
  -->
  <el-dialog
    :model-value="visible"
    title="快速新增品种"
    width="500px"
    :close-on-click-modal="false"
    @update:model-value="(v) => !v && handleClose()"
    @close="handleClose"
  >
    <el-form :model="form" label-width="80px" ref="formRef">
      <el-form-item label="作物类别" required>
        <el-select v-model="form.categoryCode" placeholder="选择类别" @change="handleCategoryChange">
          <el-option v-for="c in categoryOptions" :key="c.value" :label="c.label" :value="c.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="作物类型" required>
        <el-select v-model="form.typeCode" placeholder="选择类型" :disabled="!form.categoryCode" @change="handleTypeChange">
          <el-option v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="品种名称" required>
        <el-input v-model="form.varietyName" placeholder="请输入品种名称" />
      </el-form-item>
      <el-form-item label="子品种">
        <el-input v-model="form.subVariety1Name" placeholder="可选，如：红颜" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">创建</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { addVariety, getCategoryOptions, getTypeOptionsByCategory } from '@/services/cropVarietyService'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'close', 'success'])

const formRef = ref()
const submitting = ref(false)
const categoryOptions = ref([])
const typeOptions = ref([])

const form = ref({
  categoryCode: '',
  categoryName: '',
  typeCode: '',
  typeName: '',
  varietyName: '',
  subVariety1Name: ''
})

// 加载类别选项
const loadCategoryOptions = () => {
  const options = getCategoryOptions()
  categoryOptions.value = options.map(o => ({ value: o.value, label: o.label }))
}

const handleCategoryChange = (val) => {
  form.value.typeCode = ''
  form.value.typeName = ''
  typeOptions.value = []
  if (val) {
    const cat = categoryOptions.value.find(c => c.value === val)
    if (cat) form.value.categoryName = cat.label
    const types = getTypeOptionsByCategory(val)
    typeOptions.value = types.map(o => ({ value: o.value, label: o.label }))
  }
}

const handleTypeChange = (val) => {
  if (val) {
    const t = typeOptions.value.find(t => t.value === val)
    if (t) form.value.typeName = t.label
  }
}

const handleSubmit = async () => {
  if (!form.value.categoryCode) {
    ElMessage.warning('请选择作物类别')
    return
  }
  if (!form.value.typeCode) {
    ElMessage.warning('请选择作物类型')
    return
  }
  if (!form.value.varietyName) {
    ElMessage.warning('请输入品种名称')
    return
  }

  submitting.value = true
  try {
    const newVariety = await addVariety({
      categoryCode: form.value.categoryCode,
      categoryName: form.value.categoryName,
      typeCode: form.value.typeCode,
      typeName: form.value.typeName,
      varietyName: form.value.varietyName,
      subVariety1Name: form.value.subVariety1Name
    })
    ElMessage.success('品种已创建')
    emit('success', newVariety)
    handleClose()
  } catch (e) {
    const msg = e instanceof Error ? e.message : '创建失败'
    ElMessage.error(msg)
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
  form.value = {
    categoryCode: '',
    categoryName: '',
    typeCode: '',
    typeName: '',
    varietyName: '',
    subVariety1Name: ''
  }
}

watch(() => props.visible, (val) => {
  if (val && categoryOptions.value.length === 0) {
    loadCategoryOptions()
  }
})
</script>
