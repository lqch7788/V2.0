<template>
  <el-dialog
    :model-value="isOpen"
    title="工资条详情"
    width="500px"
    @close="onClose"
  >
    <div>
      <!-- 基本信息 -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-sm font-medium text-gray-500">员工信息</h4>
          <span
            :class="[
              'inline-flex px-2 py-1 rounded-full text-xs font-medium',
              record?.status === '已发放' ? 'bg-green-100 text-green-700' :
              record?.status === '已确认' ? 'bg-blue-100 text-blue-700' :
              'bg-amber-100 text-amber-700'
            ]"
          >
            {{ record?.status }}
          </span>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-gray-500">姓名</p>
            <p class="text-sm font-medium text-gray-900">{{ record?.staffName }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">月份</p>
            <p class="text-sm font-medium text-gray-900">{{ record?.month }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">工号</p>
            <p class="text-sm font-medium text-gray-900">{{ record?.staffId }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">计算方式</p>
            <p class="text-sm font-medium text-gray-900">{{ record?.calcType }}</p>
          </div>
        </div>
      </div>

      <!-- 应发项目 -->
      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-500 mb-3">应发项目</h4>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">基本工资</span>
            <span class="text-gray-900">¥{{ record?.baseSalary?.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">加班费</span>
            <span class="text-gray-900">¥{{ record?.overtimePay?.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">奖金</span>
            <span class="text-gray-900">¥{{ record?.bonuses?.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between text-sm font-medium border-t border-gray-100 pt-2">
            <span class="text-gray-700">应发合计</span>
            <span class="text-emerald-600">¥{{ grossSalary.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- 扣款项目 -->
      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-500 mb-3">扣款项目</h4>
        <div class="space-y-2">
          <div v-if="record?.deductions && record.deductions > 0" class="flex justify-between text-sm">
            <span class="text-gray-600">扣款</span>
            <span class="text-red-600">-¥{{ record.deductions.toLocaleString() }}</span>
          </div>
          <div v-if="record?.lateDeductions && record.lateDeductions > 0" class="flex justify-between text-sm">
            <span class="text-gray-600">迟到扣款</span>
            <span class="text-red-600">-¥{{ record.lateDeductions.toLocaleString() }}</span>
          </div>
          <div v-if="record?.absenceDeductions && record.absenceDeductions > 0" class="flex justify-between text-sm">
            <span class="text-gray-600">缺勤扣款</span>
            <span class="text-red-600">-¥{{ record.absenceDeductions.toLocaleString() }}</span>
          </div>
          <div v-if="record?.socialSecurity && record.socialSecurity > 0" class="flex justify-between text-sm">
            <span class="text-gray-600">社保</span>
            <span class="text-red-600">-¥{{ record.socialSecurity.toLocaleString() }}</span>
          </div>
          <div v-if="record?.housingFund && record.housingFund > 0" class="flex justify-between text-sm">
            <span class="text-gray-600">公积金</span>
            <span class="text-red-600">-¥{{ record.housingFund.toLocaleString() }}</span>
          </div>
          <div v-if="record?.personalTax && record.personalTax > 0" class="flex justify-between text-sm">
            <span class="text-gray-600">个税</span>
            <span class="text-red-600">-¥{{ record.personalTax.toLocaleString() }}</span>
          </div>
          <div v-if="totalDeductions === 0" class="text-sm text-gray-400">无扣款</div>
          <div class="flex justify-between text-sm font-medium border-t border-gray-100 pt-2">
            <span class="text-gray-700">扣款合计</span>
            <span class="text-red-600">-¥{{ totalDeductions.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- 实发工资 -->
      <div class="bg-emerald-50 rounded-lg p-4">
        <div class="flex justify-between items-center">
          <span class="text-sm font-medium text-emerald-700">实发工资</span>
          <span class="text-xl font-bold text-emerald-600">
            ¥{{ record?.netSalary?.toLocaleString() }}
          </span>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="onClose" class="w-full">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({})

// 计算应发合计
const grossSalary = computed(() => {
  if (!props.record) return 0
  return props.record.baseSalary + props.record.overtimePay + props.record.bonuses
})

// 计算扣款合计
const totalDeductions = computed(() => {
  if (!props.record) return 0
  return (
    props.record.deductions +
    props.record.lateDeductions +
    props.record.absenceDeductions +
    props.record.socialSecurity +
    props.record.housingFund +
    props.record.personalTax
  )
})
</script>
