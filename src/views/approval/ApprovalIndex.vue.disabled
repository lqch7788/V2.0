<template>
  <div class="p-6 space-y-6">
    <h2 class="text-xl font-bold mb-4">审批管理</h2>
    <el-card>
      <el-tabs>
        <el-tab-pane label="待审批">
          <div class="space-y-4">
            <!-- 快捷入口卡片 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                @click="router.push('/approval/farm')"
                class="p-4 border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <el-icon :size="20" class="text-emerald-600"><Edit /></el-icon>
                  </div>
                  <div>
                    <h3 class="font-medium text-gray-900">农事审批</h3>
                    <p class="text-sm text-gray-500">任务派发、临时任务等审批</p>
                  </div>
                </div>
              </div>
              <div
                @click="router.push('/approval/work-order')"
                class="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <el-icon :size="20" class="text-blue-600"><DocumentCopy /></el-icon>
                  </div>
                  <div>
                    <h3 class="font-medium text-gray-900">工单审批</h3>
                    <p class="text-sm text-gray-500">工单列表与发布审批</p>
                  </div>
                </div>
              </div>
              <div
                @click="router.push('/approval/work-log')"
                class="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 cursor-pointer transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <el-icon :size="20" class="text-purple-600"><Document /></el-icon>
                  </div>
                  <div>
                    <h3 class="font-medium text-gray-900">工作日志审批</h3>
                    <p class="text-sm text-gray-500">工作日志记录审批</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="已通过">暂无数据</el-tab-pane>
        <el-tab-pane label="已驳回">暂无数据</el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Edit, DocumentCopy, Document } from '@element-plus/icons-vue'

const router = useRouter()
</script>
