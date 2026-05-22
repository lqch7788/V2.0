<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><View /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">巡检管理</h1>
          <p class="text-xs text-gray-500">农场巡检记录</p>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">日期:</span>
          <el-date-picker
            v-model="filters.date"
            type="date"
            placeholder="选择日期"
            class="w-36"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">巡检类型:</span>
          <el-select v-model="filters.inspectionType" placeholder="全部" class="w-28" clearable>
            <el-option label="全部" value="" />
            <el-option label="日常巡检" value="日常巡检" />
            <el-option label="定期巡检" value="定期巡检" />
            <el-option label="专项巡检" value="专项巡检" />
          </el-select>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">区域:</span>
          <el-select v-model="filters.zone" placeholder="全部" class="w-28" clearable>
            <el-option label="全部" value="" />
            <el-option label="东区" value="东区" />
            <el-option label="西区" value="西区" />
            <el-option label="南区" value="南区" />
            <el-option label="北区" value="北区" />
          </el-select>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">状态:</span>
          <el-select v-model="filters.status" placeholder="全部" class="w-28" clearable>
            <el-option label="全部" value="" />
            <el-option label="正常" value="正常" />
            <el-option label="异常" value="异常" />
            <el-option label="已处理" value="已处理" />
          </el-select>
        </div>

        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>

        <div class="ml-auto flex gap-2">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增巡检
          </el-button>
          <el-button @click="handleExport">导出</el-button>
        </div>
      </div>
    </div>

    <!-- 巡检记录列表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table :data="paginatedInspections" style="width: 100%" v-loading="loading">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="inspectionCode" label="巡检编号" width="140" />
        <el-table-column prop="inspectionDate" label="巡检日期" width="120" />
        <el-table-column prop="inspectionType" label="巡检类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.inspectionType)" size="small">
              {{ row.inspectionType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="zone" label="区域" width="100" />
        <el-table-column prop="greenhouse" label="大棚" width="100" />
        <el-table-column prop="inspector" label="巡检员" width="100" />
        <el-table-column prop="checkResult" label="检查结果" width="100">
          <template #default="{ row }">
            <el-tag :type="getResultTag(row.checkResult)" size="small">
              {{ row.checkResult }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="issueCount" label="问题数量" width="80" />
        <el-table-column prop="status" label="处理状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="success" size="small" @click="handleFeedback(row)">反馈</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-end p-4">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredInspections.length"
          layout="total, sizes, prev, pager, next"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { View, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 筛选条件
const filters = ref({
  date: '',
  inspectionType: '',
  zone: '',
  status: ''
})

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10
})

// 加载状态
const loading = ref(false)

// 巡检数据
const inspections = ref([
  {
    id: '1',
    inspectionCode: 'XJ20240115001',
    inspectionDate: '2024-01-15',
    inspectionType: '日常巡检',
    zone: '东区',
    greenhouse: '1号大棚',
    inspector: '张三',
    checkResult: '正常',
    issueCount: 0,
    status: '已处理'
  },
  {
    id: '2',
    inspectionCode: 'XJ20240115002',
    inspectionDate: '2024-01-15',
    inspectionType: '日常巡检',
    zone: '东区',
    greenhouse: '2号大棚',
    inspector: '李四',
    checkResult: '异常',
    issueCount: 2,
    status: '处理中'
  },
  {
    id: '3',
    inspectionCode: 'XJ20240114001',
    inspectionDate: '2024-01-14',
    inspectionType: '定期巡检',
    zone: '西区',
    greenhouse: '1号大棚',
    inspector: '王五',
    checkResult: '正常',
    issueCount: 0,
    status: '已处理'
  }
])

// 过滤后的巡检记录
const filteredInspections = computed(() => {
  return inspections.value.filter(inspection => {
    if (filters.value.date && inspection.inspectionDate !== filters.value.date) {
      return false
    }
    if (filters.value.inspectionType && inspection.inspectionType !== filters.value.inspectionType) {
      return false
    }
    if (filters.value.zone && inspection.zone !== filters.value.zone) {
      return false
    }
    if (filters.value.status && inspection.status !== filters.value.status) {
      return false
    }
    return true
  })
})

// 分页后的巡检记录
const paginatedInspections = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredInspections.value.slice(start, end)
})

// 获取巡检类型标签颜色
const getTypeTag = (type) => {
  const typeMap = {
    '日常巡检': 'primary',
    '定期巡检': 'success',
    '专项巡检': 'warning'
  }
  return typeMap[type] || ''
}

// 获取检查结果标签颜色
const getResultTag = (result) => {
  const typeMap = {
    '正常': 'success',
    '异常': 'danger'
  }
  return typeMap[result] || ''
}

// 获取处理状态标签颜色
const getStatusTag = (status) => {
  const typeMap = {
    '已处理': 'success',
    '处理中': 'warning',
    '待处理': 'info'
  }
  return typeMap[status] || ''
}

// 搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
}

// 重置
const handleReset = () => {
  filters.value = {
    date: '',
    inspectionType: '',
    zone: '',
    status: ''
  }
  pagination.value.currentPage = 1
}

// 新增
const handleAdd = () => {
  ElMessage.info('新增巡检记录 - 功能待实现')
}

// 导出
const handleExport = () => {
  ElMessage.info('导出功能 - 待实现')
}

// 查看
const handleView = (row) => {
  ElMessage.info(`查看巡检记录: ${row.inspectionCode}`)
}

// 反馈
const handleFeedback = (row) => {
  ElMessage.info(`处理反馈: ${row.inspectionCode}`)
}

// 分页大小改变
const handlePageSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
}

// 页码改变
const handlePageChange = (page) => {
  pagination.value.currentPage = page
}
</script>
