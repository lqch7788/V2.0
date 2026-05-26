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
            <el-icon :size="20" color="#4b5563"><ArrowLeft /></el-icon>
          </a>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white"><Lightning /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">能耗管理</h1>
            <p class="text-gray-500">大棚能耗类型和计量设备配置</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">配置总数</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.total }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-green-600">使用中</p>
        <p class="text-2xl font-bold text-green-600 mt-1">{{ stats.active }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 col-span-2">
        <p class="text-sm text-gray-500 mb-2">能耗类型分布</p>
        <div class="flex items-center gap-3">
          <template v-if="stats.byType.length > 0">
            <span
              v-for="t in stats.byType"
              :key="t.label"
              class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700"
            >
              {{ t.label }}: {{ t.count }}
            </span>
          </template>
          <span v-else class="text-sm text-gray-400">暂无数据</span>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-end gap-4">
        <div class="grid grid-cols-4 gap-4 flex-1">
          <!-- 关键词搜索 -->
          <div>
            <label class="block text-xs text-gray-500 mb-1">关键词搜索</label>
            <div class="relative">
              <el-icon class="absolute left-2 top-1/2 -translate-y-1/2" :size="16" color="#9ca3af"><Search /></el-icon>
              <el-input
                v-model="keyword"
                placeholder="搜索分区、设备或描述..."
                clearable
                @clear="handleReset"
              />
            </div>
          </div>
          <!-- 能耗类型 -->
          <div>
            <label class="block text-xs text-gray-500 mb-1">能耗类型</label>
            <el-select v-model="filterType" placeholder="全部" clearable class="w-full">
              <el-option label="全部" value="" />
              <el-option
                v-for="t in ENERGY_TYPES"
                :key="t.value"
                :label="t.label"
                :value="t.value"
              />
            </el-select>
          </div>
          <!-- 状态 -->
          <div>
            <label class="block text-xs text-gray-500 mb-1">状态</label>
            <el-select v-model="filterStatus" placeholder="全部" clearable class="w-full">
              <el-option label="全部" value="" />
              <el-option label="使用中" value="active" />
              <el-option label="已停用" value="inactive" />
            </el-select>
          </div>
          <!-- 重置按钮 -->
          <div class="flex items-end">
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">
          能耗配置列表
          <span v-if="filteredData.length > 0" class="text-sm text-gray-400 font-normal">({{ filteredData.length }})</span>
        </h3>
        <el-button type="primary" size="small" @click="openAddModal">
          <el-icon><Plus /></el-icon> 新增配置
        </el-button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <th class="py-3 px-4 text-left font-medium">所属分区</th>
              <th class="py-3 px-4 text-left font-medium w-24">能耗类型</th>
              <th class="py-3 px-4 text-left font-medium">计量设备</th>
              <th class="py-3 px-4 text-left font-medium w-32">表计编号</th>
              <th class="py-3 px-4 text-left font-medium w-20">单位</th>
              <th class="py-3 px-4 text-left font-medium">描述</th>
              <th class="py-3 px-4 text-left font-medium w-24">状态</th>
              <th class="py-3 px-4 text-center font-medium w-24">操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="isLoading">
              <tr>
                <td colspan="8" class="py-12 text-center text-gray-400">加载中...</td>
              </tr>
            </template>
            <template v-else-if="filteredData.length === 0">
              <tr>
                <td colspan="8" class="py-12 text-center text-gray-400">
                  {{ items.length === 0 ? '暂无能耗配置' : '无匹配结果' }}
                </td>
              </tr>
            </template>
            <template v-else>
              <tr
                v-for="item in filteredData"
                :key="item.oid"
                class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td class="py-2.5 px-4 font-medium text-gray-900">
                  {{ item.partitionName || item.partitionOid }}
                </td>
                <td class="py-2.5 px-4">
                  <span
                    :class="[
                      'inline-flex px-2 py-0.5 rounded text-xs font-medium',
                      item.energyType === 'electricity' ? 'bg-yellow-100 text-yellow-700' :
                      item.energyType === 'water' ? 'bg-blue-100 text-blue-700' :
                      item.energyType === 'gas' ? 'bg-orange-100 text-orange-700' :
                      'bg-purple-100 text-purple-700'
                    ]"
                  >
                    {{ getEnergyTypeLabel(item.energyType) }}
                  </span>
                </td>
                <td class="py-2.5 px-4 text-gray-600">{{ item.deviceName || '-' }}</td>
                <td class="py-2.5 px-4 text-gray-500 text-xs font-mono">{{ item.meterCode || '-' }}</td>
                <td class="py-2.5 px-4 text-gray-500">{{ item.unit }}</td>
                <td class="py-2.5 px-4 text-gray-500 text-xs max-w-[200px] truncate">{{ item.description || '-' }}</td>
                <td class="py-2.5 px-4">
                  <span
                    :class="[
                      'inline-flex px-2 py-0.5 rounded text-xs font-medium',
                      item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    ]"
                  >
                    {{ item.status === 'active' ? '使用中' : '已停用' }}
                  </span>
                </td>
                <td class="py-2.5 px-4">
                  <div class="flex items-center justify-center gap-1">
                    <el-button
                      link
                      @click="openEditModal(item)"
                      class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="编辑"
                    >
                      <el-icon :size="14"><Edit /></el-icon>
                    </el-button>
                    <el-button
                      link
                      @click="openDeleteConfirm(item)"
                      class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="删除"
                    >
                      <el-icon :size="14"><Delete /></el-icon>
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
      v-model="showModal"
      :title="isEdit ? '编辑能耗配置' : '新增能耗配置'"
      width="560px"
      :close-on-click-modal="false"
      class="energy-modal"
    >
      <div class="p-4">
        <!-- 关联配置 -->
        <div class="bg-emerald-50 rounded-lg p-4 mb-4">
          <h4 class="text-sm font-semibold text-emerald-700 mb-3">关联配置</h4>
          <div class="space-y-4">
            <div>
              <label class="block text-xs text-emerald-700 mb-1">
                所属分区 <span class="text-red-500">*</span>
              </label>
              <el-select
                v-model="form.partitionOid"
                placeholder="— 请选择大棚/分区 —"
                class="w-full"
              >
                <el-option label="— 请选择大棚/分区 —" value="" />
                <el-option
                  v-for="p in partitionOptions"
                  :key="p.oid"
                  :label="p.name"
                  :value="p.oid"
                />
              </el-select>
            </div>
            <div>
              <label class="block text-xs text-emerald-700 mb-1">
                能耗类型 <span class="text-red-500">*</span>
              </label>
              <el-select
                v-model="form.energyType"
                @change="handleEnergyTypeChange"
                class="w-full"
              >
                <el-option
                  v-for="t in ENERGY_TYPES"
                  :key="t.value"
                  :label="t.label"
                  :value="t.value"
                />
              </el-select>
            </div>
          </div>
        </div>

        <!-- 计量设备 -->
        <div class="rounded-lg p-4 border border-gray-100 mb-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-3">计量设备</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-500 mb-1">设备名称</label>
              <el-input v-model="form.deviceName" placeholder="如：电表001" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">表计编号</label>
              <el-input v-model="form.meterCode" placeholder="如：MTR-001" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">设备 OID</label>
              <el-input v-model="form.deviceOid" placeholder="可选" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">计量单位</label>
              <el-input v-model="form.unit" placeholder="kWh" />
            </div>
          </div>
        </div>

        <!-- 描述备注 -->
        <div class="rounded-lg p-4 border border-gray-100">
          <label class="block text-xs text-gray-500 mb-1">描述备注</label>
          <el-input v-model="form.description" placeholder="备注信息" />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="closeModal">取消</el-button>
          <el-button
            type="primary"
            @click="handleSubmit"
            :disabled="!form.partitionOid"
          >
            提交
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="showDeleteDialog"
      title="确认删除"
      width="400px"
    >
      <div class="p-4">
        <p class="text-sm text-gray-500">
          确定要删除 "{{ selectedItem?.partitionName || selectedItem?.partitionOid }}" 的能耗配置吗？
        </p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="showDeleteDialog = false">取消</el-button>
          <el-button type="danger" @click="handleDelete">确认删除</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { ArrowLeft, Lightning, Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useEnergyConfigStore, ENERGY_TYPES } from '@/stores/modules/energyConfig'
