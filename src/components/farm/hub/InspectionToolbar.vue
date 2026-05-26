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
        <!-- 导出模式 -->
        <template v-if="exportMode">
          <el-button type="primary" size="small" @click="onConfirmExport">
            <el-icon class="mr-1"><Download /></el-icon>
            确认导出
          </el-button>
          <el-button size="small" @click="onCancelExport">取消</el-button>
        </template>

        <!-- 批量编辑模式 -->
        <template v-if="batchEditMode">
          <el-button type="primary" size="small" @click="onConfirmBatchEdit">
            <el-icon class="mr-1"><Edit /></el-icon>
            确认编辑
          </el-button>
          <el-button size="small" @click="onCancelBatchEdit">取消</el-button>
        </template>

        <!-- 批量删除模式 -->
        <template v-if="batchDeleteMode">
          <el-button type="danger" size="small" @click="onConfirmBatchDelete">
            <el-icon class="mr-1"><Delete /></el-icon>
            确认删除
          </el-button>
          <el-button size="small" @click="onCancelBatchDelete">取消</el-button>
        </template>
      </div>
    </template>

    <!-- 默认操作按钮 -->
    <template v-else>
      <div class="flex gap-2">
        <el-button type="primary" size="small" @click="onCreate">
          <el-icon class="mr-1"><Plus /></el-icon>
          新增
        </el-button>
        <el-button size="small" @click="onBatchEdit">
          <el-icon class="mr-1"><Edit /></el-icon>
          编辑
        </el-button>
        <el-button type="danger" size="small" @click="onBatchDelete">
          <el-icon class="mr-1"><Delete /></el-icon>
          删除
        </el-button>
        <el-button size="small" @click="onExport">
          <el-icon class="mr-1"><Download /></el-icon>
          导出
        </el-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { Plus, Edit, Delete, Download } from '@element-plus/icons-vue'

defineProps({
  // 模式状态
  exportMode: { type: Boolean, default: false },
  batchEditMode: { type: Boolean, default: false },
  batchDeleteMode: { type: Boolean, default: false },
  // 统计信息
  stats: { type: Object, default: undefined },
  // 操作回调
  onCreate: { type: Function, default: () => {} },
  onBatchEdit: { type: Function, default: () => {} },
  onBatchDelete: { type: Function, default: () => {} },
  onExport: { type: Function, default: () => {} },
  onConfirmExport: { type: Function, default: () => {} },
  onCancelExport: { type: Function, default: () => {} },
  onConfirmBatchEdit: { type: Function, default: () => {} },
  onCancelBatchEdit: { type: Function, default: () => {} },
  onConfirmBatchDelete: { type: Function, default: () => {} },
  onCancelBatchDelete: { type: Function, default: () => {} }
})
</script>
