<template>
  <div class="space-y-4 p-4">
    <!-- 统计卡片 -->
    <div class="grid grid-cols-3 gap-2">
      <div class="bg-amber-50 rounded-lg p-2 flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center"><el-icon :size="16" color="#d97706"><Clock /></el-icon></div>
        <div><p class="text-lg font-bold text-amber-700">{{ statusCounts.pending }}</p><p class="text-xs text-amber-600">待审批</p></div>
      </div>
      <div class="bg-green-50 rounded-lg p-2 flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center"><el-icon :size="16" color="#16a34a"><CircleCheckFilled /></el-icon></div>
        <div><p class="text-lg font-bold text-green-700">{{ statusCounts.approved }}</p><p class="text-xs text-green-600">已通过</p></div>
      </div>
      <div class="bg-red-50 rounded-lg p-2 flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center"><el-icon :size="16" color="#dc2626"><CircleCloseFilled /></el-icon></div>
        <div><p class="text-lg font-bold text-red-700">{{ statusCounts.rejected }}</p><p class="text-xs text-red-600">已驳回</p></div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-[#F2F6FA] rounded-lg p-3 flex flex-wrap gap-3 items-end">
      <div class="flex-1 min-w-[180px]"><el-input v-model="filters.workerName" placeholder="搜索员工姓名..." size="default" clearable /></div>
      <div class="w-[140px]"><el-select v-model="filters.resignationType" placeholder="离职类型" size="default" clearable><el-option v-for="o in typeOptions" :key="o" :label="o" :value="o" /></el-select></div>
      <div class="w-[140px]"><el-select v-model="filters.status" placeholder="状态" size="default" clearable><el-option label="待审批" value="待审批" /><el-option label="已通过" value="已通过" /><el-option label="已驳回" value="已驳回" /></el-select></div>
      <div class="flex gap-2"><el-button @click="handleReset">重置</el-button><el-button type="primary" @click="handleSearch"><el-icon :size="14"><Search /></el-icon> 搜索</el-button></div>
    </div>

    <!-- 表格 -->
    <div class="border border-gray-200 rounded-xl overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">离职申请记录</h3>
        <div class="flex gap-2">
          <template v-if="batchMode==='none'">
            <el-button type="primary" size="small" @click="openCreate"><el-icon :size="14"><Plus /></el-icon> 新增离职</el-button>
            <el-button size="small" @click="batchMode='approve'">批量通过</el-button>
            <el-button size="small" type="danger" @click="batchMode='reject'">批量驳回</el-button>
            <el-button size="small" @click="handleExport"><el-icon :size="14"><Download /></el-icon> 导出</el-button>
          </template>
          <template v-else>
            <el-button v-if="batchMode==='approve'" type="primary" size="small" :disabled="!selected.length" @click="handleBatchApprove">确认通过({{selected.length}})</el-button>
            <el-button v-if="batchMode==='reject'" type="danger" size="small" :disabled="!selected.length" @click="handleBatchReject">确认驳回({{selected.length}})</el-button>
            <el-button size="small" @click="batchMode='none';selected=[]">取消</el-button>
          </template>
        </div>
      </div>
      <el-table :data="filteredData" stripe border @selection-change="s=>selected=s.map(r=>r.id)">
        <el-table-column v-if="batchMode!=='none'" type="selection" width="48" />
        <el-table-column prop="resignationCode" label="离职编号" width="160" />
        <el-table-column prop="workerName" label="申请人" width="100" />
        <el-table-column prop="resignationType" label="离职类型" width="100" />
        <el-table-column prop="reason" label="离职原因" min-width="150" show-overflow-tooltip />
        <el-table-column prop="lastWorkingDay" label="最后工作日" width="110" />
        <el-table-column prop="handoverUser" label="交接人" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{row}"><el-tag :type="tagType(row.status)" size="small">{{row.status}}</el-tag></template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" width="120" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{row}">
            <el-button link size="small" @click="openDetail(row)"><el-icon :size="16"><View /></el-icon></el-button>
            <template v-if="row.status==='待审批'">
              <el-button link size="small" type="success" @click="handleApprove(row)"><el-icon :size="16"><Select /></el-icon></el-button>
              <el-button link size="small" type="danger" @click="handleReject(row)"><el-icon :size="16"><CloseBold /></el-icon></el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="flex justify-end"><el-pagination v-model:current-page="page" v-model:page-size="size" :total="filteredData.length" :page-sizes="[10,20,50]" layout="total,sizes,prev,pager,next" background /></div>

    <!-- 新增弹窗 -->
    <ElModal v-model="createVisible" title="新增离职申请" size="lg" @submit="handleSubmit" @cancel="createVisible=false">
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2"><label class="text-sm font-medium text-gray-700 mb-1 block">员工姓名 <span class="text-red-500">*</span></label><el-select v-model="form.workerName" placeholder="请选择" class="w-full" @change="onWorkerChange"><el-option v-for="w in workerList" :key="w" :label="w" :value="w" /></el-select></div>
        <div><label class="text-sm font-medium text-gray-700 mb-1 block">离职类型 <span class="text-red-500">*</span></label><el-select v-model="form.resignationType" class="w-full"><el-option v-for="o in typeOptions" :key="o" :label="o" :value="o" /></el-select></div>
        <div><label class="text-sm font-medium text-gray-700 mb-1 block">最后工作日 <span class="text-red-500">*</span></label><el-date-picker v-model="form.lastWorkingDay" type="date" class="w-full" value-format="YYYY-MM-DD" /></div>
        <div class="col-span-2"><label class="text-sm font-medium text-gray-700 mb-1 block">离职原因</label><el-input v-model="form.reason" type="textarea" :rows="3" /></div>
        <div><label class="text-sm font-medium text-gray-700 mb-1 block">交接人</label><el-select v-model="form.handoverUser" class="w-full" clearable><el-option v-for="w in workerList" :key="w" :label="w" :value="w" /></el-select></div>
        <div><label class="text-sm font-medium text-gray-700 mb-1 block">备注</label><el-input v-model="form.remark" placeholder="选填" /></div>
      </div>
    </ElModal>

    <!-- 详情弹窗 -->
    <ElModal v-model="detailVisible" title="离职申请详情" size="md" :show-submit="false" cancel-text="关闭">
      <div v-if="detail" class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div><span class="text-gray-500 text-sm">离职编号：</span><span class="text-sm">{{ detail.resignationCode }}</span></div>
          <div><span class="text-gray-500 text-sm">状态：</span><el-tag :type="tagType(detail.status)" size="small">{{ detail.status }}</el-tag></div>
          <div><span class="text-gray-500 text-sm">申请人：</span><span class="text-sm">{{ detail.workerName }}</span></div>
          <div><span class="text-gray-500 text-sm">离职类型：</span><span class="text-sm">{{ detail.resignationType }}</span></div>
          <div><span class="text-gray-500 text-sm">最后工作日：</span><span class="text-sm">{{ detail.lastWorkingDay }}</span></div>
          <div><span class="text-gray-500 text-sm">交接人：</span><span class="text-sm">{{ detail.handoverUser }}</span></div>
          <div class="col-span-2"><span class="text-gray-500 text-sm">离职原因：</span><p class="text-sm mt-1 bg-gray-50 p-2 rounded">{{ detail.reason }}</p></div>
        </div>
      </div>
    </ElModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Search, Plus, Download, View, Select, CloseBold, Clock, CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import ElModal from '@/components/ui/ElModal.vue'

const typeOptions = ['主动离职','协商解除','合同到期','试用期不合格','其他']
const workerList = ['张三','李四','王五','赵六','钱七']

const records = ref([
  {id:'1',resignationCode:'LZ-2026-001',workerName:'张三',resignationType:'主动离职',reason:'个人发展原因',lastWorkingDay:'2026-07-15',handoverUser:'李四',status:'待审批',createTime:'2026-05-20'},
  {id:'2',resignationCode:'LZ-2026-002',workerName:'王五',resignationType:'合同到期',reason:'合同到期不续签',lastWorkingDay:'2026-06-30',handoverUser:'赵六',status:'已通过',createTime:'2026-05-18'},
  {id:'3',resignationCode:'LZ-2026-003',workerName:'钱七',resignationType:'协商解除',reason:'协商解除劳动关系',lastWorkingDay:'2026-08-01',handoverUser:'张三',status:'已驳回',createTime:'2026-05-15'},
])

const filters = reactive({workerName:'',resignationType:'',status:''})
const page=ref(1);const size=ref(10)
const selected=ref([]);const batchMode=ref('none')

const filteredData = computed(()=>records.value.filter(r=>{
  if(filters.workerName&&!r.workerName.includes(filters.workerName))return false
  if(filters.resignationType&&r.resignationType!==filters.resignationType)return false
  if(filters.status&&r.status!==filters.status)return false
  return true
}))

const statusCounts = computed(()=>({
  pending:filteredData.value.filter(r=>r.status==='待审批').length,
  approved:filteredData.value.filter(r=>r.status==='已通过').length,
  rejected:filteredData.value.filter(r=>r.status==='已驳回').length,
}))

const handleReset=()=>{filters.workerName='';filters.resignationType='';filters.status=''}
const handleSearch=()=>{page.value=1}

const createVisible=ref(false)
const form=reactive({workerName:'',resignationType:'主动离职',lastWorkingDay:'',reason:'',handoverUser:'',remark:''})
const openCreate=()=>{Object.assign(form,{workerName:'',resignationType:'主动离职',lastWorkingDay:'',reason:'',handoverUser:'',remark:''});createVisible.value=true}
const onWorkerChange=()=>{}
const handleSubmit=()=>{
  if(!form.workerName){alert('请选择员工');return}
  records.value.unshift({id:String(Date.now()),resignationCode:'LZ-'+Date.now().toString(36).toUpperCase(),...form,status:'待审批',createTime:new Date().toISOString().slice(0,10)})
  createVisible.value=false
}

const detail=ref(null);const detailVisible=ref(false)
const openDetail=(r)=>{detail.value=r;detailVisible.value=true}

const handleApprove=(r)=>{r.status='已通过'}
const handleReject=(r)=>{r.status='已驳回'}
const handleBatchApprove=()=>{selected.value.forEach(id=>{const r=records.value.find(r=>r.id===id);if(r)r.status='已通过'});selected.value=[];batchMode.value='none'}
const handleBatchReject=()=>{selected.value.forEach(id=>{const r=records.value.find(r=>r.id===id);if(r)r.status='已驳回'});selected.value=[];batchMode.value='none'}

const handleExport=()=>{
  const h='离职编号,申请人,离职类型,离职原因,最后工作日,交接人,状态,申请时间'
  const rows=filteredData.value.map(r=>`${r.resignationCode},${r.workerName},${r.resignationType},${r.reason},${r.lastWorkingDay},${r.handoverUser},${r.status},${r.createTime}`)
  const b=new Blob(['\uFEFF'+h+'\n'+rows.join('\n')],{type:'text/csv;charset=utf-8'})
  const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='离职记录.csv';a.click()
}

const tagType=s=>({待审批:'warning',已通过:'success',已驳回:'danger'}[s]||'info')
</script>
