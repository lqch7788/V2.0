<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <el-icon :size="24" class="text-white"><Van /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">农事任务派发</h1>
            <p class="text-sm text-gray-500">统一管理农事任务、临时任务和智能派工</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab切换 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <!-- Tab列表 -->
      <div class="flex border-b border-gray-200">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors',
            activeTab === tab.key
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          ]"
        >
          <el-icon><component :is="tab.icon" /></el-icon>
          {{ tab.label }}
          <span v-if="activeTab === tab.key" class="ml-2 text-xs text-blue-500">
            {{ getDispatchModeDescription(tab.key) }}
          </span>
        </button>
      </div>

      <!-- Tab内容 -->
      <div class="p-6">
        <!-- 农事任务 -->
        <div v-if="activeTab === 'farm'">
          <p class="text-gray-500 text-center py-8">农事任务组件 - 待实现</p>
        </div>

        <!-- 临时任务 -->
        <div v-else-if="activeTab === 'tempTask'">
          <p class="text-gray-500 text-center py-8">临时任务组件 - 待实现</p>
        </div>

        <!-- 智能派工 -->
        <div v-else-if="activeTab === 'smart'">
          <p class="text-gray-500 text-center py-8">智能派工组件 - 待实现</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Van, Clock, MagicStick } from '@element-plus/icons-vue'

// 派发模式类型: 'farm' | 'tempTask' | 'smart'

// Tab配置
const tabs = [
  { key: 'farm', label: '农事任务', icon: Van },
  { key: 'tempTask', label: '临时任务', icon: Clock },
  { key: 'smart', label: '智能派工', icon: MagicStick },
]

const activeTab = ref('farm')

// 派发模式描述配置
const DISPATCH_MODE_CONFIG = {
  farm: { description: '计划任务' },
  tempTask: { description: '临时任务' },
  smart: { description: 'AI智能调度' },
}

const getDispatchModeDescription = (mode) => {
  return DISPATCH_MODE_CONFIG[mode]?.description || ''
}
</script>
