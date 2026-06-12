<template>
  <!-- 物料详情弹窗 - 对应V1.1 MaterialDetailModal.tsx -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="$emit('close')">
    <div class="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl" @click.stop>
      <!-- 弹窗头部 -->
      <div class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white flex items-center justify-between">
        <h3 class="text-lg font-semibold">物料详情查看</h3>
        <button @click="$emit('close')" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
      </div>

      <!-- 弹窗内容 -->
      <div class="p-6 overflow-y-auto max-h-[70vh]">
        <div v-if="material">
          <!-- 基本信息标题 -->
          <h4 class="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Package class="w-5 h-5 text-emerald-600" />
            基本信息
          </h4>

          <!-- 条形码展示区 -->
          <div class="bg-emerald-50 rounded-lg p-4 mb-4 border border-emerald-200">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-xs text-emerald-600 block font-medium">条形码</span>
                <span class="text-2xl font-mono font-bold text-emerald-700">{{ material.barcode }}</span>
              </div>
              <PackageOpen class="w-12 h-12 text-emerald-600" />
            </div>
          </div>

          <!-- 基本信息网格 -->
          <div class="bg-gray-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span class="text-xs text-gray-500 block">物料编码</span>
              <span class="text-sm font-medium text-gray-900">{{ material.code }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">物料名称</span>
              <span class="text-sm font-medium text-gray-900">{{ material.name }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">物料分类</span>
              <span class="text-sm font-medium text-gray-900">{{ material.category }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">规格型号</span>
              <span class="text-sm font-medium text-gray-900">{{ material.specification }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">单位</span>
              <span class="text-sm font-medium text-gray-900">{{ material.unit }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">当前库存</span>
              <span class="text-sm font-medium text-gray-900">{{ material.quantity }} {{ material.unit }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">最低库存</span>
              <span class="text-sm font-medium text-gray-900">{{ material.minStock }} {{ material.unit }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">最高库存</span>
              <span class="text-sm font-medium text-gray-900">{{ material.maxStock }} {{ material.unit }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">单价</span>
              <span class="text-sm font-medium text-gray-900">{{ material.price }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">供应商</span>
              <span class="text-sm font-medium text-gray-900">{{ material.supplier }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">存放位置</span>
              <span class="text-sm font-medium text-gray-900">{{ material.location }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">批次号</span>
              <span class="text-sm font-medium text-gray-900">{{ material.batchNo }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">生产日期</span>
              <span class="text-sm font-medium text-gray-900">{{ material.productionDate }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">有效期至</span>
              <span class="text-sm font-medium text-gray-900">{{ material.expiryDate }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">最后更新时间</span>
              <span class="text-sm font-medium text-gray-900">{{ material.lastUpdateTime }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">数据状态</span>
              <span
                class="inline-flex px-2 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-green-100 text-green-700': material.dataStatus === '启用',
                  'bg-red-100 text-red-700': material.dataStatus !== '启用'
                }"
              >
                {{ material.dataStatus }}
              </span>
            </div>
          </div>

          <!-- 库存预警提示 -->
          <div v-if="material.quantity < material.minStock" class="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <div class="flex items-center gap-2">
              <span class="text-red-600 text-sm font-medium">⚠️ 库存预警</span>
            </div>
            <p class="text-red-600 text-sm mt-1">
              当前库存 ({{ material.quantity }}) 低于最低库存警戒线 ({{ material.minStock }} {{ material.unit }}），请及时补充。
            </p>
          </div>
        </div>
      </div>

      <!-- 弹窗底部 -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
        <button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="$emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Package, PackageOpen } from 'lucide-vue-next'

/**
 * 物料详情弹窗组件
 * 展示物料的完整信息
 */

defineProps({
  // 物料数据
  material: {
    type: Object,
    default: null
  },
  // 是否显示
  isOpen: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close'])
</script>
