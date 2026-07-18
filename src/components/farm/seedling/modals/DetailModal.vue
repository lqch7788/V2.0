<template>
  <!-- 对齐 V1.1 UnifiedModal + el-dialog 拖拽/最大化/调整大小 -->
  <el-dialog
    v-dialog-draggable
    v-dialog-resizable
    v-dialog-maximizable
    :model-value="visible"
    width="900px"
    top="5vh"
    :close-on-click-modal="true"
    @close="handleClose"
  >
    <template #header>
      <div class="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 -mx-4 -mt-4 px-6 py-3 flex items-center justify-between rounded-t-xl">
        <div class="flex items-center gap-3">
          <el-icon :size="20" style="color: white;"><View /></el-icon>
          <h3 class="text-lg font-semibold text-white">育苗详情</h3>
        </div>
        <el-button link @click="handleClose" style="color: white;">
          <el-icon :size="20"><Close /></el-icon>
        </el-button>
      </div>
    </template>

      <!-- 内容区域 -->
      <div class="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
        <!-- 标签页切换 -->
        <div class="flex border-b border-gray-200 mb-4">
          <button
            @click="activeTab = 'info'"
            :class="[
              'pb-2 px-4 text-sm font-medium border-b-2 -mb-px rounded-none transition-colors',
              activeTab === 'info'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ]"
          >
            基本信息
          </button>
          <button
            @click="activeTab = 'history'"
            :class="[
              'pb-2 px-4 text-sm font-medium border-b-2 -mb-px rounded-none flex items-center gap-1 transition-colors',
              activeTab === 'history'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ]"
          >
            <el-icon :size="16"><Clock /></el-icon>
            操作历史
          </button>
        </div>

        <div class="space-y-6" v-if="record">
          <!-- 基本信息标签页 -->
          <div v-show="activeTab === 'info'" class="space-y-6">
            <!-- 基本信息 -->
            <div>
              <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">基本信息</h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">育苗批号：</span>
                  <span class="text-sm font-mono text-blue-600">{{ record.seedlingCode }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">作物品种：</span>
                  <span class="text-sm text-gray-900">{{ record.cropName }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">品种路径：</span>
                  <span class="text-sm text-gray-900">{{ record.cropVariety || '-' }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">关联种源：</span>
                  <span class="text-sm text-gray-900">{{ record.sourceCode }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">育苗方式：</span>
                  <span class="text-sm text-gray-900">{{ seedlingTypeLabel }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">温室场地：</span>
                  <span class="text-sm text-gray-900">{{ record.siteName }}</span>
                </div>
                <div class="flex items-center" v-if="record.orgName">
                  <span class="text-sm text-gray-500 w-24">所属组织：</span>
                  <span class="text-sm text-gray-900">{{ record.orgName }}</span>
                </div>
                <div class="flex items-center" v-if="record.seedlingTaskTime !== undefined">
                  <span class="text-sm text-gray-500 w-24">育苗工时：</span>
                  <span class="text-sm text-gray-900">{{ record.seedlingTaskTime }} 小时</span>
                </div>
              </div>
            </div>

            <!-- 数量信息 -->
            <div>
              <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">数量信息</h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">开始日期：</span>
                  <span class="text-sm text-gray-900">{{ record.startDate }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">结束日期：</span>
                  <span class="text-sm text-gray-900">{{ record.endDate || '-' }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">预计结束：</span>
                  <span class="text-sm text-gray-900">{{ record.expectedEndDate || '-' }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">初始数量：</span>
                  <span class="text-sm text-gray-900">{{ record.initialCount?.toLocaleString() }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">成活数量：</span>
                  <span class="text-sm text-emerald-600 font-medium">{{ record.survivalCount?.toLocaleString() }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">成苗率：</span>
                  <span class="text-sm text-emerald-600 font-bold">{{ record.survivalRate }}%</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">已定植数量：</span>
                  <span class="text-sm text-blue-600">{{ record.plantedCount?.toLocaleString() }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">损耗数量：</span>
                  <span class="text-sm text-red-600">{{ record.lossCount?.toLocaleString() }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">损耗率：</span>
                  <span class="text-sm text-red-600">{{ record.lossRate }}%</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">剩余总数：</span>
                  <span class="text-sm text-purple-600 font-medium">
                    {{ ((record.initialCount || 0) - (record.lossCount || 0)).toLocaleString() }}
                  </span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">育苗结束：</span>
                  <span class="text-sm text-gray-900">{{ record.isFinished ? '是' : '否' }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">状态：</span>
                  <span :class="['px-2 py-1 rounded text-xs font-medium', getStatusColor(record.status)]">
                    {{ getStatusLabel(record.status) }}
                  </span>
                </div>
                <div class="flex items-center" v-if="record.qualityGrade">
                  <span class="text-sm text-gray-500 w-24">品质等级：</span>
                  <span class="text-sm text-gray-900">{{ qualityGradeLabel }}</span>
                </div>
                <div class="flex items-center" v-if="record.chargePerson">
                  <span class="text-sm text-gray-500 w-24">负责人：</span>
                  <span class="text-sm text-gray-900">{{ record.chargePerson }}</span>
                </div>
              </div>

              <!-- 数量统计区（对齐 V1.1 L133-161）-->
              <div class="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <h5 class="text-sm font-semibold text-amber-900 mb-2">数量统计（自动累加，对应 DB 字段）</h5>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div class="flex items-center">
                    <span class="text-sm text-gray-500 w-32">母株累计损耗：</span>
                    <span class="text-sm text-red-500 font-medium">{{ (record.motherLossCount || 0).toLocaleString() }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-sm text-gray-500 w-32">小苗累计产出：</span>
                    <span class="text-sm text-emerald-600 font-medium">{{ (record.expandedPlantCount || 0).toLocaleString() }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-sm text-gray-500 w-32">小苗累计损耗：</span>
                    <span class="text-sm text-red-500 font-medium">{{ (record.seedlingLossCount || 0).toLocaleString() }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-sm text-gray-500 w-32">采收入库累计：</span>
                    <span class="text-sm text-purple-600 font-medium">{{ (record.harvestStockedCount || 0).toLocaleString() }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-sm text-gray-500 w-32">补苗累计：</span>
                    <span class="text-sm text-emerald-600 font-medium">{{ (record.replantCount || 0).toLocaleString() }}</span>
                  </div>
                </div>
                <p class="text-xs text-gray-500 mt-2">
                  累计损耗 = 母株累计损耗 + 小苗累计损耗 = {{ ((record.motherLossCount || 0) + (record.seedlingLossCount || 0)).toLocaleString() }} 株
                </p>
              </div>
            </div>

            <!-- 栽种记录 -->
            <div v-if="record.transplantRecords && record.transplantRecords.length > 0">
              <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                栽种记录 ({{ record.transplantRecords.length }} 条)
              </h4>
              <div class="max-h-40 overflow-y-auto space-y-2">
                <div
                  v-for="(tr, index) in record.transplantRecords"
                  :key="index"
                  class="bg-gray-50 rounded p-3 text-sm"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-medium">{{ tr.transplantDate }}</span>
                    <span :class="['px-2 py-0.5 rounded text-xs', getTransplantStatusClass(tr.status)]">
                      {{ getTransplantStatusLabel(tr.status) }}
                    </span>
                  </div>
                  <div class="mt-1 text-gray-600 grid grid-cols-2 gap-1 text-xs">
                    <span>场地: {{ tr.areaName }}</span>
                    <span v-if="tr.zoneName">区域: {{ tr.zoneName }}</span>
                    <span v-if="tr.bedName">苗床: {{ tr.bedName }}</span>
                    <span>定植数量: {{ tr.transplantCount }}</span>
                    <span>剩余: {{ tr.remainingCount }}</span>
                  </div>
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
                  <span class="text-sm text-gray-900">{{ record.printCount }} 次</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">每日记录：</span>
                  <span class="text-sm text-gray-900">{{ record.dailyRecords?.length || 0 }} 条</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">打印记录：</span>
                  <span class="text-sm text-gray-900">
                    {{ record.printRecords ? `${record.printRecords.length} 条` : '0 条' }}
                  </span>
                </div>
                <div class="flex items-center" v-if="record.remarks">
                  <span class="text-sm text-gray-500 w-24 flex-shrink-0">备注：</span>
                  <span class="text-sm text-gray-900">{{ record.remarks }}</span>
                </div>
              </div>
            </div>

            <!-- 图片展示 -->
            <div v-if="record.pictures && record.pictures.length > 0">
              <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">育苗图片</h4>
              <div class="flex gap-2 flex-wrap">
                <el-image
                  v-for="(img, index) in record.pictures"
                  :key="index"
                  :src="img"
                  :preview-src-list="record.pictures"
                  fit="cover"
                  class="w-24 h-24 rounded cursor-pointer"
                />
              </div>
            </div>

            <!-- 每日记录 -->
            <div v-if="record.dailyRecords && record.dailyRecords.length > 0">
              <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">每日记录</h4>
              <el-table :data="record.dailyRecords" size="small" max-height="300">
                <el-table-column prop="recordDate" label="记录日期" width="120" />
                <el-table-column prop="temperature" label="温度(℃)" width="80">
                  <template #default="{ row }">
                    {{ row.temperature || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="humidity" label="湿度(%)" width="80">
                  <template #default="{ row }">
                    {{ row.humidity || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="watering" label="浇水" width="60">
                  <template #default="{ row }">
                    {{ row.watering ? '是' : '否' }}
                  </template>
                </el-table-column>
                <el-table-column prop="survivalCountChange" label="成活变化" width="100">
                  <template #default="{ row }">
                    {{ row.survivalCountChange !== undefined ? (row.survivalCountChange > 0 ? '+' : '') + row.survivalCountChange : '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="lossCountChange" label="损耗变化" width="100">
                  <template #default="{ row }">
                    {{ row.lossCountChange !== undefined ? '+' + row.lossCountChange : '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="abnormality" label="异常情况">
                  <template #default="{ row }">
                    {{ row.abnormality || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="remarks" label="备注">
                  <template #default="{ row }">
                    {{ row.remarks || '-' }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <!-- 操作历史标签页（对齐 V1.1 EntityDetailModal 内置操作历史 Tab L238-266）-->
          <div v-show="activeTab === 'history'" class="py-2">
            <div v-if="entityHistory.length > 0" class="space-y-3">
              <div v-for="item in entityHistory" :key="item.id" class="flex items-start gap-3 pb-3 border-b border-gray-100">
                <div class="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p class="text-sm text-gray-900">{{ item.action }}</p>
                  <p class="text-xs text-gray-500">{{ item.createTime }} · {{ item.createBy }}</p>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">暂无操作历史</div>
          </div>
        </div>
      </div>

    <template #footer>
      <div class="flex justify-end">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * 育苗详情弹窗组件
 * 功能：展示育苗详细信息，支持基本信息查看和操作历史切换
 */
import { ref, computed } from 'vue'
import { View, Close, Clock } from '@element-plus/icons-vue'

const props = defineProps({
  visible: Boolean,
  record: Object
})

// 育苗方式字典翻译（对齐 V1.1 SEEDLING_TYPE_MAP 主要 4 项）
const seedlingTypeLabel = computed(() => {
  const map = { 'plug': '穴盘育苗', 'plug_seedling': '穴盘育苗', 'grafting': '嫁接育苗', 'tissue_culture': '组培育苗', 'tissue': '组培育苗', 'direct_seeding': '直播育苗', 'direct': '直播育苗' }
  return map[props.record?.seedlingType] || props.record?.seedlingType || '-'
})

// 品质等级字典翻译（对齐 V1.1 QUALITY_GRADE_MAP）
const qualityGradeLabel = computed(() => {
  const map = { 'special': '特优', 'excellent': '优', 'good': '良', 'qualified': '合格', 'unqualified': '不合格', 'A': 'A级', 'B': 'B级', 'C': 'C级', 'D': '次品' }
  return map[props.record?.qualityGrade] || props.record?.qualityGrade || '-'
})

// 操作历史数据（对齐 V1.1 EntityDetailModal 内置操作历史 Tab）
const entityHistory = computed(() => {
  return props.record?.operationHistory || []
})

const emit = defineEmits(['update:visible'])

// 标签页状态
const activeTab = ref('info')

const handleClose = () => {
  emit('update:visible', false)
}

// 状态标签颜色映射（与V1.1一致）
const getStatusLabel = (status) => {
  const map = {
    'in_progress': '进行中',
    'transplant_ready': '待定植',
    'completed': '已完成',
    'abnormal': '异常'
  }
  return map[status] || status
}

// 获取状态颜色class（V1.1本地statusMap定义）
const getStatusColor = (status) => {
  const map = {
    'in_progress': 'text-amber-600 bg-amber-50',
    'transplant_ready': 'text-blue-600 bg-blue-50',
    'completed': 'text-green-600 bg-green-50',
    'abnormal': 'text-red-600 bg-red-50'
  }
  return map[status] || 'text-gray-600 bg-gray-50'
}

// 栽种记录状态标签
const getTransplantStatusLabel = (status) => {
  if (!status) return '-'
  switch (status) {
    case 'in_stock': return '库存'
    case 'transplanting': return '定植中'
    case 'growing': return '生长期'
    case 'harvested': return '已采收'
    default: return status
  }
}

// 栽种记录状态颜色class（V1.1逻辑）
const getTransplantStatusClass = (status) => {
  switch (status) {
    case 'growing': return 'bg-green-100 text-green-700'
    case 'harvested': return 'bg-yellow-100 text-yellow-700'
    case 'in_stock': return 'bg-blue-100 text-blue-700'
    case 'transplanting': return 'bg-blue-100 text-blue-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}
</script>
