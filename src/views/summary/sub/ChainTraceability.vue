<template>
  <!-- 全链条追溯子页面 -->
  <div class="space-y-4">
    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 class="text-base font-semibold text-gray-800 mb-4">全链条追溯</h3>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex items-center justify-center h-64">
        <el-icon class="is-loading" :size="32" color="#10b981"><Loading /></el-icon>
      </div>

      <!-- 暂无数据 -->
      <div v-else class="flex flex-col items-center justify-center h-64 text-gray-400">
        <el-icon :size="48"><Link /></el-icon>
        <span class="text-sm mt-2">全链条追溯功能开发中...</span>
        <p class="text-xs text-gray-400 mt-1">敬请期待6环节全链条追溯功能</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { Loading, Link } from '@element-plus/icons-vue'
import { useSummaryStore } from '@/stores/modules/summary'

const summaryStore = useSummaryStore()
const isLoading = computed(() => summaryStore.isLoading)

onMounted(() => {
  // 加载全链条数据
})
</script>

<style scoped>
.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
