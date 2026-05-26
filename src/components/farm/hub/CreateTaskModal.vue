<template>
  <el-dialog
    :model-value="isOpen"
    width="800px"
    :close-on-click-modal="false"
    class="farm-modal"
    @close="handleClose"
  >
    <template #header>
      <div class="farm-modal-header">
        <span class="text-white text-lg font-semibold">新建任务</span>
      </div>
    </template>

    <!-- 步骤错误提示 -->
    <div v-if="stepError" class="mb-4">
      <div class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
        <el-icon :size="20" color="#ef4444"><WarningFilled /></el-icon>
        <span class="text-sm text-red-700">{{ stepError }}</span>
      </div>
    </div>

    <!-- 步骤指示器 -->
    <div class="py-4 border-b border-gray-100 -mx-6 px-6">
      <div class="flex items-center justify-between">
        <div :class="['flex items-center gap-2', createStep >= 1 ? 'text-emerald-600' : 'text-gray-400']">
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium', createStep >= 1 ? 'bg-emerald-500 text-white' : 'bg-gray-200']">1</div>
          <span class="text-sm font-medium">任务定义</span>
        </div>
        <div class="flex-1 h-0.5 bg-gray-200 mx-4">
          <div :class="['h-full bg-emerald-500 transition-all', createStep >= 2 ? 'w-full' : 'w-0']" />
        </div>
        <div :class="['flex items-center gap-2', createStep >= 2 ? 'text-emerald-600' : 'text-gray-400']">
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium', createStep >= 2 ? 'bg-emerald-500 text-white' : 'bg-gray-200']">2</div>
          <span class="text-sm font-medium">资源与时间</span>
        </div>
      </div>
    </div>

    <div class="py-6">
      <!-- Step 1: 任务定义 -->
      <div v-if="createStep === 1" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <!-- 任务编号 -->
          <div>
            <label class="text-gray-700 text-sm mb-1 block">任务编号</label>
            <div class="flex items-center gap-2">
              <el-input
                v-model="newTask.taskId"
                placeholder="点击下方生成按钮"
                size="default"
                class="flex-1"
              />
              <el-button type="primary" size="small" @click="newTask.taskId = autoGenerateTaskCode()">
                生成
              </el-button>
            </div>
          </div>
          <!-- 关联生产批次 -->
          <div>
            <label class="text-gray-700 text-sm mb-1 block">关联生产批次</label>
            <div class="relative">
              <el-input
                v-model="newTask.batchCode"
                placeholder="搜索或选择生产批次..."
                size="default"
                @focus="showBatchDropdown = true"
                @input="onBatchSearch"
              />
              <div
                v-if="showBatchDropdown"
                class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
              >
                <div
                  v-for="batch in filteredBatches"
                  :key="batch.id"
                  class="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                  @click="selectBatch(batch)"
                >
                  <div class="font-medium text-gray-900">{{ batch.batchCode }}</div>
                  <div class="text-xs text-gray-500">{{ batch.cropName }}<span v-if="batch.greenhouseName"> · {{ batch.greenhouseName }}</span></div>
                </div>
              </div>
            </div>
            <!-- 点击遮罩关闭下拉 -->
            <div v-if="showBatchDropdown" class="fixed inset-0 z-0" @click="showBatchDropdown = false" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <!-- 任务区域 -->
          <div>
            <label class="text-gray-700 text-sm mb-1 block">任务区域 <span class="text-red-500">*</span></label>
            <div class="relative">
              <div
                class="w-full min-h-[42px] px-3 py-2 border border-gray-400 rounded-lg bg-white cursor-pointer flex flex-wrap gap-1 items-center"
                @click="showFieldDropdown = !showFieldDropdown"
              >
                <span v-if="!newTask.fields || newTask.fields.length === 0" class="text-gray-400 text-sm">请选择任务区域</span>
                <span
                  v-for="fieldValue in newTask.fields"
                  :key="fieldValue"
                  class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                >
                  {{ getFieldName(fieldValue) }}
                  <span class="hover:text-red-500 cursor-pointer text-xs font-bold" @click.stop="removeField(fieldValue)">&times;</span>
                </span>
              </div>
              <div v-if="showFieldDropdown" class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <label
                  v-for="f in taskDispatchFields"
                  :key="f.id"
                  class="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  @click.stop
                >
                  <input
                    type="checkbox"
                    :checked="(newTask.fields || []).includes(f.name)"
                    class="w-4 h-4 text-emerald-600 rounded"
                    @change="toggleField(f.name, $event.target.checked)"
                  />
                  <span class="text-sm text-gray-700">{{ f.name }}</span>
                </label>
                <label class="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer border-t border-gray-100" @click.stop>
                  <input
                    type="checkbox"
                    :checked="(newTask.fields || []).includes('other')"
                    class="w-4 h-4 text-emerald-600 rounded"
                    @change="toggleField('other', $event.target.checked)"
                  />
                  <span class="text-sm text-gray-700">其他</span>
                </label>
              </div>
            </div>
            <div v-if="showFieldDropdown" class="fixed inset-0 z-0" @click="showFieldDropdown = false" />
            <!-- 区域备注 -->
            <div v-if="(newTask.fields || []).includes('other')" class="mt-2">
              <label class="text-gray-700 text-sm mb-1 block">区域备注 <span class="text-red-500">*</span></label>
              <el-input
                v-model="newTask.areaRemarks"
                placeholder="请输入区域说明"
                size="default"
              />
            </div>
          </div>

          <!-- 作物 -->
          <div>
            <label class="text-gray-700 text-sm mb-1 block">作物 <span class="text-red-500">*</span></label>
            <div class="relative">
              <div
                class="w-full min-h-[42px] px-3 py-2 border border-gray-400 rounded-lg bg-white cursor-pointer flex flex-wrap gap-1 items-center"
                @click="showCropDropdown = !showCropDropdown"
              >
                <span v-if="!newTask.crops || newTask.crops.length === 0" class="text-gray-400 text-sm">请选择作物</span>
                <span
                  v-for="cropValue in newTask.crops"
                  :key="cropValue"
                  class="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-sm"
                >
                  {{ cropValue }}
                  <span class="hover:text-red-500 cursor-pointer text-xs font-bold" @click.stop="removeCrop(cropValue)">&times;</span>
                </span>
              </div>
              <div v-if="showCropDropdown" class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <label
                  v-for="crop in uniqueCrops"
                  :key="crop"
                  class="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  @click.stop
                >
                  <input
                    type="checkbox"
                    :checked="(newTask.crops || []).includes(crop)"
                    class="w-4 h-4 text-emerald-600 rounded"
                    @change="toggleCrop(crop, $event.target.checked)"
                  />
                  <span class="text-sm text-gray-700">{{ crop }}</span>
                </label>
                <label class="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer border-t border-gray-100" @click.stop>
                  <input
                    type="checkbox"
                    :checked="(newTask.crops || []).includes('other')"
                    class="w-4 h-4 text-emerald-600 rounded"
                    @change="toggleCrop('other', $event.target.checked)"
                  />
                  <span class="text-sm text-gray-700">其他</span>
                </label>
              </div>
            </div>
            <div v-if="showCropDropdown" class="fixed inset-0 z-0" @click="showCropDropdown = false" />
            <!-- 作物备注 -->
            <div v-if="(newTask.crops || []).includes('other')" class="mt-2">
              <label class="text-gray-700 text-sm mb-1 block">作物备注 <span class="text-red-500">*</span></label>
              <el-input
                v-model="newTask.cropRemarks"
                placeholder="请输入作物说明"
                size="default"
              />
            </div>
          </div>
        </div>

        <!-- 任务类型 -->
        <div>
          <label class="text-gray-700 text-sm mb-1 block">任务类型 <span class="text-red-500">*</span></label>
          <div class="relative">
            <div
              class="w-full min-h-[42px] px-3 py-2 border border-gray-400 rounded-lg bg-white cursor-pointer flex flex-wrap gap-1 items-center"
              @click="showTaskTypeDropdown = !showTaskTypeDropdown"
            >
              <span v-if="!newTask.types || newTask.types.length === 0" class="text-gray-400 text-sm">请选择任务类型</span>
              <span
                v-for="typeValue in newTask.types"
                :key="typeValue"
                class="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-sm"
              >
                {{ getFarmOpTypeLabel(typeValue) }}
                <span class="hover:text-red-500 cursor-pointer text-xs font-bold" @click.stop="removeTaskType(typeValue)">&times;</span>
              </span>
            </div>
            <div v-if="showTaskTypeDropdown" class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <label
                v-for="t in FARM_OPERATION_TYPES"
                :key="t.value"
                class="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                @click.stop
              >
                <input
                  type="checkbox"
                  :checked="newTask.types.includes(t.value)"
                  class="w-4 h-4 text-emerald-600 rounded"
                  @change="toggleTaskType(t.value, $event.target.checked)"
                />
                <span class="text-sm text-gray-700">{{ t.label }}</span>
              </label>
            </div>
          </div>
          <div v-if="showTaskTypeDropdown" class="fixed inset-0 z-0" @click="showTaskTypeDropdown = false" />
        </div>

        <!-- 其他任务备注 -->
        <div v-if="newTask.types.includes('other')">
          <label class="text-gray-700 text-sm mb-1 block">其他任务备注 <span class="text-red-500">*</span></label>
          <el-input
            v-model="newTask.typeRemarks"
            placeholder="请输入其他任务说明"
            size="default"
          />
        </div>

        <!-- 任务类型配置面板 -->
        <TaskTypeConfigPanel
          :task-types="newTask.types"
          :config-values="newTask.typeConfig"
          :on-config-change="handleTypeConfigChange"
        />

        <!-- 作业标准 SOP -->
        <div>
          <label class="text-gray-700 text-sm mb-1 block">作业标准 (SOP)</label>
          <el-input
            v-model="newTask.sopContent"
            type="textarea"
            :rows="4"
            placeholder="请输入作业标准...（简单任务可在此直接输入，复杂任务可点击导入文件）"
          />
          <div class="mt-2 flex items-center gap-3">
            <el-button type="primary" size="small" plain @click="handleImportFile">
              导入文件
            </el-button>
            <span class="text-xs text-gray-500">支持 .txt, .doc, .docx, .pdf 格式</span>
          </div>
        </div>
      </div>

      <!-- Step 2: 资源与时间 -->
      <div v-if="createStep === 2" class="space-y-4">
        <!-- 所需物资 -->
        <div>
          <label class="text-gray-700 text-sm mb-1 block">所需物资</label>
          <div class="border border-gray-200 rounded-lg p-3 space-y-2">
            <p v-if="!newTask.materials || newTask.materials.length === 0" class="text-sm text-gray-400 text-center py-2">
              暂无所需物资
            </p>
            <div v-for="(m, i) in newTask.materials" :key="'mat-' + i" class="flex items-center gap-2">
              <el-input v-model="m.name" placeholder="物资名称" size="small" class="flex-1" />
              <el-input
                :model-value="m.qty"
                size="small"
                class="w-16"
                placeholder="数量"
                @input="(val) => updateMaterialQty(i, val)"
              />
              <el-select v-model="m.unit" size="small" class="w-18">
                <el-option v-for="u in materialUnits" :key="u" :label="u" :value="u" />
              </el-select>
              <span class="text-red-500 hover:text-red-700 cursor-pointer font-bold text-sm" @click="removeMaterial(i)">&times;</span>
            </div>
            <el-button type="primary" link size="small" @click="addMaterial">
              + 物资
            </el-button>
          </div>
        </div>

        <!-- 所需工具 -->
        <div>
          <label class="text-gray-700 text-sm mb-1 block">所需工具</label>
          <div class="border border-gray-200 rounded-lg p-3 space-y-2">
            <p v-if="!newTask.tools || newTask.tools.length === 0" class="text-sm text-gray-400 text-center py-2">
              暂无所需工具
            </p>
            <div v-for="(t, i) in newTask.tools" :key="'tool-' + i" class="flex items-center gap-2">
              <el-input v-model="t.name" placeholder="工具名称" size="small" class="flex-1" />
              <el-input
                :model-value="t.qty"
                size="small"
                class="w-16"
                placeholder="数量"
                @input="(val) => updateToolQty(i, val)"
              />
              <el-select v-model="t.unit" size="small" class="w-18">
                <el-option v-for="u in toolUnits" :key="u" :label="u" :value="u" />
              </el-select>
              <span class="text-red-500 hover:text-red-700 cursor-pointer font-bold text-sm" @click="removeTool(i)">&times;</span>
            </div>
            <el-button type="primary" link size="small" @click="addTool">
              + 工具
            </el-button>
          </div>
        </div>

        <!-- 资源备注 -->
        <div>
          <label class="text-gray-700 text-sm mb-1 block">备注（可选）</label>
          <el-input
            v-model="newTask.toolsRemarks"
            type="textarea"
            :rows="2"
            placeholder="补充说明资源相关要求"
          />
        </div>

        <!-- 时间与要求 -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <!-- 工作制 -->
          <div>
            <label class="text-gray-700 text-sm mb-1 block">工作制</label>
            <el-select v-model="newTask.workHoursPerDay" size="default" class="w-full" @change="onWorkHoursChange">
              <el-option :value="8" label="8小时/天" />
              <el-option :value="10" label="10小时/天" />
              <el-option :value="12" label="12小时/天" />
            </el-select>
          </div>
          <!-- 开始日期 -->
          <div>
            <label class="text-gray-700 text-sm mb-1 block">开始日期 <span class="text-red-500">*</span></label>
            <el-date-picker
              v-model="planStartDate"
              type="date"
              placeholder="选择开始日期"
              value-format="YYYY-MM-DD"
              class="w-full"
              @change="onPlanStartDateChange"
            />
          </div>
          <!-- 开始时间 -->
          <div>
            <label class="text-gray-700 text-sm mb-1 block">开始时间</label>
            <el-select v-model="planStartTime" size="default" class="w-full">
              <el-option
                v-for="h in startHourOptions"
                :key="h"
                :value="String(h).padStart(2, '0') + ':00'"
                :label="String(h).padStart(2, '0') + ':00'"
              />
            </el-select>
          </div>
          <!-- 天数 -->
          <div>
            <label class="text-gray-700 text-sm mb-1 block">天数</label>
            <el-input
              :model-value="newTask.estimatedDays"
              placeholder="0"
              size="default"
              @input="(val) => { const n = parseInt(String(val).replace(/[^\d]/g, ''), 10); newTask.estimatedDays = isNaN(n) ? 0 : n }"
            />
          </div>
          <!-- 小时 -->
          <div>
            <label class="text-gray-700 text-sm mb-1 block">小时 <span class="text-xs text-gray-400">(最大{{ (newTask.workHoursPerDay || 8) - 1 }})</span></label>
            <el-input
              :model-value="newTask.estimatedHours"
              placeholder="0"
              size="default"
              @input="(val) => { const n = parseInt(String(val).replace(/[^\d]/g, ''), 10); const maxH = (newTask.workHoursPerDay || 8) - 1; if (isNaN(n) || n < 0) newTask.estimatedHours = 0; else if (n > maxH) newTask.estimatedHours = maxH; else newTask.estimatedHours = n }"
            />
          </div>
        </div>

        <!-- 任务截止时间 -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div class="flex items-center gap-2">
            <el-icon :size="16" color="#3b82f6"><Clock /></el-icon>
            <span class="text-sm text-blue-700">任务截止时间：</span>
            <span class="text-sm font-medium text-blue-900">
              {{ computedEndTime || '-' }}
            </span>
            <span class="text-xs text-blue-500">
              (共 {{ computedTotalHours }} 小时)
            </span>
          </div>
        </div>

        <!-- 优先级 -->
        <div>
          <label class="text-gray-700 text-sm mb-1 block">优先级</label>
          <el-select v-model="newTask.priority" size="default" class="w-full">
            <el-option value="normal" label="普通" />
            <el-option value="high" label="高" />
            <el-option value="urgent" label="紧急" />
          </el-select>
        </div>

        <!-- 班组选择 -->
        <div>
          <label class="text-gray-700 text-sm mb-1 block">
            班组 <span class="text-xs text-gray-400">（来自农事管理-班组分配）</span>
          </label>
          <el-select
            v-model="newTask.teamId"
            size="default"
            class="w-full"
            placeholder="不关联班组（直接选人）"
            @change="onTeamChange"
          >
            <el-option value="__none__" label="不关联班组（直接选人）" />
            <el-option
              v-for="team in teamStore.teams"
              :key="team.id"
              :value="team.id"
              :label="team.name + '（' + team.memberCount + '人 - ' + (team.workZone || '未分配区域') + '）'"
            />
          </el-select>
          <p v-if="newTask.teamId && newTask.teamId !== '__none__'" class="text-xs text-blue-600 mt-1">
            已选班组：{{ newTask.teamName }}，请在下方选择该班组成员作为执行人
          </p>
        </div>

        <!-- 执行人 -->
        <div>
          <label class="text-gray-700 text-sm mb-1 block">执行人</label>
          <el-select
            v-model="newTask.assignee"
            size="default"
            class="w-full"
            placeholder="请选择执行人"
          >
            <el-option
              v-for="person in responsiblePersons"
              :key="person.code || person.name"
              :value="person.name"
              :label="person.name"
            />
          </el-select>
        </div>

        <!-- 必填反馈 -->
        <div>
          <label class="font-bold text-red-600 text-sm mb-2 block">必填反馈 <span class="text-red-500">*</span></label>
          <div class="grid grid-cols-2 gap-3">
            <label
              v-for="item in feedbackOptions"
              :key="item.key"
              :class="[
                'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all',
                isFeedbackSelected(item.key) ? 'bg-gray-100 border-2 border-emerald-300' : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              ]"
            >
              <input
                type="checkbox"
                :checked="isFeedbackSelected(item.key)"
                class="w-4 h-4 text-emerald-500 rounded sr-only"
                @change="toggleFeedback(item.key, $event.target.checked)"
              />
              <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', isFeedbackSelected(item.key) ? item.iconBg : 'bg-gray-200']">
                <el-icon :size="16" :color="isFeedbackSelected(item.key) ? 'white' : '#9ca3af'">
                  <component :is="item.icon" />
                </el-icon>
              </div>
              <span :class="['text-sm font-medium', isFeedbackSelected(item.key) ? 'text-gray-900' : 'text-gray-500']">
                {{ item.label }}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <template #footer>
      <div class="flex justify-between">
        <el-button v-if="createStep > 1" size="small" @click="createStep--">
          上一步
        </el-button>
        <template v-if="createStep === 2">
          <div class="flex gap-2 ml-auto">
            <el-button size="small" @click="handleSaveDraft">
              保存草稿
            </el-button>
            <el-button type="primary" size="small" @click="handleFinalCreate">
              发布任务
            </el-button>
          </div>
        </template>
        <el-button v-else type="primary" size="small" class="ml-auto" @click="handleNextStep">
          下一步 <el-icon :size="16"><ArrowRight /></el-icon>
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * 新建任务模态框 - CreateTaskModal
 * 农事任务中心的新建任务功能完整实现
 * 对应 V1.1 src/components/farm/hub/modals/CreateTaskModal.tsx 1:1 映射
 */
