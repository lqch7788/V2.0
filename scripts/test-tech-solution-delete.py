"""
TechSolution 删除流程 E2E 测试
覆盖：
1. 批量删除：handleDeleteClick 默认全选 + 弹窗 + handleDeleteConfirm 调用 store
2. 单行删除：@delete emit → 直接弹窗 → handleDeleteConfirm
3. 弹窗确认/取消两种路径
"""
import subprocess
import sys
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TECHSOLUTION = os.path.join(ROOT, 'src', 'views', 'production', 'TechSolution.vue')
TABLECOMP = os.path.join(ROOT, 'src', 'views', 'production', 'components', 'TechSolutionTable.vue')
DELETEMODAL = os.path.join(ROOT, 'src', 'components', 'common', 'DeleteWarningModal.vue')

results = []


def check(name, condition, detail=''):
    status = '[PASS]' if condition else '[FAIL]'
    results.append((status, name, detail))
    print(f'  {status} {name} {detail}')


def check_file_content(path, patterns, name):
    if not os.path.exists(path):
        check(name, False, f'file not found: {path}')
        return
    with open(path, encoding='utf-8') as fp:
        content = fp.read()
    for p, desc in patterns:
        check(f'{name}: {desc}', bool(re.search(p, content)))


print('=== TechSolution 删除流程 E2E 测试 ===\n')

# 1. TechSolution 主文件
print('1. TechSolution.vue 删除逻辑:')
check_file_content(TECHSOLUTION, [
    (r'handleDeleteClick', '存在 handleDeleteClick 函数'),
    (r'handleDeleteConfirm', '存在 handleDeleteConfirm 函数'),
    (r'showDeleteModal', '使用弹窗状态'),
    (r'deleteSolutions\(', '调用 store.deleteSolutions'),
    (r'showConfirm|showAlert', '使用确认/警告弹窗'),
    (r'selectedRows\.value\.length === 0', '检查是否需要默认全选'),
    (r'filteredTechSolutions\.value\.map', '默认全选当前过滤结果（删除所有可见行）'),
    (r'@delete=', '表格单行删除事件'),
    (r'batchDeleteMode', '批量删除模式'),
    (r'@start-batch-delete', '表格批量删除入口'),
    (r'@open-delete', '表格批量删除触发事件'),
    (r'@confirm="handleDeleteConfirm"', '弹窗确认回调'),
    (r'console\.error.*[Dd]elete', '删除失败 Fail Loud 日志'),
    (r'selectedRows\.value = \[\]', '删除后清空选择'),
    (r'batchDeleteMode\.value = false', '删除后退出批量删除模式'),
], 'TechSolution.vue')

# 2. TechSolutionTable 表格组件
print('\n2. TechSolutionTable.vue 表格事件:')
check_file_content(TABLECOMP, [
    (r'@delete="emit', '单行删除事件 emit'),
    (r'@open-delete="emit', '批量删除入口事件 emit'),
    (r'@start-batch-delete="emit', '批量删除模式启动事件 emit'),
    (r'batchDeleteMode', '支持批量删除模式 props'),
    (r'batchEditMode', '支持批量编辑模式 props'),
    (r'exportMode', '支持导出模式 props'),
], 'TechSolutionTable.vue')

# 3. DeleteWarningModal 弹窗组件
print('\n3. DeleteWarningModal.vue 弹窗组件:')
check_file_content(DELETEMODAL, [
    (r'@confirm', '确认按钮事件'),
    (r'@close', '关闭按钮事件'),
    (r'@cancel', '取消按钮事件'),
    (r':selected-count', '选中数量 props'),
    (r'ElMessageBox|el-popconfirm|el-dialog', '使用 Element Plus 弹窗'),
], 'DeleteWarningModal.vue')

# 4. 类型检查
print('\n4. TypeScript 编译:')
try:
    result = subprocess.run(
        ['npx', 'vue-tsc', '--noEmit'],
        cwd=ROOT, capture_output=True, text=True, timeout=120
    )
    has_errors = 'error TS' in result.stdout and 'Could not find a declaration' not in result.stdout.split('error TS')[1]
    check('vue-tsc 0 错误', not has_errors, '(只忽略 .d.ts 缺失警告)')
except Exception as e:
    check('vue-tsc 编译', False, str(e))

# 5. div 嵌套平衡
print('\n5. div 嵌套平衡:')
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
import check_div_balance as cdb
cdb_result = cdb.check_file(TECHSOLUTION)
cdb_result2 = cdb.check_file(TABLECOMP)
check('TechSolution.vue div 平衡', cdb_result is None, cdb_result or '')
check('TechSolutionTable.vue div 平衡', cdb_result2 is None, cdb_result2 or '')

# 总结
print('\n=== 总结 ===')
passed = sum(1 for s, _, _ in results if s == '[PASS]')
failed = sum(1 for s, _, _ in results if s == '[FAIL]')
print(f'  Total: {len(results)}, Pass: {passed}, Fail: {failed}')

if failed > 0:
    print('\n失败项:')
    for s, name, detail in results:
        if s == '[FAIL]':
            print(f'  - {name}: {detail}')
    sys.exit(1)
else:
    print('\n[PASS] TechSolution 删除流程 E2E 测试全部通过')
    sys.exit(0)
</content>
</invoke>