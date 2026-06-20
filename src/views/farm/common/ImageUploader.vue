<!--
  通用图片上传组件
  对标 V1.1 src/components/farm/common/ImageUploader.tsx
-->
<template>
  <el-upload
    :action="uploadUrl"
    list-type="picture-card"
    :file-list="fileList"
    :on-success="handleSuccess"
    :on-error="handleError"
    :on-remove="handleRemove"
    :before-upload="beforeUpload"
    :limit="maxCount"
    :on-exceed="handleExceed"
    accept="image/*"
  >
    <el-icon><Plus /></el-icon>
  </el-upload>
  <el-dialog v-model="showPreview" width="80%">
    <img :src="previewUrl" alt="预览" class="w-full" />
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  maxCount: { type: Number, default: 9 },
  maxSize: { type: Number, default: 5 }, // MB
})

const emit = defineEmits(['update:modelValue'])

const uploadUrl = '/api/upload/image'
const fileList = computed({
  get: () => (props.modelValue || []).map((url, idx) => ({ url, name: `image-${idx}`, uid: idx })),
  set: () => {},
})

const showPreview = ref(false)
const previewUrl = ref('')

const beforeUpload = (file) => {
  const isLt = file.size / 1024 / 1024 < props.maxSize
  if (!isLt) {
    ElMessage.error(`图片大小不能超过 ${props.maxSize}MB`)
    return false
  }
  return true
}

const handleSuccess = (response, file) => {
  if (response.success) {
    const newList = [...props.modelValue, response.data.url]
    emit('update:modelValue', newList)
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.error || '上传失败')
  }
}

const handleError = () => {
  ElMessage.error('上传失败')
}

const handleRemove = (file) => {
  const idx = props.modelValue.indexOf(file.url)
  if (idx >= 0) {
    const newList = [...props.modelValue]
    newList.splice(idx, 1)
    emit('update:modelValue', newList)
  }
}

const handleExceed = () => {
  ElMessage.warning(`最多只能上传 ${props.maxCount} 张图片`)
}
</script>