<template>
  <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div class="flex items-end gap-4 flex-wrap">
      <!-- 订单编号 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm text-gray-700 mb-1">订单编号</label>
        <el-input
          v-model="localFilters.orderCode"
          placeholder="请输入订单编号"
          clearable
        />
      </div>

      <!-- 订单名称 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm text-gray-700 mb-1">订单名称</label>
        <el-input
          v-model="localFilters.orderName"
          placeholder="请输入订单名称"
          clearable
        />
      </div>

      <!-- 作物品种 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm text-gray-700 mb-1">作物品种</label>
        <el-select v-model="localFilters.cropName" placeholder="请选择" clearable class="w-full">
          <el-option
            v-for="item in cropNames"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>

      <!-- 订单状态 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm text-gray-700 mb-1">订单状态</label>
        <el-select v-model="localFilters.status" placeholder="请选择" clearable class="w-full">
          <el-option
            v-for="opt in orderStatusOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>

      <!-- 订单日期 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm text-gray-700 mb-1">订单日期</label>
        <el-date-picker
          v-model="localFilters.orderDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          class="w-full"
        />
      </div>

      <!-- 按钮 -->
      <div class="flex gap-2">
        <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200" @click="handleReset">
          <RotateCcw class="w-4 h-4" />
          重置
        </button>
        <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700" @click="handleSearch">
          <Search class="w-4 h-4" />
          搜索
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search, RotateCcw } from 'lucide-vue-next'

const props = defineProps({
  filters: { type: Object, required: true },
  orderStatusOptions: { type: Array, default: () => [] },
  cropNames: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:filters', 'search', 'reset'])

const localFilters = ref({ ...props.filters })

watch(() => props.filters, (val) => {
  localFilters.value = { ...val }
}, { deep: true })

watch(localFilters, (val) => {
  emit('update:filters', { ...val })
}, { deep: true })

function handleSearch() {
  emit('search')
}

function handleReset() {
  localFilters.value = {
    orderCode: '',
    orderName: '',
    cropName: '',
    status: '',
    orderDate: '',
  }
  emit('update:filters', { ...localFilters.value })
  emit('reset')
}
</script>
