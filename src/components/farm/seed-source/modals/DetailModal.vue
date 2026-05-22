<template>
  <!-- 纯div自定义弹窗 -->
  <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center">
    <!-- 遮罩层 -->
    <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>

    <!-- 弹窗内容 -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
      <!-- 头部 -->
      <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold" style="color: white;">种源详情</h3>
        <el-button link @click="handleClose" style="color: white;">
          <el-icon :size="20"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 标签页切换 -->
      <div class="flex border-b border-gray-200 px-6">
        <button
          @click="activeTab = 'info'"
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'info'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          ]"
        >
          基本信息
        </button>
        <button
          @click="activeTab = 'trace'"
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1',
            activeTab === 'trace'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          ]"
        >
          <el-icon><Clock /></el-icon>
          追溯链路
        </button>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- 基本信息标签页 -->
        <div v-if="activeTab === 'info'" class="space-y-6">
          <!-- 基本信息 -->
          <div>
            <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">基本信息</h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">种源批号：</span>
                <span class="text-sm font-mono text-blue-600">{{ record.seedCode }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">作物品种：</span>
                <span class="text-sm text-gray-900">{{ record.cropName }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">作物类别：</span>
                <span class="text-sm text-gray-900">{{ record.cropCategory }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">品种：</span>
                <span class="text-sm text-gray-900">{{ record.cropVariety || '-' }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">种源类型：</span>
                <span class="text-sm text-gray-900">{{ getSourceTypeLabel(record.sourceType) }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">供应商：</span>
                <span class="text-sm text-gray-900">{{ record.supplierName }}</span>
              </div>
            </div>
          </div>

          <!-- 库存信息 -->
          <div>
            <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">库存信息</h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">采购日期：</span>
                <span class="text-sm text-gray-900">{{ record.purchaseDate }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">采购数量：</span>
                <span class="text-sm text-gray-900">{{ record.quantity }} {{ record.unit }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">单价：</span>
                <span class="text-sm text-gray-900">¥{{ record.unitPrice }}/{{ record.unit }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">总金额：</span>
                <span class="text-sm text-gray-900">¥{{ (record.totalAmount || 0).toLocaleString() }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">初始数量：</span>
                <span class="text-sm text-gray-900">{{ record.initialCount.toLocaleString() }} {{ record.unit }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">可用数量：</span>
                <span class="text-sm font-medium text-emerald-600">{{ record.availableCount.toLocaleString() }} {{ record.unit }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">库存状态：</span>
                <el-tag :type="getStatusType(record.status)" size="small">
                  {{ getStatusLabel(record.status) }}
                </el-tag>
              </div>
            </div>
          </div>

          <!-- 繁殖信息（非外购时显示） -->
          <div v-if="record.propagationType && record.propagationType !== 'external'">
            <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">繁殖信息</h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">入库方式：</span>
                <span class="text-sm font-medium text-orange-700">
                  {{ getPropagationTypeLabel(record.propagationType) }}
                </span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">当前阶段：</span>
                <span class="text-sm font-medium text-blue-700">
                  {{ getPropagationStatusLabel(record.propagationStatus) }}
                </span>
              </div>
              <div v-if="record.propagationMethod" class="flex items-center">
                <span class="text-sm text-gray-500 w-24">具体方法：</span>
                <span class="text-sm text-gray-900">{{ record.propagationMethod }}</span>
              </div>
              <div v-if="record.expectedHarvestDate" class="flex items-center">
                <span class="text-sm text-gray-500 w-24">预计采收：</span>
                <span class="text-sm text-gray-900">{{ record.expectedHarvestDate }}</span>
              </div>
            </div>
          </div>

          <!-- 其他信息 -->
          <div>
            <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">其他信息</h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">创建人：</span>
                <span class="text-sm text-gray-900">{{ record.createBy }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">创建时间：</span>
                <span class="text-sm text-gray-900">{{ record.createTime }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">更新时间：</span>
                <span class="text-sm text-gray-900">{{ record.updateTime }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">打印次数：</span>
                <span class="text-sm text-gray-900">{{ record.printCount || 0 }} 次</span>
              </div>
              <div v-if="record.remarks" class="col-span-2 flex items-start">
                <span class="text-sm text-gray-500 w-24 flex-shrink-0">备注：</span>
                <span class="text-sm text-gray-900">{{ record.remarks }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 追溯链路标签页 -->
        <div v-if="activeTab === 'trace'" class="py-2">
          <div class="text-center py-12 text-gray-500">
            <el-icon :size="48" class="text-gray-300 mb-3"><Clock /></el-icon>
            <p>暂无库存实例</p>
            <p class="text-xs mt-1">该种源尚未接入库存服务</p>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Close, Clock } from '@element-plus/icons-vue'

const props = defineProps({
  visible: Boolean,
  record: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible'])

const activeTab = ref('info')

// 映射表
const SOURCE_TYPE_MAP = {
  'seed': '种子',
  'seedling': '种苗/实生苗',
  'cutting': '扦插苗',
  'grafting': '嫁接苗',
  'tissue_culture': '组培苗',
  'split': '分株苗',
  'bulb': '种球/球根',
  'other': '其他'
}

const STOCK_STATUS_MAP = {
  'sufficient': { label: '充足', type: 'success' },
  'low': { label: '不足', type: 'warning' },
  'depleted': { label: '耗尽', type: 'danger' }
}

const PROPAGATION_TYPE_LABELS = {
  'external': '外购入库',
  'breeding': '育种计划产出',
  'seed_saving': '种植留种',
  'asexual': '无性繁殖'
}

const PROPAGATION_STATUS_LABELS = {
  'planned': '已计划',
  'in_progress': '进行中',
  'harvested': '已采收',
  'quality_checked': '已质检',
  'completed': '已入库',
  'failed': '失败'
}

const getSourceTypeLabel = (type) => SOURCE_TYPE_MAP[type] || type || '-'
const getStatusLabel = (status) => STOCK_STATUS_MAP[status]?.label || status || '-'
const getStatusType = (status) => STOCK_STATUS_MAP[status]?.type || 'info'
const getPropagationTypeLabel = (type) => PROPAGATION_TYPE_LABELS[type] || type || '-'
const getPropagationStatusLabel = (status) => PROPAGATION_STATUS_LABELS[status] || status || '-'

const handleClose = () => {
  emit('update:visible', false)
}
</script>
