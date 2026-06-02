/**
 * V1.1 vs V2.0 结构对比器
 * 读取 v1.1-*.json 和 v2.0-*.json，生成差异报告：
 * - icon-missing-in-v2.json
 * - class-delta.json
 * - api-missing.json
 * - DASHBOARD.md（Markdown 总览）
 *
 * 输出: scripts/diff/output/
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, 'output')

// 读取 icon-map.json
const ICON_MAP = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../mapping/icon-map.json'), 'utf-8'))
const ICON_LOOKUP = ICON_MAP.mappings

function loadJson(name) {
  const p = path.join(OUT_DIR, name)
  if (!fs.existsSync(p)) {
    console.error(`Missing: ${name}. Run extract-v1.1-structure.js and extract-v2.0-structure.js first.`)
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(p, 'utf-8'))
}

function compareIcons(v1, v2) {
  const result = {}
  for (const mod of Object.keys(v1)) {
    const v1Icons = v1[mod] || []
    const v2Icons = v2[mod] || []
    const missingInV2 = []

    for (const icon of v1Icons) {
      // 查找映射后的 V2.0 icon
      const mapped = ICON_LOOKUP[icon]
      if (!mapped) {
        missingInV2.push({ v1Icon: icon, reason: 'no-mapping-in-icon-map.json' })
      } else if (!v2Icons.includes(mapped)) {
        missingInV2.push({ v1Icon: icon, mappedTo: mapped, reason: 'mapped-icon-not-used-in-v2' })
      }
    }

    if (missingInV2.length > 0) {
      result[mod] = missingInV2
    }
  }
  return result
}

function compareClasses(v1, v2) {
  const result = {}
  for (const mod of Object.keys(v1)) {
    const v1Classes = new Set(v1[mod] || [])
    const v2Classes = new Set(v2[mod] || [])
    const missingInV2 = [...v1Classes].filter(c => !v2Classes.has(c))
    const newInV2 = [...v2Classes].filter(c => !v1Classes.has(c))

    if (missingInV2.length > 0 || newInV2.length > 0) {
      result[mod] = {
        missingInV2: missingInV2.length,
        missingInV2List: missingInV2.slice(0, 20),
        newInV2: newInV2.length,
        newInV2List: newInV2.slice(0, 20)
      }
    }
  }
  return result
}

function compareApis(v1, v2) {
  const result = {}
  for (const mod of Object.keys(v1)) {
    const v1Apis = v1[mod] || []
    const v2Apis = v2[mod] || []
    const v1Urls = new Set(v1Apis.map(a => `${a.method} ${a.url}`))
    const v2Urls = new Set(v2Apis.map(a => `${a.method} ${a.url}`))

    const missingInV2 = [...v1Urls].filter(u => !v2Urls.has(u))
    const newInV2 = [...v2Urls].filter(u => !v1Urls.has(u))

    if (missingInV2.length > 0 || newInV2.length > 0) {
      result[mod] = {
        missingInV2: missingInV2.length,
        missingInV2List: missingInV2.slice(0, 10),
        newInV2: newInV2.length,
        newInV2List: newInV2.slice(0, 10)
      }
    }
  }
  return result
}

function generateDashboard(iconDelta, classDelta, apiDelta, v1Summary, v2Summary) {
  let md = '# V1.1 vs V2.0 系统设置模块差异仪表板\n\n'
  md += `生成时间: ${new Date().toISOString()}\n\n`
  md += '## 总览\n\n'
  md += `| 维度 | V1.1 唯一 | V2.0 唯一 | 差异 |\n`
  md += `|---|---|---|---|\n`
  md += `| 图标 | ${v1Summary.totalIcons} | ${v2Summary.totalIcons} | ${Object.values(iconDelta).reduce((s, arr) => s + arr.length, 0)} |\n`
  md += `| Tailwind class | ${v1Summary.totalClasses} | ${v2Summary.totalClasses} | ${Object.values(classDelta).reduce((s, d) => s + (d.missingInV2 || 0), 0)} |\n`
  md += `| API 调用 | ${v1Summary.totalApis} | ${v2Summary.totalApis} | ${Object.values(apiDelta).reduce((s, d) => s + (d.missingInV2 || 0), 0)} |\n\n`

  md += '## 缺失图标（V1.1 有但 V2.0 未用）\n\n'
  for (const [mod, items] of Object.entries(iconDelta)) {
    md += `### ${mod}\n`
    for (const it of items) {
      md += `- \`${it.v1Icon}\` → 应映射为 \`${it.mappedTo || '(无映射)'}\` (${it.reason})\n`
    }
    md += '\n'
  }

  md += '## class 差异\n\n'
  for (const [mod, d] of Object.entries(classDelta)) {
    md += `### ${mod}\n`
    md += `- V2.0 缺失 V1.1 的 class: **${d.missingInV2}** 个\n`
    md += `- V2.0 新增 V1.1 没有的 class: **${d.newInV2}** 个\n\n`
  }

  md += '## API 差异\n\n'
  for (const [mod, d] of Object.entries(apiDelta)) {
    md += `### ${mod}\n`
    md += `- V2.0 缺失 V1.1 的 API: **${d.missingInV2}** 个\n`
    md += `- V2.0 新增 V1.1 没有的 API: **${d.newInV2}** 个\n\n`
  }

  return md
}

function main() {
  console.log('加载 V1.1/V2.0 结构数据...')
  const v1Icons = loadJson('v1.1-icons.json')
  const v2Icons = loadJson('v2.0-icons.json')
  const v1Classes = loadJson('v1.1-classes.json')
  const v2Classes = loadJson('v2.0-classes.json')
  const v1Apis = loadJson('v1.1-apis.json')
  const v2Apis = loadJson('v2.0-apis.json')
  const v1Summary = loadJson('v1.1-summary.json')
  const v2Summary = loadJson('v2.0-summary.json')

  console.log('对比图标...')
  const iconDelta = compareIcons(v1Icons, v2Icons)
  fs.writeFileSync(path.join(OUT_DIR, 'icon-missing-in-v2.json'), JSON.stringify(iconDelta, null, 2))

  console.log('对比 class...')
  const classDelta = compareClasses(v1Classes, v2Classes)
  fs.writeFileSync(path.join(OUT_DIR, 'class-delta.json'), JSON.stringify(classDelta, null, 2))

  console.log('对比 API...')
  const apiDelta = compareApis(v1Apis, v2Apis)
  fs.writeFileSync(path.join(OUT_DIR, 'api-missing.json'), JSON.stringify(apiDelta, null, 2))

  console.log('生成 DASHBOARD.md...')
  const dashboard = generateDashboard(iconDelta, classDelta, apiDelta, v1Summary, v2Summary)
  fs.writeFileSync(path.join(OUT_DIR, 'DASHBOARD.md'), dashboard)

  // 总览输出
  console.log('\n=== 差异汇总 ===')
  const iconMissing = Object.values(iconDelta).reduce((s, arr) => s + arr.length, 0)
  const classMissing = Object.values(classDelta).reduce((s, d) => s + (d.missingInV2 || 0), 0)
  const apiMissing = Object.values(apiDelta).reduce((s, d) => s + (d.missingInV2 || 0), 0)
  console.log(`图标缺失: ${iconMissing}`)
  console.log(`class 缺失: ${classMissing}`)
  console.log(`API 缺失: ${apiMissing}`)
  console.log(`\n报告输出: ${path.join(OUT_DIR, 'DASHBOARD.md')}`)
}

main()
