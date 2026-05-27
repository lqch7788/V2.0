<template>
  <div class="space-y-6 p-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="20" color="white"><UserFilled /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">人工管理</h1>
          <p class="text-xs text-gray-500">考勤、人事、薪酬、运营分析综合管理</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 今日在岗 -->
      <div class="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
           @click="$router.push('/worker-attendance')">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <el-icon :size="20" color="#2563eb"><User /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ todayOnDuty }}</p>
            <p class="text-xs text-gray-500">今日在岗</p>
          </div>
        </div>
      </div>

      <!-- 请假人数 -->
      <div class="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
           @click="$router.push('/labor/attendance')">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <el-icon :size="20" color="#d97706"><Calendar /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ todayLeaveCount }}</p>
            <p class="text-xs text-gray-500">今日请假</p>
          </div>
        </div>
      </div>

      <!-- 缺勤人数 -->
      <div class="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
           @click="$router.push('/worker-attendance')">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <el-icon :size="20" color="#dc2626"><CircleClose /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ todayAbsentCount }}</p>
            <p class="text-xs text-gray-500">今日缺勤</p>
          </div>
        </div>
      </div>

      <!-- 员工总数 -->
      <div class="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
           @click="$router.push('/labor/personnel')">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <el-icon :size="20" color="#059669"><Avatar /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ totalWorkers }}</p>
            <p class="text-xs text-gray-500">员工总数</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h3 class="text-base font-semibold text-gray-800 mb-4">快捷入口</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="item in quickLinks" :key="item.path"
             class="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer"
             @click="$router.push(item.path)">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center"
               :class="item.bgClass">
            <el-icon :size="22" :color="item.iconColor"><component :is="item.icon" /></el-icon>
          </div>
          <span class="text-sm font-medium text-gray-700">{{ item.label }}</span>
          <span class="text-xs text-gray-400">{{ item.desc }}</span>
        </div>
      </div>
    </div>

    <!-- 最近操作-->
    <div class="bg-white rounded-xl p-6 shadow-sm" v-if="recentRecords.length > 0">
      <h3 class="text-base font-semibold text-gray-800 mb-4">最近考勤记录</h3>
      <el-table :data="recentRecords" size="small" stripe>
        <el-table-column prop="workerName" label="姓名" width="100" />
        <el-table-column prop="department" label="部门" width="100" />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="checkInTime" label="签到" width="100" />
        <el-table-column prop="checkOutTime" label="签退" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  UserFilled, User, Calendar, CircleClose, Avatar,
  Clock, Money, TrendCharts, Document
} from '@element-plus/icons-vue'
import { useLaborStore } from '@/stores/modules/labor'

const laborStore = useLaborStore()

// 快捷入口配置
const quickLinks = [
  { path: '/worker-attendance', label: '工人考勤', desc: '打卡记录查看', icon: Clock, iconColor: '#2563eb', bgClass: 'bg-blue-50' },
  { path: '/labor/attendance', label: '考勤管理', desc: '请假与加班', icon: Calendar, iconColor: '#d97706', bgClass: 'bg-amber-50' },
  { path: '/labor/personnel', label: '人事管理', desc: '员工与合同', icon: User, iconColor: '#059669', bgClass: 'bg-emerald-50' },
  { path: '/salary', label: '工资管理', desc: '薪酬计算发放', icon: Money, iconColor: '#7c3aed', bgClass: 'bg-purple-50' },
  { path: '/labor/compensation', label: '薪酬管理', desc: '工资与预算', icon: Money, iconColor: '#dc2626', bgClass: 'bg-red-50' },
  { path: '/labor/analytics', label: '运营分析', desc: '人效与绩效', icon: TrendCharts, iconColor: '#0891b2', bgClass: 'bg-cyan-50' },
  { path: '/personnel/staff', label: '员工档案', desc: '档案与技能', icon: Document, iconColor: '#4f46e5', bgClass: 'bg-indigo-50' },
  { path: '/salary-budget', label: '工资预算', desc: '预算与成本', icon: TrendCharts, iconColor: '#ea580c', bgClass: 'bg-orange-50' }
]

// 统计数据
const todayStr = new Date().toISOString().split('T')[0]

const todayOnDuty = computed(() => {
  const todayRecords = laborStore.attendanceList.filter(r => r.date === todayStr)
  return todayRecords.filter(r => r.checkInTime).length
})

const todayLeaveCount = computed(() => {
  const todayRecords = laborStore.leaveList.filter(r => {
    if (!r.startDate || !r.endDate) return false
    return todayStr >= r.startDate && todayStr <= r.endDate
  })
  return todayRecords.filter(r => r.status === '已通过' || r.status === 'approved').length
})

const todayAbsentCount = computed(() => {
  const todayRecords = laborStore.attendanceList.filter(r => r.date === todayStr)
  return todayRecords.filter(r => !r.checkInTime && r.status !== 'leave').length
})

const totalWorkers = computed(() => laborStore.workerTotal)

// 最近考勤记录（最新10条）
const recentRecords = computed(() => {
  return laborStore.attendanceList.slice(0, 10).map(r => ({
    workerName: r.name || r.workerName || r.worker_name || '',
    department: r.dept || r.department || '',
    date: r.date || '',
    checkInTime: r.checkInTime || r.check_in || '',
    checkOutTime: r.checkOutTime || r.check_out || '',
    status: r.status || r.status_class || 'normal'
  }))
})

const statusLabelMap = {
  normal: '正常', late: '迟到', early: '早退', leave: '请假', absent: '缺勤'
}
const statusTypeMap = {
  normal: 'success', late: 'warning', early: 'warning', leave: 'info', absent: 'danger'
}
const getStatusLabel = (s) => statusLabelMap[s] || s
const getStatusType = (s) => statusTypeMap[s] || 'info'

// 加载数据
onMounted(async () => {
  try {
    await Promise.all([
      laborStore.fetchAttendance({ pageSize: 50 }),
      laborStore.fetchLeaveList({ pageSize: 50 }),
      laborStore.fetchWorkers({ pageSize: 1 })
    ])
  } catch (e) {
    console.error('加载人工管理首页数据失败:', e)
  }
})
</script>
