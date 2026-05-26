<template>
  <!-- 农事操作记录页面 - 从V1.1 AgricultureRecordPage.tsx 1:1迁移 -->
  <div class="space-y-6">
    <!-- Page Header -->
    <AgricultureRecordPageHeader :stats="stats" />

    <!-- 筛选工具栏 -->
    <AgricultureRecordFilterToolbar
      :filters="filters"
      @update:filters="setFilters"
      @reset="handleReset"
      @add="showAddModal = true"
      :can-create="true"
    />

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <!-- 表头工具栏 -->
      <AgricultureRecordTableToolbar
        :batch-delete-mode="batchDeleteMode"
        :selected-rows-count="selectedRows.length"
        :can-delete="true"
        :can-export="true"
        @batch-delete="batchDeleteMode = true"
        @cancel-batch-delete="cancelBatchDelete"
        @export="handleExport"
      />

      <!-- 表格 -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <tr>
              <th v-if="batchDeleteMode" class="py-3 text-center font-semibold w-12">
                <input type="checkbox" :checked="isAllSelected" @change="handleSelectAll" class="w-4 h-4 rounded border-white" />
              </th>
              <th class="py-3 text-center font-semibold whitespace-nowrap">操作单号</th>
              <th class="py-3 text-center font-semibold whitespace-nowrap">来源</th>
              <th class="py-3 text-center font-semibold whitespace-nowrap">来源编号</th>
              <th class="py-3 text-center font-semibold whitespace-nowrap">操作类型</th>
              <th class="py-3 text-center font-semibold whitespace-nowrap">作物/区域</th>
              <th class="py-3 text-center font-semibold whitespace-nowrap">操作人员</th>
              <th class="py-3 text-center font-semibold whitespace-nowrap">操作日期</th>
              <th class="py-3 text-center font-semibold whitespace-nowrap">进度</th>
              <th class="py-3 text-center font-semibold whitespace-nowrap">状态</th>
              <th class="py-3 text-center font-semibold whitespace-nowrap">备注</th>
              <th class="py-3 text-center font-semibold whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <template v-if="paginatedRecords.length === 0">
              <tr>
                <td :colspan="batchDeleteMode ? 12 : 11" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
              </tr>
            </template>
            <template v-for="record in paginatedRecords" :key="record.id">
              <!-- 主记录行 -->
              <tr class="hover:bg-blue-50 transition-colors">
                <td v-if="batchDeleteMode" class="px-4 py-3 text-center">
                  <input type="checkbox" :checked="selectedRows.includes(record.id)" @change="handleSelectRow(record.id)" class="w-4 h-4 rounded border-gray-400" />
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="flex items-center justify-center gap-1">
                    <button v-if="record.children && record.children.length > 0" @click="toggleChildren(record.id)" class="p-1 hover:bg-gray-100 rounded">
                      <el-icon v-if="expandedIds.has(record.id)"><ArrowDown /></el-icon>
                      <el-icon v-else><ArrowRight /></el-icon>
                    </button>
                    <span class="font-medium text-gray-900 text-sm">{{ record.recordCode }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="text-sm font-medium" :class="getSourceColor(record.sourceType)">{{ getSourceLabel(record.sourceType) }}</span>
                </td>
                <td class="px-4 py-3 text-center text-sm text-blue-600">{{ record.sourceCode || '-' }}</td>
                <td class="px-4 py-3 text-center whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="getTypeBadgeClass(record.operationType)">{{ getOperationTypeLabel(record.operationType) }}</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="text-sm">
                    <div class="font-medium text-gray-900">{{ record.cropName }}</div>
                    <div class="text-gray-500 text-xs">{{ record.greenhouseName }}</div>
                  </div>
                </td>
                <td class="px-4 py-3 text-center text-sm text-gray-900 whitespace-nowrap">{{ record.operatorName }}</td>
                <td class="px-4 py-3 text-center text-sm text-gray-600 whitespace-nowrap">{{ record.operationDate }}</td>
                <td class="px-4 py-3 text-center whitespace-nowrap">
                  <div v-if="record.progress !== undefined" class="flex items-center justify-center gap-2">
                    <div class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div class="h-full rounded-full" :class="record.progress === 100 ? 'bg-green-500' : 'bg-blue-500'" :style="{ width: record.progress + '%' }"></div>
                    </div>
                    <span class="text-xs text-gray-600">{{ record.progress }}%</span>
                  </div>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-4 py-3 text-center whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="getStatusBadgeClass(record.status)">{{ getStatusLabel(record.status) }}</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="text-sm text-gray-500 max-w-[150px] truncate" :title="record.remarks || ''">{{ record.remarks || '-' }}</div>
                </td>
                <td class="px-4 py-3 text-center">
                  <div v-if="record.status === 'waiting_acceptance'" class="flex items-center justify-center gap-1">
                    <button @click="handleAcceptRecord(record)" class="text-green-600 hover:bg-green-50 px-2 py-1 rounded text-sm" title="审核通过">通过</button>
                    <button @click="handleRejectRecord(record)" class="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-sm" title="审核驳回">驳回</button>
                  </div>
                </td>
              </tr>
              <!-- 子记录行（折叠展示） -->
              <tr v-if="record.children && record.children.length > 0 && expandedIds.has(record.id)">
                <td :colspan="batchDeleteMode ? 12 : 11" class="px-4 py-0 bg-blue-50">
                  <div class="py-2 pl-8 space-y-2">
                    <div v-for="(child, index) in record.children" :key="child.id" class="flex items-start gap-4 text-sm">
                      <div class="flex flex-col items-center">
                        <div class="w-3 h-3 rounded-full bg-blue-400 border-2 border-white"></div>
                        <div v-if="index < record.children.length - 1" class="w-0.5 h-8 bg-blue-200"></div>
                      </div>
                      <div class="flex-1 grid grid-cols-12 gap-2 items-center">
                        <div class="col-span-2 text-gray-500">{{ child.operationDate }}</div>
                        <div class="col-span-1 text-gray-500">{{ child.time || '-' }}</div>
                        <div class="col-span-2 font-medium text-gray-700">{{ child.operatorName }}</div>
                        <div class="col-span-2">
                          <span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{{ child.operationTypeName }}</span>
                          <span v-if="child.area" class="ml-1 text-gray-500">({{ child.area }})</span>
                        </div>
                        <div class="col-span-2">
                          <div v-if="child.progress !== undefined" class="flex items-center gap-2">
                            <div class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div class="h-full rounded-full" :class="child.progress === 100 ? 'bg-green-500' : 'bg-blue-500'" :style="{ width: child.progress + '%' }"></div>
                            </div>
                            <span class="text-xs text-gray-600">{{ child.progress }}%</span>
                          </div>
                          <span v-else class="text-gray-400">-</span>
                        </div>
                        <div class="col-span-1 text-gray-600">{{ child.workload ? child.workload + (child.unit || '') : '-' }}</div>
                        <div class="col-span-2 text-gray-500 truncate" :title="child.remarks || ''">{{ child.remarks || child.rejectReason || '-' }}</div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <AgricultureRecordPagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="filteredRecords.length"
        @update:current-page="currentPage = $event"
        @update:page-size="pageSize = $event"
      />
    </div>

    <!-- 新增操作记录弹窗 -->
    <AddOperationRecordModal
      :is-open="showAddModal"
      :operation-types="FARM_OPERATION_TYPES"
      :greenhouses="greenhouseOptions"
      @close="showAddModal = false"
      @submit="handleAddRecord"
    />

    <!-- 导出格式选择弹窗 -->
    <ExportFormatModal
      :is-open="showExportModal"
      :export-format="exportFormat"
      :selected-count="selectedRows.length"
      @format-change="exportFormat = $event"
      @close="showExportModal = false"
      @confirm="handleConfirmExport"
    />

    <!-- 删除确认弹窗 -->
    <DeleteWarningModal
      :is-open="showDeleteWarning"
      :selected-count="selectedRows.length"
      @close="showDeleteWarning = false"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ArrowDown, ArrowRight } from '@element-plus/icons-vue'
