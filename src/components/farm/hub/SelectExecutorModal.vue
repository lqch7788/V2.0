<template>
  <el-dialog
    :model-value="isOpen"
    width="700px"
    :close-on-click-modal="false"
    class="farm-modal"
    @close="handleClose"
  >
    <template #header>
      <div class="farm-modal-header">
        <span class="text-white text-lg font-semibold">选择执行人</span>
      </div>
    </template>
    <div v-if="!task" class="text-center py-8 text-gray-500">
      加载中...
    </div>

    <div v-else class="space-y-5">
      <!-- 提示信息 -->
      <div class="flex items-start gap-3 p-4 rounded-lg border border-blue-100 bg-blue-50">
        <el-icon :size="20" class="text-blue-600 mt-0.5 flex-shrink-0">
          <InfoFilled />
        </el-icon>
        <div>
          <p class="font-medium text-blue-900">
            为任务 "{{ task.title || task.id }}" 选择执行人
          </p>
          <p class="text-sm text-blue-700 mt-1">
            选择执行人后，任务将直接变为已接受状态并推送到执行人的任务列表
          </p>
        </div>
      </div>

      <!-- 任务信息 -->
      <div class="bg-gray-50 rounded-lg p-3">
        <div class="grid grid-cols-2 gap-2 text-sm text-gray-500">
          <p>任务编号：{{ task.taskCode || task.id }}</p>
          <p>任务类型：{{ task.typeName || task.type }}</p>
          <p>任务区域：{{ task.greenhouseName || task.field || '-' }}</p>
          <p>批次：{{ task.batchCode || '-' }}</p>
          <p class="col-span-2">
            计划时间：{{ task.planStart || '-' }} 至 {{ task.planEnd || '-' }}
          </p>
        </div>
      </div>

      <!-- 分派模式切换 -->
      <div class="flex gap-2 mb-3">
        <button
          type="button"
          @click="handleModeChange('ai_assisted')"
          :class="[
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition-all',
            dispatchMode === 'ai_assisted'
              ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
          ]"
        >
          <el-icon :size="16"><StarFilled /></el-icon>
          AI智能推荐（默认）
        </button>
        <button
          type="button"
          @click="handleModeChange('manual')"
          :class="[
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition-all',
            dispatchMode === 'manual'
              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
          ]"
        >
          <el-icon :size="16"><UserFilled /></el-icon>
          手动选择
        </button>
      </div>

      <!-- AI辅助模式 - AI推荐面板 -->
      <div v-if="dispatchMode === 'ai_assisted'" class="space-y-3">
        <!-- 加载中 -->
        <div v-if="isLoadingAI" class="flex items-center justify-center py-8">
          <el-icon :size="32" class="animate-spin text-purple-500">
            <Loading />
          </el-icon>
          <span class="ml-3 text-gray-500">正在分析最优执行人...</span>
        </div>

        <!-- 未获取推荐 -->
        <button
          v-else-if="aiRecommendations.length === 0"
          type="button"
          @click="fetchAIRecommendations"
          class="w-full py-4 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:border-purple-500 hover:bg-purple-50 transition-colors"
        >
          <el-icon :size="20"><StarFilled /></el-icon>
          <span class="ml-2">点击获取AI智能推荐</span>
        </button>

        <!-- AI推荐结果列表 -->
        <div v-else class="space-y-2">
          <p class="text-sm font-medium text-gray-700">
            AI推荐执行人（共{{ aiRecommendations.length }}位）
          </p>
          <div
            v-for="(rec, idx) in aiRecommendations"
            :key="rec.workerId"
            class="flex items-center gap-3 p-3 rounded-lg border hover:border-purple-300 cursor-pointer transition-colors"
            :class="selectedAssignee === rec.workerId ? 'border-purple-500 bg-purple-50' : 'border-gray-200'"
            @click="handleAIRecommendSelect(rec.workerId)"
          >
            <!-- 排名序号 -->
            <span
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              :class="idx === 0 ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'"
            >
              {{ idx + 1 }}
            </span>
            <!-- 员工信息 -->
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900">{{ rec.workerName || rec.name }}</p>
              <p class="text-xs text-gray-500">{{ rec.role || '执行人员工' }}</p>
            </div>
            <!-- 匹配分数 -->
            <div class="text-right flex-shrink-0">
              <span class="text-sm font-bold text-purple-600">
                {{ (rec.score * 100).toFixed(0) }}%
              </span>
              <p class="text-xs text-gray-400">匹配度</p>
            </div>
          </div>
          <p class="text-xs text-gray-400 text-center">
            点击推荐执行人将自动切换至手动选择模式
          </p>
        </div>
      </div>

      <!-- 手动模式 - 下拉选择 -->
      <div v-if="dispatchMode === 'manual'">
        <p class="text-gray-700 mb-2 font-medium">选择执行人</p>
        <el-select
          v-model="selectedAssignee"
          placeholder="请选择执行人..."
          class="w-full"
          filterable
          size="large"
        >
          <el-option
            v-for="staff in taskDispatchStaff"
            :key="staff.id"
            :label="`${staff.name} (${staff.role || '执行人员工'}) — ${getStatusLabel(staff.status)}`"
            :value="String(staff.id)"
          >
            <div class="flex items-center justify-between w-full">
              <div>
                <div class="font-medium">{{ staff.name }}</div>
                <div class="text-sm text-gray-500">{{ staff.role || '执行人员工' }}</div>
              </div>
              <div class="flex gap-1 ml-4">
                <!-- 状态标签 -->
                <span :class="['px-2 py-0.5 rounded text-xs', getStatusColor(staff.status)]">
                  {{ getStatusLabel(staff.status) }}
                </span>
                <!-- 技能标签（最多2个） -->
                <span
                  v-for="tag in (staff.skillTags || staff.skills || []).slice(0, 2)"
                  :key="tag"
                  class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </el-option>
        </el-select>
      </div>

      <!-- 确认提示 -->
      <div v-if="selectedAssignee" class="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
        <p class="text-sm text-emerald-800">
          确认将任务派发给：
          <span class="font-medium">{{ selectedAssigneeName }}</span>
        </p>
        <p class="text-xs text-emerald-600 mt-1">
          执行人将收到任务通知，任务状态将变为"已接受"
        </p>
      </div>

      <!-- 操作按钮 -->
      <div class="flex justify-end gap-3 pt-2 border-t border-gray-200">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :disabled="!selectedAssignee"
          @click="handleSubmit"
        >
          确认派发
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
/**
 * 选择执行人弹窗组件
 * 功能：为待派工任务选择执行人（支持AI推荐和手动选择）
 */
