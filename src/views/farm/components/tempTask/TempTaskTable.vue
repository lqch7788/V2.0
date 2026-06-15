<!--
  TempTaskTable.vue - 临时任务表格组件
  V1.1 TempTaskTable.tsx (435行) 1:1 迁移
  16 列：复选框/编号/名称/类型/地点/发布人/执行人/截止/天数/人工/总工时/状态/进度/紧急/超时/操作
-->
<template>
  <div class="border border-gray-200 rounded-xl overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <tr>
            <th v-if="showCheckbox" class="px-4 py-3 text-center text-white text-sm font-semibold whitespace-nowrap w-12">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="emit('select-all')"
                class="rounded border-white"
              />
            </th>
            <th class="px-4 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">任务编号</th>
            <th class="px-4 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">任务名称</th>
            <th class="px-4 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">类型</th>
            <th class="px-4 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">工作地点</th>
            <th class="px-4 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">发布人</th>
            <th class="px-4 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">执行人</th>
            <th class="px-4 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">截止日期</th>
            <th class="px-4 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">预计天数</th>
            <th class="px-4 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">人工</th>
            <th class="px-4 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">总工时</th>
            <th class="px-4 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">状态</th>
            <th class="px-4 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">进度</th>
            <th class="px-4 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">紧急程度</th>
            <th class="px-4 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">超时</th>
            <th class="px-4 py-3 text-center text-white text-sm font-semibold whitespace-nowrap">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-300">
          <tr
            v-for="task in tasks"
            :key="task.id"
            :class="rowClass(task)"
          >
            <!-- 复选框列 -->
            <td v-if="showCheckbox" class="px-3 py-3 text-center" @click.stop>
              <input
                type="checkbox"
                :checked="selectedRows.includes(task.id)"
                :disabled="!isRowSelectable(task)"
                @change="emit('select-row', task.id)"
              />
            </td>
            <!-- 任务编号 -->
            <td class="px-3 py-3 text-sm font-medium whitespace-nowrap">
              <button
                type="button"
                class="text-blue-600 hover:text-blue-800 hover:underline font-medium p-0"
                title="点击查看详情"
                @click="emit('view-task', task)"
              >
                {{ task.taskCode }}
              </button>
            </td>
            <!-- 任务名称 -->
            <td class="px-3 py-3 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <svg v-if="task.urgency === 'critical'" class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span class="font-medium text-gray-900 text-sm">{{ task.title }}</span>
              </div>
            </td>
            <!-- 类型 -->
            <td class="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">{{ task.typeName || task.type }}</td>
            <!-- 工作地点 -->
            <td class="px-3 py-3 whitespace-nowrap">
              <div class="flex items-center gap-1 text-sm text-gray-600">
                <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ task.location || task.workLocation || task.greenhouseName }}
              </div>
            </td>
            <!-- 发布人 -->
            <td class="px-3 py-3 whitespace-nowrap">
              <div class="flex items-center gap-1 text-sm text-gray-600">
                <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {{ task.assignerName || task.assigneeName }}
              </div>
            </td>
            <!-- 执行人 -->
            <td class="px-3 py-3 whitespace-nowrap">
              <div class="flex items-center gap-1 text-sm text-gray-600">
                <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {{ task.assigneeName }}
              </div>
            </td>
            <!-- 截止日期 - YYYY-MM-DD HH:mm 格式（修复 T） -->
            <td class="px-3 py-3 whitespace-nowrap">
              <div class="flex items-center gap-1 text-sm text-gray-600">
                <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ formatDueDate(task.dueDate) }}
              </div>
            </td>
            <!-- 预计天数 -->
            <td class="px-3 py-3 text-center text-sm text-gray-600">{{ task.estimatedDays || 0 }}天</td>
            <!-- 人工 -->
            <td class="px-3 py-3 text-center text-sm text-gray-600">{{ task.workerCount || 1 }}人</td>
            <!-- 总工时：(天数*8 + 预计小时) * 人工数量 -->
            <td class="px-3 py-3 text-center text-sm font-medium text-emerald-600">
              {{ ((task.estimatedDays || 0) * 8 + (task.estimatedHours || 0)) * (task.workerCount || 1) }}h
            </td>
            <!-- 状态 -->
            <td class="px-3 py-3 whitespace-nowrap">
              <span :class="['px-2 py-1 rounded-full text-xs font-medium', STATUS_CONFIG[task.status]?.bg, STATUS_CONFIG[task.status]?.color]">
                {{ STATUS_CONFIG[task.status]?.label }}
              </span>
            </td>
            <!-- 进度 -->
            <td class="px-3 py-3 text-center">
              <div class="flex items-center justify-center gap-2">
                <div class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    :class="(task.progress || 0) === 100 ? 'bg-green-500' : 'bg-emerald-500'"
                    class="h-full rounded-full transition-all"
                    :style="{ width: `${task.progress || 0}%` }"
                  />
                </div>
                <span class="text-xs font-medium text-gray-600 w-8">{{ task.progress || 0 }}%</span>
              </div>
            </td>
            <!-- 紧急程度 -->
            <td class="px-3 py-3 whitespace-nowrap">
              <span :class="['px-2 py-1 rounded-full text-xs font-medium', URGENCY_CONFIG[task.urgency]?.badge]">
                {{ URGENCY_CONFIG[task.urgency]?.label || task.urgency }}
              </span>
            </td>
            <!-- 超时 -->
            <td class="px-3 py-3 whitespace-nowrap">
              <span v-if="getOverdueStatus(task) === 'overdue'"
                class="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1 inline-flex">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {{ getOverdueDesc(task) }}
              </span>
              <span v-else-if="getOverdueStatus(task) === 'warning'"
                class="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                即将到期
              </span>
            </td>
            <!-- 操作列 -->
            <td class="px-3 py-3 whitespace-nowrap" @click.stop>
              <div class="flex items-center gap-1 flex-wrap">
                <!-- 草稿状态 - 发布按钮 -->
                <button v-if="task.status === 'draft'"
                  type="button"
                  class="px-2 py-1 rounded text-xs bg-blue-500 text-white hover:bg-blue-600 inline-flex items-center gap-1"
                  @click="emit('publish', task)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  发布
                </button>

                <!-- 待验收 - 验收按钮 -->
                <button v-if="task.status === 'waiting_acceptance'"
                  type="button"
                  class="px-2 py-1 rounded text-xs bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1"
                  @click="emit('accept', task)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  验收
                </button>

                <!-- pending 且无执行人 - 选择执行人 -->
                <button v-if="task.status === 'pending' && !task.assigneeId"
                  type="button"
                  class="px-2 py-1 rounded text-xs bg-blue-500 text-white hover:bg-blue-600 inline-flex items-center gap-1"
                  @click="emit('reassign', task)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  选择执行人
                </button>

                <!-- pending 且有执行人 -->
                <template v-if="task.status === 'pending' && task.assigneeId">
                  <template v-if="isMyTasksView">
                    <button type="button"
                      class="px-2 py-1 rounded text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                      @click="emit('accept', task)">接受</button>
                    <button type="button"
                      class="px-2 py-1 rounded text-xs bg-red-500 text-white hover:bg-red-600 inline-flex items-center gap-1"
                      @click="emit('reject', task)">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      拒绝
                    </button>
                  </template>
                  <template v-else>
                    <button type="button"
                      class="px-2 py-1 rounded text-xs bg-amber-500 text-white hover:bg-amber-600 inline-flex items-center gap-1"
                      @click="emit('withdraw', task)">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a5 5 0 015 5v2M3 10l4-4M3 10l4 4" />
                      </svg>
                      撤回
                    </button>
                    <button type="button"
                      class="px-2 py-1 rounded text-xs bg-red-500 text-white hover:bg-red-600 inline-flex items-center gap-1"
                      @click="emit('cancel', task)">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      取消
                    </button>
                  </template>
                </template>

                <!-- accepted/in_progress - 取消按钮 -->
                <button v-if="(task.status === 'accepted' || task.status === 'in_progress')"
                  type="button"
                  class="px-2 py-1 rounded text-xs bg-red-500 text-white hover:bg-red-600 inline-flex items-center gap-1"
                  @click="emit('cancel', task)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  取消
                </button>

                <!-- rejected/pending_reassign/failed/abandoned - 重新派发 -->
                <button v-if="(task.status === 'rejected' || task.status === 'pending_reassign' || task.status === 'failed' || task.status === 'abandoned')"
                  type="button"
                  class="px-2 py-1 rounded text-xs bg-blue-500 text-white hover:bg-blue-600 inline-flex items-center gap-1"
                  @click="emit('reassign', task)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  重新派发
                </button>

                <!-- 已完成/已驳回后可继续执行 -->
                <button v-if="(task.status === 'completed' || task.status === 'rejected')"
                  type="button"
                  class="px-2 py-1 rounded text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1"
                  @click="emit('continue', task)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  继续执行
                </button>

                <!-- 催办按钮 - 已发布且非终态 -->
                <button v-if="canShowRemind(task)"
                  type="button"
                  :disabled="canRemind && !canRemind(task.id)?.allowed"
                  :title="canRemind?.(task.id)?.reason || ''"
                  class="px-2 py-1 rounded text-xs bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                  @click="emit('remind', task)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  催办
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 空态 -->
    <div v-if="tasks.length === 0" class="p-8 text-center text-gray-500">
      没有找到符合条件的临时任务
    </div>

    <!-- 选择页脚 -->
    <div v-if="showCheckbox" class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
      <div class="flex items-center gap-4">
        <button type="button" class="text-sm text-blue-600 hover:underline" @click="emit('select-all')">
          {{ isAllSelected ? '全不选' : '全选' }}
        </button>
        <span class="text-sm text-gray-500">
          已选择 {{ selectedRows.length }} 项
          <template v-if="batchEditMode">（进行中/已完成状态不可编辑）</template>
          <template v-if="batchDeleteMode">（所有状态均可删除）</template>
        </span>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="pagination" class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
      <div class="text-sm text-gray-500">
        共 {{ pagination.total }} 条
      </div>
      <div class="flex items-center gap-2">
        <select :value="pagination.pageSize" @change="onPageSizeChange"
          class="px-2 py-1 border border-gray-200 rounded text-sm">
          <option v-for="s in [10, 20, 50, 100]" :key="s" :value="s">{{ s }}条/页</option>
        </select>
        <button type="button" class="px-2 py-1 border border-gray-200 rounded text-sm disabled:opacity-50"
          :disabled="pagination.currentPage <= 1"
          @click="emit('page-change', pagination.currentPage - 1)">上一页</button>
        <span class="text-sm">{{ pagination.currentPage }} / {{ totalPages }}</span>
        <button type="button" class="px-2 py-1 border border-gray-200 rounded text-sm disabled:opacity-50"
          :disabled="pagination.currentPage >= totalPages"
          @click="emit('page-change', pagination.currentPage + 1)">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 临时任务表格
 * V1.1 src/components/labor/tempTask/TempTaskTable.tsx 1:1 迁移
 *
 * 16 列：复选框/编号/名称/类型/地点/发布人/执行人/截止/天数/人工/总工时/状态/进度/紧急/超时/操作
 *
 * Emits:
 *   view-task / publish / accept / reject / withdraw / cancel / reassign / continue / remind
 *   accept-complete / reject-complete / select-all / select-row / page-change / page-size-change
 */