import { showAlert } from '@/lib/dialogService'
import { FARM_OPERATION_TYPES } from '@/types/farm/common'
import AgricultureRecordPageHeader from './AgricultureRecordPageHeader.vue'
import AgricultureRecordFilterToolbar from './AgricultureRecordFilterToolbar.vue'
import AgricultureRecordTableToolbar from './components/AgricultureRecordTableToolbar.vue'
import AgricultureRecordPagination from './AgricultureRecordPagination.vue'
import { AddOperationRecordModal, ExportFormatModal, DeleteWarningModal } from './modals'

// ============================================
// 来源配置
// ============================================
const SOURCE_CONFIG = {
  task: { label: '任务派发', color: 'text-blue-600' },
  tempTask: { label: '临时任务', color: 'text-orange-600' },
  manual: { label: '手动录入', color: 'text-green-600' },
  inspection: { label: '巡查记录', color: 'text-purple-600' },
}

// ============================================
// 状态选项
// ============================================
const STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待执行' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
]

// ============================================
// 来源类型选项
// ============================================
const SOURCE_OPTIONS = Object.entries(SOURCE_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}))

// ============================================
// 操作类型选项
// ============================================
const TYPE_OPTIONS = [
  { value: '', label: '全部' },
  ...FARM_OPERATION_TYPES.map(t => ({ value: t.value, label: t.label })),
]

