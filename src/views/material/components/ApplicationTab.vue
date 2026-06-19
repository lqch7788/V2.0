<!--
  ApplicationTab - 申请领料 Tab 1 子组件
  从 MaterialReceiving.vue 整体拆分（保持 1:1 模板/脚本逻辑）
  Emits: data-loaded (当数据加载完成时通知父组件)
-->
<template>
  <div class="space-y-4">
    <!-- 搜索区域 - 严格对齐 V1.1 (ApplicationTab.tsx 第 203-283 行) -->
    <div class="bg-gray-50 rounded-lg p-4">
      <div class="flex items-end gap-4">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-900 mb-1">领料单号</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="searchCode" placeholder="搜索领料单号..." class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" @input="currentPage = 1" />
          </div>
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-900 mb-1">申领人</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="searchApplicant" placeholder="搜索申领人..." class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" @input="currentPage = 1" />
          </div>
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-900 mb-1">生产计划批次号</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="searchBatchCode" placeholder="搜索生产计划批次号..." class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" @input="currentPage = 1" />
          </div>
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-900 mb-1">库存地点</label>
          <select v-model="searchWarehouse" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" @change="currentPage = 1">
            <option value="">全部</option>
            <option v-for="w in warehouses" :key="w" :value="w">{{ w }}</option>
          </select>
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-900 mb-1">审批状态</label>
          <select v-model="statusFilter" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" @change="currentPage = 1">
            <option value="all">全部状态</option>
            <option value="待审批">待审批</option>
            <option value="已审批">已审批</option>
            <option value="已拒绝">已拒绝</option>
            <option value="已作废">已作废</option>
            <option value="已取消">已取消</option>
          </select>
        </div>
        <button class="h-8 px-3 rounded-md text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 inline-flex items-center gap-1" @click="handleReset"><RotateCcw class="w-4 h-4" />重置</button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">领料申请单列表</h3>
        <div class="flex gap-2">
          <button class="h-8 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="handleOpenAdd"><Plus class="w-4 h-4" />新增</button>
          <button v-if="!batchEditMode && !deleteMode && !exportMode" class="h-8 px-3 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="batchEditMode = 'edit'; selectedRows = []"><Pencil class="w-4 h-4" />编辑</button>
          <button v-if="!batchEditMode && !deleteMode && !exportMode" class="h-8 px-3 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1" @click="batchEditMode = 'delete'; selectedRows = []"><Trash2 class="w-4 h-4" />删除</button>
          <button v-if="!batchEditMode && !deleteMode && !exportMode" class="h-8 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="exportMode = true; selectedRows = []"><Download class="w-4 h-4" />导出</button>
          <button v-if="batchEditMode === 'edit' && selectedRows.length > 0" class="h-8 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="showBatchEditModal = true">确认编辑 ({{ selectedRows.length }}条)</button>
          <button v-if="batchEditMode === 'delete' && selectedRows.length > 0" class="h-8 px-3 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1" @click="showBatchDeleteConfirm = true">确认删除 ({{ selectedRows.length }}条)</button>
          <button v-if="batchEditMode || deleteMode || exportMode" class="h-8 px-3 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-1" @click="batchEditMode = null; deleteMode = false; exportMode = false; selectedRows = []">取消</button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <tr>
              <th v-if="batchEditMode || deleteMode || exportMode" class="px-4 py-3 text-left text-sm font-semibold w-14 whitespace-nowrap">
                <input type="checkbox" :checked="paginatedApplicationData.length > 0 && selectedRows.length === paginatedApplicationData.length" @change="toggleAppSelectAll" class="w-4 h-4 rounded border-white" />
              </th>
              <th class="px-4 py-3 text-left text-sm font-semibold w-12 whitespace-nowrap"></th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">领料单号</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">申请日期</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">申请人</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">部门</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">库存地点</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">物料种类</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">种植区域/用途</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">审核人</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">生产计划批次号</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">状态</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">备注</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr v-if="paginatedApplicationData.length === 0">
              <td :colspan="(batchEditMode || deleteMode || exportMode) ? 14 : 13" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
            </tr>
            <template v-for="row in paginatedApplicationData" :key="row.id">
              <tr class="hover:bg-blue-100 transition-colors">
                <td v-if="batchEditMode || deleteMode || exportMode" class="px-4 py-3">
                  <input type="checkbox" :checked="selectedRows.includes(row.id)" @change="toggleAppRow(row.id)" class="w-4 h-4 rounded border-gray-400" />
                </td>
                <td class="px-4 py-3">
                  <button class="text-gray-500 hover:text-blue-600 p-1" @click="toggleAppExpandRow(row.id)">
                    <ChevronDown v-if="appExpandedRows.includes(row.id)" class="w-4 h-4" />
                    <ChevronRight v-else class="w-4 h-4" />
                  </button>
                </td>
                <td class="px-4 py-3 text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-700 whitespace-nowrap" @click="handleViewDetail(row)">{{ row.code }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.date }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.applicant }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.department }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.warehouseLocation }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.materials.length > 0 ? row.materials.length + '种' : '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.plantArea }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.reviewer }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.productionBatchCode }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="flex flex-col gap-1">
                    <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="getAppStatusClass(row.status)">{{ row.status }}</span>
                    <span v-if="row.status === '已拒绝' && row.rejectReason" class="text-xs text-red-600 max-w-[150px] truncate" :title="row.rejectReason">原因：{{ row.rejectReason }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.materials.length > 0 ? row.materials[0].remark : '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="flex items-center gap-1">
                    <button class="text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 p-1" title="查看" @click="handleViewDetail(row)">
                      <Eye class="w-4 h-4" />
                    </button>
                    <button class="text-gray-500 hover:text-blue-600 hover:bg-blue-50 p-1" title="编辑" @click="handleEditRecord(row)">
                      <Pencil class="w-4 h-4" />
                    </button>
                    <button v-if="row.status === '待审批' || row.status === '已审批'" class="text-gray-500 hover:text-amber-600 hover:bg-amber-50 p-1" title="作废" @click="handleVoidApply(row)">
                      <FileX class="w-4 h-4" />
                    </button>
                    <button class="text-gray-500 hover:text-red-600 hover:bg-red-50 p-1" title="删除" @click="handleDeleteRecord(row.id)">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="appExpandedRows.includes(row.id)" class="bg-white">
                <td :colspan="(batchEditMode || deleteMode || exportMode) ? 14 : 13" class="px-4 py-3">
                  <div class="text-sm">
                    <div class="font-medium text-blue-800 mb-2">物料明细</div>
                    <div class="overflow-x-auto rounded-lg border border-gray-200">
                      <table class="w-full text-xs">
                        <thead class="bg-[#F2F6FA]">
                          <tr>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">物料编码</th>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">物料名称</th>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">批次号</th>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">规格</th>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">单位</th>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">申领数量</th>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">当前库存</th>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">单价(元)</th>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">小计(元)</th>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">仓库货位</th>
                            <th class="px-3 py-2 text-left text-sm font-semibold text-blue-800 whitespace-nowrap">备注</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                          <tr v-for="m in row.materials" :key="m.materialCode" class="hover:bg-[#F2F6FA]/50">
                            <td class="px-3 py-2 text-sm text-blue-800 font-mono whitespace-nowrap">{{ m.materialCode }}</td>
                            <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.materialName }}</td>
                            <td class="px-3 py-2 text-sm text-blue-800 font-mono whitespace-nowrap">{{ m.batchNo || '' }}</td>
                            <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.spec }}</td>
                            <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.unit }}</td>
                            <td class="px-3 py-2 text-sm whitespace-nowrap" :class="m.requestedQuantity > m.stockQuantity ? 'text-red-600 font-bold' : 'text-blue-800'">{{ m.requestedQuantity }}{{ m.requestedQuantity > m.stockQuantity ? ' ⚠️' : '' }}</td>
                            <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.stockQuantity }}</td>
                            <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ (m.unitPrice || 0).toFixed(2) }}</td>
                            <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ (m.requestedQuantity * (m.unitPrice || 0)).toFixed(2) }}</td>
                            <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.warehousePosition }}</td>
                            <td class="px-3 py-2 text-sm text-blue-800 whitespace-nowrap">{{ m.remark }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <span class="text-sm text-gray-500">共 {{ filteredApplicationData.length }} 条记录</span>
        <el-pagination
          v-model:current-page="currentPage"
          :total="filteredApplicationData.length"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="() => { currentPage = 1 }"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <ApplicationDetailModal :is-open="showDetailModal" :record="selectedRecord" @close="showDetailModal = false" />

    <!-- 新增弹窗 -->
    <ApplicationAddModal :is-open="showAddModal" :form="addForm" :user-list="userList"
      @generate-code="handleGenerateAddCode"
      @add-material="handleAddMaterial"
      @material-code-change="onAddMaterialCodeChange"
      @material-name-change="onAddMaterialNameChange"
      @save="handleSaveAdd"
      @close="showAddModal = false" />

    <!-- 编辑弹窗 -->
    <ApplicationEditModal :is-open="showEditModal" :form="editFormReal"
      @add-material="handleEditAddMaterial"
      @material-code-change="onEditMaterialCodeChangeRow"
      @save="handleSaveEdit"
      @close="showEditModal = false" />

    <!-- 删除确认 -->
    <DeleteWarningModal :is-open="showDeleteConfirm" @confirm="confirmDelete" @close="showDeleteConfirm = false" />

    <!-- 作废弹窗 -->
    <ApplicationVoidModal :is-open="showVoidModal" :record="selectedRecord" v-model:reason="voidReason"
      @confirm="submitVoid" @close="showVoidModal = false" />

    <!-- 批量编辑 -->
    <ApplicationBatchEditModal :is-open="showBatchEditModal" :form="batchEditForm" :count="selectedRows.length"
      @save="handleBatchEditSave" @close="showBatchEditModal = false" />

    <!-- 批量删除确认 -->
    <DeleteWarningModal :is-open="showBatchDeleteConfirm" :count="selectedRows.length"
      @confirm="handleBatchDelete" @close="showBatchDeleteConfirm = false" />

    <!-- 导出格式 -->
    <ExportTypeModal :is-open="showExportTypeModal" :export-file-type="exportFileType"
      @confirm="confirmExport" @change="(v) => exportFileType = v" @close="showExportTypeModal = false" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Pencil, Trash2, Download, ChevronDown, ChevronRight, RotateCcw, Search, Eye, FileX } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import ApplicationDetailModal from './ApplicationDetailModal.vue'
