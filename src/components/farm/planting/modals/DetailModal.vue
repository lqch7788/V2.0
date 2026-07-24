<template>
  <!-- 种植详情弹窗 - 与V1.1 DetailModal.tsx完全一致 -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" @click.self="onClose">
    <div class="bg-white rounded-xl w-full max-w-4xl shadow-xl max-h-[90vh] flex flex-col">
      <!-- 标题栏 - 渐变背景 -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-t-xl">
        <h3 class="text-lg font-semibold text-white flex items-center gap-2">
          <el-icon style="color: white;"><View /></el-icon>
          种植详情
        </h3>
        <el-icon style="color: white; cursor: pointer;" @click="onClose"><Close /></el-icon>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- 基本信息 -->
        <div class="mb-6">
          <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">基本信息</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center">
              <span class="text-sm text-gray-500 w-24">种植批号：</span>
              <span class="text-sm font-mono text-blue-600">{{ record?.plantCode }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 w-24">作物品种：</span>
              <span class="text-sm text-gray-900">{{ record?.cropName }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 w-24">品种：</span>
              <span class="text-sm text-gray-900">{{ record?.cropVariety }}</span>
            </div>
            <!-- 2026-07-24: 品种路径 4段式（对齐 V1.1 DetailModal） -->
            <div class="col-span-2 flex items-start" v-if="record?.categoryName || record?.typeName || record?.varietyName || record?.subVarietyName">
              <span class="text-sm text-gray-500 w-24 flex-shrink-0">品种路径：</span>
              <span class="text-sm text-gray-900">
                <span class="text-gray-400">{{ record?.categoryName || '-' }}</span>
                <span class="text-gray-300 mx-1">-</span>
                <span class="text-gray-700">{{ record?.typeName || '-' }}</span>
                <span class="text-gray-300 mx-1">-</span>
                <span class="text-gray-700">{{ record?.varietyName || '-' }}</span>
                <span class="text-gray-300 mx-1">-</span>
                <span class="text-gray-900 font-medium">{{ record?.subVarietyName || '-' }}</span>
              </span>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 w-24">来源类型：</span>
              <span class="text-sm text-gray-900">{{ record?.sourceType === 'seed' ? '种子' : '种苗' }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 w-24">关联批号：</span>
              <span class="text-sm text-gray-900">{{ record?.sourceCode || '-' }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 w-24">关联生产计划：</span>
              <span class="text-sm text-gray-900">{{ record?.productionPlanCode || '-' }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 w-24">区域：</span>
              <span class="text-sm text-gray-900">{{ record?.areaName }}</span>
            </div>
          </div>
        </div>

        <!-- 种植信息 -->
        <div class="mb-6">
          <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">种植信息</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center">
              <span class="text-sm text-gray-500 w-24">种植日期：</span>
              <span class="text-sm text-gray-900">{{ record?.plantingDate }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 w-24">种植数量：</span>
              <span class="text-sm text-emerald-600 font-medium">{{ record?.plantingCount?.toLocaleString() }} {{ record?.unit || '株' }}</span>
            </div>
            <!-- 2026-07-24: 新增已定植/损耗/补苗/目标产量 -->
            <div class="flex items-center" v-if="record?.transplantCount">
              <span class="text-sm text-gray-500 w-24">已定植数量：</span>
              <span class="text-sm text-blue-600">{{ record?.transplantCount?.toLocaleString() }}</span>
            </div>
            <div class="flex items-center" v-if="record?.transplantDate">
              <span class="text-sm text-gray-500 w-24">已定植日期：</span>
              <span class="text-sm text-gray-900">{{ record?.transplantDate }}</span>
            </div>
            <div class="flex items-center" v-if="record?.lossCount !== undefined">
              <span class="text-sm text-gray-500 w-24">损耗数量：</span>
              <span class="text-sm text-red-600">{{ record?.lossCount?.toLocaleString() || 0 }}</span>
            </div>
            <div class="flex items-center" v-if="record?.supplementCount !== undefined">
              <span class="text-sm text-gray-500 w-24">补苗数量：</span>
              <span class="text-sm text-emerald-600">{{ record?.supplementCount?.toLocaleString() || 0 }}</span>
            </div>
            <div class="flex items-center" v-if="record?.targetYield">
              <span class="text-sm text-gray-500 w-24">目标产量：</span>
              <span class="text-sm text-gray-900">{{ record?.targetYield?.toLocaleString() }} {{ record?.targetYieldUnit || '克' }}</span>
            </div>
            <div class="flex items-center" v-if="record?.soilPH">
              <span class="text-sm text-gray-500 w-24">土壤PH值：</span>
              <span class="text-sm text-gray-900">{{ record?.soilPH }}</span>
            </div>
            <div class="flex items-center" v-if="record?.soilEC">
              <span class="text-sm text-gray-500 w-24">土壤EC值：</span>
              <span class="text-sm text-gray-900">{{ record?.soilEC }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 w-24">损耗率：</span>
              <span class="text-sm text-red-600">{{ record?.attritionRate }}%</span>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 w-24">状态：</span>
              <span :class="['px-2 py-1 rounded text-xs font-medium', statusClass]">
                {{ statusLabel }}
              </span>
            </div>
          </div>
        </div>

        <!-- 2026-07-24: 育种信息 -->
        <div class="mb-6" v-if="record?.isBreeding">
          <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">育种信息</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center" v-if="record?.parentMaleCode">
              <span class="text-sm text-gray-500 w-24">父本批号：</span>
              <span class="text-sm font-mono text-blue-600">{{ record?.parentMaleCode }}</span>
            </div>
            <div class="flex items-center" v-if="record?.parentFemaleCode">
              <span class="text-sm text-gray-500 w-24">母本批号：</span>
              <span class="text-sm font-mono text-pink-600">{{ record?.parentFemaleCode }}</span>
            </div>
            <div class="flex items-center" v-if="record?.generation">
              <span class="text-sm text-gray-500 w-24">世代：</span>
              <span class="text-sm text-gray-900">{{ record?.generation }}</span>
            </div>
            <div class="flex items-center" v-if="record?.breedingMethod">
              <span class="text-sm text-gray-500 w-24">育种方法：</span>
              <span class="text-sm text-gray-900">{{ record?.breedingMethod }}</span>
            </div>
            <div class="flex items-center" v-if="record?.breedingLocation">
              <span class="text-sm text-gray-500 w-24">育种位置：</span>
              <span class="text-sm text-gray-900">{{ record?.breedingLocation }}</span>
            </div>
            <div class="flex items-center" v-if="record?.targetTraits">
              <span class="text-sm text-gray-500 w-24">目标性状：</span>
              <span class="text-sm text-gray-900">{{ record?.targetTraits }}</span>
            </div>
          </div>
        </div>

        <!-- 2026-07-24: 留种信息 -->
        <div class="mb-6" v-if="record?.isSeedSaving">
          <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">留种信息</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2 flex items-center">
              <span class="text-sm text-gray-500 w-24">种子植株标识：</span>
              <span class="text-sm text-gray-900">{{ record?.seedPlantMarker }}</span>
            </div>
          </div>
        </div>

        <!-- 采收信息 -->
        <div class="mb-6">
          <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">采收信息</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center">
              <span class="text-sm text-gray-500 w-24">是否采收：</span>
              <span :class="['px-2 py-1 rounded text-xs font-medium', record?.isHarvest ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50']">
                {{ record?.isHarvest ? '已采收' : '未采收' }}
              </span>
            </div>
            <div class="flex items-center" v-if="record?.harvestDate">
              <span class="text-sm text-gray-500 w-24">采收日期：</span>
              <span class="text-sm text-gray-900">{{ record?.harvestDate }}</span>
            </div>
            <div class="flex items-center" v-if="record?.harvestQuantity">
              <span class="text-sm text-gray-500 w-24">采收数量：</span>
              <span class="text-sm text-blue-600 font-medium">{{ record?.harvestQuantity?.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- 其他信息 -->
        <div class="mb-6">
          <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">其他信息</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center">
              <span class="text-sm text-gray-500 w-24">溯源码：</span>
              <span class="text-sm font-mono text-gray-900">{{ record?.traceabilityCode || '-' }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 w-24">创建人：</span>
              <span class="text-sm text-gray-900">{{ record?.createBy }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 w-24">创建时间：</span>
              <span class="text-sm text-gray-900">{{ record?.createTime }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 w-24">打印次数：</span>
              <span class="text-sm text-gray-900">{{ record?.printCount || 0 }} 次</span>
            </div>
            <div class="col-span-2 flex items-start" v-if="record?.remarks">
              <span class="text-sm text-gray-500 w-24 flex-shrink-0">备注：</span>
              <span class="text-sm text-gray-900">{{ record?.remarks }}</span>
            </div>
          </div>
        </div>

        <!-- 图片信息 - V1.1新增 -->
        <div v-if="images.length > 0">
          <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">图片信息</h4>
          <div class="grid grid-cols-4 gap-3">
            <div
              v-for="(img, index) in images"
              :key="index"
              class="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 border border-gray-200"
              @click="openImageViewer(index)"
            >
              <el-image
                :src="img"
                :preview-src-list="images"
                fit="cover"
                class="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="p-4 border-t border-gray-200 flex justify-end gap-3">
        <el-button @click="onClose">关闭</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { View, Close } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: Boolean,
  record: Object
})

const emit = defineEmits(['close'])

const statusMap = {
  planted: { label: '已定植', class: 'text-blue-600 bg-blue-50' },
  growing: { label: '生长期', class: 'text-amber-600 bg-amber-50' },
  harvested: { label: '已采收', class: 'text-green-600 bg-green-50' },
  cancelled: { label: '已取消', class: 'text-gray-600 bg-gray-50' }
}

const statusLabel = computed(() => statusMap[props.record?.status]?.label || props.record?.status)
const statusClass = computed(() => statusMap[props.record?.status]?.class || 'text-gray-600 bg-gray-50')

// 图片处理 - V1.1逻辑
const images = computed(() => {
  if (!props.record) return []
  if (Array.isArray(props.record.pictures)) return props.record.pictures
  if (typeof props.record.pictures === 'string') {
    try {
      return JSON.parse(props.record.pictures)
    } catch {
      return []
    }
  }
  return []
})

const openImageViewer = (_index) => {
  // 使用el-image的preview功能实现放大
}

const onClose = () => {
  emit('close')
}
</script>
