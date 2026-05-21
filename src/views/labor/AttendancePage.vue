<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">考勤管理</h2>
    <el-card>
      <el-calendar v-model="currentDate" />
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const currentDate = ref(new Date())
</script>
