<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100">
    <!-- 标题和操作按钮栏 -->
    <div class="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">种植作物列表</h3>
      <div class="flex items-center gap-2">
        <el-button v-if="canCreate" type="primary" size="small" @click="$emit('add')">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
        <el-button v-if="canExport" size="small" @click="$emit('export')">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        <el-button size="small" type="primary" class="bg-purple-600 hover:bg-purple-700" @click="$emit('print')">
          <el-icon><Printer /></el-icon>
          标签打印
        </el-button>
      </div>
    </div>

    <!-- 表格 -->
    <el-table :data="paginatedData" border style="width: 100%" max-height="calc(100vh - 380px)">
      <el-table-column type="index" width="50" label="序号" align="center" />
      <el-table-column prop="plantCode" label="种植批号" width="140">
        <template #default="{ row }">
          <span class="font-mono text-blue-600 font-semibold cursor-pointer hover:text-blue-800 hover:underline" @click="$emit('detail', row)">
            {{ row.plantCode }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="productionPlanCode" label="关联生产计划" width="140">
        <template #default="{ row }">
          <span v-if="row.productionPlanCode" class="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs font-medium">
            {{ row.productionPlanCode }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="cropName" label="作物品种" width="100" />
      <el-table-column prop="areaName" label="种植区域" width="140" />
      <el-table-column prop="plantingCount" label="种植数量" width="100" align="right">
        <template #default="{ row }">
          <span class="text-emerald-600 font-medium">{{ row.plantingCount?.toLocaleString() }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="plantingDate" label="种植日期" width="120" />
      <el-table-column prop="soilPH" label="土壤PH" width="90" align="center">
        <template #default="{ row }">
          <span :class="row.soilPH != null && row.soilPH > 0 ? 'font-mono text-gray-700' : 'text-gray-400'">
            {{ row.soilPH != null && row.soilPH > 0 ? row.soilPH.toFixed(1) : '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="soilEC" label="土壤EC" width="90" align="center">
        <template #default="{ row }">
          <span :class="row.soilEC != null && row.soilEC > 0 ? 'font-mono text-gray-700' : 'text-gray-400'">
            {{ row.soilEC != null && row.soilEC > 0 ? row.soilEC.toFixed(1) : '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="attritionRate" label="损耗率" width="85" align="center">
        <template #default="{ row }">
          <span :class="row.attritionRate != null && row.attritionRate > 0 ? 'text-amber-600 font-medium' : 'text-gray-400'">
            {{ row.attritionRate != null && row.attritionRate > 0 ? `${row.attritionRate.toFixed(1)}%` : '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="harvestQuantity" label="已采收" width="100" align="right">
        <template #default="{ row }">
          <span class="text-blue-600 font-medium">
            {{ row.harvestQuantity ? `${row.harvestQuantity.toLocaleString()}${row.unit || ''}` : '0' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTypeMap[row.status] || 'info'" size="small">
            {{ statusLabelMap[row.status] || row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <div class="flex gap-1">
            <el-button link type="primary" size="small" @click="$emit('edit', row)" title="编辑">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button v-if="!row.isHarvest" link type="success" size="small" @click="$emit('harvest', row)" title="采收登记">
              <el-icon><CircleCheck /></el-icon>
            </el-button>
            <el-button link type="danger" size="small" @click="$emit('delete', [row.id])" title="删除">
              <el-icon><Delete /></el-icon>
            </el-button>
            <el-button link type="warning" size="small" @click="$emit('label-detail', row)" title="标签详情">
              <el-icon><PriceTag /></el-icon>
            </el-button>
            <el-button v-if="!row.isHarvest" link type="primary" size="small" @click="$emit('move', row)" title="移入/移出">
              <el-icon><Right /></el-icon>
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <span class="text-sm text-gray-500">共 {{ total }} 条</span>
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="sizes, prev, pager, next"
        background
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, Download, Printer, Edit, Delete, CircleCheck, PriceTag, Right } from '@element-plus/icons-vue'

const props = defineProps({"canCreate":"true","canEdit":"true","canDelete":"true","canExport":"true","canPrint":"true"})

defineEmits(['(e', 'row', 'row', 'row', 'ids', 'row', 'row'])

const currentPage = ref(1)
const pageSize = ref(10)

const total = computed(() => props.data.length)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return props.data.slice(start, start + pageSize.value)
})

const statusTypeMap = {
  planted: 'primary',
  growing: 'warning',
  harvested: 'success',
  cancelled: 'info'
}

const statusLabelMap = {
  planted: '已定植',
  growing: '生长期',
  harvested: '已采收',
  cancelled: '已取消'
}
</script>
