<template>
  <!--
    巡查记录Tab - V1.1 InspectionTab.tsx 1:1迁移
    - UI: 14列表格（巡查编号/类型/提交人/位置/日期/结果/问题分类/严重程度/反馈状态/反馈人员/处理进度/操作/备注）
    - 后端: 7 store接入(inspection/user/greenhouse/iot/equipment/infrastructure/problem)
    - 状态机: 正常/需关注/异常 + 验收通过/驳回返工
  -->
  <div class="space-y-4">
    <!-- 搜索栏 - V1.1 line 887-896 -->
    <InspectionSearch
      :filters="localFilters"
      :on-filters-change="handleFiltersChange"
      :on-search="() => {}"
      :on-reset="handleResetFilters"
    />

    <!-- 工具栏 + 表格 - V1.1 line 899-924 -->
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

      <!-- 巡查记录表格 - V1.1 InspectionTable.tsx line 170-477 -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <tr>
              <th v-if="exportMode || batchEditMode || batchDeleteMode" class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap w-12">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  class="w-4 h-4 rounded border-gray-400 text-emerald-600 focus:ring-emerald-500"
                  @change="handleSelectAll"
                />
              </th>
              <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">巡查编号</th>
              <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">巡查类型</th>
              <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">提交人</th>
              <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">位置/对象</th>
              <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">巡查日期</th>
              <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">巡查结果</th>
              <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">问题分类</th>
              <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">严重程度</th>
              <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">反馈状态</th>
              <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">反馈人员</th>
              <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">处理进度</th>
              <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">操作</th>
              <th class="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">备注</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr
              v-for="(record, idx) in paginatedRecords"
              :key="record.id"
              class="hover:bg-blue-100 transition-colors"
            >
              <!-- 选择框 -->
              <td v-if="exportMode || batchEditMode || batchDeleteMode" class="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  :checked="isRowSelected(idx)"
                  class="w-4 h-4 rounded border-gray-400 text-emerald-600 focus:ring-emerald-500"
                  @change="() => handleToggleRow(idx)"
                />
              </td>
              <!-- 巡查编号 - V1.1 line 213-222 -->
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                <el-button type="primary" link size="small" class="font-medium h-6" @click="handleViewDetail(record)">
                  {{ record.recordCode }}
                </el-button>
              </td>
              <!-- 巡查类型 - V1.1 line 223-239 -->
              <td class="px-4 py-3 text-center">
                <span v-if="record.inspectionType === 'farm'" class="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">种植</span>
                <span v-else-if="record.inspectionType === 'equipment'" class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">设备</span>
                <span v-else-if="record.inspectionType === 'infrastructure'" class="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">设施</span>
                <span v-else-if="record.inspectionType === 'other'" class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">其他</span>
                <span v-else class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">-</span>
              </td>
              <!-- 提交人 - V1.1 line 240-242 -->
              <td class="px-4 py-3 text-sm text-center text-gray-600 whitespace-nowrap">
                <span class="font-medium text-gray-900 truncate block" :title="record.inspectorName">{{ record.inspectorName }}</span>
              </td>
              <!-- 位置/对象 - V1.1 line 243-260 -->
              <td class="px-4 py-3 text-sm text-gray-600 min-w-[10em] max-w-[15em]">
                <div class="flex items-center gap-1 overflow-hidden">
                  <el-icon class="text-emerald-600 flex-shrink-0"><Location /></el-icon>
                  <span class="text-gray-900 truncate block" :title="getLocationTitle(record)">
                    <span v-if="record.inspectionType === 'farm'">{{ record.greenhouseName }}</span>
                    <span v-else-if="record.inspectionType === 'equipment'">{{ record.equipmentName }}</span>
                    <span v-else-if="record.inspectionType === 'infrastructure'">{{ record.infrastructureName }}</span>
                    <span v-else-if="record.inspectionType === 'other'">{{ record.remarks }}</span>
                    <span v-else>{{ record.greenhouseName || '-' }}</span>
                  </span>
                </div>
              </td>
              <!-- 巡查日期 - V1.1 line 261 -->
              <td class="px-4 py-3 text-sm text-center text-gray-600 whitespace-nowrap">{{ record.checkDate }}</td>
              <!-- 巡查结果 - V1.1 line 262-268 -->
              <td class="px-4 py-3 text-center">
                <span v-if="record.status === 'normal'" class="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">正常</span>
                <span v-else-if="record.status === 'attention'" class="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">需关注</span>
                <span v-else-if="record.status === 'warning'" class="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">注意</span>
                <span v-else-if="record.status === 'critical'" class="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">异常</span>
                <span v-else class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">未知</span>
              </td>
              <!-- 问题分类 - V1.1 line 269-303 -->
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                <div v-if="record.issueCategories && record.issueCategories.length > 0" class="flex gap-1 justify-center flex-wrap">
                  <span
                    v-for="(cat, i) in record.issueCategories.slice(0, 2)"
                    :key="i"
                    class="px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full"
                  >{{ getIssueCategoryLabel(cat) }}</span>
                  <span v-if="record.issueCategories.length > 2" class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">+{{ record.issueCategories.length - 2 }}</span>
                </div>
                <div v-else-if="record.issuePresets && record.issuePresets.length > 0" class="flex gap-1 justify-center flex-wrap">
                  <span
                    v-for="(preset, i) in record.issuePresets.slice(0, 2)"
                    :key="i"
                    class="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded-full"
                  >{{ preset }}</span>
                  <span v-if="record.issuePresets.length > 2" class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">+{{ record.issuePresets.length - 2 }}</span>
                </div>
                <span v-else class="text-sm text-gray-500">-</span>
              </td>
              <!-- 严重程度 - V1.1 line 304-316 -->
              <td class="px-4 py-3 text-center">
                <span
                  v-if="record.issueSeverity"
                  class="px-2 py-1 text-xs rounded-full"
                  :class="getIssueSeverityClass(record.issueSeverity)"
                >{{ record.issueSeverity }}</span>
                <span v-else class="text-sm text-gray-500">-</span>
              </td>
              <!-- 反馈状态 - V1.1 line 318-352 -->
              <td class="px-4 py-3 text-center">
                <template v-if="getProblemForRecord(record)?.flowRecords">
                  <template v-if="getSubmitFeedbackRecord(getProblemForRecord(record))">
                    <div class="flex items-center justify-center gap-1">
                      <span v-if="parseFeedback(getSubmitFeedbackRecord(getProblemForRecord(record)).feedbackData)?.gpsLocation" title="GPS已打卡" class="text-emerald-600">📍</span>
                      <span v-if="parseFeedback(getSubmitFeedbackRecord(getProblemForRecord(record)).feedbackData)?.photosBefore?.length" :title="`作业前照片${parseFeedback(getSubmitFeedbackRecord(getProblemForRecord(record)).feedbackData).photosBefore.length}张`" class="text-blue-600">📷</span>
                      <span v-if="parseFeedback(getSubmitFeedbackRecord(getProblemForRecord(record)).feedbackData)?.photosAfter?.length" :title="`作业后照片${parseFeedback(getSubmitFeedbackRecord(getProblemForRecord(record)).feedbackData).photosAfter.length}张`" class="text-orange-600">📷</span>
                      <span v-if="parseFeedback(getSubmitFeedbackRecord(getProblemForRecord(record)).feedbackData)?.materialCode" title="物资已扫码" class="text-purple-600">📦</span>
                      <span v-if="parseFeedback(getSubmitFeedbackRecord(getProblemForRecord(record)).feedbackData)?.voiceNote" title="语音备注" class="text-red-600">🎤</span>
                    </div>
                  </template>
                  <span v-else class="text-gray-300">-</span>
                </template>
                <span v-else class="text-gray-300">-</span>
              </td>
              <!-- 反馈人员 - V1.1 line 353-371 -->
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                <span v-if="record.feedbackUsers && record.feedbackUsers.length > 0" class="text-gray-700" :title="record.feedbackUsers.join('、')">
                  <template v-if="record.feedbackUsers.length <= 2">
                    {{ getFeedbackUserNames(record.feedbackUsers) }}
                  </template>
                  <template v-else>
                    {{ getFeedbackUserNames([record.feedbackUsers[0]]) }}等{{ record.feedbackUsers.length }}人
                  </template>
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <!-- 处理进度 - V1.1 line 373-398 -->
              <td class="px-4 py-3 text-center">
                <template v-if="getProblemForRecord(record)">
                  <div class="flex items-center justify-center gap-1">
                    <div class="w-12 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        class="h-full rounded-full"
                        :class="getProgressBarClass(getProblemForRecord(record).status)"
                        :style="{ width: `${getProblemProgress(getProblemForRecord(record))}%` }"
                      ></div>
                    </div>
                    <span class="text-xs text-gray-500">{{ getProblemProgress(getProblemForRecord(record)) }}%</span>
                  </div>
                </template>
                <span v-else class="text-gray-400 text-xs">-</span>
              </td>
              <!-- 操作 - V1.1 line 400-443 -->
              <td class="px-4 py-3 text-center whitespace-nowrap">
                <template v-if="getProblemForRecord(record)">
                  <template v-if="canAccept(getProblemForRecord(record))">
                    <el-button type="primary" size="small" class="h-6" @click="handleOpenAcceptance(getProblemForRecord(record))">
                      <el-icon><CircleCheck /></el-icon> 验收
                    </el-button>
                  </template>
                  <template v-else>
                    <span
                      class="text-xs font-medium"
                      :class="getOperationStatusClass(getProblemForRecord(record).status)"
                    >{{ getOperationStatusLabel(getProblemForRecord(record).status) }}</span>
                  </template>
                </template>
                <span v-else class="text-gray-400 text-xs">-</span>
              </td>
              <!-- 备注 - V1.1 line 444-448 -->
              <td class="px-4 py-3 text-sm text-gray-600 max-w-[10em]">
                <span v-if="record.remarks" class="truncate block" :title="record.remarks">
                  {{ record.remarks.length > 10 ? record.remarks.slice(0, 10) + '...' : record.remarks }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
            </tr>
            <tr v-if="paginatedRecords.length === 0">
              <td :colspan="13" class="px-4 py-12 text-center text-gray-400">
                暂无巡查记录
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 - V1.1 line 468-476 -->
      <div v-if="totalPages > 1" class="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
        <span class="text-sm text-gray-500">共 {{ filteredRecords.length }} 条</span>
        <div class="flex items-center gap-2">
          <el-button size="small" :disabled="currentPage <= 1" @click="emit('pageChange', currentPage - 1)">上一页</el-button>
          <span class="text-sm text-gray-600">第 {{ currentPage }}/{{ totalPages }} 页</span>
          <el-button size="small" :disabled="currentPage >= totalPages" @click="emit('pageChange', currentPage + 1)">下一页</el-button>
        </div>
      </div>
    </div>

    <!-- 新建弹窗 - V1.1 line 962-979 -->
    <CreateInspectionModal
      v-if="isCreateModalOpen"
      :is-open="isCreateModalOpen"
      :on-close="handleCloseCreateModal"
      :on-submit="handleCreateRecord"
      :new-record="newRecord"
      :on-new-record-change="setNewRecord"
      :errors="errors"
      :generate-record-code="generateRecordCode"
      :on-image-upload="handleImageUpload"
      :on-remove-image="removeImage"
      :greenhouses="storeGreenhouses"
      :users="storeUsers"
      :crop-types="cropTypes"
      :crop-batches="cropBatches"
      :equipment-records="equipmentList"
      :infrastructure-records="infrastructureList"
      :on-open-q-r-scanner="() => isQRScannerOpen = true"
    />

    <!-- 详情弹窗 - V1.1 line 982-989 -->
    <DetailInspectionModal
      v-if="detailRecord"
      :is-open="!!detailRecord"
      :on-close="() => emit('closeDetail')"
      :record="detailRecord"
      :on-accept-problem="(problemId) => acceptanceModal = { isOpen: true, problemId }"
      :problem-data="detailProblemData"
      :problem-flow-records="detailFlowRecords"
      :users="storeUsers"
    />

    <!-- 批量编辑弹窗 - V1.1 line 992-1008 -->
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
              v-for="rid in selectedIds"
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
              <el-option v-for="gh in storeGreenhouses" :key="gh.id" :value="gh.id" :label="gh.name" />
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
              <el-option v-for="u in storeUsers" :key="u.id" :value="u.id" :label="u.name" />
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
      </div>
      <template #footer>
        <el-button @click="showBatchEditModal = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmBatchEdit">确认编辑</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 - V1.1 line 1011-1016 -->
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

    <!-- 导出格式弹窗 - V1.1 line 1019-1068 -->
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

    <!-- 问题验收弹窗 - V1.1 line 1078-1102 -->
    <InspectionAcceptanceModal
      v-if="acceptanceModal.isOpen && acceptanceProblem"
      :is-open="acceptanceModal.isOpen"
      :problem="acceptanceProblem"
      :records="acceptanceProblem.flowRecords || []"
      :is-loading-records="false"
      :on-accept="handleApproveAcceptance"
      :on-reject="handleRejectAcceptance"
      :on-close="closeAcceptance"
    />
  </div>
</template>

<script>
// 模块级常量（V1.1 line 45-53）
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
/**
 * 巡查记录Tab - V1.1 InspectionTab.tsx 1:1迁移
 * UI 14列对齐 + 后端 7 store 接入 + 状态机正常/需关注/异常 + 验收/驳回
 */
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  WarningFilled, CircleCheck, Location,
} from '@element-plus/icons-vue'
import { useInspectionDataStore } from '@/stores/modules/inspectionData'
import { useProblemStore } from '@/stores/modules/problem'
import { useUserStore } from '@/stores/modules/user'
import { useGreenhouseStore } from '@/stores/modules/greenhouse'
import { useIotStore } from '@/stores/modules/iot'
import { useProductionPlanStore } from '@/stores/modules/productionPlan'
import { useFarmTaskStore } from '@/stores/modules/farmTask'
import { useDictionaryStore } from '@/stores/modules/dictionary'
import InspectionSearch from './InspectionSearch.vue'
import InspectionToolbar from './InspectionToolbar.vue'
// V2.0 已存在的模态组件（路径修正：原 modals/ 子目录无此文件，根目录已有）
import CreateInspectionModal from './CreateInspectionModal.vue'
import DetailInspectionModal from './DetailInspectionModal.vue'
// V1.1 InspectionAcceptanceModal.tsx 1:1迁移
import InspectionAcceptanceModal from './modals/InspectionAcceptanceModal.vue'

