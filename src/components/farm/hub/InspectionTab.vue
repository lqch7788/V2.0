<template>
  <!-- 巡查记录Tab - 从V1.1 InspectionTab.tsx 1:1迁移，完整业务逻辑 -->
  <div class="space-y-4">
    <!-- 搜索栏 -->
    <InspectionSearch
      :filters="localFilters"
      :on-filters-change="handleFiltersChange"
      :on-search="() => {}"
      :on-reset="handleResetFilters"
    />

    <!-- 工具栏 + 表格区域 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <InspectionToolbar
        :export-mode="exportMode"
        :batch-edit-mode="batchEditMode"
        :batch-delete-mode="batchDeleteMode"
        :stats="computedStats"
        :on-create="handleOpenCreateModal"
        :on-batch-edit="() => emit('toggleBatchEditMode')"
        :on-batch-delete="() => emit('toggleBatchDeleteMode')"
        :on-export="() => emit('toggleExportMode')"
        :on-confirm-export="handleConfirmExport"
        :on-cancel-export="() => emit('toggleExportMode')"
        :on-confirm-batch-edit="() => showBatchEditModal = true"
        :on-cancel-batch-edit="cancelBatchEdit"
        :on-confirm-batch-delete="() => showDeleteWarning = true"
        :on-cancel-batch-delete="cancelBatchDelete"
      />

      <!-- 巡查记录表格 -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50">
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 w-10">
                <el-checkbox
                  v-if="exportMode || batchEditMode || batchDeleteMode"
                  :model-value="isAllSelected"
                  :indeterminate="isIndeterminate"
                  size="small"
                  @change="handleSelectAll"
                />
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">巡查编号</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">巡查类型</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">巡查人员</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">位置/对象</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">巡查日期</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">天气</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">状态</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="(record, idx) in paginatedRecords"
              :key="record.id"
              :class="[
                'hover:bg-gray-50 transition-colors',
                isRowSelected(idx) ? 'bg-emerald-50' : '',
              ]"
            >
              <td class="px-4 py-3">
                <el-checkbox
                  v-if="exportMode || batchEditMode || batchDeleteMode"
                  :model-value="isRowSelected(idx)"
                  size="small"
                  @change="() => handleToggleRow(idx)"
                />
              </td>
              <td class="px-4 py-3">
                <span class="text-sm font-mono text-emerald-700">{{ record.recordCode }}</span>
              </td>
              <td class="px-4 py-3">
                <span :class="getTypeBadgeClass(record.inspectionType)">
                  {{ getTypeLabel(record.inspectionType) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm text-gray-900">{{ record.inspectorName }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm text-gray-600">{{ getLocationText(record) }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm text-gray-600">{{ record.checkDate }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm text-gray-600">{{ record.weather || '-' }}</span>
              </td>
              <td class="px-4 py-3">
                <span :class="getStatusBadgeClass(record.status)">
                  {{ STATUS_CONFIG[record.status]?.label || record.status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <el-button type="primary" link size="small" @click="handleViewDetail(record)">
                  查看
                </el-button>
              </td>
            </tr>
            <tr v-if="paginatedRecords.length === 0">
              <td :colspan="exportMode || batchEditMode || batchDeleteMode ? 9 : 8" class="px-4 py-12 text-center text-gray-400">
                暂无巡查记录
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
        <span class="text-sm text-gray-500">共 {{ filteredRecords.length }} 条</span>
        <div class="flex items-center gap-2">
          <el-button size="small" :disabled="currentPage <= 1" @click="emit('pageChange', currentPage - 1)">上一页</el-button>
          <span class="text-sm text-gray-600">第 {{ currentPage }}/{{ totalPages }} 页</span>
          <el-button size="small" :disabled="currentPage >= totalPages" @click="emit('pageChange', currentPage + 1)">下一页</el-button>
        </div>
      </div>
    </div>

    <!-- 新建弹窗 -->
    <CreateInspectionModal
      :is-open="isCreateModalOpen"
      :on-close="handleCloseCreateModal"
      :on-submit="handleCreateRecord"
      :new-record="newRecord"
      :on-new-record-change="setNewRecord"
      :errors="errors"
      :generate-record-code="generateRecordCode"
      :on-image-upload="handleImageUpload"
      :on-remove-image="removeImage"
      :greenhouses="mockGreenhouses"
      :users="mockUsers"
      :crop-types="mockCropTypes"
      :crop-batches="mockCropBatches"
      :equipment-records="mockEquipment"
      :infrastructure-records="mockInfrastructure"
      :on-open-q-r-scanner="() => isQRScannerOpen = true"
    />

    <!-- 详情弹窗 -->
    <DetailInspectionModal
      :is-open="!!detailRecord"
      :on-close="() => emit('closeDetail')"
      :record="detailRecord"
      :on-accept-problem="(problemId) => acceptanceModal = { isOpen: true, problemId }"
      :problem-data="detailProblemData"
      :problem-flow-records="detailFlowRecords"
      :users="mockUsers"
    />

    <!-- 批量编辑弹窗 -->
    <el-dialog
      :model-value="showBatchEditModal"
      title="批量编辑巡查记录"
      width="700px"
      :close-on-click-modal="false"
      @close="showBatchEditModal = false"
    >
      <div class="space-y-4">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-sm text-gray-500">选择要编辑的记录：</span>
          <el-select
            v-model="selectedRecordId"
            placeholder="选择记录"
            size="small"
            style="width: 300px"
            @change="onBatchRecordSelect"
          >
            <el-option
              v-for="(rid, idx) in selectedIds"
              :key="rid"
              :value="rid"
              :label="`${filteredRecords.find(r => r.id == rid)?.recordCode || rid} - ${filteredRecords.find(r => r.id == rid)?.inspectorName || ''}`"
            />
          </el-select>
        </div>

        <div v-if="selectedRecordId && editedRecords[selectedRecordId]" class="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label class="block text-sm text-gray-600 mb-1">巡查区域</label>
            <el-select
              v-model="editedRecords[selectedRecordId].greenhouseId"
              placeholder="不修改"
              size="small"
              class="w-full"
            >
              <el-option value="" label="不修改" />
              <el-option v-for="gh in mockGreenhouses" :key="gh.id" :value="gh.id" :label="gh.name" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">巡查人员</label>
            <el-select
              v-model="editedRecords[selectedRecordId].inspectorId"
              placeholder="不修改"
              size="small"
              class="w-full"
            >
              <el-option value="" label="不修改" />
              <el-option v-for="u in mockUsers" :key="u.id" :value="u.id" :label="u.name" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">巡查日期</label>
            <el-date-picker
              v-model="editedRecords[selectedRecordId].checkDate"
              type="date"
              placeholder="不修改"
              size="small"
              class="w-full"
              value-format="YYYY-MM-DD"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">状态</label>
            <el-select
              v-model="editedRecords[selectedRecordId].status"
              placeholder="不修改"
              size="small"
              class="w-full"
            >
              <el-option value="" label="不修改" />
              <el-option value="normal" label="正常" />
              <el-option value="attention" label="需关注" />
              <el-option value="critical" label="异常" />
            </el-select>
          </div>
        </div>

        <div v-if="editedRecordIds.length > 0" class="text-sm text-gray-500">
          已选择编辑 {{ editedRecordIds.length }} 条记录
        </div>
      </div>
      <template #footer>
        <el-button @click="showBatchEditModal = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmBatchEdit">确认编辑</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog
      :model-value="showDeleteWarning"
      title="确认删除"
      width="400px"
      @close="showDeleteWarning = false"
    >
      <div class="text-center py-4">
        <el-icon :size="48" color="#f56c6c"><WarningFilled /></el-icon>
        <p class="mt-4 text-gray-700">
          确定要删除选中的 <span class="text-red-500 font-bold">{{ selectedRows.length }}</span> 条巡查记录吗？
        </p>
        <p class="text-sm text-gray-400 mt-2">此操作不可恢复</p>
      </div>
      <template #footer>
        <el-button @click="showDeleteWarning = false">取消</el-button>
        <el-button type="danger" @click="handleConfirmBatchDelete">确认删除</el-button>
      </template>
    </el-dialog>

    <!-- 导出格式弹窗 -->
    <el-dialog
      :model-value="showExportModal"
      title="选择导出格式"
      width="450px"
      @close="showExportModal = false"
    >
      <div class="space-y-3">
        <label
          v-for="fmt in exportFormats"
          :key="fmt.value"
          :class="[
            'flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
            exportFormat === fmt.value
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-200 hover:border-emerald-300',
          ]"
          @click="exportFormat = fmt.value"
        >
          <input
            type="radio"
            name="exportFormat"
            :value="fmt.value"
            :checked="exportFormat === fmt.value"
            class="w-4 h-4 text-emerald-600"
            @change="exportFormat = fmt.value"
          />
          <span class="text-lg">{{ fmt.icon }}</span>
          <span class="text-sm font-medium text-gray-900">{{ fmt.label }}</span>
        </label>
      </div>
      <template #footer>
        <el-button @click="showExportModal = false">取消</el-button>
        <el-button type="primary" @click="handleDoExport">导出</el-button>
      </template>
    </el-dialog>

    <!-- 问题验收弹窗 -->
    <el-dialog
      :model-value="acceptanceModal.isOpen"
      title="问题验收"
      width="700px"
      @close="closeAcceptance"
    >
      <div v-if="acceptanceModal.problemId" class="space-y-4">
        <template v-if="acceptanceProblem">
          <!-- 处理结果信息 -->
          <div class="bg-gray-50 rounded-lg p-4 space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">处理人</span>
              <span class="text-sm font-medium">{{ acceptanceProblem.handler || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">处理日期</span>
              <span class="text-sm font-medium">{{ acceptanceProblem.handleDate || '-' }}</span>
            </div>
            <div class="text-sm text-gray-600">处理结果</div>
            <div class="bg-white rounded p-3 text-sm">{{ acceptanceProblem.handleResult || '无处理结果' }}</div>
          </div>

          <!-- 返工次数提示 -->
          <div v-if="(acceptanceProblem.reworkCount ?? 0) > 0" :class="[
            'text-sm p-3 rounded-lg border',
            (acceptanceProblem.reworkCount ?? 0) >= 2
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-amber-50 text-amber-700 border-amber-200',
          ]">
            <div class="font-medium">
              {{ (acceptanceProblem.reworkCount ?? 0) >= 2
                ? '⚠️ 已返工多次，将退回问题分派页面重新分派'
                : `已返工${acceptanceProblem.reworkCount}次，再次返工将退回问题分派`
              }}
            </div>
          </div>

          <!-- 流转记录 -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2">处理流转记录</h4>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <div v-for="fr in (acceptanceProblem.flowRecords || [])" :key="fr.id" class="flex gap-3 text-xs">
                <span class="text-gray-400 whitespace-nowrap">{{ formatFlowTime(fr.actionTime) }}</span>
                <span class="font-medium text-gray-700">{{ fr.operatorName }}</span>
                <span class="text-gray-500">{{ getFlowActionLabel(fr.action) }}</span>
                <span v-if="fr.comment" class="text-gray-400">- {{ fr.comment }}</span>
              </div>
            </div>
          </div>

          <!-- 验收操作 -->
          <div class="border-t pt-4">
            <div class="flex gap-3 mb-4">
              <el-button type="primary" class="flex-1" @click="handleApproveAcceptance">
                <el-icon><CircleCheck /></el-icon>
                验收通过
              </el-button>
              <el-button type="danger" class="flex-1" @click="handleRejectAcceptance">
                <el-icon><CircleClose /></el-icon>
                返工
              </el-button>
            </div>
            <div class="text-xs text-gray-500 text-center">
              通过：问题关闭，流转结束 | 返工：第1次给原执行人，第2次退分派重分
            </div>
          </div>
        </template>
        <div v-else class="text-center py-8 text-gray-400">问题数据不存在</div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 模块级常量（defineProps需要引用，必须放在普通script块中）
const INITIAL_FILTERS = {
  recordCode: '',
  inspectorName: '',
  inspectionType: 'all',
  startDate: '',
  endDate: '',
  status: 'all',
  problemStatus: 'all',
}
</script>

<script setup>
/** 巡查记录Tab - 从V1.1 InspectionTab.tsx 1:1迁移 */
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { WarningFilled, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import InspectionSearch from './InspectionSearch.vue'
import InspectionToolbar from './InspectionToolbar.vue'
import CreateInspectionModal from './CreateInspectionModal.vue'
import DetailInspectionModal from './DetailInspectionModal.vue'

// ============================================
// 常量配置（与V1.1完全一致）
// ============================================
const STATUS_CONFIG = {
  normal: { bg: 'bg-green-100', text: 'text-green-700', label: '正常' },
  attention: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '需关注' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', label: '异常' },
}

// 导出格式选项
const exportFormats = [
  { value: 'excel', label: 'Excel 文件 (.xls)', icon: '📊' },
  { value: 'csv', label: 'CSV 文件 (.csv)', icon: '📄' },
  { value: 'word', label: 'Word 文件 (.doc)', icon: '📝' },
]

// ============================================
// Mock数据（自包含，后续对接Store）
// ============================================
const mockGreenhouses = [
  { id: 'GH001', name: 'A1号温室' },
  { id: 'GH002', name: 'B2号温室' },
  { id: 'GH003', name: 'C3号温室' },
]
const mockUsers = [
  { id: 'U001', name: '张建国', role: '技术员' },
  { id: 'U002', name: '李明华', role: '巡查员' },
  { id: 'U003', name: '王丰收', role: '管理员' },
  { id: 'U004', name: '陈晓东', role: '巡查组长' },
]
const mockCropTypes = [
  { id: 'c1', name: '番茄' },
  { id: 'c2', name: '黄瓜' },
  { id: 'c3', name: '辣椒' },
]
const mockCropBatches = [
  { id: 'B001', batchCode: 'PD202605-001', cropName: '番茄', status: 'active' },
  { id: 'B002', batchCode: 'PD202605-002', cropName: '黄瓜', status: 'active' },
  { id: 'B003', batchCode: 'PD202604-003', cropName: '辣椒', status: 'planning' },
]
const mockEquipment = [
  { id: 'EQ001', name: '自动灌溉系统A', location: 'A1温室', greenhouseId: 'GH001' },
  { id: 'EQ002', name: '通风设备B', location: 'B2温室', greenhouseId: 'GH002' },
]
const mockInfrastructure = [
  { id: 'IF001', name: '遮阳网系统', type: '遮阳', greenhouseId: 'GH001', location: 'A1温室' },
  { id: 'IF002', name: '加温管道', type: '加温', greenhouseId: 'GH002', location: 'B2温室' },
]

// 初始巡查记录 Mock 数据
const generateMockRecords = () => {
  const types = ['farm', 'farm', 'farm', 'equipment', 'infrastructure', 'farm', 'farm', 'equipment']
  const statuses = ['normal', 'normal', 'attention', 'normal', 'critical', 'normal', 'attention', 'normal']
  const records = []
  for (let i = 0; i < 25; i++) {
    const t = types[i % types.length]
    const today = new Date()
    today.setDate(today.getDate() - i)
    const dateStr = today.toISOString().split('T')[0]
    records.push({
      id: i + 1,
      recordCode: `XT${dateStr.replace(/-/g, '')}-${String((i % 3) + 1).padStart(3, '0')}`,
      inspectionType: t,
      greenhouseId: t === 'farm' ? mockGreenhouses[i % 3].id : '',
      greenhouseName: t === 'farm' ? mockGreenhouses[i % 3].name : (t === 'equipment' ? mockEquipment[i % 2].location : ''),
      cropName: t === 'farm' ? mockCropTypes[i % 3].name : '',
      inspectorId: mockUsers[i % 4].id,
      inspectorName: mockUsers[i % 4].name,
      checkDate: dateStr,
      checkTime: `${String(8 + (i % 6)).padStart(2, '0')}:${String((i * 15) % 60).padStart(2, '0')}`,
      weather: ['晴', '多云', '阴', '小雨'][i % 4],
      temperature: 22 + (i % 10),
      humidity: 55 + (i % 30),
      cropStatus: '良好',
      status: statuses[i % statuses.length],
      equipmentId: t === 'equipment' ? mockEquipment[i % 2].id : '',
      equipmentName: t === 'equipment' ? mockEquipment[i % 2].name : '',
      infrastructureId: t === 'infrastructure' ? mockInfrastructure[i % 2].id : '',
      infrastructureName: t === 'infrastructure' ? mockInfrastructure[i % 2].name : '',
      issueText: i % 5 === 0 ? '发现' + ['蚜虫', '白粉病', '灰霉病'][i % 3] + '问题' : '',
      issueSeverity: i % 5 === 0 ? ['轻微', '中等', '严重'][i % 3] : '',
      issuePhotos: [],
      feedbackUsers: [],
      remarks: '',
    })
  }
  return records
}

// Mock 问题数据
const mockProblems = [
  {
    id: 1,
    problemCode: 'PD20260520001',
    status: '待验收',
    handler: '李明华',
    handleDate: '2026-05-25',
    handleResult: '已喷洒农药处理，蚜虫数量明显减少',
    reworkCount: 0,
    flowRecords: [
      { id: 'FR001', operatorId: 'U002', operatorName: '李明华', action: 'report', actionTime: '2026-05-20T10:00:00', comment: '发现蚜虫' },
      { id: 'FR002', operatorId: 'U001', operatorName: '张建国', action: 'dispatch', actionTime: '2026-05-20T14:00:00', comment: '分派处理' },
      { id: 'FR003', operatorId: 'U002', operatorName: '李明华', action: 'submit', actionTime: '2026-05-25T09:00:00', comment: '处理完成' },
    ],
  },
  {
    id: 2,
    problemCode: 'PD20260521002',
    status: '处理中',
    handler: '王丰收',
    handleDate: '2026-05-24',
    handleResult: '正在处理白粉病',
    reworkCount: 1,
    flowRecords: [
      { id: 'FR004', operatorId: 'U004', operatorName: '陈晓东', action: 'report', actionTime: '2026-05-21T08:00:00' },
      { id: 'FR005', operatorId: 'U001', operatorName: '张建国', action: 'dispatch', actionTime: '2026-05-21T10:00:00' },
    ],
  },
]

// ============================================
// Props定义（与V1.1 InspectionTabProps完全对应）
// ============================================
const props = defineProps({
  inspections: { type: Array, default: () => [] },
  stats: { type: Object, default: undefined },
  filters: { type: Object, default: () => ({ ...INITIAL_FILTERS }) },
  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  exportMode: { type: Boolean, default: false },
  batchEditMode: { type: Boolean, default: false },
  batchDeleteMode: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  detailRecordId: { type: [String, Number], default: null },
  isCreateModalOpen: { type: Boolean, default: false },
  problems: { type: Array, default: () => [] },
})

const emit = defineEmits([
  'filterChange', 'resetFilters', 'pageChange', 'pageSizeChange',
  'toggleExportMode', 'toggleBatchEditMode', 'toggleBatchDeleteMode',
  'toggleSelectRow', 'selectAll', 'clearSelection',
  'viewDetail', 'closeDetail',
  'openCreateModal', 'closeCreateModal',
  'reportProblem', 'acceptProblem',
  'batchDelete', 'batchEdit',
])

// ============================================
// 本地状态
// ============================================
// 巡查记录本地副本（从prop同步）
const inspectionRecords = ref(generateMockRecords())

// 同步外部数据
watch(() => props.inspections, (val) => {
  if (val && val.length > 0) {
    inspectionRecords.value = val
  }
}, { immediate: true })

// 本地筛选（与外部双向同步）
const localFilters = reactive({ ...INITIAL_FILTERS, ...props.filters })
watch(() => props.filters, (val) => {
  if (val) Object.assign(localFilters, val)
}, { deep: true })

// 弹窗状态
const showBatchEditModal = ref(false)
const showDeleteWarning = ref(false)
const showExportModal = ref(false)
const exportFormat = ref('excel')
const isQRScannerOpen = ref(false)

// 批量编辑状态
const editedRecordIds = ref([])
const editedRecords = ref({})
const selectedRecordId = ref('')

// 新建表单状态
const newRecord = reactive(getDefaultNewRecord())
const errors = reactive({})

// 验收弹窗
const acceptanceModal = reactive({ isOpen: false, problemId: null })

function getDefaultNewRecord() {
  return {
    recordCode: '',
    inspectionType: 'farm',
    greenhouseId: '',
    cropName: '',
    inspectorId: mockUsers[0]?.id || '',
    batchId: '',
    batchCode: '',
    checkDate: new Date().toISOString().split('T')[0],
    checkTime: new Date().toTimeString().slice(0, 5),
    duration: 0,
    weather: '晴',
    temperature: 0,
    humidity: 0,
    cropStatus: '良好',
    plantHeight: 0,
    leafCount: 0,
    inspectionResult: 'normal',
    feedbackRequired: false,
    issueCategories: [],
    issuePresets: [],
    issueText: '',
    issueSeverity: '中等',
    issuePhotos: [],
    newImages: [],
    feedbackUsers: [],
    remarks: '',
    equipmentId: '',
    equipmentName: '',
    infrastructureId: '',
    infrastructureName: '',
    airTemperature: 0,
    airHumidity: 0,
    lightIntensity: 0,
    co2Concentration: 0,
    soilTemperature: 0,
    soilMoisture: 0,
    soilEc: 0,
    soilPh: 0,
  }
}

// ============================================
// 计算属性
// ============================================
// 统计信息
const computedStats = computed(() => {
  if (props.stats) return props.stats
  const records = inspectionRecords.value
  return {
    total: records.length,
    normal: records.filter(r => r.status === 'normal').length,
    attention: records.filter(r => r.status === 'attention').length,
    abnormal: records.filter(r => r.status === 'critical' || r.status === 'abnormal').length,
  }
})

// 过滤后的记录
const filteredRecords = computed(() => {
  return inspectionRecords.value.filter(record => {
    if (localFilters.recordCode && !record.recordCode?.toLowerCase().includes(localFilters.recordCode.toLowerCase())) return false
    if (localFilters.inspectorName && !record.inspectorName?.toLowerCase().includes(localFilters.inspectorName.toLowerCase())) return false
    if (localFilters.inspectionType !== 'all' && record.inspectionType !== localFilters.inspectionType) return false
    if (localFilters.startDate && record.checkDate < localFilters.startDate) return false
    if (localFilters.endDate && record.checkDate > localFilters.endDate) return false
    if (localFilters.status !== 'all' && record.status !== localFilters.status) return false
    if (localFilters.problemStatus !== 'all') {
      const problem = mockProblems.find(p => p.id === record.problemId)
      const problemStatusMap = { '待处理': 'pending', '处理中': 'processing', '待验收': 'pending', '已处理': 'resolved' }
      const mappedStatus = problemStatusMap[localFilters.problemStatus]
      if (mappedStatus && problem?.status !== mappedStatus) return false
    }
    return true
  })
})

// 分页后的数据
const paginatedRecords = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize
  return filteredRecords.value.slice(start, start + props.pageSize)
})

// 总页数
const totalPages = computed(() => Math.ceil(filteredRecords.value.length / props.pageSize) || 1)

// 选中的ID数组
const selectedIds = computed(() => {
  return props.selectedRows.map(idx => paginatedRecords.value[idx]?.id).filter(Boolean)
})

// 全选状态
const isAllSelected = computed(() => {
  return paginatedRecords.value.length > 0 && props.selectedRows.length === paginatedRecords.value.length
})
const isIndeterminate = computed(() => {
  return props.selectedRows.length > 0 && props.selectedRows.length < paginatedRecords.value.length
})

// 详情记录
const detailRecord = computed(() => {
  return inspectionRecords.value.find(r => String(r.id) === String(props.detailRecordId)) || null
})

// 详情关联问题
const detailProblemData = computed(() => {
  if (!detailRecord.value?.problemId) return null
  return mockProblems.find(p => p.id === detailRecord.value.problemId) || null
})
const detailFlowRecords = computed(() => detailProblemData.value?.flowRecords || [])

// 验收问题数据
const acceptanceProblem = computed(() => {
  return mockProblems.find(p => p.id === acceptanceModal.problemId) || null
})

// ============================================
// 筛选方法
// ============================================
function handleFiltersChange(newFilters) {
  Object.entries(newFilters).forEach(([key, value]) => {
    emit('filterChange', key, value)
  })
}

function handleResetFilters() {
  Object.assign(localFilters, { ...INITIAL_FILTERS })
  emit('resetFilters')
}

// ============================================
// 选择方法
// ============================================
function isRowSelected(idx) {
  return props.selectedRows.includes(idx)
}

function handleToggleRow(idx) {
  emit('toggleSelectRow', idx)
}

function handleSelectAll() {
  if (isAllSelected.value) {
    emit('clearSelection')
  } else {
    emit('selectAll', paginatedRecords.value.length)
  }
}

function cancelBatchEdit() {
  emit('toggleBatchEditMode')
  emit('clearSelection')
  editedRecordIds.value = []
  editedRecords.value = {}
  selectedRecordId.value = ''
}

function cancelBatchDelete() {
  emit('toggleBatchDeleteMode')
  emit('clearSelection')
}

// ============================================
// 查看详情
// ============================================
function handleViewDetail(record) {
  emit('viewDetail', String(record.id))
}

// ============================================
// 新建记录
// ============================================
function generateRecordCode() {
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')
  const todayRecords = inspectionRecords.value.filter(r => r.recordCode.includes(dateStr))
  const maxSeq = todayRecords.reduce((max, r) => {
    const seq = parseInt(r.recordCode.split('-')[1] || '0')
    return seq > max ? seq : max
  }, 0)
  const nextSeq = String(maxSeq + 1).padStart(3, '0')
  return `XT${dateStr}-${nextSeq}`
}

function handleOpenCreateModal() {
  newRecord.recordCode = newRecord.recordCode || generateRecordCode()
  newRecord.checkDate = newRecord.checkDate || new Date().toISOString().split('T')[0]
  newRecord.checkTime = newRecord.checkTime || new Date().toTimeString().slice(0, 5)
  newRecord.inspectorId = newRecord.inspectorId || (mockUsers[0]?.id || '')
  emit('openCreateModal')
}

function handleCloseCreateModal() {
  Object.assign(newRecord, getDefaultNewRecord())
  Object.keys(errors).forEach(k => delete errors[k])
  emit('closeCreateModal')
}

function setNewRecord(updated) {
  Object.assign(newRecord, updated)
}

function handleImageUpload(e) {
  const files = e.target?.files
  if (!files) return
  const currentCount = (newRecord.newImages || []).length
  const remaining = 6 - currentCount
  if (remaining <= 0) return
  Array.from(files).slice(0, remaining).forEach(file => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result
      newRecord.newImages = [...(newRecord.newImages || []), result]
    }
    reader.readAsDataURL(file)
  })
  e.target.value = ''
}

function removeImage(index) {
  newRecord.newImages = (newRecord.newImages || []).filter((_, i) => i !== index)
}

function validateForm() {
  const newErrors = {}
  if (!newRecord.checkDate) newErrors.checkDate = '请选择巡查日期'
  if (newRecord.inspectionType === 'farm') {
    if (!newRecord.greenhouseId) newErrors.greenhouseId = '请选择巡查区域'
    if (!newRecord.cropName) newErrors.cropName = '请选择作物名称'
  } else if (newRecord.inspectionType === 'equipment') {
    if (!newRecord.equipmentId) newErrors.equipmentId = '请选择设备'
  } else if (newRecord.inspectionType === 'infrastructure') {
    if (!newRecord.infrastructureId) newErrors.infrastructureId = '请选择基础设施'
  } else if (newRecord.inspectionType === 'other') {
    if (!newRecord.remarks) newErrors.remarks = '请输入其他说明'
  }
  Object.assign(errors, newErrors)
  return Object.keys(newErrors).length === 0
}

function handleCreateRecord() {
  if (!validateForm()) return
  const selectedUser = mockUsers.find(u => u.id === newRecord.inspectorId)
  const selectedBatch = mockCropBatches.find(b => b.id === newRecord.batchId)

  let greenhouseId = ''
  let greenhouseName = ''
  let cropName = ''
  let equipmentId = ''
  let equipmentName = ''
  let infrastructureId = ''
  let infrastructureName = ''

  if (newRecord.inspectionType === 'farm') {
    const gh = mockGreenhouses.find(g => g.id === newRecord.greenhouseId)
    greenhouseId = newRecord.greenhouseId
    greenhouseName = gh?.name || ''
    cropName = newRecord.cropName
  } else if (newRecord.inspectionType === 'equipment') {
    const eq = mockEquipment.find(e => e.id === newRecord.equipmentId)
    greenhouseId = eq?.greenhouseId || ''
    greenhouseName = eq?.location || ''
    equipmentId = newRecord.equipmentId
    equipmentName = eq?.name || ''
  } else if (newRecord.inspectionType === 'infrastructure') {
    const inf = mockInfrastructure.find(i => i.id === newRecord.infrastructureId)
    greenhouseId = inf?.greenhouseId || ''
    greenhouseName = inf?.location || ''
    infrastructureId = newRecord.infrastructureId
    infrastructureName = inf?.name || ''
  }

  // 问题推送逻辑
  let newProblemId
  if (newRecord.feedbackRequired && newRecord.feedbackUsers.length > 0 && newRecord.inspectionResult === 'abnormal') {
    const presetIssues = (newRecord.issuePresets || []).join('、')
    const issueText = presetIssues + (newRecord.issueText ? (presetIssues ? '；' + newRecord.issueText : newRecord.issueText) : '')

    let severity = newRecord.issueSeverity || '中等'
    if (!newRecord.issueSeverity) {
      const allText = issueText + newRecord.issueText
      if (allText.includes('严重') || allText.includes('灰霉') || allText.includes('病毒')) severity = '严重'
      else if (allText.includes('蚜虫') || allText.includes('病') || allText.includes('虫')) severity = '中等'
    }

    const problemCode = `PD${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Date.now()).slice(-3)}`
    const newProblem = {
      id: mockProblems.length + 1,
      problemCode,
      greenhouseId: newRecord.greenhouseId,
      greenhouseName,
      cropName,
      inspectorId: newRecord.inspectorId,
      inspectorName: selectedUser?.name || '',
      checkDate: newRecord.checkDate,
      checkTime: newRecord.checkTime,
      weather: newRecord.weather,
      temperature: newRecord.temperature || 0,
      humidity: newRecord.humidity || 0,
      cropStatus: newRecord.cropStatus,
      plantHeight: newRecord.plantHeight || 0,
      leafCount: newRecord.leafCount || 0,
      issueText: issueText || newRecord.issueText || '未描述具体问题',
      issueSeverity: severity,
      status: '待处理',
      remarks: newRecord.remarks,
      images: newRecord.issuePhotos || [],
      sourceModule: 'inspection',
      sourceId: newRecord.recordCode,
      handler: '',
      handleDate: '',
      handleResult: '',
      reworkCount: 0,
      flowRecords: [{
        id: `FR-${Date.now()}`,
        problemId: 0,
        operatorId: newRecord.inspectorId,
        operatorName: selectedUser?.name || '',
        action: 'report',
        fromStatus: '',
        toStatus: '待处理',
        actionTime: new Date().toISOString(),
      }],
    }
    mockProblems.push(newProblem)
    newProblemId = newProblem.id
  }

  const record = {
    id: inspectionRecords.value.length + 1,
    recordCode: newRecord.recordCode,
    inspectionType: newRecord.inspectionType,
    greenhouseId,
    greenhouseName,
    cropName,
    inspectorId: newRecord.inspectorId,
    inspectorName: selectedUser?.name || '',
    batchId: newRecord.batchId || undefined,
    batchCode: selectedBatch?.batchCode || undefined,
    checkDate: newRecord.checkDate,
    checkTime: newRecord.checkTime,
    duration: newRecord.duration || undefined,
    weather: newRecord.weather,
    temperature: newRecord.temperature,
    humidity: newRecord.humidity,
    cropStatus: newRecord.cropStatus,
    plantHeight: newRecord.plantHeight || undefined,
    leafCount: newRecord.leafCount || undefined,
    status: newRecord.inspectionResult === 'normal' ? 'normal' : 'critical',
    issueCategories: newRecord.issueCategories || [],
    issuePresets: newRecord.issuePresets || [],
    issueText: newRecord.issueText || '',
    issueSeverity: newRecord.issueSeverity || '中等',
    issuePhotos: newRecord.issuePhotos || [],
    feedbackUsers: newRecord.feedbackUsers || [],
    remarks: newRecord.remarks,
    equipmentId: equipmentId || undefined,
    equipmentName: equipmentName || undefined,
    infrastructureId: infrastructureId || undefined,
    infrastructureName: infrastructureName || undefined,
    problemId: newProblemId,
  }

  inspectionRecords.value = [record, ...inspectionRecords.value]
  handleCloseCreateModal()
}

// ============================================
// 批量编辑
// ============================================
function onBatchRecordSelect(id) {
  if (id && !editedRecords.value[id]) {
    const record = filteredRecords.value.find(r => String(r.id) === String(id))
    if (record) {
      editedRecords.value = {
        ...editedRecords.value,
        [id]: {
          greenhouseId: record.greenhouseId || '',
          inspectorId: record.inspectorId || '',
          checkDate: record.checkDate || '',
          status: record.status || '',
        },
      }
    }
  }
}

function handleConfirmBatchEdit() {
  const updatedRecords = [...inspectionRecords.value]
  editedRecordIds.value.forEach(id => {
    const index = updatedRecords.findIndex(r => String(r.id) === String(id))
    if (index !== -1 && editedRecords.value[id]) {
      const record = updatedRecords[index]
      const edits = editedRecords.value[id]
      if (edits.greenhouseId && edits.greenhouseId !== record.greenhouseId) {
        const gh = mockGreenhouses.find(g => g.id === edits.greenhouseId)
        updatedRecords[index] = { ...record, ...edits, greenhouseName: gh?.name || record.greenhouseName }
      } else {
        updatedRecords[index] = { ...record, ...edits }
      }
      if (edits.inspectorId && edits.inspectorId !== record.inspectorId) {
        const user = mockUsers.find(u => u.id === edits.inspectorId)
        updatedRecords[index] = { ...updatedRecords[index], inspectorName: user?.name || record.inspectorName }
      }
    }
  })
  inspectionRecords.value = updatedRecords
  showBatchEditModal.value = false
  cancelBatchEdit()
}

// ============================================
// 批量删除
// ============================================
function handleConfirmBatchDelete() {
  const idsToDelete = new Set(selectedIds.value)
  inspectionRecords.value = inspectionRecords.value.filter(r => !idsToDelete.has(String(r.id)))
  emit('batchDelete', [...idsToDelete])
  showDeleteWarning.value = false
  emit('toggleBatchDeleteMode')
  emit('clearSelection')
}

// ============================================
// 导出
// ============================================
function handleConfirmExport() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要导出的记录')
    return
  }
  showExportModal.value = true
}

