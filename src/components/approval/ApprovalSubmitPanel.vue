<template>
  <!-- 审批提交面板组件 -->
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <!-- 头部 -->
    <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <el-icon :size="16" class="text-indigo-600"><Promotion /></el-icon>
        <span class="font-medium text-gray-900">提交审批</span>
      </div>
    </div>

    <div class="p-4 space-y-4">
      <!-- 审批级别预览 -->
      <div :class="['p-4 rounded-lg border', flowInfo.color]">
        <div class="flex items-start gap-3">
          <div class="mt-0.5">
            <el-icon :size="20" :class="flowInfo.textColor">
              <CircleCheck v-if="levelResult.level === 'exempt'" />
              <Clock v-else-if="levelResult.level === 'quick'" />
              <Warning v-else />
            </el-icon>
          </div>
          <div class="flex-1">
            <div :class="['font-semibold', flowInfo.textColor]">
              {{ flowInfo.title }}
            </div>
            <div class="text-sm text-gray-600 mt-1">
              {{ flowInfo.description }}
            </div>
            <div class="text-xs text-gray-500 mt-2">
              判断依据：{{ levelResult.reason }}
            </div>
          </div>
        </div>
      </div>

      <!-- 金额阈值信息 -->
      <div v-if="showAmountThreshold" class="bg-gray-50 rounded-lg p-3">
        <div class="flex items-center gap-2 mb-2">
          <el-icon :size="16" class="text-gray-500"><Money /></el-icon>
          <span class="text-sm font-medium text-gray-700">金额信息</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="text-gray-500">申请金额：</div>
          <div class="font-medium text-gray-900">¥{{ amount.toLocaleString() }}</div>
          <div class="text-gray-500">审批级别：</div>
          <div class="font-medium text-gray-900">
            {{ levelName }}
          </div>
        </div>
      </div>

      <!-- 快速提示 -->
      <div v-if="showQuickTips && levelResult.autoApprove" class="bg-green-50 border border-green-200 rounded-lg p-3">
        <div class="flex items-start gap-2">
          <el-icon :size="16" class="text-green-600 mt-0.5"><CircleCheck /></el-icon>
          <div class="text-sm text-green-700">
            <p class="font-medium">恭喜！您的申请金额在免审批阈值内</p>
            <p class="mt-1">系统将自动通过，无需等待审批</p>
          </div>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="pt-2">
        <el-button
          type="primary"
          :disabled="isSubmitting"
          :loading="isSubmitting"
          class="w-full"
          style="background-color: #4f46e5; border-color: #4f46e5;"
          @click="showConfirm = true"
        >
          <el-icon v-if="!isSubmitting" class="mr-1"><Promotion /></el-icon>
          {{ isSubmitting ? '提交中...' : submitText }}
        </el-button>
      </div>
    </div>

    <!-- 确认弹窗 -->
    <el-dialog
      v-model="showConfirm"
      title="确认提交审批"
      width="480px"
      :close-on-click-modal="false"
    >
      <div class="space-y-4">
        <div class="bg-gray-50 rounded-lg p-3 space-y-2">
          <div class="flex items-center gap-2 text-sm">
            <el-icon :size="16" class="text-gray-400"><InfoFilled /></el-icon>
            <span class="text-gray-600">审批信息</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div class="text-gray-500">标题：</div>
            <div class="font-medium text-gray-900 truncate">{{ title }}</div>
            <div class="text-gray-500">金额：</div>
            <div class="font-medium text-gray-900">¥{{ amount.toLocaleString() }}</div>
            <div class="text-gray-500">审批级别：</div>
            <div class="font-medium text-gray-900">{{ flowInfo.title }}</div>
            <div class="text-gray-500">审批人数：</div>
            <div class="font-medium text-gray-900">{{ levelResult.approverCount }}人</div>
          </div>
        </div>

        <div v-if="levelResult.approvers.length > 0" class="bg-gray-50 rounded-lg p-3">
          <div class="text-sm font-medium text-gray-700 mb-2">审批流程：</div>
          <div class="space-y-1">
            <div
              v-for="(approver, index) in levelResult.approvers"
              :key="index"
              class="flex items-center gap-2 text-sm"
            >
              <span class="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center">
                {{ index + 1 }}
              </span>
              <span class="text-gray-900">{{ approver.userName }}</span>
              <span class="text-gray-400">({{ approver.role }})</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-3">
          <el-button @click="showConfirm = false" class="flex-1">取消</el-button>
          <el-button
            type="primary"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            @click="handleSubmit"
            class="flex-1"
            style="background-color: #4f46e5; border-color: #4f46e5;"
          >
            {{ isSubmitting ? '提交中...' : '确认提交' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Promotion, CircleCheck, Clock, Warning, Money, InfoFilled } from '@element-plus/icons-vue'
import { ApprovalLevel, getApprovalLevelName as getConfigApprovalLevelName } from '@/config/approvalHierarchy.js'
import { resolveApprovalLevel } from '@/utils/approvalLevelResolver.js'

const props = defineProps({
  /** 审批类型 */
  approvalType: { type: String, required: true },
  /** 申请金额 */
  amount: { type: Number, default: 0 },
  /** 申请人ID */
  applicantId: { type: String, default: '' },
  /** 申请人名称 */
  applicantName: { type: String, default: '' },
  /** 申请人部门 */
  applicantDepartment: { type: String, default: '' },
  /** 业务标题 */
  title: { type: String, required: true },
  /** 业务描述 */
  description: { type: String, default: '' },
  /** 附加数据 */
  additionalData: { type: Object, default: () => ({}) },
  /** 业务关联数据 */
  businessLink: { type: Object, default: null },
  /** 自定义提交按钮文本 */
  submitText: { type: String, default: '提交审批' },
  /** 是否显示快速审批提示 */
  showQuickTips: { type: Boolean, default: true },
  /** 是否显示金额阈值信息 */
  showAmountThreshold: { type: Boolean, default: true },
})

const emit = defineEmits(['submit', 'success'])

const isSubmitting = ref(false)
const showConfirm = ref(false)

// 解析审批级别
const levelResult = computed(() => {
  return resolveLevel(props.approvalType, props.amount, props.additionalData)
})

// 审批级别中文名称
const levelName = computed(() => {
  return getConfigApprovalLevelName(levelResult.value.level)
})

// 判断审批流程信息
const flowInfo = computed(() => {
  const { level, config } = levelResult.value

  if (level === ApprovalLevel.EXEMPT) {
    return {
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-700',
      title: '免审批',
      description: '金额低于阈值，将自动通过',
    }
  }

  if (level === ApprovalLevel.QUICK) {
    return {
      color: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-700',
      title: `快速审批（${config.name}）`,
      description: '单人审批，快速通过',
    }
  }

  if (level === ApprovalLevel.STANDARD) {
    return {
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-700',
      title: `标准审批（${config.name}）`,
      description: '部门主管 + 经理二级审批',
    }
  }

  return {
    color: 'bg-red-50 border-red-200',
    textColor: 'text-red-700',
    title: `严格审批（${config.name}）`,
    description: '部门主管 + 经理 + 总监三级审批',
  }
})

// 处理提交
const handleSubmit = async () => {
  emit('submit', {
    type: props.approvalType,
    amount: props.amount,
    title: props.title,
    description: props.description,
    approvalLevel: levelResult.value.level,
    approvers: levelResult.value.approvers,
    autoApprove: levelResult.value.autoApprove,
  })

  isSubmitting.value = true

  // 模拟提交延迟
  await new Promise(resolve => setTimeout(resolve, 1000))

  isSubmitting.value = false
  showConfirm.value = false

  emit('success')
}
</script>
