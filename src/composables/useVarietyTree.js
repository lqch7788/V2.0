/**
 * 作物品种库树形状态管理 composable
 * 从 V1.1 useVarietyTree.ts 移植
 * 管理树形的展开状态、数据转换、搜索过滤等功能
 */

import { ref, computed, watch } from 'vue'
import { produceCategories, getProduceTypesByCategory } from '../data/produceCodeRule.js'
import { getAllVarieties } from '../services/cropVarietyService.js'
import {
  getCategoryExtensions,
  getTypeExtensions,
  getVarietyExtensions,
  getSubVariety1Extensions
} from '../services/cropVarietyExtensionService.js'

/**
 * 将已录入品种转换为以编码前缀分组的Map
 * key: 前8位编码 (category+type+variety+subVariety1)
 * value: 对应的已录入品种列表
 */
function buildRecordedVarietyMap(varieties) {
  const data = varieties ?? getAllVarieties()
  const map = new Map()

  for (const v of data) {
    const key = `${v.categoryCode}${v.typeCode}${v.varietyCode}${v.subVariety1Code || '000'}`
    if (!map.has(key)) {
      map.set(key, [])
    }
    map.get(key).push(v)
  }

  return map
}

/**
 * 判断某路径下是否有已录入品种
 */
function hasRecordedVariety(categoryCode, typeCode, varietyCode, subVariety1Code, recordedMap) {
  if (!recordedMap) return false
  const key = `${categoryCode}${typeCode}${varietyCode}${subVariety1Code || '000'}`
  return recordedMap.has(key) && recordedMap.get(key).length > 0
}

/**
 * 构建树形节点
 */
