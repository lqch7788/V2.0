<template>
  <!-- 技术方案详情弹窗 - 统一使用 ElModal（V1.1 width=700 → 统一800） -->
  <ElModal
    :model-value="visible"
    title="方案详情"
    :width="1600"
    :height="900"
    :show-footer="false"
    @update:model-value="(v) => emit('update:visible', v)"
    @close="emit('close')"
  >
    <div v-if="tech" class="p-2">
      <div class="space-y-4">
          <!-- 修复 P0-004：按 V1.1 fields 配置 1:1 补回所有缺失/错位字段
               V1.1 L172-214 字段配置：
               Row1 方案编号 + 版本
               Row2 方案标题(full)
               Row3 作物品种 + 种植模式
               Row4 适用范围 + 关联批次
               Row5 编制人 + 创建日期
               Row6 最后修改时间 + 最后提交时间
               Row7 状态(Badge) + 方案是否有效
               Row8 备注 + 方案详情文件
               Row9 方案内容(full)
          -->
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
              <!-- 与 V1.1 L183 一致：使用字典映射 -->
              <p class="text-gray-900">{{ getDictItemNameSync('planting_mode', tech.plantingMode) }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-500">适用范围</label>
              <p class="text-gray-900">{{ (tech.scopes && tech.scopes.length > 0) ? tech.scopes.join('、') : (tech.stage || '-') }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">关联批次</label>
              <!-- 修复 P0-004：补回"关联批次"字段（V1.1 L193） -->
              <p class="text-gray-900">{{ tech.relatedBatchCode || '-' }}</p>
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
              <label class="text-sm font-medium text-gray-500">最后修改时间</label>
              <!-- 修复 P0-004：补回"最后修改时间"字段（V1.1 L200） -->
              <p class="text-gray-900">{{ tech.updateTime ? formatDateTime(tech.updateTime) : '-' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">最后提交时间</label>
              <!-- 修复 P0-004：补回"最后提交时间"字段（V1.1 L201） -->
              <p class="text-gray-900">{{ tech.lastSubmitTime ? formatDateTime(tech.lastSubmitTime) : '-' }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-500">状态</label>
              <span :class="['inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1', tech.statusClass === 'normal' ? 'bg-green-100 text-green-700' : tech.statusClass === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700']">
                {{ tech.status || '草稿' }}
              </span>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">方案是否有效</label>
              <p class="text-gray-900">{{ tech.isValid || '有效' }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-500">备注</label>
              <!-- 修复 P0-004：补回"备注"字段（V1.1 L208） -->
              <p class="text-gray-900">{{ tech.remarks || '-' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">方案详情文件</label>
              <!-- 修复 P0-004：补回"方案详情文件"字段（V1.1 L209） -->
              <p class="text-gray-900">{{ tech.planDetailFileName || '-' }}</p>
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">方案内容</label>
            <div class="mt-2 p-4 bg-gray-50 rounded-lg text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{{ tech.content }}</div>
          </div>
          <!-- 修复 P0-004：删除 V2.0 自创的"审批人/审批日期"行（V1.1 无此字段）
               V2.0 原 L75-84 的"审批人+审批日期"是 V2.0 端自创的多余字段，移除以严格 1:1 对齐 V1.1 -->
          <!-- 审批记录（V1.1 核心功能）-->
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
  </ElModal>
</template>

<script setup lang="ts">
import { ElModal } from '@/components/ui'
// 修复 P1-1：详情弹窗也使用共享字典映射（与 V1.1 L183 行为一致）
import { getDictItemNameSync } from '@/utils/dictHelpers'

interface Props {
  visible: boolean
  tech: any
  approvals: any[]
  approvalsLoading: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  'close': []
  'update:visible': [val: boolean]
}>()

// 修复 P1-007：与 V1.1 L75 一致，格式化为 YYYY-MM-DD HH:mm（不含秒）
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
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
