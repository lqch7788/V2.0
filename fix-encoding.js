// Fix corrupted Chinese strings in SkillPanel.vue
const fs = require('fs');
let content = fs.readFileSync('src/views/labor/components/SkillPanel.vue', 'utf8');

// Replace patterns
const replacements = [
  ['技能档�/h1>', '技能档案</h1>'],
  ['技能证�/p>', '技能证书</p>'],
  ['已过期</p>', '已过期</p>'],
  ['搜索员工姓名、证书名称..', '搜索员工姓名、证书名称..'],
  ['技能类型" clearable', '技能类型" clearable'],
  ['农业技术" value="农业技术" />', '农业技术" value="农业技术" />'],
  ['证书状态" clearable', '证书状态" clearable'],
  ['全部状态" value="" />', '全部状态" value="" />'],
  ['已过期" value="已过期" />', '已过期" value="已过期" />'],
  ['操作按钮区-->', '操作按钮区-->'],
  ['技能类型" min-width="100">', '技能类型" min-width="100">'],
  ['状态" min-width="100">', '状态" min-width="100">'],
  ['label="10条" />', 'label="10条" />'],
  ['label="20条" />', 'label="20条" />'],
  ['label="50条" />', 'label="50条" />'],
  ['技能详情" width="600px">', '技能详情" width="600px">'],
  ['技能类型">>', '技能类型">'],
  ['状态">>', '状态">'],
  ['添加技能证� width="500px">', '添加技能证书" width="500px">'],
  ['请输入员工姓名" />', '请输入员工姓名" />'],
  ['请输入部门" />', '请输入部门" />'],
  ['请输入证书名称" />', '请输入证书名称" />'],
  ['技能类型" prop="skillType">', '技能类型" prop="skillType">'],
  ['请选择技能类型">', '请选择技能类型">'],
  ['请输入证书编号" />', '请输入证书编号" />'],
  ['请输入领发机构" />', '请输入领发机构" />'],
  ['请输入备注" />', '请输入备注" />'],
  ['筛选条件-->', '筛选条件-->'],
  ['技能展示格式', '技能展示格式'],
  ["'农业技术',", "'农业技术',"],
  ['加载技能数据失�', '加载技能数据失败'],
  ['已过期).length', '已过期).length'],
  ['筛选后的数据', '筛选后的数据'],
  ['清空日�编号', '清空日期编号'],
  ['触发下�', '触发下载'],
  ['技能证书信�,', '技能证书信息,'],
  ['员工姓名�', '员工姓名：'],
  ['部门�', '部门：'],
  ['证书名称�', '证书名称：'],
  ['证书编号�', '证书编号：'],
  ['领发机构�', '领发机构：'],
  ['发证日期�', '发证日期：'],
  ['到期日期�', '到期日期：'],
  ['备注�', '备注：'],
  ['导出时间�', '导出时间：'],
  ['创建技能记�', '创建技能记录'],
];

replacements.forEach(([old, newVal]) => {
  if (content.includes(old)) {
    content = content.split(old).join(newVal);
    console.log(`Replaced: ${old.substring(0, 40)}`);
  }
});

fs.writeFileSync('src/views/labor/components/SkillPanel.vue', content);
console.log('Done');