import { ref, reactive, computed, onMounted, watch } from 'vue'
import {
  WarningFilled, ArrowRight, Clock, Timer, PictureFilled, Box, Microphone
} from '@element-plus/icons-vue'
import { format, addHours, parse } from 'date-fns'
import { FARM_OPERATION_TYPES } from '@/types/farm/common'
import { useTaskTypeConfig } from '@/composables/useTaskTypeConfig'
import { useUserStore, useProductionPlanStore, useTeamStore, useGreenhouseStore, useFarmTaskStore } from '@/stores'
import { getDictionaries } from '@/services/dictionaryService'
import TaskTypeConfigPanel from './TaskTypeConfigPanel.vue'

// ---------- Props ----------
const props = defineProps({
  isOpen: { type: Boolean, default: false },
  onClose: { type: Function, default: () => {} },
  onCreated: { type: Function, default: () => {} },
  tasksHook: { type: Object, default: () => ({ createTask: () => {}, tasks: [] }) },
})

// ---------- Stores ----------
const userStore = useUserStore()
const planStore = useProductionPlanStore()
const teamStore = useTeamStore()
const greenhouseStore = useGreenhouseStore()
const farmTaskStore = useFarmTaskStore()

// ---------- 辅助函数 ----------

/** 自动生成任务编号 NS+年月日+3位流水号 */
function autoGenerateTaskCode() {
  const today = new Date()
  const datePrefix = today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, '0') +
    today.getDate().toString().padStart(2, '0')

  // 从 farmTaskStore 获取已有任务列表
  const existingTasks = farmTaskStore.tasks || props.tasksHook.tasks || []
  let maxSequence = 0
  existingTasks.forEach(t => {
    const taskId = t.taskCode || t.id || ''
    if (taskId.startsWith('NS' + datePrefix + '-')) {
      const seqStr = taskId.slice(-3)
      const seq = parseInt(seqStr, 10)
      if (!isNaN(seq) && seq > maxSequence) {
        maxSequence = seq
      }
    }
  })

  const newSequence = maxSequence + 1
  return `NS${datePrefix}-${String(newSequence).padStart(3, '0')}`
}

