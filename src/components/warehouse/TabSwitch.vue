<template>
  <div class="flex items-center gap-4">
    <div class="flex gap-2">
      <el-button
        :type="activeTab === 'inbound' ? 'primary' : 'default'"
        :plain="activeTab !== 'inbound'"
        size="small"
        @click="onTabChange('inbound')"
      >
        物料入库
      </el-button>
      <el-button
        :type="activeTab === 'overview' ? 'primary' : 'default'"
        :plain="activeTab !== 'overview'"
        size="small"
        @click="onTabChange('overview')"
      >
        库存总览
      </el-button>
    </div>
    <template v-if="showCodeGen">
      <div class="h-6 w-px bg-gray-500"></div>
      <el-button size="small" @click="onCodeRuleClick">编码规则 &gt;&gt;</el-button>
      <span class="text-sm font-bold text-gray-900">物料编码生成</span>
      <el-button size="small" text @click="onCodeGenToggle" :title="codeGenExpanded ? '收起' : '展开'">
        <el-icon v-if="codeGenExpanded"><ArrowDown /></el-icon>
        <el-icon v-else><ArrowRight /></el-icon>
      </el-button>
    </template>
  </div>
</template>

<script setup>
import { ArrowDown, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  activeTab: { type: String, default: 'overview' },
  codeGenExpanded: { type: Boolean, default: false },
  showCodeGen: { type: Boolean, default: false }
})

const emit = defineEmits(['tab-change', 'code-gen-toggle', 'code-rule-click'])

const onTabChange = (tab) => {
  emit('tab-change', tab)
}

const onCodeGenToggle = () => {
  emit('code-gen-toggle')
}

const onCodeRuleClick = () => {
  emit('code-rule-click')
}
</script>