// ============================================
// 状态配置（V1.1 line 38-42, line 80-93）
// ============================================
// 巡查结果状态
const STATUS_CONFIG = {
  normal: { label: '正常' },
  attention: { label: '需关注' },
  critical: { label: '异常' },
}

// 问题状态映射（V1.1 line 404-419）
const PROBLEM_STATUS_MAP = {
  '待处理': '待处理',
  '处理中': '处理中',
  '待验收': '待验收',
  '已处理': '已处理',
  'pending': '待处理',
  'processing': '处理中',
  'waiting_acceptance': '待验收',
  'waitingAcceptance': '待验收',
  'pending_acceptance': '待验收',
  'pendingAcceptance': '待验收',
  'resolved': '已解决',
  'completed': '已完成',
  'completed_success': '已完成',
  'completedSuccess': '已完成',
}

// 问题状态→进度（V1.1 line 152-158）
const STATUS_PROGRESS_MAP = {
  '待处理': 0, 'pending': 0,
  '处理中': 50, 'in_progress': 50, 'processing': 50,
  '待验收': 100, 'waiting_acceptance': 100, 'waitingAcceptance': 100, 'pending_acceptance': 100, 'pendingAcceptance': 100,
  '已处理': 100, 'completed': 100, 'resolved': 100,
}

