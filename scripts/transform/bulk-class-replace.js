/**
 * 批量 Tailwind class 替换器
 * 基于 class-rules.json 的 autoApplicable 规则集，将 V2.0 的 class 批量替换为 V1.1 的 class。
 *
 * 用法：
 *   node scripts/transform/bulk-class-replace.js --dry-run
 *   node scripts/transform/bulk-class-replace.js --apply
 *   node scripts/transform/bulk-class-replace.js --module=crop-variety --apply
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const args = process.argv.slice(2)
const DRY_RUN = !args.includes('--apply')
const moduleArg = args.find(a => a.startsWith('--module='))
const targetModule = moduleArg ? moduleArg.split('=')[1] : null

const RULES = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../mapping/class-rules.json'), 'utf-8'))
const AUTO_RULES = RULES.rules.filter(r => RULES.autoApplicable.includes(r.category))

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

function applyRule(content, rule) {
  // 简单字符串替换（避免替换完整单词时误伤）
  // 例：v2_pattern="shadow-sm" 不能匹配 "shadow-smlg"
  const fromRegex = new RegExp(`\\b${rule.v2_pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')
  const matches = content.match(fromRegex)
  if (!matches) return { content, count: 0 }
  return { content: content.replace(fromRegex, rule.v1_target), count: matches.length }
}

function transformFile(filePath, moduleKey) {
  const abs = path.join(V2_0_ROOT, filePath)
  if (!fs.existsSync(abs)) {
    return { file: filePath, status: 'missing' }
  }
  let content = fs.readFileSync(abs, 'utf-8')
  let totalChanges = 0
  const changes = []

  for (const rule of AUTO_RULES) {
    const { content: newContent, count } = applyRule(content, rule)
    if (count > 0) {
      content = newContent
      totalChanges += count
      changes.push(`${rule.category}: ${rule.v2_pattern} → ${rule.v1_target} (${count} 次)`)
    }
  }

  return { file: filePath, status: totalChanges > 0 ? 'changed' : 'unchanged', changeCount: totalChanges, changes, newContent: content }
}

function main() {
  const modules = targetModule ? [targetModule] : Object.keys(V2_0_MODULES_FILES)
  let totalChanges = 0
  let totalFiles = 0

  for (const mod of modules) {
    const files = V2_0_MODULES_FILES[mod] || []
    if (files.length === 0) continue
    console.log(`\n[${mod}] ${files.length} files`)

    for (const f of files) {
      const r = transformFile(f, mod)
      if (r.changeCount > 0) {
        console.log(`  ${r.changeCount} changes in ${f}`)
        for (const c of r.changes) {
          console.log(`    - ${c}`)
        }
        totalChanges += r.changeCount
        totalFiles++

        if (!DRY_RUN) {
          const abs = path.join(V2_0_ROOT, f)
          fs.writeFileSync(abs, r.newContent, 'utf-8')
          console.log(`    ✅ 已写入`)
        }
      }
    }
  }

  console.log(`\n=== ${DRY_RUN ? 'DRY-RUN' : 'APPLIED'} ===`)
  console.log(`总变更: ${totalChanges} 次，文件: ${totalFiles} 个`)
  if (DRY_RUN) {
    console.log('使用 --apply 参数实际应用替换')
  }
}

main()
