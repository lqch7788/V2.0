<template>
  <!-- 批量编辑农事任务弹窗 - 从V1.1 BatchEditModal.tsx 1:1迁移 -->
  <el-dialog :model-value="isOpen" @update:model-value="$emit('close')"
    title="批量编辑农事任务" width="700px" top="5vh"
    @confirm="$emit('confirm')">
    <div class="space-y-4">
      <!-- 信息提示 -->
      <div class="bg-blue-50 rounded-lg p-3">
        <p class="text-sm text-blue-800">
          已选择 <strong>{{ selectedRows.length }}</strong> 个任务进行批量编辑，
          已编辑 <strong>{{ editedTaskIds.length }}</strong> 个
        </p>
      </div>

      <!-- 任务选择器 -->
      <div>
        <label class="text-sm text-gray-600 block mb-1">选择任务编号</label>
        <el-select :model-value="selectedTaskId || ''" @update:model-value="(v) => $emit('selectedTaskIdChange', v)"
          class="w-full" placeholder="请选择任务编号">
          <el-option value="" label="请选择任务编号" />
          <el-option v-for="t in selectedTasks" :key="t.id"
            :value="t.id"
            :label="`${t.id} - ${t.assignee} - ${t.typeName || ''} ${editedTaskIds.includes(t.id) ? '✅ 已编辑' : ''}`" />
        </el-select>
      </div>

      <!-- 编辑区域 -->
      <div v-if="selectedTaskId && currentTask" class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- 任务编号 - 不可编辑 -->
        <div class="bg-gray-100 rounded-lg p-3">
          <div class="text-xs text-gray-500 mb-1">任务编号</div>
          <div class="text-sm font-medium text-gray-900">{{ currentTask.id }}</div>
        </div>

        <!-- 任务类型 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">任务类型</label>
          <el-select :model-value="editedData.types?.[0] ?? currentTask.types?.[0] ?? ''"
            @update:model-value="(v) => handleFieldChange('types', [v])" class="w-full" placeholder="请选择">
            <el-option v-for="t in taskTypes" :key="t.value" :value="t.value" :label="t.label" />
          </el-select>
        </div>

        <!-- 温室/大田 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">温室/大田</label>
          <el-select :model-value="editedData.field ?? currentTask.field"
            @update:model-value="(v) => handleFieldChange('field', v)" class="w-full" placeholder="请选择">
            <el-option v-for="f in fields" :key="f.name" :value="f.name" :label="`${f.name} - ${f.crop}`" />
          </el-select>
        </div>

        <!-- 作物 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">作物</label>
          <el-select :model-value="editedData.crop ?? currentTask.crop"
            @update:model-value="(v) => handleFieldChange('crop', v)" class="w-full" placeholder="请选择">
            <el-option v-for="c in uniqueCrops" :key="c" :value="c" :label="c" />
          </el-select>
        </div>

        <!-- 执行人 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">执行人</label>
          <el-select :model-value="editedData.assignee ?? currentTask.assignee"
            @update:model-value="(v) => handleFieldChange('assignee', v)" class="w-full" placeholder="请选择">
            <el-option v-for="s in staff" :key="s.name" :value="s.name" :label="s.name" />
          </el-select>
        </div>

        <!-- 优先级 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">优先级</label>
          <el-select :model-value="editedData.priority ?? currentTask.priority"
            @update:model-value="(v) => handleFieldChange('priority', v)" class="w-full" placeholder="选择优先级">
            <el-option v-for="p in priorityOptions" :key="p.value" :value="p.value" :label="p.label" />
          </el-select>
        </div>

        <!-- 计划开始 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">计划开始时间</label>
          <el-date-picker :model-value="editedData.planStart ?? currentTask.planStart"
            @update:model-value="(v) => handleFieldChange('planStart', v)" type="datetime" class="w-full" />
        </div>

        <!-- 计划结束 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">计划结束时间</label>
          <el-date-picker :model-value="editedData.planEnd ?? currentTask.planEnd"
            @update:model-value="(v) => handleFieldChange('planEnd', v)" type="datetime" class="w-full" />
        </div>

        <!-- 当前状态 - 不可编辑 -->
        <div class="bg-gray-100 rounded-lg p-3">
          <div class="text-xs text-gray-500 mb-1">当前状态</div>
          <span class="inline-flex px-2 py-1 rounded text-xs font-medium"
            :class="statusClass(currentTask.status)">
            {{ statusLabel(currentTask.status) }}
          </span>
        </div>

        <!-- 进度 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">进度</label>
          <el-input-number :model-value="editedData.progress ?? currentTask.progress ?? 0"
            @update:model-value="(v) => handleFieldChange('progress', parseInt(v) || 0)"
            :min="0" :max="100" class="w-full" />
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

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  tasks: { type: Array, default: () => [] },
  editedTaskIds: { type: Array, default: () => [] },
  editedTasks: { type: Object, default: () => ({}) },
  selectedTaskId: { type: String, default: '' },
  fields: { type: Array, default: () => [] },
  staff: { type: Array, default: () => [] },
  taskTypes: { type: Array, default: () => [] },
})

const emit = defineEmits([
  'close', 'confirm', 'selectedTaskIdChange',
  'editedTasksChange', 'editedTaskIdsChange',
])

const selectedTasks = computed(() =>
  props.selectedRows.map(index => props.tasks[index]).filter(Boolean)
)

const currentTask = computed(() =>
  props.selectedTaskId ? props.tasks.find(t => t.id === props.selectedTaskId) : null
)

const editedData = computed(() =>
  props.selectedTaskId ? (props.editedTasks[props.selectedTaskId] || {}) : {}
)

const uniqueCrops = computed(() => {
  const crops = props.fields.map(f => f.crop)
  return [...new Set(crops)]
})

const priorityOptions = [
  { value: 'normal', label: '普通' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '紧急' },
]

const statusClass = (status) => {
  const map = {
    completed: 'bg-green-100 text-green-700',
    in_progress: 'bg-blue-100 text-blue-700',
    pending: 'bg-gray-100 text-gray-700',
    waiting_acceptance: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

const statusLabel = (status) => {
  const map = {
    completed: '已完成', in_progress: '进行中', pending: '待执行',
    waiting_acceptance: '待验收', rejected: '已驳回', draft: '草稿',
  }
  return map[status] || status
}

const handleFieldChange = (field, value) => {
  if (!props.selectedTaskId) return
  const updated = { ...props.editedTasks, [props.selectedTaskId]: { ...(props.editedTasks[props.selectedTaskId] || {}), [field]: value } }
  emit('editedTasksChange', updated)
  if (!props.editedTaskIds.includes(props.selectedTaskId)) {
    emit('editedTaskIdsChange', [...props.editedTaskIds, props.selectedTaskId])
  }
}
</script>
