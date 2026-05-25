<template>
  <el-dialog
    v-model="visible"
    title="产品详情"
    width="900px"
    @close="handleClose"
  >
    <div class="space-y-6">
      <!-- 基本信息 -->
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span class="w-1 h-4 bg-emerald-500 rounded-full"></span>
          基本信息
        </h3>
        <div class="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
          <div>
            <div class="text-xs text-gray-500 mb-1">产品编码</div>
            <div class="text-sm font-medium text-gray-900">{{ localInventory.productCode || '-' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">产品名称</div>
            <div class="text-sm font-medium text-gray-900">{{ localInventory.cropName || '-' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">品种</div>
            <div class="text-sm font-medium text-gray-900">{{ localInventory.variety || '-' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">品质等级</div>
            <div class="text-sm">
              <span :class="gradeBadgeClass">{{ gradeLabel }}</span>
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">品质评定</div>
            <div class="text-sm font-medium text-gray-900">{{ qualityLabel }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">批次号</div>
            <div class="text-sm font-medium text-gray-900">{{ localInventory.batchCode || '-' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">种植区域</div>
            <div class="text-sm font-medium text-gray-900">{{ localInventory.greenhouseName || '-' }}</div>
          </div>
        </div>
      </div>

      <!-- 库存信息 -->
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span class="w-1 h-4 bg-blue-500 rounded-full"></span>
          库存信息
        </h3>
        <div class="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
          <div>
            <div class="text-xs text-gray-500 mb-1">当前库存</div>
            <div class="text-sm font-medium text-gray-900">
              {{ localInventory.quantity }} {{ localInventory.unit }}
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">最低库存限值</div>
            <div class="text-sm font-medium text-gray-900">
              {{ alertSettings.minStock }} {{ localInventory.unit }}
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">最高库存限值</div>
            <div class="text-sm font-medium text-gray-900">
              {{ alertSettings.maxStock }} {{ localInventory.unit }}
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">保质期天数</div>
            <div class="text-sm font-medium text-gray-900">
              {{ alertSettings.expirationDays }} 天
            </div>
          </div>
        </div>
      </div>

      <!-- 仓库信息 -->
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span class="w-1 h-4 bg-amber-500 rounded-full"></span>
          仓库信息
        </h3>
        <div class="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
          <div>
            <div class="text-xs text-gray-500 mb-1">仓库名称</div>
            <div class="text-sm font-medium text-gray-900">{{ localInventory.warehouseName || '-' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">存放位置</div>
            <div class="text-sm font-medium text-gray-900">{{ localInventory.storageLocation || '-' }}</div>
          </div>
        </div>
      </div>

      <!-- 时间信息 -->
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span class="w-1 h-4 bg-purple-500 rounded-full"></span>
          时间信息
        </h3>
        <div class="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
          <div>
            <div class="text-xs text-gray-500 mb-1">采收日期</div>
            <div class="text-sm font-medium text-gray-900">{{ localInventory.harvestDate || '-' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">入库日期</div>
            <div class="text-sm font-medium text-gray-900">{{ localInventory.storageDate || '-' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">过期日期</div>
            <div class="text-sm font-medium text-gray-900">{{ localInventory.expirationDate || '-' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">存储天数</div>
            <div class="text-sm font-medium text-gray-900">{{ storageDays }} 天</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">剩余保质期</div>
            <div class="text-sm font-medium text-gray-900">
              {{ remainingDays > 0 ? `${remainingDays} 天` : '已过期' }}
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">预警状态</div>
            <div class="text-sm">
              <span :class="alertStatusClass">{{ alertStatusText }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  inventory: { type: Object, default: null }
})

const emit = defineEmits(['close'])

const visible = computed({
  get: () => props.show,
  set: () => handleClose()
})

const localInventory = ref(props.inventory || {})

// 监听 props 变化
watch(() => props.inventory, (val) => {
  localInventory.value = val || {}
}, { deep: true })

// 预警设置
const alertSettings = computed(() => {
  return localInventory.value.alertSettings || {
    minStock: 0,
    maxStock: 0,
    expirationDays: 0
  }
})

// 计算存储天数
const storageDays = computed(() => {
  if (!localInventory.value.storageDate) return 0
  const now = new Date()
  const storageDate = new Date(localInventory.value.storageDate)
  return Math.floor((now.getTime() - storageDate.getTime()) / (1000 * 60 * 60 * 24))
})

// 计算剩余保质期天数
const remainingDays = computed(() => {
  if (!localInventory.value.expirationDate) return 0
  const now = new Date()
  const expDate = new Date(localInventory.value.expirationDate)
  return Math.floor((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
})

// 品质等级标签
const gradeBadgeClass = computed(() => {
  const grade = localInventory.value.grade
  const config = {
    'A': 'bg-emerald-100 text-emerald-700',
    'B': 'bg-blue-100 text-blue-700',
    'C': 'bg-amber-100 text-amber-700'
  }
  return `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config[grade] || config['A']}`
})

const gradeLabel = computed(() => {
  const grade = localInventory.value.grade
  return grade ? `${grade}级` : '-'
})

// 品质评定标签
const qualityLabel = computed(() => {
  const qualityMap = {
    'excellent': '优秀',
    'good': '良好',
    'average': '一般',
    'poor': '较差'
  }
  return qualityMap[localInventory.value.quality] || '-'
})

// 预警状态
const alertStatusClass = computed(() => {
  if (remainingDays.value <= 0) {
    return 'px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700'
  } else if (remainingDays.value <= 7) {
    return 'px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700'
  } else if (localInventory.value.quantity < alertSettings.value.minStock) {
    return 'px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700'
  } else {
    return 'px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700'
  }
})

const alertStatusText = computed(() => {
  if (remainingDays.value <= 0) {
    return '已过期'
  } else if (remainingDays.value <= 7) {
    return '即将过期'
  } else if (localInventory.value.quantity < alertSettings.value.minStock) {
    return '库存不足'
  } else {
    return '正常'
  }
})

const handleClose = () => emit('close')
</script>
