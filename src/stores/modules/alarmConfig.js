/**
 * 报警配置 Store — iAGS Warning 集成
 * 三级警报级别配置 + 联系人管理
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getAlarmLevels,
  saveAlarmLevel as apiSaveLevel,
  getContacts,
  addContact as apiAddContact,
  deleteContact as apiDeleteContact
} from '@/api/alarmConfig'

// 级别默认值
export const LEVEL_DEFAULTS = [
  { id: 0, level: 1, levelName: '一级警报', notifyEmail: 1, notifySms: 0, notifyPhone: 0, updatedAt: null },
  { id: 0, level: 2, levelName: '二级警报', notifyEmail: 1, notifySms: 1, notifyPhone: 0, updatedAt: null },
  { id: 0, level: 3, levelName: '三级警报', notifyEmail: 1, notifySms: 1, notifyPhone: 1, updatedAt: null }
]

// 级别标签
export const LEVEL_LABELS = { 1: '一级警报', 2: '二级警报', 3: '三级警报' }

// 级别颜色
export const LEVEL_COLORS = {
  1: { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  2: { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  3: { text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' }
}

// 类型定义
export const useAlarmConfigStore = defineStore('alarmConfig', () => {
  // 状态
  const levels = ref([...LEVEL_DEFAULTS])
  const contacts = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // 获取级别列表
  const fetchLevels = async () => {
    isLoading.value = true
    error.value = null
    try {
      const data = await getAlarmLevels()
      if (Array.isArray(data) && data.length > 0) {
        // 合并API数据与默认值
        levels.value = LEVEL_DEFAULTS.map(def => {
          const api = data.find(d => d.level === def.level)
          return api ? { ...def, ...api } : def
        })
      }
    } catch (err) {
      console.warn('[AlarmConfigStore] 获取级别失败:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  // 保存级别配置
  const saveLevel = async (level, data) => {
    // 先更新本地状态
    levels.value = levels.value.map(l =>
      l.level === level ? { ...l, ...data } : l
    )
    try {
      await apiSaveLevel(level, {
        level_name: data.levelName,
        notify_email: data.notifyEmail,
        notify_sms: data.notifySms,
        notify_phone: data.notifyPhone
      })
    } catch (err) {
      console.warn('[AlarmConfigStore] 保存级别失败:', err)
    }
  }

  // 获取联系人列表
  const fetchContacts = async (level) => {
    try {
      const data = await getContacts(level)
      if (Array.isArray(data)) {
        contacts.value = data.map(c => ({
          id: c.id || 0,
          oid: c.oid,
          level: c.level,
          contactName: c.contact_name || c.contactName || '',
          contactInfo: c.contact_info || c.contactInfo || '',
          contactType: c.contact_type || c.contactType || 'email',
          status: c.status || 'active',
          createdAt: c.created_at || c.createdAt || null
        }))
      }
    } catch (err) {
      console.warn('[AlarmConfigStore] 获取联系人失败:', err)
    }
  }

  // 添加联系人
  const addContact = async (data) => {
    try {
      const response = await apiAddContact({
        level: data.level,
        contact_name: data.contactName,
        contact_info: data.contactInfo,
        contact_type: data.contactType
      })
      const newContact = {
        id: response?.id || 0,
        oid: response?.oid || String(Date.now()),
        level: data.level,
        contactName: data.contactName,
        contactInfo: data.contactInfo,
        contactType: data.contactType,
        status: 'active',
        createdAt: new Date().toISOString()
      }
      contacts.value = [newContact, ...contacts.value]
      return newContact
    } catch (err) {
      console.warn('[AlarmConfigStore] 添加联系人失败:', err)
      return null
    }
  }

  // 删除联系人
  const removeContact = async (oid) => {
    // 先更新本地状态
    contacts.value = contacts.value.filter(c => c.oid !== oid)
    try {
      await apiDeleteContact(oid)
      return true
    } catch (err) {
      console.warn('[AlarmConfigStore] 删除联系人失败:', err)
      return false
    }
  }

  return {
    levels,
    contacts,
    isLoading,
    error,
    fetchLevels,
    saveLevel,
    fetchContacts,
    addContact,
    removeContact
  }
})
