<template>
  <!-- 巡查详情弹窗 -->
  <el-dialog
    :model-value="!!recordId"
    title=""
    width="700px"
    :close-on-click-modal="false"
    @close="onClose"
  >
    <!-- 加载中 -->
    <div v-if="!inspection" class="text-center py-12 text-gray-500">
      <p>加载中...</p>
    </div>

    <div v-else class="flex flex-col max-h-[70vh]">
      <!-- 头部（模仿V1.1渐变色风格） -->
      <div class="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 flex-shrink-0 rounded-t-lg -mx-5 -mt-5 mb-4">
        <div class="flex items-center gap-3">
          <h3 class="text-lg font-semibold text-white">巡查详情</h3>
          <span :class="statusConfig.badgeClass">
            {{ statusConfig.label }}
          </span>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto space-y-4">
        <!-- 巡查信息 - 蓝色背景 -->
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h4 class="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
            <el-icon :size="16"><Document /></el-icon>
            巡查信息
          </h4>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-blue-600">巡查编号:</span>
              <span class="ml-2 text-gray-900 font-mono">{{ inspection.recordCode }}</span>
            </div>
            <div>
              <span class="text-blue-600">巡查类型:</span>
              <span class="ml-2 text-gray-900">{{ typeLabel }}</span>
            </div>
            <div>
              <span class="text-blue-600">执行区域:</span>
              <span class="ml-2 text-gray-900">{{ inspection.greenhouseName || '-' }}</span>
            </div>
            <div>
              <span class="text-blue-600">巡查人员:</span>
              <span class="ml-2 text-gray-900">{{ inspection.inspectorName || '-' }}</span>
            </div>
            <div class="col-span-2">
              <span class="text-blue-600">巡查时间:</span>
              <span class="ml-2 text-gray-900">{{ inspection.checkDate }} {{ inspection.checkTime || '' }}</span>
            </div>
            <div v-if="inspection.batchCode" class="col-span-2">
              <span class="text-blue-600">关联批次:</span>
              <span class="ml-2 text-gray-900">{{ inspection.batchCode }}</span>
            </div>
            <!-- 作物名称（farm类型） -->
            <div v-if="inspection.cropName">
              <span class="text-blue-600">作物名称:</span>
              <span class="ml-2 text-gray-900">{{ inspection.cropName }}</span>
            </div>
            <!-- 作物状态（farm类型） -->
            <div v-if="inspection.cropStatus">
              <span class="text-blue-600">作物状态:</span>
              <span class="ml-2 text-gray-900">{{ inspection.cropStatus }}</span>
            </div>
            <!-- 株高（farm类型） -->
            <div v-if="inspection.plantHeight">
              <span class="text-blue-600">株高:</span>
              <span class="ml-2 text-gray-900">{{ inspection.plantHeight }} cm</span>
            </div>
            <!-- 叶片数（farm类型） -->
            <div v-if="inspection.leafCount">
              <span class="text-blue-600">叶片数:</span>
              <span class="ml-2 text-gray-900">{{ inspection.leafCount }} 片</span>
            </div>
          </div>
        </div>

        <!-- 巡查项目检查清单 - 紫色背景 -->
        <div class="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <h4 class="text-sm font-bold text-purple-700 mb-3 flex items-center gap-2">
            <el-icon :size="16"><Files /></el-icon>
            巡查项目检查清单
          </h4>
          <div class="space-y-3">
            <div
              v-for="(item, index) in (inspection.checkItems || [])"
              :key="index"
              class="flex items-start gap-3 p-2 bg-white rounded"
            >
              <span :class="getCheckItemStatusClass(item.status)">
                {{ getCheckItemStatusIcon(item.status) }}
              </span>
              <div class="flex-1">
                <p class="text-sm text-gray-900">{{ item.name }}</p>
                <p :class="getCheckItemResultClass(item.status)">
                  {{ item.result || '未检查' }}
                </p>
                <p v-if="item.remark" class="text-xs text-gray-500 mt-1">备注: {{ item.remark }}</p>
              </div>
            </div>
            <p v-if="!inspection.checkItems || inspection.checkItems.length === 0" class="text-sm text-gray-400 text-center py-4">
              暂无检查项目
            </p>
          </div>
        </div>

        <!-- 发现问题 - 红色背景 -->
        <div class="bg-red-50 rounded-lg p-4 border border-red-100">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-bold text-red-700 flex items-center gap-2">
              <el-icon :size="16"><WarningFilled /></el-icon>
              发现问题 ({{ inspection.issues ? inspection.issues.length : 0 }})
            </h4>
            <el-button
              v-if="onReportProblem"
              type="danger"
              size="small"
              @click="onReportProblem(recordId)"
            >
              上报问题
            </el-button>
          </div>
          <div v-if="!inspection.issues || inspection.issues.length === 0" class="text-sm text-gray-400 text-center py-4">
            未发现问题
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="issue in inspection.issues"
              :key="issue.id"
              class="p-3 bg-white rounded border border-red-200"
            >
              <div class="flex items-center justify-between">
                <p class="text-sm text-gray-900">{{ issue.description }}</p>
                <span :class="getSeverityClass(issue.severity)">
                  {{ issue.severity }}
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-1">状态: {{ issue.status }}</p>
            </div>
          </div>
        </div>

        <!-- 现场照片 - 青色背景 -->
        <div v-if="inspection.photos && inspection.photos.length > 0" class="bg-cyan-50 rounded-lg p-4 border border-cyan-100">
          <h4 class="text-sm font-bold text-cyan-700 mb-3 flex items-center gap-2">
            <el-icon :size="16"><Picture /></el-icon>
            现场照片
          </h4>
          <div class="grid grid-cols-3 gap-2">
            <div
              v-for="(photo, index) in inspection.photos"
              :key="index"
              class="aspect-square bg-gray-200 rounded overflow-hidden"
            >
              <img
                :src="photo"
                :alt="`现场照片${index + 1}`"
                class="w-full h-full object-cover"
                @error="(e) => { (e.target as HTMLImageElement).style.display = 'none' }"
              />
            </div>
          </div>
        </div>

        <!-- 环境参数（farm类型） -->
        <div v-if="hasEnvironmentData" class="bg-teal-50 rounded-lg p-4 border border-teal-100">
          <h4 class="text-sm font-bold text-teal-700 mb-3 flex items-center gap-2">
            <el-icon :size="16"><Odometer /></el-icon>
            环境参数
          </h4>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div v-if="inspection.airTemperature" class="flex justify-between p-2 bg-white rounded">
              <span class="text-teal-600">空气温度</span>
              <span class="text-gray-900">{{ inspection.airTemperature }}°C</span>
            </div>
            <div v-if="inspection.airHumidity" class="flex justify-between p-2 bg-white rounded">
              <span class="text-teal-600">空气湿度</span>
              <span class="text-gray-900">{{ inspection.airHumidity }}%</span>
            </div>
            <div v-if="inspection.lightIntensity" class="flex justify-between p-2 bg-white rounded">
              <span class="text-teal-600">光照强度</span>
              <span class="text-gray-900">{{ inspection.lightIntensity }} Lux</span>
            </div>
            <div v-if="inspection.co2Concentration" class="flex justify-between p-2 bg-white rounded">
              <span class="text-teal-600">CO2浓度</span>
              <span class="text-gray-900">{{ inspection.co2Concentration }} ppm</span>
            </div>
            <div v-if="inspection.soilTemperature" class="flex justify-between p-2 bg-white rounded">
              <span class="text-teal-600">土壤温度</span>
              <span class="text-gray-900">{{ inspection.soilTemperature }}°C</span>
            </div>
            <div v-if="inspection.soilMoisture" class="flex justify-between p-2 bg-white rounded">
              <span class="text-teal-600">土壤湿度</span>
              <span class="text-gray-900">{{ inspection.soilMoisture }}%</span>
            </div>
            <div v-if="inspection.soilEc" class="flex justify-between p-2 bg-white rounded">
              <span class="text-teal-600">土壤EC</span>
              <span class="text-gray-900">{{ inspection.soilEc }} mS/cm</span>
            </div>
            <div v-if="inspection.soilPh" class="flex justify-between p-2 bg-white rounded">
              <span class="text-teal-600">土壤pH</span>
              <span class="text-gray-900">{{ inspection.soilPh }}</span>
            </div>
          </div>
        </div>

        <!-- 备注 - 灰色背景 -->
        <div v-if="inspection.remark" class="bg-gray-100 rounded-lg p-4 border border-gray-200">
          <h4 class="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <el-icon :size="16"><EditPen /></el-icon>
            备注
          </h4>
          <p class="text-sm text-gray-600 whitespace-pre-wrap">{{ inspection.remark }}</p>
        </div>
      </div>

      <!-- 底部操作 -->
      <div class="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
        <el-button @click="onClose">关闭</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Document, Files, WarningFilled, Picture, Odometer, EditPen } from '@element-plus/icons-vue'

