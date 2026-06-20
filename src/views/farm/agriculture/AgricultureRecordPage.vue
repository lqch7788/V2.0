<!--
  农事记录主页
  对标 V1.1 src/components/farm/agriculture/AgricultureRecordPage.tsx
-->
<template>
  <div class="space-y-4">
    <AgricultureRecordPageHeader>
      <template #actions>
        <el-button type="primary" @click="showAdd = true">
          <el-icon><Plus /></el-icon>
          新增记录
        </el-button>
      </template>
    </AgricultureRecordPageHeader>
    <AgricultureRecordFilterToolbar @change="handleFilterChange" />
    <div class="bg-white rounded-xl shadow-sm p-4">
      <el-table v-loading="loading" :data="filteredData" border stripe>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="code" label="记录编号" width="140">
          <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
        </el-table-column>
        <el-table-column label="操作类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ typeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operatorName" label="操作人" min-width="100" />
        <el-table-column prop="greenhouseName" label="温室" min-width="120" />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="amount" label="用量" width="100" align="right" />
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
      </el-table>
    </div>
    <AgricultureRecordPagination
      :total="filteredData.length"
      :page-size="20"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />
    <AddOperationRecordModal v-model="showAdd" @submit="handleAdd" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import AgricultureRecordPageHeader from './components/AgricultureRecordPageHeader.vue'
import AgricultureRecordFilterToolbar from './components/AgricultureRecordFilterToolbar.vue'
import AgricultureRecordPagination from './components/AgricultureRecordPagination.vue'
import AddOperationRecordModal from './modals/AddOperationRecordModal.vue'

const data = ref([])
const loading = ref(false)
const showAdd = ref(false)
const filters = ref({})

const TYPE_MAP = { planting: '种植', fertilizer: '施肥', irrigation: '浇水', weeding: '除草', pest: '病虫害' }
const typeText = (t) => TYPE_MAP[t] || t

const filteredData = computed(() => {
  const f = filters.value
  return data.value.filter((d) => {
    if (f.keyword && !d.code?.includes(f.keyword) && !d.remark?.includes(f.keyword)) return false
    if (f.type && d.type !== f.type) return false
    return true
  })
})

const loadData = () => {
  loading.value = true
  data.value = [
    { code: 'AGR001', type: 'planting', operatorName: '张三', greenhouseName: 'A-01温室', date: '2026-06-15', amount: 100, remark: '番茄种植' },
    { code: 'AGR002', type: 'fertilizer', operatorName: '李四', greenhouseName: 'A-02温室', date: '2026-06-16', amount: 5, remark: '氮肥追施' },
  ]
  loading.value = false
}

const handleFilterChange = (f) => (filters.value = f)
const handlePageChange = (p) => console.log('page', p)
const handleSizeChange = (s) => console.log('size', s)
const handleAdd = (item) => {
  data.value.unshift({ ...item, code: `AGR${String(data.value.length + 1).padStart(3, '0')}`, operatorName: '当前用户' })
  showAdd.value = false
}

onMounted(loadData)
</script>