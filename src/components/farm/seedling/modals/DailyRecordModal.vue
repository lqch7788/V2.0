<template>
  <!-- 纯div自定义弹窗 -->
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- 遮罩层 -->
    <div class="fixed inset-0 bg-black/50" @click="handleClose"></div>

    <!-- 弹窗主体 -->
    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
      <!-- 头部 - 使用渐变色 -->
      <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <el-icon :size="20" style="color: white;"><Calendar /></el-icon>
          <h3 class="text-lg font-semibold text-white">每日记录 - {{ record?.seedlingCode }}</h3>
        </div>
        <el-button circle text @click="handleClose" class="!text-white hover:!bg-white/20">
          <el-icon :size="20" style="color: white;"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 内容区域 -->
      <div class="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
        <div class="space-y-6">
          <!-- 添加新记录 -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-gray-900 mb-3">添加新记录</h4>
            <!-- 3列布局，与V1.1保持一致 -->
            <div class="grid grid-cols-3 gap-4">
              <!-- 第一行：记录日期 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">记录日期</label>
                <el-date-picker
                  v-model="formData.recordDate"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  class="w-full"
                />
              </div>
              <!-- 第一行：温度 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">温度（℃）</label>
                <el-input-number v-model="formData.temperature" :min="0" :step="0.1" class="w-full" placeholder="如：25" />
              </div>
              <!-- 第一行：湿度 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">湿度（%）</label>
                <el-input-number v-model="formData.humidity" :min="0" :step="0.1" class="w-full" placeholder="如：60" />
              </div>
              <!-- 第二行：pH值 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">pH值</label>
                <el-input-number v-model="formData.phValue" :min="0" :step="0.1" :precision="1" class="w-full" placeholder="如：6.5" />
              </div>
              <!-- 第二行：EC值 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">EC值（mS/cm）</label>
                <el-input-number v-model="formData.ecValue" :min="0" :step="0.1" :precision="1" class="w-full" placeholder="如：2.0" />
              </div>
              <!-- 第二行：是否浇水 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">是否浇水</label>
                <div class="flex items-center h-full">
                  <el-checkbox v-model="formData.watering" class="h-full flex items-center">
                    {{ formData.watering ? '是' : '否' }}
                  </el-checkbox>
                </div>
              </div>
              <!-- 第三行：成活变化 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">成活变化</label>
                <el-input-number v-model="formData.survivalCountChange" class="w-full" placeholder="正数增加，负数减少" />
              </div>
              <!-- 第三行：定植变化 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">定植变化</label>
                <el-input-number v-model="formData.plantedCountChange" class="w-full" placeholder="正数增加，负数减少" />
              </div>
              <!-- 第三行：损耗数量 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">损耗数量</label>
                <el-input-number v-model="formData.lossCountChange" class="w-full" placeholder="正数增加" />
              </div>
              <!-- 第四行：操作人员（占2列） -->
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">操作人员</label>
                <el-select v-model="formData.operator" placeholder="请选择操作人员" clearable class="w-full">
                  <el-option label="张三" value="zhangsan" />
                  <el-option label="李四" value="lisi" />
                  <el-option label="王五" value="wangwu" />
                </el-select>
              </div>
              <!-- 第四行：异常情况 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">异常情况</label>
                <el-input v-model="formData.abnormality" placeholder="无异常请留空" />
              </div>
              <!-- 备注（单独一行，占3列） -->
              <div class="col-span-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <el-input v-model="formData.remarks" type="textarea" :rows="2" placeholder="请输入备注信息" />
              </div>
            </div>
          </div>

          <!-- 历史记录列表 -->
          <div>
            <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
              <h4 class="text-sm font-semibold text-gray-900">
                历史记录 ({{ latestDailyRecords.length }} 条)
              </h4>
              <el-button
                type="primary"
                size="small"
                @click="handleExport"
                :disabled="latestDailyRecords.length === 0"
                class="flex items-center gap-1"
              >
                <el-icon><Download /></el-icon>
                导出
              </el-button>
            </div>
            <div v-if="latestDailyRecords.length === 0" class="text-center py-8 text-gray-500">
              暂无记录
            </div>
            <div v-else class="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
              <table class="w-full text-sm">
                <!-- 蓝色表头，与V1.1保持一致 -->
                <thead class="bg-blue-500 text-white sticky top-0">
                  <tr>
                    <th class="px-2 py-2 text-left font-semibold w-24">日期</th>
                    <th class="px-2 py-2 text-left font-semibold">温度</th>
                    <th class="px-2 py-2 text-left font-semibold">湿度</th>
                    <th class="px-2 py-2 text-left font-semibold">pH</th>
                    <th class="px-2 py-2 text-left font-semibold">EC</th>
                    <th class="px-2 py-2 text-left font-semibold">浇水</th>
                    <th class="px-2 py-2 text-left font-semibold">成活变化</th>
                    <th class="px-2 py-2 text-left font-semibold">定植变化</th>
                    <th class="px-2 py-2 text-left font-semibold">损耗变化</th>
                    <th class="px-2 py-2 text-left font-semibold">操作员</th>
                    <th class="px-2 py-2 text-left font-semibold">备注</th>
                    <th class="px-2 py-2 text-center font-semibold w-24">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="(r, index) in latestDailyRecords" :key="r.id || index" class="hover:bg-gray-50">
                    <td class="px-2 py-1.5">
                      <template v-if="editingId === r.id">
                        <el-date-picker
                          v-model="editingRow.recordDate"
                          type="date"
                          placeholder="选择日期"
                          value-format="YYYY-MM-DD"
                          class="w-full px-1 py-0.5 text-xs"
                        />
                      </template>
                      <template v-else>{{ r.recordDate }}</template>
                    </td>
                    <td class="px-2 py-1.5">
                      <template v-if="editingId === r.id">
                        <el-input-number v-model="editingRow.temperature" :min="0" :step="0.1" size="small" class="w-full" />
                      </template>
                      <template v-else>{{ r.temperature ? r.temperature + '℃' : '-' }}</template>
                    </td>
                    <td class="px-2 py-1.5">
                      <template v-if="editingId === r.id">
                        <el-input-number v-model="editingRow.humidity" :min="0" :step="0.1" size="small" class="w-full" />
                      </template>
                      <template v-else>{{ r.humidity ? r.humidity + '%' : '-' }}</template>
                    </td>
                    <td class="px-2 py-1.5">
                      <template v-if="editingId === r.id">
                        <el-input-number v-model="editingRow.phValue" :min="0" :step="0.1" :precision="1" size="small" class="w-full" />
                      </template>
                      <template v-else>{{ r.phValue ?? '-' }}</template>
                    </td>
                    <td class="px-2 py-1.5">
                      <template v-if="editingId === r.id">
                        <el-input-number v-model="editingRow.ecValue" :min="0" :step="0.1" :precision="1" size="small" class="w-full" />
                      </template>
                      <template v-else>{{ r.ecValue ?? '-' }}</template>
                    </td>
                    <td class="px-2 py-1.5">
                      <template v-if="editingId === r.id">
                        <el-checkbox v-model="editingRow.watering" />
                      </template>
                      <template v-else>{{ r.watering ? '✓' : '✗' }}</template>
                    </td>
                    <td class="px-2 py-1.5">
                      <template v-if="editingId === r.id">
                        <el-input-number v-model="editingRow.survivalCountChange" size="small" class="w-full" />
                      </template>
                      <template v-else>
                        <span v-if="r.survivalCountChange !== undefined" :class="r.survivalCountChange > 0 ? 'text-green-600' : r.survivalCountChange < 0 ? 'text-red-600' : 'text-gray-500'">
                          {{ r.survivalCountChange > 0 ? '+' : '' }}{{ r.survivalCountChange }}
                        </span>
                        <span v-else>-</span>
                      </template>
                    </td>
                    <td class="px-2 py-1.5">
                      <template v-if="editingId === r.id">
                        <el-input-number v-model="editingRow.plantedCountChange" size="small" class="w-full" />
                      </template>
                      <template v-else>
                        <span v-if="r.plantedCountChange !== undefined" :class="r.plantedCountChange > 0 ? 'text-green-600' : r.plantedCountChange < 0 ? 'text-red-600' : 'text-gray-500'">
                          {{ r.plantedCountChange > 0 ? '+' : '' }}{{ r.plantedCountChange }}
                        </span>
                        <span v-else>-</span>
                      </template>
                    </td>
                    <td class="px-2 py-1.5">
                      <template v-if="editingId === r.id">
                        <el-input-number v-model="editingRow.lossCountChange" size="small" class="w-full" />
                      </template>
                      <template v-else>
                        <span v-if="r.lossCountChange !== undefined" class="text-red-600">+{{ r.lossCountChange }}</span>
                        <span v-else>-</span>
                      </template>
                    </td>
                    <td class="px-2 py-1.5">{{ r.operator || '-' }}</td>
                    <td class="px-2 py-1.5 text-gray-500 truncate max-w-[120px]">{{ r.remarks || '-' }}</td>
                    <td class="px-2 py-1.5 text-center">
                      <template v-if="editingId === r.id">
                        <div class="flex items-center justify-center gap-1">
                          <el-button
                            text
                            @click="handleSaveEdit"
                            class="h-7 w-7 text-green-600 hover:text-green-700"
                          >
                            <el-icon><Check /></el-icon>
                          </el-button>
                          <el-button
                            text
                            @click="handleCancelEdit"
                            class="h-7 w-7 text-gray-500 hover:text-gray-700"
                          >
                            <el-icon><Close /></el-icon>
                          </el-button>
                        </div>
                      </template>
                      <template v-else>
                        <div class="flex items-center justify-center gap-1">
                          <el-button
                            text
                            @click="handleStartEdit(r)"
                            class="h-7 w-7 text-blue-600 hover:text-blue-700"
                          >
                            <el-icon><Edit /></el-icon>
                          </el-button>
                          <el-button
                            text
                            @click="handleDelete(r)"
                            class="h-7 w-7 text-red-600 hover:text-red-700"
                          >
                            <el-icon><Delete /></el-icon>
                          </el-button>
                        </div>
                      </template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 bg-gray-50">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">添加记录</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Calendar, Close, Download, Edit, Delete, Check } from '@element-plus/icons-vue'
