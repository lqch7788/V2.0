<template>
  <!-- 施肥详情查看弹窗组件（纯div自定义弹窗） -->
  <Teleport to="body">
    <div v-if="isOpen && record" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="handleClose">
      <div
        class="bg-white rounded-xl w-full max-w-2xl shadow-xl"
        :style="{ maxHeight: '85vh' }"
        @click.stop
      >
        <!-- 头部 — 绿色渐变 -->
        <div
          class="px-6 py-4 flex items-center justify-between rounded-t-xl"
          style="background: linear-gradient(to right, #10b981, #059669, #10b981);"
        >
          <h3 class="font-semibold flex items-center gap-2">
            <el-icon class="text-xl" style="color: white;"><View /></el-icon>
            <span style="color: white;">施肥详情</span>
            <span
              v-if="isIot"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 ml-2"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              IoT自动
            </span>
          </h3>
          <el-button link class="hover:bg-white/10" style="color: rgba(255,255,255,0.8);" @click="handleClose">
            <el-icon style="color: white; font-size: 20px;"><Close /></el-icon>
          </el-button>
        </div>

        <!-- 内容 -->
        <div class="p-6 overflow-y-auto" style="max-height: calc(85vh - 140px);">
          <div class="space-y-4">
            <!-- 编号头部 -->
            <div class="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-4 mb-4 border border-blue-100">
              <div class="text-xs text-gray-500 mb-1">施肥编号</div>
              <div class="text-xl font-mono font-bold text-blue-700">{{ record.fertilizerCode || '-' }}</div>
              <div class="text-sm text-gray-500 mt-1">
                {{ record.fertilizerName }} | {{ record.greenhouseName || '未知位置' }}
              </div>
            </div>

            <!-- 详情网格 -->
            <div class="grid grid-cols-2 gap-4">
              <!-- 肥料名称 -->
              <div>
                <div class="text-xs text-gray-500 mb-1">肥料名称</div>
                <div class="text-sm font-bold text-gray-900">{{ record.fertilizerName || '-' }}</div>
              </div>

              <!-- 肥料类型 -->
              <div>
                <div class="text-xs text-gray-500 mb-1">肥料类型</div>
                <span :class="getTypeBadgeClass(record.fertilizerType)">
                  {{ getFertilizerTypeName(record.fertilizerType) }}
                </span>
              </div>

              <!-- 作物品种 -->
              <div>
                <div class="text-xs text-gray-500 mb-1">作物品种</div>
                <div class="text-sm text-gray-900">{{ record.cropName || '-' }}</div>
              </div>

              <!-- 温室位置 -->
              <div>
                <div class="text-xs text-gray-500 mb-1">温室位置</div>
                <div class="text-sm text-gray-900">{{ record.greenhouseName || '-' }}</div>
              </div>

              <!-- 稀释比例 -->
              <div>
                <div class="text-xs text-gray-500 mb-1">稀释比例</div>
                <div class="text-sm text-gray-900">{{ record.dilutionRatio || '-' }}</div>
              </div>

              <!-- 施肥量 -->
              <div>
                <div class="text-xs text-gray-500 mb-1">施肥量</div>
                <div class="text-sm font-bold text-emerald-600">
                  {{ formatNumber(record.quantity) }} {{ record.unit || 'kg' }}
                </div>
              </div>

              <!-- 单价 -->
              <div>
                <div class="text-xs text-gray-500 mb-1">单价</div>
                <div class="text-sm text-gray-900">{{ formatNumber(record.unitPrice) }} 元/kg</div>
              </div>

              <!-- 总成本 -->
              <div>
                <div class="text-xs text-gray-500 mb-1">总成本</div>
                <div class="text-sm font-bold text-amber-600">{{ formatNumber(record.totalCost) }} 元</div>
              </div>

              <!-- 施肥时间 -->
              <div>
                <div class="text-xs text-gray-500 mb-1">施肥时间</div>
                <div class="text-sm text-gray-900">{{ record.fertilizeTime || '-' }}</div>
              </div>

              <!-- 数据来源 -->
              <div>
                <div class="text-xs text-gray-500 mb-1">数据来源</div>
                <span :class="getSourceBadgeClass(record.dataSource)">
                  <span class="w-1.5 h-1.5 rounded-full bg-current mr-1"></span>
                  {{ record.dataSource === 'auto_iot' ? 'IoT自动' : '手动' }}
                </span>
              </div>

              <!-- 操作员 -->
              <div>
                <div class="text-xs text-gray-500 mb-1">操作员</div>
                <div class="text-sm text-gray-900">{{ record.operatorName || '-' }}</div>
              </div>

              <!-- 关联生产计划 -->
              <div>
                <div class="text-xs text-gray-500 mb-1">关联生产计划</div>
                <div class="text-sm text-gray-900">{{ record.productionPlanCode || '-' }}</div>
              </div>

              <!-- 关联种植记录 -->
              <div>
                <div class="text-xs text-gray-500 mb-1">关联种植记录</div>
                <div class="text-sm text-gray-900">{{ record.plantingCode || '-' }}</div>
              </div>

              <!-- 关联农事任务 -->
              <div>
                <div class="text-xs text-gray-500 mb-1">关联农事任务</div>
                <div class="text-sm text-gray-900">{{ record.farmTaskId || '-' }}</div>
              </div>

              <!-- 创建时间 -->
              <div>
                <div class="text-xs text-gray-500 mb-1">创建时间</div>
                <div class="text-sm text-gray-900">{{ record.createTime || '-' }}</div>
              </div>

              <!-- 更新时间 -->
              <div>
                <div class="text-xs text-gray-500 mb-1">更新时间</div>
                <div class="text-sm text-gray-900">{{ record.updateTime || '-' }}</div>
              </div>
            </div>

            <!-- 备注（全宽） -->
            <div class="col-span-2">
              <div class="text-xs text-gray-500 mb-1">备注</div>
              <div class="text-sm text-gray-900 bg-gray-50 rounded-lg p-3 min-h-[40px]">
                {{ record.description || '-' }}
              </div>
            </div>
          </div>
        </div>

        <!-- 底部关闭按钮 -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end rounded-b-xl">
          <el-button size="small" @click="handleClose">关闭</el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { View, Close } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: Boolean,
  record: Object
})

const emit = defineEmits(['close'])

// 是否为IoT记录
const isIot = computed(() => props.record?.dataSource === 'auto_iot')

// 获取肥料类型显示名称
const getFertilizerTypeName = (type) => {
  const typeMap = {
    organic: '有机肥',
    inorganic: '无机肥',
    biological: '生物肥',
    compound: '复合肥',
    trace: '微量元素肥'
  }
  return typeMap[type] || type || '-'
}

// 肥料类型Badge样式
const getTypeBadgeClass = (type) => {
  const colorMap = {
    organic: 'bg-emerald-100 text-emerald-700',
    inorganic: 'bg-blue-100 text-blue-700',
    biological: 'bg-purple-100 text-purple-700',
    compound: 'bg-amber-100 text-amber-700',
    trace: 'bg-cyan-100 text-cyan-700'
  }
  return `inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[type] || 'bg-gray-100 text-gray-700'}`
}

// 数据来源Badge样式
const getSourceBadgeClass = (source) => {
  if (source === 'auto_iot') {
    return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700'
  }
  return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700'
}

// 格式化数字
const formatNumber = (num) => {
  if (num == null) return '0'
  return num.toLocaleString()
}

// 关闭
const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
/* V1.1样式保持 */
</style>
