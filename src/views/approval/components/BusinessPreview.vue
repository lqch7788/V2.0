<!--
  业务关联预览组件
  对标 V1.1 src/components/approval/BusinessPreview.tsx
  功能：展示审批单关联的业务数据（生产计划/采购单/物料申请等）
-->
<template>
  <div v-if="businessLink" class="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
    <div class="flex items-center gap-2 mb-3">
      <el-icon :size="18" color="#059669"><Link /></el-icon>
      <span class="font-semibold text-gray-900">关联业务</span>
      <el-tag size="small" type="success">{{ linkTypeText }}</el-tag>
    </div>

    <!-- 业务基本信息 -->
    <div class="grid grid-cols-2 gap-3 text-sm">
      <div v-if="businessLink.code">
        <span class="text-gray-500">单号：</span>
        <span class="font-mono font-medium">{{ businessLink.code }}</span>
      </div>
      <div v-if="businessLink.title">
        <span class="text-gray-500">标题：</span>
        <span class="font-medium">{{ businessLink.title }}</span>
      </div>
      <div v-if="businessLink.amount !== undefined">
        <span class="text-gray-500">金额：</span>
        <span class="font-semibold text-emerald-700">¥{{ formatAmount(businessLink.amount) }}</span>
      </div>
      <div v-if="businessLink.quantity">
        <span class="text-gray-500">数量：</span>
        <span class="font-medium">{{ businessLink.quantity }}</span>
      </div>
      <div v-if="businessLink.creator">
        <span class="text-gray-500">创建人：</span>
        <span class="font-medium">{{ businessLink.creator }}</span>
      </div>
      <div v-if="businessLink.createTime">
        <span class="text-gray-500">创建时间：</span>
        <span class="font-medium">{{ businessLink.createTime }}</span>
      </div>
    </div>

    <!-- 跳转链接 -->
    <div v-if="businessLink.url" class="mt-3 pt-3 border-t border-emerald-200">
      <el-button type="primary" link size="small" @click="goBusinessLink">
        <el-icon><View /></el-icon>
        查看业务详情
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Link, View } from '@element-plus/icons-vue'

const props = defineProps({
  approval: { type: Object, required: true },
  businessLink: { type: Object, required: true },
})

const LINK_TYPE_TEXT = {
  production_plan: '生产计划',
  material_request: '物料申请',
  purchase_request: '采购申请',
  task_dispatch: '任务派发',
  leave: '请假',
  overtime: '加班',
  budget: '预算',
  contract: '合同',
}

const linkTypeText = computed(
  () => LINK_TYPE_TEXT[props.businessLink.type] || props.businessLink.typeName || '业务数据'
)

const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '0.00'
  return Number(amount).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const goBusinessLink = () => {
  if (props.businessLink.url) {
    window.open(props.businessLink.url, '_blank')
  }
}
</script>