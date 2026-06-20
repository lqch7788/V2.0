<!--
  入职表单
  对标 V1.1 src/components/labor/onboarding/OnboardingForm.tsx
-->
<template>
  <div class="bg-white rounded-xl p-6 space-y-4 border border-gray-200">
    <h3 class="font-semibold text-gray-900 flex items-center gap-2">
      <el-icon><UserFilled /></el-icon>
      新员工入职登记
    </h3>

    <el-form :model="form" label-width="100px">
      <el-form-item label="姓名" required>
        <el-input v-model="form.name" placeholder="员工姓名" />
      </el-form-item>
      <el-form-item label="性别">
        <el-radio-group v-model="form.gender">
          <el-radio value="M">男</el-radio>
          <el-radio value="F">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="身份证号">
        <el-input v-model="form.idCard" placeholder="18位身份证号" maxlength="18" />
      </el-form-item>
      <el-form-item label="联系电话" required>
        <el-input v-model="form.phone" placeholder="11位手机号" maxlength="11" />
      </el-form-item>
      <el-form-item label="入职部门" required>
        <el-select v-model="form.department" placeholder="选择部门" class="w-full">
          <el-option v-for="d in departments" :key="d" :label="d" :value="d" />
        </el-select>
      </el-form-item>
      <el-form-item label="岗位" required>
        <el-input v-model="form.position" placeholder="工作岗位" />
      </el-form-item>
      <el-form-item label="入职日期" required>
        <el-date-picker v-model="form.entryDate" type="date" value-format="YYYY-MM-DD" class="w-full" />
      </el-form-item>
      <el-form-item label="试用期(月)">
        <el-input-number v-model="form.probationMonths" :min="0" :max="6" class="w-full" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>

    <div class="flex justify-end gap-2">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('submit', form)">提交入职</el-button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { UserFilled } from '@element-plus/icons-vue'

defineProps({
  loading: { type: Boolean, default: false },
})

defineEmits(['submit', 'cancel'])

const departments = ['生产部', '技术部', '后勤部', '财务部', '采购部']

const form = reactive({
  name: '',
  gender: 'M',
  idCard: '',
  phone: '',
  department: '',
  position: '',
  entryDate: '',
  probationMonths: 3,
  remark: '',
})
</script>