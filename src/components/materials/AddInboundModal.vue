<template>
  <ElModal
    :model-value="show"
    title="新增入库"
    :width="900"
    :height="650"
    :show-submit="false"
    :show-cancel="false"
    :close-on-click-modal="false"
    @update:model-value="(v) => { if (!v) handleClose() }"
    @close="handleClose"
  >
    <el-form :model="localNewInbound" label-width="100px">
      <!-- 入库单号 -->
      <el-form-item label="入库单号">
        <div class="flex gap-2 w-full">
          <el-input v-model="localNewInbound.orderCode" placeholder="点击自动生成" readonly />
          <el-button type="primary" @click="onGenerateOrderCode">自动生成</el-button>
        </div>
      </el-form-item>

      <!-- 物料编码 -->
      <el-form-item label="物料编码" required>
        <div class="flex gap-2 w-full">
          <el-input v-model="localNewInbound.materialCode" placeholder="请输入物料编码（可从上方编码生成器复制）" @blur="() => onCheckCodeDuplicate(localNewInbound.materialCode)" />
          <el-button @click="handleGenerateCode">生成编码</el-button>
        </div>
        <div class="text-xs text-gray-500 mt-1">提示：可在"物料编码生成"区域生成并验证编码后复制到此</div>
        <div v-if="codeError" class="text-xs text-red-500 mt-1">{{ codeError }}</div>
      </el-form-item>

      <!-- 物料名称 -->
      <el-form-item label="物料名称" required>
        <el-input v-model="localNewInbound.materialName" placeholder="请输入物料名称" @blur="() => onCheckNameDuplicate(localNewInbound.materialName)" />
        <div v-if="nameError" class="text-xs text-red-500 mt-1">{{ nameError }}</div>
      </el-form-item>

      <!-- 分类选择 -->
      <el-form-item label="分类选择">
        <div class="grid grid-cols-3 gap-4 w-full">
          <el-select v-model="localNewInbound.bigCategory" placeholder="请选择大类" @change="(val) => handleCategoryChange('bigCategory', val)">
            <el-option v-for="(cat, key) in categoryConfig" :key="key" :label="`${key} - ${cat.name}`" :value="key" />
          </el-select>
          <el-select v-model="localNewInbound.midCategory" placeholder="请选择中类" :disabled="!localNewInbound.bigCategory" @change="(val) => handleCategoryChange('midCategory', val)">
            <el-option v-for="cat in midCategoryOptions" :key="cat.code" :label="`${cat.code} - ${cat.name}`" :value="cat.code" />
          </el-select>
          <el-select v-model="localNewInbound.subCategory" placeholder="请选择小类" :disabled="!localNewInbound.midCategory" @change="(val) => handleCategoryChange('subCategory', val)">
            <el-option v-for="cat in subCategoryOptions" :key="cat.code" :label="`${cat.code} - ${cat.name}`" :value="cat.code" />
          </el-select>
        </div>
      </el-form-item>

      <!-- 数量和单位 -->
      <el-form-item label="入库数量" required>
        <div class="grid grid-cols-2 gap-4 w-full">
          <el-input-number v-model="localNewInbound.quantity" :min="0" placeholder="请输入数量" />
          <el-select v-model="localNewInbound.unit" placeholder="请选择单位">
            <el-option v-for="unit in unitOptions" :key="unit" :label="unit" :value="unit" />
          </el-select>
        </div>
      </el-form-item>

      <!-- 供应商 -->
      <el-form-item label="供应商">
        <el-input v-model="localNewInbound.supplier" placeholder="请输入供应商" />
      </el-form-item>

      <!-- 入库日期和操作员 -->
      <el-form-item label="入库日期">
        <el-date-picker v-model="localNewInbound.inboundDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
      </el-form-item>

      <el-form-item label="操作员">
        <el-input v-model="localNewInbound.operator" placeholder="请输入操作员" />
      </el-form-item>

      <!-- 备注 -->
      <el-form-item label="备注">
        <el-input v-model="localNewInbound.remarks" type="textarea" :rows="3" placeholder="请输入备注" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button size="small" @click="handleClose">取消</el-button>
      <el-button size="small" type="primary" :disabled="!isValid" @click="handleSave">保存</el-button>
    </template>
  </ElModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { categoryConfig, warehouseMaterials, unitOptions } from './mockData'
