<!--
  库存筛选组件
  对标 V1.1 src/components/farm/inventory/InventoryFilter.tsx
-->
<template>
  <div class="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2 flex-wrap">
    <el-input v-model="keyword" placeholder="搜索物料" clearable class="!w-48">
      <template #prefix><el-icon><Search /></el-icon></template>
    </el-input>
    <el-select v-model="category" placeholder="类型" clearable class="!w-32">
      <el-option label="种子" value="seed" />
      <el-option label="肥料" value="fertilizer" />
      <el-option label="农药" value="pesticide" />
      <el-option label="工具" value="tool" />
    </el-select>
    <el-select v-model="warehouse" placeholder="仓库" clearable class="!w-32">
      <el-option label="A仓" value="A" />
      <el-option label="B仓" value="B" />
      <el-option label="C仓" value="C" />
    </el-select>
    <el-select v-model="stockStatus" placeholder="库存状态" clearable class="!w-32">
      <el-option label="充足" value="normal" />
      <el-option label="低库存" value="low" />
      <el-option label="缺货" value="out" />
    </el-select>
    <el-button type="primary" @click="emitChange">
      <el-icon><Search /></el-icon>查询
    </el-button>
    <el-button @click="handleReset">
      <el-icon><RefreshLeft /></el-icon>重置
    </el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RefreshLeft, Search } from '@element-plus/icons-vue'

const emit = defineEmits(['change'])

const keyword = ref('')
const category = ref('')
const warehouse = ref('')
const stockStatus = ref('')

const handleReset = () => {
  keyword.value = ''
  category.value = ''
  warehouse.value = ''
  stockStatus.value = ''
  emitChange()
}

const emitChange = () => {
  emit('change', { keyword: keyword.value, category: category.value, warehouse: warehouse.value, stockStatus: stockStatus.value })
}
</script>