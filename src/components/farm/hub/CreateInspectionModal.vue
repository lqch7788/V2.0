<template>
  <!-- 新增巡查记录弹窗 -->
  <el-dialog
    :model-value="isOpen"
    title="新增记录"
    width="900px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @close="onClose"
    @open="handleOpen"
  >
    <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <!-- 巡查编号和扫码定位 -->
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            巡查编号 <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-2">
            <el-input
              v-model="localRecord.recordCode"
              placeholder="点击生成或手动输入"
              class="font-mono"
            />
            <el-button type="primary" size="small" @click="generateCode">
              生成
            </el-button>
          </div>
        </div>
        <div class="pt-6">
          <el-button type="primary" size="small" @click="onOpenQRScanner">
            <el-icon :size="16"><FullScreen /></el-icon>
            扫码定位
          </el-button>
        </div>
      </div>

      <!-- 巡查类型选择 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          巡查类型 <span class="text-red-500">*</span>
        </label>
        <el-select
          v-model="localRecord.inspectionType"
          placeholder="种植区域巡查"
          class="w-full"
          @change="onTypeChange"
        >
          <el-option value="farm" label="种植区域巡查" />
          <el-option value="equipment" label="设备保养巡查" />
          <el-option value="infrastructure" label="基础设施巡检" />
          <el-option value="other" label="其他" />
        </el-select>
      </div>

      <!-- 动态表单区域 - farm类型 -->
      <div v-if="localRecord.inspectionType === 'farm'" class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            巡查区域 <span class="text-red-500">*</span>
          </label>
          <el-select
            v-model="localRecord.greenhouseId"
            placeholder="请选择区域"
            class="w-full"
          >
            <el-option
              v-for="gh in greenhouses"
              :key="gh.id"
              :value="gh.id"
              :label="gh.name"
            />
          </el-select>
          <p v-if="errors.greenhouseId" class="text-xs text-red-500 mt-1">{{ errors.greenhouseId }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            作物名称 <span class="text-red-500">*</span>
          </label>
          <el-select
            v-model="localRecord.cropName"
            placeholder="请选择作物"
            class="w-full"
          >
            <el-option
              v-for="crop in cropTypes"
              :key="crop.id"
              :value="crop.name"
              :label="crop.name"
            />
          </el-select>
          <p v-if="errors.cropName" class="text-xs text-red-500 mt-1">{{ errors.cropName }}</p>
        </div>
      </div>

      <!-- 动态表单区域 - equipment类型 -->
      <div v-if="localRecord.inspectionType === 'equipment'" class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            选择设备 <span class="text-red-500">*</span>
          </label>
          <el-select
            v-model="localRecord.equipmentId"
            placeholder="请选择设备"
            class="w-full"
            @change="onEquipmentChange"
          >
            <el-option
              v-for="eq in equipmentRecords"
              :key="eq.id"
              :value="eq.id"
              :label="`${eq.name} - ${eq.location}`"
            />
          </el-select>
          <p v-if="errors.equipmentId" class="text-xs text-red-500 mt-1">{{ errors.equipmentId }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">设备名称</label>
          <el-input
            :model-value="localRecord.equipmentName"
            readonly
            placeholder="自动填充"
            class="bg-gray-50"
          />
        </div>
      </div>

      <!-- 动态表单区域 - infrastructure类型 -->
      <div v-if="localRecord.inspectionType === 'infrastructure'" class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            选择基础设施 <span class="text-red-500">*</span>
          </label>
          <el-select
            v-model="localRecord.infrastructureId"
            placeholder="请选择基础设施"
            class="w-full"
            @change="onInfrastructureChange"
          >
            <el-option
              v-for="inf in infrastructureRecords"
              :key="inf.id"
              :value="inf.id"
              :label="`${inf.name} - ${inf.type}`"
            />
          </el-select>
          <p v-if="errors.infrastructureId" class="text-xs text-red-500 mt-1">{{ errors.infrastructureId }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">设施名称</label>
          <el-input
            :model-value="localRecord.infrastructureName"
            readonly
            placeholder="自动填充"
            class="bg-gray-50"
          />
        </div>
      </div>

      <!-- 动态表单区域 - other类型 -->
      <div v-if="localRecord.inspectionType === 'other'">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          其他说明 <span class="text-red-500">*</span>
        </label>
        <el-input
          v-model="localRecord.remarks"
          type="textarea"
          :rows="3"
          placeholder="请输入其他巡查类型的具体说明"
        />
        <p v-if="errors.remarks" class="text-xs text-red-500 mt-1">{{ errors.remarks }}</p>
      </div>

      <!-- 巡查人员和关联批次 -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">巡查人员</label>
          <el-input
            :model-value="inspectorName"
            readonly
            class="bg-gray-50"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">关联生产计划批次</label>
          <el-select
            v-model="localRecord.batchId"
            placeholder="不关联批次"
            class="w-full"
          >
            <el-option value="__none__" label="不关联批次" />
            <el-option
              v-for="batch in filteredBatches"
              :key="batch.id"
              :value="batch.id"
              :label="`${batch.batchCode} - ${batch.cropName}`"
            />
          </el-select>
        </div>
      </div>

      <!-- 日期、时间、时长 -->
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            巡查日期 <span class="text-red-500">*</span>
          </label>
          <el-date-picker
            v-model="checkDateProxy"
            type="date"
            placeholder="选择日期"
            class="w-full"
            value-format="YYYY-MM-DD"
          />
          <p v-if="errors.checkDate" class="text-xs text-red-500 mt-1">{{ errors.checkDate }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">巡查时间</label>
          <el-time-picker
            v-model="checkTimeProxy"
            placeholder="选择时间"
            class="w-full"
            format="HH:mm"
            value-format="HH:mm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">巡查时长(分钟)</label>
          <el-input-number
            :model-value="localRecord.duration ? Number(localRecord.duration) : undefined"
            :min="0"
            placeholder="选填"
            class="w-full"
            @change="(val) => updateField('duration', val !== undefined && val !== null ? val : '')"
          />
        </div>
      </div>

      <!-- 种植区域特有字段 - farm类型 -->
      <div v-if="localRecord.inspectionType === 'farm'" class="grid grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">作物状态</label>
          <el-select
            v-model="localRecord.cropStatus"
            placeholder="请选择作物状态"
            class="w-full"
          >
            <el-option
              v-for="s in cropStatusLabels"
              :key="s"
              :value="s"
              :label="s"
            />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">株高(cm)</label>
          <el-input-number
            :model-value="localRecord.plantHeight ? Number(localRecord.plantHeight) : undefined"
            :min="0"
            :precision="1"
            placeholder="选填"
            class="w-full"
            @change="(val) => updateField('plantHeight', val !== undefined && val !== null ? val : '')"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">叶片数</label>
          <el-input-number
            :model-value="localRecord.leafCount ? Number(localRecord.leafCount) : undefined"
            :min="0"
            placeholder="选填"
            class="w-full"
            @change="(val) => updateField('leafCount', val !== undefined && val !== null ? val : '')"
          />
        </div>
      </div>

      <!-- 环境参数 - 仅farm类型 -->
      <div v-if="localRecord.inspectionType === 'farm'" class="border-t border-gray-200 pt-4 mt-4">
        <h4 class="text-sm font-medium text-gray-700 mb-3">环境参数</h4>
        <div class="grid grid-cols-4 gap-4">
          <div>
            <label class="block text-xs text-gray-600 mb-1">空气温度(°C)</label>
            <el-input-number
              :model-value="localRecord.airTemperature ? Number(localRecord.airTemperature) : undefined"
              :precision="2"
              placeholder="0.00"
              class="w-full"
              @change="(val) => updateField('airTemperature', val !== undefined && val !== null ? val : '')"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">空气湿度(%)</label>
            <el-input-number
              :model-value="localRecord.airHumidity ? Number(localRecord.airHumidity) : undefined"
              :precision="2"
              placeholder="0.00"
              class="w-full"
              @change="(val) => updateField('airHumidity', val !== undefined && val !== null ? val : '')"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">光照强度(lux)</label>
            <el-input-number
              :model-value="localRecord.lightIntensity ? Number(localRecord.lightIntensity) : undefined"
              :precision="2"
              placeholder="0.00"
              class="w-full"
              @change="(val) => updateField('lightIntensity', val !== undefined && val !== null ? val : '')"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">CO2浓度(ppm)</label>
            <el-input-number
              :model-value="localRecord.co2Concentration ? Number(localRecord.co2Concentration) : undefined"
              :precision="2"
              placeholder="0.00"
              class="w-full"
              @change="(val) => updateField('co2Concentration', val !== undefined && val !== null ? val : '')"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">土壤温度(°C)</label>
            <el-input-number
              :model-value="localRecord.soilTemperature ? Number(localRecord.soilTemperature) : undefined"
              :precision="2"
              placeholder="0.00"
              class="w-full"
              @change="(val) => updateField('soilTemperature', val !== undefined && val !== null ? val : '')"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">土壤湿度(%)</label>
            <el-input-number
              :model-value="localRecord.soilMoisture ? Number(localRecord.soilMoisture) : undefined"
              :precision="2"
              placeholder="0.00"
              class="w-full"
              @change="(val) => updateField('soilMoisture', val !== undefined && val !== null ? val : '')"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">土壤EC(mS/cm)</label>
            <el-input-number
              :model-value="localRecord.soilEc ? Number(localRecord.soilEc) : undefined"
              :precision="2"
              placeholder="0.00"
              class="w-full"
              @change="(val) => updateField('soilEc', val !== undefined && val !== null ? val : '')"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">土壤pH</label>
            <el-input-number
              :model-value="localRecord.soilPh ? Number(localRecord.soilPh) : undefined"
              :precision="2"
              placeholder="0.00"
              class="w-full"
              @change="(val) => updateField('soilPh', val !== undefined && val !== null ? val : '')"
            />
          </div>
        </div>
      </div>

      <!-- 巡查结果 -->
      <div class="border-t border-gray-200 pt-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          巡查结果 <span class="text-red-500">*</span>
        </label>
        <div class="flex gap-6">
          <label class="flex items-center gap-2 cursor-pointer" @click="setInspectionResult('normal')">
            <input
              type="checkbox"
              :checked="localRecord.inspectionResult === 'normal'"
              class="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              @change="setInspectionResult('normal')"
            />
            <span
              :class="[
                'text-sm font-medium transition-colors',
                localRecord.inspectionResult === 'normal' ? 'text-emerald-600' : 'text-gray-700'
              ]"
            >
              正常
            </span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer" @click="setInspectionResult('abnormal')">
            <input
              type="checkbox"
              :checked="localRecord.inspectionResult === 'abnormal'"
              class="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
              @change="setInspectionResult('abnormal')"
            />
            <span
              :class="[
                'text-sm font-medium transition-colors',
                localRecord.inspectionResult === 'abnormal' ? 'text-red-600' : 'text-gray-700'
              ]"
            >
              异常
            </span>
          </label>
        </div>
      </div>

      <!-- 异常详情 - 仅当异常时显示 -->
      <div v-if="localRecord.inspectionResult === 'abnormal'" class="border-t border-gray-200 pt-4 space-y-4">
        <!-- 问题分类 - 多选 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            问题分类 <span class="text-red-500">*</span>
          </label>
          <div class="flex flex-wrap gap-3">
            <label
              v-for="cat in issueCategories"
              :key="cat.value"
              :class="[
                'flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all',
                isIssueCategorySelected(cat.value)
                  ? 'border-red-400 bg-red-50 text-red-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-red-300'
              ]"
            >
              <input
                type="checkbox"
                :checked="isIssueCategorySelected(cat.value)"
                class="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                @change="toggleIssueCategory(cat.value)"
              />
              <span class="text-sm font-medium">{{ cat.label }}</span>
            </label>
          </div>
        </div>

        <!-- 单个分类时显示快速勾选问题 -->
        <div v-if="(localRecord.issueCategories || []).length === 1 && currentPresets.length > 0">
          <label class="block text-sm font-medium text-gray-700 mb-2">快速勾选问题</label>
          <div class="flex flex-wrap gap-2">
            <el-button
              v-for="preset in currentPresets"
              :key="preset"
              size="small"
              :class="[
                'rounded-full',
                (localRecord.issuePresets || []).includes(preset)
                  ? 'bg-red-100 border-red-300 text-red-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              ]"
              @click="togglePreset(preset)"
            >
              {{ preset }}
            </el-button>
          </div>
        </div>

        <!-- 多个分类时提示 -->
        <div v-if="(localRecord.issueCategories || []).length >= 2" class="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p class="text-sm text-amber-700">
            已选择多个问题分类，请在下方"问题描述"中详细输入各种问题现象
          </p>
        </div>

        <!-- 问题描述 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">问题描述</label>
          <el-input
            v-model="localRecord.issueText"
            type="textarea"
            :rows="3"
            :placeholder="(localRecord.issueCategories || []).length === 1 ? '请详细描述发现的问题' : '请详细描述各种问题现象'"
          />
        </div>

        <!-- 严重程度 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">严重程度</label>
          <div class="flex gap-4">
            <label
              v-for="level in severityLevels"
              :key="level"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all',
                localRecord.issueSeverity === level
                  ? level === '严重'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : level === '中等'
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-500 bg-gray-100 text-gray-700'
                  : 'border-gray-200 hover:border-gray-400'
              ]"
            >
              <input
                type="radio"
                name="issueSeverity"
                :value="level"
                :checked="localRecord.issueSeverity === level"
                class="sr-only"
                @change="updateField('issueSeverity', level)"
              />
              <span class="text-sm font-medium">{{ level }}</span>
            </label>
          </div>
        </div>

        <!-- 问题照片 -->
        <div>
          <label class="block text-sm text-gray-700 mb-2">问题照片 (最多6张)</label>
          <div class="space-y-3">
            <div class="flex gap-3 flex-wrap">
              <div
                v-for="(img, idx) in (localRecord.issuePhotos || [])"
                :key="idx"
                class="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-300"
              >
                <img :src="img" :alt="`问题照片${idx + 1}`" class="w-full h-full object-cover" />
                <el-button
                  type="danger"
                  size="small"
                  :icon="Close"
                  class="!absolute !top-0 !right-0 !w-5 !h-5 !rounded-none !rounded-bl-lg !p-0"
                  @click="removeIssuePhoto(idx)"
                />
              </div>
              <label
                v-if="(localRecord.issuePhotos || []).length < 6"
                class="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-red-500 hover:bg-red-50 transition-colors"
              >
                <el-icon :size="24" color="#9ca3af"><Camera /></el-icon>
                <span class="text-xs text-gray-400 mt-1">添加</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  class="hidden"
                  @change="handlePhotoUpload"
                />
              </label>
            </div>
            <p class="text-xs text-gray-500">已添加 {{ (localRecord.issuePhotos || []).length }}/6 张照片</p>
          </div>
        </div>

        <!-- 反馈人员多选 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            反馈人员 <span class="text-red-500">*</span>
          </label>
          <div class="flex flex-wrap gap-2 mb-2">
            <el-tag
              v-for="userId in (localRecord.feedbackUsers || [])"
              :key="userId"
              type="danger"
              closable
              @close="toggleFeedbackUser(userId)"
            >
              {{ getUserName(userId) }}
            </el-tag>
          </div>
          <el-select
            model-value=""
            placeholder="+ 选择反馈人员"
            class="w-full"
            @change="(val) => { if (val) toggleFeedbackUser(val) }"
          >
            <el-option value="__add__" label="+ 选择反馈人员" disabled />
            <el-option
              v-for="user in availableFeedbackUsers"
              :key="user.id"
              :value="user.id"
              :label="`${user.name} - ${user.role}`"
            />
          </el-select>
        </div>
      </div>

      <!-- 备注 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
        <el-input
          v-model="localRecord.remarks"
          type="textarea"
          :rows="3"
          placeholder="请输入巡查备注"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <el-button @click="onClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交记录</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Close, FullScreen, Camera } from '@element-plus/icons-vue'
