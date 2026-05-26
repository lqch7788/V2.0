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
            <el-icon :size="24" color="white">
              <Cloudy />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">水肥一体机</h1>
            <p class="text-gray-500">灌溉时段、间隔和ABC混合比例参数配置</p>
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
              placeholder="搜索分区或设备..."
              clearable
              @clear="handleReset"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">状态</label>
            <el-select v-model="filterStatus" placeholder="全部" clearable>
              <el-option label="全部" value="" />
              <el-option label="使用中" value="active" />
              <el-option label="已停用" value="inactive" />
            </el-select>
          </div>
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
          设备列表
          <span v-if="filteredData.length > 0" class="text-sm text-gray-400 font-normal">({{ filteredData.length }})</span>
        </h3>
        <el-button type="primary" @click="openAddModal">
          <el-icon><Plus /></el-icon> 新增配置
        </el-button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <th class="py-3 px-4 text-left font-medium">分区</th>
              <th class="py-3 px-4 text-left font-medium w-28">设备编号</th>
              <th class="py-3 px-4 text-left font-medium w-44">灌溉时段</th>
              <th class="py-3 px-4 text-left font-medium w-28">灌溉间隔</th>
              <th class="py-3 px-4 text-left font-medium w-44">ABC混合比例</th>
              <th class="py-3 px-4 text-left font-medium w-20">状态</th>
              <th class="py-3 px-4 text-center font-medium w-36">操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="isLoading">
              <tr>
                <td colspan="7" class="py-12 text-center text-gray-400">加载中...</td>
              </tr>
            </template>
            <template v-else-if="filteredData.length === 0">
              <tr>
                <td colspan="7" class="py-12 text-center text-gray-400">
                  {{ items.length === 0 ? '暂无水肥配置' : '无匹配结果' }}
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
                  <span class="text-xs font-mono text-gray-500">{{ item.deviceCode || '-' }}</span>
                </td>
                <td class="py-2.5 px-4 text-gray-600 text-xs">
                  {{ item.startTime && item.endTime ? `${item.startTime} ~ ${item.endTime}` : '-' }}
                </td>
                <td class="py-2.5 px-4 text-gray-600">
                  每{{ item.intervalValue }}{{ getIntervalUnitLabel(item.intervalUnit) }}
                </td>
                <td class="py-2.5 px-4">
                  <div class="flex items-center gap-2 text-xs">
                    <span class="px-1.5 py-0.5 rounded bg-red-50 text-red-600 font-mono">A:{{ item.mixRatioA }}</span>
                    <span class="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-mono">B:{{ item.mixRatioB }}</span>
                    <span class="px-1.5 py-0.5 rounded bg-green-50 text-green-600 font-mono">C:{{ item.mixRatioC }}</span>
                  </div>
                </td>
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
                    <!-- 下发按钮 -->
                    <template v-if="dispatchingOid === item.oid">
                      <div class="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded">
                        <el-icon class="animate-spin text-emerald-600"><Loading /></el-icon>
                        <span class="text-xs text-emerald-600">{{ Math.round(dispatchProgress) }}%</span>
                      </div>
                    </template>
                    <template v-else>
                      <el-button
                        link
                        @click="handleDispatch(item.oid)"
                        class="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        title="下发参数"
                      >
                        <el-icon><Top /></el-icon>
                      </el-button>
                    </template>
                    <el-button
                      link
                      @click="openEditModal(item)"
                      class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="编辑"
                    >
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button
                      link
                      @click="openDeleteConfirm(item)"
                      class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="删除"
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
      v-model="showModal"
      :title="isEdit ? '编辑水肥配置' : '新增水肥配置'"
      width="680px"
      :close-on-click-modal="false"
      class="water-fertilizer-modal"
    >
      <div class="space-y-4">
        <!-- 分区和设备关联 -->
        <div class="bg-emerald-50 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
            <el-icon><Cloudy /></el-icon> 设备关联
          </h4>
          <div class="grid grid-cols-2 gap-4">
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
              <label class="block text-xs text-emerald-700 mb-1">设备编号</label>
              <el-input
                v-model="form.deviceCode"
                placeholder="如：WF-001"
                class="font-mono"
              />
            </div>
            <div>
              <label class="block text-xs text-emerald-700 mb-1">设备 OID</label>
              <el-input
                v-model="form.deviceOid"
                placeholder="可选"
                class="font-mono"
              />
            </div>
          </div>
        </div>

        <!-- 硬件地址 -->
        <div class="rounded-lg p-4 border border-gray-100">
          <h4 class="text-sm font-semibold text-gray-700 mb-3">硬件地址</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-500 mb-1">设备地址 (MachineAddr)</label>
              <el-input
                v-model="form.machineAddr"
                placeholder="设备物理地址"
                class="font-mono bg-gray-50"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">MAC 地址 (MACAddr)</label>
              <el-input
                v-model="form.macAddr"
                placeholder="网络MAC地址"
                class="font-mono bg-gray-50"
              />
            </div>
          </div>
        </div>

        <!-- 灌溉时段 -->
        <div class="rounded-lg p-4 border border-gray-100">
          <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <el-icon><Clock /></el-icon> 灌溉时段
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-500 mb-1">开始时间</label>
              <el-time-select
                v-model="form.startTime"
                placeholder="开始时间"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">结束时间</label>
              <el-time-select
                v-model="form.endTime"
                placeholder="结束时间"
                class="w-full"
              />
            </div>
          </div>
        </div>

        <!-- 灌溉间隔 -->
        <div class="rounded-lg p-4 border border-gray-100">
          <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <el-icon><RefreshLeft /></el-icon> 灌溉间隔
          </h4>
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-500">每隔</span>
            <el-input-number
              v-model="form.intervalValue"
              :min="1"
              :max="365"
              :step="1"
            />
            <el-select v-model="form.intervalUnit" class="w-28">
              <el-option
                v-for="u in INTERVAL_UNITS"
                :key="u.value"
                :label="u.label"
                :value="u.value"
              />
            </el-select>
            <span class="text-sm text-gray-500">灌溉一次</span>
          </div>
        </div>

        <!-- ABC 混合比例 -->
        <div class="rounded-lg p-4 border border-gray-100">
          <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <el-icon><Tools /></el-icon> ABC 混合比例
          </h4>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-xs text-red-600 mb-1 font-medium">A 液比例</label>
              <div class="flex items-center">
                <el-input-number
                  v-model="form.mixRatioA"
                  :min="0"
                  :max="100"
                  :step="0.1"
                  controls-position="right"
                  class="flex-1"
                />
                <span class="h-8 px-2 flex items-center text-xs bg-red-100 text-red-600 rounded-r border border-red-200 border-l-0">%</span>
              </div>
            </div>
            <div>
              <label class="block text-xs text-blue-600 mb-1 font-medium">B 液比例</label>
              <div class="flex items-center">
                <el-input-number
                  v-model="form.mixRatioB"
                  :min="0"
                  :max="100"
                  :step="0.1"
                  controls-position="right"
                  class="flex-1"
                />
                <span class="h-8 px-2 flex items-center text-xs bg-blue-100 text-blue-600 rounded-r border border-blue-200 border-l-0">%</span>
              </div>
            </div>
            <div>
              <label class="block text-xs text-green-600 mb-1 font-medium">C 液比例</label>
              <div class="flex items-center">
                <el-input-number
                  v-model="form.mixRatioC"
                  :min="0"
                  :max="100"
                  :step="0.1"
                  controls-position="right"
                  class="flex-1"
                />
                <span class="h-8 px-2 flex items-center text-xs bg-green-100 text-green-600 rounded-r border border-green-200 border-l-0">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 描述 -->
        <div class="rounded-lg p-4 border border-gray-100">
          <label class="block text-xs text-gray-500 mb-1">描述备注</label>
          <el-input
            v-model="form.description"
            placeholder="备注信息"
          />
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

    <!-- 删除确认 -->
    <el-dialog
      v-model="showDeleteDialog"
      title="确认删除"
      width="400px"
    >
      <p class="text-sm text-gray-500">
        确定要删除 {{ selectedItem?.partitionName || selectedItem?.partitionOid }} 的水肥配置吗？
      </p>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useWaterFertilizerStore, INTERVAL_UNITS } from '@/stores/modules/waterFertilizer'
