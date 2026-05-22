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
            <el-icon :size="20" color="#525252">
              <ArrowLeft />
            </el-icon>
          </a>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white">
              <Monitor />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">设备分配</h1>
            <p class="text-gray-500">IoT设备分配到温室/区域 + 运行参数配置（预留端口）</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-end gap-4 flex-wrap">
        <!-- 关键词搜索 -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-xs text-gray-500 mb-1">关键词搜索</label>
          <el-input
            v-model="keyword"
            placeholder="搜索设备名称/编号/站点/类型..."
            clearable
            @clear="handleReset"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <!-- 设备类型筛选 -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">设备类型</label>
          <el-select v-model="filterType" placeholder="全部类型" clearable class="min-w-[140px]">
            <el-option label="全部类型" value="" />
            <el-option v-for="t in deviceTypes" :key="t" :label="t" :value="t" />
          </el-select>
        </div>
        <!-- 重置按钮 -->
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">
          分配列表
          <span v-if="filteredData.length > 0" class="text-sm text-gray-400 font-normal">({{ filteredData.length }})</span>
        </h3>
        <el-button type="primary" @click="openAddModal">
          <el-icon><Plus /></el-icon> 新增分配
        </el-button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <th class="py-3 px-4 text-left font-medium">设备名称</th>
              <th class="py-3 px-4 text-left font-medium">设备编号</th>
              <th class="py-3 px-4 text-left font-medium">所属站点</th>
              <th class="py-3 px-4 text-left font-medium">区域</th>
              <th class="py-3 px-4 text-left font-medium">设备类型</th>
              <th class="py-3 px-4 text-left font-medium">关联电机</th>
              <th class="py-3 px-4 text-center font-medium w-20">排序</th>
              <th class="py-3 px-4 text-left font-medium w-24">状态</th>
              <th class="py-3 px-4 text-center font-medium w-24">操作</th>
            </tr>
          </thead>
          <tbody>
            <!-- 加载中 -->
            <tr v-if="isLoading">
              <td colspan="9" class="py-12 text-center text-gray-400">加载中...</td>
            </tr>
            <!-- 无数据 -->
            <tr v-else-if="filteredData.length === 0">
              <td colspan="9" class="py-12 text-center text-gray-400">
                {{ items.length === 0 ? '暂无分配数据 — 预留端口' : '无匹配结果' }}
              </td>
            </tr>
            <!-- 数据列表 -->
            <tr
              v-for="item in filteredData"
              :key="item.oid"
              class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td class="py-2.5 px-4 font-medium text-gray-900">{{ item.deviceName }}</td>
              <td class="py-2.5 px-4">
                <span class="inline-flex px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-600">
                  {{ item.deviceCode || '-' }}
                </span>
              </td>
              <td class="py-2.5 px-4 text-gray-600">{{ item.siteName || '-' }}</td>
              <td class="py-2.5 px-4 text-gray-600">{{ item.areaName || '-' }}</td>
              <td class="py-2.5 px-4">
                <span class="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                  {{ item.deviceType || '-' }}
                </span>
              </td>
              <td class="py-2.5 px-4 text-gray-600">{{ item.motorName || '-' }}</td>
              <td class="py-2.5 px-4 text-center text-gray-500">{{ item.sortOrder }}</td>
              <td class="py-2.5 px-4">
                <span
                  :class="[
                    'inline-flex px-2 py-0.5 rounded text-xs font-medium',
                    item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  ]"
                >
                  {{ item.status === 'active' ? '启用' : '停用' }}
                </span>
              </td>
              <td class="py-2.5 px-4">
                <div class="flex items-center justify-center gap-1">
                  <el-button
                    link
                    :icon="Edit"
                    class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="编辑"
                    @click="openEditModal(item)"
                  />
                  <el-button
                    link
                    :icon="Delete"
                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="删除"
                    @click="openDeleteConfirm(item)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑设备分配' : '新增设备分配'"
      width="640px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        <!-- 基本信息 -->
        <div class="bg-blue-50 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-blue-700 mb-3">基本信息</h4>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-xs text-blue-700 mb-1">
                设备名称 <span class="text-red-500">*</span>
              </label>
              <el-input v-model="form.deviceName" placeholder="如：1号水泵" />
            </div>
            <div>
              <label class="block text-xs text-blue-700 mb-1">设备编号</label>
              <el-input v-model="form.deviceCode" placeholder="DeviceEntityAID" />
            </div>
            <div>
              <label class="block text-xs text-blue-700 mb-1">排序</label>
              <el-input-number v-model="form.sortOrder" :min="0" class="w-full" />
            </div>
          </div>
        </div>

        <!-- 分配信息 -->
        <div class="rounded-lg p-4 border border-gray-100 space-y-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-1">分配信息</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-500 mb-1">所属站点</label>
              <el-input v-model="form.siteName" placeholder="IDCOID/站点名称" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">温室区域</label>
              <el-input v-model="form.areaName" placeholder="区域系统名称" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">设备类型</label>
              <el-input v-model="form.deviceType" placeholder="如：传感器/电磁阀/水泵" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">关联电机/水泵</label>
              <el-input v-model="form.motorName" placeholder="电机名称" />
            </div>
          </div>
        </div>

        <!-- 运行参数 -->
        <div class="rounded-lg p-4 border border-gray-100 space-y-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-1">运行参数</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-500 mb-1">允许运行时间</label>
              <el-input v-model="form.allowRuntime" placeholder="如：83:55（分:秒）" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">休息时间</label>
              <el-input v-model="form.restTime" placeholder="分钟" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">初始状态</label>
              <el-input v-model="form.initialStatus" placeholder="如：关闭/停止/开启" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">启动时间</label>
              <el-date-picker
                v-model="form.startTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择日期"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">所属回路</label>
              <el-input v-model="form.circuit" placeholder="回路编号" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">从属设备</label>
              <el-input v-model="form.slaveDevices" placeholder="逗号分隔" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">显示曲线</label>
              <el-select v-model="form.showCurve" class="w-full">
                <el-option :value="0" label="否" />
                <el-option :value="1" label="是" />
              </el-select>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">规格说明</label>
              <el-input v-model="form.specs" placeholder="规格描述" />
            </div>
          </div>
        </div>

        <!-- 备注 -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">备注</label>
          <el-input v-model="form.remarks" placeholder="备注信息" />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :disabled="!form.deviceName?.trim()">
            提交
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="400px"
    >
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">确认删除</h3>
        <p class="text-sm text-gray-500">
          确定要删除设备分配 "<span class="font-medium text-gray-700">{{ selectedItem?.deviceName }}</span>" 吗？
        </p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="handleDelete">确认删除</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ArrowLeft, Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useDeviceDistributionStore } from '@/stores/modules/deviceDistribution'

