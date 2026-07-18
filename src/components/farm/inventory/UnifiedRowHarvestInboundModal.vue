<template>
  <!--
    行级采收入库弹窗（V1.1 → V2.0 1:1 移植）
    来源：src/components/farm/inventory/UnifiedRowHarvestInboundModal.tsx (V1.1, 1033行)
    对应 API：POST /api/inventory/inbound-from-source
    用于：种源/育苗/种植 行级"出圃入库"操作
  -->
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- 遮罩 -->
    <div class="absolute inset-0 bg-black/50" @click="onClose"></div>

    <!-- 弹窗主体 -->
    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
      <!-- 标题栏 - 绿色渐变 -->
      <div class="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 px-6 py-3 flex items-center justify-between rounded-t-xl">
        <div class="flex items-center gap-2 text-white">
          <el-icon :size="20" style="color: white;">
            <component :is="stockTypeIcon" />
          </el-icon>
          <h3 class="text-lg font-semibold text-white">
            {{ stockTypeLabel }}入库 - {{ sourceRecord.code }}
          </h3>
        </div>
        <el-button link size="small" class="!text-white hover:!bg-emerald-500" @click="onClose">
          <el-icon :size="20" style="color: white;"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 内容区 - 可滚动 -->
      <div class="overflow-y-auto p-6 space-y-4 flex-1">
        <!-- 2026-07-09 v6：补录提示横幅（仅当来源记录已结束时显示） -->
        <div v-if="isSourceEnded" class="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
          <el-icon :size="16" class="text-amber-600 flex-shrink-0 mt-0.5"><WarningFilled /></el-icon>
          <div class="text-sm text-amber-800">
            <strong>补录模式：</strong>该{{ stockTypeLabel }}已结束，此为补录入库（必填原因）。
          </div>
        </div>

        <!-- 源记录信息（只读展示） -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <div class="grid grid-cols-3 gap-2">
            <div><span class="text-gray-500">编号：</span><span class="font-medium">{{ sourceRecord.code }}</span></div>
            <div><span class="text-gray-500">作物名称：</span><span class="font-medium">{{ sourceRecord.cropVariety || sourceRecord.cropName || '-' }}</span></div>
            <div><span class="text-gray-500">品种：</span><span class="font-medium">{{ sourceRecord.cropName || sourceRecord.cropVariety || '-' }}</span></div>
          </div>
        </div>

        <!-- 表单字段 -->
        <div class="grid grid-cols-2 gap-4">
          <!-- 采收日期 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">采收日期 <span class="text-red-500">*</span></label>
            <el-date-picker v-model="harvestDate" type="date" value-format="YYYY-MM-DD" class="w-full" />
          </div>
          <!-- 仓库 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">入库仓库 <span class="text-red-500">*</span></label>
            <el-select v-model="warehouseId" filterable class="w-full" placeholder="选择仓库" @change="handleWarehouseChange">
              <el-option v-for="w in warehouses" :key="w.id" :label="`${w.name}（${w.location || ''}）`" :value="w.id" />
            </el-select>
          </div>
          <!-- 操作员（审核员） -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">操作员（审核员） <span class="text-red-500">*</span></label>
            <el-input v-model="operator" placeholder="操作员姓名" class="w-full" />
          </div>
          <!-- 单位 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">单位 <span class="text-red-500">*</span></label>
            <el-select v-model="unit" class="w-full">
              <el-option label="克" value="克" />
              <el-option label="公斤" value="公斤" />
              <el-option label="升" value="升" />
              <el-option label="毫升" value="毫升" />
              <el-option label="株" value="株" />
              <el-option label="袋" value="袋" />
              <el-option label="盒" value="盒" />
              <el-option label="包" value="包" />
            </el-select>
          </div>
        </div>

        <!-- 产品明细列表 -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-semibold text-gray-700">入库产品明细</label>
            <el-button v-if="stockType !== 'seed' && stockType !== 'seedling'" size="small" type="primary" plain @click="handleAddProduct">
              <el-icon><Plus /></el-icon> 添加
            </el-button>
          </div>
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-gray-100">
                <tr>
                  <th class="px-2 py-2 text-left font-semibold">作物名称</th>
                  <th class="px-2 py-2 text-left font-semibold">品种</th>
                  <th class="px-2 py-2 text-left font-semibold">采收数量 <span class="text-red-500">*</span></th>
                  <th class="px-2 py-2 text-left font-semibold">单位</th>
                  <th class="px-2 py-2 text-left font-semibold">品质等级</th>
                  <th class="px-2 py-2 text-left font-semibold">采收形态</th>
                  <th v-if="stockType !== 'seed' && stockType !== 'seedling'" class="px-2 py-2 w-16">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, idx) in products" :key="idx" class="border-t border-gray-200">
                  <td class="px-2 py-2"><el-input v-model="p.cropName" size="small" /></td>
                  <td class="px-2 py-2"><el-input v-model="p.cropVariety" size="small" /></td>
                  <td class="px-2 py-2">
                    <el-input-number v-model="p.harvestQuantity" :min="0" size="small" class="!w-full" />
                  </td>
                  <td class="px-2 py-2"><el-input v-model="p.unit" size="small" /></td>
                  <td class="px-2 py-2">
                    <el-select v-model="p.grade" size="small" class="!w-full">
                      <el-option label="特优" value="special" />
                      <el-option label="优" value="excellent" />
                      <el-option label="良" value="good" />
                      <el-option label="合格" value="qualified" />
                      <el-option label="不合格" value="unqualified" />
                    </el-select>
                  </td>
                  <td class="px-2 py-2"><el-input v-model="p.sourceForm" size="small" placeholder="果实/籽/枝条" /></td>
                  <td v-if="stockType !== 'seed' && stockType !== 'seedling'" class="px-2 py-2 text-center">
                    <el-button v-if="products.length > 1" link type="danger" size="small" @click="handleRemoveProduct(idx)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 采收员多选 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">采收员</label>
          <el-select v-model="harvesterIds" multiple filterable class="w-full" placeholder="可多选">
            <el-option v-for="u in users" :key="u.id || u.oid" :label="u.name" :value="u.id || u.oid" />
          </el-select>
        </div>

        <!-- 补录原因（仅补录模式显示） -->
        <div v-if="isSourceEnded">
          <label class="block text-sm font-medium text-gray-700 mb-1">补录原因 <span class="text-red-500">*</span></label>
          <el-input v-model="supplementaryReason" type="textarea" :rows="2" placeholder="请说明补录原因（必填）" />
        </div>

        <!-- 备注 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
          <el-input v-model="remarks" type="textarea" :rows="2" placeholder="可选" />
        </div>

        <!-- 采收历史（对齐 V1.1 L756-795 历史表） -->
        <div v-if="harvestRecords.length > 0">
          <label class="block text-sm font-semibold text-gray-700 mb-2">采收历史</label>
          <div class="border border-gray-200 rounded-lg max-h-32 overflow-y-auto">
            <table class="w-full text-xs">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th class="px-2 py-1 text-left">采收日期</th>
                  <th class="px-2 py-1 text-left">采收员</th>
                  <th class="px-2 py-1 text-left">数量</th>
                  <th class="px-2 py-1 text-left">仓库</th>
                  <th class="px-2 py-1 text-left">品质</th>
                  <th class="px-2 py-1 text-left">备注</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in harvestRecords" :key="r.id || r.harvestDate" class="border-t border-gray-100">
                  <td class="px-2 py-1">{{ r.harvestDate }}</td>
                  <td class="px-2 py-1">{{ r.harvesters || '-' }}</td>
                  <td class="px-2 py-1">{{ r.harvestQuantity }} {{ r.unit }}</td>
                  <td class="px-2 py-1">{{ r.warehouseName || '-' }}</td>
                  <td class="px-2 py-1">{{ r.grade || '-' }}</td>
                  <td class="px-2 py-1 truncate max-w-[200px]" :title="r.remarks">{{ r.remarks || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
        <el-button @click="onClose">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确认入库</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 行级采收入库弹窗（V1.1 → V2.0 1:1 移植）
 * 对齐 V1.1 src/components/farm/inventory/UnifiedRowHarvestInboundModal.tsx
 */
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Close, WarningFilled, Sugar, Folder, Goods } from '@element-plus/icons-vue'
import { submitUnifiedInbound, getWarehouses, getHarvestRecords } from '@/services/apiInventoryService'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  onClose: { type: Function, required: true },
  onSuccess: { type: Function, default: null },
  stockType: { type: String, default: 'seedling' }, // seed | seedling | product
  sourceModule: { type: String, default: 'seedling' },
  sourceRecord: { type: Object, required: true } // { id, code, cropName, cropVariety, cropCode, unit, endTime, status }
})

