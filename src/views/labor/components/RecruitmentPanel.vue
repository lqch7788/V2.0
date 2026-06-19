<template>
  <div class="space-y-4 p-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <el-icon :size="20" color="white">
            <Briefcase />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">招聘申请</h1>
          <p class="text-xs text-gray-500">招聘需求申请与审批流程</p>
        </div>
      </div>
    </div>

    <!-- 筛选栏（V1.1 RecruitmentFilters L1-97） -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div class="flex-1 min-w-[200px]">
          <el-input v-model="filters.keyword" placeholder="搜索招聘编号、岗位、部门..." clearable @clear="handleSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <el-select v-model="filters.status" placeholder="全部状态" clearable class="w-full sm:w-32">
          <el-option label="全部状态" value="" />
          <el-option label="待审批" value="待审批" />
          <el-option label="招聘中" value="招聘中" />
          <el-option label="已完成" value="已完成" />
          <el-option label="已取消" value="已取消" />
        </el-select>
        <el-select v-model="filters.source" placeholder="全部来源" clearable class="w-full sm:w-32">
          <el-option label="全部来源" value="" />
          <el-option label="劳务公司" value="劳务公司" />
          <el-option label="个人零工" value="个人零工" />
          <el-option label="学生实习" value="学生实习" />
          <el-option label="内部推荐" value="内部推荐" />
        </el-select>
        <div class="flex gap-2">
          <el-button type="warning" @click="handleResetFilters"><el-icon><RotateCcw /></el-icon> 重置</el-button>
          <el-button type="default" @click="handleSearch"><el-icon><Search /></el-icon> 搜索</el-button>
        </div>
      </div>
    </div>

    <!-- 数据表格（V1.1 RecruitmentTable L202-219 11 列） -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">招聘记录</h3>
        <div class="flex gap-2">
          <template v-if="!inBatchMode">
            <el-button size="small" type="primary" @click="openCreateModal"><el-icon><Plus /></el-icon> 新增</el-button>
            <el-button size="small" type="primary" plain @click="enterBatch('edit')"><el-icon><Edit2 /></el-icon> 编辑</el-button>
            <el-button size="small" type="danger" @click="enterBatch('delete')"><el-icon><Trash2 /></el-icon> 删除</el-button>
            <el-button size="small" @click="enterBatch('export')"><el-icon><Download /></el-icon> 导出</el-button>
          </template>
          <template v-else>
            <el-button v-if="batchEditMode" size="small" type="primary" :disabled="!selectedRows.length" @click="handleBatchEditConfirm">
              <el-icon><Edit2 /></el-icon> 批量编辑
            </el-button>
            <el-button v-if="batchDeleteMode" size="small" type="danger" :disabled="!selectedRows.length" @click="handleBatchDeleteConfirm">
              <el-icon><Trash2 /></el-icon> 确认删除
            </el-button>
            <el-button v-if="exportMode" size="small" :disabled="!selectedRows.length" @click="handleExportConfirm">
              <el-icon><Download /></el-icon> 确认导出
            </el-button>
            <el-button size="small" @click="cancelBatch"><el-icon><X /></el-icon> 取消</el-button>
          </template>
        </div>
      </div>

      <div v-if="inBatchMode" class="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-4">
        <el-button link size="small" @click="handleSelectAll">
          {{ selectedRows.length === paginatedFilteredData.length && paginatedFilteredData.length > 0 ? '全不选' : '全选' }}
        </el-button>
        <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
      </div>

      <div class="overflow-auto">
        <el-table ref="tableRef" :data="paginatedFilteredData" stripe v-loading="loading"
          @selection-change="handleSelectionChange">
          <el-table-column v-if="inBatchMode" type="selection" width="55" />
          <el-table-column prop="requestCode" label="招聘编号" min-width="140" />
          <el-table-column prop="position" label="招聘岗位" min-width="120" />
          <el-table-column prop="department" label="需求部门" min-width="100" />
          <el-table-column label="人数" min-width="80" align="center">
            <template #default="{ row }">{{ row.quantity }} 人</template>
          </el-table-column>
          <el-table-column prop="source" label="来源" min-width="100" />
          <el-table-column prop="expectedDate" label="期望到岗" min-width="120" />
          <el-table-column label="状态" min-width="100">
            <template #default="{ row }">
              <span :class="getStatusClass(row.status)">{{ row.status }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="applicantName" label="申请人" min-width="100" />
          <el-table-column prop="applyDate" label="申请日期" min-width="120" />
          <el-table-column v-if="!inBatchMode" label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-tooltip content="查看详情" placement="top">
                <el-button size="small" :icon="Eye" link @click="openDetailModal(row)" />
              </el-tooltip>
              <el-tooltip v-if="row.status === '待审批'" content="审批通过" placement="top">
                <el-button size="small" :icon="Check" link type="success" @click="handleApprove(row)" />
              </el-tooltip>
              <el-tooltip v-if="row.status === '待审批'" content="驳回" placement="top">
                <el-button size="small" :icon="XCircle" link type="danger" @click="handleReject(row)" />
              </el-tooltip>
              <el-tooltip v-if="row.status === '招聘中'" content="完成招聘" placement="top">
                <el-button size="small" :icon="Check" link type="success" @click="handleComplete(row)" />
              </el-tooltip>
              <el-tooltip content="编辑" placement="top">
                <el-button size="small" :icon="Edit2" link @click="openEditModal(row)" />
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button size="small" :icon="Trash2" link type="danger" @click="handleDelete(row)" />
              </el-tooltip>
            </template>
          </el-table-column>
          <template #empty>
            <div class="text-center py-8"><p class="text-gray-400">{{ error || '暂无数据' }}</p></div>
          </template>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div class="text-sm text-gray-500">共 {{ filteredData.length }} 条</div>
        <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]" :total="filteredData.length"
          layout="sizes, prev, pager, next, jumper" background
          @size-change="handlePageSizeChange" />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="招聘申请详情" width="720px">
      <div v-if="currentRecord" class="space-y-2">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="招聘编号">{{ currentRecord.requestCode }}</el-descriptions-item>
          <el-descriptions-item label="申请日期">{{ currentRecord.applyDate }}</el-descriptions-item>
          <el-descriptions-item label="招聘岗位">{{ currentRecord.position }}</el-descriptions-item>
          <el-descriptions-item label="需求部门">{{ currentRecord.department }}</el-descriptions-item>
          <el-descriptions-item label="人数">{{ currentRecord.quantity }} 人</el-descriptions-item>
          <el-descriptions-item label="用工类型">{{ currentRecord.employmentType }}</el-descriptions-item>
          <el-descriptions-item label="来源">{{ currentRecord.source }}</el-descriptions-item>
          <el-descriptions-item label="期望到岗">{{ currentRecord.expectedDate }}</el-descriptions-item>
          <el-descriptions-item label="薪资范围">{{ currentRecord.salaryMin }}-{{ currentRecord.salaryMax }} 元/月</el-descriptions-item>
          <el-descriptions-item label="优先级">{{ currentRecord.priority }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ currentRecord.applicantName }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <span :class="getStatusClass(currentRecord.status)">{{ currentRecord.status }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="招聘原因" :span="2">{{ currentRecord.reason }}</el-descriptions-item>
          <el-descriptions-item label="岗位要求" :span="2">{{ currentRecord.requirements }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentRecord.remarks || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 表单弹窗（V1.1 RecruitmentFormModal 11+ 字段） -->
    <el-dialog v-model="formDialogVisible" :title="editingRecord ? '编辑招聘' : '新建招聘'" width="780px" @closed="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="招聘岗位" prop="position">
              <el-input v-model="formData.position" placeholder="请输入招聘岗位" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="需求部门" prop="department">
              <el-select v-model="formData.department" placeholder="请选择需求部门" style="width:100%">
                <el-option v-for="d in DEPT_OPTIONS.filter(x => x.value)" :key="d.value" :label="d.label" :value="d.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="人数" prop="quantity">
              <el-input-number v-model="formData.quantity" :min="1" :precision="0" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来源" prop="source">
              <el-select v-model="formData.source" placeholder="请选择来源" style="width:100%">
                <el-option label="劳务公司" value="劳务公司" />
                <el-option label="个人零工" value="个人零工" />
                <el-option label="学生实习" value="学生实习" />
                <el-option label="内部推荐" value="内部推荐" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="用工类型" prop="employmentType">
              <el-select v-model="formData.employmentType" placeholder="请选择用工类型" style="width:100%">
                <el-option label="正式工" value="正式工" />
                <el-option label="临时工" value="临时工" />
                <el-option label="季节工" value="季节工" />
                <el-option label="实习生" value="实习生" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="formData.priority" placeholder="请选择优先级" style="width:100%">
                <el-option label="紧急" value="紧急" />
                <el-option label="高" value="高" />
                <el-option label="普通" value="普通" />
                <el-option label="低" value="低" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="期望到岗" prop="expectedDate">
              <el-date-picker v-model="formData.expectedDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="最低薪资">
              <el-input-number v-model="formData.salaryMin" :min="0" :precision="0" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="最高薪资">
              <el-input-number v-model="formData.salaryMax" :min="0" :precision="0" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="招聘原因" prop="reason">
          <el-input v-model="formData.reason" type="textarea" :rows="2" placeholder="请输入招聘原因" />
        </el-form-item>
        <el-form-item label="岗位要求" prop="requirements">
          <el-input v-model="formData.requirements" type="textarea" :rows="2" placeholder="请输入岗位要求" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remarks" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleFormSubmit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 批量编辑弹窗 -->
    <el-dialog v-model="batchEditDialogVisible" title="批量编辑招聘申请" width="900px">
      <div class="flex flex-col gap-3">
        <div class="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
          已选择 <strong>{{ selectedRows.length }}</strong> 条记录进行批量编辑，已编辑 <strong>{{ editedRecordIds.length }}</strong> 条
        </div>
        <el-select v-model="selectedRecordId" placeholder="请选择记录" style="width:100%">
          <el-option v-for="opt in selectedRecordOptions" :key="opt.id" :label="opt.label" :value="opt.id" />
        </el-select>
        <div v-if="currentEditRecord" class="grid grid-cols-4 gap-3">
          <div class="bg-gray-100 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">招聘编号</div><div class="text-sm font-medium">{{ currentEditRecord.requestCode }}</div></div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">招聘岗位</div><el-input :model-value="getEditedField('position')" @update:model-value="(v) => setEditedField('position', v)" size="small" /></div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">需求部门</div>
            <el-select :model-value="getEditedField('department')" @update:model-value="(v) => setEditedField('department', v)" size="small" style="width:100%">
              <el-option v-for="d in DEPT_OPTIONS.filter(x => x.value)" :key="d.value" :label="d.label" :value="d.value" />
            </el-select>
          </div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">人数</div><el-input-number :model-value="getEditedField('quantity')" @update:model-value="(v) => setEditedField('quantity', v)" :min="1" size="small" style="width:100%" /></div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">来源</div>
            <el-select :model-value="getEditedField('source')" @update:model-value="(v) => setEditedField('source', v)" size="small" style="width:100%">
              <el-option label="劳务公司" value="劳务公司" /><el-option label="个人零工" value="个人零工" /><el-option label="学生实习" value="学生实习" /><el-option label="内部推荐" value="内部推荐" />
            </el-select>
          </div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">优先级</div>
            <el-select :model-value="getEditedField('priority')" @update:model-value="(v) => setEditedField('priority', v)" size="small" style="width:100%">
              <el-option label="紧急" value="紧急" /><el-option label="高" value="高" /><el-option label="普通" value="普通" /><el-option label="低" value="低" />
            </el-select>
          </div>
          <div class="bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500 mb-1">状态</div>
            <el-select :model-value="getEditedField('status')" @update:model-value="(v) => setEditedField('status', v)" size="small" style="width:100%">
              <el-option label="待审批" value="待审批" /><el-option label="招聘中" value="招聘中" /><el-option label="已完成" value="已完成" /><el-option label="已取消" value="已取消" />
            </el-select>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="handleBatchEditNext"><el-icon><Edit2 /></el-icon> 确认（下一个）</el-button>
        <el-button @click="batchEditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchEditSave">保存修改</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog v-model="deleteWarningVisible" title="删除招聘申请警告" width="480px">
      <div class="flex items-center gap-4 mb-4">
        <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <span class="text-red-600 text-2xl">!</span>
        </div>
        <p class="text-sm text-gray-500">此操作不可撤销</p>
      </div>
      <p class="text-gray-600 mb-2">确定要删除选中的 <strong class="text-red-600">{{ selectedRows.length }}</strong> 条招聘申请吗？</p>
      <p class="text-sm text-gray-400">删除后将无法恢复，请谨慎操作。</p>
      <template #footer>
        <el-button @click="deleteWarningVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmBatchDelete">确认删除</el-button>
      </template>
    </el-dialog>

    <!-- 导出格式弹窗 -->
    <el-dialog v-model="exportModalVisible" title="选择导出格式" width="520px">
      <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedRows.length }} 条数据</p>
      <el-radio-group v-model="exportFormat" class="flex flex-col gap-3 w-full">
        <label v-for="fmt in EXPORT_FORMATS" :key="fmt.value" :class="[
          'flex items-center p-4 border rounded-lg cursor-pointer transition-all',
          exportFormat === fmt.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-400'
        ]">
          <el-radio :value="fmt.value" size="large" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">{{ fmt.label }}</p>
            <p class="text-xs text-gray-500">{{ fmt.desc }}</p>
          </div>
        </label>
      </el-radio-group>
      <template #footer>
        <el-button @click="exportModalVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmExport">导出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 招聘申请 Panel（V1.1 RecruitmentPage.tsx，带审批流）
 * 1:1 对应 V1.1，包括审批通过/驳回/完成/取消操作 + ApprovalContext 集成
 */
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Briefcase, Search, RotateCcw, Plus, Edit2, Trash2, Download, X, Eye, Check, XCircle } from 'lucide-vue-next'
import { DEPT_OPTIONS } from '@/data/laborData'

