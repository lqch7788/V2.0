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
          <h1 class="text-2xl font-bold text-gray-900">临时工入职</h1>
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
      <el-table :data="paginatedData" stripe v-loading="loading" :header-cell-style="{ background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: '#fff', fontWeight: '600', fontSize: '14px' }">
        <el-table-column prop="employeeCode" label="工号" min-width="140" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="phone" label="手机号" min-width="120" />
        <el-table-column prop="idCard" label="身份证号" min-width="180" />
        <el-table-column prop="position" label="岗位" min-width="100" />
        <el-table-column prop="department" label="部门" min-width="100" />
        <el-table-column prop="dailyWage" label="日工资(元)" min-width="100">
          <template #default="{ row }">
            ¥{{ row.dailyWage }}
          </template>
        </el-table-column>
        <el-table-column prop="joinDate" label="入职日期" min-width="120" />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '在职' : '已离职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" :icon="View" circle title="查看详情" @click="viewDetail(row)" />
            <el-button size="small" :icon="CircleClose" circle type="danger" title="离职" @click="handleLeave(row)" />
          </template>
        </el-table-column>
        <template #empty>
          <div class="text-center py-8">
            <p class="text-gray-400">{{ error || '暂无数据' }}</p>
          </div>
        </template>
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
          :total="pagination.total"
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
import { ref, computed, reactive, onMounted } from 'vue'
import { CirclePlus, Plus, View, CircleClose } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLaborStore } from '@/stores/modules/labor'
import { WORKER_TYPE_OPTIONS } from '@/data/laborData'

// Labor Store
const laborStore = useLaborStore()

// 分页
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })

// 弹窗
const detailDialogVisible = ref(false)
const currentRecord = ref(null)
const formDialogVisible = ref(false)
const formRef = ref()
const formData = reactive({
  id: null, employeeCode: '', name: '', phone: '', idCard: '',
  position: '', department: '', dailyWage: 200,
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

// 数据
const allData = ref([])
const loading = ref(false)
const error = ref('')

// 加载数据（临时工 type=temporary）
const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    const params = { page: pagination.currentPage, pageSize: pagination.pageSize, type: 'temporary' }
    await laborStore.fetchWorkers(params)
    allData.value = laborStore.workerList
    pagination.total = laborStore.workerTotal
  } catch (e) {
    console.error('加载临时工数据失败:', e)
    error.value = '加载数据失败'
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 分页数据
const paginatedData = computed(() => allData.value)

// 分页
const handlePageSizeChange = () => { pagination.currentPage = 1; loadData() }

// 详情
const viewDetail = (row) => { currentRecord.value = row; detailDialogVisible.value = true }

// 新增
const openFormModal = () => {
  Object.assign(formData, {
    id: null, employeeCode: '', name: '', phone: '', idCard: '',
    position: '', department: '', dailyWage: 200,
    joinDate: new Date().toISOString().split('T')[0]
  })
  formDialogVisible.value = true
}

// 离职
const handleLeave = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要让 ${row.staffName || row.name} 离职吗？`, '确认离职', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    await laborStore.workerLeave(row.id, { leaveDate: new Date().toISOString().split('T')[0] })
    ElMessage.success('已办理离职')
    loadData()
  } catch { /* 取消 */ }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      const payload = {
        name: formData.name, phone: formData.phone, idCard: formData.idCard,
        position: formData.position, department: formData.department,
        dailyWage: formData.dailyWage, joinDate: formData.joinDate,
        type: 'temporary', status: 'active'
      }
      await laborStore.createWorker(payload)
      ElMessage.success('登记成功')
      formDialogVisible.value = false
      loadData()
    }
  })
}

onMounted(() => { loadData() })
</script>

<style scoped>
/* 继承全局样式 */
</style>
