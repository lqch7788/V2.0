/**
 * 批量 icon 替换器
 * 基于 icon-map.json 和 icon-missing-in-v2.json，将 V2.0 缺失的 lucide 图标替换为 EP 图标。
 *
 * 用法：
 *   node scripts/transform/bulk-icon-replace.js --dry-run    # 只输出 diff
 *   node scripts/transform/bulk-icon-replace.js --apply      # 应用替换
 *   node scripts/transform/bulk-icon-replace.js --module=系统配置 --apply
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIFF_OUT = path.resolve(__dirname, '../diff/output')

const args = process.argv.slice(2)
const DRY_RUN = !args.includes('--apply')
const moduleArg = args.find(a => a.startsWith('--module='))
const targetModule = moduleArg ? moduleArg.split('=')[1] : null

const ICON_MAP = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../mapping/icon-map.json'), 'utf-8')).mappings
const MISSING = JSON.parse(fs.readFileSync(path.join(DIFF_OUT, 'icon-missing-filtered.json'), 'utf-8'))

const V2_0_FILES = JSON.parse(fs.readFileSync(path.join(DIFF_OUT, 'v2.0-summary.json'), 'utf-8')).missingFiles || []
const V2_0_MODULES_FILES = {
  'system-config': ['src/views/system/SystemConfig.vue'],
  'dictionary': ['src/views/system/DictionaryManagement.vue'],
  'department': ['src/views/system/DepartmentSettings.vue'],
  'base-operations': ['src/views/system/BaseOperations.vue', 'src/views/system/BaseSettings.vue'],
  'notification': ['src/views/system/NotificationSettings.vue'],
  'audit-log': ['src/views/system/AuditLog.vue'],
  'crop-variety': ['src/views/system/CropVarietyManagement.vue', 'src/views/system/components/VarietyTreeNode.vue'],
  'pesticide-library': ['src/views/system/pesticide-library/index.vue'],
  'pest-disease-dict': ['src/views/system/pest-disease-dict/index.vue'],
  'fertilizer-library': ['src/views/system/fertilizer-library/index.vue'],
  'warehouse': ['src/views/system/WarehouseManagement.vue'],
  'team': ['src/views/system/TeamManagement.vue'],
  'user-permission': [
    'src/views/system/authority/UserPermissionHub.vue',
    'src/views/system/authority/AuthorityConfiguration.vue',
    'src/views/system/authority/OrganizationManagement.vue',
    'src/views/system/authority/RoleManagement.vue',
    'src/views/system/authority/UserManagement.vue',
    'src/views/system/authority/UserAuthorityConfig.vue',
    'src/views/system/authority/UserBasePermission.vue'
  ],
  'approval-workflow': ['src/views/system/ApprovalWorkflowConfig.vue'],
  'approval-level': ['src/views/system/ApprovalLevelConfig.vue']
}

const V2_0_ROOT = path.resolve(__dirname, '../../')

function transformFile(filePath, moduleKey) {
  const abs = path.join(V2_0_ROOT, filePath)
  if (!fs.existsSync(abs)) {
    return { file: filePath, status: 'missing' }
  }
  let content = fs.readFileSync(abs, 'utf-8')
  let changeCount = 0
  const changes = []

  // V1.1 icon → V2.0 icon 的反向映射（icon-map 是 v1→v2，这里要找哪些 v1 icon 的 v2 映射未在文件中使用）
  const moduleMissing = MISSING[moduleKey] || []
  for (const item of moduleMissing) {
    if (item.mappedTo) {
      // 检查 V2.0 文件是否使用 lucide 风格的字符串引用了 v1 icon 名
      // 由于 V2.0 使用 @element-plus/icons-vue，原始 lucide 引用通常不存在
      // 此替换器主要作用于：注释、icon name 字符串、测试代码
      const patterns = [
        { from: `"${item.v1Icon}"`, to: `"${item.mappedTo}"` },
        { from: `'${item.v1Icon}'`, to: `'${item.mappedTo}'` },
        { from: `name: "${item.v1Icon}"`, to: `name: "${item.mappedTo}"` }
      ]
      for (const p of patterns) {
        if (content.includes(p.from)) {
          content = content.split(p.from).join(p.to)
          changeCount++
          changes.push(`${p.from} → ${p.to}`)
        }
      }
    }
  }

  return { file: filePath, status: changeCount > 0 ? 'changed' : 'unchanged', changeCount, changes }
}

function main() {
  const modules = targetModule ? [targetModule] : Object.keys(MISSING)
  const results = []
  let totalChanges = 0

  for (const mod of modules) {
    const files = V2_0_MODULES_FILES[mod] || []
    console.log(`\n[${mod}] ${files.length} files`)
    for (const f of files) {
      const r = transformFile(f, mod)
      if (r.changeCount > 0) {
        console.log(`  ${r.changeCount} changes in ${f}`)
        for (const c of r.changes) {
          console.log(`    - ${c}`)
        }
        totalChanges += r.changeCount
        if (!DRY_RUN) {
          const abs = path.join(V2_0_ROOT, f)
          // 重新读取最新内容
          let content = fs.readFileSync(abs, 'utf-8')
          for (const c of r.changes) {
            const [from, to] = c.split(' → ')
            const [fromNorm, toNorm] = [from.replace(/^"|"$/g, ''), to.replace(/^"|"$/g, '')]
            // 反向应用（注意：from 含引号，to 含引号）
            content = content.split(`"${fromNorm}"`).join(`"${toNorm}"`)
            content = content.split(`'${fromNorm}'`).join(`'${toNorm}'`)
          }
          fs.writeFileSync(abs, content, 'utf-8')
          console.log(`    ✅ 已写入`)
        }
      }
      results.push(r)
    }
  }

  console.log(`\n=== ${DRY_RUN ? 'DRY-RUN' : 'APPLIED'} ===`)
  console.log(`总变更: ${totalChanges}`)
  if (DRY_RUN) {
    console.log('使用 --apply 参数实际应用替换')
  }
}

main()
