<template>
  <!-- 指标创建/编辑弹窗组件 -->
  <el-dialog
    :model-value="isOpen"
    @update:model-value="handleClose"
    :title="isEdit ? '编辑指标' : '新增指标'"
    width="600px"
    :close-on-click-modal="false"
    class="indicator-create-modal"
  >
    <el-form :model="formData" label-width="100px" class="px-4">
      <el-form-item label="指标编码">
        <el-input v-model="formData.code" placeholder="系统自动生成" disabled />
      </el-form-item>

      <el-form-item label="指标名称" required>
        <el-input v-model="formData.name" placeholder="请输入指标名称" />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="类别">
            <el-select v-model="formData.category" placeholder="请选择类别" class="w-full">
              <el-option
                v-for="cat in categories"
                :key="cat"
                :label="cat"
                :value="cat"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="单位">
            <el-input v-model="formData.unit" placeholder="如: %, 元, kg" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="目标值">
            <el-input-number v-model="formData.target" :min="0" class="w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="实际值">
            <el-input-number v-model="formData.actual" :min="0" class="w-full" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="数据采集方式">
            <el-select v-model="formData.source" placeholder="请选择采集方式" class="w-full">
              <el-option label="自动采集" value="自动采集" />
              <el-option label="人工录入" value="人工录入" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="权重">
            <el-input-number v-model="formData.weight" :min="0" :max="100" class="w-full" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { indicatorCategories } from '@/data/indicatorsData'
import {  Indicator  } from '@/types/indicators'

const props = defineProps({
  isOpen: Boolean,
  indicator: Object
})

const emit = defineEmits(['close', 'save'])

// 是否编辑模式
const isEdit = computed(() => !!props.indicator)

// 类别选项（排除"全部"）
const categories = indicatorCategories.filter(c => c !== '全部')

// 表单数据
const formData = ref({
  code: '',
  name: '',
  category: '生产指标',
  unit: '',
  target,
  actual,
  source: '自动采集',
  warning,
  weight,
  frequency: '月度'
})

// 监听弹窗打开，初始化表单数据
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.indicator) {
      // 编辑模式
      formData.value = {
        code: props.indicator.code || '',
        name: props.indicator.name || '',
        category: props.indicator.category || '生产指标',
        unit: props.indicator.unit || '',
        target: props.indicator.target || 0,
        actual: props.indicator.actual || 0,
        source: props.indicator.source || '自动采集',
        warning: props.indicator.warning || 0,
        weight: props.indicator.weight || 0,
        frequency: props.indicator.frequency || '月度'
      }
    } else {
      // 新增模式
      formData.value = {
        code: '',
        name: '',
        category: '生产指标',
        unit: '',
        target,
        actual,
        source: '自动采集',
        warning,
        weight,
        frequency: '月度'
      }
    }
  }
})

// 关闭弹窗
const handleClose = () => {
  emit('close')
}

// 提交表单
const handleSubmit = () => {
  if (!formData.value.name.trim()) {
    return
  }
  emit('save', formData.value)
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.indicator-create-modal .el-dialog__header) {
  background: linear-gradient(to right, #10b981, #059669);
  color: white;
  margin: 0;
  padding: 16px 20px;
}

:deep(.indicator-create-modal .el-dialog__title) {
  color: white;
}

:deep(.indicator-create-modal .el-dialog__close) {
  color: white;
}
</style>
