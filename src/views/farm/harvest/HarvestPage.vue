<!--
  采收管理主页
  对标 V1.1 src/components/farm/harvest/HarvestPage.tsx
-->
<template>
  <div class="space-y-4">
    <HarvestPageHeader>
      <template #actions>
        <el-button type="primary">
          <el-icon><Plus /></el-icon>
          新增采收
        </el-button>
      </template>
    </HarvestPageHeader>
    <HarvestStatsCards
      :total-yield="12500"
      :total-count="86"
      :pass-rate="92"
      :stored-yield="11000"
    />
    <HarvestFilterToolbar @change="handleFilter" />
    <div class="bg-white rounded-xl shadow-sm p-4">
      <el-table :data="harvests" border stripe>
        <el-table-column prop="code" label="采收批次" width="140">
          <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
        </el-table-column>
        <el-table-column prop="varietyName" label="品种" min-width="140" />
        <el-table-column prop="greenhouseName" label="温室" min-width="120" />
        <el-table-column prop="harvesterName" label="采收人" min-width="100" />
        <el-table-column prop="harvestDate" label="采收日期" width="120" />
        <el-table-column prop="yield" label="采收量(kg)" width="120" align="right" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'stored' ? 'success' : 'warning'" size="small">
              {{ row.status === 'stored' ? '已入库' : '已完成' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import HarvestPageHeader from './components/HarvestPageHeader.vue'
import HarvestStatsCards from './components/HarvestStatsCards.vue'
import HarvestFilterToolbar from './components/HarvestFilterToolbar.vue'

const harvests = ref([
  { code: 'HAR001', varietyName: '番茄', greenhouseName: 'A-01', harvesterName: '张三', harvestDate: '2026-06-15', yield: 150, status: 'stored' },
  { code: 'HAR002', varietyName: '生菜', greenhouseName: 'A-02', harvesterName: '李四', harvestDate: '2026-06-16', yield: 80, status: 'completed' },
])

const handleFilter = (f) => console.log('filter', f)
</script>