import {
  WEATHER_OPTIONS,
  CROP_STATUS_OPTIONS,
  ISSUE_CATEGORIES,
  ISSUE_PRESETS,
} from '@/types/farm/common'

// ============================================
// 天气选项常量
// ============================================
const weatherOptionLabels = WEATHER_OPTIONS.map(w => w.label)
const cropStatusLabels = CROP_STATUS_OPTIONS.map(s => s.label)
const issueCategories = ISSUE_CATEGORIES.map(c => ({ value: c.value, label: c.label }))

// ============================================
// 严重程度选项
// ============================================
const severityLevels = ['轻微', '中等', '严重'] as const

// ============================================
// Props 定义
// ============================================
const props = defineProps({
  isOpen: { type: Boolean, default: false },
  onClose: { type: Function, required: true },
  onSubmit: { type: Function, required: true },
  newRecord: { type: Object, required: true },
  onNewRecordChange: { type: Function, required: true },
  errors: { type: Object, default: () => ({}) },
  generateRecordCode: { type: Function, required: true },
  onImageUpload: { type: Function, default: () => {} },
  onRemoveImage: { type: Function, default: () => {} },
  greenhouses: { type: Array, default: () => [] },
  users: { type: Array, default: () => [] },
  cropTypes: { type: Array, default: () => [] },
  cropBatches: { type: Array, default: () => [] },
  equipmentRecords: { type: Array, default: () => [] },
  infrastructureRecords: { type: Array, default: () => [] },
  onOpenQRScanner: { type: Function, default: () => {} },
})