import { computed } from 'vue'

const props = defineProps({
  tasks: { type: Array, default: () => [] },
  showCheckbox: { type: Boolean, default: false },
  exportMode: { type: Boolean, default: false },
  batchEditMode: { type: Boolean, default: false },
  batchDeleteMode: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  isMyTasksView: { type: Boolean, default: false },
  pagination: {
    type: Object,
    default: null,
    // { currentPage, pageSize, total, onPageChange, onPageSizeChange }
  },
  canRemind: { type: Function, default: null },
})

const emit = defineEmits([
  'view-task',
  'edit-task',
  'start-task',
  'submit-complete',
  'accept',
  'reject',
  'withdraw',
  'cancel',
  'continue',
  'reassign',
  'publish',
  'remind',
  'select-all',
  'select-row',
  'page-change',
  'page-size-change',
])

// ========== 状态配置（与 V1.1 statusConfig 1:1）==========
const STATUS_CONFIG = {
  draft: { label: '草稿', color: 'text-gray-600', bg: 'bg-gray-50' },
  pending: { label: '待执行', color: 'text-amber-600', bg: 'bg-amber-50' },
  accepted: { label: '已接受', color: 'text-teal-600', bg: 'bg-teal-50' },
  in_progress: { label: '进行中', color: 'text-blue-600', bg: 'bg-blue-50' },
  waiting_acceptance: { label: '待验收', color: 'text-orange-600', bg: 'bg-orange-50' },
  completed: { label: '已完成', color: 'text-green-600', bg: 'bg-green-50' },
  cancelled: { label: '已取消', color: 'text-gray-600', bg: 'bg-gray-50' },
  rejected: { label: '已驳回', color: 'text-red-600', bg: 'bg-red-50' },
  pending_reassign: { label: '待重新派发', color: 'text-purple-600', bg: 'bg-purple-50' },
  failed: { label: '执行失败', color: 'text-red-600', bg: 'bg-red-50' },
  abandoned: { label: '已放弃', color: 'text-gray-500', bg: 'bg-gray-100' },
}

