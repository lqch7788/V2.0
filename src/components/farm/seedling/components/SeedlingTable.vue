<template>
  <div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <!-- 表格工具栏 -->
    <div class="p-4 border-b border-gray-100 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">育苗记录表</h3>

      <!-- 批量操作模式 -->
      <template v-if="exportMode">
        <div class="flex gap-2">
          <el-button type="primary" size="small" @click="$emit('confirmExport')" :disabled="selectedRows.length === 0">
            <el-icon><Download /></el-icon>
            确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
          </el-button>
          <el-button size="small" @click="$emit('cancelExport')">取消选择</el-button>
        </div>
      </template>

      <!-- 默认模式 -->
      <template v-else>
        <div class="flex gap-2">
          <el-button v-if="canCreate" type="primary" size="small" @click="$emit('add')">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
          <el-button v-if="canExport" size="small" @click="$emit('export')">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </template>
    </div>

    <!-- 表格 -->
    <el-table
      :data="data"
      :pagination="{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: data.length,
        showSizeChanger,
        showQuickJumper,
        showTotal: (total) => `共 ${total} 条`
      }"
      @selection-change="handleSelectionChange"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
      style="width: 100%"
      v-loading="loading"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="seedlingCode" label="育苗批号" width="150" />
      <el-table-column prop="sourceCode" label="关联种源" width="150" />
      <el-table-column prop="cropName" label="作物名称" width="120" />
      <el-table-column prop="cropVariety" label="作物品种" width="120" />
      <el-table-column prop="seedlingType" label="育苗方式" width="100" />
      <el-table-column prop="siteName" label="场地" width="100" />
      <el-table-column prop="startDate" label="开始日期" width="120" />
      <el-table-column prop="expectedEndDate" label="预计结束" width="120" />
      <el-table-column prop="initialCount" label="初始数量" width="100" align="right" />
      <el-table-column prop="survivalCount" label="成活数量" width="100" align="right" />
      <el-table-column prop="plantedCount" label="已定植" width="100" align="right" />
      <el-table-column prop="lossCount" label="损耗数量" width="100" align="right" />
      <el-table-column prop="survivalRate" label="成苗率" width="80">
        <template #default="{ row }">
          {{ row.survivalRate }}%
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createBy" label="创建人" width="100" />
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="$emit('detail', row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <el-button link type="primary" size="small" @click="$emit('edit', row)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button link type="primary" size="small" @click="$emit('dailyRecord', row)">
            <el-icon><Clock /></el-icon>
            记录
          </el-button>
          <el-button link type="success" size="small" @click="$emit('transplant', row)">
            <el-icon><Refresh /></el-icon>
            定植
          </el-button>
          <el-button link type="danger" size="small" @click="$emit('delete', [row.id])">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { Plus, Download, View, Edit, Clock, Refresh, Delete } from '@element-plus/icons-vue'

defineProps({
  data: Array,
  selectedRows: Array,
  loading: Boolean,
  exportMode: Boolean,
  canCreate: Boolean,
  canEdit: Boolean,
  canDelete: Boolean,
  canExport: Boolean,
  canPrint: Boolean
})

const emit = defineEmits(['selectionChange', 'pageChange', 'sizeChange', 'add', 'edit', 'delete', 'detail', 'export', 'print', 'confirmExport', 'cancelExport', 'refresh'])

const handleSelectionChange = (selection) => {
  emit('selectionChange', selection.map(item => item.id))
}

const handlePageChange = (page) => {
  emit('pageChange', page)
}

const handleSizeChange = (size) => {
  emit('sizeChange', size)
}

const getStatusLabel = (status) => {
  const map = {
    'in_progress': '进行中',
    'transplant_ready': '待定植',
    'completed': '已完成',
    'abnormal': '异常'
  }
  return map[status] || status
}

const getStatusType = (status) => {
  const map = {
    'in_progress': 'primary',
    'transplant_ready': 'warning',
    'completed': 'success',
    'abnormal': 'danger'
  }
  return map[status] || 'info'
}
</script>
