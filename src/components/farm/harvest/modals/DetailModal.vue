<template>
  <!-- 采收详情弹窗组件 - V1.1样式（纯div自定义弹窗） -->
  <Teleport to="body">
    <div v-if="isOpen && record" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="handleClose">
      <div
        id="harvest-detail-dialog"
        class="bg-white rounded-xl w-full shadow-xl flex flex-col"
        :style="{ maxWidth: '64rem', maxHeight: '85vh', minWidth: '40rem' }"
        @click.stop
      >
        <!-- 头部 — 绿色渐变 -->
        <div
          class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-between rounded-t-xl cursor-move flex-shrink-0"
          style="background: linear-gradient(to right, #10b981, #059669);"
          @mousedown="handleDragStart"
        >
          <h3 class="font-semibold flex items-center gap-2 select-none" style="color: white;">
            <el-icon style="color: white;"><View /></el-icon>
            <span style="color: white;">采收入库详情</span>
          </h3>
          <div class="flex items-center gap-1">
            <el-button link class="hover:bg-white/10" style="color: rgba(255,255,255,0.8);" @click="handleClose">
              <el-icon style="color: white;"><Close /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- P0 标签页切换：基本信息 | 追溯链路 -->
        <div class="flex border-b border-gray-200 px-6 pt-4">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px"
            :class="activeTab === 'info'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'"
            @click="activeTab = 'info'"
          >
            基本信息
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-1"
            :class="activeTab === 'trace'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'"
            @click="activeTab = 'trace'"
          >
            <el-icon><Clock /></el-icon>
            追溯链路
          </button>
        </div>

        <!-- 内容区域 -->
        <div class="p-6 overflow-y-auto flex-1">
          <!-- 基本信息标签页 -->
          <div v-if="activeTab === 'info'" class="space-y-4">
            <!-- 基本信息卡片 -->
            <div class="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span class="text-xs text-emerald-600 block font-medium">采收单号</span>
                  <span class="text-lg font-mono font-bold text-emerald-700">{{ record.harvestCode }}</span>
                </div>
                <div>
                  <span class="text-xs text-emerald-600 block font-medium">采收时间</span>
                  <span class="text-sm font-medium text-gray-900">{{ formatDate(record.harvestDate) }}</span>
                </div>
                <div>
                  <span class="text-xs text-emerald-600 block font-medium">品质等级</span>
                  <span :class="getGradeBadgeClass(record.grade)" class="mt-1 inline-block">
                    {{ record.grade || 'A' }}级
                  </span>
                </div>
                <div>
                  <span class="text-xs text-emerald-600 block font-medium">状态</span>
                  <span :class="getStatusBadgeClass(record.status)" class="mt-1 inline-block">
                    {{ getStatusLabel(record.status) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 详细信息 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- 左列 -->
              <div class="space-y-4">
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-sm font-semibold text-gray-700 mb-3">批次与作物信息</h4>
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span class="text-xs text-gray-500">作物品种</span>
                      <span class="text-sm text-gray-900">{{ record.cropName }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-xs text-gray-500">品种</span>
                      <span class="text-sm text-gray-900">{{ record.variety || '-' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-xs text-gray-500">生产计划批次号</span>
                      <span class="text-sm text-gray-900 font-mono">{{ record.batchCode || '-' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-xs text-gray-500">种植模式</span>
                      <span class="text-sm text-gray-900">{{ record.plantingMode || '-' }}</span>
                    </div>
                  </div>
                </div>

                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-sm font-semibold text-gray-700 mb-3">采收信息</h4>
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span class="text-xs text-gray-500">采收区域</span>
                      <span class="text-sm text-gray-900">{{ record.greenhouseName || '-' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-xs text-gray-500">采收量</span>
                      <span class="text-sm text-gray-900 font-medium">{{ record.harvestQuantity }} {{ record.unit || 'kg' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-xs text-gray-500">目标产量</span>
                      <span class="text-sm text-gray-900">{{ record.targetYield || 0 }} {{ record.unit || 'kg' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-xs text-gray-500">完成率</span>
                      <span class="text-sm text-gray-900 font-medium">{{ completionRate }}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 右列 -->
              <div class="space-y-4">
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-sm font-semibold text-gray-700 mb-3">入库信息</h4>
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span class="text-xs text-gray-500">入库仓库</span>
                      <span class="text-sm text-gray-900">{{ record.warehouseName || '-' }}</span>
                    </div>
                    <div v-if="record.inboundType" class="flex justify-between">
                      <span class="text-xs text-gray-500">入库类型</span>
                      <span class="text-sm text-gray-900">{{ getInboundTypeLabel(record.inboundType) }}</span>
                    </div>
                  </div>
                </div>

                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-sm font-semibold text-gray-700 mb-3">财务信息</h4>
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span class="text-xs text-gray-500">单价</span>
                      <span class="text-sm text-gray-900">{{ record.unitPrice ? `${record.unitPrice.toFixed(2)} 元/kg` : '-' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-xs text-gray-500">收入</span>
                      <span class="text-sm text-emerald-600 font-medium">{{ record.totalAmount ? `${record.totalAmount.toFixed(2)} 元` : '-' }}</span>
                    </div>
                  </div>
                </div>

                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-sm font-semibold text-gray-700 mb-3">人员信息</h4>
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span class="text-xs text-gray-500">采收人员</span>
                      <span class="text-sm text-gray-900">{{ (record.harvesterNames || []).join(', ') || '-' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-xs text-gray-500">审核人员</span>
                      <span class="text-sm text-gray-900">{{ record.auditor || '-' }}</span>
                    </div>
                  </div>
                </div>

                <div v-if="record.remarks" class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-sm font-semibold text-gray-700 mb-3">备注</h4>
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span class="text-sm text-gray-900">{{ record.remarks }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 追溯链路标签页 -->
          <div v-else class="py-2">
            <TraceChain v-if="record.instanceId" type="harvest" :business-id="record.instanceId" />
            <div v-else class="text-center py-12 text-gray-500">
              <el-icon :size="48" class="mx-auto mb-3 text-gray-300"><Clock /></el-icon>
              <p>暂无库存实例</p>
              <p class="text-xs mt-1">该采收记录尚未接入库存服务</p>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0 rounded-b-xl">
          <el-button size="small" @click="handleClose">关闭</el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { View, Close, Clock } from '@element-plus/icons-vue'
import TraceChain from '../../trace/TraceChain.vue'

const props = defineProps({
  isOpen: Boolean,
  record: Object
})

const emit = defineEmits(['close'])

// P0 标签页状态：info | trace
const activeTab = ref('info')

// 拖动状态
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0, left: 0, top: 0 })

// 完成率
const completionRate = computed(() => {
  if (!props.record) return 0
  const harvestQty = props.record.harvestQuantity || 0
  const targetYield = props.record.targetYield || 0
  return targetYield > 0 ? Math.round((harvestQty / targetYield) * 100) : 0
})

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return dateStr.replace('T', ' ').slice(0, 16)
}

// 入库类型标签
const getInboundTypeLabel = (type) => {
  const map = {
    'seed_source': '种源入库',
    'seedling': '育苗成活入库',
    'planting_harvest': '种植采收入库'
  }
  return map[type] || type
}

// 状态标签
const getStatusLabel = (status) => {
  const map = {
    'pending': '待采收',
    'harvesting': '采收中',
    'harvested': '已采收',
    'graded': '已分级',
    'stored': '已入库'
  }
  return map[status] || status
}

const getStatusBadgeClass = (status) => {
  const map = {
    'pending': 'px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full',
    'harvesting': 'px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full',
    'harvested': 'px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full',
    'graded': 'px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full',
    'stored': 'px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full'
  }
  return map[status] || 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
}

// 品质等级标签
const getGradeBadgeClass = (grade) => {
  const map = {
    'A': 'px-2 py-0.5 bg-green-500 text-white text-xs rounded font-semibold',
    'B': 'px-2 py-0.5 bg-yellow-500 text-white text-xs rounded font-semibold',
    'C': 'px-2 py-0.5 bg-red-500 text-white text-xs rounded font-semibold'
  }
  return map[grade] || 'px-2 py-0.5 bg-gray-500 text-white text-xs rounded font-semibold'
}

// 关闭
const handleClose = () => {
  emit('close')
}

// 拖动开始
const handleDragStart = (e) => {
  if (e.target.closest('button')) return
  e.preventDefault()
  isDragging.value = true
  const dialog = document.getElementById('harvest-detail-dialog')
  if (dialog) {
    const rect = dialog.getBoundingClientRect()
    dragStart.value = { x: e.clientX, y: e.clientY, left: rect.left, top: rect.top }
  }
}

// 拖动中
watch(isDragging, (val) => {
  if (!val) return
  const handleMouseMove = (e) => {
    if (!isDragging.value) return
    const deltaX = e.clientX - dragStart.value.x
    const deltaY = e.clientY - dragStart.value.y
    const dialog = document.getElementById('harvest-detail-dialog')
    if (dialog) {
      dialog.style.position = 'fixed'
      dialog.style.left = `${dragStart.value.left + deltaX}px`
      dialog.style.top = `${dragStart.value.top + deltaY}px`
      dialog.style.margin = '0'
    }
  }
  const handleMouseUp = () => {
    isDragging.value = false
  }
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})
</script>