// ========== 紧急程度配置（与 V1.1 TEMP_TASK_URGENCY_CONFIG 1:1）==========
const URGENCY_CONFIG = {
  normal: { label: '普通', badge: 'bg-gray-100 text-gray-600' },
  urgent: { label: '紧急', badge: 'bg-amber-100 text-amber-700' },
  critical: { label: '非常紧急', badge: 'bg-red-100 text-red-700' },
}

// ========== 复选框计算（与 V1.1 getAllSelectedForMode/getRowSelectable 1:1）==========
const totalPages = computed(() => {
  if (!props.pagination) return 1
  return Math.ceil((props.pagination.total || props.tasks.length) / props.pagination.pageSize) || 1
})

const isAllSelected = computed(() => {
  if (props.batchEditMode) {
    const selectable = props.tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled')
    return props.selectedRows.length === selectable.length && selectable.length > 0
  }
  if (props.batchDeleteMode) {
    const selectable = props.tasks.filter(t => t.status === 'pending')
    return props.selectedRows.length === selectable.length && selectable.length > 0
  }
  return props.selectedRows.length === props.tasks.length && props.tasks.length > 0
})

function isRowSelectable(task) {
  if (props.batchEditMode) {
    return task.status !== 'completed' && task.status !== 'cancelled'
  }
  return true
}

