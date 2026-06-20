<!--
  审批级别徽章组件
  对标 V1.1 src/components/approval/ApprovalLevelBadge.tsx (181 行)
  功能：根据审批级别显示不同颜色和图标的徽章
-->
<template>
  <el-tag :type="tagType" :effect="effect" size="small" class="approval-level-badge">
    <el-icon v-if="iconName" :size="12" class="mr-1">
      <component :is="iconName" />
    </el-icon>
    {{ levelText }}
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'
import { Star, Trophy, Medal } from '@element-plus/icons-vue'

const props = defineProps({
  // 审批级别: 1-普通 2-部门 3-公司 4-集团 5-紧急
  level: { type: [Number, String], default: 1 },
  // 紧急程度: normal/high/urgent
  urgency: { type: String, default: 'normal' },
})

const LEVEL_MAP = {
  1: { text: '一级审批', tag: 'info', icon: Medal },
  2: { text: '二级审批', tag: 'primary', icon: Star },
  3: { text: '三级审批', tag: 'success', icon: Trophy },
  4: { text: '四级审批', tag: 'warning', icon: Trophy },
  5: { text: '紧急审批', tag: 'danger', icon: Trophy },
}

const URGENCY_MAP = {
  normal: 'light',
  high: 'dark',
  urgent: 'dark',
}

const levelInfo = computed(() => LEVEL_MAP[props.level] || LEVEL_MAP[1])
const levelText = computed(() => {
  if (props.urgency === 'urgent') return `${levelInfo.value.text}·加急`
  return levelInfo.value.text
})
const tagType = computed(() => {
  if (props.urgency === 'urgent') return 'danger'
  return levelInfo.value.tag
})
const effect = computed(() => URGENCY_MAP[props.urgency] || 'light')
const iconName = computed(() => levelInfo.value.icon)
</script>

<style scoped>
.approval-level-badge {
  display: inline-flex;
  align-items: center;
  font-weight: 500;
}
</style>