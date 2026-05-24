<template>
  <!-- 施肥批量删除确认弹窗组件（纯div自定义弹窗） -->
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="handleClose">
      <div
        class="bg-white rounded-lg w-full max-w-md shadow-xl"
        @click.stop
      >
        <!-- 头部 — 绿色渐变 -->
        <div
          class="px-6 py-4 flex items-center justify-between rounded-t-lg"
          style="background: linear-gradient(to right, #10b981, #059669, #10b981);"
        >
          <h3 class="font-semibold flex items-center gap-2">
            <el-icon class="text-xl" style="color: white;"><Delete /></el-icon>
            <span style="color: white;">批量删除确认</span>
          </h3>
          <el-button link class="hover:bg-white/10" style="color: rgba(255,255,255,0.8);" @click="handleClose">
            <el-icon style="color: white; font-size: 20px;"><Close /></el-icon>
          </el-button>
        </div>

        <!-- 内容 -->
        <div class="p-6">
          <div class="space-y-4">
            <!-- 基本信息 -->
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <el-icon class="w-5 h-5 text-red-600"><Delete /></el-icon>
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-900">确认删除 {{ count }} 条施肥记录？</p>
                  <p class="text-xs text-gray-500">此操作不可恢复，请谨慎操作</p>
                </div>
              </div>
            </div>

            <!-- 统计信息 -->
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-blue-50 rounded-lg p-3 text-center">
                <div class="text-lg font-bold text-blue-700">{{ manualCount }}</div>
                <div class="text-xs text-blue-500">手动记录（可删除）</div>
              </div>
              <div :class="['rounded-lg p-3 text-center', hasIot ? 'bg-amber-50' : 'bg-green-50']">
                <div :class="['text-lg font-bold', hasIot ? 'text-amber-700' : 'text-green-700']">
                  {{ iotCount }}
                </div>
                <div :class="['text-xs', hasIot ? 'text-amber-500' : 'text-green-500']">
                  IoT记录（不可删除）
                </div>
              </div>
            </div>

            <!-- IoT 警告 -->
            <div v-if="hasIot" class="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <el-icon class="w-5 h-5 text-amber-500 shrink-0 mt-0.5"><Warning /></el-icon>
              <div class="text-sm text-amber-700">
                <p class="font-medium">检测到 {{ iotCount }} 条IoT自动记录</p>
                <p class="text-xs mt-1">IoT自动记录将被跳过，仅删除手动录入的记录。</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 按钮 -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 rounded-b-lg">
          <el-button size="small" @click="handleClose">取消</el-button>
          <el-button
            v-if="manualCount > 0"
            type="danger"
            size="small"
            @click="handleConfirm"
          >
            <el-icon class="mr-1"><Delete /></el-icon>
            确认删除 ({{ manualCount }}条)
          </el-button>
          <el-button
            v-else
            type="info"
            size="small"
            disabled
            class="opacity-50 cursor-not-allowed"
          >
            无可删除记录
          </el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { Delete, Close, Warning } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: Boolean,
  count: {
    type: Number,
    default: 0
  },
  selectedItems: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'confirm'])

// 统计 IoT 记录
const iotCount = computed(() => {
  return props.selectedItems.filter(it => it.dataSource === 'auto_iot').length
})

const manualCount = computed(() => {
  return props.selectedItems.filter(it => it.dataSource === 'manual').length
})

const hasIot = computed(() => iotCount.value > 0)

// 关闭
const handleClose = () => {
  emit('close')
}

// 确认
const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped>
/* V1.1样式保持 */
</style>
