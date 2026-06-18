<template>
  <!-- 新增巡查记录弹窗 - 从V1.1 CreateInspectionModal.tsx 1:1迁移 -->
  <el-dialog :model-value="isOpen" @update:model-value="$emit('close')" title="新增记录" width="630px" top="3vh">
    <div class="space-y-4">
      <!-- 巡查编号和扫码定位 -->
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <label class="text-gray-700 text-sm block mb-1">巡查编号 <span class="text-red-500">*</span></label>
          <div class="flex gap-2">
            <el-input :model-value="newRecord.recordCode" @update:model-value="update('recordCode', $event)" placeholder="点击生成或手动输入" class="font-mono" />
            <el-button type="primary" size="default" @click="$emit('generateCode')" class="whitespace-nowrap">生成</el-button>
          </div>
        </div>
        <div class="pt-5">
          <el-button type="primary" size="default" @click="$emit('openQRScanner')">
            <el-icon><Aim /></el-icon>
            扫码定位
          </el-button>
        </div>
      </div>

      <!-- 巡查类型选择 -->
      <div>
        <label class="text-gray-700 text-sm block mb-1">巡查类型 <span class="text-red-500">*</span></label>
        <el-select :model-value="newRecord.inspectionType" @update:model-value="update('inspectionType', $event)" class="w-full">
          <el-option value="farm" label="种植区域巡查" />
          <el-option value="equipment" label="设备保养巡查" />
          <el-option value="infrastructure" label="基础设施巡检" />
          <el-option value="other" label="其他" />
        </el-select>
      </div>

      <!-- 种植区域动态表单 -->
      <div v-if="newRecord.inspectionType === 'farm'" class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-gray-700 text-sm block mb-1">巡查区域 <span class="text-red-500">*</span></label>
          <el-select :model-value="newRecord.greenhouseId" @update:model-value="update('greenhouseId', $event)" class="w-full" placeholder="请选择区域">
            <el-option v-for="gh in greenhouses" :key="gh.id" :value="gh.id" :label="gh.name" />
          </el-select>
        </div>
        <div>
          <label class="text-gray-700 text-sm block mb-1">作物名称 <span class="text-red-500">*</span></label>
          <el-select :model-value="newRecord.cropName" @update:model-value="update('cropName', $event)" class="w-full" placeholder="请选择作物">
            <el-option v-for="c in cropTypes" :key="c.id" :value="c.name" :label="c.name" />
          </el-select>
        </div>
      </div>

      <!-- 设备动态表单 -->
      <div v-if="newRecord.inspectionType === 'equipment'" class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-gray-700 text-sm block mb-1">选择设备 <span class="text-red-500">*</span></label>
          <el-select :model-value="newRecord.equipmentId" @update:model-value="handleEquipmentSelect" class="w-full" placeholder="请选择设备">
            <el-option v-for="eq in equipmentRecords" :key="eq.id" :value="eq.id" :label="`${eq.name} - ${eq.location}`" />
          </el-select>
        </div>
        <div>
          <label class="text-gray-700 text-sm block mb-1">设备名称</label>
          <el-input :model-value="newRecord.equipmentName" readonly disabled placeholder="自动填充" />
        </div>
      </div>

      <!-- 基础设施动态表单 -->
      <div v-if="newRecord.inspectionType === 'infrastructure'" class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-gray-700 text-sm block mb-1">选择基础设施 <span class="text-red-500">*</span></label>
          <el-select :model-value="newRecord.infrastructureId" @update:model-value="handleInfrastructureSelect" class="w-full" placeholder="请选择基础设施">
            <el-option v-for="inf in infrastructureRecords" :key="inf.id" :value="inf.id" :label="`${inf.name} - ${inf.type}`" />
          </el-select>
        </div>
        <div>
          <label class="text-gray-700 text-sm block mb-1">设施名称</label>
          <el-input :model-value="newRecord.infrastructureName" readonly disabled placeholder="自动填充" />
        </div>
      </div>

      <!-- 其他说明 -->
      <div v-if="newRecord.inspectionType === 'other'">
        <label class="text-gray-700 text-sm block mb-1">其他说明</label>
        <el-input :model-value="newRecord.remarks" @update:model-value="update('remarks', $event)" type="textarea" :rows="3" placeholder="请输入其他巡查类型的具体说明" />
      </div>

      <!-- 巡查人员和关联批次 -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-gray-700 text-sm block mb-1">巡查人员</label>
          <el-input :model-value="getUserName(newRecord.inspectorId)" readonly disabled />
        </div>
        <div>
          <label class="text-gray-700 text-sm block mb-1">关联生产计划批次</label>
          <el-select :model-value="newRecord.batchId" @update:model-value="update('batchId', $event)" class="w-full" placeholder="不关联批次">
            <el-option value="__none__" label="不关联批次" />
            <el-option v-for="b in activeBatches" :key="b.id" :value="b.id" :label="`${b.batchCode} - ${b.cropName}`" />
          </el-select>
        </div>
      </div>

      <!-- 日期、时间、时长 -->
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="text-gray-700 text-sm block mb-1">巡查日期 <span class="text-red-500">*</span></label>
          <el-date-picker :model-value="newRecord.checkDate" @update:model-value="update('checkDate', $event)" type="date" class="w-full" />
        </div>
        <div>
          <label class="text-gray-700 text-sm block mb-1">巡查时间</label>
          <el-time-picker :model-value="newRecord.checkTime" @update:model-value="update('checkTime', $event)" class="w-full" />
        </div>
        <div>
          <label class="text-gray-700 text-sm block mb-1">巡查时长(分钟)</label>
          <el-input-number :model-value="newRecord.duration" @update:model-value="update('duration', $event)" :min="0" placeholder="选填" class="w-full" controls-position="right" />
        </div>
      </div>

      <!-- 种植区域特有字段 -->
      <div v-if="newRecord.inspectionType === 'farm'" class="grid grid-cols-3 gap-4">
        <div>
          <label class="text-gray-700 text-sm block mb-1">作物状态</label>
          <el-select :model-value="newRecord.cropStatus" @update:model-value="update('cropStatus', $event)" class="w-full" placeholder="请选择作物状态">
            <el-option v-for="s in cropStatusOptions" :key="s" :value="s" :label="s" />
          </el-select>
        </div>
        <div>
          <label class="text-gray-700 text-sm block mb-1">株高(cm)</label>
          <el-input-number :model-value="newRecord.plantHeight" @update:model-value="update('plantHeight', $event)" :min="0" placeholder="选填" class="w-full" controls-position="right" />
        </div>
        <div>
          <label class="text-gray-700 text-sm block mb-1">叶片数</label>
          <el-input-number :model-value="newRecord.leafCount" @update:model-value="update('leafCount', $event)" :min="0" placeholder="选填" class="w-full" controls-position="right" />
        </div>
      </div>

      <!-- 环境参数 - 仅种植区域 -->
      <div v-if="newRecord.inspectionType === 'farm'" class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-medium text-gray-700 mb-3">环境参数</h4>
        <div class="grid grid-cols-4 gap-4">
          <div v-for="env in envFields" :key="env.key">
            <label class="text-gray-500 text-xs block mb-1">{{ env.label }}</label>
            <el-input-number :model-value="newRecord[env.key]" @update:model-value="update(env.key, $event)" :min="0" :precision="2" placeholder="0.00" class="w-full" controls-position="right" />
          </div>
        </div>
      </div>

      <!-- 巡查结果 -->
      <div class="border-t border-gray-200 pt-4">
        <label class="text-gray-700 text-sm block mb-1">巡查结果 <span class="text-red-500">*</span></label>
        <div class="flex gap-6">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" :checked="newRecord.inspectionResult === 'normal'" @change="setResult('normal')" class="w-5 h-5 rounded text-emerald-600" />
            <span :class="newRecord.inspectionResult === 'normal' ? 'text-emerald-600' : 'text-gray-700'" class="text-sm">正常</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" :checked="newRecord.inspectionResult === 'abnormal'" @change="setResult('abnormal')" class="w-5 h-5 rounded text-red-600" />
            <span :class="newRecord.inspectionResult === 'abnormal' ? 'text-red-600' : 'text-gray-700'" class="text-sm">异常</span>
          </label>
        </div>
      </div>

      <!-- 异常详情 -->
      <div v-if="newRecord.inspectionResult === 'abnormal'" class="border-t border-gray-200 pt-4 space-y-4">
        <!-- 问题分类 -->
        <div>
          <label class="text-gray-700 text-sm block mb-1">问题分类</label>
          <div class="flex flex-wrap gap-3">
            <label v-for="cat in issueCategoryOptions" :key="cat.value" :class="['flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer', isCategorySelected(cat.value) ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-600']">
              <input type="checkbox" :checked="isCategorySelected(cat.value)" @change="toggleCategory(cat.value)" class="w-4 h-4 rounded text-red-600" />
              <span class="text-sm">{{ cat.label }}</span>
            </label>
          </div>
        </div>

        <!-- 快速勾选问题 -->
        <div v-if="(newRecord.issueCategories || []).length === 1 && currentPresets.length > 0">
          <label class="text-gray-700 text-sm block mb-1">快速勾选问题</label>
          <div class="flex flex-wrap gap-2">
            <button v-for="preset in currentPresets" :key="preset" @click="togglePreset(preset)" :class="['px-3 py-1 rounded-full text-sm border', (newRecord.issuePresets || []).includes(preset) ? 'bg-red-100 border-red-300 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600']">{{ preset }}</button>
          </div>
        </div>

        <!-- 多分类提示 -->
        <div v-if="(newRecord.issueCategories || []).length >= 2" class="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p class="text-sm text-amber-700">已选择多个问题分类，请详细描述各种问题现象</p>
        </div>

        <!-- 问题描述 -->
        <div>
          <label class="text-gray-700 text-sm block mb-1">问题描述</label>
          <el-input :model-value="newRecord.issueText" @update:model-value="update('issueText', $event)" type="textarea" :rows="3" placeholder="请详细描述发现的问题" />
        </div>

        <!-- 严重程度 -->
        <div>
          <label class="text-gray-700 text-sm block mb-1">严重程度</label>
          <div class="flex gap-4">
            <label v-for="level in ['轻微', '中等', '严重']" :key="level" :class="['flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer', getSeverityBorderClass(level)]">
              <input type="radio" name="issueSeverity" :value="level" :checked="newRecord.issueSeverity === level" @change="update('issueSeverity', level)" class="sr-only" />
              <span class="text-sm font-medium">{{ level }}</span>
            </label>
          </div>
        </div>

        <!-- 反馈人员多选 -->
        <div>
          <label class="text-gray-700 text-sm block mb-1">反馈人员</label>
          <div class="flex flex-wrap gap-2 mb-2">
            <span v-for="userId in (newRecord.feedbackUsers || [])" :key="userId" class="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-full">
              {{ getUserName(userId) }}
              <el-button text size="small" @click="toggleFeedbackUser(userId)"><el-icon><Close /></el-icon></el-button>
            </span>
          </div>
          <el-select value="" @update:model-value="(val) => { if (val && val !== '__add__') toggleFeedbackUser(val) }" class="w-full" placeholder="+ 选择反馈人员">
            <el-option value="__add__" label="+ 选择反馈人员" />
            <el-option v-for="user in availableFeedbackUsers" :key="user.id" :value="user.id" :label="`${user.name} - ${user.role}`" />
          </el-select>
        </div>
      </div>

      <!-- 备注 -->
      <div>
        <label class="text-gray-700 text-sm block mb-1">备注</label>
        <el-input :model-value="newRecord.remarks" @update:model-value="update('remarks', $event)" type="textarea" :rows="2" placeholder="请输入巡查备注" />
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" @click="$emit('submit')">提交记录</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { Aim, Close } from '@element-plus/icons-vue'
import { ISSUE_CATEGORIES, ISSUE_PRESETS, CROP_STATUS_OPTIONS } from '@/types/farm/common'

