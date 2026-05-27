<template>
  <el-upload
    :action="action"
    :list-type="listType"
    :file-list="fileList"
    :limit="limit"
    :accept="accept"
    :disabled="disabled"
    :multiple="multiple"
    :class="className"
    :on-success="handleSuccess"
    :on-error="handleError"
    :on-remove="handleRemove"
    :before-upload="handleBeforeUpload"
    :http-request="customRequest"
  >
    <slot>
      <el-button type="primary" :disabled="disabled">
        <el-icon :size="16"><Upload /></el-icon>
        <span>{{ uploadText }}</span>
      </el-button>
    </slot>
  </el-upload>
</template>

<script setup>
import { Upload } from '@element-plus/icons-vue'

const props = defineProps({
  action: { type: String, default: '' },
  fileList: { type: Array, default: () => [] },
  listType: { type: String, default: 'text' },
  limit: { type: Number, default: undefined },
  accept: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
  uploadText: { type: String, default: '上传文件' },
  customRequest: { type: Function, default: undefined },
  className: { type: String, default: '' }
})

const emit = defineEmits(['success', 'error', 'remove', 'before-upload'])

const handleSuccess = (res, file, fileList) => emit('success', res, file, fileList)
const handleError = (err, file, fileList) => emit('error', err, file, fileList)
const handleRemove = (file, fileList) => emit('remove', file, fileList)
const handleBeforeUpload = (file) => emit('before-upload', file)
</script>
