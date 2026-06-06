<template>
  <div class="flex gap-4 h-[calc(100vh-220px)]">
    <!-- 左侧：用户列表 -->
    <div class="w-72 flex-shrink-0 flex flex-col">
      <div class="bg-white rounded-xl shadow-none p-4 flex-1 flex flex-col">
        <h3 class="font-semibold text-gray-900 mb-3">用户列表</h3>

        <!-- 搜索框 -->
        <div class="relative mb-3">
          <el-icon class="absolute left-3 top-1/2 -translate-y-1/2" :size="14" color="#9ca3af">
            <Search />
          </el-icon>
          <el-input
            v-model="searchUserTerm"
            placeholder="请输入用户姓名/账号"
            clearable
            class="w-full pl-9"
            size="small"
          />
        </div>

        <!-- 用户列表 -->
        <div class="flex-1 overflow-y-auto">
          <button
            v-for="user in filteredUsers"
            :key="user.oid"
            @click="setSelectedUserOid(user.oid)"
            :class="[
              'w-full px-3 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100',
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
                &#64;{{ user.username || user.aid }}
              </p>
            </div>
          </button>
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
            size="small"
            :loading="saving"
            @click="saveAllChanges"
          >
            <el-icon :size="14"><Check /></el-icon>
            保存全部 ({{ permissionChanges.size }})
          </el-button>
        </div>

        <!-- 基地列表 -->
        <div v-if="loading" class="flex items-center justify-center flex-1">
          <el-icon class="is-loading" :size="32" color="#10b981"><Loading /></el-icon>
        </div>
        <div v-else-if="allBases.length === 0" class="text-center py-12 text-gray-500">
          <el-icon :size="48" color="#d1d5db"><OfficeBuilding /></el-icon>
          <p class="mt-3">暂无基地数据</p>
        </div>
        <div v-else class="flex-1 overflow-y-auto">
          <table class="w-full">
            <thead class="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600">
              <tr>
                <th class="text-left py-2.5 px-3 text-sm font-medium text-white w-8"></th>
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
                  <el-icon v-if="isGranted(base.baseOid)" :size="20" color="#059669">
                    <Check />
                  </el-icon>
                  <span v-else class="inline-block w-5 h-5 border-2 border-gray-300 rounded"></span>
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
                      'w-5 h-5 rounded text-xs font-medium border-2 transition-colors flex items-center justify-center',
                      getAccessLevel(base.baseOid) === 'read'
                        ? 'bg-blue-100 text-blue-700 border-blue-500'
                        : 'bg-white text-gray-400 border-gray-300 hover:border-blue-400 hover:text-blue-500'
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
                      'w-5 h-5 rounded text-xs font-medium border-2 transition-colors flex items-center justify-center',
                      getAccessLevel(base.baseOid) === 'write'
                        ? 'bg-green-100 text-green-700 border-green-500'
                        : 'bg-white text-gray-400 border-gray-300 hover:border-green-400 hover:text-green-500'
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
                      'w-5 h-5 rounded text-xs font-medium border-2 transition-colors flex items-center justify-center',
                      getAccessLevel(base.baseOid) === 'admin'
                        ? 'bg-purple-100 text-purple-700 border-purple-500'
                        : 'bg-white text-gray-400 border-gray-300 hover:border-purple-400 hover:text-purple-500'
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
                      text
                      size="small"
                      :loading="saving && hasChanges(base.baseOid)"
                      @click="savePermission(base.baseOid)"
                      class="h-8 px-3 text-emerald-600 hover:text-emerald-700"
                    >
                      <el-icon :size="14"><Check /></el-icon>
                    </el-button>
                    <el-button
                      text
                      size="small"
                      :disabled="saving"
                      @click="handleAccessLevelChange(base.baseOid, 'none')"
                      class="h-8 px-3 text-red-500 hover:text-red-600"
                    >
                      <el-icon :size="14"><Close /></el-icon>
                    </el-button>
                  </div>
                  <el-button
                    v-else
                    size="small"
                    :disabled="saving"
                    @click="handleAccessLevelChange(base.baseOid, 'read')"
                    class="h-8 px-3 text-xs"
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
/**
 * 用户基地权限配置页面
 * 管理用户对特定基地的访问权限
 * 布局：左侧用户列表，右侧基地权限矩阵
 * 1:1 对齐 V1.1 src/pages/authority/UserBasePermission.tsx
 */
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  Check,
  Close,
  Loading,
  OfficeBuilding
} from '@element-plus/icons-vue'
import { useAuthorityStore } from '@/stores/modules/authority'
import { get, post } from '@/api/request'

// 访问级别配置（与V1.1 ACCESS_LEVELS 一致）
const ACCESS_LEVELS = ['read', 'write', 'admin']

// Store
const authorityStore = useAuthorityStore()
const { users, loadUsers } = authorityStore