function buildTreeNode(level, name, code, path, recordedMap) {
  const children = []
  let hasChildrenFlag = false
  let childCount = 0
  let isRecorded = false

  if (level === 'category') {
    // 类别节点 - 构建类型子节点（预定义 + 用户扩展）
    const category = produceCategories.find(c => c.code === code)
    if (category) {
      const types = getProduceTypesByCategory(category.code)
      for (const type of types) {
        const typeNode = buildTreeNode(
          'type',
          type.name,
          type.code,
          { ...path, typeCode: type.code, typeName: type.name },
          recordedMap
        )
        children.push(typeNode)
        if (typeNode.hasChildren || typeNode.isRecorded) {
          hasChildrenFlag = true
        }
        childCount++
      }
      // 添加用户扩展的类型
      const extensionTypes = getTypeExtensions(category.code)
      for (const extType of extensionTypes) {
        if (types.some(t => t.code === extType.type_code)) continue
        const typeNode = buildTreeNode(
          'type',
          extType.type_name,
          extType.type_code,
          { ...path, typeCode: extType.type_code, typeName: extType.type_name },
          recordedMap
        )
        typeNode.isExtension = true
        typeNode.extensionId = extType.id
        children.push(typeNode)
        hasChildrenFlag = true
        childCount++
      }
    }
    isRecorded = hasRecordedVariety(code, '', '', undefined, recordedMap)
    if (children.length > 0) hasChildrenFlag = true
  } else if (level === 'type') {
    // 类型节点 - 构建品种子节点（预定义 + 用户扩展）
    const category = produceCategories.find(c => c.code === path.categoryCode)
    if (category) {
      const types = getProduceTypesByCategory(category.code)
      const type = types.find(t => t.code === code)
      if (type) {
        for (const variety of type.subCategories) {
          const varietyNode = buildTreeNode(
            'variety',
            variety.name,
            variety.code,
            { ...path, varietyCode: variety.code, varietyName: variety.name },
            recordedMap
          )
          children.push(varietyNode)
          if (varietyNode.hasChildren || varietyNode.isRecorded) {
            hasChildrenFlag = true
          }
          childCount++
        }
        // 添加用户扩展的品种
        const extensionVarieties = getVarietyExtensions(path.categoryCode, code)
        for (const extVar of extensionVarieties) {
          if (type.subCategories.some(v => v.code === extVar.variety_code)) continue
          const varietyNode = buildTreeNode(
            'variety',
            extVar.variety_name,
            extVar.variety_code,
            { ...path, varietyCode: extVar.variety_code, varietyName: extVar.variety_name },
            recordedMap
          )
          varietyNode.isExtension = true
          varietyNode.extensionId = extVar.id
          children.push(varietyNode)
          hasChildrenFlag = true
          childCount++
        }
      }
    }
    isRecorded = hasRecordedVariety(path.categoryCode, code, '', undefined, recordedMap)
    if (children.length > 0) hasChildrenFlag = true
  } else if (level === 'variety') {
    // 品种节点 - 构建子品种1子节点（预定义 + 用户扩展）
    const category = produceCategories.find(c => c.code === path.categoryCode)
    if (category) {
      const types = getProduceTypesByCategory(category.code)
      const type = types.find(t => t.code === path.typeCode)
      if (type) {
        const variety = type.subCategories.find(v => v.code === code)
        const existingSubCodes = new Set()

        if (variety?.subVarieties && variety.subVarieties.length > 0) {
          for (const sub of variety.subVarieties) {
            existingSubCodes.add(sub.code)
            const subNode = buildTreeNode(
              'subVariety1',
              sub.name,
              sub.code,
              { ...path, subVariety1Code: sub.code, subVariety1Name: sub.name },
              recordedMap
            )
            children.push(subNode)
            hasChildrenFlag = true
            childCount++
          }
          isRecorded = hasRecordedVariety(path.categoryCode, path.typeCode, code, undefined, recordedMap)
        }

        // 添加用户扩展的子品种1
        const extensionSubVarieties = getSubVariety1Extensions(path.categoryCode, path.typeCode, code)
        for (const extSub of extensionSubVarieties) {
          if (existingSubCodes.has(extSub.sub_variety1_code)) continue
          const subNode = buildTreeNode(
            'subVariety1',
            extSub.sub_variety1_name,
            extSub.sub_variety1_code,
            { ...path, subVariety1Code: extSub.sub_variety1_code, subVariety1Name: extSub.sub_variety1_name },
            recordedMap
          )
          subNode.isExtension = true
          subNode.extensionId = extSub.id
          children.push(subNode)
          hasChildrenFlag = true
          childCount++
        }

        // 如果既没有预定义子品种也没有扩展子品种，检查是否有已录入的详细品种
        if (children.length === 0) {
          const key = `${path.categoryCode}${path.typeCode}${code}000`
          const recordedVarieties = recordedMap.get(key) || []
          if (recordedVarieties.length > 0) {
            for (const rv of recordedVarieties) {
              const detailName = (!rv.detailVarietyCode || rv.detailVarietyCode === '00' || rv.detailVarietyCode === '')
                ? rv.subVariety1Name
                : (rv.detailVarietyName || rv.subVariety1Name)
              const detailNode = {
                key: `${key}${rv.detailVarietyCode || '00'}`,
                name: detailName,
                code: rv.detailVarietyCode || '00',
                level: 'detail',
                children: [],
                isLeaf: true,
                isRecorded: true,
                fullCropCode: rv.cropCode,
                recordedVariety: rv,
                path,
                hasChildren: false,
                childCount: 0
              }
              children.push(detailNode)
              hasChildrenFlag = true
              childCount++
            }
            isRecorded = true
          }
        }
      }
    }
  } else if (level === 'subVariety1') {
    // 子品种1节点 - 构建详细品种子节点
    const key = `${path.categoryCode}${path.typeCode}${path.varietyCode}${code}`
    const recordedVarieties = recordedMap.get(key) || []

    const sortedVarieties = [...recordedVarieties].sort((a, b) => {
      const codeA = parseInt(a.detailVarietyCode || '0', 10)
      const codeB = parseInt(b.detailVarietyCode || '0', 10)
      return codeA - codeB
    })

    for (const rv of sortedVarieties) {
      const detailName = (!rv.detailVarietyCode || rv.detailVarietyCode === '00' || rv.detailVarietyCode === '')
        ? rv.subVariety1Name
        : (rv.detailVarietyName || rv.subVariety1Name)

      const detailNode = {
        key: `${key}${rv.detailVarietyCode}`,
        name: detailName,
        code: rv.detailVarietyCode || '00',
        level: 'detail',
        children: [],
        isLeaf: true,
        isRecorded: true,
        fullCropCode: rv.cropCode,
        recordedVariety: rv,
        path,
        hasChildren: false,
        childCount: 0
      }
      children.push(detailNode)
      hasChildrenFlag = true
      childCount++
    }
    isRecorded = recordedVarieties.length > 0
  }

  const key = level === 'category'
    ? code
    : level === 'type'
    ? `${path.categoryCode}-${code}`
    : level === 'variety'
    ? `${path.categoryCode}-${path.typeCode}-${code}`
    : `${path.categoryCode}-${path.typeCode}-${path.varietyCode}-${code}`

  return {
    key,
    name,
    code,
    level,
    children,
    isLeaf: !hasChildrenFlag,
    isRecorded,
    path,
    hasChildren: hasChildrenFlag,
    childCount
  }
}

