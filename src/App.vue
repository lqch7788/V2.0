<template>
  <router-view v-if="isLoginPage || isHomePage" />
  <Layout v-else>
    <router-view />
  </Layout>
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
