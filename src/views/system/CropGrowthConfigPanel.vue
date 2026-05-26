<template>
  <div class="space-y-4">
    <!-- 工具栏 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <button
          @click="activePanel = 'crops'"
          :class="[
            'px-3 py-1.5 rounded-lg text-base font-medium transition-colors',
            activePanel === 'crops' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          生长配置
        </button>
        <button
          @click="activePanel = 'pests'"
          :class="[
            'px-3 py-1.5 rounded-lg text-base font-medium transition-colors',
            activePanel === 'pests' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          虫害规则 ({{ editingRules.length }})
        </button>
        <button
          @click="activePanel = 'stages'"
          :class="[
            'px-3 py-1.5 rounded-lg text-base font-medium transition-colors',
            activePanel === 'stages' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          阶段天数
        </button>
      </div>
      <div class="flex items-center gap-2">
        <template v-if="isEditing">
          <span v-if="dirty" class="text-sm text-amber-600 flex items-center gap-1">
            <el-icon><WarningFilled /></el-icon>
            有未保存的修改
          </span>
          <el-button size="small" @click="initData" :disabled="!dirty">
            <el-icon><RefreshRight /></el-icon>
            重置
          </el-button>
          <el-button size="small" @click="cancelEdit">
            <el-icon><Close /></el-icon>
            取消
          </el-button>
          <el-button size="small" type="primary" @click="handleSave" :disabled="!dirty || saving">
            <el-icon><Select /></el-icon>
            {{ saving ? '保存中...' : '保存' }}
          </el-button>
        </template>
        <el-button v-else size="small" type="primary" @click="enterEditMode">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
      </div>
    </div>

    <!-- ========== 生长配置面板 ========== -->
    <div v-if="activePanel === 'crops'" class="bg-white rounded-lg border">
      <!-- 作物Tab -->
      <div class="flex items-center border-b px-3 py-2 gap-1 overflow-x-auto">
        <div
          v-for="(crop, idx) in editingConfigs"
          :key="crop.name"
          class="flex items-center"
        >
          <button
            @click="activeCropIdx = idx"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              idx === activeCropIdx ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-gray-100 text-gray-600'
            ]"
          >
            {{ crop.name }}
          </button>
          <el-button
            v-if="isEditing && editingConfigs.length > 1"
            size="small"
            link
            type="danger"
            @click="removeCrop(idx)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
        <button
          v-if="isEditing"
          @click="addCrop"
          class="px-2 py-1.5 rounded-lg text-sm text-emerald-600 hover:bg-emerald-50 font-medium whitespace-nowrap"
        >
          <el-icon><Plus /></el-icon> 添加作物
        </button>
      </div>

      <!-- 阶段列表 -->
      <div class="divide-y">
        <div v-for="(stage, stageIdx) in activeCrop?.stages" :key="stage.stage">
          <!-- 阶段头部 -->
          <div
            class="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer"
            @click="toggleStage(stage.stage)"
          >
            <el-icon :size="16" color="#9ca3af">
              <component :is="collapsedStages.has(stage.stage) ? 'CaretRight' : 'CaretBottom'" />
            </el-icon>
            <span class="font-medium text-gray-800 text-base">{{ STAGE_LABELS[stage.stage] || stage.stage }}</span>
            <span class="text-sm text-gray-400">第</span>
            <el-input-number
              :model-value="stage.startDay"
              @update:model-value="v => updateStage(activeCropIdx, stageIdx, 'startDay', v)"
              @click.stop
              :min="1"
              :controls="false"
              :disabled="!isEditing"
              class="w-20"
              size="small"
            />
            <span class="text-sm text-gray-400">~</span>
            <el-input-number
              :model-value="stage.endDay"
              @update:model-value="v => updateStage(activeCropIdx, stageIdx, 'endDay', v)"
              @click.stop
              :min="1"
              :controls="false"
              :disabled="!isEditing"
              class="w-20"
              size="small"
            />
            <span class="text-sm text-gray-400">天</span>
            <span class="text-sm text-gray-400 ml-auto">{{ stage.tasks?.length || 0 }} 个任务</span>
          </div>

          <!-- 任务表格 -->
          <div v-if="!collapsedStages.has(stage.stage)" class="px-4 pb-3">
            <el-table :data="stage.tasks" stripe size="small">
              <el-table-column label="类型" width="180">
                <template #default="{ row }">
                  <el-select
                    :model-value="row.type"
                    @update:model-value="v => updateTask(activeCropIdx, stageIdx, row, 'type', v)"
                    :disabled="!isEditing"
                    class="w-full"
                    placeholder="选择..."
                  >
                    <el-option
                      v-for="opt in TASK_TYPE_OPTIONS"
                      :key="opt.code"
                      :label="opt.label"
                      :value="opt.code"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="名称" width="200">
                <template #default="{ row }">
                  <el-input
                    :model-value="row.typeName"
                    @update:model-value="v => updateTask(activeCropIdx, stageIdx, row, 'typeName', v)"
                    :disabled="!isEditing"
                    placeholder="如灌溉"
                  />
                </template>
              </el-table-column>
              <el-table-column label="频率(天)" width="140">
                <template #default="{ row }">
                  <el-input-number
                    :model-value="row.frequency"
                    @update:model-value="v => updateTask(activeCropIdx, stageIdx, row, 'frequency', v)"
                    :min="1"
                    :controls="false"
                    :disabled="!isEditing"
                    class="w-full"
                  />
                </template>
              </el-table-column>
              <el-table-column label="工时(h)" width="140">
                <template #default="{ row }">
                  <el-input-number
                    :model-value="row.estimatedHours"
                    @update:model-value="v => updateTask(activeCropIdx, stageIdx, row, 'estimatedHours', v)"
                    :min="0.5"
                    :step="0.5"
                    :controls="false"
                    :disabled="!isEditing"
                    class="w-full"
                  />
                </template>
              </el-table-column>
              <el-table-column label="优先级" width="140">
                <template #default="{ row }">
                  <el-select
                    :model-value="row.priority"
                    @update:model-value="v => updateTask(activeCropIdx, stageIdx, row, 'priority', v)"
                    :disabled="!isEditing"
                    class="w-full"
                  >
                    <el-option label="高" value="high" />
                    <el-option label="中" value="medium" />
                    <el-option label="低" value="low" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="技能要求" width="240">
                <template #default="{ row }">
                  <el-input
                    :model-value="(row.skillRequired || []).join(', ')"
                    @update:model-value="v => updateTask(activeCropIdx, stageIdx, row, 'skillRequired', v.split(',').map(s => s.trim()).filter(Boolean))"
                    :disabled="!isEditing"
                    placeholder="用逗号分隔"
                  />
                </template>
              </el-table-column>
              <el-table-column label="说明">
                <template #default="{ row }">
                  <el-input
                    :model-value="row.description"
                    @update:model-value="v => updateTask(activeCropIdx, stageIdx, row, 'description', v)"
                    :disabled="!isEditing"
                    placeholder="任务说明"
                  />
                </template>
              </el-table-column>
              <el-table-column label="" width="40" v-if="isEditing">
                <template #default="{ $index }">
                  <el-button
                    size="small"
                    link
                    type="danger"
                    @click="removeTask(activeCropIdx, stageIdx, $index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button
              v-if="isEditing"
              size="small"
              type="primary"
              link
              @click="addTask(activeCropIdx, stageIdx)"
              class="mt-2"
            >
              <el-icon><Plus /></el-icon> 添加任务
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 虫害规则面板 ========== -->
    <div v-if="activePanel === 'pests'" class="bg-white rounded-lg border">
      <el-table :data="editingRules" stripe size="small">
        <el-table-column prop="id" label="规则ID" width="120">
          <template #default="{ row }">
            <el-input
              :model-value="row.id"
              @update:model-value="v => updateRule(row, 'id', v)"
              :disabled="!isEditing"
              class="font-mono"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" width="140">
          <template #default="{ row }">
            <el-input
              :model-value="row.name"
              @update:model-value="v => updateRule(row, 'name', v)"
              :disabled="!isEditing"
            />
          </template>
        </el-table-column>
        <el-table-column prop="symptom" label="症状关键词" width="180">
          <template #default="{ row }">
            <el-input
              :model-value="(row.symptom || []).join(', ')"
              @update:model-value="v => updateRule(row, 'symptom', v.split(',').map(s => s.trim()).filter(Boolean))"
              :disabled="!isEditing"
              placeholder="逗号分隔"
            />
          </template>
        </el-table-column>
        <el-table-column prop="cropType" label="适用作物" width="150">
          <template #default="{ row }">
            <el-input
              :model-value="(row.cropType || []).join(', ')"
              @update:model-value="v => updateRule(row, 'cropType', v.split(',').map(s => s.trim()).filter(Boolean))"
              :disabled="!isEditing"
              placeholder="逗号分隔"
            />
          </template>
        </el-table-column>
        <el-table-column prop="severity" label="严重度" width="90">
          <template #default="{ row }">
            <el-select
              :model-value="row.severity"
              @update:model-value="v => updateRule(row, 'severity', v)"
              :disabled="!isEditing"
              class="w-full"
            >
              <el-option label="高" value="high" />
              <el-option label="中" value="medium" />
              <el-option label="低" value="low" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="90">
          <template #default="{ row }">
            <el-select
              :model-value="row.priority"
              @update:model-value="v => updateRule(row, 'priority', v)"
              :disabled="!isEditing"
              class="w-full"
            >
              <el-option label="高" value="high" />
              <el-option label="中" value="medium" />
              <el-option label="低" value="low" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="suggestion" label="处理建议">
          <template #default="{ row }">
            <el-input
              :model-value="row.suggestion"
              @update:model-value="v => updateRule(row, 'suggestion', v)"
              :disabled="!isEditing"
            />
          </template>
        </el-table-column>
        <el-table-column label="" width="40" v-if="isEditing">
          <template #default="{ $index }">
            <el-button
              size="small"
              link
              type="danger"
              @click="removeRule($index)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="px-4 py-2 border-t bg-gray-50">
        <el-button
          v-if="isEditing"
          size="small"
          type="primary"
          link
          @click="addRule"
        >
          <el-icon><Plus /></el-icon> 添加虫害规则
        </el-button>
      </div>
    </div>

    <!-- ========== 阶段天数面板 ========== -->
    <div v-if="activePanel === 'stages'" class="bg-white rounded-lg border">
      <div class="p-6">
        <p class="text-sm text-gray-500 mb-5">
          各生长阶段的默认天数，用于预测任务时间线。各作物可在"生长配置"中覆盖。
        </p>
        <div class="grid grid-cols-5 gap-4">
          <div
            v-for="{ key, label } in stageItems"
            :key="key"
            class="space-y-1.5"
          >
            <label class="block text-sm font-medium text-gray-700 text-center">{{ label }}</label>
            <div class="flex items-center gap-1.5 justify-center">
              <el-input-number
                :model-value="editingStageDays[key] ?? 0"
                @update:model-value="v => updateStageDay(key, v)"
                :min="1"
                :controls="false"
                :disabled="!isEditing"
                class="w-20"
              />
              <span class="text-sm text-gray-400">天</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Edit,
  Delete,
  Plus,
  Select,
  Close,
  RefreshRight,
  WarningFilled,
  CaretBottom,
  CaretRight
} from '@element-plus/icons-vue'
import { useSystemConfigStore } from '@/stores/modules/systemConfig'

