<template>
  <!-- 任务表格行 - 从V1.1 TaskTableRow.tsx 1:1迁移 -->
  <tr class="hover:bg-blue-50 transition-colors" :class="{ 'bg-blue-50': isSelected }">
    <!-- 复选框 -->
    <td v-if="showCheckbox" class="px-3 py-3 text-center">
      <input type="checkbox" :checked="isSelected" :disabled="!isSelectable"
        :title="!isSelectable ? selectableReason : ''" @change="$emit('select')"
        class="w-4 h-4 rounded" :class="{ 'opacity-50 cursor-not-allowed': !isSelectable }" />
    </td>

    <!-- 任务编号 -->
    <td class="px-3 py-3 text-sm font-medium text-center">
      <el-button link type="primary" size="small" @click="$emit('viewDetail')" title="点击查看详情">
        {{ task.taskCode || task.id || '-' }}
      </el-button>
    </td>

    <!-- 任务类型 -->
    <td class="px-3 py-3 text-center">
      <div class="flex flex-wrap gap-1 justify-center items-center">
        <template v-for="(typeValue, idx) in (task.types || []).slice(0, 2)" :key="idx">
          <span v-if="getTypeLabel(typeValue) === '其他'" class="text-orange-500 text-xs">其他</span>
          <span v-else class="inline-flex px-2 py-0.5 rounded text-xs text-white" :style="{ backgroundColor: getTypeColorStyle(typeValue) }">
            {{ getTypeLabel(typeValue) }}
          </span>
        </template>
        <span v-if="(task.types || []).length > 2" class="text-xs text-gray-500">+{{ task.types.length - 2 }}</span>
      </div>
    </td>

    <!-- 任务区域 -->
    <td class="px-3 py-3 text-sm text-gray-600 text-center">{{ task.field || task.greenhouseName || '-' }}</td>

    <!-- 作物 -->
    <td class="px-3 py-3 text-center">
      <span v-if="task.crop === '其他'" class="text-orange-500 text-xs">其他（{{ task.cropRemarks || '' }}）</span>
      <span v-else class="text-sm text-gray-600">{{ task.crop || task.cropName || '-' }}</span>
    </td>

    <!-- 批次 -->
    <td class="px-3 py-3 text-xs text-gray-600 text-center">{{ task.batchCode || '-' }}</td>

    <!-- 执行人 -->
    <td class="px-3 py-3 text-center">
      <span class="text-sm text-gray-600">{{ task.assignee || task.assigneeName || '-' }}</span>
    </td>

    <!-- 进度 -->
    <td class="px-3 py-3 text-center">
      <div class="flex items-center gap-2 justify-center">
        <div class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
          <div class="h-full rounded-full"
            :class="task.progress === 100 ? 'bg-green-500' : task.progress > 0 ? 'bg-blue-500' : 'bg-gray-300'"
            :style="{ width: (task.progress || 0) + '%' }" />
        </div>
        <span class="text-xs text-gray-500">{{ task.progress || 0 }}%</span>
      </div>
    </td>

    <!-- 优先级 -->
    <td class="px-3 py-3 text-center">
      <span class="text-xs font-medium" :class="{
        'text-red-500': task.priority === 'urgent',
        'text-orange-500': task.priority === 'high',
        'text-gray-500': task.priority !== 'urgent' && task.priority !== 'high'
      }">
        {{ task.priority === 'urgent' ? '紧急' : task.priority === 'high' ? '高' : '普通' }}
      </span>
    </td>

    <!-- 状态 -->
    <td class="px-3 py-3 text-center">
      <div class="flex flex-col gap-1 items-center">
        <span class="px-2 py-0.5 rounded text-xs font-medium" :class="[statusInfo.bg, statusInfo.color]">
          {{ statusInfo.label }}
        </span>
        <!-- 超时警示 -->
        <OvertimeBadge v-if="task.timeout"
          :planned-end-time="task.timeout.plannedEndTime"
          :actual-end-time="task.timeout.actualEndTime"
          :status="task.status" />
      </div>
    </td>

    <!-- 操作按钮 -->
    <td class="px-3 py-3 text-center">
      <div class="flex items-center gap-1 justify-center flex-wrap">
        <!-- 待验收 - 验收 -->
        <el-button v-if="task.status === 'waiting_acceptance' && $attrs.onAccept"
          type="primary" size="small" @click="$emit('accept')">验收</el-button>

        <!-- pending - 撤回 -->
        <el-button v-if="task.status === 'pending' && $attrs.onWithdraw"
          type="warning" size="small" @click="$emit('withdraw')">撤回</el-button>

        <!-- accepted/in_progress - 取消 -->
        <el-button v-if="(task.status === 'accepted' || task.status === 'in_progress') && $attrs.onCancel"
          type="danger" size="small" @click="$emit('cancel')">取消</el-button>

        <!-- 超时处理 -->
        <el-button v-if="task.timeout && task.timeout.severity === 'critical' && $attrs.onOvertime"
          type="primary" size="small" @click="$emit('overtime')">超时处理</el-button>

        <!-- rejected - 重新派发 -->
        <el-button v-if="task.status === 'rejected' && $attrs.onReassign"
          type="primary" size="small" @click="$emit('reassign')">重新派发</el-button>

        <!-- pending但无执行人 - 选择执行人 -->
        <el-button v-if="task.status === 'pending' && !task.assigneeId && $attrs.onReassign"
          type="danger" size="small" @click="$emit('reassign')">选择执行人</el-button>

        <!-- failed/abandoned - 重新派发 -->
        <el-button v-if="(task.status === 'failed' || task.status === 'abandoned') && $attrs.onReassign"
          type="primary" size="small" @click="$emit('reassign')">重新派发</el-button>

        <!-- 催办按钮 -->
        <el-button v-if="!['draft', 'completed', 'cancelled', 'abandoned'].includes(task.status) && $attrs.onRemind"
          :type="remindAllowed ? 'danger' : 'info'" size="small"
          :disabled="!remindAllowed"
          :title="cooldownSec ? `${Math.ceil(cooldownSec / 60)}分钟后可催办` : `今日已催办${todayCount || 0}次`"
          @click="handleRemind">
          <el-icon :size="12"><Bell /></el-icon>
          {{ cooldownSec ? `${Math.ceil(cooldownSec / 60)}m` : '催办' }}
        </el-button>
      </div>
    </td>

    <!-- 备注 -->
    <td class="px-3 py-3 text-sm text-gray-600 max-w-[200px] truncate text-center" :title="task.remarks || '-'">
      {{ task.remarks || '-' }}
    </td>

    <!-- 作业标准 -->
    <td class="px-3 py-3 text-center">
      <el-button v-if="(task.types?.length || 0) >= 2 && task.sopContent"
        link type="primary" size="small" @click="$emit('viewSop')" class="text-xs">
        <el-icon :size="12"><Files /></el-icon>SOP文件
      </el-button>
      <span v-else class="text-gray-400 text-xs">-</span>
    </td>

    <!-- 计划开始 -->
    <td class="px-3 py-3 text-sm text-gray-600 text-center">{{ task.planStart || '-' }}</td>

    <!-- 计划结束 -->
    <td class="px-3 py-3 text-sm text-gray-600 text-center">{{ task.planEnd || '-' }}</td>

    <!-- 任务工时 -->
    <td class="px-3 py-3 text-sm text-gray-600 text-center">
      {{ formatWorkHours(task.estimatedDays || 0, task.estimatedHours || 0) }}
    </td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'
