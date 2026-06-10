<template>
  <!-- 新增农事操作记录弹窗 -->
  <el-dialog :model-value="isOpen" @update:model-value="$emit('close')" title="新增农事操作记录" width="490px" top="5vh">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="text-gray-700 text-sm block mb-1">操作类型 <span class="text-red-500">*</span></label>
        <el-select v-model="form.operationType" class="w-full" placeholder="请选择">
          <el-option v-for="t in operationTypes" :key="t.value" :value="t.value" :label="t.label" />
        </el-select>
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">作物品种</label>
        <el-input v-model="form.cropName" placeholder="请输入作物品种" />
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">温室区域</label>
        <el-select v-model="form.greenhouseId" @update:model-value="handleGreenhouseChange" class="w-full" placeholder="请选择">
          <el-option v-for="g in greenhouses" :key="g.id" :value="g.id" :label="g.name" />
        </el-select>
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">操作日期 <span class="text-red-500">*</span></label>
        <el-date-picker v-model="form.operationDate" type="date" class="w-full" />
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">操作员</label>
        <el-input v-model="form.operatorName" placeholder="请输入操作员" />
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">工时(小时)</label>
        <el-input-number v-model="form.workHours" :min="0" :precision="1" class="w-full" controls-position="right" />
      </div>
      <div class="col-span-2">
        <label class="text-gray-700 text-sm block mb-1">操作内容 <span class="text-red-500">*</span></label>
        <el-input v-model="form.content" type="textarea" :rows="3" placeholder="请描述操作内容" />
      </div>
      <div class="col-span-2">
        <label class="text-gray-700 text-sm block mb-1">备注</label>
        <el-input v-model="form.remarks" type="textarea" :rows="2" placeholder="请输入备注" />
      </div>
    </div>
    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" @click="$emit('submit', { ...form })">确认创建</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  operationTypes: { type: Array, default: () => [] },
  greenhouses: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'submit'])

const getDefaultForm = () => ({
  operationType: '',
  cropName: '',
  greenhouseId: '',
  greenhouseName: '',
  operationDate: new Date().toISOString().split('T')[0],
  operatorName: '',
  workHours: 0,
  content: '',
  remarks: '',
})

const form = reactive(getDefaultForm())

watch(() => props.isOpen, (open) => {
  if (open) Object.assign(form, getDefaultForm())
})

const handleGreenhouseChange = (id) => {
  form.greenhouseId = id
  const gh = props.greenhouses.find(g => g.id === id)
  if (gh) form.greenhouseName = gh.name
}
</script>
