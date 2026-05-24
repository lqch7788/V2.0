<template>
  <el-dialog
    :model-value="isOpen"
    title="请假详情"
    width="550px"
    @close="onClose"
  >
    <div class="grid grid-cols-2 gap-4">
      <!-- 员工姓名 -->
      <div>
        <p class="text-sm font-medium text-gray-500 mb-1">员工姓名</p>
        <p class="text-gray-900">{{ record?.staffName }}</p>
      </div>

      <!-- 员工编号 -->
      <div>
        <p class="text-sm font-medium text-gray-500 mb-1">员工编号</p>
        <p class="text-gray-900">{{ record?.staffId }}</p>
      </div>

      <!-- 请假类型 -->
      <div>
        <p class="text-sm font-medium text-gray-500 mb-1">请假类型</p>
        <p class="text-gray-900">{{ record?.leaveType }}</p>
      </div>

      <!-- 状态 -->
      <div>
        <p class="text-sm font-medium text-gray-500 mb-1">状态</p>
        <el-tag :type="getStatusType(record?.status)">{{ record?.status }}</el-tag>
      </div>

      <!-- 开始日期 -->
      <div>
        <p class="text-sm font-medium text-gray-500 mb-1">开始日期</p>
        <p class="text-gray-900">{{ record?.startDate }}</p>
      </div>

      <!-- 结束日期 -->
      <div>
        <p class="text-sm font-medium text-gray-500 mb-1">结束日期</p>
        <p class="text-gray-900">{{ record?.endDate }}</p>
      </div>

      <!-- 请假天数 -->
      <div>
        <p class="text-sm font-medium text-gray-500 mb-1">请假天数</p>
        <p class="text-gray-900">{{ record?.days }} 天</p>
      </div>

      <!-- 审批人 -->
      <div v-if="record?.approver">
        <p class="text-sm font-medium text-gray-500 mb-1">审批人</p>
        <p class="text-gray-900">{{ record?.approver }}</p>
      </div>

      <!-- 审批时间 -->
      <div v-if="record?.approveTime">
        <p class="text-sm font-medium text-gray-500 mb-1">审批时间</p>
        <p class="text-gray-900">{{ record?.approveTime }}</p>
      </div>

      <!-- 请假原因 -->
      <div class="col-span-2">
        <p class="text-sm font-medium text-gray-500 mb-1">请假原因</p>
        <p class="text-gray-900">{{ record?.reason }}</p>
      </div>

      <!-- 备注 -->
      <div v-if="record?.remarks" class="col-span-2">
        <p class="text-sm font-medium text-gray-500 mb-1">备注</p>
        <p class="text-gray-900">{{ record?.remarks }}</p>
      </div>
    </div>
    <template #footer>
      <el-button @click="onClose">关闭</el-button>
      <template v-if="record?.status === '待审批'">
        <el-button type="danger" @click="() => onReject?.(record)">
          <el-icon><CircleClose /></el-icon>
          驳回
        </el-button>
        <el-button type="primary" @click="() => onApprove?.(record)">
          <el-icon><CircleCheck /></el-icon>
          批准
        </el-button>
      </template>
    </template>
  </el-dialog>
</template>

<script setup>
import { CircleCheck, CircleClose } from '@element-plus/icons-vue'

defineProps({})

// 状态颜色映射
const getStatusType = (status) => {
  switch (status) {
    case '待审批': return 'warning'
    case '已通过': return 'success'
    case '已拒绝': return 'danger'
    case '已取消': return 'info'
    default: return 'info'
  }
}
</script>
