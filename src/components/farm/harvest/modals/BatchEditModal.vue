<template>
  <!-- 批量编辑弹窗组件 - V1.1样式（纯div自定义弹窗） -->
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="handleClose">
      <div
        id="harvest-batch-edit-dialog"
        class="bg-white rounded-xl w-full shadow-xl flex flex-col"
        :style="{ maxWidth: '72rem', maxHeight: '85vh', minWidth: '50rem' }"
        @click.stop
      >
        <!-- 头部 — 绿色渐变 -->
        <div
          class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-between rounded-t-xl cursor-move flex-shrink-0"
          style="background: linear-gradient(to right, #10b981, #059669);"
          @mousedown="handleDragStart"
        >
          <h3 class="font-semibold flex items-center gap-2 select-none" style="color: white;">
            <el-icon style="color: white;"><Edit /></el-icon>
            <span style="color: white;">批量编辑采收记录</span>
          </h3>
          <el-button link class="hover:bg-white/10" style="color: rgba(255,255,255,0.8);" @click="handleClose">
            <el-icon style="color: white;"><Close /></el-icon>
          </el-button>
        </div>

        <!-- 内容区域 -->
        <div class="p-6 overflow-y-auto flex-1" style="max-height: calc(85vh - 140px);">
          <div class="space-y-4">
            <!-- 信息提示 -->
            <div class="bg-blue-50 rounded-lg p-3">
              <p class="text-sm text-blue-800">
                已选择 <strong>{{ selectedRows.length }}</strong> 条记录进行批量编辑，
                已编辑 <strong>{{ editedRecordIds.length }}</strong> 条
              </p>
            </div>

            <!-- 记录选择器 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">选择采收单号</label>
              <el-select v-model="localSelectedRecordId" class="w-full" placeholder="请选择采收单号">
                <el-option
                  v-for="(idx, rIdx) in selectedRows"
                  :key="idx"
                  :label="`${records[idx]?.harvestCode} - ${records[idx]?.cropName} ${editedRecordIds.includes(String(records[idx]?.id)) ? '✅ 已编辑' : ''}`"
                  :value="String(records[idx]?.id)"
                />
              </el-select>
            </div>

            <!-- 编辑区域 -->
            <div v-if="localSelectedRecordId && currentRecord" class="grid grid-cols-4 gap-4">
              <!-- 采收单号 - 不可编辑 -->
              <div class="bg-gray-100 rounded-lg p-3">
                <div class="text-xs text-gray-500 mb-1">采收单号</div>
                <div class="text-sm font-medium text-gray-900">{{ currentRecord.harvestCode }}</div>
              </div>

              <!-- 作物品种 - 不可编辑 -->
              <div class="bg-gray-100 rounded-lg p-3">
                <div class="text-xs text-gray-500 mb-1">作物品种</div>
                <div class="text-sm font-medium text-gray-900">{{ currentRecord.cropName }}</div>
              </div>

              <!-- 品种 - 不可编辑 -->
              <div class="bg-gray-100 rounded-lg p-3">
                <div class="text-xs text-gray-500 mb-1">品种</div>
                <div class="text-sm font-medium text-gray-900">{{ currentRecord.variety || '-' }}</div>
              </div>

              <!-- 生产计划批次号 - 可编辑 -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">生产计划批次号</label>
                <el-select v-model="editedData.batchCode" class="w-full" size="small">
                  <el-option
                    v-for="b in cropBatches"
                    :key="b.batchCode"
                    :label="`${b.batchCode} - ${b.cropName}`"
                    :value="b.batchCode"
                  />
                </el-select>
              </div>

              <!-- 种植模式 - 不可编辑 -->
              <div class="bg-gray-100 rounded-lg p-3">
                <div class="text-xs text-gray-500 mb-1">种植模式</div>
                <div class="text-sm font-medium text-gray-900">{{ currentRecord.plantingMode || '-' }}</div>
              </div>

              <!-- 采收区域 - 可编辑 -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">采收区域</label>
                <el-select v-model="editedData.greenhouseId" class="w-full" size="small">
                  <el-option
                    v-for="g in greenhouses"
                    :key="g.id"
                    :label="g.name"
                    :value="g.id"
                  />
                </el-select>
              </div>

              <!-- 采收时间 - 可编辑 -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">采收时间</label>
                <el-date-picker
                  v-model="editedData.harvestDate"
                  type="datetime"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm"
                  class="w-full"
                  size="small"
                />
              </div>

              <!-- 采收量 - 可编辑 -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">采收量(kg)</label>
                <el-input-number
                  v-model="editedData.harvestQuantity"
                  :min="0"
                  :precision="1"
                  class="w-full"
                  size="small"
                />
              </div>

              <!-- 目标产量 - 不可编辑 -->
              <div class="bg-gray-100 rounded-lg p-3">
                <div class="text-xs text-gray-500 mb-1">目标产量(kg)</div>
                <div class="text-sm font-medium text-gray-900">{{ currentRecord.targetYield || 0 }}</div>
              </div>

              <!-- 品质等级 - 可编辑 -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">品质等级</label>
                <el-select v-model="editedData.grade" class="w-full" size="small">
                  <el-option label="A级" value="A" />
                  <el-option label="B级" value="B" />
                  <el-option label="C级" value="C" />
                </el-select>
              </div>

              <!-- 入库仓库 - 可编辑 -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">入库仓库</label>
                <el-select v-model="editedData.warehouseId" class="w-full" size="small">
                  <el-option
                    v-for="w in warehouses"
                    :key="w.id"
                    :label="w.name"
                    :value="w.id"
                  />
                </el-select>
              </div>

              <!-- 状态 - 可编辑 -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">状态</label>
                <el-select v-model="editedData.status" class="w-full" size="small">
                  <el-option label="待采收" value="pending" />
                  <el-option label="采收中" value="harvesting" />
                  <el-option label="已采收" value="harvested" />
                  <el-option label="已分级" value="graded" />
                  <el-option label="已入库" value="stored" />
                </el-select>
              </div>

              <!-- 采收人员 - 不可编辑 -->
              <div class="bg-gray-100 rounded-lg p-3 md:col-span-2">
                <div class="text-xs text-gray-500 mb-1">采收人员</div>
                <div class="text-sm font-medium text-gray-900">{{ (currentRecord.harvesterNames || []).join(', ') || '-' }}</div>
              </div>

              <!-- 审核人员 - 可编辑 -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">审核人员</label>
                <el-input v-model="editedData.auditor" size="small" />
              </div>

              <!-- 备注 - 可编辑 -->
              <div class="md:col-span-4">
                <label class="block text-xs text-gray-500 mb-1">备注</label>
                <el-input v-model="editedData.remarks" size="small" />
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0 rounded-b-xl">
          <el-button size="small" @click="handleClose">取消</el-button>
          <el-button size="small" type="primary" @click="handleConfirm">保存修改</el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Edit, Close } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: Boolean,
  selectedRows: {
    type: Array,
    default: () => []
  },
  records: {
    type: Array,
    default: () => []
  },
  editedRecordIds: {
    type: Array,
    default: () => []
  },
  editedRecords: {
    type: Object,
    default: () => ({})
  },
  selectedRecordId: {
    type: String,
    default: ''
  },
  greenhouses: {
    type: Array,
    default: () => []
  },
  warehouses: {
    type: Array,
    default: () => []
  },
  users: {
    type: Array,
    default: () => []
  },
  cropBatches: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'close',
  'confirm',
  'update:selectedRecordId',
  'update:editedRecords',
  'update:editedRecordIds'
])

