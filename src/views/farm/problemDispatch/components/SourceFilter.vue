<!--
  问题来源筛选
  对标 V1.1 src/components/farm/problemDispatch/components/SourceFilter.tsx
-->
<template>
  <el-radio-group v-model="selected" @change="$emit('change', $event)">
    <el-radio-button value="">全部</el-radio-button>
    <el-radio-button value="inspection">巡检</el-radio-button>
    <el-radio-button value="feedback">反馈</el-radio-button>
    <el-radio-button value="report">上报</el-radio-button>
    <el-radio-button value="system">系统</el-radio-button>
  </el-radio-group>
</template>

<script setup>
import { ref } from 'vue'

const selected = ref('')

defineEmits(['change'])
</script>