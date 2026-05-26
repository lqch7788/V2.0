<template>
  <!-- 配置字段渲染器 - 根据类型动态渲染不同输入控件 -->
  <div>
    <label class="text-gray-700">
      {{ field.label }}
      <span v-if="field.required || error" class="text-red-500 ml-1">*</span>
    </label>

    <!-- 文本输入 -->
    <template v-if="field.type === 'text'">
      <el-input
        :model-value="value"
        @update:model-value="handleChange"
        :placeholder="field.placeholder"
        :disabled="disabled"
        :class="baseInputClass"
      />
    </template>

    <!-- 数字输入 -->
    <template v-else-if="field.type === 'number'">
      <div class="flex items-center gap-2">
        <el-input
          :model-value="value"
          @update:model-value="handleNumberChange"
          @blur="handleNumberBlur"
          :placeholder="field.placeholder"
          :disabled="disabled"
          :class="[baseInputClass, 'flex-1']"
        />
        <span v-if="field.unit" class="text-sm text-gray-500 whitespace-nowrap">{{ field.unit }}</span>
      </div>
    </template>

    <!-- 下拉选择 -->
    <template v-else-if="field.type === 'select'">
      <el-select
        :model-value="value"
        @update:model-value="handleChange"
        :placeholder="'请选择'"
        :disabled="disabled"
        :class="[baseInputClass, 'w-full']"
      >
        <template v-if="field.options">
          <el-option
            v-for="opt in field.options"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </template>
      </el-select>
    </template>

    <!-- 多选 -->
    <template v-else-if="field.type === 'multiSelect'">
      <div class="flex flex-wrap gap-2">
        <template v-if="field.options">
          <label
            v-for="opt in field.options"
            :key="opt.value"
            :class="[
              'inline-flex items-center gap-1 px-3 py-1.5 rounded-full cursor-pointer transition-colors',
              isMultiSelected(opt.value)
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200',
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            ]"
          >
            <input
              type="checkbox"
              :checked="isMultiSelected(opt.value)"
              @change="(e) => handleMultiSelectChange(opt.value, e.target.checked)"
              :disabled="disabled"
              class="sr-only"
            />
            {{ opt.label }}
          </label>
        </template>
      </div>
    </template>

    <!-- 多行文本 -->
    <template v-else-if="field.type === 'textarea'">
      <el-input
        :model-value="value"
        @update:model-value="handleChange"
        :placeholder="field.placeholder"
        :disabled="disabled"
        type="textarea"
        :rows="3"
        :class="[baseInputClass, 'resize-none']"
      />
    </template>

    <!-- 多条目输入（混合配比） -->
    <template v-else-if="field.type === 'multiEntry'">
      <div class="space-y-3">
        <!-- 条目列表 -->
        <div
          v-for="(entry, index) in multiEntries"
          :key="entry.id"
          class="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg"
        >
          <!-- 条目序号 -->
          <div class="flex-shrink-0 w-6 h-6 mt-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-medium">
            {{ index + 1 }}
          </div>

          <!-- 条目字段 -->
          <div class="flex-1 flex flex-wrap gap-3">
            <template v-if="multiEntryFields">
              <div
                v-for="fieldDef in multiEntryFields"
                :key="fieldDef.key"
                class="flex-1 min-w-[120px]"
              >
                <label class="text-xs text-gray-500 mb-1 block">
                  {{ fieldDef.label }}
                  <span v-if="fieldDef.unit" class="text-gray-400 ml-1">({{ fieldDef.unit }})</span>
                </label>

                <!-- 文本字段 -->
                <el-input
                  v-if="fieldDef.type === 'text'"
                  :model-value="entry[fieldDef.key]"
                  @update:model-value="(val) => handleEntryChange(entry.id, fieldDef.key, val)"
                  :placeholder="fieldDef.placeholder"
                  :disabled="disabled"
                  size="small"
                  :class="[baseInputClass, 'text-sm']"
                />

                <!-- 选择字段 -->
                <el-select
                  v-else-if="fieldDef.type === 'select'"
                  :model-value="entry[fieldDef.key]"
                  @update:model-value="(val) => handleEntryChange(entry.id, fieldDef.key, val)"
                  :placeholder="'请选择'"
                  :disabled="disabled"
                  size="small"
                  :class="[baseInputClass, 'text-sm', 'w-full']"
                >
                  <el-option
                    v-for="opt in (fieldDef.options || [])"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>

                <!-- 数字字段 -->
                <el-input
                  v-else-if="fieldDef.type === 'number'"
                  :model-value="entry[fieldDef.key]"
                  @update:model-value="(val) => handleEntryNumberChange(entry.id, fieldDef.key, String(val))"
                  @blur="(e) => handleEntryNumberBlur(entry.id, fieldDef.key, e.target.value)"
                  :disabled="disabled"
                  size="small"
                  :class="[baseInputClass, 'text-sm']"
                />
              </div>
            </template>
          </div>

          <!-- 删除按钮 -->
          <el-button
            type="default"
            circle
            size="small"
            @click="handleRemoveEntry(entry.id)"
            :disabled="disabled || multiEntries.length <= 1"
            class="flex-shrink-0 mt-6 text-gray-400 hover:text-red-500"
            title="删除此条"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>

        <!-- 添加按钮 -->
        <el-button
          v-if="multiEntries.length < maxEntries"
          size="small"
          @click="handleAddEntry"
          :disabled="disabled"
          class="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-dashed border-emerald-300"
        >
          <el-icon><Plus /></el-icon>
          添加{{ multiEntryDef?.entryLabel || '条目' }}
        </el-button>

        <!-- 提示 -->
        <p v-if="multiEntries.length > 0" class="text-xs text-gray-500">
          已添加 {{ multiEntries.length }}/{{ maxEntries }} 条
        </p>
      </div>
    </template>

    <!-- 默认文本输入兜底 -->
    <el-input
      v-else
      :model-value="value"
      @update:model-value="handleChange"
      :placeholder="field.placeholder"
      :disabled="disabled"
      :class="baseInputClass"
    />

    <!-- 错误信息 -->
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
/**
 * 配置字段渲染器
 * 根据配置项类型动态渲染不同的输入控件
 * 对应 V1.1 ConfigFieldRenderer.tsx 1:1 映射
 */