const EXPORT_FORMATS = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

// 状态样式（V1.1 RecruitmentTable L37-50）
const getStatusClass = (status) => {
  const map = {
    '待审批': 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700',
    '招聘中': 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700',
    '已完成': 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700',
    '已取消': 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500'
  }
  return map[status] || 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600'
}

const initialRecruitments = [
  { id: '1', requestCode: 'ZP-20260301-001', position: '农技员', department: '生产部', quantity: 3, source: '劳务公司', expectedDate: '2026-06-15', employmentType: '正式工', salaryMin: 5000, salaryMax: 8000, priority: '高', status: '招聘中', applicantId: 'u001', applicantName: '张明', applyDate: '2026-03-01', reason: '生产规模扩大，需补充田间种植人员', requirements: '本科及以上学历，农学相关专业，有1年以上种植经验', remarks: '优先考虑有大型农场经验者' },
  { id: '2', requestCode: 'ZP-20260305-001', position: '仓储管理员', department: '仓储部', quantity: 2, source: '个人零工', expectedDate: '2026-06-30', employmentType: '临时工', salaryMin: 3500, salaryMax: 4500, priority: '普通', status: '待审批', applicantId: 'u002', applicantName: '李华', applyDate: '2026-03-05', reason: '仓库物资出入库工作量增加', requirements: '能熟练使用叉车，能吃苦耐劳', remarks: '' },
  { id: '3', requestCode: 'ZP-20260310-001', position: '实习生', department: '技术部', quantity: 5, source: '学生实习', expectedDate: '2026-07-01', employmentType: '实习生', salaryMin: 2000, salaryMax: 3000, priority: '低', status: '待审批', applicantId: 'u003', applicantName: '王芳', applyDate: '2026-03-10', reason: '夏季农业科研项目用人需求', requirements: '农学/植保/园艺专业在校生', remarks: '暑期实习' },
  { id: '4', requestCode: 'ZP-20260201-001', position: '销售经理', department: '销售部', quantity: 1, source: '内部推荐', expectedDate: '2026-04-01', employmentType: '正式工', salaryMin: 8000, salaryMax: 15000, priority: '紧急', status: '已完成', applicantId: 'u004', applicantName: '赵强', applyDate: '2026-02-01', reason: '销售团队扩编', requirements: '5年以上农产品销售经验', remarks: '已招到合适人选' },
  { id: '5', requestCode: 'ZP-20260220-001', position: '财务专员', department: '财务部', quantity: 1, source: '劳务公司', expectedDate: '2026-05-01', employmentType: '正式工', salaryMin: 6000, salaryMax: 9000, priority: '高', status: '招聘中', applicantId: 'u005', applicantName: '孙丽', applyDate: '2026-02-20', reason: '财务部人员调整', requirements: '会计从业资格证，熟练使用财务软件', remarks: '' },
  { id: '6', requestCode: 'ZP-20260115-001', position: '安全员', department: '生产部', quantity: 1, source: '内部推荐', expectedDate: '2026-03-01', employmentType: '正式工', salaryMin: 5500, salaryMax: 7500, priority: '紧急', status: '已取消', applicantId: 'u001', applicantName: '张明', applyDate: '2026-01-15', reason: '安全生产管理需求', requirements: '安全员证书，3年以上相关经验', remarks: '内部调整撤销' }
]

