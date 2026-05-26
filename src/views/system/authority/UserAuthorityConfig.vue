<template>
  <div class="space-y-4">
    <!-- 工具栏 -->
    <div class="flex items-center gap-3 flex-wrap bg-white rounded-xl p-4 shadow-sm">
      <label class="text-xs font-medium text-gray-600 whitespace-nowrap">选择用户:</label>
      <div class="relative">
        <el-icon class="absolute left-2 top-1/2 -translate-y-1/2" :size="12" color="#9ca3af">
          <Search />
        </el-icon>
        <el-input
          v-model="searchUserTerm"
          placeholder="搜索..."
          clearable
          class="w-36 pl-7"
          size="small"
        />
      </div>
      <el-select
        v-model="selectedUserOid"
        placeholder="-- 请选择用户 --"
        class="w-48"
        size="small"
        filterable
      >
        <el-option
          v-for="u in filteredUsers"
          :key="u.oid"
          :label="`${u.real_name || u.name} (${u.username || u.aid})`"
          :value="u.oid"
        />
      </el-select>
      <span v-if="selectedUser" class="text-xs text-gray-400 whitespace-nowrap">
        组织:{{ selectedUser.org_oid }} | {{ selectedUser.status }}
      </span>
    </div>

    <!-- 权限矩阵 -->
    <div v-if="selectedUser" class="bg-white rounded-xl shadow-sm">
      <div class="p-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-gray-700">
            工序-动作权限配置
          </h3>
          <p class="text-xs text-gray-400 mt-0.5">
            下拉选择：继承=继承角色权限 | 允许=强制允许 | 拒绝=强制拒绝
          </p>
        </div>
        <div class="flex items-center gap-2">
          <el-button v-if="hasChanges" type="primary" size="small" @click="saveChanges">
            <el-icon :size="14"><Check /></el-icon>
            保存更改
          </el-button>
          <el-button size="small" @click="resetChanges">
            <el-icon :size="14"><Refresh /></el-icon>
            重置
          </el-button>
        </div>
      </div>

      <div class="overflow-x-auto max-h-96">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-b sticky top-0">
              <th class="text-left py-2 px-3 font-medium text-white w-48">工序</th>
              <th
                v-for="act in ACTION_LIST"
                :key="act.code"
                class="text-center py-2 px-2 font-medium text-white w-20"
              >
                <span class="text-xs px-1.5 py-0.5 rounded" :class="act.color">{{ act.name }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="proc in allProcesses"
              :key="proc.oid"
              class="border-b border-gray-100 hover:bg-blue-50"
            >
              <td class="py-1.5 px-3 text-gray-700">
                <div>{{ proc.name }}</div>
                <div class="text-xs text-gray-400 font-mono">{{ proc.aid }}</div>
              </td>
              <td
                v-for="act in ACTION_LIST"
                :key="act.code"
                class="text-center py-1.5 px-1"
              >
                <select
                  :value="getDropdownValue(proc.oid, act.code)"
                  @change="setAuthValue(proc.oid, act.code, $event.target.value)"
                  :class="getAuthClass(proc.oid, act.code)"
                  class="h-7 px-1 text-xs border border-gray-300 rounded cursor-pointer font-medium"
                >
                  <option value="inherit" class="text-blue-600 bg-white">继承角色权限</option>
                  <option value="allow" class="text-emerald-600 bg-white">强制允许</option>
                  <option value="deny" class="text-red-500 bg-white">强制拒绝</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 未选择用户 -->
    <div v-else class="bg-white rounded-xl shadow-sm p-16 text-center text-gray-400">
      <el-icon :size="48"><User /></el-icon>
      <p class="mt-4">请在上方选择一个用户</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  User,
  Search,
  Refresh,
  Check
} from '@element-plus/icons-vue'
import { useAuthorityStore } from '@/stores/modules/authority'
import {
  getUserAuthority,
  saveUserAuthority,
  getRoleAuthority,
  getUserRoles
} from '@/api/system/authority'

// 动作列表
const ACTION_LIST = [
  { code: 'view', name: '查看', color: 'bg-blue-100 text-blue-700' },
  { code: 'create', name: '新增', color: 'bg-green-100 text-green-700' },
  { code: 'edit', name: '编辑', color: 'bg-amber-100 text-amber-700' },
  { code: 'delete', name: '删除', color: 'bg-red-100 text-red-700' },
  { code: 'export', name: '导出', color: 'bg-purple-100 text-purple-700' },
  { code: 'approve', name: '审批', color: 'bg-indigo-100 text-indigo-700' }
]

// Store
const authorityStore = useAuthorityStore()
const { users, loadUsers, processes, loadProcesses, roles, loadRoles } = authorityStore

// 状态
const selectedUserOid = ref('')
const selectedUser = ref(null)
const searchUserTerm = ref('')

// 权限数据
const userAuthorities = ref([])
const roleAuthorities = ref([])
const authorityChanges = reactive(new Map())
const hasChanges = ref(false)

// 筛选用户
const filteredUsers = computed(() => {
  if (!searchUserTerm.value) return (users.value || []).slice(0, 30)
  const term = searchUserTerm.value.toLowerCase()
  return (users.value || []).filter(u => {
    const name = (u.real_name || u.name || '').toLowerCase()
    const uname = (u.username || u.aid || '').toLowerCase()
    return name.includes(term) || uname.includes(term)
  }).slice(0, 30)
})

