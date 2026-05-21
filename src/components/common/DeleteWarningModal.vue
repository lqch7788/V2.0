<template>
  <el-dialog
    :model-value="isOpen"
    :title="title"
    width="400px"
    @close="onClose"
  >
    <div class="flex items-center gap-3 mb-4">
      <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
        <el-icon :size="24" class="text-red-600"><WarningFilled /></el-icon>
      </div>
      <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
    </div>
    <div class="text-sm text-gray-600 space-y-2 mb-6">
      <p v-if="description">{{ description }}</p>
      <template v-else>
        <p>确定要删除选中的 <strong>{{ selectedCount }}</strong> 个项目吗？</p>
        <p>此操作 <strong class="text-red-600">无法恢复</strong>，删除后数据将永久丢失。</p>
      </template>
    </div>
    <template #footer>
      <div class="flex gap-3">
        <el-button @click="onClose">取消</el-button>
        <el-button type="danger" @click="onConfirm">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { WarningFilled } from '@element-plus/icons-vue'

defineProps({"selectedCount":"0","title":"'删除警告'"})
</script>
