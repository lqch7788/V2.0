<template>
  <!-- 编辑施肥记录弹窗 -->
  <el-dialog :model-value="isOpen" @update:model-value="$emit('close')" title="编辑施肥记录" width="700px" top="5vh">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="text-gray-700 text-sm block mb-1">施肥编号</label>
        <el-input :model-value="record?.fertilizerCode" readonly disabled class="font-mono" />
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">肥料名称 <span class="text-red-500">*</span></label>
        <el-input v-model="form.fertilizerName" placeholder="请输入肥料名称" />
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">肥料类型</label>
        <el-select v-model="form.fertilizerType" class="w-full" placeholder="请选择">
          <el-option v-for="t in fertilizerTypes" :key="t.value" :value="t.value" :label="t.label" />
        </el-select>
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">稀释比例</label>
        <el-input v-model="form.dilutionRatio" placeholder="如 1:500" />
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">施肥量(kg) <span class="text-red-500">*</span></label>
        <el-input-number v-model="form.quantity" :min="0" :precision="2" class="w-full" controls-position="right" />
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">单价(元/kg)</label>
        <el-input-number v-model="form.unitPrice" :min="0" :precision="2" class="w-full" controls-position="right" />
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">总成本(元)</label>
        <el-input-number :model-value="(form.quantity * form.unitPrice).toFixed(2)" readonly disabled class="w-full" controls-position="right" />
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">作物品种</label>
        <el-input v-model="form.cropName" placeholder="请输入作物品种" />
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">温室位置</label>
        <el-select v-model="form.greenhouseId" @update:model-value="handleGreenhouseChange" class="w-full" placeholder="请选择">
          <el-option v-for="g in greenhouses" :key="g.id" :value="g.id" :label="g.name" />
        </el-select>
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">施肥时间</label>
        <el-date-picker v-model="form.fertilizeTime" type="datetime" class="w-full" />
      </div>
      <div>
        <label class="text-gray-700 text-sm block mb-1">操作员</label>
        <el-input v-model="form.operatorName" placeholder="请输入操作员" />
      </div>
      <div class="col-span-2">
        <label class="text-gray-700 text-sm block mb-1">备注</label>
        <el-input v-model="form.remarks" type="textarea" :rows="2" placeholder="请输入备注" />
      </div>
    </div>
    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" @click="$emit('submit', form)">保存修改</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  record: { type: Object, default: null },
  fertilizerTypes: { type: Array, default: () => [] },
  greenhouses: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'submit'])

const form = reactive({})

watch(() => props.isOpen, (open) => {
  if (open && props.record) {
    Object.assign(form, { ...props.record })
  }
})

const handleGreenhouseChange = (id) => {
  form.greenhouseId = id
  const gh = props.greenhouses.find(g => g.id === id)
  if (gh) form.greenhouseName = gh.name
}
</script>
