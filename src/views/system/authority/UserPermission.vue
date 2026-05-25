<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center gap-3">
        <router-link
          to="/settings"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="返回系统设置"
        >
          <el-icon :size="24" color="#4b5563">
            <ArrowLeft />
          </el-icon>
        </router-link>
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <el-icon :size="24" color="white">
            <Lock />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">用户权限管理</h1>
          <p class="text-gray-500">权限管理系统已升级，请使用以下新功能模块</p>
        </div>
      </div>
    </div>

    <!-- 提示信息 -->
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <p class="text-sm text-amber-800">
        <strong>提示：</strong>旧版权限管理功能已迁移至全新的组织与权限管理系统。以下列出所有新的权限管理入口，请根据需要选择对应功能。
      </p>
    </div>

    <!-- 权限管理入口卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <router-link
        v-for="item in authorityLinks"
        :key="item.path"
        :to="item.path"
        class="bg-white rounded-xl p-6 shadow-none border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
      >
        <div class="flex items-start gap-4">
          <div :class="`p-3 rounded-xl ${item.bgColor} group-hover:scale-110 transition-transform`">
            <el-icon :size="24" :color="item.iconColor">
              <component :is="item.icon" />
            </el-icon>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                {{ item.label }}
              </h3>
              <el-icon :size="16" class="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all">
                <ArrowRight />
              </el-icon>
            </div>
            <p class="text-sm text-gray-500 mt-1">{{ item.desc }}</p>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  OfficeBuilding,
  Key,
  User,
  Setting
} from '@element-plus/icons-vue'

// 权限管理入口配置
const authorityLinks = ref([
  {
    icon: OfficeBuilding,
    label: '组织管理',
    path: '/settings/organizations',
    desc: '管理组织架构树形结构，支持公司/基地/区域/部门/车间层级',
    bgColor: 'bg-blue-50',
    iconColor: '#2563eb',
  },
  {
    icon: Lock,
    label: '角色管理',
    path: '/settings/roles',
    desc: '定义系统角色，关联所属组织，配置角色权限矩阵',
    bgColor: 'bg-purple-50',
    iconColor: '#9333ea',
  },
  {
    icon: Key,
    label: '权限配置',
    path: '/settings/authority-config',
    desc: '配置工序菜单与角色权限矩阵，管理数据权限范围',
    bgColor: 'bg-orange-50',
    iconColor: '#ea580c',
  },
  {
    icon: User,
    label: '用户管理',
    path: '/settings/users',
    desc: '管理用户账号、个人信息、角色分配与启用/停用',
    bgColor: 'bg-emerald-50',
    iconColor: '#059669',
  },
  {
    icon: Setting,
    label: '用户权限覆盖',
    path: '/settings/user-authority',
    desc: '为特定用户设置权限覆盖（允许/拒绝），优先级高于角色权限',
    bgColor: 'bg-cyan-50',
    iconColor: '#0891b2',
  },
])
</script>