import { computed } from 'vue'
import { Close, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  /** 配置项定义 */
  field: { type: Object, required: true },
  /** 当前值 */
  value: { default: undefined },
  /** 值变化回调 */
  onChange: { type: Function, required: true },
  /** 错误信息 */
  error: { type: String, default: '' },
  /** 是否禁用 */
  disabled: { type: Boolean, default: false },
})

/** 基础输入框样式类 */
const baseInputClass = computed(() =>
  `w-full border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${props.error ? 'border-red-500' : ''} ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`
)

/** 多条目定义 */
const multiEntryDef = computed(() => props.field.multiEntryDef || {})
const maxEntries = computed(() => multiEntryDef.value?.maxEntries || 5)
const multiEntryFields = computed(() => multiEntryDef.value?.fields || [])

/** 多条目数据列表 */
const multiEntries = computed(() => {
  const entries = Array.isArray(props.value) ? props.value : []
  return entries.filter(e => e)
})

/** 生成唯一ID */
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

/** 处理输入变化 */
const handleChange = (newValue) => {
  if (!props.disabled) {
    props.onChange(props.field.key, newValue)
  }
}

/** 处理数字输入变化 */
const handleNumberChange = (raw) => {
  if (props.disabled) return
  const cleaned = String(raw).replace(/[^\d.-]/g, '')
  if (cleaned === '' || cleaned === '-' || cleaned === '.') {
    props.onChange(props.field.key, cleaned)
    return
  }
  const num = parseFloat(cleaned)
  if (!isNaN(num)) {
    props.onChange(props.field.key, Math.round(num * 100) / 100)
  } else {
    props.onChange(props.field.key, cleaned)
  }
}

/** 处理数字输入失焦 */
const handleNumberBlur = (e) => {
  if (props.disabled) return
  const num = parseFloat(e.target.value)
  if (!isNaN(num)) {
    props.onChange(props.field.key, Math.round(num * 100) / 100)
  }
}

/** 判断多选是否选中 */
const isMultiSelected = (optValue) => {
  const selectedValues = Array.isArray(props.value) ? props.value : []
  return selectedValues.includes(optValue)
}

/** 处理多选变化 */
const handleMultiSelectChange = (optValue, checked) => {
  if (props.disabled) return
  const selectedValues = Array.isArray(props.value) ? [...props.value] : []
  const newValues = checked
    ? [...selectedValues, optValue]
    : selectedValues.filter(v => v !== optValue)
  props.onChange(props.field.key, newValues)
}

/** 添加多条目 */
const handleAddEntry = () => {
  if (multiEntries.value.length >= maxEntries.value) return
  const newEntry = { id: generateId() }
  multiEntryFields.value.forEach(f => {
    newEntry[f.key] = ''
  })
  props.onChange(props.field.key, [...multiEntries.value, newEntry])
}

/** 删除多条目 */
const handleRemoveEntry = (id) => {
  props.onChange(props.field.key, multiEntries.value.filter(e => e.id !== id))
}

/** 更新多条目中某个字段 */
const handleEntryChange = (id, fieldKey, fieldValue) => {
  props.onChange(
    props.field.key,
    multiEntries.value.map(e => (e.id === id ? { ...e, [fieldKey]: fieldValue } : e))
  )
}

/** 处理多条目中数字字段变化 */
const handleEntryNumberChange = (id, fieldKey, raw) => {
  if (props.disabled) return
  const cleaned = String(raw || '').replace(/[^\d.-]/g, '')
  if (cleaned === '' || cleaned === '-' || cleaned === '.') {
    handleEntryChange(id, fieldKey, cleaned)
    return
  }
  const num = parseFloat(cleaned)
  if (!isNaN(num)) {
    handleEntryChange(id, fieldKey, Math.round(num * 100) / 100)
  }
}

/** 处理多条目中数字字段失焦 */
const handleEntryNumberBlur = (id, fieldKey, rawValue) => {
  if (props.disabled) return
  const num = parseFloat(rawValue)
  if (!isNaN(num)) {
    handleEntryChange(id, fieldKey, Math.round(num * 100) / 100)
  }
}
</script>
