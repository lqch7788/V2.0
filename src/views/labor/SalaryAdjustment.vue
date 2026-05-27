<template>
  <div class="space-y-4 p-4">
    <div class="bg-[#F2F6FA] rounded-lg p-3 flex flex-wrap gap-3 items-end">
      <el-input v-model="filters.workerName" placeholder="搜索员工姓名" size="default" class="!w-40" clearable />
      <el-select v-model="filters.department" placeholder="部门" size="default" class="!w-32" clearable><el-option v-for="d in depts" :key="d" :label="d" :value="d" /></el-select>
      <el-select v-model="filters.status" placeholder="状态" size="default" class="!w-28" clearable><el-option label="待审批" value="待审批" /><el-option label="已通过" value="已通过" /><el-option label="已驳回" value="已驳回" /></el-select>
      <div class="flex gap-2"><el-button @click="handleReset">重置</el-button><el-button type="primary" @click="handleSearch">搜索</el-button></div>
    </div>

    <div class="border border-gray-200 rounded-xl overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900">调薪记录</h3>
        <div class="flex gap-2">
          <el-button type="primary" size="small" @click="openCreate"><el-icon :size="14"><Plus /></el-icon> 新增调薪</el-button>
          <el-button size="small" @click="handleExport"><el-icon :size="14"><Download /></el-icon> 导出</el-button>
        </div>
      </div>
      <el-table :data="filteredData" stripe border @selection-change="s=>selected=s.map(r=>r.id)">
        <el-table-column type="selection" width="48" />
        <el-table-column prop="workerName" label="员工姓名" width="100" />
        <el-table-column prop="department" label="部门" width="100" />
        <el-table-column prop="position" label="岗位" width="100" />
        <el-table-column prop="beforeSalary" label="调前薪资" width="110"><template #default="{row}">¥{{row.beforeSalary?.toLocaleString()}}</template></el-table-column>
        <el-table-column prop="afterSalary" label="调后薪资" width="110"><template #default="{row}">¥{{row.afterSalary?.toLocaleString()}}</template></el-table-column>
        <el-table-column prop="adjustAmount" label="调整金额" width="100"><template #default="{row}"><span :class="row.afterSalary>row.beforeSalary?'text-green-600':'text-red-600'">{{row.afterSalary>row.beforeSalary?'+':''}}¥{{(row.afterSalary-row.beforeSalary).toLocaleString()}}</span></template></el-table-column>
        <el-table-column prop="adjustType" label="调薪类型" width="100"><template #default="{row}"><el-tag size="small">{{row.adjustType}}</el-tag></template></el-table-column>
        <el-table-column prop="effectiveDate" label="生效日期" width="110" />
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
    <div class="flex justify-end"><el-pagination v-model:current-page="page" v-model:page-size="size" :total="filteredData.length" :page-sizes="[10,20,50]" layout="total,sizes,prev,pager,next" background /></div>

    <ElModal v-model="createVisible" title="新增调薪申请" size="lg" @submit="handleSubmit" @cancel="createVisible=false">
      <div class="grid grid-cols-2 gap-4">
        <div><label class="text-sm font-medium text-gray-700 mb-1 block">员工姓名 <span class="text-red-500">*</span></label><el-select v-model="form.workerName" class="w-full"><el-option v-for="w in workers" :key="w" :label="w" :value="w" /></el-select></div>
        <div><label class="text-sm font-medium text-gray-700 mb-1 block">部门</label><el-input v-model="form.department" disabled /></div>
        <div><label class="text-sm font-medium text-gray-700 mb-1 block">当前薪资</label><el-input-number v-model="form.beforeSalary" :min="0" class="w-full" disabled /></div>
        <div><label class="text-sm font-medium text-gray-700 mb-1 block">调整后薪资 <span class="text-red-500">*</span></label><el-input-number v-model="form.afterSalary" :min="0" :step="100" class="w-full" /></div>
        <div><label class="text-sm font-medium text-gray-700 mb-1 block">调薪类型</label><el-select v-model="form.adjustType" class="w-full"><el-option label="年度普调" value="年度普调" /><el-option label="晋升调薪" value="晋升调薪" /><el-option label="特殊调薪" value="特殊调薪" /></el-select></div>
        <div><label class="text-sm font-medium text-gray-700 mb-1 block">生效日期 <span class="text-red-500">*</span></label><el-date-picker v-model="form.effectiveDate" type="date" class="w-full" value-format="YYYY-MM-DD" /></div>
        <div class="col-span-2"><label class="text-sm font-medium text-gray-700 mb-1 block">调薪原因</label><el-input v-model="form.reason" type="textarea" :rows="3" /></div>
      </div>
    </ElModal>

    <ElModal v-model="detailVisible" title="调薪详情" size="md" :show-submit="false" cancel-text="关闭">
      <div v-if="detail" class="grid grid-cols-2 gap-3">
        <div><span class="text-gray-500 text-sm">员工：</span><span class="text-sm">{{detail.workerName}}</span></div>
        <div><span class="text-gray-500 text-sm">部门：</span><span class="text-sm">{{detail.department}}</span></div>
        <div><span class="text-gray-500 text-sm">岗位：</span><span class="text-sm">{{detail.position}}</span></div>
        <div><span class="text-gray-500 text-sm">状态：</span><el-tag :type="tagType(detail.status)" size="small">{{detail.status}}</el-tag></div>
        <div><span class="text-gray-500 text-sm">调前薪资：</span><span class="text-sm">¥{{detail.beforeSalary?.toLocaleString()}}</span></div>
        <div><span class="text-gray-500 text-sm">调后薪资：</span><span class="text-sm font-bold text-green-600">¥{{detail.afterSalary?.toLocaleString()}}</span></div>
        <div><span class="text-gray-500 text-sm">调整金额：</span><span class="text-sm" :class="detail.afterSalary>detail.beforeSalary?'text-green-600':'text-red-600'">{{detail.afterSalary>detail.beforeSalary?'+':''}}¥{{(detail.afterSalary-detail.beforeSalary).toLocaleString()}}</span></div>
        <div><span class="text-gray-500 text-sm">生效日期：</span><span class="text-sm">{{detail.effectiveDate}}</span></div>
        <div class="col-span-2" v-if="detail.reason"><span class="text-gray-500 text-sm">原因：</span><p class="text-sm mt-1 bg-gray-50 p-2 rounded">{{detail.reason}}</p></div>
      </div>
    </ElModal>
  </div>
