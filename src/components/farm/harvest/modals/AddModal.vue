<template>
  <!-- 采收登记弹窗组件 - V1.1样式（纯div自定义弹窗） -->
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="handleClose">
      <div
        id="harvest-add-dialog"
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
            <el-icon style="color: white;"><Plus /></el-icon>
            <span style="color: white;">采收登记</span>
          </h3>
          <el-button link class="hover:bg-white/10" style="color: rgba(255,255,255,0.8);" @click="handleClose">
            <el-icon style="color: white;"><Close /></el-icon>
          </el-button>
        </div>

        <!-- 表单内容 -->
        <div class="p-6 overflow-y-auto flex-1" style="max-height: calc(85vh - 140px);">
          <div class="space-y-4">
            <!-- 基本信息区域 -->
            <div class="grid grid-cols-3 gap-4">
              <!-- 采收单号 -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">采收单号</label>
                <div class="flex gap-2">
                  <el-input
                    v-model="formData.harvestCode"
                    readonly
                    placeholder="点击生成获取单号"
                    class="flex-1"
                  />
                  <el-button @click="handleGenerateCode" size="small">生成</el-button>
                </div>
                <p v-if="errors.harvestCode" class="text-red-500 text-xs mt-1">{{ errors.harvestCode }}</p>
              </div>

              <!-- 采收时间 -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">采收时间</label>
                <el-date-picker
                  v-model="formData.harvestDate"
                  type="datetime"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm"
                  class="w-full"
                  placeholder="选择时间"
                />
                <p v-if="errors.harvestDate" class="text-red-500 text-xs mt-1">{{ errors.harvestDate }}</p>
              </div>

              <!-- 操作员 -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">操作员</label>
                <el-input v-model="formData.operator" readonly class="w-full" />
              </div>

              <!-- 入库类型 -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">入库类型</label>
                <el-select v-model="formData.inboundType" class="w-full" @change="handleInboundTypeChange">
                  <el-option label="种源入库" value="seed_source" />
                  <el-option label="育苗成活入库" value="seedling" />
                  <el-option label="种植采收入库" value="planting_harvest" />
                </el-select>
              </div>

              <!-- 生产计划批次号 -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">生产计划批次号</label>
                <el-select v-model="formData.batchCode" class="w-full" placeholder="请选择批次" @change="handleBatchChange">
                  <el-option
                    v-for="b in filteredBatches"
                    :key="b.batchCode"
                    :label="`${b.batchCode} - ${b.cropName}`"
                    :value="b.batchCode"
                  />
                </el-select>
                <p v-if="errors.batchCode" class="text-red-500 text-xs mt-1">{{ errors.batchCode }}</p>
              </div>

              <!-- 采收区域 -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">采收区域</label>
                <el-select v-model="formData.greenhouseId" class="w-full" placeholder="请选择区域">
                  <el-option
                    v-for="g in greenhouses"
                    :key="g.id"
                    :label="g.name"
                    :value="g.id"
                  />
                </el-select>
                <p v-if="errors.greenhouseId" class="text-red-500 text-xs mt-1">{{ errors.greenhouseId }}</p>
              </div>

              <!-- 入库仓库 -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">入库仓库</label>
                <el-select v-model="formData.warehouseId" class="w-full" placeholder="请选择仓库">
                  <el-option
                    v-for="w in warehouseOptions"
                    :key="w.value"
                    :label="w.label"
                    :value="w.value"
                  />
                </el-select>
                <p v-if="errors.warehouseId" class="text-red-500 text-xs mt-1">{{ errors.warehouseId }}</p>
              </div>

              <!-- 审核人员 -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">审核人员</label>
                <el-input v-model="formData.auditor" placeholder="请输入审核人员" />
              </div>

              <!-- 单价 -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">
                  单价 (元/kg) <span class="text-xs text-gray-400">(可选)</span>
                </label>
                <el-input-number
                  v-model="formData.unitPrice"
                  :min="0"
                  :precision="2"
                  class="w-full"
                  placeholder="输入单价自动计算收入"
                />
                <p v-if="formData.unitPrice > 0" class="text-xs text-emerald-600 mt-1">
                  预计收入: {{ calculatedAmount }} 元
                </p>
              </div>
            </div>

            <!-- 采收人员选择 -->
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-1">采收人员</label>
              <div class="flex flex-wrap gap-2">
                <el-checkbox-group v-model="formData.harvesterIds">
                  <el-checkbox
                    v-for="u in workers"
                    :key="u.id"
                    :value="u.id"
                    :label="u.id"
                  >
                    {{ u.name }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </div>

            <!-- 批次信息自动填充区域 -->
            <div v-if="selectedBatch" class="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
              <div class="text-sm font-medium text-emerald-700 mb-2">批次信息（自动填充）</div>
              <div class="grid grid-cols-4 gap-4">
                <div>
                  <div class="text-xs text-emerald-600">作物品种</div>
                  <div class="text-sm text-gray-900">{{ selectedBatch.cropName }}</div>
                </div>
                <div>
                  <div class="text-xs text-emerald-600">品种</div>
                  <div class="text-sm text-gray-900">{{ selectedBatch.variety }}</div>
                </div>
                <div>
                  <div class="text-xs text-emerald-600">种植模式</div>
                  <div class="text-sm text-gray-900">{{ selectedBatch.plantingMode }}</div>
                </div>
                <div>
                  <div class="text-xs text-emerald-600">目标产量(kg)</div>
                  <div class="text-sm text-gray-900">{{ selectedBatch.targetYield }}</div>
                </div>
              </div>
            </div>

            <!-- 产品明细 -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="font-bold text-gray-700">产品明细</label>
                <el-button size="small" type="primary" @click="handleAddProduct">
                  <el-icon><Plus /></el-icon>
                  添加产品
                </el-button>
              </div>

              <div v-if="formData.products.length > 0" class="overflow-x-auto border border-gray-200 rounded-lg">
                <table class="min-w-[1000px] w-full">
                  <thead class="bg-emerald-600 text-white">
                    <tr>
                      <th class="px-2 py-2 text-xs font-semibold w-36">产品编码</th>
                      <th class="px-2 py-2 text-xs font-semibold w-28">产品名称</th>
                      <th class="px-2 py-2 text-xs font-semibold">分类信息</th>
                      <th class="px-2 py-2 text-xs font-semibold w-24">品质等级</th>
                      <th class="px-2 py-2 text-xs font-semibold w-28">采收量(kg)</th>
                      <th class="px-2 py-2 text-xs font-semibold w-28">目标产量</th>
                      <th class="px-2 py-2 text-xs font-semibold w-20">完成率</th>
                      <th class="px-2 py-2 text-xs font-semibold">备注</th>
                      <th class="px-2 py-2 text-xs font-semibold w-12">操作</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr v-for="(product, idx) in formData.products" :key="idx">
                      <td class="px-2 py-2">
                        <el-input v-model="product.productCode" size="small" placeholder="输入编码" />
                      </td>
                      <td class="px-2 py-2">
                        <el-input v-model="product.cropName" size="small" placeholder="输入产品名称" />
                      </td>
                      <td class="px-2 py-2 text-xs text-gray-500 bg-gray-50">
                        {{ product.cropName || '-' }}
                      </td>
                      <td class="px-2 py-2">
                        <el-select v-model="product.grade" size="small" class="w-full">
                          <el-option label="A级" value="A" />
                          <el-option label="B级" value="B" />
                          <el-option label="C级" value="C" />
                        </el-select>
                      </td>
                      <td class="px-2 py-2">
                        <el-input-number
                          v-model="product.harvestQuantity"
                          :min="0"
                          size="small"
                          class="w-full"
                        />
                      </td>
                      <td class="px-2 py-2">
                        <el-input-number
                          v-model="product.targetYield"
                          :min="0"
                          size="small"
                          class="w-full"
                        />
                      </td>
                      <td class="px-2 py-2 text-xs text-blue-700 bg-gray-50 text-center">
                        {{ product.targetYield > 0 ? Math.round((product.harvestQuantity / product.targetYield) * 100) : 0 }}%
                      </td>
                      <td class="px-2 py-2">
                        <el-input v-model="product.remarks" size="small" placeholder="备注" />
                      </td>
                      <td class="px-2 py-2">
                        <el-button
                          size="small"
                          type="danger"
                          link
                          @click="handleRemoveProduct(idx)"
                        >
                          <el-icon><Delete /></el-icon>
                        </el-button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="text-sm text-gray-500 italic border border-gray-200 rounded-lg p-4 text-center">
                暂无产品明细，请点击"添加产品"按钮添加
              </div>
            </div>

            <!-- 备注 -->
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-1">备注</label>
              <el-input
                v-model="formData.remarks"
                type="textarea"
                :rows="2"
                placeholder="请输入采收备注"
              />
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0 rounded-b-xl">
          <el-button size="small" @click="handleClose">取消</el-button>
          <el-button size="small" type="primary" @click="handleSave">保存</el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Plus, Close, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: Boolean,
  cropBatches: {
    type: Array,
    default: () => []
  },
  greenhouses: {
    type: Array,
    default: () => []
  },
  warehouseOptions: {
    type: Array,
    default: () => []
  },
  users: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'save', 'generate-code'])

