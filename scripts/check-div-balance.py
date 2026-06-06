"""Accurate .vue div balance checker using stack."""
import re
import os
import sys


def check_file(path):
    with open(path, encoding='utf-8') as fp:
        content = fp.read()
    m = re.search(r'<template>(.*?)</template>', content, re.DOTALL)
    if not m:
        return None
    template = m.group(1)

    # 移除注释
    template = re.sub(r'<!--.*?-->', '', template, flags=re.DOTALL)

    # 栈式追踪 div
    stack = []
    pos = 0
    while pos < len(template):
        # 匹配开始标签 <div> 或 <div ...>
        m_open = re.search(r'<div[\s>]', template[pos:])
        m_close = re.search(r'</div>', template[pos:])
        m_self = re.search(r'<div[^>]*/>', template[pos:])

        if m_self:
            # 自闭合 div，跳过
            pos += m_self.end()
            continue

        if m_open and (not m_close or m_open.start() < m_close.start()):
            stack.append(pos + m_open.start())
            pos += m_open.end()
        elif m_close:
            if not stack:
                return f'{path}: extra </div> at pos {pos + m_close.start()}'
            stack.pop()
            pos += m_close.end()
        else:
            break

    if stack:
        return f'{path}: unclosed div, depth={len(stack)}'
    return None


problems = []
for root, _, files in os.walk('src'):
    for f in files:
        if not f.endswith('.vue'):
            continue
        p = os.path.join(root, f)
        result = check_file(p)
        if result:
            problems.append(result)

if problems:
    print(f'Found {len(problems)} unbalanced div files:')
    for p in problems:
        print(f'  {p}')
    sys.exit(1)
else:
    print('ALL OK: all vue files have balanced div nesting')
    sys.exit(0)
