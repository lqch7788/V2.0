<!--
  通用编码工具栏
  对标 V1.1 src/components/farm/common/CodeToolbar.tsx
-->
<template>
  <div class="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2 flex-wrap">
    <el-input v-model="prefix" placeholder="编码前缀" class="!w-32">
      <template #prepend>前缀</template>
    </el-input>
    <el-input-number v-model="startNum" :min="1" :max="9999" placeholder="起始数" />
    <el-button @click="handleGenerate">
      <el-icon><MagicStick /></el-icon>
      生成编码
    </el-button>
    <el-button v-if="generated.length" @click="copyAll">
      <el-icon><CopyDocument /></el-icon>
      复制全部
    </el-button>
    <slot />
  </div>
  <div v-if="generated.length" class="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-2 max-h-32 overflow-y-auto">
    <div class="text-xs text-emerald-700 mb-1">已生成 {{ generated.length }} 个编码：</div>
    <div class="font-mono text-sm text-gray-800 flex flex-wrap gap-2">
      <span v-for="code in generated" :key="code" class="px-2 py-0.5 bg-white rounded">{{ code }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { CopyDocument, MagicStick } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  count: { type: Number, default: 1 },
  digit: { type: Number, default: 3 },
})

const emit = defineEmits(['generated'])

const prefix = ref('')
const startNum = ref(1)
const generated = ref([])

const handleGenerate = () => {
  generated.value = []
  for (let i = 0; i < props.count; i++) {
    const num = String(startNum.value + i).padStart(props.digit, '0')
    generated.value.push(`${prefix.value}${num}`)
  }
  emit('generated', generated.value)
  ElMessage.success(`已生成 ${generated.value.length} 个编码`)
}

const copyAll = () => {
  navigator.clipboard.writeText(generated.value.join('\n'))
  ElMessage.success('已复制到剪贴板')
}
</script>