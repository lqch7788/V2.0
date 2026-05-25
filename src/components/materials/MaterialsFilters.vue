<template>
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
    <div class="grid grid-cols-8 gap-4">
      <!-- 物料编号 -->
      <div class="col-span-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">物料编号</label>
        <el-input v-model="localCode" placeholder="请输入" clearable @change="onCodeChange" />
      </div>

      <!-- 物料名称 -->
      <div class="col-span-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">物料名称</label>
        <el-input v-model="localName" placeholder="请输入" clearable @change="onNameChange" />
      </div>

      <!-- 供应商 -->
      <div class="col-span-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
        <el-select v-model="localSupplier" placeholder="全部" clearable @change="onSupplierChange">
          <el-option label="全部" value="" />
          <el-option v-for="s in supplierOptions" :key="s" :label="s" :value="s" />
        </el-select>
      </div>

      <!-- 存放位置 -->
      <div class="col-span-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">存放位置</label>
        <el-select v-model="localLocation" placeholder="全部" clearable @change="onLocationChange">
          <el-option label="全部" value="" />
          <el-option v-for="l in locationOptions" :key="l" :label="l" :value="l" />
        </el-select>
      </div>

      <!-- 大类 -->
      <div class="col-span-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">大类</label>
        <el-select v-model="localBigCategory" placeholder="全部" clearable @change="onBigCategoryChange">
          <el-option label="全部" value="" />
          <el-option v-for="cat in bigCategoryOptions" :key="cat.code" :label="`${cat.code} - ${cat.name}`" :value="cat.code" />
        </el-select>
      </div>

      <!-- 中类 -->
      <div class="col-span-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">中类</label>
        <el-select v-model="localMidCategory" placeholder="全部" clearable :disabled="!localBigCategory" @change="onMidCategoryChange">
          <el-option label="全部" value="" />
          <el-option v-for="cat in midCategoryOptions" :key="cat.code" :label="`${cat.code} - ${cat.name}`" :value="cat.code" />
        </el-select>
      </div>

      <!-- 小类 -->
      <div class="col-span-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">小类</label>
        <el-select v-model="localSubCategory" placeholder="全部" clearable :disabled="!localMidCategory" @change="onSubCategoryChange">
          <el-option label="全部" value="" />
          <el-option v-for="cat in subCategoryOptions" :key="cat.code" :label="`${cat.code} - ${cat.name}`" :value="cat.code" />
        </el-select>
      </div>

      <!-- 重置按钮 -->
      <div class="col-span-1 flex items-end">
        <el-button type="primary" class="w-full" @click="handleReset">重置</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { categoryConfig } from './mockData'

const props = defineProps({
  code: { type: String, default: '' },
  name: { type: String, default: '' },
  supplier: { type: String, default: '' },
  location: { type: String, default: '' },
  searchBigCategory: { type: String, default: '' },
  searchMidCategory: { type: String, default: '' },
  searchSubCategory: { type: String, default: '' },
  warehouseMaterials: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:code', 'update:name', 'update:supplier', 'update:location', 'update:searchBigCategory', 'update:searchMidCategory', 'update:searchSubCategory', 'reset'])

// 本地状态
const localCode = ref(props.code)
const localName = ref(props.name)
const localSupplier = ref(props.supplier)
const localLocation = ref(props.location)
const localBigCategory = ref(props.searchBigCategory)
const localMidCategory = ref(props.searchMidCategory)
const localSubCategory = ref(props.searchSubCategory)

// 监听props变化
watch(() => props.code, (val) => { localCode.value = val })
watch(() => props.name, (val) => { localName.value = val })
watch(() => props.supplier, (val) => { localSupplier.value = val })
watch(() => props.location, (val) => { localLocation.value = val })
watch(() => props.searchBigCategory, (val) => { localBigCategory.value = val })
watch(() => props.searchMidCategory, (val) => { localMidCategory.value = val })
watch(() => props.searchSubCategory, (val) => { localSubCategory.value = val })

// 供应商选项
const supplierOptions = computed(() => {
  return [...new Set(props.warehouseMaterials.map(m => m.supplier))]
})

// 位置选项
const locationOptions = computed(() => {
  return [...new Set(props.warehouseMaterials.map(m => m.location))]
})

// 大类选项
const bigCategoryOptions = computed(() => {
  return Object.keys(categoryConfig).map(key => ({
    code: key,
    name: categoryConfig[key].name
  }))
})

// 中类选项
const midCategoryOptions = computed(() => {
  if (!localBigCategory.value) return []
  const bigCat = categoryConfig[localBigCategory.value]
  if (!bigCat) return []
  return Object.entries(bigCat.categories).map(([code, data]) => ({
    code,
    name: data.name
  }))
})

// 小类选项
const subCategoryOptions = computed(() => {
  if (!localBigCategory.value || !localMidCategory.value) return []
  const bigCat = categoryConfig[localBigCategory.value]
  if (!bigCat) return []
  const midCat = bigCat.categories[localMidCategory.value]
  if (!midCat) return []
  return Object.entries(midCat.subCategories).map(([code, data]) => ({
    code,
    name: data.name
  }))
})

// 事件处理
const onCodeChange = (val) => emit('update:code', val)
const onNameChange = (val) => emit('update:name', val)
const onSupplierChange = (val) => emit('update:supplier', val)
const onLocationChange = (val) => emit('update:location', val)
const onBigCategoryChange = (val) => {
  localMidCategory.value = ''
  localSubCategory.value = ''
  emit('update:searchBigCategory', val)
  emit('update:searchMidCategory', '')
  emit('update:searchSubCategory', '')
}
const onMidCategoryChange = (val) => {
  localSubCategory.value = ''
  emit('update:searchMidCategory', val)
  emit('update:searchSubCategory', '')
}
const onSubCategoryChange = (val) => emit('update:searchSubCategory', val)

const handleReset = () => {
  localCode.value = ''
  localName.value = ''
  localSupplier.value = ''
  localLocation.value = ''
  localBigCategory.value = ''
  localMidCategory.value = ''
  localSubCategory.value = ''
  emit('reset')
}
</script>