import ApplicationAddModal from '@/components/materialReceiving/modals/AddModal.vue'
import ApplicationEditModal from '@/components/materialReceiving/modals/EditModal.vue'
import ApplicationVoidModal from '@/components/materialReceiving/modals/VoidModal.vue'
import ApplicationBatchEditModal from '@/components/materialReceiving/modals/BatchEditModal.vue'
import DeleteWarningModal from '@/components/materialReceiving/modals/DeleteWarningModal.vue'
import ExportTypeModal from '@/components/materialReceiving/modals/ExportTypeModal.vue'
import { getApplicationList, createApplication as apiCreateApp, updateApplication as apiUpdateApp, deleteApplicationsBatch } from '@/api/material/apiMaterialRequestService'
import { warehouses, userListData, findMaterialByCode, materialBaseDB, getAppStatusClass, mapAppRecord } from '../utils/materialReceivingConfig'

const emit = defineEmits(['data-loaded'])

const applicationData = ref([])
const isLoadingApp = ref(false)
const loadApplicationData = async () => {
  isLoadingApp.value = true
  try {
    const res = await getApplicationList()
    applicationData.value = (res || []).map(mapAppRecord)
    emit('data-loaded', applicationData.value)
  } catch { }
  finally { isLoadingApp.value = false }
}