// 本地选中记录ID
const localSelectedRecordId = ref(props.selectedRecordId)

// 本地编辑数据
const localEditedRecords = ref({ ...props.editedRecords })
const localEditedRecordIds = ref([...props.editedRecordIds])

// 拖动状态
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0, left: 0, top: 0 })

// 当前选中的记录
const currentRecord = computed(() => {
  if (!localSelectedRecordId.value) return null
  return props.records.find(r => String(r.id) === localSelectedRecordId.value)
})

// 当前编辑的数据
const editedData = computed({
  get: () => {
    if (!localSelectedRecordId.value) return {}
    return localEditedRecords.value[localSelectedRecordId.value] || currentRecord.value || {}
  },
  set: (val) => {
    if (!localSelectedRecordId.value) return
    localEditedRecords.value = {
      ...localEditedRecords.value,
      [localSelectedRecordId.value]: { ...localEditedRecords.value[localSelectedRecordId.value], ...val }
    }
    if (!localEditedRecordIds.value.includes(localSelectedRecordId.value)) {
      localEditedRecordIds.value = [...localEditedRecordIds.value, localSelectedRecordId.value]
    }
  }
})

// 监听选中记录变化
watch(localSelectedRecordId, (val) => {
  emit('update:selectedRecordId', val)
})

// 监听编辑数据变化
watch(localEditedRecords, (val) => {
  emit('update:editedRecords', val)
}, { deep: true })

watch(localEditedRecordIds, (val) => {
  emit('update:editedRecordIds', val)
}, { deep: true })

// 确认保存
const handleConfirm = () => {
  emit('confirm')
}

// 关闭
const handleClose = () => {
  emit('close')
}

// 拖动开始
const handleDragStart = (e) => {
  if (e.target.closest('button')) return
  e.preventDefault()
  isDragging.value = true
  const dialog = document.getElementById('harvest-batch-edit-dialog')
  if (dialog) {
    const rect = dialog.getBoundingClientRect()
    dragStart.value = { x: e.clientX, y: e.clientY, left: rect.left, top: rect.top }
  }
}

// 拖动中
watch(isDragging, (val) => {
  if (!val) return
  const handleMouseMove = (e) => {
    if (!isDragging.value) return
    const deltaX = e.clientX - dragStart.value.x
    const deltaY = e.clientY - dragStart.value.y
    const dialog = document.getElementById('harvest-batch-edit-dialog')
    if (dialog) {
      dialog.style.position = 'fixed'
      dialog.style.left = `${dragStart.value.left + deltaX}px`
      dialog.style.top = `${dragStart.value.top + deltaY}px`
      dialog.style.margin = '0'
    }
  }
  const handleMouseUp = () => {
    isDragging.value = false
  }
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})
</script>