// 可验收状态（V1.1 line 165）
const ACCEPT_STATUSES = ['待验收', 'waiting_acceptance', 'waitingAcceptance', 'pending_acceptance', 'pendingAcceptance']

// 问题分类映射（V1.1 line 273-280）
const ISSUE_CATEGORY_LABELS = {
  disease: '病害',
  pest: '虫害',
  environment: '环境',
  growth: '长势',
  equipment: '设备',
  other: '其他',
}

// 进度条颜色（V1.1 line 380-385）
const PROGRESS_COLOR_MAP = {
  '待处理': 'bg-gray-400',
  '处理中': 'bg-blue-500',
  '待验收': 'bg-amber-500',
  '已处理': 'bg-green-500',
}

// 导出格式
const exportFormats = [
  { value: 'excel', label: 'Excel 文件 (.xls)', icon: '📊' },
  { value: 'csv', label: 'CSV 文件 (.csv)', icon: '📄' },
  { value: 'word', label: 'Word 文件 (.doc)', icon: '📝' },
]

// ============================================
// Props（V1.1 line 55-100）
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
// Store 接入（V1.1 line 138-153）— 7 store
// ============================================
const inspectionStore = useInspectionDataStore()
const userStore = useUserStore()
const greenhouseStore = useGreenhouseStore()
const problemStore = useProblemStore()
const iotStore = useIotStore()
const planStore = useProductionPlanStore()
const taskStore = useFarmTaskStore()
const dictionaryStore = useDictionaryStore()

