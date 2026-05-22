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
            <el-icon :size="20" color="#4B5563">
              <ArrowLeft />
            </el-icon>
          </a>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white">
              <Grid />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">分区管理</h1>
            <p class="text-gray-500">大棚和种植分区层级管理 · 传感器/水肥/摄像头关联</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-end gap-4">
        <div class="grid grid-cols-3 gap-4 flex-1">
          <div>
            <label class="block text-xs text-gray-500 mb-1">关键词搜索</label>
            <el-input
              v-model="keyword"
              placeholder="搜索名称或描述..."
              clearable
              @clear="handleSearchClear"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">区域类型</label>
            <el-select v-model="filterType" placeholder="全部类型" clearable class="w-full">
              <el-option v-for="t in AREA_TYPES" :key="t.value" :label="t.label" :value="t.value" />
            </el-select>
          </div>
          <div class="flex items-end gap-2">
            <el-button @click="handleReset">重置</el-button>
            <el-button type="primary" @click="expandAll">全部展开</el-button>
            <el-button @click="collapseAll">全部折叠</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格卡片 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">
          分区列表
          <span v-if="filteredData.length > 0" class="text-sm text-gray-400 font-normal">({{ filteredData.length }})</span>
        </h3>
        <el-button type="primary" size="small" @click="openAddModal(null)">
          <el-icon><Plus /></el-icon> 新增分区
        </el-button>
      </div>

      <!-- 表格 -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <th class="py-3 px-4 text-left font-medium w-10"></th>
              <th class="py-3 px-4 text-left font-medium">名称</th>
              <th class="py-3 px-4 text-left font-medium w-24">区域类型</th>
              <th class="py-3 px-4 text-left font-medium w-20">面积</th>
              <th class="py-3 px-4 text-left font-medium w-24">负责人</th>
              <th class="py-3 px-4 text-left font-medium w-24">大棚类型</th>
              <th class="py-3 px-4 text-left font-medium">位置</th>
              <th class="py-3 px-4 text-left font-medium w-20">排序</th>
              <th class="py-3 px-4 text-left font-medium w-24">状态</th>
              <th class="py-3 px-4 text-center font-medium w-28">操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="isLoading">
              <tr>
                <td colspan="10" class="py-12 text-center text-gray-400">加载中...</td>
              </tr>
            </template>
            <template v-else-if="filteredData.length === 0">
              <tr>
                <td colspan="10" class="py-12 text-center text-gray-400">
                  {{ items.length === 0 ? '暂无分区数据，点击"新增分区"开始创建' : '无匹配结果' }}
                </td>
              </tr>
            </template>
            <template v-else>
              <tr
                v-for="item in filteredData"
                :key="item.oid"
                class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td class="py-2.5 px-4">
                  <div class="flex items-center gap-1" :style="{ paddingLeft: item.depth * 20 + 'px' }">
                    <template v-if="item.hasChildren">
                      <el-button
                        link
                        class="p-0.5 hover:bg-gray-200 rounded"
                        @click="toggleExpand(item.oid)"
                      >
                        <el-icon v-if="expandedIds.has(item.oid)" color="#6B7280"><ArrowDown /></el-icon>
                        <el-icon v-else color="#6B7280"><ArrowRight /></el-icon>
                      </el-button>
                    </template>
                    <span v-else class="w-5"></span>
                  </div>
                </td>
                <td class="py-2.5 px-4 font-medium text-gray-900">{{ item.name }}</td>
                <td class="py-2.5 px-4">
                  <el-tag
                    :type="getAreaTypeTagType(item.areaType)"
                    size="small"
                  >
                    {{ getAreaTypeLabel(item.areaType) }}
                  </el-tag>
                </td>
                <td class="py-2.5 px-4">{{ item.area > 0 ? item.area + item.areaUnit : '-' }}</td>
                <td class="py-2.5 px-4 text-gray-600">{{ item.managerName || '-' }}</td>
                <td class="py-2.5 px-4 text-gray-600">{{ item.greenhouseType || '-' }}</td>
                <td class="py-2.5 px-4 text-gray-500 text-xs max-w-[200px] truncate">{{ item.address || '-' }}</td>
                <td class="py-2.5 px-4 text-gray-500">{{ item.sortOrder }}</td>
                <td class="py-2.5 px-4">
                  <el-tag
                    :type="item.status === 'active' ? 'success' : 'info'"
                    size="small"
                  >
                    {{ item.status === 'active' ? '使用中' : '已停用' }}
                  </el-tag>
                </td>
                <td class="py-2.5 px-4">
                  <div class="flex items-center justify-center gap-1">
                    <el-button
                      link
                      class="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                      title="添加子分区"
                      @click="openAddChildModal(item.oid)"
                    >
                      <el-icon><Plus /></el-icon>
                    </el-button>
                    <el-button
                      link
                      class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="编辑"
                      @click="openEditModal(item)"
                    >
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button
                      link
                      class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="删除"
                      @click="openDeleteConfirm(item)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="640px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <div class="space-y-4">
        <!-- 基本信息区 -->
        <div class="bg-emerald-50 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-emerald-700 mb-3">基本信息</h4>
          <el-form ref="formRef" :model="form" label-width="80px" class="grid grid-cols-2 gap-4">
            <el-form-item label="名称" prop="name" class="col-span-1">
              <el-input v-model="form.name" placeholder="分区/大棚名称" />
            </el-form-item>
            <el-form-item label="区域类型" prop="areaType" class="col-span-1">
              <el-select v-model="form.areaType" placeholder="请选择" class="w-full">
                <el-option v-for="t in AREA_TYPES" :key="t.value" :label="t.label" :value="t.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="面积" prop="area" class="col-span-1">
              <div class="flex gap-1">
                <el-input-number v-model="form.area" :min="0" placeholder="面积" class="flex-1" />
                <el-select v-model="form.areaUnit" placeholder="单位" class="w-20">
                  <el-option label="亩" value="亩" />
                  <el-option label="㎡" value="㎡" />
                  <el-option label="ha" value="ha" />
                </el-select>
              </div>
            </el-form-item>
            <el-form-item label="大棚类型" prop="greenhouseType" class="col-span-1">
              <el-input v-model="form.greenhouseType" placeholder="如：玻璃温室、薄膜大棚" />
            </el-form-item>
          </el-form>
        </div>

        <!-- 详细信息区 -->
        <div class="rounded-lg p-4 border border-gray-100">
          <h4 class="text-sm font-semibold text-gray-700 mb-3">详细信息</h4>
          <el-form ref="detailFormRef" :model="form" label-width="80px" class="grid grid-cols-2 gap-4">
            <el-form-item label="负责人" prop="managerName" class="col-span-1">
              <el-input v-model="form.managerName" placeholder="负责人姓名" />
            </el-form-item>
            <el-form-item label="位置地址" prop="address" class="col-span-1">
              <el-input v-model="form.address" placeholder="详细位置" />
            </el-form-item>
            <el-form-item label="描述备注" prop="description" class="col-span-2">
              <el-input v-model="form.description" placeholder="备注信息" />
            </el-form-item>
          </el-form>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :disabled="!form.name.trim()">提交</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="400px"
    >
      <div>
        <p class="text-sm text-gray-500">
          确定要删除分区 "<span class="font-medium text-gray-700">{{ selectedItem?.name }}</span>" 吗？
        </p>
        <p v-if="hasChildren" class="mt-1 text-amber-600 text-sm">
          注意：其下的所有子分区也将被一同删除。
        </p>
      </div>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleDelete">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Grid,
  Plus,
  Edit,
  Delete,
  Search
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useFarmPartitionStore } from '@/stores/modules/farmPartition'

