<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><Cpu /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">设备监控</h1>
          <p class="text-xs text-gray-500">农业设备监控</p>
        </div>
      </div>
    </div>

    <!-- 设备状态概览 -->
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border-t-4 border-emerald-500">
        <p class="text-xs text-gray-500">正常运行</p>
        <p class="text-2xl font-bold text-emerald-600 mt-1">{{ stats.normal }}</p>
        <p class="text-xs text-gray-400 mt-1">台设备</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border-t-4 border-amber-500">
        <p class="text-xs text-gray-500">维护中</p>
        <p class="text-2xl font-bold text-amber-600 mt-1">{{ stats.maintenance }}</p>
        <p class="text-xs text-gray-400 mt-1">台设备</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border-t-4 border-red-500">
        <p class="text-xs text-gray-500">故障停机</p>
        <p class="text-2xl font-bold text-red-600 mt-1">{{ stats.fault }}</p>
        <p class="text-xs text-gray-400 mt-1">台设备</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border-t-4 border-blue-500">
        <p class="text-xs text-gray-500">设备总数</p>
        <p class="text-2xl font-bold text-blue-600 mt-1">{{ stats.total }}</p>
        <p class="text-xs text-gray-400 mt-1">台设备</p>
      </div>
    </div>

    <!-- 设备列表 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-semibold text-gray-800">设备列表</h3>
        <div class="flex items-center gap-2">
          <el-select v-model="filterType" placeholder="设备类型" size="small" style="width: 120px">
            <el-option label="全部类型" value="" />
            <el-option label="灌溉设备" value="irrigation" />
            <el-option label="通风设备" value="ventilation" />
            <el-option label="温控设备" value="temperature" />
            <el-option label="施肥设备" value="fertilization" />
          </el-select>
          <el-select v-model="filterStatus" placeholder="设备状态" size="small" style="width: 120px">
            <el-option label="全部状态" value="" />
            <el-option label="正常运行" value="normal" />
            <el-option label="维护中" value="maintenance" />
            <el-option label="故障停机" value="fault" />
          </el-select>
        </div>
      </div>

      <el-table :data="filteredDevices" stripe style="width: 100%">
        <el-table-column prop="name" label="设备名称" min-width="140" />
        <el-table-column prop="code" label="设备编号" width="120" />
        <el-table-column prop="type" label="设备类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.typeName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="安装位置" min-width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="runtime" label="运行时长" width="100">
          <template #default="{ row }">
            {{ row.runtime }}h
          </template>
        </el-table-column>
        <el-table-column prop="lastMaintenance" label="上次维护" width="120" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleDetail(row)">详情</el-button>
            <el-button type="warning" link size="small" @click="handleMaintain(row)">维护</el-button>
            <el-button type="danger" link size="small" @click="handleFault(row)">故障</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 设备维护记录 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h3 class="text-base font-semibold text-gray-800 mb-4">最近维护记录</h3>
      <el-table :data="maintenanceRecords" stripe style="width: 100%">
        <el-table-column prop="deviceName" label="设备名称" min-width="120" />
        <el-table-column prop="maintenanceType" label="维护类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getMaintenanceType(row.maintenanceType)" size="small">
              {{ getMaintenanceTypeText(row.maintenanceType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="maintainDate" label="维护日期" width="120" />
        <el-table-column prop="maintainer" label="维护人" width="100" />
        <el-table-column prop="result" label="维护结果" width="100">
          <template #default="{ row }">
            <el-tag :type="row.result === 'success' ? 'success' : 'danger'" size="small">
              {{ row.result === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120" />
      </el-table>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="showDetail" title="设备详情" width="700px">
      <div v-if="selectedDevice">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="设备名称">{{ selectedDevice.name }}</el-descriptions-item>
          <el-descriptions-item label="设备编号">{{ selectedDevice.code }}</el-descriptions-item>
          <el-descriptions-item label="设备类型">{{ selectedDevice.typeName }}</el-descriptions-item>
          <el-descriptions-item label="安装位置">{{ selectedDevice.location }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="getStatusType(selectedDevice.status)" size="small">
              {{ getStatusText(selectedDevice.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="运行时长">{{ selectedDevice.runtime }}h</el-descriptions-item>
          <el-descriptions-item label="采购日期">{{ selectedDevice.purchaseDate }}</el-descriptions-item>
          <el-descriptions-item label="保修期限">{{ selectedDevice.warranty }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Cpu } from '@element-plus/icons-vue'

// 设备状态统计
const stats = ref({
  total: 32,
  normal: 26,
  maintenance: 4,
  fault: 2
})

// 筛选条件
const filterType = ref('')
const filterStatus = ref('')

// 设备列表数据
const devices = ref([
  { id: 1, code: 'DEV001', name: '智能灌溉控制器-1号棚', type: 'irrigation', typeName: '灌溉设备', location: '1号棚', status: 'normal', runtime: 1250, lastMaintenance: '2026-05-15', purchaseDate: '2024-03-01', warranty: '2027-03-01' },
  { id: 2, code: 'DEV002', name: '智能灌溉控制器-2号棚', type: 'irrigation', typeName: '灌溉设备', location: '2号棚', status: 'normal', runtime: 1180, lastMaintenance: '2026-05-10', purchaseDate: '2024-03-01', warranty: '2027-03-01' },
  { id: 3, code: 'DEV003', name: '通风扇控制器-1号棚', type: 'ventilation', typeName: '通风设备', location: '1号棚', status: 'normal', runtime: 890, lastMaintenance: '2026-04-20', purchaseDate: '2024-03-01', warranty: '2027-03-01' },
  { id: 4, code: 'DEV004', name: '通风扇控制器-2号棚', type: 'ventilation', typeName: '通风设备', location: '2号棚', status: 'maintenance', runtime: 920, lastMaintenance: '2026-05-18', purchaseDate: '2024-03-01', warranty: '2027-03-01' },
  { id: 5, code: 'DEV005', name: '温室空调-1号棚', type: 'temperature', typeName: '温控设备', location: '1号棚', status: 'normal', runtime: 560, lastMaintenance: '2026-05-01', purchaseDate: '2024-06-01', warranty: '2027-06-01' },
  { id: 6, code: 'DEV006', name: '温室空调-2号棚', type: 'temperature', typeName: '温控设备', location: '2号棚', status: 'fault', runtime: 580, lastMaintenance: '2026-04-15', purchaseDate: '2024-06-01', warranty: '2027-06-01' },
  { id: 7, code: 'DEV007', name: '水肥一体机-1号棚', type: 'fertilization', typeName: '施肥设备', location: '1号棚', status: 'normal', runtime: 450, lastMaintenance: '2026-05-05', purchaseDate: '2024-08-01', warranty: '2027-08-01' },
  { id: 8, code: 'DEV008', name: '水肥一体机-2号棚', type: 'fertilization', typeName: '施肥设备', location: '2号棚', status: 'maintenance', runtime: 420, lastMaintenance: '2026-05-20', purchaseDate: '2024-08-01', warranty: '2027-08-01' },
])

// 维护记录
const maintenanceRecords = ref([
  { deviceName: '智能灌溉控制器-1号棚', maintenanceType: 'routine', maintainDate: '2026-05-15', maintainer: '张伟', result: 'success', remark: '清洗过滤器，更换密封圈' },
  { deviceName: '通风扇控制器-2号棚', maintenanceType: 'repair', maintainDate: '2026-05-18', maintainer: '李强', result: 'success', remark: '更换磨损轴承' },
  { deviceName: '温室空调-2号棚', maintenanceType: 'fault', maintainDate: '2026-05-20', maintainer: '王建', result: 'fail', remark: '压缩机故障，需更换' },
  { deviceName: '水肥一体机-2号棚', maintenanceType: 'routine', maintainDate: '2026-05-20', maintainer: '张伟', result: 'success', remark: '校准施肥比例' },
])

// 筛选后的设备列表
const filteredDevices = computed(() => {
  let result = devices.value
  if (filterType.value) {
    result = result.filter(d => d.type === filterType.value)
  }
  if (filterStatus.value) {
    result = result.filter(d => d.status === filterStatus.value)
  }
  return result
})

// 详情弹窗
const showDetail = ref(false)
const selectedDevice = ref(null)

const getStatusType = (status) => {
  const map = { normal: 'success', maintenance: 'warning', fault: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { normal: '正常运行', maintenance: '维护中', fault: '故障停机' }
  return map[status] || status
}

const getMaintenanceType = (type) => {
  const map = { routine: 'primary', repair: 'warning', fault: 'danger' }
  return map[type] || 'info'
}

const getMaintenanceTypeText = (type) => {
  const map = { routine: '例行维护', repair: '维修', fault: '故障处理' }
  return map[type] || type
}

const handleDetail = (row) => {
  selectedDevice.value = row
  showDetail.value = true
}

const handleMaintain = (row) => {
  console.log('开始维护:', row.id)
}

const handleFault = (row) => {
  console.log('标记故障:', row.id)
}
</script>
