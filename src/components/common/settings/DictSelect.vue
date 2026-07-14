<template>
  <!--
    字典选择组件（V1.1 1:1 迁移版）
    V1.1源文件：src/components/common/settings/DictSelect.tsx
    功能：从后端获取数据字典，渲染为下拉选择器
  -->
  <el-select
    :model-value="modelValue"
    @update:model-value="(val) => $emit('update:modelValue', val)"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="allowClear"
    filterable
    style="width: 100%"
  >
    <el-option
      v-for="item in items"
      :key="item.dictCode"
      :label="item.dictLabel"
      :value="item.dictCode"
    />
  </el-select>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDictionaryStore } from '@/stores/modules/dictionary'

const props = defineProps({
  modelValue: { type: String, default: '' },
  category: { type: String, required: true },
  placeholder: { type: String, default: '选择字典项' },
  allowClear: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false }
})

defineEmits(['update:modelValue', 'change'])

const dictionaryStore = useDictionaryStore()
const loading = ref(false)

const items = computed(() => {
  // 从 store 取字典项
  const dict = dictionaryStore.getDictItems?.(props.category) || []
  return dict.map(d => ({
    dictCode: d.code || d.dictCode,
    dictLabel: d.label || d.dictLabel
  }))
})

const loadDicts = async () => {
  if (items.value.length > 0 || loading.value) return
  loading.value = true
  try {
    await dictionaryStore.loadDictionaries?.()
  } catch (e) {
    console.warn('[DictSelect] 加载字典失败:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDicts()
})

watch(() => props.category, () => {
  loadDicts()
})
</script>
