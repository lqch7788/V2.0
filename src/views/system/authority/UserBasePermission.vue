<template>
  <div class="flex gap-4 h-[calc(100vh-220px)]">
    <!-- 左侧：用户列表 -->
    <div class="w-72 flex-shrink-0 flex flex-col">
      <div class="bg-white rounded-xl shadow-none p-4 flex-1 flex flex-col">
        <h3 class="font-semibold text-gray-900 mb-3">用户列表</h3>

        <!-- 搜索框 -->
        <div class="relative mb-3">
          <el-icon class="absolute left-3 top-1/2 -translate-y-1/2" :size="14" color="#9ca3af"><Search /></el-icon>
          <el-input
            v-model="searchUserTerm"
            placeholder="搜索用户..."
            clearable
            class="w-full"
          />
        </div>

        <!-- 用户列表 -->
        <div class="flex-1 overflow-y-auto">
          <div
            v-for="user in filteredUsers"
            :key="user.oid"
            @click="setSelectedUserOid(user.oid)"
            :class="[
              'w-full px-3 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 cursor-pointer',
              selectedUserOid === user.oid ? 'bg-emerald-50 border-l-2 border-emerald-500' : ''
            ]"
          >
            <div class="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-medium flex-shrink-0">
              {{ (user.real_name || user.name || user.username || user.aid || '?')[0].toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ user.real_name || user.name }}
              </p>
              <p class="text-xs text-gray-500 truncate">
                @{{ user.username || user.aid }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：基地权限矩阵 -->
    <div class="flex-1 flex flex-col">
      <div class="bg-white rounded-xl shadow-none p-4 flex-1 flex flex-col">
        <!-- 头部 -->
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-semibold text-gray-900">
              {{ selectedUser ? `${selectedUser.real_name || selectedUser.name} 的基地权限` : '基地权限' }}
            </h3>
            <p class="text-sm text-gray-500 mt-0.5">
              共 {{ allBases.length }} 个基地
            </p>
          </div>

          <!-- 保存按钮 -->
          <el-button
            v-if="hasAnyChanges"
            type="primary"
            @click="saveAllChanges"
            :loading="saving"
          >
            <el-icon :size="14"><Check /></el-icon>
            保存全部 ({{ permissionChanges.size }})
          </el-button>
        </div>

        <!-- 基地列表 -->
        <div v-if="loading" class="flex items-center justify-center flex-1">
          <el-icon class="is-loading" :size="32" color="#059669"><Loading /></el-icon>
        </div>

        <div v-else-if="allBases.length === 0" class="text-center py-12 text-gray-500">
          <el-icon :size="48" color="#d1d5db"><OfficeBuilding /></el-icon>
          <p class="mt-3">暂无基地数据</p>
        </div>

        <div v-else class="flex-1 overflow-y-auto">
          <table class="w-full">
            <thead class="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600">
              <tr>
                <th class="text-left py-2.5 px-3 text-sm font-medium text-white w-8">
                  <!-- 选择状态指示 -->
                </th>
                <th class="text-left py-2.5 px-3 text-sm font-medium text-white">基地名称</th>
                <th class="text-center py-2.5 px-3 text-sm font-medium text-white">只读</th>
                <th class="text-center py-2.5 px-3 text-sm font-medium text-white">读写</th>
                <th class="text-center py-2.5 px-3 text-sm font-medium text-white">管理</th>
                <th class="text-center py-2.5 px-3 text-sm font-medium text-white w-20">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="base in allBases"
                :key="base.baseOid"
                :class="[
                  'border-b border-gray-200 hover:bg-gray-50',
                  hasChanges(base.baseOid) ? 'bg-amber-50' : ''
                ]"
              >
                <!-- 选择状态 -->
                <td class="py-2.5 px-3">
                  <el-icon v-if="isGranted(base.baseOid)" :size="20" color="#059669"><Check /></el-icon>
                  <el-icon v-else :size="20" color="#9ca3af"><Minus /></el-icon>
                </td>

                <!-- 基地名称 -->
                <td class="py-2.5 px-3">
                  <div class="flex items-center gap-2">
                    <el-icon :size="16" color="#9ca3af"><OfficeBuilding /></el-icon>
                    <span class="text-sm text-gray-900">{{ base.baseName }}</span>
                    <span v-if="hasChanges(base.baseOid)" class="text-xs text-amber-600">(已修改)</span>
                  </div>
                </td>

                <!-- 只读 -->
                <td class="py-2.5 px-3 text-center">
                  <button
                    @click="handleAccessLevelChange(base.baseOid, 'read')"
                    :class="[
                      'w-5 h-5 rounded text-xs font-medium border-2 transition-colors flex items-center justify-center mx-auto',
                      getAccessLevel(base.baseOid) === 'read'
                        ? 'bg-blue-100 text-blue-700 border-blue-500'
                        : 'bg-white text-gray-400 border-gray-400 hover:border-blue-400 hover:text-blue-500'
                    ]"
                  >
                    <el-icon v-if="getAccessLevel(base.baseOid) === 'read'" :size="8"><Check /></el-icon>
                  </button>
                </td>

                <!-- 读写 -->
                <td class="py-2.5 px-3 text-center">
                  <button
                    @click="handleAccessLevelChange(base.baseOid, 'write')"
                    :class="[
                      'w-5 h-5 rounded text-xs font-medium border-2 transition-colors flex items-center justify-center mx-auto',
                      getAccessLevel(base.baseOid) === 'write'
                        ? 'bg-green-100 text-green-700 border-green-500'
                        : 'bg-white text-gray-400 border-gray-400 hover:border-green-400 hover:text-green-500'
                    ]"
                  >
                    <el-icon v-if="getAccessLevel(base.baseOid) === 'write'" :size="8"><Check /></el-icon>
                  </button>
                </td>

                <!-- 管理 -->
                <td class="py-2.5 px-3 text-center">
                  <button
                    @click="handleAccessLevelChange(base.baseOid, 'admin')"
                    :class="[
                      'w-5 h-5 rounded text-xs font-medium border-2 transition-colors flex items-center justify-center mx-auto',
                      getAccessLevel(base.baseOid) === 'admin'
                        ? 'bg-purple-100 text-purple-700 border-purple-500'
                        : 'bg-white text-gray-400 border-gray-400 hover:border-purple-400 hover:text-purple-500'
                    ]"
                  >
                    <el-icon v-if="getAccessLevel(base.baseOid) === 'admin'" :size="8"><Check /></el-icon>
                  </button>
                </td>

                <!-- 操作 -->
                <td class="py-2.5 px-3 text-center">
                  <div v-if="isGranted(base.baseOid) && getAccessLevel(base.baseOid) !== 'none'" class="flex items-center justify-center gap-1">
                    <el-button
                      v-if="hasChanges(base.baseOid)"
                      size="small"
                      @click="savePermission(base.baseOid)"
                      :loading="saving && hasChanges(base.baseOid)"
                      class="text-emerald-600"
                    >
                      <el-icon :size="14"><Check /></el-icon>
                    </el-button>
                    <el-button
                      size="small"
                      @click="handleAccessLevelChange(base.baseOid, 'none')"
                      :disabled="saving"
                      class="text-red-500"
                    >
                      <el-icon :size="14"><Close /></el-icon>
                    </el-button>
                  </div>
                  <el-button
                    v-else-if="!isGranted(base.baseOid)"
                    size="small"
                    @click="handleAccessLevelChange(base.baseOid, 'read')"
                    :disabled="saving"
                  >
                    授权
                  </el-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Check, Close, OfficeBuilding, Minus } from '@element-plus/icons-vue'