// ============================================
// 内部本地记录（双向同步）
// ============================================
const localRecord = reactive({ ...props.newRecord })

// 弹窗打开时同步外部数据
const handleOpen = () => {
  Object.assign(localRecord, props.newRecord)
}

// 同步内部变化到外部
watch(localRecord, (newVal) => {
  props.onNewRecordChange({ ...newVal })
}, { deep: true })

// ============================================
// 计算属性
// ============================================
// 巡查人员名称
const inspectorName = computed(() => {
  const user = props.users.find(u => u.id === localRecord.inspectorId)
  return user ? user.name : ''
})

// 过滤活跃批次
const filteredBatches = computed(() => {
  return (props.cropBatches || []).filter(b => b.status === 'active' || b.status === 'planning')
})

// 可选反馈人员（排除已选）
const availableFeedbackUsers = computed(() => {
  const selectedIds = localRecord.feedbackUsers || []
  return (props.users || []).filter(u => !selectedIds.includes(u.id))
})

// 当前分类的预设选项（取第一个分类）
const currentPresets = computed(() => {
  if ((localRecord.issueCategories || []).length === 1) {
    return ISSUE_PRESETS[localRecord.issueCategories[0] as keyof typeof ISSUE_PRESETS] || []
  }
  return []
})

// 日期代理（Vue响应式兼容）
const checkDateProxy = computed({
  get: () => localRecord.checkDate ? new Date(localRecord.checkDate) : null,
  set: (val) => {
    if (val instanceof Date) {
      updateField('checkDate', val.toISOString().split('T')[0])
    } else if (typeof val === 'string') {
      updateField('checkDate', val)
    }
  },
})

