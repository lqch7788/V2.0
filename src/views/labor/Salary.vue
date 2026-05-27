<template>
  <div class="space-y-4 p-4">
    <div class="bg-[#F2F6FA] rounded-lg p-3 flex flex-wrap gap-3 items-end">
      <el-input v-model="filters.workerName" placeholder="搜索姓名" size="default" class="!w-40" clearable />
      <el-select v-model="filters.department" placeholder="部门" size="default" class="!w-32" clearable><el-option v-for="d in depts" :key="d" :label="d" :value="d" /></el-select>
      <el-date-picker v-model="filters.month" type="month" placeholder="选择月份" size="default" value-format="YYYY-MM" />
      <div class="flex gap-2"><el-button @click="handleReset">重置</el-button><el-button type="primary" @click="handleSearch">搜索</el-button></div>
    </div>
    <div class="border border-gray-200 rounded-xl overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex justify-between items-center"><h3 class="text-lg font-semibold">薪资记录</h3><el-button size="small" @click="handleExport"><el-icon :size="14"><Download /></el-icon> 导出</el-button></div>
      <el-table :data="filteredData" stripe border>
        <el-table-column prop="workerName" label="姓名" width="100" />
        <el-table-column prop="department" label="部门" width="100" />
        <el-table-column prop="month" label="月份" width="100" />
        <el-table-column prop="baseSalary" label="基本工资" width="110"><template #default="{row}">¥{{row.baseSalary.toLocaleString()}}</template></el-table-column>
        <el-table-column prop="bonus" label="奖金" width="100"><template #default="{row}">¥{{row.bonus.toLocaleString()}}</template></el-table-column>
        <el-table-column prop="deduction" label="扣款" width="100"><template #default="{row}">¥{{row.deduction.toLocaleString()}}</template></el-table-column>
        <el-table-column prop="total" label="实发" width="110"><template #default="{row}"><span class="font-bold">¥{{(row.baseSalary+row.bonus-row.deduction).toLocaleString()}}</span></template></el-table-column>
        <el-table-column label="操作" width="80"><template #default="{row}"><el-button link size="small" @click="openDetail(row)">详情</el-button></template></el-table-column>
      </el-table>
    </div>
    <ElModal v-model="detailVisible" title="薪资详情" size="sm" :show-submit="false" cancel-text="关闭">
      <div v-if="detail" class="space-y-2">
        <div class="flex justify-between"><span class="text-gray-500">姓名</span><span>{{detail.workerName}}</span></div>
        <div class="flex justify-between"><span class="text-gray-500">月份</span><span>{{detail.month}}</span></div>
        <div class="flex justify-between"><span class="text-gray-500">基本工资</span><span>¥{{detail.baseSalary.toLocaleString()}}</span></div>
        <div class="flex justify-between"><span class="text-gray-500">奖金</span><span class="text-green-600">¥{{detail.bonus.toLocaleString()}}</span></div>
        <div class="flex justify-between"><span class="text-gray-500">扣款</span><span class="text-red-600">¥{{detail.deduction.toLocaleString()}}</span></div>
        <hr class="border-gray-200" />
        <div class="flex justify-between font-bold"><span>实发</span><span class="text-emerald-600">¥{{(detail.baseSalary+detail.bonus-detail.deduction).toLocaleString()}}</span></div>
      </div>
    </ElModal>
  </div>
</template>
<script setup>
import {ref,reactive,computed}from'vue';import {Download}from'@element-plus/icons-vue';import ElModal from'@/components/ui/ElModal.vue'
const depts=['种植部','采收部']
const records=ref([{id:'1',workerName:'张三',department:'种植部',month:'2026-05',baseSalary:8000,bonus:1500,deduction:200},{id:'2',workerName:'李四',department:'采收部',month:'2026-05',baseSalary:12000,bonus:2000,deduction:0}])
const filters=reactive({workerName:'',department:'',month:''})
const filteredData=computed(()=>records.value.filter(r=>{if(filters.workerName&&!r.workerName.includes(filters.workerName))return false;if(filters.department&&r.department!==filters.department)return false;return true}))
const handleReset=()=>{filters.workerName='';filters.department='';filters.month=''};const handleSearch=()=>{}
const detail=ref(null);const detailVisible=ref(false);const openDetail=(r)=>{detail.value=r;detailVisible.value=true}
const handleExport=()=>{const h='姓名,部门,月份,基本工资,奖金,扣款,实发';const r=filteredData.value.map(r=>`${r.workerName},${r.department},${r.month},${r.baseSalary},${r.bonus},${r.deduction},${r.baseSalary+r.bonus-r.deduction}`);const b=new Blob(['\uFEFF'+h+'\n'+r.join('\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='薪资记录.csv';a.click()}
</script>
