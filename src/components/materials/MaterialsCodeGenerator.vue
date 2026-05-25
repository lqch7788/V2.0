<template>
  <!-- 编码生成器 - 折叠状态 -->
  <div v-if="codeGenCollapsed" class="bg-white rounded-xl shadow-sm p-3 inline-flex items-center gap-2">
    <el-button text @click="onToggleCollapse" title="展开">
      <el-icon><DArrowRight /></el-icon>
    </el-button>
    <h3 class="text-sm font-semibold text-gray-900">物料编码生成</h3>
  </div>

  <!-- 编码生成器 - 展开状态 -->
  <div v-else class="bg-white rounded-xl p-6 shadow-none">
    <div class="flex items-center gap-2 mb-4">
      <el-button text @click="onToggleCollapse" title="收起">
        <el-icon><DArrowDown /></el-icon>
      </el-button>
      <h3 class="text-lg font-semibold text-gray-900">物料编码生成</h3>
      <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
        资材编码规则：大类(2位) + 中类(2位) + 小类(2位) + 序号(3位)
      </span>
    </div>

    <div class="grid grid-cols-4 gap-4 mb-4">
      <!-- 大类选择 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">大类</label>
        <el-select v-model="localBigCategory" placeholder="请选择大类" clearable @change="(val) => onCodeGenChange('bigCategory', val)">
          <el-option v-for="cat in bigCategories" :key="cat.code" :label="`${cat.code} - ${cat.name}`" :value="cat.code" />
        </el-select>
      </div>

      <!-- 中类选择 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">中类</label>
        <el-select v-model="localMidCategory" placeholder="请选择中类" clearable :disabled="!localBigCategory" @change="(val) => onCodeGenChange('midCategory', val)">
          <el-option v-for="cat in midCategoryOptions" :key="cat.code" :label="`${cat.code} - ${cat.name}`" :value="cat.code" />
        </el-select>
      </div>

      <!-- 小类选择 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">小类</label>
        <el-select v-model="localSubCategory" placeholder="请选择小类" clearable :disabled="!localMidCategory" @change="(val) => onCodeGenChange('subCategory', val)">
          <el-option v-for="cat in subCategoryOptions" :key="cat.code" :label="`${cat.code} - ${cat.name}`" :value="cat.code" />
        </el-select>
      </div>

      <!-- 生成编码 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">生成编码</label>
        <div class="flex gap-2">
          <el-input v-model="localGeneratedCode" placeholder="点击生成" readonly />
          <el-button type="primary" :disabled="!localSubCategory" @click="onGenerate">生成</el-button>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex items-center gap-3">
      <el-button type="primary" :disabled="!localGeneratedCode" @click="onVerify">
        <el-icon><Search /></el-icon>
        <span class="ml-1">验证重码</span>
      </el-button>
      <el-button :disabled="!localGeneratedCode" @click="onCopy">
        <el-icon><DocumentCopy /></el-icon>
        <span class="ml-1">{{ copySuccess ? '已复制!' : '复制编码' }}</span>
      </el-button>
      <span class="text-xs text-gray-500">生成的编码可复制后用于新增物料</span>
    </div>

    <!-- 提示信息 -->
    <el-alert v-if="codeGenError" :title="codeGenError" type="error" show-icon class="mt-3" :closable="false" />
    <el-alert v-if="codeGenSuccess && !codeGenError" :title="codeGenSuccess" type="success" show-icon class="mt-3" :closable="false" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { DArrowRight, DArrowDown, Search, DocumentCopy } from '@element-plus/icons-vue'
import { bigCategories, categoryConfig } from './mockData'

const props = defineProps({
  codeGen: {
    type: Object,
    default: () => ({
      bigCategory: '',
      midCategory: '',
      subCategory: '',
      generatedCode: ''
    })
  },
  codeGenCollapsed: { type: Boolean, default: false },
  codeGenError: { type: String, default: '' },
  codeGenSuccess: { type: String, default: '' },
  copySuccess: { type: Boolean, default: false },
  warehouseMaterials: { type: Array, default: () => [] },
  categoryConfig: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:codeGen', 'generate', 'verify', 'copy', 'toggle-collapse'])

// 本地状态
const localBigCategory = ref(props.codeGen.bigCategory)
const localMidCategory = ref(props.codeGen.midCategory)
const localSubCategory = ref(props.codeGen.subCategory)
const localGeneratedCode = ref(props.codeGen.generatedCode)

// 监听props变化
watch(() => props.codeGen, (val) => {
  localBigCategory.value = val.bigCategory
  localMidCategory.value = val.midCategory
  localSubCategory.value = val.subCategory
  localGeneratedCode.value = val.generatedCode
}, { deep: true })

// 中类选项
const midCategoryOptions = computed(() => {
  if (!localBigCategory.value) return []
  const bigCat = props.categoryConfig[localBigCategory.value] || categoryConfig[localBigCategory.value]
  if (!bigCat) return []
  return Object.entries(bigCat.categories || {}).map(([code, data]) => ({
    code,
    name: data.name
  }))
})

// 小类选项
const subCategoryOptions = computed(() => {
  if (!localBigCategory.value || !localMidCategory.value) return []
  const bigCat = props.categoryConfig[localBigCategory.value] || categoryConfig[localBigCategory.value]
  if (!bigCat) return []
  const midCat = bigCat.categories?.[localMidCategory.value]
  if (!midCat) return []
  return Object.entries(midCat.subCategories || {}).map(([code, data]) => ({
    code,
    name: data.name,
    prefix: data.prefix
  }))
})

// 事件处理
const onCodeGenChange = (field, value) => {
  const update = { ...props.codeGen }
  if (field === 'bigCategory') {
    update.bigCategory = value
    update.midCategory = ''
    update.subCategory = ''
    localMidCategory.value = ''
    localSubCategory.value = ''
  } else if (field === 'midCategory') {
    update.midCategory = value
    update.subCategory = ''
    localSubCategory.value = ''
  } else {
    update[field] = value
  }
  emit('update:codeGen', update)
}

const onGenerate = () => {
  emit('generate')
}

const onVerify = () => {
  emit('verify')
}

const onCopy = () => {
  emit('copy')
}

const onToggleCollapse = () => {
  emit('toggle-collapse')
}
</script>
