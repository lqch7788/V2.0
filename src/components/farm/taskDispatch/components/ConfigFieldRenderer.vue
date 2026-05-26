<template>
  <!-- 配置字段渲染器 - 从V1.1 ConfigFieldRenderer.tsx 1:1迁移 -->
  <div>
    <label class="text-gray-700 text-sm font-medium block mb-1">
      {{ field.label }}
      <span v-if="field.required || error" class="text-red-500 ml-1">*</span>
    </label>

    <!-- 文本输入 -->
    <el-input v-if="field.type === 'text'"
      :model-value="(value || '')"
      @update:model-value="handleChange"
      :placeholder="field.placeholder"
      :disabled="disabled"
      :class="{ 'is-error': error }" />

    <!-- 数字输入 -->
    <div v-else-if="field.type === 'number'" class="flex items-center gap-2">
      <el-input
        :model-value="value ?? ''"
        @update:model-value="handleNumberChange"
        @blur="handleNumberBlur"
        :disabled="disabled"
        :class="{ 'is-error': error }"
        class="flex-1"
        :placeholder="field.placeholder" />
      <span v-if="field.unit" class="text-sm text-gray-500 whitespace-nowrap">{{ field.unit }}</span>
    </div>

    <!-- 下拉选择 -->
    <el-select v-else-if="field.type === 'select'"
      :model-value="(value || '')"
      @update:model-value="handleChange"
      :disabled="disabled"
      class="w-full"
      :class="{ 'is-error': error }"
      placeholder="请选择">
      <el-option v-for="opt in field.options" :key="opt.value" :value="opt.value" :label="opt.label" />
    </el-select>

    <!-- 多选 -->
    <div v-else-if="field.type === 'multiSelect'" class="flex flex-wrap gap-2">
      <label v-for="opt in field.options" :key="opt.value"
        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full cursor-pointer transition-colors"
        :class="isMultiSelected(opt.value) ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'">
        <input type="checkbox" :checked="isMultiSelected(opt.value)" @change="handleMultiToggle(opt.value)"
          :disabled="disabled" class="sr-only" />
        {{ opt.label }}
      </label>
    </div>

    <!-- 多行文本 -->
    <el-input v-else-if="field.type === 'textarea'"
      :model-value="(value || '')"
      @update:model-value="handleChange"
      :placeholder="field.placeholder"
      :disabled="disabled"
      type="textarea"
      :rows="3"
      :class="{ 'is-error': error }" />

    <!-- 多条目输入 -->
    <div v-else-if="field.type === 'multiEntry'" class="space-y-3">
      <div v-for="(entry, index) in safeEntries" :key="entry.id"
        class="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg">
        <!-- 条目序号 -->
        <div class="flex-shrink-0 w-6 h-6 mt-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-medium">
          {{ index + 1 }}
        </div>
        <!-- 条目字段 -->
        <div class="flex-1 flex flex-wrap gap-3">
          <template v-for="fieldDef in multiEntryFields" :key="fieldDef.key">
            <!-- 文本 -->
            <div v-if="fieldDef.type === 'text'" class="flex-1 min-w-[120px]">
              <span class="text-xs text-gray-500 block">{{ fieldDef.label }}</span>
              <el-input :model-value="entry[fieldDef.key] || ''"
                @update:model-value="(v) => handleEntryChange(entry.id, fieldDef.key, v)"
                :placeholder="fieldDef.placeholder" :disabled="disabled" size="small" />
            </div>
            <!-- 下拉 -->
            <div v-else-if="fieldDef.type === 'select'" class="flex-1 min-w-[120px]">
              <span class="text-xs text-gray-500 block">{{ fieldDef.label }}</span>
              <el-select :model-value="entry[fieldDef.key] || ''"
                @update:model-value="(v) => handleEntryChange(entry.id, fieldDef.key, v)"
                :disabled="disabled" size="small" class="w-full" placeholder="请选择">
                <el-option v-for="opt in fieldDef.options" :key="opt.value" :value="opt.value" :label="opt.label" />
              </el-select>
            </div>
            <!-- 数字 -->
            <div v-else-if="fieldDef.type === 'number'" class="flex-1 min-w-[100px]">
              <span class="text-xs text-gray-500 block">
                {{ fieldDef.label }}
                <span v-if="fieldDef.unit" class="text-gray-400 ml-1">({{ fieldDef.unit }})</span>
              </span>
              <el-input :model-value="entry[fieldDef.key]"
                @update:model-value="(v) => handleEntryNumberChange(entry.id, fieldDef.key, v)"
                @blur="(e) => handleEntryNumberBlur(entry.id, fieldDef.key, e)"
                :disabled="disabled" size="small" />
            </div>
          </template>
        </div>
        <!-- 删除按钮 -->
        <el-button :disabled="disabled || safeEntries.length <= 1"
          class="flex-shrink-0 mt-6" link @click="handleRemoveEntry(entry.id)" title="删除此条">
          <el-icon :size="16" class="text-gray-400 hover:text-red-500"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 添加按钮 -->
      <el-button v-if="safeEntries.length < maxEntries"
        :disabled="disabled" link size="small"
        class="text-emerald-600 border border-dashed border-emerald-300 px-3 py-1"
        @click="handleAddEntry">
        <el-icon :size="14"><Plus /></el-icon>
        添加{{ field.multiEntryDef?.entryLabel || '条目' }}
      </el-button>

      <p v-if="safeEntries.length > 0" class="text-xs text-gray-500">
        已添加 {{ safeEntries.length }}/{{ maxEntries }} 条
      </p>
    </div>

    <!-- 默认文本输入 -->
    <el-input v-else
      :model-value="(value || '')"
      @update:model-value="handleChange"
      :placeholder="field.placeholder"
      :disabled="disabled"
      :class="{ 'is-error': error }" />

    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Close, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  field: { type: Object, required: true },
  value: { default: undefined },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update'])

