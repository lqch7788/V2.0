<template>
  <!-- 栽种历史履历弹窗 - 从V1.1 TransplantHistoryModal.tsx 1:1迁移 -->
  <el-dialog
    :model-value="isOpen"
    @update:model-value="$emit('close')"
    :title="`栽种历史 - ${record?.seedlingCode || ''}`"
    width="800px"
    top="5vh"
  >
    <div class="space-y-4">
      <!-- 二维码选择 -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-center gap-4">
          <label class="text-gray-700 text-sm">选择二维码编号：</label>
          <el-select v-model="selectedLabel" class="flex-1" placeholder="选择标签">
            <el-option v-for="label in labelNumbers" :key="label" :value="label" :label="label" />
          </el-select>
        </div>
      </div>

      <!-- 履历时间线 -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">操作履历</h4>

        <div v-if="currentHistory && currentHistory.history.length > 0" class="space-y-4">
          <div v-for="(item, index) in currentHistory.history" :key="item.id || index" class="flex gap-4">
            <!-- 时间线节点 -->
            <div class="flex flex-col items-center">
              <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium', getActionStyle(item.action)]">
                {{ getActionName(item.action).charAt(0) }}
              </div>
              <div v-if="index < currentHistory.history.length - 1" class="w-0.5 h-12 bg-gray-200 mt-1" />
            </div>

            <!-- 履历内容 -->
            <div class="flex-1 pb-4">
              <div class="flex items-center gap-2 mb-1">
                <span :class="['px-2 py-0.5 rounded text-xs font-medium', getActionStyle(item.action)]">
                  {{ getActionName(item.action) }}
                </span>
                <span class="text-sm text-gray-500">{{ item.date }}</span>
                <span v-if="item.operator" class="text-xs text-gray-400">操作员: {{ item.operator }}</span>
              </div>
              <div class="text-sm text-gray-700">
                <span v-if="item.fromArea" class="mr-2">从: <span class="font-medium">{{ item.fromArea }}</span></span>
                <span v-if="item.toArea">到: <span class="font-medium">{{ item.toArea }}</span></span>
              </div>
              <div v-if="item.count" class="text-xs text-gray-500 mt-1">数量: {{ item.count }}</div>
              <div v-if="item.remarks" class="text-xs text-gray-400 mt-1 italic">{{ item.remarks }}</div>
              <!-- 标记相关 -->
              <div v-if="item.markName" class="mt-2 flex items-center gap-2">
                <span class="w-4 h-4 rounded" :style="{ backgroundColor: item.markColor || '#ccc' }" />
                <span class="text-sm">{{ item.markName }}</span>
                <span v-if="item.markIcon" class="text-lg">{{ item.markIcon }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">暂无履历记录</div>
      </div>

      <!-- 当前状态 -->
      <div v-if="currentHistory" class="bg-blue-50 rounded-lg p-4">
        <div class="flex items-center gap-4">
          <div class="text-sm">
            <span class="text-gray-600">当前位置：</span>
            <span class="font-medium text-gray-900">{{ currentHistory.currentArea || '未知' }}</span>
          </div>
          <div class="text-sm">
            <span class="text-gray-600">状态：</span>
            <span :class="['px-2 py-0.5 rounded text-xs font-medium', getStatusClass(currentHistory.status)]">
              {{ getStatusLabel(currentHistory.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('close')">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  record: { type: Object, default: null },
})

defineEmits(['close'])

const ACTION_MAP = {
  move_in: { name: '移入', cls: 'bg-green-100 text-green-700' },
  move_out: { name: '移出', cls: 'bg-orange-100 text-orange-700' },
  transplant: { name: '定植', cls: 'bg-blue-100 text-blue-700' },
  mark: { name: '标记', cls: 'bg-purple-100 text-purple-700' },
}

const STATUS_MAP = {
  in_stock: { label: '库存', cls: 'bg-gray-100 text-gray-700' },
  transplanting: { label: '定植中', cls: 'bg-blue-100 text-blue-700' },
  growing: { label: '生长期', cls: 'bg-green-100 text-green-700' },
  harvested: { label: '已采收', cls: 'bg-yellow-100 text-yellow-700' },
}

const getActionStyle = (action) => ACTION_MAP[action]?.cls || 'bg-gray-100 text-gray-700'
const getActionName = (action) => ACTION_MAP[action]?.name || action
const getStatusClass = (status) => STATUS_MAP[status]?.cls || 'bg-gray-100 text-gray-700'
const getStatusLabel = (status) => STATUS_MAP[status]?.label || status

const selectedLabel = ref('')

const historyData = ref([])

const loadHistory = async () => {
  if (!props.record) return
  try {
    const { getTransplantHistory } = await import('@/services/seedlingService')
    historyData.value = getTransplantHistory(props.record.id)
  } catch {
    historyData.value = []
  }
}

watch(() => props.isOpen, (open) => {
  if (open) {
    historyData.value = []
    selectedLabel.value = ''
    loadHistory()
  }
})

const generateDefaultLabels = (seedling) => {
  const labels = []
  const max = Math.min(seedling?.initialCount || 0, 20)
  for (let i = 1; i <= max; i++) {
    labels.push(`${seedling.seedlingCode}-${String(i).padStart(3, '0')}`)
  }
  if ((seedling?.initialCount || 0) > 20) {
    labels.push(`...共${seedling.initialCount}个二维码`)
  }
  return labels
}

const labelNumbers = computed(() => {
  if (historyData.value.length > 0) {
    return historyData.value.map(h => h.labelNumber)
  }
  return props.record ? generateDefaultLabels(props.record) : []
})

const currentHistory = computed(() =>
  historyData.value.find(h => h.labelNumber === selectedLabel.value)
)

// 弹窗打开时默认选择第一个标签
watch(labelNumbers, (labels) => {
  if (labels.length > 0 && !selectedLabel.value) {
    selectedLabel.value = labels[0]
  }
})
</script>