const emit = defineEmits(['update:visible'])

defineOptions({ name: 'UnifiedRowHarvestInboundModal' })

// 表单状态
const harvestDate = ref(new Date().toISOString().slice(0, 10))
const warehouseId = ref('')
const warehouseName = ref('')
const harvesterIds = ref([])
const operator = ref(localStorage.getItem('username') || '管理员')
const remarks = ref('')
const unit = ref(props.sourceRecord.unit || '株')
const supplementaryReason = ref('')

// 2026-07-09 v6：补录模式判断
const isSourceEnded = computed(() => {
  return Boolean(props.sourceRecord.endTime) ||
    ['completed', 'abnormal', 'cancelled'].includes(props.sourceRecord.status || '')
})

// 产品明细
const products = ref([
  {
    cropCode: props.sourceRecord.cropCode || '',
    cropName: props.sourceRecord.cropVariety || props.sourceRecord.cropName || '',
    cropVariety: props.sourceRecord.cropName || props.sourceRecord.cropVariety || '',
    harvestQuantity: 0,
    unit: props.sourceRecord.unit || '株',
    grade: '',
    sourceForm: '',
    productForm: ''
  }
])

const submitting = ref(false)
const warehouses = ref([])
const users = ref([])
const harvestRecords = ref([])

// 库存类型图标与标签
const STOCK_TYPE_CONFIG = {
  seed: { label: '种源', icon: 'Sugar' },
  seedling: { label: '种苗', icon: 'Folder' },
  product: { label: '成品', icon: 'Goods' }
}

