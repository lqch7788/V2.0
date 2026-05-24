<template>
  <!-- 指标详情/分析/评价弹窗组件 - V1.1原生div样式 -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="handleClose">
    <div class="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl" @click.stop>
      <!-- 头部 - V1.1蓝色渐变标题栏 -->
      <div class="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-between">
        <h3 class="font-semibold flex items-center gap-2">
          <!-- 根据类型显示不同图标 -->
          <el-icon v-if="modalType === 'view'" :size="20"><View /></el-icon>
          <el-icon v-else-if="modalType === 'analyze'" :size="20"><Odometer /></el-icon>
          <el-icon v-else :size="20"><Medal /></el-icon>
          {{ modalTitle }}
        </h3>
        <el-button
          variant="text"
          :icon="Close"
          @click="handleClose"
          class="text-white/80 hover:text-white"
        />
      </div>

      <!-- 内容区域 -->
      <div class="p-6 overflow-y-auto max-h-[60vh]">
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
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500">类别</p>
                <p class="text-sm font-medium text-gray-900">{{ indicator.category }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">采集方式</p>
                <p class="text-sm font-medium text-gray-900">{{ indicator.source }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">目标值</p>
                <p class="text-lg font-bold text-blue-600 font-mono">{{ indicator.target }}{{ indicator.unit }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">实际值</p>
                <p class="text-lg font-bold text-gray-900 font-mono">{{ indicator.actual }}{{ indicator.unit }}</p>
              </div>
            </div>
            <div class="mt-4">
              <p class="text-xs text-gray-500 mb-2">达成率</p>
              <div class="flex items-center gap-3">
                <div class="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    :class="getProgressColorClass()"
                    class="h-full rounded-full transition-all"
                    :style="{ width: `${indicator.target ? Math.min((indicator.actual / indicator.target) * 100, 100) : 0}%` }"
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
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center p-3 bg-white rounded-lg border border-gray-200">
                <p class="text-xs text-gray-500">目标值</p>
                <p class="text-xl font-bold text-blue-600 font-mono">{{ indicator.target }}{{ indicator.unit }}</p>
              </div>
              <div class="text-center p-3 bg-white rounded-lg border border-gray-200">
                <p class="text-xs text-gray-500">实际值</p>
                <p class="text-xl font-bold text-emerald-600 font-mono">{{ indicator.actual }}{{ indicator.unit }}</p>
              </div>
              <div class="text-center p-3 bg-white rounded-lg border border-gray-200">
                <p class="text-xs text-gray-500">达成率</p>
                <p class="text-xl font-bold text-purple-600 font-mono">{{ calcAchievementRate() }}</p>
              </div>
            </div>
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
            <div class="grid grid-cols-4 gap-4">
              <div class="text-center p-3 bg-white rounded-lg border border-gray-200">
                <p class="text-xs text-gray-500">参评基地</p>
                <p class="text-xl font-bold text-blue-600 font-mono">8</p>
              </div>
              <div class="text-center p-3 bg-white rounded-lg border border-gray-200">
                <p class="text-xs text-gray-500">优秀</p>
                <p class="text-xl font-bold text-emerald-600 font-mono">3</p>
              </div>
              <div class="text-center p-3 bg-white rounded-lg border border-gray-200">
                <p class="text-xs text-gray-500">良好</p>
                <p class="text-xl font-bold text-blue-600 font-mono">4</p>
              </div>
              <div class="text-center p-3 bg-white rounded-lg border border-gray-200">
                <p class="text-xs text-gray-500">合格</p>
                <p class="text-xl font-bold text-amber-600 font-mono">1</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
        <el-button size="small" @click="handleClose">关闭</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { View, Odometer, Medal, Close } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: Boolean,
  indicator: Object,
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
  if (!props.indicator.target || props.indicator.target === 0) return '0%'
  return ((props.indicator.actual / props.indicator.target) * 100).toFixed(1) + '%'
}

// 获取进度条颜色
const getProgressColorClass = () => {
  if (!props.indicator) return 'bg-emerald-500'
  if (!props.indicator.target || props.indicator.target === 0) return 'bg-gray-400'
  const ratio = props.indicator.actual / props.indicator.target
  if (ratio >= 1) return 'bg-emerald-500'
  if (ratio >= 0.95) return 'bg-amber-500'
  return 'bg-red-500'
}
</script>

<style scoped>
/* 使用V1.1原生div弹窗样式，头部使用blue蓝色渐变 */
</style>