const recruitments = ref([...initialRecruitments])
const loading = ref(false)
const error = ref('')

const filters = reactive({ keyword: '', status: '', source: '' })
const pagination = reactive({ currentPage: 1, pageSize: 10 })

const batchEditMode = ref(false)
const batchDeleteMode = ref(false)
const exportMode = ref(false)
const selectedRows = ref([])

const editedRecordIds = ref([])
const editedRecords = ref({})
const selectedRecordId = ref('')

const showFormModal = ref(false)
const showBatchEditModal = ref(false)
const showDeleteWarning = ref(false)
const showExportModal = ref(false)
const exportFormat = ref('excel')
const detailDialogVisible = ref(false)
const currentRecord = ref(null)
const editingRecord = ref(null)

const tableRef = ref()
const formRef = ref()
const formData = reactive({
  position: '', department: '', quantity: 1, reason: '', requirements: '',
  source: '', expectedDate: '', employmentType: '正式工',
  salaryMin: 0, salaryMax: 0, priority: '普通', remarks: ''
})
const formRules = {
  position: [{ required: true, message: '请输入招聘岗位', trigger: 'blur' }],
  department: [{ required: true, message: '请选择需求部门', trigger: 'change' }],
  quantity: [{ required: true, type: 'number', min: 1, message: '请输入有效人数', trigger: 'blur' }],
  source: [{ required: true, message: '请选择招聘来源', trigger: 'change' }],
  employmentType: [{ required: true, message: '请选择用工类型', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  expectedDate: [{ required: true, message: '请选择期望到岗日期', trigger: 'change' }],
  reason: [{ required: true, message: '请输入招聘原因', trigger: 'blur' }],
  requirements: [{ required: true, message: '请输入岗位要求', trigger: 'blur' }]
}

const formDialogVisible = computed({ get: () => showFormModal.value, set: (v) => { showFormModal.value = v } })
const batchEditDialogVisible = computed({ get: () => showBatchEditModal.value, set: (v) => { showBatchEditModal.value = v } })
const deleteWarningVisible = computed({ get: () => showDeleteWarning.value, set: (v) => { showDeleteWarning.value = v } })
const exportModalVisible = computed({ get: () => showExportModal.value, set: (v) => { showExportModal.value = v } })

const inBatchMode = computed(() => batchEditMode.value || batchDeleteMode.value || exportMode.value)

const filteredData = computed(() => {
  return recruitments.value.filter(r => {
    if (filters.keyword) {
      const kw = filters.keyword
      if (!r.requestCode.includes(kw) && !r.position.includes(kw) && !r.department.includes(kw)) return false
    }
    if (filters.status && r.status !== filters.status) return false
    if (filters.source && r.source !== filters.source) return false
    return true
  })
})
const paginatedFilteredData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

const currentEditRecord = computed(() => {
  if (!selectedRecordId.value) return null
  return recruitments.value.find(r => r.id === selectedRecordId.value) || null
})
const selectedRecordOptions = computed(() => selectedRows.value
  .map(id => recruitments.value.find(r => r.id === id))
  .filter(Boolean)
  .map(r => ({ id: r.id, label: `${r.requestCode} - ${r.position}${editedRecordIds.value.includes(r.id) ? '  (已编辑)' : ''}` })))

onMounted(() => { loading.value = false })

const handleSearch = () => { pagination.currentPage = 1 }
const handleResetFilters = () => { filters.keyword = ''; filters.status = ''; filters.source = ''; pagination.currentPage = 1 }
const handlePageSizeChange = () => { pagination.currentPage = 1 }

const handleSelectAll = () => {
  if (selectedRows.value.length === paginatedFilteredData.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = paginatedFilteredData.value.map(r => r.id)
  }
}
const handleSelectionChange = (selection) => { selectedRows.value = selection.map(s => s.id) }

const enterBatch = (mode) => {
  batchEditMode.value = mode === 'edit'
  batchDeleteMode.value = mode === 'delete'
  exportMode.value = mode === 'export'
  selectedRows.value = []
  if (mode === 'edit') { editedRecordIds.value = []; editedRecords.value = {}; selectedRecordId.value = '' }
}
const cancelBatch = () => {
  batchEditMode.value = false; batchDeleteMode.value = false; exportMode.value = false
  selectedRows.value = []; editedRecordIds.value = []; editedRecords.value = {}; selectedRecordId.value = ''
  if (tableRef.value) tableRef.value.clearSelection()
}

const getEditedField = (field) => {
  if (!selectedRecordId.value || !currentEditRecord.value) return ''
  const edited = editedRecords.value[selectedRecordId.value]
  if (edited && edited[field] !== undefined) return edited[field]
  return currentEditRecord.value[field]
}
const setEditedField = (field, value) => {
  if (!selectedRecordId.value) return
  if (!editedRecords.value[selectedRecordId.value]) editedRecords.value[selectedRecordId.value] = {}
  editedRecords.value[selectedRecordId.value] = { ...editedRecords.value[selectedRecordId.value], [field]: value }
  if (!editedRecordIds.value.includes(selectedRecordId.value)) editedRecordIds.value = [...editedRecordIds.value, selectedRecordId.value]
}
const handleBatchEditConfirm = () => {
  if (!selectedRows.value.length) { ElMessage.warning('请先选择要编辑的记录'); return }
  selectedRecordId.value = selectedRows.value[0]
  showBatchEditModal.value = true
}
const handleBatchEditNext = () => {
  if (selectedRecordId.value && !editedRecordIds.value.includes(selectedRecordId.value)) {
    editedRecordIds.value = [...editedRecordIds.value, selectedRecordId.value]
  }
  const idx = selectedRows.value.findIndex(r => r === selectedRecordId.value)
  const nextId = selectedRows.value[idx + 1]
  if (nextId) selectedRecordId.value = nextId
  else { showBatchEditModal.value = false; cancelBatch() }
}
const handleBatchEditSave = () => {
  try {
    editedRecordIds.value.forEach(id => {
      const i = recruitments.value.findIndex(r => r.id === id)
      if (i === -1) return
      recruitments.value[i] = { ...recruitments.value[i], ...(editedRecords.value[id] || {}) }
    })
    ElMessage.success('批量编辑成功')
    showBatchEditModal.value = false
    cancelBatch()
  } catch { ElMessage.error('批量编辑失败') }
}

const handleBatchDeleteConfirm = () => {
  if (!selectedRows.value.length) { ElMessage.warning('请先选择要删除的记录'); return }
  showDeleteWarning.value = true
}
const confirmBatchDelete = () => {
  recruitments.value = recruitments.value.filter(r => !selectedRows.value.includes(r.id))
  ElMessage.success('批量删除成功')
  showDeleteWarning.value = false
  cancelBatch()
}

const handleExportConfirm = () => {
  if (!selectedRows.value.length) { ElMessage.warning('请先选择要导出的数据'); return }
  showExportModal.value = true
}
const confirmExport = () => {
  const selectedData = recruitments.value.filter(r => selectedRows.value.includes(r.id))
  const headers = ['招聘编号', '招聘岗位', '需求部门', '人数', '来源', '期望到岗', '状态', '申请人', '申请日期']
  const exportData = selectedData.map(r => ({
    '招聘编号': r.requestCode, '招聘岗位': r.position, '需求部门': r.department,
    '人数': r.quantity, '来源': r.source, '期望到岗': r.expectedDate, '状态': r.status,
    '申请人': r.applicantName, '申请日期': r.applyDate
  }))
  let content = '', mimeType = '', extension = ''
  if (exportFormat.value === 'csv') {
    content = headers.join(',') + '\n' + exportData.map(row => headers.map(h => `"${row[h] || ''}"`).join(',')).join('\n')
    mimeType = 'text/csv;charset=utf-8'; extension = 'csv'
  } else if (exportFormat.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'; extension = 'xls'
  } else if (exportFormat.value === 'word') {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">${headers.map(h => `<th>${h}</th>`).join('')}${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-word;charset=utf-8'; extension = 'doc'
  }
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const fileName = `招聘申请_${todayStr}.${extension}`
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = fileName
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
  showExportModal.value = false
  cancelBatch()
}

// V1.1 审批操作（L349-389）
const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm(`确定审批通过招聘申请 "${row.requestCode}" 吗？`, '确认审批', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    const idx = recruitments.value.findIndex(r => r.id === row.id)
    if (idx !== -1) {
      recruitments.value[idx] = { ...recruitments.value[idx], status: '招聘中', approverId: 'u005', approverName: '王经理', approveDate: new Date().toISOString().split('T')[0] }
      ElMessage.success('审批已通过')
    }
  } catch { /* 取消 */ }
}

const handleReject = async (row) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入驳回原因：', '驳回招聘申请', { confirmButtonText: '确定驳回', cancelButtonText: '取消', type: 'warning' })
    if (!reason || !reason.trim()) { ElMessage.warning('请输入驳回原因'); return }
    const idx = recruitments.value.findIndex(r => r.id === row.id)
    if (idx !== -1) {
      recruitments.value[idx] = { ...recruitments.value[idx], status: '已取消', approverName: '王经理', approveDate: new Date().toISOString().split('T')[0], remarks: reason }
      ElMessage.success('已驳回')
    }
  } catch { /* 取消 */ }
}