const CROP_STATUS_LABELS = (CROP_STATUS_OPTIONS || []).map(s => typeof s === 'object' ? s.label : s)

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  newRecord: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
  greenhouses: { type: Array, default: () => [] },
  users: { type: Array, default: () => [] },
  cropTypes: { type: Array, default: () => [] },
  cropBatches: { type: Array, default: () => [] },
  equipmentRecords: { type: Array, default: () => [] },
  infrastructureRecords: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:newRecord', 'close', 'submit', 'generateCode', 'openQRScanner'])

const update = (key, value) => {
  emit('update:newRecord', { ...props.newRecord, [key]: value })
}

const setResult = (val) => {
  emit('update:newRecord', {
    ...props.newRecord,
    inspectionResult: val,
    feedbackRequired: val === 'abnormal',
  })
}

const getUserName = (id) => {
  const user = props.users.find(u => u.id === id)
  return user?.name || id || ''
}

const handleEquipmentSelect = (val) => {
  const eq = props.equipmentRecords.find(x => x.id === val)
  emit('update:newRecord', { ...props.newRecord, equipmentId: val, equipmentName: eq?.name || '' })
}

const handleInfrastructureSelect = (val) => {
  const inf = props.infrastructureRecords.find(x => x.id === val)
  emit('update:newRecord', { ...props.newRecord, infrastructureId: val, infrastructureName: inf?.name || '' })
}