// 状态
const selectedUserOid = ref('')
const selectedUser = ref(null)
const searchUserTerm = ref('')
const userPermissions = ref([])
const allBases = ref([])
const loading = ref(false)
const saving = ref(false)

// 权限变更 (baseOid -> accessLevel)
const permissionChanges = reactive(new Map())

// 设置选中用户（同时同步user对象）
const setSelectedUserOid = (oid) => {
  selectedUserOid.value = oid
}

// 默认选择第一个用户
watch(users, (userList) => {
  if (!selectedUserOid.value && userList && userList.length > 0) {
    selectedUserOid.value = userList[0].oid
  }
}, { immediate: true })

// 选择用户后加载权限
watch(selectedUserOid, async (newOid) => {
  if (!newOid) {
    selectedUser.value = null
    userPermissions.value = []
    return
  }
  const user = (users.value || []).find((u) => u.oid === newOid) || null
  selectedUser.value = user
  await loadUserPermissions(newOid)
  permissionChanges.clear()
})

// 加载用户权限
const loadUserPermissions = async (userOid) => {
  loading.value = true
  try {
    const data = await get(`/authority/user-base-permissions?userOid=${userOid}`)
    userPermissions.value = data || []
  } catch (err) {
    ElMessage.error('加载用户基地权限失败')
    userPermissions.value = []
  } finally {
    loading.value = false
  }
}

// 加载所有可用基地
const loadAllBases = async () => {
  try {
    const data = await get('/authority/user-base-permissions/all-bases')
    allBases.value = data || []
  } catch (err) {
    ElMessage.error('加载基地列表失败')
    allBases.value = []
  }
}

// 获取某个基地的当前权限级别
const getAccessLevel = (baseOid) => {
  if (permissionChanges.has(baseOid)) {
    return permissionChanges.get(baseOid)
  }
  const perm = userPermissions.value.find(p => p.base_oid === baseOid)
  return perm?.access_level || 'none'
}

// 检查某基地是否已授权
const isGranted = (baseOid) => {
  if (permissionChanges.has(baseOid)) {
    return permissionChanges.get(baseOid) !== 'none'
  }
  return !!userPermissions.value.find(p => p.base_oid === baseOid)
}

// 检查是否有变更
const hasChanges = (baseOid) => {
  const currentLevel = getAccessLevel(baseOid)
  const originalPerm = userPermissions.value.find(p => p.base_oid === baseOid)
  const originalLevel = originalPerm?.access_level || 'none'
  return currentLevel !== originalLevel
}

// 处理权限变更
const handleAccessLevelChange = (baseOid, accessLevel) => {
  if (accessLevel === 'none') {
    if (!userPermissions.value.find(p => p.base_oid === baseOid)) {
      permissionChanges.delete(baseOid)
    } else {
      permissionChanges.set(baseOid, 'none')
    }
  } else {
    permissionChanges.set(baseOid, accessLevel)
  }
}

// 保存单个权限变更
const savePermission = async (baseOid) => {
  if (!selectedUserOid.value) return

  const accessLevel = getAccessLevel(baseOid)
  const base = allBases.value.find(b => b.baseOid === baseOid)

  saving.value = true
  try {
    await post('/authority/user-base-permissions', {
      userOid: selectedUserOid.value,
      baseOid,
      baseName: base?.baseName || baseOid,
      accessLevel
    })
    await loadUserPermissions(selectedUserOid.value)
    permissionChanges.delete(baseOid)
  } catch (err) {
    ElMessage.error('保存权限失败')
  } finally {
    saving.value = false
  }
}

// 批量保存所有变更
const saveAllChanges = async () => {
  if (!selectedUserOid.value || permissionChanges.size === 0) return

  saving.value = true
  try {
    const permissions = []
    for (const [baseOid, accessLevel] of permissionChanges) {
      const base = allBases.value.find(b => b.baseOid === baseOid)
      permissions.push({ baseOid, baseName: base?.baseName || baseOid, accessLevel })
    }

    await post('/authority/user-base-permissions/batch', {
      userOid: selectedUserOid.value,
      permissions
    })

    await loadUserPermissions(selectedUserOid.value)
    permissionChanges.clear()
    ElMessage.success('保存成功')
  } catch (err) {
    ElMessage.error('批量保存权限失败')
  } finally {
    saving.value = false
  }
}

// 过滤后的用户列表
const filteredUsers = computed(() => {
  return (users.value || []).filter(u => {
    const term = searchUserTerm.value.toLowerCase()
    const name = (u.real_name || u.name || '').toLowerCase()
    const username = (u.username || u.aid || '').toLowerCase()
    return name.includes(term) || username.includes(term)
  })
})

// 是否有任何变更
const hasAnyChanges = computed(() => permissionChanges.size > 0)

// 初始加载
onMounted(async () => {
  await loadUsers()
  await loadAllBases()
})
</script>