function handleDoExport() {
  const selectedData = filteredRecords.value.filter((_, index) => props.selectedRows.includes(index))
  const headers = ['巡查编号', '巡查类型', '巡查人员', '位置/对象', '巡查日期', '天气', '温度(°C)', '湿度(%)', '发现问题', '问题照片', '问题处理', '状态']
  const exportData = selectedData.map(row => ({
    '巡查编号': row.recordCode,
    '巡查类型': getTypeLabel(row.inspectionType),
    '巡查人员': row.inspectorName,
    '位置/对象': getLocationText(row),
    '巡查日期': row.checkDate,
    '天气': row.weather,
    '温度(°C)': row.temperature,
    '湿度(%)': row.humidity,
    '发现问题': (row.issues && row.issues.length > 0) ? row.issues.join('; ') : '-',
    '问题照片': (row.issuePhotos && row.issuePhotos.length > 0) ? `有${row.issuePhotos.length}张照片` : '-',
    '问题处理': row.issueStatus === 'resolved' ? '已解决' : row.issueStatus === 'processing' ? '处理中' : row.issueStatus === 'pending' ? '待处理' : '-',
    '状态': STATUS_CONFIG[row.status]?.label || '-',
  }))

  let content = ''
  let mimeType = ''
  let extension = ''

  if (exportFormat.value === 'csv') {
    content = headers.join(',') + '\n' + exportData.map(row =>
      headers.map(h => `"${row[h] || ''}"`).join(',')
    ).join('\n')
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFormat.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  } else if (exportFormat.value === 'word') {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">${headers.map(h => `<th>${h}</th>`).join('')}${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-word;charset=utf-8'
    extension = 'doc'
  }

  const blob = new Blob(['﻿' + content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `巡查记录_${new Date().toISOString().slice(0, 10)}.${extension}`
  a.click()
  URL.revokeObjectURL(url)

  emit('toggleExportMode')
  emit('clearSelection')
  showExportModal.value = false
  ElMessage.success('导出成功')
}

// ============================================
// 问题验收
// ============================================
function closeAcceptance() {
  acceptanceModal.isOpen = false
  acceptanceModal.problemId = null
}

function handleApproveAcceptance() {
  if (!acceptanceModal.problemId) return
  const problem = mockProblems.find(p => p.id === acceptanceModal.problemId)
  if (problem) {
    problem.status = '已处理'
    problem.flowRecords.push({
      id: `FR-${Date.now()}`,
      operatorId: 'U001',
      operatorName: '系统管理员',
      action: 'approve',
      fromStatus: '待验收',
      toStatus: '已处理',
      actionTime: new Date().toISOString(),
      comment: '验收通过',
    })
  }
  ElMessage.success('验收通过')
  closeAcceptance()
}

function handleRejectAcceptance() {
  ElMessageBox.prompt('请输入返工原因', '返工确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'textarea',
  }).then(({ value }) => {
    if (value && acceptanceModal.problemId) {
      const problem = mockProblems.find(p => p.id === acceptanceModal.problemId)
      if (problem) {
        problem.reworkCount = (problem.reworkCount || 0) + 1
        if (problem.reworkCount >= 2) {
          problem.status = '待处理'
        } else {
          problem.status = '处理中'
        }
        problem.flowRecords.push({
          id: `FR-${Date.now()}`,
          operatorId: 'U001',
          operatorName: '系统管理员',
          action: 'reject_acceptance',
          fromStatus: '待验收',
          toStatus: problem.status,
          actionTime: new Date().toISOString(),
          comment: value,
        })
      }
      ElMessage.warning('已发起返工')
      closeAcceptance()
    }
  }).catch(() => {})
}

// ============================================
// 工具方法
// ============================================
function getTypeLabel(type) {
  const map = { farm: '种植巡查', equipment: '设备巡查', infrastructure: '设施巡查', other: '其他巡查' }
  return map[type] || type
}

function getTypeBadgeClass(type) {
  const map = {
    farm: 'px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full',
    equipment: 'px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full',
    infrastructure: 'px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full',
    other: 'px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full',
  }
  return map[type] || 'px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full'
}

function getLocationText(record) {
  if (record.inspectionType === 'farm') return record.greenhouseName || '-'
  if (record.inspectionType === 'equipment') return record.equipmentName || '-'
  if (record.inspectionType === 'infrastructure') return record.infrastructureName || '-'
  return record.remarks || '-'
}

function getStatusBadgeClass(status) {
  const map = {
    normal: 'px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full',
    attention: 'px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full',
    warning: 'px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full',
    critical: 'px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full',
  }
  return map[status] || 'px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full'
}

function formatFlowTime(timeStr) {
  if (!timeStr) return ''
  return new Date(timeStr).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function getFlowActionLabel(action) {
  const map = {
    report: '上报问题', dispatch: '分派任务', accept: '接单', reject: '拒绝',
    submit: '提交反馈', approve: '验收通过', reject_acceptance: '验收返工',
  }
  return map[action] || action
}
</script>