// ==================== 常量 ====================

/** 默认阶段配置 */
const DEFAULT_STAGES = [
  { stage: 'seedling', startDay: 1, endDay: 30, tasks: [] },
  { stage: 'vegetative', startDay: 31, endDay: 75, tasks: [] },
  { stage: 'flowering', startDay: 76, endDay: 105, tasks: [] },
  { stage: 'fruiting', startDay: 106, endDay: 145, tasks: [] },
  { stage: 'harvest', startDay: 146, endDay: 165, tasks: [] }
]

/** 默认任务配置 */
const DEFAULT_TASK = {
  type: '',
  typeName: '',
  frequency: 7,
  priority: 'medium',
  skillRequired: [],
  estimatedHours: 1,
  description: ''
}

/** 默认虫害规则 */
const DEFAULT_RULE = {
  id: '',
  name: '',
  symptom: [],
  cropType: [],
  severity: 'medium',
  suggestion: '',
  priority: 'medium'
}

/** 阶段标签 */
const STAGE_LABELS = {
  seedling: '幼苗期',
  vegetative: '营养生长期',
  flowering: '开花期',
  fruiting: '结果期',
  harvest: '采收期'
}

/** 任务类型选项 */
const TASK_TYPE_OPTIONS = [
  { code: 'irrigation', label: '灌溉' },
  { code: 'fertilization', label: '施肥' },
  { code: 'spraying', label: '喷药/病虫防治' },
  { code: 'weeding', label: '除草' },
  { code: 'pruning', label: '修剪/整枝' },
  { code: 'tillage', label: '翻耕/松土' },
  { code: 'inspection', label: '巡查' },
  { code: 'harvesting', label: '采收' },
  { code: 'transplanting', label: '移栽' },
  { code: 'sowing', label: '播种' },
  { code: 'mulching', label: '覆膜' },
  { code: 'pollination', label: '授粉' },
  { code: 'training', label: '绑蔓/吊蔓' },
  { code: 'cleaning', label: '清理残株' },
  { code: 'disinfection', label: '消毒' },
  { code: 'sampling', label: '取样检测' },
  { code: 'other', label: '其他任务' }
]