/** 获取任务类型标签 */
function getTypeLabel(type) {
  const typeMap = {
    'fertilization': '施肥', 'irrigation': '灌溉', 'pruning': '修剪',
    'pesticide': '植保', 'rootIrrigation': '灌根', 'planting': '定植',
    'harvest': '采收', 'weeding': '除草', 'other': '其他',
    'fertilizing': '施肥', 'pest_control': '病虫害防治', 'harvesting': '采收',
    'soil_management': '土壤管理', 'seedling': '育苗', 'transplanting': '移栽',
  }
  return typeMap[type] || type
}

/** 计算截止时间 */
function calculateEndDateTime(startTime, days, hours, workHoursPerDay) {
  if (!startTime) return ''
  try {
    const start = parse(startTime, 'yyyy-MM-dd HH:mm', new Date())
    const totalHours = days * workHoursPerDay + hours
    const end = addHours(start, totalHours)
    return format(end, 'yyyy-MM-dd HH:mm')
  } catch {
    return ''
  }
}

// ---------- State ----------
const createStep = ref(1)
const stepError = ref('')

// 下拉显示状态
const showBatchDropdown = ref(false)
const showFieldDropdown = ref(false)
const showCropDropdown = ref(false)
const showTaskTypeDropdown = ref(false)

// 新建任务数据
const newTask = reactive({
  taskId: '',
  types: [],
  typeRemarks: '',
  fields: [],
  crops: [],
  cropRemarks: '',
  areaRemarks: '',
  assignee: '',
  teamId: '',
  teamName: '',
  planStart: '',
  planEnd: '',
  sopContent: '',
  materials: [],
  tools: [],
  requiredFeedback: ['workload_confirm'],
  priority: 'normal',
  estimatedDays: 0,
  estimatedHours: 1,
  typeConfig: {},
  toolsRemarks: '',
  batchId: '',
  batchCode: '',
  batchSearch: '',
  remarks: '',
  workHoursPerDay: 8,
})

