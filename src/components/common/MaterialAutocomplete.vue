<!--
  @file 物料自动补全输入框 - Vue 3 版本
  @description 1:1 翻译自 V1.1 src/components/common/MaterialAutocomplete.tsx
  - 行为：用户键入物料名称 → 模糊匹配 useWarehouseMaterialStore → 下拉展示最多 N 条
  - 选中 → 自动填入主数据字段（materialId/materialCode/materialName/category/specification/unit/barcode/supplier）
  @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\common\MaterialAutocomplete.tsx
  @note 修复 P0-7: V2.0 之前缺失该组件，CreatePlanModal/BatchEditModal 用普通 el-input 代替
  @note 修复 P0-19: 下拉浮层用 position:fixed（V1.1 L133-140 1:1 翻译），
         原 V2.0 用 absolute 被父级 overflow:auto 裁剪，导致弹窗内物料搜索下拉被 footer 遮盖
-->
<template>
  <div class="relative w-full">
    <div class="flex items-center relative">
      <input
        ref="inputRef"
        type="text"
        :value="searchQuery"
        :disabled="disabled"
        :placeholder="placeholder"
        class="w-full h-7 px-2 py-1 pr-6 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 disabled:bg-gray-100"
        @input="handleChange($event.target.value)"
        @focus="openDropdown = true"
        @blur="onBlur"
      />
      <el-icon class="absolute right-1.5 text-gray-400" :size="12">
        <Search />
      </el-icon>
    </div>

    <!-- 下拉结果（V1.1 L130-156 1:1 翻译：用 position:fixed + getBoundingClientRect 定位，不受父级 overflow 裁剪） -->
    <Teleport to="body">
      <div
        v-if="openDropdown && filteredResults.length > 0 && dropdownPosition"
        class="fixed z-[9999] bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
        :style="{
          top: dropdownPosition.top + 'px',
          left: dropdownPosition.left + 'px',
          minWidth: dropdownPosition.width + 'px',
        }"
      >
        <button
          v-for="m in filteredResults"
          :key="m.id"
          type="button"
          class="h-auto w-full text-left px-2.5 py-1.5 text-xs hover:bg-blue-50 flex items-center justify-between border-b border-gray-50 last:border-b-0"
          @mousedown.prevent="handleSelect(m)"
        >
          <span class="font-medium text-gray-800 truncate max-w-[140px]">{{ m.name }}</span>
          <span class="text-gray-400 font-mono text-[10px] ml-2 flex-shrink-0">{{ m.code }}</span>
        </button>
      </div>
    </Teleport>

    <!-- 未找到提示 -->
    <div
      v-if="showNotFoundHint"
      class="mt-0.5 text-[10px] text-amber-600"
    >
      未在物料库中找到 ·
      <a
        :href="createUrl"
        class="text-emerald-600 hover:text-emerald-700 hover:underline ml-0.5"
        target="_blank"
      >
        {{ createLabel }}
      </a>
    </div>
  </div>
</template>

<script setup>
/**
 * @file MaterialAutocomplete.vue
 * @description 物料自动补全输入框 - 1:1 翻译 V1.1 MaterialAutocomplete.tsx
 */
import { ref, computed, onMounted, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useWarehouseMaterialStore } from '@/stores/modules/warehouseMaterial'

const props = defineProps({
  /** 当前物料名称（受控） */
  value: { type: String, default: '' },
  /** 物料名称变化（用户键入） */
  // 兼容不同 emit 名
  placeholder: { type: String, default: '输入名称搜索物料库' },
  disabled: { type: Boolean, default: false },
  notFoundMode: { type: String, default: 'hide' }, // V2.0 简化版默认不显示跳转
  createUrl: { type: String, default: '/warehouse-overview' },
  createLabel: { type: String, default: '去添加' },
  maxResults: { type: Number, default: 8 },
})

const emit = defineEmits(['change', 'update:modelValue', 'update:value', 'select'])

const store = useWarehouseMaterialStore()
const items = computed(() => store.items || [])
const loadItems = store.loadItems

const inputRef = ref(null)
const openDropdown = ref(false)
const searchQuery = ref(props.value || '')
const loadedRef = ref(false)
/** 1:1 翻译 V1.1 L131-139: 用 getBoundingClientRect 实时计算浮层位置（fixed 定位） */
const dropdownPosition = ref(null)

/** 1:1 翻译 V1.1: 重新计算浮层位置（滚动/缩放/弹窗拖动时跟随 input） */
function updateDropdownPosition() {
  if (!inputRef.value) return
  const rect = inputRef.value.getBoundingClientRect()
  dropdownPosition.value = {
    top: rect.bottom + 2,
    left: rect.left,
    width: rect.width,
  }
}

// 首次挂载去重加载
onMounted(() => {
  if (loadedRef.value) return
  loadedRef.value = true
  if (items.value.length === 0 && typeof loadItems === 'function') {
    void loadItems()
  }
  // 1:1 翻译 V1.1：监听滚动/缩放事件，让浮层跟随 input 位置
  window.addEventListener('scroll', updateDropdownPosition, true)
  window.addEventListener('resize', updateDropdownPosition)
})

// 1:1 翻译 V1.1: openDropdown 变化时计算位置
watch(openDropdown, (open) => {
  if (open) {
    updateDropdownPosition()
  }
})

// 外部 value 变化 → 同步到 searchQuery
watch(() => props.value, (v) => {
  searchQuery.value = v || ''
})

// 模糊匹配（搜索 name + code 字段）
const filteredResults = computed(() => {
  const q = String(searchQuery.value || '').trim().toLowerCase()
  if (!q) return items.value.slice(0, props.maxResults)
  return items.value
    .filter((m) => {
      const name = String(m.name || '').toLowerCase()
      const code = String(m.code || '').toLowerCase()
      return name.includes(q) || code.includes(q)
    })
    .slice(0, props.maxResults)
})

const showNotFoundHint = computed(() => {
  return (
    props.notFoundMode === 'navigate' &&
    String(searchQuery.value || '').trim().length > 0 &&
    items.value.length > 0 &&
    filteredResults.value.length === 0
  )
})

function handleChange(newVal) {
  searchQuery.value = newVal
  // 同时发出 change / update:modelValue / update:value，兼容各种 v-model 写法
  emit('change', newVal)
  emit('update:modelValue', newVal)
  emit('update:value', newVal)
  openDropdown.value = true
}

function onBlur() {
  // 延迟关闭以让下拉点击能触发
  setTimeout(() => { openDropdown.value = false }, 150)
}

function handleSelect(m) {
  searchQuery.value = m.name || ''
  emit('change', m.name || '')
  emit('update:modelValue', m.name || '')
  emit('update:value', m.name || '')
  emit('select', m)
  openDropdown.value = false
  dropdownPosition.value = null
}

// 1:1 翻译 V1.1: 组件卸载时清理监听
import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('scroll', updateDropdownPosition, true)
  window.removeEventListener('resize', updateDropdownPosition)
})
</script>
