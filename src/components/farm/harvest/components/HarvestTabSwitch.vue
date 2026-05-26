<template>
  <!-- 采收入库页面Tab切换组件 - 从V1.1 HarvestTabSwitch.tsx 1:1迁移 -->
  <div class="flex items-center gap-4">
    <template v-if="showCodeGen">
      <el-button type="primary" size="small" @click="$emit('code-rule-click')">编码规则 &gt;&gt;</el-button>
      <span class="text-sm font-bold text-gray-900">产品编码生成</span>
      <el-button :icon="codeGenExpanded ? ArrowDown : ArrowRight" circle @click="$emit('code-gen-toggle')" />
    </template>
  </div>
</template>

<script setup>
import { ArrowDown, ArrowRight } from '@element-plus/icons-vue'

defineProps({
  codeGenExpanded: { type: Boolean, default: false },
  showCodeGen: { type: Boolean, default: false },
})

defineEmits(['code-gen-toggle', 'code-rule-click'])
</script>
