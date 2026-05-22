<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="isOpen"
        class="modal-overlay"
        @click.self="$emit('close')"
      >
        <div class="modal-container">
          <!-- 顶部绿色标题栏 -->
          <div class="modal-header">
            <h3 class="modal-title">{{ greenhouse ? `${greenhouse.name} - 温室内环境参数` : '温室内环境参数' }}</h3>
            <div class="modal-actions">
              <button
                class="action-btn-close"
                @click="$emit('close')"
              >
                <Close class="close-icon" />
              </button>
            </div>
          </div>

          <!-- 内容区域 -->
          <div v-if="selectedGreenhouse" class="modal-body space-y-6 p-4">
            <!-- 更新时间 -->
            <div class="text-sm text-gray-500">
              更新时间: {{ greenhouse?.lastUpdate || '2024-03-18 14:30' }}
            </div>

            <!-- 空气环境参数 -->
            <div>
              <h4 class="text-base font-semibold text-gray-900 mb-3">空气环境参数</h4>
              <div class="grid grid-cols-4 gap-3">
                <div class="relative p-2 bg-gray-100 rounded-lg">
                  <div class="absolute top-2 left-2 w-8 h-8 rounded bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-none">
                    <el-icon :size="16" class="text-white"><MostlyCloudy /></el-icon>
                  </div>
                  <div class="pl-10 text-center">
                    <div class="text-sm font-medium text-gray-900">温度</div>
                    <div class="text-lg font-bold text-emerald-600">24.8℃</div>
                    <div class="text-xs text-gray-400">(10-30℃)</div>
                  </div>
                </div>
                <div class="relative p-2 bg-gray-100 rounded-lg">
                  <div class="absolute top-2 left-2 w-8 h-8 rounded bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-none">
                    <el-icon :size="16" class="text-white"><DArrowLeft /></el-icon>
                  </div>
                  <div class="pl-10 text-center">
                    <div class="text-sm font-medium text-gray-900">湿度</div>
                    <div class="text-lg font-bold text-emerald-600">56%</div>
                    <div class="text-xs text-gray-400">(40-90%)</div>
                  </div>
                </div>
                <div class="relative p-2 bg-gray-100 rounded-lg">
                  <div class="absolute top-2 left-2 w-8 h-8 rounded bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-none">
                    <el-icon :size="16" class="text-white"><Sunny /></el-icon>
                  </div>
                  <div class="pl-10 text-center">
                    <div class="text-sm font-medium text-gray-900">光照度</div>
                    <div class="text-lg font-bold text-emerald-600">25954</div>
                    <div class="text-xs text-gray-400">(10000-30000Lux)</div>
                  </div>
                </div>
                <div class="relative p-2 bg-gray-100 rounded-lg">
                  <div class="absolute top-2 left-2 w-8 h-8 rounded bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center shadow-none">
                    <el-icon :size="16" class="text-white"><WindPower /></el-icon>
                  </div>
                  <div class="pl-10 text-center">
                    <div class="text-sm font-medium text-gray-900">CO₂</div>
                    <div class="text-lg font-bold text-emerald-600">479</div>
                    <div class="text-xs text-gray-400">(300-900ppm)</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 土壤环境参数 -->
            <div>
              <h4 class="text-base font-semibold text-gray-900 mb-3">土壤环境参数</h4>
              <div class="grid grid-cols-4 gap-3">
                <div class="relative p-2 bg-gray-100 rounded-lg">
                  <div class="absolute top-2 left-2 w-8 h-8 rounded bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-none">
                    <el-icon :size="16" class="text-white"><MostlyCloudy /></el-icon>
                  </div>
                  <div class="pl-10 text-center">
                    <div class="text-sm font-medium text-gray-900">温度</div>
                    <div class="text-lg font-bold text-emerald-600">21.6℃</div>
                    <div class="text-xs text-gray-400">(18-30℃)</div>
                  </div>
                </div>
                <div class="relative p-2 bg-gray-100 rounded-lg">
                  <div class="absolute top-2 left-2 w-8 h-8 rounded bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-none">
                    <el-icon :size="16" class="text-white"><DArrowLeft /></el-icon>
                  </div>
                  <div class="pl-10 text-center">
                    <div class="text-sm font-medium text-gray-900">湿度</div>
                    <div class="text-lg font-bold text-emerald-600">35%</div>
                    <div class="text-xs text-gray-400">(20-60%)</div>
                  </div>
                </div>
                <div class="relative p-2 bg-gray-100 rounded-lg">
                  <div class="absolute top-2 left-2 w-8 h-8 rounded bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-none">
                    <el-icon :size="16" class="text-white"><DataLine /></el-icon>
                  </div>
                  <div class="pl-10 text-center">
                    <div class="text-sm font-medium text-gray-900">EC值</div>
                    <div class="text-lg font-bold text-emerald-600">2.5</div>
                    <div class="text-xs text-gray-400">(0.2-1)</div>
                  </div>
                </div>
                <div class="relative p-2 bg-gray-100 rounded-lg">
                  <div class="absolute top-2 left-2 w-8 h-8 rounded bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center shadow-none">
                    <el-icon :size="16" class="text-white"><Aim /></el-icon>
                  </div>
                  <div class="pl-10 text-center">
                    <div class="text-sm font-medium text-gray-900">PH值</div>
                    <div class="text-lg font-bold text-emerald-600">6.5</div>
                    <div class="text-xs text-gray-400">(5.5-7.5)</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 区域内作物 -->
            <div>
              <h4 class="text-base font-semibold text-gray-900 mb-3">区域内作物</h4>
              <div v-if="cropInfo" class="grid grid-cols-4 gap-3">
                <div class="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <span class="text-sm text-gray-600">种植状态</span>
                  <span class="text-sm font-medium text-emerald-600">{{ cropInfo.stageName }}</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <span class="text-sm text-gray-600">作物名称</span>
                  <span class="text-sm font-medium text-blue-600">{{ cropInfo.cropName }}</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <span class="text-sm text-gray-600">品种</span>
                  <span class="text-sm font-medium text-blue-600">{{ cropInfo.variety }}</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <span class="text-sm text-gray-600">种植区域</span>
                  <span class="text-sm font-medium text-blue-600">{{ cropInfo.greenhouseName }}</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <span class="text-sm text-gray-600">当前阶段</span>
                  <span class="text-sm font-medium text-blue-600">{{ cropInfo.stageName }}</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <span class="text-sm text-gray-600">种植面积</span>
                  <span class="text-sm font-medium text-blue-600">{{ cropInfo.plantingArea }} ㎡</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <span class="text-sm text-gray-600">种植时间</span>
                  <span class="text-sm font-medium text-blue-600">{{ cropInfo.startDate }}</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <span class="text-sm text-gray-600">预计采收</span>
                  <span class="text-sm font-medium text-blue-600">{{ cropInfo.expectedHarvestDate }}</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <span class="text-sm text-gray-600">批次</span>
                  <span class="text-sm font-medium text-blue-600">{{ cropInfo.batchCode }}</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <span class="text-sm text-gray-600">负责人</span>
                  <span class="text-sm font-medium text-blue-600">{{ cropInfo.responsiblePerson }}</span>
                </div>
              </div>
              <div v-else class="p-4 bg-gray-100 rounded-lg text-center text-sm text-gray-500">
                该区域暂无进行中的作物
              </div>
            </div>

            <!-- 作物全景图 -->
            <div class="mt-6">
              <h4 class="text-base font-semibold text-gray-900 mb-3">作物全景图</h4>
              <div class="grid grid-cols-5 gap-3">
                <div v-for="i in 5" :key="i" class="aspect-video bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center">
                  <span class="text-sm text-gray-400">图片{{ i }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部区域 -->
          <div class="modal-footer">
            <el-button size="small" @click="$emit('close')">关闭</el-button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'
import { Sunny, DArrowLeft, MostlyCloudy, WindPower, DataLine, Aim, Close } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  selectedGreenhouse: { type: String, default: null },
  greenhouseEnvData: { type: Array, default: () => [] },
  getCropInfo: { type: Function, default: () => null }
})

defineEmits(['close', 'update:isOpen'])

const greenhouse = computed(() => {
  return props.greenhouseEnvData.find(g => g.id === props.selectedGreenhouse)
})

const cropInfo = computed(() => {
  if (!props.selectedGreenhouse) return null
  const info = props.getCropInfo(props.selectedGreenhouse)
  return info || null
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-container {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: linear-gradient(to right, #10b981, #059669, #10b981);
  color: white;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
}

.modal-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: transparent !important;
  border: none !important;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.15s;
}

.action-btn-close:hover {
  background: rgba(255, 255, 255, 0.2) !important;
}

.close-icon {
  width: 20px !important;
  height: 20px !important;
  color: white !important;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  background: white;
}

.modal-footer {
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

/* 过渡动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: scale(0.95);
  opacity: 0;
}
</style>
