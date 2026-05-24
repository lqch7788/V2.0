<template>
  <!-- 页面标题组件 - 与V1.1一致 -->
  <div class="bg-white rounded-xl p-6 shadow-none">
    <div class="flex items-center gap-3">
      <div
        v-if="backTo"
        class="w-12 h-12 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
        :title="backTitle || '返回'"
        @click="handleBack"
      >
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
        <slot name="icon" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
        <p class="text-gray-500">{{ description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const props = defineProps({
  // 页面标题
  title: {
    type: String,
    required: true
  },
  // 页面描述
  description: {
    type: String,
    default: ''
  },
  // 返回链接
  backTo: {
    type: String,
    default: ''
  },
  // 返回按钮标题
  backTitle: {
    type: String,
    default: ''
  },
  // 图标（支持传入组件）
  icon: {
    type: [String, Object],
    default: null
  }
})

const router = useRouter()

const handleBack = () => {
  if (props.backTo) {
    router.push(props.backTo)
  }
}
</script>
