<!--
  新增履历行内表单 — 4 Tab（移入/移出/打标记/作废）（V1.1 AddResumeForm.tsx 1:1 迁移）
  从 SeedlingLabelManageModal 底部表单提取 + 扩展 void Tab + 数量字段
  2026-06-23: 粒度扩展 — quantityChange / reason / expectedQuantity
  2026-07-18 P0-MISS-002 修复：V2.0 此前缺失此组件
-->
<template>
  <div class="px-4 py-3 border-t border-emerald-200 bg-emerald-50 flex-shrink-0">
    <div class="text-xs font-semibold text-emerald-900 mb-2">
      新增履历 — 当前标签：{{ selectedLabel?.labelNumber || '-' }}
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <!-- 4 个操作类型 Tab -->
      <button
        v-for="opt in OP_OPTIONS"
        :key="opt.v"
        type="button"
        :class="['inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
          addOpType === opt.v
            ? opt.cls + ' ring-2 ring-offset-1 ring-emerald-400'
            : 'bg-white text-gray-600 border border-gray-300']"
        @click="handleOpTypeChange(opt.v)"
      >
        <component :is="opt.icon" :size="12" />{{ opt.label }}
      </button>

      <!-- 日期 -->
      <input
        type="date"
        :value="addOpDate"
        class="px-2 py-1 border border-gray-300 rounded text-xs h-7"
        @input="(e) => setAddOpDate(e.target.value)"
      />

      <!-- 区域输入（移入/移出用） -->
      <input
        v-if="addOpType !== 'mark' && addOpType !== 'void'"
        type="text"
        :value="addAreaName"
        :placeholder="addOpType === 'move_in' ? '移入到哪个区域（如：东区-A区）' : '移出到哪个区域（如：隔离区）'"
        class="px-2 py-1 border border-gray-300 rounded text-xs h-7 w-48"
        @input="(e) => setAddAreaName(e.target.value)"
      />

      <!-- 标记选择（打标记用） -->
      <div v-if="addOpType === 'mark'" class="flex gap-1">
        <button
          v-for="m in MARK_OPTIONS"
          :key="m.id"
          type="button"
          :class="['px-2 py-1 rounded text-xs font-medium text-white',
            addMarkId === m.id ? 'ring-2 ring-offset-1 ring-emerald-400' : 'opacity-70']"
          :style="{ backgroundColor: m.color }"
          @click="setAddMarkId(m.id)"
        >
          {{ m.name }}
        </button>
      </div>

      <!-- 数量变更（非标记操作时显示） -->
      <input
        v-if="addOpType !== 'mark'"
        type="number"
        :value="quantityChange"
        placeholder="数量变更（如：-5, +3）"
        class="px-2 py-1 border border-gray-300 rounded text-xs h-7 w-36"
        @input="(e) => setQuantityChange(e.target.value)"
      />

      <!-- 原因（非标记操作） -->
      <input
        v-if="addOpType !== 'mark'"
        type="text"
        :value="reason"
        placeholder="原因（如：移栽损耗）"
        class="px-2 py-1 border border-gray-300 rounded text-xs h-7 flex-1 min-w-[120px]"
        @input="(e) => setReason(e.target.value)"
      />

      <!-- 备注 -->
      <input
        type="text"
        :value="addRemarks"
        placeholder="备注（可选）"
        class="px-2 py-1 border border-gray-300 rounded text-xs h-7 flex-1 min-w-[120px]"
        @input="(e) => setAddRemarks(e.target.value)"
      />

      <!-- 拍照按钮 -->
      <input
        ref="photoInputRef"
        type="file"
        accept="image/*"
        capture="environment"
        class="hidden"
        @change="handlePhotoChange"
      />
      <el-button size="small" @click="photoInputRef?.click?.()" title="拍照/选择图片">
        <el-icon :size="14"><Camera /></el-icon>
        {{ addPhotoBase64 ? '已附图' : '拍照' }}
      </el-button>

      <!-- 操作按钮 -->
      <el-button size="small" type="primary" :disabled="addSubmitting" @click="handleSubmit">
        {{ addSubmitting ? '提交中...' : '确认' }}
      </el-button>
      <el-button size="small" @click="handleCancel">取消</el-button>
    </div>

    <!-- 图片预览 -->
    <div v-if="addPhotoBase64" class="mt-2 flex items-center gap-2">
      <img :src="addPhotoBase64" alt="预览" class="w-16 h-16 object-cover rounded border border-gray-300" />
      <button type="button" class="text-xs text-red-500 hover:text-red-700" @click="setAddPhotoBase64(null)">
        删除图片
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowRight, ArrowLeft, Stamp, Camera, Trash2 } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'
import { todayLocal } from '@/lib/dateUtils'