import { useSeedlingStore } from '@/stores'
import * as XLSX from 'xlsx'

const props = defineProps({
  visible: Boolean,
  record: Object
})

const emit = defineEmits(['update:visible', 'success'])

const seedlingStore = useSeedlingStore()
const submitting = ref(false)

// 编辑状态
const editingId = ref(null)
const editingRow = ref({})

// 计算属性：获取最新的历史记录
const latestDailyRecords = computed(() => {
  if (!props.record) return []
  // 尝试从store获取最新数据
  const storeItem = seedlingStore.items?.find(s => s.id === props.record.id)
  return storeItem?.dailyRecords || props.record.dailyRecords || []
})

const formData = ref({
  recordDate: new Date().toISOString().split('T')[0],
  temperature: undefined,
  humidity: undefined,
  watering: false,
  abnormality: '',
  survivalCountChange: undefined,
  plantedCountChange: undefined,
  lossCountChange: undefined,
  remarks: '',
  phValue: undefined,
  ecValue: undefined,
  operator: ''
})

watch(() => props.visible, (val) => {
  if (val) {
    // 重置表单
    formData.value = {
      recordDate: new Date().toISOString().split('T')[0],
      temperature: undefined,
      humidity: undefined,
      watering: false,
      abnormality: '',
      survivalCountChange: undefined,
      plantedCountChange: undefined,
      lossCountChange: undefined,
      remarks: '',
      phValue: undefined,
      ecValue: undefined,
      operator: ''
    }
    // 重置编辑状态
    editingId.value = null
    editingRow.value = {}
  }
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!formData.value.recordDate) {
    ElMessage.warning('请选择记录日期')
    return
  }

  submitting.value = true
  try {
    // 后端期望 snake_case 格式
    await seedlingStore.addDailyRecord(props.record.id, {
      record_date: formData.value.recordDate,
      crop_name: props.record?.cropName,
      crop_variety: props.record?.cropVariety,
      greenhouse_name: props.record?.siteName,
      quantity: formData.value.survivalCountChange || 0,
      unit: '株',
      data: JSON.stringify({
        temperature: formData.value.temperature,
        humidity: formData.value.humidity,
        watering: formData.value.watering,
        ph_value: formData.value.phValue,
        ec_value: formData.value.ecValue,
        survival_count_change: formData.value.survivalCountChange,
        planted_count_change: formData.value.plantedCountChange,
        loss_count_change: formData.value.lossCountChange
      }),
      remarks: formData.value.remarks || undefined,
      create_by: formData.value.operator || localStorage.getItem('username') || '管理员'
    })

    ElMessage.success('添加记录成功')
    emit('success')
    handleClose()
  } catch (error) {
    console.error('添加每日记录失败:', error)
    ElMessage.error('添加记录失败')
  } finally {
    submitting.value = false
  }
}

