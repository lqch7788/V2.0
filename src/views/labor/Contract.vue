<template>
  <div class="space-y-4 p-4">
    <div class="bg-[#F2F6FA] rounded-lg p-3 flex flex-wrap gap-3 items-end">
      <el-input v-model="filters.workerName" placeholder="搜索员工" size="default" class="!w-40" clearable />
      <el-select v-model="filters.department" placeholder="部门" size="default" class="!w-32" clearable><el-option v-for="d in depts" :key="d" :label="d" :value="d" /></el-select>
      <el-select v-model="filters.contractType" placeholder="合同类型" size="default" class="!w-32" clearable><el-option label="劳动合同" value="劳动合同" /><el-option label="劳务协议" value="劳务协议" /></el-select>
      <el-select v-model="filters.status" placeholder="状态" size="default" class="!w-28" clearable><el-option label="生效中" value="生效中" /><el-option label="即将到期" value="即将到期" /><el-option label="已到期" value="已到期" /></el-select>
      <div class="flex gap-2"><el-button @click="handleReset">重置</el-button><el-button type="primary" @click="handleSearch">搜索</el-button></div>
    </div>
    <div class="border border-gray-200 rounded-xl overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex justify-between items-center"><h3 class="text-lg font-semibold">合同列表</h3><el-button type="primary" size="small" @click="openCreate"><el-icon :size="14"><Plus /></el-icon> 新建合同</el-button></div>
      <el-table :data="filteredData" stripe border>
        <el-table-column prop="workerName" label="员工姓名" width="100" />
        <el-table-column prop="department" label="部门" width="100" />
        <el-table-column prop="contractType" label="合同类型" width="100" />
        <el-table-column prop="startDate" label="开始日期" width="110" />
        <el-table-column prop="endDate" label="到期日期" width="110" />
        <el-table-column prop="status" label="状态" width="100"><template #default="{row}"><el-tag :type="row.status==='生效中'?'success':row.status==='即将到期'?'warning':'danger'" size="small">{{row.status}}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="100"><template #default="{row}"><el-button link size="small" @click="openDetail(row)">详情</el-button></template></el-table-column>
      </el-table>
    </div>
    <ElModal v-model="createVisible" title="新建合同" size="md" @submit="handleSubmit" @cancel="createVisible=false">
      <div class="grid grid-cols-2 gap-4">
        <div><label class="text-sm font-medium mb-1 block">员工</label><el-select v-model="form.workerName" class="w-full"><el-option v-for="w in workers" :key="w" :label="w" :value="w" /></el-select></div>
        <div><label class="text-sm font-medium mb-1 block">合同类型</label><el-select v-model="form.contractType" class="w-full"><el-option label="劳动合同" value="劳动合同" /><el-option label="劳务协议" value="劳务协议" /></el-select></div>
        <div><label class="text-sm font-medium mb-1 block">开始日期</label><el-date-picker v-model="form.startDate" type="date" class="w-full" value-format="YYYY-MM-DD" /></div>
        <div><label class="text-sm font-medium mb-1 block">到期日期</label><el-date-picker v-model="form.endDate" type="date" class="w-full" value-format="YYYY-MM-DD" /></div>
        <div class="col-span-2"><label class="text-sm font-medium mb-1 block">备注</label><el-input v-model="form.remark" type="textarea" :rows="2" /></div>
      </div>
    </ElModal>
    <ElModal v-model="detailVisible" title="合同详情" size="md" :show-submit="false" cancel-text="关闭">
      <div v-if="detail" class="grid grid-cols-2 gap-3">
        <div><span class="text-gray-500">员工：</span>{{detail.workerName}}</div><div><span class="text-gray-500">部门：</span>{{detail.department}}</div>
        <div><span class="text-gray-500">类型：</span>{{detail.contractType}}</div><div><span class="text-gray-500">状态：</span><el-tag size="small">{{detail.status}}</el-tag></div>
        <div><span class="text-gray-500">开始：</span>{{detail.startDate}}</div><div><span class="text-gray-500">到期：</span>{{detail.endDate}}</div>
      </div>
    </ElModal>
  </div>
</template>
<script setup>
import {ref,reactive,computed}from'vue';import {Plus}from'@element-plus/icons-vue';import ElModal from'@/components/ui/ElModal.vue'
const depts=['种植部','采收部'];const workers=['张三','李四','王五']
const records=ref([{id:'1',workerName:'张三',department:'种植部',contractType:'劳动合同',startDate:'2024-01-01',endDate:'2027-01-01',status:'生效中'},{id:'2',workerName:'李四',department:'采收部',contractType:'劳动合同',startDate:'2023-06-01',endDate:'2026-06-01',status:'即将到期'}])
const filters=reactive({workerName:'',department:'',contractType:'',status:''})
const filteredData=computed(()=>records.value.filter(r=>{if(filters.workerName&&!r.workerName.includes(filters.workerName))return false;if(filters.department&&r.department!==filters.department)return false;if(filters.contractType&&r.contractType!==filters.contractType)return false;if(filters.status&&r.status!==filters.status)return false;return true}))
const handleReset=()=>{filters.workerName='';filters.department='';filters.contractType='';filters.status=''}
const handleSearch=()=>{}
const createVisible=ref(false);const form=reactive({workerName:'',contractType:'劳动合同',startDate:'',endDate:'',remark:''})
const openCreate=()=>{Object.assign(form,{workerName:'',contractType:'劳动合同',startDate:'',endDate:'',remark:''});createVisible.value=true}
const handleSubmit=()=>{records.value.unshift({id:String(Date.now()),department:'',...form,status:'生效中'});createVisible.value=false}
const detail=ref(null);const detailVisible=ref(false);const openDetail=(r)=>{detail.value=r;detailVisible.value=true}
</script>
