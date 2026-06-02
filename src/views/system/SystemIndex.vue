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

    <!-- 组2: 生产配置 -->
    <div>
      <div class="mb-3">
        <h2 class="text-lg font-semibold text-gray-900">生产配置</h2>
        <p class="text-sm text-gray-500">作物与成本</p>
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

    <!-- 组3: 运营管理 -->
    <div>
      <div class="mb-3">
        <h2 class="text-lg font-semibold text-gray-900">运营管理</h2>
        <p class="text-sm text-gray-500">仓库、班组与权限</p>
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
          <p class="text-sm font-medium text-gray-900 mt-1">2026-06-02</p>
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
  Lock,
  Guide,
  Goods,
  Warning,
  Box,
  User,
  Sugar,
  WarnTriangleFilled
} from '@element-plus/icons-vue'

// 路由
const route = useRoute()

// 组1: 基础数据 — 与 V1.1 Settings.tsx 100% 一致（6 项）
const basicDataSections = [
  { icon: Tools, label: '系统配置', path: '/settings/system-config', desc: '系统参数和全局配置' },
  { icon: Notebook, label: '数据字典', path: '/settings/dictionary', desc: '管理所有枚举值和状态' },
  { icon: Aim, label: '部门设置', path: '/settings/departments', desc: '设置组织架构' },
  { icon: House, label: '基地运营中心', path: '/settings/base-operations', desc: '设施管理 · 区域划分 · 种植记录' },
  { icon: Bell, label: '通知设置', path: '/settings/notification', desc: '消息通知渠道和规则' },
  { icon: Document, label: '操作日志', path: '/settings/audit-log', desc: '系统操作审计日志' },
]

// 组2: 生产配置 — 与 V1.1 Settings.tsx 100% 一致（4 项）
const productionSections = [
  { icon: Goods, label: '作物品种库', path: '/settings/crop-variety', desc: '统一管理系统作物品种编码' },
  { icon: Warning, label: '药剂库', path: '/settings/pesticide-library', desc: '管理药剂信息、规格参数和生产厂家' },
  { icon: WarnTriangleFilled, label: '病虫害字典', path: '/settings/pest-disease-dict', desc: '管理病虫害类型、名称和防治方法' },
  { icon: Sugar, label: '肥料库', path: '/settings/fertilizer-library', desc: '管理肥料信息、规格参数和供应商' },
]

// 组3: 运营管理 — 与 V1.1 Settings.tsx 100% 一致（5 项）
const operationSections = [
  { icon: Box, label: '仓库管理', path: '/settings/warehouse', desc: '仓库信息配置' },
  { icon: User, label: '班组管理', path: '/settings/team', desc: '班组和班次管理' },
  { icon: Lock, label: '用户权限管理', path: '/settings/user-permission', desc: '组织架构 · 角色定义 · 权限矩阵 · 用户管理 · 权限覆盖' },
  { icon: Guide, label: '审批流程', path: '/settings/approval-workflow', desc: '审批流程配置' },
  { icon: Lock, label: '分级审批', path: '/settings/approval-level-config', desc: '金额阈值和审批级别配置' },
]
</script>
