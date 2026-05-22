<template>
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
    <div class="flex flex-wrap gap-4 items-end">
      <!-- 作物品种 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">作物品种</label>
        <el-input
          v-model="localFilters.cropName"
          placeholder="请输入作物品种"
          clearable
          class="w-full"
        />
      </div>

      <!-- 种源批号 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">种源批号</label>
        <el-input
          v-model="localFilters.seedCode"
          placeholder="请输入种源批号"
          clearable
          class="w-full"
        />
      </div>

      <!-- 种源类型 -->
      <div class="min-w-[120px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">种源类型</label>
        <el-select v-model="localFilters.sourceType" placeholder="全部" clearable class="w-full">
          <el-option label="全部" value="__all__" />
          <el-option label="种子" value="seed" />
          <el-option label="种苗" value="seedling" />
        </el-select>
      </div>

      <!-- 供应商 -->
      <div class="min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
        <el-select v-model="localFilters.supplierName" placeholder="全部" clearable class="w-full">
          <el-option label="全部" value="__all__" />
          <el-option v-for="item in suppliers" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>

      <!-- 状态 -->
      <div class="min-w-[120px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
        <el-select v-model="localFilters.status" placeholder="全部" clearable class="w-full">
          <el-option label="全部" value="__all__" />
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>

      <!-- 入库方式（繁殖途径） -->
      <div class="min-w-[130px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">入库方式</label>
        <el-select v-model="localFilters.propagationType" placeholder="全部" clearable class="w-full">
          <el-option label="全部" value="__all__" />
          <el-option label="外购入库" value="external" />
          <el-option label="育种计划产出" value="breeding" />
          <el-option label="种植留种" value="seed_saving" />
          <el-option label="无性繁殖" value="asexual" />
        </el-select>
      </div>

      <!-- 繁殖阶段 -->
      <div class="min-w-[120px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">繁殖阶段</label>
        <el-select v-model="localFilters.propagationStatus" placeholder="全部" clearable class="w-full">
          <el-option label="全部" value="__all__" />
          <el-option label="已计划" value="planned" />
          <el-option label="进行中" value="in_progress" />
          <el-option label="已采收" value="harvested" />
          <el-option label="已质检" value="quality_checked" />
          <el-option label="已入库" value="completed" />
          <el-option label="失败" value="failed" />
        </el-select>
      </div>

      <!-- 采购/入库日期 -->
      <div class="min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">采购/入库日期</label>
        <el-date-picker
          v-model="localFilters.startDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          class="w-full"
        />
      </div>

      <!-- 创建人 -->
      <div class="min-w-[120px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">创建人</label>
        <el-input
          v-model="localFilters.createBy"
          placeholder="请输入创建人"
          clearable
          class="w-full"
        />
      </div>

      <!-- 按钮行 -->
      <div class="flex gap-2 items-end">
        <!-- 更多筛选按钮 -->
        <div class="relative">
          <el-button
            ref="triggerRef"
            :type="hasAdvancedFilter ? 'primary' : 'default'"
            @click="showAdvanced = !showAdvanced"
          >
            <el-icon><Filter /></el-icon>
            更多筛选
            <span v-if="hasAdvancedFilter" class="w-2 h-2 rounded-full bg-emerald-500 absolute -top-1 -right-1"></span>
          </el-button>

          <!-- 高级筛选 Popover -->
          <div
            v-if="showAdvanced"
            ref="popoverRef"
            class="absolute top-12 right-0 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-5 w-[480px]"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-semibold text-gray-900">高级筛选</h3>
              <el-button
                type="text"
                size="small"
                @click="clearAdvancedFilters"
                class="text-gray-400 hover:text-gray-600"
              >
                清空高级筛选
              </el-button>
            </div>

            <div class="space-y-4">
              <!-- 作物类型 -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">作物类型</label>
                  <el-select v-model="localFilters.cropType" placeholder="全部" clearable class="w-full">
                    <el-option label="全部" value="__all__" />
                    <el-option v-for="item in cropCategories" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">作物名称</label>
                  <el-input
                    v-model="localFilters.cropName"
                    placeholder="按作物名称筛选"
                    clearable
                    class="w-full"
                  />
                </div>
              </div>

              <!-- 剩余数量范围 -->
              <div>
                <label class="block text-xs text-gray-600 mb-1">剩余数量范围</label>
                <div class="flex items-center gap-2">
                  <el-input
                    v-model.number="localFilters.surplusMin"
                    type="number"
                    placeholder="最小值"
                    :min="0"
                    class="w-full"
                  />
                  <span class="text-gray-400 text-xs">—</span>
                  <el-input
                    v-model.number="localFilters.surplusMax"
                    type="number"
                    placeholder="最大值"
                    :min="0"
                    class="w-full"
                  />
                </div>
              </div>
            </div>

            <!-- 底部按钮 -->
            <div class="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
              <el-button size="small" @click="showAdvanced = false">
                关闭
              </el-button>
            </div>
          </div>
        </div>

        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Search, Refresh, Filter } from '@element-plus/icons-vue'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  },
  cropCategories: {
    type: Array,
    default: () => []
  },
  suppliers: {
    type: Array,
    default: () => []
  },
  statusOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:filters', 'search', 'reset'])

// 本地筛选状态
const localFilters = ref({
  cropCategory: '',
  cropName: '',
  seedCode: '',
  sourceType: '',
  supplierName: '',
  startDate: '',
  endDate: '',
  status: '',
  createBy: '',
  cropType: '',
  orgId: '',
  recorderId: '',
  surplusMin: undefined,
  surplusMax: undefined,
  propagationType: undefined,
  propagationStatus: undefined
})

// 高级筛选弹窗状态
const showAdvanced = ref(false)
const popoverRef = ref(null)
const triggerRef = ref(null)

// 是否有高级筛选激活
const hasAdvancedFilter = computed(() => {
  return localFilters.value.cropType ||
    localFilters.value.orgId ||
    localFilters.value.recorderId ||
    localFilters.value.surplusMin !== undefined ||
    localFilters.value.surplusMax !== undefined
})

// 监听 props.filters 变化
watch(() => props.filters, (newVal) => {
  if (newVal) {
    localFilters.value = { ...localFilters.value, ...newVal }
  }
}, { deep: true, immediate: true })

// 点击外部关闭弹窗
const handleClickOutside = (e) => {
  if (
    popoverRef.value &&
    !popoverRef.value.contains(e.target) &&
    triggerRef.value &&
    !triggerRef.value.$el?.contains(e.target)
  ) {
    showAdvanced.value = false
  }
}

// 监听文档点击
watch(showAdvanced, (val) => {
  if (val) {
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 0)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})

// 清空高级筛选
const clearAdvancedFilters = () => {
  localFilters.value.cropType = ''
  localFilters.value.orgId = ''
  localFilters.value.recorderId = ''
  localFilters.value.surplusMin = undefined
  localFilters.value.surplusMax = undefined
}

const handleSearch = () => {
  emit('update:filters', { ...localFilters.value })
  emit('search')
  showAdvanced.value = false
}

const handleReset = () => {
  localFilters.value = {
    cropCategory: '',
    cropName: '',
    seedCode: '',
    sourceType: '',
    supplierName: '',
    startDate: '',
    endDate: '',
    status: '',
    createBy: '',
    cropType: '',
    orgId: '',
    recorderId: '',
    surplusMin: undefined,
    surplusMax: undefined,
    propagationType: undefined,
    propagationStatus: undefined
  }
  emit('reset')
}
</script>
