<template>
  <!-- 批量编辑风险提示弹窗 - 对应V1.1 BatchEditWarningModal.tsx -->
  <el-dialog
    v-model="dialogVisible"
    title="批量编辑风险提示"
    width="500px"
    :close-on-click-modal="true"
  >
    <div class="space-y-4">
      <!-- 警告图标和标题 -->
      <div class="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div class="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
          <el-icon :size="20" class="text-amber-600"><Warning /></el-icon>
        </div>
        <div class="flex-1">
          <h4 class="text-amber-800 font-semibold text-base mb-1">批量编辑操作风险提醒</h4>
          <p class="text-amber-700 text-sm">您已选择 <span class="font-bold">{{ selectedCount }}</span> 个物料进行批量编辑</p>
        </div>
      </div>

      <!-- 风险说明列表 -->
      <div class="space-y-3 px-1">
        <div class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span class="text-red-600 text-xs font-bold">1</span>
          </div>
          <div>
            <p class="text-gray-700 text-sm font-medium">历史记录无法正常显示</p>
            <p class="text-gray-500 text-xs mt-0.5">批量编辑会修改物料的核心信息，可能导致系统中已保存的出入库记录、工单明细等历史数据与物料信息不匹配</p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span class="text-red-600 text-xs font-bold">2</span>
          </div>
          <div>
            <p class="text-gray-700 text-sm font-medium">统计报表数据不准确</p>
            <p class="text-gray-500 text-xs mt-0.5">修改后的物料信息可能导致库存统计、成本核算、采购分析等报表数据出现偏差，需重新核对</p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span class="text-red-600 text-xs font-bold">3</span>
          </div>
          <div>
            <p class="text-gray-700 text-sm font-medium">关联业务可能受影响</p>
            <p class="text-gray-500 text-xs mt-0.5">生产工单、采购计划、供应商对账等关联业务可能因物料信息变更而需要同步调整</p>
          </div>
        </div>
      </div>

      <!-- 建议 -->
      <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p class="text-blue-700 text-xs">
          <span class="font-semibold">建议：</span>如非必要，请使用单个编辑功能。如确需批量编辑，编辑完成后请检查相关统计报表和业务单据。
        </p>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="flex gap-3">
        <el-button class="flex-1" @click="handleClose">取消</el-button>
        <el-button class="flex-1" type="warning" @click="handleConfirm">已知晓</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { Warning } from '@element-plus/icons-vue'

/**
 * 批量编辑风险提示弹窗组件
 * 显示批量编辑的风险提示信息
 */

const props = defineProps({
  // 是否显示
  isOpen: {
    type: Boolean,
    default: false
  },
  // 已选择的数量
  selectedCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close', 'confirm'])

const dialogVisible = computed({
  get: () => props.isOpen,
  set: (val) => {
    if (!val) emit('close')
  }
})

const handleClose = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>
