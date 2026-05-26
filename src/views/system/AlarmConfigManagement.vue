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
            <el-icon :size="24" color="#fff"><WarnTriangleFilled /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">警报管理</h1>
            <p class="text-gray-500">三级警报级别和通知规则配置</p>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 切换 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <!-- TAB 栏 -->
      <div class="flex border-b border-gray-100 bg-gray-50">
        <button
          v-for="level in [1, 2, 3]"
          :key="level"
          @click="activeTab = level"
          class="flex-1 py-3.5 px-4 text-sm font-medium transition-colors relative"
          :class="[
            activeTab === level
              ? level === 1
                ? 'text-red-600 bg-white border-b-2 border-red-500'
                : level === 2
                  ? 'text-orange-600 bg-white border-b-2 border-orange-500'
                  : 'text-yellow-600 bg-white border-b-2 border-yellow-500'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          ]"
        >
          <div class="flex items-center justify-center gap-2">
            <el-icon
              :size="16"
              :color="level === 1 ? '#ef4444' : level === 2 ? '#f97316' : '#eab308'"
            >
              <Bell />
            </el-icon>
            {{ LEVEL_LABELS[level] }}
          </div>
        </button>
      </div>

      <!-- TAB 内容 -->
      <div class="p-6">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="py-12 text-center text-gray-400">
          <el-icon class="is-loading" :size="32"><Loading /></el-icon>
          <p class="mt-2">加载中...</p>
        </div>

        <template v-else>
          <!-- 通知方式 -->
          <div class="mb-8">
            <h3 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <div
                class="w-3 h-3 rounded-full"
                :class="activeTab === 1 ? 'bg-red-500' : activeTab === 2 ? 'bg-orange-500' : 'bg-yellow-500'"
              ></div>
              通知方式配置
            </h3>
            <div class="grid grid-cols-3 gap-4">
              <button
                v-for="item in notificationTypes"
                :key="item.key"
                @click="toggleNotify(item.key)"
                class="p-4 rounded-xl border-2 transition-all text-left"
                :class="[
                  currentEdit[item.key] === 1
                    ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                ]"
              >
                <div class="flex items-center justify-between mb-2">
                  <span :class="currentEdit[item.key] === 1 ? 'text-emerald-600' : 'text-gray-400'">
                    <el-icon :size="20"><component :is="item.icon" /></el-icon>
                  </span>
                  <el-icon
                    :size="16"
                    :color="currentEdit[item.key] === 1 ? '#10b981' : '#d1d5db'"
                  >
                    <component :is="currentEdit[item.key] === 1 ? 'Bell' : 'BellFilled'" />
                  </el-icon>
                </div>
                <p
                  class="text-sm font-medium"
                  :class="currentEdit[item.key] === 1 ? 'text-gray-900' : 'text-gray-500'"
                >{{ item.label }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ item.desc }}</p>
              </button>
            </div>
          </div>

          <!-- 联系人列表 -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-semibold text-gray-700">警报联系人</h3>
              <button
                @click="openContactModal"
                class="flex items-center gap-1 px-3 py-1.5 text-xs text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
              >
                <el-icon :size="14"><Plus /></el-icon> 添加联系人
              </button>
            </div>

            <!-- 无联系人 -->
            <div
              v-if="currentContacts.length === 0"
              class="py-8 text-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg"
            >
              暂无联系人，点击"添加联系人"按钮添加
            </div>

            <!-- 联系人表格 -->
            <div v-else class="border border-gray-200 rounded-lg overflow-hidden">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50">
                    <th class="py-2.5 px-4 text-left text-xs font-medium text-gray-500">姓名</th>
                    <th class="py-2.5 px-4 text-left text-xs font-medium text-gray-500">联系方式</th>
                    <th class="py-2.5 px-4 text-left text-xs font-medium text-gray-500 w-20">类型</th>
                    <th class="py-2.5 px-4 text-center text-xs font-medium text-gray-500 w-16">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="c in currentContacts"
                    :key="c.oid"
                    class="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td class="py-2.5 px-4 font-medium text-gray-900">{{ c.contactName }}</td>
                    <td class="py-2.5 px-4 text-gray-600">{{ c.contactInfo }}</td>
                    <td class="py-2.5 px-4">
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                        <el-icon :size="12"><component :is="getContactTypeIcon(c.contactType)" /></el-icon>
                        {{ getContactTypeLabel(c.contactType) }}
                      </span>
                    </td>
                    <td class="py-2.5 px-4 text-center">
                      <button
                        @click="handleDeleteContact(c.oid)"
                        class="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="删除"
                      >
                        <el-icon :size="14"><Delete /></el-icon>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 保存按钮 -->
          <div class="flex justify-end pt-4 border-t border-gray-100">
            <button
              @click="handleSaveLevel"
              :disabled="!isDirty || savingLevel === activeTab"
              class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
              :class="[
                isDirty
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              ]"
            >
              <el-icon :size="16" class="is-loading" v-if="savingLevel === activeTab"><Loading /></el-icon>
              <template v-else>
                <el-icon :size="16"><Check /></el-icon>
              </template>
              {{ savingLevel === activeTab ? '保存中...' : '保存配置' }}
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- 添加联系人弹窗 -->
    <el-dialog
      v-model="showContactModal"
      width="440px"
      :show-close="false"
      class="contact-modal"
    >
      <template #header>
        <div class="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 rounded-t-xl text-white">
          <h3 class="text-lg font-semibold">添加联系人 — {{ LEVEL_LABELS[activeTab] }}</h3>
          <button @click="showContactModal = false" class="p-1 hover:bg-white/20 rounded">
            <el-icon :size="20"><Plus /></el-icon>
          </button>
        </div>
      </template>

      <div class="p-6 space-y-4">
        <div>
          <label class="block text-xs text-gray-700 mb-1 font-medium">
            姓名 <span class="text-red-500">*</span>
          </label>
          <el-input
            v-model="contactForm.contactName"
            placeholder="联系人姓名"
            size="large"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-700 mb-1 font-medium">
            联系方式 <span class="text-red-500">*</span>
          </label>
          <el-input
            v-model="contactForm.contactInfo"
            placeholder="邮箱/手机号"
            size="large"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-700 mb-1 font-medium">通知类型</label>
          <div class="flex gap-2">
            <button
              v-for="type in contactTypes"
              :key="type.value"
              @click="contactForm.contactType = type.value"
              class="flex-1 py-2 rounded-lg text-xs font-medium transition-colors border"
              :class="[
                contactForm.contactType === type.value
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
              ]"
            >
              {{ type.label }}
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <el-button @click="showContactModal = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleAddContact"
            :disabled="!contactForm.contactName.trim() || !contactForm.contactInfo.trim()"
          >
            添加
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAlarmConfigStore, LEVEL_LABELS, LEVEL_DEFAULTS } from '@/stores/modules/alarmConfig'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Bell,
  WarnTriangleFilled,
  Plus,
  Delete,
  Check,
  Loading,
  Message,
  Phone,
  MuteNotification,
  ChatDotRound
} from '@element-plus/icons-vue'

