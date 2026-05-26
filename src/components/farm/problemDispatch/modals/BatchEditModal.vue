<template>
  <!-- 批量编辑问题记录弹窗 - 从V1.1 BatchEditModal.tsx 1:1迁移 -->
  <el-dialog :model-value="isOpen" @update:model-value="$emit('close')"
    title="批量编辑问题记录" width="1000px" top="5vh"
    @confirm="$emit('confirm')">
    <div class="space-y-4">
      <!-- 信息提示 -->
      <div class="bg-blue-50 rounded-lg p-3">
        <p class="text-sm text-blue-800">
          已选择 <strong>{{ selectedRows.length }}</strong> 个问题进行批量编辑，
          已编辑 <strong>{{ editedProblemCodes.length }}</strong> 个
        </p>
      </div>

      <!-- 问题选择器 -->
      <div>
        <label class="text-sm text-gray-600 block mb-1">选择问题编号</label>
        <el-select :model-value="selectedProblemId?.toString() || ''"
          @update:model-value="(v) => $emit('selectedProblemIdChange', Number(v) || null)"
          class="w-full" placeholder="请选择问题编号">
          <el-option value="" label="请选择问题编号" />
          <el-option v-for="p in selectedProblemList" :key="p.id"
            :value="p.id.toString()"
            :label="`${p.id} - ${p.greenhouseName} - ${(p.issueText || '').slice(0, 20)}... ${editedProblemCodes.includes(p.id) ? '✅ 已编辑' : ''}`" />
        </el-select>
      </div>

      <!-- 编辑区域 -->
      <div v-if="selectedProblemId && currentProblem" class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- 问题ID - 不可编辑 -->
        <div class="bg-gray-100 rounded-lg p-3">
          <div class="text-xs text-gray-500 mb-1">问题编号</div>
          <div class="text-sm font-medium text-gray-900">{{ currentProblem.id }}</div>
        </div>

        <!-- 温室区域 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">温室区域</label>
          <el-select :model-value="editedData.greenhouseId ?? currentProblem.greenhouseId"
            @update:model-value="handleGreenhouseChange" class="w-full" placeholder="请选择">
            <el-option v-for="g in greenhouses" :key="g.id" :value="g.id" :label="g.name" />
          </el-select>
        </div>

        <!-- 作物名称 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">作物名称</label>
          <el-select :model-value="editedData.cropName ?? currentProblem.cropName"
            @update:model-value="(v) => handleFieldChange('cropName', v)" class="w-full" placeholder="请选择">
            <el-option v-for="c in cropOptions" :key="c.value" :value="c.value" :label="c.label" />
          </el-select>
        </div>

        <!-- 巡检日期 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">巡检日期</label>
          <el-date-picker :model-value="(editedData.checkDate ?? currentProblem.checkDate)"
            @update:model-value="(v) => handleFieldChange('checkDate', v)"
            type="date" class="w-full" />
        </div>

        <!-- 问题描述 -->
        <div class="md:col-span-2">
          <label class="text-sm text-gray-600 block mb-1">问题描述</label>
          <el-input :model-value="editedData.issueText ?? currentProblem.issueText"
            @update:model-value="(v) => handleFieldChange('issueText', v)"
            type="textarea" :rows="2" />
        </div>

        <!-- 严重程度 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">严重程度</label>
          <el-select :model-value="editedData.issueSeverity ?? currentProblem.issueSeverity"
            @update:model-value="(v) => handleFieldChange('issueSeverity', v)" class="w-full" placeholder="请选择">
            <el-option v-for="s in severityOptions" :key="s" :value="s" :label="s" />
          </el-select>
        </div>

        <!-- 当前状态 - 不可编辑 -->
        <div class="bg-gray-100 rounded-lg p-3">
          <div class="text-xs text-gray-500 mb-1">当前状态</div>
          <span class="inline-flex px-2 py-1 rounded text-xs font-medium"
            :class="statusClass(currentProblem.status)">
            {{ currentProblem.status }}
          </span>
        </div>

        <!-- 处理人 -->
        <div>
          <label class="text-sm text-gray-600 block mb-1">处理人</label>
          <el-input :model-value="editedData.handler ?? currentProblem.handler ?? ''"
            @update:model-value="(v) => handleFieldChange('handler', v)"
            placeholder="输入处理人姓名" />
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" @click="$emit('confirm')">保存修改</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  problems: { type: Array, default: () => [] },
  editedProblemCodes: { type: Array, default: () => [] },
  editedProblems: { type: Object, default: () => ({}) },
  selectedProblemId: { type: Number, default: null },
})

const emit = defineEmits([
  'close', 'confirm', 'selectedProblemIdChange',
  'editedProblemsChange', 'editedProblemCodesChange',
])

const selectedProblemList = computed(() =>
  props.selectedRows.map(id => props.problems.find(p => p.id === id)).filter(Boolean)
)

const currentProblem = computed(() =>
  props.selectedProblemId ? props.problems.find(p => p.id === props.selectedProblemId) : null
)

const editedData = computed(() =>
  props.selectedProblemId ? (props.editedProblems[props.selectedProblemId] || {}) : {}
)

const greenhouses = computed(() => {
  // from formData or store
  return []
})

const cropOptions = computed(() => [])

const severityOptions = ['轻微', '中等', '严重']

const statusClass = (status) => {
  const map = {
    '已处理': 'bg-green-100 text-green-700',
    '处理中': 'bg-amber-100 text-amber-700',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

const handleFieldChange = (field, value) => {
  if (!props.selectedProblemId) return
  const updated = {
    ...props.editedProblems,
    [props.selectedProblemId]: { ...(props.editedProblems[props.selectedProblemId] || {}), [field]: value },
  }
  emit('editedProblemsChange', updated)
  if (!props.editedProblemCodes.includes(props.selectedProblemId)) {
    emit('editedProblemCodesChange', [...props.editedProblemCodes, props.selectedProblemId])
  }
}

const handleGreenhouseChange = (greenhouseId) => {
  const gh = greenhouses.value.find(g => g.id === greenhouseId)
  handleFieldChange('greenhouseId', greenhouseId)
  if (gh) handleFieldChange('greenhouseName', gh.name)
}
</script>
