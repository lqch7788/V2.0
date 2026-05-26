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
            <el-icon :size="24" color="#fff"><Key /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">分级审批配置</h1>
            <p class="text-gray-500">配置审批级别、金额阈值和审批规则</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab切换 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <!-- Tab栏 -->
      <div class="flex border-b border-gray-200">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          class="flex-1 py-4 text-sm font-medium text-center transition-colors border-b-2"
          :class="[
            activeTab === tab.value
              ? 'text-indigo-600 border-indigo-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab内容 -->
      <div class="p-6">
        <!-- ========== 金额阈值配置 ========== -->
        <div v-if="activeTab === 'thresholds'" class="space-y-4">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">金额阈值配置</h2>
              <p class="text-sm text-gray-500">配置不同金额区间对应的审批级别</p>
            </div>
            <button
              @click="openThresholdModal(null)"
              class="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
            >
              <el-icon :size="16"><Plus /></el-icon>
              新增阈值
            </button>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="text-center py-8 text-gray-400">
            <el-icon class="is-loading" :size="32"><Loading /></el-icon>
            <p class="mt-2">加载中...</p>
          </div>

          <!-- 阈值列表 -->
          <div v-else class="space-y-3">
            <div
              v-for="(threshold, index) in sortedThresholds"
              :key="threshold.id"
              class="flex items-center justify-between p-4 rounded-lg border"
              :class="[getLevelColors(threshold.levelCode).bg, getLevelColors(threshold.levelCode).border]"
            >
              <div class="flex items-center gap-4">
                <div class="p-2 rounded-lg bg-white" :class="getLevelColors(threshold.levelCode).text">
                  <el-icon :size="20"><component :is="getLevelIcon(threshold.levelCode)" /></el-icon>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-semibold" :class="getLevelColors(threshold.levelCode).text">
                      {{ getLevelName(threshold.levelCode) }}
                    </span>
                    <span
                      v-if="threshold.levelCode === 'exempt'"
                      class="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded"
                    >
                      自动通过
                    </span>
                  </div>
                  <p class="text-sm text-gray-500 mt-1">
                    {{ index === 0
                      ? `金额 < ${formatAmount(threshold.maxAmount)}`
                      : `${formatAmount(sortedThresholds[index - 1].maxAmount)} ≤ 金额 < ${formatAmount(threshold.maxAmount)}`
                    }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div class="text-right mr-4">
                  <p class="font-semibold" :class="getLevelColors(threshold.levelCode).text">
                    {{ getApproverText(threshold.levelCode) }}
                  </p>
                </div>
                <button
                  @click="openThresholdModal(threshold)"
                  class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="编辑"
                >
                  <el-icon :size="16"><Edit /></el-icon>
                </button>
                <button
                  @click="confirmDeleteThreshold(threshold)"
                  class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="删除"
                >
                  <el-icon :size="16"><Delete /></el-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- 严格审批 - 无上限 -->
          <div class="p-4 rounded-lg border bg-red-50 border-red-200 mt-3">
            <div class="flex items-center gap-4">
              <div class="p-2 rounded-lg bg-white text-red-700">
                <el-icon :size="20"><WarningFilled /></el-icon>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-red-700">严格审批</span>
                </div>
                <p class="text-sm text-gray-500 mt-1">
                  {{ sortedThresholds.length > 0
                    ? `金额 ≥ ${formatAmount(sortedThresholds[sortedThresholds.length - 1].maxAmount)}`
                    : '所有金额'
                  }}
                </p>
              </div>
            </div>
          </div>

          <!-- 配置说明 -->
          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="font-medium text-gray-900 mb-2">配置说明</h3>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• 金额阈值按照从小到大的顺序匹配，第一个匹配的阈值决定审批级别</li>
              <li>• 超过所有阈值的金额将自动进入严格审批</li>
              <li>• 免审批（金额 &lt; 第一个阈值）自动通过，无需人工操作</li>
              <li>• 可新增、编辑、删除阈值，修改后立即生效</li>
            </ul>
          </div>
        </div>

        <!-- ========== 审批级别说明 ========== -->
        <div v-if="activeTab === 'levels'" class="space-y-4">
          <div class="mb-4">
            <h2 class="text-lg font-semibold text-gray-900">审批级别说明</h2>
            <p class="text-sm text-gray-500">各审批级别的详细说明和配置要求，点击编辑可修改</p>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="text-center py-8 text-gray-400">
            <el-icon class="is-loading" :size="32"><Loading /></el-icon>
            <p class="mt-2">加载中...</p>
          </div>

          <!-- 级别卡片 -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="config in sortedLevelConfigs"
              :key="config.id"
              class="p-5 rounded-lg border"
              :class="[getLevelColors(config.levelCode).bg, getLevelColors(config.levelCode).border]"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-white" :class="getLevelColors(config.levelCode).text">
                    <el-icon :size="20"><component :is="getLevelIcon(config.levelCode)" /></el-icon>
                  </div>
                  <div>
                    <h3 class="font-semibold" :class="getLevelColors(config.levelCode).text">{{ config.levelName }}</h3>
                    <p class="text-xs text-gray-500">{{ config.description }}</p>
                  </div>
                </div>
                <button
                  @click="openLevelModal(config)"
                  class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="编辑"
                >
                  <el-icon :size="16"><Edit /></el-icon>
                </button>
              </div>

              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500">审批人数：</span>
                  <span class="font-medium">{{ config.approverCount }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">需要多审：</span>
                  <span class="font-medium">
                    {{ config.requireMultiApprover ? '是' : '否' }}
                  </span>
                </div>
                <div v-if="config.approverRoles && config.approverRoles.length > 0" class="flex justify-between">
                  <span class="text-gray-500">审批人角色：</span>
                  <span class="font-medium">
                    {{ config.approverRoles.join(' → ') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ========== 类型规则配置 ========== -->
        <div v-if="activeTab === 'rules'" class="space-y-4">
          <div class="mb-4">
            <h2 class="text-lg font-semibold text-gray-900">类型规则配置</h2>
            <p class="text-sm text-gray-500">各审批类型的特殊规则配置，点击操作列编辑</p>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="text-center py-8 text-gray-400">
            <el-icon class="is-loading" :size="32"><Loading /></el-icon>
            <p class="mt-2">加载中...</p>
          </div>

          <!-- 类型规则表格 -->
          <div v-else class="border border-gray-200 rounded-lg overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="py-3 px-4 text-left text-xs font-medium text-gray-600">审批类型</th>
                  <th class="py-3 px-4 text-center text-xs font-medium text-gray-600">强制级别</th>
                  <th class="py-3 px-4 text-center text-xs font-medium text-gray-600">批量审批</th>
                  <th class="py-3 px-4 text-left text-xs font-medium text-gray-600">备注</th>
                  <th class="py-3 px-4 text-center text-xs font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="rule in typeRules"
                  :key="rule.id"
                  class="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td class="py-3 px-4">
                    <span class="font-medium text-gray-900">
                      {{ getApprovalTypeName(rule.approvalType) }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span
                      v-if="rule.forceExempt || rule.forceStrict || rule.forcedLevel"
                      class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                      :class="[getForceLevelColors(rule).bg, getForceLevelColors(rule).text]"
                    >
                      <template v-if="rule.forceExempt">强制免审</template>
                      <template v-else-if="rule.forceStrict">强制严格</template>
                      <template v-else>{{ getLevelName(rule.forcedLevel) }}</template>
                    </span>
                    <span v-else class="text-gray-400 text-sm">按金额</span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span
                      class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                      :class="rule.batchApprovalSupported ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
                    >
                      {{ rule.batchApprovalSupported ? '支持' : '不支持' }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-sm text-gray-500">
                    {{ rule.remark || '-' }}
                  </td>
                  <td class="py-3 px-4 text-center">
                    <button
                      @click="openRuleModal(rule)"
                      class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <el-icon :size="16"><Edit /></el-icon>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 特殊规则说明 -->
          <div class="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 class="font-medium text-amber-800 mb-2">特殊规则说明</h3>
            <ul class="text-sm text-amber-700 space-y-1">
              <li>• <strong>强制免审</strong>：无论金额大小，该类型申请自动通过</li>
              <li>• <strong>强制严格</strong>：无论金额大小，该类型需要多级审批</li>
              <li>• <strong>自定义级别</strong>：指定固定的审批级别，优先级最高</li>
              <li>• <strong>按金额</strong>：根据申请金额自动确定审批级别</li>
              <li>• <strong>批量审批</strong>：该类型支持批量审批操作</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 金额阈值编辑弹窗 ========== -->
    <el-dialog
      v-model="thresholdDialogVisible"
      width="440px"
      :show-close="false"
      class="threshold-modal"
    >
      <template #header>
        <div class="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 rounded-t-xl text-white">
          <h3 class="text-lg font-semibold">{{ editingThreshold ? '编辑金额阈值' : '新增金额阈值' }}</h3>
          <button @click="thresholdDialogVisible = false" class="p-1 hover:bg-white/20 rounded">
            <el-icon :size="20"><Close /></el-icon>
          </button>
        </div>
      </template>

      <div class="p-6 space-y-4">
        <div>
          <label class="block text-xs text-gray-700 mb-1 font-medium">
            金额上限（元） <span class="text-red-500">*</span>
          </label>
          <el-input
            v-model="thresholdForm.maxAmount"
            placeholder="如: 5000"
            size="large"
          />
          <p class="text-xs text-gray-500 mt-1">
            {{ editingThreshold ? '修改此阈值对应的金额上限' : '金额小于此值的申请将匹配此级别' }}
          </p>
        </div>
        <div>
          <label class="block text-xs text-gray-700 mb-1 font-medium">
            审批级别 <span class="text-red-500">*</span>
          </label>
          <el-select
            v-model="thresholdForm.levelCode"
            placeholder="-- 请选择级别 --"
            size="large"
            class="w-full"
          >
            <el-option
              v-for="lc in sortedLevelConfigs"
              :key="lc.levelCode"
              :label="lc.levelName"
              :value="lc.levelCode"
            />
          </el-select>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <el-button @click="thresholdDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveThreshold" :loading="saving">
            {{ saving ? '保存中...' : '保存' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- ========== 级别配置编辑弹窗 ========== -->
    <el-dialog
      v-model="levelDialogVisible"
      width="480px"
      :show-close="false"
      class="level-modal"
    >
      <template #header>
        <div class="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 rounded-t-xl text-white">
          <h3 class="text-lg font-semibold">编辑 - {{ editingLevel?.levelName || '' }}</h3>
          <button @click="levelDialogVisible = false" class="p-1 hover:bg-white/20 rounded">
            <el-icon :size="20"><Close /></el-icon>
          </button>
        </div>
      </template>

      <div class="p-6 space-y-4">
        <div>
          <label class="block text-xs text-gray-700 mb-1 font-medium">
            级别名称 <span class="text-red-500">*</span>
          </label>
          <el-input v-model="levelForm.levelName" size="large" />
        </div>
        <div>
          <label class="block text-xs text-gray-700 mb-1 font-medium">级别描述</label>
          <el-input v-model="levelForm.description" size="large" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-gray-700 mb-1 font-medium">审批人数</label>
            <el-input-number
              v-model="levelForm.approverCount"
              :min="0"
              :max="999"
              size="large"
              class="w-full"
            />
          </div>
          <div class="flex items-end pb-1">
            <label class="flex items-center gap-2 cursor-pointer">
              <el-checkbox v-model="levelForm.requireMultiApprover" />
              <span class="text-sm text-gray-700">需要多审</span>
            </label>
          </div>
        </div>
        <div>
          <label class="block text-xs text-gray-700 mb-1 font-medium">审批人角色（逗号分隔）</label>
          <el-input
            v-model="levelForm.approverRoles"
            placeholder="如: department_head, manager, director"
            size="large"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <el-button @click="levelDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveLevel" :loading="saving">
            {{ saving ? '保存中...' : '保存' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- ========== 类型规则编辑弹窗 ========== -->
    <el-dialog
      v-model="ruleDialogVisible"
      width="480px"
      :show-close="false"
      class="rule-modal"
    >
      <template #header>
        <div class="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 rounded-t-xl text-white">
          <h3 class="text-lg font-semibold">
            编辑规则 - {{ editingRule ? getApprovalTypeName(editingRule.approvalType) : '' }}
          </h3>
          <button @click="ruleDialogVisible = false" class="p-1 hover:bg-white/20 rounded">
            <el-icon :size="20"><Close /></el-icon>
          </button>
        </div>
      </template>

      <div class="p-6 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center gap-2">
            <el-checkbox
              v-model="ruleForm.forceExempt"
              @change="handleForceExemptChange"
            />
            <span class="text-sm text-gray-700">强制免审</span>
          </div>
          <div class="flex items-center gap-2">
            <el-checkbox
              v-model="ruleForm.forceStrict"
              @change="handleForceStrictChange"
            />
            <span class="text-sm text-gray-700">强制严格</span>
          </div>
        </div>
        <div>
          <label class="block text-xs text-gray-700 mb-1 font-medium">
            自定义审批级别（可选，优先级最高）
          </label>
          <el-select
            v-model="ruleForm.forcedLevel"
            placeholder="-- 不指定（按金额）--"
            size="large"
            class="w-full"
            @change="handleForcedLevelChange"
          >
            <el-option
              v-for="lc in sortedLevelConfigs"
              :key="lc.levelCode"
              :label="lc.levelName"
              :value="lc.levelCode"
            />
          </el-select>
        </div>
        <div class="flex items-center gap-2">
          <el-checkbox v-model="ruleForm.batchApprovalSupported" />
          <span class="text-sm text-gray-700">支持批量审批</span>
        </div>
        <div>
          <label class="block text-xs text-gray-700 mb-1 font-medium">备注</label>
          <el-input v-model="ruleForm.remark" size="large" />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <el-button @click="ruleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveRule" :loading="saving">
            {{ saving ? '保存中...' : '保存' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- ========== 删除确认弹窗 ========== -->
    <el-dialog
      v-model="deleteDialogVisible"
      width="400px"
      :show-close="false"
      class="delete-modal"
    >
      <template #header>
        <div class="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-500 via-red-600 to-red-500 rounded-t-xl text-white">
          <h3 class="text-lg font-semibold">确认删除</h3>
          <button @click="deleteDialogVisible = false" class="p-1 hover:bg-white/20 rounded">
            <el-icon :size="20"><Close /></el-icon>
          </button>
        </div>
      </template>

      <div class="p-6 space-y-4">
        <p class="text-gray-600">
          确定要删除金额阈值为 {{ formatAmount(deleteTarget?.maxAmount || 0) }} 的配置吗？
        </p>
        <div class="flex justify-end gap-3">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="handleDeleteThreshold" :loading="saving">
            确认删除
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useApprovalLevelStore } from '@/stores/modules/approvalLevel'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Plus,
  Edit,
  Delete,
  Close,
  Loading,
  Key,
  CircleCheck,
  Lightning,
  User,
  WarnTriangleFilled
} from '@element-plus/icons-vue'

// Tab 配置
const tabs = [
  { label: '金额阈值配置', value: 'thresholds' },
  { label: '审批级别说明', value: 'levels' },
  { label: '类型规则配置', value: 'rules' }
]

// Store
const store = useApprovalLevelStore()
const { levelConfigs, amountThresholds, typeRules, loading, loadAll, updateLevelConfig, addAmountThreshold, updateAmountThreshold, removeAmountThreshold, updateTypeRule } = store

// 当前 Tab
const activeTab = ref('thresholds')

// 级别颜色映射
const LEVEL_COLORS = {
  exempt: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  quick: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  standard: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  strict: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
}

// 级别图标映射（返回组件对象，供 component :is 使用）
const LEVEL_ICONS = {
  exempt: CircleCheck,
  quick: Lightning,
  standard: User,
  strict: WarnTriangleFilled
}

// 获取级别颜色
const getLevelColors = (levelCode) => {
  return LEVEL_COLORS[levelCode] || LEVEL_COLORS.standard
}

// 获取级别图标组件（V1.1: CheckCircle/Zap/Users/AlertTriangle/Shield → Element Plus 近似映射）
const getLevelIcon = (levelCode) => {
  return LEVEL_ICONS[levelCode] || Key
}

// 格式化金额
const formatAmount = (amount) => {
  if (amount === Infinity || amount >= 999999999) return '无上限'
  return `¥${Number(amount).toLocaleString()}`
}

// 按 sortOrder 排序
const sortedThresholds = computed(() => {
  return [...amountThresholds].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
})

const sortedLevelConfigs = computed(() => {
  return [...levelConfigs].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
})

// 获取级别名称
const getLevelName = (levelCode) => {
  const config = levelConfigs.value.find(l => l.levelCode === levelCode)
  return config?.levelName || levelCode
}

// 获取审批人文本
const getApproverText = (levelCode) => {
  const config = levelConfigs.value.find(l => l.levelCode === levelCode)
  if (!config) return ''
  if (config.approverCount === 0) return '无需审批'
  return `需要 ${config.approverCount} 位审批人`
}

// 获取强制级别颜色
const getForceLevelColors = (rule) => {
  if (rule.forceExempt) return LEVEL_COLORS.exempt
  if (rule.forceStrict) return LEVEL_COLORS.strict
  if (rule.forcedLevel) return LEVEL_COLORS[rule.forcedLevel] || LEVEL_COLORS.standard
  return LEVEL_COLORS.standard
}

// 审批类型名称映射（简化版，完整映射在 V1.1 types/approval.ts）
const getApprovalTypeName = (type) => {
  const typeNames = {
    material_request: '领料申请',
    return_material: '退料单',
    purchase_request: '采购申请',
    material_inbound: '物料入库',
    material_transfer: '库存调拨',
    seed_source_inbound: '种源入库',
    seedling_plan: '育苗计划',
    planting_plan: '种植计划',
    order_create: '订单创建',
    order_change: '订单变更',
    production_plan: '生产计划',
    production_batch: '生产批次',
    batch_change: '批次变更',
    batch_void: '批次作废',
    tech_solution: '技术方案',
    task_dispatch: '任务派发',
    task_change: '任务变更',
    inspection_issue: '巡查问题',
    issue_resolve: '问题整改',
    harvest_request: '采收申请',
    seed_source_supplementary: '种源补录',
    seedling_supplementary: '育苗补录',
    crop_storage_supplementary: '作物入库补录',
    indicator_approval: '指标发布',
    indicator_adjust: '指标调整',
    announcement_approval: '公告审批',
    budget_create: '预算编制',
    budget_adjust: '预算调整',
    leave: '请假',
    overtime: '加班',
    resignation: '离职',
    recruitment: '招聘',
    onboarding: '入职',
    attendance_repair: '考勤补录',
    salary_adjustment: '调薪',
    contract_renewal: '合同续签',
    salary_budget: '工资预算',
    transfer: '转岗'
  }
  return typeNames[type] || type
}

// ============================================
// 金额阈值弹窗
// ============================================
const thresholdDialogVisible = ref(false)
const editingThreshold = ref(null)
const saving = ref(false)

const thresholdForm = reactive({
  maxAmount: '',
  levelCode: ''
})

const openThresholdModal = (item) => {
  editingThreshold.value = item
  if (item) {
    thresholdForm.maxAmount = String(item.maxAmount || '')
    thresholdForm.levelCode = item.levelCode || ''
  } else {
    thresholdForm.maxAmount = ''
    thresholdForm.levelCode = ''
  }
  thresholdDialogVisible.value = true
}

const handleSaveThreshold = async () => {
  if (!thresholdForm.maxAmount.trim() || !thresholdForm.levelCode) {
    ElMessage.warning('请填写完整的阈值信息')
    return
  }
  saving.value = true
  try {
    const data = {
      maxAmount: Number(thresholdForm.maxAmount),
      levelCode: thresholdForm.levelCode
    }
    if (editingThreshold.value) {
      await updateAmountThreshold(editingThreshold.value.id, data)
      ElMessage.success('更新成功')
    } else {
      await addAmountThreshold(data)
      ElMessage.success('创建成功')
    }
    thresholdDialogVisible.value = false
  } catch (err) {
    ElMessage.error(err.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// ============================================
// 删除确认弹窗
// ============================================
const deleteDialogVisible = ref(false)
const deleteTarget = ref(null)

const confirmDeleteThreshold = (item) => {
  deleteTarget.value = item
  deleteDialogVisible.value = true
}

const handleDeleteThreshold = async () => {
  if (!deleteTarget.value) return
  saving.value = true
  try {
    await removeAmountThreshold(deleteTarget.value.id)
    ElMessage.success('删除成功')
    deleteDialogVisible.value = false
    deleteTarget.value = null
  } catch (err) {
    ElMessage.error(err.message || '删除失败')
  } finally {
    saving.value = false
  }
}

// ============================================
// 级别配置弹窗
// ============================================
const levelDialogVisible = ref(false)
const editingLevel = ref(null)

const levelForm = reactive({
  levelName: '',
  description: '',
  approverCount: 0,
  requireMultiApprover: false,
  approverRoles: ''
})

const openLevelModal = (item) => {
  editingLevel.value = item
  levelForm.levelName = item.levelName || ''
  levelForm.description = item.description || ''
  levelForm.approverCount = item.approverCount ?? 0
  levelForm.requireMultiApprover = !!item.requireMultiApprover
  levelForm.approverRoles = Array.isArray(item.approverRoles) ? item.approverRoles.join(', ') : ''
  levelDialogVisible.value = true
}

const handleSaveLevel = async () => {
  if (!levelForm.levelName.trim()) {
    ElMessage.warning('请填写级别名称')
    return
  }
  saving.value = true
  try {
    const roles = levelForm.approverRoles.trim()
      ? levelForm.approverRoles.split(',').map(r => r.trim()).filter(Boolean)
      : []
    await updateLevelConfig(editingLevel.value.id, {
      levelName: levelForm.levelName.trim(),
      description: levelForm.description.trim(),
      approverCount: levelForm.approverCount || 0,
      requireMultiApprover: levelForm.requireMultiApprover ? 1 : 0,
      approverRoles: roles.length > 0 ? roles : null
    })
    ElMessage.success('保存成功')
    levelDialogVisible.value = false
  } catch (err) {
    ElMessage.error(err.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// ============================================
// 类型规则弹窗
// ============================================
const ruleDialogVisible = ref(false)
const editingRule = ref(null)

const ruleForm = reactive({
  forceExempt: false,
  forceStrict: false,
  forcedLevel: '',
  batchApprovalSupported: false,
  remark: ''
})

const openRuleModal = (item) => {
  editingRule.value = item
  ruleForm.forceExempt = !!item.forceExempt
  ruleForm.forceStrict = !!item.forceStrict
  ruleForm.forcedLevel = item.forcedLevel || ''
  ruleForm.batchApprovalSupported = !!item.batchApprovalSupported
  ruleForm.remark = item.remark || ''
  ruleDialogVisible.value = true
}

const handleForceExemptChange = (checked) => {
  if (checked) {
    ruleForm.forceStrict = false
    ruleForm.forcedLevel = ''
  }
}

const handleForceStrictChange = (checked) => {
  if (checked) {
    ruleForm.forceExempt = false
    ruleForm.forcedLevel = ''
  }
}

const handleForcedLevelChange = (val) => {
  if (val) {
    ruleForm.forceExempt = false
    ruleForm.forceStrict = false
  }
}

const handleSaveRule = async () => {
  saving.value = true
  try {
    await updateTypeRule(editingRule.value.id, {
      forceExempt: ruleForm.forceExempt ? 1 : 0,
      forceStrict: ruleForm.forceStrict ? 1 : 0,
      forcedLevel: ruleForm.forcedLevel || null,
      batchApprovalSupported: ruleForm.batchApprovalSupported ? 1 : 0,
      remark: ruleForm.remark.trim()
    })
    ElMessage.success('保存成功')
    ruleDialogVisible.value = false
  } catch (err) {
    ElMessage.error(err.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// ============================================
// 初始化
// ============================================
onMounted(async () => {
  await loadAll()
})
</script>

<style scoped>
/* 弹窗样式覆盖 */
.threshold-modal :deep(.el-dialog),
.level-modal :deep(.el-dialog),
.rule-modal :deep(.el-dialog),
.delete-modal :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.threshold-modal :deep(.el-dialog__header),
.level-modal :deep(.el-dialog__header),
.rule-modal :deep(.el-dialog__header),
.delete-modal :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

.threshold-modal :deep(.el-dialog__body),
.level-modal :deep(.el-dialog__body),
.rule-modal :deep(.el-dialog__body),
.delete-modal :deep(.el-dialog__body) {
  padding: 0;
}
</style>
