<template>
  <!--
    任务验收弹窗（验收人视角）
    对应 V1.1 src/components/farm/hub/modals/VerifyTaskModal.tsx
    1:1 映射：handleType 三态切换 + approve/reject 独立流程 + Modal 风格
  -->
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50">
      <!-- 遮罩 -->
      <div class="fixed inset-0 bg-black/50" @click="handleClose" />
      <!-- 对话框容器 -->
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <!-- 顶部标题栏 - 蓝色 blue-500 头部（V1.1 任务验收专用） -->
          <div class="flex items-center justify-between px-6 py-4 bg-blue-500 flex-shrink-0">
            <h2 class="text-lg font-semibold text-white">任务验收</h2>
            <button
              class="text-white hover:bg-blue-600 rounded p-1 transition-colors"
              @click="handleClose"
            >
              <span class="text-xl leading-none px-1">×</span>
            </button>
          </div>

          <!-- 加载中状态 -->
          <div v-if="!task" class="flex-1 flex items-center justify-center py-12 text-gray-500">
            加载中...
          </div>

          <div v-else class="flex-1 overflow-y-auto p-6 space-y-5">
            <!-- 任务基本信息（V1.1 line 84-114） -->
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-semibold text-gray-900">{{ task.title }}</h3>
                <span :class="['px-2 py-0.5 rounded text-xs', statusConfig.bg, statusConfig.color]">
                  {{ statusConfig.label }}
                </span>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span class="text-gray-500">任务编号</span>
                  <p class="font-medium">{{ task.taskCode }}</p>
                </div>
                <div>
                  <span class="text-gray-500">执行人</span>
                  <p class="font-medium">{{ task.assigneeName }}</p>
                </div>
                <div>
                  <span class="text-gray-500">任务类型</span>
                  <p class="font-medium">{{ task.typeName }}</p>
                </div>
                <div>
                  <span class="text-gray-500">当前进度</span>
                  <p class="font-medium">{{ task.progress }}%</p>
                </div>
              </div>
              <div v-if="task.dueDate" class="mt-2 text-sm text-gray-500">
                截止日期：{{ task.dueDate }}
              </div>
            </div>

            <!-- 进度历史（V1.1 line 116-131） -->
            <div>
              <label class="text-gray-700 mb-2 flex items-center gap-2 text-sm font-medium">
                <el-icon :size="16"><Clock /></el-icon>
                执行记录
              </label>
              <div class="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                <div v-if="records && records.length > 0" class="p-4">
                  <TaskProgressTimeline :records="records" :show-task-info="false" />
                </div>
                <div v-else class="p-4 text-center text-gray-500 text-sm">
                  暂无执行记录
                </div>
              </div>
            </div>

            <!-- 驳回原因提示（V1.1 line 133-140） -->
            <div v-if="handleType === 'reject'" class="bg-red-50 border border-red-200 rounded-lg p-3">
              <p class="text-sm text-red-800">
                <strong>注意：</strong>驳回后任务将返回给执行人，执行人需要继续执行或放弃。连续驳回2次后任务将变为"任务失败"状态，需要重新派发。
              </p>
            </div>

            <!-- 验收意见（V1.1 line 142-159） -->
            <div>
              <label class="text-gray-700 mb-2 text-sm block font-medium">
                {{ handleType === 'reject' ? '驳回原因' : '验收意见' }}
                <span v-if="handleType === 'reject'" class="text-red-500">*</span>
              </label>
              <textarea
                v-model="comments"
                :placeholder="handleType === 'reject' ? '请填写驳回原因，说明需要返工的内容...' : '选填，可添加验收备注...'"
                class="px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner w-full"
                rows="3"
              />
            </div>

            <!-- 操作按钮（V1.1 line 161-197） -->
            <div class="flex gap-3 justify-end pt-2 border-t border-gray-200">
              <el-button size="small" @click="handleClose">
                <el-icon :size="16"><Close /></el-icon>
                取消
              </el-button>

              <!-- 驳回按钮 -->
              <el-button
                size="small"
                :type="handleType === 'reject' ? 'danger' : ''"
                :disabled="handleType === 'approve'"
                :class="handleType !== 'reject' ? 'text-red-600 hover:!bg-red-100' : ''"
                @click="setHandleType('reject')"
              >
                <el-icon :size="16"><CircleCloseFilled /></el-icon>
                驳回返工
              </el-button>

              <!-- 通过按钮 -->
              <el-button
                size="small"
                :type="handleType === 'approve' ? 'success' : ''"
                :disabled="handleType === 'reject'"
                :class="handleType !== 'approve' ? 'text-emerald-600 hover:!bg-emerald-100' : ''"
                @click="setHandleType('approve')"
              >
                <el-icon :size="16"><CircleCheckFilled /></el-icon>
                验收通过
              </el-button>
            </div>

            <!-- 确认操作（V1.1 line 199-218） -->
            <div v-if="handleType" class="flex gap-3 justify-end pt-2 border-t border-gray-100">
              <el-button size="small" @click="resetForm">
                <el-icon :size="16"><ArrowLeft /></el-icon>
                上一步
              </el-button>
              <el-button
                size="small"
                :type="handleType === 'reject' ? 'danger' : 'primary'"
                :disabled="handleType === 'reject' && !comments.trim()"
                @click="handleSubmit"
              >
                {{ handleType === 'reject' ? '确认驳回' : '确认通过' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
/**
 * 任务验收弹窗组件
 * 功能：验收人查看任务记录，选择通过验收或驳回返工
 * 对应 V1.1 src/components/farm/hub/modals/VerifyTaskModal.tsx 1:1 映射
 *
 * V1.1 关键点（已对齐）：
 * 1. handleType 三态：'approve' | 'reject' | null
 * 2. 点击 驳回/通过 仅切换状态，不直接提交
 * 3. handleType 选中后才显示"上一步"+"确认驳回/通过"
 * 4. records 来自父组件（V1.1 props 一致）
 */
import { ref, computed } from 'vue'
import {
  Clock, CircleCheckFilled, CircleCloseFilled, Close, ArrowLeft
} from '@element-plus/icons-vue'
import TaskProgressTimeline from './TaskProgressTimeline.vue'
import { TASK_STATUS_CONFIG } from '@/config/taskConfig'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  task: { type: Object, default: null },
  records: { type: Array, default: () => [] },
  onVerify: { type: Function, default: () => {} },
  onClose: { type: Function, default: () => {} },
})

const handleType = ref(null) // 'approve' | 'reject' | null
const comments = ref('')

/** 当前任务状态配置 */
const statusConfig = computed(() => {
  if (!props.task) return { label: '', bg: '', color: '' }
  return TASK_STATUS_CONFIG[props.task.status] || { label: props.task.status, bg: 'bg-gray-100', color: 'text-gray-600' }
})

/** 设置处理类型 */
function setHandleType(type) {
  handleType.value = type
}

/** 提交验收（V1.1 line 39-48） */
function handleSubmit() {
  if (handleType.value === 'approve') {
    props.onVerify(true, comments.value || undefined)
  } else if (handleType.value === 'reject') {
    if (comments.value.trim()) {
      props.onVerify(false, comments.value)
    }
  }
  resetForm()
}

/** 关闭弹窗 */
function handleClose() {
  resetForm()
  props.onClose()
}

/** 重置表单 */
function resetForm() {
  handleType.value = null
  comments.value = ''
}
</script>

<style scoped>
/* 头部样式由模板内联控制：bg-blue-500 */
</style>
