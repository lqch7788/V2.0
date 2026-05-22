<template>
  <!-- 纯div自定义弹窗 -->
  <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center">
    <!-- 遮罩层 -->
    <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>

    <!-- 弹窗内容 -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
      <!-- 头部 -->
      <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold" style="color: white;">繁殖过程记录</h3>
        <el-button link @click="handleClose" style="color: white;">
          <el-icon :size="20"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- 上部：添加记录表单 -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <el-icon class="text-emerald-600"><Plus /></el-icon>
            添加过程记录
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <!-- 记录日期 -->
            <div>
              <label class="block text-xs text-gray-600 mb-1">记录日期</label>
              <el-date-picker
                v-model="formData.recordDate"
                type="datetime"
                placeholder="选择日期时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                class="w-full"
              />
            </div>

            <!-- 阶段 -->
            <div>
              <label class="block text-xs text-gray-600 mb-1">当前阶段</label>
              <el-select v-model="formData.stage" placeholder="选择阶段" class="w-full">
                <el-option v-for="(label, key) in STAGE_LABELS" :key="key" :label="label" :value="key" />
              </el-select>
            </div>

            <!-- 温度 -->
            <div>
              <label class="block text-xs text-gray-600 mb-1 flex items-center gap-1">
                <el-icon class="text-orange-500"><Sunny /></el-icon>
                温度（℃）
              </label>
              <el-input-number v-model="formData.temperature" :min="0" :precision="1" placeholder="如 25.5" class="w-full" />
            </div>

            <!-- 湿度 -->
            <div>
              <label class="block text-xs text-gray-600 mb-1 flex items-center gap-1">
                <el-icon class="text-blue-500"><Cloudy /></el-icon>
                湿度（%）
              </label>
              <el-input-number v-model="formData.humidity" :min="0" :precision="1" placeholder="如 65" class="w-full" />
            </div>

            <!-- 操作人 -->
            <div>
              <label class="block text-xs text-gray-600 mb-1">操作人</label>
              <el-input v-model="formData.operator" placeholder="操作人姓名" />
            </div>

            <!-- 育种途径字段 -->
            <template v-if="isBreeding">
              <div>
                <label class="block text-xs text-gray-600 mb-1">授粉类型</label>
                <el-select v-model="formData.pollinationType" placeholder="未设置" clearable class="w-full">
                  <el-option label="自花授粉" value="self" />
                  <el-option label="异花授粉" value="cross" />
                  <el-option label="开放授粉" value="open" />
                </el-select>
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">授粉作物</label>
                <el-input v-model="formData.pollinatorCrop" placeholder="授粉作物名称" />
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">授粉花朵数</label>
                <el-input-number v-model="formData.flowerCount" :min="0" class="w-full" />
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">坐果数</label>
                <el-input-number v-model="formData.fruitSetCount" :min="0" class="w-full" />
              </div>
            </template>

            <!-- 采收阶段字段（育种+留种） -->
            <template v-if="isBreeding || isSeedSaving">
              <div>
                <label class="block text-xs text-gray-600 mb-1">采收种子数</label>
                <el-input-number v-model="formData.harvestSeedCount" :min="0" class="w-full" />
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">种子重量(g)</label>
                <el-input-number v-model="formData.seedWeight" :min="0" :precision="1" class="w-full" />
              </div>
            </template>

            <!-- 无性繁殖字段 -->
            <template v-if="isAsexual">
              <div>
                <label class="block text-xs text-gray-600 mb-1">采收苗数</label>
                <el-input-number v-model="formData.harvestPlantCount" :min="0" class="w-full" />
              </div>
            </template>

            <!-- 质检阶段字段 -->
            <template v-if="isBreeding || isSeedSaving">
              <div>
                <label class="block text-xs text-gray-600 mb-1">发芽率(%)</label>
                <el-input-number v-model="formData.germinationRate" :min="0" :max="100" :precision="1" class="w-full" />
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">净度(%)</label>
                <el-input-number v-model="formData.purity" :min="0" :max="100" :precision="1" class="w-full" />
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">水分(%)</label>
                <el-input-number v-model="formData.moisture" :min="0" :max="100" :precision="1" class="w-full" />
              </div>
            </template>

            <template v-if="isAsexual">
              <div>
                <label class="block text-xs text-gray-600 mb-1">成活率(%)</label>
                <el-input-number v-model="formData.survivalRate" :min="0" :max="100" :precision="1" class="w-full" />
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">生根率(%)</label>
                <el-input-number v-model="formData.rootedRate" :min="0" :max="100" :precision="1" class="w-full" />
              </div>
            </template>

            <!-- 异常描述 -->
            <div class="col-span-2">
              <label class="block text-xs text-gray-600 mb-1 flex items-center gap-1">
                <el-icon class="text-amber-500"><Warning /></el-icon>
                异常描述
              </label>
              <el-input v-model="formData.abnormality" placeholder="记录异常情况（如有）" />
            </div>

            <!-- 备注 -->
            <div class="col-span-2">
              <label class="block text-xs text-gray-600 mb-1">备注</label>
              <el-input v-model="formData.remarks" type="textarea" :rows="2" placeholder="补充说明" />
            </div>
          </div>
        </div>

        <!-- 下部：历史记录时间线 -->
        <div>
          <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <el-icon class="text-gray-500"><Clock /></el-icon>
            操作记录 ({{ records.length }})
          </h4>
          <div v-if="records.length === 0" class="text-center py-8 text-gray-400 text-sm">
            暂无过程记录
          </div>
          <div v-else class="relative pl-6 border-l-2 border-gray-200 space-y-4 ml-2">
            <div v-for="rec in records" :key="rec.id" class="relative">
              <div class="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></div>
              <div class="bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
                <div class="flex items-center justify-between mb-1">
                  <span :class="['px-2 py-0.5 rounded text-xs font-medium', STAGE_COLORS[rec.stage] || 'bg-gray-100 text-gray-600']">
                    {{ STAGE_LABELS[rec.stage] || rec.stage }}
                  </span>
                  <span class="text-xs text-gray-400">
                    {{ rec.recordDate }}
                  </span>
                </div>
                <div class="text-xs text-gray-600 space-y-0.5">
                  <span v-if="rec.temperature !== undefined">🌡 {{ rec.temperature }}℃</span>
                  <span v-if="rec.humidity !== undefined">💧 {{ rec.humidity }}%</span>
                  <span v-if="rec.pollinationType">授粉: {{ rec.pollinationType }}</span>
                  <span v-if="rec.flowerCount">花: {{ rec.flowerCount }}</span>
                  <span v-if="rec.fruitSetCount">果: {{ rec.fruitSetCount }}</span>
                  <span v-if="rec.harvestSeedCount">种子: {{ rec.harvestSeedCount }}</span>
                  <span v-if="rec.harvestPlantCount">苗: {{ rec.harvestPlantCount }}</span>
                  <span v-if="rec.germinationRate">发芽率: {{ rec.germinationRate }}%</span>
                  <span v-if="rec.survivalRate">成活率: {{ rec.survivalRate }}%</span>
                </div>
                <div v-if="rec.operator" class="text-xs text-gray-400 mt-1">操作人: {{ rec.operator }}</div>
                <div v-if="rec.abnormality" class="text-xs text-amber-600 mt-1 bg-amber-50 px-2 py-1 rounded">
                  ⚠ {{ rec.abnormality }}
                </div>
                <div v-if="rec.remarks" class="text-xs text-gray-500 mt-1">{{ rec.remarks }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleSubmit">添加记录</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Close, Plus, Clock, Sunny, Cloudy, Warning } from '@element-plus/icons-vue'
import { useSeedSourceStore } from '@/stores'

const props = defineProps({
  visible: Boolean,
  record: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'success'])

const seedSourceStore = useSeedSourceStore()

// 阶段映射
const STAGE_LABELS = {
  'planned': '已计划',
  'in_progress': '进行中',
  'harvested': '已采收',
  'quality_checked': '已质检',
  'completed': '已入库',
  'failed': '失败'
}

const STAGE_COLORS = {
  'planned': 'bg-gray-100 text-gray-700',
  'in_progress': 'bg-blue-100 text-blue-700',
  'harvested': 'bg-green-100 text-green-700',
  'quality_checked': 'bg-purple-100 text-purple-700',
  'completed': 'bg-emerald-100 text-emerald-700',
  'failed': 'bg-red-100 text-red-700'
}

// 繁殖途径判断
const isBreeding = computed(() => props.record?.propagationType === 'breeding')
const isSeedSaving = computed(() => props.record?.propagationType === 'seed_saving')
const isAsexual = computed(() => props.record?.propagationType === 'asexual')

// 记录列表
const records = ref([])

// 表单数据
const formData = ref({
  stage: 'in_progress',
  recordDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
  temperature: undefined,
  humidity: undefined,
  abnormality: '',
  operator: '',
  remarks: '',
  pollinationType: undefined,
  pollinatorCrop: '',
  flowerCount: 0,
  fruitSetCount: 0,
  harvestSeedCount: 0,
  seedWeight: 0,
  harvestPlantCount: 0,
  germinationRate: 0,
  purity: 0,
  moisture: 0,
  survivalRate: 0,
  rootedRate: 0,
  graftSuccessRate: 0
})

// 监听 visible 变化
watch(() => props.visible, async (val) => {
  if (val && props.record) {
    // 加载记录
    try {
      // TODO: 从 store 获取繁殖记录
      records.value = []
    } catch (error) {
      console.error('加载繁殖记录失败:', error)
    }
  }
})

// 重置表单
const resetForm = () => {
  formData.value = {
    stage: 'in_progress',
    recordDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
    temperature: undefined,
    humidity: undefined,
    abnormality: '',
    operator: '',
    remarks: '',
    pollinationType: undefined,
    pollinatorCrop: '',
    flowerCount: 0,
    fruitSetCount: 0,
    harvestSeedCount: 0,
    seedWeight: 0,
    harvestPlantCount: 0,
    germinationRate: 0,
    purity: 0,
    moisture: 0,
    survivalRate: 0,
    rootedRate: 0,
    graftSuccessRate: 0
  }
}

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!props.record) return

  try {
    // TODO: 调用 store 方法添加繁殖记录
    ElMessage.success('添加记录成功')
    resetForm()
    emit('success')
    handleClose()
  } catch (error) {
    ElMessage.error('添加记录失败')
  }
}
</script>
