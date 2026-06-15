<template>
  <el-dialog
    :model-value="isOpen"
    :title="`任务详情 - ${task?.id || ''}`"
    width="900px"
    :show-close="true"
    top="5vh"
    @close="onClose"
  >
    <div v-if="task" class="space-y-6">
      <!-- 基本信息 -->
      <div>
        <h4 class="text-sm font-semibold text-gray-900 mb-3">基本信息</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label class="text-xs text-gray-500">任务区域</label>
            <p class="font-semibold text-gray-900">{{ task.field || '-' }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-500">作物</label>
            <p class="font-semibold text-gray-900">{{ task.crop || '-' }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-500">负责人</label>
            <p class="font-semibold text-gray-900">陆启闯</p>
          </div>
          <div>
            <label class="text-xs text-gray-500">优先级</label>
            <p :class="['font-semibold', PRIORITY_MAP[task.priority]?.color || '']">
              {{ PRIORITY_MAP[task.priority]?.label || task.priority }}
            </p>
          </div>
        </div>
      </div>

      <!-- 任务类型 - 单一类型显示详细信息，多类型显示SOP下载 -->
      <div>
        <h4 class="text-sm font-semibold text-gray-900 mb-3">任务类型配置</h4>
        <div v-if="(task.types || []).length === 1" class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-600">任务类型：<span class="font-medium">{{ getTypeLabel(task.types[0]) }}</span></p>
          <div v-if="task.typeConfig && Object.keys(task.typeConfig).length > 0" class="mt-2 text-xs text-gray-600">
            <pre class="whitespace-pre-wrap">{{ JSON.stringify(task.typeConfig, null, 2) }}</pre>
          </div>
        </div>
        <div v-else class="bg-blue-50 rounded-lg p-4">
          <div class="flex items-center gap-3 mb-3">
            <el-icon class="w-5 h-5 text-blue-500"><Document /></el-icon>
            <span class="text-sm font-medium text-gray-700">作业标准文件</span>
          </div>
          <div v-if="task.sopContent" class="bg-white rounded-lg p-3 border border-blue-100">
            <p class="text-sm text-gray-600 mb-2">已导入SOP文档</p>
            <button
              class="text-blue-600 hover:text-blue-800 underline text-sm flex items-center gap-1"
              @click="downloadSop"
            >
              <el-icon class="w-4 h-4"><Document /></el-icon>
              下载SOP文件
            </button>
          </div>
          <p v-else class="text-sm text-gray-500">暂无SOP文件</p>
          <div class="mt-3">
            <p class="text-xs text-gray-500 mb-2">已选择的操作类型：</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="t in (task.types || [])"
                :key="t"
                :class="['px-2 py-1 rounded text-xs text-white', getTypeColor(t)]"
              >
                {{ getTypeLabel(t) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 所需物资 -->
      <div v-if="task.materials && task.materials.length > 0">
        <h4 class="text-sm font-semibold text-gray-900 mb-3">所需物资</h4>
        <div class="bg-gray-50 rounded-lg p-3">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs text-gray-500 border-b border-gray-200">
                <th class="text-left pb-2">物资名称</th>
                <th class="text-right pb-2">数量</th>
                <th class="text-right pb-2">单位</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(m, i) in task.materials"
                :key="i"
                class="border-b border-gray-100 last:border-0"
              >
                <td class="py-2 text-gray-900">{{ m.name }}</td>
                <td class="py-2 text-gray-900 text-right">{{ m.qty }}</td>
                <td class="py-2 text-gray-500 text-right">{{ m.unit }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 时间信息 -->
      <div>
        <h4 class="text-sm font-semibold text-gray-900 mb-3">时间信息</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label class="text-xs text-gray-500">计划开始</label>
            <p class="font-semibold text-gray-900">{{ task.planStart || '-' }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-500">计划结束</label>
            <p class="font-semibold text-gray-900">{{ task.planEnd || '-' }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-500">状态</label>
            <p>
              <span
                :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  STATUS_MAP[task.status]?.bg || '',
                  STATUS_MAP[task.status]?.color || ''
                ]"
              >
                {{ STATUS_MAP[task.status]?.label || task.status }}
              </span>
            </p>
          </div>
          <div>
            <label class="text-xs text-gray-500">预计时长</label>
            <p class="font-semibold text-gray-900">
              <span v-if="task.estimatedDays > 0">{{ task.estimatedDays }}天</span>
              <span v-if="task.estimatedHours > 0">{{ task.estimatedHours }}小时</span>
              <span v-if="!task.estimatedDays && !task.estimatedHours">-</span>
            </p>
          </div>
        </div>
      </div>

      <!-- 实际完成工作量 -->
      <div v-if="hasActualWorkload">
        <h4 class="text-sm font-semibold text-gray-900 mb-3">实际完成工作量</h4>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="text-xs text-green-600">实际工日</label>
              <p class="font-bold text-green-700 text-lg">
                <span v-if="actualWorkload.days > 0">{{ actualWorkload.days }}天</span>
                <span v-else>-</span>
              </p>
            </div>
            <div>
              <label class="text-xs text-green-600">实际工时</label>
              <p class="font-bold text-green-700 text-lg">
                <span v-if="actualWorkload.hours > 0">{{ actualWorkload.hours }}小时</span>
                <span v-else>-</span>
              </p>
            </div>
            <div>
              <label class="text-xs text-green-600">作业人数</label>
              <p class="font-bold text-green-700 text-lg">
                <span v-if="actualWorkload.workers > 0">{{ actualWorkload.workers }}人</span>
                <span v-else>-</span>
              </p>
            </div>
          </div>
          <div v-if="task.estimatedDays !== undefined && task.estimatedHours !== undefined" class="mt-3 pt-3 border-t border-green-200">
            <p class="text-xs text-green-600">
              预估总工时：{{ (task.estimatedDays * 8 + task.estimatedHours) }}小时
              → 实际总工时：{{ actualWorkload.days * 8 + actualWorkload.hours }}小时
              <span
                v-if="actualWorkload.days * 8 + actualWorkload.hours > 0"
                :class="[
                  'ml-2',
                  (actualWorkload.days * 8 + actualWorkload.hours) > (task.estimatedDays * 8 + task.estimatedHours)
                    ? 'text-red-600'
                    : 'text-green-600'
                ]"
              >
                ({{ (actualWorkload.days * 8 + actualWorkload.hours) > (task.estimatedDays * 8 + task.estimatedHours) ? '超出' : '节省' }}{{ Math.abs((actualWorkload.days * 8 + actualWorkload.hours) - (task.estimatedDays * 8 + task.estimatedHours)).toFixed(1) }}小时)
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- 必填反馈 -->
      <div v-if="task.requiredFeedback && task.requiredFeedback.length > 0">
        <h4 class="text-sm font-semibold text-gray-900 mb-3">必填反馈</h4>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="fb in task.requiredFeedback"
            :key="fb"
            class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
          >
            {{ fb === 'gps' ? '位置打卡' :
               fb === 'material' ? '物资扫码' :
               fb === 'photo_before' ? '作业前照片' :
               fb === 'photo_after' ? '作业后照片' :
               fb === 'voice' ? '语音备注' : fb }}
          </span>
        </div>
      </div>

      <!-- 流转记录（汇总：problemFlowRecords + operationRecords + taskRecords） -->
      <div>
        <TaskFlowTimeline :records="mergedFlowRecords" />
      </div>

      <!-- 操作记录（useOperationRecords） -->
      <div v-if="operationRecords && operationRecords.length > 0">
        <h4 class="text-sm font-semibold text-gray-900 mb-3">操作记录</h4>
        <div class="space-y-4">
          <div
            v-for="(record, idx) in operationRecords"
            :key="idx"
            class="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                  {{ record.operationTypeName || record.operationType }}
                </span>
                <span class="text-sm font-medium text-gray-900">{{ record.operatorName }}</span>
              </div>
              <span class="text-xs text-gray-500">{{ record.operationDate }}</span>
            </div>
            <!-- 显示子记录（children） -->
            <div
              v-if="record.children && record.children.length > 0"
              class="mt-3 pl-4 border-l-2 border-gray-400 space-y-3"
            >
              <div
                v-for="(child, childIdx) in record.children"
                :key="childIdx"
                class="bg-white rounded p-3 shadow-sm"
              >
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                      {{ child.operationTypeName || child.operationType }}
                    </span>
                    <span class="text-xs text-gray-600">{{ child.operatorName }}</span>
                  </div>
                  <span class="text-xs text-gray-400">{{ child.time || child.operationDate }}</span>
                </div>
                <div v-if="child.workloadDays || child.workloadHours || child.workers" class="text-xs text-gray-600 mb-1">
                  工作量：<span v-if="child.workloadDays">{{ child.workloadDays }}天</span><span v-if="child.workloadHours">{{ child.workloadHours }}小时</span><span v-if="child.workers">×{{ child.workers }}人</span>
                </div>
                <div v-if="child.progress !== undefined" class="text-xs text-gray-600 mb-1">
                  进度：{{ child.progress }}%<span v-if="child.progressIncrement > 0" class="text-emerald-600 ml-1">({{ child.progressIncrement > 0 ? '+' : '' }}{{ child.progressIncrement }}%)</span>
                </div>
                <div v-if="child.gpsLocation" class="text-xs text-emerald-600 mb-1">
                  GPS：{{ child.gpsLocation.lat.toFixed(6) }}, {{ child.gpsLocation.lng.toFixed(6) }}
                </div>
                <div v-if="(child.photosBefore && child.photosBefore.length) || (child.photosAfter && child.photosAfter.length)" class="text-xs text-blue-600 mb-1">
                  照片：{{ (child.photosBefore || []).length }}张(前) + {{ (child.photosAfter || []).length }}张(后)
                </div>
                <div v-if="child.voiceNote" class="text-xs text-purple-600 mb-1">语音备注</div>
                <div v-if="child.materials && child.materials.length > 0" class="text-xs text-orange-600 mb-1">
                  物料：{{ child.materials.map(m => `${m.name}×${m.qty}`).join(', ') }}
                </div>
                <div v-if="child.remarks" class="text-sm text-gray-700 bg-gray-50 rounded px-2 py-1 mt-1">
                  {{ child.remarks }}
                </div>
                <div v-if="child.rejectReason" class="text-sm text-red-600 bg-red-50 rounded px-2 py-1 mt-1">
                  驳回原因：{{ child.rejectReason }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 任务流转记录（useTasks.taskRecords） -->
      <div v-if="taskRecords && taskRecords.length > 0">
        <h4 class="text-sm font-semibold text-gray-900 mb-3">任务流转记录</h4>
        <div class="space-y-4">
          <div
            v-for="(record, idx) in taskRecords"
            :key="idx"
            class="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                  {{ record.actionName || record.action }}
                </span>
                <span class="text-sm font-medium text-gray-900">{{ record.operatorName }}</span>
              </div>
              <span class="text-xs text-gray-500">{{ formatDateTime(record.actionTime) }}</span>
            </div>
            <!-- 状态变化 -->
            <div v-if="record.fromStatus || record.toStatus" class="flex items-center gap-1 mb-2 text-xs">
              <span v-if="record.fromStatus" class="px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                {{ record.fromStatus }}
              </span>
              <span v-if="record.fromStatus && record.toStatus" class="text-gray-400">→</span>
              <span v-if="record.toStatus" class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                {{ record.toStatus }}
              </span>
            </div>
            <div v-if="record.progress !== undefined" class="text-xs text-gray-600 mb-1">
              进度：{{ record.progress }}%<span v-if="record.progressIncrement > 0" class="text-emerald-600 ml-1">({{ record.progressIncrement > 0 ? '+' : '' }}{{ record.progressIncrement }}%)</span>
            </div>
            <div v-if="record.comment" class="text-sm text-gray-600 bg-white rounded p-2 mt-2">
              {{ record.comment }}
            </div>
            <div v-if="record.reason" class="text-sm text-red-600 bg-red-50 rounded p-2 mt-2">
              驳回原因：{{ record.reason }}
            </div>
          </div>
        </div>
      </div>

      <!-- 进度（只读） -->
      <div>
        <h4 class="text-sm font-semibold text-gray-900 mb-3">执行进度</h4>
        <div class="flex items-center gap-4">
          <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full transition-all" :style="{ width: (task.progress || 0) + '%' }" />
          </div>
          <span class="w-14 text-sm font-medium text-gray-700 text-center">
            {{ task.progress || 0 }}%
          </span>
        </div>
        <p class="text-xs text-gray-400 mt-1">
          <span v-if="task.progress === 100">已完成</span>
          <span v-else-if="task.progress === 0">未开始</span>
          <span v-else>进行中</span>
        </p>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
/**
 * 任务详情弹窗组件
 * 1:1 迁移自 V1.1 src/components/labor/myTasks/TaskDetailModal.tsx
 */
import { computed } from 'vue'
import { Document } from '@element-plus/icons-vue'
import { STATUS_MAP, PRIORITY_MAP, getTypeColor, getTypeLabel } from './constants.js'
import TaskFlowTimeline from '@/components/common/TaskFlowTimeline.vue'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  onClose: { type: Function, required: true },
  task: { type: Object, default: null },
  problemFlowRecords: { type: Array, default: () => [] },
  operationRecords: { type: Array, default: () => [] },
  taskRecords: { type: Array, default: () => [] },
  getActualWorkload: { type: Function, default: () => () => ({ days: 0, hours: 0, workers: 0 }) },
})

const actualWorkload = computed(() => {
  if (!props.task) return { days: 0, hours: 0, workers: 0 }
  return props.getActualWorkload() || { days: 0, hours: 0, workers: 0 }
})
const hasActualWorkload = computed(() => {
  const w = actualWorkload.value
  return (w.days || 0) > 0 || (w.hours || 0) > 0
})

// 汇总流转记录（与 V1.1 TaskDetailModal.tsx 的 flowRecords 逻辑一致）
const mergedFlowRecords = computed(() => {
  if (!props.task) return []

  const flowRecords = []

  // 1. problemFlowRecords
  props.problemFlowRecords.forEach((r, idx) => {
    flowRecords.push({
      id: r.id || `pf_${Date.now()}_${idx}`,
      action: r.action || 'comment',
      actionTime: r.actionTime || r.createdAt || '',
      operatorName: r.operatorName || r.operator || '系统',
      fromStatus: r.fromStatus,
      toStatus: r.toStatus,
      comment: r.comment || r.reason || '',
    })
  })

  // 2. operationRecords
  props.operationRecords.forEach((r, idx) => {
    const opType = r.operationTypeName || r.operationType || ''
    const action = mapActionByName(opType)
    flowRecords.push({
      id: `opr_${idx}_${Date.now()}`,
      action,
      actionTime: r.operationDate || r.createdAt || '',
      operatorName: r.operatorName || r.operator || '系统',
      toStatus: r.status,
      comment: r.remarks || r.rejectReason || '',
    })
    // 子记录 children
    const children = r.children || []
    children.forEach((child, childIdx) => {
      const childType = child.operationTypeName || child.operationType || ''
      const childAction = mapActionByName(childType)
      flowRecords.push({
        id: `opr_c_${idx}_${childIdx}_${Date.now()}`,
        action: childAction,
        actionTime: child.time || child.operationDate || '',
        operatorName: child.operatorName || '',
        toStatus: r.status || child.status,
        comment: child.remarks || '',
      })
    })
  })

  // 3. taskRecords（useTasks 系统）
  props.taskRecords.forEach((r, idx) => {
    const actionName = r.actionName || r.action || ''
    const action = mapActionByName(actionName)
    flowRecords.push({
      id: r.id || `tr_${idx}_${Date.now()}`,
      action,
      actionTime: r.actionTime || r.createdAt || '',
      operatorName: r.operatorName || r.operator || '系统',
      fromStatus: r.fromStatus,
      toStatus: r.toStatus,
      comment: r.comment || r.reason || r.remarks || '',
    })
  })

  // 按时间排序
  return flowRecords.sort((a, b) => {
    const tA = new Date(a.actionTime).getTime() || 0
    const tB = new Date(b.actionTime).getTime() || 0
    return tA - tB
  })
})

// 操作名称映射（与 V1.1 mapAction 逻辑一致）
function mapActionByName(typeName) {
  if (!typeName) return 'comment'
  const t = String(typeName)
  if (t.includes('分派') || t.includes('派工') || t.includes('派遣')) return 'dispatch'
  if (t.includes('接单') || t.includes('接受')) return 'accept'
  if (t.includes('拒绝') || t.includes('驳回')) return 'reject'
  if (t.includes('开始') || t.includes('执行')) return 'start'
  if (t.includes('提交') || t.includes('反馈')) return 'submit'
  if (t.includes('验收') || t.includes('审核') || t.includes('批准')) return 'approve'
  if (t.includes('完成')) return 'complete'
  return 'comment'
}

function formatDateTime(timeStr) {
  if (!timeStr) return '-'
  return new Date(timeStr).toLocaleString('zh-CN')
}

function downloadSop() {
  if (!props.task) return
  const blob = new Blob([props.task.sopContent || ''], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `任务SOP_${props.task.id}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
</script>