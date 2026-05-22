<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><Bell /></el-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">告警信息</h1>
          <p class="text-xs text-gray-500">系统告警与提醒</p>
        </div>
      </div>
    </div>

    <!-- 告警统计概览 -->
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-red-600 font-medium">环境告警</p>
            <p class="text-2xl font-bold text-red-700 mt-1">{{ stats.environment }}</p>
          </div>
          <el-icon :size="36" color="#ef4444"><WarningFilled /></el-icon>
        </div>
      </div>
      <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-orange-600 font-medium">设备故障</p>
            <p class="text-2xl font-bold text-orange-700 mt-1">{{ stats.equipment }}</p>
          </div>
          <el-icon :size="36" color="#f97316"><Cpu /></el-icon>
        </div>
      </div>
      <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-yellow-600 font-medium">病虫害告警</p>
            <p class="text-2xl font-bold text-yellow-700 mt-1">{{ stats.pest }}</p>
          </div>
          <el-icon :size="36" color="#eab308"><View /></el-icon>
        </div>
      </div>
      <div class="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-emerald-600 font-medium">农事告警</p>
            <p class="text-2xl font-bold text-emerald-700 mt-1">{{ stats.farming }}</p>
          </div>
          <el-icon :size="36" color="#22c55e"><Grape /></el-icon>
        </div>
      </div>
    </div>

    <!-- 告警列表 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-semibold text-gray-800">告警记录</h3>
        <div class="flex items-center gap-2">
          <el-select v-model="filterType" placeholder="告警类型" size="small" style="width: 120px">
            <el-option label="全部类型" value="" />
            <el-option label="环境告警" value="environment" />
            <el-option label="设备故障" value="equipment" />
            <el-option label="病虫害告警" value="pest" />
            <el-option label="农事告警" value="farming" />
          </el-select>
          <el-select v-model="filterLevel" placeholder="告警级别" size="small" style="width: 120px">
            <el-option label="全部级别" value="" />
            <el-option label="紧急" value="urgent" />
            <el-option label="重要" value="high" />
            <el-option label="一般" value="medium" />
            <el-option label="提示" value="low" />
          </el-select>
          <el-select v-model="filterStatus" placeholder="处理状态" size="small" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="未处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已处理" value="resolved" />
          </el-select>
        </div>
      </div>

      <el-table :data="filteredAlerts" stripe style="width: 100%">
        <el-table-column prop="alertTime" label="告警时间" width="160" />
        <el-table-column prop="type" label="告警类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="级别" width="80">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.level)" size="small">
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="告警标题" min-width="200" />
        <el-table-column prop="location" label="位置" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button v-if="row.status === 'pending'" type="warning" link size="small" @click="handleProcess(row)">处理</el-button>
            <el-button v-if="row.status === 'processing'" type="success" link size="small" @click="handleResolve(row)">确认</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
        />
      </div>
    </div>

    <!-- 告警详情弹窗 -->
    <el-dialog v-model="showDetail" title="告警详情" width="600px">
      <div v-if="selectedAlert">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="告警时间">{{ selectedAlert.alertTime }}</el-descriptions-item>
          <el-descriptions-item label="告警类型">
            <el-tag :type="getTypeTagType(selectedAlert.type)" size="small">
              {{ getTypeText(selectedAlert.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="告警级别">
            <el-tag :type="getLevelTagType(selectedAlert.level)" size="small">
              {{ getLevelText(selectedAlert.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理状态">
            <el-tag :type="getStatusTagType(selectedAlert.status)" size="small">
              {{ getStatusText(selectedAlert.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="位置" :span="2">{{ selectedAlert.location }}</el-descriptions-item>
          <el-descriptions-item label="告警标题" :span="2">{{ selectedAlert.title }}</el-descriptions-item>
          <el-descriptions-item label="告警描述" :span="2">{{ selectedAlert.description }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="selectedAlert.status !== 'pending'" class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 class="text-sm font-medium text-gray-700 mb-2">处理记录</h4>
          <div class="space-y-2">
            <div v-for="(record, index) in selectedAlert.records" :key="index" class="text-sm">
              <span class="text-gray-500">[{{ record.time }}]</span>
              <span class="text-gray-700">{{ record.operator }}: {{ record.action }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer v-if="selectedAlert && selectedAlert.status !== 'resolved'">
        <el-button @click="showDetail = false">关闭</el-button>
        <el-button v-if="selectedAlert.status === 'pending'" type="warning" @click="handleProcess(selectedAlert); showDetail = false">
          开始处理
        </el-button>
        <el-button v-if="selectedAlert.status === 'processing'" type="success" @click="handleResolve(selectedAlert); showDetail = false">
          确认解决
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Bell, WarningFilled, Cpu, View, Grape } from '@element-plus/icons-vue'

// 告警统计数据
const stats = ref({
  environment: 3,
  equipment: 2,
  pest: 1,
  farming: 1
})

// 筛选条件
const filterType = ref('')
const filterLevel = ref('')
const filterStatus = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 告警列表数据
const alerts = ref([
  {
    id: 1,
    alertTime: '2026-05-22 10:30:00',
    type: 'environment',
    typeName: '环境告警',
    level: 'high',
    levelName: '重要',
    title: '温度过高告警',
    description: '3号棚空气温度超过30°C，达到32.5°C，已触发高温告警阈值',
    location: '3号棚',
    status: 'pending',
    records: []
  },
  {
    id: 2,
    alertTime: '2026-05-22 09:15:00',
    type: 'equipment',
    typeName: '设备故障',
    level: 'urgent',
    levelName: '紧急',
    title: '空调设备故障',
    description: '2号棚空调设备故障停机，需要立即维修',
    location: '2号棚-空调1',
    status: 'processing',
    records: [
      { time: '2026-05-22 09:20:00', operator: '张三', action: '收到告警，开始处理' }
    ]
  },
  {
    id: 3,
    alertTime: '2026-05-22 08:00:00',
    type: 'environment',
    typeName: '环境告警',
    level: 'medium',
    levelName: '一般',
    title: '湿度偏低提醒',
    description: '4号棚空气湿度低于50%，当前值为45%',
    location: '4号棚',
    status: 'resolved',
    records: [
      { time: '2026-05-22 08:05:00', operator: '李四', action: '收到告警' },
      { time: '2026-05-22 08:30:00', operator: '李四', action: '启动灌溉系统增加湿度' },
      { time: '2026-05-22 09:00:00', operator: '李四', action: '湿度恢复正常，告警解除' }
    ]
  },
  {
    id: 4,
    alertTime: '2026-05-21 16:30:00',
    type: 'pest',
    typeName: '病虫害告警',
    level: 'high',
    levelName: '重要',
    title: '疑似病虫害发现',
    description: '1号棚发现疑似蚜虫病虫害，需要植保人员检查',
    location: '1号棚-A区',
    status: 'pending',
    records: []
  },
  {
    id: 5,
    alertTime: '2026-05-21 14:00:00',
    type: 'farming',
    typeName: '农事告警',
    level: 'low',
    levelName: '提示',
    title: '浇水计划提醒',
    description: '2号棚浇水计划将于明天执行，请相关人员做好准备',
    location: '2号棚',
    status: 'resolved',
    records: [
      { time: '2026-05-21 14:05:00', operator: '系统', action: '自动发送提醒' }
    ]
  },
  {
    id: 6,
    alertTime: '2026-05-21 10:20:00',
    type: 'equipment',
    typeName: '设备故障',
    level: 'medium',
    levelName: '一般',
    title: '灌溉控制器离线',
    description: '灌溉控制器2号棚设备离线，最后心跳时间异常',
    location: '2号棚',
    status: 'resolved',
    records: [
      { time: '2026-05-21 10:25:00', operator: '王五', action: '检查设备电源' },
      { time: '2026-05-21 10:45:00', operator: '王五', action: '重启设备恢复正常' }
    ]
  }
])

// 筛选后的告警列表
const filteredAlerts = computed(() => {
  let result = alerts.value
  if (filterType.value) {
    result = result.filter(a => a.type === filterType.value)
  }
  if (filterLevel.value) {
    result = result.filter(a => a.level === filterLevel.value)
  }
  if (filterStatus.value) {
    result = result.filter(a => a.status === filterStatus.value)
  }
  total.value = result.length
  return result
})

// 详情弹窗
const showDetail = ref(false)
const selectedAlert = ref(null)

const getTypeTagType = (type) => {
  const map = { environment: 'danger', equipment: 'warning', pest: 'warning', farming: 'success' }
  return map[type] || 'info'
}

const getTypeText = (type) => {
  const map = { environment: '环境告警', equipment: '设备故障', pest: '病虫害', farming: '农事告警' }
  return map[type] || type
}

const getLevelTagType = (level) => {
  const map = { urgent: 'danger', high: 'warning', medium: 'info', low: 'success' }
  return map[level] || 'info'
}

const getLevelText = (level) => {
  const map = { urgent: '紧急', high: '重要', medium: '一般', low: '提示' }
  return map[level] || level
}

const getStatusTagType = (status) => {
  const map = { pending: 'danger', processing: 'warning', resolved: 'success' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { pending: '未处理', processing: '处理中', resolved: '已处理' }
  return map[status] || status
}

const handleView = (row) => {
  selectedAlert.value = row
  showDetail.value = true
}

const handleProcess = (row) => {
  const alert = alerts.value.find(a => a.id === row.id)
  if (alert) {
    alert.status = 'processing'
    alert.records.push({
      time: new Date().toLocaleString(),
      operator: '当前用户',
      action: '开始处理告警'
    })
  }
}

const handleResolve = (row) => {
  const alert = alerts.value.find(a => a.id === row.id)
  if (alert) {
    alert.status = 'resolved'
    alert.records.push({
      time: new Date().toLocaleString(),
      operator: '当前用户',
      action: '确认问题已解决'
    })
  }
}
</script>
