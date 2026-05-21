<template>
  <div class="bg-white rounded-xl p-6 shadow-none border border-gray-100">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-semibold text-gray-900">今日任务</h3>
      <router-link to="/tasks" class="text-sm text-emerald-600 hover:text-emerald-700">查看全部</router-link>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <tr class="border-b border-blue-600">
            <th class="text-left py-3 px-4 text-sm font-semibold whitespace-nowrap">任务名称</th>
            <th class="text-left py-3 px-4 text-sm font-semibold whitespace-nowrap">区域</th>
            <th class="text-left py-3 px-4 text-sm font-semibold whitespace-nowrap">优先级</th>
            <th class="text-left py-3 px-4 text-sm font-semibold whitespace-nowrap">状态</th>
            <th class="text-left py-3 px-4 text-sm font-semibold whitespace-nowrap">负责人</th>
            <th class="text-left py-3 px-4 text-sm font-semibold whitespace-nowrap">计划时长</th>
            <th class="text-left py-3 px-4 text-sm font-semibold whitespace-nowrap">截止日期</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <tr v-for="task in tasks.slice(0, 4)" :key="task.id" class="border-b border-gray-100 hover:bg-blue-100 transition-colors">
            <td class="py-3 px-4 whitespace-nowrap">
              <span class="text-sm font-medium text-gray-900">{{ task.title }}</span>
            </td>
            <td class="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{{ task.greenhouseName }}</td>
            <td class="py-3 px-4 whitespace-nowrap">
              <span :class="['text-xs px-2 py-1 rounded-full', getPriorityClass(task.priority)]">
                {{ getPriorityText(task.priority) }}
              </span>
            </td>
            <td class="py-3 px-4 whitespace-nowrap">
              <span :class="['text-xs px-2 py-1 rounded-full', getStatusClass(task.status)]">
                {{ getStatusText(task.status) }}
              </span>
            </td>
            <td class="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{{ task.assigneeName }}</td>
            <td class="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{{ task.workDuration }}小时</td>
            <td class="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{{ task.dueDate }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>

defineProps({
  tasks: {
    type: Array,
    default: () => []
  }
})

const getPriorityClass = (priority) => {
  switch (priority) {
    case 'urgent': return 'text-red-600 bg-red-50'
    case 'high': return 'text-orange-600 bg-orange-50'
    case 'normal': return 'text-blue-600 bg-blue-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

const getPriorityText = (priority) => {
  switch (priority) {
    case 'urgent': return '紧急'
    case 'high': return '高'
    case 'normal': return '普通'
    default: return priority
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 'draft': return 'text-gray-500 bg-gray-100'
    case 'pending': return 'text-yellow-600 bg-yellow-50'
    case 'accepted': return 'text-blue-600 bg-blue-100'
    case 'in_progress': return 'text-indigo-600 bg-indigo-50'
    case 'waiting_acceptance': return 'text-orange-600 bg-orange-50'
    case 'completed': return 'text-emerald-600 bg-emerald-100'
    case 'rejected': return 'text-red-600 bg-red-50'
    default: return 'text-gray-600 bg-gray-100'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'draft': return '草稿'
    case 'pending': return '待执行'
    case 'accepted': return '已接受'
    case 'in_progress': return '进行中'
    case 'waiting_acceptance': return '待验收'
    case 'completed': return '已完成'
    case 'rejected': return '已驳回'
    default: return status
  }
}
</script>