import { useFarmPartitionStore } from '@/stores/modules/farmPartition'

// ==================== Store ====================
const energyConfigStore = useEnergyConfigStore()
const partitionStore = useFarmPartitionStore()

// ==================== 状态 ====================
const items = computed(() => energyConfigStore.items)
const isLoading = computed(() => energyConfigStore.isLoading)
const partitions = computed(() => partitionStore.items)

// 筛选条件
const keyword = ref('')
const filterType = ref('')
const filterStatus = ref('')

// 弹窗状态
const showModal = ref(false)
const isEdit = ref(false)
const showDeleteDialog = ref(false)
const selectedItem = ref(null)

// 表单数据
const form = reactive({
  partitionOid: '',
  energyType: 'electricity',
  deviceOid: '',
  deviceName: '',
  meterCode: '',
  unit: 'kWh',
  description: ''
})

// ==================== 计算属性 ====================
// 筛选后的数据
const filteredData = computed(() => {
  let filtered = items.value

  // 关键词筛选
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    filtered = filtered.filter(item =>
      (item.partitionName || '').toLowerCase().includes(kw) ||
      (item.deviceName || '').toLowerCase().includes(kw) ||
      (item.description || '').toLowerCase().includes(kw)
    )
  }

  // 能耗类型筛选
  if (filterType.value) {
    filtered = filtered.filter(item => item.energyType === filterType.value)
  }

  // 状态筛选
  if (filterStatus.value) {
    filtered = filtered.filter(item => item.status === filterStatus.value)
  }

  return filtered
})

