<template>
  <div v-if="visible" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/50" @click="emit('close')"></div>
    <div class="bg-white rounded-xl shadow-xl flex flex-col fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style="width: 700px; max-height: 90vh;">
      <div class="modal-header flex items-center justify-between px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 flex-shrink-0 rounded-t-xl cursor-default select-none">
        <h3 class="text-lg font-semibold text-white">方案详情</h3>
        <button class="text-white hover:bg-emerald-500 rounded-lg p-1" @click="emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div v-if="tech" class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-500">方案编号</label>
              <p class="text-gray-900 font-medium">{{ tech.code }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">版本</label>
              <p class="text-gray-900">{{ tech.version }}</p>
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">方案标题</label>
            <p class="text-gray-900 font-medium">{{ tech.title }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-500">作物品种</label>
              <p class="text-gray-900">{{ tech.crop }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">种植模式</label>
              <p class="text-gray-900">{{ tech.plantingMode }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-500">适用范围</label>
              <p class="text-gray-900">{{ (tech.scopes && tech.scopes.length > 0) ? tech.scopes.join('、') : (tech.stage || '-') }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">备注</label>
              <p class="text-gray-900">{{ tech.remarks || '-' }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-500">编制人</label>
              <p class="text-gray-900">{{ tech.author }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">创建日期</label>
              <p class="text-gray-900">{{ tech.createDate }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-500">审核人</label>
              <p class="text-gray-900">{{ tech.approver }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">审批状态</label>
              <span :class="['inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1', tech.approveStatus === '已审批' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700']">
                {{ tech.approveStatus }}
              </span>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">状态</label>
              <span :class="['inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1', tech.statusClass === 'normal' ? 'bg-green-100 text-green-700' : tech.statusClass === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700']">
                {{ tech.status }}
              </span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-500">审批人</label>
              <p class="text-gray-900">{{ tech.approver }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">审批日期</label>
              <p class="text-gray-900">{{ tech.approvalDate }}</p>
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">方案内容</label>
            <div class="mt-2 p-4 bg-gray-50 rounded-lg text-gray-700 text-sm leading-relaxed">{{ tech.content }}</div>
          </div>
          <!-- 审批记录（V1.1核心功能） -->
          <div class="border-t pt-4 mt-4">
            <label class="text-sm font-medium text-gray-700 mb-3 block">审批记录</label>
            <div v-if="approvalsLoading" class="text-sm text-gray-400">加载中...</div>
            <div v-else-if="approvals.length === 0" class="text-sm text-gray-400">暂无审批记录</div>
            <div v-else class="space-y-3">
              <div v-for="approval in approvals" :key="approval.id" class="bg-gray-50 rounded-lg p-3">
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm mb-2">
                  <span class="font-medium text-gray-700">{{ approval.title }}</span>
                  <span :class="['px-2 py-0.5 rounded-full text-xs', approval.status === 'approved' ? 'bg-green-100 text-green-700' : approval.status === 'rejected' ? 'bg-red-100 text-red-700' : approval.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700']">
                    {{ approvalStatusLabels[approval.status] || approval.status }}
                  </span>
                  <span class="text-gray-400">第{{ approval.currentStep }}/{{ approval.totalSteps }}步</span>
                  <span class="text-gray-400">提交时间：{{ formatDateTime(approval.createdAt) }}</span>
                </div>
                <div v-if="approval.records && approval.records.length > 0" class="space-y-2 pl-4 border-l-2 border-gray-200">
                  <div v-for="(record, idx) in approval.records" :key="idx" class="flex flex-wrap items-start gap-x-4 gap-y-1 text-sm">
                    <span class="text-gray-500 min-w-[120px]">{{ formatDateTime(record.actionTime) }}</span>
                    <span class="text-gray-700">{{ record.approverName }}</span>
                    <span :class="['font-medium', record.action === 'approve' ? 'text-green-600' : record.action === 'reject' ? 'text-red-600' : 'text-gray-600']">
                      {{ actionLabels[record.action] || record.action }}
                    </span>
                    <span v-if="record.comment" class="text-gray-500 w-full pl-32">理由：{{ record.comment }}</span>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-400 pl-4 border-l-2 border-gray-200">尚未有审批操作</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  tech: any
  approvals: any[]
  approvalsLoading: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  'close': []
}>()

// 格式化时间（含时分秒）
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

// 审批操作类型中文映射
const actionLabels: Record<string, string> = {
  approve: '通过',
  reject: '拒绝',
  partially_approve: '部分通过',
  cancel: '撤销',
}

// 审批状态中文映射
const approvalStatusLabels: Record<string, string> = {
  pending: '审批中',
  approved: '已通过',
  rejected: '已拒绝',
  cancelled: '已撤销',
  partially_approved: '部分通过',
}
</script>
