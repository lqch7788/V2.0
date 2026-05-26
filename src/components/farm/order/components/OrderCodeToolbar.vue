<template>
  <!-- 订单编码工具栏 - 从V1.1 OrderCodeToolbar.tsx 1:1迁移 -->
  <div class="flex items-center gap-4">
    <el-button type="primary" size="small" @click="$emit('codeRuleClick')">
      编码规则 &gt;&gt;
    </el-button>
    <span class="text-sm font-bold text-gray-900">产品编码生成</span>
    <el-button
      :icon="codeGenExpanded ? ArrowDown : ArrowRight"
      circle
      size="small"
      @click="$emit('codeGenToggle')"
      :title="codeGenExpanded ? '收起' : '展开'"
    />
  </div>
</template>

<script setup>
import { ArrowDown, ArrowRight } from '@element-plus/icons-vue'

defineProps({
  codeGenExpanded: { type: Boolean, default: false },
})

defineEmits(['codeGenToggle', 'codeRuleClick'])
</script>
