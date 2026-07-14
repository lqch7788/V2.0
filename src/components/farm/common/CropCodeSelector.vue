<template>
  <!--
    统一的作物编码选择器组件（V1.1 1:1 迁移版）
    V1.1源文件：src/components/farm/common/CropCodeSelector.tsx
    功能：4级联动选择（类别→类型→品种→子品种），支持搜索 + 自动创建新品种
  -->
  <div class="crop-code-selector relative" :class="className">
    <!-- 选择触发器 -->
    <el-button
      type="default"
      :plain="true"
      :disabled="disabled"
      @click="toggleOpen"
      :class="['w-full flex items-center justify-between', sizeClasses[size], isOpen ? 'border-emerald-500 ring-1 ring-emerald-500' : '']"
    >
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <el-icon v-if="selectedVariety" class="text-emerald-500 flex-shrink-0"><Leaf /></el-icon>
        <template v-if="selectedVariety">
          <span class="truncate text-gray-900">{{ displayText }}</span>
          <span class="text-xs text-gray-400 font-mono flex-shrink-0">{{ selectedVariety.cropCode }}</span>
        </template>
        <span v-else class="text-gray-400 truncate">{{ placeholder }}</span>
      </div>
      <el-icon class="text-gray-400 flex-shrink-0">
        <component :is="isOpen ? ArrowDown : ArrowRight" />
      </el-icon>
    </el-button>

    <!-- 下拉面板 -->
    <div v-if="isOpen" class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
      <!-- 搜索框 -->
      <div class="p-2 border-b border-gray-100">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索品种名称或编码..."
          clearable
          autofocus
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 类别快速筛选 -->
      <div class="p-2 border-b border-gray-100 flex gap-1 flex-wrap">
        <el-button
          size="small"
          :type="!selectedCategory ? 'success' : 'default'"
          :plain="selectedCategory !== ''"
          round
          @click="selectedCategory = ''"
        >
          全部
        </el-button>
        <el-button
          v-for="cat in categoryOptions"
          :key="cat.value"
          size="small"
          :type="selectedCategory === cat.value ? 'success' : 'default'"
          :plain="selectedCategory !== cat.value"
          round
          @click="selectedCategory = cat.value"
        >
          {{ cat.label }}
        </el-button>
      </div>

      <!-- 选项列表 -->
      <div class="max-h-64 overflow-y-auto">
        <div v-if="filteredOptions.length === 0 && searchResults.length === 0" class="px-4 py-6 text-center">
          <div class="text-gray-500 text-sm mb-3">未找到匹配的品种</div>
          <el-button
            v-if="searchKeyword.trim()"
            type="primary"
            size="small"
            @click="handleAutoCreate"
          >
            <el-icon><Plus /></el-icon>
            自动创建「{{ searchKeyword.trim() }}」
          </el-button>
        </div>
        <template v-else>
          <!-- 搜索结果 -->
          <div v-if="searchResults.length > 0" class="border-b border-gray-100">
            <div class="px-3 py-1.5 text-xs text-gray-500 bg-gray-50">搜索结果</div>
            <OptionItem
              v-for="result in searchResults"
              :key="result.variety.id"
              :option="{
                value: result.variety.cropCode,
                label: result.variety.varietyName,
                category: result.variety.categoryName,
                categoryCode: result.variety.categoryCode,
                typeName: result.variety.typeName,
                typeCode: result.variety.typeCode,
                varietyCode: result.variety.varietyCode,
                subVariety1Name: result.variety.subVariety1Name,
                subVariety1Code: result.variety.subVariety1Code,
                fullPath: buildFullPath(result.variety)
              }"
              :is-selected="value === result.variety.cropCode"
              @select="handleSelect"
            />
          </div>
          <!-- 完整列表 -->
          <OptionItem
            v-for="option in filteredOptions"
            :key="option.value"
            :option="option"
            :is-selected="value === option.value"
            @select="handleSelect"
          />
        </template>
      </div>
    </div>

    <!-- 点击外部关闭 -->
    <div v-if="isOpen" class="fixed inset-0 z-40" @click="isOpen = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, ArrowDown, ArrowRight, TakeawayBox, Plus } from '@element-plus/icons-vue'
import {
  initVarieties,
  getVarietyOptions,
  searchVarieties,
  getCategoryOptions,
  getVarietyByCode,
  findOrCreateVarietyByName
} from '@/services/cropVarietyService'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '搜索或选择作物品种...' },
  disabled: { type: Boolean, default: false },
  size: { type: String, default: 'md' },
  showFullPath: { type: Boolean, default: true },
  className: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'change'])

const value = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const isOpen = ref(false)
const searchKeyword = ref('')
const selectedCategory = ref('')

const sizeClasses = {
  sm: 'h-8 text-xs',
  md: 'h-10 text-sm',
  lg: 'h-12 text-base'
}

const toggleOpen = () => {
  if (!props.disabled) isOpen.value = !isOpen.value
}

const allOptions = computed(() => {
  initVarieties()
  return getVarietyOptions()
})

const categoryOptions = computed(() => getCategoryOptions())

const filteredOptions = computed(() => {
  let result = allOptions.value
  if (selectedCategory.value) {
    result = result.filter(opt => opt.categoryCode === selectedCategory.value)
  }
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(opt =>
      opt.label.toLowerCase().includes(keyword) ||
      (opt.fullPath || '').toLowerCase().includes(keyword) ||
      opt.value.toLowerCase().includes(keyword)
    )
  }
  return result
})

const searchResults = computed(() => {
  if (!searchKeyword.value.trim()) return []
  return searchVarieties(searchKeyword.value).slice(0, 10)
})

const selectedVariety = computed(() => {
  if (!value.value) return null
  return getVarietyByCode(value.value) || null
})

const buildFullPath = (variety) => {
  return `${variety.categoryName} > ${variety.typeName} > ${variety.varietyName}${variety.subVariety1Name ? ' > ' + variety.subVariety1Name : ''}`
}

const displayText = computed(() => {
  if (!selectedVariety.value) return ''
  return props.showFullPath
    ? buildFullPath(selectedVariety.value)
    : selectedVariety.value.varietyName
})

const handleSelect = (option) => {
  const variety = getVarietyByCode(option.value)
  emit('update:modelValue', option.value)
  emit('change', option.value, variety)
  isOpen.value = false
  searchKeyword.value = ''
}

const handleAutoCreate = () => {
  const newVariety = findOrCreateVarietyByName(searchKeyword.value.trim())
  if (newVariety) {
    emit('update:modelValue', newVariety.cropCode)
    emit('change', newVariety.cropCode, newVariety)
    isOpen.value = false
    searchKeyword.value = ''
  }
}

onMounted(() => {
  initVarieties()
})
</script>

<style scoped>
.crop-code-selector {
  display: inline-block;
  width: 100%;
}
</style>
