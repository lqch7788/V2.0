<template>
  <div class="app-layout">
    <Sidebar
      :collapsed="sidebarCollapsed"
      @update:collapsed="sidebarCollapsed = $event"
      @menu-select="handleMenuSelect"
    />

    <HeaderLayout :title="pageTitle" @command="handleUserCommand">
      <template #left>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-if="pageTitle !== '首页'">{{ pageTitle }}</el-breadcrumb-item>
        </el-breadcrumb>
      </template>
    </HeaderLayout>

    <div :class="['main-wrapper', { 'sidebar-collapsed': sidebarCollapsed }]">
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from './Sidebar.vue'
import HeaderLayout from './Header.vue'

const route = useRoute()
const router = useRouter()

const sidebarCollapsed = ref(false)
const pageTitle = computed(() => route.meta?.title || '首页')

const handleMenuSelect = (index) => {
  router.push(index)
}

const handleUserCommand = (command) => {
  if (command === 'logout') {
    router.push('/login')
  } else if (command === 'settings') {
    router.push('/settings')
  } else if (command === 'profile') {
    router.push('/profile')
  }
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: #f3f4f6;
}

.main-wrapper {
  margin-left: 208px;
  transition: margin-left 0.3s ease;
  min-height: calc(100vh - 48px);
}

.main-wrapper.sidebar-collapsed {
  margin-left: 64px;
}

.main-content {
  padding-top: 48px;
  padding-left: 16px;
  padding-right: 16px;
  padding-bottom: 16px;
}
</style>