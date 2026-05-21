<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">用户管理</h2>
    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <span>用户列表</span>
          <el-button type="primary">添加用户</el-button>
        </div>
      </template>
      <el-table :data="[]" stripe>
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="角色" />
        <el-table-column prop="status" label="状态" />
        <el-table-column label="操作" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
// 用户管理页面
</script>
