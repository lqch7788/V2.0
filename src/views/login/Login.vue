<template>
  <div class="min-h-screen flex">
    <!-- 左侧背景图 -->
    <div class="hidden lg:flex lg:w-1/2 relative">
      <img
        src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        alt="农业背景"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-green-900/60"></div>

      <!-- 左侧内容 -->
      <div class="relative z-10 flex flex-col justify-center items-center w-full">
        <img
          src="/弘智耘LOGO.png"
          alt="弘智耘Logo"
          class="w-48 h-48 mb-8 object-contain"
        />
        <h1 class="text-4xl font-bold text-white mb-4">弘讯智能种植云</h1>
        <p class="text-white/80 text-lg">Techmation Intelligent Crop Cloud</p>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="w-full lg:w-1/2 flex flex-col justify-center px-8 py-12 bg-gradient-to-br from-gray-50 to-gray-100">
      <!-- 左侧标题 - 左上角 -->
      <div class="flex items-end gap-3 mb-6">
        <img
          src="/弘智耘LOGO.png"
          alt="弘智耘Logo"
          class="w-14 object-contain -mt-16"
        />
        <div class="-mt-3">
          <h1 class="text-2xl font-bold text-gray-900">弘讯智能种植云</h1>
          <p class="text-sm text-gray-500">Techmation Intelligent Crop Cloud</p>
        </div>
      </div>

      <div class="w-full max-w-md mx-auto flex-1 flex flex-col justify-center">
        <!-- 登录标题 -->
        <div class="mb-8 text-center">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">账号密码登录</h2>
          <p class="text-gray-500">请输入您的账号和密码</p>
        </div>

        <!-- 用户名输入框 -->
        <div class="mb-5">
          <label class="block text-sm font-medium text-gray-700 mb-2">账号</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <el-icon :size="20" class="text-gray-400"><User /></el-icon>
            </div>
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              class="login-input"
            />
          </div>
        </div>

        <!-- 密码输入框 -->
        <div class="mb-5">
          <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <el-icon :size="20" class="text-gray-400"><Lock /></el-icon>
            </div>
            <el-input
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              class="login-input"
            />
            <el-icon
              :size="20"
              class="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 z-10"
              @click="showPassword = !showPassword"
            >
              <component :is="showPassword ? 'Hide' : 'View'" />
            </el-icon>
          </div>
        </div>

        <!-- 记住密码 -->
        <div class="flex items-center justify-between mb-6">
          <label class="flex items-center cursor-pointer">
            <el-checkbox v-model="rememberPassword" class="text-sm text-gray-600" />
            <span class="ml-2 text-sm text-gray-600">记住密码</span>
          </label>
          <a href="#" class="text-sm text-emerald-600 hover:text-emerald-700">忘记密码？</a>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <!-- 登录按钮 -->
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          class="login-button"
          @click="handleLogin"
        >
          {{ loading ? '登录中...' : '登 录' }}
        </el-button>

        <!-- 底部版权信息 -->
        <div class="mt-8 text-center text-gray-400 text-xs leading-relaxed">
          <p>版权 © 2013-2026, 宁波弘讯软件开发有限公司, 保留所有权利。 浙ICP备20003786号-7</p>
          <p class="mt-1">设计 : 宁波弘讯软件开发有限公司</p>
          <p class="mt-1">框架(Foil) 版本: v1.1.22|tmCropCloud 版本: v3.0.0</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, View, Hide } from '@element-plus/icons-vue'

const router = useRouter()

const loginForm = reactive({
  username: '',
  password: ''
})

const rememberPassword = ref(false)
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''

  if (!loginForm.username || !loginForm.password) {
    error.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  try {
    // 模拟登录 - 实际应该调用后端API
    // 使用陆启闯自动登录（密码123456）作为默认测试账号
    if (loginForm.username === '陆启闯' && loginForm.password === '123456') {
      // 登录成功，跳转到基地总览页面
      localStorage.setItem('token', 'mock-token')
      localStorage.setItem('username', loginForm.username)
      router.push('/dashboard')
    } else {
      error.value = '用户名或密码错误'
    }
  } catch (e) {
    console.error('登录请求失败:', e)
    error.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-input :deep(.el-input__wrapper) {
  padding-left: 12px;
  padding-right: 12px;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: none;
  background-color: white;
}

.login-input :deep(.el-input__wrapper:hover) {
  border-color: #10b981;
}

.login-input :deep(.el-input__wrapper.is-focus) {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.login-input :deep(.el-input__inner) {
  padding-left: 0;
  padding-right: 0;
}

.login-button {
  width: 100%;
  height: 48px;
  background: linear-gradient(to right, #10b981, #059669);
  border: none;
  border-radius: 0.75rem;
  font-size: 16px;
  font-weight: 500;
}

.login-button:hover {
  background: linear-gradient(to right, #059669, #047857);
}

.login-button.is-disabled {
  background: linear-gradient(to right, #10b981, #059669);
  opacity: 0.6;
}
</style>
