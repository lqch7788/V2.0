<template>
  <Layout v-if="!isLoginPage && !isHomePage">
    <router-view />
  </Layout>
  <router-view v-else />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Layout from '@/components/layout/Layout.vue'
import { useAuthStore } from '@/stores/modules/auth'

const route = useRoute()

// 检查是否是登录页面
const isLoginPage = computed(() => route.path === '/login')

// 检查是否是主页
const isHomePage = computed(() => route.path === '/')

// ★ V1.1 App.tsx L378-388 1:1 翻译：应用启动时恢复登录状态（token 持久化验证）
onMounted(async () => {
  const authState = useAuthStore()
  // 如果已登录则验证 token
  if (authState.isAuthenticated && authState.token) {
    authState.verifyToken()
  } else {
    // 默认使用陆启闯自动登录（密码 123456，与 V1.1 Login.vue L149 一致）
    authState.login('陆启闯', '123456')
  }
})
</script>
