<template>
  <!-- 页面标题组件 -->
  <div class="bg-white rounded-xl p-6 shadow-sm">
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
        <slot name="icon">
          <el-icon :size="24" color="white"><component :is="iconComponent" /></el-icon>
        </slot>
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
        <p class="text-gray-500">{{ description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const props = defineProps({})
const router = useRouter()

// 图标组件（支持传入字符串名称或组件对象）
const iconComponent = computed(() => {
  if (!props.icon) return null
  if (typeof props.icon === 'string') {
    // 尝试解析为 Element Plus 图标
    const iconMap = {
      'LayoutDashboard': { render: () => null },
      'BarChart3': { render: () => null },
    }
    return iconMap[props.icon] || null
  }
  return props.icon
})

const handleBack = () => {
  if (props.backTo) {
    router.push(props.backTo)
  }
}
</script>
