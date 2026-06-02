/**
 * V2.0 系统设置模块结构提取器
 * 扫描 V2.0 15 个子模块的 .vue 文件，提取：
 * - icon 引用（@element-plus/icons-vue）
 * - Tailwind class
 * - store action 签名
 * - API 端点
 *
 * 输出: scripts/diff/output/v2.0-*.json
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const V2_0_MODULES = [
  { key: 'system-config', files: ['src/views/system/SystemConfig.vue'] },
  { key: 'dictionary', files: ['src/views/system/DictionaryManagement.vue'] },
  { key: 'department', files: ['src/views/system/DepartmentSettings.vue'] },
  { key: 'base-operations', files: ['src/views/system/BaseOperations.vue', 'src/views/system/BaseSettings.vue'] },
  { key: 'notification', files: ['src/views/system/NotificationSettings.vue'] },
  { key: 'audit-log', files: ['src/views/system/AuditLog.vue'] },
  { key: 'crop-variety', files: [
    'src/views/system/CropVarietyManagement.vue',
    'src/views/system/components/AddCropVarietyModal.vue',
    'src/views/system/components/CropVarietyDetail.vue',
    'src/views/system/components/VarietyTreeNode.vue'
  ]},
  { key: 'pesticide-library', files: [
    'src/views/system/pesticide-library/index.vue',
    'src/views/system/pesticide-library/components/PesticideSpecEditor.vue'
  ]},
  { key: 'pest-disease-dict', files: [
    'src/views/system/pest-disease-dict/index.vue'
  ]},
  { key: 'fertilizer-library', files: [
    'src/views/system/fertilizer-library/index.vue'
  ]},
  { key: 'warehouse', files: ['src/views/system/WarehouseManagement.vue'] },
  { key: 'team', files: ['src/views/system/TeamManagement.vue'] },
  { key: 'user-permission', files: [
    'src/views/system/authority/UserPermissionHub.vue',
    'src/views/system/authority/AuthorityConfiguration.vue',
    'src/views/system/authority/OrganizationManagement.vue',
    'src/views/system/authority/RoleManagement.vue',
    'src/views/system/authority/UserManagement.vue',
    'src/views/system/authority/UserAuthorityConfig.vue',
    'src/views/system/authority/UserBasePermission.vue'
  ]},
  { key: 'approval-workflow', files: ['src/views/system/ApprovalWorkflowConfig.vue'] },
  { key: 'approval-level', files: ['src/views/system/ApprovalLevelConfig.vue'] }
]

const V2_0_ROOT = path.resolve(__dirname, '../../')

// Vue 模板: <el-icon :size=...><Xxx /></el-icon> 或 <Xxx />
const EL_ICON_REGEX = /<([A-Z][a-zA-Z0-9]*)\s*(?:\:size=|\s*className=|\s*\/>)/g
const EL_COMPONENT_REGEX = /<([A-Z][a-zA-Z0-9]+)/g
const CLASS_REGEX = /class="([^"]+)"/g
const API_REGEX = /(?:api|request|enhancedApiClient)\.(get|post|put|delete|patch)\s*\(\s*[`'"]([^`'"]+)[`'"]/g
const STORE_REGEX = /use([A-Z][a-zA-Z]+Store)\s*\(\s*\)/g
const API_CALL_REGEX = /await\s+(\w+)\.(\w+)\s*\(/g

function fileExists(p) {
  try { return fs.existsSync(p) } catch { return false }
}

function readFileSafe(p) {
  try { return fs.readFileSync(p, 'utf-8') } catch (e) { return '' }
}

function extractFromVue(filePath) {
  const content = readFileSafe(filePath)
  if (!content) return null

  const icons = new Set()
  const classes = new Set()
  const apis = []
  const storeCalls = []

  // 提取组件名
  let m
  while ((m = EL_COMPONENT_REGEX.exec(content)) !== null) {
    const tag = m[1]
    // 仅收集 element-plus icons 与自定义组件
    if (['Setting', 'Tools', 'House', 'Lock', 'Guide', 'Bell', 'Aim', 'Notebook',
         'Document', 'Warning', 'WarnTriangleFilled', 'Sugar', 'Goods', 'Box',
         'User', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Close',
         'Check', 'CircleCheck', 'Delete', 'Edit', 'Plus', 'Search', 'Download',
         'View', 'Calendar', 'Clock', 'Refresh', 'Filter', 'MoreFilled', 'CopyDocument',
         'Select', 'Share', 'Message', 'ChatLineSquare', 'Key', 'Shield', 'Bug',
         'SemiSelect', 'FullScreen', 'CircleClose', 'Hash', 'OfficeBuilding',
         'MapLocation', 'Lightning', 'VideoCamera', 'Connection', 'Odometer',
         'Grid', 'Van', 'Coin', 'Monitor', 'Sugar', 'WarnTriangleFilled'].includes(tag)) {
      icons.add(tag)
    }
  }

  // 提取 class（HTML class= 与 Vue :class=）
  const classAttrRegex = /(?::|v-bind:)?class(?:Name)?=["']([^"']+)["']/g
  while ((m = classAttrRegex.exec(content)) !== null) {
    m[1].split(/\s+/).forEach(c => c && classes.add(c))
  }
  const classBraceRegex = /class(?:Name)?=\{`([^`]+)`\}/g
  while ((m = classBraceRegex.exec(content)) !== null) {
    m[1].split(/\s+/).forEach(c => c && classes.add(c))
  }

  // 提取 API 调用
  while ((m = API_REGEX.exec(content)) !== null) {
    apis.push({ method: m[1].toUpperCase(), url: m[2] })
  }

  // 提取 store action 调用
  while ((m = API_CALL_REGEX.exec(content)) !== null) {
    if (m[1].match(/Store|store/)) {
      storeCalls.push({ store: m[1], action: m[2] })
    }
  }

  return { icons: [...icons], classes: [...classes], apis, storeCalls }
}

function main() {
  const output = {
    modules: {},
    totalIcons: 0,
    totalClasses: 0,
    totalApis: 0,
    missingFiles: []
  }

  for (const mod of V2_0_MODULES) {
    const modData = { files: [], allIcons: new Set(), allClasses: new Set(), allApis: [] }

    for (const rel of mod.files) {
      const abs = path.join(V2_0_ROOT, rel)
      if (!fileExists(abs)) {
        output.missingFiles.push(rel)
        continue
      }
      const data = extractFromVue(abs)
      if (!data) continue

      modData.files.push({
        path: rel,
        iconCount: data.icons.length,
        classCount: data.classes.length,
        apiCount: data.apis.length
      })
      data.icons.forEach(i => modData.allIcons.add(i))
      data.classes.forEach(c => modData.allClasses.add(c))
      modData.allApis.push(...data.apis)
    }

    output.modules[mod.key] = {
      files: modData.files,
      icons: [...modData.allIcons].sort(),
      classes: [...modData.allClasses].sort(),
      apis: modData.allApis
    }
    output.totalIcons += modData.allIcons.size
    output.totalClasses += modData.allClasses.size
    output.totalApis += modData.allApis.length
  }

  const outDir = path.join(__dirname, 'output')
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'v2.0-icons.json'),
    JSON.stringify(Object.fromEntries(Object.entries(output.modules).map(([k, v]) => [k, v.icons])), null, 2))
  fs.writeFileSync(path.join(outDir, 'v2.0-classes.json'),
    JSON.stringify(Object.fromEntries(Object.entries(output.modules).map(([k, v]) => [k, v.classes])), null, 2))
  fs.writeFileSync(path.join(outDir, 'v2.0-apis.json'),
    JSON.stringify(Object.fromEntries(Object.entries(output.modules).map(([k, v]) => [k, v.apis])), null, 2))
  fs.writeFileSync(path.join(outDir, 'v2.0-summary.json'),
    JSON.stringify({ totalIcons: output.totalIcons, totalClasses: output.totalClasses, totalApis: output.totalApis, missingFiles: output.missingFiles }, null, 2))

  console.log('V2.0 结构提取完成:')
  console.log(`  唯一图标数: ${output.totalIcons}`)
  console.log(`  唯一 class 数: ${output.totalClasses}`)
  console.log(`  API 调用数: ${output.totalApis}`)
  console.log(`  缺失文件: ${output.missingFiles.length}`)
  if (output.missingFiles.length > 0) {
    console.log('  ' + output.missingFiles.slice(0, 5).join('\n  '))
  }
}

main()
