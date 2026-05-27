<template>
  <div class="space-y-4 p-4">
    <div class="bg-[#F2F6FA] rounded-lg p-3 flex flex-wrap gap-3 items-end">
      <el-input v-model="filters.workerName" placeholder="搜索员工姓名" size="default" class="!w-40" clearable />
      <el-select v-model="filters.department" placeholder="部门" size="default" class="!w-32" clearable><el-option v-for="d in depts" :key="d" :label="d" :value="d" /></el-select>
      <el-date-picker v-model="filters.dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" size="default" value-format="YYYY-MM-DD" />
      <el-select v-model="filters.status" placeholder="状态" size="default" class="!w-28" clearable><el-option label="待审批" value="待审批" /><el-option label="已通过" value="已通过" /><el-option label="已驳回" value="已驳回" /></el-select>
      <div class="flex gap-2"><el-button @click="handleReset">重置</el-button><el-button type="primary" @click="handleSearch">搜索</el-button></div>
    </div>

    <div class="border border-gray-200 rounded-xl overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900">考勤补修记录</h3>
        <el-button type="primary" size="small" @click="openCreate"><el-icon :size="14"><Plus /></el-icon> 新增补修</el-button>
      </div>
      <el-table :data="filteredData" stripe border>
        <el-table-column prop="workerName" label="员工姓名" width="100" />
        <el-table-column prop="department" label="部门" width="100" />
        <el-table-column prop="repairDate" label="补修日期" width="110" />
        <el-table-column prop="repairType" label="补修类型" width="100"><template #default="{row}"><el-tag size="small">{{row.repairType}}</el-tag></template></el-table-column>
        <el-table-column prop="originalDate" label="原缺勤日期" width="110" />
        <el-table-column prop="reason" label="补修原因" min-width="150" show-overflow-tooltip />
        <el-table-column prop="hours" label="小时数" width="80" />
        <el-table-column prop="status" label="状态" width="100"><template #default="{row}"><el-tag :type="tagType(row.status)" size="small">{{row.status}}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{row}">
            <el-button link size="small" @click="openDetail(row)"><el-icon :size="16"><View /></el-icon></el-button>
            <template v-if="row.status==='待审批'">
              <el-button link size="small" type="success" @click="row.status='已通过'"><el-icon :size="16"><Select /></el-icon></el-button>
              <el-button link size="small" type="danger" @click="row.status='已驳回'"><el-icon :size="16"><CloseBold /></el-icon></el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <ElModal v-model="createVisible" title="新增考勤补修" size="md" @submit="handleSubmit" @cancel="createVisible=false">
      <div class="grid grid-cols-2 gap-4">
        <div><label class="text-sm font-medium text-gray-700 mb-1 block">员工姓名 <span class="text-red-500">*</span></label><el-select v-model="form.workerName" class="w-full"><el-option v-for="w in workers" :key="w" :label="w" :value="w" /></el-select></div>
        <div><label class="text-sm font-medium text-gray-700 mb-1 block">部门</label><el-input v-model="form.department" disabled /></div>
        <div><label class="text-sm font-medium text-gray-700 mb-1 block">补修日期 <span class="text-red-500">*</span></label><el-date-picker v-model="form.repairDate" type="date" class="w-full" value-format="YYYY-MM-DD" /></div>
        <div><label class="text-sm font-medium text-gray-700 mb-1 block">原缺勤日期 <span class="text-red-500">*</span></label><el-date-picker v-model="form.originalDate" type="date" class="w-full" value-format="YYYY-MM-DD" /></div>
        <div><label class="text-sm font-medium text-gray-700 mb-1 block">补修类型</label><el-select v-model="form.repairType" class="w-full"><el-option label="事假补修" value="事假补修" /><el-option label="病假补修" value="病假补修" /><el-option label="调休补修" value="调休补修" /></el-select></div>
        <div><label class="text-sm font-medium text-gray-700 mb-1 block">小时数</label><el-input-number v-model="form.hours" :min="0.5" :max="24" :step="0.5" class="w-full" /></div>
        <div class="col-span-2"><label class="text-sm font-medium text-gray-700 mb-1 block">补修原因</label><el-input v-model="form.reason" type="textarea" :rows="3" /></div>
      </div>
    </ElModal>

    <ElModal v-model="detailVisible" title="考勤补修详情" size="md" :show-submit="false" cancel-text="关闭">
      <div v-if="detail" class="grid grid-cols-2 gap-3">
        <div><span class="text-gray-500 text-sm">员工：</span><span class="text-sm">{{detail.workerName}}</span></div>
        <div><span class="text-gray-500 text-sm">部门：</span><span class="text-sm">{{detail.department}}</span></div>
        <div><span class="text-gray-500 text-sm">补修日期：</span><span class="text-sm">{{detail.repairDate}}</span></div>
        <div><span class="text-gray-500 text-sm">原缺勤日期：</span><span class="text-sm">{{detail.originalDate}}</span></div>
        <div><span class="text-gray-500 text-sm">类型：</span><span class="text-sm">{{detail.repairType}}</span></div>
        <div><span class="text-gray-500 text-sm">小时数：</span><span class="text-sm">{{detail.hours}}h</span></div>
        <div><span class="text-gray-500 text-sm">状态：</span><el-tag :type="tagType(detail.status)" size="small">{{detail.status}}</el-tag></div>
        <div class="col-span-2" v-if="detail.reason"><span class="text-gray-500 text-sm">原因：</span><p class="text-sm mt-1 bg-gray-50 p-2 rounded">{{detail.reason}}</p></div>
      </div>
    </ElModal>
  </div>
</template>

<script setup>
import {ref,reactive,computed}from'vue'
import {Plus,View,Select,CloseBold}from'@element-plus/icons-vue'
import ElModal from'@/components/ui/ElModal.vue'

const depts=['种植部','采收部','行政部']
const workers=['张三','李四','王五']

const records=ref([
  {id:'1',workerName:'张三',department:'种植部',repairDate:'2026-06-01',repairType:'事假补修',originalDate:'2026-05-20',reason:'个人事务',hours:4,status:'待审批'},
  {id:'2',workerName:'李四',department:'采收部',repairDate:'2026-05-28',repairType:'病假补修',originalDate:'2026-05-15',reason:'身体不适',hours:8,status:'已通过'},
])

const filters=reactive({workerName:'',department:'',dateRange:'',status:''})
const filteredData=computed(()=>records.value.filter(r=>{if(filters.workerName&&!r.workerName.includes(filters.workerName))return false;if(filters.department&&r.department!==filters.department)return false;if(filters.status&&r.status!==filters.status)return false;return true}))
const handleReset=()=>{filters.workerName='';filters.department='';filters.dateRange='';filters.status=''}
const handleSearch=()=>{}

const createVisible=ref(false)
const form=reactive({workerName:'',department:'',repairDate:'',repairType:'事假补修',originalDate:'',reason:'',hours:4})
const openCreate=()=>{Object.assign(form,{workerName:'',department:'',repairDate:'',repairType:'事假补修',originalDate:'',reason:'',hours:4});createVisible.value=true}
const handleSubmit=()=>{if(!form.workerName){alert('请选择员工');return};records.value.unshift({id:String(Date.now()),...form,status:'待审批'});createVisible.value=false}

const detail=ref(null);const detailVisible=ref(false)
const openDetail=(r)=>{detail.value=r;detailVisible.value=true}

const tagType=s=>({待审批:'warning',已通过:'success',已驳回:'danger'}[s]||'info')
</script>
