<template>
  <el-dialog
    :model-value="isOpen"
    title="加班详情"
    width="550px"
    @close="onClose"
  >
    <div class="space-y-4">
      <!-- 基本信息 -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-gray-500">员工姓名</p>
          <p class="mt-1 text-sm font-medium text-gray-900">{{ record?.staffName }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">员工工号</p>
          <p class="mt-1 text-sm font-medium text-gray-900">{{ record?.staffId }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">加班日期</p>
          <p class="mt-1 text-sm font-medium text-gray-900">{{ record?.date }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">加班时长</p>
          <p class="mt-1 text-sm font-medium text-gray-900">{{ record?.hours }} 小时</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">加班类型</p>
          <p class="mt-1">
            <el-tag :type="getTypeColor(record?.type)">
              {{ record?.type }} ({{ getTypeMultiplier(record?.type) }})
            </el-tag>
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500">审批状态</p>
          <p class="mt-1">
            <el-tag :type="getStatusType(record?.status)">{{ record?.status }}</el-tag>
          </p>
        </div>
      </div>

      <!-- 加班费 -->
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500">加班费计算</span>
          <span class="text-lg font-bold text-emerald-600">
            {{ record?.totalPay ? `¥${record.totalPay.toFixed(2)}` : '-' }}
          </span>
        </div>
        <p v-if="record?.hourlyRate" class="mt-1 text-xs text-gray-400">
          {{ record?.hours }}h × ¥{{ record?.hourlyRate }}/h × {{ getTypeMultiplier(record?.type) }}
        </p>
      </div>

      <!-- 加班原因 -->
      <div>
        <p class="text-sm text-gray-500">加班原因</p>
        <p class="mt-1 text-sm text-gray-900">{{ record?.reason || '无' }}</p>
      </div>

      <!-- 审批信息 -->
      <div v-if="record?.approver" class="p-4 bg-gray-50 rounded-lg space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500">审批人</span>
          <span class="text-sm text-gray-900">{{ record?.approver }}</span>
        </div>
        <div v-if="record?.approveTime" class="flex items-center justify-between">
          <span class="text-sm text-gray-500">审批时间</span>
          <span class="text-sm text-gray-900">{{ record?.approveTime }}</span>
        </div>
        <div v-if="record?.remarks" class="flex items-center justify-between">
          <span class="text-sm text-gray-500">备注</span>
          <span class="text-sm text-gray-900">{{ record?.remarks }}</span>
        </div>
      </div>
    </div>
    <template #footer>
      <template v-if="record?.status === '待审批'">
        <el-button type="danger" @click="() => onReject?.(record!)">
          <el-icon><CircleClose /></el-icon>
          驳回
        </el-button>
        <el-button type="primary" @click="() => onApprove?.(record!)">
          <el-icon><CircleCheck /></el-icon>
          批准
        </el-button>
      </template>
      <el-button @click="onClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { CircleCheck, CircleClose } from '@element-plus/icons-vue'

type OvertimeType = '普通加班' | '周末加班' | '节假日加班'

defineProps({})

// 获取加班类型信息
const getTypeColor = (type) => {
  switch (type) {
    case '普通加班': return 'primary'
    case '周末加班': return 'warning'
    case '节假日加班': return 'danger'
    default: return 'info'
  }
}

const getTypeMultiplier = (type) => {
  switch (type) {
    case '普通加班': return '1.5倍'
    case '周末加班': return '2倍'
    case '节假日加班': return '3倍'
    default: return ''
  }
}

// 获取状态样式
const getStatusType = (status) => {
  switch (status) {
    case '待审批': return 'warning'
    case '已审批': return 'success'
    case '已驳回': return 'danger'
    case '已取消': return 'info'
    default: return 'info'
  }
}
</script>
