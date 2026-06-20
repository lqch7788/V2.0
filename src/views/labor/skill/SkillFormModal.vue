<!--
  技能表单弹窗
  对标 V1.1 src/components/labor/skill/SkillFormModal.tsx
-->
<template>
  <el-dialog v-model="visible" :title="skill ? '编辑技能' : '新增技能'" width="560px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="技能名称" required>
        <el-input v-model="form.name" placeholder="例如：番茄种植" />
      </el-form-item>
      <el-form-item label="技能分类" required>
        <el-select v-model="form.category" placeholder="请选择" class="w-full">
          <el-option label="种植" value="planting" />
          <el-option label="施肥" value="fertilizer" />
          <el-option label="采收" value="harvest" />
          <el-option label="管理" value="management" />
          <el-option label="机械操作" value="machinery" />
        </el-select>
      </el-form-item>
      <el-form-item label="技能等级" required>
        <el-rate v-model="form.level" :max="5" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="3" maxlength="300" show-word-limit />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('submit', form)">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  skill: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const form = reactive({
  name: '',
  category: '',
  level: 3,
  description: '',
})

watch(
  () => props.skill,
  (val) => {
    if (val) Object.assign(form, val)
  },
  { immediate: true }
)
</script>