function rowClass(task) {
  const overdueStatus = getOverdueStatus(task)
  return [
    'hover:bg-blue-100 transition-colors',
    task.urgency === 'critical' ? 'bg-red-50' : '',
    props.showCheckbox && !isRowSelectable(task) ? 'bg-gray-50' : '',
    overdueStatus === 'overdue' ? 'bg-red-50' : '',
    overdueStatus === 'warning' ? 'bg-orange-50' : '',
  ].filter(Boolean).join(' ')
}

// ========== 截止日期格式化（与 V1.1 表格渲染逻辑 1:1）==========
function formatDueDate(value) {
  if (!value) return '-'
  if (typeof value === 'string') {
    if (value.includes('T')) {
      const [date, time] = value.split('T')
      const hh = time?.substring(0, 2) || '00'
      return `${date} ${hh}:00`
    }
    if (value.length > 13) {
      return `${value.substring(0, 10)} ${value.substring(11, 13)}:00`
    }
  }
  return value
}

// ========== 超时检测（与 V1.1 getTaskOverdueStatus/getTaskOverdueDesc 1:1）==========
function getOverdueStatus(task) {
  if (!task.dueDate || task.status === 'completed' || task.status === 'cancelled') return 'normal'
  const now = new Date()
  const due = new Date(task.dueDate)
  if (isNaN(due.getTime())) return 'normal'
  const diff = due.getTime() - now.getTime()
  const hours = diff / (1000 * 60 * 60)
  if (hours < 0) return 'overdue'
  if (hours < 24) return 'warning'
  return 'normal'
}

function getOverdueDesc(task) {
  if (!task.dueDate) return ''
  const now = new Date()
  const due = new Date(task.dueDate)
  const diff = due.getTime() - now.getTime()
  const days = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24))
  const hours = Math.floor((Math.abs(diff) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `超时${days}天${hours}小时`
  return `超时${hours}小时`
}

function canShowRemind(task) {
  return !['draft', 'completed', 'cancelled', 'abandoned', 'pending'].includes(task.status)
}

function onPageSizeChange(e) {
  emit('page-size-change', parseInt(e.target.value, 10))
}
</script>