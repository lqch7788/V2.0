<template>
  <el-dialog
    :model-value="isOpen"
    :title="`作业标准文件 - ${task?.id || ''}`"
    width="600px"
    @close="onClose"
  >
    <div class="bg-gray-50 rounded-lg p-4">
      <div class="mb-3">
        <span class="text-sm font-medium text-gray-700">任务类型：</span>
        <div class="flex flex-wrap gap-2 mt-1">
          <el-tag
            v-for="t in task?.types || []"
            :key="t"
            :type="getTypeTag(t)"
            size="small"
          >
            {{ getTypeLabel(t) }}
          </el-tag>
        </div>
      </div>
      <div class="bg-white rounded-lg p-4 border border-gray-200">
        <pre class="text-sm text-gray-700 whitespace-pre-wrap font-sans">{{ task?.sopContent || '暂无SOP内容' }}</pre>
      </div>
    </div>
    <template #footer>
      <el-button @click="onClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>

defineProps({})

const getTypeTag = (type) => {
  const map = {
    irrigation: 'primary',
    fertilization: 'success',
    pruning: 'warning',
    harvest: 'danger',
  }
  return map[type] || 'info'
}

const getTypeLabel = (type) => {
  const map = {
    irrigation: '灌溉',
    fertilization: '施肥',
    pruning: '修剪',
    harvest: '采收',
    scouting: '巡查',
    spraying: '喷药',
    weeding: '除草',
  }
  return map[type] || type
}
</script>
