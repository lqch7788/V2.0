<template>
  <el-dialog
    :model-value="visible"
    title="编辑方案"
    width="800px"
    @close="handleClose"
  >
    <el-form :model="form" label-width="100px" v-if="tech">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="方案编号">
            <el-input v-model="tech.code" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="版本">
            <el-input v-model="form.version" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="方案标题">
        <el-input v-model="form.title" />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="作物品种">
            <el-select v-model="form.crop" style="width: 100%">
              <el-option label="番茄" value="番茄" />
              <el-option label="黄瓜" value="黄瓜" />
              <el-option label="草莓" value="草莓" />
              <el-option label="辣椒" value="辣椒" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="种植模式">
            <el-select v-model="form.plantingMode" style="width: 100%">
              <el-option label="水培" value="水培" />
              <el-option label="土培" value="土培" />
              <el-option label="基质培" value="基质培" />
              <el-option label="雾培" value="雾培" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="适用范围">
        <el-input v-model="form.stage" />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="编制人">
            <el-input v-model="tech.author" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="创建日期">
            <el-input v-model="tech.createDate" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="最后提交时间">
            <el-input v-model="form.lastSubmitTime" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="方案是否有效">
            <el-select v-model="form.isValid" style="width: 100%">
              <el-option label="有效" value="有效" />
              <el-option label="作废" value="作废" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="方案内容">
        <el-input v-model="form.content" type="textarea" :rows="6" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {  TechSolution  } from './types'
import { useTechSolutionStore } from '@/stores/modules/techSolution'

const props = defineProps({})

const emit = defineEmits(['close'])

const techSolutionStore = useTechSolutionStore()
const submitting = ref(false)

const form = reactive({
  title: '',
  crop: '',
  plantingMode: '',
  stage: '',
  version: '',
  content: '',
  isValid: '有效',
  lastSubmitTime: ''
})

watch(() => props.visible, (val) => {
  if (val && props.tech) {
    form.title = props.tech.title
    form.crop = props.tech.crop
    form.plantingMode = props.tech.plantingMode
    form.stage = props.tech.stage
    form.version = props.tech.version
    form.content = props.tech.content
    form.isValid = props.tech.isValid || '有效'
    form.lastSubmitTime = new Date().toISOString().slice(0, 10)
  }
})

const handleClose = () => {
  emit('close')
}

const handleSubmit = async () => {
  if (!props.tech) return

  submitting.value = true
  try {
    await techSolutionStore.updateSolution(props.tech.id, {
      title: form.title,
      crop: form.crop,
      plantingMode: form.plantingMode,
      stage: form.stage,
      version: form.version,
      content: form.content,
      isValid: form.isValid,
      lastSubmitTime: form.lastSubmitTime
    })
    ElMessage.success('保存成功')
    emit('success')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}
</script>