import { useFarmPartitionStore } from '@/stores'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Cloudy,
  Search,
  Plus,
  Edit,
  Delete,
  Clock,
  RefreshLeft,
  Tools,
  Top,
  Loading
} from '@element-plus/icons-vue'

// ========== Store ==========
const waterFertilizerStore = useWaterFertilizerStore()
const farmPartitionStore = useFarmPartitionStore()

// ========== 状态 ==========
const keyword = ref('')
const filterStatus = ref('')
const showModal = ref(false)
const showDeleteDialog = ref(false)
const isEdit = ref(false)
const selectedItem = ref(null)

// 下发进度
const dispatchingOid = ref(null)
const dispatchProgress = ref(0)

// 表单默认值
const defaultForm = {
  partitionOid: '',
  deviceOid: '',
  deviceCode: '',
  machineAddr: '',
  macAddr: '',
  startTime: '',
  endTime: '',
  intervalValue: 1,
  intervalUnit: 'day',
  mixRatioA: 0,
  mixRatioB: 0,
  mixRatioC: 0,
  description: ''
}

const form = reactive({ ...defaultForm })

// ========== 计算属性 ==========
const items = computed(() => waterFertilizerStore.items)
const isLoading = computed(() => waterFertilizerStore.isLoading)
const partitionOptions = computed(() =>
  farmPartitionStore.items.map(p => ({ oid: p.oid, name: p.name }))
)

