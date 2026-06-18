<!--
  ScheduleShiftEditorModal.vue - 班次设置弹窗
  V1.1 ShiftEditor.tsx L52-181 1:1 对齐：颜色 8 色选择 + 编辑模式
  从 Schedule.vue 提取
-->
<template>
  <el-dialog :model-value="isOpen" @update:model-value="(v) => !v && emit('close')" title="班次设置" width="600px">
    <div class="space-y-4">
      <div
        v-for="config in shiftConfigs"
        :key="config.name"
        :class="['p-4 rounded-lg border-2 transition-all',
          editingShiftName === config.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-400']"
      >
        <template v-if="editingShiftName === config.name">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div :class="['w-4 h-4 rounded', tempShiftConfig.color]" />
                <span class="font-medium text-gray-800">{{ config.name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <el-button size="small" @click="emit('editCancel')">
                  <el-icon><Close /></el-icon>取消
                </el-button>
                <el-button size="small" type="primary" @click="emit('editSave')">
                  <el-icon><Check /></el-icon>保存
                </el-button>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">开始时间</label>
                <el-time-select :model-value="tempShiftConfig.startTime" @update:model-value="(v) => emit('updateTempConfig', { ...tempShiftConfig, startTime: v })" style="width: 100%" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">结束时间</label>
                <el-time-select :model-value="tempShiftConfig.endTime" @update:model-value="(v) => emit('updateTempConfig', { ...tempShiftConfig, endTime: v })" style="width: 100%" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-2">颜色</label>
              <div class="flex gap-2 flex-wrap">
                <div
                  v-for="color in shiftColors"
                  :key="color.name"
                  :class="['w-8 h-8 rounded-full cursor-pointer flex items-center justify-center',
                    tempShiftConfig.color === color.name ? 'ring-2 ring-offset-2 ring-gray-400' : '']"
                  :style="{ backgroundColor: color.value }"
                  @click="emit('updateTempConfig', { ...tempShiftConfig, color: color.name })"
                >
                  <el-icon v-if="tempShiftConfig.color === color.name" class="text-white"><Check /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div :class="['w-4 h-4 rounded', config.color]" />
              <div>
                <div class="font-medium text-gray-800">{{ config.name }}</div>
                <div class="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <el-icon><Clock /></el-icon>
                  {{ config.startTime }} - {{ config.endTime }}
                </div>
              </div>
            </div>
            <el-button size="small" type="primary" plain @click="emit('editStart', config)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
          </div>
        </template>
      </div>
    </div>
    <div class="mt-4 p-3 bg-gray-50 rounded-lg">
      <p class="text-sm text-gray-500">提示：班次设置将影响所有排班记录的颜色和时间显示。修改班次时间不会影响已执行的签到记录。</p>
    </div>
    <template #footer>
      <el-button @click="emit('close')">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { Close, Check, Edit, Clock } from '@element-plus/icons-vue'

defineProps({
  isOpen: { type: Boolean, default: false },
  shiftConfigs: { type: Array, default: () => [] },
  editingShiftName: { type: String, default: null },
  tempShiftConfig: { type: Object, default: () => ({ startTime: '', endTime: '', color: '' }) },
  shiftColors: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'editStart', 'editCancel', 'editSave', 'updateTempConfig'])
</script>
