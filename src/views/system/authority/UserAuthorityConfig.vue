<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <a
            href="/settings"
            class="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hover:from-gray-200 hover:to-gray-300 transition-colors"
            title="返回系统设置"
          >
            <el-icon :size="20" color="#4b5563">
              <ArrowLeft />
            </el-icon>
          </a>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white"><User /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">用户特殊权限配置</h1>
            <p class="text-gray-500">对单个用户进行权限增强或限制，覆盖角色权限</p>
          </div>
        </div>
      </div>
    </div>

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
            灰=无权限 | 蓝=角色继承 | 点击循环: 角色→允许→拒绝→恢复角色
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
                <div>{{ proc.process_name }}</div>
                <div class="text-xs text-gray-400 font-mono">{{ proc.process_code }}</div>
              </td>
              <td
                v-for="act in ACTION_LIST"
                :key="act.code"
                class="text-center py-1.5 px-1"
              >
                <el-button
                  size="small"
                  :class="getAuthClass(proc.oid, act.code)"
                  class-name="w-14 h-7 rounded text-xs font-medium transition-colors"
                  @click="cycleValue(proc.oid, act.code)"
                >
                  {{ getAuthLabel(proc.oid, act.code) }}
                </el-button>
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
  Check,
  ArrowLeft
} from '@element-plus/icons-vue'
import { useAuthorityStore } from '@/stores/modules/authority'
import {
  getUserAuthority,
  saveUserAuthority,
  getUserRolesAuthority,
  getRoleAuthority
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
  if (!searchUserTerm.value) return users.value.slice(0, 30)
  const term = searchUserTerm.value.toLowerCase()
  return users.value.filter(u => {
    const name = (u.real_name || u.name || '').toLowerCase()
    const uname = (u.username || u.aid || '').toLowerCase()
    return name.includes(term) || uname.includes(term)
  }).slice(0, 30)
})

// 展平工序
const allProcesses = computed(() => {
  const flatten = (nodes) => {
    return nodes.reduce((acc, n) => {
      acc.push(n)
      if (n.children?.length) acc.push(...flatten(n.children))
      return acc
    }, [])
  }
  return flatten(processes.value)
})

// 获取权限值
const getAuthValue = (processOid, actionCode) => {
  // 先看本地修改
  if (authorityChanges.has(processOid) && authorityChanges.get(processOid).has(actionCode)) {
    return { val: authorityChanges.get(processOid).get(actionCode), source: 'local' }
  }
  // 用户特殊权限
  const ua = userAuthorities.value.find(a => a.processOid === processOid && a.actionOid === actionCode)
  if (ua) return { val: ua.value + 1, source: 'user_override' }
  // 角色权限
  const ra = roleAuthorities.value.find(a => a.processOid === processOid && a.actionOid === actionCode)
  if (ra && ra.value >= 1) return { val: 1, source: 'role' }
  return { val: 0, source: 'none' }
}

// 获取权限样式
const getAuthClass = (processOid, actionCode) => {
  const { val, source } = getAuthValue(processOid, actionCode)
  if (val === 1 && source === 'role') {
    return 'bg-blue-50 text-blue-600 hover:bg-blue-100'
  } else if (source === 'user_override') {
    return val === 2 ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-red-100 text-red-500 hover:bg-red-200'
  } else if (source === 'local') {
    return val === 1 ? 'bg-emerald-200 text-emerald-700 hover:bg-emerald-300' : 'bg-red-200 text-red-700 hover:bg-red-300'
  }
  return 'bg-gray-50 text-gray-300 hover:bg-gray-100'
}

// 获取权限标签
const getAuthLabel = (processOid, actionCode) => {
  const { val, source } = getAuthValue(processOid, actionCode)
  if (val === 1 && source === 'role') return '角色'
  if (source === 'user_override') return val === 2 ? '允许' : '拒绝'
  if (source === 'local') return val === 1 ? '允许' : '拒绝'
  return '-'
}

// 循环切换权限值
const cycleValue = (processOid, actionCode) => {
  const current = getAuthValue(processOid, actionCode)
  if (!authorityChanges.has(processOid)) {
    authorityChanges.set(processOid, new Map())
  }

  if (current.source === 'local') {
    if (current.val === 1) {
      authorityChanges.get(processOid).set(actionCode, 0)
    } else {
      authorityChanges.get(processOid).delete(actionCode)
      if (authorityChanges.get(processOid).size === 0) {
        authorityChanges.delete(processOid)
      }
    }
  } else {
    authorityChanges.get(processOid).set(actionCode, 1)
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
    ElMessage.success('保存成功')
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
    // 从用户信息中获取角色OID列表
    const roleOids = selectedUser.value?.roles?.map(r => r.oid) || []
    const allAuths = []
    for (const roleOid of roleOids) {
      const auths = await getRoleAuthority(roleOid, 0)
      allAuths.push(...auths.map(a => ({ ...a })))
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
})
</script>
