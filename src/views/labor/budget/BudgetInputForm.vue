<!--
  预算录入表单
  对标 V1.1 src/components/labor/budget/BudgetInputForm.tsx
-->
<template>
  <div class="bg-white rounded-xl p-4 shadow-sm space-y-3">
    <h3 class="font-semibold">预算录入</h3>
    <el-form :model="form" label-width="120px" inline>
      <el-form-item label="科目">
        <el-select v-model="form.subject" placeholder="选择科目" class="!w-48">
          <el-option v-for="s in subjects" :key="s" :value="s" :label="s" />
        </el-select>
      </el-form-item>
      <el-form-item label="金额">
        <el-input-number v-model="form.amount" :min="0" :precision="2" :step="100" />
      </el-form-item>
      <el-form-item label="月份">
        <el-date-picker v-model="form.month" type="month" value-format="YYYY-MM" placeholder="选择月份" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加
        </el-button>
      </el-form-item>
    </el-form>
    <el-table :data="items" size="small" border>
      <el-table-column prop="subject" label="科目" />
      <el-table-column prop="month" label="月份" width="100" />
      <el-table-column prop="amount" label="金额" align="right">
        <template #default="{ row }">¥{{ row.amount.toFixed(2) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template #default="{ $index }">
          <el-button link type="danger" size="small" @click="items.splice($index, 1)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['submit'])

const subjects = ['工资', '社保', '福利', '培训', '招聘', '差旅', '其他']

const form = reactive({
  subject: '',
  amount: 0,
  month: '',
})

const items = reactive([])

const handleAdd = () => {
  if (!form.subject || !form.amount || !form.month) {
    ElMessage.warning('请填写完整信息')
    return
  }
  items.push({ ...form })
  form.subject = ''
  form.amount = 0
  form.month = ''
  emit('submit', [...items])
}
</script>