// 真实 store 数据（V1.1 line 138-153）
const storeGreenhouses = computed(() => greenhouseStore.greenhouses || [])
const storeUsers = computed(() => userStore.users || [])
const storeDevices = computed(() => iotStore.devices || [])
// equipment/infrastructure 当前 V2.0 暂无独立 store，使用 mock 兜底
const equipmentList = ref([
  { id: 'EQ001', name: '自动灌溉系统A', location: 'A1温室', greenhouseId: 'GH001' },
  { id: 'EQ002', name: '通风设备B', location: 'B2温室', greenhouseId: 'GH002' },
])
const infrastructureList = ref([
  { id: 'IF001', name: '遮阳网系统', type: '遮阳', greenhouseId: 'GH001', location: 'A1温室' },
  { id: 'IF002', name: '加温管道', type: '加温', greenhouseId: 'GH002', location: 'B2温室' },
])

// 作物类型（V1.1 line 192-195）— 从字典获取（V2.0 dictionaryStore 提供 dictionaries）
const cropTypes = computed(() => {
  try {
    const list = dictionaryStore.dictionaries || []
    return list
      .filter(d => d.category === 'crop_category')
      .map(d => ({ value: d.dictLabel || d.label, label: d.dictLabel || d.label, name: d.dictLabel || d.label }))
  } catch {
    return [{ id: 'c1', name: '番茄' }, { id: 'c2', name: '黄瓜' }, { id: 'c3', name: '辣椒' }]
  }
})