</template>

<script setup>
import {ref,reactive,computed}from'vue'
import {Plus,Download,View,Select,CloseBold}from'@element-plus/icons-vue'
import ElModal from'@/components/ui/ElModal.vue'

const depts=['种植部','采收部','行政部'];const workers=['张三','李四','王五','赵六']
const records=ref([
  {id:'1',workerName:'张三',department:'种植部',position:'技术员',beforeSalary:8000,afterSalary:9500,adjustType:'晋升调薪',effectiveDate:'2026-07-01',status:'待审批',reason:'技术等级提升'},
  {id:'2',workerName:'李四',department:'采收部',position:'主管',beforeSalary:12000,afterSalary:13500,adjustType:'年度普调',effectiveDate:'2026-06-01',status:'已通过',reason:''},
])
const filters=reactive({workerName:'',department:'',status:''})
const page=ref(1);const size=ref(10);const selected=ref([])
const filteredData=computed(()=>records.value.filter(r=>{if(filters.workerName&&!r.workerName.includes(filters.workerName))return false;if(filters.department&&r.department!==filters.department)return false;if(filters.status&&r.status!==filters.status)return false;return true}))
const handleReset=()=>{filters.workerName='';filters.department='';filters.status=''}
const handleSearch=()=>{}

const createVisible=ref(false)
const form=reactive({workerName:'',department:'',beforeSalary:0,afterSalary:0,adjustType:'年度普调',effectiveDate:'',reason:''})
const openCreate=()=>{Object.assign(form,{workerName:'',department:'',beforeSalary:0,afterSalary:0,adjustType:'年度普调',effectiveDate:'',reason:''});createVisible.value=true}
const handleSubmit=()=>{if(!form.workerName){alert('请选择员工');return};records.value.unshift({id:String(Date.now()),position:'',...form,status:'待审批'});createVisible.value=false}

const detail=ref(null);const detailVisible=ref(false)
const openDetail=(r)=>{detail.value=r;detailVisible.value=true}
const handleExport=()=>{const h='员工,部门,调前薪资,调后薪资,调整类型,生效日期,状态';const r=filteredData.value.map(r=>`${r.workerName},${r.department},${r.beforeSalary},${r.afterSalary},${r.adjustType},${r.effectiveDate},${r.status}`);const b=new Blob(['\uFEFF'+h+'\n'+r.join('\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='调薪记录.csv';a.click()}
const tagType=s=>({待审批:'warning',已通过:'success',已驳回:'danger'}[s]||'info')
</script>
