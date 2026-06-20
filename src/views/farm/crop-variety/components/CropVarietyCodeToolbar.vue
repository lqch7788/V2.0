<!--
  作物品种编码工具栏
  对标 V1.1 src/components/farm/crop-variety/components/CropVarietyCodeToolbar.tsx
-->
<template>
  <div class="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2 flex-wrap">
    <el-input v-model="prefix" placeholder="编码前缀" class="!w-32" />
    <el-input-number v-model="startNum" :min="1" :max="9999" placeholder="起始" />
    <el-select v-model="category" placeholder="类别" clearable class="!w-32">
      <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
    </el-select>
    <el-button type="primary" @click="handleGenerate">
      <el-icon><MagicStick /></el-icon>生成
    </el-button>
    <div v-if="generated.length" class="ml-2 text-xs text-emerald-700">
      已生成 {{ generated.length }} 个编码
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { MagicStick } from '@element-plus/icons-vue'

const emit = defineEmits(['generated'])

const prefix = ref('')
const startNum = ref(1)
const category = ref('')
const generated = ref([])
const categories = ['蔬菜', '水果', '粮食', '经济作物', '花卉']

const handleGenerate = () => {
  generated.value = []
  for (let i = 0; i < 10; i++) {
    const num = String(startNum.value + i).padStart(4, '0')
    const catCode = category.value ? category.value.charAt(0) : 'V'
    generated.value.push(`${prefix.value}${catCode}${num}`)
  }
  emit('generated', generated.value)
}
</script>