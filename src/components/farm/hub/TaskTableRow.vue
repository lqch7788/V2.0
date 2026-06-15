<template>
  <!-- 任务表格行组件 -->
  <tr class="hover:bg-blue-100 transition-colors">
    <!-- 复选框 -->
    <td v-if="showCheckbox" class="px-3 py-3 text-center whitespace-nowrap">
      <el-checkbox
        :model-value="isSelected"
        :disabled="!isSelectable"
        :title="!isSelectable ? selectableReason : ''"
        @change="onSelect"
      />
    </td>

    <!-- 任务ID -->
    <td class="px-3 py-3 text-sm font-medium whitespace-nowrap">
      <el-button type="primary" link size="small" @click="onViewDetail" title="点击查看详情">
        {{ task.id }}
      </el-button>
    </td>

    <!-- 任务类型 -->
    <td class="px-3 py-3 whitespace-nowrap">
      <div class="flex flex-wrap gap-1 items-center">
        <!-- 优先使用 typeName 显示 -->
        <template v-if="task.typeName">
          <span :class="`inline-flex px-2 py-0.5 rounded text-xs text-white ${getTypeColor(task.type)}`">
            {{ task.typeName }}
          </span>
        </template>
        <!-- 兼容 types 数组（最多显示2个） -->
        <template v-else-if="task.types && task.types.length">
          <template v-for="(typeValue, idx) in task.types.slice(0, 2)" :key="idx">
            <span v-if="getTypeLabel(typeValue) === '其他'" class="text-orange-500 text-xs">其他</span>
            <span v-else :class="`inline-flex px-2 py-0.5 rounded text-xs text-white ${getTypeColor(typeValue)}`">
              {{ getTypeLabel(typeValue) }}
            </span>
          </template>
          <span v-if="task.types.length > 2" class="text-xs text-gray-500">+{{ task.types.length - 2 }}</span>
        </template>
      </div>
    </td>

    <!-- 任务区域 -->
    <td class="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
      {{ task.greenhouseName || task.field || '-' }}
    </td>

    <!-- 作物 -->
    <td class="px-3 py-3 whitespace-nowrap">
      <template v-if="task.cropName">
        <div v-if="task.cropName === '其他'" class="text-orange-500 text-xs">其他（{{ task.cropRemarks || '' }}）</div>
        <span v-else class="text-sm text-gray-600">{{ task.cropName }}</span>
      </template>
      <template v-else-if="task.crop === '其他'">
        <div class="text-orange-500 text-xs">其他（{{ task.cropRemarks || '' }}）</div>
      </template>
      <span v-else class="text-sm text-gray-600">{{ task.crop || '-' }}</span>
    </td>

    <!-- 批次 -->
    <td class="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">
      {{ task.batchCode || '-' }}
    </td>

    <!-- 执行人 -->
    <td class="px-3 py-3 whitespace-nowrap">
      <span class="text-sm text-gray-600">{{ task.assigneeName || task.assignee || '-' }}</span>
    </td>

    <!-- 班组（数据来自农事管理-班组分配） -->
    <td class="px-3 py-3 whitespace-nowrap">
      <span v-if="task.teamName" class="inline-flex px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-600 font-medium">
        {{ task.teamName }}
      </span>
      <span v-else class="text-xs text-gray-400">-</span>
    </td>

    <!-- 进度 -->
    <td class="px-3 py-3 whitespace-nowrap">
      <div class="flex items-center gap-2">
        <el-progress
          :percentage="task.progress || 0"
          :stroke-width="6"
          :show-text="false"
          :color="progressColor"
          class="w-16"
        />
        <span class="text-xs text-gray-500">{{ task.progress || 0 }}%</span>
      </div>
    </td>

    <!-- 优先级 -->
    <td class="px-3 py-3 whitespace-nowrap">
      <span :class="priorityClass">{{ priorityLabel }}</span>
    </td>

    <!-- 状态 -->
    <td class="px-3 py-3 whitespace-nowrap">
      <div class="flex flex-col gap-1">
        <span :class="`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`">
          {{ statusInfo.label }}
        </span>
        <!-- 超时警示徽章 -->
        <OvertimeBadge v-if="task.timeout" :timeout="task.timeout" size="sm" :show-label="true" />
      </div>
    </td>

    <!-- 操作按钮 -->
    <td class="px-3 py-3 whitespace-nowrap">
      <div class="flex items-center gap-1 flex-wrap">
        <!-- 草稿状态 - 发布 -->
        <el-button v-if="task.status === 'draft' && onPublish" type="primary" size="small" @click="onPublish" class="text-xs">
          发布
        </el-button>

        <!-- 待验收 - 验收 -->
        <el-button v-if="task.status === 'waiting_acceptance' && onAccept" type="success" size="small" @click="onAccept" class="text-xs">
          验收
        </el-button>

        <!-- pending 且无执行人 - 选择执行人 -->
        <el-button v-if="task.status === 'pending' && !task.assigneeId && onSelectExecutor" type="primary" size="small" @click="onSelectExecutor" class="text-xs">
          选择执行人
        </el-button>

        <!-- pending 且有执行人 -->
        <template v-if="task.status === 'pending' && task.assigneeId">
          <!-- 我的任务视图（执行人）：接受/拒绝 -->
          <template v-if="isMyTasksView">
            <el-button v-if="onAccept" type="success" size="small" @click="onAccept" class="text-xs">接受</el-button>
            <el-button v-if="onWithdraw" type="danger" size="small" @click="onWithdraw" class="text-xs">拒绝</el-button>
          </template>
          <!-- 农事任务表视图（管理者）：撤回/取消 -->
          <template v-else>
            <el-button v-if="onWithdraw" type="warning" size="small" @click="onWithdraw" class="text-xs">撤回</el-button>
            <el-button v-if="onCancel" type="danger" size="small" @click="onCancel" class="text-xs">取消</el-button>
          </template>
        </template>

        <!-- accepted/in_progress - 取消 -->
        <el-button v-if="(task.status === 'accepted' || task.status === 'in_progress') && onCancel" type="danger" size="small" @click="onCancel" class="text-xs">
          取消
        </el-button>

        <!-- 超时严重 - 超时处理 -->
        <el-button v-if="task.timeout?.severity === 'critical' && onOvertime" size="small" @click="onOvertime" class="bg-purple-600 text-white hover:bg-purple-700 text-xs">
          超时处理
        </el-button>

        <!-- rejected - 重新派发 -->
        <el-button v-if="task.status === 'rejected' && onReassign" size="small" @click="onReassign" class="bg-indigo-500 text-white hover:bg-indigo-600 text-xs">
          重新派发
        </el-button>

        <!-- failed/abandoned - 重新派发 -->
        <el-button v-if="(task.status === 'failed' || task.status === 'abandoned') && onReassign" size="small" @click="onReassign" class="bg-indigo-500 text-white hover:bg-indigo-600 text-xs">
          重新派发
        </el-button>

        <!-- 催办按钮：非草稿/已完成/已取消/已放弃/待接受（无执行人）状态显示（与V1.1 TaskTableRow.tsx line 412 一致） -->
        <el-button
          v-if="showRemindButton && onRemind"
          :type="remindCheck.allowed ? 'danger' : 'info'"
          size="small"
          @click="handleRemind"
          :disabled="!remindCheck.allowed"
          class="text-xs"
          :title="remindTitle"
        >
          <!-- 冷却倒计时显示：与V1.1 TaskTableRow.tsx line 437-439 一致 -->
          {{ cooldownLabel }}
        </el-button>
      </div>
    </td>

    <!-- 备注 -->
    <td class="px-3 py-3 text-sm text-gray-600 max-w-[200px] truncate" :title="task.remarks || '-'">
      {{ task.remarks || '-' }}
    </td>

    <!-- 作业标准 -->
    <td class="px-3 py-3 whitespace-nowrap max-w-[150px]">
      <template v-if="task.sopContent">
        <span class="text-blue-600 text-xs cursor-pointer hover:text-blue-800 truncate block" @click="onViewSop" title="点击查看完整内容">
          {{ sopDisplayText }}
        </span>
      </template>
      <span v-else class="text-gray-400 text-xs">-</span>
    </td>

    <!-- 计划开始 - 对齐 V1.1 TaskTableRow.tsx line 467-469：移除 ISO T，用空格分隔 -->
    <td class="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
      {{ formatDateTime(task.planStart || task.dueDate) }}
    </td>

    <!-- 计划结束 - 对齐 V1.1 TaskTableRow.tsx line 472-474 -->
    <td class="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
      {{ formatDateTime(task.planEnd || task.dueDate) }}
    </td>

    <!-- 任务工时 -->
    <td class="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
      {{ formatWorkHours(task.estimatedDays || 0, task.estimatedHours || 0) }}
    </td>
  </tr>