const safeEntries = computed(() => Array.isArray(props.value) ? props.value : [])
const maxEntries = computed(() => props.field.multiEntryDef?.maxEntries || 5)
const multiEntryFields = computed(() => props.field.multiEntryDef?.fields || [])

const handleChange = (newValue) => {
  if (!props.disabled) emit('update', props.field.key, newValue)
}

const handleNumberChange = (val) => {
  const raw = String(val).replace(/[^\d.-]/g, '')
  if (raw === '' || raw === '-' || raw === '.') {
    handleChange(raw)
    return
  }
  const num = parseFloat(raw)
  if (!isNaN(num)) {
    handleChange(Math.round(num * 100) / 100)
  } else {
    handleChange(raw)
  }
}

const handleNumberBlur = (e) => {
  const num = parseFloat(e?.target?.value || props.value)
  if (!isNaN(num)) handleChange(Math.round(num * 100) / 100)
}

const isMultiSelected = (val) => (Array.isArray(props.value) ? props.value : []).includes(val)

const handleMultiToggle = (val) => {
  if (props.disabled) return
  const arr = Array.isArray(props.value) ? [...props.value] : []
  const newValues = arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
  handleChange(newValues)
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

const handleAddEntry = () => {
  if (props.disabled || safeEntries.value.length >= maxEntries.value) return
  const newEntry = { id: generateId() }
  multiEntryFields.value.forEach(f => { newEntry[f.key] = '' })
  handleChange([...safeEntries.value, newEntry])
}

const handleRemoveEntry = (id) => {
  if (props.disabled) return
  handleChange(safeEntries.value.filter(e => e && e.id !== id))
}

const handleEntryChange = (id, fieldKey, fieldValue) => {
  if (props.disabled) return
  handleChange(safeEntries.value.map(e => (e && e.id === id ? { ...e, [fieldKey]: fieldValue } : e)))
}

const handleEntryNumberChange = (id, fieldKey, val) => {
  const raw = String(val).replace(/[^\d.-]/g, '')
  if (raw === '' || raw === '-' || raw === '.') {
    handleEntryChange(id, fieldKey, raw)
    return
  }
  const num = parseFloat(raw)
  if (!isNaN(num)) {
    handleEntryChange(id, fieldKey, Math.round(num * 100) / 100)
  } else {
    handleEntryChange(id, fieldKey, raw)
  }
}

const handleEntryNumberBlur = (id, fieldKey, e) => {
  const num = parseFloat(e?.target?.value)
  if (!isNaN(num)) handleEntryChange(id, fieldKey, Math.round(num * 100) / 100)
}
</script>
