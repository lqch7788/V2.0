<!--
  任务反馈弹窗
  对标 V1.1 src/components/labor/myTasks/TaskFeedbackModal.tsx
-->
<template>
  <el-dialog v-model="visible" title="任务反馈" width="560px" v-dialog-draggable @close="$emit('update:modelValue', false)">
    <el-form :model="form" label-width="100px">
      <el-form-item label="完成情况" required>
        <el-radio-group v-model="form.status">
          <el-radio value="completed">已完成</el-radio>
          <el-radio value="partial">部分完成</el-radio>
          <el-radio value="issue">有问题</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="完成数量" v-if="form.status !== 'issue'">
        <el-input-number v-model="form.quantity" :min="0" class="w-full" />
      </el-form-item>
      <el-form-item label="反馈说明">
        <el-input v-model="form.feedback" type="textarea" :rows="3" maxlength="300" show-word-limit />
      </el-form-item>
      <el-form-item label="上传照片">
        <el-upload :file-list="form.images" list-type="picture-card" :auto-upload="false" :on-change="handleImageChange">
          <el-icon><Plus /></el-icon>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('submit', form)">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const form = reactive({
  status: 'completed',
  quantity: 0,
  feedback: '',
  images: [],
})

const handleImageChange = (file) => {
  form.images.push(file)
}
</script>