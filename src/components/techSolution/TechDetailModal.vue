<template>
  <el-dialog
    :model-value="visible"
    title="方案详情"
    width="700px"
    @close="handleClose"
  >
    <div class="space-y-4" v-if="tech">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="方案编号">
          {{ tech.code }}
        </el-descriptions-item>
        <el-descriptions-item label="版本">
          {{ tech.version }}
        </el-descriptions-item>
        <el-descriptions-item label="方案标题" :span="2">
          {{ tech.title }}
        </el-descriptions-item>
        <el-descriptions-item label="作物品种">
          {{ tech.crop }}
        </el-descriptions-item>
        <el-descriptions-item label="种植模式">
          {{ tech.plantingMode }}
        </el-descriptions-item>
        <el-descriptions-item label="适用范围">
          {{ tech.stage }}
        </el-descriptions-item>
        <el-descriptions-item label="编制人">
          {{ tech.author }}
        </el-descriptions-item>
        <el-descriptions-item label="创建日期">
          {{ tech.createDate }}
        </el-descriptions-item>
        <el-descriptions-item label="审核人">
          {{ tech.approver || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="审批状态">
          <el-tag :type="tech.approveStatus === '已审批' ? 'success' : 'warning'" size="small">
            {{ tech.approveStatus }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(tech.statusClass)" size="small">
            {{ tech.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="方案是否有效">
          <el-tag :type="tech.isValid === '作废' ? 'danger' : 'success'" size="small">
            {{ tech.isValid || '有效' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="方案内容" :span="2">
          <div class="p-3 bg-gray-50 rounded-lg text-sm">
            {{ tech.content || '-' }}
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import {  TechSolution  } from './types'

defineProps({})

const emit = defineEmits(['close'])

const getStatusType = (statusClass) => {
  if (statusClass === 'normal') return 'success'
  if (statusClass === 'pending') return 'warning'
  return 'info'
}

const handleClose = () => {
  emit('close')
}
</script>
