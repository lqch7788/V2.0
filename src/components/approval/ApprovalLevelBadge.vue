<template>
  <!-- 紧凑模式 -->
  <span
    v-if="compact"
    :class="[
      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
      config.bgColor,
      config.textColor,
      className
    ]"
  >
    <component :is="config.icon" class="w-4 h-4" />
    {{ name }}
  </span>

  <!-- 完整模式 -->
  <span
    v-else
    :class="[
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border',
      config.bgColor,
      config.textColor,
      config.borderColor,
      className
    ]"
  >
    <component :is="config.icon" class="w-4 h-4" />
    <span class="font-medium">{{ name }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { CheckCircle, Zap, Users, ShieldX } from '@element-plus/icons-vue'

// ============================================================
// 审批级别徽章组件
// 文件路径：src/components/approval/ApprovalLevelBadge.vue
// 功能：显示审批级别的徽章和说明
// ============================================================

// 审批级别枚举（与V1.1保持一致）
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

// 审批级别配置
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
  //       局部 const 变量。改用字面量更安全（值与 ApprovalLevel.STANDARD 完全一致）。
  level: {
    type: [String, Number],
    default: 'standard'
  },
  // 是否显示图标
  showIcon: {
    type: Boolean,
    default: true
  },
  // 是否为紧凑模式
  compact: {
    type: Boolean,
    default: false
  },
  // 自定义样式
  className: {
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
</script>
