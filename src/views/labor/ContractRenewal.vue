<template>
  <div class="space-y-4 p-4">
    <!-- 筛选栏 -->
    <div class="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div class="flex items-center gap-1">
        <span class="text-sm text-gray-600">员工姓名</span>
        <el-input v-model="filters.employeeName" placeholder="搜索员工姓名" size="small" class="!w-36" clearable />
      </div>
      <div class="flex items-center gap-1">
        <span class="text-sm text-gray-600">部门</span>
        <el-select v-model="filters.department" placeholder="全部" size="small" class="!w-28" clearable>
          <el-option v-for="d in departmentOptions" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </div>
      <div class="flex items-center gap-1">
        <span class="text-sm text-gray-600">状态</span>
        <el-select v-model="filters.status" placeholder="全部" size="small" class="!w-24" clearable>
          <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
      </div>
      <div class="flex items-center gap-1">
        <span class="text-sm text-gray-600">合同到期</span>
        <el-date-picker v-model="filters.startDate" type="date" placeholder="开始" size="small" class="!w-32" value-format="YYYY-MM-DD" />
        <span class="text-gray-400">至</span>
        <el-date-picker v-model="filters.endDate" type="date" placeholder="结束" size="small" class="!w-32" value-format="YYYY-MM-DD" />
      </div>
      <div class="flex items-center gap-2 ml-auto">
        <el-button size="small" @click="handleSearch">
          <el-icon :size="14"><Search /></el-icon> 搜索
        </el-button>
        <el-button size="small" @click="handleReset">重置</el-button>
        <template v-if="batchMode === 'none'">
          <el-button type="primary" size="small" @click="openCreateModal">
            <el-icon :size="14"><Plus /></el-icon> 新增续签
          </el-button>
          <el-button size="small" @click="batchMode = 'approve'">批量通过</el-button>
          <el-button size="small" @click="batchMode = 'reject'">批量驳回</el-button>
          <el-button size="small" @click="handleExport">
            <el-icon :size="14"><Download /></el-icon> 导出
          </el-button>
        </template>
        <template v-else>
          <el-button v-if="batchMode === 'approve'" type="primary" size="small" :disabled="selectedRowKeys.length === 0" @click="handleBatchApprove">确认通过 ({{ selectedRowKeys.length }})</el-button>
          <el-button v-if="batchMode === 'reject'" type="danger" size="small" :disabled="selectedRowKeys.length === 0" @click="handleBatchReject">确认驳回 ({{ selectedRowKeys.length }})</el-button>
          <el-button size="small" @click="batchMode = 'none'; selectedRowKeys = []">取消</el-button>
        </template>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="border border-gray-200 rounded-lg overflow-hidden">
      <el-table
        :data="filteredData"
        stripe
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="48" align="center" />
        <el-table-column prop="employeeName" label="员工姓名" width="100" />
        <el-table-column prop="department" label="部门" width="100" />
        <el-table-column prop="position" label="岗位" width="100" />
        <el-table-column prop="currentContractEnd" label="当前合同到期日" width="130" />
        <el-table-column prop="newContractStart" label="新合同开始日期" width="130" />
        <el-table-column prop="newContractEnd" label="新合同到期日" width="130" />
        <el-table-column prop="renewalPeriod" label="续签期限" width="90">
          <template #default="{ row }">{{ row.renewalPeriod }}个月</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ row.statusLabel || row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <div class="flex items-center gap-1">
              <el-button link size="small" @click="openDetailModal(row)" title="查看详情">
                <el-icon :size="16"><View /></el-icon>
              </el-button>
              <template v-if="row.status === '待审批'">
                <el-button link size="small" type="success" @click="handleApprove(row)" title="批准">
                  <el-icon :size="16"><Select /></el-icon>
                </el-button>
                <el-button link size="small" type="danger" @click="handleReject(row)" title="驳回">
                  <el-icon :size="16"><CloseBold /></el-icon>
                </el-button>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="flex justify-end">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        background
      />
    </div>

    <!-- 新增弹窗 -->
    <ElModal v-model="createVisible" title="新建合同续签申请" size="lg" @submit="handleSubmit" @cancel="createVisible = false">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">员工姓名 <span class="text-red-500">*</span></label>
          <el-select v-model="form.employeeId" placeholder="请选择员工" class="w-full" @change="handleStaffChange">
            <el-option v-for="w in workers" :key="w.workerId" :value="w.workerId" :label="`${w.name} - ${w.department}`" />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">部门</label>
          <el-input v-model="form.department" readonly disabled />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">岗位</label>
          <el-input v-model="form.position" readonly disabled />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">当前合同到期日</label>
          <el-date-picker v-model="form.currentContractEnd" type="date" disabled class="w-full" value-format="YYYY-MM-DD" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">新合同开始日期 <span class="text-red-500">*</span></label>
          <el-date-picker v-model="form.newContractStart" type="date" placeholder="选择日期" class="w-full" value-format="YYYY-MM-DD" @change="calcEndDate" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">续签期限 <span class="text-red-500">*</span></label>
          <el-select v-model="form.renewalPeriod" class="w-full" @change="calcEndDate">
            <el-option v-for="p in periodOptions" :key="p.value" :label="p.label" :value="p.value" />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">新合同到期日 <span class="text-red-500">*</span></label>
          <el-date-picker v-model="form.newContractEnd" type="date" disabled class="w-full" value-format="YYYY-MM-DD" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">新薪资</label>
          <el-input-number v-model="form.newSalary" :min="0" :precision="2" class="w-full" placeholder="选填" />
        </div>
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">条款变更说明</label>
          <el-input v-model="form.termsChange" type="textarea" :rows="3" placeholder="请输入条款变更说明（选填）" />
        </div>
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
          <el-input v-model="form.remarks" type="textarea" :rows="2" placeholder="请输入备注信息（选填）" />
        </div>
      </div>
    </ElModal>

    <!-- 详情弹窗 -->
    <ElModal v-model="detailVisible" title="合同续签详情" size="md" :show-submit="false" cancel-text="关闭">
      <template v-if="selectedRecord">
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div><span class="text-sm text-gray-500">员工姓名：</span><span class="text-sm">{{ selectedRecord.employeeName }}</span></div>
            <div><span class="text-sm text-gray-500">部门：</span><span class="text-sm">{{ selectedRecord.department }}</span></div>
            <div><span class="text-sm text-gray-500">岗位：</span><span class="text-sm">{{ selectedRecord.position }}</span></div>
            <div><span class="text-sm text-gray-500">状态：</span><el-tag :type="statusTagType(selectedRecord.status)" size="small">{{ selectedRecord.statusLabel || selectedRecord.status }}</el-tag></div>
            <div><span class="text-sm text-gray-500">当前合同到期：</span><span class="text-sm">{{ selectedRecord.currentContractEnd }}</span></div>
            <div><span class="text-sm text-gray-500">新合同开始：</span><span class="text-sm">{{ selectedRecord.newContractStart }}</span></div>
            <div><span class="text-sm text-gray-500">新合同到期：</span><span class="text-sm">{{ selectedRecord.newContractEnd }}</span></div>
            <div><span class="text-sm text-gray-500">续签期限：</span><span class="text-sm">{{ selectedRecord.renewalPeriod }}个月</span></div>
            <div v-if="selectedRecord.newSalary"><span class="text-sm text-gray-500">新薪资：</span><span class="text-sm">¥{{ selectedRecord.newSalary?.toLocaleString() }}</span></div>
          </div>
          <div v-if="selectedRecord.termsChange">
            <span class="text-sm text-gray-500">条款变更：</span>
            <p class="text-sm mt-1 bg-gray-50 p-2 rounded">{{ selectedRecord.termsChange }}</p>
          </div>
          <div v-if="selectedRecord.remarks">
            <span class="text-sm text-gray-500">备注：</span>
            <p class="text-sm mt-1 bg-gray-50 p-2 rounded">{{ selectedRecord.remarks }}</p>
          </div>
        </div>
      </template>
    </ElModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Search, Plus, Download, View, Select, CloseBold } from '@element-plus/icons-vue'
