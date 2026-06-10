<template>
  <!-- 新增问题记录弹窗 - 从V1.1 CreateProblemModal.tsx 1:1迁移 -->
  <el-dialog :model-value="isOpen" @update:model-value="$emit('close')"
    title="新增问题记录" width="560px" top="5vh"
    @confirm="$emit('submit')">
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 温室区域 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">温室区域 <span class="text-red-500">*</span></label>
          <el-select :model-value="formData.greenhouseId" @update:model-value="handleGreenhouseChange"
            class="w-full" :class="{ 'is-error': errors.greenhouseId }" placeholder="请选择">
            <el-option v-for="g in greenhouses" :key="g.id" :value="g.id" :label="g.name" />
          </el-select>
          <p v-if="errors.greenhouseId" class="text-red-500 text-xs mt-1">{{ errors.greenhouseId }}</p>
        </div>

        <!-- 作物名称 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">作物名称 <span class="text-red-500">*</span></label>
          <el-select :model-value="formData.cropName" @update:model-value="(v) => emit('formChange', 'cropName', v)"
            class="w-full" :class="{ 'is-error': errors.cropName }" placeholder="请选择">
            <el-option v-for="c in cropOptions" :key="c.value" :value="c.value" :label="c.label" />
          </el-select>
          <p v-if="errors.cropName" class="text-red-500 text-xs mt-1">{{ errors.cropName }}</p>
        </div>

        <!-- 巡检人员 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">巡检人员 <span class="text-red-500">*</span></label>
          <el-input :model-value="formData.inspectorName" @update:model-value="(v) => emit('formChange', 'inspectorName', v)"
            placeholder="输入巡检人员姓名" :class="{ 'is-error': errors.inspectorName }" />
          <p v-if="errors.inspectorName" class="text-red-500 text-xs mt-1">{{ errors.inspectorName }}</p>
        </div>

        <!-- 巡检日期 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">巡检日期 <span class="text-red-500">*</span></label>
          <el-date-picker :model-value="formData.checkDate" @update:model-value="(v) => emit('formChange', 'checkDate', v)"
            type="date" class="w-full" :class="{ 'is-error': errors.checkDate }" />
          <p v-if="errors.checkDate" class="text-red-500 text-xs mt-1">{{ errors.checkDate }}</p>
        </div>

        <!-- 巡检时间 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">巡检时间 <span class="text-red-500">*</span></label>
          <el-time-picker :model-value="formData.checkTime" @update:model-value="(v) => emit('formChange', 'checkTime', v)"
            class="w-full" :class="{ 'is-error': errors.checkTime }" />
          <p v-if="errors.checkTime" class="text-red-500 text-xs mt-1">{{ errors.checkTime }}</p>
        </div>

        <!-- 问题严重程度 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">问题严重程度 <span class="text-red-500">*</span></label>
          <el-select :model-value="formData.issueSeverity" @update:model-value="(v) => emit('formChange', 'issueSeverity', v)"
            class="w-full" :class="{ 'is-error': errors.issueSeverity }" placeholder="请选择">
            <el-option v-for="s in severityOptions" :key="s" :value="s" :label="s" />
          </el-select>
          <p v-if="errors.issueSeverity" class="text-red-500 text-xs mt-1">{{ errors.issueSeverity }}</p>
        </div>

        <!-- 问题描述 -->
        <div class="md:col-span-3">
          <label class="text-sm text-gray-600 block mb-1">问题描述 <span class="text-red-500">*</span></label>
          <el-input :model-value="formData.issueText" @update:model-value="(v) => emit('formChange', 'issueText', v)"
            type="textarea" :rows="3" placeholder="详细描述发现的问题..."
            :class="{ 'is-error': errors.issueText }" />
          <p v-if="errors.issueText" class="text-red-500 text-xs mt-1">{{ errors.issueText }}</p>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" @click="$emit('submit')">确认新建</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  formData: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['close', 'submit', 'formChange'])

const greenhouses = computed(() => props.formData._greenhouses || [])
const cropOptions = computed(() => {
  const dicts = props.formData._dictionaries || []
  return dicts.map(d => ({ value: d.dictLabel || d.label, label: d.dictLabel || d.label }))
})

const severityOptions = ['轻微', '中等', '严重']

const handleGreenhouseChange = (greenhouseId) => {
  const greenhouse = greenhouses.value.find(g => g.id === greenhouseId)
  emit('formChange', 'greenhouseId', greenhouseId)
  emit('formChange', 'greenhouseName', greenhouse?.name || '')
}
</script>