// ============================================
// 巡查类型配置（与V1.1完全一致）
// ============================================
const INSPECTION_TYPE_CONFIG: Record<string, string> = {
  farm: '种植巡查',
  equipment: '设备巡查',
  infrastructure: '设施巡查',
  other: '其他巡查',
}

// 状态配置
const STATUS_CONFIG: Record<string, { bgClass: string; textClass: string; label: string; badgeClass: string }> = {
  normal: {
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
    label: '正常',
    badgeClass: 'px-2 py-0.5 text-xs rounded bg-green-100 text-green-700',
  },
  attention: {
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-700',
    label: '需关注',
    badgeClass: 'px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-700',
  },
  critical: {
    bgClass: 'bg-red-100',
    textClass: 'text-red-700',
    label: '异常',
    badgeClass: 'px-2 py-0.5 text-xs rounded bg-red-100 text-red-700',
  },
}

// ============================================
// Props 定义
// ============================================
const props = defineProps({
  recordId: { type: String, default: '' },
  onClose: { type: Function, required: true },
  onReportProblem: { type: Function, default: undefined },
  /** 巡查记录数据（从外部传入） */
  inspection: { type: Object, default: null },
})

// ============================================
// 计算属性
// ============================================
const inspection = computed(() => props.inspection)

const statusConfig = computed(() => {
  if (!inspection.value) return STATUS_CONFIG.normal
  return STATUS_CONFIG[inspection.value.status] || STATUS_CONFIG.normal
})

