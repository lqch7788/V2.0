<!--
  MaterialReturn 搜索区子组件
  从 MaterialReturn.vue 拆分（保持 1:1 模板和样式）
-->
<template>
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm border border-gray-100">
    <div class="grid grid-cols-6 gap-4 items-end">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">退料单号</label>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input :value="searchForm.code" placeholder="搜索退料单号..." class="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm" @input="$emit('updateField', 'code', $event.target.value)" />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">物资名称</label>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input :value="searchForm.material" placeholder="搜索物资名称..." class="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm" @input="$emit('updateField', 'material', $event.target.value)" />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">仓库位置</label>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input :value="searchForm.warehouse" placeholder="搜索仓库位置..." class="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm" @input="$emit('updateField', 'warehouse', $event.target.value)" />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">申请人</label>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input :value="searchForm.applicant" placeholder="搜索申请人..." class="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm" @input="$emit('updateField', 'applicant', $event.target.value)" />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">审批状态</label>
        <select :value="searchForm.status" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" @change="$emit('updateField', 'status', $event.target.value)">
          <option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
      <div class="flex items-end gap-2">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">退料部门</label>
          <select :value="searchForm.department" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" @change="$emit('updateField', 'department', $event.target.value)">
            <option value="all">全部部门</option>
            <option v-for="dept in departmentOptions" :key="dept" :value="dept">{{ dept }}</option>
          </select>
        </div>
        <button class="h-8 px-3 rounded-md text-xs bg-amber-500 text-white hover:bg-amber-600 inline-flex items-center gap-1 shrink-0" @click="$emit('reset')"><RotateCcw class="w-4 h-4" />重置</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search, RotateCcw } from 'lucide-vue-next'
import { STATUS_OPTIONS, departmentOptions } from '../utils/materialReturnConfig'

defineProps({
  searchForm: { type: Object, required: true }
})

defineEmits(['updateField', 'reset'])
</script>