/** 阶段天数选项 */
const stageItems = [
  { key: 'seedling', label: '幼苗期' },
  { key: 'vegetative', label: '营养生长期' },
  { key: 'flowering', label: '开花期' },
  { key: 'fruiting', label: '结果期' },
  { key: 'harvest', label: '采收期' }
]

// ==================== Store ====================
const store = useSystemConfigStore()

// ==================== 状态 ====================
const activeCropIdx = ref(0)
const editingConfigs = ref([])
const editingRules = ref([])
const editingStageDays = ref({})
const activePanel = ref('crops')
const collapsedStages = ref(new Set())
const saving = ref(false)
const dirty = ref(false)
const isEditing = ref(false)

// ==================== 计算属性 ====================
const activeCrop = computed(() => editingConfigs.value[activeCropIdx.value])

// ==================== 初始化 ====================
onMounted(() => {
  loadData()
})

const loadData = () => {
  // 从store获取数据
  const cropConfigs = store.configs.find(c => c.configKey === 'crop.growth.crop-configs' && c.isActive)
  const pestRules = store.configs.find(c => c.configKey === 'crop.pest.alert-rules' && c.isActive)
  const stageDaysConfig = store.configs.find(c => c.configKey === 'crop.growth.stage-days' && c.isActive)

  try {
    editingConfigs.value = cropConfigs?.configValue ? JSON.parse(cropConfigs.configValue) : [{ name: '番茄', stages: JSON.parse(JSON.stringify(DEFAULT_STAGES)) }]
  } catch {
    editingConfigs.value = [{ name: '番茄', stages: JSON.parse(JSON.stringify(DEFAULT_STAGES)) }]
  }

  try {
    editingRules.value = pestRules?.configValue ? JSON.parse(pestRules.configValue) : []
  } catch {
    editingRules.value = []
  }

  try {
    editingStageDays.value = stageDaysConfig?.configValue ? JSON.parse(stageDaysConfig.configValue) : { seedling: 30, vegetative: 45, flowering: 30, fruiting: 40, harvest: 20 }
  } catch {
    editingStageDays.value = { seedling: 30, vegetative: 45, flowering: 30, fruiting: 40, harvest: 20 }
  }
}