// Store
const alarmConfigStore = useAlarmConfigStore()
const { levels, contacts, isLoading, fetchLevels, saveLevel, fetchContacts, addContact, removeContact } = alarmConfigStore

// 本地状态
const activeTab = ref(1)
const editingLevels = ref([...LEVEL_DEFAULTS])
const savingLevel = ref(null)

// 联系人弹窗
const showContactModal = ref(false)
const contactForm = reactive({
  contactName: '',
  contactInfo: '',
  contactType: 'email'
})

// 通知方式配置项
const notificationTypes = [
  { key: 'notifyEmail', label: '邮件通知', icon: 'Message', desc: '通过电子邮件发送警报' },
  { key: 'notifySms', label: '短信通知', icon: 'ChatDotRound', desc: '通过短信发送警报' },
  { key: 'notifyPhone', label: '电话通知', icon: 'Phone', desc: '通过电话通知警报' }
]

// 联系人类型选项
const contactTypes = [
  { value: 'email', label: '邮件' },
  { value: 'sms', label: '短信' },
  { value: 'phone', label: '电话' }
]

// 当前编辑的级别
const currentEdit = computed(() => {
  const level = editingLevels.value.find(l => l.level === activeTab.value)
  return level || LEVEL_DEFAULTS[activeTab.value - 1]
})

// 当前级别的联系人
const currentContacts = computed(() => {
  return contacts.filter(c => c.level === activeTab.value)
})

// 是否有未保存的更改
const isDirty = computed(() => {
  const original = levels.value.find(l => l.level === activeTab.value)
  if (!original) return true
  return (
    original.levelName !== currentEdit.value.levelName ||
    original.notifyEmail !== currentEdit.value.notifyEmail ||
    original.notifySms !== currentEdit.value.notifySms ||
    original.notifyPhone !== currentEdit.value.notifyPhone
  )
})

// 更新编辑状态
const updateEdit = (key, value) => {
  editingLevels.value = editingLevels.value.map(l =>
    l.level === activeTab.value ? { ...l, [key]: value } : l
  )
}

// 切换通知方式
const toggleNotify = (key) => {
  const current = currentEdit.value[key] || 0
  updateEdit(key, current ? 0 : 1)
}

// 保存级别配置
const handleSaveLevel = async () => {
  savingLevel.value = activeTab.value
  await saveLevel(activeTab.value, {
    levelName: currentEdit.value.levelName,
    notifyEmail: currentEdit.value.notifyEmail,
    notifySms: currentEdit.value.notifySms,
    notifyPhone: currentEdit.value.notifyPhone
  })
  savingLevel.value = null
  ElMessage.success('保存成功')
}

// 打开添加联系人弹窗
const openContactModal = () => {
  contactForm.contactName = ''
  contactForm.contactInfo = ''
  contactForm.contactType = 'email'
  showContactModal.value = true
}

// 添加联系人
const handleAddContact = async () => {
  if (!contactForm.contactName.trim() || !contactForm.contactInfo.trim()) return
  await addContact({
    level: activeTab.value,
    contactName: contactForm.contactName,
    contactInfo: contactForm.contactInfo,
    contactType: contactForm.contactType
  })
  showContactModal.value = false
  ElMessage.success('添加成功')
}

// 删除联系人
const handleDeleteContact = async (oid) => {
  await removeContact(oid)
  ElMessage.success('删除成功')
}

// 获取联系人类型图标
const getContactTypeIcon = (type) => {
  const iconMap = { email: 'Message', sms: 'ChatDotRound', phone: 'Phone' }
  return iconMap[type] || 'Message'
}

// 获取联系人类型标签
const getContactTypeLabel = (type) => {
  const labelMap = { email: '邮件', sms: '短信', phone: '电话' }
  return labelMap[type] || type
}

// 同步 levels 到本地编辑状态
const syncLevelsToEdit = () => {
  if (levels.value.length > 0) {
    editingLevels.value = [...levels.value]
  }
}

// 监听 levels 变化
import { watch } from 'vue'
watch(levels, syncLevelsToEdit, { deep: true })

// 初始化
onMounted(async () => {
  await fetchLevels()
  syncLevelsToEdit()
  await fetchContacts()
})
</script>

<style scoped>
/* 弹窗样式覆盖 */
.contact-modal :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.contact-modal :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

.contact-modal :deep(.el-dialog__body) {
  padding: 0;
}
</style>