// 作物批次（V1.1 line 180-190）— 从生产计划 store
const cropBatches = computed(() => {
  const batches = planStore.batches || []
  return batches.map(p => ({
    id: p.id,
    batchCode: p.batchCode,
    cropName: p.cropName || p.cropTypeName,
    status: p.batchStatus || p.status,
  }))
})

// 问题合并（V1.1 line 230-234）— 真实 store 优先，否则 props
const mergedProblems = computed(() => {
  if (problemStore.problems && problemStore.problems.length > 0) {
    return problemStore.problems
  }
  return props.problems || []
})

// 默认巡查人员（V1.1 line 240-244）
const defaultInspector = computed(() => {
  return storeUsers.value[0] || { id: 'U001', name: '待分配' }
})

// 巡查记录（V1.1 line 198-223）— 真实 store 优先
const inspectionRecords = computed(() => {
  if (inspectionStore.records && inspectionStore.records.length > 0) {
    return [...inspectionStore.records].sort((a, b) =>
      new Date(b.createdAt || b.createTime || 0).getTime() -
      new Date(a.createdAt || a.createTime || 0).getTime()
    )
  }
  return [...(props.inspections || [])].sort((a, b) =>
    new Date(b.createdAt || b.createTime || 0).getTime() -
    new Date(a.createdAt || a.createTime || 0).getTime()
  )
})

// ============================================
// 组件挂载时加载真实数据（V1.1 line 155-177）
// ============================================
onMounted(() => {
  // 巡查数据
  if (inspectionStore.records && inspectionStore.records.length === 0) {
    inspectionStore.fetchRecords()
  }
  // 用户
  if (storeUsers.value.length === 0 && typeof userStore.loadUsers === 'function') {
    userStore.loadUsers()
  }
  // 温室
  if (storeGreenhouses.value.length === 0 && typeof greenhouseStore.loadGreenhouses === 'function') {
    greenhouseStore.loadGreenhouses()
  }
  // 问题
  if (problemStore.problems && problemStore.problems.length === 0 && typeof problemStore.fetchProblems === 'function') {
    problemStore.fetchProblems()
  }
  // 物联网
  if (storeDevices.value.length === 0 && typeof iotStore.fetchDevices === 'function') {
    iotStore.fetchDevices()
  }
  // 生产计划（用于作物批次）
  if (planStore.batches && planStore.batches.length === 0 && typeof planStore.fetchPlans === 'function') {
    planStore.fetchPlans()
  }
  // 字典
  if (dictionaryStore.dictionaries && dictionaryStore.dictionaries.length === 0 && typeof dictionaryStore.loadDictionaries === 'function') {
    dictionaryStore.loadDictionaries()
  }
})