// ========== Store ==========
const farmPartitionStore = useFarmPartitionStore()

// ========== 区域类型选项 ==========
const AREA_TYPES = [
  { value: 'greenhouse', label: '大棚' },
  { value: 'shed_out', label: '棚外' },
  { value: 'shed_in', label: '棚内' },
  { value: 'plant_area', label: '种植区' },
]

// ========== 状态 ==========
const items = computed(() => farmPartitionStore.items)
const isLoading = computed(() => farmPartitionStore.isLoading)
const keyword = ref('')
const filterType = ref('')
const expandedIds = ref(new Set())

// 弹窗状态
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEditMode = ref(false)
const deleteDialogVisible = ref(false)
const selectedItem = ref(null)
const parentForAdd = ref(null)
const hasChildren = ref(false)

// 表单引用
const formRef = ref()
const detailFormRef = ref()

// 表单状态
const form = reactive({
  name: '',
  areaType: 'greenhouse',
  greenhouseType: '',
  area: 0,
  areaUnit: '亩',
  managerName: '',
  address: '',
  description: '',
})

// ========== 计算属性 ==========

/**
 * 构建树形数据
 */
const treeData = computed(() => {
  const buildTree = (parentOid) => {
    return items.value
      .filter(p => (parentOid === null ? !p.parentOid : p.parentOid === parentOid))
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(p => ({ ...p, children: buildTree(p.oid) }))
  }
  return buildTree(null)
})

/**
 * 扁平化树（用于筛选后的展示）
 */
const flattenTree = (nodes, depth = 0) => {
  const result = []
  for (const node of nodes) {
    const hasChildren = (node.children && node.children.length > 0) || false
    result.push({ ...node, depth, hasChildren })
    if (node.children && expandedIds.value.has(node.oid)) {
      result.push(...flattenTree(node.children, depth + 1))
    }
  }
  return result
}

/**
 * 筛选后的数据
 */
