<template>
  <!-- 批量编辑巡查记录弹窗 - 从V1.1 BatchEditModal.tsx 1:1迁移 -->
  <el-dialog :model-value="isOpen" @update:model-value="$emit('close')" title="批量编辑巡查记录" width="560px" top="5vh">
    <div class="space-y-4">
      <div class="bg-blue-50 rounded-lg p-3">
        <p class="text-sm text-blue-800">已选择 <strong>{{ selectedRows.length }}</strong> 条记录进行批量编辑</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-gray-700 text-sm block mb-1">巡查类型</label>
          <el-select v-model="editData.inspectionType" class="w-full" placeholder="保持原值" clearable>
            <el-option value="farm" label="种植区域巡查" />
            <el-option value="equipment" label="设备保养巡查" />
            <el-option value="infrastructure" label="基础设施巡检" />
            <el-option value="other" label="其他" />
          </el-select>
        </div>

        <div>
          <label class="text-gray-700 text-sm block mb-1">巡查状态</label>
          <el-select v-model="editData.status" class="w-full" placeholder="保持原值" clearable>
            <el-option value="normal" label="正常" />
            <el-option value="attention" label="需关注" />
            <el-option value="critical" label="异常" />
          </el-select>
        </div>

        <div>
          <label class="text-gray-700 text-sm block mb-1">作物名称</label>
          <el-input v-model="editData.cropName" placeholder="保持原值" />
        </div>

        <div>
          <label class="text-gray-700 text-sm block mb-1">巡查人员</label>
          <el-select v-model="editData.inspectorId" class="w-full" placeholder="保持原值" clearable>
            <el-option v-for="u in users" :key="u.id" :value="u.id" :label="u.name" />
          </el-select>
        </div>

        <div>
          <label class="text-gray-700 text-sm block mb-1">巡查日期</label>
          <el-date-picker v-model="editData.checkDate" type="date" class="w-full" placeholder="保持原值" />
        </div>

        <div>
          <label class="text-gray-700 text-sm block mb-1">天气</label>
          <el-select v-model="editData.weather" class="w-full" placeholder="保持原值" clearable>
            <el-option v-for="w in weatherOptions" :key="w" :value="w" :label="w" />
          </el-select>
        </div>

        <div class="col-span-2">
          <label class="text-gray-700 text-sm block mb-1">备注</label>
          <el-input v-model="editData.remarks" type="textarea" :rows="2" placeholder="保持原值" />
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" @click="$emit('confirm')">确认修改</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { WEATHER_OPTIONS } from '@/types/farm/common'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  users: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'confirm'])

const editData = reactive({})

const weatherOptions = (WEATHER_OPTIONS || []).map(w => typeof w === 'object' ? w.label : w)

watch(() => props.isOpen, (open) => {
  if (open) {
    Object.keys(editData).forEach(k => delete editData[k])
  }
})
</script>
