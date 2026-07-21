<!--
  病虫害记录表格（对齐 V1.1 PestControlTable.tsx L1-667）
  13 列：勾选/展开/编号/日期/作物/区域/操作人/施用方法/目标病虫害/药剂/肥料/备注/操作
  JSON 池子展开：药剂池/设备池/制剂池/肥料池
-->
<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- 顶部按钮栏（对齐 V1.1 Page L62-89）-->
    <div class="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">防治记录列表</h3>
      <div class="flex items-center gap-2">
        <template v-if="operationMode === 'delete'">
          <span class="text-sm text-gray-500 mr-2">已选择 {{ selectedRows.length }} 项</span>
          <el-button type="danger" :icon="Delete" size="small" :disabled="selectedRows.length === 0" @click="onDelete(selectedRows)">确认删除</el-button>
          <el-button :icon="Close" size="small" @click="emit('operation-mode-change', 'normal'); emit('update:selected-rows', [])">取消</el-button>
        </template>
        <template v-else>
          <el-button v-if="canCreate" type="primary" :icon="Plus" size="small" @click="emit('add')">新增防治</el-button>
          <el-button v-if="canDelete" type="danger" plain :icon="Delete" size="small" @click="emit('operation-mode-change', 'delete')">删除</el-button>
          <el-button v-if="canExport" :icon="Download" size="small" @click="emit('export')">导出</el-button>
        </template>
      </div>
    </div>

    <!-- 表格（对齐 V1.1 Table L155-560）-->
    <div class="overflow-x-auto">
      <table class="w-full text-sm" style="table-layout: auto;">
        <thead class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <tr>
            <th v-if="operationMode === 'delete'" class="slt-th-check px-3 py-2 w-10">
              <input type="checkbox" :checked="currentData.length > 0 && currentData.every(r => selectedIds.has(r.id))" @change="togglePageSelection" class="w-4 h-4 rounded border-gray-300" />
            </th>
            <th class="slt-th px-2 py-2 w-8"></th>
            <th class="slt-th px-3 py-2 text-left whitespace-nowrap">编号</th>
            <th class="slt-th px-3 py-2 text-left whitespace-nowrap">防治日期</th>
            <th class="slt-th px-3 py-2 text-left whitespace-nowrap">作物</th>
            <th class="slt-th px-3 py-2 text-left whitespace-nowrap">防治区域</th>
            <th class="slt-th px-3 py-2 text-left whitespace-nowrap">操作人</th>
            <th class="slt-th px-3 py-2 text-left whitespace-nowrap">施用方法</th>
            <th class="slt-th px-3 py-2 text-left whitespace-nowrap">目标病虫害</th>
            <th class="slt-th px-3 py-2 text-left whitespace-nowrap">药剂</th>
            <th class="slt-th px-3 py-2 text-left whitespace-nowrap">肥料</th>
            <th class="slt-th px-3 py-2 text-left whitespace-nowrap">备注</th>
            <th class="slt-th px-3 py-2 text-center whitespace-nowrap">操作</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="record in currentData" :key="record.id">
            <tr class="border-b border-gray-200 hover:bg-gray-50">
              <td v-if="operationMode === 'delete'" class="px-3 py-2 text-center">
                <input type="checkbox" :checked="selectedIds.has(record.id)" @change="toggleRow(record.id, $event)" class="w-4 h-4 rounded border-gray-300" />
              </td>
              <td class="px-2 py-2 text-center">
                <button type="button" class="text-gray-500 hover:text-red-600" @click="toggleExpand(record.id)">
                  <svg v-if="expandedIds.has(record.id)" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </td>
              <td class="px-3 py-2 font-mono text-xs text-red-600">{{ record.recordCode }}</td>
              <td class="px-3 py-2 whitespace-nowrap">{{ (record.sprayTime || '').slice(0, 16) }}</td>
              <td class="px-3 py-2">
                <div class="flex flex-wrap gap-1">
                  <span v-for="(c, i) in parseCropNames(record.cropNames, record.cropName)" :key="i" :class="['px-1.5 py-0.5 rounded text-xs font-medium', cropColor(i)]">{{ c }}</span>
                </div>
              </td>
              <td class="px-3 py-2 text-xs">{{ parseGreenhouses(record.greenhouseName) }}</td>
              <td class="px-3 py-2 whitespace-nowrap">{{ record.operatorName || '-' }}</td>
              <td class="px-3 py-2 text-xs">{{ dictLabel('application_method', record.applicationMethod) || '-' }}</td>
              <td class="px-3 py-2">
                <div class="flex flex-wrap gap-1">
                  <span v-for="(p, i) in parseTargetPests(record.targetPest)" :key="i" class="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">{{ p }}</span>
                  <span v-if="parseTargetPests(record.targetPest).length === 0" class="text-gray-400">-</span>
                </div>
              </td>
              <td class="px-3 py-2">
                <div class="flex flex-wrap gap-1">
                  <span v-for="(p, i) in parseJsonList(record.pesticideList)" :key="`pl-${i}`" class="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">{{ p.name || p.pesticideName }}</span>
                  <span v-if="!record.pesticideList && record.pesticideName" class="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">{{ record.pesticideName }}</span>
                  <span v-if="!record.pesticideList && !record.pesticideName" class="text-gray-400">-</span>
                </div>
              </td>
              <td class="px-3 py-2">
                <div class="flex flex-wrap gap-1">
                  <span v-for="(f, i) in parseJsonList(record.leafFertilizerList)" :key="`lf-${i}`" class="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">{{ f.name || f.fertilizerName }}</span>
                  <span v-if="parseJsonList(record.leafFertilizerList).length === 0" class="text-gray-400">-</span>
                </div>
              </td>
              <td class="px-3 py-2 text-gray-500 max-w-[160px] truncate" :title="record.description">{{ record.description || '-' }}</td>
              <td class="px-3 py-2 text-center whitespace-nowrap">
                <div class="flex items-center justify-center gap-1">
                  <button type="button" class="text-blue-600 hover:bg-blue-50 w-7 h-7 rounded flex items-center justify-center" title="查看详情" @click="emit('detail', record)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  <button v-if="operationMode !== 'delete'" type="button" class="text-emerald-600 hover:bg-emerald-50 w-7 h-7 rounded flex items-center justify-center" title="编辑" @click="emit('edit', record)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>
                  </button>
                  <button v-if="operationMode !== 'delete'" type="button" class="text-red-500 hover:bg-red-50 w-7 h-7 rounded flex items-center justify-center" title="删除" @click="emit('delete', [record.id])">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
                  </button>
                </div>
              </td>
            </tr>
            <!-- 展开详情：JSON 池子表（对齐 V1.1 Table L190-290）-->
            <tr v-if="expandedIds.has(record.id)" class="bg-red-50/30">
              <td :colspan="operationMode === 'delete' ? 13 : 12" class="px-4 py-3">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <!-- 药剂池 -->
                  <div v-if="parseJsonList(record.pesticideList).length > 0" class="bg-white border border-gray-200 rounded p-2">
                    <h5 class="text-xs font-semibold text-gray-700 mb-1">药剂池（{{ parseJsonList(record.pesticideList).length }} 项）</h5>
                    <table class="w-full text-xs">
                      <thead class="bg-gray-50"><tr><th class="px-1 py-1 text-left">#</th><th class="px-1 py-1 text-left">名称</th><th class="px-1 py-1 text-left">类型</th><th class="px-1 py-1 text-left">用量</th><th class="px-1 py-1 text-left">稀释</th><th class="px-1 py-1 text-left">方法</th></tr></thead>
                      <tbody>
                        <tr v-for="(p, i) in parseJsonList(record.pesticideList)" :key="i" class="border-t border-gray-100">
                          <td class="px-1 py-1">{{ i + 1 }}</td>
                          <td class="px-1 py-1">{{ p.name || p.pesticideName || '-' }}</td>
                          <td class="px-1 py-1">{{ p.pesticideType || p.type || '-' }}</td>
                          <td class="px-1 py-1">{{ p.dosage || '-' }}{{ p.unit || p.dosageUnit || '' }}</td>
                          <td class="px-1 py-1">{{ p.dilutionRatio || '-' }}</td>
                          <td class="px-1 py-1">{{ p.applicationMethod || '-' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <!-- 生物制剂池 -->
                  <div v-if="parseJsonList(record.bioAgentList).length > 0" class="bg-white border border-gray-200 rounded p-2">
                    <h5 class="text-xs font-semibold text-gray-700 mb-1">生物制剂池（{{ parseJsonList(record.bioAgentList).length }} 项）</h5>
                    <table class="w-full text-xs">
                      <thead class="bg-gray-50"><tr><th class="px-1 py-1 text-left">#</th><th class="px-1 py-1 text-left">名称</th><th class="px-1 py-1 text-left">类型</th><th class="px-1 py-1 text-left">用量</th></tr></thead>
                      <tbody>
                        <tr v-for="(b, i) in parseJsonList(record.bioAgentList)" :key="i" class="border-t border-gray-100">
                          <td class="px-1 py-1">{{ i + 1 }}</td>
                          <td class="px-1 py-1">{{ b.name || b.bioAgentName || '-' }}</td>
                          <td class="px-1 py-1">{{ b.bioAgentType || b.type || '-' }}</td>
                          <td class="px-1 py-1">{{ b.dosage || '-' }}{{ b.unit || '' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <!-- 设备池 -->
                  <div v-if="parseJsonList(record.equipmentList).length > 0 || record.equipmentName" class="bg-white border border-gray-200 rounded p-2">
                    <h5 class="text-xs font-semibold text-gray-700 mb-1">设备池（{{ record.equipmentName ? 1 : parseJsonList(record.equipmentList).length }} 项）</h5>
                    <div v-if="record.equipmentName" class="text-xs">{{ record.equipmentName }} × {{ record.equipmentCount || 1 }}</div>
                    <table v-else class="w-full text-xs">
                      <thead class="bg-gray-50"><tr><th class="px-1 py-1 text-left">#</th><th class="px-1 py-1 text-left">设备名</th><th class="px-1 py-1 text-left">数量</th></tr></thead>
                      <tbody>
                        <tr v-for="(e, i) in parseJsonList(record.equipmentList)" :key="i" class="border-t border-gray-100">
                          <td class="px-1 py-1">{{ i + 1 }}</td>
                          <td class="px-1 py-1">{{ e.name || e.equipmentName || '-' }}</td>
                          <td class="px-1 py-1">{{ e.count || e.equipmentCount || 1 }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <!-- 肥料池 -->
                  <div v-if="parseJsonList(record.leafFertilizerList).length > 0" class="bg-white border border-gray-200 rounded p-2">
                    <h5 class="text-xs font-semibold text-gray-700 mb-1">肥料池（{{ parseJsonList(record.leafFertilizerList).length }} 项）</h5>
                    <table class="w-full text-xs">
                      <thead class="bg-gray-50"><tr><th class="px-1 py-1 text-left">#</th><th class="px-1 py-1 text-left">名称</th><th class="px-1 py-1 text-left">用量</th><th class="px-1 py-1 text-left">稀释</th></tr></thead>
                      <tbody>
                        <tr v-for="(f, i) in parseJsonList(record.leafFertilizerList)" :key="i" class="border-t border-gray-100">
                          <td class="px-1 py-1">{{ i + 1 }}</td>
                          <td class="px-1 py-1">{{ f.name || f.fertilizerName || '-' }}</td>
                          <td class="px-1 py-1">{{ f.dosage || '-' }}{{ f.unit || '' }}</td>
                          <td class="px-1 py-1">{{ f.dilutionRatio || '-' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </td>
            </tr>
          </template>
          <tr v-if="currentData.length === 0">
            <td :colspan="operationMode === 'delete' ? 13 : 12" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <el-pagination
        v-model:current-page="localPagination.page"
        v-model:page-size="localPagination.limit"
        :page-sizes="[10, 20, 50]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="(s) => emit('update:pagination', { ...localPagination, limit: s, page: 1 })"
        @current-change="(p) => emit('update:pagination', { ...localPagination, page: p })"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Plus, Delete, Download, Close } from '@element-plus/icons-vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  pagination: { type: Object, required: true },
  selectedRows: { type: Array, default: () => [] },
  operationMode: { type: String, default: 'normal' },
  canCreate: { type: Boolean, default: true },
  canDelete: { type: Boolean, default: true },
  canExport: { type: Boolean, default: true }
})

const emit = defineEmits([
  'update:pagination', 'update:selected-rows',
  'add', 'edit', 'detail', 'delete', 'export',
  'operation-mode-change'
])

const localPagination = ref({ ...props.pagination })
watch(() => props.pagination, (val) => { localPagination.value = { ...val } }, { deep: true })

const selectedIds = computed(() => new Set(props.selectedRows))
const expandedIds = ref(new Set())

const currentData = computed(() => {
  const s = (localPagination.value.page - 1) * localPagination.value.limit
  return props.data.slice(s, Math.min(s + localPagination.value.limit, props.data.length))
})

const toggleExpand = (id) => {
  if (expandedIds.value.has(id)) expandedIds.value.delete(id)
  else expandedIds.value.add(id)
  // 触发响应式更新
  expandedIds.value = new Set(expandedIds.value)
}

const togglePageSelection = (e) => {
  const ids = currentData.value.map(r => r.id)
  if (e.target.checked) emit('update:selected-rows', [...new Set([...props.selectedRows, ...ids])])
  else emit('update:selected-rows', props.selectedRows.filter(id => !ids.includes(id)))
}
const toggleRow = (id, e) => {
  if (e.target.checked) emit('update:selected-rows', [...props.selectedRows, id])
  else emit('update:selected-rows', props.selectedRows.filter(x => x !== id))
}

// ============ 字段解析工具（对齐 V1.1 Table L600-660）============
const CROP_COLORS = ['bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-pink-100 text-pink-700', 'bg-purple-100 text-purple-700', 'bg-orange-100 text-orange-700', 'bg-cyan-100 text-cyan-700', 'bg-red-100 text-red-700']
const cropColor = (i) => CROP_COLORS[i % CROP_COLORS.length]

const parseJsonList = (raw) => {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try { const p = JSON.parse(raw); return Array.isArray(p) ? p : [] } catch { return [] }
  }
  return []
}

const parseTargetPests = (raw) => {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter(Boolean)
  if (typeof raw === 'string') {
    try { const p = JSON.parse(raw); return Array.isArray(p) ? p.filter(Boolean) : [raw] } catch { return [raw] }
  }
  return []
}

const parseCropNames = (raw, fallback) => {
  const arr = parseJsonList(raw)
  if (arr.length > 0) return arr
  return fallback ? [fallback] : []
}

const parseGreenhouses = (raw) => {
  if (!raw) return '-'
  return String(raw).replace(/,/g, ' / ')
}

const dictLabel = (category, code) => {
  if (!code) return ''
  const map = {
    application_method: { spray: '喷雾', dust: '喷粉', soil_drench: '灌根', fumigation: '熏蒸', seed_treatment: '拌种', irrigation: '滴灌', bait: '毒饵' }
  }
  return map[category]?.[code] || code
}
</script>

<style scoped>
.slt-th { font-weight: 600; white-space: nowrap; }
</style>