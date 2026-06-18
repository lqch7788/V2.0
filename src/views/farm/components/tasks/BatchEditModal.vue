<!--
  BatchEditModal.vue - 任务批量编辑弹窗
  V1.1 BatchEditModal.tsx 1:1 迁移
-->
<template>
  <el-dialog
    :model-value="isOpen"
    @update:model-value="(v) => !v && emit('close')"
    title="批量编辑任务"
    width="1100px"
    destroy-on-close
    top="3vh"
  >
    <div>
      <div class="bg-blue-50 rounded-lg p-3 mb-4">
        <p class="text-sm text-blue-800">
          已选择 <strong>{{ selectedRows.length }}</strong> 个任务进行批量编辑，
          已编辑 <strong>{{ Object.keys(editedTasks).length }}</strong> 个
        </p>
      </div>

      <div class="mb-4">
        <label class="block text-xs font-medium text-gray-600 mb-1">选择任务编号</label>
        <el-select v-model="selectedTaskCode" placeholder="请选择任务编号" filterable class="w-full">
          <el-option v-for="task in selectedTaskList" :key="task.taskCode" :label="`${task.taskCode} - ${task.title}${editedTasks[task.taskCode] ? ' ✅ 已编辑' : ''}`" :value="task.taskCode" />
        </el-select>
      </div>

      <div v-if="selectedTaskCode && currentTask" class="grid grid-cols-4 gap-3">
        <div class="bg-gray-100 rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">任务编号</div>
          <div class="text-sm font-medium text-gray-900">{{ currentTask.taskCode }}</div>
        </div>

        <div class="bg-gray-50 rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">任务标题</div>
          <el-input v-model="editedData.title" :placeholder="currentTask.title" size="small" />
        </div>

        <div class="bg-gray-50 rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">执行人</div>
          <el-select v-model="editedData.assigneeId" placeholder="待分配" size="small" class="w-full">
            <el-option v-for="u in users" :key="u.id" :label="u.name" :value="u.id" />
          </el-select>
        </div>

        <div class="bg-gray-50 rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">作业区域</div>
          <el-select v-model="editedData.greenhouseId" size="small" class="w-full">
            <el-option v-for="g in greenhouses" :key="g.id" :label="g.name" :value="g.id" />
          </el-select>
        </div>

        <div class="bg-gray-50 rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">优先级</div>
          <el-select v-model="editedData.priority" size="small" class="w-full">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
        </div>

        <div class="bg-gray-50 rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">计划结束日期</div>
          <el-date-picker v-model="editedData.dueDate" type="date" value-format="YYYY-MM-DD" size="small" class="w-full" />
        </div>

        <div class="bg-gray-100 rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">状态</div>
          <TaskStatusBadge :status="currentTask.status" />
        </div>

        <div class="bg-gray-100 rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">发布人</div>
          <div class="text-sm text-gray-700">{{ currentTask.assignerName || '-' }}</div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button type="primary" @click="handleConfirmNext">确认（下一个）</el-button>
      <el-button type="success" @click="handlePublish">发布</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import TaskStatusBadge from './TaskStatusBadge.vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  tasks: { type: Array, default: () => [] },
  users: { type: Array, default: () => [] },
  greenhouses: { type: Array, default: () => [] },
})
const emit = defineEmits(['close', 'confirm'])

const selectedTaskCode = ref('')
const editedTasks = ref({})

watch(() => props.isOpen, (v) => {
  if (v) {
    selectedTaskCode.value = ''
    editedTasks.value = {}
  }
})

const selectedTaskList = computed(() => props.selectedRows.map(id => props.tasks.find(t => t.id === id)).filter(Boolean))
const currentTask = computed(() => selectedTaskCode.value ? props.tasks.find(t => t.taskCode === selectedTaskCode.value) : null)
const editedData = computed({
  get: () => {
    if (!selectedTaskCode.value || !currentTask.value) return {}
    const stored = editedTasks.value[selectedTaskCode.value] || {}
    // 以 editedData 为主进行双向绑定（写入时回灌 editedTasks）
    const merged = { ...currentTask.value, ...stored }
    return new Proxy(merged, {
      set(target, key, value) {
        target[key] = value
        editedTasks.value = {
          ...editedTasks.value,
          [selectedTaskCode.value]: { ...editedTasks.value[selectedTaskCode.value], [key]: value },
        }
        return true
      },
    })
  },
  set: () => {},
})

function handleConfirmNext() {
  const idx = selectedTaskList.value.findIndex(t => t.taskCode === selectedTaskCode.value)
  if (idx < selectedTaskList.value.length - 1) {
    selectedTaskCode.value = selectedTaskList.value[idx + 1].taskCode
  } else if (selectedTaskList.value.length > 0) {
    selectedTaskCode.value = selectedTaskList.value[0].taskCode
  }
}

function handlePublish() {
  emit('confirm', editedTasks.value)
  editedTasks.value = {}
  selectedTaskCode.value = ''
  emit('close')
}
</script>