<template>
  <!-- 纯div自定义弹窗 -->
  <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center">
    <!-- 遮罩层 -->
    <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>

    <!-- 弹窗内容 -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
      <!-- 头部 -->
      <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold" style="color: white;">繁殖阶段管理</h3>
        <el-button link @click="handleClose" style="color: white;">
          <el-icon :size="20"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- 当前阶段状态 -->
        <div :class="['p-4 rounded-lg', isFailed ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200']">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500 mb-1">当前阶段</p>
              <p :class="['text-lg font-bold', isFailed ? 'text-red-700' : 'text-emerald-700']">
                {{ STAGE_LABELS[currentStage] || currentStage }}
              </p>
              <p class="text-sm text-gray-600 mt-1">{{ stageDescriptions[currentStage] || '' }}</p>
            </div>
            <div :class="['w-12 h-12 rounded-full flex items-center justify-center', isFailed ? 'bg-red-100' : 'bg-emerald-100']">
              <el-icon :size="24" :class="isFailed ? 'text-red-600' : 'text-emerald-600'">
                <component :is="isFailed ? 'Warning' : 'CircleCheck'" />
              </el-icon>
            </div>
          </div>
        </div>

        <!-- 阶段流转路径 -->
        <div>
          <h4 class="text-sm font-semibold text-gray-900 mb-3">阶段流转路径</h4>
          <div class="flex items-center flex-wrap gap-1">
            <template v-for="(stage, index) in STAGE_ORDER" :key="stage">
              <div v-if="index > 0">
                <el-icon
                  :class="['w-4 h-4', index < currentIndex ? 'text-emerald-400' : 'text-gray-300']"
                >
                  <ArrowRight />
                </el-icon>
              </div>
              <div
                :class="[
                  'px-3 py-2 rounded-lg text-xs font-medium text-center min-w-[80px]',
                  getStageClass(stage, index)
                ]"
              >
                <div>{{ STAGE_LABELS[stage] }}</div>
              </div>
            </template>
            <!-- 失败状态 -->
            <el-icon class="w-4 h-4 text-gray-300"><ArrowRight /></el-icon>
            <div
              :class="[
                'px-3 py-2 rounded-lg text-xs font-medium text-center min-w-[60px]',
                isFailed ? 'bg-red-500 text-white ring-2 ring-red-300' : 'bg-gray-100 text-gray-400'
              ]"
            >
              失败
            </div>
          </div>
          <p class="mt-3 text-xs text-gray-400">
            已完成阶段为绿色，当前阶段高亮显示
          </p>
        </div>

        <!-- 操作按钮区域 -->
        <div v-if="!isFailed" class="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 class="text-sm font-semibold text-gray-900">阶段操作</h4>

          <!-- 推进到下一阶段 -->
          <div v-if="canAdvance && nextStage" class="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
            <div>
              <p class="text-sm font-medium text-gray-900">
                推进到「{{ STAGE_LABELS[nextStage] || nextStage }}」
              </p>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ stageDescriptions[nextStage] || '' }}
              </p>
            </div>
            <el-button type="primary" size="small" @click="handleAdvance" :loading="confirming">
              <el-icon><ArrowRight /></el-icon>
              {{ confirming ? '处理中...' : '推进' }}
            </el-button>
          </div>

          <!-- 完成入库 -->
          <div v-if="canComplete" class="bg-white rounded-lg p-3 border border-emerald-200">
            <p class="text-sm font-medium text-gray-900 mb-2">完成繁殖入库</p>
            <p class="text-xs text-gray-500 mb-3">
              质检已完成，确认入库数量后将更新库存。入库前请确认数量准确。
            </p>
            <div class="flex items-center gap-3">
              <div class="flex-1">
                <label class="block text-xs text-gray-600 mb-1">入库数量</label>
                <el-input-number v-model="harvestQuantity" :min="1" placeholder="请输入入库数量" class="w-full" />
              </div>
              <el-button
                type="success"
                size="small"
                @click="handleComplete"
                :disabled="confirming || harvestQuantity <= 0"
                class="self-end"
              >
                <el-icon><CircleCheck /></el-icon>
                {{ confirming ? '处理中...' : '确认入库' }}
              </el-button>
            </div>
          </div>

          <!-- 如已是完成状态 -->
          <div v-if="currentStage === 'completed'" class="bg-emerald-50 rounded-lg p-4 text-center">
            <el-icon :size="32" class="text-emerald-500 mb-2"><CircleCheck /></el-icon>
            <p class="text-sm font-medium text-emerald-700">繁殖已入库完成</p>
            <p class="text-xs text-emerald-600 mt-1">该种源已完成全部阶段流转，库存已更新</p>
          </div>
        </div>

        <!-- 失败状态 -->
        <div v-if="isFailed" class="bg-red-50 rounded-lg p-4 text-center border border-red-200">
          <el-icon :size="32" class="text-red-500 mb-2"><Warning /></el-icon>
          <p class="text-sm font-medium text-red-700">繁殖过程已标记为失败</p>
          <p class="text-xs text-red-600 mt-1">该种源的繁殖过程已终止，无法继续操作</p>
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
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Close, ArrowRight, CircleCheck, Warning } from '@element-plus/icons-vue'
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

