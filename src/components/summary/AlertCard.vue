<template>
  <!-- 预警/报警卡片组件 -->
  <div
    :class="[
      'border-l-4 rounded-r-lg p-4',
      styles.bg,
      styles.border,
      onClick ? 'cursor-pointer hover:shadow-sm transition-shadow' : ''
    ]"
    @click="handleClick"
  >
    <div class="flex items-start gap-3">
      <!-- 图标 -->
      <div
        :class="['w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', styles.iconBg, isCritical ? 'animate-pulse' : '']"
      >
        <el-icon :size="20" :color="styles.iconColor">
          <component :is="isCritical ? 'WarnTriangleFilled' : 'WarningFilled'" />
        </el-icon>
      </div>
      <!-- 内容 -->
      <div class="flex-1 min-w-0">
        <p :class="['text-sm font-semibold', styles.textColor]">{{ title }}</p>
        <p :class="['text-xs mt-0.5', styles.descColor]">{{ description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { WarnTriangleFilled, WarningFilled } from '@element-plus/icons-vue'

const props = defineProps({
  // 预警标题
  title: {
    type: String,
    default: ''
  },
  // 预警描述
  description: {
    type: String,
    default: ''
  },
  // 严重程度：warning | critical
  severity: {
    type: String,
    default: 'warning'
  },
  // 点击回调
  onClick: {
    type: Function,
    default: null
  }
})

// 严重程度对应的样式配置
const SEVERITY_STYLES = {
  warning: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconColor: '#d97706',
    textColor: 'text-amber-800',
    descColor: 'text-amber-600',
  },
  critical: {
    border: 'border-l-red-500',
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
    iconColor: '#dc2626',
    textColor: 'text-red-800',
    descColor: 'text-red-600',
  },
}

const styles = computed(() => SEVERITY_STYLES[props.severity])
const isCritical = computed(() => props.severity === 'critical')

const handleClick = () => {
  if (props.onClick) {
    props.onClick()
  }
}
</script>
