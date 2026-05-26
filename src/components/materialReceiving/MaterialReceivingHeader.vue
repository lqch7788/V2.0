<template>
  <div class="bg-white rounded-xl p-6 shadow-none">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
          <el-icon :size="24" color="#fff"><List /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">生产领料</h1>
          <p class="text-gray-500">生产领料记录管理</p>
        </div>
      </div>
    </div>

    <!-- Tab切换区域 -->
    <div class="mt-6">
      <div class="flex gap-8 border-b border-gray-200">
        <el-button
          v-for="tab in TABS"
          :key="tab.key"
          :type="activeTab === tab.key ? 'primary' : 'default'"
          :plain="activeTab !== tab.key"
          text
          @click="onTabChange(tab.key)"
          class="flex items-center gap-2 pb-3 text-base font-semibold transition-all relative rounded-none border-none"
          :class="activeTab === tab.key ? 'text-emerald-600' : 'text-gray-500'"
        >
          {{ tab.label }}
          <div v-if="activeTab === tab.key" class="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { List } from '@element-plus/icons-vue'

const TABS = [
  { key: 'application', label: '申请领料' },
  { key: 'execute', label: '领料出库' },
  { key: 'statistics', label: '领料统计' },
  { key: 'cost', label: '成本核算' },
]

const props = defineProps({
  activeTab: { type: String, default: 'application' }
})

const emit = defineEmits(['tab-change'])

const onTabChange = (tab) => {
  emit('tab-change', tab)
}
</script>