// 时间代理（Vue响应式兼容）
const checkTimeProxy = computed({
  get: () => localRecord.checkTime || '',
  set: (val) => updateField('checkTime', val || ''),
})

// ============================================
// 方法
// ============================================
// 更新字段
const updateField = (field, value) => {
  const updated = { ...localRecord, [field]: value }
  props.onNewRecordChange(updated)
  Object.assign(localRecord, { [field]: value })
}

// 生成编号
const generateCode = () => {
  const code = props.generateRecordCode()
  updateField('recordCode', code)
}

// 巡查类型变更
const onTypeChange = (val) => {
  // 切换类型时重置相关字段
  const reset = {
    ...localRecord,
    inspectionType: val,
    greenhouseId: '',
    cropName: '',
    equipmentId: '',
    equipmentName: '',
    infrastructureId: '',
    infrastructureName: '',
  }
  props.onNewRecordChange(reset)
  Object.assign(localRecord, reset)
}

// 设备选择变更
const onEquipmentChange = (val) => {
  const eq = (props.equipmentRecords || []).find(x => x.id === val)
  const updated = {
    ...localRecord,
    equipmentId: val,
    equipmentName: eq?.name || '',
  }
  props.onNewRecordChange(updated)
  Object.assign(localRecord, updated)
}