// 统计
const stats = computed(() => ({
  total: items.value.length,
  active: items.value.filter(i => i.status === 'active').length,
  byType: ENERGY_TYPES.map(t => ({
    label: t.label,
    count: items.value.filter(i => i.energyType === t.value).length
  })).filter(t => t.count > 0)
}))

// 分区选项
const partitionOptions = computed(() =>
  partitions.value.map(p => ({ oid: p.oid, name: p.name }))
)

// ==================== 方法 ====================
// 获取能耗类型标签
const getEnergyTypeLabel = (value) => {
  const type = ENERGY_TYPES.find(t => t.value === value)
  return type ? type.label : value
}

// 能耗类型变更处理
const handleEnergyTypeChange = (value) => {
  const type = ENERGY_TYPES.find(t => t.value === value)
  if (type) {
    form.unit = type.unit
  }
}

// 重置筛选
const handleReset = () => {
  keyword.value = ''
  filterType.value = ''
  filterStatus.value = ''
}

// 打开新增弹窗
const openAddModal = () => {
  isEdit.value = false
  resetForm()
  showModal.value = true
}

// 打开编辑弹窗
const openEditModal = (item) => {
  isEdit.value = true
  selectedItem.value = item
  form.partitionOid = item.partitionOid
  form.energyType = item.energyType
  form.deviceOid = item.deviceOid || ''
  form.deviceName = item.deviceName || ''
  form.meterCode = item.meterCode || ''
  form.unit = item.unit
  form.description = item.description || ''
  showModal.value = true
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
  selectedItem.value = null
  resetForm()
}

// 重置表单
const resetForm = () => {
  form.partitionOid = ''
  form.energyType = 'electricity'
  form.deviceOid = ''
  form.deviceName = ''
  form.meterCode = ''
  form.unit = 'kWh'
  form.description = ''
}

// 提交表单
const handleSubmit = async () => {
  if (!form.partitionOid) return

  try {
    if (isEdit.value) {
      await energyConfigStore.updateItem(selectedItem.value.oid, {
        partitionOid: form.partitionOid,
        energyType: form.energyType,
        deviceOid: form.deviceOid || null,
        deviceName: form.deviceName || null,
        meterCode: form.meterCode || null,
        unit: form.unit,
        description: form.description || null
      })
    } else {
      const result = await energyConfigStore.createItem({
        partitionOid: form.partitionOid,
        energyType: form.energyType,
        deviceOid: form.deviceOid || null,
        deviceName: form.deviceName || null,
        meterCode: form.meterCode || null,
        unit: form.unit,
        description: form.description || null
      })
      if (result) {
        closeModal()
      }
      return
    }
    closeModal()
  } catch (err) {
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
  }
}

// 打开删除确认
const openDeleteConfirm = (item) => {
  selectedItem.value = item
  showDeleteDialog.value = true
}

// 确认删除
const handleDelete = async () => {
  if (!selectedItem.value) return

  await energyConfigStore.deleteItem(selectedItem.value.oid)
  showDeleteDialog.value = false
  selectedItem.value = null
}

// ==================== 生命周期 ====================
onMounted(() => {
  energyConfigStore.fetchItems()
  partitionStore.fetchItems()
})
</script>

<style scoped>
/* 弹窗头部渐变 - 与V1.1保持一致 */
.energy-modal :deep(.el-dialog__header) {
  background: linear-gradient(to right, #10b981, #059669, #10b981);
  border-radius: 8px 8px 0 0;
  margin: 0;
  padding: 16px 20px;
}
.energy-modal :deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
}
.energy-modal :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
}
.energy-modal :deep(.el-dialog__body) {
  padding: 20px;
}
/* 主按钮改为emerald绿色 - 与V1.1保持一致 */
:deep(.el-button--primary) {
  --el-button-bg-color: #059669;
  --el-button-border-color: #059669;
  --el-button-hover-bg-color: #047857;
  --el-button-hover-border-color: #047857;
}
</style>
