<template>
  <div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <!-- 表格工具栏 -->
    <div class="p-4 border-b border-gray-100 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">种源记录表</h3>

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
      <el-table-column prop="seedCode" label="种源批号" width="150" />
      <el-table-column prop="sourceType" label="种源类型" width="120">
        <template #default="{ row }">
          {{ getSourceTypeLabel(row.sourceType) }}
        </template>
      </el-table-column>
      <el-table-column prop="cropCategory" label="作物类别" width="100" />
      <el-table-column prop="cropName" label="作物名称" width="120" />
      <el-table-column prop="cropVariety" label="作物品种" width="120" />
      <el-table-column prop="supplierName" label="供应商" width="120" />
      <el-table-column prop="purchaseDate" label="采购日期" width="120" />
      <el-table-column prop="quantity" label="采购数量" width="100" align="right" />
      <el-table-column prop="unit" label="单位" width="60" />
      <el-table-column prop="initialCount" label="初始数量" width="100" align="right" />
      <el-table-column prop="availableCount" label="可用数量" width="100" align="right" />
      <el-table-column prop="status" label="库存状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createBy" label="创建人" width="100" />
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="$emit('detail', row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <el-button link type="primary" size="small" @click="$emit('edit', row)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button link type="primary" size="small" @click="$emit('print', row)">
            <el-icon><Printer /></el-icon>
            打印
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
import { Plus, Download, View, Edit, Printer, Delete } from '@element-plus/icons-vue'

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

const emit = defineEmits(['selectionChange', 'pageChange', 'sizeChange', 'add', 'edit', 'delete', 'detail', 'export', 'print', 'confirmExport', 'cancelExport'])

const handleSelectionChange = (selection) => {
  emit('selectionChange', selection.map(item => item.id))
}

const handlePageChange = (page) => {
  emit('pageChange', page)
}

const handleSizeChange = (size) => {
  emit('sizeChange', size)
}

const getSourceTypeLabel = (type) => {
  const map = {
    'seed': '种子',
    'seedling': '种苗/实生苗',
    'cutting': '扦插苗',
    'grafting': '嫁接苗',
    'tissue_culture': '组培苗',
    'split': '分株苗',
    'bulb': '种球/球根',
    'other': '其他'
  }
  return map[type] || type
}

const getStatusLabel = (status) => {
  const map = {
    'sufficient': '充足',
    'low': '不足',
    'depleted': '耗尽'
  }
  return map[status] || status
}

const getStatusType = (status) => {
  const map = {
    'sufficient': 'success',
    'low': 'warning',
    'depleted': 'danger'
  }
  return map[status] || 'info'
}
</script>
