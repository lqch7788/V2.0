<template>
  <!-- 2026-07-19 修复：对齐 PrintLabelModal pattern，加 :show-close + class + 响应式宽度 -->
  <el-dialog
    :model-value="visible"
    title="新增育苗"
    width="1170px"
    top="5vh"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    :show-close="false"
    class="print-label-modal seedling-dialog"
    v-dialog-draggable
    v-dialog-resizable
    v-dialog-maximizable
    @update:model-value="onModelValueChange"
    @close="handleClose"
  >
    <template #header>
      <div class="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 px-6 py-3 flex items-center justify-between cursor-move">
        <div class="flex items-center gap-3">
          <el-icon :size="20" style="color: white;"><Plus /></el-icon>
          <h3 class="text-lg font-semibold text-white">新增育苗</h3>
        </div>
        <button type="button" class="text-white hover:bg-emerald-700 rounded p-1 transition-colors" aria-label="关闭" @click="handleClose">
          <el-icon :size="20"><Close /></el-icon>
        </button>
      </div>
    </template>

    <!-- 内容区域 -->
    <div class="overflow-y-auto p-2">
        <div class="space-y-6">
          <!-- ========== 第一区：关联种源信息 ========== -->
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-3">
              <el-icon :size="16" style="color: #7c3aed;"><Link /></el-icon>
              <h3 class="text-sm font-semibold text-purple-900">关联种源信息</h3>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <!-- 关联种源（V1.1 L813-925 combogrid 4 列表格 popover，对齐 P0-Add-008 失效种源禁用） -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">
                  关联种源 <span class="text-red-500">*</span>
                </label>
                <el-select
                  v-model="formData.sourceId"
                  placeholder="请选择（搜索种源批号或作物名称）"
                  filterable
                  class="w-full"
                  @change="handleSourceChange"
                >
                  <template v-for="source in filteredSeedSources" :key="source.id">
                    <el-option
                      :label="`${source.seedCode} - ${source.cropName}（采购 ${source.quantity || 0}${source.unit || ''} / 剩余 ${source.availableCount || 0}${source.unit || ''}）${source.propagationStatus === 'failed' ? ' [已失败]' : ''}`"
                      :value="source.id"
                      :disabled="source.propagationStatus === 'failed' || (source.availableCount || 0) <= 0"
                    />
                  </template>
                </el-select>
                <p v-if="filteredSeedSources.length === 0" class="mt-1 text-xs text-gray-500">
                  请前往「种源管理」添加种源后，再返回此处选择。
                </p>
              </div>
              <!-- 来源类型（只读自动带入） -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">来源类型</label>
                <el-input v-model="formData.sourceType" readonly class="w-full !bg-gray-100" />
              </div>
              <!-- 供应商（只读自动带入） -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
                <el-input v-model="formData.supplierName" readonly class="w-full !bg-gray-100" />
              </div>
              <!-- 作物品种（可搜索选择） -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">
                  作物品种 <span class="text-red-500">*</span>
                </label>
                <el-select
                  v-model="formData.cropCode"
                  placeholder="请选择作物品种"
                  filterable
                  class="w-full"
                  @change="handleCropChange"
                >
                  <el-option
                    v-for="crop in cropOptions"
                    :key="crop.cropCode"
                    :label="crop.cropName"
                    :value="crop.cropCode"
                  />
                </el-select>
              </div>
              <!-- 作物名称（只读显示 cropName - cropVariety） -->
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">作物名称</label>
                <el-input
                  :model-value="cropDisplayName"
                  readonly
                  class="w-full !bg-gray-100"
                />
              </div>
              <!-- P0-MD-002：品种路径 4 段只读展示 -->
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">品种路径</label>
                <div class="flex items-center gap-1 px-3 py-2 bg-gray-50 rounded text-sm">
                  <span class="text-gray-400">{{ formData.categoryName || '-' }}</span>
                  <span class="text-gray-300">-</span>
                  <span class="text-gray-700">{{ formData.typeName || '-' }}</span>
                  <span class="text-gray-300">-</span>
                  <span class="text-gray-700">{{ formData.varietyName || '-' }}</span>
                  <span class="text-gray-300">-</span>
                  <span class="text-gray-900 font-medium">{{ formData.subVarietyName || '-' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ========== 第零区：繁殖模式（P0-MD-001，建档后锁定） ========== -->
          <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-3">
              <el-icon :size="16" style="color: #4f46e5;"><Connection /></el-icon>
              <h3 class="text-sm font-semibold text-indigo-900">
                繁殖模式 <span class="text-red-500">*</span>
                <span class="text-xs text-gray-500 ml-2 font-normal">建档后不可修改</span>
              </h3>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <label
                v-for="mode in PROPAGATION_MODES"
                :key="mode.value"
                class="flex items-start gap-2 p-3 border rounded-lg cursor-pointer transition-colors"
                :class="formData.propagationMode === mode.value
                  ? 'border-indigo-500 bg-indigo-100 ring-2 ring-indigo-200'
                  : 'border-gray-300 bg-white hover:border-indigo-300'"
              >
                <input
                  type="radio"
                  name="propagationMode"
                  :value="mode.value"
                  :checked="formData.propagationMode === mode.value"
                  @change="handlePropagationModeChange(mode.value)"
                  class="mt-1"
                />
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-900">{{ mode.label }}</div>
                  <div class="text-xs text-gray-500 mt-0.5">{{ mode.desc }}</div>
                </div>
              </label>
            </div>
          </div>

          <!-- ========== 第二区：场地与计划 ========== -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-3">
              <el-icon :size="16" style="color: #2563eb;"><Location /></el-icon>
              <h3 class="text-sm font-semibold text-blue-900">场地与计划</h3>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <!-- 育苗批次号（可手动编辑 + 生成按钮） -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">
                  育苗批次号 <span class="text-red-500">*</span>
                </label>
                <div class="flex gap-2">
                  <el-input
                    v-model="formData.seedlingCode"
                    placeholder="点击生成获取批次号"
                    class="flex-1"
                  />
                  <el-button type="primary" @click="handleGenerateCode">
                    <el-icon style="color: inherit;"><Refresh /></el-icon>
                    生成
                  </el-button>
                </div>
              </div>
              <!-- 关联生产计划（V1.1 L796：显示 variety 字段而非 cropName） -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">关联生产计划</label>
                <el-select
                  v-model="formData.productionPlanId"
                  placeholder="不关联（独立批次）"
                  clearable
                  class="w-full"
                  @change="handleProductionPlanChange"
                >
                  <!-- 2026-07-20：固定"不关联"选项（V1.1 L791-792） -->
                  <el-option label="不关联（独立批次）" value="__none__" />
                  <el-option
                    v-for="plan in filteredProductionPlans"
                    :key="plan.batchCode"
                    :label="`[${plan.planTypeName || '育苗计划'}] ${plan.batchCode} - ${plan.variety || plan.cropName || ''}`"
                    :value="plan.batchCode"
                  />
                </el-select>
              </div>
              <!-- 育苗区域 -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">
                  育苗区域 <span class="text-red-500">*</span>
                </label>
                <el-select v-model="formData.siteId" placeholder="请选择" class="w-full" @change="handleSiteChange">
                  <el-option v-for="site in siteOptions" :key="site.value" :label="site.label" :value="site.value" />
                </el-select>
              </div>
              <!-- 育苗方式 -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">
                  育苗方式 <span class="text-red-500">*</span>
                </label>
                <el-select v-model="formData.seedlingType" placeholder="请选择" class="w-full">
                  <el-option v-for="type in seedlingTypeOptions" :key="type.value" :label="type.label" :value="type.value" />
                </el-select>
              </div>
              <!-- P0-MD-005：计划类型（字典驱动，fallback 静态选项） -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">计划类型</label>
                <el-select v-model="formData.planType" placeholder="请选择" class="w-full">
                  <el-option
                    v-for="t in planTypeOptions"
                    :key="t.value"
                    :label="t.label"
                    :value="t.value"
                  />
                </el-select>
              </div>
              <!-- 开始日期 -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">
                  开始日期 <span class="text-red-500">*</span>
                </label>
                <el-date-picker
                  v-model="formData.startDate"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  class="w-full"
                />
              </div>
              <!-- 预计结束日期 -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">预计结束日期</label>
                <el-date-picker
                  v-model="formData.expectedEndDate"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  class="w-full"
                />
              </div>
              <!-- 2026-07-20 P0-Add-013：实际结束日期（V1.1 有此字段） -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">实际结束日期</label>
                <el-date-picker
                  v-model="formData.endDate"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  class="w-full"
                />
              </div>
              <!-- 2026-07-20 P0-Add-007：育苗周期（自动计算，只读） -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">育苗周期（天）</label>
                <el-input
                  :model-value="seedlingCycle > 0 ? `${seedlingCycle}天` : '请选择日期'"
                  readonly
                  class="w-full !bg-gray-100"
                />
              </div>
              <!-- 工时（小时） -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">工时（小时）</label>
                <el-input-number v-model="formData.workHours" :min="0" :step="0.5" class="w-full" />
              </div>
            </div>
          </div>

          <!-- ========== 第三区：数量与品质 ========== -->
          <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-3">
              <el-icon :size="16" style="color: #059669;"><DataAnalysis /></el-icon>
              <h3 class="text-sm font-semibold text-emerald-900">数量与品质</h3>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <!-- 2026-07-20 P0-Add-012：1:多 模式：母株数量（V1.1 L1004-1021） -->
              <div v-if="formData.propagationMode === 'one_to_many'">
                <label class="block text-sm font-medium text-gray-900 mb-1">
                  母株数量 <span class="text-red-500">*</span>
                  <span class="text-xs text-gray-500 ml-1">（匍匐茎/组培/扦插/分株）</span>
                </label>
                <el-input-number
                  v-model="formData.motherPlantCount"
                  :min="0"
                  :class="['w-full', motherCountExceeds ? '!border-red-500' : '']"
                />
                <p v-if="motherCountExceeds" class="text-xs text-red-500 mt-1">
                  超过种源可用数量（{{ sourceAvailableCount }}）
                </p>
              </div>
              <!-- 初始数量（1:1 模式） -->
              <div v-else>
                <label class="block text-sm font-medium text-gray-900 mb-1">
                  初始数量 <span class="text-red-500">*</span>
                </label>
                <el-input-number
                  v-model="formData.initialCount"
                  :min="0"
                  :class="['w-full', initialCountExceeds ? '!border-red-500' : '']"
                />
                <p v-if="initialCountExceeds" class="text-xs text-red-500 mt-1">
                  超过种源可用数量（{{ sourceAvailableCount }}）
                </p>
              </div>
              <!-- 目标成苗率(%) -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">
                  目标成苗率(%) <span class="text-red-500">*</span>
                </label>
                <el-input-number v-model="formData.targetSurvivalRate" :min="0" :max="100" :precision="1" class="w-full" />
              </div>
              <!-- 2026-07-20 P0-Add-004：扩繁倍数（1:多 模式） -->
              <div v-if="formData.propagationMode === 'one_to_many'">
                <label class="block text-sm font-medium text-gray-900 mb-1">
                  扩繁倍数 <span class="text-red-500">*</span>
                </label>
                <el-select v-model="formData.propagationMultiple" class="w-full" @change="handlePropagationMultipleChange">
                  <el-option
                    v-for="p in PROPAGATION_MULTIPLES"
                    :key="p.value"
                    :label="`${p.label} - ${p.description}`"
                    :value="p.value"
                  />
                </el-select>
              </div>
              <!-- 2026-07-20 P0-Add-005：自定义扩繁倍数（仅当选择"自定义"时显示） -->
              <div v-if="formData.propagationMode === 'one_to_many' && formData.propagationMultiple === 0">
                <label class="block text-sm font-medium text-gray-900 mb-1">
                  自定义扩繁倍数 <span class="text-red-500">*</span>
                </label>
                <el-input-number v-model="formData.customMultiple" :min="0" :precision="2" class="w-full" />
              </div>
              <!-- 2026-07-20 P0-Add-006：理论产量（自动计算，只读） -->
              <div v-if="formData.propagationMode === 'one_to_many'">
                <label class="block text-sm font-medium text-gray-700 mb-1">理论产量（株）</label>
                <el-input
                  :model-value="theoreticalYield > 0 ? theoreticalYield.toLocaleString() : '-'"
                  readonly
                  class="w-full !bg-gray-100"
                />
                <p class="text-xs text-gray-500 mt-1">母株数量 × 扩繁倍数</p>
              </div>
              <!-- 目标成苗数（自动计算，只读） -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">目标成苗数</label>
                <el-input
                  :model-value="targetSurvivalCount > 0 ? targetSurvivalCount.toLocaleString() : '-'"
                  readonly
                  class="w-full !bg-gray-100"
                />
              </div>
              <!-- 负责人 -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">负责人</label>
                <el-input v-model="formData.chargePerson" placeholder="请输入" class="w-full" />
              </div>
              <!-- P0-MD-003：种苗形态（V1.1 SEEDLING_FORM_MAP） -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">种苗形态</label>
                <el-select v-model="formData.seedlingForm" placeholder="请选择种苗形态（可选）" clearable class="w-full">
                  <el-option label="不指定" value="" />
                  <el-option
                    v-for="form in SEEDLING_FORM_OPTIONS"
                    :key="form.value"
                    :label="form.label"
                    :value="form.value"
                  />
                </el-select>
              </div>
              <!-- P0-MD-004：单位 -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">
                  单位 <span class="text-red-500">*</span>
                </label>
                <el-select v-model="formData.unit" placeholder="选择单位" class="w-full">
                  <el-option
                    v-for="u in unitOptions"
                    :key="u.value"
                    :label="u.label"
                    :value="u.value"
                  />
                </el-select>
              </div>
            </div>
          </div>

          <!-- ========== 第四区：备注与附件 ========== -->
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-3">
              <el-icon :size="16" style="color: #6b7280;"><Document /></el-icon>
              <h3 class="text-sm font-semibold text-gray-900">备注与附件</h3>
            </div>
            <div class="space-y-4">
              <!-- 备注 -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">备注</label>
                <el-input v-model="formData.remarks" type="textarea" :rows="3" placeholder="请输入备注信息" />
              </div>
              <!-- P0-MD-013：是否补录 -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">是否补录</label>
                <el-checkbox v-model="formData.isSupplementary">是（该育苗记录将提交审批审核）</el-checkbox>
                <p class="mt-1 text-xs text-amber-500">选择"是"时，该育苗记录将提交审批审核</p>
              </div>
              <!-- P0-MD-013：补录原因（仅当勾选补录时显示） -->
              <div v-if="formData.isSupplementary">
                <label class="block text-sm font-medium text-gray-900 mb-1">
                  补录原因 <span class="text-red-500">*</span>
                </label>
                <el-input
                  v-model="formData.supplementaryReason"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入补录原因，说明为什么需要补录此育苗记录"
                />
              </div>
              <!-- 图片上传 -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">图片上传</label>
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <el-upload
                    action="#"
                    :auto-upload="false"
                    :show-file-list="true"
                    multiple
                    accept="image/*"
                    list-type="picture-card"
                    :on-change="handlePictureChange"
                    :file-list="pictureList"
                  >
                    <el-icon><Plus /></el-icon>
                  </el-upload>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Plus, Close, Refresh, Link, Location, DataAnalysis, Document, Connection
} from '@element-plus/icons-vue'
import { useSeedlingStore, useSeedSourceStore, useProductionPlanStore } from '@/stores'
import { useApprovalStore } from '@/stores/modules/approval'
import * as cropVarietyService from '@/services/cropVarietyService'
import { addSeedlingWithDeduct } from '@/services/apiSeedlingService'
import { useTasks } from '@/composables/useTasks'
import { getDictItems } from '@/stores/modules/dictionary'
import { ApprovalType, ApprovalStatus } from '@/types/approval'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'success'])