// 表单数据
const formData = ref({
  harvestCode: '',
  batchCode: '',
  greenhouseId: '',
  harvestDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
  warehouseId: '',
  harvesterIds: [],
  auditor: localStorage.getItem('username') || '管理员',
  remarks: '',
  inboundType: 'planting_harvest',
  unitPrice: 0,
  products: []
})

// 错误信息
const errors = ref({})

// 拖动状态
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0, left: 0, top: 0 })

// 工人列表（过滤出worker和technician角色）
const workers = computed(() => {
  return props.users.filter(u => u.role === 'worker' || u.role === 'technician' || !u.role)
})

// 根据入库类型过滤批次
const filteredBatches = computed(() => {
  return props.cropBatches.filter(batch => {
    if (addForm.inboundType === 'seed_source') {
      return batch.planType === 'seed_breeding'
    } else if (addForm.inboundType === 'seedling') {
      return batch.planType === 'seedling'
    } else {
      return batch.planType === 'planting'
    }
  })
})

// 选中的批次
const selectedBatch = computed(() => {
  return props.cropBatches.find(b => b.batchCode === formData.value.batchCode)
})

// 计算收入
const calculatedAmount = computed(() => {
  const totalQuantity = formData.value.products.reduce((sum, p) => sum + (p.harvestQuantity || 0), 0)
  return (totalQuantity * formData.value.unitPrice).toFixed(2)
})