// 开始编辑
const handleStartEdit = (r) => {
  editingId.value = r.id
  editingRow.value = { ...r }
}

// 取消编辑
const handleCancelEdit = () => {
  editingId.value = null
  editingRow.value = {}
}

// 保存编辑
const handleSaveEdit = async () => {
  if (!editingId.value) return
  try {
    const success = await seedlingStore.updateDailyRecord(props.record.id, editingId.value, editingRow.value)
    if (!success) {
      ElMessage.error('更新记录失败，请重试')
      return
    }
    editingId.value = null
    editingRow.value = {}
    ElMessage.success('更新记录成功')
    emit('success')
  } catch (error) {
    console.error('更新每日记录失败:', error)
    ElMessage.error('更新记录失败，请重试')
  }
}

// 删除记录
const handleDelete = async (r) => {
  try {
    await ElMessageBox.confirm(`确定要删除 ${r.recordDate} 的这条记录吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const success = await seedlingStore.deleteDailyRecord(props.record.id, r.id)
    if (!success) {
      ElMessage.error('删除记录失败，请重试')
      return
    }
    ElMessage.success('删除记录成功')
    emit('success')
  } catch (error) {
    // 用户取消删除
    console.log('取消删除')
  }
}

// 导出记录
const handleExport = () => {
  if (latestDailyRecords.value.length === 0) {
    ElMessage.warning('没有记录可导出')
    return
  }
  const data = latestDailyRecords.value.map(r => ({
    '日期': r.recordDate,
    '温度(℃)': r.temperature ?? '',
    '湿度(%)': r.humidity ?? '',
    'pH值': r.phValue ?? '',
    'EC值(mS/cm)': r.ecValue ?? '',
    '浇水': r.watering ? '是' : '否',
    '成活变化': r.survivalCountChange ?? '',
    '定植变化': r.plantedCountChange ?? '',
    '损耗变化': r.lossCountChange ?? '',
    '操作员': r.operator ?? '',
    '备注': r.remarks ?? ''
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '每日记录')
  XLSX.writeFile(wb, `每日记录_${props.record?.seedlingCode}.xlsx`)
  ElMessage.success('导出成功')
}
</script>