// ============================================
// 本地状态（V1.1 line 247-309）
// ============================================
const localFilters = reactive({ ...INITIAL_FILTERS, ...props.filters })
watch(() => props.filters, (val) => {
  if (val) Object.assign(localFilters, val)
}, { deep: true })

const showBatchEditModal = ref(false)
const showDeleteWarning = ref(false)
const showExportModal = ref(false)
const exportFormat = ref('excel')
const isQRScannerOpen = ref(false)
const editedRecordIds = ref([])
const editedRecords = ref({})
const selectedRecordId = ref('')

function getDefaultNewRecord() {
  return {
    recordCode: '',
    inspectionType: 'farm',
    greenhouseId: '',
    cropName: '',
    inspectorId: defaultInspector.value.id,
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

const newRecord = reactive(getDefaultNewRecord())
const errors = reactive({})

const acceptanceModal = reactive({ isOpen: false, problemId: null })

// ============================================
// 计算属性（V1.1 line 380-439）
// ============================================
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

const filteredRecords = computed(() => {
  return inspectionRecords.value.filter(record => {
    if (localFilters.recordCode && !record.recordCode?.toLowerCase().includes(localFilters.recordCode.toLowerCase())) return false
    if (localFilters.inspectorName && !record.inspectorName?.toLowerCase().includes(localFilters.inspectorName.toLowerCase())) return false
    if (localFilters.inspectionType !== 'all' && record.inspectionType !== localFilters.inspectionType) return false
    if (localFilters.startDate && record.checkDate < localFilters.startDate) return false
    if (localFilters.endDate && record.checkDate > localFilters.endDate) return false
    if (localFilters.status !== 'all' && record.status !== localFilters.status) return false
    if (localFilters.problemStatus !== 'all') {
      const problem = mergedProblems.value.find(p => p.id === record.problemId)
      const mappedStatus = localFilters.problemStatus
      if (mappedStatus && problem?.status !== mappedStatus) return false
    }
    return true
  })
})

const paginatedRecords = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize
  return filteredRecords.value.slice(start, start + props.pageSize)
})

const totalPages = computed(() => Math.ceil(filteredRecords.value.length / props.pageSize) || 1)

const selectedIds = computed(() => {
  return props.selectedRows.map(idx => paginatedRecords.value[idx]?.id).filter(Boolean)
})

const isAllSelected = computed(() => {
  return paginatedRecords.value.length > 0 && props.selectedRows.length === paginatedRecords.value.length
})

const isIndeterminate = computed(() => {
  return props.selectedRows.length > 0 && props.selectedRows.length < paginatedRecords.value.length
})

const detailRecord = computed(() => {
  return inspectionRecords.value.find(r => String(r.id) === String(props.detailRecordId)) || null
})

const detailProblemData = computed(() => {
  if (!detailRecord.value?.problemId) return null
  return mergedProblems.value.find(p => p.id === detailRecord.value.problemId) || null
})

const detailFlowRecords = computed(() => detailProblemData.value?.flowRecords || [])

const acceptanceProblem = computed(() => {
  return mergedProblems.value.find(p => p.id === acceptanceModal.problemId) || null
})

// ============================================
// 筛选与选择方法（V1.1 line 887-924）
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
// 问题查找辅助（V1.1 line 131-159）
// ============================================
function getProblemForRecord(record) {
  if (!record?.problemId) return undefined
  return mergedProblems.value.find(p => p.id === record.problemId)
}

function getSubmitFeedbackRecord(problem) {
  if (!problem?.flowRecords) return null
  return [...(problem.flowRecords || [])].reverse().find(r => r.action === 'submit' && r.feedbackData) || null
}

