<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    width="560px"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <!-- 关联配置区 -->
    <div class="bg-emerald-50 rounded-lg p-4 mb-4">
      <h4 class="text-sm font-semibold text-emerald-700 mb-3">关联配置</h4>
      <div class="space-y-4">
        <!-- 分区选择 -->
        <div>
          <label class="block text-xs text-emerald-700 mb-1">
            分区 <span class="text-red-500">*</span>
          </label>
          <el-select
            v-model="localForm.partitionOid"
            placeholder="— 请选择分区 —"
            class="w-full"
          >
            <el-option label="— 请选择分区 —" value="" />
            <el-option
              v-for="p in partitionOptions"
              :key="p.oid"
              :label="p.label"
              :value="p.oid"
            />
          </el-select>
        </div>

        <!-- 设备系统选择 -->
        <div>
          <label class="block text-xs text-emerald-700 mb-1">
            设备系统 <span class="text-red-500">*</span>
          </label>
          <div v-if="systemOptions.length > 0" class="flex gap-2 mb-2">
            <el-button
              :type="systemInputMode === 'select' ? 'primary' : 'default'"
              size="small"
              @click="setSystemInputMode('select')"
            >
              选择已有
            </el-button>
            <el-button
              :type="systemInputMode === 'input' ? 'primary' : 'default'"
              size="small"
              @click="setSystemInputMode('input')"
            >
              手动输入
            </el-button>
          </div>
          <el-select
            v-if="systemInputMode === 'select' && systemOptions.length > 0"
            v-model="localForm.systemOid"
            placeholder="— 请选择设备系统 —"
            class="w-full"
          >
            <el-option label="— 请选择设备系统 —" value="" />
            <el-option
              v-for="sys in systemOptions"
              :key="sys"
              :label="sys"
              :value="sys"
            />
          </el-select>
          <el-input
            v-else
            v-model="localForm.systemOid"
            placeholder="输入设备系统 OID 或名称"
          />
        </div>
      </div>
    </div>

    <!-- 详细信息区 -->
    <div class="rounded-lg p-4 border border-gray-100">
      <h4 class="text-sm font-semibold text-gray-700 mb-3">其他信息</h4>
      <div class="space-y-4">
        <div>
          <label class="block text-xs text-gray-500 mb-1">关联设备 OID</label>
          <el-input
            v-model="localForm.deviceOid"
            placeholder="设备 OID（可选）"
            class="font-mono"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">描述备注</label>
          <el-input
            v-model="localForm.description"
            placeholder="备注信息"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        @click="handleSubmit"
        :disabled="!localForm.partitionOid || !localForm.systemOid"
      >
        提交
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: String,
  form: Object,
  partitionOptions: Array,
  systemOptions: Array,
  isEdit: Boolean
})

const emit = defineEmits(['update:modelValue', 'close', 'submit'])

// 本地表单状态
const localForm = ref({
  partitionOid: '',
  systemOid: '',
  deviceOid: '',
  description: ''
})

// 系统输入模式
const systemInputMode = ref('select')

// 监听props.form变化，同步本地表单
watch(() => props.form, (newForm) => {
  if (newForm) {
    localForm.value = { ...newForm }
  }
}, { immediate: true, deep: true })

// 监听modelValue，当弹窗打开时重置输入模式
watch(() => props.modelValue, (val) => {
  if (val) {
    systemInputMode.value = props.systemOptions?.length > 0 ? 'select' : 'input'
  }
})

// 设置系统输入模式
const setSystemInputMode = (mode) => {
  systemInputMode.value = mode
  if (mode === 'input') {
    localForm.value.systemOid = ''
  }
}

// 关闭弹窗
const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

// 提交
const handleSubmit = () => {
  emit('submit', localForm.value)
}
</script>