// 执行人列表（从数据字典加载）
const responsiblePersons = ref([])

// 物资/工具单位选项
const materialUnits = ['个', '件', 'kg', 'g', 'L', 'mL', '袋', '箱']
const toolUnits = ['把', '个', '台', '套', '件']

// 开始时间的选择器
const planStartDate = ref('')
const planStartTime = ref('08:00')
const startHourOptions = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]

// 必填反馈选项（使用实际图标组件引用）
const feedbackOptions = [
  { key: 'workload_confirm', label: '工作量确认', icon: Clock, iconBg: 'bg-emerald-500', iconColor: 'text-white' },
  { key: 'gps', label: '位置打卡', icon: Timer, iconBg: 'bg-blue-500', iconColor: 'text-white' },
  { key: 'material', label: '物资扫码', icon: Box, iconBg: 'bg-amber-500', iconColor: 'text-white' },
  { key: 'photo_before', label: '作业前照片', icon: PictureFilled, iconBg: 'bg-purple-500', iconColor: 'text-white' },
  { key: 'photo_after', label: '作业后照片', icon: PictureFilled, iconBg: 'bg-pink-500', iconColor: 'text-white' },
  { key: 'voice', label: '语音备注', icon: Microphone, iconBg: 'bg-teal-500', iconColor: 'text-white' },
]

