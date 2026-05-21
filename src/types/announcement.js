/**
 * 公告管理模块类型定义
 * 用于 V2.0 Vue3 系统
 */

// 公告项
export const Notice = {
  id: '',
  code: '',
  title: '',
  type: '',
  category: '',
  priority: '中',
  status: '草稿',
  sender: '',
  date: '',
  deadline: '',
  readCount: 0,
  recipients: '',
  content: ''
}

// 公告模板
export const AnnouncementTemplate = {
  id: '',
  code: '',
  name: '',
  type: '',
  category: '',
  titleTemplate: '',
  contentTemplate: '',
  content: '',
  priority: '',
  usageCount: 0,
  status: '',
  createTime: '',
  updateTime: ''
}

// 弹窗类型
export const AnnouncementModalType = {
  ADD: 'add',
  EDIT: 'edit',
  VIEW: 'view',
  SEND: 'send'
}

// 标签页类型
export const AnnouncementTab = {
  LIST: 'list',
  TEMPLATE: 'template'
}

// 公告统计
export const AnnouncementStats = {
  total: 0,
  published: 0,
  pending: 0,
  draft: 0
}