import ElModal from '@/components/ui/ElModal.vue'

// ═══════════════ 模拟数据 ═══════════════
const workers = ref([
  { workerId: '1', name: '张三', department: '种植部', position: '技术员', contractExpireDate: '2026-08-15' },
  { workerId: '2', name: '李四', department: '采收部', position: '主管', contractExpireDate: '2026-06-30' },
  { workerId: '3', name: '王五', department: '行政部', position: '文员', contractExpireDate: '2026-12-01' },
  { workerId: '4', name: '赵六', department: '种植部', position: '工程师', contractExpireDate: '2026-05-20' },
])

const mockRecords = ref([
  { id: '1', employeeName: '张三', department: '种植部', position: '技术员', currentContractEnd: '2026-08-15', newContractStart: '2026-08-16', newContractEnd: '2028-08-15', renewalPeriod: 24, newSalary: 8500, termsChange: '', remarks: '', status: '待审批', statusLabel: '待审批' },
  { id: '2', employeeName: '李四', department: '采收部', position: '主管', currentContractEnd: '2026-06-30', newContractStart: '2026-07-01', newContractEnd: '2029-06-30', renewalPeriod: 36, newSalary: 12000, termsChange: '调整为项目制薪资', remarks: '', status: '已通过', statusLabel: '已通过' },
  { id: '3', employeeName: '王五', department: '行政部', position: '文员', currentContractEnd: '2026-12-01', newContractStart: '2026-12-02', newContractEnd: '2028-12-01', renewalPeriod: 24, newSalary: 6000, termsChange: '', remarks: '', status: '已驳回', statusLabel: '已驳回' },
])