const handleComplete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定将 "${row.requestCode}" 标记为已完成吗？`, '确认完成', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    const idx = recruitments.value.findIndex(r => r.id === row.id)
    if (idx !== -1) {
      recruitments.value[idx] = { ...recruitments.value[idx], status: '已完成' }
      ElMessage.success('已标记完成')
    }
  } catch { /* 取消 */ }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除招聘申请 "${row.requestCode}" 吗？`, '确认删除', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    recruitments.value = recruitments.value.filter(r => r.id !== row.id)
    ElMessage.success('删除成功')
  } catch { /* 取消 */ }
}

const openDetailModal = (row) => { currentRecord.value = row; detailDialogVisible.value = true }
const openCreateModal = () => {
  editingRecord.value = null
  resetForm()
  showFormModal.value = true
}
const openEditModal = (row) => {
  editingRecord.value = row
  Object.assign(formData, { ...row })
  showFormModal.value = true
}
const resetForm = () => {
  Object.assign(formData, {
    position: '', department: '', quantity: 1, reason: '', requirements: '',
    source: '', expectedDate: '', employmentType: '正式工',
    salaryMin: 0, salaryMax: 0, priority: '普通', remarks: ''
  })
  if (formRef.value) formRef.value.clearValidate()
}

const handleFormSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    // 薪资交叉校验
    if (formData.salaryMin > 0 && formData.salaryMax > 0 && formData.salaryMin > formData.salaryMax) {
      ElMessage.error('最低薪资不能大于最高薪资')
      return
    }
    try {
      if (editingRecord.value) {
        const idx = recruitments.value.findIndex(r => r.id === editingRecord.value.id)
        if (idx !== -1) recruitments.value[idx] = { ...recruitments.value[idx], ...formData }
        ElMessage.success('编辑成功')
      } else {
        const newId = String(recruitments.value.length + 1)
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
        const code = `ZP-${today}-${String(recruitments.value.length + 1).padStart(3, '0')}`
        // 创建后进入"待审批"状态（V1.1 L279 addApproval）
        recruitments.value.push({ id: newId, requestCode: code, ...formData, status: '待审批', applicantId: 'u001', applicantName: '张明', applyDate: new Date().toISOString().split('T')[0] })
        ElMessage.success('提交成功，已进入审批流程')
      }
      showFormModal.value = false
    } catch { ElMessage.error('保存失败') }
  })
}
</script>

<style scoped>
/* 继承全局样式 */
</style>