// 标记选项（与 V1.1 L16-21 1:1）
const MARK_OPTIONS = [
  { id: 1, name: '正常', color: '#22c55e' },
  { id: 2, name: '关注', color: '#f59e0b' },
  { id: 3, name: '问题', color: '#ef4444' },
  { id: 4, name: '优质', color: '#3b82f6' }
]

const OP_OPTIONS = [
  { v: 'move_in', label: '移入', icon: ArrowRight, cls: 'bg-emerald-100 text-emerald-700' },
  { v: 'move_out', label: '移出', icon: ArrowLeft, cls: 'bg-orange-100 text-orange-700' },
  { v: 'mark', label: '打标记', icon: Stamp, cls: 'bg-purple-100 text-purple-700' },
  { v: 'void', label: '作废', icon: Trash2, cls: 'bg-gray-100 text-gray-700' }
]

const props = defineProps({
  selectedLabel: { type: Object, default: null }
})

const emit = defineEmits(['submitted', 'cancel'])

const userStore = useUserStore()

const addOpType = ref('move_in')
const addOpDate = ref(todayLocal())
const addAreaName = ref('')
const addMarkId = ref(2)
const addRemarks = ref('')
const addSubmitting = ref(false)
const quantityChange = ref('')
const reason = ref('')
const addPhotoBase64 = ref(null)
const photoInputRef = ref(null)

const handleOpTypeChange = (t) => {
  addOpType.value = t
  addAreaName.value = ''
  if (t === 'mark') {
    quantityChange.value = ''
    reason.value = ''
    addPhotoBase64.value = null
  }
}

const setAddOpDate = (v) => { addOpDate.value = v }
const setAddAreaName = (v) => { addAreaName.value = v }
const setAddMarkId = (id) => { addMarkId.value = id }
const setAddRemarks = (v) => { addRemarks.value = v }
const setQuantityChange = (v) => { quantityChange.value = v }
const setReason = (v) => { reason.value = v }
const setAddPhotoBase64 = (v) => { addPhotoBase64.value = v }

const handlePhotoChange = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.warning('图片不能超过 2MB')
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => { addPhotoBase64.value = ev.target?.result || null }
  reader.readAsDataURL(file)
  e.target.value = ''
}

const handleCancel = () => {
  emit('cancel')
  addPhotoBase64.value = null
}

const handleSubmit = async () => {
  const labelId = props.selectedLabel?.id
  if (!labelId) {
    ElMessage.warning('请先选择左侧标签')
    return
  }
  if (addOpType.value !== 'mark' && addOpType.value !== 'void' && !addAreaName.value.trim()) {
    ElMessage.warning('请输入区域名称')
    return
  }
  addSubmitting.value = true
  try {
    const operatorName =
      userStore.userInfo?.realName ||
      userStore.userInfo?.username ||
      'system'

    if (addOpType.value === 'mark') {
      // 打标记（专用接口）
      const { enhancedApiClient } = await import('@/lib/apiClient')
      const res = await enhancedApiClient.post('/plant-labels/assign', {
        mark_id: addMarkId.value,
        label_ids: [labelId]
      })
      if (res?.success !== false) {
        emit('submitted')
      } else {
        ElMessage.error('标记失败：' + (res?.error || '未知错误'))
      }
    } else {
      // 移入/移出/作废 — 统一履历接口
      const { enhancedApiClient } = await import('@/lib/apiClient')
      const payload = {
        operation_type: addOpType.value,
        operation_date: addOpDate.value,
        operator_name: operatorName,
        remarks: addRemarks.value.trim() || null,
        image_base64: addPhotoBase64.value || null
      }
      if (addOpType.value !== 'void') {
        payload.to_area_name = addAreaName.value.trim()
      }
      if (quantityChange.value !== '') {
        payload.quantity_change = Number(quantityChange.value)
        payload.expected_quantity = props.selectedLabel.quantity ?? undefined
      }
      if (reason.value.trim()) {
        payload.reason = reason.value.trim()
      }
      const res = await enhancedApiClient.post(`/plant-labels/${labelId}/resumes`, payload)
      if (res?.success !== false) {
        emit('submitted')
      } else {
        ElMessage.error('录入失败：' + (res?.error || '未知错误'))
      }
    }
  } catch (e) {
    ElMessage.error('网络错误：' + (e?.message || String(e)))
  } finally {
    addSubmitting.value = false
  }
}
</script>
