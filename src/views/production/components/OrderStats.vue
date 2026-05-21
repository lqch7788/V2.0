<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- 全部订单 -->
    <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-emerald-500">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500 mb-1">全部订单</p>
          <p class="text-2xl font-bold text-gray-900">{{ data?.total || 0 }}</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
          <el-icon :size="24" color="#10b981">
            <Document />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 进行中 -->
    <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500 mb-1">进行中</p>
          <p class="text-2xl font-bold text-gray-900">{{ data?.inProgress || 0 }}</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <el-icon :size="24" color="#3b82f6">
            <Loading />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 已完成 -->
    <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500 mb-1">已完成</p>
          <p class="text-2xl font-bold text-gray-900">{{ data?.completed || 0 }}</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <el-icon :size="24" color="#22c55e">
            <CircleCheck />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 本月新增 -->
    <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500 mb-1">本月新增</p>
          <p class="text-2xl font-bold text-gray-900">{{ data?.thisMonth || 0 }}</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
          <el-icon :size="24" color="#a855f7">
            <Plus />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Document, Loading, CircleCheck, Plus } from '@element-plus/icons-vue'

defineProps({})
</script>