// 温室选项（模拟数据，后续从store接入）
const greenhouseOptions = [
  { id: 'GH_001', name: '玻璃温室A区' },
  { id: 'GH_002', name: '玻璃温室B区' },
  { id: 'GH_003', name: '塑料大棚C区' },
  { id: 'GH_004', name: '露天种植区A' },
]

// ============================================
// 演示数据生成
// ============================================
function generateDemoRecords() {
  const now = new Date()
  const getDate = (daysAgo) => {
    const d = new Date(now)
    d.setDate(d.getDate() - daysAgo)
    return d.toISOString().split('T')[0]
  }

  return [
    {
      id: 'DEMO_TASK_001', recordCode: 'OP20260410-1001', sourceType: 'task', sourceId: 'TASK_001', sourceCode: 'RW20260408-001',
      operationType: 'dispatch', operationTypeName: '任务分派', status: 'completed',
      greenhouseId: 'GH_001', greenhouseName: '玻璃温室A区', cropName: '番茄', variety: '大红番茄',
      operatorId: 'USER_001', operatorName: '张技术员', operationDate: getDate(5), progress: 100,
      remarks: '番茄整枝修剪工作完成', createdAt: new Date(getDate(5)).toISOString(),
    },
    {
      id: 'DEMO_TASK_002', recordCode: 'OP20260408-1002', sourceType: 'task', sourceId: 'TASK_002', sourceCode: 'RW20260408-002',
      operationType: 'dispatch', operationTypeName: '任务分派', status: 'completed',
      greenhouseId: 'GH_002', greenhouseName: '玻璃温室B区', cropName: '黄瓜', variety: '水果黄瓜',
      operatorId: 'USER_002', operatorName: '李技术员', operationDate: getDate(4), progress: 100,
      remarks: '黄瓜采收完成', createdAt: new Date(getDate(4)).toISOString(),
    },
    {
      id: 'DEMO_TASK_003', recordCode: 'OP20260412-1003', sourceType: 'task', sourceId: 'TASK_003', sourceCode: 'RW20260412-003',
      operationType: 'dispatch', operationTypeName: '任务分派', status: 'completed',
      greenhouseId: 'GH_003', greenhouseName: '塑料大棚C区', cropName: '茄子', variety: '长茄子',
      operatorId: 'USER_001', operatorName: '张技术员', operationDate: getDate(3), progress: 100,
      remarks: '茄子病虫害防治，经一次驳回后重新执行完成', createdAt: new Date(getDate(3)).toISOString(),
      children: [
        { id: 'T003_C1', recordCode: 'OP20260411-1010', operationType: 'reject', operationTypeName: '审核驳回', operatorId: 'USER_001', operatorName: '张技术员', operationDate: getDate(2), progress: 30, remarks: '药剂配比不符合要求', rejectReason: '药剂配比浓度过高，可能造成药害', createdAt: new Date(getDate(2)).toISOString() },
        { id: 'T003_C2', recordCode: 'OP20260412-1011', operationType: 'complete', operationTypeName: '执行完成', operatorId: 'USER_003', operatorName: '王操作员', operationDate: getDate(1), progress: 100, workload: 30, unit: 'L', remarks: '按要求重新配比后完成喷施', createdAt: new Date(getDate(1)).toISOString() },
      ],
    },
    {
      id: 'DEMO_TASK_004', recordCode: 'OP20260414-1004', sourceType: 'task', sourceId: 'TASK_004', sourceCode: 'RW20260414-004',
      operationType: 'dispatch', operationTypeName: '任务分派', status: 'pending_reassign',
      greenhouseId: 'GH_001', greenhouseName: '玻璃温室A区', cropName: '辣椒', variety: '螺丝椒',
      operatorId: 'USER_002', operatorName: '李技术员', operationDate: getDate(2), progress: 50,
      remarks: '辣椒整枝工作，已驳回2次，等待重新派发', rejectReason: '执行质量不达标，已是第2次驳回',
      children: [
        { id: 'T004_C1', recordCode: 'OP20260413-1020', operationType: 'reject', operationTypeName: '审核驳回（第1次）', operatorId: 'USER_002', operatorName: '李技术员', operationDate: getDate(1), progress: 30, rejectReason: '整枝不彻底，侧枝留得太多', createdAt: new Date(getDate(1)).toISOString() },
        { id: 'T004_C2', recordCode: 'OP20260414-1021', operationType: 'complete', operationTypeName: '重新执行提交', operatorId: 'USER_004', operatorName: '赵操作员', operationDate: getDate(1), progress: 50, workload: 80, unit: '株', remarks: '重新整枝后提交', createdAt: new Date(getDate(1)).toISOString() },
        { id: 'T004_C3', recordCode: 'OP20260414-1022', operationType: 'reject', operationTypeName: '审核驳回（第2次）', operatorId: 'USER_002', operatorName: '李技术员', operationDate: getDate(0), progress: 50, rejectReason: '仍有遗漏，需要重新处理', createdAt: new Date().toISOString() },
      ],
    },
    {
      id: 'DEMO_TASK_005', recordCode: 'OP20260413-1005', sourceType: 'task', sourceId: 'TASK_005', sourceCode: 'RW20260413-005',
      operationType: 'dispatch', operationTypeName: '任务分派', status: 'pending',
      greenhouseId: 'GH_004', greenhouseName: '露天种植区A', cropName: '白菜', variety: '大白菜',
      operatorId: 'USER_001', operatorName: '张技术员', operationDate: getDate(2), progress: 0,
      remarks: '待执行的浇水任务，已超时未接受', createdAt: new Date(getDate(2)).toISOString(),
    },
    {
      id: 'DEMO_TASK_006', recordCode: 'OP20260410-1006', sourceType: 'task', sourceId: 'TASK_006', sourceCode: 'RW20260410-006',
      operationType: 'dispatch', operationTypeName: '任务分派', status: 'in_progress',
      greenhouseId: 'GH_002', greenhouseName: '玻璃温室B区', cropName: '番茄', variety: '樱桃番茄',
      operatorId: 'USER_003', operatorName: '王操作员', operationDate: getDate(3), progress: 60,
      remarks: '番茄绑蔓工作，进行中但进度缓慢，已超时', createdAt: new Date(getDate(3)).toISOString(),
    },
    {
      id: 'DEMO_TEMP_001', recordCode: 'OP20260412-2001', sourceType: 'tempTask', sourceId: 'TEMP_TASK_001', sourceCode: 'TT20260412-001',
      operationType: 'create', operationTypeName: '创建临时任务', status: 'completed',
      greenhouseId: 'GH_001', greenhouseName: '玻璃温室A区', cropName: '番茄',
      operatorId: 'USER_001', operatorName: '张技术员', operationDate: getDate(3), progress: 100,
      remarks: '应急修复灌溉管道漏水', createdAt: new Date(getDate(3)).toISOString(),
    },
    {
      id: 'DEMO_TEMP_002', recordCode: 'OP20260411-2002', sourceType: 'tempTask', sourceId: 'TEMP_TASK_002', sourceCode: 'TT20260411-002',
      operationType: 'create', operationTypeName: '创建临时任务', status: 'completed',
      greenhouseId: 'GH_003', greenhouseName: '塑料大棚C区', cropName: '茄子',
      operatorId: 'USER_002', operatorName: '李技术员', operationDate: getDate(4), progress: 100,
      remarks: '处理茄子叶片发黄问题，经驳回后完成', createdAt: new Date(getDate(4)).toISOString(),
      children: [
        { id: 'TT002_C1', recordCode: 'OP20260410-2010', operationType: 'reject', operationTypeName: '审核驳回', operatorId: 'USER_002', operatorName: '李技术员', operationDate: getDate(3), progress: 40, rejectReason: '用药方案不对症，需更换药剂', createdAt: new Date(getDate(3)).toISOString() },
        { id: 'TT002_C2', recordCode: 'OP20260411-2011', operationType: 'accept_confirm', operationTypeName: '审核通过', operatorId: 'USER_002', operatorName: '李技术员', operationDate: getDate(2), progress: 100, remarks: '更换药剂后问题解决', createdAt: new Date(getDate(2)).toISOString() },
      ],
    },
    {
      id: 'DEMO_TEMP_003', recordCode: 'OP20260414-2003', sourceType: 'tempTask', sourceId: 'TEMP_TASK_003', sourceCode: 'TT20260414-003',
      operationType: 'create', operationTypeName: '创建临时任务', status: 'waiting_acceptance',
      greenhouseId: 'GH_002', greenhouseName: '玻璃温室B区', cropName: '黄瓜',
      operatorId: 'USER_003', operatorName: '王操作员', operationDate: getDate(1), progress: 100,
      remarks: '黄瓜霜霉病防治作业，已提交待验收', createdAt: new Date(getDate(1)).toISOString(),
    },
    {
      id: 'DEMO_TEMP_004', recordCode: 'OP20260413-2004', sourceType: 'tempTask', sourceId: 'TEMP_TASK_004', sourceCode: 'TT20260413-004',
      operationType: 'create', operationTypeName: '创建临时任务', status: 'pending_reassign',
      greenhouseId: 'GH_004', greenhouseName: '露天种植区A', cropName: '白菜',
      operatorId: 'USER_001', operatorName: '张技术员', operationDate: getDate(2), progress: 50,
      remarks: '白菜害虫防治，已驳回2次，等待重新派发',
      children: [
        { id: 'TT004_C1', recordCode: 'OP20260412-2020', operationType: 'reject', operationTypeName: '审核驳回（第1次）', operatorId: 'USER_001', operatorName: '张技术员', operationDate: getDate(1), progress: 30, rejectReason: '喷施不均匀，部分叶片未喷到', createdAt: new Date(getDate(1)).toISOString() },
        { id: 'TT004_C2', recordCode: 'OP20260413-2021', operationType: 'reject', operationTypeName: '审核驳回（第2次）', operatorId: 'USER_001', operatorName: '张技术员', operationDate: getDate(0), progress: 50, rejectReason: '药品浓度仍需调整', createdAt: new Date().toISOString() },
      ],
    },
    {
      id: 'DEMO_INSP_001', recordCode: 'OP20260410-3001', sourceType: 'inspection', sourceId: 'INSP_001', sourceCode: 'XC20260410-001',
      operationType: 'inspection_report', operationTypeName: '巡查上报', status: 'completed',
      greenhouseId: 'GH_001', greenhouseName: '玻璃温室A区', cropName: '番茄',
      operatorId: 'USER_005', operatorName: '巡检员小陈', operationDate: getDate(5), progress: 100,
      remarks: '发现番茄叶片发黄，已处理', createdAt: new Date(getDate(5)).toISOString(),
    },
    {
      id: 'DEMO_INSP_002', recordCode: 'OP20260413-3002', sourceType: 'inspection', sourceId: 'INSP_002', sourceCode: 'XC20260413-002',
      operationType: 'inspection_report', operationTypeName: '巡查上报', status: 'pending',
      greenhouseId: 'GH_002', greenhouseName: '玻璃温室B区', cropName: '黄瓜',
      operatorId: 'USER_005', operatorName: '巡检员小陈', operationDate: getDate(2), progress: 0,
      remarks: '发现黄瓜叶片出现疑似霜霉病症状，待确认处理', createdAt: new Date(getDate(2)).toISOString(),
    },
    {
      id: 'DEMO_MANUAL_001', recordCode: 'OP20260412-4001', sourceType: 'manual',
      operationType: 'manual_entry', operationTypeName: '手动录入', status: 'completed',
      greenhouseId: 'GH_001', greenhouseName: '玻璃温室A区', cropName: '番茄', variety: '大红番茄',
      operatorId: 'USER_001', operatorName: '张技术员', operationDate: getDate(3),
      workload: 200, unit: 'kg', remarks: '番茄日常巡园记录', createdAt: new Date(getDate(3)).toISOString(),
    },
  ]
}

