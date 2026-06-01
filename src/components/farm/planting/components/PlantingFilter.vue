<template>
  <!--
    种植筛选工具栏组件
    1:1 翻译自 V1.1 src/components/farm/planting/components/PlantingFilter.tsx
  -->
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
    <div class="flex flex-wrap gap-4 items-end">
      <!-- 作物品种 -->
      <div class="min-w-[120px]">
        <label class="block text-gray-700 text-sm mb-1">作物品种</label>
        <el-select
          :model-value="filters.cropName"
          placeholder="全部"
          class="w-full"
          @change="(val) => handleChange('cropName', val)"
        >
          <el-option
            v-for="crop in cropNames"
            :key="crop.value"
            :label="crop.label"
            :value="crop.value"
          />
        </el-select>
      </div>

      <!-- 种植批号 -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-gray-700 text-sm mb-1">种植批号</label>
        <el-input
          :model-value="filters.plantCode"
          placeholder="请输入种植批号"
          @update:model-value="(val) => handleChange('plantCode', val)"
        />
      </div>

      <!-- 来源批号（种源/育苗批号） -->
      <div class="flex-1 min-w-[150px]">
        <label class="block text-gray-700 text-sm mb-1">来源批号</label>
        <el-input
          :model-value="filters.sourceCode"
          placeholder="请输入来源批号"
          @update:model-value="(val) => handleChange('sourceCode', val)"
        />
      </div>

      <!-- 定植日期 -->
      <div class="min-w-[150px]">
        <label class="block text-gray-700 text-sm mb-1">定植日期</label>
        <el-date-picker
          :model-value="filters.transplantDate"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          class="w-full"
          @change="(val) => handleChange('transplantDate', val)"
        />
      </div>

      <!-- 种植区域/大棚位置（树形选择） -->
      <div class="min-w-[160px]">
        <label class="block text-gray-700 text-sm mb-1">大棚位置</label>
        <el-tree-select
          :model-value="filters.areaName || undefined"
          :data="areaTreeData"
          :props="treeProps"
          node-key="key"
          placeholder="全部"
          clearable
          filterable
          class="h-10 w-full"
          @change="(val) => handleChange('areaName', val || '')"
        />
      </div>

      <!-- 采收状态 -->
      <div class="min-w-[120px]">
        <label class="block text-gray-700 text-sm mb-1">采收状态</label>
        <el-select
          :model-value="filters.isHarvest"
          placeholder="全部"
          class="w-full"
          @change="(val) => handleChange('isHarvest', val)"
        >
          <el-option label="未采收" value="false" />
          <el-option label="已采收" value="true" />
        </el-select>
      </div>

      <!-- 按钮行 -->
      <div class="flex gap-2 items-end">
        <el-button type="primary" size="small" @click="emit('add')">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
        <el-button size="small" @click="emit('reset')">
          <el-icon><RefreshRight /></el-icon>
          重置
        </el-button>
        <el-button type="primary" size="small" @click="emit('search')">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * @description 种植筛选工具栏 - 1:1 翻译自 V1.1 PlantingFilter.tsx
 *              V1.1 回调函数 props（onChange/onSearch/onReset/onAdd）→
 *              V2.0 标准 emits（update:filters/search/reset/add），与父组件 Planting.vue 绑定一致
 */

import { computed } from 'vue'
import { Search, RefreshRight, Plus } from '@element-plus/icons-vue'

/**
 * @typedef {Object} PlantingFilters
 * @property {string} [cropName]       作物名称
 * @property {string} [plantCode]      种植批号
 * @property {string} [sourceCode]     来源批号
 * @property {string} [areaName]       区域名称
 * @property {string} [isHarvest]      是否已采收（'true' | 'false' | ''）
 * @property {string} [transplantDate] 定植日期（YYYY-MM-DD）
 * @property {string} [startDate]      开始日期
 * @property {string} [endDate]        结束日期
 * @property {string} [createBy]       记录人员
 * @property {string} [orgName]        组织名称
 * @property {number} [countMin]       定植数量最小值
 * @property {number} [countMax]       定植数量最大值
 */

