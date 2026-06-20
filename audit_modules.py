#!/usr/bin/env python3
"""4 模块聚焦 Manifest - Approval/System/Labor/Farm"""
import json
from pathlib import Path

V1_ROOT = Path("D:/TMcrop/yuanxingtu/V1.1/src")
V2_ROOT = Path("D:/TMcrop/yuanxingtu/V2.0/src")

# 4 模块规则：V1.1 路径 glob 模式 → V2.0 路径 glob 模式
MODULE_RULES = [
    {
        "name": "approval",
        "v1_patterns": [
            "pages/FarmApproval.tsx",
            "pages/ProductionApproval.tsx",
            "pages/HrApproval.tsx",
            "pages/MaterialApproval.tsx",
            "pages/IndicatorBudgetApproval.tsx",
            "pages/PendingApproval.tsx",
            "pages/MyApplications.tsx",
            "pages/ApprovalLevelConfig.tsx",
            "pages/ApprovalWorkflowConfig.tsx",
            "components/approval/*.tsx",
            "pages/components/MaterialApproval/*.tsx",
        ],
        "v2_patterns": [
            "views/approval/*.vue",
            "views/approval/components/*.vue",
        ],
    },
    {
        "name": "system_authority",
        "v1_patterns": [
            "pages/authority/*.tsx",
        ],
        "v2_patterns": [
            "views/system/authority/*.vue",
            "views/system/*.vue",
        ],
    },
    {
        "name": "labor",
        "v1_patterns": [
            "pages/Labor/*.tsx",
            "pages/Labor/components/**/*.tsx",
            "components/labor/**/*.tsx",
        ],
        "v2_patterns": [
            "views/labor/*.vue",
            "views/labor/**/*.vue",
        ],
    },
    {
        "name": "farm",
        "v1_patterns": [
            "pages/farm/*.tsx",
            "components/farm/**/*.tsx",
        ],
        "v2_patterns": [
            "views/farm/*.vue",
            "views/farm/**/*.vue",
            "views/farm/components/**/*.vue",
        ],
    },
]

def collect_files(root, patterns):
    files = []
    for p in patterns:
        full = root / p
        if full.is_file():
            files.append(str(full.relative_to(root)).replace("\\", "/"))
        else:
            # glob
            for f in root.glob(p):
                if f.is_file():
                    files.append(str(f.relative_to(root)).replace("\\", "/"))
    return sorted(set(files))

def extract_basename(path):
    """从路径提取组件名（去掉前缀如 pages/components/MaterialApproval/...）"""
    name = Path(path).stem
    # 移除冗余前缀
    return name

def map_files(v1_files, v2_files):
    """按 basename 模糊匹配"""
    v2_by_name = {}
    for v2 in v2_files:
        bn = Path(v2).stem
        v2_by_name.setdefault(bn, []).append(v2)

    mapped = []
    unmapped_v1 = []
    for v1 in v1_files:
        bn = extract_basename(v1)
        # 直接匹配
        if bn in v2_by_name:
            for v2 in v2_by_name[bn]:
                mapped.append({"v1": v1, "v2": v2})
        else:
            # 去除 "Page" "Table" "Filters" "Modal" 等后缀再次匹配
            suffixes = ["Page", "Table", "Filters", "Modal", "Panel"]
            matched = False
            for sfx in suffixes:
                if bn.endswith(sfx):
                    short = bn[:-len(sfx)]
                    if short in v2_by_name:
                        for v2 in v2_by_name[short]:
                            mapped.append({"v1": v1, "v2": v2})
                            matched = True
                            break
            if not matched:
                unmapped_v1.append(v1)
    return mapped, unmapped_v1

result = {}
for rule in MODULE_RULES:
    name = rule["name"]
    v1_files = collect_files(V1_ROOT, rule["v1_patterns"])
    v2_files = collect_files(V2_ROOT, rule["v2_patterns"])
    mapped, unmapped_v1 = map_files(v1_files, v2_files)
    unmapped_v2 = [v for v in v2_files if v not in [m["v2"] for m in mapped]]

    result[name] = {
        "v1_total": len(v1_files),
        "v2_total": len(v2_files),
        "mapped_count": len(mapped),
        "unmapped_v1_count": len(unmapped_v1),
        "unmapped_v2_count": len(unmapped_v2),
        "v1_files": v1_files,
        "v2_files": v2_files,
        "mapped": mapped,
        "unmapped_v1": unmapped_v1,
        "unmapped_v2": unmapped_v2,
    }

with open("audit_4modules.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

# 输出摘要
for name, data in result.items():
    print(f"\n{'='*60}")
    print(f"模块: {name}")
    print(f"V1.1: {data['v1_total']} 文件 | V2.0: {data['v2_total']} 文件")
    print(f"已映射: {data['mapped_count']}")
    print(f"漏迁 P0-MISS: {data['unmapped_v1_count']}")
    print(f"孤儿 P0-EX:   {data['unmapped_v2_count']}")
    coverage = (data['mapped_count'] / data['v1_total'] * 100) if data['v1_total'] else 0
    print(f"覆盖率: {coverage:.1f}%")

print("\n📊 报告已保存: audit_4modules.json")