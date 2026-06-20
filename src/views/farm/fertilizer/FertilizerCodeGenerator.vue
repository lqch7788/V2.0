<!--
  肥料编码生成器
  对标 V1.1 src/components/farm/fertilizer/FertilizerCodeGenerator.tsx
-->
<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <h3 class="font-semibold mb-3 flex items-center gap-2">
      <el-icon><MagicStick /></el-icon>
      肥料编码生成
    </h3>
    <el-form :model="form" label-width="100px">
      <el-form-item label="类别">
        <el-select v-model="form.category" placeholder="选择类别" class="!w-48">
          <el-option label="氮肥" value="N" />
          <el-option label="磷肥" value="P" />
          <el-option label="钾肥" value="K" />
          <el-option label="复合肥" value="C" />
        </el-select>
      </el-form-item>
      <el-form-item label="序号">
        <el-input-number v-model="form.sequence" :min="1" :max="9999" />
      </el-form-item>
      <el-form-item label="生成结果">
        <span class="text-2xl font-bold text-emerald-700 font-mono">{{ generatedCode }}</span>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleGenerate">生成</el-button>
        <el-button @click="handleCopy" :disabled="!generatedCode">复制</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { MagicStick } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const form = reactive({ category: 'N', sequence: 1 })

const generatedCode = computed(() => `FER${form.category}${String(form.sequence).padStart(4, '0')}`)

const handleGenerate = () => ElMessage.success(`已生成：${generatedCode.value}`)

const handleCopy = () => {
  navigator.clipboard.writeText(generatedCode.value)
  ElMessage.success('已复制')
}
</script>