/**
 * @typedef {Object} SelectOption
 * @property {string} value
 * @property {string} label
 */

/**
 * @typedef {Object} AreaOption
 * @property {string} value
 * @property {string} label
 * @property {string} [parent] 父区域 value（用于构建树形结构）
 */

/**
 * @typedef {Object} TreeSelectNode
 * @property {string} key
 * @property {string} title
 * @property {TreeSelectNode[]} [children]
 */

const props = defineProps({
  /**
   * 当前筛选条件（父组件拥有，受控）
   * @type {{ type: Object, default: () => PlantingFilters }}
   */
  filters: {
    type: Object,
    default: () => ({
      cropName: '',
      plantCode: '',
      sourceCode: '',
      areaName: '',
      isHarvest: '',
      transplantDate: '',
      startDate: '',
      endDate: '',
      createBy: '',
      orgName: '',
      countMin: undefined,
      countMax: undefined
    })
  },
  /**
   * 作物品种下拉选项
   * @type {{ type: Array, default: () => SelectOption[] }}
   */
  cropNames: {
    type: Array,
    default: () => []
  },
  /**
   * 区域下拉数据（可包含 parent 字段以构建树）
   * @type {{ type: Array, default: () => AreaOption[] }}
   */
  areas: {
    type: Array,
    default: () => []
  },
  /**
   * 状态下拉选项（V1.1 声明但模板中未使用，保留以保证 props 1:1）
   * @type {{ type: Array, default: () => SelectOption[] }}
   */
  statusOptions: {
    type: Array,
    default: () => []
  }
})

/**
 * emit 列表与 V1.1 props 一一对应：
 * - update:filters ← V1.1 onChange（任意字段变更即触发）
 * - search        ← V1.1 onSearch
 * - reset         ← V1.1 onReset
 * - add           ← V1.1 onAdd（V2.0 改 emit，符合 Vue3 习惯，父组件已用 @add 绑定）
 */
const emit = defineEmits(['update:filters', 'search', 'reset', 'add'])

/**
 * el-tree-select 的字段映射
 * V1.1 TreeSelectNode 使用 key/title；Element Plus 默认 children/label，需显式指定
 */
const treeProps = {
  label: 'title',
  value: 'key',
  children: 'children'
}

/**
 * 将扁平区域数据构建为树形结构（与 V1.1 useMemo 逻辑一致）
 * @type {import('vue').ComputedRef<TreeSelectNode[]>}
 */
const areaTreeData = computed(() => {
  /** @type {Map<string, TreeSelectNode>} */
  const nodeMap = new Map()
  /** @type {TreeSelectNode[]} */
  const roots = []

  // 先创建所有节点
  props.areas.forEach((a) => {
    nodeMap.set(a.value, { key: a.value, title: a.label, children: [] })
  })

  // 建立父子关系
  props.areas.forEach((a) => {
    const node = nodeMap.get(a.value)
    if (a.parent && nodeMap.has(a.parent)) {
      const parent = nodeMap.get(a.parent)
      if (!parent.children) parent.children = []
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  })

  // 清理空 children 数组
  const cleanChildren = (/** @type {TreeSelectNode[]} */ nodes) => {
    nodes.forEach((n) => {
      if (n.children && n.children.length === 0) delete n.children
      if (n.children) cleanChildren(n.children)
    })
  }
  cleanChildren(roots)

  return roots
})

/**
 * 单字段变更处理（V1.1 onChange 的 1:1 翻译）
 * - 接收字段名 + 新值
 * - 浅克隆 props.filters 并覆盖该字段
 * - 通过 update:filters 上抛新对象（V1.1 调用 onChange({...filters, [field]: val})）
 * @param {string} field
 * @param {*} value
 */
const handleChange = (field, value) => {
  emit('update:filters', { ...props.filters, [field]: value })
}
</script>