// 2026-07-19 修复：el-dialog modelValue 变化处理
const onModelValueChange = (val) => {
  if (!val) emit('update:visible', false)
}

const seedlingStore = useSeedlingStore()
const seedSourceStore = useSeedSourceStore()
const productionPlanStore = useProductionPlanStore()
const approvalStore = useApprovalStore()
const tasksHook = useTasks()

const submitting = ref(false)
const seedSources = ref([])
const productionPlans = ref([])
const pictureList = ref([])

// 静态选项数据 - 育苗方式
const seedlingTypeOptions = [
  { value: '穴盘育苗', label: '穴盘育苗' },
  { value: '嫁接育苗', label: '嫁接育苗' },
  { value: '组培育苗', label: '组培育苗' },
  { value: '直播育苗', label: '直播育苗' }
]

// 静态选项数据 - 场地
const siteOptions = [
  { value: '1号大棚', label: '1号大棚' },
  { value: '2号大棚', label: '2号大棚' },
  { value: '3号大棚', label: '3号大棚' },
  { value: '露天场地', label: '露天场地' }
]

// P0-MD-001：繁殖模式选项（V1.1 L131-134 1:1对齐）
const PROPAGATION_MODES = [
  { value: 'one_to_one', label: '1:1 育苗', desc: '一对一（种子 / 嫁接 / 单种球）' },
  { value: 'one_to_many', label: '1:多 育苗', desc: '母株+子苗（匍匐茎 / 组培 / 扦插 / 分株 / 块茎 / 枝条）' }
]