const filteredData = computed(() => {
  let filtered = items.value
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    filtered = filtered.filter(item =>
      (item.partitionName || '').toLowerCase().includes(kw) ||
      (item.deviceCode || '').toLowerCase().includes(kw) ||
      (item.description || '').toLowerCase().includes(kw)
    )
  }
  if (filterStatus.value) {
    filtered = filtered.filter(item => item.status === filterStatus.value)
  }
  return filtered
})

// ========== 方法 ==========

/**
 * 获取间隔单位标签
 */
const getIntervalUnitLabel = (unit) => {
  return INTERVAL_UNITS.find(u => u.value === unit)?.label || ''
}

/**
 * 重置筛选
 */
const handleReset = () => {
  keyword.value = ''
  filterStatus.value = ''
}

/**
 * 打开新增弹窗
 */
const openAddModal = () => {
  isEdit.value = false
  Object.assign(form, defaultForm)
  showModal.value = true
}

/**
 * 打开编辑弹窗
 */
const openEditModal = (item) => {
  isEdit.value = true
  selectedItem.value = item
  Object.assign(form, {
    partitionOid: item.partitionOid,
    deviceOid: item.deviceOid || '',
    deviceCode: item.deviceCode || '',
    machineAddr: item.machineAddr || '',
    macAddr: item.macAddr || '',
    startTime: item.startTime || '',
    endTime: item.endTime || '',
    intervalValue: item.intervalValue,
    intervalUnit: item.intervalUnit,
    mixRatioA: item.mixRatioA,
    mixRatioB: item.mixRatioB,
    mixRatioC: item.mixRatioC,
    description: item.description || ''
  })
  showModal.value = true
}

/**
 * 关闭弹窗
 */
const closeModal = () => {
  showModal.value = false
  selectedItem.value = null
  Object.assign(form, defaultForm)
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!form.partitionOid) {
    ElMessage.warning('请选择所属分区')
    return
  }

  // 查找分区名称
  const partition = partitionOptions.value.find(p => p.oid === form.partitionOid)
  const itemData = {
    ...form,
    partitionName: partition?.name || form.partitionOid
  }

  try {
    if (isEdit.value && selectedItem.value) {
      const result = await waterFertilizerStore.updateItem(selectedItem.value.oid, itemData)
      if (result || result === undefined) ElMessage.success('更新成功')
      else ElMessage.error('更新失败')
    } else {
      const result = await waterFertilizerStore.createItem(itemData)
      if (result) ElMessage.success('新增成功')
      else ElMessage.error('新增失败')
    }
    closeModal()
  } catch (err) {
    ElMessage.error(isEdit.value ? '更新失败' : '新增失败')
  }
}

/**
 * 打开删除确认
 */
const openDeleteConfirm = (item) => {
  selectedItem.value = item
  showDeleteDialog.value = true
}

/**
 * 删除确认
 */
const handleDelete = async () => {
  if (!selectedItem.value) return
  await waterFertilizerStore.deleteItem(selectedItem.value.oid)
  ElMessage.success('删除成功')
  showDeleteDialog.value = false
  selectedItem.value = null
}

/**
 * 下发参数
 */
const handleDispatch = async (oid) => {
  dispatchingOid.value = oid
  dispatchProgress.value = 0

  // 模拟进度
  const interval = setInterval(() => {
    dispatchProgress.value = Math.min(dispatchProgress.value + Math.random() * 30, 90)
  }, 300)

  const result = await waterFertilizerStore.dispatchParams(oid)

  clearInterval(interval)

  if (result) {
    dispatchProgress.value = 100
    ElMessage.success('参数下发成功')
    setTimeout(() => {
      dispatchingOid.value = null
      dispatchProgress.value = 0
    }, 1500)
  } else {
    dispatchingOid.value = null
    dispatchProgress.value = 0
    ElMessage.error('参数下发失败')
  }
}

// ========== 生命周期 ==========
onMounted(() => {
  waterFertilizerStore.fetchItems()
  farmPartitionStore.fetchItems()
})
</script>

<style scoped>
/* 水肥一体机弹窗样式 */
.water-fertilizer-modal :deep(.el-dialog__header) {
  background: linear-gradient(to right, #10b981, #059669, #10b981);
  color: white;
  margin: 0;
  padding: 16px 20px;
}

.water-fertilizer-modal :deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
}

.water-fertilizer-modal :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
}

.water-fertilizer-modal :deep(.el-dialog__body) {
  padding: 20px;
}

/* 表头渐变色 */
.bg-gradient-to-r from-emerald-500 to-emerald-600 {
  background: linear-gradient(to right, #10b981, #059669);
}
/* 主按钮改为emerald绿色 - 与V1.1保持一致 */
:deep(.el-button--primary) {
  --el-button-bg-color: #059669;
  --el-button-border-color: #059669;
  --el-button-hover-bg-color: #047857;
  --el-button-hover-border-color: #047857;
}
</style>