// ============================================
// 初始化数据（从localStorage读取，默认用演示数据）
// ============================================
function loadRecords() {
  try {
    const saved = localStorage.getItem('yuanxingtu_operationRecords')
    if (saved) return JSON.parse(saved)
  } catch {}
  return generateDemoRecords()
}

// ============================================
// 响应式状态
// ============================================
const records = ref(loadRecords())
const expandedIds = ref(new Set())
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRows = ref([])
const batchDeleteMode = ref(false)
const showAddModal = ref(false)
const showExportModal = ref(false)
const showDeleteWarning = ref(false)
const exportFormat = ref('excel')

const filters = reactive({
  sourceType: '',
  operationType: '',
  status: '',
  greenhouseId: '',
  operatorId: '',
  dateFrom: '',
  dateTo: '',
  searchText: '',
})

// 保存到localStorage
watch(records, (val) => {
  localStorage.setItem('yuanxingtu_operationRecords', JSON.stringify(val))
}, { deep: true })

// ============================================
// 计算属性
// ============================================

// 统计数据
const stats = computed(() => ({
  total: records.value.length,
  task: records.value.filter(r => r.sourceType === 'task').length,
  tempTask: records.value.filter(r => r.sourceType === 'tempTask').length,
  manual: records.value.filter(r => r.sourceType === 'manual').length,
}))

