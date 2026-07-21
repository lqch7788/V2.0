<!--
  育苗详情弹窗（完整重写 - 对齐 V1.1 DetailModal.tsx L20-264 SeedlingBasicInfo 组件）
  5 大区块：基本信息 / 数量信息 / 数量统计 / 栽种记录 / 其他信息
-->
<template>
  <SimpleModal
    :visible="visible"
    title="育苗详情"
    width="1000px"
    submit-text="关闭"
    @close="$emit('close')"
    @submit="$emit('close')"
  >
    <div v-if="record" class="space-y-6 text-sm">
      <!-- 基本信息 -->
      <section>
        <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">基本信息</h4>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center"><span class="text-gray-500 w-24">育苗批号：</span><span class="font-mono text-blue-600">{{ record.seedlingCode }}</span></div>
          <div class="flex items-center"><span class="text-gray-500 w-24">作物品种：</span><span class="text-gray-900">{{ record.cropName || '-' }}</span></div>
          <div class="flex items-center"><span class="text-gray-500 w-24">品种路径：</span><span class="text-gray-900">{{ record.cropVariety || '-' }}</span></div>
          <div class="flex items-center"><span class="text-gray-500 w-24">关联种源：</span><span class="text-gray-900">{{ record.sourceCode || '-' }}</span></div>
          <div class="flex items-center"><span class="text-gray-500 w-24">育苗方式：</span><span class="text-gray-900">{{ record.seedlingType || '-' }}</span></div>
          <div v-if="record.seedlingForm" class="flex items-center"><span class="text-gray-500 w-24">种苗形态：</span><span class="text-gray-900">{{ record.seedlingForm }}</span></div>
          <div class="flex items-center"><span class="text-gray-500 w-24">温室场地：</span><span class="text-gray-900">{{ record.siteName || '-' }}</span></div>
          <div v-if="record.orgName" class="flex items-center"><span class="text-gray-500 w-24">所属组织：</span><span class="text-gray-900">{{ record.orgName }}</span></div>
          <div v-if="record.seedlingTaskTime !== undefined && record.seedlingTaskTime !== null" class="flex items-center"><span class="text-gray-500 w-24">育苗工时：</span><span class="text-gray-900">{{ record.seedlingTaskTime }} 小时</span></div>
        </div>
      </section>

      <!-- 数量信息 -->
      <section>
        <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">数量信息</h4>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center"><span class="text-gray-500 w-24">开始日期：</span><span class="text-gray-900">{{ record.startDate || '-' }}</span></div>
          <div class="flex items-center"><span class="text-gray-500 w-24">结束日期：</span><span class="text-gray-900">{{ record.endDate || '-' }}</span></div>
          <div class="flex items-center"><span class="text-gray-500 w-24">预计结束：</span><span class="text-gray-900">{{ record.expectedEndDate || '-' }}</span></div>
          <div class="flex items-center"><span class="text-gray-500 w-24">初始数量：</span><span class="text-gray-900">{{ (record.initialCount || 0).toLocaleString() }}</span></div>
          <div class="flex items-center"><span class="text-gray-500 w-24">成活数量：</span><span class="text-emerald-600 font-medium">{{ (record.survivalCount || 0).toLocaleString() }}</span></div>
          <div class="flex items-center"><span class="text-gray-500 w-24">成苗率：</span><span class="text-emerald-600 font-bold">{{ record.survivalRate || 0 }}%</span></div>
          <div class="flex items-center"><span class="text-gray-500 w-24">育苗结束：</span><span class="text-gray-900">{{ record.isFinished ? '是' : '否' }}</span></div>
          <div class="flex items-center"><span class="text-gray-500 w-24">状态：</span><span :class="['px-2 py-1 rounded text-xs font-medium', statusColor]">{{ statusLabel }}</span></div>
          <div v-if="record.qualityGrade" class="flex items-center"><span class="text-gray-500 w-24">品质等级：</span><span class="text-gray-900">{{ record.qualityGrade }}</span></div>
        </div>

        <!-- 数量统计区（V1.1 L141-168） -->
        <div class="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <h5 class="text-sm font-semibold text-amber-900 mb-2">数量统计（自动累加，对应 DB 字段）</h5>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center"><span class="text-gray-500 w-32">母株累计损耗：</span><span class="text-red-500 font-medium">{{ (record.motherLossCount || 0).toLocaleString() }}</span></div>
            <div class="flex items-center"><span class="text-gray-500 w-32">小苗累计产出：</span><span class="text-emerald-600 font-medium">{{ (record.expandedPlantCount || 0).toLocaleString() }}</span></div>
            <div class="flex items-center"><span class="text-gray-500 w-32">小苗累计损耗：</span><span class="text-red-500 font-medium">{{ (record.seedlingLossCount || 0).toLocaleString() }}</span></div>
            <div class="flex items-center"><span class="text-gray-500 w-32">采收入库累计：</span><span class="text-purple-600 font-medium">{{ (record.harvestStockedCount || 0).toLocaleString() }}</span></div>
            <div class="flex items-center"><span class="text-gray-500 w-32">补苗累计：</span><span class="text-emerald-600 font-medium">{{ (record.replantCount || 0).toLocaleString() }}</span></div>
          </div>
          <p class="text-xs text-gray-500 mt-2">
            累计损耗 = 母株累计损耗 + 小苗累计损耗 = {{ ((record.motherLossCount || 0) + (record.seedlingLossCount || 0)).toLocaleString() }} 株
          </p>
        </div>
      </section>

      <!-- 栽种记录（V1.1 L172-201） -->
      <section v-if="record.transplantRecords && record.transplantRecords.length > 0">
        <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          栽种记录（{{ record.transplantRecords.length }} 条）
        </h4>
        <div class="max-h-40 overflow-y-auto space-y-2">
          <div v-for="(tr, idx) in record.transplantRecords" :key="tr.id || idx" class="bg-gray-50 rounded p-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="font-medium">{{ tr.transplantDate }}</span>
              <span :class="['px-2 py-0.5 rounded text-xs', transplantStatusClass(tr.status)]">
                {{ transplantStatusLabel(tr.status) }}
              </span>
            </div>
            <div class="mt-1 text-gray-600 grid grid-cols-2 gap-1 text-xs">
              <span>场地：{{ tr.areaName }}</span>
              <span v-if="tr.zoneName">区域：{{ tr.zoneName }}</span>
              <span v-if="tr.bedName">苗床：{{ tr.bedName }}</span>
              <span>定植数量：{{ tr.transplantCount }}</span>
              <span>剩余：{{ tr.remainingCount }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 其他信息（V1.1 L203-261） -->
      <section>
        <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">其他信息</h4>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center"><span class="text-gray-500 w-24">创建人：</span><span class="text-gray-900">{{ record.createBy || '-' }}</span></div>
          <div class="flex items-center"><span class="text-gray-500 w-24">创建时间：</span><span class="text-gray-900">{{ record.createTime || '-' }}</span></div>
          <div class="flex items-center"><span class="text-gray-500 w-24">更新时间：</span><span class="text-gray-900">{{ record.updateTime || '-' }}</span></div>
          <div class="flex items-center"><span class="text-gray-500 w-24">打印次数：</span><span class="text-gray-900">{{ record.printCount || 0 }} 次</span></div>
          <div class="flex items-center"><span class="text-gray-500 w-24">每日记录：</span><span class="text-gray-900">{{ (record.dailyRecords || []).length }} 条</span></div>
          <div class="flex items-center"><span class="text-gray-500 w-24">打印记录：</span><span class="text-gray-900">{{ record.printRecords ? `${record.printRecords.length} 条` : '0 条' }}</span></div>
          <div class="flex items-center"><span class="text-gray-500 w-24">作物编码：</span><span class="font-mono text-orange-600">{{ record.cropCode || '—' }}</span></div>
          <div class="flex items-center"><span class="text-gray-500 w-24">单位：</span><span class="text-gray-900">{{ record.unit || '—' }}</span></div>
          <div v-if="record.remarks" class="col-span-2 flex items-start">
            <span class="text-gray-500 w-24 flex-shrink-0">备注：</span>
            <span class="text-gray-900">{{ record.remarks }}</span>
          </div>
        </div>
      </section>
    </div>
  </SimpleModal>
</template>

<script setup>
import { computed } from 'vue'
import SimpleModal from '@/components/common/SimpleModal.vue'

const props = defineProps({ visible: Boolean, record: Object })
defineEmits(['close'])

const statusMap = {
  sown: { label: '已播种', color: 'text-blue-600 bg-blue-50' },
  in_progress: { label: '生长中', color: 'text-amber-600 bg-amber-50' },
  transplant_ready: { label: '待出圃', color: 'text-emerald-600 bg-emerald-50' },
  completed: { label: '已出圃', color: 'text-green-600 bg-green-50' },
  cancelled: { label: '已取消', color: 'text-gray-600 bg-gray-50' },
  abnormal: { label: '异常结束', color: 'text-red-600 bg-red-50' }
}

const statusLabel = computed(() => statusMap[props.record?.status]?.label || '未知')
const statusColor = computed(() => statusMap[props.record?.status]?.color || 'text-gray-600 bg-gray-50')

const transplantStatusLabel = (s) => ({
  in_stock: '库存',
  transplanting: '定植中',
  growing: '生长期',
  harvested: '已采收'
}[s] || s || '-')

const transplantStatusClass = (s) => ({
  in_stock: 'bg-blue-100 text-blue-700',
  transplanting: 'bg-blue-100 text-blue-700',
  growing: 'bg-green-100 text-green-700',
  harvested: 'bg-yellow-100 text-yellow-700'
}[s] || 'bg-blue-100 text-blue-700')
</script>