</template>

<script setup>
/**
 * 任务表格行组件
 * 显示单条任务的完整信息行，包含操作按钮和状态可视化
 * 对应 V1.1 TaskTableRow.tsx 1:1 映射
 */
import { computed } from 'vue'
import { STATUS_MAP, getTypeLabel, getTypeColor, formatWorkHours } from '@/constants/taskDispatch'
import { showAlert } from '@/lib/dialogService'
import OvertimeBadge from './OvertimeBadge.vue'

const props = defineProps({
  /** 任务数据对象 */
  task: { type: Object, required: true },
  /** 行索引 */
  index: { type: Number, default: 0 },
  /** 是否显示复选框列 */
  showCheckbox: { type: Boolean, default: false },
  /** 是否已选中 */
  isSelected: { type: Boolean, default: false },
  /** 是否可选中 */
  isSelectable: { type: Boolean, default: true },
  /** 不可选中时的原因 */
  selectableReason: { type: String, default: '' },
  /** 选择回调 */
  onSelect: { type: Function, default: () => {} },
  /** 查看详情回调 */
  onViewDetail: { type: Function, default: () => {} },
  /** 查看SOP回调 */
  onViewSop: { type: Function, default: undefined },
  /** 接受任务回调 */
  onAccept: { type: Function, default: undefined },
  /** 拒绝/撤回回调 */
  onWithdraw: { type: Function, default: undefined },
  /** 取消任务回调 */
  onCancel: { type: Function, default: undefined },
  /** 超时处理回调 */
  onOvertime: { type: Function, default: undefined },
  /** 继续执行回调 */
  onContinue: { type: Function, default: undefined },
  /** 重新派发回调 */
  onReassign: { type: Function, default: undefined },
  /** 催办回调 */
  onRemind: { type: Function, default: undefined },
  /** 选择执行人回调 */
  onSelectExecutor: { type: Function, default: undefined },
  /** 发布草稿回调 */
  onPublish: { type: Function, default: undefined },
  /** 是否为"我的任务"视图 */
  isMyTasksView: { type: Boolean, default: false },
  /** 检查是否可催办的函数 */
  canRemind: { type: Function, default: () => ({ allowed: false }) },
  /** 发送催办消息的函数 */
  sendReminder: { type: Function, default: () => {} },
  /** 催办属性：与V1.1 TaskTableRow.tsx line 101-105 一致 */
  remindProps: {
    type: Object,
    default: () => ({ allowed: false, cooldownSec: 0, todayCount: 0 }),
  },
})

