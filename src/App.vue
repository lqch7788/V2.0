<template>
  <Layout v-if="!isLoginPage && !isHomePage">
    <router-view />
  </Layout>
  <router-view v-else />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Layout from '@/components/layout/Layout.vue'

const route = useRoute()

// 检查是否是登录页面
const isLoginPage = computed(() => route.path === '/login')

// 检查是否是主页
const isHomePage = computed(() => route.path === '/')
</script>