// 筛选后的记录
const filteredRecords = computed(() => {
  let result = records.value.filter(record => {
    if (filters.sourceType && record.sourceType !== filters.sourceType) return false
    if (filters.status && record.status !== filters.status) return false
    if (filters.operationType && record.operationType !== filters.operationType) return false
    if (filters.greenhouseId && record.greenhouseId !== filters.greenhouseId) return false
    if (filters.operatorId && record.operatorId !== filters.operatorId) return false
    if (filters.dateFrom && record.operationDate < filters.dateFrom) return false
    if (filters.dateTo && record.operationDate > filters.dateTo) return false
    return true
  })

  // 搜索文本筛选
  if (filters.searchText) {
    const text = filters.searchText.toLowerCase()
    result = result.filter(r =>
      r.recordCode.toLowerCase().includes(text) ||
      r.cropName.toLowerCase().includes(text) ||
      r.greenhouseName.toLowerCase().includes(text) ||
      r.operatorName.toLowerCase().includes(text) ||
      (r.sourceCode && r.sourceCode.toLowerCase().includes(text))
    )
  }

  return result
})

// 分页记录
const paginatedRecords = computed(() => {
  return filteredRecords.value.slice(
    (currentPage.value - 1) * pageSize.value,
    currentPage.value * pageSize.value
  )
})