/** 状态信息映射 */
const statusInfo = computed(() =>
  STATUS_MAP[props.task.status] || { label: props.task.status, bg: 'bg-gray-100', color: 'text-gray-600' }
)

/** 进度条颜色 */
const progressColor = computed(() => {
  const p = props.task.progress || 0
  if (p === 100) return '#22c55e'
  if (p > 0) return '#3b82f6'
  return '#d1d5db'
})

/** 优先级标签文字 */
const priorityLabel = computed(() => {
  switch (props.task.priority) {
    case 'urgent': return '紧急'
    case 'high': return '高'
    default: return '普通'
  }
})

/** 优先级样式类 */
const priorityClass = computed(() => {
  const base = 'text-xs font-medium '
  switch (props.task.priority) {
    case 'urgent': return base + 'text-red-500'
    case 'high': return base + 'text-orange-500'
    default: return base + 'text-gray-500'
  }
})

/** SOP 内容截断显示 */
const sopDisplayText = computed(() => {
  const content = props.task.sopContent || ''
  return content.length > 20 ? content.substring(0, 20) + '...' : content
})

/**
 * 格式化日期时间 - 对齐 V1.1 TaskTableRow.tsx line 467-469
 * V1.1 显示格式：2026-05-28 20:29（ISO 去掉 T，用空格分隔）
 * V2.0 修复：直接显示 ISO 字符串会出现 2026-05-28T20:29，需替换为 2026-05-28 20:29
 * @param {string} val - ISO 日期字符串或日期字符串
 * @returns {string} 格式化后的日期时间，空值返回 '-'
 */
const formatDateTime = (val) => {
  if (!val) return '-'
  // ISO 字符串包含 T → 替换为空格，并截取 YYYY-MM-DD HH:mm
  if (typeof val === 'string' && val.includes('T')) {
    const [datePart, timePart] = val.split('T')
    if (!timePart) return datePart
    return `${datePart} ${timePart.substring(0, 5)}`
  }
  return val
}

/** 是否显示催办按钮 */
const showRemindButton = computed(() => {
  return !['draft', 'completed', 'cancelled', 'abandoned', 'pending'].includes(props.task.status)
})

/** 催办检查结果 - 对齐 V1.1 TaskTableRow.tsx line 419-421 canRemind(task.id) */
const remindCheck = computed(() => {
  if (!props.canRemind) return { allowed: false, reason: '', cooldownSec: 0, todayCount: 0 }
  return props.canRemind(props.task.id) || { allowed: false, reason: '', cooldownSec: 0, todayCount: 0 }
})

/** 催办按钮提示文字 */
const remindTitle = computed(() => {
  if (!remindCheck.value.allowed) {
    return remindCheck.value.reason || '暂时无法催办'
  }
  // 与V1.1 TaskTableRow.tsx line 436 一致：cooldownSec>0显示"X分钟后可催办"，否则显示"今日已催办X次"
  if (props.remindProps?.cooldownSec) {
    return `${Math.ceil(props.remindProps.cooldownSec / 60)}分钟后可催办`
  }
  if (props.remindProps?.todayCount) {
    return `今日已催办${props.remindProps.todayCount}次`
  }
  return '点击发送催办消息'
})

/** 催办按钮文字标签：与V1.1 TaskTableRow.tsx line 437-439 一致 */
const cooldownLabel = computed(() => {
  if (props.remindProps?.cooldownSec) {
    return `${Math.ceil(props.remindProps.cooldownSec / 60)}m`
  }
  return '催办'
})

/** 处理催办操作 */
const handleRemind = () => {
  if (remindCheck.value.allowed) {
    props.sendReminder(
      props.task.id,
      props.task.taskCode || props.task.id,
      props.task.assigneeId || '',
      props.task.assigneeName || props.task.assignee || '',
      'admin',
      '管理员'
    )
  } else {
    showAlert(remindCheck.value.reason || '暂时无法催办')
  }
}
</script>
