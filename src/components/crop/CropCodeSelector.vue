<template>
  <div class="relative">
    <!-- 选择触发器 -->
    <el-button
      type="default"
      class="w-full justify-between text-left"
      :class="sizeClasses[size]"
      :disabled="disabled"
      @click="!disabled && (isOpen = !isOpen)"
    >
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <template v-if="selectedVariety">
          <el-icon class="text-emerald-500 flex-shrink-0"><Leaf /></el-icon>
          <span class="truncate text-gray-900">{{ displayText }}</span>
          <span class="text-xs text-gray-400 font-mono flex-shrink-0">
            {{ selectedVariety.cropCode }}
          </span>
        </template>
        <span v-else class="text-gray-400 truncate">{{ placeholder }}</span>
      </div>
      <el-icon class="flex-shrink-0">
        <ChevronDown v-if="isOpen" />
        <ChevronRight v-else />
      </el-icon>
    </el-button>

    <!-- 下拉面板 -->
    <div
      v-if="isOpen"
      class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg"
    >
      <!-- 搜索框 -->
      <div class="p-2 border-b border-gray-100">
        <div class="relative">
          <el-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search /></el-icon>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索品种名称或编码..."
            class="w-full"
            :prefix-icon="Search"
          />
        </div>
      </div>

      <!-- 类别快速筛选 -->
      <div class="p-2 border-b border-gray-100 flex gap-1 flex-wrap">
        <el-button
          size="small"
          :type="selectedCategory === '' ? 'primary' : 'default'"
          class="rounded-full"
          @click="selectedCategory = ''"
        >
          全部
        </el-button>
        <el-button
          v-for="cat in categoryOptions"
          :key="cat.value"
          size="small"
          :type="selectedCategory === cat.value ? 'primary' : 'default'"
          class="rounded-full"
          @click="selectedCategory = cat.value"
        >
          {{ cat.label }}
        </el-button>
      </div>

      <!-- 选项列表 -->
      <div class="max-h-64 overflow-y-auto">
        <template v-if="filteredOptions.length === 0 && searchResults.length === 0">
          <div class="px-4 py-6 text-center">
            <div class="text-gray-500 text-sm mb-3">未找到匹配的品种</div>
            <el-button
              v-if="searchKeyword.trim()"
              size="small"
              type="primary"
              @click="handleAutoCreate"
            >
              <el-icon class="mr-1"><Plus /></el-icon>
              自动创建「{{ searchKeyword.trim() }}」
            </el-button>
          </div>
        </template>
        <template v-else>
          <!-- 搜索结果显示 -->
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
                fullPath: `${result.variety.categoryName} > ${result.variety.typeName} > ${result.variety.varietyName}${result.variety.subVariety1Name ? ` > ${result.variety.subVariety1Name}` : ''}`
              }"
              :is-selected="modelValue === result.variety.cropCode"
              @select="handleSelect"
            />
          </div>

          <!-- 完整列表 -->
          <OptionItem
            v-for="option in filteredOptions"
            :key="option.value"
            :option="option"
            :is-selected="modelValue === option.value"
            @select="handleSelect"
          />
        </template>
      </div>
    </div>

    <!-- 点击外部关闭 -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="isOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, ChevronDown, ChevronRight, Leaf, Plus } from 'lucide-vue-next'
import {
  initVarieties,
  getVarietyOptions,
  searchVarieties,
  getCategoryOptions,
  getVarietyByCode,
  findOrCreateVarietyByName,
} from '@/services/cropVarietyService'
import OptionItem from './OptionItem.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '搜索或选择作物品种...' },
  disabled: { type: Boolean, default: false },
  size: { type: String, default: 'md' },
  showFullPath: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const searchKeyword = ref('')
const selectedCategory = ref('')

// 初始化品种库
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
      opt.fullPath.toLowerCase().includes(keyword) ||
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
  if (!props.modelValue) return null
  return getVarietyByCode(props.modelValue) || null
})

const displayText = computed(() => {
  if (selectedVariety.value) {
    return props.showFullPath
      ? `${selectedVariety.value.categoryName} > ${selectedVariety.value.typeName} > ${selectedVariety.value.varietyName}${selectedVariety.value.subVariety1Name ? ` > ${selectedVariety.value.subVariety1Name}` : ''}`
      : selectedVariety.value.varietyName
  }
  return ''
})

const sizeClasses = {
  sm: 'h-8 text-xs',
  md: 'h-10 text-sm',
  lg: 'h-12 text-base',
}

function handleSelect(option) {
  const variety = getVarietyByCode(option.value)
  emit('update:modelValue', option.value)
  emit('change', option.value, variety || null)
  isOpen.value = false
  searchKeyword.value = ''
}

function handleAutoCreate() {
  const newVariety = findOrCreateVarietyByName(searchKeyword.value.trim())
  if (newVariety) {
    emit('update:modelValue', newVariety.cropCode)
    emit('change', newVariety.cropCode, newVariety)
    isOpen.value = false
    searchKeyword.value = ''
  }
}
</script>