// P0-MD-003：种苗形态选项（V1.1 SEEDLING_FORM_MAP 对齐）
const SEEDLING_FORM_OPTIONS = [
  { value: 'flower', label: '花朵' },
  { value: 'branch', label: '枝条' },
  { value: 'bare_root', label: '裸根苗' },
  { value: 'plug', label: '穴盘苗' },
  { value: 'cup', label: '杯苗' },
  { value: 'potted', label: '盆栽苗' },
  { value: 'balled', label: '土球苗' },
  { value: 'seedling', label: '实生苗' },
  { value: 'other', label: '其他' }
]

// P0-MD-004：单位选项（V1.1 DictSelect category="unit" 对齐）
const unitOptions = [
  { value: '株', label: '株' },
  { value: '盆', label: '盆' },
  { value: '袋', label: '袋' },
  { value: '盒', label: '盒' }
]

// P0-MD-005：计划类型选项（字典驱动 seedling_plan_type）
const planTypeOptions = ref([
  { value: 'routine', label: '常规' },
  { value: 'urgent', label: '加急' }
])

// 加载计划类型字典
const loadPlanTypeOptions = () => {
  try {
    const items = getDictItems('seedling_plan_type')
    if (items && items.length > 0) {
      planTypeOptions.value = items.map(d => ({
        value: d.dictCode || d.code,
        label: d.dictLabel || d.name
      }))
    }
  } catch {
    // 字典加载失败时使用默认选项
  }
}