const activeBatches = computed(() => (props.cropBatches || []).filter(b => b.status === 'active' || b.status === 'planning'))
const cropStatusOptions = computed(() => CROP_STATUS_LABELS)
const issueCategoryOptions = computed(() => (ISSUE_CATEGORIES || []).map(c => ({ value: c.value, label: c.label })))

const envFields = [
  { key: 'airTemperature', label: '空气温度(°C)' },
  { key: 'airHumidity', label: '空气湿度(%)' },
  { key: 'lightIntensity', label: '光照强度(lux)' },
  { key: 'co2Concentration', label: 'CO2浓度(ppm)' },
  { key: 'soilTemperature', label: '土壤温度(°C)' },
  { key: 'soilMoisture', label: '土壤湿度(%)' },
  { key: 'soilEc', label: '土壤EC(mS/cm)' },
  { key: 'soilPh', label: '土壤pH' },
]

const currentPresets = computed(() => {
  const cats = props.newRecord.issueCategories || []
  if (cats.length === 1 && ISSUE_PRESETS) {
    return ISSUE_PRESETS[cats[0]] || []
  }
  return []
})

const isCategorySelected = (val) => (props.newRecord.issueCategories || []).includes(val)

const toggleCategory = (val) => {
  const current = props.newRecord.issueCategories || []
  const next = current.includes(val) ? current.filter(c => c !== val) : [...current, val]
  emit('update:newRecord', { ...props.newRecord, issueCategories: next, issuePresets: [] })
}

const togglePreset = (preset) => {
  const current = props.newRecord.issuePresets || []
  const next = current.includes(preset) ? current.filter(p => p !== preset) : [...current, preset]
  emit('update:newRecord', { ...props.newRecord, issuePresets: next })
}

const toggleFeedbackUser = (userId) => {
  const current = props.newRecord.feedbackUsers || []
  const next = current.includes(userId) ? current.filter(id => id !== userId) : [...current, userId]
  emit('update:newRecord', { ...props.newRecord, feedbackUsers: next })
}

const availableFeedbackUsers = computed(() =>
  (props.users || []).filter(u => !(props.newRecord.feedbackUsers || []).includes(u.id))
)

const getSeverityBorderClass = (level) => {
  const selected = props.newRecord.issueSeverity === level
  if (selected) {
    if (level === '严重') return 'border-red-500 bg-red-50 text-red-700'
    if (level === '中等') return 'border-amber-500 bg-amber-50 text-amber-700'
    return 'border-gray-500 bg-gray-100 text-gray-700'
  }
  return 'border-gray-400'
}
</script>
