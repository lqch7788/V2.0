<template>
  <!--
    审批级别信息组件（用于完整说明卡片）
    文件路径：src/components/approval/ApprovalLevelInfo.vue
    1:1 翻译自 V1.1 ApprovalLevelBadge.tsx (L117-150)
  -->
  <div :class="['p-4 rounded-lg border', config.bgColor, config.borderColor]">
    <div class="flex items-center gap-2 mb-2">
      <span :class="config.textColor">
        <component :is="config.icon" class="w-4 h-4" />
      </span>
      <span :class="['font-semibold', config.textColor]">{{ name }}</span>
      <!-- 自动通过徽章 -->
      <span
        v-if="autoApprove"
        class="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full"
      >
        自动通过
      </span>
    </div>
    <p :class="['text-sm', config.textColor, 'opacity-80']">
      {{ customReason || defaultReason }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CheckCircle, Zap, Users, ShieldX } from '@element-plus/icons-vue'

// ============================================================
// 审批级别枚举（与V1.1保持一致）
// ============================================================

const ApprovalLevel = {
  EXEMPT: 'exempt',       // 免审
  QUICK: 'quick',         // 快速
  STANDARD: 'standard',   // 标准
  STRICT: 'strict'        // 严格
}

// 审批级别名称映射
const APPROVAL_LEVEL_NAMES = {
  [ApprovalLevel.EXEMPT]: '免审',
  [ApprovalLevel.QUICK]: '快速',
  [ApprovalLevel.STANDARD]: '标准',
  [ApprovalLevel.STRICT]: '严格'
}

// 审批级别配置（与 ApprovalLevelBadge 保持一致）
const LEVEL_CONFIG = {
  [ApprovalLevel.EXEMPT]: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200'
  },
  [ApprovalLevel.QUICK]: {
    icon: Zap,
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200'
  },
  [ApprovalLevel.STANDARD]: {
    icon: Users,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  [ApprovalLevel.STRICT]: {
    icon: ShieldX,
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200'
  }
}

const props = defineProps({
  // 审批级别
  // P0-005 修复：使用字符串字面量 'standard' 替代 ApprovalLevel.STANDARD 引用
  // 原因：Vue SFC 编译器/Vite 在某些环境下不支持 defineProps default 引用
  //       局部 const 变量（即使 const 已在文件顶部声明）。改用字面量更安全。
  level: {
    type: [String, Number],
    default: 'standard'
  },
  // 审批人数
  approverCount: {
    type: Number,
    default: 0
  },
  // 是否自动通过
  autoApprove: {
    type: Boolean,
    default: false
  },
  // 自定义说明
  customReason: {
    type: String,
    default: ''
  }
})

// 验证级别是否有效
const validLevel = computed(() => {
  return Object.values(ApprovalLevel).includes(props.level)
    ? props.level
    : ApprovalLevel.STANDARD
})

// 获取配置
const config = computed(() => {
  return LEVEL_CONFIG[validLevel.value] || LEVEL_CONFIG[ApprovalLevel.STANDARD]
})

// 获取级别名称
const name = computed(() => {
  return APPROVAL_LEVEL_NAMES[validLevel.value] || '未知级别'
})

// 默认原因文案
const defaultReason = computed(() => {
  if (props.autoApprove) {
    return '系统自动审批通过，无需人工操作'
  }
  return `需要 ${props.approverCount} 位审批人进行审批`
})
</script>