import { useAuthorityStore } from '@/stores/modules/authority'

const authorityStore = useAuthorityStore()

// 状态
const selectedUserOid = ref('')
const selectedUser = ref(null)
const searchUserTerm = ref('')
const userPermissions = ref([])
const allBases = ref([])
const loading = ref(false)
const saving = ref(false)

// 权限变更 (baseOid -> accessLevel)
const permissionChanges = ref(new Map())

// 访问级别配置
const ACCESS_LEVELS = [
  { code: 'read', name: '只读' },
  { code: 'write', name: '读写' },
  { code: 'admin', name: '管理' },
]

// 过滤后的用户列表
const filteredUsers = computed(() => {
  const term = searchUserTerm.value.toLowerCase()
  return (authorityStore.users || []).filter(u => {
    const name = (u.real_name || u.name || '').toLowerCase()
    const username = (u.username || u.aid || '').toLowerCase()
    return name.includes(term) || username.includes(term)
  })
})

// 是否有任何变更
const hasAnyChanges = computed(() => permissionChanges.value.size > 0)

// 默认选择第一个用户
watch(() => authorityStore.users, (users) => {
  if (!selectedUserOid.value && users.length > 0) {
    selectedUserOid.value = users[0].oid
  }
}, { immediate: true })

// 选择用户后加载权限
watch(selectedUserOid, (oid) => {
  if (!oid) {
    selectedUser.value = null
    userPermissions.value = []
    return
  }

  const user = (authorityStore.users || []).find(u => u.oid === oid) || null
  selectedUser.value = user
  loadUserPermissions(oid)
  permissionChanges.value = new Map()
}, { immediate: true })