const filteredData = computed(() => {
  let filtered = flattenTree(treeData.value)
  if (keyword.value) {
    filtered = filtered.filter(p =>
      p.name.includes(keyword.value) || (p.description || '').includes(keyword.value)
    )
  }
  if (filterType.value) {
    filtered = filtered.filter(p => p.areaType === filterType.value)
  }
  return filtered
})

// ========== 方法 ==========

/**
 * 初始化加载数据
 */
const fetchItems = async () => {
  await farmPartitionStore.fetchItems()
}

/**
 * 获取区域类型标签
 */
const getAreaTypeLabel = (areaType) => {
  return AREA_TYPES.find(t => t.value === areaType)?.label || areaType
}

/**
 * 获取区域类型标签颜色
 */
const getAreaTypeTagType = (areaType) => {
  switch (areaType) {
    case 'greenhouse': return 'success'
    case 'plant_area': return 'primary'
    case 'shed_in': return 'warning'
    case 'shed_out': return 'info'
    default: return 'info'
  }
}

/**
 * 切换展开
 */
const toggleExpand = (oid) => {
  if (expandedIds.value.has(oid)) {
    expandedIds.value.delete(oid)
  } else {
    expandedIds.value.add(oid)
  }
  // 触发响应式更新
  expandedIds.value = new Set(expandedIds.value)
}

/**
 * 递归展开所有
 */
const expandAll = () => {
  const allIds = new Set()
  const collect = (nodes) => {
    nodes.forEach(n => {
      if (n.children?.length) {
        allIds.add(n.oid)
        collect(n.children)
      }
    })
  }
  collect(treeData.value)
  expandedIds.value = allIds
}

/**
 * 全部折叠
 */
const collapseAll = () => {
  expandedIds.value = new Set()
}

/**
 * 重置表单
 */
const resetForm = () => {
  form.name = ''
  form.areaType = 'greenhouse'
  form.greenhouseType = ''
  form.area = 0
  form.areaUnit = '亩'
  form.managerName = ''
  form.address = ''
  form.description = ''
}

/**
 * 打开新增弹窗
 */
const openAddModal = (parentOid) => {
  parentForAdd.value = parentOid
  resetForm()
  dialogTitle.value = parentOid ? '添加子分区' : '新增分区'
  isEditMode.value = false
  dialogVisible.value = true
}

/**
 * 打开新增子分区弹窗
 */
const openAddChildModal = (parentOid) => {
  openAddModal(parentOid)
}

/**
 * 打开编辑弹窗
 */
const openEditModal = (item) => {
  selectedItem.value = item
  form.name = item.name
  form.areaType = item.areaType
  form.greenhouseType = item.greenhouseType || ''
  form.area = item.area
  form.areaUnit = item.areaUnit
  form.managerName = item.managerName || ''
  form.address = item.address || ''
  form.description = item.description || ''
  dialogTitle.value = '编辑分区'
  isEditMode.value = true
  dialogVisible.value = true
}

/**
 * 打开删除确认弹窗
 */
const openDeleteConfirm = (item) => {
  selectedItem.value = item
  // 检查是否有子分区
  hasChildren.value = items.value.some(p => p.parentOid === item.oid)
  deleteDialogVisible.value = true
}

/**
 * 处理弹窗关闭
 */
const handleDialogClose = () => {
  resetForm()
  selectedItem.value = null
  parentForAdd.value = null
}

/**
 * 搜索清除
 */
const handleSearchClear = () => {
  keyword.value = ''
}

/**
 * 重置筛选
 */
const handleReset = () => {
  keyword.value = ''
  filterType.value = ''
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!form.name.trim()) return

  if (isEditMode.value) {
    // 编辑模式 - 调用store更新
    await farmPartitionStore.updateItem(selectedItem.value.oid, {
      name: form.name,
      areaType: form.areaType,
      greenhouseType: form.greenhouseType || undefined,
      area: form.area,
      areaUnit: form.areaUnit,
      managerName: form.managerName || undefined,
      address: form.address || undefined,
      description: form.description || undefined,
    })
    ElMessage.success('编辑成功')
  } else {
    // 新增模式 - 调用store创建
    await farmPartitionStore.createItem({
      name: form.name,
      areaType: form.areaType,
      greenhouseType: form.greenhouseType || undefined,
      area: form.area,
      areaUnit: form.areaUnit,
      managerName: form.managerName || undefined,
      address: form.address || undefined,
      description: form.description || undefined,
      parentOid: parentForAdd.value,
    })
    ElMessage.success('新增成功')
  }

  dialogVisible.value = false
  resetForm()
  parentForAdd.value = null
}

/**
 * 删除确认
 */
const handleDelete = async () => {
  if (!selectedItem.value) return

  const success = await farmPartitionStore.deleteItem(selectedItem.value.oid)
  if (success) {
    ElMessage.success('删除成功')
    deleteDialogVisible.value = false
    selectedItem.value = null
  }
}

// ========== 生命周期 ==========
onMounted(() => {
  fetchItems()
})
</script>
