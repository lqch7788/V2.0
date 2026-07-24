<!--
  种源 Combogrid 选择器（V1.1 1:1 移植版）
  V1.1 源文件：src/components/farm/seedling/modals/AddModal.tsx L781-900 + EditModal.tsx L297-370
  功能：下拉表格形式选择种源，支持搜索 + 5 列展示（作物名称/种源批号/形态/采购数量/可用数量）
-->
<template>
  <div class="relative">
    <!-- 输入框（搜索/显示已选） -->
    <input
      type="text"
      :value="isOpen ? searchKeyword : selectedLabel"
      :placeholder="placeholder"
      @focus="handleFocus"
      @input="handleInput"
      class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
    />
    <!-- 清除按钮 -->
    <button
      v-if="modelValue"
      type="button"
      class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      @click="handleClear"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <!-- 下拉表格 -->
    <div
      v-if="isOpen"
      ref="popoverRef"
      class="absolute z-50 mt-1 w-full bg-white border border-gray-400 rounded-lg shadow-lg max-h-64 overflow-hidden"
      :style="{ minWidth: '500px', left: 0 }"
    >
      <!-- 表头 -->
      <div class="grid grid-cols-5 gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600">
        <div>作物名称</div>
        <div>种源批号</div>
        <div>形态</div>
        <div>采购数量</div>
        <div>可用数量</div>
      </div>
      <!-- 表格行 -->
      <div class="overflow-y-auto max-h-48">
        <div
          v-if="filteredSources.length === 0"
          class="px-3 py-4 text-sm text-gray-500 text-center space-y-2"
        >
          <div>{{ emptyText || '未找到匹配的种源' }}</div>
          <div v-if="navigatorTarget" class="text-xs text-gray-400">请前往「种源管理」添加种源后，再返回此处选择</div>
          <button
            v-if="navigatorTarget"
            type="button"
            class="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700"
            @click="handleNavigate"
          >去种源管理添加</button>
        </div>
        <div
          v-for="s in filteredSources"
          :key="s.id"
          @click="handleSelect(s)"
          :class="[
            'grid grid-cols-5 gap-2 px-3 py-2 text-sm border-b border-gray-100 transition-colors',
            isDisabled(s)
              ? 'bg-gray-100 cursor-not-allowed opacity-60'
              : `cursor-pointer hover:bg-emerald-50 ${modelValue === s.id ? 'bg-emerald-100' : ''}`
          ]"
          :title="isDisabled(s) ? disabledReason(s) : ''"
        >
          <div :class="['truncate font-medium', isDisabled(s) ? 'text-gray-400' : 'text-gray-800']">
            {{ s.cropName }}
            <span v-if="isFailed(s)" class="ml-1 text-xs text-red-500">[已失败]</span>
          </div>
          <div :class="['truncate', isDisabled(s) ? 'text-gray-400' : 'text-emerald-700']">{{ s.seedCode }}</div>
          <div class="text-gray-600 truncate">{{ formatSeedForm(s.seedForm) || '—' }}</div>
          <div class="text-gray-600">{{ s.quantity }} {{ s.unit }}</div>
          <div :class="['font-medium',
            (s.availableCount || 0) <= 0 ? 'text-red-500' :
            (s.availableCount || 0) < 10 ? 'text-amber-500' : 'text-gray-700']">
            {{ s.availableCount }} {{ s.unit }}
          </div>
        </div>
      </div>
      <!-- 底部提示 -->
      <div class="px-3 py-1.5 bg-gray-50 border-t border-gray-200 text-xs text-gray-400">
        共 {{ filteredSources.length }} 条 | 点击行选择 | 点击外部关闭
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  sources: { type: Array, default: () => [] },
  placeholder: { type: String, default: '搜索种源批号或作物名称...' },
  emptyText: { type: String, default: '' },
  navigatorTarget: { type: String, default: '' }, // 跳转路径，例如 '/crop/seed-source'
  // 联动过滤：选了生产计划后只显示同品种
  varietyFilter: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'select', 'navigate'])

const isOpen = ref(false)
const searchKeyword = ref('')
const popoverRef = ref(null)

// 当前选中显示
const selectedLabel = computed(() => {
  const s = props.sources.find(item => item.id === props.modelValue)
  return s ? `${s.seedCode} - ${s.cropName}` : ''
})

// 来源类型映射（V1.1 sourceTypeLabels L347-356）
const SOURCE_TYPE_LABELS = {
  seed: '种子',
  seedling: '种苗',
  cutting: '扦插苗',
  grafting: '嫁接苗',
  tissue_culture: '组培苗',
  split: '分株苗',
  bulb: '种球',
  other: '其他'
}

const SEED_FORM_OPTIONS_ZH = ['种子','种苗','实生苗','扦插苗','嫁接苗','组培苗','分株苗','种球','球根','块根','块茎','鳞茎','穗条','枝条','叶片','花朵','果实','整株','其他']

/**
 * 种源形态兜底翻译（对齐 V1.1 AddModal.tsx L53-57 formatSeedFormDisplay）
 * - DB 可能是中文（product_form）或英文（stock_type fallback）
 */
function formatSeedForm(sf) {
  if (!sf) return ''
  if (SEED_FORM_OPTIONS_ZH.includes(sf)) return sf  // 中文 → 原样
  return SOURCE_TYPE_LABELS[sf] || sf                  // 英文 → 翻译
}

function isFailed(s) {
  return s.propagationStatus === 'failed'
}

function isDisabled(s) {
  return isFailed(s) || (s.availableCount || 0) <= 0
}

function disabledReason(s) {
  if (isFailed(s)) return '该种源已标记为失败，不能用于育苗'
  if ((s.availableCount || 0) <= 0) return '该种源可用余量为 0'
  return ''
}

// 过滤种源（搜索 + 联动品种过滤）
const filteredSources = computed(() => {
  let list = props.sources || []
  if (props.varietyFilter) {
    list = list.filter(s => s.cropName === props.varietyFilter)
  }
  if (searchKeyword.value) {
    const q = searchKeyword.value.toLowerCase()
    list = list.filter(s =>
      (s.seedCode && s.seedCode.toLowerCase().includes(q)) ||
      (s.cropName && s.cropName.toLowerCase().includes(q)) ||
      (s.cropVariety && s.cropVariety.toLowerCase().includes(q))
    )
  }
  return list
})

function handleFocus() {
  isOpen.value = true
  searchKeyword.value = ''
}

function handleInput(e) {
  isOpen.value = true
  searchKeyword.value = e.target.value
}

function handleSelect(s) {
  if (isDisabled(s)) {
    return
  }
  emit('update:modelValue', s.id)
  emit('select', s)
  isOpen.value = false
  searchKeyword.value = ''
}

function handleClear() {
  emit('update:modelValue', '')
  emit('select', { id: '', seedCode: '', cropName: '', cropCode: '', cropVariety: '', sourceType: '', supplierName: '', seedForm: '' })
  searchKeyword.value = ''
}

function handleNavigate() {
  emit('navigate', props.navigatorTarget)
}

function handleClickOutside(e) {
  if (popoverRef.value && !popoverRef.value.contains(e.target)) {
    const inputEl = e.target.closest('.crop-source-combogrid-input')
    if (!inputEl) {
      isOpen.value = false
      searchKeyword.value = ''
    }
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>
