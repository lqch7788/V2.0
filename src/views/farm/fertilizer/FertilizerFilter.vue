<!--
  肥料筛选组件
  对标 V1.1 src/components/farm/fertilizer/FertilizerFilter.tsx
-->
<template>
  <div class="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2 flex-wrap">
    <el-input v-model="keyword" placeholder="搜索名称/编码" clearable class="!w-48">
      <template #prefix><el-icon><Search /></el-icon></template>
    </el-input>
    <el-select v-model="type" placeholder="类型" clearable class="!w-32">
      <el-option label="氮肥" value="氮肥" />
      <el-option label="磷肥" value="磷肥" />
      <el-option label="钾肥" value="钾肥" />
      <el-option label="复合肥" value="复合肥" />
    </el-select>
    <el-button type="primary" @click="$emit('change', { keyword, type })">
      <el-icon><Search /></el-icon>查询
    </el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

const keyword = ref('')
const type = ref('')
</script>