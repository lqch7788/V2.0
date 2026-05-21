<template>
  <!-- 指标详情/分析/评价弹窗组件 -->
  <el-dialog
    :model-value="isOpen"
    @update:model-value="handleClose"
    :title="modalTitle"
    width="600px"
    :close-on-click-modal="false"
    class="indicator-detail-modal"
  >
    <!-- 指标详情视图 -->
    <div v-if="modalType === 'view' && indicator" class="space-y-4">
      <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <span class="text-blue-600 text-lg">📊</span>
          </div>
          <div>
            <h4 class="text-lg font-bold text-gray-900">{{ indicator.name }}</h4>
            <span class="text-sm text-gray-500 font-mono">{{ indicator.code }}</span>
          </div>
        </div>
        <el-row :gutter="16">
          <el-col :span="12">
            <p class="text-xs text-gray-500">类别</p>
            <p class="text-sm font-medium text-gray-900">{{ indicator.category }}</p>
          </el-col>
          <el-col :span="12">
            <p class="text-xs text-gray-500">采集方式</p>
            <p class="text-sm font-medium text-gray-900">{{ indicator.source }}</p>
          </el-col>
          <el-col :span="12" class="mt-3">
            <p class="text-xs text-gray-500">目标值</p>
            <p class="text-lg font-bold text-blue-600 font-mono">{{ indicator.target }}{{ indicator.unit }}</p>
          </el-col>
          <el-col :span="12" class="mt-3">
            <p class="text-xs text-gray-500">实际值</p>
            <p class="text-lg font-bold text-gray-900 font-mono">{{ indicator.actual }}{{ indicator.unit }}</p>
          </el-col>
        </el-row>
        <div class="mt-4">
          <p class="text-xs text-gray-500 mb-2">达成率</p>
          <div class="flex items-center gap-3">
            <div class="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                :class="getProgressColorClass()"
                class="h-full rounded-full transition-all"
                :style="{ width: `${Math.min((indicator.actual / indicator.target) * 100, 100)}%` }"
              />
            </div>
            <span class="text-sm font-medium text-gray-900 font-mono">
              {{ calcAchievementRate() }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 达成分析视图 -->
    <div v-if="modalType === 'analyze' && indicator" class="space-y-4">
      <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <span class="text-purple-600 text-lg">📈</span>
          </div>
          <div>
            <h4 class="text-lg font-bold text-gray-900">{{ indicator.name }}</h4>
            <span class="text-sm text-gray-500 font-mono">{{ indicator.code }}</span>
          </div>
        </div>
        <el-row :gutter="16">
          <el-col :span="8">
            <div class="text-center p-3 bg-white rounded-lg border border-gray-200">
              <p class="text-xs text-gray-500">目标值</p>
              <p class="text-xl font-bold text-blue-600 font-mono">{{ indicator.target }}{{ indicator.unit }}</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="text-center p-3 bg-white rounded-lg border border-gray-200">
              <p class="text-xs text-gray-500">实际值</p>
              <p class="text-xl font-bold text-emerald-600 font-mono">{{ indicator.actual }}{{ indicator.unit }}</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="text-center p-3 bg-white rounded-lg border border-gray-200">
              <p class="text-xs text-gray-500">达成率</p>
              <p class="text-xl font-bold text-purple-600 font-mono">{{ calcAchievementRate() }}</p>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 考核评价视图 -->
    <div v-if="modalType === 'evaluate'" class="space-y-4">
      <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <el-icon :size="24" class="text-blue-600"><Medal /></el-icon>
          </div>
          <div>
            <h4 class="text-lg font-bold text-gray-900">本季度考核评价</h4>
            <span class="text-sm text-gray-500">2026年Q2</span>
          </div>
        </div>
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="text-center p-3 bg-white rounded-lg border border-gray-200">
              <p class="text-xs text-gray-500">参评基地</p>
              <p class="text-xl font-bold text-blue-600 font-mono">8</p>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="text-center p-3 bg-white rounded-lg border border-gray-200">
              <p class="text-xs text-gray-500">优秀</p>
              <p class="text-xl font-bold text-emerald-600 font-mono">3</p>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="text-center p-3 bg-white rounded-lg border border-gray-200">
              <p class="text-xs text-gray-500">良好</p>
              <p class="text-xl font-bold text-blue-600 font-mono">4</p>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="text-center p-3 bg-white rounded-lg border border-gray-200">
              <p class="text-xs text-gray-500">合格</p>
              <p class="text-xl font-bold text-amber-600 font-mono">1</p>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { Medal } from '@element-plus/icons-vue'
import {  Indicator, ModalType  } from '@/types/indicators'

const props = defineProps({
  modalType: String
})

const emit = defineEmits(['close'])

// 弹窗标题
const modalTitle = computed(() => {
  switch (props.modalType) {
    case 'view':
      return '指标详情'
    case 'analyze':
      return '达成分析'
    case 'evaluate':
      return '考核评价'
    default:
      return '指标详情'
  }
})

// 关闭弹窗
const handleClose = () => {
  emit('close')
}

// 计算达成率
const calcAchievementRate = () => {
  if (!props.indicator) return '0%'
  return ((props.indicator.actual / props.indicator.target) * 100).toFixed(1) + '%'
}

// 获取进度条颜色
const getProgressColorClass = () => {
  if (!props.indicator) return 'bg-emerald-500'
  const ratio = props.indicator.actual / props.indicator.target
  if (ratio >= 1) return 'bg-emerald-500'
  if (ratio >= 0.95) return 'bg-amber-500'
  return 'bg-red-500'
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.indicator-detail-modal .el-dialog__header) {
  background: linear-gradient(to right, #3b82f6, #2563eb);
  color: white;
  margin: 0;
  padding: 16px 20px;
}

:deep(.indicator-detail-modal .el-dialog__title) {
  color: white;
}

:deep(.indicator-detail-modal .el-dialog__close) {
  color: white;
}
</style>
