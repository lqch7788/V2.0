<template>
  <!-- 施肥编辑弹窗组件（纯div自定义弹窗） -->
  <Teleport to="body">
    <div v-if="isOpen && record" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="handleClose">
      <div
        class="bg-white rounded-lg w-full max-w-4xl shadow-2xl"
        :style="{ maxHeight: '85vh' }"
        @click.stop
      >
        <!-- 头部 — 绿色渐变 -->
        <div
          class="px-6 py-4 flex items-center justify-between rounded-t-lg"
          style="background: linear-gradient(to right, #10b981, #059669, #10b981);"
        >
          <h3 class="font-semibold flex items-center gap-2">
            <el-icon class="text-xl" style="color: white;"><Edit /></el-icon>
            <span style="color: white;">编辑施肥记录 - {{ record.fertilizerCode }}</span>
          </h3>
          <el-button link class="hover:bg-white/10" style="color: rgba(255,255,255,0.8);" @click="handleClose">
            <el-icon style="color: white; font-size: 20px;"><Close /></el-icon>
          </el-button>
        </div>

        <!-- IoT 警告 -->
        <div v-if="isIot" class="mx-6 mt-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
          <el-icon class="w-5 h-5 text-amber-500"><Warning /></el-icon>
          <span>IoT自动记录不可编辑，仅可查看。如需调整，请修改IoT设备的采集参数。</span>
        </div>

        <!-- 表单内容 -->
        <div class="p-6 overflow-y-auto" style="max-height: calc(85vh - 140px);">
          <div class="space-y-4">
            <!-- Section 1: 基础信息 -->
            <div>
              <h3 class="text-sm font-bold text-gray-900 mb-3">📋 基础信息</h3>
              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-1">施肥编号</label>
                    <el-input :model-value="record.fertilizerCode" readonly class="font-mono" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-1">数据来源</label>
                    <el-input
                      :model-value="isIot ? 'IoT自动' : '手动录入'"
                      readonly
                      :class="isIot ? 'text-green-600' : 'text-blue-600'"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 2: 肥料与用量 -->
            <div>
              <h3 class="text-sm font-bold text-gray-900 mb-3">🧪 肥料与用量</h3>
              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-1">肥料类型</label>
                    <el-select
                      v-model="form.fertilizerType"
                      :disabled="isIot"
                      placeholder="选择肥料类型"
                      class="w-full"
                    >
                      <el-option label="有机肥" value="organic" />
                      <el-option label="无机肥" value="inorganic" />
                      <el-option label="生物肥" value="biological" />
                      <el-option label="复合肥" value="compound" />
                      <el-option label="微量元素肥" value="trace" />
                    </el-select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-1">
                      肥料名称 <span class="text-red-500">*</span>
                    </label>
                    <el-input
                      v-model="form.fertilizerName"
                      :disabled="isIot"
                      placeholder="请输入肥料名称"
                    />
                  </div>
                </div>
                <div class="grid grid-cols-4 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-1">稀释比例</label>
                    <el-input v-model="form.dilutionRatio" :disabled="isIot" placeholder="如 1:500" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-1">施肥量</label>
                    <el-input-number
                      v-model="form.quantity"
                      :disabled="isIot"
                      :min="0"
                      :step="0.01"
                      placeholder="0"
                      class="w-full"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-1">单位</label>
                    <el-select v-model="form.unit" :disabled="isIot" placeholder="选择单位" class="w-full">
                      <el-option label="千克" value="千克" />
                      <el-option label="克" value="克" />
                      <el-option label="吨" value="吨" />
                      <el-option label="升" value="升" />
                      <el-option label="毫升" value="毫升" />
                    </el-select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-1">单价 (元)</label>
                    <el-input-number
                      v-model="form.unitPrice"
                      :disabled="isIot"
                      :min="0"
                      :step="0.01"
                      placeholder="0"
                      class="w-full"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-900 mb-1">总成本（自动计算）</label>
                  <el-input :model-value="`${form.totalCost.toFixed(2)} 元`" readonly class="bg-green-50 font-bold text-emerald-700" />
                </div>
              </div>
            </div>

            <!-- Section 3: 位置与时间 -->
            <div>
              <h3 class="text-sm font-bold text-gray-900 mb-3">📍 位置与时间</h3>
              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-1">温室位置</label>
                    <el-input v-model="form.greenhouseName" :disabled="isIot" placeholder="请输入温室位置" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-1">作物品种</label>
                    <el-input v-model="form.cropName" :disabled="isIot" placeholder="请输入作物品种" />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-900 mb-1">施肥时间</label>
                  <el-date-picker
                    v-model="form.fertilizeTime"
                    :disabled="isIot"
                    type="datetime"
                    placeholder="选择日期和时间"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    class="w-full"
                  />
                </div>
              </div>
            </div>

            <!-- Section 4: 操作与备注 -->
            <div>
              <h3 class="text-sm font-bold text-gray-900 mb-3">📝 操作与备注</h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-900 mb-1">操作员</label>
                  <el-input v-model="form.operatorName" :disabled="isIot" placeholder="请输入操作员名称" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-900 mb-1">备注</label>
                  <el-input
                    v-model="form.description"
                    :disabled="isIot"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入备注信息"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 rounded-b-lg">
          <el-button size="small" @click="handleClose">取消</el-button>
          <el-button
            v-if="!isIot"
            type="warning"
            size="small"
            :disabled="submitting || !form.fertilizerName.trim()"
            @click="handleSubmit"
          >
            {{ submitting ? '保存中...' : '保存修改' }}
          </el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { Edit, Close, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  isOpen: Boolean,
  record: Object
})

