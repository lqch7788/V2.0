<template>
  <div class="space-y-4 p-4">
    <div class="bg-[#F2F6FA] rounded-lg p-3 flex flex-wrap gap-3 items-end">
      <el-input v-model="filters.workerName" placeholder="搜索姓名" size="default" class="!w-40" clearable />
      <el-select v-model="filters.department" placeholder="部门" size="default" class="!w-32" clearable><el-option v-for="d in depts" :key="d" :label="d" :value="d" /></el-select>
      <el-select v-model="filters.status" placeholder="状态" size="default" class="!w-28" clearable><el-option label="待入职" value="待入职" /><el-option label="已入职" value="已入职" /></el-select>
      <div class="flex gap-2"><el-button @click="handleReset">重置</el-button><el-button type="primary" @click="handleSearch">搜索</el-button></div>
    </div>
    <div class="border border-gray-200 rounded-xl overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex justify-between items-center"><h3 class="text-lg font-semibold">入职记录</h3><el-button type="primary" size="small" @click="openCreate"><el-icon :size="14"><Plus /></el-icon> 新增入职</el-button></div>
      <el-table :data="filteredData" stripe border>
        <el-table-column prop="workerName" label="姓名" width="100" />
        <el-table-column prop="department" label="部门" width="100" />
        <el-table-column prop="position" label="岗位" width="100" />
        <el-table-column prop="entryDate" label="入职日期" width="110" />
        <el-table-column prop="status" label="状态" width="100"><template #default="{row}"><el-tag :type="row.status==='已入职'?'success':'warning'" size="small">{{row.status}}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="100"><template #default="{row}"><el-button link size="small" @click="openDetail(row)">详情</el-button></template></el-table-column>
      </el-table>
    </div>
    <ElModal v-model="createVisible" title="新增入职" size="md" @submit="handleSubmit" @cancel="createVisible=false">
      <div class="grid grid-cols-2 gap-4">
        <div><label class="text-sm font-medium mb-1 block">姓名</label><el-input v-model="form.workerName" /></div>
        <div><label class="text-sm font-medium mb-1 block">部门</label><el-select v-model="form.department" class="w-full"><el-option v-for="d in depts" :key="d" :label="d" :value="d" /></el-select></div>
        <div><label class="text-sm font-medium mb-1 block">岗位</label><el-input v-model="form.position" /></div>
        <div><label class="text-sm font-medium mb-1 block">入职日期</label><el-date-picker v-model="form.entryDate" type="date" class="w-full" value-format="YYYY-MM-DD" /></div>
      </div>
    </ElModal>
    <ElModal v-model="detailVisible" title="入职详情" size="md" :show-submit="false" cancel-text="关闭">
      <div v-if="detail" class="grid grid-cols-2 gap-3">
        <div><span class="text-gray-500">姓名：</span>{{detail.workerName}}</div><div><span class="text-gray-500">部门：</span>{{detail.department}}</div>
        <div><span class="text-gray-500">岗位：</span>{{detail.position}}</div><div><span class="text-gray-500">入职日期：</span>{{detail.entryDate}}</div>
        <div><span class="text-gray-500">状态：</span><el-tag size="small">{{detail.status}}</el-tag></div>
      </div>
    </ElModal>
  </div>
</template>
<script setup>
import {ref,reactive,computed}from'vue';import {Plus}from'@element-plus/icons-vue';import ElModal from'@/components/ui/ElModal.vue'
const depts=['种植部','采收部','行政部']
const records=ref([{id:'1',workerName:'陈八',department:'种植部',position:'实习生',entryDate:'2026-07-01',status:'待入职'}])
const filters=reactive({workerName:'',department:'',status:''})
const filteredData=computed(()=>records.value.filter(r=>{if(filters.workerName&&!r.workerName.includes(filters.workerName))return false;if(filters.department&&r.department!==filters.department)return false;if(filters.status&&r.status!==filters.status)return false;return true}))
const handleReset=()=>{filters.workerName='';filters.department='';filters.status=''};const handleSearch=()=>{}
const createVisible=ref(false);const form=reactive({workerName:'',department:'',position:'',entryDate:''})
const openCreate=()=>{Object.assign(form,{workerName:'',department:'',position:'',entryDate:''});createVisible.value=true}
const handleSubmit=()=>{records.value.unshift({id:String(Date.now()),...form,status:'待入职'});createVisible.value=false}
const detail=ref(null);const detailVisible=ref(false);const openDetail=(r)=>{detail.value=r;detailVisible.value=true}
</script>