const searchCode = ref('')
const searchApplicant = ref('')
const searchBatchCode = ref('')
const searchWarehouse = ref('')
const statusFilter = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRows = ref([])
const batchEditMode = ref(null)
const deleteMode = ref(false)
const exportMode = ref(false)
const showDetailModal = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const showVoidModal = ref(false)
const showBatchEditModal = ref(false)
const showBatchDeleteConfirm = ref(false)
const showExportTypeModal = ref(false)
const exportFileType = ref('xlsx')
const selectedRecord = ref(null)
const deletingId = ref(null)
const voidReason = ref('')
const appExpandedRows = ref([])

const userList = ref(userListData)

const filteredApplicationData = computed(() => {
  return applicationData.value.filter(item => {
    if (searchCode.value && !item.code.toLowerCase().includes(searchCode.value.toLowerCase())) return false
    if (searchApplicant.value && !item.applicant.toLowerCase().includes(searchApplicant.value.toLowerCase())) return false
    if (searchBatchCode.value && !item.productionBatchCode.toLowerCase().includes(searchBatchCode.value.toLowerCase())) return false
    if (searchWarehouse.value && !item.warehouseLocation.toLowerCase().includes(searchWarehouse.value.toLowerCase())) return false
    if (statusFilter.value !== 'all' && item.status !== statusFilter.value) return false
    return true
  })
})

