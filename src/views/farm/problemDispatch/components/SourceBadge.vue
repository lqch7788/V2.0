<!--
  问题来源徽章
  对标 V1.1 src/components/farm/problemDispatch/components/SourceBadge.tsx
-->
<template>
  <el-tag :type="tagType" effect="plain" size="small">
    <el-icon :size="12" class="mr-1"><component :is="icon" /></el-icon>
    {{ sourceText }}
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'
import { Search, View, Bell, EditPen } from '@element-plus/icons-vue'

const props = defineProps({
  source: { type: String, default: 'inspection' },
})

const SOURCE_MAP = {
  inspection: { tag: 'warning', text: '巡检发现', icon: Search },
  feedback: { tag: 'primary', text: '员工反馈', icon: Bell },
  report: { tag: 'success', text: '上报', icon: EditPen },
  system: { tag: 'info', text: '系统监测', icon: View },
}

const sourceInfo = computed(() => SOURCE_MAP[props.source] || SOURCE_MAP.inspection)
const tagType = computed(() => sourceInfo.value.tag)
const icon = computed(() => sourceInfo.value.icon)
const sourceText = computed(() => sourceInfo.value.text)
</script>