const stockTypeIcon = computed(() => STOCK_TYPE_CONFIG[props.stockType]?.icon || 'Folder')
const stockTypeLabel = computed(() => STOCK_TYPE_CONFIG[props.stockType]?.label || '种苗')

// 仓库选择
const handleWarehouseChange = (val) => {
  const w = warehouses.value.find(x => x.id === val)
  warehouseName.value = w?.name || ''
}

// 添加/删除产品（仅成品可多行）
const handleAddProduct = () => {
  products.value.push({
    cropCode: '', cropName: '', cropVariety: '',
    harvestQuantity: 0, unit: unit.value, grade: '', sourceForm: '', productForm: ''
  })
}
const handleRemoveProduct = (idx) => {
  products.value.splice(idx, 1)
}

// 加载数据
const loadWarehouses = async () => {
  warehouses.value = await getWarehouses()
}
const loadHarvestRecords = async () => {
  if (!props.sourceRecord?.id) return
  harvestRecords.value = await getHarvestRecords(props.sourceModule, props.sourceRecord.id)
}
const loadUsers = async () => {
  try {
    const mod = await import('@/stores/modules/user')
    users.value = mod.useUserStore?.getState?.()?.users || []
    if (!users.value.length && mod.useUserStore?.getState?.()?.loadUsers) {
      await mod.useUserStore.getState().loadUsers()
      users.value = mod.useUserStore.getState().users || []
    }
  } catch {
    users.value = []
  }
}

// 弹窗打开时加载
watch(() => props.isOpen, async (open) => {
  if (open) {
    // 重置表单（保留 sourceRecord 单位）
    unit.value = props.sourceRecord.unit || '株'
    warehouseId.value = ''
    warehouseName.value = ''
    harvesterIds.value = []
    remarks.value = ''
    supplementaryReason.value = ''
    products.value = [{
      cropCode: props.sourceRecord.cropCode || '',
      cropName: props.sourceRecord.cropVariety || props.sourceRecord.cropName || '',
      cropVariety: props.sourceRecord.cropName || props.sourceRecord.cropVariety || '',
      harvestQuantity: 0,
      unit: unit.value,
      grade: '', sourceForm: '', productForm: ''
    }]

    await Promise.all([loadWarehouses(), loadUsers(), loadHarvestRecords()])
  }
}, { immediate: true })

// 提交
const handleSubmit = async () => {
  // 校验
  if (!harvestDate.value) {
    ElMessage.warning('请选择采收日期')
    return
  }
  if (!warehouseId.value) {
    ElMessage.warning('请选择入库仓库')
    return
  }
  if (!operator.value) {
    ElMessage.warning('请输入操作员')
    return
  }
  if (products.value.some(p => !p.harvestQuantity || p.harvestQuantity <= 0)) {
    ElMessage.warning('请填写所有产品的采收数量')
    return
  }
  if (isSourceEnded.value && !supplementaryReason.value.trim()) {
    ElMessage.warning('补录模式必须填写补录原因')
    return
  }

  submitting.value = true
  try {
    await submitUnifiedInbound({
      stockType: props.stockType,
      sourceModule: props.sourceModule,
      sourceId: props.sourceRecord.id,
      harvestDate: harvestDate.value,
      warehouseId: warehouseId.value,
      warehouseName: warehouseName.value,
      harvesterIds: harvesterIds.value,
      operator: operator.value,
      remarks: remarks.value,
      unit: unit.value,
      isSupplementary: isSourceEnded.value,
      supplementaryReason: supplementaryReason.value,
      products: products.value
    })
    ElMessage.success('入库成功')
    props.onSuccess?.()
    onClose()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    ElMessage.error(`入库失败：${msg}`)
  } finally {
    submitting.value = false
  }
}
</script>