const paginatedApplicationData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredApplicationData.value.slice(start, start + pageSize.value)
})

const handleReset = () => {
  searchCode.value = ''; searchApplicant.value = ''; searchBatchCode.value = ''; searchWarehouse.value = ''; statusFilter.value = 'all'; currentPage.value = 1
}

const toggleAppExpandRow = (id) => {
  const idx = appExpandedRows.value.indexOf(id)
  if (idx > -1) appExpandedRows.value.splice(idx, 1)
  else appExpandedRows.value.push(id)
}

const toggleAppSelectAll = () => {
  if (selectedRows.value.length === paginatedApplicationData.value.length) {
    const pageIds = new Set(paginatedApplicationData.value.map(r => r.id))
    selectedRows.value = selectedRows.value.filter(id => !pageIds.has(id))
  } else {
    const currentIds = new Set(selectedRows.value)
    const newRows = paginatedApplicationData.value.filter(r => !currentIds.has(r.id))
    selectedRows.value = [...selectedRows.value, ...newRows.map(r => r.id)]
  }
}

const toggleAppRow = (id) => {
  const idx = selectedRows.value.indexOf(id)
  if (idx > -1) selectedRows.value.splice(idx, 1)
  else selectedRows.value.push(id)
}

const handleViewDetail = (row) => { selectedRecord.value = row; showDetailModal.value = true }

const handleEditRecord = (row) => {
  if (row.status !== '待审批') {
    ElMessage.warning(`该领料单当前状态为「${row.status}」，非待审批状态无法编辑`)
    return
  }
  selectedRecord.value = row
  editFormReal.date = row.date
  editFormReal.applicant = row.applicant
  editFormReal.department = row.department
  editFormReal.warehouseLocation = row.warehouseLocation
  editFormReal.plantArea = row.plantArea
  editFormReal.reviewer = row.reviewer
  editFormReal.productionBatchCode = row.productionBatchCode
  editFormReal.status = row.status
  editFormReal.materials = JSON.parse(JSON.stringify(row.materials))
  showEditModal.value = true
}

const handleDeleteRecord = (id) => { deletingId.value = id; showDeleteConfirm.value = true }

const handleVoidApply = (row) => {
  if (row.status !== '待审批' && row.status !== '已审批') {
    ElMessage.warning(`该领料单当前状态为「${row.status}」，无法作废`)
    return
  }
  selectedRecord.value = row
  voidReason.value = ''
  showVoidModal.value = true
}

