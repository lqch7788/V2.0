<!--
  作物编码选择器
  对标 V1.1 src/components/farm/common/CropCodeSelector.tsx
-->
<template>
  <el-cascader
    v-model="selected"
    :options="options"
    :props="cascaderProps"
    :placeholder="placeholder"
    :clearable="true"
    :filterable="true"
    class="w-full"
    @change="handleChange"
  />
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Array], default: '' },
  placeholder: { type: String, default: '请选择作物编码' },
})

const emit = defineEmits(['update:modelValue', 'change'])

const selected = ref(props.modelValue)
const options = ref([
  {
    value: 'VEG',
    label: '蔬菜',
    children: [
      { value: 'TOM', label: '番茄' },
      { value: 'LET', label: '生菜' },
      { value: 'CUC', label: '黄瓜' },
    ],
  },
  {
    value: 'FRU',
    label: '水果',
    children: [
      { value: 'STR', label: '草莓' },
      { value: 'MEL', label: '甜瓜' },
    ],
  },
  {
    value: 'GRA',
    label: '粮食',
    children: [
      { value: 'RIC', label: '水稻' },
      { value: 'WHT', label: '小麦' },
    ],
  },
])

const cascaderProps = {
  value: 'value',
  label: 'label',
  children: 'children',
  emitPath: false,
}

watch(
  () => props.modelValue,
  (val) => {
    selected.value = val
  }
)

const handleChange = (val) => {
  selected.value = val
  emit('update:modelValue', val)
  emit('change', val)
}
</script>