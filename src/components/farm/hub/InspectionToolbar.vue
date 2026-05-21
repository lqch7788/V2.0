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

    <!-- 批量操作模式 -->
    <template v-if="exportMode || batchEditMode || batchDeleteMode">
      <div class="flex gap-2">
        <el-button v-if="exportMode" type="primary" size="small" @click="onConfirmExport">
          <el-icon><Download /></el-icon>
          确认导出
        </el-button>
        <el-button v-if="exportMode" size="small" @click="onCancelExport">取消</el-button>

        <el-button v-if="batchEditMode" type="primary" size="small" @click="onConfirmBatchEdit">
          <el-icon><Edit /></el-icon>
          确认编辑
        </el-button>
        <el-button v-if="batchEditMode" size="small" @click="onCancelBatchEdit">取消</el-button>

        <el-button v-if="batchDeleteMode" type="danger" size="small" @click="onConfirmBatchDelete">
          <el-icon><Delete /></el-icon>
          确认删除
        </el-button>
        <el-button v-if="batchDeleteMode" size="small" @click="onCancelBatchDelete">取消</el-button>
      </div>
    </template>

    <!-- 默认模式 -->
    <template v-else>
      <div class="flex gap-2">
        <el-button type="primary" size="small" @click="onCreate">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
        <el-button type="primary" size="small" @click="onBatchEdit">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
        <el-button type="danger" size="small" @click="onBatchDelete">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
        <el-button size="small" @click="onExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { Plus, Edit, Delete, Download } from '@element-plus/icons-vue'

defineProps({})
</script>
