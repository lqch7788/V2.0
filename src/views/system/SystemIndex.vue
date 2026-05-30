<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" color="white">
            <Setting />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">系统设置</h1>
          <p class="text-gray-500">管理系统配置与模块管理</p>
        </div>
      </div>
    </div>

    <!-- 模块列表 - 仅在根路径显示 -->
    <template v-if="route.path === '/system' || route.path === '/settings'">
    <!-- 组1: 基础数据 -->
    <div>
      <div class="mb-3">
        <h2 class="text-lg font-semibold text-gray-900">基础数据</h2>
        <p class="text-sm text-gray-500">核心系统配置与日志</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link
          v-for="(item, index) in basicDataSections"
          :key="index"
          :to="item.path"
          class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all group"
        >
          <div class="flex items-start gap-4">
            <div class="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
              <el-icon :size="24" class="text-emerald-600">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 group-hover:text-emerald-600">{{ item.label }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ item.desc }}</p>
            </div>
            <el-icon :size="20" class="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all">
              <ArrowRight />
            </el-icon>
          </div>
        </router-link>
      </div>
    </div>

    <!-- 组2: 农场结构 -->
    <div>
      <div class="mb-3">
        <h2 class="text-lg font-semibold text-gray-900">农场结构</h2>
        <p class="text-sm text-gray-500">基地 · 大棚 · 分区 · 区块（物理空间架构）</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link
          v-for="(item, index) in farmStructureSections"
          :key="index"
          :to="item.path"
          class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all group"
        >
          <div class="flex items-start gap-4">
            <div class="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
              <el-icon :size="24" class="text-emerald-600">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 group-hover:text-emerald-600">{{ item.label }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ item.desc }}</p>
            </div>
            <el-icon :size="20" class="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all">
              <ArrowRight />
            </el-icon>
          </div>
        </router-link>
      </div>
    </div>

    <!-- 组3: 权限管理 -->
    <div>
      <div class="mb-3">
        <h2 class="text-lg font-semibold text-gray-900">权限管理</h2>
        <p class="text-sm text-gray-500">安全与流程控制</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link
          v-for="(item, index) in permissionSections"
          :key="index"
          :to="item.path"
          class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all group"
        >
          <div class="flex items-start gap-4">
            <div class="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
              <el-icon :size="24" class="text-emerald-600">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 group-hover:text-emerald-600">{{ item.label }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ item.desc }}</p>
            </div>
            <el-icon :size="20" class="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all">
              <ArrowRight />
            </el-icon>
          </div>
        </router-link>
      </div>
    </div>

    <!-- 组4: 生产配置 -->
    <div>
      <div class="mb-3">
        <h2 class="text-lg font-semibold text-gray-900">生产配置</h2>
        <p class="text-sm text-gray-500">作物、工序与成本</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link
          v-for="(item, index) in productionSections"
          :key="index"
          :to="item.path"
          class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all group"
        >
          <div class="flex items-start gap-4">
            <div class="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
              <el-icon :size="24" class="text-emerald-600">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 group-hover:text-emerald-600">{{ item.label }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ item.desc }}</p>
            </div>
            <el-icon :size="20" class="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all">
              <ArrowRight />
            </el-icon>
          </div>
        </router-link>
      </div>
    </div>

    <!-- 组5: IoT设备 -->
    <div>
      <div class="mb-3">
        <h2 class="text-lg font-semibold text-gray-900">IoT设备</h2>
        <p class="text-sm text-gray-500">硬件设备参数和管理（iAGS集成）</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link
          v-for="(item, index) in iotDeviceSections"
          :key="index"
          :to="item.path"
          class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group"
        >
          <div class="flex items-start gap-4">
            <div class="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
              <el-icon :size="24" class="text-blue-600">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-blue-600 group-hover:text-emerald-600">{{ item.label }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ item.desc }}</p>
            </div>
            <el-icon :size="20" class="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all">
              <ArrowRight />
            </el-icon>
          </div>
        </router-link>
      </div>
    </div>

    <!-- 组6: 监控告警 -->
    <div>
      <div class="mb-3">
        <h2 class="text-lg font-semibold text-gray-900">监控告警</h2>
        <p class="text-sm text-gray-500">系统监控与合规</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link
          v-for="(item, index) in monitorSections"
          :key="index"
          :to="item.path"
          class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all group"
        >
          <div class="flex items-start gap-4">
            <div class="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
              <el-icon :size="24" class="text-emerald-600">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 group-hover:text-emerald-600">{{ item.label }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ item.desc }}</p>
            </div>
            <el-icon :size="20" class="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all">
              <ArrowRight />
            </el-icon>
          </div>
        </router-link>
      </div>
    </div>

    <!-- 组7: 运营管理 -->
    <div>
      <div class="mb-3">
        <h2 class="text-lg font-semibold text-gray-900">运营管理</h2>
        <p class="text-sm text-gray-500">仓库、班组与人事</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link
          v-for="(item, index) in operationSections"
          :key="index"
          :to="item.path"
          class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all group"
        >
          <div class="flex items-start gap-4">
            <div class="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
              <el-icon :size="24" class="text-emerald-600">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 group-hover:text-emerald-600">{{ item.label }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ item.desc }}</p>
            </div>
            <el-icon :size="20" class="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all">
              <ArrowRight />
            </el-icon>
          </div>
        </router-link>
      </div>
    </div>

    <!-- 系统信息 -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 class="font-semibold text-gray-900 mb-4">系统信息</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-3 bg-gray-50 rounded-lg">
          <p class="text-xs text-gray-500">系统版本</p>
          <p class="text-sm font-medium text-gray-900 mt-1">V2.0</p>
        </div>
        <div class="p-3 bg-gray-50 rounded-lg">
          <p class="text-xs text-gray-500">数据库</p>
          <p class="text-sm font-medium text-gray-900 mt-1">SQLite</p>
        </div>
        <div class="p-3 bg-gray-50 rounded-lg">
          <p class="text-xs text-gray-500">最后更新</p>
          <p class="text-sm font-medium text-gray-900 mt-1">2026-05-22</p>
        </div>
        <div class="p-3 bg-gray-50 rounded-lg">
          <p class="text-xs text-gray-500">前端框架</p>
          <p class="text-sm font-medium text-gray-900 mt-1">Vue3 + Vite</p>
        </div>
      </div>
    </div>
    </template>
  </div>

  <!-- 子页面渲染 -->
  <router-view />