// 基础设施选择变更
const onInfrastructureChange = (val) => {
  const inf = (props.infrastructureRecords || []).find(x => x.id === val)
  const updated = {
    ...localRecord,
    infrastructureId: val,
    infrastructureName: inf?.name || '',
  }
  props.onNewRecordChange(updated)
  Object.assign(localRecord, updated)
}

// 设置巡查结果
const setInspectionResult = (val) => {
  const updated = {
    ...localRecord,
    inspectionResult: val,
    feedbackRequired: val === 'abnormal',
  }
  props.onNewRecordChange(updated)
  Object.assign(localRecord, updated)
}

// 问题分类是否选中
const isIssueCategorySelected = (value) => {
  return (localRecord.issueCategories || []).includes(value)
}

// 切换问题分类
const toggleIssueCategory = (value) => {
  const current = localRecord.issueCategories || []
  let newCategories
  if (current.includes(value)) {
    newCategories = current.filter(c => c !== value)
  } else {
    newCategories = [...current, value]
  }
  const updated = { ...localRecord, issueCategories: newCategories, issuePresets: [] }
  props.onNewRecordChange(updated)
  Object.assign(localRecord, updated)
}

// 切换预设问题
const togglePreset = (preset) => {
  const current = localRecord.issuePresets || []
  let newPresets
  if (current.includes(preset)) {
    newPresets = current.filter(p => p !== preset)
  } else {
    newPresets = [...current, preset]
  }
  updateField('issuePresets', newPresets)
}

