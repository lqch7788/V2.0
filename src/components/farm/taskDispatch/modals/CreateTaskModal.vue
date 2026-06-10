<template>
  <!-- 新建农事任务弹窗 - 从V1.1 CreateTaskModal.tsx 1:1迁移 -->
  <el-dialog :model-value="isOpen" @update:model-value="$emit('close')"
    title="新建农事任务" width="560px" top="5vh"
    @confirm="$emit('submit')">
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 任务编号 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">任务编号 <span class="text-red-500">*</span></label>
          <el-input :model-value="formData.taskId" @update:model-value="(v) => emit('formChange', 'taskId', v)"
            placeholder="系统自动生成" :class="{ 'is-error': errors.taskId }" />
          <p v-if="errors.taskId" class="text-red-500 text-xs mt-1">{{ errors.taskId }}</p>
        </div>

        <!-- 任务类型 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">任务类型 <span class="text-red-500">*</span></label>
          <el-select :model-value="formData.types[0] || ''" @update:model-value="(v) => emit('formChange', 'types', [v])"
            class="w-full" :class="{ 'is-error': errors.types }" placeholder="请选择">
            <el-option v-for="t in taskTypes" :key="t.value" :value="t.value" :label="t.label" />
          </el-select>
          <p v-if="errors.types" class="text-red-500 text-xs mt-1">{{ errors.types }}</p>
        </div>

        <!-- 温室/大田 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">温室/大田 <span class="text-red-500">*</span></label>
          <el-select :model-value="formData.field" @update:model-value="(v) => emit('formChange', 'field', v)"
            class="w-full" :class="{ 'is-error': errors.field }" placeholder="请选择">
            <el-option v-for="f in fields" :key="f.name" :value="f.name" :label="`${f.name} - ${f.crop}`" />
          </el-select>
          <p v-if="errors.field" class="text-red-500 text-xs mt-1">{{ errors.field }}</p>
        </div>

        <!-- 作物 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">作物 <span class="text-red-500">*</span></label>
          <el-select :model-value="formData.crop" @update:model-value="(v) => emit('formChange', 'crop', v)"
            class="w-full" :class="{ 'is-error': errors.crop }" placeholder="请选择">
            <el-option v-for="c in uniqueCrops" :key="c" :value="c" :label="c" />
          </el-select>
          <p v-if="errors.crop" class="text-red-500 text-xs mt-1">{{ errors.crop }}</p>
        </div>

        <!-- 执行人 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">执行人 <span class="text-red-500">*</span></label>
          <el-select :model-value="formData.assignee" @update:model-value="(v) => emit('formChange', 'assignee', v)"
            class="w-full" :class="{ 'is-error': errors.assignee }" placeholder="请选择">
            <el-option v-for="s in staff" :key="s.name" :value="s.name" :label="s.name" />
          </el-select>
          <p v-if="errors.assignee" class="text-red-500 text-xs mt-1">{{ errors.assignee }}</p>
        </div>

        <!-- 优先级 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">优先级 <span class="text-red-500">*</span></label>
          <el-select :model-value="formData.priority" @update:model-value="(v) => emit('formChange', 'priority', v)"
            class="w-full" :class="{ 'is-error': errors.priority }" placeholder="选择优先级">
            <el-option v-for="p in priorityOptions" :key="p.value" :value="p.value" :label="p.label" />
          </el-select>
          <p v-if="errors.priority" class="text-red-500 text-xs mt-1">{{ errors.priority }}</p>
        </div>

        <!-- 计划开始 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">计划开始时间 <span class="text-red-500">*</span></label>
          <el-date-picker :model-value="formData.planStart" @update:model-value="(v) => emit('formChange', 'planStart', v)"
            type="datetime" class="w-full" :class="{ 'is-error': errors.planStart }" placeholder="选择日期" />
          <p v-if="errors.planStart" class="text-red-500 text-xs mt-1">{{ errors.planStart }}</p>
        </div>

        <!-- 计划结束 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">计划结束时间 <span class="text-red-500">*</span></label>
          <el-date-picker :model-value="formData.planEnd" @update:model-value="(v) => emit('formChange', 'planEnd', v)"
            type="datetime" class="w-full" :class="{ 'is-error': errors.planEnd }" placeholder="选择日期" />
          <p v-if="errors.planEnd" class="text-red-500 text-xs mt-1">{{ errors.planEnd }}</p>
        </div>

        <!-- 预计天数 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">预计天数</label>
          <el-input-number :model-value="formData.estimatedDays"
            @update:model-value="(v) => emit('formChange', 'estimatedDays', v || 0)"
            :min="0" class="w-full" />
        </div>

        <!-- 预计小时 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">预计小时</label>
          <el-input-number :model-value="formData.estimatedHours"
            @update:model-value="(v) => emit('formChange', 'estimatedHours', v || 0)"
            :min="0" class="w-full" />
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
  fields: { type: Array, default: () => [] },
  staff: { type: Array, default: () => [] },
  taskTypes: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'submit', 'formChange'])

const uniqueCrops = computed(() => {
  const crops = props.fields.map(f => f.crop)
  return [...new Set(crops)]
})

const priorityOptions = [
  { value: 'normal', label: '普通' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '紧急' },
]
</script>
