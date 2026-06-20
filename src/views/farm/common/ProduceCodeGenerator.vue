<!--
  产品编码生成器
  对标 V1.1 src/components/farm/common/ProduceCodeGenerator.tsx
-->
<template>
  <div class="bg-white rounded-xl p-4 shadow-sm space-y-3">
    <h3 class="font-semibold text-gray-900">产品编码生成</h3>
    <div class="grid grid-cols-3 gap-3">
      <el-input v-model="categoryCode" placeholder="类别编码" />
      <el-input v-model="typeCode" placeholder="类型编码" />
      <el-input-number v-model="sequence" :min="1" :max="9999" placeholder="序号" class="w-full" />
    </div>
    <div class="bg-gray-50 p-3 rounded font-mono text-lg text-emerald-700">
      生成编码：<span class="font-bold">{{ generatedCode }}</span>
    </div>
    <el-button type="primary" @click="handleGenerate">
      <el-icon><MagicStick /></el-icon>
      生成
    </el-button>
    <el-button @click="copyCode" :disabled="!generatedCode">
      <el-icon><CopyDocument /></el-icon>
      复制
    </el-button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { CopyDocument, MagicStick } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const categoryCode = ref('')
const typeCode = ref('')
const sequence = ref(1)

const generatedCode = computed(() => {
  const seq = String(sequence.value).padStart(4, '0')
  return `${categoryCode.value}${typeCode.value}${seq}`
})

const handleGenerate = () => {
  ElMessage.success(`编码：${generatedCode.value}`)
}

const copyCode = () => {
  navigator.clipboard.writeText(generatedCode.value)
  ElMessage.success('已复制')
}
</script>