<template>
  <!--
    种源追溯 4 Tabs 组件（V1.1 1:1 迁移版）
    V1.1源文件：src/components/farm/seed-source/components/SeedSourceHistoryTabs.tsx
    4个Tab：inbound（入库记录）/ inventory（库存流水）/ circulation（回流记录）/ audit（变更记录）
  -->
  <div class="seed-source-history-tabs">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- Tab 1: 入库记录 -->
      <el-tab-pane>
        <template #label>
          <span class="flex items-center gap-1">
            <el-icon><Download /></el-icon>
            入库记录 <span class="text-xs text-gray-400">({{ inboundRows.length }})</span>
          </span>
        </template>
        <div class="overflow-y-auto" style="max-height: 384px">
          <table class="w-full text-sm">
            <thead class="bg-blue-500 text-white sticky top-0">
              <tr>
                <th class="px-3 py-2 text-left">入库日期</th>
                <th class="px-3 py-2 text-left">来源编码</th>
                <th class="px-3 py-2 text-left">来源模块</th>
                <th class="px-3 py-2 text-left">类型</th>
                <th class="px-3 py-2 text-right">原始数量</th>
                <th class="px-3 py-2 text-right">已退数量</th>
                <th class="px-3 py-2 text-left">仓库</th>
                <th class="px-3 py-2 text-left">操作员</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading"><td colspan="8" class="text-center py-8 text-gray-500">加载中...</td></tr>
              <tr v-else-if="inboundRows.length === 0"><td colspan="8" class="text-center py-8 text-gray-500">暂无数据</td></tr>
              <tr v-for="r in inboundRows" :key="r.id" class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-3 py-2">{{ r.recordDate || '-' }}</td>
                <td class="px-3 py-2 font-mono text-xs">{{ r.sourceCode || '-' }}</td>
                <td class="px-3 py-2">{{ r.sourceModule || '-' }}</td>
                <td class="px-3 py-2">{{ typeLabel(r.sourceType) }}</td>
                <td class="px-3 py-2 text-right">{{ r.quantity }} {{ r.unit }}</td>
                <td class="px-3 py-2 text-right">
                  <span :class="r.returnedQuantity > 0 ? 'text-amber-600 font-medium' : 'text-gray-500'">
                    {{ r.returnedQuantity || 0 }}
                  </span>
                </td>
                <td class="px-3 py-2">{{ r.warehouseName || '-' }}</td>
                <td class="px-3 py-2">{{ r.operator || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </el-tab-pane>

      <!-- Tab 2: 库存流水 -->
      <el-tab-pane>
        <template #label>
          <span class="flex items-center gap-1">
            <el-icon><List /></el-icon>
            库存流水 <span class="text-xs text-gray-400">({{ inventoryRows.length }})</span>
          </span>
        </template>
        <div class="overflow-y-auto" style="max-height: 384px">
          <table class="w-full text-sm">
            <thead class="bg-blue-500 text-white sticky top-0">
              <tr>
                <th class="px-3 py-2 text-left">时间</th>
                <th class="px-3 py-2 text-left">库存单号</th>
                <th class="px-3 py-2 text-left">类型</th>
                <th class="px-3 py-2 text-right">数量</th>
                <th class="px-3 py-2 text-right">结存</th>
                <th class="px-3 py-2 text-left">备注</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading"><td colspan="6" class="text-center py-8 text-gray-500">加载中...</td></tr>
              <tr v-else-if="inventoryRows.length === 0"><td colspan="6" class="text-center py-8 text-gray-500">暂无数据</td></tr>
              <tr v-for="r in inventoryRows" :key="r.id" class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-3 py-2">{{ r.time || '-' }}</td>
                <td class="px-3 py-2 font-mono text-xs">{{ r.stockCode || '-' }}</td>
                <td class="px-3 py-2">{{ r.type || '-' }}</td>
                <td class="px-3 py-2 text-right">
                  <span :class="r.quantity > 0 ? 'text-emerald-600' : 'text-red-600'">
                    {{ r.quantity > 0 ? '+' : '' }}{{ r.quantity }}
                  </span>
                </td>
                <td class="px-3 py-2 text-right">{{ r.balance }}</td>
                <td class="px-3 py-2">{{ r.remark || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </el-tab-pane>

      <!-- Tab 3: 回流记录 -->
      <el-tab-pane>
        <template #label>
          <span class="flex items-center gap-1">
            <el-icon><Refresh /></el-icon>
            回流记录 <span class="text-xs text-gray-400">({{ circulationRows.length }})</span>
          </span>
        </template>
        <div class="overflow-y-auto" style="max-height: 384px">
          <table class="w-full text-sm">
            <thead class="bg-blue-500 text-white sticky top-0">
              <tr>
                <th class="px-3 py-2 text-left">回流日期</th>
                <th class="px-3 py-2 text-left">类型</th>
                <th class="px-3 py-2 text-left">来源模块</th>
                <th class="px-3 py-2 text-right">数量</th>
                <th class="px-3 py-2 text-left">处置</th>
                <th class="px-3 py-2 text-left">备注</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading"><td colspan="6" class="text-center py-8 text-gray-500">加载中...</td></tr>
              <tr v-else-if="circulationRows.length === 0"><td colspan="6" class="text-center py-8 text-gray-500">暂无数据</td></tr>
              <tr v-for="r in circulationRows" :key="r.id" class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-3 py-2">{{ r.circulationDate || '-' }}</td>
                <td class="px-3 py-2">{{ r.type || '-' }}</td>
                <td class="px-3 py-2">{{ r.sourceModule || '-' }}</td>
                <td class="px-3 py-2 text-right">{{ r.quantity }} {{ r.unit }}</td>
                <td class="px-3 py-2">{{ r.disposal || '-' }}</td>
                <td class="px-3 py-2">{{ r.remark || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </el-tab-pane>

      <!-- Tab 4: 变更记录 -->
      <el-tab-pane>
        <template #label>
          <span class="flex items-center gap-1">
            <el-icon><Document /></el-icon>
            变更记录 <span class="text-xs text-gray-400">({{ auditRows.length }})</span>
          </span>
        </template>
        <div class="overflow-y-auto" style="max-height: 384px">
          <table class="w-full text-sm">
            <thead class="bg-blue-500 text-white sticky top-0">
              <tr>
                <th class="px-3 py-2 text-left">时间</th>
                <th class="px-3 py-2 text-left">操作</th>
                <th class="px-3 py-2 text-left">种源ID</th>
                <th class="px-3 py-2 text-left">详情</th>
                <th class="px-3 py-2 text-left">操作员</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading"><td colspan="5" class="text-center py-8 text-gray-500">加载中...</td></tr>
              <tr v-else-if="auditRows.length === 0"><td colspan="5" class="text-center py-8 text-gray-500">暂无数据</td></tr>
              <tr v-for="r in auditRows" :key="r.id" class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-3 py-2">{{ r.time || '-' }}</td>
                <td class="px-3 py-2">
                  <el-tag size="small">{{ r.action || '-' }}</el-tag>
                </td>
                <td class="px-3 py-2 font-mono text-xs">{{ r.seedSourceId || '-' }}</td>
                <td class="px-3 py-2">{{ r.detail || '-' }}</td>
                <td class="px-3 py-2">{{ r.operator || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Download, List, Refresh, Document } from '@element-plus/icons-vue'
import { enhancedApiClient } from '@/lib/apiClient'

const props = defineProps({
  seedSourceId: { type: String, required: true }
})

const TYPE_LABELS = {
  external_purchased: '外购入库',
  transfer_inbound: '调拨入库',
  production_output: '生产产出',
  seed_saving: '留种回转',
  return_inbound: '退库入库',
  manual: '手动入库',
  adjust: '库存调整'
}

const activeTab = ref('inbound')
const loading = ref(false)
const inboundRows = ref([])
const inventoryRows = ref([])
const circulationRows = ref([])
const auditRows = ref([])

const typeLabel = (t) => TYPE_LABELS[t] || t

const fetchAll = async () => {
  if (!props.seedSourceId) return
  loading.value = true
  try {
    const [inbound, inventory, circulation, audit] = await Promise.all([
      enhancedApiClient.get(`/seed-sources/${props.seedSourceId}/history-inbound`),
      enhancedApiClient.get(`/seed-sources/${props.seedSourceId}/history-inventory`),
      enhancedApiClient.get(`/seed-sources/${props.seedSourceId}/history-circulation`),
      enhancedApiClient.get(`/seed-sources/${props.seedSourceId}/history-audit`)
    ])
    inboundRows.value = Array.isArray(inbound?.data) ? inbound.data : (Array.isArray(inbound) ? inbound : [])
    inventoryRows.value = Array.isArray(inventory?.data) ? inventory.data : (Array.isArray(inventory) ? inventory : [])
    circulationRows.value = Array.isArray(circulation?.data) ? circulation.data : (Array.isArray(circulation) ? circulation : [])
    auditRows.value = Array.isArray(audit?.data) ? audit.data : (Array.isArray(audit) ? audit : [])
  } catch (e) {
    console.error('[HistoryTabs] 加载历史失败:', e)
  } finally {
    loading.value = false
  }
}

const handleTabChange = (tab) => {
  activeTab.value = tab
  // 已经一次性并发加载所有tab，无需重新加载
}

onMounted(() => {
  fetchAll()
})

watch(() => props.seedSourceId, (val) => {
  if (val) fetchAll()
})
</script>
