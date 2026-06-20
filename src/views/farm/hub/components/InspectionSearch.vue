<!--
  巡检搜索组件
  对标 V1.1 src/components/farm/hub/components/InspectionSearch.tsx
-->
<template>
  <div class="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2">
    <el-input v-model="keyword" placeholder="搜索巡检记录" clearable class="!w-64">
      <template #prefix><el-icon><Search /></el-icon></template>
    </el-input>
    <el-select v-model="status" placeholder="状态" clearable class="!w-32">
      <el-option label="正常" value="normal" />
      <el-option label="有问题" value="issue" />
    </el-select>
    <el-button type="primary" @click="$emit('search', { keyword, status })">
      <el-icon><Search /></el-icon>搜索
    </el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

const emit = defineEmits(['search'])

const keyword = ref('')
const status = ref('')
</script>