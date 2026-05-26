<template>
  <!-- 巡查表格 - 从V1.1 InspectionTable.tsx 1:1迁移 -->
  <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <tr>
            <th v-if="showSelection" class="px-4 py-3 text-center text-sm font-semibold w-12">
              <el-checkbox
                :model-value="isAllSelected"
                @change="$emit('selectAll')"
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
          <tr v-for="(record, idx) in paginatedRecords" :key="record.id" class="hover:bg-blue-100 transition-colors">
            <td v-if="showSelection" class="px-4 py-3 text-center">
              <el-checkbox
                :model-value="selectedRows.includes(idx)"
                @change="$emit('selectRow', idx)"
              />
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
              <el-button link size="small" @click="$emit('viewDetail', record)" class="font-medium">
                {{ record.recordCode }}
              </el-button>
            </td>
            <td class="px-4 py-3 text-center">
              <span :class="getInspectionTypeClass(record.inspectionType)" class="px-2 py-1 text-xs rounded-full">
                {{ getInspectionTypeLabel(record.inspectionType) }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-center text-gray-600 whitespace-nowrap">{{ record.inspectorName }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">
              <el-icon class="text-emerald-600 inline"><Location /></el-icon>
              {{ getLocationName(record) }}
            </td>
            <td class="px-4 py-3 text-sm text-center text-gray-600 whitespace-nowrap">{{ record.checkDate }}</td>
            <td class="px-4 py-3 text-center">
              <span :class="record.status === 'normal' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'" class="px-2 py-1 text-xs rounded-full">
                {{ record.status === 'normal' ? '正常' : '异常' }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
              <div v-if="record.issueCategories?.length" class="flex gap-1 justify-center flex-wrap">
                <span v-for="(cat, i) in record.issueCategories.slice(0, 2)" :key="i" class="px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full">
                  {{ CATEGORY_LABELS[cat] || cat }}
                </span>
                <span v-if="record.issueCategories.length > 2" class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{{ record.issueCategories.length - 2 }}
                </span>
              </div>
              <div v-else-if="record.issuePresets?.length" class="flex gap-1 justify-center flex-wrap">
                <span v-for="(preset, i) in record.issuePresets.slice(0, 2)" :key="i" class="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded-full">{{ preset }}</span>
                <span v-if="record.issuePresets.length > 2" class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">+{{ record.issuePresets.length - 2 }}</span>
              </div>
              <span v-else class="text-sm text-gray-500">-</span>
            </td>
            <td class="px-4 py-3 text-center">
              <span v-if="record.issueSeverity" :class="getSeverityClass(record.issueSeverity)" class="px-2 py-1 text-xs rounded-full">
                {{ record.issueSeverity }}
              </span>
              <span v-else class="text-sm text-gray-500">-</span>
            </td>
            <td class="px-4 py-3 text-center">
              <span v-if="getFeedbackData(record)" class="flex items-center justify-center gap-1">
                <span v-if="getFeedbackData(record).gpsLocation" title="GPS已打卡">📍</span>
                <span v-if="getFeedbackData(record).photosBefore?.length" title="作业前照片">📷</span>
                <span v-if="getFeedbackData(record).photosAfter?.length" title="作业后照片">📷</span>
                <span v-if="getFeedbackData(record).materialCode" title="物资已扫码">📦</span>
                <span v-if="getFeedbackData(record).voiceNote" title="语音备注">🎤</span>
              </span>
              <span v-else class="text-gray-300">-</span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
              <span v-if="record.feedbackUsers?.length" class="text-gray-700">
                {{ formatFeedbackUsers(record.feedbackUsers) }}
              </span>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-4 py-3 text-center">
              <template v-if="getProblemForRecord(record)">
                <div class="flex items-center justify-center gap-1">
                  <div class="w-12 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div :class="['h-full rounded-full', getProgressColor(getProblemForRecord(record).status)]" :style="{ width: getProblemProgress(getProblemForRecord(record)) + '%' }" />
                  </div>
                  <span class="text-xs text-gray-500">{{ getProblemProgress(getProblemForRecord(record)) }}%</span>
                </div>
              </template>
              <span v-else class="text-gray-400 text-xs">-</span>
            </td>
            <td class="px-4 py-3 text-center whitespace-nowrap">
              <template v-if="canAccept(getProblemForRecord(record))">
                <el-button type="primary" size="small" @click="$emit('acceptance', getProblemForRecord(record))">验收</el-button>
              </template>
              <template v-else-if="getProblemForRecord(record)">
                <span :class="getProblemForRecord(record).status === '已处理' ? 'text-green-500' : 'text-blue-500'" class="text-xs font-medium">
                  {{ getProblemForRecord(record).status }}
                </span>
              </template>
              <span v-else class="text-gray-400 text-xs">-</span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 max-w-[10em]">
              <span class="truncate block" :title="record.remarks || ''">
                {{ record.remarks ? record.remarks.slice(0, 10) + (record.remarks.length > 10 ? '...' : '') : '-' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="showSelection" class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
        <div class="flex items-center gap-4">
          <el-button link size="small" @click="$emit('selectAll')">
            {{ isAllSelected ? '全不选' : '全选' }}
          </el-button>
          <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <el-pagination
      :current-page="currentPage"
      :page-size="pageSize"
      :page-sizes="[10, 20, 50]"
      :total="records.length"
      layout="total, sizes, prev, pager, next"
      @size-change="(size) => { $emit('pageSizeChange', size); $emit('pageChange', 1) }"
      @current-change="(page) => $emit('pageChange', page)"
      class="px-4 py-3"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Location } from '@element-plus/icons-vue'

const CATEGORY_LABELS = {
  disease: '病害', pest: '虫害', environment: '环境',
  growth: '长势', equipment: '设备', other: '其他',
}

const STATUS_COLORS = {
  '待处理': 'bg-gray-400', '处理中': 'bg-blue-500',
  '待验收': 'bg-amber-500', '已处理': 'bg-green-500',
}

const props = defineProps({
  records: { type: Array, default: () => [] },
  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  selectedRows: { type: Array, default: () => [] },
  exportMode: { type: Boolean, default: false },
  batchEditMode: { type: Boolean, default: false },
  batchDeleteMode: { type: Boolean, default: false },
  problems: { type: Array, default: () => [] },
  tasks: { type: Array, default: () => [] },
})

const emit = defineEmits([
  'selectRow', 'selectAll', 'viewDetail', 'pageChange', 'pageSizeChange', 'acceptance',
])

const showSelection = computed(() => props.exportMode || props.batchEditMode || props.batchDeleteMode)
const isAllSelected = computed(() => props.selectedRows.length === props.records.length && props.records.length > 0)

const paginatedRecords = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize
  return props.records.slice(start, start + props.pageSize)
})

const getInspectionTypeLabel = (type) => {
  const map = { farm: '种植', equipment: '设备', infrastructure: '设施', other: '其他' }
  return map[type] || '-'
}

const getInspectionTypeClass = (type) => {
  const map = {
    farm: 'bg-emerald-100 text-emerald-700',
    equipment: 'bg-blue-100 text-blue-700',
    infrastructure: 'bg-amber-100 text-amber-700',
    other: 'bg-purple-100 text-purple-700',
  }
  return map[type] || 'bg-gray-100 text-gray-600'
}

const getLocationName = (record) => {
  if (record.inspectionType === 'farm') return record.greenhouseName || '-'
  if (record.inspectionType === 'equipment') return record.equipmentName || '-'
  if (record.inspectionType === 'infrastructure') return record.infrastructureName || '-'
  return record.greenhouseName || '-'
}

const getSeverityClass = (severity) => {
  if (severity === '严重') return 'bg-red-100 text-red-700'
  if (severity === '中等') return 'bg-amber-100 text-amber-700'
  return 'bg-gray-100 text-gray-700'
}

const getProblemForRecord = (record) => {
  if (record.problemId) return props.problems.find(p => p.id === record.problemId)
  return props.problems.find(p =>
    record.checkDate === p.checkDate &&
    record.greenhouseName &&
    (record.greenhouseName.includes(p.greenhouseName || '') || (p.greenhouseName && p.greenhouseName.includes(record.greenhouseName)))
  )
}

const getTaskForProblem = (problem) => {
  if (!problem?.sourceTaskId) return undefined
  return props.tasks.find(t => t.id === problem.sourceTaskId)
}

const getProblemProgress = (problem) => {
  if (!problem) return 0
  const task = getTaskForProblem(problem)
  if (task && task.progress !== undefined) return task.progress
  switch (problem.status) {
    case '待处理': return 0
    case '处理中': return 50
    case '待验收': return 100
    case '已处理': return 100
    default: return 0
  }
}

const getProgressColor = (status) => STATUS_COLORS[status] || 'bg-gray-400'
const canAccept = (problem) => problem?.status === '待验收'

const getFeedbackData = (record) => {
  const problem = getProblemForRecord(record)
  if (!problem?.flowRecords) return null
  const submitRecord = [...problem.flowRecords].reverse().find(r => r.action === 'submit' && r.feedbackData)
  return submitRecord?.feedbackData || null
}

const formatFeedbackUsers = (feedbackUsers) => {
  if (feedbackUsers.length <= 2) return feedbackUsers.join('、')
  return feedbackUsers[0] + '等' + feedbackUsers.length + '人'
}
</script>
