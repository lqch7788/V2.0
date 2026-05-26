<template>
  <!-- 新增施肥记录弹窗 - 从V1.1 FertilizerAddModal.tsx 1:1迁移 -->
  <el-dialog :model-value="isOpen" @update:model-value="$emit('close')" title="新增施肥记录" width="700px" top="5vh">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="text-gray-700 text-sm block mb-1">施肥编号 <span class="text-red-500">*</span></label>
        <el-input :model-value="form.fertilizerCode" @update:model-value="update('fertilizerCode', $event)" readonly disabled class="font-mono" />
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">肥料名称 <span class="text-red-500">*</span></label>
        <el-input :model-value="form.fertilizerName" @update:model-value="update('fertilizerName', $event)" placeholder="请输入肥料名称" />
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">肥料类型</label>
        <el-select :model-value="form.fertilizerType" @update:model-value="update('fertilizerType', $event)" class="w-full" placeholder="请选择">
          <el-option v-for="t in fertilizerTypes" :key="t.value" :value="t.value" :label="t.label" />
        </el-select>
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">稀释比例</label>
        <el-input :model-value="form.dilutionRatio" @update:model-value="update('dilutionRatio', $event)" placeholder="如 1:500" />
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">施肥量(kg) <span class="text-red-500">*</span></label>
        <el-input-number :model-value="form.quantity" @update:model-value="update('quantity', $event)" :min="0" :precision="2" class="w-full" controls-position="right" />
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">单价(元/kg)</label>
        <el-input-number :model-value="form.unitPrice" @update:model-value="update('unitPrice', $event)" :min="0" :precision="2" class="w-full" controls-position="right" />
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">总成本(元)</label>
        <el-input-number :model-value="totalCost" readonly disabled class="w-full" controls-position="right" />
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">作物品种</label>
        <el-input :model-value="form.cropName" @update:model-value="update('cropName', $event)" placeholder="请输入作物品种" />
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">温室位置</label>
        <el-select :model-value="form.greenhouseId" @update:model-value="handleGreenhouseChange" class="w-full" placeholder="请选择">
          <el-option v-for="g in greenhouses" :key="g.id" :value="g.id" :label="g.name" />
        </el-select>
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">施肥时间</label>
        <el-date-picker :model-value="form.fertilizeTime" @update:model-value="update('fertilizeTime', $event)" type="datetime" class="w-full" />
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">操作员</label>
        <el-input :model-value="form.operatorName" @update:model-value="update('operatorName', $event)" placeholder="请输入操作员" />
      </div>
      <div class="col-span-2">
        <label class="text-gray-700 text-sm block mb-1">备注</label>
        <el-input :model-value="form.remarks" @update:model-value="update('remarks', $event)" type="textarea" :rows="2" placeholder="请输入备注" />
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" @click="$emit('submit', form)">确认创建</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  fertilizerTypes: { type: Array, default: () => [] },
  greenhouses: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'submit'])

const generateCode = () => {
  const now = new Date()
  return `SF${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`
}

const getDefaultForm = () => ({
  fertilizerCode: generateCode(),
  fertilizerName: '',
  fertilizerType: '',
  dilutionRatio: '',
  quantity: 0,
  unitPrice: 0,
  cropName: '',
  greenhouseId: '',
  greenhouseName: '',
  fertilizeTime: new Date().toISOString().slice(0, 16),
  operatorName: '',
  dataSource: 'manual',
  remarks: '',
})

const form = reactive(getDefaultForm())

watch(() => props.isOpen, (open) => {
  if (open) Object.assign(form, getDefaultForm())
})

const totalCost = computed(() => ((form.quantity || 0) * (form.unitPrice || 0)).toFixed(2))

const update = (key, value) => { form[key] = value }

const handleGreenhouseChange = (id) => {
  form.greenhouseId = id
  const gh = props.greenhouses.find(g => g.id === id)
  form.greenhouseName = gh?.name || ''
}
</script>