// 全选状态
const isAllSelected = computed(() => {
  return filteredRecords.value.length > 0 && selectedRows.value.length === filteredRecords.value.length
})

// ============================================
// 事件处理
// ============================================

const setFilters = (newFilters) => {
  Object.assign(filters, newFilters)
}

const handleReset = () => {
  Object.assign(filters, {
    sourceType: '', operationType: '', status: '', greenhouseId: '',
    operatorId: '', dateFrom: '', dateTo: '', searchText: '',
  })
  currentPage.value = 1
}

const handleSelectAll = () => {
  if (selectedRows.value.length === filteredRecords.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredRecords.value.map(r => r.id)
  }
}

const handleSelectRow = (id) => {
  if (selectedRows.value.includes(id)) {
    selectedRows.value = selectedRows.value.filter(r => r !== id)
  } else {
    selectedRows.value = [...selectedRows.value, id]
  }
}

const cancelBatchDelete = () => {
  batchDeleteMode.value = false
  selectedRows.value = []
}

const handleExport = () => {
  if (selectedRows.value.length === 0) {
    showAlert('请先选择要导出的记录')
    return
  }
  showExportModal.value = true
}

const handleConfirmExport = () => {
  showExportModal.value = false
  selectedRows.value = []
}

const handleConfirmDelete = () => {
  records.value = records.value.filter(r => !selectedRows.value.includes(r.id))
  showDeleteWarning.value = false
  batchDeleteMode.value = false
  selectedRows.value = []
}