import { ElModal } from '@/components/ui'

const props = defineProps({
  show: { type: Boolean, default: false },
  newInbound: { type: Object, default: () => ({}) },
  codeError: { type: String, default: '' },
  nameError: { type: String, default: '' }
})

const emit = defineEmits(['close', 'save', 'new-inbound-change', 'generate-order-code', 'check-code-duplicate', 'check-name-duplicate'])

const localNewInbound = ref({ ...props.newInbound })

watch(() => props.newInbound, (val) => {
  localNewInbound.value = { ...val }
}, { deep: true })

// 中类选项
const midCategoryOptions = computed(() => {
  if (!localNewInbound.value.bigCategory) return []
  const bigCat = categoryConfig[localNewInbound.value.bigCategory]
  if (!bigCat) return []
  return Object.entries(bigCat.categories || {}).map(([code, data]) => ({
    code,
    name: data.name
  }))
})

// 小类选项
const subCategoryOptions = computed(() => {
  if (!localNewInbound.value.bigCategory || !localNewInbound.value.midCategory) return []
  const bigCat = categoryConfig[localNewInbound.value.bigCategory]
  if (!bigCat) return []
  const midCat = bigCat.categories?.[localNewInbound.value.midCategory]
  if (!midCat) return []
  return Object.entries(midCat.subCategories || {}).map(([code, data]) => ({
    code,
    name: data.name,
    prefix: data.prefix
  }))
})

// 验证
const isValid = computed(() => {
  return !props.codeError && !props.nameError && localNewInbound.value.materialCode && localNewInbound.value.materialName && localNewInbound.value.quantity
})

// 分类变化处理
const handleCategoryChange = (field, value) => {
  if (field === 'bigCategory') {
    localNewInbound.value.bigCategory = value
    localNewInbound.value.midCategory = ''
    localNewInbound.value.subCategory = ''
    localNewInbound.value.materialCode = ''
  } else if (field === 'midCategory') {
    localNewInbound.value.midCategory = value
    localNewInbound.value.subCategory = ''
    localNewInbound.value.materialCode = ''
  } else if (field === 'subCategory') {
    localNewInbound.value.subCategory = value
    localNewInbound.value.materialCode = ''
  }
  emit('new-inbound-change', localNewInbound.value)
}

// 生成编码
const handleGenerateCode = () => {
  if (!localNewInbound.value.bigCategory || !localNewInbound.value.midCategory || !localNewInbound.value.subCategory) {
    emit('new-inbound-change', 'codeError', '请先选择大类、中类、小类')
    return
  }

  const subCat = subCategoryOptions.value.find(s => s.code === localNewInbound.value.subCategory)
  if (!subCat) return

  const prefix = subCat.prefix
  const existingCodes = warehouseMaterials
    .filter((m) => m.code.startsWith(prefix))
    .map((m) => parseInt(m.code.slice(-3)))

  let maxSeq = 0
  if (existingCodes.length > 0) {
    maxSeq = Math.max(...existingCodes)
  }

  const newSeq = (maxSeq + 1).toString().padStart(3, '0')
  const fullCode = prefix + newSeq

  localNewInbound.value.materialCode = fullCode
  emit('new-inbound-change', 'materialCode', fullCode)
  emit('check-code-duplicate', fullCode)
}

const handleClose = () => emit('close')

const handleSave = () => {
  if (isValid.value) {
    emit('save', localNewInbound.value)
  }
}

const onGenerateOrderCode = () => emit('generate-order-code')
const onCheckCodeDuplicate = (code) => emit('check-code-duplicate', code)
const onCheckNameDuplicate = (name) => emit('check-name-duplicate', name)

// 表单字段变化
const onNewInboundChange = (field, value) => {
  localNewInbound.value[field] = value
  emit('new-inbound-change', field, value)
}
</script>
