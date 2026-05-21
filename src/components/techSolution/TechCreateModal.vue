<template>
  <el-dialog
    :model-value="visible"
    title="新增方案"
    width="900px"
    @close="handleClose"
  >
    <el-form :model="form" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="方案编号">
            <el-input v-model="form.code" placeholder="请输入或生成方案编号">
              <template #append>
                <el-button @click="generateCode">生成</el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="版本">
            <el-input v-model="form.version" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="方案标题" required>
        <el-input v-model="form.title" placeholder="请输入方案标题" />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="作物品种" required>
            <el-select v-model="form.crop" placeholder="请选择作物品种" style="width: 100%">
              <el-option label="番茄" value="番茄" />
              <el-option label="黄瓜" value="黄瓜" />
              <el-option label="草莓" value="草莓" />
              <el-option label="辣椒" value="辣椒" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="作物编码">
            <el-input v-model="form.cropCode" disabled placeholder="自动获取" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
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

      <el-form-item label="关联生产批次号">
        <el-select v-model="form.relatedBatchCode" placeholder="请选择" style="width: 100%">
          <el-option label="ZZB2026-001 - 番茄种植批次" value="ZZB2026-001" />
          <el-option label="ZZB2026-002 - 黄瓜种植批次" value="ZZB2026-002" />
          <el-option label="ZZB2026-003 - 草莓种植批次" value="ZZB2026-003" />
        </el-select>
      </el-form-item>

      <el-form-item label="适用范围">
        <el-input v-model="form.stage" placeholder="请输入适用范围" />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="编制人">
            <el-input v-model="form.author" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="创建日期">
            <el-input :model-value="createDate" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="方案内容">
        <el-input v-model="form.content" type="textarea" :rows="6" placeholder="请输入方案内容" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button @click="handleClose">取消</el-button>
        <el-button @click="handleDraft">存为草稿</el-button>
        <el-button type="primary" @click="handleSubmit">提交审批</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {  TechSolution  } from './types'
import { useTechSolutionStore } from '@/stores/modules/techSolution'

const props = defineProps({})

const emit = defineEmits(['close'])

const techSolutionStore = useTechSolutionStore()

const form = reactive({
  code: '',
  title: '',
  crop: '',
  cropCode: '',
  plantingMode: '水培',
  stage: '',
  version: 'V1.0',
  content: '',
  author: localStorage.getItem('username') || '陆启闯',
  relatedBatchCode: '',
  planDetailFileName: ''
})

const createDate = computed(() => new Date().toISOString().slice(0, 10))

const generateCode = () => {
  form.code = `T${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
}

const handleClose = () => {
  emit('close')
}

const handleDraft = async () => {
  if (!form.title) {
    ElMessage.warning('请输入方案标题')
    return
  }

  try {
    await techSolutionStore.addSolution({
      ...form,
      status: '草稿',
      statusClass: 'draft'
    })
    ElMessage.success('保存草稿成功')
    emit('success')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const handleSubmit = async () => {
  if (!form.title) {
    ElMessage.warning('请输入方案标题')
    return
  }

  try {
    await techSolutionStore.addSolution({
      ...form,
      status: '审核中',
      statusClass: 'pending'
    })
    ElMessage.success('提交成功')
    emit('success')
  } catch (error) {
    ElMessage.error('提交失败')
  }
}
</script>
