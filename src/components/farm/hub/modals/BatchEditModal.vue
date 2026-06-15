<!--
  农事任务中心 - 批量编辑巡查记录弹窗
  1:1 翻译自 V1.1 src/components/farm/hub/modals/BatchEditModal.tsx（274 行）
  - props: isOpen / selectedRows / records / editedRecordIds / editedRecords
          / selectedRecordId / greenhouses / users / equipmentRecords / infrastructureRecords
  - emits: close / confirm / selectedRecordIdChange / editedRecordsChange / editedRecordIdsChange
  功能：批量选择巡查记录、编辑巡查类型/巡查人员/日期/天气/温度/湿度/问题分类/反馈人员/问题描述/备注
-->
<template>
  <el-dialog
    :model-value="isOpen"
    title="批量编辑巡查记录"
    width="1100px"
    top="5vh"
    :close-on-click-modal="false"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <!-- 信息提示 -->
      <div class="bg-blue-50 rounded-lg p-3">
        <p class="text-sm text-blue-800">
          已选择 <strong>{{ safeSelectedRows.length }}</strong> 条记录进行批量编辑，
          已编辑 <strong>{{ safeEditedRecordIds.length }}</strong> 条
        </p>
      </div>

      <!-- 记录选择器 -->
      <div>
        <label class="text-sm text-gray-600 block mb-1">选择记录编号</label>
        <el-select
          :model-value="selectedRecordId || ''"
          @update:model-value="(v) => $emit('selectedRecordIdChange', v)"
          class="w-full"
          placeholder="请选择记录编号"
        >
          <el-option value="" label="请选择记录编号" />
          <el-option
            v-for="r in selectedRecords"
            :key="r.id"
            :value="r.id.toString()"
            :label="`${r.recordCode} - ${r.inspectorName} ${safeEditedRecordIds.includes(r.id.toString()) ? '✅ 已编辑' : ''}`"
          />
        </el-select>
      </div>

      <!-- 编辑区域 -->
      <div v-if="selectedRecordId && currentRecord" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- 巡查编号 - 不可编辑 -->
        <div class="bg-gray-100 rounded-lg p-3">
          <div class="text-xs text-gray-500 mb-1">巡查编号</div>
          <div class="text-sm font-medium text-blue-600">{{ currentRecord.recordCode }}</div>
        </div>

        <!-- 巡查类型 - 可编辑 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">巡查类型</label>
          <el-select
            :model-value="editedData.inspectionType ?? currentRecord.inspectionType"
            @update:model-value="(v) => handleFieldChange('inspectionType', v)"
            class="w-full" placeholder="请选择"
          >
            <el-option
              v-for="t in inspectionTypeOptions" :key="t.value" :value="t.value" :label="t.label"
            />
          </el-select>
        </div>

        <!-- 巡查人员 - 可编辑 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">巡查人员</label>
          <el-select
            :model-value="editedData.inspectorId ?? currentRecord.inspectorId"
            @update:model-value="(v) => handleFieldChange('inspectorId', v)"
            class="w-full" placeholder="请选择"
          >
            <el-option
              v-for="u in filteredInspectorUsers" :key="u.id" :value="u.id" :label="u.name"
            />
          </el-select>
        </div>

        <!-- 巡查日期 - 可编辑 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">巡查日期</label>
          <el-date-picker
            :model-value="(editedData.checkDate ?? currentRecord.checkDate) || null"
            @update:model-value="(v) => handleFieldChange('checkDate', v)"
            type="date" class="w-full" placeholder="选择日期"
            value-format="YYYY-MM-DD"
          />
        </div>

        <!-- 天气 - 可编辑 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">天气</label>
          <el-select
            :model-value="editedData.weather ?? currentRecord.weather"
            @update:model-value="(v) => handleFieldChange('weather', v)"
            class="w-full" placeholder="请选择"
          >
            <el-option
              v-for="w in weatherOptions" :key="w.value" :value="w.value" :label="w.label"
            />
          </el-select>
        </div>

        <!-- 温度 - 可编辑 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">温度(°C)</label>
          <el-input-number
            :model-value="editedData.temperature ?? currentRecord.temperature ?? 0"
            @update:model-value="(v) => handleFieldChange('temperature', Number(v) || 0)"
            :precision="2" :step="0.1" :min="-50" :max="80"
            class="w-full" placeholder="0.00" controls-position="right"
          />
        </div>

        <!-- 湿度 - 可编辑 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">湿度(%)</label>
          <el-input-number
            :model-value="editedData.humidity ?? currentRecord.humidity ?? 0"
            @update:model-value="(v) => handleFieldChange('humidity', Number(v) || 0)"
            :precision="2" :step="1" :min="0" :max="100"
            class="w-full" placeholder="0.00" controls-position="right"
          />
        </div>

        <!-- 巡查结果 - 不可编辑 -->
        <div class="bg-gray-100 rounded-lg p-3">
          <div class="text-xs text-gray-500 mb-1">巡查结果</div>
          <span
            class="inline-flex px-2 py-1 rounded-full text-xs font-medium"
            :class="currentRecord.status === 'normal' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'"
          >
            {{ currentRecord.status === 'normal' ? '正常' : '异常' }}
          </span>
        </div>

        <!-- 问题分类 - 可编辑 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">问题分类</label>
          <el-select
            :model-value="(editedData.issueCategories ?? currentRecord.issueCategories ?? [''])[0] || ''"
            @update:model-value="(v) => handleFieldChange('issueCategories', v ? [v] : [])"
            class="w-full" placeholder="请选择"
          >
            <el-option value="" label="请选择" />
            <el-option
              v-for="c in issueCategoryOptions" :key="c.value" :value="c.value" :label="c.label"
            />
          </el-select>
        </div>

        <!-- 反馈人员 - 可编辑 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">反馈人员</label>
          <el-select
            :model-value="(editedData.feedbackUsers ?? currentRecord.feedbackUsers ?? [''])[0] || ''"
            @update:model-value="(v) => handleFieldChange('feedbackUsers', v ? [v] : [])"
            class="w-full" placeholder="请选择"
          >
            <el-option value="" label="请选择" />
            <el-option
              v-for="u in filteredFeedbackUsers" :key="u.id" :value="u.id" :label="u.name"
            />
          </el-select>
        </div>

        <!-- 问题描述 - 可编辑 -->
        <div class="col-span-2">
          <label class="text-sm text-gray-600 block mb-1">问题描述</label>
          <el-input
            :model-value="editedData.issueText ?? currentRecord.issueText ?? ''"
            @update:model-value="(v) => handleFieldChange('issueText', v)"
            placeholder="请输入问题描述"
          />
        </div>

        <!-- 备注 - 可编辑 -->
        <div class="col-span-2">
          <label class="text-sm text-gray-600 block mb-1">备注</label>
          <el-input
            :model-value="editedData.remarks ?? currentRecord.remarks ?? ''"
            @update:model-value="(v) => handleFieldChange('remarks', v)"
            placeholder="请输入备注"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" @click="$emit('confirm')">保存修改</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

