<!--
  任务附件列表
  对标 V1.1 src/components/labor/tasks/TaskAttachmentList.tsx
-->
<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <h3 class="font-semibold mb-3 flex items-center gap-2">
      <el-icon><Link /></el-icon>
      附件 ({{ attachments?.length || 0 }})
    </h3>
    <el-empty v-if="!attachments?.length" description="暂无附件" />
    <div v-else class="space-y-2">
      <div
        v-for="(file, idx) in attachments"
        :key="idx"
        class="flex items-center justify-between p-2 rounded hover:bg-gray-50"
      >
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <el-icon :size="20" :color="getFileColor(file.name)"><component :is="getFileIcon(file.name)" /></el-icon>
          <div class="flex-1 min-w-0">
            <div class="text-sm truncate">{{ file.name }}</div>
            <div class="text-xs text-gray-400">{{ formatSize(file.size) }}</div>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <el-button link type="primary" size="small" @click="$emit('download', file)">下载</el-button>
          <el-button link type="danger" size="small" @click="$emit('remove', file)">删除</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Document, Link, Picture, VideoPlay } from '@element-plus/icons-vue'

defineProps({
  attachments: { type: Array, default: () => [] },
})

defineEmits(['download', 'remove'])

const getFileIcon = (name) => {
  const ext = name?.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return Picture
  if (['mp4', 'avi', 'mov'].includes(ext)) return VideoPlay
  return Document
}

const getFileColor = (name) => {
  const ext = name?.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png'].includes(ext)) return '#3b82f6'
  if (['pdf'].includes(ext)) return '#ef4444'
  if (['doc', 'docx'].includes(ext)) return '#059669'
  return '#6b7280'
}

const formatSize = (size) => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  return (size / 1024 / 1024).toFixed(1) + ' MB'
}
</script>