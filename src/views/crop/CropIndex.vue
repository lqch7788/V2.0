<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">作物管理</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <el-card class="cursor-pointer hover:shadow-lg transition-shadow" @click="$router.push('/crop/seed-source')">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" class="text-white">
              <Goods />
            </el-icon>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">种源管理</h3>
            <p class="text-gray-500 text-sm">管理种源批次和库存</p>
          </div>
        </div>
      </el-card>

      <el-card class="cursor-pointer hover:shadow-lg transition-shadow" @click="$router.push('/crop/seedling')">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" class="text-white">
              <Sprout />
            </el-icon>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">育苗管理</h3>
            <p class="text-gray-500 text-sm">管理种苗培育和移栽</p>
          </div>
        </div>
      </el-card>

      <el-card class="cursor-pointer hover:shadow-lg transition-shadow" @click="$router.push('/crop/planting')">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
            <el-icon :size="24" class="text-white">
              <TreePine />
            </el-icon>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">种植管理</h3>
            <p class="text-gray-500 text-sm">管理种植批次和生产计划</p>
          </div>
        </div>
      </el-card>

      <el-card class="cursor-pointer hover:shadow-lg transition-shadow" @click="$router.push('/crop/harvest')">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <el-icon :size="24" class="text-white">
              <OfficeBuilding />
            </el-icon>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">采收入库</h3>
            <p class="text-gray-500 text-sm">管理采收记录和入库操作</p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 子路由出口 -->
    <div class="mt-6">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { Goods, Crop, OfficeBuilding } from '@element-plus/icons-vue'
</script>
