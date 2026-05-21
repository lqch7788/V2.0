<template>
  <div class="flex items-center gap-4">
    <el-button type="primary" size="small" @click="onCodeRuleClick">
      编码规则 &gt;&gt;
    </el-button>
    <template v-if="showCodeGenToggle">
      <span class="text-sm font-bold text-gray-900">产品编码生成</span>
      <el-button
        text
        @click="onCodeGenToggle"
        :title="codeGenExpanded ? '收起' : '展开'"
      >
        <el-icon v-if="codeGenExpanded" :size="24" class="text-gray-600 font-bold"><ArrowDown /></el-icon>
        <el-icon v-else :size="20" class="text-gray-600 font-bold"><ArrowRight /></el-icon>
      </el-button>
    </template>
  </div>
</template>

<script setup>
import { ArrowDown, ArrowRight } from '@element-plus/icons-vue'

defineProps({"showCodeGenToggle":"true"})
</script>
