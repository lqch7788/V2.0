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
            <el-icon :size="24" color="#fff"><Bell /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">通知设置</h1>
            <p class="text-gray-500">管理通知渠道、规则与个人偏好</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs + 搜索 -->
    <div class="bg-white rounded-xl shadow-sm">
      <div class="flex items-center justify-between px-6 pt-4">
        <div class="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
            :class="activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
          >
            {{ tab.label }}
          </button>
        </div>
        <div v-if="activeTab !== 'preferences'" class="flex items-center gap-2">
          <div class="relative">
            <el-icon class="absolute left-3 top-1/2 -translate-y-1/2" :size="16" color="#9ca3af"><Search /></el-icon>
            <input
              type="text"
              v-model="searchTerm"
              :placeholder="activeTab === 'rules' ? '搜索规则...' : '搜索渠道...'"
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48"
            />
          </div>
          <el-button type="primary" size="small" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            {{ activeTab === 'rules' ? '新增规则' : '新增渠道' }}
          </el-button>
        </div>
      </div>

      <div class="p-6">
        <!-- ========== 通知规则 ========== -->
        <div v-if="activeTab === 'rules'" class="space-y-4">
          <div v-if="filteredRules.length === 0" class="text-center py-8 text-gray-400">
            {{ searchTerm ? '没有匹配的规则' : '暂无通知规则，点击上方按钮新增' }}
          </div>
          <div
            v-for="rule in filteredRules"
            :key="rule.id"
            class="bg-gray-50 rounded-xl p-5 border border-gray-100"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center"
                  :class="rule.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-200 text-gray-400'"
                >
                  <el-icon :size="20"><Bell /></el-icon>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ rule.ruleName }}</h3>
                  <p class="text-xs text-gray-500">{{ getEventLabel(rule.eventType) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span
                  :class="['px-2 py-1 text-xs rounded-full', rule.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600']"
                >
                  {{ rule.isActive ? '启用' : '停用' }}
                </span>
                <el-button link type="info" size="small" @click="toggleRuleActive(rule.id)">
                  {{ rule.isActive ? '停用' : '启用' }}
                </el-button>
                <el-button link type="primary" size="small" @click="editRule(rule)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button link type="danger" size="small" @click="handleDeleteRule(rule.id)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="flex flex-wrap gap-2 mb-3">
              <span
                v-for="cid in rule.channelIds"
                :key="cid"
                class="px-2 py-1 text-xs rounded"
                :class="getChannel(cid)?.isActive ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'"
              >
                {{ getChannel(cid)?.channelName || '' }}
              </span>
            </div>
            <div class="flex items-center gap-6 text-xs text-gray-500">
              <span>频率：<span class="font-medium">{{ getFrequencyLabel(rule.frequency) }}</span></span>
              <span>接收人：<span class="font-medium">{{ (rule.recipientIds || []).join(', ') || '未指定' }}</span></span>
            </div>
          </div>
        </div>

        <!-- ========== 通知渠道 ========== -->
        <div v-if="activeTab === 'channels'" class="space-y-4">
          <div v-if="filteredChannels.length === 0" class="text-center py-8 text-gray-400">
            {{ searchTerm ? '没有匹配的渠道' : '暂无通知渠道' }}
          </div>
          <div
            v-for="ch in filteredChannels"
            :key="ch.id"
            class="bg-gray-50 rounded-xl p-5 border border-gray-100"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="p-3 rounded-lg"
                  :class="ch.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-200 text-gray-400'"
                >
                  <el-icon :size="24">
                    <component :is="getChannelIcon(ch.channelType)" />
                  </el-icon>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ ch.channelName }}</h3>
                  <p class="text-xs text-gray-500">{{ getChannelLabel(ch.channelType) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <button
                  @click="toggleChannelActive(ch.id)"
                  class="w-12 h-6 rounded-full transition-colors relative"
                  :class="ch.isActive ? 'bg-emerald-500' : 'bg-gray-300'"
                >
                  <span
                    class="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
                    :class="ch.isActive ? 'left-7' : 'left-1'"
                  ></span>
                </button>
                <el-button link type="primary" @click="editChannel(ch)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button link type="danger" @click="handleDeleteChannel(ch.id)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <div v-if="ch.config && Object.keys(ch.config).length > 0" class="grid grid-cols-2 gap-3 mt-4">
              <div v-for="(value, key) in ch.config" :key="key" class="p-3 bg-white rounded-lg">
                <p class="text-xs text-gray-500 capitalize">{{ key }}</p>
                <p class="text-sm text-gray-900 mt-1 truncate">{{ value || '-' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ========== 个人偏好 ========== -->
        <div v-if="activeTab === 'preferences'" class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">个人通知偏好</h3>
          <p class="text-sm text-gray-500">配置您希望接收的通知类型和时段</p>

          <div class="space-y-3 mt-4">
            <div
              v-for="item in preferenceItems"
              :key="item.key"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="font-medium text-gray-900">{{ item.title }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ item.desc }}</p>
              </div>
              <button
                @click="updateLocalPref(item.key, !getPrefValue(item.key))"
                class="w-12 h-6 rounded-full transition-colors relative"
                :class="getPrefValue(item.key) ? 'bg-emerald-500' : 'bg-gray-300'"
              >
                <span
                  class="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
                  :class="getPrefValue(item.key) ? 'left-7' : 'left-1'"
                ></span>
              </button>
            </div>
          </div>

          <!-- 免打扰时段 -->
          <div class="p-4 bg-gray-50 rounded-lg mt-4">
            <div class="flex items-center justify-between mb-3">
              <div>
                <p class="font-medium text-gray-900">免打扰时段</p>
                <p class="text-xs text-gray-500 mt-1">在指定时段内不发送通知</p>
              </div>
              <button
                @click="updateLocalPref('dndEnabled', !localPrefs.dndEnabled)"
                class="w-12 h-6 rounded-full transition-colors relative"
                :class="localPrefs.dndEnabled ? 'bg-emerald-500' : 'bg-gray-300'"
              >
                <span
                  class="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
                  :class="localPrefs.dndEnabled ? 'left-7' : 'left-1'"
                ></span>
              </button>
            </div>
            <div v-if="localPrefs.dndEnabled" class="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label class="block text-xs text-gray-700 mb-1 font-medium">开始时间</label>
                <el-input type="time" v-model="localPrefs.dndStartTime" />
              </div>
              <div>
                <label class="block text-xs text-gray-700 mb-1 font-medium">结束时间</label>
                <el-input type="time" v-model="localPrefs.dndEndTime" />
              </div>
            </div>
          </div>

          <!-- 保存按钮 -->
          <div class="flex justify-end pt-4 border-t">
            <el-button type="primary" @click="handleSavePrefs" :disabled="!prefsDirty">
              <el-icon><Select /></el-icon>
              {{ prefsDirty ? '保存偏好设置' : '已保存' }}
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 渠道弹窗 -->
    <el-dialog
      v-model="channelModalVisible"
      :title="editingChannel ? '编辑通知渠道' : '新增通知渠道'"
      width="440px"
      :show-close="false"
    >
      <template #header>
        <div class="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 rounded-t-xl text-white">
          <h3 class="text-lg font-semibold">{{ editingChannel ? '编辑通知渠道' : '新增通知渠道' }}</h3>
          <button @click="closeChannelModal" class="p-1 hover:bg-white/20 rounded">
            <el-icon :size="20"><Plus /></el-icon>
          </button>
        </div>
      </template>

      <div class="p-6 space-y-4">
        <div>
          <label class="block text-xs text-gray-700 mb-1 font-medium">
            渠道名称 <span class="text-red-500">*</span>
          </label>
          <el-input v-model="channelForm.channelName" placeholder="如: 邮件通知" size="large" />
        </div>
        <div>
          <label class="block text-xs text-gray-700 mb-1 font-medium">
            渠道类型 <span class="text-red-500">*</span>
          </label>
          <el-select v-model="channelForm.channelType" placeholder="请选择渠道类型" class="w-full">
            <el-option
              v-for="type in CHANNEL_TYPES"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <el-button @click="closeChannelModal">取消</el-button>
          <el-button type="primary" @click="handleSaveChannel" :loading="saving">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 规则弹窗 -->
    <el-dialog
      v-model="ruleModalVisible"
      :title="editingRule ? '编辑通知规则' : '新增通知规则'"
      width="520px"
      :show-close="false"
    >
      <template #header>
        <div class="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 rounded-t-xl text-white">
          <h3 class="text-lg font-semibold">{{ editingRule ? '编辑通知规则' : '新增通知规则' }}</h3>
          <button @click="closeRuleModal" class="p-1 hover:bg-white/20 rounded">
            <el-icon :size="20"><Plus /></el-icon>
          </button>
        </div>
      </template>

      <div class="p-6 space-y-4">
        <div>
          <label class="block text-xs text-gray-700 mb-1 font-medium">
            规则名称 <span class="text-red-500">*</span>
          </label>
          <el-input v-model="ruleForm.ruleName" placeholder="如: 审批待办通知" size="large" />
        </div>
        <div>
          <label class="block text-xs text-gray-700 mb-1 font-medium">
            触发事件 <span class="text-red-500">*</span>
          </label>
          <el-select v-model="ruleForm.eventType" placeholder="-- 请选择事件 --" class="w-full">
            <el-option
              v-for="opt in EVENT_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>
        <div>
          <label class="block text-xs text-gray-700 mb-1 font-medium">通知渠道（多选）</label>
          <div class="grid grid-cols-2 gap-2 mt-1">
            <label
              v-for="ch in channels"
              :key="ch.id"
              class="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                :checked="ruleForm.channelIds.includes(ch.id)"
                @change="toggleRuleChannel(ch.id)"
                class="rounded"
              />
              {{ ch.channelName }}
            </label>
          </div>
        </div>
        <div>
          <label class="block text-xs text-gray-700 mb-1 font-medium">接收人（逗号分隔）</label>
          <el-input v-model="ruleForm.recipientIds" placeholder="approver, admin" />
        </div>
        <div>
          <label class="block text-xs text-gray-700 mb-1 font-medium">发送频率</label>
          <el-select v-model="ruleForm.frequency" class="w-full">
            <el-option
              v-for="opt in FREQUENCY_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <el-button @click="closeRuleModal">取消</el-button>
          <el-button type="primary" @click="handleSaveRule" :loading="saving">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useNotificationSettingsStore, EVENT_OPTIONS, FREQUENCY_OPTIONS, CHANNEL_TYPES } from '@/stores/modules/notificationSettings'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Bell,
  Search,
  Plus,
  Edit,
  Delete,
  Select,
  Message,
  Phone,
  ChatLineSquare,
  Promotion
} from '@element-plus/icons-vue'

// Store
const notificationStore = useNotificationSettingsStore()
const { channels, rules, preferences, loading, loadAll, loadPreferences, toggleChannelActive, addChannel, updateChannel, removeChannel, toggleRuleActive, addRule, updateRule, removeRule, saveUserPreferences } = notificationStore

// Tabs配置
const tabs = [
  { id: 'rules', label: '通知规则' },
  { id: 'channels', label: '通知渠道' },
  { id: 'preferences', label: '个人偏好' }
]

// 状态
const activeTab = ref('rules')
const searchTerm = ref('')

// 偏好编辑状态
const localPrefs = reactive({
  approvalNotify: true,
  alertNotify: true,
  dailySummary: false,
  announcementNotify: true,
  dndEnabled: false,
  dndStartTime: '22:00',
  dndEndTime: '08:00'
})
const prefsDirty = ref(false)

// 渠道弹窗状态
const channelModalVisible = ref(false)
const editingChannel = ref(null)
const channelForm = reactive({
  channelName: '',
  channelType: 'in-app'
})
const saving = ref(false)

// 规则弹窗状态
const ruleModalVisible = ref(false)
const editingRule = ref(null)
const ruleForm = reactive({
  ruleName: '',
  eventType: '',
  channelIds: [],
  recipientIds: '',
  frequency: 'immediate'
})

// 偏好项配置
const preferenceItems = [
  { key: 'approvalNotify', title: '审批通知', desc: '接收待审批和审批结果通知' },
  { key: 'alertNotify', title: '预警通知', desc: '接收系统预警和异常通知' },
  { key: 'dailySummary', title: '每日汇总', desc: '每日发送系统运行汇总' },
  { key: 'announcementNotify', title: '系统公告', desc: '接收系统更新和公告通知' }
]

// 过滤后的规则
const filteredRules = computed(() => {
  return rules.filter(r =>
    r.ruleName?.includes(searchTerm.value) || r.eventType?.includes(searchTerm.value)
  )
})

// 过滤后的渠道
const filteredChannels = computed(() => {
  return channels.filter(c =>
    c.channelName?.includes(searchTerm.value) || c.channelType?.includes(searchTerm.value)
  )
})

// 获取事件标签
const getEventLabel = (event) => {
  return EVENT_OPTIONS.find(e => e.value === event)?.label || event
}

// 获取频率标签
const getFrequencyLabel = (frequency) => {
  return FREQUENCY_OPTIONS.find(f => f.value === frequency)?.label || frequency
}

// 获取渠道标签
const getChannelLabel = (type) => {
  return CHANNEL_TYPES.find(t => t.value === type)?.label || type
}

// 获取渠道图标
const getChannelIcon = (type) => {
  const iconMap = {
    email: 'Message',
    sms: 'Phone',
    'in-app': 'ChatLineSquare',
    wechat: 'Wechat'
  }
  return iconMap[type] || 'Bell'
}

// 获取渠道
const getChannel = (id) => {
  return channels.find(c => c.id === id || c.channelCode === id)
}

// 获取偏好值
const getPrefValue = (key) => {
  return localPrefs[key]
}

// 更新偏好
const updateLocalPref = (key, value) => {
  localPrefs[key] = value
  prefsDirty.value = true
}

// 保存偏好
const handleSavePrefs = async () => {
  const userId = localStorage.getItem('yuanxingtu_user_oid') || 'default'
  await saveUserPreferences(userId, localPrefs)
  prefsDirty.value = false
  ElMessage.success('保存成功')
}

// 打开渠道弹窗
const handleAdd = () => {
  if (activeTab.value === 'rules') {
    editingRule.value = null
    Object.assign(ruleForm, {
      ruleName: '',
      eventType: '',
      channelIds: [],
      recipientIds: '',
      frequency: 'immediate'
    })
    ruleModalVisible.value = true
  } else {
    editingChannel.value = null
    channelForm.channelName = ''
    channelForm.channelType = 'in-app'
    channelModalVisible.value = true
  }
}

// 编辑渠道
const editChannel = (ch) => {
  editingChannel.value = ch
  channelForm.channelName = ch.channelName
  channelForm.channelType = ch.channelType
  channelModalVisible.value = true
}

// 关闭渠道弹窗
const closeChannelModal = () => {
  channelModalVisible.value = false
  editingChannel.value = null
}

// 保存渠道
const handleSaveChannel = async () => {
  if (!channelForm.channelName.trim()) return
  saving.value = true
  try {
    if (editingChannel.value) {
      await updateChannel(editingChannel.value.id, {
        channelName: channelForm.channelName.trim(),
        channelType: channelForm.channelType
      })
    } else {
      await addChannel({
        channelName: channelForm.channelName.trim(),
        channelType: channelForm.channelType
      })
    }
    closeChannelModal()
    ElMessage.success('保存成功')
  } finally {
    saving.value = false
  }
}

// 删除渠道
const handleDeleteChannel = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该渠道？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await removeChannel(id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

// 编辑规则
const editRule = (rule) => {
  editingRule.value = rule
  ruleForm.ruleName = rule.ruleName
  ruleForm.eventType = rule.eventType
  ruleForm.channelIds = [...(rule.channelIds || [])]
  ruleForm.recipientIds = (rule.recipientIds || []).join(', ')
  ruleForm.frequency = rule.frequency || 'immediate'
  ruleModalVisible.value = true
}

// 关闭规则弹窗
const closeRuleModal = () => {
  ruleModalVisible.value = false
  editingRule.value = null
}

// 切换规则中的渠道
const toggleRuleChannel = (channelId) => {
  const index = ruleForm.channelIds.indexOf(channelId)
  if (index === -1) {
    ruleForm.channelIds.push(channelId)
  } else {
    ruleForm.channelIds.splice(index, 1)
  }
}

// 保存规则
const handleSaveRule = async () => {
  if (!ruleForm.ruleName.trim() || !ruleForm.eventType) return
  saving.value = true
  try {
    const payload = {
      ruleName: ruleForm.ruleName.trim(),
      eventType: ruleForm.eventType,
      recipientIds: ruleForm.recipientIds.split(',').map(r => r.trim()).filter(Boolean),
      channelIds: ruleForm.channelIds,
      frequency: ruleForm.frequency
    }
    if (editingRule.value) {
      await updateRule(editingRule.value.id, payload)
    } else {
      await addRule(payload)
    }
    closeRuleModal()
    ElMessage.success('保存成功')
  } finally {
    saving.value = false
  }
}

// 删除规则
const handleDeleteRule = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该规则？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await removeRule(id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

// 监听preferences变化，同步到本地状态
watch(preferences, (newPrefs) => {
  if (newPrefs) {
    Object.assign(localPrefs, {
      approvalNotify: newPrefs.approvalNotify,
      alertNotify: newPrefs.alertNotify,
      dailySummary: newPrefs.dailySummary,
      announcementNotify: newPrefs.announcementNotify,
      dndEnabled: newPrefs.dndEnabled,
      dndStartTime: newPrefs.dndStartTime || '22:00',
      dndEndTime: newPrefs.dndEndTime || '08:00'
    })
  }
}, { immediate: true, deep: true })

// 初始化
onMounted(async () => {
  await loadAll()
  const userId = localStorage.getItem('yuanxingtu_user_oid') || 'default'
  await loadPreferences(userId)
})
</script>

<style scoped>
/* 弹窗样式覆盖 */
:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

:deep(.el-dialog__body) {
  padding: 0;
}
</style>