// 作物品种选项（从品种库服务获取）
const cropOptions = ref([])

// 加载作物品种数据
const loadCropOptions = async () => {
  try {
    // 使用 cropVarietyService 获取作物品种
    // getVarietyOptions 返回格式: { value: cropCode, label: varietyName, categoryName, typeName, ... }
    const varieties = cropVarietyService.getVarietyOptions() || []
    cropOptions.value = varieties.map(v => ({
      cropCode: v.value || '',
      cropName: v.label || '',
      categoryName: v.categoryName || '',
      typeName: v.typeName || '',
      varietyName: v.varietyName || '',
      subVariety1Name: v.subVariety1Name || ''
    }))
  } catch {
    cropOptions.value = []
  }
}

// 表单数据 - 对齐 V1.1 AddModal.tsx 全部字段（P0-MD-001~013）
const formData = ref({
  seedlingCode: '',
  productionPlanId: '',
  sourceId: '',
  sourceCode: '',
  sourceType: '',
  supplierName: '',
  cropCode: '',
  cropName: '',
  cropVariety: '',
  categoryName: '',  // P0-MD-002：品种路径
  typeName: '',
  varietyName: '',
  subVarietyName: '',
  seedlingType: '',
  siteId: '',
  siteName: '',
  startDate: '',
  expectedEndDate: '',
  // 2026-07-20 P0-Add-013：实际结束日期（V1.1 有此字段）
  endDate: '',
  initialCount: 0,
  targetSurvivalRate: 90,
  chargePerson: '',
  remarks: '',
  workHours: 0,
  planType: 'routine',
  propagationMode: 'one_to_one',  // P0-MD-001/006：繁殖模式默认 1:1
  seedlingForm: '',  // P0-MD-003：种苗形态
  unit: '株',  // P0-MD-004：单位
  // P0-MD-010：5 个数量体系字段
  motherPlantCount: 0, expandedPlantCount: 0, scionCount: 0,
  // 2026-07-20 P0-Add-004~006：扩繁倍数字段
  propagationMultiple: 1,
  customMultiple: 0,
  theoreticalYield: 0,
  motherLossCount: 0, seedlingLossCount: 0, harvestStockedCount: 0, replantCount: 0,
  // --- P0-MD-013：补录字段 ---
  isSupplementary: false,
  supplementaryReason: ''
})