import { ref, computed, onMounted } from 'vue'
import {
  InfoFilled, StarFilled, UserFilled, Loading
} from '@element-plus/icons-vue'
import { getWorkers } from '@/services/apiWorkerService'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  task: { type: Object, default: null },
  onConfirm: { type: Function, default: () => {} },
  onClose: { type: Function, default: () => {} },
})

// 派工人员列表（与 V1.1 useWorkerStore 数据源一致：apiWorkerService.getWorkers()）
const staffList = ref([])

const taskDispatchStaff = computed(() => {
  return (staffList.value || []).map((w) => ({
    id: String(w.id),
    name: w.name || '未知',
    status: w.status || 'active',
    role: w.position || 'worker',
    skills: [],
    skillTags: [],
    workZone: w.department || '',
    workLoad: 0,
  }))
})

// 当前选中的执行人
const selectedAssignee = ref('')
// 分派模式：ai_assisted / manual
const dispatchMode = ref('ai_assisted')
// AI推荐结果
const aiRecommendations = ref([])
// AI推荐加载状态
const isLoadingAI = ref(false)

// 选中执行人名称
const selectedAssigneeName = computed(() => {
  const staff = taskDispatchStaff.value.find(s => s.id === selectedAssignee.value)
  return staff?.name || ''
})

// 执行人状态标签映射
const getStatusLabel = (status) => {
  const statusMap = {
    available: '空闲',
    busy: '工作中',
    off: '休息中',
    active: '空闲',
    inactive: '休息中',
  }
  return statusMap[status] || '工作中'
}

// 执行人状态颜色映射
const getStatusColor = (status) => {
  const colorMap = {
    available: 'text-green-600 bg-green-50',
    busy: 'text-orange-600 bg-orange-50',
    off: 'text-gray-600 bg-gray-50',
    active: 'text-green-600 bg-green-50',
    inactive: 'text-gray-600 bg-gray-50',
  }
  return colorMap[status] || 'text-gray-600 bg-gray-50'
}

// 加载员工数据（与 V1.1 useWorkerStore.loadWorkers() 一致）
onMounted(async () => {
  if (staffList.value.length === 0) {
    staffList.value = await getWorkers()
  }
})

// 切换分派模式
const handleModeChange = (mode) => {
  dispatchMode.value = mode
  if (mode === 'ai_assisted' && aiRecommendations.value.length === 0) {
    fetchAIRecommendations()
  }
}

// 获取AI推荐（模拟实现：基于员工状态和角色加权排序）
const fetchAIRecommendations = () => {
  if (!props.task) return

  isLoadingAI.value = true
  try {
    const staff = taskDispatchStaff.value
    if (staff.length === 0) {
      aiRecommendations.value = []
      return
    }

    // 简单AI推荐算法：空闲优先，角色匹配加分
    const scored = staff.map((s) => {
      let score = 0.5
      if (s.status === 'available' || s.status === 'active') score += 0.3
      if (s.status === 'off' || s.status === 'inactive') score -= 0.2
      // 随机微调模拟AI评估
      score += Math.random() * 0.15
      return {
        workerId: s.id,
        workerName: s.name,
        name: s.name,
        role: s.role,
        score: Math.min(Math.max(score, 0.1), 0.99),
      }
    })

    scored.sort((a, b) => b.score - a.score)
    aiRecommendations.value = scored.slice(0, 5)
  } catch {
    aiRecommendations.value = []
  } finally {
    isLoadingAI.value = false
  }
}

// AI推荐选中处理
const handleAIRecommendSelect = (workerId) => {
  const staff = taskDispatchStaff.value.find(s => s.id === workerId)
  if (staff) {
    selectedAssignee.value = workerId
    dispatchMode.value = 'manual'
  }
}

// 提交
const handleSubmit = () => {
  if (selectedAssignee.value) {
    const staff = taskDispatchStaff.value.find(s => s.id === selectedAssignee.value)
    if (staff) {
      props.onConfirm(selectedAssignee.value, staff.name)
      // 重置状态
      selectedAssignee.value = ''
      dispatchMode.value = 'ai_assisted'
      aiRecommendations.value = []
    }
  }
}

// 关闭弹窗
const handleClose = () => {
  selectedAssignee.value = ''
  dispatchMode.value = 'ai_assisted'
  aiRecommendations.value = []
  props.onClose()
}
</script>

<style scoped>
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
button {
  background: none;
  cursor: pointer;
  font-family: inherit;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