</template>

<script setup>
import { useRoute } from 'vue-router'
import {
  Setting,
  ArrowRight,
  Tools,
  Notebook,
  Aim,
  Bell,
  Document,
  House,
  Grid,
  MapLocation,
  Lock,
  Guide,
  Goods,
  List,
  Van,
  Coin,
  Monitor,
  VideoCamera,
  Connection,
  Odometer,
  CircleCheck,
  Download,
  Lightning,
  Warning,
  Box,
  User,
  Calendar,
  Sugar,
  WarnTriangleFilled
} from '@element-plus/icons-vue'

// 路由
const route = useRoute()

// 组1: 基础数据
const basicDataSections = [
  { icon: Tools, label: '系统配置', path: '/settings/system-config', desc: '系统参数和全局配置' },
  { icon: Notebook, label: '数据字典', path: '/settings/dictionary', desc: '管理所有枚举值和状态' },
  { icon: Aim, label: '部门设置', path: '/settings/departments', desc: '设置组织架构' },
  { icon: Bell, label: '通知设置', path: '/settings/notification', desc: '消息通知渠道和规则' },
  { icon: Document, label: '操作日志', path: '/settings/audit-log', desc: '系统操作审计日志' },
]

// 组2: 农场结构
const farmStructureSections = [
  { icon: House, label: '基地设置', path: '/settings/bases', desc: '管理基地信息配置' },
  { icon: House, label: '基地架构', path: '/settings/farm-structure', desc: '公司基地 · 设施管理 · 区块划分 · 种植记录' },
  { icon: Grid, label: '区块管理', path: '/settings/block', desc: '管理基地下的种植区块' },
  { icon: MapLocation, label: '分区管理', path: '/settings/partitions', desc: '大棚和种植分区层级管理' },
  { icon: MapLocation, label: '区域系统', path: '/settings/area-systems', desc: '分区与设备系统的关联映射配置' },
]

