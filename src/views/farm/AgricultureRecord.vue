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
          <span class="text-sm text-gray-500">作物:</span>
          <el-select v-model="filters.crop" placeholder="全部" class="w-28" clearable>
            <el-option label="全部" value="" />
            <el-option label="番茄" value="番茄" />
            <el-option label="黄瓜" value="黄瓜" />
            <el-option label="茄子" value="茄子" />
            <el-option label="辣椒" value="辣椒" />
          </el-select>
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
        <el-table-column prop="recordCode" label="记录编号" width="140" />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="zone" label="区域" width="100" />
        <el-table-column prop="greenhouse" label="大棚" width="100" />
        <el-table-column prop="crop" label="作物" width="80" />
        <el-table-column prop="activityType" label="活动类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getActivityTypeTag(row.activityType)" size="small">
              {{ row.activityType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="workContent" label="工作内容" min-width="180" show-overflow-tooltip />
        <el-table-column prop="worker" label="作业人员" width="100" />
        <el-table-column prop="workHours" label="工时" width="80" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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
import { getTasksWithPagination, deleteTask } from '@/services/apiFarmTaskService'

// 筛选条件
const filters = ref({
  date: '',
  zone: '',
  crop: ''
})

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10
})

// 加载状态
const loading = ref(false)

// 记录数据（从真实API获取）
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
    if (filters.value.date) {
      params.startDate = filters.value.date
      params.endDate = filters.value.date
    }

    const result = await getTasksWithPagination(params)

    // 数据映射：将后端任务数据映射为前端记录格式
    records.value = (result.data || []).map(task => ({
      id: task.id || task.taskCode || '',
      recordCode: task.taskCode || task.id || '',
      date: task.planDate || '',
      zone: task.greenhouseName || '',
      greenhouse: task.greenhouseName || '',
      crop: task.crop || '',
      activityType: task.taskType || task.typeName || '',
      workContent: task.content || task.title || '',
      worker: task.assigneeName || '',
      workHours: task.estimatedHours || 0,
      // 保留原始任务数据供其他操作使用
      _原始数据: task
    }))

    total.value = result.total || records.value.length
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

// 过滤后的记录
const filteredRecords = computed(() => {
  return records.value.filter(record => {
    if (filters.value.date && record.date !== filters.value.date) {
      return false
    }
    if (filters.value.zone && record.zone !== filters.value.zone) {
      return false
    }
    if (filters.value.crop && record.crop !== filters.value.crop) {
      return false
    }
    return true
  })
})

// 分页后的记录
const paginatedRecords = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredRecords.value.slice(start, end)
})

// 获取活动类型标签颜色
const getActivityTypeTag = (type) => {
  const typeMap = {
    '浇水': 'primary',
    '施肥': 'success',
    '除草': 'warning',
    '修剪': 'info',
    '采收': 'danger',
    '打药': 'danger'
  }
  return typeMap[type] || ''
}

// 搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
  loadRecords()
}

// 重置
const handleReset = () => {
  filters.value = {
    date: '',
    zone: '',
    crop: ''
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

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除记录 "${row.recordCode}" 吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 调用真实API删除
    await deleteTask(row.id)
    ElMessage.success('删除成功')

    // 重新加载数据
    loadRecords()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
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
