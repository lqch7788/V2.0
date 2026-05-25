<template>
  <div class="bg-white rounded-xl shadow-none border border-gray-100 hover:shadow-md transition-shadow p-4">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="rounded-lg p-2 bg-gradient-to-br from-blue-500 to-indigo-600">
          <el-icon :size="20" class="text-white">
            <Memo />
          </el-icon>
        </div>
        <span class="font-semibold text-gray-900">今日待办</span>
      </div>
      <span class="text-2xl font-bold text-blue-600">{{ stats.total }}</span>
    </div>
    <div class="space-y-2 text-sm">
      <div class="flex items-center justify-between">
        <span class="text-gray-500 flex items-center gap-1">
          <el-icon :size="12" class="text-emerald-500"><Grape /></el-icon>
          农事任务
        </span>
        <span class="font-medium">{{ stats.farming }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-gray-500 flex items-center gap-1">
          <el-icon :size="12" class="text-cyan-500"><Setting /></el-icon>
          设备维护
        </span>
        <span class="font-medium">{{ stats.equipment }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-gray-500 flex items-center gap-1">
          <el-icon :size="12" class="text-amber-500"><Calendar /></el-icon>
          采收处理
        </span>
        <span class="font-medium">{{ stats.harvest }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-gray-500 flex items-center gap-1">
          <el-icon :size="12" class="text-orange-500"><CircleCheck /></el-icon>
          待办审批
        </span>
        <span class="font-medium">{{ stats.approval }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { Memo, Grape, Setting, Calendar, CircleCheck } from '@element-plus/icons-vue'
import { useFarmTaskStore } from '@/stores'

const farmTaskStore = useFarmTaskStore()

onMounted(() => {
  if (farmTaskStore.tasks.length === 0) {
    farmTaskStore.fetchTasks()
  }
})

// 根据任务 type/typeName 计算今日待办分类统计
const stats = computed(() => {
  const tasks = farmTaskStore.tasks || []
  const pendingTasks = tasks.filter(t =>
    t.status !== 'completed' && t.status !== 'cancelled' && t.status !== 'abandoned'
  )
  const equipment = pendingTasks.filter(t =>
    (t.typeName && (t.typeName.includes('设备') || t.typeName.includes('维护'))) ||
    (t.type && (t.type.includes('equipment') || t.type.includes('maintenance')))
  ).length
  const harvest = pendingTasks.filter(t =>
    (t.typeName && t.typeName.includes('采收')) ||
    (t.type && t.type.includes('harvest'))
  ).length
  const approval = pendingTasks.filter(t =>
    (t.typeName && (t.typeName.includes('审批') || t.typeName.includes('审核'))) ||
    (t.type && (t.type.includes('approval') || t.type.includes('review')))
  ).length
  const farming = pendingTasks.length - equipment - harvest - approval

  return { total: pendingTasks.length, farming, harvest, equipment, approval }
})
</script>