// 2026-07-20 P0-Add-004：扩繁倍数选项（V1.1 L1117-1129 对齐）
const PROPAGATION_MULTIPLES = [
  { value: 1, label: '1 倍', description: '母株原样产出' },
  { value: 2, label: '2 倍', description: '母株 × 2' },
  { value: 3, label: '3 倍', description: '母株 × 3' },
  { value: 5, label: '5 倍', description: '母株 × 5' },
  { value: 10, label: '10 倍', description: '母株 × 10' },
  { value: 0, label: '自定义', description: '手动输入倍数' }
]

// 作物名称显示（只读，格式：cropName - cropVariety）
const cropDisplayName = computed(() => {
  if (formData.value.cropName) {
    return formData.value.cropVariety
      ? `${formData.value.cropName} - ${formData.value.cropVariety}`
      : formData.value.cropName
  }
  return '请选择作物品种'
})

// 计算目标成苗数（自动计算：initialCount × targetSurvivalRate / 100）
const targetSurvivalCount = computed(() => {
  if (formData.value.initialCount && formData.value.targetSurvivalRate) {
    return Math.round(formData.value.initialCount * (formData.value.targetSurvivalRate / 100))
  }
  return 0
})

// 2026-07-20 P0-Add-007：育苗周期（自动计算）= 预计结束日期 - 开始日期
const seedlingCycle = computed(() => {
  if (!formData.value.startDate || !formData.value.expectedEndDate) return 0
  const start = new Date(formData.value.startDate)
  const end = new Date(formData.value.expectedEndDate)
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
})

// 2026-07-20 P0-Add-010/011：初始数量超限（1:1 模式）
const initialCountExceeds = computed(() => {
  if (formData.value.propagationMode === 'one_to_many') return false
  return formData.value.initialCount > sourceAvailableCount.value
})

// 2026-07-20 P0-Add-011：母株数量超限（1:多 模式）
const motherCountExceeds = computed(() => {
  if (formData.value.propagationMode !== 'one_to_many') return false
  return formData.value.motherPlantCount > sourceAvailableCount.value
})

// 2026-07-20 P0-Add-006：理论产量（1:多 模式）= 母株数量 × 扩繁倍数
const theoreticalYield = computed(() => {
  if (formData.value.propagationMode !== 'one_to_many') return 0
  const multiple = formData.value.propagationMultiple === 0
    ? (formData.value.customMultiple || 0)
    : (formData.value.propagationMultiple || 0)
  return Math.round((formData.value.motherPlantCount || 0) * multiple)
})

// 2026-07-20 P0-Add-004：扩繁倍数变化时同步到 theoreticalYield
const handlePropagationMultipleChange = (val) => {
  formData.value.propagationMultiple = val
  formData.value.theoreticalYield = theoreticalYield.value
}

// P0-MD-007：联动过滤 — 选了种源后，生产计划下拉只显示同品种的计划
const productionPlanVarietyFilter = computed(() => {
  if (!formData.value.sourceId) return null
  const source = seedSources.value.find(s => s.id === formData.value.sourceId)
  return source?.cropName || null
})

const filteredProductionPlans = computed(() => {
  if (!productionPlanVarietyFilter.value) return productionPlans.value
  return productionPlans.value.filter(p =>
    p.variety === productionPlanVarietyFilter.value || p.cropName === productionPlanVarietyFilter.value
  )
})

// P0-MD-007：联动过滤 — 选了生产计划后，种源下拉只显示同品种的种源
const productionPlanVarietyFilterFromPlan = computed(() => {
  if (!formData.value.productionPlanId) return null
  const plan = productionPlans.value.find(p => p.batchCode === formData.value.productionPlanId)
  return plan?.variety || plan?.cropName || null
})