// 获取某个基地的当前权限级别
const getAccessLevel = (baseOid) => {
  if (permissionChanges.value.has(baseOid)) {
    return permissionChanges.value.get(baseOid)
  }
  const perm = userPermissions.value.find(p => p.base_oid === baseOid)
  return perm?.access_level || 'none'
}

// 检查是否有变更
const hasChanges = (baseOid) => {
  const currentLevel = getAccessLevel(baseOid)
  const originalPerm = userPermissions.value.find(p => p.base_oid === baseOid)
  const originalLevel = originalPerm?.access_level || 'none'
  return currentLevel !== originalLevel
}

// 检查是否已授权
const isGranted = (baseOid) => {
  return !!userPermissions.value.find(p => p.base_oid === baseOid) || permissionChanges.value.has(baseOid)
}

// 处理权限变更
const handleAccessLevelChange = (baseOid, accessLevel) => {
  const newChanges = new Map(permissionChanges.value)
  if (accessLevel === 'none') {
    if (!userPermissions.value.find(p => p.base_oid === baseOid)) {
      newChanges.delete(baseOid)
    } else {
      newChanges.set(baseOid, 'none')
    }
  } else {
    newChanges.set(baseOid, accessLevel)
  }
  permissionChanges.value = newChanges
}

// 加载用户权限
const loadUserPermissions = async (userOid) => {
  loading.value = true
  try {
    const res = await fetch(`/api/user-base-permissions?userOid=${userOid}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    if (res.ok) {
      const data = await res.json()
      userPermissions.value = data || []
    }
  } catch (error) {
    console.error('加载用户基地权限失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载所有可用基地
const loadAllBases = async () => {
  try {
    const res = await fetch('/api/user-base-permissions/all-bases', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    if (res.ok) {
      const data = await res.json()
      allBases.value = data || []
    }
  } catch (error) {
    console.error('加载基地列表失败:', error)
  }
}

// 保存单个权限变更
const savePermission = async (baseOid) => {
  if (!selectedUserOid.value) return

  const accessLevel = getAccessLevel(baseOid)
  const base = allBases.value.find(b => b.baseOid === baseOid)

  saving.value = true
  try {
    const res = await fetch('/api/user-base-permissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        userOid: selectedUserOid.value,
        baseOid,
        baseName: base?.baseName || baseOid,
        accessLevel,
      }),
    })

    if (res.ok) {
      await loadUserPermissions(selectedUserOid.value)
      const newChanges = new Map(permissionChanges.value)
      newChanges.delete(baseOid)
      permissionChanges.value = newChanges
    }
  } catch (error) {
    ElMessage.error('保存权限失败')
  } finally {
    saving.value = false
  }
}

// 批量保存所有变更
const saveAllChanges = async () => {
  if (!selectedUserOid.value || permissionChanges.value.size === 0) return

  saving.value = true
  try {
    const permissions = Array.from(permissionChanges.value.entries()).map(([baseOid, accessLevel]) => {
      const base = allBases.value.find(b => b.baseOid === baseOid)
      return { baseOid, baseName: base?.baseName || baseOid, accessLevel }
    })

    const res = await fetch('/api/user-base-permissions/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        userOid: selectedUserOid.value,
        permissions,
      }),
    })

    if (res.ok) {
      await loadUserPermissions(selectedUserOid.value)
      permissionChanges.value = new Map()
      ElMessage.success('保存成功')
    }
  } catch (error) {
    ElMessage.error('批量保存权限失败')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await authorityStore.loadUsers()
  await loadAllBases()
})
</script>
