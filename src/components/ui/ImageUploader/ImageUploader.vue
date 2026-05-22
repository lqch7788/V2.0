<template>
  <div class="ui-image-uploader">
    <el-upload
      v-model:file-list="fileList"
      :action="action"
      :accept="accept"
      :limit="limit"
      :multiple="multiple"
      :disabled="disabled"
      :list-type="listType"
      :auto-upload="autoUpload"
      :show-upload-list="showUploadList"
      :before-upload="handleBeforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-remove="handleRemove"
      :on-preview="handlePreview"
    >
      <div v-if="listType === 'picture-card'" class="upload-trigger">
        <el-icon :size="24"><Plus /></el-icon>
        <span class="upload-text">上传图片</span>
      </div>
      <el-button v-else type="primary" size="small">
        <el-icon><Upload /></el-icon>
        点击上传
      </el-button>
    </el-upload>

    <!-- 图片预览 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="600px">
      <img :src="previewUrl" alt="preview" style="width: 100%;" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus, Upload } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  action: { type: String, default: '/api/upload' },
  accept: { type: String, default: 'image/*' },
  limit: { type: Number, default: 5 },
  multiple: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  listType: { type: String, default: 'picture-card' }, // text, picture, picture-card
  autoUpload: { type: Boolean, default: true },
  showUploadList: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'change', 'success', 'error', 'remove', 'preview'])

const fileList = ref(props.modelValue.map(url => ({ url })))
const previewVisible = ref(false)
const previewUrl = ref('')

const handleBeforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    console.error('只能上传图片文件')
    return false
  }
  if (!isLt5M) {
    console.error('图片大小不能超过 5MB')
    return false
  }
  return true
}

const handleSuccess = (response, file) => {
  emit('success', response, file)
  emit('change', fileList.value)
}

const handleError = (err, file) => {
  emit('error', err, file)
}

const handleRemove = (file) => {
  emit('remove', file)
  emit('change', fileList.value)
}

const handlePreview = (file) => {
  previewUrl.value = file.url
  previewVisible.value = true
  emit('preview', file)
}
</script>

<style scoped>
.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.15s;
}

.upload-trigger:hover {
  border-color: #10b981;
  color: #10b981;
}

.upload-text {
  font-size: 0.75rem;
  margin-top: 0.5rem;
}
</style>