/**
 * 根据显示模式过滤树形数据
 */
function filterTreeByMode(nodes, mode) {
  if (mode === 'all') return nodes

  return nodes.filter(node => {
    if (node.isRecorded) return true
    if (node.hasChildren) {
      const filteredChildren = filterTreeByMode(node.children, mode)
      return filteredChildren.length > 0
    }
    return false
  }).map(node => ({
    ...node,
    children: node.hasChildren ? filterTreeByMode(node.children, mode) : []
  }))
}

/**
 * 根据关键词搜索树形节点
 */
function searchTree(nodes, keyword) {
  if (!keyword.trim()) return nodes

  const lowerKeyword = keyword.toLowerCase()

  const searchNode = (node) => {
    const nameMatch = (node.name || '').toLowerCase().includes(lowerKeyword)
    const recordedMatch = node.recordedVariety
      ? (node.recordedVariety.varietyName || '').toLowerCase().includes(lowerKeyword) ||
        node.recordedVariety.alias?.some(a => (a || '').toLowerCase().includes(lowerKeyword))
      : false

    const matchedChildren = []
    for (const child of node.children) {
      const matched = searchNode(child)
      if (matched) matchedChildren.push(matched)
    }

    if (nameMatch || recordedMatch) {
      return {
        ...node,
        children: node.children,
        hasChildren: node.hasChildren
      }
    }

    if (matchedChildren.length > 0) {
      return {
        ...node,
        children: matchedChildren,
        hasChildren: matchedChildren.length > 0
      }
    }

    return null
  }

  const result = []
  for (const node of nodes) {
    const matched = searchNode(node)
    if (matched) result.push(matched)
  }

  return result
}

/**
 * 收集所有节点key
 */
function collectAllKeys(nodes) {
  const keys = []
  const collect = (nodeList) => {
    for (const node of nodeList) {
      keys.push(node.key)
      if (node.children.length > 0) {
        collect(node.children)
      }
    }
  }
  collect(nodes)
  return keys
}

/**
 * 树形状态管理 composable
 */
