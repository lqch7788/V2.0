<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">角色管理</h2>
    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <span>角色列表</span>
          <el-button type="primary">添加角色</el-button>
        </div>
      </template>
      <el-table :data="[]" stripe>
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="code" label="角色编码" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="status" label="状态" />
        <el-table-column label="操作" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
// 角色管理页面
</script>