/** 初始化编辑数据 */
const initData = () => {
  loadData()
  dirty.value = false
}

/** 进入编辑模式 */
const enterEditMode = () => {
  isEditing.value = true
  initData()
}

/** 取消编辑 */
const cancelEdit = () => {
  isEditing.value = false
  dirty.value = false
  initData()
}

/** 切换阶段折叠 */
const toggleStage = (stage) => {
  if (collapsedStages.value.has(stage)) {
    collapsedStages.value.delete(stage)
  } else {
    collapsedStages.value.add(stage)
  }
}

// ==================== 编辑方法 ====================

/** 更新作物 */
const updateCrop = (idx, field, value) => {
  editingConfigs.value[idx] = { ...editingConfigs.value[idx], [field]: value }
  dirty.value = true
}

/** 更新阶段 */
const updateStage = (cropIdx, stageIdx, field, value) => {
  const configs = [...editingConfigs.value]
  const stages = [...configs[cropIdx].stages]
  stages[stageIdx] = { ...stages[stageIdx], [field]: value }
  configs[cropIdx] = { ...configs[cropIdx], stages }
  editingConfigs.value = configs
  dirty.value = true
}

/** 更新任务 */
const updateTask = (cropIdx, stageIdx, task, field, value) => {
  const configs = [...editingConfigs.value]
  const stages = [...configs[cropIdx].stages]
  const taskIdx = stages[stageIdx].tasks.findIndex(t => t === task)
  if (taskIdx !== -1) {
    stages[stageIdx].tasks[taskIdx] = { ...stages[stageIdx].tasks[taskIdx], [field]: value }
    configs[cropIdx] = { ...configs[cropIdx], stages }
    editingConfigs.value = configs
    dirty.value = true
  }
}

