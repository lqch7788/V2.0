/**
 * V1.1 系统设置模块结构提取器
 * 扫描 V1.1 15 个子模块的 .tsx 文件，提取：
 * - icon 引用（lucide-react）
 * - Tailwind className
 * - store action 签名
 * - API 端点
 *
 * 输出: scripts/diff/output/v1.1-*.json
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// V1.1 系统设置 15 子模块源文件路径
const V1_1_MODULES = [
  { key: 'system-config', files: ['src/pages/SystemConfig.tsx', 'src/pages/authority/SystemConfigManagement.tsx'] },
  { key: 'dictionary', files: ['src/pages/DictionaryManagement.tsx', 'src/pages/authority/DictionaryManagement.tsx'] },
  { key: 'department', files: ['src/pages/DepartmentSettings.tsx'] },
  { key: 'base-operations', files: ['src/pages/BaseOperationsCenter.tsx', 'src/pages/BaseOperationsCenterV2.tsx'] },
  { key: 'notification', files: ['src/pages/NotificationSettings.tsx'] },
  { key: 'audit-log', files: ['src/pages/AuditLog.tsx'] },
  { key: 'crop-variety', files: [
    'src/components/farm/crop-variety/CropVarietyManagement.tsx',
    'src/components/farm/crop-variety/CropVarietyTable.tsx',
    'src/components/farm/crop-variety/VarietyTree.tsx',
    'src/components/farm/crop-variety/CropVarietyDetail.tsx'
  ]},
  { key: 'pesticide-library', files: [
    'src/components/settings/pesticide-library/PesticideLibraryPage.tsx',
    'src/components/settings/pesticide-library/PesticideLibraryTable.tsx',
    'src/components/settings/pesticide-library/PesticideLibraryFilter.tsx',
    'src/components/settings/pesticide-library/PesticideSpecEditor.tsx',
    'src/components/settings/pesticide-library/modals/AddPesticideModal.tsx',
    'src/components/settings/pesticide-library/modals/EditPesticideModal.tsx',
    'src/components/settings/pesticide-library/modals/PesticideDetailModal.tsx'
  ]},
  { key: 'pest-disease-dict', files: [
    'src/components/settings/pest-disease-dict/PestDiseaseDictPage.tsx',
    'src/components/settings/pest-disease-dict/PestDiseaseDictTable.tsx',
    'src/components/settings/pest-disease-dict/PestDiseaseDictFilter.tsx',
    'src/components/settings/pest-disease-dict/modals/AddPestDiseaseModal.tsx',
    'src/components/settings/pest-disease-dict/modals/EditPestDiseaseModal.tsx',
    'src/components/settings/pest-disease-dict/modals/PestDiseaseDetailModal.tsx'
  ]},
  { key: 'fertilizer-library', files: [
    'src/components/settings/fertilizer-library/FertilizerLibraryPage.tsx',
    'src/components/settings/fertilizer-library/FertilizerLibraryTable.tsx',
    'src/components/settings/fertilizer-library/FertilizerLibraryFilter.tsx',
    'src/components/settings/fertilizer-library/modals/AddFertilizerModal.tsx',
    'src/components/settings/fertilizer-library/modals/EditFertilizerModal.tsx',
    'src/components/settings/fertilizer-library/modals/FertilizerDetailModal.tsx'
  ]},
  { key: 'warehouse', files: [
    'src/pages/WarehouseManagement.tsx',
    'src/pages/authority/WarehouseManagement.tsx'
  ]},
  { key: 'team', files: [
    'src/pages/Team.tsx',
    'src/pages/TeamManagement.tsx',
    'src/components/labor/team/TeamTable.tsx',
    'src/components/labor/team/TeamDetailModal.tsx',
    'src/components/labor/team/TeamAssignModal.tsx'
  ]},
  { key: 'user-permission', files: [
    'src/pages/authority/UserPermissionHub.tsx',
    'src/pages/authority/AuthorityConfiguration.tsx',
    'src/pages/authority/OrganizationManagement.tsx',
    'src/pages/authority/RoleManagement.tsx',
    'src/pages/authority/UserManagement.tsx',
    'src/pages/authority/UserAuthorityConfig.tsx',
    'src/pages/authority/UserBasePermission.tsx'
  ]},
  { key: 'approval-workflow', files: ['src/pages/ApprovalWorkflowConfig.tsx'] },
  { key: 'approval-level', files: ['src/pages/ApprovalLevelConfig.tsx'] }
]

const V1_1_ROOT = path.resolve(__dirname, '../../../V1.1')

// 正则提取器
const ICON_REGEX = /<([A-Z][a-zA-Z0-9]+)\s+(?:className|size)?(?:=\{[^}]*\})?[^/]*?\/>/g
const CLASSNAME_REGEX = /className=\{?["']([^"']+)["']\}?/g
const API_REGEX = /(?:api|enhancedApiClient|fetch)\.(get|post|put|delete|patch)\s*\(\s*[`'"]([^`'"]+)[`'"]/g
const STORE_REGEX = /use([A-Z][a-zA-Z]+Store)\s*\(\s*\)/g
const ACTION_REGEX = /(\w+):\s*async\s*\([^)]*\)\s*=>/g

function fileExists(p) {
  try { return fs.existsSync(p) } catch { return false }
}

function readFileSafe(p) {
  try { return fs.readFileSync(p, 'utf-8') } catch (e) { return '' }
}

function extractFromFile(filePath) {
  const content = readFileSafe(filePath)
  if (!content) return null

  // 提取 lucide icon（<Xxx className=...> 或 <Xxx w-6 h-6 ...>）
  const icons = new Set()
  let m
  while ((m = ICON_REGEX.exec(content)) !== null) {
    // 排除 HTML 元素（div, span, etc.）
    const tag = m[1]
    if (!['div', 'span', 'button', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'tr', 'td', 'th', 'tbody', 'thead'].includes(tag)) {
      icons.add(tag)
    }
  }

  // 提取 Tailwind className
  const classes = new Set()
  while ((m = CLASSNAME_REGEX.exec(content)) !== null) {
    m[1].split(/\s+/).forEach(c => c && classes.add(c))
  }

  // 提取 API 调用
  const apis = []
  while ((m = API_REGEX.exec(content)) !== null) {
    apis.push({ method: m[1].toUpperCase(), url: m[2] })
  }

  return { icons: [...icons], classes: [...classes], apis }
}

function main() {
  const output = {
    modules: {},
    totalIcons: 0,
    totalClasses: 0,
    totalApis: 0,
    missingFiles: []
  }

  for (const mod of V1_1_MODULES) {
    const modData = { files: [], allIcons: new Set(), allClasses: new Set(), allApis: [] }

    for (const rel of mod.files) {
      const abs = path.join(V1_1_ROOT, rel)
      if (!fileExists(abs)) {
        output.missingFiles.push(rel)
        continue
      }
      const data = extractFromFile(abs)
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

  // 写出结果
  const outDir = path.join(__dirname, 'output')
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'v1.1-icons.json'),
    JSON.stringify(Object.fromEntries(Object.entries(output.modules).map(([k, v]) => [k, v.icons])), null, 2))
  fs.writeFileSync(path.join(outDir, 'v1.1-classes.json'),
    JSON.stringify(Object.fromEntries(Object.entries(output.modules).map(([k, v]) => [k, v.classes])), null, 2))
  fs.writeFileSync(path.join(outDir, 'v1.1-apis.json'),
    JSON.stringify(Object.fromEntries(Object.entries(output.modules).map(([k, v]) => [k, v.apis])), null, 2))
  fs.writeFileSync(path.join(outDir, 'v1.1-summary.json'),
    JSON.stringify({ totalIcons: output.totalIcons, totalClasses: output.totalClasses, totalApis: output.totalApis, missingFiles: output.missingFiles }, null, 2))

  console.log('V1.1 结构提取完成:')
  console.log(`  唯一图标数: ${output.totalIcons}`)
  console.log(`  唯一 class 数: ${output.totalClasses}`)
  console.log(`  API 调用数: ${output.totalApis}`)
  console.log(`  缺失文件: ${output.missingFiles.length}`)
  if (output.missingFiles.length > 0) {
    console.log('  ' + output.missingFiles.slice(0, 5).join('\n  '))
  }
}

main()