const filteredSeedSources = computed(() => {
  let list = seedSources.value || []
  if (productionPlanVarietyFilterFromPlan.value) {
    list = list.filter(s => s.cropName === productionPlanVarietyFilterFromPlan.value)
  }
  return list
})

// P0-MD-009：种源可用数量（用于数量上限校验）
const sourceAvailableCount = computed(() => {
  const source = seedSources.value.find(s => s.id === formData.value.sourceId)
  return source?.availableCount ?? 0
})

// 加载数据
const loadData = async () => {
  await seedSourceStore.loadItems()
  seedSources.value = seedSourceStore.items || []
  await productionPlanStore.fetchPlans()
  productionPlans.value = (productionPlanStore.plans || []).filter(p =>
    (p.batchStatus === 'published' || p.batchStatus === 'in_progress') &&
    p.planType === 'seedling'
  )
  // 加载作物品种数据
  await loadCropOptions()
  // P0-MD-005：加载计划类型字典
  loadPlanTypeOptions()
}

// 监听弹窗打开
watch(() => props.visible, (val) => {
  if (val) {
    loadData()
  }
})

/**
 * 生成批次号 - V1.1逻辑
 * 格式：YM+年月日-随机数，如 YM20260525-123
 */
const handleGenerateCode = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  formData.value.seedlingCode = `YM${year}${month}${day}-${random}`
}

/**
 * P0-MD-001：繁殖模式切换 — 自动联动 calculateMode
 */
const handlePropagationModeChange = (mode) => {
  formData.value.propagationMode = mode
  formData.value.calculateMode = mode === 'one_to_many' ? 'propagation' : 'single'
  formData.value.initialCount = 0
  formData.value.motherPlantCount = 0
  formData.value.expandedPlantCount = 0
  formData.value.scionCount = 0
}

/**
 * P0-MD-007：生产计划切换 — 联动过滤种源 + P0-MD-008 一致性校验
 */
const handleProductionPlanChange = (planId) => {
  if (!planId) return
  // 一致性校验：已选种源则检查品种是否匹配
  if (formData.value.sourceId) {
    const plan = productionPlans.value.find(p => p.batchCode === planId)
    const source = seedSources.value.find(s => s.id === formData.value.sourceId)
    if (plan && source && source.cropName !== (plan.variety || plan.cropName)) {
      formData.value.sourceId = ''
      formData.value.sourceCode = ''
      formData.value.sourceType = ''
      formData.value.supplierName = ''
      ElMessage.warning(`已选种源 [${source.seedCode}] 为 ${source.cropName}，与新生产计划不匹配，已自动清空关联种源。`)
    }
  }
}

/**
 * P0-MD-008：选择种源后自动填充 + 品种一致性校验
 * 自动带入：sourceCode, sourceType, supplierName, cropCode, cropName, cropVariety
 */
const handleSourceChange = (sourceId) => {
  const source = seedSources.value.find(s => s.id === sourceId)
  if (source) {
    // P0-MD-008：一致性校验 — 选种源后，若已选生产计划不匹配则清空
    const currentPlanId = formData.value.productionPlanId
    let shouldClearPlan = false
    let mismatchPlan = null
    if (currentPlanId) {
      const plan = productionPlans.value.find(p => p.batchCode === currentPlanId)
      if (plan && (plan.variety || plan.cropName) !== source.cropName) {
        shouldClearPlan = true
        mismatchPlan = { batchCode: plan.batchCode, variety: plan.variety || plan.cropName }
      }
    }

    formData.value.sourceCode = source.seedCode || ''
    formData.value.sourceType = source.sourceType || ''
    formData.value.supplierName = source.supplierName || '无'
    formData.value.cropCode = source.cropCode || ''
    formData.value.cropName = source.cropName || ''
    formData.value.cropVariety = source.cropVariety || ''
    formData.value.categoryName = source.categoryName || ''
    formData.value.typeName = source.typeName || ''
    formData.value.varietyName = source.varietyName || ''
    formData.value.subVarietyName = source.subVarietyName || ''
    formData.value.productionPlanId = shouldClearPlan ? '' : formData.value.productionPlanId

    if (shouldClearPlan && mismatchPlan) {
      ElMessage.warning(`已选生产计划 [${mismatchPlan.batchCode}] 品种为 ${mismatchPlan.variety}，与新种源 ${source.cropName} 不一致，已自动清空关联计划。`)
    }
  }
}

/**
 * 选择作物品种变化
 */
const handleCropChange = (cropCode) => {
  const crop = cropOptions.value.find(c => c.cropCode === cropCode)
  if (crop) {
    formData.value.cropName = crop.cropName
    formData.value.cropVariety = ''
    // P0-MD-002：自动填充品种路径
    formData.value.categoryName = crop.categoryName || ''
    formData.value.typeName = crop.typeName || ''
    formData.value.varietyName = crop.varietyName || ''
    formData.value.subVarietyName = crop.subVariety1Name || ''
  }
}

/**
 * 选择场地变化 - 获取场地名称
 */
