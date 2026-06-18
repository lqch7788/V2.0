<!--
  ScheduleBatchEditModal.vue - 批量编辑弹窗
  V1.1 ScheduleBatchEditModal.tsx 1:1 对齐：逐条编辑 + 已编辑标记 + 确认下一个
  从 Schedule.vue 提取
-->
<template>
  <el-dialog :model-value="isOpen" @update:model-value="(v) => !v && emit('close')" title="批量编辑排班记录" width="800px">
    <div class="bg-blue-50 rounded-lg p-3 mb-3">
      <p class="text-sm text-blue-800">
        已选择 <strong>{{ selectedRows.length }}</strong> 条排班记录进行批量编辑，
        已编辑 <strong>{{ editedRecordIds.length }}</strong> 条
      </p>
    </div>

    <!-- 记录选择器（V1.1 L66-84） -->
    <div class="mb-3">
      <label class="block text-xs font-medium text-gray-600 mb-1">选择排班记录</label>
      <el-select
        :model-value="selectedRecordId"
        @update:model-value="(v) => emit('update:selectedRecordId', v)"
        placeholder="请选择记录"
        style="width: 100%"
        size="small"
      >
        <el-option v-for="id in selectedRows" :key="id" :value="id">
          <template #default>
            <span>
              {{ getScheduleById(id)?.date }} - {{ getScheduleById(id)?.staffName }} - {{ getScheduleById(id)?.shift }}
              <span v-if="editedRecordIds.includes(id)" class="ml-2 text-green-600 text-xs">✅ 已编辑</span>
            </span>
          </template>
        </el-option>
      </el-select>
    </div>

    <!-- 当前记录字段（V1.1 L87-159：4×2 grid） -->
    <div v-if="selectedRecordId && getScheduleById(selectedRecordId)" class="grid grid-cols-4 gap-3">
      <div class="bg-gray-100 rounded-lg p-2">
        <div class="text-xs text-gray-500 mb-1">日期</div>
        <div class="text-sm font-medium text-gray-900">{{ getScheduleById(selectedRecordId).date }}</div>
      </div>
      <div class="bg-gray-100 rounded-lg p-2">
        <div class="text-xs text-gray-500 mb-1">员工</div>
        <div class="text-sm font-medium text-gray-900">{{ getScheduleById(selectedRecordId).staffName }}</div>
      </div>
      <div class="bg-gray-50 rounded-lg p-2">
        <div class="text-xs text-gray-500 mb-1">班次</div>
        <el-select
          :model-value="batchEditForms[selectedRecordId]?.shift || getScheduleById(selectedRecordId).shift"
          @update:model-value="(v) => emit('fieldChange', 'shift', v)"
          size="small"
          style="width: 100%"
        >
          <el-option v-for="c in shiftConfigs" :key="c.name" :label="`${c.name} (${c.startTime}-${c.endTime})`" :value="c.name" />
        </el-select>
      </div>
      <div class="bg-gray-50 rounded-lg p-2">
        <div class="text-xs text-gray-500 mb-1">工作区域</div>
        <el-input
          :model-value="batchEditForms[selectedRecordId]?.workZone || getScheduleById(selectedRecordId).workZone"
          @update:model-value="(v) => emit('fieldChange', 'workZone', v)"
          size="small"
          placeholder="工作区域"
        />
      </div>
      <div class="bg-gray-50 rounded-lg p-2">
        <div class="text-xs text-gray-500 mb-1">状态</div>
        <el-select
          :model-value="batchEditForms[selectedRecordId]?.status || getScheduleById(selectedRecordId).status"
          @update:model-value="(v) => emit('fieldChange', 'status', v)"
          size="small"
          style="width: 100%"
        >
          <el-option label="已排班" value="已排班" />
          <el-option label="已执行" value="已执行" />
          <el-option label="已取消" value="已取消" />
        </el-select>
      </div>
      <div class="bg-gray-50 rounded-lg p-2">
        <div class="text-xs text-gray-500 mb-1">签到时间</div>
        <el-time-picker
          :model-value="batchEditForms[selectedRecordId]?.checkIn || getScheduleById(selectedRecordId).checkIn"
          @update:model-value="(v) => emit('fieldChange', 'checkIn', v)"
          size="small"
          format="HH:mm"
          value-format="HH:mm"
          placeholder="签到"
          style="width: 100%"
        />
      </div>
      <div class="bg-gray-50 rounded-lg p-2">
        <div class="text-xs text-gray-500 mb-1">签退时间</div>
        <el-time-picker
          :model-value="batchEditForms[selectedRecordId]?.checkOut || getScheduleById(selectedRecordId).checkOut"
          @update:model-value="(v) => emit('fieldChange', 'checkOut', v)"
          size="small"
          format="HH:mm"
          value-format="HH:mm"
          placeholder="签退"
          style="width: 100%"
        />
      </div>
    </div>
    <p v-else class="text-center text-gray-500 py-8">请从上方下拉选择一条记录开始编辑</p>

    <template #footer>
      <el-button @click="emit('close')">取消</el-button>
      <el-button @click="emit('confirmNext')" type="success">
        <el-icon><Check /></el-icon>确认（下一个）
      </el-button>
      <el-button type="primary" @click="emit('confirmAll')">
        <el-icon><Edit /></el-icon>保存全部修改
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { Check, Edit } from '@element-plus/icons-vue'

defineProps({
  isOpen: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  editedRecordIds: { type: Array, default: () => [] },
  selectedRecordId: { type: String, default: '' },
  batchEditForms: { type: Object, default: () => ({}) },
  shiftConfigs: { type: Array, default: () => [] },
  getScheduleById: { type: Function, required: true },
})

const emit = defineEmits([
  'close', 'confirmNext', 'confirmAll', 'fieldChange',
  'update:selectedRecordId',
])
</script>