/** 添加任务 */
const addTask = (cropIdx, stageIdx) => {
  const configs = [...editingConfigs.value]
  const stages = [...configs[cropIdx].stages]
  stages[stageIdx].tasks = [...(stages[stageIdx].tasks || []), { ...DEFAULT_TASK }]
  configs[cropIdx] = { ...configs[cropIdx], stages }
  editingConfigs.value = configs
  dirty.value = true
}

/** 删除任务 */
const removeTask = async (cropIdx, stageIdx, taskIdx) => {
  try {
    await ElMessageBox.confirm('确定要删除该任务吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const configs = [...editingConfigs.value]
    const stages = [...configs[cropIdx].stages]
    stages[stageIdx].tasks = stages[stageIdx].tasks.filter((_, i) => i !== taskIdx)
    configs[cropIdx] = { ...configs[cropIdx], stages }
    editingConfigs.value = configs
    dirty.value = true
  } catch {
    // 用户取消
  }
}

/** 添加作物 */
const addCrop = () => {
  const name = prompt('请输入新作物名称：')
  if (!name) return
  if (editingConfigs.value.some(c => c.name === name)) {
    ElMessage.warning('该作物已存在')
    return
  }
  editingConfigs.value = [...editingConfigs.value, { name, stages: JSON.parse(JSON.stringify(DEFAULT_STAGES)) }]
  activeCropIdx.value = editingConfigs.value.length - 1
  dirty.value = true
}

/** 删除作物 */
const removeCrop = async (idx) => {
  try {
    await ElMessageBox.confirm('确定要删除该作物吗？删除后无法恢复。', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    editingConfigs.value = editingConfigs.value.filter((_, i) => i !== idx)
    activeCropIdx.value = Math.max(0, idx - 1)
    dirty.value = true
  } catch {
    // 用户取消
  }
}

/** 更新虫害规则 */
const updateRule = (rule, field, value) => {
  const idx = editingRules.value.findIndex(r => r === rule)
  if (idx !== -1) {
    editingRules.value[idx] = { ...editingRules.value[idx], [field]: value }
    editingRules.value = [...editingRules.value]
    dirty.value = true
  }
}

/** 添加虫害规则 */
const addRule = () => {
  editingRules.value = [...editingRules.value, { ...DEFAULT_RULE, id: `pest_${Date.now()}` }]
  dirty.value = true
}

/** 删除虫害规则 */
const removeRule = (idx) => {
  editingRules.value = editingRules.value.filter((_, i) => i !== idx)
  dirty.value = true
}

/** 更新阶段天数 */
const updateStageDay = (stage, value) => {
  editingStageDays.value = { ...editingStageDays.value, [stage]: value }
  dirty.value = true
}

// ==================== 保存 ====================
const handleSave = async () => {
  saving.value = true
  try {
    // 查找config id
    const cropConfig = store.configs.find(c => c.configKey === 'crop.growth.crop-configs')
    const pestConfig = store.configs.find(c => c.configKey === 'crop.pest.alert-rules')
    const stageDaysConfig = store.configs.find(c => c.configKey === 'crop.growth.stage-days')

    if (cropConfig) {
      await store.updateConfig(cropConfig.id, {
        configValue: JSON.stringify(editingConfigs.value)
      })
    }
    if (pestConfig) {
      await store.updateConfig(pestConfig.id, {
        configValue: JSON.stringify(editingRules.value)
      })
    }
    if (stageDaysConfig) {
      await store.updateConfig(stageDaysConfig.id, {
        configValue: JSON.stringify(editingStageDays.value)
      })
    }

    dirty.value = false
    isEditing.value = false
    // 保存成功后重新加载数据确保一致性
    await store.loadConfigs()
    loadData()
  } catch (err) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* 阶段折叠图标 */
.cursor-pointer {
  cursor: pointer;
}
</style>
