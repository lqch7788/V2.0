<template>
  <el-dialog
    :model-value="visible"
    title="创建生产计划"
    width="900px"
    @close="handleClose"
  >
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="批次编号" prop="batchCode">
            <el-input v-model="formData.batchCode" placeholder="请输入或生成批次编号">
              <template #append>
                <el-button @click="$emit('generateCode')">生成</el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="计划类型" prop="planType">
            <el-select v-model="formData.planType" style="width: 100%">
              <el-option label="种植计划" value="planting" />
              <el-option label="育苗计划" value="seedling" />
              <el-option label="种源计划" value="seed_source" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="作物名称" prop="cropName">
            <el-input v-model="formData.cropName" placeholder="请输入作物名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="品种" prop="variety">
            <el-input v-model="formData.variety" placeholder="请输入品种" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="种植区域" prop="greenhouseId">
            <el-select v-model="formData.greenhouseId" placeholder="请选择区域" style="width: 100%">
              <el-option
                v-for="gh in greenhouses"
                :key="gh.id"
                :label="gh.name"
                :value="gh.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="种植面积" prop="plantingArea">
            <el-input-number v-model="formData.plantingArea" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="定植日期" prop="startDate">
            <el-date-picker
              v-model="formData.startDate"
              type="date"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预计采收日期" prop="expectedHarvestDate">
            <el-date-picker
              v-model="formData.expectedHarvestDate"
              type="date"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="目标产量" prop="targetYield">
            <el-input-number v-model="formData.targetYield" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="种植模式" prop="plantingMode">
            <el-select v-model="formData.plantingMode" placeholder="请选择种植模式" style="width: 100%">
              <el-option label="露天栽培" value="open_field" />
              <el-option label="大棚栽培" value="greenhouse" />
              <el-option label="水培" value="hydroponic" />
              <el-option label="基质培" value="substrate" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="负责人" prop="responsiblePerson">
            <el-select v-model="formData.responsiblePerson" placeholder="请选择负责人" style="width: 100%">
              <el-option label="郭靖" value="郭靖" />
              <el-option label="黄蓉" value="黄蓉" />
              <el-option label="陆启闯" value="陆启闯" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发布人">
            <el-input v-model="formData.publisher" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注">
        <el-input v-model="formData.description" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button @click="$emit('saveDraft')">存为草稿</el-button>
      <el-button type="primary" @click="$emit('submitForApproval')">提交审批</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { } from 'element-plus'
import {  CropBatch  } from '@/types'

defineProps({})

const emit = defineEmits(['close', 'value'])

const formRef = ref()

const rules = {
  batchCode: [{ required, message: '请输入批次编号', trigger: 'blur' }],
  cropName: [{ required, message: '请输入作物名称', trigger: 'blur' }],
  variety: [{ required, message: '请输入品种', trigger: 'blur' }],
  greenhouseId: [{ required, message: '请选择区域', trigger: 'change' }],
  plantingArea: [{ required, message: '请输入种植面积', trigger: 'blur' }],
  startDate: [{ required, message: '请选择定植日期', trigger: 'change' }],
  expectedHarvestDate: [{ required, message: '请选择预计采收日期', trigger: 'change' }],
  targetYield: [{ required, message: '请输入目标产量', trigger: 'blur' }],
  plantingMode: [{ required, message: '请选择种植模式', trigger: 'change' }],
  responsiblePerson: [{ required, message: '请选择负责人', trigger: 'change' }]
}

const handleClose = () => {
  emit('close')
}
</script>
