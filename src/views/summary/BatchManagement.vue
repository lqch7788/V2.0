<template>
  <!-- 批次管理页面 - 批次汇总/全链条追溯 二合一 TAB页 -->
  <div class="space-y-4">
    <PageHeader
      title="批次管理"
      description="种植批次全生命周期数据汇总与6环节全链条追溯"
    >
      <template #icon>
        <el-icon :size="24" color="white"><Guide /></el-icon>
      </template>
    </PageHeader>

    <!-- Tabs -->
    <div class="bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100">
      <el-tabs v-model="activeTab">
        <el-tab-pane name="batch">
          <template #label>
            <span class="flex items-center gap-2">
              <el-icon :size="16"><Box /></el-icon>
              批次汇总
            </span>
          </template>
          <BatchSummary v-if="activeTab === 'batch'" />
        </el-tab-pane>

        <el-tab-pane name="chain">
          <template #label>
            <span class="flex items-center gap-2">
              <el-icon :size="16"><Link /></el-icon>
              全链条追溯
            </span>
          </template>
          <ChainTraceability v-if="activeTab === 'chain'" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Guide, Box, Link } from '@element-plus/icons-vue'
import { PageHeader } from '@/components/summary'

import BatchSummary from './sub/BatchSummary.vue'
import ChainTraceability from './sub/ChainTraceability.vue'

const activeTab = ref('batch')
</script>