import { Bell, Files } from '@element-plus/icons-vue'
import { STATUS_MAP, getTypeLabel, formatWorkHours } from '../constants/taskDispatchConstants'
import OvertimeBadge from './OvertimeBadge.vue'

const props = defineProps({
  task: { type: Object, required: true },
  showCheckbox: { type: Boolean, default: false },
  isSelected: { type: Boolean, default: false },
  isSelectable: { type: Boolean, default: true },
  selectableReason: { type: String, default: '' },
  remindProps: { type: Object, default: () => ({}) },
})

const emit = defineEmits([
  'select', 'viewDetail', 'viewSop', 'accept', 'withdraw', 'cancel',
  'overtime', 'reassign', 'remind',
])

const statusInfo = computed(() => STATUS_MAP[props.task.status] || { label: props.task.status, bg: 'bg-gray-100', color: 'text-gray-600' })

const remindAllowed = computed(() => props.remindProps?.allowed ?? false)
const cooldownSec = computed(() => props.remindProps?.cooldownSec ?? 0)
const todayCount = computed(() => props.remindProps?.todayCount ?? 0)

const getTypeColorStyle = (typeValue) => {
  const typeConfig = getTypeLabel(typeValue)
  // 返回颜色映射
  const colorMap = {
    '施肥': '#059669', '灌溉': '#2563eb', '采收': '#d97706',
    '播种': '#7c3aed', '除草': '#dc2626', '病虫害防治': '#ea580c',
    '修剪': '#0891b2', '农药': '#4f46e5',
  }
  return colorMap[typeConfig] || '#6b7280'
}

const handleRemind = () => {
  const remindCheck = props.remindProps?.canRemind?.(props.task.id)
  if (remindCheck?.allowed) {
    emit('remind', props.task)
  }
}
</script>
