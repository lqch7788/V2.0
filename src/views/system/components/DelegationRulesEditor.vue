<template>
  <div class="w-full max-w-2xl space-y-3">
    <!-- 表头 -->
    <div class="bg-emerald-50 rounded-lg overflow-hidden">
      <table class="w-full text-xs">
        <thead>
          <tr class="bg-emerald-100">
            <th class="px-2 py-2 text-left font-semibold text-emerald-800 w-10">状态</th>
            <th class="px-2 py-2 text-left font-semibold text-emerald-800 w-36">委托角色</th>
            <th class="px-2 py-2 text-left font-semibold text-emerald-800 w-10"></th>
            <th class="px-2 py-2 text-left font-semibold text-emerald-800 w-36">接收角色</th>
            <th class="px-2 py-2 text-left font-semibold text-emerald-800">说明</th>
            <th class="px-2 py-2 text-center font-semibold text-emerald-800 w-16">操作</th>
          </tr>
        </thead>
      </table>
    </div>

    <!-- 规则列表 -->
    <div class="space-y-2 max-h-64 overflow-y-auto">
      <div
        v-for="(rule, idx) in rules"
        :key="rule.id || idx"
        :class="[
          'flex items-center gap-2 p-2 rounded-lg border',
          rule.enabled ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-400'
        ]"
      >
        <!-- 启用开关 - V1.1使用CheckCircle图标 -->
        <button
          @click="toggleEnabled(idx)"
          :class="[
            'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
            rule.enabled
              ? 'bg-green-100 text-green-600 hover:bg-green-200'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          ]"
          :title="rule.enabled ? '已启用' : '已禁用'"
        >
          <el-icon v-if="rule.enabled" :size="16"><CircleCheckFilled /></el-icon>
          <el-icon v-else :size="16"><CircleCloseFilled /></el-icon>
        </button>

        <!-- 委托角色 -->
        <select
          :value="rule.fromRole"
          @change="updateRule(idx, { fromRole: ($event.target as HTMLSelectElement).value })"
          class="w-36 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option v-for="opt in ROLE_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <!-- 箭头 - V1.1使用UserCheck图标 -->
        <div class="flex items-center text-gray-400">
          <el-icon :size="16"><User /></el-icon>
        </div>

        <!-- 接收角色 -->
        <select
          :value="rule.toRole"
          @change="updateRule(idx, { toRole: ($event.target as HTMLSelectElement).value })"
          class="w-36 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option v-for="opt in ROLE_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <!-- 说明 -->
        <input
          type="text"
          :value="rule.remark"
          @input="updateRule(idx, { remark: ($event.target as HTMLInputElement).value })"
          placeholder="规则说明..."
          class="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <!-- 删除按钮 - V1.1使用Trash2图标 -->
        <button
          @click="deleteRule(idx)"
          class="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="删除规则"
        >
          <el-icon :size="16"><Delete /></el-icon>
        </button>
      </div>
    </div>

    <!-- 添加按钮 - V1.1使用Plus图标 -->
    <button
      @click="addRule"
      class="flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
    >
      <el-icon :size="16"><Plus /></el-icon>
      添加委托规则
    </button>

    <!-- JSON预览（可折叠） -->
    <details class="mt-2">
      <summary class="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
        查看原始JSON
      </summary>
      <pre class="mt-1 p-2 text-xs bg-gray-100 rounded overflow-x-auto max-h-40">{{ modelValue }}</pre>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Delete, Plus, CircleCheckFilled, CircleCloseFilled, User } from '@element-plus/icons-vue'

/** 委托规则数据结构 */
// P1-7 修复：增加 id 字段 - 规则列表必须具备稳定唯一标识，避免删除/重排后 v-for 错位
interface DelegationRule {
  id: string
  fromRole: string
  toRole: string
  enabled: boolean
  remark: string
}

/** 生成规则 ID - 时间戳 + 随机数避免重复 */
const generateRuleId = (): string => {
  return `rule_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/** 角色选项 - 与V1.1完全一致 */
const ROLE_OPTIONS = [
  { value: 'manager', label: '经理' },
  { value: 'department_head', label: '部门主管' },
  { value: 'director', label: '总监' },
  { value: 'hr', label: '人事专员' },
  { value: 'hr_manager', label: '人事经理' },
  { value: 'finance', label: '财务' },
  { value: 'admin', label: '系统管理员' },
]

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const rules = computed<DelegationRule[]>({
  get: () => {
    try {
      return JSON.parse(props.modelValue || '[]')
    } catch {
      return []
    }
  },
  set: (val: DelegationRule[]) => {
    emit('update:modelValue', JSON.stringify(val, null, 2))
  }
})

const updateRule = (index: number, updates: Partial<DelegationRule>) => {
  const newRules = [...rules.value]
  newRules[index] = { ...newRules[index], ...updates }
  rules.value = newRules
}

const toggleEnabled = (index: number) => {
  updateRule(index, { enabled: !rules.value[index].enabled })
}

const addRule = () => {
  rules.value = [
    ...rules.value,
    {
      id: generateRuleId(),
      fromRole: 'manager',
      toRole: 'department_head',
      enabled: true,
      remark: ''
    }
  ]
}

const deleteRule = (index: number) => {
  const newRules = rules.value.filter((_, i) => i !== index)
  rules.value = newRules
}
</script>
