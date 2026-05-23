<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><Folder /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">农事记录</h1>
          <p class="text-xs text-gray-500">农事活动记录</p>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 - 与V1.1保持一致 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap items-center gap-4">
        <!-- 来源类型筛选 -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">来源:</span>
          <el-select v-model="filters.sourceType" placeholder="全部" class="w-28" clearable>
            <el-option label="全部" value="" />
            <el-option label="任务" value="task" />
            <el-option label="临时任务" value="tempTask" />
            <el-option label="手动录入" value="manual" />
            <el-option label="巡检" value="inspection" />
          </el-select>
        </div>

        <!-- 操作类型筛选 -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">操作类型:</span>
          <el-select v-model="filters.operationType" placeholder="全部" class="w-28" clearable>
            <el-option label="全部" value="" />
            <el-option label="浇水" value="irrigation" />
            <el-option label="施肥" value="fertilization" />
            <el-option label="除草" value="weeding" />
            <el-option label="修剪" value="pruning" />
            <el-option label="采收" value="harvest" />
            <el-option label="打药" value="pest_control" />
            <el-option label="种植" value="planting" />
            <el-option label="其他" value="other" />
          </el-select>
        </div>

        <!-- 状态筛选 -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">状态:</span>
          <el-select v-model="filters.status" placeholder="全部" class="w-28" clearable>
            <el-option label="全部" value="" />
            <el-option label="待执行" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="待验收" value="waiting_acceptance" />
            <el-option label="已驳回" value="rejected" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </div>

        <!-- 区域筛选 -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">区域:</span>
          <el-select v-model="filters.greenhouseId" placeholder="全部" class="w-28" clearable>
            <el-option label="全部" value="" />
            <el-option label="东区" value="东区" />
            <el-option label="西区" value="西区" />
            <el-option label="南区" value="南区" />
            <el-option label="北区" value="北区" />
          </el-select>
        </div>

        <!-- 操作人员筛选 -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">操作人员:</span>
          <el-select v-model="filters.operatorId" placeholder="全部" class="w-28" clearable>
            <el-option label="全部" value="" />
            <el-option label="陆启闯" value="陆启闯" />
            <el-option label="张三" value="张三" />
            <el-option label="李四" value="李四" />
          </el-select>
        </div>

        <!-- 日期范围筛选 -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">日期:</span>
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="w-56"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </div>

        <!-- 搜索文本 -->
        <div class="flex items-center gap-2">
          <el-input
            v-model="filters.searchText"
            placeholder="搜索记录编号/作物/区域"
            class="w-44"
            clearable
          />
        </div>

        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>

        <div class="ml-auto flex gap-2">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增
          </el-button>
          <el-button @click="handleExport">导出</el-button>
        </div>
      </div>
    </div>

    <!-- 记录列表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table :data="paginatedRecords" style="width: 100%" v-loading="loading">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="recordCode" label="操作单号" width="140" />
        <el-table-column prop="sourceType" label="来源" width="100">
          <template #default="{ row }">
            <el-tag :type="getSourceTypeTag(row.sourceType)" size="small">
              {{ getSourceTypeLabel(row.sourceType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sourceCode" label="来源编号" width="140" />
        <el-table-column prop="operationType" label="操作类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getActivityTypeTag(row.operationType)" size="small">
              {{ row.operationTypeName || row.operationType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="作物/区域" width="140">
          <template #default="{ row }">
            <div class="text-sm">
              <div class="font-medium text-gray-900">{{ row.cropName }}</div>
              <div class="text-gray-500 text-xs">{{ row.greenhouseName }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="operatorName" label="操作人员" width="100" />
        <el-table-column prop="operationDate" label="操作日期" width="120" />
        <el-table-column prop="progress" label="进度" width="100">
          <template #default="{ row }">
            <div class="flex items-center gap-2" v-if="row.progress !== undefined">
              <el-progress :percentage="row.progress || 0" :width="30" type="circle" />
            </div>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" min-width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-end p-4">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Folder, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOperationRecords, deleteOperationRecord } from '@/services/apiOperationRecordService'

// 来源配置（与V1.1保持一致）
const SOURCE_CONFIG = {
  task: { label: '任务', color: 'primary' },
  tempTask: { label: '临时任务', color: 'warning' },
  manual: { label: '手动录入', color: 'success' },
  inspection: { label: '巡检', color: 'info' }
}

// 状态选项
const STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待执行' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'waiting_acceptance', label: '待验收' },
  { value: 'rejected', label: '已驳回' },
  { value: 'cancelled', label: '已取消' }
]

// 操作类型配置
const OPERATION_TYPE_CONFIG = {
  irrigation: { label: '浇水', color: 'primary' },
  fertilization: { label: '施肥', color: 'success' },
  weeding: { label: '除草', color: 'warning' },
  pruning: { label: '修剪', color: 'info' },
  harvest: { label: '采收', color: 'danger' },
  pest_control: { label: '打药', color: 'danger' },
  planting: { label: '种植', color: 'success' },
  other: { label: '其他', color: 'info' }
}

// 筛选条件 - 与V1.1保持一致
const filters = ref({
  sourceType: '',       // 来源类型
  operationType: '',     // 操作类型
  status: '',           // 状态
  greenhouseId: '',     // 区域
  operatorId: '',       // 操作人员
  dateRange: [],        // 日期范围 [开始, 结束]
  searchText: ''        // 搜索文本
})

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10
})

// 加载状态
const loading = ref(false)

// 记录数据
const records = ref([])

// 总数
const total = ref(0)

// 加载数据
const loadRecords = async () => {
  loading.value = true
  try {
    // 构建筛选参数
    const params = {
      page: pagination.value.currentPage,
      limit: pagination.value.pageSize
    }

    // 添加筛选条件
    if (filters.value.sourceType) {
      params.sourceType = filters.value.sourceType
    }
    if (filters.value.operationType) {
      params.operationType = filters.value.operationType
    }
    if (filters.value.status) {
      params.status = filters.value.status
    }
    if (filters.value.greenhouseId) {
      params.greenhouseId = filters.value.greenhouseId
    }
    if (filters.value.operatorId) {
      params.operatorId = filters.value.operatorId
    }
    if (filters.value.dateRange && filters.value.dateRange.length === 2) {
      params.dateFrom = filters.value.dateRange[0]
      params.dateTo = filters.value.dateRange[1]
    }
    if (filters.value.searchText) {
      params.search = filters.value.searchText
    }

    const result = await getOperationRecords(params)

    // 数据映射
    records.value = (result.data || []).map(record => ({
      id: record.id,
      recordCode: record.recordCode,
      sourceType: record.sourceType,
      sourceCode: record.sourceCode,
      operationType: record.operationType,
      operationTypeName: record.operationTypeName,
      status: record.status,
      greenhouseName: record.greenhouseName,
      cropName: record.cropName,
      operatorName: record.operatorName,
      operationDate: record.operationDate,
      progress: record.progress,
      remarks: record.remarks,
      children: record.children
    }))

    total.value = result.meta?.total || records.value.length
  } catch (error) {
    console.error('加载农事记录失败:', error)
    ElMessage.error('加载农事记录失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadRecords()
})

// 分页后的记录
const paginatedRecords = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return records.value.slice(start, end)
})

// 获取来源类型标签
const getSourceTypeTag = (type) => {
  return SOURCE_CONFIG[type]?.color || 'info'
}

// 获取来源类型标签文字
const getSourceTypeLabel = (type) => {
  return SOURCE_CONFIG[type]?.label || type
}

// 获取活动类型标签颜色
const getActivityTypeTag = (type) => {
  return OPERATION_TYPE_CONFIG[type]?.color || ''
}

// 获取状态标签
const getStatusTag = (status) => {
  const tagMap = {
    'completed': 'success',
    'in_progress': 'primary',
    'pending': 'warning',
    'waiting_acceptance': 'warning',
    'rejected': 'danger',
    'cancelled': 'info'
  }
  return tagMap[status] || 'info'
}

// 获取状态标签文字
const getStatusLabel = (status) => {
  const found = STATUS_OPTIONS.find(s => s.value === status)
  return found?.label || status
}

// 搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
  loadRecords()
}

// 重置
const handleReset = () => {
  filters.value = {
    sourceType: '',
    operationType: '',
    status: '',
    greenhouseId: '',
    operatorId: '',
    dateRange: [],
    searchText: ''
  }
  pagination.value.currentPage = 1
  loadRecords()
}

// 新增
const handleAdd = () => {
  ElMessage.info('新增农事记录 - 功能待实现')
}

// 导出
const handleExport = () => {
  ElMessage.info('导出功能 - 待实现')
}

// 查看
const handleView = (row) => {
  ElMessage.info(`查看记录: ${row.recordCode}`)
}

// 编辑
const handleEdit = (row) => {
  ElMessage.info(`编辑记录: ${row.recordCode}`)
}

// 分页大小改变
const handlePageSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  loadRecords()
}

// 页码改变
const handlePageChange = (page) => {
  pagination.value.currentPage = page
  loadRecords()
}
</script>