const toggleChildren = (id) => {
  const next = new Set(expandedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expandedIds.value = next
}

// 新增记录
const handleAddRecord = (formData) => {
  const now = new Date().toISOString()
  const dateStr = `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}`
  const random = String(Math.random()).slice(2, 6)
  const newRecord = {
    ...formData,
    id: `OP_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    recordCode: `OP${dateStr}-${random}`,
    sourceType: 'manual',
    operationTypeName: FARM_OPERATION_TYPES.find(t => t.value === formData.operationType)?.label || formData.operationType,
    status: 'completed',
    operatorId: 'USER_MANUAL',
    createdAt: now,
    updatedAt: now,
  }
  records.value = [newRecord, ...records.value]
  showAddModal.value = false
}

// 验收通过
const handleAcceptRecord = (record) => {
  if (!record.sourceId || !record.sourceType) {
    showAlert('该记录无法验收：缺少来源信息')
    return
  }
  if (record.sourceType === 'task' || record.sourceType === 'tempTask') {
    records.value = records.value.map(r => r.id === record.id ? { ...r, status: 'completed', updatedAt: new Date().toISOString() } : r)
    return
  }
  showAlert('该类型记录不支持快速验收')
}

// 驳回
const handleRejectRecord = (record) => {
  if (!record.sourceId || !record.sourceType) {
    showAlert('该记录无法驳回：缺少来源信息')
    return
  }
  const reason = prompt('请输入驳回原因：')
  if (reason === null) return
  if (record.sourceType === 'task') {
    showAlert('任务驳回功能暂未实现，请在任务中心处理')
  } else if (record.sourceType === 'tempTask') {
    const now = new Date().toISOString()
    const childRecord = {
      id: `OP_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      recordCode: record.recordCode,
      operationType: 'reject',
      operationTypeName: '审核驳回',
      operatorId: record.operatorId,
      operatorName: record.operatorName,
      operationDate: new Date().toISOString().split('T')[0],
      progress: record.progress,
      rejectReason: reason,
      createdAt: now,
    }
    records.value = records.value.map(r => r.id === record.id ? {
      ...r,
      status: 'pending_reassign',
      children: [childRecord, ...(r.children || [])],
      updatedAt: now,
    } : r)
  }
}

// ============================================
// 辅助函数
// ============================================

const getOperationTypeLabel = (type) => {
  const found = FARM_OPERATION_TYPES.find(t => t.value === type)
  return found?.label || type
}

const getSourceLabel = (sourceType) => {
  return SOURCE_CONFIG[sourceType]?.label || sourceType
}

const getSourceColor = (sourceType) => {
  return SOURCE_CONFIG[sourceType]?.color || 'text-gray-600'
}

const getTypeBadgeClass = (type) => {
  const colors = {
    'planting': 'bg-green-100 text-green-700',
    'irrigation': 'bg-blue-100 text-blue-700',
    'fertilization': 'bg-amber-100 text-amber-700',
    'pest_control': 'bg-red-100 text-red-700',
    'pruning': 'bg-purple-100 text-purple-700',
    'harvest': 'bg-orange-100 text-orange-700',
    'weeding': 'bg-emerald-100 text-emerald-700',
    'other': 'bg-gray-100 text-gray-700',
  }
  return colors[type] || colors['other']
}

const getStatusBadgeClass = (status) => {
  const map = {
    'completed': 'bg-green-100 text-green-700',
    'in_progress': 'bg-blue-100 text-blue-700',
    'pending': 'bg-amber-100 text-amber-700',
    'waiting_acceptance': 'bg-orange-100 text-orange-700',
    'rejected': 'bg-red-100 text-red-700',
    'cancelled': 'bg-gray-100 text-gray-700',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

const getStatusLabel = (status) => {
  const map = {
    'completed': '已完成',
    'in_progress': '进行中',
    'pending': '待执行',
    'waiting_acceptance': '待验收',
    'rejected': '已驳回',
    'cancelled': '已取消',
    'pending_reassign': '待重新派发',
  }
  return map[status] || status
}
</script>
