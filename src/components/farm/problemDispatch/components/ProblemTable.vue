<template>
  <!-- 问题分派表格 - 从V1.1 ProblemTable.tsx 1:1迁移 -->
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-semibold w-12">
              <input v-if="showCheckbox && problems.length > 0"
                type="checkbox" :checked="isAllSelected"
                @change="batchDispatchMode ? $emit('batchSelectAll') : $emit('toggleSelectAll')"
                class="w-4 h-4 rounded" />
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold">编号</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">来源</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">问题描述</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">严重程度</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">状态</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">处理人</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <tr v-if="problems.length === 0">
            <td colspan="8" class="px-4 py-12 text-center text-gray-400">暂无问题数据</td>
          </tr>
          <tr v-for="problem in problems" :key="problem.id"
            class="hover:bg-blue-50 transition-colors">
            <!-- 复选框 -->
            <td class="px-4 py-3">
              <template v-if="batchDispatchMode">
                <input v-if="getStatusCN(problem.status) === '待处理' && !problem.sourceTaskId"
                  type="checkbox" :checked="selectedProblems.includes(problem.id)"
                  @change="$emit('toggleSelect', problem.id)" class="w-4 h-4 rounded" />
              </template>
              <template v-else-if="batchDeleteMode || exportMode">
                <input type="checkbox" :checked="selectedRows.includes(problem.id)"
                  @change="$emit('toggleSelect', problem.id)" class="w-4 h-4 rounded" />
              </template>
              <span v-else></span>
            </td>

            <!-- 编号 -->
            <td class="px-4 py-3 whitespace-nowrap">
              <el-button link type="primary" size="small"
                @click="$emit('viewDetail', problem)" title="点击查看详情">
                {{ problem.problemCode || problem.id }}
              </el-button>
            </td>

            <!-- 来源 -->
            <td class="px-4 py-3 text-sm">
              <SourceCell :problem="problem" />
            </td>

            <!-- 问题描述 -->
            <td class="px-4 py-3 text-sm text-gray-600 max-w-[300px] truncate">
              {{ problem.issueText }}
            </td>

            <!-- 严重程度 -->
            <td class="px-4 py-3">
              <span class="inline-flex px-2 py-1 rounded text-xs font-medium" :class="getSeverityStyle(problem.issueSeverity)">
                {{ problem.issueSeverity }}
              </span>
            </td>

            <!-- 状态 -->
            <td class="px-4 py-3">
              <span class="inline-flex px-2 py-1 rounded text-xs font-medium" :class="getStatusStyle(problem.status)">
                {{ getStatusCN(problem.status) }}
              </span>
            </td>

            <!-- 处理人 -->
            <td class="px-4 py-3 text-sm text-gray-600">
              {{ problem.handler || problem.handlerName || problem.assigneeName || '-' }}
            </td>

            <!-- 操作 -->
            <td class="px-4 py-3">
              <el-button v-if="getStatusCN(problem.status) === '待处理' && !problem.sourceTaskId"
                type="warning" size="small" @click="$emit('singleDispatch', problem)">
                分派
              </el-button>
              <el-button v-if="getStatusCN(problem.status) === '处理中'"
                type="primary" size="small" @click="$emit('viewDetail', problem)">
                详情
              </el-button>
              <el-button v-if="getStatusCN(problem.status) === '待验收'"
                size="small" @click="$emit('viewDetail', problem)">
                验收
              </el-button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SourceCell from './SourceCell.vue'

const props = defineProps({
  problems: { type: Array, default: () => [] },
  selectedRows: { type: Array, default: () => [] },
  selectedProblems: { type: Array, default: () => [] },
  batchDeleteMode: { type: Boolean, default: false },
  batchDispatchMode: { type: Boolean, default: false },
  exportMode: { type: Boolean, default: false },
  pendingProblems: { type: Array, default: () => [] },
})

defineEmits([
  'viewDetail', 'toggleSelect', 'toggleSelectAll', 'batchSelectAll', 'singleDispatch',
])

const STATUS_CN_MAP = {
  pending: '待处理', in_progress: '处理中',
  waiting_acceptance: '待验收', completed: '已处理',
}
const getStatusCN = (status) => STATUS_CN_MAP[status] || status

const showCheckbox = computed(() => props.batchDeleteMode || props.exportMode || props.batchDispatchMode)

const isAllSelected = computed(() => {
  if (props.batchDispatchMode) {
    return props.selectedProblems.length === props.pendingProblems.length && props.pendingProblems.length > 0
  }
  return props.selectedRows.length === props.problems.length
})

const getSeverityStyle = (severity) => {
  switch (severity) {
    case '严重': return 'bg-red-100 text-red-700'
    case '中等': return 'bg-amber-100 text-amber-700'
    default: return 'bg-blue-100 text-blue-700'
  }
}

const getStatusStyle = (status) => {
  const cn = getStatusCN(status)
  switch (cn) {
    case '已处理': return 'bg-green-100 text-green-700'
    case '处理中': return 'bg-amber-100 text-amber-700'
    case '待验收': return 'bg-purple-100 text-purple-700'
    case '待处理': return 'bg-blue-100 text-blue-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}
</script>
