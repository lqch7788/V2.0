<template>
  <div class="bg-white rounded-xl p-4 shadow-sm mb-4">
    <div class="grid grid-cols-5 gap-4">
      <!-- 退库单号 -->
      <el-input v-model="localCode" placeholder="退库单号" clearable size="default" />

      <!-- 物料名称 -->
      <el-input v-model="localMaterial" placeholder="物料名称/编码" clearable size="default" />

      <!-- 仓库 -->
      <el-select v-model="localWarehouse" placeholder="选择仓库" clearable size="default" style="width: 100%">
        <el-option v-for="w in warehouseOptions" :key="w" :label="w" :value="w" />
      </el-select>

      <!-- 申请人 -->
      <el-input v-model="localApplicant" placeholder="申请人" clearable size="default" />

      <!-- 状态 -->
      <el-select v-model="localStatus" placeholder="状态" clearable size="default" style="width: 100%">
        <el-option label="全部" value="" />
        <el-option label="待审批" value="待审批" />
        <el-option label="已审批" value="已审批" />
        <el-option label="已完成" value="已完成" />
        <el-option label="已驳回" value="已驳回" />
        <el-option label="已作废" value="已作废" />
      </el-select>
    </div>

    <div class="flex items-center gap-3 mt-4">
      <!-- 部门筛选 -->
      <el-select v-model="localDepartment" placeholder="部门" clearable size="default" style="width: 160px">
        <el-option v-for="d in departmentOptions" :key="d" :label="d" :value="d" />
      </el-select>

      <div class="flex-1" />

      <!-- 重置按钮 -->
      <el-button size="default" @click="handleReset">重置</el-button>

      <!-- 搜索按钮 -->
      <el-button type="primary" size="default" @click="handleSearch">搜索</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  code: { type: String, default: '' },
  material: { type: String, default: '' },
  warehouse: { type: String, default: '' },
  applicant: { type: String, default: '' },
  status: { type: String, default: '' },
  department: { type: String, default: '' }
})

const emit = defineEmits(['update:code', 'update:material', 'update:warehouse', 'update:applicant', 'update:status', 'update:department', 'reset', 'search'])

const warehouseOptions = ['A区-01', 'A区-02', 'B区-03', 'C区-05']
const departmentOptions = ['生产部', '种植部', '设备部', '技术部']

const localCode = ref(props.code)
const localMaterial = ref(props.material)
const localWarehouse = ref(props.warehouse)
const localApplicant = ref(props.applicant)
const localStatus = ref(props.status)
const localDepartment = ref(props.department)

watch(() => props.code, (val) => { localCode.value = val })
watch(() => props.material, (val) => { localMaterial.value = val })
watch(() => props.warehouse, (val) => { localWarehouse.value = val })
watch(() => props.applicant, (val) => { localApplicant.value = val })
watch(() => props.status, (val) => { localStatus.value = val })
watch(() => props.department, (val) => { localDepartment.value = val })

const handleReset = () => {
  localCode.value = ''
  localMaterial.value = ''
  localWarehouse.value = ''
  localApplicant.value = ''
  localStatus.value = ''
  localDepartment.value = ''
  emit('reset')
}

const handleSearch = () => {
  emit('update:code', localCode.value)
  emit('update:material', localMaterial.value)
  emit('update:warehouse', localWarehouse.value)
  emit('update:applicant', localApplicant.value)
  emit('update:status', localStatus.value)
  emit('update:department', localDepartment.value)
  emit('search')
}
</script>