const confirmDelete = async () => {
  if (deletingId.value !== null) {
    try {
      await (await import('@/api/material/apiMaterialRequestService')).deleteApplication(deletingId.value)
      ElMessage.success('删除成功')
      await loadApplicationData()
    } catch { ElMessage.error('删除失败') }
  }
  showDeleteConfirm.value = false; deletingId.value = null
}

const getDefaultAddForm = () => ({
  code: '', date: new Date().toISOString().split('T')[0], applicant: '', department: '', warehouseLocation: '', plantArea: '', reviewer: '', productionBatchCode: '', batchRemark: '', materials: []
})
const addForm = reactive(getDefaultAddForm())

const resetAddForm = () => { Object.assign(addForm, getDefaultAddForm()) }
const handleOpenAdd = () => { resetAddForm(); showAddModal.value = true }

const handleAddMaterial = () => {
  addForm.materials.push({ materialCode: '', materialName: '', batchNo: '', spec: '', unit: '', category: '', requestedQuantity: 1, stockQuantity: 0, unitPrice: 0, warehousePosition: '', remark: '' })
}

const handleGenerateAddCode = () => {
  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`
  const seq = String(applicationData.value.length + 1).padStart(3, '0')
  addForm.code = `LL${dateStr}${seq}`
}

const onAddMaterialCodeChange = (row) => {
  if (!row || !row.materialCode) return
  const found = findMaterialByCode(row.materialCode)
  if (found) { row.materialName = found.materialName; row.spec = found.spec; row.unit = found.unit; row.category = found.category; row.stockQuantity = found.stockQuantity; row.unitPrice = found.unitPrice; row.warehousePosition = found.warehousePosition; row.remark = found.remark }
}

const onAddMaterialNameChange = (row) => {
  if (!row || !row.materialName) return
  const found = materialBaseDB.find(m => m.materialName === row.materialName)
  if (found) { row.materialCode = found.materialCode; row.spec = found.spec; row.unit = found.unit; row.category = found.category; row.stockQuantity = found.stockQuantity; row.unitPrice = found.unitPrice; row.warehousePosition = found.warehousePosition; row.remark = found.remark }
}

const onEditMaterialCodeChangeRow = (row) => {
  if (!row || !row.materialCode) return
  const found = findMaterialByCode(row.materialCode)
  if (found) { row.materialName = found.materialName; row.spec = found.spec; row.unit = found.unit; row.category = found.category; row.stockQuantity = found.stockQuantity; row.unitPrice = found.unitPrice; row.warehousePosition = found.warehousePosition }
}

const handleSaveAdd = async () => {
  if (!addForm.applicant) { ElMessage.warning('请选择申领人'); return }
  if (addForm.materials.length === 0) { ElMessage.warning('请添加至少一个物料'); return }
  if (!addForm.code) handleGenerateAddCode()
  const newRecord = {
    code: addForm.code, date: addForm.date, applicant: addForm.applicant, department: addForm.department,
    warehouseLocation: addForm.warehouseLocation, plantArea: addForm.plantArea, reviewer: addForm.reviewer,
    productionBatchCode: addForm.productionBatchCode, materials: JSON.parse(JSON.stringify(addForm.materials))
  }
  try {
    await apiCreateApp(newRecord)
    ElMessage.success('新增成功')
    showAddModal.value = false; resetAddForm()
    await loadApplicationData()
  } catch { ElMessage.error('新增失败，请重试') }
}

const editFormReal = reactive({ date: '', applicant: '', department: '', warehouseLocation: '', plantArea: '', reviewer: '', productionBatchCode: '', status: '', materials: [] })
const handleEditAddMaterial = () => {
  editFormReal.materials.push({ materialCode: '', materialName: '', batchNo: '', spec: '', unit: '', category: '', requestedQuantity: 1, stockQuantity: 0, unitPrice: 0, warehousePosition: '', remark: '' })
}

const handleSaveEdit = async () => {
  if (!selectedRecord.value) return
  const updates = {
    date: editFormReal.date, applicant: editFormReal.applicant, department: editFormReal.department,
    warehouseLocation: editFormReal.warehouseLocation, plantArea: editFormReal.plantArea,
    reviewer: editFormReal.reviewer, productionBatchCode: editFormReal.productionBatchCode,
    materials: JSON.parse(JSON.stringify(editFormReal.materials))
  }
  try {
    await apiUpdateApp(selectedRecord.value.id, updates)
    ElMessage.success('编辑已保存，领料单已重新提交')
    showEditModal.value = false; await loadApplicationData()
  } catch { ElMessage.error('保存失败，请重试') }
}

const batchEditForm = reactive({ warehouseLocation: '', reviewer: '', productionBatchCode: '', status: '' })
const handleBatchEditSave = async () => {
  if (selectedRows.value.length === 0) { ElMessage.warning('请先选择记录'); return }
  const updates = {}
  if (batchEditForm.warehouseLocation) updates.warehouseLocation = batchEditForm.warehouseLocation
  if (batchEditForm.reviewer) updates.reviewer = batchEditForm.reviewer
  if (batchEditForm.productionBatchCode) updates.productionBatchCode = batchEditForm.productionBatchCode
  if (batchEditForm.status) updates.status = batchEditForm.status
  if (Object.keys(updates).length === 0) { ElMessage.warning('请至少填写一个要修改的字段'); return }
  try {
    for (const id of selectedRows.value) { await apiUpdateApp(id, updates) }
    ElMessage.success(`批量编辑成功，已更新 ${selectedRows.value.length} 条记录`)
    showBatchEditModal.value = false; batchEditMode.value = null; selectedRows.value = []
    batchEditForm.warehouseLocation = ''; batchEditForm.reviewer = ''; batchEditForm.productionBatchCode = ''; batchEditForm.status = ''
    await loadApplicationData()
  } catch { ElMessage.error('批量编辑失败，请重试') }
}

const handleBatchDelete = async () => {
  try {
    await deleteApplicationsBatch(selectedRows.value)
    ElMessage.success(`删除了 ${selectedRows.value.length} 条记录`)
    showBatchDeleteConfirm.value = false; batchEditMode.value = null; selectedRows.value = []
    await loadApplicationData()
  } catch { ElMessage.error('批量删除失败') }
}

const submitVoid = () => {
  if (!voidReason.value.trim()) { ElMessage.warning('请填写作废原因'); return }
  if (!selectedRecord.value) return
  const rec = applicationData.value.find(r => r.id === selectedRecord.value.id)
  if (rec) { rec.status = '已作废'; rec.statusClass = 'voided' }
  ElMessage.success('作废成功')
  showVoidModal.value = false; showEditModal.value = false
}

const confirmExport = () => {
  const exportData = selectedRows.value.length > 0
    ? applicationData.value.filter(item => selectedRows.value.includes(item.id))
    : filteredApplicationData.value
  const headers = ['领料单号', '日期', '申领人', '部门', '仓库地点', '种植区域', '审核人', '生产批次号', '状态']
  const fields = ['code', 'date', 'applicant', 'department', 'warehouseLocation', 'plantArea', 'reviewer', 'productionBatchCode', 'status']
  let content; let mimeType; let extension;
  if (exportFileType.value === 'csv') {
    content = '﻿' + headers.join(',') + '\n' + exportData.map(r => fields.map(f => `"${r[f] || ''}"`).join(',')).join('\n')
    mimeType = 'text/csv;charset=utf-8'; extension = 'csv'
  } else if (exportFileType.value === 'xlsx') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(r => `<tr>${fields.map(f => `<td>${r[f] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'; extension = 'xlsx'
  } else {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(r => `<tr>${fields.map(f => `<td>${r[f] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-word;charset=utf-8'; extension = 'docx'
  }
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `生产领料_${new Date().toISOString().slice(0,10)}.${extension}`
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  showExportTypeModal.value = false; exportMode.value = false; selectedRows.value = []
  ElMessage.success('导出成功')
}

onMounted(() => { loadApplicationData() })
</script>
