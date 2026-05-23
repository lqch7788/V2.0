<template>
  <div class="space-y-4 p-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <el-icon :size="20" color="white">
            <CirclePlus />
          </el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">临时工入职</h1>
          <p class="text-xs text-gray-500">临时工入职登记与管理</p>
        </div>
      </div>
    </div>

    <!-- 操作按钮栏 -->
    <div class="bg-white rounded-xl p-3 shadow-sm flex items-center justify-end">
      <el-button type="primary" size="small" @click="openFormModal">
        <el-icon><Plus /></el-icon> 登记临时工
      </el-button>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <el-table :data="paginatedData" stripe>
        <el-table-column prop="employeeCode" label="工号" min-width="140" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="phone" label="手机号" min-width="120" />
        <el-table-column prop="idCard" label="身份证号" min-width="180" />
        <el-table-column prop="position" label="岗位" min-width="100" />
        <el-table-column prop="department" label="部门" min-width="100" />
        <el-table-column prop="dailyWage" label="日工资(元)" min-width="100" />
        <el-table-column prop="joinDate" label="入职日期" min-width="120" />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '在职' : '已离职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">详情</el-button>
            <el-button link type="danger" size="small" @click="handleLeave(row)">离职</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex items-center justify-between p-4 border-t border-gray-100">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span>每页</span>
          <el-select v-model="pagination.pageSize" size="small" style="width: 80px" @change="handlePageSizeChange">
            <el-option :value="10" label="10条" />
            <el-option :value="20" label="20条" />
            <el-option :value="50" label="50条" />
          </el-select>
        </div>
        <el-pagination
          v-model:current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          :total="allData.length"
          layout="prev, pager, next"
          background
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="临时工详情" width="600px">
      <div v-if="currentRecord" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="工号">{{ currentRecord.employeeCode }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ currentRecord.name }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentRecord.phone }}</el-descriptions-item>
          <el-descriptions-item label="身份证号" :span="2">{{ currentRecord.idCard }}</el-descriptions-item>
          <el-descriptions-item label="岗位">{{ currentRecord.position }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ currentRecord.department }}</el-descriptions-item>
          <el-descriptions-item label="日工资">{{ currentRecord.dailyWage }} 元</el-descriptions-item>
          <el-descriptions-item label="入职日期">{{ currentRecord.joinDate }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentRecord.status === 'active' ? 'success' : 'info'" size="small">
              {{ currentRecord.status === 'active' ? '在职' : '已离职' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增弹窗 -->
    <el-dialog v-model="formDialogVisible" title="登记临时工" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="工号">
          <el-input v-model="formData.employeeCode" readonly placeholder="系统自动生成" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="formData.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="岗位" prop="position">
          <el-input v-model="formData.position" placeholder="请输入岗位" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="formData.department" placeholder="请输入部门" />
        </el-form-item>
        <el-form-item label="日工资" prop="dailyWage">
          <el-input-number v-model="formData.dailyWage" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="入职日期" prop="joinDate">
          <el-date-picker
            v-model="formData.joinDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { CirclePlus, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { } from 'element-plus'

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

// 详情弹窗
const detailDialogVisible = ref(false)
const currentRecord = ref(null)

// 表单弹窗
const formDialogVisible = ref(false)
const formRef = ref()
const formData = reactive({
  employeeCode: '', // 工号（自动生成）
  name: '',
  phone: '',
  idCard: '',
  position: '',
  department: '',
  dailyWage: 200,
  joinDate: new Date().toISOString().split('T')[0]
})

const formRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  position: [{ required: true, message: '请输入岗位', trigger: 'blur' }],
  department: [{ required: true, message: '请输入部门', trigger: 'blur' }],
  dailyWage: [{ required: true, message: '请输入日工资', trigger: 'blur' }],
  joinDate: [{ required: true, message: '请选择入职日期', trigger: 'change' }]
}

// 模拟数据 - 包含工号字段（格式: YG-YYYYMMDD-XXX）
const allData = ref([
  { id: 1, employeeCode: 'YG-20260501-001', name: '临时工A', phone: '13900139001', idCard: '110101199001011234', position: '搬运工', department: '仓储部', dailyWage: 200, joinDate: '2026-05-01', status: 'active' },
  { id: 2, employeeCode: 'YG-20260510-002', name: '临时工B', phone: '13900139002', idCard: '110101199002022345', position: '包装工', department: '生产部', dailyWage: 180, joinDate: '2026-05-10', status: 'active' },
  { id: 3, employeeCode: 'YG-20260415-003', name: '临时工C', phone: '13900139003', idCard: '110101199003033456', position: '搬运工', department: '仓储部', dailyWage: 200, joinDate: '2026-04-15', status: 'inactive' }
])

// 分页数据
const paginatedData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return allData.value.slice(start, start + pagination.pageSize)
})

// 分页
const handlePageSizeChange = () => {
  pagination.currentPage = 1
}

// 详情
const viewDetail = (row) => {
  currentRecord.value = row
  detailDialogVisible.value = true
}

/**
 * 生成临时工工号
 * 格式: YG-YYYYMMDD-XXX（当日第几个入职）
 */
const generateEmployeeCode = () => {
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '') // YYYYMMDD
  // 计算当日已入职的临时工数量 + 1作为序号
  const todayCount = allData.value.filter(r => r.joinDate === today.toISOString().split('T')[0]).length + 1
  const sequence = String(todayCount).padStart(3, '0')
  return `YG-${dateStr}-${sequence}`
}

// 新增
const openFormModal = () => {
  Object.assign(formData, {
    employeeCode: generateEmployeeCode(), // 自动生成工号
    name: '',
    phone: '',
    idCard: '',
    position: '',
    department: '',
    dailyWage: 200,
    joinDate: new Date().toISOString().split('T')[0]
  })
  formDialogVisible.value = true
}

// 离职
const handleLeave = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要让 ${row.name} 离职吗？`, '确认离职', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const index = allData.value.findIndex(r => r.id === row.id)
    if (index !== -1) {
      allData.value[index].status = 'inactive'
    }
    ElMessage.success('已办理离职')
  } catch {
    // 取消操作
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      allData.value.unshift({
        id: Date.now(),
        ...formData,
        status: 'active'
      })
      ElMessage.success('登记成功')
      formDialogVisible.value = false
    }
  })
}
</script>

<style scoped>
/* 继承全局样式 */
</style>
