<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      <!-- 物料编号 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">物料编号</label>
        <el-input v-model="localFilters.code" placeholder="搜索编号" clearable size="default" />
      </div>

      <!-- 物料名称 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">物料名称</label>
        <el-input v-model="localFilters.name" placeholder="搜索名称" clearable size="default" />
      </div>

      <!-- 供应商 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
        <el-input v-model="localFilters.supplier" placeholder="搜索供应商" clearable size="default" />
      </div>

      <!-- 存放位置 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">存放位置</label>
        <el-input v-model="localFilters.location" placeholder="搜索位置" clearable size="default" />
      </div>

      <!-- 大类 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">大类</label>
        <el-select v-model="localFilters.searchBigCategory" placeholder="全部" clearable size="default" @change="onBigCategoryChange">
          <el-option v-for="cat in bigCategoryOptions" :key="cat.code" :label="`${cat.code} - ${cat.name}`" :value="cat.code" />
        </el-select>
      </div>

      <!-- 中类 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">中类</label>
        <el-select v-model="localFilters.searchMidCategory" placeholder="全部" clearable :disabled="!localFilters.searchBigCategory" size="default" @change="onMidCategoryChange">
          <el-option v-for="cat in midCategoryOptions" :key="cat.code" :label="`${cat.code} - ${cat.name}`" :value="cat.code" />
        </el-select>
      </div>

      <!-- 小类 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">小类</label>
        <el-select v-model="localFilters.searchSubCategory" placeholder="全部" clearable :disabled="!localFilters.searchMidCategory" size="default">
          <el-option v-for="cat in subCategoryOptions" :key="cat.code" :label="`${cat.code} - ${cat.name}`" :value="cat.code" />
        </el-select>
      </div>

      <!-- 重置按钮 -->
      <div class="flex items-end">
        <el-button size="default" @click="handleReset" class="w-full">重置</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({
      code: '',
      name: '',
      category: '',
      supplier: '',
      location: '',
      searchBigCategory: '',
      searchMidCategory: '',
      searchSubCategory: '',
      showLowStock: false
    })
  },
  categoryConfig: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:filters', 'low-stock-click'])

const localFilters = ref({ ...props.filters })

watch(() => props.filters, (val) => {
  localFilters.value = { ...val }
}, { deep: true })

const bigCategoryOptions = computed(() => {
  return Object.keys(props.categoryConfig || {}).map(key => ({
    code: key,
    name: props.categoryConfig[key]?.name
  }))
})

const midCategoryOptions = computed(() => {
  if (!localFilters.value.searchBigCategory) return []
  const bigCat = props.categoryConfig?.[localFilters.value.searchBigCategory]
  if (!bigCat) return []
  return Object.entries(bigCat.categories || {}).map(([code, data]) => ({
    code,
    name: data.name
  }))
})

const subCategoryOptions = computed(() => {
  if (!localFilters.value.searchBigCategory || !localFilters.value.searchMidCategory) return []
  const bigCat = props.categoryConfig?.[localFilters.value.searchBigCategory]
  if (!bigCat) return []
  const midCat = bigCat.categories?.[localFilters.value.searchMidCategory]
  if (!midCat) return []
  return Object.entries(midCat.subCategories || {}).map(([code, data]) => ({
    code,
    name: data.name
  }))
})

const onBigCategoryChange = () => {
  localFilters.value.searchMidCategory = ''
  localFilters.value.searchSubCategory = ''
}

const onMidCategoryChange = () => {
  localFilters.value.searchSubCategory = ''
}

const handleReset = () => {
  localFilters.value = {
    code: '',
    name: '',
    category: '',
    supplier: '',
    location: '',
    searchBigCategory: '',
    searchMidCategory: '',
    searchSubCategory: '',
    showLowStock: false
  }
  emit('update:filters', localFilters.value)
}
</script>