// 切换反馈人员
const toggleFeedbackUser = (userId) => {
  const current = localRecord.feedbackUsers || []
  let newUsers
  if (current.includes(userId)) {
    newUsers = current.filter(id => id !== userId)
  } else {
    newUsers = [...current, userId]
  }
  updateField('feedbackUsers', newUsers)
}

// 获取用户名
const getUserName = (userId) => {
  const user = props.users.find(u => u.id === userId)
  return user?.name || userId
}

// 删除问题照片
const removeIssuePhoto = (idx) => {
  const newPhotos = [...(localRecord.issuePhotos || [])]
  newPhotos.splice(idx, 1)
  updateField('issuePhotos', newPhotos)
}

// 处理照片上传
const handlePhotoUpload = (e) => {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  const currentCount = (localRecord.issuePhotos || []).length
  const remaining = 6 - currentCount
  Array.from(files).slice(0, remaining).forEach(file => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      const newPhotos = [...(localRecord.issuePhotos || []), result]
      updateField('issuePhotos', newPhotos)
    }
    reader.readAsDataURL(file)
  })
  ;(e.target as HTMLInputElement).value = ''
}

// 提交
const handleSubmit = () => {
  props.onSubmit()
}
</script>

<style scoped>
/* 隐藏 radio 的 screen-reader-only 隐藏 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
