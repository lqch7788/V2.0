<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">人工管理</h2>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="6"><el-statistic title="今日在岗" :value="0" /></el-col>
        <el-col :span="6"><el-statistic title="请假" :value="0" /></el-col>
        <el-col :span="6"><el-statistic title="旷工" :value="0" /></el-col>
        <el-col :span="6"><el-statistic title="临时工" :value="0" /></el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
// 人工管理首页
</script>
