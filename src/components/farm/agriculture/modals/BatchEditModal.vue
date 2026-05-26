<template>
  <!-- 批量编辑农事记录弹窗 -->
  <el-dialog :model-value="isOpen" @update:model-value="$emit('close')" title="批量编辑农事记录" width="600px" top="5vh">
    <div class="space-y-4">
      <div class="bg-blue-50 rounded-lg p-3">
        <p class="text-sm text-blue-800">已选择 <strong>{{ selectedCount }}</strong> 条记录进行批量编辑</p>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-gray-700 text-sm block mb-1">操作类型</label>
          <el-select v-model="form.operationType" class="w-full" placeholder="保持原值" clearable>
            <el-option v-for="t in operationTypes" :key="t.value" :value="t.value" :label="t.label" />
          </el-select>
        </div>
        <div>
          <label class="text-gray-700 text-sm block mb-1">温室区域</label>
          <el-select v-model="form.greenhouseId" @update:model-value="handleGreenhouseChange" class="w-full" placeholder="保持原值" clearable>
            <el-option v-for="g in greenhouses" :key="g.id" :value="g.id" :label="g.name" />
          </el-select>
        </div>
        <div>
          <label class="text-gray-700 text-sm block mb-1">操作员</label>
          <el-input v-model="form.operatorName" placeholder="保持原值" />
        </div>
        <div>
          <label class="text-gray-700 text-sm block mb-1">操作日期</label>
          <el-date-picker v-model="form.operationDate" type="date" class="w-full" placeholder="保持原值" />
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" @click="$emit('confirm', { ...form })">确认修改</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  selectedCount: { type: Number, default: 0 },
  operationTypes: { type: Array, default: () => [] },
  greenhouses: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'confirm'])

const form = reactive({})

watch(() => props.isOpen, (open) => {
  if (open) Object.keys(form).forEach(k => delete form[k])
})

const handleGreenhouseChange = (id) => {
  form.greenhouseId = id
  const gh = props.greenhouses.find(g => g.id === id)
  if (gh) form.greenhouseName = gh.name
}
</script>
