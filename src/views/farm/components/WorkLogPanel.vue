<template>
  <div class="space-y-4">
    <!-- 页面标题 - 工作日志 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <el-icon :size="20" class="text-white"><Document /></el-icon>
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-900">工作日志管理</h2>
          <p class="text-xs text-gray-500">记录和查看日常农事工作日志</p>
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
          <span class="text-sm text-gray-500">工人:</span>
          <el-select v-model="filters.worker" placeholder="全部" class="w-28" clearable>
            <el-option label="全部" value="" />
            <el-option label="张三" value="张三" />
            <el-option label="李四" value="李四" />
            <el-option label="王五" value="王五" />
          </el-select>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">大棚:</span>
          <el-select v-model="filters.greenhouse" placeholder="全部" class="w-28" clearable>
            <el-option label="全部" value="" />
            <el-option label="1号大棚" value="1号大棚" />
            <el-option label="2号大棚" value="2号大棚" />
            <el-option label="3号大棚" value="3号大棚" />
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

    <!-- 日志列表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table :data="paginatedLogs" style="width: 100%" v-loading="loading">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="code" label="日志编号" width="130" />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="worker" label="工人" width="100" />
        <el-table-column prop="weather" label="天气" width="80" />
        <el-table-column prop="temperature" label="温度" width="80" />
        <el-table-column prop="crop" label="作物" width="100" />
        <el-table-column prop="greenhouse" label="大棚" width="120" />
        <el-table-column prop="growthStatus" label="生长状况" width="100" show-overflow-tooltip />
        <el-table-column prop="tasks" label="工作内容" min-width="180" show-overflow-tooltip />
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
          :total="filteredLogs.length"
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
import { Document, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 筛选条件
const filters = ref({
  date: '',
  worker: '',
  greenhouse: ''
})

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10
})

// 加载状态
const loading = ref(false)

// 日志数据
const workLogs = ref([
  {
    id: '1',
    code: 'WL20240115001',
    date: '2024-01-15',
    worker: '张三',
    weather: '晴',
    temperature: '25°C',
    crop: '番茄',
    greenhouse: '1号大棚',
    growthStatus: '开花期',
    tasks: '完成浇水、施肥操作',
    problems: '未发现病虫害',
    solutions: '-'
  },
  {
    id: '2',
    code: 'WL20240115002',
    date: '2024-01-15',
    worker: '李四',
    weather: '晴',
    temperature: '26°C',
    crop: '黄瓜',
    greenhouse: '2号大棚',
    growthStatus: '结果期',
    tasks: '病虫害防治喷药',
    problems: '发现少量蚜虫',
    solutions: '使用吡虫啉进行防治'
  },
  {
    id: '3',
    code: 'WL20240114001',
    date: '2024-01-14',
    worker: '王五',
    weather: '多云',
    temperature: '22°C',
    crop: '番茄',
    greenhouse: '3号大棚',
    growthStatus: '幼苗期',
    tasks: '除草、松土',
    problems: '杂草较多',
    solutions: '增加除草频率'
  }
])

// 过滤后的日志
const filteredLogs = computed(() => {
  return workLogs.value.filter(log => {
    if (filters.value.date && log.date !== filters.value.date) {
      return false
    }
    if (filters.value.worker && log.worker !== filters.value.worker) {
      return false
    }
    if (filters.value.greenhouse && log.greenhouse !== filters.value.greenhouse) {
      return false
    }
    return true
  })
})

// 分页后的日志
const paginatedLogs = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredLogs.value.slice(start, end)
})

// 搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
}

// 重置
const handleReset = () => {
  filters.value = {
    date: '',
    worker: '',
    greenhouse: ''
  }
  pagination.value.currentPage = 1
}

// 新增
const handleAdd = () => {
  ElMessage.info('新增工作日志 - 功能待实现')
}

// 导出
const handleExport = () => {
  ElMessage.info('导出功能 - 待实现')
}

// 查看
const handleView = (row) => {
  ElMessage.info(`查看日志: ${row.code}`)
}

// 编辑
const handleEdit = (row) => {
  ElMessage.info(`编辑日志: ${row.code}`)
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除日志 "${row.code}" 吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
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
