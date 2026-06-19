<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-lg">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <ArrowLeftRight class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">生产退料</h1>
            <p class="text-gray-500">生产退料记录管理</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm border border-gray-100">
      <div class="grid grid-cols-6 gap-4 items-end">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">退料单号</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="searchForm.code" placeholder="搜索退料单号..." class="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm" @input="updateSearchField('code', $event.target.value)" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">物资名称</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="searchForm.material" placeholder="搜索物资名称..." class="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm" @input="updateSearchField('material', $event.target.value)" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">仓库位置</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="searchForm.warehouse" placeholder="搜索仓库位置..." class="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm" @input="updateSearchField('warehouse', $event.target.value)" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">申请人</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="searchForm.applicant" placeholder="搜索申请人..." class="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm" @input="updateSearchField('applicant', $event.target.value)" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">审批状态</label>
          <select v-model="searchForm.status" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" @change="updateSearchField('status', $event.target.value)">
            <option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div class="flex items-end gap-2">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">退料部门</label>
            <select v-model="searchForm.department" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" @change="updateSearchField('department', $event.target.value)">
              <option value="all">全部部门</option>
              <option v-for="dept in departmentOptions" :key="dept" :value="dept">{{ dept }}</option>
            </select>
          </div>
          <button class="h-8 px-3 rounded-md text-xs bg-amber-500 text-white hover:bg-amber-600 inline-flex items-center gap-1 shrink-0" @click="handleReset"><RotateCcw class="w-4 h-4" />重置</button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">生产退料单列表</h3>
        <div class="flex gap-2">
          <!-- 导出模式 -->
          <template v-if="exportMode">
            <button class="h-8 px-3 rounded-md text-xs bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="handleExportClick">
              <Download class="w-4 h-4" />确认导出
            </button>
            <button class="h-8 px-3 rounded-md text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-1" @click="handleCancelExport">取消</button>
          </template>
          <!-- 默认模式 -->
          <template v-else>
            <template v-if="!batchEditMode && !deleteMode">
              <button class="h-8 px-3 rounded-md text-xs bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="showAddModal = true">
                <Plus class="w-4 h-4" />新增
              </button>
              <button class="h-8 px-3 rounded-md text-xs bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="enterBatchEditMode">
                <Edit class="w-4 h-4" /><Edit2 class="w-4 h-4" />编辑
              </button>
              <button class="h-8 px-3 rounded-md text-xs bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1" @click="enterDeleteMode">
                <Trash2 class="w-4 h-4" />删除
              </button>
              <button class="h-8 px-3 rounded-md text-xs bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="exportMode = true">
                <Download class="w-4 h-4" />导出
              </button>
            </template>
            <!-- 删除模式 -->
            <template v-if="deleteMode">
              <button class="h-8 px-3 rounded-md text-xs bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1" @click="showBatchDeleteConfirm = true">确认删除</button>
              <button class="h-8 px-3 rounded-md text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-1" @click="cancelDeleteMode">取消</button>
            </template>
            <!-- 编辑模式 -->
            <template v-if="batchEditMode">
              <button class="h-8 px-3 rounded-md text-xs bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="openBatchEditOrWarn">确认编辑</button>
              <button class="h-8 px-3 rounded-md text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-1" @click="cancelBatchEditMode">取消</button>
            </template>
          </template>
        </div>
      </div>

      <!-- 表格 -->
      <div class="overflow-auto max-h-[calc(100vh-400px)]">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
            <tr>
              <th v-if="exportMode || batchEditMode || deleteMode" class="px-4 py-3 text-left text-sm font-semibold w-14 whitespace-nowrap">
                <input type="checkbox" :checked="paginatedReturns.length > 0 && selectedRows.length === paginatedReturns.length" @change="toggleSelectAllReturn" class="w-4 h-4 rounded border-white" />
              </th>
              <th class="px-4 py-3 text-left text-sm font-semibold w-12 whitespace-nowrap"></th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">退料单号</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">退料日期</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">退料类型</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">申请人</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作人</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">退料部门</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">仓库位置</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">审批状态</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">审核人</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">备注</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr v-if="paginatedReturns.length === 0">
              <td :colspan="(exportMode || batchEditMode || deleteMode) ? 12 : 11" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
            </tr>
            <template v-for="row in paginatedReturns" :key="row.id">
              <tr class="hover:bg-blue-100 transition-colors">
                <td v-if="exportMode || batchEditMode || deleteMode" class="px-4 py-3">
                  <input type="checkbox" :checked="selectedRows.includes(row.id)" :disabled="!checkSelectable(row)" @change="toggleReturnRow(row.id)" class="w-4 h-4 rounded border-gray-400" />
                </td>
                <td class="px-4 py-3">
                  <button class="text-gray-500 hover:text-blue-600 p-1" @click="toggleExpandRow(row.id)">
                    <ChevronDown v-if="expandedRows.has(row.id)" class="w-4 h-4" />
                    <ChevronRight v-else class="w-4 h-4" />
                  </button>
                </td>
                <td class="px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer whitespace-nowrap" @click="handleView(row)">{{ row.code }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.date }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.type }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.applicant }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.operator || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.department }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.warehouseLocation }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="getStatusClass(row)">{{ row.status }}</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.reviewer || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.remark || '-' }}</td>
              </tr>
              <!-- 展开行：物料明细 -->
              <tr v-if="expandedRows.has(row.id)" :key="'exp-' + row.id" class="bg-gray-50">
                <td :colspan="(exportMode || batchEditMode || deleteMode) ? 12 : 11" class="p-4">
                  <h4 class="font-medium mb-2 text-gray-700">退料物料明细</h4>
                  <div class="overflow-x-auto">
                    <table class="w-full border border-gray-200">
                      <thead class="bg-[#F2F6FA] text-gray-700">
                        <tr>
                          <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">来源领料单号</th>
                          <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">物料编码</th>
                          <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">物料分类</th>
                          <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">物料名称</th>
                          <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">规格</th>
                          <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">单位</th>
                          <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">本次退料数量</th>
                          <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">单价(元)</th>
                          <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">小计(元)</th>
                          <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">仓库货位</th>
                          <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">退料原因</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200">
                        <tr v-if="!row.materials || row.materials.length === 0">
                          <td colspan="11" class="px-3 py-4 text-center text-sm text-gray-500">暂无物料</td>
                        </tr>
                        <tr v-for="mr in row.materials" :key="mr.id || mr.materialCode" class="hover:bg-white">
                          <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ mr.sourceApplicationCode }}</td>
                          <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ mr.materialCode }}</td>
                          <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ mr.category }}</td>
                          <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ mr.materialName }}</td>
                          <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ mr.spec }}</td>
                          <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ mr.unit }}</td>
                          <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ mr.returnQuantity }}</td>
                          <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ mr.unitPrice }}</td>
                          <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ ((mr.returnQuantity || 0) * (mr.unitPrice || 0)).toFixed(2) }}</td>
                          <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ mr.warehousePosition }}</td>
                          <td class="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{{ mr.reason }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <el-pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :page-size="pageSize"
          :page-size-options="[10, 20, 50]"
          :show-page-size="true"
          @page-change="(page) => { currentPage = page }"
          @page-size-change="(size) => { pageSize = size; currentPage = 1 }"
        />
      </div>
    </div>

    <!-- ========== 查看详情弹窗 ========== -->
    <ReturnDetailModal :is-open="showDetailModal" @close="showDetailModal = false" />

    <!-- ========== 新增弹窗 ========== -->
    <ReturnAddModal :is-open="showAddModal" @close="showAddModal = false" />

    <!-- ========== 物料选择弹窗 ========== -->
    <ReturnMaterialSelectModal :is-open="showMaterialSelectModal" @close="showMaterialSelectModal = false" />

    <!-- ========== 编辑弹窗 ========== -->
    <ReturnEditModal :is-open="showEditModal" @close="showEditModal = false" />

    <!-- ========== 作废申请弹窗 ========== -->
    <ReturnVoidModal :is-open="showVoidModal" @close="showVoidModal = false" />

    <!-- ========== 批量删除确认弹窗 ========== -->
    <DeleteWarningModal
      :is-open="showBatchDeleteConfirm"
      :selected-count="selectedRows.length"
      title="批量删除退料单警告"
      @update:is-open="(v) => showBatchDeleteConfirm = v"
      @close="showBatchDeleteConfirm = false"
      @confirm="confirmBatchDelete"
    />

    <!-- ========== 导出类型选择弹窗 ========== -->
    <ExportFormatModal
      :visible="showExportTypeModal"
      :export-file-type="exportFileType"
      :selected-count="selectedRows.length"
      @update:visible="(v) => showExportTypeModal = v"
      @update:export-file-type="(val) => exportFileType = val"
      @confirm="confirmExport"
    />

    <!-- ========== 批量编辑弹窗 ========== -->
    <ReturnBatchEditModal :is-open="showBatchEditModal" @close="showBatchEditModal = false" />

    <!-- ========== 编辑警告弹窗 ========== -->
    <ElModal
      :model-value="showEditWarning"
      title="批量编辑提醒"
      :width="560"
      :height="450"
      :show-submit="false"
      :show-cancel="false"
      @update:model-value="(v) => { if (!v) closeEditWarning() }"
      @close="closeEditWarning"
    >
      <div class="p-2">
        <div class="flex items-start gap-3 mb-4">
          <Info class="w-10 h-10 text-blue-500 flex-shrink-0" />
          <div>
            <p class="text-base font-medium mb-2">批量编辑退料单注意事项</p>
            <ul class="text-sm text-gray-600 space-y-1 list-disc pl-5">
              <li>该退料单的历史记录可能无法追溯</li>
              <li>已生成的入库单据数据可能不一致</li>
              <li>相关的统计报表数据可能需要重新核算</li>
            </ul>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button size="small" @click="closeEditWarning">取消</el-button>
        <el-button type="primary" size="small" @click="confirmEditWarning">继续编辑</el-button>
      </template>
    </ElModal>

    <!-- ========== 删除警告弹窗 ========== -->
    <DeleteWarningModal
      :is-open="showDeleteWarning"
      :selected-count="0"
      title="批量删除提醒"
      description="所有选中的退料单将被永久删除。<br/>相关的物料明细也将被删除。<br/>历史数据将无法恢复。"
      @update:is-open="(v) => showDeleteWarning = v"
      @close="showDeleteWarning = false"
      @confirm="confirmDeleteWarning"
    />

    <!-- ========== 编辑提示弹窗（非待审批状态不允许编辑） ========== -->
    <ElModal
      :model-value="showEditAlert"
      title="编辑提示"
      :width="560"
      :height="450"
      :show-submit="false"
      :show-cancel="false"
      @update:model-value="(v) => showEditAlert = v"
      @close="showEditAlert = false"
    >
      <div class="p-2">
        <div class="flex items-start gap-3 mb-4">
          <AlertTriangle class="w-10 h-10 text-amber-500 flex-shrink-0" />
          <div>
            <p class="text-base font-medium text-gray-900 mb-1">无法编辑此退料单</p>
            <p class="text-sm text-gray-600">{{ editAlertMessage }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button size="small" @click="showEditAlert = false">确定</el-button>
        <el-button type="warning" size="small" @click="goToVoidFromAlert">去作废申请</el-button>
      </template>
    </ElModal>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { ArrowLeftRight, Plus, Edit, Edit2, Trash2, Download, ChevronDown, ChevronRight, RefreshCw, RotateCcw, AlertTriangle, Info, Search } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { useMaterialReturnStore } from '@/stores/modules/inventory/useMaterialReturnStore'
import { useWarehouseMaterialStore } from '@/stores/modules/inventory/useWarehouseMaterialStore'

// ============ 常量配置（与V1.1 config.ts一致） ============

const STATUS_OPTIONS = [
  { value: 'all', label: '全部状态' },
  { value: '待审批', label: '待审批' },
  { value: '已审批', label: '已审批' },
  { value: '已驳回', label: '已驳回' },
  { value: '已完成', label: '已完成' },
  { value: '已作废', label: '已作废' }
]

const STATUS_STYLE_MAP = {
  'approved': { bg: 'bg-green-100', text: 'text-green-700' },
  'pending': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'rejected': { bg: 'bg-red-100', text: 'text-red-700' },
  'completed': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'voided': { bg: 'bg-gray-200', text: 'text-gray-500' },
  '': { bg: 'bg-gray-100', text: 'text-gray-700' }
}

const STATUS_TO_CLASS = {
  '待审批': 'pending',
  '已审批': 'approved',
  '已驳回': 'rejected',
  '已完成': 'completed',
  '已作废': 'voided'
}

const RETURN_REASONS = ['生产剩余', '产品质量问题', '领错物料', '规格不符', '过期产品', '运输损坏', '库存积压', '其他']
const RETURN_TYPES = ['生产退料', '品质退料', '试制退料']
const APPLICANTS = ['李建国', '王建华', '张建华', '赵技术', '陈技术', '周管理员', '吴主管']
const WAREHOUSE_LOCATIONS = ['A区-01', 'A区-02', 'A区-03', 'A区-04', 'B区-01', 'B区-02', 'B区-03', 'C区-01', 'C区-05']
const OPERATORS = ['郭靖', '杨过', '张无忌', '令狐冲', '段誉', '萧峰', '虚竹', '胡斐', '陈家洛', '袁承志']
const REVIEWERS = ['黄药师', '小龙女', '周芷若', '任盈盈', '霍青桐', '夏雪宜', '程灵素', '扫地僧', '丁典']
const EDITABLE_STATUSES = ['待审批', '已审批', '已驳回', '已完成']
const DELETABLE_STATUSES = ['待审批', '已审批', '已驳回']
const EXPORT_FORMATS = [
  { value: 'xlsx', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

// 部门选项
const departmentOptions = ['生产部', '种植部', '设备部', '品质部', '仓储部', '技术部']

// ============ Store ============

const store = useMaterialReturnStore()
const warehouseStore = useWarehouseMaterialStore()

/** 获取当前用户名 */
const currentOperatorName = localStorage.getItem('username') || '系统管理员'

// ============ 工具函数 ============

/** 生成退料单号（TL+YYYYMMDD+3位流水号） */
const generateReturnCode = (existingCodes) => {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  const prefix = `TL${y}${m}${d}`
  let maxSeq = 0
  existingCodes.forEach(code => {
    if (code && code.startsWith(prefix)) {
      const seq = parseInt(code.substring(prefix.length), 10)
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq
    }
  })
  return `${prefix}${String(maxSeq + 1).padStart(3, '0')}`
}

/** 获取状态对应的样式类 */
const getStatusClass = (record) => {
  const cls = record.statusClass || STATUS_TO_CLASS[record.status] || ''
  const style = STATUS_STYLE_MAP[cls] || STATUS_STYLE_MAP['']
  return `${style.bg} ${style.text}`
}

/** 判断状态是否可删除 */
const isDeletable = (status) => DELETABLE_STATUSES.includes(status)

// ============ 响应式状态 ============

const searchForm = reactive({ code: '', material: '', warehouse: '', applicant: '', status: 'all', department: 'all' })
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRows = ref([])
const expandedRows = ref(new Set())
const exportMode = ref(false)
const batchEditMode = ref(false)
const deleteMode = ref(false)
const exportFileType = ref('xlsx')

// 弹窗状态
const showDetailModal = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showVoidModal = ref(false)
const showBatchDeleteConfirm = ref(false)
const showExportTypeModal = ref(false)
const showEditWarning = ref(false)
const showDeleteWarning = ref(false)
const showEditAlert = ref(false)

const selectedRecord = ref(null)
const voidReason = ref('')
const editAlertMessage = ref('')

// 批量编辑状态
const batchEditedRecords = ref({})
const currentBatchEditIndex = ref(0)
const showBatchEditModal = ref(false)

// 物料选择弹窗状态
const showMaterialSelectModal = ref(false)
const materialSelectSearch = ref('')
const selectedMaterialCodes = ref(new Set())

// 表单
const addForm = reactive(createEmptyAddForm())
const editForm = reactive(createEmptyEditForm())

function createEmptyAddForm() {
  return {
    code: '',
    date: new Date().toISOString().split('T')[0],
    type: '生产退料',
    applicant: '',
    department: '',
    warehouseLocation: '',
    remark: '',
    operator: currentOperatorName,
    reviewer: '',
    reviewDate: '',
    rejectReason: '',
    materials: []
  }
}

function createEmptyEditForm() {
  return {
    date: '',
    type: '',
    applicant: '',
    department: '',
    warehouseLocation: '',
    status: '',
    remark: '',
    operator: '',
    reviewer: '',
    reviewDate: '',
    rejectReason: '',
    materials: []
  }
}

function createEmptyMaterial() {
  return {
    sourceApplicationCode: '',
    materialCode: '',
    category: '',
    materialName: '',
    spec: '',
    unit: '',
    returnQuantity: 0,
    unitPrice: 0,
    warehousePosition: '',
    reason: '',
    remark: ''
  }
}

// ============ 计算属性 ============

const allReturns = computed(() => store.returnRecords)

const filteredReturns = computed(() => {
  return allReturns.value.filter(item => {
    if (searchForm.code && !item.code.toLowerCase().includes(searchForm.code.toLowerCase())) return false
    if (searchForm.material && !item.materials.some(m => m.materialName && m.materialName.toLowerCase().includes(searchForm.material.toLowerCase()))) return false
    if (searchForm.warehouse && !item.warehouseLocation.toLowerCase().includes(searchForm.warehouse.toLowerCase())) return false
    if (searchForm.applicant && !item.applicant.toLowerCase().includes(searchForm.applicant.toLowerCase())) return false
    if (searchForm.status !== 'all' && item.status !== searchForm.status) return false
    if (searchForm.department !== 'all' && item.department !== searchForm.department) return false
    return true
  })
})

const paginatedReturns = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredReturns.value.slice(start, start + pageSize.value)
})

const totalPages = computed(() => Math.ceil(filteredReturns.value.length / pageSize.value) || 1)

/** 批量编辑：当前记录ID */
const currentBatchId = computed(() => selectedRows.value[currentBatchEditIndex.value])

/** 批量编辑：当前记录 */
const currentBatchRecord = computed(() => {
  const id = currentBatchId.value
  return batchEditedRecords.value[id] || null
})

/** 根据ID获取退料记录 */
const getRecordById = (id) => allReturns.value.find(r => r.id === id)

// ============ 选择逻辑 ============

const checkSelectable = (row) => {
  if (exportMode.value) return true
  return isDeletable(row.status)
}

const onSelectionChange = (selection) => {
  selectedRows.value = selection.map(s => s.id)
}

/** 全选/取消全选当前页 */
const toggleSelectAllReturn = () => {
  const allSelected = paginatedReturns.value.length > 0 && selectedRows.value.length === paginatedReturns.value.length
  if (allSelected) {
    const currentIds = new Set(paginatedReturns.value.map(r => r.id))
    selectedRows.value = selectedRows.value.filter(id => !currentIds.has(id))
  } else {
    const existingIds = new Set(selectedRows.value)
    selectedRows.value = [...selectedRows.value, ...paginatedReturns.value.filter(r => !existingIds.has(r.id)).map(r => r.id)]
  }
}

/** 单行选中切换 */
const toggleReturnRow = (id) => {
  if (selectedRows.value.includes(id)) {
    selectedRows.value = selectedRows.value.filter(rid => rid !== id)
  } else {
    selectedRows.value = [...selectedRows.value, id]
  }
}

const toggleExpandRow = (id) => {
  const newSet = new Set(expandedRows.value)
  if (newSet.has(id)) newSet.delete(id)
  else newSet.add(id)
  expandedRows.value = newSet
}

// ============ 搜索操作 ============

const updateSearchField = (field, value) => {
  searchForm[field] = value
  currentPage.value = 1
}

const handleReset = () => {
  searchForm.code = ''
  searchForm.material = ''
  searchForm.warehouse = ''
  searchForm.applicant = ''
  searchForm.status = 'all'
  searchForm.department = 'all'
  currentPage.value = 1
}

// ============ 查看详情 ============

const handleView = (item) => {
  selectedRecord.value = item
  showDetailModal.value = true
}

// ============ 编辑操作 ============

const handleEdit = (item) => {
  if (item.status !== '待审批') {
    editAlertMessage.value = `该退料单当前状态为「${item.status}」，非待审批状态无法编辑。如需处理，可选择「作废申请」。`
    selectedRecord.value = item
    showEditAlert.value = true
    return
  }
  selectedRecord.value = item
  Object.assign(editForm, {
    date: item.date,
    type: item.type,
    applicant: item.applicant,
    department: item.department,
    warehouseLocation: item.warehouseLocation,
    status: item.status,
    remark: item.remark || '',
    operator: item.operator || '',
    reviewer: item.reviewer || '',
    reviewDate: item.reviewDate || '',
    rejectReason: item.rejectReason || '',
    materials: item.materials ? item.materials.map(m => ({ ...m })) : []
  })
  showEditModal.value = true
}

const handleEditMaterialChange = (index, field, value) => {
  editForm.materials[index][field] = value
}

const handleEditAddMaterial = () => {
  editForm.materials.push(createEmptyMaterial())
}

const handleEditRemoveMaterial = (index) => {
  editForm.materials.splice(index, 1)
}

const handleSaveEdit = async () => {
  if (!selectedRecord.value) return
  try {
    await store.editReturn(selectedRecord.value.id, { ...editForm })
    ElMessage.success('编辑成功')
    showEditModal.value = false
  } catch (e) {
    ElMessage.error('编辑失败: ' + (e.message || '未知错误'))
  }
}

// ============ 作废操作 ============

const handleVoidApply = (record) => {
  const target = record || selectedRecord.value
  if (!target) return
  selectedRecord.value = target
  voidReason.value = ''
  showVoidModal.value = true
}

const submitVoidApply = () => {
  if (!voidReason.value.trim()) {
    ElMessage.warning('作废申请需要填写作废原因')
    return
  }
  showVoidModal.value = false
  ElMessage.success('退料单作废申请已提交')
}

const goToVoidFromAlert = () => {
  showEditAlert.value = false
  handleVoidApply(selectedRecord.value)
}

// ============ 删除操作 ============

const confirmBatchDelete = async () => {
  if (selectedRows.value.length > 0) {
    await store.removeReturnsBatch(selectedRows.value)
    ElMessage.success(`成功删除 ${selectedRows.value.length} 条记录`)
  }
  showBatchDeleteConfirm.value = false
  deleteMode.value = false
  selectedRows.value = []
}

// ============ 新增操作 ============

const handleAddMaterial = () => {
  addForm.materials.push(createEmptyMaterial())
}

const handleRemoveMaterial = (index) => {
  addForm.materials.splice(index, 1)
}

const handleMaterialChange = (index, field, value) => {
  addForm.materials[index][field] = value
}

const handleGenerateCode = () => {
  addForm.code = generateReturnCode(allReturns.value.map(r => r.code))
}

const handleOpenMaterialSelect = async () => {
  selectedMaterialCodes.value = new Set()
  materialSelectSearch.value = ''
  if (warehouseStore.materials.length === 0) {
    await warehouseStore.loadMaterials()
  }
  showMaterialSelectModal.value = true
}

/** 物料选择弹窗：切换选中 */
const toggleMaterialSelect = (code) => {
  const newSet = new Set(selectedMaterialCodes.value)
  if (newSet.has(code)) newSet.delete(code)
  else newSet.add(code)
  selectedMaterialCodes.value = newSet
}

/** 物料选择弹窗：全选/取消全选 */
const toggleAllMaterialSelect = () => {
  const filtered = filteredWarehouseMaterials.value
  if (filtered.length === 0) return
  const allSelected = filtered.every(m => selectedMaterialCodes.value.has(m.code || m.name))
  if (allSelected) {
    selectedMaterialCodes.value = new Set()
  } else {
    selectedMaterialCodes.value = new Set(filtered.map(m => m.code || m.name))
  }
}

/** 物料选择弹窗：确认选择 */
const confirmMaterialSelect = () => {
  const filtered = filteredWarehouseMaterials.value
  const selected = filtered.filter(m => selectedMaterialCodes.value.has(m.code || m.name))
  selected.forEach(m => {
    addForm.materials.push({
      sourceApplicationCode: '',
      materialCode: m.code || m.name,
      category: m.category || '',
      materialName: m.name,
      spec: m.specification || '',
      unit: m.unit || '',
      returnQuantity: m.stockQuantity || 0,
      unitPrice: m.unitPrice || 0,
      warehousePosition: m.location || '',
      reason: '',
      remark: ''
    })
  })
  showMaterialSelectModal.value = false
}

/** 物料选择弹窗：过滤后的仓库物料 */
const filteredWarehouseMaterials = computed(() => {
  const keyword = materialSelectSearch.value.toLowerCase()
  if (!keyword) return warehouseStore.materials
  return warehouseStore.materials.filter(m =>
    (m.code || '').toLowerCase().includes(keyword) ||
    (m.name || '').toLowerCase().includes(keyword)
  )
})

const handleSaveAdd = async () => {
  if (!addForm.code) {
    ElMessage.warning('请先生成退料单号')
    return
  }
  if (!addForm.applicant) {
    ElMessage.warning('请选择申请人')
    return
  }
  if (addForm.materials.length === 0) {
    ElMessage.warning('请至少添加一种退料物料')
    return
  }
  try {
    const newRecord = {
      code: addForm.code,
      date: addForm.date,
      type: addForm.type,
      applicant: addForm.applicant,
      department: addForm.department,
      warehouseLocation: addForm.warehouseLocation,
      status: '待审批',
      statusClass: 'pending',
      remark: addForm.remark,
      operator: addForm.operator,
      reviewer: addForm.reviewer,
      reviewDate: '',
      rejectReason: '',
      materials: addForm.materials.map(m => ({ ...m }))
    }
    await store.addReturn(newRecord)
    ElMessage.success('新增成功')
    handleCancelAdd()
  } catch (e) {
    ElMessage.error('新增失败: ' + (e.message || '未知错误'))
  }
}

const handleCancelAdd = () => {
  showAddModal.value = false
  Object.assign(addForm, createEmptyAddForm())
}

// ============ 导出操作 ============

const handleExportClick = () => {
  if (selectedRows.value.length === 0 && filteredReturns.value.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  showExportTypeModal.value = true
}

const handleCancelExport = () => {
  exportMode.value = false
  selectedRows.value = []
}

const confirmExport = () => {
  const exportData = filteredReturns.value.filter(item => selectedRows.value.includes(item.id))

  const headers = ['退料单号', '退料日期', '退料类型', '申请人', '操作人', '退料部门', '仓库位置', '审批状态', '审核人', '备注']
  const fields = ['code', 'date', 'type', 'applicant', 'operator', 'department', 'warehouseLocation', 'status', 'reviewer', 'remark']
  const materialHeaders = ['物料编码', '物料名称', '规格', '单位', '领料数量', '退料原因']
  const materialFields = ['materialCode', 'materialName', 'spec', 'unit', 'quantity', 'reason']

  let content; let mimeType; let extension;

  if (exportFileType.value === 'csv') {
    let csvContent = '﻿' + headers.join(',') + ',' + materialHeaders.join(',') + '\n'
    exportData.forEach(row => {
      const mainRow = fields.map(f => `"${(row[f] || '')}"`).join(',')
      if (row.materials && row.materials.length > 0) {
        row.materials.forEach((mat, idx) => {
          if (idx === 0) csvContent += mainRow + ',' + materialFields.map(f => `"${(mat[f] || '')}"`).join(',') + '\n'
          else csvContent += ','.repeat(headers.length) + ',' + materialFields.map(f => `"${(mat[f] || '')}"`).join(',') + '\n'
        })
      } else {
        csvContent += mainRow + ',' + ','.repeat(materialHeaders.length) + '\n'
      }
    })
    content = csvContent
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFileType.value === 'xlsx') {
    let html = '<html><head><meta charset="utf-8"></head><body><table border="1">'
    html += `<tr>${headers.map(h => `<th>${h}</th>`).join('')}${materialHeaders.map(h => `<th>${h}</th>`).join('')}</tr>`
    exportData.forEach(row => {
      if (row.materials && row.materials.length > 0) {
        row.materials.forEach((mat, idx) => {
          if (idx === 0) html += `<tr>${fields.map(f => `<td>${row[f] || ''}</td>`).join('')}${materialFields.map(f => `<td>${mat[f] || ''}</td>`).join('')}</tr>`
          else html += `<tr>${'<td></td>'.repeat(headers.length)}${materialFields.map(f => `<td>${mat[f] || ''}</td>`).join('')}</tr>`
        })
      } else {
        html += `<tr>${fields.map(f => `<td>${row[f] || ''}</td>`).join('')}${'<td></td>'.repeat(materialHeaders.length)}</tr>`
      }
    })
    html += '</table></body></html>'
    content = html
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xlsx'
  } else {
    let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">'
    html += `<tr>${headers.map(h => `<th>${h}</th>`).join('')}${materialHeaders.map(h => `<th>${h}</th>`).join('')}</tr>`
    exportData.forEach(row => {
      if (row.materials && row.materials.length > 0) {
        row.materials.forEach((mat, idx) => {
          if (idx === 0) html += `<tr>${fields.map(f => `<td>${row[f] || ''}</td>`).join('')}${materialFields.map(f => `<td>${mat[f] || ''}</td>`).join('')}</tr>`
          else html += `<tr>${'<td></td>'.repeat(headers.length)}${materialFields.map(f => `<td>${mat[f] || ''}</td>`).join('')}</tr>`
        })
      } else {
        html += `<tr>${fields.map(f => `<td>${row[f] || ''}</td>`).join('')}${'<td></td>'.repeat(materialHeaders.length)}</tr>`
      }
    })
    html += '</table></body></html>'
    content = html
    mimeType = 'application/vnd.ms-word;charset=utf-8'
    extension = 'docx'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `生产退料_${new Date().toISOString().slice(0, 10)}.${extension}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  showExportTypeModal.value = false
  exportMode.value = false
  selectedRows.value = []
  ElMessage.success('导出成功')
}

// ============ 批量编辑操作 ============

const enterBatchEditMode = () => {
  batchEditMode.value = true
  showEditWarning.value = true
}

const openBatchEditOrWarn = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要编辑的记录')
    return
  }
  showEditWarning.value = false
  const records = {}
  selectedRows.value.forEach(id => {
    const record = allReturns.value.find(r => r.id === id)
    if (record) records[id] = JSON.parse(JSON.stringify(record))
  })
  batchEditedRecords.value = records
  currentBatchEditIndex.value = 0
  showBatchEditModal.value = true
}

const confirmEditWarning = () => {
  showEditWarning.value = false
}

const closeEditWarning = () => {
  showEditWarning.value = false
  batchEditMode.value = false
  selectedRows.value = []
}

const cancelBatchEditMode = () => {
  batchEditMode.value = false
  selectedRows.value = []
}

/** 批量编辑：跳转到下一条 */
const batchGoToNext = () => {
  const next = currentBatchEditIndex.value + 1
  if (next < selectedRows.value.length) {
    currentBatchEditIndex.value = next
  } else {
    currentBatchEditIndex.value = 0
  }
}

/** 批量编辑：字段变更 */
const batchHandleFieldChange = (recordId, field, value) => {
  const records = { ...batchEditedRecords.value }
  if (records[recordId]) {
    records[recordId] = { ...records[recordId], [field]: value }
    batchEditedRecords.value = records
  }
}

/** 批量编辑：物料字段变更 */
const batchHandleMaterialChange = (recordId, index, field, value) => {
  const records = { ...batchEditedRecords.value }
  if (records[recordId] && records[recordId].materials) {
    const materials = [...records[recordId].materials]
    materials[index] = { ...materials[index], [field]: value }
    records[recordId] = { ...records[recordId], materials }
    batchEditedRecords.value = records
  }
}

/** 批量编辑：保存全部 */
const handleBatchSaveAll = async () => {
  try {
    const ids = Object.keys(batchEditedRecords.value).map(Number)
    for (const id of ids) {
      await store.editReturn(id, batchEditedRecords.value[id])
    }
    ElMessage.success(`成功保存 ${ids.length} 条记录`)
  } catch (e) {
    ElMessage.error('批量保存失败: ' + (e.message || '未知错误'))
  }
  showBatchEditModal.value = false
  batchEditMode.value = false
  selectedRows.value = []
  batchEditedRecords.value = {}
  currentBatchEditIndex.value = 0
}

/** 批量编辑：关闭 */
const closeBatchEditModal = () => {
  showBatchEditModal.value = false
  batchEditedRecords.value = {}
  currentBatchEditIndex.value = 0
}

// ============ 批量删除操作 ============

const enterDeleteMode = () => {
  showDeleteWarning.value = true
}

const confirmDeleteWarning = () => {
  showDeleteWarning.value = false
  deleteMode.value = true
}

const cancelDeleteMode = () => {
  deleteMode.value = false
  selectedRows.value = []
}

// ============ 生命周期 ============

onMounted(async () => {
  await store.loadReturnRecords()
})
</script>
