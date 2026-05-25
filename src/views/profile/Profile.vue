<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" color="white"><User /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">个人中心</h1>
          <p class="text-gray-500">管理您的账户信息和查看工作概览</p>
        </div>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="font-semibold text-gray-900 mb-4">基本信息</h2>
        <div class="flex items-start gap-6">
          <div class="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-white text-2xl font-bold">LQC</div>
          <div class="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label class="text-xs text-gray-500">姓名</label>
              <p class="font-medium text-gray-900">陆启闯</p>
            </div>
            <div>
              <label class="text-xs text-gray-500">工号</label>
              <p class="font-medium text-gray-900">U001</p>
            </div>
            <div>
              <label class="text-xs text-gray-500">所属部门</label>
              <p class="font-medium text-gray-900">生产部</p>
            </div>
            <div>
              <label class="text-xs text-gray-500">职位</label>
              <p class="font-medium text-gray-900">经理</p>
            </div>
            <div>
              <label class="text-xs text-gray-500">所属公司</label>
              <p class="font-medium text-gray-900">宁波帮帮忙公司</p>
            </div>
            <div>
              <label class="text-xs text-gray-500">角色</label>
              <p class="font-medium text-emerald-600">系统管理员</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 账户安全 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="font-semibold text-gray-900 mb-4">账户安全</h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-700">登录密码</span>
            <span class="text-xs text-gray-500">上次修改：30天前</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-700">手机绑定</span>
            <span class="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">已绑定</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { User } from '@element-plus/icons-vue'
</script>
