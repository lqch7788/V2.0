/**
 * 公告数据 Mock 数据
 * 用于 V2.0 公告管理页面
 */

// 公告列表 Mock 数据
export const mockNotices = [
  {
    id: '1',
    code: 'GG20260501-001',
    title: '关于加强安全生产管理的通知',
    type: '生产公告',
    category: '行政通知',
    priority: '高',
    status: '已发布',
    sender: '生产部',
    date: '2026-05-01',
    deadline: '2026-05-31',
    readCount: 156,
    recipients: '全体员工',
    content: '各部门、全体员工：为进一步加强公司安全生产管理，确保生产安全，现将有关事项通知如下：\n\n一、严格落实安全生产责任制\n二、加强隐患排查治理\n三、强化安全教育培训\n四、完善应急救援体系\n\n请各部门认真贯彻执行。',
    createTime: '2026-05-01 08:00:00',
    updateTime: '2026-05-01 08:00:00'
  },
  {
    id: '2',
    code: 'GG20260505-002',
    title: '关于举办技能培训班的通知',
    type: '行政公告',
    category: '培训通知',
    priority: '中',
    status: '已发布',
    sender: '人力资源部',
    date: '2026-05-05',
    deadline: '2026-05-20',
    readCount: 89,
    recipients: '生产技术人员',
    content: '各部门：为提升员工技能水平，公司决定举办技能培训班，具体安排如下：\n\n培训时间：2026年5月15日-20日\n培训地点：总部培训室\n培训内容：生产技能、安全操作规程\n\n请各部门合理安排工作，积极组织人员参加。',
    createTime: '2026-05-05 09:00:00',
    updateTime: '2026-05-05 09:00:00'
  },
  {
    id: '3',
    code: 'GG20260508-003',
    title: '设备维护保养计划',
    type: '生产公告',
    category: '生产计划',
    priority: '中',
    status: '审批中',
    sender: '设备部',
    date: '2026-05-08',
    deadline: '2026-05-25',
    readCount: 45,
    recipients: '生产班组长',
    content: '各部门：现将5月份设备维护保养计划下发，请各车间遵照执行：\n\n1. 5月10日-12日：A线设备检修\n2. 5月15日-17日：B线设备保养\n3. 5月20日-22日：C线设备检修\n\n维护期间请合理安排生产任务。',
    createTime: '2026-05-08 10:00:00',
    updateTime: '2026-05-08 10:00:00'
  },
  {
    id: '4',
    code: 'GG20260510-004',
    title: '关于采购物资招标公告',
    type: '行政公告',
    category: '采购通知',
    priority: '高',
    status: '草稿',
    sender: '采购部',
    date: '2026-05-10',
    deadline: '2026-05-30',
    readCount: 12,
    recipients: '供应商',
    content: '公司现对以下物资进行公开招标：\n1. 化肥原料\n2. 包装材料\n3. 农机配件\n\n有意者请于5月25日前提交投标文件。',
    createTime: '2026-05-10 08:00:00',
    updateTime: '2026-05-10 08:00:00'
  },
  {
    id: '5',
    code: 'GG20260512-005',
    title: '夏季防暑降温工作通知',
    type: '生产公告',
    category: '行政通知',
    priority: '中',
    status: '已发布',
    sender: '综合管理部',
    date: '2026-05-12',
    deadline: '2026-08-31',
    readCount: 234,
    recipients: '全体员工',
    content: '各部门、全体员工：\n\n随着夏季高温天气来临，为做好防暑降温工作，保障员工身体健康，现将有关要求通知如下：\n\n一、合理调整作息时间\n二、加强车间通风降温设施维护\n三、配备充足的防暑降温物品\n四、加强防暑降温知识宣传\n\n请各部门落实责任，确保安全生产。',
    createTime: '2026-05-12 09:00:00',
    updateTime: '2026-05-12 09:00:00'
  },
  {
    id: '6',
    code: 'GG20260515-006',
    title: '质量管理体系内审通知',
    type: '行政公告',
    category: '制度修订',
    priority: '高',
    status: '已发布',
    sender: '质量管理部',
    date: '2026-05-15',
    deadline: '2026-05-28',
    readCount: 67,
    recipients: '各部门负责人',
    content: '各部门：\n\n根据年度质量管理工作计划，公司将于5月25日-28日开展质量管理体系内部审核，请各部门做好准备工作：\n\n1. 整理完善相关记录文件\n2. 准备好现场检查配合工作\n3. 提前安排好陪审人员\n\n内审期间请保持正常工作秩序。',
    createTime: '2026-05-15 10:00:00',
    updateTime: '2026-05-15 10:00:00'
  }
]

// 公告模板 Mock 数据
export const mockTemplates = [
  {
    id: 'tpl001',
    code: 'TPL001',
    name: '生产通知模板',
    type: '生产公告',
    category: '生产计划',
    titleTemplate: '关于{申请人}的生产计划通知',
    contentTemplate: '各部门：\n现将近期生产计划通知如下：\n\n一、生产任务\n二、完成时间：{截止日期}\n三、责任人：{申请人}\n\n请各部门遵照执行。',
    priority: '中',
    status: '启用',
    usageCount: 15,
    createTime: '2026-01-15 08:00:00',
    updateTime: '2026-04-20 10:00:00'
  },
  {
    id: 'tpl002',
    code: 'TPL002',
    name: '培训通知模板',
    type: '行政公告',
    category: '培训通知',
    titleTemplate: '关于举办{申请人}培训班的通知',
    contentTemplate: '各部门：\n为提升员工技能水平，公司决定举办培训班，具体安排如下：\n\n一、培训内容\n二、培训时间：{申请日期}\n三、培训地点：公司培训室\n\n请各部门积极组织人员参加。',
    priority: '中',
    status: '启用',
    usageCount: 8,
    createTime: '2026-02-10 09:00:00',
    updateTime: '2026-04-15 14:00:00'
  },
  {
    id: 'tpl003',
    code: 'TPL003',
    name: '安全通知模板',
    type: '生产公告',
    category: '安全规范',
    titleTemplate: '关于加强{申请人}安全生产的通知',
    contentTemplate: '各部门、全体员工：\n为进一步加强安全生产管理，现将有关事项通知如下：\n\n一、严格落实安全生产责任制\n二、加强隐患排查\n三、强化安全培训\n\n请各部门认真贯彻执行。',
    priority: '高',
    status: '启用',
    usageCount: 23,
    createTime: '2026-01-20 10:00:00',
    updateTime: '2026-05-01 08:00:00'
  },
  {
    id: 'tpl004',
    code: 'TPL004',
    name: '采购通知模板',
    type: '行政公告',
    category: '采购通知',
    titleTemplate: '关于{申请人}物资采购的通知',
    contentTemplate: '各部门：\n公司现对以下物资进行采购招标：\n\n一、采购内容\n二、质量要求\n三、投标截止日期：{截止日期}\n\n有意者请及时联系采购部。',
    priority: '中',
    status: '停用',
    usageCount: 2,
    createTime: '2026-03-05 11:00:00',
    updateTime: '2026-03-05 11:00:00'
  }
]

// 公告类型选项
export const announcementTypes = ['全部', '生产公告', '行政公告']

// 优先级选项
export const priorityOptions = ['高', '中', '低']

// 状态选项
export const statusOptions = ['已发布', '审批中', '草稿']

// 公告分类选项
export const announcementCategories = [
  '行政通知',
  '培训通知',
  '采购通知',
  '活动通知',
  '制度修订',
  '生产公告',
  '生产计划',
  '技术标准',
  '安全规范'
]
