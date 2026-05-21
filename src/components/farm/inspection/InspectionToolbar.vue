<template>
  <div class="p-4 border-b border-gray-100 flex items-center justify-between">
    <div class="flex items-center gap-4">
      <h3 class="text-lg font-semibold text-gray-900">巡查记录列表</h3>
      <div v-if="stats" class="flex items-center gap-2 text-sm">
        <span class="text-gray-500">共</span>
        <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-semibold rounded">{{ stats.total }}</span>
        <span class="text-gray-500">条</span>
        <span class="text-green-600">| 正常 {{ stats.normal }}</span>
        <span class="text-yellow-600">| 需关注 {{ stats.attention }}</span>
        <span class="text-red-600">| 异常 {{ stats.abnormal }}</span>
      </div>
    </div>

    <div v-if="exportMode || batchEditMode || batchDeleteMode" class="flex gap-2">
      <!-- 导出模式 -->
      <template v-if="exportMode">
        <el-button size="small" type="primary" @click="onConfirmExport">
          <el-icon><Download /></el-icon>
          确认导出
        </el-button>
        <el-button size="small" @click="onCancelExport">取消</el-button>
      </template>

      <!-- 批量编辑模式 -->
      <template v-if="batchEditMode">
        <el-button size="small" type="primary" @click="onConfirmBatchEdit">
          <el-icon><Edit /></el-icon>
          确认编辑
        </el-button>
        <el-button size="small" @click="onCancelBatchEdit">取消</el-button>
      </template>

      <!-- 批量删除模式 -->
      <template v-if="batchDeleteMode">
        <el-button size="small" type="danger" @click="onConfirmBatchDelete">
          <el-icon><Delete /></el-icon>
          确认删除
        </el-button>
        <el-button size="small" @click="onCancelBatchDelete">取消</el-button>
      </template>
    </div>

    <div v-else class="flex gap-2">
      <el-button size="small" type="primary" @click="onCreate">
        <el-icon><Plus /></el-icon>
        新增
      </el-button>
      <el-button size="small" type="primary" @click="onBatchEdit">
        <el-icon><Edit /></el-icon>
        编辑
      </el-button>
      <el-button size="small" type="danger" @click="onBatchDelete">
        <el-icon><Delete /></el-icon>
        删除
      </el-button>
      <el-button size="small" @click="onExport">
        <el-icon><Download /></el-icon>
        导出
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { Plus, Edit, Delete, Download } from '@element-plus/icons-vue'

defineProps({})
</script>