// ═══════════════ 筛选 ═══════════════
const filters = reactive({ employeeName: '', department: '', status: '', startDate: '', endDate: '' })
const departmentOptions = [{ value: '', label: '全部' }, { value: '种植部', label: '种植部' }, { value: '采收部', label: '采收部' }, { value: '行政部', label: '行政部' }]
const statusOptions = [{ value: '', label: '全部' }, { value: '待审批', label: '待审批' }, { value: '已通过', label: '已通过' }, { value: '已驳回', label: '已驳回' }]

const filteredData = computed(() => {
  return mockRecords.value.filter(r => {
    if (filters.employeeName && !r.employeeName.includes(filters.employeeName)) return false
    if (filters.department && r.department !== filters.department) return false
    if (filters.status && r.status !== filters.status) return false
    return true
  })
})

const handleSearch = () => { /* 触发筛选 */ }
const handleReset = () => { filters.employeeName = ''; filters.department = ''; filters.status = ''; filters.startDate = ''; filters.endDate = '' }

// ═══════════════ 分页 ═══════════════
const pagination = reactive({ current: 1, pageSize: 10, total: computed(() => filteredData.value.length) })
watch(filteredData, () => { pagination.current = 1 })

// ═══════════════ 选择 ═══════════════
const selectedRowKeys = ref([])
const batchMode = ref('none')
const handleSelectionChange = (rows) => { selectedRowKeys.value = rows.map(r => r.id) }

// ═══════════════ 新增弹窗 ═══════════════
const createVisible = ref(false)
const periodOptions = [{ value: 12, label: '12个月(1年)' }, { value: 24, label: '24个月(2年)' }, { value: 36, label: '36个月(3年)' }, { value: 60, label: '60个月(5年)' }]

const form = reactive({
  employeeId: '', employeeName: '', department: '', position: '', currentContractEnd: '',
  newContractStart: '', newContractEnd: '', renewalPeriod: 12, newSalary: undefined, termsChange: '', remarks: ''
})

const openCreateModal = () => {
  Object.assign(form, { employeeId: '', employeeName: '', department: '', position: '', currentContractEnd: '', newContractStart: '', newContractEnd: '', renewalPeriod: 12, newSalary: undefined, termsChange: '', remarks: '' })
  createVisible.value = true
}

const handleStaffChange = (workerId) => {
  const w = workers.value.find(w => w.workerId === workerId)
  if (w) {
    form.employeeId = w.workerId; form.employeeName = w.name; form.department = w.department; form.position = w.position; form.currentContractEnd = w.contractExpireDate || ''
  }
}

const calcEndDate = () => {
  if (form.newContractStart && form.renewalPeriod) {
    const d = new Date(form.newContractStart); d.setMonth(d.getMonth() + form.renewalPeriod); form.newContractEnd = d.toISOString().slice(0, 10)
  }
}

const handleSubmit = () => {
  if (!form.employeeId || !form.newContractStart || !form.newContractEnd) { alert('请填写完整信息'); return }
  mockRecords.value.unshift({
    id: String(Date.now()), employeeName: form.employeeName, department: form.department, position: form.position,
    currentContractEnd: form.currentContractEnd, newContractStart: form.newContractStart, newContractEnd: form.newContractEnd,
    renewalPeriod: form.renewalPeriod, newSalary: form.newSalary, termsChange: form.termsChange, remarks: form.remarks,
    status: '待审批', statusLabel: '待审批'
  })
  createVisible.value = false
}

// ═══════════════ 详情弹窗 ═══════════════
const detailVisible = ref(false)
const selectedRecord = ref(null)
const openDetailModal = (record) => { selectedRecord.value = record; detailVisible.value = true }

// ═══════════════ 操作 ═══════════════
const handleApprove = (record) => { record.status = '已通过'; record.statusLabel = '已通过' }
const handleReject = (record) => { record.status = '已驳回'; record.statusLabel = '已驳回' }
const handleBatchApprove = () => { selectedRowKeys.value.forEach(id => { const r = mockRecords.value.find(r => r.id === id); if (r) { r.status = '已通过'; r.statusLabel = '已通过' } }); selectedRowKeys.value = []; batchMode.value = 'none' }
const handleBatchReject = () => { selectedRowKeys.value.forEach(id => { const r = mockRecords.value.find(r => r.id === id); if (r) { r.status = '已驳回'; r.statusLabel = '已驳回' } }); selectedRowKeys.value = []; batchMode.value = 'none' }

const handleExport = () => {
  const headers = ['员工姓名,部门,岗位,当前合同到期日,新合同开始日期,新合同到期日,续签期限,新薪资,状态']
  const rows = filteredData.value.map(r => `${r.employeeName},${r.department},${r.position},${r.currentContractEnd},${r.newContractStart},${r.newContractEnd},${r.renewalPeriod}个月,${r.newSalary||''},${r.status}`)
  const blob = new Blob(['\uFEFF' + headers.concat(rows).join('\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `合同续签记录_${new Date().toISOString().slice(0,10)}.csv`; a.click()
}

const statusTagType = (status) => ({ '待审批': 'warning', '已通过': 'success', '已驳回': 'danger' }[status] || 'info')
</script>