const emit = defineEmits(['close', 'saved'])

// 提交状态
const submitting = ref(false)

// 是否为IoT记录
const isIot = computed(() => props.record?.dataSource === 'auto_iot')

// 表单数据
const form = reactive({
  fertilizerCode: '',
  fertilizerName: '',
  fertilizerType: '',
  cropName: '',
  greenhouseName: '',
  dilutionRatio: '',
  quantity: 0,
  unit: '千克',
  unitPrice: 0,
  totalCost: 0,
  fertilizeTime: '',
  operatorName: '',
  description: ''
})

// 自动计算总成本
const totalCost = computed(() => {
  return (form.quantity || 0) * (form.unitPrice || 0)
})

// 监听 quantity 或 unitPrice 变化，自动计算总成本
watch([() => form.quantity, () => form.unitPrice], () => {
  form.totalCost = totalCost.value
})

// 监听打开弹窗和记录变化，填充表单
watch([() => props.isOpen, () => props.record], ([isOpen, record]) => {
  if (isOpen && record) {
    form.fertilizerCode = record.fertilizerCode || ''
    form.fertilizerName = record.fertilizerName || ''
    form.fertilizerType = record.fertilizerType || ''
    form.cropName = record.cropName || ''
    form.greenhouseName = record.greenhouseName || ''
    form.dilutionRatio = record.dilutionRatio || ''
    form.quantity = record.quantity || 0
    form.unit = record.unit || '千克'
    form.unitPrice = record.unitPrice || 0
    form.totalCost = record.totalCost || 0
    form.fertilizeTime = record.fertilizeTime || ''
    form.operatorName = record.operatorName || ''
    form.description = record.description || ''
  }
}, { immediate: true })

// 关闭
const handleClose = () => {
  emit('close')
}

// 提交
const handleSubmit = async () => {
  if (isIot.value) return
  if (!form.fertilizerName.trim()) {
    ElMessage.warning('请输入肥料名称')
    return
  }

  submitting.value = true
  try {
    emit('saved', { ...form })
    ElMessage.success('保存成功')
    handleClose()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* V1.1样式保持 */
</style>
