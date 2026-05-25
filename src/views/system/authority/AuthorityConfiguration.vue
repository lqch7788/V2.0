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
            <el-icon :size="24" color="white"><Key /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">权限配置</h1>
            <p class="text-gray-500">工序管理 · 角色权限矩阵 · 数据权限</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具栏：内部Tab -->
    <div class="flex items-center gap-3 flex-wrap">
      <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        <el-button
          :type="activeTab === 'authority' ? 'primary' : ''"
          :class="activeTab === 'authority' ? '' : 'text-gray-600'"
          class-name="px-3 py-1 rounded-md text-xs font-semibold transition-colors"
          @click="activeTab = 'authority'"
        >
          <el-icon :size="14"><Key /></el-icon>
          角色权限配置
        </el-button>
        <el-button
          :type="activeTab === 'processes' ? 'primary' : ''"
          :class="activeTab === 'processes' ? '' : 'text-gray-600'"
          class-name="px-3 py-1 rounded-md text-xs font-semibold transition-colors"
          @click="activeTab = 'processes'"
        >
          <el-icon :size="14"><Menu /></el-icon>
          工序与菜单管理
        </el-button>
      </div>
    </div>

    <!-- ========== 工序管理 Tab ========== -->
    <div v-if="activeTab === 'processes'" class="bg-white rounded-xl shadow-sm p-4">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <h2 class="text-base font-semibold text-gray-800">工序树</h2>
          <el-select v-model="selectedAppType" size="small" class="w-32" @change="handleAppTypeChange">
            <el-option :value="0" label="Web 端" />
            <el-option :value="1" label="移动端" />
          </el-select>
        </div>
        <el-button type="primary" size="small" @click="openProcessAdd('')">
          <el-icon :size="14"><Plus /></el-icon>
          新增根工序
        </el-button>
      </div>
      <div class="max-h-96 overflow-y-auto border border-gray-100 rounded-lg">
        <div v-if="processLoading" class="p-8 text-center text-gray-400">
          <el-icon class="is-loading" :size="24"><Loading /></el-icon>
          <p class="mt-2">加载中...</p>
        </div>
        <div v-else-if="processes.length === 0" class="p-8 text-center text-gray-400">
          暂无工序数据，点击上方按钮新增
        </div>
        <div v-else class="divide-y divide-gray-50">
          <template v-for="proc in flatProcessList" :key="proc.oid">
            <div
              class="flex items-center gap-2 py-2 px-3 hover:bg-blue-50"
              :style="{ paddingLeft: (proc._depth * 20 + 12) + 'px' }"
            >
              <el-button
                v-if="proc._hasChildren"
                text
                size="small"
                @click="toggleExpand(proc.oid)"
                class="p-0.5"
              >
                <el-icon :size="14" :color="'#6b7280'">
                  <component :is="expandedOids.has(proc.oid) ? 'ArrowDown' : 'ArrowRight'" />
                </el-icon>
              </el-button>
              <el-icon v-else :size="14" class="text-transparent">-</el-icon>
              <el-icon :size="14" color="#f59e0b"><Folder /></el-icon>
              <span class="text-sm text-gray-700 flex-1">
                {{ proc.process_name }}
                <span class="text-xs text-gray-400 font-mono ml-1">（{{ proc.process_code }}）</span>
              </span>
              <div class="flex items-center gap-1 shrink-0">
                <el-button text size="small" @click="openProcessAdd(proc.oid)" title="新增子工序">
                  <el-icon :size="14" color="#059669"><Plus /></el-icon>
                </el-button>
                <el-button text size="small" @click="openProcessEdit(proc)" title="编辑">
                  <el-icon :size="14" color="#2563eb"><Edit /></el-icon>
                </el-button>
                <el-button text size="small" @click="handleProcessDelete(proc.oid)" title="删除">
                  <el-icon :size="14" color="#dc2626"><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- ========== 角色权限配置 Tab ========== -->
    <div v-else class="flex gap-4">
      <!-- 左侧：角色选择 -->
      <div class="w-64 shrink-0 space-y-3">
        <div class="bg-white rounded-xl shadow-sm p-3">
          <h3 class="text-sm font-medium text-gray-700 mb-2">选择角色</h3>
          <el-select v-model="selectedRoleOid" placeholder="-- 请选择角色 --" class="w-full" size="small">
            <el-option
              v-for="r in roles"
              :key="r.oid"
              :label="r.role_name || r.name"
              :value="r.oid"
            />
          </el-select>
          <div class="flex items-center gap-1 mt-2">
            <span class="text-xs text-gray-400">APP:</span>
            <el-select v-model="selectedAppType" size="small" class="flex-1" @change="loadRoleAuthority">
              <el-option :value="0" label="Web 端" />
              <el-option :value="1" label="移动端" />
            </el-select>
          </div>
        </div>

        <!-- 数据权限面板 -->
        <div v-if="selectedRoleOid" class="bg-white rounded-xl shadow-sm p-3">
          <el-button text @click="showDataAuthPanel = !showDataAuthPanel" class="w-full flex items-center justify-between">
            <span class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <el-icon :size="14"><OfficeBuilding /></el-icon>
              数据权限范围
            </span>
            <el-icon :size="14" :class="showDataAuthPanel ? 'rotate-180' : ''">
              <ArrowDown />
            </el-icon>
          </el-button>
          <div v-if="showDataAuthPanel" class="mt-2 max-h-48 overflow-y-auto border-t pt-2">
            <p class="text-xs text-gray-400 mb-1">
              已授权 {{ dataAuthorities.length }} 个组织
            </p>
            <div
              v-for="org in organizations"
              :key="org.oid"
              class="flex items-center gap-1.5 py-0.5 text-xs cursor-pointer"
              @click="toggleDataAuthority(org.oid)"
            >
              <el-checkbox :model-value="dataAuthorities.includes(org.oid)" size="small" />
              <span class="text-gray-600">{{ org.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：权限矩阵 -->
      <div class="flex-1 bg-white rounded-xl shadow-sm">
        <div class="p-3 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h3 class="text-sm font-semibold text-gray-700">工序-动作权限矩阵</h3>
            <el-input
              v-model="searchTerm"
              placeholder="搜索工序..."
              size="small"
              class="w-40"
              clearable
            >
              <template #prefix>
                <el-icon :size="12"><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div class="flex items-center gap-2">
            <el-button size="small" @click="grantAll" class="text-emerald-600 border-emerald-300">
              全部授权
            </el-button>
            <el-button size="small" @click="revokeAll" class="text-red-600 border-red-300">
              全部取消
            </el-button>
            <el-button v-if="hasChanges" type="primary" size="small" @click="saveAuthority">
              <el-icon :size="14"><Check /></el-icon>
              保存
            </el-button>
            <el-button size="small" @click="refreshData">
              <el-icon :size="14"><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>

        <!-- 权限矩阵内容 -->
        <div v-if="!selectedRoleOid" class="flex flex-col items-center justify-center py-16 text-gray-400">
          <el-icon :size="48"><Key /></el-icon>
          <p class="mt-3">请先在左侧选择一个角色</p>
        </div>
        <div v-else-if="filteredProcesses.length === 0" class="py-8 text-center text-gray-400">
          暂无工序数据
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-b">
                <th class="text-left py-2 px-3 font-medium text-white w-48">工序名称</th>
                <th class="text-left py-2 px-3 font-medium text-white w-32">编码</th>
                <th
                  v-for="act in ACTION_LIST"
                  :key="act.code"
                  class="text-center py-2 px-2 font-medium text-white w-16"
                >
                  <span class="text-xs px-1.5 py-0.5 rounded" :class="act.color">{{ act.name }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="proc in filteredProcesses"
                :key="proc.oid"
                class="border-b border-gray-100 hover:bg-blue-50"
              >
                <td class="py-1.5 px-3 text-gray-700">{{ proc.process_name }}</td>
                <td class="py-1.5 px-3 text-xs text-gray-400 font-mono">{{ proc.process_code }}</td>
                <td
                  v-for="act in ACTION_LIST"
                  :key="act.code"
                  class="text-center py-1.5 px-2"
                >
                  <el-button
                    size="small"
                    :type="getAuthValue(proc.oid, act.code) === 1 ? 'success' : 'info'"
                    :icon="getAuthValue(proc.oid, act.code) === 1 ? 'Check' : 'Close'"
                    class-name="w-7 h-7 rounded flex items-center justify-center"
                    @click="toggleAuthority(proc.oid, act.code)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========== 工序编辑弹窗 ========== -->
    <el-dialog
      v-model="processDialogVisible"
      :title="editingProcess?.oid ? '编辑工序' : '新增工序'"
      width="550px"
      :close-on-click-modal="false"
    >
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-500 mb-1">工序名称 <span class="text-red-500">*</span></label>
            <el-input v-model="processForm.name" placeholder="如：订单管理" />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">工序编码 <span class="text-red-500">*</span></label>
            <el-input v-model="processForm.code" placeholder="如：crop-orders" />
          </div>
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">前端路由</label>
          <el-input v-model="processForm.route" placeholder="如：/production/orders" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">描述</label>
          <el-input v-model="processForm.description" type="textarea" :rows="2" placeholder="工序描述..." />
        </div>
      </div>
      <template #footer>
        <el-button @click="processDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleProcessSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Key,
  Menu,
  Plus,
  Loading,
  ArrowDown,
  ArrowRight,
  OfficeBuilding,
  Search,
  Refresh,
  Check,
  Close,
  Folder,
  Edit,
  Delete,
  ArrowLeft
} from '@element-plus/icons-vue'
import { useAuthorityStore } from '@/stores/modules/authority'
import {
  getRoleAuthority,
  saveRoleAuthority,
  getRoleDataAuthority,
  saveRoleDataAuthority
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
const {
  processes,
  processLoading,
  loadProcesses,
  saveProcess,
  deleteProcess,
  roles,
  loadRoles,
  organizations,
  loadOrganizations
} = authorityStore

// Tab状态
const activeTab = ref('authority')
const selectedAppType = ref(0)
const selectedRoleOid = ref('')
const searchTerm = ref('')

// 展开状态
const expandedOids = ref(new Set())

// 工序编辑状态
const processDialogVisible = ref(false)
const editingProcess = ref(null)
const processForm = reactive({
  name: '',
  code: '',
  route: '',
  description: '',
  parentOid: ''
})

// 权限状态
const roleAuthorities = ref([])
const authorityChanges = reactive(new Map())
const hasChanges = ref(false)

// 数据权限状态
const showDataAuthPanel = ref(false)
const dataAuthorities = ref([])

// 展平工序列表
const flatProcessList = computed(() => {
  const result = []
  const flatten = (nodes, depth = 0) => {
    for (const node of nodes || []) {
      const hasChildren = node.children && node.children.length > 0
      result.push({
        ...node,
        _depth: depth,
        _hasChildren: hasChildren
      })
      if (hasChildren && expandedOids.value.has(node.oid)) {
        flatten(node.children, depth + 1)
      }
    }
  }
  flatten(processes.value || [])
  return result
})

// 筛选工序
const filteredProcesses = computed(() => {
  if (!searchTerm.value) return flatProcessList.value || []
  const term = searchTerm.value.toLowerCase()
  return (flatProcessList.value || []).filter(p =>
    p.process_name?.toLowerCase().includes(term) ||
    p.process_code?.toLowerCase().includes(term)
  )
})

// 切换展开
const toggleExpand = (oid) => {
  if (expandedOids.value.has(oid)) {
    expandedOids.value.delete(oid)
  } else {
    expandedOids.value.add(oid)
  }
}

// 权限值
const getAuthValue = (processOid, actionCode) => {
  if (authorityChanges.has(processOid) && authorityChanges.get(processOid).has(actionCode)) {
    return authorityChanges.get(processOid).get(actionCode)
  }
  const sv = roleAuthorities.value.find(a => a.processOid === processOid && a.actionOid === actionCode)
  return sv?.value === 1 ? 1 : 0
}

const toggleAuthority = (processOid, actionCode) => {
  const current = getAuthValue(processOid, actionCode)
  if (!authorityChanges.has(processOid)) {
    authorityChanges.set(processOid, new Map())
  }
  authorityChanges.get(processOid).set(actionCode, current === 1 ? 0 : 1)
  hasChanges.value = true
}

const grantAll = () => {
  const changes = new Map()
  for (const proc of flatProcessList.value) {
    const actionMap = new Map()
    for (const act of ACTION_LIST) {
      actionMap.set(act.code, 1)
    }
    changes.set(proc.oid, actionMap)
  }
  changes.set('__grant_all__', new Map())
  Object.assign(authorityChanges, changes)
  hasChanges.value = true
}

const revokeAll = () => {
  const changes = new Map()
  for (const proc of flatProcessList.value) {
    const actionMap = new Map()
    for (const act of ACTION_LIST) {
      actionMap.set(act.code, 0)
    }
    changes.set(proc.oid, actionMap)
  }
  changes.set('__revoke_all__', new Map())
  Object.assign(authorityChanges, changes)
  hasChanges.value = true
}

const saveAuthority = async () => {
  if (!selectedRoleOid.value) return
  const authorities = []
  for (const [processOid, actions] of authorityChanges) {
    if (processOid === '__grant_all__' || processOid === '__revoke_all__') continue
    for (const [actionCode, value] of actions) {
      authorities.push({ processOid, actionOid: actionCode, value })
    }
  }

  try {
    await saveRoleAuthority(selectedRoleOid.value, authorities)
    hasChanges.value = false
    Object.keys(authorityChanges).forEach(k => delete authorityChanges[k])
    await loadRoleAuthority()
    ElMessage.success('保存成功')
  } catch (err) {
    ElMessage.error('保存失败')
  }
}

const loadRoleAuthority = async () => {
  if (!selectedRoleOid.value) return
  try {
    const data = await getRoleAuthority(selectedRoleOid.value, selectedAppType.value)
    roleAuthorities.value = data || []
  } catch {
    roleAuthorities.value = []
  }

  try {
    const data = await getRoleDataAuthority(selectedRoleOid.value)
    dataAuthorities.value = data.map(d => d.orgOid) || []
  } catch {
    dataAuthorities.value = []
  }
}

const toggleDataAuthority = async (orgOid) => {
  const isAuth = dataAuthorities.value.includes(orgOid)
  try {
    await saveRoleDataAuthority(selectedRoleOid.value, [orgOid], !isAuth)
    if (isAuth) {
      dataAuthorities.value = dataAuthorities.value.filter(o => o !== orgOid)
    } else {
      dataAuthorities.value.push(orgOid)
    }
  } catch (err) {
    ElMessage.error('保存数据权限失败')
  }
}

const refreshData = async () => {
  await loadProcesses({ appType: selectedAppType.value })
  hasChanges.value = false
  Object.keys(authorityChanges).forEach(k => delete authorityChanges[k])
}

const handleAppTypeChange = () => {
  loadProcesses({ appType: selectedAppType.value })
}

// 工序CRUD
const openProcessAdd = (parentOid) => {
  editingProcess.value = null
  Object.assign(processForm, { name: '', code: '', route: '', description: '', parentOid })
  processDialogVisible.value = true
}

const openProcessEdit = (proc) => {
  editingProcess.value = proc
  Object.assign(processForm, {
    name: proc.process_name || '',
    code: proc.process_code || '',
    route: proc.route || '',
    description: proc.description || '',
    parentOid: proc.parent_oid || ''
  })
  processDialogVisible.value = true
}

const handleProcessSave = async () => {
  if (!processForm.name) {
    ElMessage.warning('请填写工序名称')
    return
  }
  try {
    const payload = {
      oid: editingProcess.value?.oid || undefined,
      process_name: processForm.name,
      process_code: processForm.code || `CODE_${Date.now()}`,
      route: processForm.route,
      description: processForm.description,
      parent_oid: processForm.parentOid || null,
      app_type: selectedAppType.value
    }
    await saveProcess(payload)
    processDialogVisible.value = false
  } catch (err) {
    ElMessage.error('保存失败')
  }
}

const handleProcessDelete = async (oid) => {
  try {
    await deleteProcess(oid)
  } catch (err) {
    ElMessage.error('删除失败')
  }
}

// 监听角色选择
watch(selectedRoleOid, () => {
  if (selectedRoleOid.value) {
    loadRoleAuthority()
  }
})

// 初始化
onMounted(async () => {
  await loadProcesses({ appType: selectedAppType.value })
  await loadRoles()
  await loadOrganizations()
})
</script>
