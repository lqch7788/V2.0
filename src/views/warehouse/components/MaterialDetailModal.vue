<template>
  <!-- 物料详情弹窗 - 对应V1.1 MaterialDetailModal.tsx -->
  <el-dialog
    v-model="dialogVisible"
    title="物料详情查看"
    width="900px"
    :close-on-click-modal="true"
  >
    <div v-if="material">
      <!-- 基本信息标题 -->
      <h4 class="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <el-icon :size="20" class="text-emerald-600"><Goods /></el-icon>
        基本信息
      </h4>

      <!-- 条形码展示区 -->
      <div class="bg-emerald-50 rounded-lg p-4 mb-4 border border-emerald-200">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-xs text-emerald-600 block font-medium">条形码</span>
            <span class="text-2xl font-mono font-bold text-emerald-700">{{ material.barcode }}</span>
          </div>
          <el-icon :size="48" class="text-emerald-600"><Collection /></el-icon>
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
          <el-tag
            :type="material.dataStatus === '启用' ? 'success' : 'danger'"
            size="small"
          >
            {{ material.dataStatus }}
          </el-tag>
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

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { Goods, Collection } from '@element-plus/icons-vue'

/**
 * 物料详情弹窗组件
 * 展示物料的完整信息
 */

const props = defineProps({
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

const emit = defineEmits(['close'])

const dialogVisible = computed({
  get: () => props.isOpen,
  set: (val) => {
    if (!val) emit('close')
  }
})

const handleClose = () => {
  emit('close')
}
</script>