// 展平工序
const allProcesses = computed(() => {
  const flatten = (nodes) => {
    return (nodes || []).reduce((acc, n) => {
      acc.push(n)
      if (n.children?.length) acc.push(...flatten(n.children))
      return acc
    }, [])
  }
  return flatten(processes.value || [])
})

// 获取权限值
const getAuthValue = (processOid, actionCode) => {
  // 先看本地修改
  if (authorityChanges.has(processOid) && authorityChanges.get(processOid).has(actionCode)) {
    return { val: authorityChanges.get(processOid).get(actionCode), source: 'local' }
  }
  // 用户特殊权限
  const ua = userAuthorities.value.find(a => a.processOid === processOid && a.actionOid === actionCode)
  if (ua) return { val: ua.value, source: 'user_override' }
  // 角色权限
  const ra = roleAuthorities.value.find(a => a.processOid === processOid && a.actionOid === actionCode)
  if (ra && ra.value >= 1) return { val: 1, source: 'role' }
  return { val: 0, source: 'none' }
}

// 获取权限样式（匹配V1.1的3-way下拉样式）
const getAuthClass = (processOid, actionCode) => {
  const { val, source } = getAuthValue(processOid, actionCode)
  if (source === 'role' || source === 'none') {
    return 'bg-blue-50 text-blue-600'
  } else if (source === 'user_override' || source === 'local') {
    return val === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
  }
  return 'bg-blue-50 text-blue-600'
}

// 获取权限标签（匹配V1.1的3-way下拉）
const getAuthLabel = (processOid, actionCode) => {
  const { val, source } = getAuthValue(processOid, actionCode)
  if (source === 'role' || source === 'none') return '继承'
  if (source === 'user_override' || source === 'local') {
    return val === 1 ? '允许' : '拒绝'
  }
  return '继承'
}

// 获取下拉框当前值（匹配V1.1的3-way逻辑）
const getDropdownValue = (processOid, actionCode) => {
  const { val, source } = getAuthValue(processOid, actionCode)
  if (source === 'role' || source === 'none') return 'inherit'
  if (source === 'user_override' || source === 'local') {
    return val === 1 ? 'allow' : 'deny'
  }
  return 'inherit'
}

// 设置权限值（匹配V1.1: inherit=恢复角色, allow=强制允许, deny=强制拒绝）
const setAuthValue = (processOid, actionCode, dropdownValue) => {
  if (dropdownValue === 'inherit') {
    // 清除本地覆盖，恢复继承角色权限
    if (authorityChanges.has(processOid)) {
      authorityChanges.get(processOid).delete(actionCode)
      if (authorityChanges.get(processOid).size === 0) {
        authorityChanges.delete(processOid)
      }
    }
  } else {
    if (!authorityChanges.has(processOid)) {
      authorityChanges.set(processOid, new Map())
    }
    authorityChanges.get(processOid).set(actionCode, dropdownValue === 'allow' ? 1 : 0)
  }
  hasChanges.value = true
}

// 保存更改
const saveChanges = async () => {
  if (!selectedUserOid.value) return
  const authorities = []
  for (const [processOid, actions] of authorityChanges) {
    for (const [actionCode, value] of actions) {
      authorities.push({ processOid, actionOid: actionCode, value })
    }
  }
  try {
    await saveUserAuthority(selectedUserOid.value, authorities)
    hasChanges.value = false
    // 重新加载
    const data = await getUserAuthority(selectedUserOid.value)
    userAuthorities.value = data || []
  } catch (err) {
    ElMessage.error('保存失败')
  }
}

// 重置更改
const resetChanges = () => {
  authorityChanges.clear()
  hasChanges.value = false
}

// 监听用户选择
watch(selectedUserOid, async (newOid) => {
  if (!newOid) {
    selectedUser.value = null
    return
  }
  selectedUser.value = users.value.find(u => u.oid === newOid) || null

  // 加载用户特殊权限
  try {
    const data = await getUserAuthority(newOid)
    userAuthorities.value = data || []
  } catch {
    userAuthorities.value = []
  }

  // 加载用户角色权限(用于对比展示)
  try {
    // V1.1: 先调用getUserRoles获取角色OID列表，再逐个加载角色权限
    const roleOids = await getUserRoles(newOid)
    const allAuths = []
    for (const roleOid of (roleOids || [])) {
      try {
        const auths = await getRoleAuthority(roleOid, 0)
        allAuths.push(...(auths || []).map(a => ({ ...a })))
      } catch { /* 单个角色权限加载失败不影响其他 */ }
    }
    roleAuthorities.value = allAuths
  } catch {
    roleAuthorities.value = []
  }

  authorityChanges.clear()
  hasChanges.value = false
})

// 初始化
onMounted(async () => {
  await loadUsers()
  await loadProcesses()
  await loadRoles()
  // V1.1: 默认选择第一个用户，自动加载权限数据
  if (!selectedUserOid.value && users.value.length > 0) {
    selectedUserOid.value = users.value[0].oid
  }
})
</script>

<style scoped>
/* 绿色主题按钮 */
:deep(.el-button--primary) {
  --el-button-bg-color: #059669;
  --el-button-border-color: #059669;
  --el-button-hover-bg-color: #047857;
  --el-button-hover-border-color: #047857;
}
</style>
