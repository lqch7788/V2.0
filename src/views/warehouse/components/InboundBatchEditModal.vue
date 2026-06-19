<!--
  批量编辑入库弹窗 - 从 WarehouseInbound.vue 提取
  原文件 L558-614 (~57 行模板)
  V2.0-PM-004 拆分第 2/6 阶段
-->
<template>
  <ElModal
    :model-value="isOpen"
    title="批量编辑入库记录"
    :width="1350"
    :height="700"
    :show-footer="true"
    :show-submit="false"
    :show-cancel="false"
    :show-maximize="false"
    :enable-drag="false"
    :enable-resize="false"
    @update:model-value="(v) => { if (!v) $emit('close') }"
    @close="$emit('close')"
  >
    <template #header-action>
      <span class="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded">已选择 {{ recordCount }} 条</span>
    </template>

    <div>
      <p class="text-sm text-gray-500 mb-4">正在编辑 {{ recordCount }} 条入库记录</p>

      <div class="grid gap-4">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">入库日期</label>
          <input
            v-model="localFields.inboundDate"
            type="date"
            placeholder="如不修改请留空"
            class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">供应商</label>
          <input
            v-model="localFields.supplier"
            placeholder="如不修改请留空"
            class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">操作员</label>
          <input
            v-model="localFields.operator"
            placeholder="如不修改请留空"
            class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">状态</label>
          <select
            v-model="localFields.status"
            class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm bg-white"
          >
            <option value="">如不修改请留空</option>
            <option value="completed">已完成</option>
            <option value="pending">待审核</option>
            <option value="voided">已作废</option>
          </select>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button size="small" @click="$emit('close')">取消</el-button>
        <el-button type="primary" size="small" @click="handleSave">保存</el-button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { ElModal } from '@/components/ui'
import { reactive, watch } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  recordCount: { type: Number, default: 0 },
  fields: {
    type: Object,
    required: true
    // shape: { inboundDate, supplier, operator, status }
  }
})

const emit = defineEmits(['close', 'save'])

// 本地副本 - 避免直接修改 prop 触发 vue/no-mutating-props
const localFields = reactive({ inboundDate: '', supplier: '', operator: '', status: '' })

// 同步外部 prop 到本地副本（prop 变化时重置表单）
watch(
  () => props.fields,
  (val) => {
    localFields.inboundDate = val?.inboundDate ?? ''
    localFields.supplier = val?.supplier ?? ''
    localFields.operator = val?.operator ?? ''
    localFields.status = val?.status ?? ''
  },
  { immediate: true, deep: true }
)

const handleSave = () => {
  // 父级通过 @save="(payload) => handleBatchSave(payload)" 接收
  emit('save', { ...localFields })
}
</script>