// ---------- 计算属性 ----------

/** 任务区域字段列表（从温室 Store） */
const taskDispatchFields = computed(() => {
  return (greenhouseStore.greenhouses || []).map(g => ({
    id: Number(g.id) || 0,
    name: g.name,
    type: g.greenhouseType || '',
    crop: g.crop || '',
    area: g.area || 0,
  }))
})

/** 生产批次列表 */
const cropBatches = computed(() => {
  return (planStore.plans || []).map(p => ({
    id: p.id,
    batchCode: p.batchCode,
    cropName: p.cropName || p.cropTypeName || '',
    greenhouseName: p.greenhouseName || '',
    batchStatus: p.batchStatus || p.status || '',
  }))
})

/** 过滤后的批次（用于搜索下拉） */
const filteredBatches = computed(() => {
  let result = cropBatches.value
  if (newTask.batchCode) {
    const search = newTask.batchCode.toLowerCase()
    result = result.filter(b =>
      (b.batchCode || '').toLowerCase().includes(search) ||
      (b.cropName || '').includes(search)
    )
  }
  return result.slice(0, 10)
})

/** 唯一作物列表 */
const uniqueCrops = computed(() => {
  const crops = cropBatches.value.map(b => b.cropName).filter(Boolean)
  return [...new Set(crops)]
})