const handleSiteChange = (siteId) => {
  const site = siteOptions.find(s => s.value === siteId)
  formData.value.siteName = site?.label || ''
}

/**
 * 图片上传变化
 */
const handlePictureChange = (file, files) => {
  pictureList.value = files
}

/**
 * 关闭弹窗
 */
const handleClose = () => {
  emit('update:visible', false)
}

/**
 * 提交表单 - V1.1逻辑（P0-MD-009/010/011/012/013 完整实现）
 */
const handleSubmit = async () => {
  // 基本验证
  if (!formData.value.sourceId) {
    ElMessage.warning('请先选择种源')
    return
  }
  if (!formData.value.cropName || !formData.value.siteId) {
    ElMessage.warning('请填写完整信息：作物品种、育苗区域为必填项')
    return
  }
  if (!formData.value.seedlingCode) {
    ElMessage.warning('请先生成育苗批次号')
    return
  }
  if (!formData.value.startDate) {
    ElMessage.warning('请选择开始日期')
    return
  }

  // 根据 calculateMode 分别校验（与V1.1 L365-392对齐）
  if (formData.value.calculateMode === 'single') {
    if (!formData.value.initialCount || formData.value.initialCount <= 0) {
      ElMessage.warning('请输入初始数量')
      return
    }
    if (formData.value.sourceId && formData.value.initialCount > sourceAvailableCount.value) {
      ElMessage.warning(`初始数量 ${formData.value.initialCount} 超过种源可用数量 ${sourceAvailableCount.value}，请调整`)
      return
    }
  }
  if (formData.value.calculateMode === 'propagation') {
    if (!formData.value.motherPlantCount || formData.value.motherPlantCount <= 0) {
      ElMessage.warning('请输入母株数量')
      return
    }
    if (formData.value.sourceId && formData.value.motherPlantCount > sourceAvailableCount.value) {
      ElMessage.warning(`母株数量 ${formData.value.motherPlantCount} 超过种源可用数量 ${sourceAvailableCount.value}，请调整`)
      return
    }
    if (formData.value.propagationMultiple === 0) {
      if (!formData.value.customMultiple || formData.value.customMultiple <= 0) {
        ElMessage.warning('请输入扩繁倍数')
        return
      }
    }
  }

  // P0-MD-009：两池分离校验
  if (formData.value.propagationMode === 'one_to_many') {
    if ((formData.value.motherPlantCount || 0) < 0) {
      ElMessage.warning('母株数量不能为负数')
      return
    }
    if (formData.value.motherLossCount > formData.value.motherPlantCount) {
      ElMessage.warning('母株损耗不能超过母株总数')
      return
    }
  } else {
    if ((formData.value.initialCount || 0) <= 0) {
      ElMessage.warning('请输入初始数量')
      return
    }
    const totalLoss = (formData.value.motherLossCount || 0) + (formData.value.seedlingLossCount || 0)
    if (totalLoss > formData.value.initialCount) {
      ElMessage.warning('母株损耗 + 小苗损耗不能超过初始数量')
      return
    }
  }

  // P0-MD-013：补录原因校验
  if (formData.value.isSupplementary && !formData.value.supplementaryReason.trim()) {
    ElMessage.warning('请填写补录原因')
    return
  }

  submitting.value = true
  try {
    // 获取场地名称
    const site = siteOptions.find(s => s.value === formData.value.siteId)
    const siteName = site?.label || ''

    // 获取种源
    const source = seedSources.value.find(s => s.id === formData.value.sourceId)
    const sourceCode = source?.seedCode || ''

    // P0-MD-010：根据 propagationMode 决定 finalInitialCount（V1.1 L415-418）
    const isOneToMany = formData.value.propagationMode === 'one_to_many'
    const finalInitialCount = isOneToMany
      ? formData.value.motherPlantCount
      : formData.value.initialCount

    // 计算实际扩繁倍数
    const actualMultiple = formData.value.calculateMode === 'propagation'
      ? (formData.value.propagationMultiple === 0 ? formData.value.customMultiple : formData.value.propagationMultiple)
      : undefined

    // P0-MD-010：构建完整提交数据（对齐 V1.1 L427-469 全部字段，camelCase for with-deduct）
    const seedlingData = {
      seedlingCode: formData.value.seedlingCode,
      sourceId: formData.value.sourceId,
      sourceCode: sourceCode,
      productionPlanCode: formData.value.productionPlanId || '',
      cropName: formData.value.cropName,
      cropVariety: formData.value.cropVariety,
      cropCode: formData.value.cropCode,
      unit: formData.value.unit || '株',
      seedlingType: formData.value.seedlingType,
      siteId: formData.value.siteId,
      siteName: siteName,
      startDate: formData.value.startDate,
      expectedEndDate: formData.value.expectedEndDate || undefined,
      initialCount: finalInitialCount,
      survivalCount: 0,
      survivalRate: 0,
      lossCount: 0,
      lossRate: 0,
      isFinished: false,
      status: 'in_progress',
      dailyRecords: [],
      pictures: pictureList.value.map(f => f.url || ''),
      printCount: 0,
      remarks: formData.value.remarks,
      createBy: localStorage.getItem('username') || '管理员',
      planType: formData.value.planType,
      targetSurvivalRate: formData.value.targetSurvivalRate,
      targetSurvivalCount: targetSurvivalCount.value,
      chargePerson: formData.value.chargePerson || undefined,
      workHours: formData.value.workHours || undefined,
      calculateMode: formData.value.calculateMode,
      propagationMultiple: actualMultiple,
      theoreticalYield: formData.value.calculateMode === 'propagation' ? ((formData.value.motherPlantCount * (actualMultiple || 0)) || 0) : undefined,
      propagationMode: formData.value.propagationMode,
      motherPlantCount: finalInitialCount,
      expandedPlantCount: formData.value.expandedPlantCount || 0,
      scionCount: formData.value.scionCount || 0,
      motherLossCount: formData.value.motherLossCount || 0,
      seedlingLossCount: formData.value.seedlingLossCount || 0,
      harvestStockedCount: formData.value.harvestStockedCount || 0,
      customMultiple: formData.value.customMultiple || 0,
      seedlingForm: formData.value.seedlingForm || undefined
    }

    // P0-MD-011：使用 with-deduct 原子端点（扣减种源 + 创建育苗）
    let addedSeedlingId = null
    try {
      const deductCount = finalInitialCount
      const result = await addSeedlingWithDeduct({
        sourceId: formData.value.sourceId,
        count: deductCount,
        seedling: seedlingData
      })
      addedSeedlingId = result?.id || result?.data?.id || null
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      ElMessage.error(`保存失败：${msg}`)
      return
    }

    // P0-MD-012：创建草稿任务（供任务中心分派执行人）
    if (addedSeedlingId) {
      try {
        const unitLabel = formData.value.unit || '株'
        const workContent = `作物品种：${formData.value.cropVariety || formData.value.cropName}
育苗方式：${formData.value.seedlingType}
初始数量：${formData.value.initialCount}${unitLabel}
目标成活率：${formData.value.targetSurvivalRate}%
目标成活数量：${targetSurvivalCount.value}${unitLabel}
${formData.value.calculateMode === 'propagation' ? `扩繁模式：母株${formData.value.motherPlantCount}${unitLabel} × ${actualMultiple}倍` : ''}`

        await tasksHook.createTask({
          title: `【育苗】${formData.value.cropName}-${formData.value.seedlingCode}`,
          type: 'seedling',
          typeName: '育苗任务',
          sourceType: 'dispatch',
          sourceId: addedSeedlingId,
          sourceCode: formData.value.seedlingCode,
          remarks: workContent,
          siteName: siteName,
          startDate: formData.value.startDate,
          endDate: formData.value.expectedEndDate,
          initialCount: formData.value.initialCount,
          targetSurvivalCount: targetSurvivalCount.value
        }, 'farm', 'draft')
      } catch (taskError) {
        console.warn('[AddModal] 创建草稿任务失败（不影响育苗创建）:', taskError)
      }
    }

    // P0-MD-013：补录审批流程
    if (formData.value.isSupplementary && addedSeedlingId) {
      try {
        const approvalSuffix = crypto.randomUUID().slice(0, 8)
        const now = new Date()
        const approvalCode = `YM-SUP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${approvalSuffix}`
        const approval = {
          id: `APPROVAL-${approvalSuffix}`,
          code: approvalCode,
          type: ApprovalType.SEEDLING_SUPPLEMENTARY,
          title: `育苗补录申请 - ${formData.value.seedlingCode}`,
          description: `育苗补录申请：${formData.value.cropName}，初始数量：${formData.value.initialCount}${formData.value.unit}，育苗区域：${siteName}，补录原因：${formData.value.supplementaryReason}`,
          status: ApprovalStatus.PENDING,
          applicantId: localStorage.getItem('userOid') || 'U013',
          applicantName: localStorage.getItem('username') || '未知用户',
          applicantDept: '生产部',
          createTime: now.toLocaleString('zh-CN'),
          updateTime: now.toLocaleString('zh-CN'),
          steps: [
            { id: 'STEP-001', name: '生产主管', status: 'pending', order: 1 },
            { id: 'STEP-002', name: '基地负责人', status: 'pending', order: 2 }
          ],
          currentStep: 1,
          businessLink: {
            type: 'seedling',
            requestCode: formData.value.seedlingCode,
            requestId: addedSeedlingId
          },
          supplementaryData: {
            reason: formData.value.supplementaryReason,
            quantity: formData.value.initialCount,
            cropName: formData.value.cropName,
            siteName: siteName
          }
        }
        await approvalStore.addApproval(approval)
      } catch (approvalError) {
        console.warn('[AddModal] 创建补录审批失败（不影响育苗创建）:', approvalError)
      }
    }

    ElMessage.success('创建成功')
    emit('success')
    handleClose()
  } catch (error) {
    console.error('创建育苗记录失败:', error)
    ElMessage.error('创建失败')
  } finally {
    submitting.value = false
  }
}
</script>
