<template>
  <!-- 移入/移出操作弹窗 - 纯div结构 -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" @click.self="onClose">
    <div class="bg-white rounded-xl w-full max-w-lg shadow-xl">
      <!-- 标题栏 - 渐变背景 -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-xl">
        <h3 class="text-lg font-semibold text-white flex items-center gap-2">
          <el-icon style="color: white;"><Rank /></el-icon>
          移入/移出操作
        </h3>
        <el-icon style="color: white; cursor: pointer;" @click="onClose"><Close /></el-icon>
      </div>

      <!-- 业务规则提示 -->
      <div v-if="isHarvested" class="mx-4 mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
        <el-icon><Warning /></el-icon>
        <span>已采收植株不能移动，请先取消采收状态</span>
      </div>

      <!-- 表单内容 -->
      <div class="p-4 space-y-4">
        <!-- 操作类型 -->
        <div>
          <label class="block text-gray-700 text-sm mb-2 font-medium">操作类型 *</label>
          <el-select v-model="formData.operationType" placeholder="选择操作类型" class="w-full" :disabled="isHarvested">
            <el-option value="move_in" label="移入" />
            <el-option value="move_out" label="移出" />
          </el-select>
        </div>

        <!-- 标签编号 -->
        <div>
          <label class="block text-gray-700 text-sm mb-2 font-medium">标签编号 *</label>
          <el-input v-model="formData.labelNumber" placeholder="请输入或扫描标签二维码ID" :disabled="isHarvested" />
        </div>

        <!-- 目标区域 -->
        <div>
          <label class="block text-gray-700 text-sm mb-2 font-medium">
            {{ formData.operationType === 'move_in' ? '移入目标区域' : '移出目标区域' }} *
          </label>
          <el-select v-model="formData.targetArea" placeholder="选择区域" class="w-full" :disabled="isHarvested">
            <el-option v-for="area in areaOptions" :key="area.value" :label="area.label" :value="area.value" />
          </el-select>
        </div>

        <!-- 操作日期 -->
        <div>
          <label class="block text-gray-700 text-sm mb-2 font-medium">操作日期</label>
          <el-date-picker
            v-model="formData.operationDate"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            class="w-full"
            :disabled="isHarvested"
          />
        </div>

        <!-- 备注 -->
        <div>
          <label class="block text-gray-700 text-sm mb-2 font-medium">备注</label>
          <el-input v-model="formData.remarks" type="textarea" :rows="3" placeholder="备注信息（可选）" :disabled="isHarvested" />
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="p-4 border-t border-gray-200 flex justify-end gap-3">
        <el-button @click="onClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :disabled="isHarvested">提交</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Rank, Close, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  isOpen: Boolean,
  areaOptions: {
    type: Array,
    default: () => [
      { value: '1号棚', label: '1号棚' },
      { value: '2号棚', label: '2号棚' },
      { value: '3号棚', label: '3号棚' },
      { value: '4号棚', label: '4号棚' }
    ]
  },
  isHarvested: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const formData = ref({
  operationType: 'move_in',
  labelNumber: '',
  targetArea: '',
  operationDate: new Date().toISOString().slice(0, 10),
  remarks: ''
})

watch(() => props.isOpen, (val) => {
  if (val) {
    formData.value = {
      operationType: 'move_in',
      labelNumber: '',
      targetArea: '',
      operationDate: new Date().toISOString().slice(0, 10),
      remarks: ''
    }
  }
})

const onClose = () => {
  emit('close')
}

const handleSubmit = () => {
  if (!formData.value.labelNumber.trim()) {
    ElMessage.warning('请输入标签编号')
    return
  }
  if (!formData.value.targetArea) {
    ElMessage.warning('请选择目标区域')
    return
  }
  emit('submit', { ...formData.value })
}
</script>
