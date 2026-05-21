<template>
  <el-dialog
    :model-value="visible"
    title="批量编辑生产计划"
    width="800px"
    @close="handleClose"
  >
    <div class="space-y-4">
      <div class="bg-blue-50 rounded-lg p-3">
        <p class="text-sm text-blue-800">
          已选择 <strong>{{ selectedRows.length }}</strong> 个生产计划进行编辑
        </p>
      </div>

      <el-form label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="种植区域">
              <el-select v-model="selectedGreenhouseId" placeholder="请选择区域" style="width: 100%">
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
            <el-form-item label="负责人">
              <el-select v-model="selectedResponsiblePerson" placeholder="请选择负责人" style="width: 100%">
                <el-option label="郭靖" value="郭靖" />
                <el-option label="黄蓉" value="黄蓉" />
                <el-option label="陆启闯" value="陆启闯" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间">
              <el-date-picker
                v-model="selectedStartDate"
                type="date"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计结束时间">
              <el-date-picker
                v-model="selectedExpectedHarvestDate"
                type="date"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="$emit('publish')">提交审批</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import {  CropBatch  } from '@/types'

defineProps({})

const emit = defineEmits(['close'])

const selectedGreenhouseId = ref('')
const selectedResponsiblePerson = ref('')
const selectedStartDate = ref('')
const selectedExpectedHarvestDate = ref('')

const handleClose = () => {
  emit('close')
}
</script>
