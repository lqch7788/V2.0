<!--
  MaterialApproval 详情弹窗子组件
  从 MaterialApproval.vue 拆分（保持 1:1 模板和样式）
  Props:
    - modelValue: Boolean 控制显示
    - item: 详情数据
    - activeTab: 当前 tab key（return / material 等）
    - canApprove: 是否有审批权限
  Emits:
    - update:modelValue
    - approve(item)
    - reject(item)
-->
<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="$emit('update:modelValue', false)">
    <div class="bg-white rounded-xl w-full max-w-[900px] max-h-[90vh] overflow-hidden shadow-2xl" @click.stop>
      <!-- 弹窗头部 -->
      <div class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white flex items-center justify-between">
        <h3 class="text-lg font-semibold">{{ activeTab === 'return' ? '退料单' : '领料单' }}详情</h3>
        <button @click="$emit('update:modelValue', false)" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
      </div>

      <div v-if="item" class="p-6 overflow-y-auto max-h-[70vh]">
        <!-- 基本信息 -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label class="text-xs text-gray-500 block">单号</label>
            <p class="font-mono font-semibold text-gray-900">{{ item.code }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-500 block">申请日期</label>
            <p class="font-semibold text-gray-900">{{ item.applyDate }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-500 block">状态</label>
            <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1" :class="{
              'bg-green-100 text-green-700': item.status === 'approved',
              'bg-red-100 text-red-700': item.status === 'rejected',
              'bg-amber-100 text-amber-700': item.status === 'pending',
              'bg-gray-100 text-gray-700': item.status === 'cancelled' || item.status === 'draft'
            }">{{ getStatusText(item.status) }}</span>
            <p v-if="item.status === 'rejected' && item.records && item.records.length > 0" class="text-xs text-red-600 mt-1">
              拒绝原因：{{ item.records[item.records.length - 1]?.comment || '-' }}
            </p>
          </div>
          <div>
            <label class="text-xs text-gray-500 block">申请人</label>
            <p class="font-semibold text-gray-900">{{ item.applicantName }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-500 block">部门</label>
            <p class="font-semibold text-gray-900">{{ item.applicantDepartment }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-500 block">审核人</label>
            <p class="font-semibold text-gray-900">{{ item.approvers?.[0]?.userName || '-' }}</p>
          </div>
          <template v-if="activeTab === 'material' && item.businessLink">
            <div>
              <label class="text-xs text-gray-500 block">库存地点</label>
              <p class="font-semibold text-gray-900">{{ item.businessLink?.warehouseLocation || '-' }}</p>
            </div>
            <div>
              <label class="text-xs text-gray-500 block">生产计划批次号</label>
              <p class="font-semibold text-gray-900">{{ item.businessLink?.batchCode || '-' }}</p>
            </div>
            <div>
              <label class="text-xs text-gray-500 block">物料种类</label>
              <p class="font-semibold text-gray-900">
                {{ item.materials?.length > 0 ? `${item.materials.length}种` : '-' }}
              </p>
            </div>
            <div>
              <label class="text-xs text-gray-500 block">种植区域/用途</label>
              <p class="font-semibold text-gray-900">{{ item.businessLink?.plantArea || '-' }}</p>
            </div>
          </template>
        </div>

        <!-- 描述/说明 -->
        <div v-if="item.description" class="mb-6">
          <label class="text-xs text-gray-500 block mb-1">申请说明</label>
          <p class="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{{ item.description }}</p>
        </div>

        <!-- 物料明细 -->
        <div class="mb-6">
          <label class="text-xs text-gray-500 block mb-2">
            {{ activeTab === 'return' ? '退料单' : '领料单' }}物料明细
          </label>
          <div v-if="item.materials?.length > 0" class="overflow-x-auto rounded-lg border border-gray-200">
            <table class="w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">物料编码</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">物料名称</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">物料分类</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">规格</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">单位</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">数量</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">已批数量</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="m in item.materials" :key="m.id || m.materialCode">
                  <td class="px-3 py-2 text-xs text-blue-700 font-mono whitespace-nowrap">{{ m.materialCode }}</td>
                  <td class="px-3 py-2 text-xs text-blue-700 whitespace-nowrap">{{ m.materialName }}</td>
                  <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ getCategoryByCode(m.materialCode) }}</td>
                  <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.spec }}</td>
                  <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.unit }}</td>
                  <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.requestedQuantity || m.returnQuantity }}</td>
                  <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.approvedQuantity || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">暂无物料明细</div>
        </div>

        <!-- 审批记录 -->
        <div v-if="item.records && item.records.length > 0" class="mb-6">
          <label class="text-xs text-gray-500 block mb-2">审批记录</label>
          <div class="space-y-2">
            <div v-for="(r, idx) in item.records" :key="idx" class="bg-gray-50 rounded-lg p-3 text-sm">
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-700">{{ r.approverName }}</span>
                <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="{
                  'bg-green-100 text-green-700': r.action === 'approve',
                  'bg-red-100 text-red-700': r.action === 'reject',
                  'bg-gray-100 text-gray-700': r.action !== 'approve' && r.action !== 'reject'
                }">{{ r.action === 'approve' ? '通过' : r.action === 'reject' ? '拒绝' : '部分通过' }}</span>
              </div>
              <p v-if="r.comment" class="text-gray-600 mt-1">原因：{{ r.comment }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ r.actionTime }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 弹窗底部 -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
        <button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="$emit('update:modelValue', false)">
          <X class="w-4 h-4 inline mr-1" />关闭
        </button>
        <template v-if="item?.status === 'pending'">
          <button class="h-8 px-4 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="$emit('approve', item)">通过</button>
          <button class="h-8 px-4 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700" @click="$emit('reject', item)">拒绝</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { X } from 'lucide-vue-next'
import { getStatusText, getCategoryByCode } from '../utils/materialApprovalLabels'

defineProps({
  modelValue: { type: Boolean, default: false },
  item: { type: Object, default: null },
  activeTab: { type: String, default: 'material' },
  canApprove: { type: Boolean, default: true }
})

defineEmits(['update:modelValue', 'approve', 'reject'])
</script>
