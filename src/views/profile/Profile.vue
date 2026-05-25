<template>
  <div class="space-y-6">
    <!-- 访客欢迎横幅 -->
    <div v-if="isVisitor" class="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
      <div class="flex items-center gap-4">
        <div class="p-3 bg-white/20 rounded-xl">
          <el-icon :size="32" color="white"><Star /></el-icon>
        </div>
        <div>
          <h2 class="text-xl font-bold">欢迎体验弘讯智能种植云系统</h2>
          <p class="text-emerald-100 mt-1">您正在使用演示账号，可浏览系统核心功能。如需了解更多，请联系我们。</p>
        </div>
      </div>
    </div>

    <!-- 页面头部 + 身份切换器 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white"><User /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">个人中心</h1>
            <p class="text-gray-500">
              {{ permission.profileAccess === 'locked' ? '演示模式 · 仅供浏览' : '管理您的账户信息和查看工作概览' }}
            </p>
          </div>
        </div>

        <!-- 身份切换器（演示用） -->
        <div class="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm">
          <el-icon :size="20" color="#059669"><View /></el-icon>
          <span class="text-sm text-gray-600">身份切换：</span>
          <select
            v-model="selectedRole"
            class="text-sm font-medium text-emerald-700 bg-transparent border-none focus:outline-none cursor-pointer min-w-[120px]"
          >
            <option v-for="opt in roleOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <div class="flex items-center gap-2 pl-3 border-l border-emerald-200">
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold', avatarColor]">
              {{ user.avatar }}
            </div>
            <div class="hidden sm:block">
              <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
              <p class="text-xs text-gray-500">{{ user.position }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 角色权限提示标签 -->
    <div class="flex items-center gap-2 flex-wrap">
      <span :class="['px-3 py-1 rounded-full text-xs font-medium', roleBadgeColor]">
        {{ permission.title }}
      </span>
      <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
        数据范围：{{ dataScopeLabel }}
      </span>
      <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
        权限等级：L{{ permission.level }}
      </span>
    </div>

    <!-- 第一行：基本信息 + 账户安全 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 基本信息卡片 -->
      <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 class="font-semibold text-gray-900">基本信息</h2>
          <button v-if="permission.profileAccess === 'full'" class="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 transition-colors">
            <el-icon :size="16"><Edit /></el-icon>
            编辑
          </button>
        </div>
        <div class="p-6">
          <div class="flex items-start gap-6">
            <!-- 头像 -->
            <div class="relative">
              <div :class="['w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold', avatarColor]">
                {{ user.avatar }}
              </div>
              <button
                v-if="permission.profileAccess === 'full'"
                class="absolute -bottom-1 -right-1 p-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
              >
                <el-icon :size="14" color="#6b7280"><Edit /></el-icon>
              </button>
            </div>

            <!-- 用户信息 -->
            <div class="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label class="text-xs text-gray-500">姓名</label>
                <p class="font-medium text-gray-900">{{ user.name }}</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">工号</label>
                <p class="font-medium text-gray-900">{{ user.id }}</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">所属部门</label>
                <p class="font-medium text-gray-900">{{ user.department }}</p>
              </div>
              <div>
                <label class="text-xs text-gray-500">职位</label>
                <p class="font-medium text-gray-900">{{ user.position }}</p>
              </div>
              <template v-if="permission.profileAccess !== 'locked' && permission.profileAccess !== 'minimal'">
                <div>
                  <label class="text-xs text-gray-500">联系电话</label>
                  <p class="font-medium text-gray-900">138-xxxx-xxxx</p>
                </div>
                <div>
                  <label class="text-xs text-gray-500">电子邮箱</label>
                  <p class="font-medium text-gray-900">{{ user.name.toLowerCase() }}@company.com</p>
                </div>
              </template>
              <template v-if="permission.profileAccess === 'minimal'">
                <div>
                  <label class="text-xs text-gray-500">入职日期</label>
                  <p class="font-medium text-gray-900">2024-01-15</p>
                </div>
                <div>
                  <label class="text-xs text-gray-500">考勤状态</label>
                  <p class="font-medium text-emerald-600">正常</p>
                </div>
              </template>
              <template v-if="permission.profileAccess === 'locked'">
                <div>
                  <label class="text-xs text-gray-500">公司</label>
                  <p class="font-medium text-gray-900">宁波帮帮忙公司</p>
                </div>
                <div>
                  <label class="text-xs text-gray-500">角色</label>
                  <p class="font-medium text-emerald-600">演示访客</p>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 账户安全卡片 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100">
          <h2 class="font-semibold text-gray-900">账户安全</h2>
        </div>
        <div class="p-6">
          <!-- 无权限 -->
          <div v-if="permission.securityAccess === 'none'" class="text-center py-8">
            <div class="p-4 bg-gray-50 rounded-xl inline-block mb-4">
              <el-icon :size="32" color="#9ca3af"><Hide /></el-icon>
            </div>
            <p class="text-sm text-gray-500">演示账号不支持安全设置</p>
            <p class="text-xs text-gray-400 mt-1">如有需要请联系我们开通正式账号</p>
          </div>

          <!-- 有权限 -->
          <div v-else class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-white rounded-lg shadow-sm">
                  <el-icon :size="20" color="#4b5563"><Key /></el-icon>
                </div>
                <div>
                  <p class="font-medium text-gray-900">登录密码</p>
                  <p class="text-xs text-gray-500">上次修改：30天前</p>
                </div>
              </div>
              <el-icon :size="20" color="#9ca3af"><ArrowRight /></el-icon>
            </div>

            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-white rounded-lg shadow-sm">
                  <el-icon :size="20" color="#4b5563"><Phone /></el-icon>
                </div>
                <div>
                  <p class="font-medium text-gray-900">手机绑定</p>
                  <p class="text-xs text-gray-500">138-xxxx-xxxx</p>
                </div>
              </div>
              <span class="px-2 py-1 bg-emerald-100 text-emerald-600 text-xs rounded-full">已绑定</span>
            </div>

            <template v-if="permission.securityAccess === 'full'">
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-white rounded-lg shadow-sm">
                    <el-icon :size="20" color="#4b5563"><Lock /></el-icon>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">双重验证</p>
                    <p class="text-xs text-gray-500">增强账户安全</p>
                  </div>
                </div>
                <span class="px-2 py-1 bg-emerald-100 text-emerald-600 text-xs rounded-full">已开启</span>
              </div>

              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-white rounded-lg shadow-sm">
                    <el-icon :size="20" color="#4b5563"><Document /></el-icon>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">安全日志</p>
                    <p class="text-xs text-gray-500">查看登录历史</p>
                  </div>
                </div>
                <el-icon :size="20" color="#9ca3af"><ArrowRight /></el-icon>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 第二行：角色专属统计卡片 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="font-semibold text-gray-900">{{ permission.title }} - 工作概览</h2>
        <router-link
          :to="permission.quickActions[0]?.path || '/'"
          class="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
        >
          查看详情 <el-icon :size="16"><ArrowRight /></el-icon>
        </router-link>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          v-for="(stat, index) in permission.stats"
          :key="index"
          class="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div class="flex items-center justify-between mb-3">
            <div :class="['p-2 rounded-lg', stat.color]">
              <el-icon :size="20" color="white"><component :is="stat.icon" /></el-icon>
            </div>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
          <p class="text-sm text-gray-500 mt-1">{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <!-- 第三行：快捷操作入口 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 class="font-semibold text-gray-900 mb-6">快捷操作</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <router-link
          v-for="(action, index) in permission.quickActions"
          :key="index"
          :to="action.path"
          class="p-4 border border-gray-100 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group"
        >
          <div class="p-3 bg-gray-50 rounded-xl w-fit group-hover:bg-emerald-100 transition-colors">
            <el-icon :size="24" color="#4b5563" class="group-hover:text-emerald-600"><component :is="action.icon" /></el-icon>
          </div>
          <h3 class="font-medium text-gray-900 mt-3">{{ action.label }}</h3>
          <p class="text-xs text-gray-500 mt-1">{{ action.desc }}</p>
        </router-link>
      </div>
    </div>

    <!-- 第四行：通知与消息 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <template v-if="notifications.length > 0">
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-semibold text-gray-900">通知与消息</h2>
          <router-link
            to="/messages"
            class="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            查看全部 <el-icon :size="16"><ArrowRight /></el-icon>
          </router-link>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <router-link
            v-for="(item, index) in notifications"
            :key="index"
            to="/messages"
            :class="['p-4 rounded-xl hover:opacity-80 transition-opacity', item.bg]"
          >
            <div class="flex items-center justify-between mb-2">
              <el-icon :size="20" :color="item.iconColor"><component :is="item.icon" /></el-icon>
              <span class="text-2xl font-bold text-gray-900">{{ item.count }}</span>
            </div>
            <p class="text-sm text-gray-700">{{ item.label }}</p>
          </router-link>
        </div>
      </template>
      <template v-else>
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-semibold text-gray-900">通知与消息</h2>
        </div>
        <div class="text-center py-8">
          <div class="p-4 bg-gray-50 rounded-xl inline-block mb-4">
            <el-icon :size="32" color="#9ca3af"><Hide /></el-icon>
          </div>
          <p class="text-sm text-gray-500">演示账号无权查看通知</p>
          <p class="text-xs text-gray-400 mt-1">如有需要请联系我们开通正式账号</p>
        </div>
      </template>
    </div>

    <!-- 访客专属底部提示 -->
    <div v-if="isVisitor" class="bg-amber-50 border border-amber-200 rounded-xl p-6">
      <div class="flex items-start gap-4">
        <div class="p-3 bg-amber-100 rounded-xl">
          <el-icon :size="24" color="#d97706"><ChatLineSquare /></el-icon>
        </div>
        <div>
          <h3 class="font-semibold text-amber-800">演示说明</h3>
          <p class="text-sm text-amber-700 mt-1">
            此为系统演示账号，您可以浏览智慧种植管理系统的核心功能模块。
            部分操作类功能已限制，如需体验完整功能或了解更多产品信息，请联系我们的工作人员。
          </p>
          <div class="flex gap-3 mt-4">
            <el-button type="primary">
              <el-icon :size="16"><TopRight /></el-icon>
              联系我们
            </el-button>
            <el-button>功能咨询</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  User, Star, View, Edit, Hide, Key, Phone, Lock,
  Document, ArrowRight, ChatLineSquare, TopRight
} from '@element-plus/icons-vue'

// ============================================================
// 角色用户映射
// ============================================================
const roleUsers = {
  admin: { id: 'U001', name: '张建国', avatar: 'ZGJ', role: 'admin', department: '技术部', position: '系统管理员' },
  manager: { id: 'U002', name: '李明辉', avatar: 'LMH', role: 'manager', department: '生产部', position: '基地经理' },
  supervisor: { id: 'U003', name: '王建国', avatar: 'WJG', role: 'supervisor', department: '生产部', position: '生产主管' },
  technician: { id: 'U004', name: '赵文静', avatar: 'ZWJ', role: 'technician', department: '技术部', position: '农技员' },
  worker: { id: 'U006', name: '陈小芳', avatar: 'CXF', role: 'worker', department: '生产部', position: '种植工' },
  visitor: { id: 'V001', name: '访客用户', avatar: 'FK', role: 'visitor', department: '演示部', position: '演示员' },
}

// ============================================================
// 角色权限配置
// ============================================================
const rolePermissions = {
  admin: {
    level: 1, title: '系统管理员', dataScope: 'all', profileAccess: 'full', securityAccess: 'full',
    stats: [
      { label: '系统用户', value: '28', icon: User, color: 'bg-blue-500' },
      { label: '在线用户', value: '12', icon: Star, color: 'bg-emerald-500' },
      { label: '操作日志', value: '1,256', icon: Document, color: 'bg-purple-500' },
      { label: '数据备份', value: '99.9%', icon: Star, color: 'bg-cyan-500' },
    ],
    quickActions: [
      { label: '园区导览', icon: Star, path: '/park-archive', desc: '查看园区分布' },
      { label: '基地总览', icon: Star, path: '/dashboard', desc: '查看基地概览' },
      { label: '用户管理', icon: User, path: '/settings/personnel', desc: '管理系统用户' },
      { label: '系统设置', icon: Edit, path: '/settings', desc: '系统配置管理' },
    ]
  },
  manager: {
    level: 2, title: '公司高管', dataScope: 'all', profileAccess: 'partial', securityAccess: 'partial',
    stats: [
      { label: '基地总数', value: '10', icon: Star, color: 'bg-blue-500' },
      { label: '种植批次', value: '12', icon: Star, color: 'bg-emerald-500' },
      { label: '待处理任务', value: '8', icon: Document, color: 'bg-amber-500' },
      { label: '本月完成', value: '156', icon: Star, color: 'bg-purple-500' },
    ],
    quickActions: [
      { label: '园区导览', icon: Star, path: '/park-archive', desc: '查看园区分布' },
      { label: '基地总览', icon: Star, path: '/dashboard', desc: '查看基地概览' },
      { label: '任务派发', icon: Document, path: '/farm-hub', desc: '分配农事任务' },
      { label: '审批中心', icon: Document, path: '/pending-approval', desc: '处理审批事项' },
    ]
  },
  supervisor: {
    level: 3, title: '部门经理', dataScope: 'dept', profileAccess: 'partial', securityAccess: 'partial',
    stats: [
      { label: '本部门员工', value: '8', icon: User, color: 'bg-blue-500' },
      { label: '待处理任务', value: '12', icon: Document, color: 'bg-amber-500' },
      { label: '进行中任务', value: '15', icon: Star, color: 'bg-emerald-500' },
      { label: '考勤异常', value: '3', icon: Star, color: 'bg-red-500' },
    ],
    quickActions: [
      { label: '园区导览', icon: Star, path: '/park-archive', desc: '查看园区分布' },
      { label: '基地总览', icon: Star, path: '/dashboard', desc: '本基地概览' },
      { label: '任务派发', icon: Document, path: '/farm-hub', desc: '本部门任务分配' },
      { label: '考勤审核', icon: Document, path: '/settings/personnel/attendance', desc: '审核员工考勤' },
    ]
  },
  technician: {
    level: 4, title: '技术员', dataScope: 'module', profileAccess: 'partial', securityAccess: 'partial',
    stats: [
      { label: '待执行任务', value: '5', icon: Document, color: 'bg-amber-500' },
      { label: '农事记录', value: '32', icon: Star, color: 'bg-emerald-500' },
      { label: '环境预警', value: '2', icon: Star, color: 'bg-red-500' },
      { label: '负责区域', value: '3', icon: Star, color: 'bg-blue-500' },
    ],
    quickActions: [
      { label: '农事记录', icon: Star, path: '/agriculture-record', desc: '记录农事作业' },
      { label: '环境监测', icon: Star, path: '/environment-monitor', desc: '查看环境数据' },
      { label: '任务反馈', icon: Star, path: '/tasks', desc: '反馈任务进度' },
      { label: '巡田记录', icon: Star, path: '/inspection', desc: '记录巡田情况' },
    ]
  },
  worker: {
    level: 5, title: '普通员工', dataScope: 'self', profileAccess: 'minimal', securityAccess: 'partial',
    stats: [
      { label: '我的任务', value: '3', icon: Document, color: 'bg-amber-500' },
      { label: '已打卡', value: '22', icon: Star, color: 'bg-emerald-500' },
      { label: '物料领用', value: '5', icon: Star, color: 'bg-blue-500' },
      { label: '完成率', value: '96%', icon: Star, color: 'bg-purple-500' },
    ],
    quickActions: [
      { label: '我的任务', icon: Document, path: '/tasks', desc: '查看我的任务' },
      { label: '考勤打卡', icon: Star, path: '/worker-attendance', desc: '上下班打卡' },
      { label: '物料领用', icon: Star, path: '/material-receiving', desc: '申请领用物资' },
      { label: '任务反馈', icon: Star, path: '/tasks', desc: '反馈任务状态' },
    ]
  },
  visitor: {
    level: 6, title: '访客', dataScope: 'public', profileAccess: 'locked', securityAccess: 'none',
    stats: [
      { label: '演示大棚', value: '10', icon: Star, color: 'bg-blue-500' },
      { label: '演示作物', value: '8', icon: Star, color: 'bg-emerald-500' },
      { label: '演示任务', value: '25', icon: Document, color: 'bg-amber-500' },
      { label: '数据节点', value: '156', icon: Star, color: 'bg-purple-500' },
    ],
    quickActions: [
      { label: '园区导览', icon: Star, path: '/park-archive', desc: '查看园区分布' },
      { label: '环境监测', icon: Star, path: '/environment-monitor', desc: '环境数据展示' },
      { label: '生产概览', icon: Star, path: '/production', desc: '生产进度总览' },
      { label: '溯源查询', icon: Star, path: '/crop/instance', desc: '农产品溯源' },
    ]
  }
}

// ============================================================
// 通知配置
// ============================================================
const notificationConfig = {
  admin: [
    { icon: Star, label: '系统通知', count: 5, iconColor: '#3b82f6', bg: 'bg-blue-50' },
    { icon: Document, label: '任务提醒', count: 12, iconColor: '#f59e0b', bg: 'bg-amber-50' },
    { icon: Star, label: '预警信息', count: 3, iconColor: '#ef4444', bg: 'bg-red-50' },
    { icon: Document, label: '审批动态', count: 8, iconColor: '#10b981', bg: 'bg-emerald-50' },
  ],
  manager: [
    { icon: Star, label: '系统通知', count: 3, iconColor: '#3b82f6', bg: 'bg-blue-50' },
    { icon: Document, label: '任务提醒', count: 8, iconColor: '#f59e0b', bg: 'bg-amber-50' },
    { icon: Star, label: '预警信息', count: 2, iconColor: '#ef4444', bg: 'bg-red-50' },
    { icon: Document, label: '待审批', count: 15, iconColor: '#10b981', bg: 'bg-emerald-50' },
  ],
  supervisor: [
    { icon: Document, label: '本部门任务', count: 12, iconColor: '#f59e0b', bg: 'bg-amber-50' },
    { icon: Star, label: '考勤异常', count: 3, iconColor: '#ef4444', bg: 'bg-red-50' },
    { icon: Star, label: '物资待审', count: 5, iconColor: '#3b82f6', bg: 'bg-blue-50' },
    { icon: Document, label: '本部门审批', count: 4, iconColor: '#10b981', bg: 'bg-emerald-50' },
  ],
  technician: [
    { icon: Document, label: '待执行任务', count: 5, iconColor: '#f59e0b', bg: 'bg-amber-50' },
    { icon: Star, label: '环境预警', count: 2, iconColor: '#ef4444', bg: 'bg-red-50' },
    { icon: Document, label: '技术方案', count: 3, iconColor: '#3b82f6', bg: 'bg-blue-50' },
    { icon: Star, label: '农事提醒', count: 4, iconColor: '#10b981', bg: 'bg-emerald-50' },
  ],
  worker: [
    { icon: Document, label: '我的任务', count: 3, iconColor: '#f59e0b', bg: 'bg-amber-50' },
    { icon: Star, label: '考勤提醒', count: 1, iconColor: '#3b82f6', bg: 'bg-blue-50' },
    { icon: Star, label: '领用结果', count: 2, iconColor: '#10b981', bg: 'bg-emerald-50' },
  ],
  visitor: []
}

// 角色选项
const roleOptions = [
  { value: 'admin', label: '系统管理员' },
  { value: 'manager', label: '公司高管' },
  { value: 'supervisor', label: '部门经理' },
  { value: 'technician', label: '技术员' },
  { value: 'worker', label: '普通员工' },
  { value: 'visitor', label: '访客' },
]

// ============================================================
// 响应式状态
// ============================================================
const selectedRole = ref('visitor')

const user = computed(() => roleUsers[selectedRole.value] || roleUsers.visitor)
const permission = computed(() => rolePermissions[selectedRole.value] || rolePermissions.visitor)
const notifications = computed(() => notificationConfig[selectedRole.value] || [])
const isVisitor = computed(() => selectedRole.value === 'visitor')

const avatarColor = computed(() => {
  const colors = {
    admin: 'bg-blue-500', manager: 'bg-purple-500', supervisor: 'bg-amber-500',
    technician: 'bg-emerald-500', worker: 'bg-cyan-500', visitor: 'bg-gray-500'
  }
  return colors[selectedRole.value] || 'bg-gray-500'
})

const roleBadgeColor = computed(() => {
  const colors = {
    admin: 'bg-blue-100 text-blue-700', manager: 'bg-purple-100 text-purple-700',
    supervisor: 'bg-amber-100 text-amber-700', technician: 'bg-emerald-100 text-emerald-700',
    worker: 'bg-cyan-100 text-cyan-700', visitor: 'bg-gray-100 text-gray-700'
  }
  return colors[selectedRole.value] || 'bg-gray-100 text-gray-700'
})

const dataScopeLabel = computed(() => {
  const labels = { all: '全部数据', dept: '本部门数据', module: '负责模块', self: '仅自己', public: '公开信息' }
  return labels[permission.value.dataScope] || '公开信息'
})
</script>
