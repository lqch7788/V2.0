<!--
  BatchEditModal.vue - 批量编辑弹窗
  V1.1 TempTaskPage.tsx 中 BatchEditModal 函数组件 1:1 迁移
  选择任务编号 → 编辑字段 → 确认(下一个) → 发布
-->
<template>
  <el-dialog
    :model-value="isOpen"
    @update:model-value="(v) => !v && handleClose()"
    title="批量编辑临时任务"
    width="1100px"
    :close-on-click-modal="false"
    destroy-on-close
    top="3vh"
  >
    <div class="max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
      <div class="bg-blue-50 rounded-lg p-3 mb-3">
        <p class="text-sm text-blue-800">
          已选择 <strong>{{ selectedRows.length }}</strong> 个临时任务进行批量编辑，
          已编辑 <strong>{{ Object.keys(editedTasks).length }}</strong> 个
        </p>
      </div>

      <div class="mb-3">
        <label class="block text-xs font-medium text-gray-600 mb-1">选择任务编号</label>
        <select v-model="selectedTaskCode"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="" disabled>请选择任务编号</option>
          <option v-for="t in selectedTaskList" :key="t.taskCode" :value="t.taskCode">
            {{ t.taskCode }} - {{ t.title }}{{ editedTasks[t.taskCode] ? ' ✅ 已编辑' : '' }}
          </option>
        </select>
      </div>

      <template v-if="selectedTaskCode && currentTask">
        <div class="grid grid-cols-4 gap-3">
          <div class="bg-gray-100 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">任务编号</div>
            <div class="text-sm font-medium text-gray-900">{{ currentTask.taskCode }}</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">任务名称</div>
            <input type="text" :value="editedData.title ?? currentTask.title"
              @input="setField('title', $event.target.value)"
              class="w-full h-7 px-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div class="bg-gray-50 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">任务类型</div>
            <select :value="editedData.tempTaskType ?? currentTask.tempTaskType"
              @change="setField('tempTaskType', $event.target.value)"
              class="w-full h-7 px-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500">
              <option value="其他">其他</option>
              <option value="病虫害防治">病虫害防治</option>
              <option value="施肥">施肥</option>
              <option value="浇水">浇水</option>
              <option value="除草">除草</option>
              <option value="修剪">修剪</option>
              <option value="采收">采收</option>
            </select>
          </div>
          <div class="bg-gray-50 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">工作地点</div>
            <input type="text" :value="editedData.workLocation ?? currentTask.workLocation"
              @input="setField('workLocation', $event.target.value)"
              class="w-full h-7 px-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div class="bg-gray-50 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">执行人</div>
            <select :value="editedData.assigneeId ?? currentTask.assigneeId"
              @change="setAssignee($event.target.value)"
              class="w-full h-7 px-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500">
              <option value="">待分配</option>
              <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
            </select>
          </div>
          <div class="bg-gray-50 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">截止日期</div>
            <input type="datetime-local" :value="toDateTimeLocal(editedData.dueDate ?? currentTask.dueDate)"
              @input="setField('dueDate', $event.target.value)"
              class="w-full h-7 px-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div class="bg-gray-50 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">预估时长(小时)</div>
            <input type="number" :value="editedData.estimatedHours ?? currentTask.estimatedHours ?? 0"
              @input="setField('estimatedHours', Number($event.target.value))"
              min="0.5" step="0.1"
              class="w-full h-7 px-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div class="bg-gray-50 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">优先级</div>
            <select :value="editedData.priority ?? currentTask.priority"
              @change="setField('priority', $event.target.value)"
              class="w-full h-7 px-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500">
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-3 mt-3">
          <div class="bg-gray-50 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">紧急程度</div>
            <select :value="editedData.urgency ?? currentTask.urgency"
              @change="setField('urgency', $event.target.value)"
              class="w-full h-7 px-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500">
              <option value="normal">普通</option>
              <option value="urgent">紧急</option>
              <option value="critical">非常紧急</option>
            </select>
          </div>
          <div class="bg-gray-100 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">状态</div>
            <span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', STATUS_BADGE[currentTask.status] || 'bg-gray-100 text-gray-700']">
              {{ STATUS_LABEL[currentTask.status] || currentTask.status }}
            </span>
          </div>
          <div class="bg-gray-100 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">发布人</div>
            <div class="text-sm text-gray-700">{{ currentTask.assignerName }}</div>
          </div>
          <div></div>
          <div class="col-span-2 bg-gray-50 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">任务描述</div>
            <textarea :value="editedData.description ?? currentTask.description ?? ''"
              @input="setField('description', $event.target.value)"
              class="w-full h-12 px-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div class="col-span-2 bg-gray-50 rounded-lg p-2">
            <div class="text-xs text-gray-500 mb-1">备注</div>
            <textarea :value="editedData.notes ?? currentTask.notes ?? ''"
              @input="setField('notes', $event.target.value)"
              class="w-full h-12 px-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500 resize-none" />
          </div>
        </div>
      </template>
    </div>

    <template #footer>
      <div class="flex gap-3">
        <button type="button"
          class="px-3 py-1.5 rounded text-sm bg-blue-500 text-white hover:bg-blue-600"
          @click="handleConfirmNext">确认（下一个）</button>
        <button type="button"
          class="px-3 py-1.5 rounded text-sm bg-emerald-600 text-white hover:bg-emerald-700"
          @click="handlePublish">发布</button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * 批量编辑弹窗
 * V1.1 TempTaskPage.tsx 中 BatchEditModal 函数 1:1 迁移
 */
import { ref, computed } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  tasks: { type: Array, default: () => [] },
  users: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'confirm'])

const selectedTaskCode = ref('')
const editedTasks = ref({})

const selectedTaskList = computed(() =>
  props.selectedRows.map(id => props.tasks.find(t => t.id === id)).filter(Boolean)
)

const currentTask = computed(() =>
  selectedTaskCode.value ? props.tasks.find(t => t.taskCode === selectedTaskCode.value) : null
)

const editedData = computed(() =>
  selectedTaskCode.value ? (editedTasks.value[selectedTaskCode.value] || {}) : {}
)

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}
const STATUS_LABEL = {
  pending: '待执行',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
}

function setField(field, value) {
  editedTasks.value = {
    ...editedTasks.value,
    [selectedTaskCode.value]: {
      ...(editedTasks.value[selectedTaskCode.value] || {}),
      [field]: value,
    },
  }
}

function setAssignee(id) {
  const user = props.users.find(u => u.id === id)
  editedTasks.value = {
    ...editedTasks.value,
    [selectedTaskCode.value]: {
      ...(editedTasks.value[selectedTaskCode.value] || {}),
      assigneeId: id,
      assigneeName: user?.name || '待分配',
    },
  }
}

function toDateTimeLocal(value) {
  if (!value) return ''
  if (typeof value === 'string') {
    if (value.includes('T')) return value.slice(0, 16)
    if (value.length > 13) return value.slice(0, 16).replace(' ', 'T')
  }
  return ''
}

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

function handleClose() {
  editedTasks.value = {}
  selectedTaskCode.value = ''
  emit('close')
}
</script>