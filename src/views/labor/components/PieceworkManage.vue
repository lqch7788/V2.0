<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <el-icon :size="20" color="white"><Box /></el-icon>
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-900">计件工资管理</h1>
            <p class="text-xs text-gray-500">管理临时工计件工资记录</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <el-button>导入</el-button>
          <el-button @click="handleExportClick">导出</el-button>
          <el-button type="primary" @click="handleAdd">新建</el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-4">
      <div class="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
        <div class="p-2 rounded-lg bg-blue-50">
          <el-icon :size="20" color="#3b82f6"><User /></el-icon>
        </div>
        <div>
          <p class="text-xs text-gray-500">计件工人</p>
          <p class="text-lg font-semibold text-gray-900">{{ stats.totalWorkers }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
        <div class="p-2 rounded-lg bg-green-50">
          <el-icon :size="20" color="#22c55e"><Box /></el-icon>
        </div>
        <div>
          <p class="text-xs text-gray-500">总数量</p>
          <p class="text-lg font-semibold text-gray-900">{{ stats.totalQuantity.toLocaleString() }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
        <div class="p-2 rounded-lg bg-emerald-50">
          <el-icon :size="20" color="#10b981"><Coin /></el-icon>
        </div>
        <div>
          <p class="text-xs text-gray-500">总工资</p>
          <p class="text-lg font-semibold text-gray-900">¥{{ stats.totalAmount.toLocaleString() }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
        <div class="p-2 rounded-lg bg-purple-50">
          <el-icon :size="20" color="#a855f7"><Coin /></el-icon>
        </div>
        <div>
          <p class="text-xs text-gray-500">人均工资</p>
          <p class="text-lg font-semibold text-gray-900">¥{{ stats.avgAmountPerWorker.toFixed(2) }}</p>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="p-4 bg-white rounded-lg border border-gray-200">
      <div class="flex items-center gap-4 flex-wrap">
        <span class="text-sm font-medium text-gray-700">筛选条件</span>
        <el-input v-model="filters.workerName" placeholder="员工姓名" clearable class="w-[160px]" />
        <el-input v-model="filters.taskName" placeholder="任务名称" clearable class="w-[160px]" />
        <el-date-picker
          v-model="filters.startDate"
          type="date"
          placeholder="开始日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          class="w-[160px]"
        />
        <el-date-picker
          v-model="filters.endDate"
          type="date"
          placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          class="w-[160px]"
        />
        <el-select v-model="filters.status" placeholder="全部状态" clearable class="w-[140px]">
          <el-option label="待确认" value="待确认" />
          <el-option label="已确认" value="已确认" />
          <el-option label="已发放" value="已发放" />
        </el-select>
        <el-button type="ghost" @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <el-table :data="paginatedData" border stripe>
        <el-table-column prop="workDate" label="日期" width="120" />
        <el-table-column prop="workerName" label="员工" width="100" />
        <el-table-column prop="taskName" label="任务" width="150" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="quantity" label="数量" width="100" align="right">
          <template #default="{ row }">
            {{ row.quantity.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="unitPrice" label="单价" width="100" align="right">
          <template #default="{ row }">
            ¥{{ row.unitPrice.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="total" label="合计" width="120" align="right">
          <template #default="{ row }">
            <span class="text-emerald-600 font-semibold">¥{{ row.total.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">详情</el-button>
            <el-button link type="success" @click="handleConfirm(row)">确认</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div class="text-sm text-gray-500">
          共 {{ total }} 条记录，第 {{ pagination.currentPage }} / {{ totalPages }} 页
        </div>
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="sizes, prev, pager, next"
        />
      </div>
    </div>

    <!-- 新增弹窗 -->
    <el-dialog v-model="addModalVisible" title="新建计件记录" width="600px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="员工">
          <el-input v-model="formData.workerName" />
        </el-form-item>
        <el-form-item label="任务">
          <el-input v-model="formData.taskName" />
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="formData.unit" />
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="formData.quantity" :min="0" class="w-full" />
        </el-form-item>
        <el-form-item label="单价">
          <el-input-number v-model="formData.unitPrice" :min="0" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="工作日期">
          <el-date-picker
            v-model="formData.workDate"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remarks" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAdd">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailModalVisible" title="计件详情" width="500px">
      <div v-if="selectedRecord" class="space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">员工</span>
          <span class="text-gray-900">{{ selectedRecord.workerName }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">任务</span>
          <span class="text-gray-900">{{ selectedRecord.taskName }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">单位</span>
          <span class="text-gray-900">{{ selectedRecord.unit }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">数量</span>
          <span class="text-gray-900">{{ selectedRecord.quantity.toLocaleString() }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">单价</span>
          <span class="text-gray-900">¥{{ selectedRecord.unitPrice.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">合计</span>
          <span class="text-emerald-600 font-semibold">¥{{ selectedRecord.total.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">工作日期</span>
          <span class="text-gray-900">{{ selectedRecord.workDate }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">状态</span>
          <el-tag :type="getStatusType(selectedRecord.status)" size="small">{{ selectedRecord.status }}</el-tag>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailModalVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Box, User, Coin } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 筛选条件
const filters = reactive({
  workerName: '',
  taskName: '',
  startDate: '',
  endDate: '',
  status: ''
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

// 统计数据
const stats = reactive({
  totalWorkers: 12,
  totalQuantity: 15000,
  totalAmount: 82500,
  avgAmountPerWorker: 5140
})

// 表格数据
const data = ref([
  {
    id: '1',
    workerName: '赵六',
    taskName: '番茄采摘',
    unit: '斤',
    quantity: 500,
    unitPrice: 0.5,
    total: 250,
    workDate: '2024-03-15',
    status: '已确认',
    remarks: ''
  },
  {
    id: '2',
    workerName: '钱七',
    taskName: '黄瓜包装',
    unit: '箱',
    quantity: 200,
    unitPrice: 2.5,
    total: 500,
    workDate: '2024-03-15',
    status: '待确认',
    remarks: ''
  },
  {
    id: '3',
    workerName: '孙八',
    taskName: '茄子分拣',
    unit: '斤',
    quantity: 800,
    unitPrice: 0.6,
    total: 480,
    workDate: '2024-03-14',
    status: '已发放',
    remarks: ''
  }
])

const total = computed(() => data.value.length)
const totalPages = computed(() => Math.ceil(total.value / pagination.pageSize))
const paginatedData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return data.value.slice(start, start + pagination.pageSize)
})

// 弹窗状态
const addModalVisible = ref(false)
const detailModalVisible = ref(false)
const selectedRecord = ref(null)

// 表单数据
const formData = reactive({
  workerName: '',
  taskName: '',
  unit: '斤',
  quantity: 0,
  unitPrice: 0,
  workDate: '',
  remarks: ''
})

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    '待确认': 'warning',
    '已确认': 'success',
    '已发放': 'primary'
  }
  return typeMap[status] || 'info'
}

// 处理重置
const handleReset = () => {
  filters.workerName = ''
  filters.taskName = ''
  filters.startDate = ''
  filters.endDate = ''
  filters.status = ''
}

// 处理新增
const handleAdd = () => {
  Object.assign(formData, {
    workerName: '',
    taskName: '',
    unit: '斤',
    quantity: 0,
    unitPrice: 0,
    workDate: '',
    remarks: ''
  })
  addModalVisible.value = true
}

// 确认新增
const handleConfirmAdd = () => {
  if (!formData.workerName || !formData.taskName || !formData.workDate) {
    ElMessage.warning('请填写完整信息')
    return
  }
  const total = formData.quantity * formData.unitPrice
  const newRecord = {
    id: Date.now().toString(),
    ...formData,
    total,
    status: '待确认'
  }
  data.value.unshift(newRecord)
  // 更新统计
  stats.totalQuantity += formData.quantity
  stats.totalAmount += total
  addModalVisible.value = false
  ElMessage.success('新增成功')
}

// 查看详情
const handleViewDetail = (row) => {
  selectedRecord.value = row
  detailModalVisible.value = true
}

// 确认
const handleConfirm = (row) => {
  row.status = '已确认'
  ElMessage.success('确认成功')
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除 "${row.workerName} - ${row.taskName}" 的计件记录吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const index = data.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      data.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消
  }
}

// 导出
const handleExportClick = () => {
  ElMessage.success('导出功能开发中')
}
</script>

<style scoped>
.bg-white {
  background-color: white;
}

.rounded-xl {
  border-radius: 0.75rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.space-y-4 > * + * {
  margin-top: 16px;
}

.grid {
  display: grid;
}

.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.gap-4 {
  gap: 16px;
}

.text-emerald-600 {
  color: #059669;
}

.font-semibold {
  font-weight: 600;
}
</style>
