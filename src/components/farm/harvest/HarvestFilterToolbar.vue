<template>
  <!-- 采收筛选工具栏组件 - V1.1样式 -->
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
    <div class="flex flex-wrap gap-4 items-end">
      <!-- 采收单号 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-gray-700 text-sm mb-1">采收单号</label>
        <el-input
          v-model="localFilters.harvestCode"
          placeholder="请输入采收单号"
          clearable
          class="w-full"
        />
      </div>

      <!-- 批次信息 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-gray-700 text-sm mb-1">批次信息</label>
        <el-input
          v-model="localFilters.batchCode"
          placeholder="请输入批次号"
          clearable
          class="w-full"
        />
      </div>

      <!-- 采收区域 -->
      <div class="min-w-[150px]">
        <label class="block text-gray-700 text-sm mb-1">采收区域</label>
        <el-select
          v-model="localFilters.greenhouseId"
          placeholder="全部"
          clearable
          class="w-full"
        >
          <el-option
            v-for="g in greenhouses"
            :key="g.id"
            :label="g.name"
            :value="g.id"
          />
        </el-select>
      </div>

      <!-- 作物品种 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-gray-700 text-sm mb-1">作物品种</label>
        <el-input
          v-model="localFilters.cropName"
          placeholder="请输入作物品种"
          clearable
          class="w-full"
        />
      </div>

      <!-- 品质等级 -->
      <div class="min-w-[120px]">
        <label class="block text-gray-700 text-sm mb-1">品质等级</label>
        <el-select
          v-model="localFilters.grade"
          placeholder="全部"
          clearable
          class="w-full"
        >
          <el-option label="A级" value="A" />
          <el-option label="B级" value="B" />
          <el-option label="C级" value="C" />
        </el-select>
      </div>

      <!-- P1 采收人员筛选 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-gray-700 text-sm mb-1">采收人员</label>
        <el-input
          v-model="localFilters.harvesterName"
          placeholder="请输入采收人员"
          clearable
          class="w-full"
        />
      </div>

      <!-- 入库仓库 -->
      <div class="min-w-[150px]">
        <label class="block text-gray-700 text-sm mb-1">入库仓库</label>
        <el-select
          v-model="localFilters.warehouseId"
          placeholder="全部"
          clearable
          class="w-full"
        >
          <el-option
            v-for="w in warehouseOptions"
            :key="w.value"
            :label="w.label"
            :value="w.value"
          />
        </el-select>
      </div>

      <!-- 状态 -->
      <div class="min-w-[120px]">
        <label class="block text-gray-700 text-sm mb-1">状态</label>
        <el-select
          v-model="localFilters.status"
          placeholder="全部"
          clearable
          class="w-full"
        >
          <el-option label="待采收" value="pending" />
          <el-option label="采收中" value="harvesting" />
          <el-option label="已采收" value="harvested" />
          <el-option label="已分级" value="graded" />
          <el-option label="已入库" value="stored" />
        </el-select>
      </div>

      <!-- 按钮行 -->
      <div class="flex gap-2">
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({
      harvestCode: '',
      batchCode: '',
      greenhouseId: '',
      cropName: '',
      grade: '',
      harvesterName: '',
      warehouseId: '',
      status: ''
    })
  },
  greenhouses: {
    type: Array,
    default: () => []
  },
  warehouseOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:filters', 'search', 'reset'])

const localFilters = ref({
  harvestCode: '',
  batchCode: '',
  greenhouseId: '',
  cropName: '',
  grade: '',
  harvesterName: '',
  warehouseId: '',
  status: ''
})

watch(() => props.filters, (val) => {
  if (val) {
    localFilters.value = { ...val }
  }
}, { deep: true, immediate: true })

const handleSearch = () => {
  emit('update:filters', localFilters.value)
  emit('search')
}

const handleReset = () => {
  localFilters.value = {
    harvestCode: '',
    batchCode: '',
    greenhouseId: '',
    cropName: '',
    grade: '',
    harvesterName: '',
    warehouseId: '',
    status: ''
  }
  emit('reset')
}
</script>