const typeLabel = computed(() => {
  if (!inspection.value) return '种植巡查'
  return INSPECTION_TYPE_CONFIG[inspection.value.inspectionType] || '种植巡查'
})

// 检查是否有环境数据
const hasEnvironmentData = computed(() => {
  if (!inspection.value) return false
  const envFields = [
    'airTemperature', 'airHumidity', 'lightIntensity', 'co2Concentration',
    'soilTemperature', 'soilMoisture', 'soilEc', 'soilPh',
  ]
  return envFields.some(f => inspection.value[f] !== undefined && inspection.value[f] !== null)
})

// ============================================
// 方法
// ============================================
// 获取检查项状态图标
const getCheckItemStatusIcon = (status: string) => {
  switch (status) {
    case 'normal': return '✓'   // check
    case 'attention': return '!'
    case 'critical': return '✗'  // x
    default: return '○'        // circle
  }
}

// 获取检查项状态样式
const getCheckItemStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    normal: 'w-5 h-5 flex items-center justify-center rounded text-xs bg-green-100 text-green-600',
    attention: 'w-5 h-5 flex items-center justify-center rounded text-xs bg-yellow-100 text-yellow-600',
    critical: 'w-5 h-5 flex items-center justify-center rounded text-xs bg-red-100 text-red-600',
  }
  return classes[status] || 'w-5 h-5 flex items-center justify-center rounded text-xs bg-gray-100 text-gray-600'
}

// 获取检查项结果样式
const getCheckItemResultClass = (status: string) => {
  const classes: Record<string, string> = {
    normal: 'text-xs text-green-600',
    attention: 'text-xs text-yellow-600',
    critical: 'text-xs text-red-600',
  }
  return classes[status] || 'text-xs text-gray-400'
}

// 获取严重程度样式
const getSeverityClass = (severity: string) => {
  const classes: Record<string, string> = {
    '严重': 'px-2 py-0.5 text-xs rounded bg-red-100 text-red-700',
    '中等': 'px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-700',
    '轻微': 'px-2 py-0.5 text-xs rounded bg-green-100 text-green-700',
  }
  return classes[severity] || 'px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700'
}
</script>
