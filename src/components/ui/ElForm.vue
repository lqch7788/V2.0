<template>
  <el-form
    ref="formRef"
    :model="model"
    :rules="rules"
    :inline="isInline"
    :label-width="labelWidth"
    :label-position="labelPosition"
    :size="size"
    :class="['el-form-wrapper', { 'is-inline': isInline }]"
    @submit.prevent
  >
    <slot />

    <!-- 默认操作按钮区 -->
    <el-form-item v-if="showActions" class="form-actions">
      <el-button
        v-if="showReset"
        :size="size"
        @click="handleReset"
      >
        <el-icon class="mr-1"><RefreshLeft /></el-icon>
        重置
      </el-button>
      <el-button
        v-if="showSubmit"
        type="primary"
        :size="size"
        :loading="submitLoading"
        @click="handleSubmit"
      >
        <el-icon class="mr-1"><Check /></el-icon>
        {{ submitText }}
      </el-button>
      <el-button
        v-if="showCancel"
        :size="size"
        @click="handleCancel"
      >
        取消
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RefreshLeft, Check } from '@element-plus/icons-vue'

const props = defineProps({
  /** 表单数据对象（支持 v-model） */
  model: {
    type: Object,
    default: () => ({})
  },
  /** 验证规则 */
  rules: {
    type: Object,
    default: () => ({})
  },
  /** 布局模式：search=搜索表单（行内），edit=编辑表单（块级） */
  layout: {
    type: String,
    default: 'edit',
    validator: (val) => ['search', 'edit', 'inline'].includes(val)
  },
  /** 标签宽度 */
  labelWidth: {
    type: [String, Number],
    default: undefined
  },
  /** 标签位置 */
  labelPosition: {
    type: String,
    default: 'top'
  },
  /** 表单尺寸 */
  size: {
    type: String,
    default: 'default'
  },
  /** 是否显示操作按钮 */
  showActions: {
    type: Boolean,
    default: false
  },
  /** 是否显示提交按钮 */
  showSubmit: {
    type: Boolean,
    default: true
  },
  /** 是否显示重置按钮 */
  showReset: {
    type: Boolean,
    default: true
  },
  /** 是否显示取消按钮 */
  showCancel: {
    type: Boolean,
    default: false
  },
  /** 提交按钮文字 */
  submitText: {
    type: String,
    default: '保存'
  },
  /** 提交按钮加载状态 */
  submitLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'reset', 'cancel', 'update:model'])

const formRef = ref(null)

const isInline = computed(() => props.layout === 'search' || props.layout === 'inline')

/** 提交 */
async function handleSubmit() {
  if (!formRef.value) return
  try {
    await formRef.value.validate((valid, fields) => {
      if (valid) {
        emit('submit', props.model)
      } else {
        console.warn('表单验证失败:', fields)
      }
    })
  } catch (e) {
    console.error('表单验证异常:', e)
  }
}

/** 重置 */
function handleReset() {
  if (!formRef.value) return
  formRef.value.resetFields()
  emit('reset')
}

/** 取消 */
function handleCancel() {
  emit('cancel')
}

/** 对外暴露方法 */
defineExpose({
  validate: () => formRef.value?.validate(),
  validateField: (props) => formRef.value?.validateField(props),
  resetFields: () => formRef.value?.resetFields(),
  scrollToField: (prop) => formRef.value?.scrollToField(prop),
  clearValidate: (props) => formRef.value?.clearValidate(props),
  getFormRef: () => formRef.value
})
</script>

<style scoped>
/* ======================== 与 V1.1 表单样式一致 ======================== */
.el-form-wrapper :deep(.el-form-item__label) {
  color: #374151;              /* text-gray-700 */
  font-size: 14px;
  font-weight: 500;
  line-height: 40px;
  padding-right: 12px;
}

.el-form-wrapper :deep(.el-input__wrapper),
.el-form-wrapper :deep(.el-textarea__inner),
.el-form-wrapper :deep(.el-select .el-input__wrapper) {
  box-shadow: 0 0 0 1px #e5e7eb inset; /* border-gray-200 */
  border-radius: 0.5rem;               /* rounded-lg */
  padding: 0 12px;
  transition: all 0.2s;
}

.el-form-wrapper :deep(.el-input__inner) {
  height: 40px;                        /* h-10 */
  font-size: 14px;
  color: #111827;
}

.el-form-wrapper :deep(.el-textarea__inner) {
  padding: 8px 12px;
  font-size: 14px;
  color: #111827;
}

.el-form-wrapper :deep(.el-input__wrapper.is-focus),
.el-form-wrapper :deep(.el-textarea__inner:focus),
.el-form-wrapper :deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #10b981 inset, 0 0 0 3px rgba(16, 185, 129, 0.1) !important; /* focus:border-emerald-500 + ring */
}

/* 搜索表单（inline）模式 */
.el-form-wrapper.is-inline :deep(.el-form-item) {
  margin-right: 16px;
  margin-bottom: 16px;
}

.el-form-wrapper.is-inline :deep(.el-form-item:last-child) {
  margin-right: 0;
}

/* 编辑表单模式：增加字段间距 */
.el-form-wrapper:not(.is-inline) :deep(.el-form-item) {
  margin-bottom: 20px;
}

/* 按钮样式微调 */
.el-form-wrapper :deep(.el-button) {
  border-radius: 0.5rem;
  font-weight: 500;
}

.el-form-wrapper :deep(.el-button--primary) {
  background-color: #059669;
  border-color: #059669;
}

.el-form-wrapper :deep(.el-button--primary:hover) {
  background-color: #047857;
  border-color: #047857;
}

/* 操作按钮区域 */
.form-actions {
  margin-bottom: 0 !important;
  margin-top: 8px;
}

.form-actions :deep(.el-form-item__content) {
  justify-content: flex-end;
  gap: 8px;
}
</style>