// 阶段顺序
const STAGE_ORDER = ['planned', 'in_progress', 'harvested', 'quality_checked', 'completed']

const STAGE_LABELS = {
  'planned': '已计划',
  'in_progress': '进行中',
  'harvested': '已采收',
  'quality_checked': '已质检',
  'completed': '已入库',
  'failed': '失败'
}

// 阶段描述
const stageDescriptions = {
  'planned': '繁殖计划已制定',
  'in_progress': '繁殖过程进行中',
  'harvested': '已完成采收',
  'quality_checked': '质量检测已完成',
  'completed': '已入库完成',
  'failed': '繁殖过程失败'
}

const confirming = ref(false)
const harvestQuantity = ref(0)

// 当前阶段
const currentStage = computed(() => props.record?.propagationStatus || 'planned')
const currentIndex = computed(() => STAGE_ORDER.indexOf(currentStage.value))
const isFailed = computed(() => currentStage.value === 'failed')

// 是否可以推进
const canAdvance = computed(() => {
  return currentIndex.value >= 0 && currentIndex.value < STAGE_ORDER.length - 1 && !isFailed.value
})

const nextStage = computed(() => {
  if (!canAdvance.value) return null
  return STAGE_ORDER[currentIndex.value + 1]
})

// 是否可以完成入库
const canComplete = computed(() => currentStage.value === 'quality_checked')

// 获取阶段样式
const getStageClass = (stage, index) => {
  if (isFailed.value) {
    return 'bg-red-100 text-red-700'
  }
  if (index === currentIndex.value) {
    return 'bg-emerald-500 text-white ring-2 ring-emerald-300'
  }
  if (index < currentIndex.value) {
    return 'bg-emerald-100 text-emerald-700'
  }
  return 'bg-gray-100 text-gray-400'
}

// 监听 visible 变化
watch(() => props.visible, (val) => {
  if (val && props.record) {
    harvestQuantity.value = props.record.availableCount || 0
  }
})

// 推进阶段
const handleAdvance = async () => {
  if (!nextStage.value) return
  confirming.value = true
  try {
    // TODO: 调用 store 方法推进阶段
    ElMessage.success('阶段推进成功')
    emit('success')
    handleClose()
  } catch {
    ElMessage.error('阶段推进失败')
  } finally {
    confirming.value = false
  }
}

// 完成入库
const handleComplete = async () => {
  if (harvestQuantity.value <= 0) {
    ElMessage.warning('请输入入库数量')
    return
  }
  confirming.value = true
  try {
    // TODO: 调用 store 方法完成入库
    ElMessage.success('入库成功')
    emit('success')
    handleClose()
  } catch {
    ElMessage.error('入库失败')
  } finally {
    confirming.value = false
  }
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>
