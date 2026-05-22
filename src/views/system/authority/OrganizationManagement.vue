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
            <el-icon :size="24" color="white"><OfficeBuilding /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">组织管理</h1>
            <p class="text-gray-500">管理组织架构和部门信息</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="flex items-center gap-3 flex-wrap">
      <span class="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
        {{ organizations.length }} 个组织
      </span>
      <div class="flex items-center gap-2 ml-auto">
        <div class="relative">
          <el-icon class="absolute left-2.5 top-1/2 -translate-y-1/2" :size="14" color="#9ca3af">
            <Search />
          </el-icon>
          <el-input
            v-model="searchTerm"
            placeholder="搜索..."
            clearable
            class="w-40"
            size="small"
          />
        </div>
        <el-button size="small" @click="loadOrganizations" :loading="loading">
          <el-icon :size="14"><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" size="small" @click="handleAdd()">
          <el-icon :size="14"><Plus /></el-icon>
          新增组织
        </el-button>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
      {{ error }}
    </div>

    <!-- 树形列表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">组织架构</h3>
      </div>

      <div v-if="loading && organizations.length === 0" class="p-8 text-center text-gray-500">
        <el-icon class="is-loading" :size="24"><Loading /></el-icon>
        <p class="mt-2">加载中...</p>
      </div>

      <div v-else-if="organizations.length === 0" class="p-8 text-center text-gray-500">
        暂无组织数据，点击"新增组织"创建
      </div>

      <div v-else class="divide-y divide-gray-100">
        <div v-for="org in paginatedOrganizations" :key="org.oid">
          <div
            class="flex items-center gap-2 px-4 py-3 hover:bg-blue-50 border-b border-gray-50"
            :style="{ paddingLeft: `${getLevel(org) * 24 + 16}px` }"
          >
            <!-- 展开/折叠按钮 -->
            <el-button
              v-if="org.children && org.children.length > 0"
              text
              size="small"
              @click="toggleExpand(org.oid)"
              class="p-1"
            >
              <el-icon :size="16" :color="'#6b7280'">
                <component :is="expandedOids.has(org.oid) ? 'ArrowDown' : 'ArrowRight'" />
              </el-icon>
            </el-button>
            <el-icon v-else :size="16" class="text-transparent">-</el-icon>

            <!-- 组织信息 -->
            <div class="flex-1 flex items-center gap-4">
              <span class="font-medium text-gray-900">{{ org.name }}</span>
              <span class="text-sm text-gray-500">[{{ org.aid }}]</span>
              <el-tag v-if="org.orgType" size="small" type="info">{{ org.orgType }}</el-tag>
              <el-tag
                v-if="org.departmentId"
                size="small"
                type="success"
              >
                <el-icon :size="12"><OfficeBuilding /></el-icon>
                {{ org.departmentName || org.departmentId }}
              </el-tag>
            </div>

            <!-- 操作按钮 -->
            <div class="flex items-center gap-1">
              <el-button text size="small" @click="handleAdd(org.oid)" title="新增子组织">
                <el-icon :size="16" color="#059669"><Plus /></el-icon>
              </el-button>
              <el-button text size="small" @click="handleEdit(org)" title="编辑">
                <el-icon :size="16" color="#2563eb"><Edit /></el-icon>
              </el-button>
              <el-button text size="small" @click="handleDelete(org.oid)" title="删除">
                <el-icon :size="16" color="#dc2626"><Delete /></el-icon>
              </el-button>
            </div>
          </div>

          <!-- 递归渲染子节点 -->
          <template v-if="org.children && org.children.length > 0 && expandedOids.has(org.oid)">
            <OrgTreeNode
              v-for="child in org.children"
              :key="child.oid"
              :org="child"
              :level="1"
              :expandedOids="expandedOids"
              @toggle="toggleExpand"
              @add="handleAdd"
              @edit="handleEdit"
              @delete="handleDelete"
            />
          </template>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="px-4 py-3 border-t border-gray-100 flex justify-end">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredOrganizations.length"
          layout="prev, pager, next"
          background
        />
      </div>
    </div>

    <!-- 弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingOrg?.oid ? '编辑组织' : '新增组织'"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            组织编码 <span class="text-red-500">*</span>
          </label>
          <el-input v-model="formData.aid" placeholder="如：ORG001" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            组织名称 <span class="text-red-500">*</span>
          </label>
          <el-input v-model="formData.name" placeholder="请输入组织名称" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">组织类型</label>
          <el-select v-model="formData.orgType" class="w-full">
            <el-option value="company" label="公司" />
            <el-option value="base" label="基地" />
            <el-option value="region" label="区域" />
            <el-option value="department" label="部门" />
            <el-option value="workshop" label="车间" />
          </el-select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            关联部门 <span class="text-xs text-gray-400">（双向同步）</span>
          </label>
          <el-select v-model="formData.departmentId" clearable class="w-full" placeholder="不关联（独立组织）">
            <el-option
              v-for="dept in departments"
              :key="dept.id || dept.oid"
              :label="`${dept.name} (${dept.code})`"
              :value="dept.id || dept.oid"
            />
          </el-select>
          <p v-if="formData.departmentId" class="text-xs text-blue-600 mt-1">
            已关联部门，修改名称/负责人将双向同步
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入组织描述" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">排序号</label>
          <el-input-number v-model="formData.sortNumber" :min="0" class="w-full" />
        </div>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  OfficeBuilding,
  Search,
  Refresh,
  Plus,
  Edit,
  Delete,
  ArrowRight,
  ArrowDown,
  Loading,
  ArrowLeft
} from '@element-plus/icons-vue'
import { useAuthorityStore } from '@/stores/modules/authority'
import { useDepartmentStore } from '@/stores/modules/department'
import OrgTreeNode from './OrgTreeNode.vue'

