<template>
  <!-- 递归树节点渲染组件 -->
  <div class="org-tree-node">
    <div
      class="flex items-center gap-2 px-4 py-3 hover:bg-blue-50 border-b border-gray-100"
      :style="{ paddingLeft: `${level * 24 + 16}px` }"
    >
      <!-- 展开/折叠按钮 -->
      <el-button
        v-if="org.children && org.children.length > 0"
        text
        size="small"
        @click="toggleExpand(org.oid)"
        class="p-1"
      >
        <el-icon :size="16" :color="'#6b7280'">
          <component :is="expandedOids.has(org.oid) ? 'ArrowDown' : 'ArrowRight'" />
        </el-icon>
      </el-button>
      <el-icon v-else :size="16" class="text-transparent">-</el-icon>

      <!-- 组织信息 -->
      <div class="flex-1 flex items-center gap-4">
        <span class="font-medium text-gray-900">{{ org.name }}</span>
        <span class="text-sm text-gray-500">[{{ org.aid }}]</span>
        <el-tag v-if="org.orgType" size="small" type="info">{{ org.orgType }}</el-tag>
        <el-tag
          v-if="org.departmentId"
          size="small"
          type="success"
        >
          <el-icon :size="12"><OfficeBuilding /></el-icon>
          {{ org.departmentName || org.departmentId }}
        </el-tag>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center gap-1">
        <el-button text size="small" @click="handleAdd(org.oid)" title="新增子组织">
          <el-icon :size="16" color="#059669"><Plus /></el-icon>
        </el-button>
        <el-button text size="small" @click="handleEdit(org)" title="编辑">
          <el-icon :size="16" color="#2563eb"><Edit /></el-icon>
        </el-button>
        <el-button text size="small" @click="handleDelete(org.oid)" title="删除">
          <el-icon :size="16" color="#dc2626"><Delete /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 递归渲染子节点 -->
    <template v-if="org.children && org.children.length > 0 && expandedOids.has(org.oid)">
      <OrgTreeNode
        v-for="child in org.children"
        :key="child.oid"
        :org="child"
        :level="level + 1"
        :expandedOids="expandedOids"
        @toggle="toggleExpand"
        @add="handleAdd"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </template>
  </div>
</template>

<script setup>
import {
  OfficeBuilding,
  Plus,
  Edit,
  Delete,
  ArrowRight,
  ArrowDown
} from '@element-plus/icons-vue'

// 定义props
const props = defineProps({
  org: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    default: 0
  },
  expandedOids: {
    type: Object,
    required: true
  }
})

// 定义事件
const emit = defineEmits(['toggle', 'add', 'edit', 'delete'])

// 操作方法
const toggleExpand = (oid) => emit('toggle', oid)
const handleAdd = (oid) => emit('add', oid)
const handleEdit = (org) => emit('edit', org)
const handleDelete = (oid) => emit('delete', oid)
</script>