export function useVarietyTree(
  searchKeywordRef,
  categoryFilterRef,
  displayMode = 'all',
  defaultExpandLevel = 'subVariety1',
  refreshKeyRef,
  recordedVarietiesRef
) {
  // 展开状态
  const expandedKeys = ref(new Set())
  const isExpandedInitialized = ref(false)

  // 构建已录入品种Map
  const recordedVarietyMap = computed(() =>
    buildRecordedVarietyMap(recordedVarietiesRef?.value)
  )

  // 构建完整树形数据
  const fullTreeData = computed(() => {
    const nodes = []
    const categoryFilter = categoryFilterRef?.value || ''

    for (const category of produceCategories) {
      if (categoryFilter && category.code !== categoryFilter) {
        continue
      }

      const categoryNode = buildTreeNode(
        'category',
        category.name,
        category.code,
        {
          categoryCode: category.code,
          categoryName: category.name,
          typeCode: '',
          typeName: '',
          varietyCode: '',
          varietyName: '',
        },
        recordedVarietyMap.value
      )

      if (categoryNode.hasChildren || categoryNode.isRecorded || categoryNode.children.length > 0) {
        nodes.push(categoryNode)
      }
    }

    // 添加用户扩展的类别
    const existingCategoryCodes = new Set(produceCategories.map(c => c.code))
    const extensionCategories = getCategoryExtensions()
    for (const extCat of extensionCategories) {
      if (categoryFilter && extCat.category_code !== categoryFilter) continue
      if (existingCategoryCodes.has(extCat.category_code)) continue
      const catNode = buildTreeNode(
        'category',
        extCat.category_name,
        extCat.category_code,
        {
          categoryCode: extCat.category_code,
          categoryName: extCat.category_name,
          typeCode: '',
          typeName: '',
          varietyCode: '',
          varietyName: '',
        },
        recordedVarietyMap.value
      )
      catNode.isExtension = true
      catNode.extensionId = extCat.id
      catNode._rawExtension = extCat
      nodes.push(catNode)
    }

    return nodes
  })

  // 应用显示模式过滤
  const modeFilteredTree = computed(() => {
    return filterTreeByMode(fullTreeData.value, displayMode)
  })

  // 应用搜索过滤
  const treeData = computed(() => {
    const keyword = searchKeywordRef?.value || ''
    if (!keyword.trim()) return modeFilteredTree.value
    return searchTree(modeFilteredTree.value, keyword)
  })

  // 统计信息
  const totalNodeCount = computed(() => collectAllKeys(fullTreeData.value).length)
  const recordedNodeCount = computed(() => {
    let count = 0
    const countRecorded = (nodes) => {
      for (const node of nodes) {
        if (node.isRecorded) count++
        if (node.children.length > 0) countRecorded(node.children)
      }
    }
    countRecorded(fullTreeData.value)
    return count
  })

  // 展开/折叠节点
  function toggleExpand(key) {
    const newSet = new Set(expandedKeys.value)
    if (newSet.has(key)) {
      newSet.delete(key)
    } else {
      newSet.add(key)
    }
    expandedKeys.value = newSet
  }

  // 展开所有
  function expandAll() {
    expandedKeys.value = new Set(collectAllKeys(treeData.value))
  }

  // 折叠所有
  function collapseAll() {
    expandedKeys.value = new Set()
  }

  // 展开到指定级别
  function expandToLevel(level) {
    const keysToExpand = []
    const expandNode = (nodes) => {
      for (const node of nodes) {
        keysToExpand.push(node.key)
        if (node.children.length > 0) {
          expandNode(node.children)
        }
      }
    }
    expandNode(treeData.value)
    expandedKeys.value = new Set(keysToExpand)
  }

  // 监听 treeData 变化，首次自动展开第一级
  watch(treeData, (newData) => {
    if (!isExpandedInitialized.value) {
      const initialKeys = newData.map(node => node.key)
      expandedKeys.value = new Set(initialKeys)
      isExpandedInitialized.value = true
    }
  }, { immediate: true })

  // 监听 refreshKey 变化，重新初始化展开
  if (refreshKeyRef) {
    watch(() => refreshKeyRef.value, () => {
      isExpandedInitialized.value = false
    })
  }

  return {
    treeData,
    expandedKeys,
    toggleExpand,
    expandAll,
    collapseAll,
    expandToLevel,
    totalNodeCount,
    recordedNodeCount
  }
}
