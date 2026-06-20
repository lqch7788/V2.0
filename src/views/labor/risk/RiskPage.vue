<!--
  劳动风险预警页面（V1.1 风格）
  对标 V1.1 src/components/labor/risk/RiskPage.tsx
  功能：4 stat 卡片 + 等级分布 + 预警列表 + 完整 mock 数据
-->
<template>
  <div class="space-y-4">
    <!-- 4 stat 卡片 -->
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-2 text-blue-700">
          <el-icon :size="20"><Bell /></el-icon>
          <span class="text-sm">今日预警</span>
        </div>
        <p class="text-3xl font-bold text-blue-700 mt-3">{{ stats.today }}</p>
      </div>
      <div class="bg-purple-50 border border-purple-100 rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-2 text-purple-700">
          <el-icon :size="20"><Clock /></el-icon>
          <span class="text-sm">本周预警</span>
        </div>
        <p class="text-3xl font-bold text-purple-700 mt-3">{{ stats.week }}</p>
      </div>
      <div class="bg-amber-50 border border-amber-100 rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-2 text-amber-700">
          <el-icon :size="20"><WarningFilled /></el-icon>
          <span class="text-sm">待处理预警</span>
        </div>
        <p class="text-3xl font-bold text-amber-700 mt-3">{{ stats.pending }}</p>
      </div>
      <div class="bg-emerald-50 border border-emerald-100 rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-2 text-emerald-700">
          <el-icon :size="20"><Check /></el-icon>
          <span class="text-sm">已处理预警</span>
        </div>
        <p class="text-3xl font-bold text-emerald-700 mt-3">{{ stats.resolved }}</p>
      </div>
    </div>

    <!-- 等级分布 -->
    <div class="bg-white rounded-xl shadow-sm p-6">
      <h3 class="text-base font-semibold mb-4">预警等级分布（待处理）</h3>
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div class="text-xs text-amber-700 flex items-center gap-1">
            <el-icon><Warning /></el-icon>
            一般提醒
          </div>
          <p class="text-2xl font-bold text-amber-600 mt-2">{{ levelDist.low }}</p>
        </div>
        <div class="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div class="text-xs text-orange-700 flex items-center gap-1">
            <el-icon><WarningFilled /></el-icon>
            需要注意
          </div>
          <p class="text-2xl font-bold text-orange-600 mt-2">{{ levelDist.medium }}</p>
        </div>
        <div class="bg-rose-50 border border-rose-200 rounded-lg p-3">
          <div class="text-xs text-rose-700 flex items-center gap-1">
            <el-icon><CircleCloseFilled /></el-icon>
            紧急处理
          </div>
          <p class="text-2xl font-bold text-rose-600 mt-2">{{ levelDist.high }}</p>
        </div>
      </div>
    </div>

    <!-- 预警列表 -->
    <div class="bg-white rounded-xl shadow-sm p-4">
      <h3 class="text-base font-semibold mb-4">预警列表</h3>
      <div class="flex items-center gap-3 mb-4 flex-wrap">
        <el-input v-model="keyword" placeholder="搜索预警标题、内容、人员" clearable class="!w-80">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="typeFilter" placeholder="全部类型" clearable class="!w-32">
          <el-option label="加班超时" value="加班超时" />
          <el-option label="高温作业" value="高温作业" />
          <el-option label="排班空缺" value="排班空缺" />
          <el-option label="合同到期" value="合同到期" />
          <el-option label="证件过期" value="证件过期" />
          <el-option label="频繁离职" value="频繁离职" />
        </el-select>
        <el-select v-model="levelFilter" placeholder="全部等级" clearable class="!w-32">
          <el-option label="一般提醒" value="low" />
          <el-option label="需要注意" value="medium" />
          <el-option label="紧急处理" value="high" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="全部状态" clearable class="!w-32">
          <el-option label="待处理" value="pending" />
          <el-option label="已处理" value="resolved" />
          <el-option label="已忽略" value="ignored" />
        </el-select>
        <el-button @click="handleReset">
          <el-icon><RefreshLeft /></el-icon>重置
        </el-button>
      </div>

      <div class="border-t pt-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-semibold">预警列表</h4>
          <div class="flex items-center gap-2">
            <el-button type="primary" link size="small">编辑</el-button>
            <el-button type="danger" link size="small">删除</el-button>
            <el-button type="primary" link size="small">导出</el-button>
          </div>
        </div>
        <el-table :data="filteredAlerts" border>
          <el-table-column prop="code" label="预警编号" width="140">
            <template #default="{ row }"><span class="font-mono">{{ row.code }}</span></template>
          </el-table-column>
          <el-table-column label="预警等级" width="100">
            <template #default="{ row }">
              <el-tag :type="levelTagType(row.level)" size="small">
                <el-icon :size="12" class="mr-1"><Warning /></el-icon>
                {{ levelText(row.level) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="预警类型" min-width="100" />
          <el-table-column prop="title" label="预警标题" min-width="200">
            <template #default="{ row }">
              <div class="font-medium">{{ row.title }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ row.description }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="department" label="部门/人员" min-width="100" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)" size="small">
                <el-icon :size="12" class="mr-1"><Clock /></el-icon>
                {{ statusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" min-width="160" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
              <el-button link type="danger" size="small" @click="handleIgnore(row)">忽略</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  Bell, Check, CircleCloseFilled, Clock, RefreshLeft, Search, Warning, WarningFilled,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const keyword = ref('')
const typeFilter = ref('')
const levelFilter = ref('')
const statusFilter = ref('')

// V1.1 真实 mock 数据（参考用户截图）
const alerts = ref([
  { code: '20260620001', level: 'low', type: '超时加班', title: '单日加班超时预警', description: '员工张伟今日加班时长达到10.5小时，超过规定上限10小时，请注意休息', department: '生产部/张伟', status: 'pending', createTime: '2026-04-04 08:30:00' },
  { code: '20260620002', level: 'medium', type: '高温作业', title: '高温作业预警', description: '温室A区当前温度36.5°C，超过35°C高温警戒线，建议减少作业时长', department: '温室A区', status: 'pending', createTime: '2026-04-04 13:00:00' },
  { code: '20260620003', level: 'high', type: '排班空缺', title: '排班空缺告警', description: '4月5日夜间班组无人排班，影响正常生产作业，请尽快安排人员', department: '包装车间', status: 'pending', createTime: '2026-04-04 14:20:00' },
  { code: '20260620004', level: 'low', type: '合同到期', title: '劳动合同即将到期', description: '员工李娜劳动合同将于2026-05-01到期，请提前30天处理续签事宜', department: '质检部/李娜', status: 'pending', createTime: '2026-04-03 09:00:00' },
  { code: '20260620005', level: 'medium', type: '证件过期', title: '健康证即将到期', description: '员工王强健康证将于2026-04-10到期，请督促完成体检续期', department: '生产部/王强', status: 'pending', createTime: '2026-04-02 10:00:00' },
  { code: '20260620006', level: 'high', type: '频繁离职', title: '月离职率过高预警', description: '本月累计离职15人，离职率达到12.5%，超过10%警戒线，请关注人员稳定', department: '全厂', status: 'pending', createTime: '2026-04-04 08:00:00' },
  { code: '20260620007', level: 'medium', type: '连续加班', title: '连续加班预警', description: '员工李华已连续加班7天，超过5天警戒线，请合理安排休息', department: '生产部/李华', status: 'resolved', createTime: '2026-04-01 09:00:00' },
  { code: '20260620008', level: 'low', type: '考勤异常', title: '考勤异常提醒', description: '员工王芳本月迟到3次，请关注并提醒', department: '后勤部/王芳', status: 'resolved', createTime: '2026-03-30 10:00:00' },
])

const stats = computed(() => ({
  today: alerts.value.filter((a) => a.status === 'pending' && a.createTime.startsWith('2026-04-04')).length,
  week: alerts.value.filter((a) => a.status === 'pending').length,
  pending: alerts.value.filter((a) => a.status === 'pending').length,
  resolved: alerts.value.filter((a) => a.status === 'resolved').length,
}))

const levelDist = computed(() => {
  const pending = alerts.value.filter((a) => a.status === 'pending')
  return {
    low: pending.filter((a) => a.level === 'low').length,
    medium: pending.filter((a) => a.level === 'medium').length,
    high: pending.filter((a) => a.level === 'high').length,
  }
})

const filteredAlerts = computed(() => {
  return alerts.value.filter((a) => {
    if (keyword.value && !a.title.includes(keyword.value) && !a.description.includes(keyword.value)) return false
    if (typeFilter.value && a.type !== typeFilter.value) return false
    if (levelFilter.value && a.level !== levelFilter.value) return false
    if (statusFilter.value && a.status !== statusFilter.value) return false
    return true
  })
})

const LEVEL_MAP = {
  low: { tag: 'warning', text: '一般提醒' },
  medium: { tag: 'danger', text: '需要注意' },
  high: { tag: 'danger', text: '紧急处理' },
}
const levelTagType = (l) => LEVEL_MAP[l]?.tag || ''
const levelText = (l) => LEVEL_MAP[l]?.text || l

const STATUS_MAP = {
  pending: { tag: 'warning', text: '待处理' },
  resolved: { tag: 'success', text: '已处理' },
  ignored: { tag: 'info', text: '已忽略' },
}
const statusTagType = (s) => STATUS_MAP[s]?.tag || ''
const statusText = (s) => STATUS_MAP[s]?.text || s

const handleReset = () => { keyword.value = ''; typeFilter.value = ''; levelFilter.value = ''; statusFilter.value = '' }
const handleView = () => ElMessage.info('查看预警详情')
const handleIgnore = () => ElMessage.success('已忽略')
const handleDelete = () => ElMessage.warning('已删除')
</script>