<template>
  <el-dialog
    :model-value="isOpen"
    :title="`分配工人到 ${team?.name || ''}`"
    width="500px"
    @close="onClose"
  >
    <div class="overflow-y-auto max-h-[60vh]">
      <div v-if="unassignedWorkers.length === 0" class="text-center text-gray-500 py-8">
        暂无可分配的工人
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="worker in unassignedWorkers"
          :key="worker.id"
          @click="toggleWorker(worker.id)"
          :class="[
            'p-3 border rounded-lg cursor-pointer transition-colors',
            selectedWorkers.includes(worker.id)
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-200 hover:border-gray-300'
          ]"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">{{ worker.name }}</p>
              <p class="text-sm text-gray-500">{{ worker.phone }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs bg-gray-100 px-2 py-1 rounded">{{ worker.workerType }}</span>
              <div
                v-if="selectedWorkers.includes(worker.id)"
                class="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
              >
                <el-icon><Check /></el-icon>
              </div>
            </div>
          </div>
          <div v-if="worker.skillTags && worker.skillTags.length > 0" class="flex gap-1 mt-2">
            <span
              v-for="tag in worker.skillTags"
              :key="tag"
              class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="text-sm text-gray-500 float-left">已选择 {{ selectedWorkers.length }} 人</span>
      <div class="flex gap-3">
        <el-button @click="onClose">取消</el-button>
        <el-button type="primary" @click="handleAssign" :disabled="selectedWorkers.length === 0">
          确认分配
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Check } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: Boolean,
  team: Object,
  unassignedWorkers: Array,
  onAssign: Function,
  onClose: Function,
  currentUser: { type: Object, default: () => ({}) }
})

const selectedWorkers = ref([])

// 与V1.1 L19-23 1:1 对齐：弹窗关闭时重置选择状态
watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    selectedWorkers.value = []
  }
})

const toggleWorker = (workerId) => {
  if (selectedWorkers.value.includes(workerId)) {
    selectedWorkers.value = selectedWorkers.value.filter(id => id !== workerId)
  } else {
    selectedWorkers.value.push(workerId)
  }
}

const handleAssign = () => {
  if (selectedWorkers.value.length > 0 && props.team) {
    // 与V1.1 L33-39 1:1 对齐：传 operatorId/operatorName
    const operatorId = props.currentUser?.id || props.currentUser?.userId || 'system'
    const operatorName = props.currentUser?.name || props.currentUser?.username || '系统'
    props.onAssign(props.team.id, selectedWorkers.value, operatorId, operatorName)
    selectedWorkers.value = []
    props.onClose()
  }
}
</script>
