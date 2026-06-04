<template>
  <div class="space-y-4">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center gap-3">
        <a
          href="/settings"
          class="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hover:from-gray-200 hover:to-gray-300 transition-colors"
          title="返回系统设置"
        >
          <el-icon :size="20" color="#4b5563">
            <ArrowLeft />
          </el-icon>
        </a>
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" color="white"><Lock /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">用户权限管理</h1>
          <p class="text-gray-500">组织架构 · 角色定义 · 权限矩阵 · 用户管理 · 权限覆盖</p>
        </div>
      </div>
    </div>

    <!-- TAB 导航栏 -->
    <div class="bg-white rounded-xl shadow-none p-1">
      <div class="flex items-center gap-1 flex-wrap">
        <el-button
          v-for="tab in TABS"
          :key="tab.key"
          :type="activeTab === tab.key ? 'primary' : ''"
          :class="activeTab === tab.key ? '' : 'text-gray-500'"
          class-name="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
          @click="activeTab = tab.key"
        >
          <el-icon :size="16">
            <component :is="tab.icon" />
          </el-icon>
          <span class="hidden sm:inline">{{ tab.label }}</span>
        </el-button>
      </div>
    </div>

    <!-- TAB 内容区 -->
    <div>
      <OrganizationManagement v-if="activeTab === 'organizations'" />
      <RoleManagement v-else-if="activeTab === 'roles'" />
      <AuthorityConfiguration v-else-if="activeTab === 'authority'" />
      <UserManagement v-else-if="activeTab === 'users'" />
      <UserAuthorityConfig v-else-if="activeTab === 'user-authority'" />
      <!-- V1.1 UserPermissionHub 5 tab 布局（与 V1.1 一致），V2.0 自创的 user-base tab 已删除 -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  Lock,
  OfficeBuilding,
  User,
  Share,
  Key,
  ArrowLeft
} from '@element-plus/icons-vue'

// 子组件
import OrganizationManagement from './OrganizationManagement.vue'
import RoleManagement from './RoleManagement.vue'
import AuthorityConfiguration from './AuthorityConfiguration.vue'
import UserManagement from './UserManagement.vue'
import UserAuthorityConfig from './UserAuthorityConfig.vue'
// V2.0 自创的 UserBasePermission 已删除（V1.1 无此 tab）

// Tab配置
const TABS = [
  { key: 'organizations', label: '组织管理', icon: OfficeBuilding },
  { key: 'roles', label: '角色管理', icon: Lock },
  { key: 'authority', label: '权限配置', icon: Key },
  { key: 'users', label: '用户管理', icon: User },
  { key: 'user-authority', label: '用户权限覆盖', icon: Share }
  // V2.0 自创的 user-base tab 已删除（V1.1 无此功能）
]

// 当前激活的Tab
const activeTab = ref('organizations')
</script>
