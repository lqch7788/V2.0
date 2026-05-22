<template>
  <div class="flex flex-col gap-1">
    <!-- 表格形式预览 -->
    <div class="bg-gray-50 rounded-lg overflow-hidden">
      <table class="w-full text-xs">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-2 py-1.5 text-left font-medium text-gray-600 w-12">状态</th>
            <th class="px-2 py-1.5 text-left font-medium text-gray-600">委托角色</th>
            <th class="px-2 py-1.5 text-left font-medium text-gray-600">接收角色</th>
            <th class="px-2 py-1.5 text-left font-medium text-gray-600">说明</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="(rule, idx) in displayedRules" :key="idx" :class="{ 'opacity-50': !rule.enabled }">
            <td class="px-2 py-1.5">
              <span v-if="rule.enabled" class="text-green-500">●</span>
              <span v-else class="text-gray-300">○</span>
            </td>
            <td class="px-2 py-1.5 text-gray-700">{{ getRoleLabel(rule.fromRole) }}</td>
            <td class="px-2 py-1.5 text-gray-700">{{ getRoleLabel(rule.toRole) }}</td>
            <td class="px-2 py-1.5 text-gray-500 truncate max-w-[200px]">{{ rule.remark }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- 更多规则提示 -->
    <div v-if="rules.length > 3" class="text-xs text-gray-400">
      ...还有 {{ rules.length - 3 }} 条规则
    </div>
    <!-- 编辑按钮 -->
    <button
      @click="$emit('edit')"
      class="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 mt-1"
    >
      <Edit class="w-3 h-3" />
      编辑规则
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Edit } from '@element-plus/icons-vue'

/** 委托规则数据结构 */
interface DelegationRule {
  fromRole: string
  toRole: string
  enabled: boolean
  remark: string
}

/** 角色选项 */
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
  config: {
    configValue?: string
  }
}>()

defineEmits<{
  edit: []
}>()

const rules = computed<DelegationRule[]>(() => {
  try {
    return JSON.parse(props.config?.configValue || '[]')
  } catch {
    return []
  }
})

const displayedRules = computed(() => rules.value.slice(0, 3))

const getRoleLabel = (value: string): string => {
  return ROLE_OPTIONS.find(r => r.value === value)?.label || value
}
</script>