// Store
const authorityStore = useAuthorityStore()
const departmentStore = useDepartmentStore()

// 状态
const {
  organizations,
  loading,
  error,
  loadOrganizations,
  saveOrganization,
  deleteOrganization
} = authorityStore

const departments = computed(() => departmentStore.departments || [])

// 搜索和分页
const searchTerm = ref('')
const currentPage = ref(1)
const pageSize = 10

// 展开状态
const expandedOids = ref(new Set())

// 弹窗状态
const dialogVisible = ref(false)
const editingOrg = ref(null)
const saving = ref(false)

// 表单数据
const formData = reactive({
  oidParent: null,
  aid: '',
  name: '',
  description: '',
  orgType: 'department',
  departmentId: '',
  departmentName: '',
  sortNumber: 0
})

// 过滤组织
const filteredOrganizations = computed(() => {
  if (!searchTerm.value) return organizations.value
  const term = searchTerm.value.toLowerCase()
  return organizations.value.filter(org =>
    org.name?.toLowerCase().includes(term) ||
    org.aid?.toLowerCase().includes(term) ||
    org.description?.toLowerCase().includes(term)
  )
})

// 分页
const totalPages = computed(() => Math.ceil(filteredOrganizations.value.length / pageSize))
const paginatedOrganizations = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredOrganizations.value.slice(start, start + pageSize)
})

// 计算组织层级深度
const getLevel = (org, orgList = organizations.value) => {
  // 递归查找组织在树中的层级
  const findLevel = (targetOid, nodes, currentLevel = 0) => {
    for (const node of nodes) {
      if (node.oid === targetOid) {
        return currentLevel
      }
      if (node.children && node.children.length > 0) {
        const childLevel = findLevel(targetOid, node.children, currentLevel + 1)
        if (childLevel !== -1) {
          return childLevel
        }
      }
    }
    return -1 // 未找到
  }

  const level = findLevel(org.oid, orgList)
  return level >= 0 ? level : 0
}

// 切换展开状态
const toggleExpand = (oid) => {
  if (expandedOids.value.has(oid)) {
    expandedOids.value.delete(oid)
  } else {
    expandedOids.value.add(oid)
  }
}

// 打开新增弹窗
const handleAdd = (parentOid) => {
  editingOrg.value = null
  Object.assign(formData, {
    oidParent: parentOid || null,
    aid: '',
    name: '',
    description: '',
    orgType: 'department',
    departmentId: '',
    departmentName: '',
    sortNumber: 0
  })
  dialogVisible.value = true
}

// 打开编辑弹窗
const handleEdit = (org) => {
  editingOrg.value = org
  Object.assign(formData, {
    oidParent: org.oidParent,
    aid: org.aid,
    name: org.name,
    description: org.description || '',
    orgType: org.orgType || 'department',
    departmentId: org.departmentId || '',
    departmentName: org.departmentName || '',
    sortNumber: org.sortNumber || 0
  })
  dialogVisible.value = true
}

// 保存
const handleSave = async () => {
  if (!formData.aid || !formData.name) {
    ElMessage.warning('请填写组织编码和名称')
    return
  }
  saving.value = true
  try {
    const payload = {
      ...formData,
      oid: editingOrg.value?.oid || undefined
    }
    await saveOrganization(payload)
    ElMessage.success('保存成功')
    dialogVisible.value = false
  } catch (err) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 删除
const handleDelete = async (oid) => {
  try {
    await ElMessageBox.confirm('确定要删除该组织吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteOrganization(oid)
    ElMessage.success('删除成功')
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 加载数据
onMounted(async () => {
  await loadOrganizations()
  await departmentStore.loadDepartments?.()
})
</script>
