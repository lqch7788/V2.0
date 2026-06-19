<!--
  入库筛选栏 - 从 WarehouseInbound.vue 提取
  原文件 L36-101 (~66 行模板)
  V2.0-PM-004 拆分第 4/6 阶段
-->
<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <div class="flex flex-wrap items-end gap-4">
      <div class="flex-1 grid grid-cols-5 gap-4 min-w-0">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">入库单号</label>
          <input
            :value="search.code"
            placeholder="搜索单号"
            class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            @input="$emit('update:search', { ...search, code: $event.target.value })"
            @keyup.enter="$emit('search')"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
          <input
            :value="search.supplier"
            placeholder="搜索供应商"
            class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            @input="$emit('update:search', { ...search, supplier: $event.target.value })"
            @keyup.enter="$emit('search')"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <select
            :value="search.status"
            class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500"
            @change="$emit('update:search', { ...search, status: $event.target.value })"
            @change.capture="$emit('search')"
          >
            <option value="">全部</option>
            <option value="pending">待审核</option>
            <option value="completed">已完成</option>
            <option value="voided">已作废</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">物料名称</label>
          <input
            :value="search.materialName"
            placeholder="搜索物料名称"
            class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            @input="$emit('update:search', { ...search, materialName: $event.target.value })"
            @keyup.enter="$emit('search')"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">物料编码</label>
          <input
            :value="search.materialCode"
            placeholder="搜索物料编码"
            class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            @input="$emit('update:search', { ...search, materialCode: $event.target.value })"
            @keyup.enter="$emit('search')"
          />
        </div>
      </div>
      <div class="flex gap-2">
        <button class="h-8 px-3 rounded text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 inline-flex items-center gap-1" @click="$emit('reset')">
          <RotateCcw class="w-4 h-4" />重置
        </button>
        <button class="h-8 px-3 rounded text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="$emit('search')">
          <Search class="w-4 h-4" />搜索
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RotateCcw, Search } from 'lucide-vue-next'

defineProps({
  search: {
    type: Object,
    required: true
    // shape: { code, supplier, status, materialName, materialCode }
  }
})

defineEmits(['update:search', 'search', 'reset'])
</script>