/** 计算截止时间 */
const computedEndTime = computed(() => {
  return calculateEndDateTime(
    newTask.planStart,
    newTask.estimatedDays || 0,
    newTask.estimatedHours || 0,
    newTask.workHoursPerDay || 8
  )
})

/** 计算总小时 */
const computedTotalHours = computed(() => {
  return (newTask.estimatedDays || 0) * (newTask.workHoursPerDay || 8) + (newTask.estimatedHours || 0)
})

// ---------- Watch ----------

// isOpen 变化时重置状态
watch(() => props.isOpen, (val) => {
  if (val) {
    resetForm()
  }
})

// 计划开始日期/时间变化时更新 planStart
watch([planStartDate, planStartTime], () => {
  if (planStartDate.value) {
    newTask.planStart = planStartDate.value + ' ' + (planStartTime.value || '08:00')
  }
})

// ---------- Methods ----------

/** 重置表单 */
function resetForm() {
  createStep.value = 1
  stepError.value = ''
  Object.assign(newTask, {
    taskId: '',
    types: [],
    typeRemarks: '',
    fields: [],
    crops: [],
    cropRemarks: '',
    areaRemarks: '',
    assignee: '',
    teamId: '',
    teamName: '',
    planStart: '',
    planEnd: '',
    sopContent: '',
    materials: [],
    tools: [],
    requiredFeedback: ['workload_confirm'],
    priority: 'normal',
    estimatedDays: 0,
    estimatedHours: 1,
    typeConfig: {},
    toolsRemarks: '',
    batchId: '',
    batchCode: '',
    batchSearch: '',
    remarks: '',
    workHoursPerDay: 8,
  })
  planStartDate.value = ''
  planStartTime.value = '08:00'
  showBatchDropdown.value = false
  showFieldDropdown.value = false
  showCropDropdown.value = false
  showTaskTypeDropdown.value = false
}

/** 批次搜索 */
function onBatchSearch() {
  showBatchDropdown.value = true
}

/** 选择批次 */
function selectBatch(batch) {
  newTask.batchId = batch.id
  newTask.batchCode = batch.batchCode
  showBatchDropdown.value = false
}

/** 获取区域显示名称 */
function getFieldName(fieldValue) {
  const field = taskDispatchFields.value.find(f => f.name === fieldValue)
  return field?.name || fieldValue
}

/** 获取农事操作类型标签 */
function getFarmOpTypeLabel(typeValue) {
  const type = FARM_OPERATION_TYPES.find(t => t.value === typeValue)
  return type?.label || typeValue
}

