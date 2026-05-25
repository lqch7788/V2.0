<template>
  <el-dialog
    v-model="visible"
    title="批量编辑工作日志"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div>
      <div class="bg-blue-50 rounded-lg p-3 mb-3">
        <p class="text-sm text-blue-800">
          已选择 <strong>{{ selectedRows.length }}</strong> 个工作日志进行批量编辑，
          已编辑 <strong>{{ Object.keys(editedLogs).length }}</strong> 个
        </p>
      </div>

      <!-- 日志选择器 -->
      <div class="mb-3">
        <label class="block text-xs font-medium text-gray-600 mb-1">选择日志编号</label>
        <el-select
          v-model="selectedLogCode"
          placeholder="请选择日志编号"
          class="!w-full"
          filterable
        >
          <el-option
            v-for="log in selectedLogList"
            :key="log.code"
            :label="`${log.code} - ${log.worker}${editedLogs[log.code] ? ' ✓ 已编辑' : ''}`"
            :value="log.code"
          />
        </el-select>
      </div>

      <!-- 编辑区域 -->
      <div v-if="selectedLogCode && currentLog" class="grid grid-cols-4 gap-3">
        <!-- 日志编号 - 不可编辑 -->
        <div class="bg-gray-100 rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">日志编号</div>
          <div class="text-sm font-medium text-gray-900">{{ currentLog.code }}</div>
        </div>

        <!-- 日期 - 不可编辑 -->
        <div class="bg-gray-100 rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">日期</div>
          <div class="text-sm text-gray-700">{{ currentLog.date }}</div>
        </div>

        <!-- 工人姓名 -->
        <div class="bg-gray-50 rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">工人姓名</div>
          <el-input
            :model-value="editedData.worker ?? currentLog.worker"
            size="small"
            @update:model-value="(v) => handleFieldChange('worker', v)"
          />
        </div>

        <!-- 天气 -->
        <div class="bg-gray-50 rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">天气</div>
          <el-input
            :model-value="editedData.weather ?? currentLog.weather"
            size="small"
            @update:model-value="(v) => handleFieldChange('weather', v)"
          />
        </div>

        <!-- 温度 -->
        <div class="bg-gray-50 rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">温度</div>
          <el-input
            :model-value="editedData.temperature ?? currentLog.temperature"
            size="small"
            @update:model-value="(v) => handleFieldChange('temperature', v)"
          />
        </div>

        <!-- 作物 -->
        <div class="bg-gray-50 rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">作物</div>
          <el-input
            :model-value="editedData.crop ?? currentLog.crop"
            size="small"
            @update:model-value="(v) => handleFieldChange('crop', v)"
          />
        </div>

        <!-- 大棚 -->
        <div class="bg-gray-50 rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">大棚</div>
          <el-input
            :model-value="editedData.greenhouse ?? currentLog.greenhouse"
            size="small"
            @update:model-value="(v) => handleFieldChange('greenhouse', v)"
          />
        </div>

        <!-- 生长状况 -->
        <div class="bg-gray-50 rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">生长状况</div>
          <el-select
            :model-value="editedData.growthStatus ?? currentLog.growthStatus"
            size="small"
            class="!w-full"
            @update:model-value="(v) => handleFieldChange('growthStatus', v)"
          >
            <el-option label="良好" value="良好" />
            <el-option label="一般" value="一般" />
          </el-select>
        </div>

        <!-- 工作内容 -->
        <div class="bg-gray-50 rounded-lg p-2 col-span-2">
          <div class="text-xs text-gray-500 mb-1">工作内容</div>
          <el-input
            :model-value="editedData.tasks ?? currentLog.tasks"
            size="small"
            @update:model-value="(v) => handleFieldChange('tasks', v)"
          />
        </div>

        <!-- 问题描述 -->
        <div class="bg-gray-50 rounded-lg p-2 col-span-2">
          <div class="text-xs text-gray-500 mb-1">问题描述</div>
          <el-input
            :model-value="editedData.problems ?? currentLog.problems"
            size="small"
            @update:model-value="(v) => handleFieldChange('problems', v)"
          />
        </div>

        <!-- 处理措施 -->
        <div class="bg-gray-50 rounded-lg p-2 col-span-2">
          <div class="text-xs text-gray-500 mb-1">处理措施</div>
          <el-input
            :model-value="editedData.solutions ?? currentLog.solutions"
            size="small"
            @update:model-value="(v) => handleFieldChange('solutions', v)"
          />
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
import { ref, computed } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  logs: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'confirm'])

const visible = computed({
  get: () => props.isOpen,
  set: (val) => { if (!val) handleClose() }
})

const selectedLogCode = ref('')
const editedLogs = ref({})

const selectedLogList = computed(() =>
  props.selectedRows
    .map(id => props.logs.find(log => log.id === id))
    .filter(Boolean)
)

const currentLog = computed(() =>
  selectedLogCode.value
    ? props.logs.find(log => log.code === selectedLogCode.value)
    : null
)

const editedData = computed(() =>
  selectedLogCode.value ? editedLogs.value[selectedLogCode.value] || {} : {}
)

function handleFieldChange(field, value) {
  editedLogs.value = {
    ...editedLogs.value,
    [selectedLogCode.value]: {
      ...(editedLogs.value[selectedLogCode.value] || {}),
      [field]: value,
    },
  }
}

/** 切换到下一个日志 */
function handleConfirmNext() {
  const currentIndex = selectedLogList.value.findIndex(log => log.code === selectedLogCode.value)
  if (currentIndex < selectedLogList.value.length - 1) {
    selectedLogCode.value = selectedLogList.value[currentIndex + 1].code
  } else {
    selectedLogCode.value = selectedLogList.value[0]?.code || ''
  }
}

/** 发布所有编辑 */
function handlePublish() {
  emit('confirm', editedLogs.value)
  editedLogs.value = {}
  selectedLogCode.value = ''
}

function handleClose() {
  editedLogs.value = {}
  selectedLogCode.value = ''
  emit('close')
}
</script>