// Store
const store = useDeviceDistributionStore()

// 状态
const keyword = ref('')
const filterType = ref('')
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const isEdit = ref(false)
const selectedItem = ref(null)

// 表单数据
const defaultForm = {
  deviceName: '',
  deviceCode: '',
  siteName: '',
  areaName: '',
  deviceType: '',
  motorName: '',
  sortOrder: 0,
  allowRuntime: '',
  restTime: '',
  initialStatus: '',
  circuit: '',
  slaveDevices: '',
  startTime: '',
  showCurve: 0,
  specs: '',
  remarks: '',
  status: 'active'
}

const form = reactive({ ...defaultForm })

// 计算属性：从store获取数据
const items = computed(() => store.items)
const isLoading = computed(() => store.isLoading)

// 筛选后的数据
const filteredData = computed(() => {
  let filtered = items.value

  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    filtered = filtered.filter(item =>
      (item.deviceName && item.deviceName.toLowerCase().includes(kw)) ||
      (item.deviceCode && item.deviceCode.toLowerCase().includes(kw)) ||
      (item.siteName && item.siteName.toLowerCase().includes(kw)) ||
      (item.deviceType && item.deviceType.toLowerCase().includes(kw))
    )
  }

  if (filterType.value) {
    filtered = filtered.filter(item => item.deviceType === filterType.value)
  }

  return filtered
})

// 设备类型列表（用于筛选下拉框）
const deviceTypes = computed(() => {
  const types = new Set(items.value.map(item => item.deviceType).filter(Boolean))
  return Array.from(types)
})

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    deviceName: '',
    deviceCode: '',
    siteName: '',
    areaName: '',
    deviceType: '',
    motorName: '',
    sortOrder: 0,
    allowRuntime: '',
    restTime: '',
    initialStatus: '',
    circuit: '',
    slaveDevices: '',
    startTime: '',
    showCurve: 0,
    specs: '',
    remarks: '',
    status: 'active'
  })
}

// 打开新增弹窗
const openAddModal = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 打开编辑弹窗
const openEditModal = (item) => {
  isEdit.value = true
  selectedItem.value = item
  Object.assign(form, {
    deviceName: item.deviceName || '',
    deviceCode: item.deviceCode || '',
    siteName: item.siteName || '',
    areaName: item.areaName || '',
    deviceType: item.deviceType || '',
    motorName: item.motorName || '',
    sortOrder: item.sortOrder || 0,
    allowRuntime: item.allowRuntime || '',
    restTime: item.restTime || '',
    initialStatus: item.initialStatus || '',
    circuit: item.circuit || '',
    slaveDevices: item.slaveDevices || '',
    startTime: item.startTime || '',
    showCurve: item.showCurve || 0,
    specs: item.specs || '',
    remarks: item.remarks || '',
    status: item.status || 'active'
  })
  dialogVisible.value = true
}

// 关闭弹窗时重置
const handleDialogClose = () => {
  resetForm()
  selectedItem.value = null
}

// 打开删除确认弹窗
const openDeleteConfirm = (item) => {
  selectedItem.value = item
  deleteDialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!form.deviceName?.trim()) {
    ElMessage.warning('请输入设备名称')
    return
  }

  if (isEdit.value && selectedItem.value) {
    // 编辑
    await store.updateItem(selectedItem.value.oid, { ...form, showCurve: form.showCurve || 0 })
    ElMessage.success('更新成功')
  } else {
    // 新增
    const result = await store.createItem({ ...form, showCurve: form.showCurve || 0 })
    if (result) {
      ElMessage.success('创建成功')
    }
  }

  dialogVisible.value = false
  resetForm()
}

// 删除
const handleDelete = async () => {
  if (!selectedItem.value) return

  const success = await store.deleteItem(selectedItem.value.oid)
  if (success) {
    ElMessage.success('删除成功')
  } else {
    ElMessage.error('删除失败')
  }

  deleteDialogVisible.value = false
  selectedItem.value = null
}

// 重置筛选
const handleReset = () => {
  keyword.value = ''
  filterType.value = ''
}

// 初始化加载数据
onMounted(() => {
  store.fetchItems()
})
</script>

<style scoped>
/* 表格头部渐变背景继承 */
.bg-gradient-to-r {
  background: linear-gradient(to right, var(--el-color-primary), var(--el-color-primary-light-3));
}
</style>