/** 切换区域 */
function toggleField(fieldName, checked) {
  const fields = [...(newTask.fields || [])]
  if (checked) {
    if (!fields.includes(fieldName)) fields.push(fieldName)
  } else {
    const idx = fields.indexOf(fieldName)
    if (idx !== -1) fields.splice(idx, 1)
  }
  newTask.fields = fields
}

/** 移除区域 */
function removeField(fieldName) {
  newTask.fields = (newTask.fields || []).filter(v => v !== fieldName)
}

/** 切换作物 */
function toggleCrop(crop, checked) {
  const crops = [...(newTask.crops || [])]
  if (checked) {
    if (!crops.includes(crop)) crops.push(crop)
  } else {
    const idx = crops.indexOf(crop)
    if (idx !== -1) crops.splice(idx, 1)
  }
  newTask.crops = crops
}

/** 移除作物 */
function removeCrop(crop) {
  newTask.crops = (newTask.crops || []).filter(v => v !== crop)
}

/** 切换任务类型 */
function toggleTaskType(type, checked) {
  if (checked) {
    newTask.types = [...newTask.types, type]
  } else {
    newTask.types = newTask.types.filter(v => v !== type)
  }
}

/** 移除任务类型 */
function removeTaskType(type) {
  newTask.types = newTask.types.filter(v => v !== type)
}

/** 任务类型配置变化 */
function handleTypeConfigChange(type, values) {
  newTask.typeConfig = {
    ...newTask.typeConfig,
    [type]: values,
  }
}

/** 导入文件 */
function handleImportFile() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.txt,.doc,.docx,.pdf'
  input.onchange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        newTask.sopContent = event.target?.result || ''
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

/** 物资操作 */
function addMaterial() {
  newTask.materials = [...(newTask.materials || []), { name: '', qty: 1, unit: '个' }]
}
function removeMaterial(i) {
  newTask.materials = (newTask.materials || []).filter((_, idx) => idx !== i)
}
function updateMaterialQty(i, val) {
  const raw = String(val || '').replace(/[^\d.]/g, '')
  if (raw === '' || raw === '-') {
    newTask.materials[i].qty = 0
    return
  }
  const v = parseFloat(raw)
  if (!isNaN(v)) {
    newTask.materials[i].qty = Math.round(v * 100) / 100
  }
}

/** 工具操作 */
function addTool() {
  newTask.tools = [...(newTask.tools || []), { name: '', qty: 1, unit: '把' }]
}
function removeTool(i) {
  newTask.tools = (newTask.tools || []).filter((_, idx) => idx !== i)
}
function updateToolQty(i, val) {
  const raw = String(val || '').replace(/[^\d.]/g, '')
  if (raw === '' || raw === '-') {
    newTask.tools[i].qty = 0
    return
  }
  const v = parseFloat(raw)
  if (!isNaN(v)) {
    newTask.tools[i].qty = Math.round(v * 100) / 100
  }
}

/** 工作制变化 */
function onWorkHoursChange() {
  const maxHours = (newTask.workHoursPerDay || 8) - 1
  if ((newTask.estimatedHours || 0) > maxHours) {
    newTask.estimatedHours = maxHours
  }
}

/** 开始日期变化 */
function onPlanStartDateChange() {
  // planStartDate 已通过 v-model 绑定，planStart 通过 watch 更新
}

/** 班组变化 */
function onTeamChange(val) {
  if (val === '__none__') {
    newTask.teamId = ''
    newTask.teamName = ''
    return
  }
  const selectedTeam = teamStore.teams.find(t => t.id === val)
  newTask.teamName = selectedTeam?.name || ''
}

/** 反馈选择 */
function isFeedbackSelected(key) {
  return newTask.requiredFeedback.includes(key)
}
function toggleFeedback(key, checked) {
  if (checked) {
    newTask.requiredFeedback = [...newTask.requiredFeedback, key]
  } else {
    newTask.requiredFeedback = newTask.requiredFeedback.filter(f => f !== key)
  }
}

/** 步骤1验证 */
function validateStep1() {
  if (!newTask.taskId) return '请生成任务编号'
  if (newTask.types.length === 0) return '请选择任务类型'
  if ((newTask.fields || []).length === 0) return '请选择任务区域'
  if ((newTask.crops || []).length === 0) return '请选择作物'
  if (newTask.types.includes('other') && !(newTask.typeRemarks || '').trim()) return '请输入其他任务备注'
  return ''
}

/** 下一步 */
function handleNextStep() {
  const error = validateStep1()
  if (error) {
    stepError.value = error
    return
  }
  stepError.value = ''
  createStep.value = 2
}

