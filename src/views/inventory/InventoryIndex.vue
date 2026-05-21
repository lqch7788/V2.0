<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">库存管理</h2>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="6"><el-statistic title="物料总数" :value="0" /></el-col>
        <el-col :span="6"><el-statistic title="库存预警" :value="0" /></el-col>
        <el-col :span="6"><el-statistic title="出库" :value="0" /></el-col>
        <el-col :span="6"><el-statistic title="入库" :value="0" /></el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
// 库存管理首页
</script>
