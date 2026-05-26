<template>
  <!-- 施肥编号生成器 - 从V1.1 FertilizerCodeGenerator.tsx 1:1迁移 -->
  <div class="flex gap-2">
    <el-input :model-value="code" readonly disabled class="font-mono" />
    <el-button type="primary" size="default" @click="generate" class="whitespace-nowrap">生成编号</el-button>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const code = ref(props.modelValue)

const generate = () => {
  const now = new Date()
  const y = now.getFullYear().toString()
  const m = (now.getMonth() + 1).toString().padStart(2, '0')
  const d = now.getDate().toString().padStart(2, '0')
  const h = now.getHours().toString().padStart(2, '0')
  const min = now.getMinutes().toString().padStart(2, '0')
  const s = now.getSeconds().toString().padStart(2, '0')
  const newCode = `SF${y}${m}${d}${h}${min}${s}`
  code.value = newCode
  emit('update:modelValue', newCode)
}

watch(() => props.modelValue, (v) => { code.value = v })

onMounted(() => {
  if (!code.value) generate()
})
</script>