/** 创建任务（核心逻辑） */
function doCreateTask(publish) {
  const typeLabels = newTask.types.map(t => getTypeLabel(t)).join(',')
  const fieldValue = (newTask.fields || []).includes('other')
    ? newTask.areaRemarks
    : ((newTask.fields || []).join(',') || '')
  const cropValue = (newTask.crops || []).includes('other')
    ? newTask.cropRemarks
    : ((newTask.crops || []).join(',') || '')

  const finalAssigneeName = newTask.assignee || ''
  const finalAssigneeId = finalAssigneeName
    ? `EMP_${finalAssigneeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)}`
    : ''

  const defaultDispatcher = (userStore.users || []).find(u => u.id === 'U001')
  const assignerId = defaultDispatcher?.id || 'U001'
  const assignerName = defaultDispatcher?.name || '系统'

  const firstFieldName = fieldValue.split(',')[0]?.trim() || ''
  const matchedField = taskDispatchFields.value.find(f => f.name === firstFieldName)
  const greenhouseId = matchedField?.id?.toString() || ''

  const estimatedHours = ((newTask.estimatedDays || 0) * (newTask.workHoursPerDay || 8)) + (newTask.estimatedHours || 0)
  const planEndTime = calculateEndDateTime(
    newTask.planStart,
    newTask.estimatedDays || 0,
    newTask.estimatedHours || 0,
    newTask.workHoursPerDay || 8
  )

  const taskStatus = publish ? 'pending' : 'draft'

  // 通过 tasksHook 创建任务
  props.tasksHook.createTask({
    title: typeLabels || '农事任务',
    type: newTask.types[0] || 'other',
    typeName: typeLabels,
    batchId: newTask.batchId,
    batchCode: newTask.batchCode,
    greenhouseId: greenhouseId,
    greenhouseName: fieldValue,
    teamId: newTask.teamId || '',
    teamName: newTask.teamName || '',
    cropName: cropValue,
    priority: newTask.priority || 'normal',
    assigneeId: finalAssigneeId,
    assigneeName: finalAssigneeName,
    assignerId: assignerId,
    assignerName: assignerName,
    planStart: newTask.planStart || '',
    planEnd: planEndTime || '',
    dueDate: planEndTime?.split(' ')[0] || '',
    estimatedDays: newTask.estimatedDays || 0,
    estimatedHours: estimatedHours,
    description: newTask.sopContent || '',
    remarks: newTask.toolsRemarks || '',
    sourceType: 'dispatch',
    dispatchMode: 'farm',
    materials: newTask.materials,
    tools: newTask.tools,
    toolsRemarks: newTask.toolsRemarks,
    requiredFeedback: newTask.requiredFeedback,
    typeConfig: newTask.typeConfig || {},
    status: taskStatus,
    types: newTask.types,
    typeLabel: typeLabels,
    field: fieldValue,
    assignee: finalAssigneeName,
    crop: cropValue,
    sopContent: newTask.sopContent || '',
  })

  handleClose()
  props.onCreated()
}

/** 保存草稿 */
function handleSaveDraft() {
  let error = ''
  if (!newTask.taskId) error = '请生成任务编号'
  else if (newTask.types.length === 0) error = '请选择任务类型'

  if (error) {
    stepError.value = error
    return
  }
  stepError.value = ''
  doCreateTask(false)
}

/** 最终验证（发布） */
function handleFinalCreate() {
  let error = ''
  if (!newTask.taskId) error = '请生成任务编号'
  else if (newTask.types.length === 0) error = '请选择任务类型'
  else if ((newTask.fields || []).length === 0) error = '请选择任务区域'
  else if ((newTask.crops || []).length === 0) error = '请选择作物'

  if (error) {
    stepError.value = error
    return
  }
  stepError.value = ''
  doCreateTask(true)
}

/** 关闭弹窗 */
function handleClose() {
  resetForm()
  props.onClose()
}

// ---------- 生命周期 ----------
onMounted(async () => {
  // 加载执行人列表
  try {
    const data = await getDictionaries('responsible_person')
    const persons = data.map(item => ({
      code: item.code || '',
      name: item.name || '',
    })).filter(item => item.code || item.name)
    responsiblePersons.value = persons
  } catch (error) {
    console.warn('加载执行人列表失败:', error)
  }

  // 加载数据（如果尚未加载）
  if ((userStore.users || []).length === 0) {
    userStore.loadUsers()
  }
  if ((planStore.plans || []).length === 0) {
    planStore.fetchPlans()
  }
  if ((greenhouseStore.greenhouses || []).length === 0) {
    greenhouseStore.loadGreenhouses()
  }
})
</script>

<style scoped>
/* 渐变弹窗头部（与V1.1 Modal组件 bg-gradient-to-r from-emerald-600 to-emerald-500 一致） */
:deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
  border-radius: 8px 8px 0 0;
}
.farm-modal-header {
  background: linear-gradient(to right, #059669, #10b981);
  padding: 16px 24px;
  border-radius: 8px 8px 0 0;
}
</style>