// 监听打开状态，初始化表单
watch(() => props.isOpen, (val) => {
  if (val) {
    initForm()
  }
})

// 初始化表单
const initForm = () => {
  formData.value = {
    harvestCode: '',
    batchCode: '',
    greenhouseId: '',
    harvestDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
    warehouseId: '',
    harvesterIds: [],
    auditor: localStorage.getItem('username') || '管理员',
    remarks: '',
    inboundType: 'planting_harvest',
    unitPrice: 0,
    products: []
  }
  errors.value = {}
}

// 入库类型变化
const handleInboundTypeChange = () => {
  formData.value.batchCode = ''
}

// 批次变化
const handleBatchChange = () => {
  if (selectedBatch.value) {
    formData.value.greenhouseId = selectedBatch.value.greenhouseId || ''
  }
}

// 生成采收单号
const handleGenerateCode = () => {
  const date = new Date()
  const code = `HS${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
  formData.value.harvestCode = code
}

// 添加产品
const handleAddProduct = () => {
  formData.value.products.push({
    productCode: '',
    cropName: selectedBatch.value?.cropName || '',
    variety: selectedBatch.value?.variety || '',
    batchCode: formData.value.batchCode,
    plantingMode: selectedBatch.value?.plantingMode || '',
    harvestQuantity: 0,
    targetYield: selectedBatch.value?.targetYield || 0,
    grade: 'A',
    remarks: ''
  })
}

// 删除产品
const handleRemoveProduct = (index) => {
  formData.value.products.splice(index, 1)
}

// 验证表单
const validateForm = () => {
  const newErrors = {}
  if (!formData.value.harvestCode) newErrors.harvestCode = '请生成采收单号'
  if (!formData.value.batchCode) newErrors.batchCode = '请选择采收批次'
  if (!formData.value.greenhouseId) newErrors.greenhouseId = '请选择采收区域'
  if (!formData.value.harvestDate) newErrors.harvestDate = '请选择采收时间'
  if (!formData.value.warehouseId) newErrors.warehouseId = '请选择入库仓库'
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// 保存
const handleSave = () => {
  if (!validateForm()) return

  const totalQuantity = formData.value.products.reduce((sum, p) => sum + (p.harvestQuantity || 0), 0)

  const record = {
    ...formData.value,
    harvestQuantity: totalQuantity,
    harvesterNames: props.users.filter(u => formData.value.harvesterIds.includes(u.id)).map(u => u.name),
    cropName: selectedBatch.value?.cropName || '',
    variety: selectedBatch.value?.variety || '',
    plantingMode: selectedBatch.value?.plantingMode || '',
    targetYield: selectedBatch.value?.targetYield || 0,
    unit: 'kg',
    totalAmount: totalQuantity * formData.value.unitPrice,
    status: 'harvested'
  }

  emit('save', record)
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
  const dialog = document.getElementById('harvest-add-dialog')
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
    const dialog = document.getElementById('harvest-add-dialog')
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