// 组3: 权限管理
const permissionSections = [
  { icon: Lock, label: '用户权限管理', path: '/settings/user-permission', desc: '组织架构 · 角色定义 · 权限矩阵 · 用户管理' },
  { icon: Guide, label: '审批流程', path: '/settings/approval-workflow', desc: '审批流程配置' },
  { icon: Lock, label: '分级审批', path: '/settings/approval-level-config', desc: '金额阈值和审批级别配置' }
]

// 组4: 生产配置
const productionSections = [
  { icon: Goods, label: '作物品种库', path: '/settings/crop-variety', desc: '统一管理系统作物品种编码' },
  { icon: List, label: '工序管理', path: '/settings/processes', desc: '定义标准农事工序' },
  { icon: Coin, label: '成本核算', path: '/settings/cost-accounting', desc: '成本类别和预算管理' },
  { icon: Warning, label: '药剂库', path: '/settings/pesticide-library', desc: '管理药剂信息、规格参数和生产厂家' },
  { icon: WarnTriangleFilled, label: '病虫害字典', path: '/settings/pest-disease-dict', desc: '管理病虫害类型、名称和防治方法' },
  { icon: Sugar, label: '肥料库', path: '/settings/fertilizer-library', desc: '管理肥料信息、规格参数和供应商' },
]

// 组5: IoT设备
const iotDeviceSections = [
  { icon: Monitor, label: '系统管理', path: '/settings/device-systems', desc: '设备系统类型定义和IDC关联' },
  { icon: VideoCamera, label: '视频管理', path: '/settings/cameras', desc: '摄像头注册和RTSP视频流地址配置' },
  { icon: Connection, label: '水肥一体机', path: '/settings/water-fertilizer', desc: '灌溉时段、间隔和ABC混合比例参数配置' },
  { icon: Odometer, label: '设备管理', path: '/settings/device', desc: 'IoT设备注册与监控配置' },
  { icon: CircleCheck, label: '设备分配', path: '/settings/device-distribution', desc: 'IoT设备分配到温室区域 + 运行参数' },
  { icon: Tools, label: '工程调试', path: '/settings/project-debug', desc: 'HMI版本、数据库测试、系统诊断工具' },
  { icon: Van, label: '种植设置', path: '/settings/plant-settings', desc: '种植图标和品种种植参数配置' },
]

// 组6: 监控告警
const monitorSections = [
  { icon: Monitor, label: '系统监控', path: '/settings/monitor', desc: '服务器和服务运行状态监控' },
  { icon: Download, label: '备份恢复', path: '/settings/backup', desc: '数据备份与恢复管理' },
  { icon: Lightning, label: '能耗管理', path: '/settings/energy-configs', desc: '大棚能耗类型和计量设备配置' },
  { icon: Warning, label: '警报管理', path: '/settings/alarm-configs', desc: '三级警报级别和通知规则配置' },
]

// 组7: 运营管理
const operationSections = [
  { icon: Box, label: '仓库管理', path: '/settings/warehouse', desc: '仓库信息配置' },
  { icon: User, label: '班组管理', path: '/settings/team', desc: '班组和班次管理' },
  { icon: Calendar, label: '人事管理', path: '/settings/personnel', desc: '管理员工和职务' },
]
</script>
