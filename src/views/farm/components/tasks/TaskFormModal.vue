<!--
  TaskFormModal.vue - 任务创建/编辑表单弹窗
  V1.1 TaskFormModal.tsx 1:1 迁移（13 字段）
-->
<template>
  <el-dialog
    :model-value="isOpen"
    @update:model-value="(v) => !v && emit('close')"
    :title="title"
    width="780px"
    destroy-on-close
    top="3vh"
  >
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">任务模式 <span class="text-red-500">*</span></label>
          <el-select :model-value="formData.mode" @update:model-value="(v) => updateField('mode', v)" placeholder="请选择任务模式" class="w-full">
            <el-option label="玻璃温室" value="glass" />
            <el-option label="日光温室" value="solar" />
            <el-option label="大田" value="field" />
          </el-select>
          <p v-if="errors.mode" class="mt-1 text-xs text-red-500">{{ errors.mode }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">任务类型 <span class="text-red-500">*</span></label>
          <el-select :model-value="formData.type" @update:model-value="(v) => updateField('type', v)" placeholder="请选择任务类型" class="w-full">
            <el-option v-for="t in taskTypes" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
          <p v-if="errors.type" class="mt-1 text-xs text-red-500">{{ errors.type }}</p>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">任务标题 <span class="text-red-500">*</span></label>
        <el-input :model-value="formData.title" @update:model-value="(v) => updateField('title', v)" placeholder="请输入任务标题" />
        <p v-if="errors.title" class="mt-1 text-xs text-red-500">{{ errors.title }}</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">所属批次 <span class="text-red-500">*</span></label>
          <el-select :model-value="formData.batchCode" @update:model-value="(v) => updateField('batchCode', v)" placeholder="请选择批次" class="w-full" filterable>
            <el-option v-for="b in batches" :key="b.id" :label="`${b.batchCode} - ${b.cropName}`" :value="b.batchCode" />
          </el-select>
          <p v-if="errors.batchCode" class="mt-1 text-xs text-red-500">{{ errors.batchCode }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">作业区域 <span class="text-red-500">*</span></label>
          <el-select :model-value="formData.greenhouseId" @update:model-value="(v) => updateField('greenhouseId', v)" placeholder="请选择区域" class="w-full">
            <el-option v-for="g in greenhouses" :key="g.id" :label="g.name" :value="g.id" />
          </el-select>
          <p v-if="errors.greenhouseId" class="mt-1 text-xs text-red-500">{{ errors.greenhouseId }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">执行人 <span class="text-red-500">*</span></label>
          <el-select :model-value="formData.assigneeId" @update:model-value="(v) => updateField('assigneeId', v)" placeholder="请选择执行人" class="w-full" filterable>
            <el-option v-for="u in workers" :key="u.id" :label="`${u.name} - ${u.position || ''}`" :value="u.id" />
          </el-select>
          <p v-if="errors.assigneeId" class="mt-1 text-xs text-red-500">{{ errors.assigneeId }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">优先级</label>
          <el-select :model-value="formData.priority" @update:model-value="(v) => updateField('priority', v)" class="w-full">
            <el-option label="一般" value="low" />
            <el-option label="重要" value="medium" />
            <el-option label="紧急" value="high" />
          </el-select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">截止时间 <span class="text-red-500">*</span></label>
          <el-date-picker :model-value="formData.dueDate" @update:model-value="(v) => updateField('dueDate', v || '')" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" class="w-full" />
          <p v-if="errors.dueDate" class="mt-1 text-xs text-red-500">{{ errors.dueDate }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">预计工时(小时) <span class="text-red-500">*</span></label>
          <el-input-number :model-value="formData.workDuration" @update:model-value="(v) => updateField('workDuration', Number(v) || 0)" :min="0" :step="0.5" :precision="1" class="w-full" />
          <p v-if="errors.workDuration" class="mt-1 text-xs text-red-500">{{ errors.workDuration }}</p>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">任务描述</label>
        <el-input :model-value="formData.description" @update:model-value="(v) => updateField('description', v)" type="textarea" :rows="3" placeholder="请输入任务描述" />
      </div>
    </div>

    <template #footer>
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" @click="emit('submit')">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: '创建任务' },
  formData: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
  taskTypes: { type: Array, default: () => [] },
  greenhouses: { type: Array, default: () => [] },
  batches: { type: Array, default: () => [] },
  workers: { type: Array, default: () => [] },
})
const emit = defineEmits(['close', 'submit', 'change'])

// 修复 vue/no-mutating-props：通过 emit 通知父组件更新字段
function updateField(field, value) {
  emit('change', field, value)
}
</script>