// ============================================
// 常量选项（与 V1.1 保持一致）
// ============================================
// V1.1 ISSUE_CATEGORIES
const issueCategoryOptions = [
  { value: 'pest', label: '病虫害' },
  { value: 'disease', label: '疾病' },
  { value: 'nutrition', label: '营养缺失' },
  { value: 'water', label: '水分胁迫' },
  { value: 'temperature', label: '温度异常' },
  { value: 'equipment', label: '设备故障' },
  { value: 'infrastructure', label: '设施损坏' },
  { value: 'other', label: '其他' },
]
// V1.1 WEATHER_OPTIONS
const weatherOptions = [
  { value: 'sunny', label: '晴' },
  { value: 'cloudy', label: '多云' },
  { value: 'overcast', label: '阴' },
  { value: 'light_rain', label: '小雨' },
  { value: 'heavy_rain', label: '大雨' },
  { value: 'snow', label: '雪' },
  { value: 'fog', label: '雾' },
  { value: 'wind', label: '大风' },
]
// V1.1 巡查类型
const inspectionTypeOptions = [
  { value: 'farm', label: '种植区域巡查' },
  { value: 'equipment', label: '设备保养巡查' },
  { value: 'infrastructure', label: '基础设施巡检' },
  { value: 'other', label: '其他' },
]

// ============================================
// Props
// ============================================
const props = defineProps({
  isOpen: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  records: { type: Array, default: () => [] },
  editedRecordIds: { type: Array, default: () => [] },
  editedRecords: { type: Object, default: () => ({}) },
  selectedRecordId: { type: String, default: '' },
  greenhouses: { type: Array, default: () => [] },
  users: { type: Array, default: () => [] },
  equipmentRecords: { type: Array, default: () => [] },
  infrastructureRecords: { type: Array, default: () => [] },
})

const emit = defineEmits([
  'close',
  'confirm',
  'selectedRecordIdChange',
  'editedRecordsChange',
  'editedRecordIdsChange',
])

// ============================================
// 安全访问 props
// ============================================
const safeSelectedRows = computed(() => props.selectedRows || [])
const safeRecords = computed(() => props.records || [])
const safeEditedRecordIds = computed(() => props.editedRecordIds || [])
const safeEditedRecords = computed(() => props.editedRecords || {})

// ============================================
// 计算属性
// ============================================
// 选中的记录列表
const selectedRecords = computed(() =>
  safeSelectedRows.value.map(index => safeRecords.value[index]).filter(Boolean)
)
// 当前编辑的记录
const currentRecord = computed(() =>
  props.selectedRecordId
    ? safeRecords.value.find(r => r.id.toString() === props.selectedRecordId)
    : null
)
// 当前记录的已编辑数据
const editedData = computed(() =>
  props.selectedRecordId
    ? (safeEditedRecords.value[props.selectedRecordId] || {})
    : {}
)
// 巡查人员候选项（technician + supervisor）
const filteredInspectorUsers = computed(() => {
  return (props.users || []).filter(u => u.role === 'technician' || u.role === 'supervisor')
})
// 反馈人员候选项（technician + supervisor + manager）
const filteredFeedbackUsers = computed(() => {
  return (props.users || []).filter(u =>
    u.role === 'technician' || u.role === 'supervisor' || u.role === 'manager'
  )
})

// ============================================
// 字段变更处理
// ============================================
const handleFieldChange = (field, value) => {
  if (!props.selectedRecordId) return
  const updated = {
    ...safeEditedRecords.value,
    [props.selectedRecordId]: {
      ...(safeEditedRecords.value[props.selectedRecordId] || {}),
      [field]: value,
    },
  }
  emit('editedRecordsChange', updated)
  if (!safeEditedRecordIds.value.includes(props.selectedRecordId)) {
    emit('editedRecordIdsChange', [...safeEditedRecordIds.value, props.selectedRecordId])
  }
}
</script>
