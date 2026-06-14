<template>
  <!--
    物料详情查看弹窗 - 严格 1:1 对齐 V1.1 MaterialDetailModal.tsx
    V1.1: <UnifiedModal title="物料详情查看" size="xl" (900x600)>
    V1.1 未传 showFooter → UnifiedModal 默认 showFooter=true，无自定义 footer slot → 渲染默认取消按钮
    V2.0 语义对齐: :show-submit="false"(无保存),:show-cancel="true"(关闭按钮),cancel-text="关闭"
  -->
  <ElModal
    :model-value="isOpen"
    title="物料详情查看"
    :width="900"
    :height="600"
    :show-submit="false"
    :show-cancel="true"
    cancel-text="关闭"
    @update:model-value="(v) => { if (!v) handleClose() }"
    @close="handleClose"
  >
    <div v-if="material" class="space-y-0">
      <!-- 1. 基本信息标题 - 对应V1.1: Package 5×5 emerald-600 -->
      <h4 class="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Package class="w-5 h-5 text-emerald-600" />
        基本信息
      </h4>

      <!-- 2. 条形码块 - 对应V1.1: bg-emerald-50/200,Barcode 12×12 emerald-600 -->
      <div class="bg-emerald-50 rounded-lg p-4 mb-4 border border-emerald-200">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-xs text-emerald-600 block font-medium">条形码</span>
            <span class="text-2xl font-mono font-bold text-emerald-700">{{ material.barcode }}</span>
          </div>
          <Barcode class="w-12 h-12 text-emerald-600" />
        </div>
      </div>

      <!-- 3. 基本信息网格 - 对应V1.1: bg-gray-50 + 4列,16 个字段 -->
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
            :class="material.dataStatus === '启用' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
          >{{ material.dataStatus }}</span>
        </div>
      </div>

      <!-- 4. 库存预警 - 对应V1.1: quantity < minStock 时显示红色块 -->
      <div v-if="material.quantity < material.minStock" class="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
        <div class="flex items-center gap-2">
          <span class="text-red-600 text-sm font-medium">⚠️ 库存预警</span>
        </div>
        <p class="text-red-600 text-sm mt-1">
          当前库存 ({{ material.quantity }}) 低于最低库存警戒线 ({{ material.minStock }})，请及时补充。
        </p>
      </div>
    </div>
  </ElModal>
</template>

<script setup>
/**
 * 物料详情查看弹窗 - 严格 1:1 对齐 V1.1 MaterialDetailModal.tsx
 * - 容器: ElModal size=xl (900×600)
 * - header: Package 5×5 emerald-600
 * - 条形码块: emerald-50/200,Barcode 12×12
 * - 信息网格: 4列 16 字段(编码/名称/分类/规格/单位/当前库存/最低/最高/单价/供应商/位置/批次/生产/有效/最后更新/数据状态)
 * - 库存预警: quantity < minStock 红色块
 * - footer: 仅"关闭"按钮(对应 V1.1 UnifiedModal 默认 showFooter=true 的取消按钮)
 */
import { Package, Barcode } from 'lucide-vue-next'
import { ElModal } from '@/components/ui'

const props = defineProps({
  // V1.1: material: Material | null
  material: {
    type: Object,
    default: null
  },
  // V1.1: isOpen: boolean
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

// V1.1: onClose
const handleClose = () => {
  emit('close')
}
</script>
