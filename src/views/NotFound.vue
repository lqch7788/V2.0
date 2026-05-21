<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <el-card class="text-center">
      <el-result icon="warning" title="404" sub-title="抱歉，您访问的页面不存在">
        <template #extra>
          <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
        </template>
      </el-result>
    </el-card>
  </div>
</template>

<script setup>
// 404 页面
</script>