function parseFeedback(feedback) {
  if (!feedback) return null
  let parsed = feedback
  if (typeof feedback === 'string') {
    try { parsed = JSON.parse(feedback) } catch { return null }
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  return parsed
}

function getProblemProgress(problem) {
  if (!problem) return 0
  return STATUS_PROGRESS_MAP[problem.status] ?? 0
}

function canAccept(problem) {
  if (!problem) return false
  return ACCEPT_STATUSES.includes(problem.status)
}

function getOperationStatusLabel(status) {
  return PROBLEM_STATUS_MAP[status] || status || '-'
}

function getOperationStatusClass(status) {
  if (status === '已处理' || status === 'resolved' || status === 'completed') {
    return 'text-green-500'
  }
  if (status === '待验收' || ACCEPT_STATUSES.includes(status)) {
    return 'text-amber-500'
  }
  return 'text-blue-500'
}

function getProgressBarClass(status) {
  return PROGRESS_COLOR_MAP[status] || 'bg-gray-400'
}

function getIssueCategoryLabel(cat) {
  return ISSUE_CATEGORY_LABELS[cat] || cat
}

function getIssueSeverityClass(severity) {
  if (severity === '严重') return 'bg-red-100 text-red-700'
  if (severity === '中等') return 'bg-amber-100 text-amber-700'
  return 'bg-gray-100 text-gray-700'
}

function getFeedbackUserNames(ids) {
  return ids.map(id => {
    const user = storeUsers.value.find(u => u.id === id)
    return user ? user.name : id
  }).join('、')
}

function getLocationTitle(record) {
  if (record.inspectionType === 'farm') return record.greenhouseName
  if (record.inspectionType === 'equipment') return record.equipmentName
  if (record.inspectionType === 'infrastructure') return record.infrastructureName
  if (record.inspectionType === 'other') return record.remarks
  return record.greenhouseName || '-'
}

// ============================================
// 查看详情（V1.1 line 952）
// ============================================
function handleViewDetail(record) {
  emit('viewDetail', String(record.id))
}

// ============================================
// 新建巡查（V1.1 line 562-702）
// ============================================
function generateRecordCode() {
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')
  const todayRecords = inspectionRecords.value.filter(r => r.recordCode?.includes(dateStr))
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
  newRecord.inspectorId = newRecord.inspectorId || defaultInspector.value.id
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

async function handleCreateRecord() {
  if (!validateForm()) return
  const selectedUser = storeUsers.value.find(u => u.id === newRecord.inspectorId)
  const selectedBatch = cropBatches.value.find(b => b.id === newRecord.batchId)

  let greenhouseId = ''
  let greenhouseName = ''
  let cropName = ''
  let equipmentId = ''
  let equipmentName = ''
  let infrastructureId = ''
  let infrastructureName = ''

  if (newRecord.inspectionType === 'farm') {
    const gh = storeGreenhouses.value.find(g => g.id === newRecord.greenhouseId)
    greenhouseId = newRecord.greenhouseId
    greenhouseName = gh?.name || ''
    cropName = newRecord.cropName
  } else if (newRecord.inspectionType === 'equipment') {
    const eq = equipmentList.value.find(e => e.id === newRecord.equipmentId)
    greenhouseId = eq?.greenhouseId || ''
    greenhouseName = eq?.location || ''
    equipmentId = newRecord.equipmentId
    equipmentName = eq?.name || ''
  } else if (newRecord.inspectionType === 'infrastructure') {
    const inf = infrastructureList.value.find(i => i.id === newRecord.infrastructureId)
    greenhouseId = inf?.greenhouseId || ''
    greenhouseName = inf?.location || ''
    infrastructureId = newRecord.infrastructureId
    infrastructureName = inf?.name || ''
  }

  // 异常 → 自动创建问题（V1.1 line 596-654）
  let newProblemId = undefined
  if (newRecord.feedbackRequired && newRecord.feedbackUsers.length > 0 && newRecord.inspectionResult === 'abnormal') {
    const presetIssues = (newRecord.issuePresets || []).join('、')
    const issueText = presetIssues + (newRecord.issueText ? (presetIssues ? '；' + newRecord.issueText : newRecord.issueText) : '')

    let severity = newRecord.issueSeverity || '中等'
    if (!newRecord.issueSeverity) {
      const allText = issueText + newRecord.issueText
      if (allText.includes('严重') || allText.includes('灰霉') || allText.includes('病毒')) severity = '严重'
      else if (allText.includes('蚜虫') || allText.includes('病') || allText.includes('虫')) severity = '中等'
    }

    // 通过 problemStore 真实 API 创建问题（V1.1 line 618-650）
    const createdProblem = await problemStore.createProblem({
      problem_code: `PD${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Date.now()).slice(-3)}`,
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
      issueText: issueText || newRecord.issueText || '未描述具体问题',
      issueSeverity: severity,
      status: '待处理',
      remarks: newRecord.remarks,
      sourceModule: 'inspection',
      sourceId: newRecord.recordCode,
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
    })
    if (createdProblem) {
      newProblemId = createdProblem.id
    }
  }

  const record = {
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

  // 通过 inspectionStore 真实 API 创建巡查记录
  handleCloseCreateModal()
  inspectionStore.createRecord(record).then(() => {
    inspectionStore.fetchRecords()
  }).catch(() => {})
}

// ============================================
// 批量编辑（V1.1 line 790-828）
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

async function handleConfirmBatchEdit() {
  for (const id of editedRecordIds.value) {
    if (editedRecords.value[id]) {
      const record = inspectionRecords.value.find(r => String(r.id) === String(id))
      const edits = editedRecords.value[id]
      const updates = { ...edits }
      if (edits.greenhouseId && edits.greenhouseId !== record?.greenhouseId) {
        const gh = storeGreenhouses.value.find(g => g.id === edits.greenhouseId)
        updates.greenhouseName = gh?.name || record?.greenhouseName
      }
      if (edits.inspectorId && edits.inspectorId !== record?.inspectorId) {
        const user = storeUsers.value.find(u => u.id === edits.inspectorId)
        updates.inspectorName = user?.name || record?.inspectorName
      }
      await inspectionStore.updateRecord(id, updates).catch(() => {})
    }
  }
  showBatchEditModal.value = false
  cancelBatchEdit()
}

// ============================================
// 批量删除（V1.1 line 831-852）
// ============================================
async function handleConfirmBatchDelete() {
  const idsToDelete = new Set(selectedIds.value)
  for (const id of idsToDelete) {
    await inspectionStore.deleteRecord(id).catch(() => {})
  }
  emit('batchDelete', [...idsToDelete])
  showDeleteWarning.value = false
  emit('toggleBatchDeleteMode')
  emit('clearSelection')
}

// ============================================
// 导出（V1.1 line 705-787）
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
    '巡查类型': row.inspectionType === 'farm' ? '种植' : row.inspectionType === 'equipment' ? '设备' : row.inspectionType === 'infrastructure' ? '设施' : row.inspectionType === 'other' ? '其他' : '-',
    '巡查人员': row.inspectorName,
    '位置/对象': getLocationTitle(row),
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
// 问题验收（V1.1 line 855-879）
// ============================================
function handleOpenAcceptance(problem) {
  acceptanceModal.isOpen = true
  acceptanceModal.problemId = problem.id
}

function closeAcceptance() {
  acceptanceModal.isOpen = false
  acceptanceModal.problemId = null
}

async function handleApproveAcceptance(comment) {
  if (!acceptanceModal.problemId) return
  // 通过 problemStore 真实 API 更新状态为已处理
  await problemStore.updateProblem(acceptanceModal.problemId, {
    status: '已处理',
    handleResult: comment || '验收通过',
    flowRecords: [
      ...(acceptanceProblem.value?.flowRecords || []),
      {
        id: `FR-${Date.now()}`,
        operatorId: 'U001',
        operatorName: '系统管理员',
        action: 'approve',
        fromStatus: '待验收',
        toStatus: '已处理',
        actionTime: new Date().toISOString(),
        comment: comment || '验收通过',
      },
    ],
  })
  ElMessage.success('验收通过')
  problemStore.fetchProblems()
  closeAcceptance()
}

async function handleRejectAcceptance(reason) {
  if (!acceptanceModal.problemId) return
  const problem = acceptanceProblem.value
  const newReworkCount = (problem?.reworkCount || 0) + 1
  // reworkCount >= 2 → 待处理；否则处理中（V1.1 line 869-879）
  const newStatus = newReworkCount >= 2 ? '待处理' : '处理中'
  await problemStore.updateProblem(acceptanceModal.problemId, {
    status: newStatus,
    reworkCount: newReworkCount,
    flowRecords: [
      ...(problem?.flowRecords || []),
      {
        id: `FR-${Date.now()}`,
        operatorId: 'U001',
        operatorName: '系统管理员',
        action: 'reject_acceptance',
        fromStatus: '待验收',
        toStatus: newStatus,
        actionTime: new Date().toISOString(),
        comment: reason,
      },
    ],
  })
  ElMessage.warning('已发起返工')
  problemStore.fetchProblems()
  closeAcceptance()
}
</script>
