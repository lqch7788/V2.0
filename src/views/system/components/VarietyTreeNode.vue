<template>
  <!-- 节点行 -->
  <tr
    :class="[getLevelStyles(node.level, isExpanded)]"
    :style="{ cursor: node.isRecorded || node.level === 'detail' ? 'pointer' : 'default' }"
    @click="handleSelect"
  >
    <!-- 类别列 -->
    <td class="px-4 py-1">
      <div v-if="node.level === 'category'" class="flex items-center gap-2">
        <span v-if="!node.hasChildren" class="w-4 inline-block" />
        <el-button
          v-else
          size="small"
          text
          class="p-0 w-4 h-4"
          @click.stop="handleToggle"
          :title="isExpanded ? '点击折叠' : `展开 ${node.childCount} 个子节点`"
        >
          <el-icon :size="14" color="#059669">
            <ArrowDown v-if="isExpanded" /><ArrowRight v-else />
          </el-icon>
        </el-button>
        <span class="font-mono font-bold text-blue-600 text-sm">{{ node.code }}</span>
        <span class="font-semibold text-gray-800 text-sm">{{ node.name }}</span>
      </div>
      <span v-else class="text-gray-300">-</span>
    </td>

    <!-- 类型列 -->
    <td class="px-4 py-1">
      <div v-if="node.level === 'type'" class="flex items-center gap-2">
        <span v-if="!node.hasChildren" class="w-4 inline-block" />
        <el-button
          v-else
          size="small"
          text
          class="p-0 w-4 h-4"
          @click.stop="handleToggle"
          :title="isExpanded ? '点击折叠' : `展开 ${node.childCount} 个子节点`"
        >
          <el-icon :size="14" color="#059669">
            <ArrowDown v-if="isExpanded" /><ArrowRight v-else />
          </el-icon>
        </el-button>
        <span class="font-mono text-blue-600 font-medium text-sm">{{ node.code }}</span>
        <template v-if="isInlineEditingLocal">
          <div class="flex items-center gap-1">
            <input
              v-model="editValue"
              class="w-32 px-2 py-1 border border-amber-500 rounded text-sm focus:outline-none"
              @click.stop
              @keydown.enter="saveInlineEdit"
              @keydown.escape="cancelInlineEdit"
            />
            <el-button size="small" text @click.stop="saveInlineEdit">
              <el-icon :size="14"><Check /></el-icon>
            </el-button>
            <el-button size="small" text @click.stop="cancelInlineEdit">
              <el-icon :size="14"><Close /></el-icon>
            </el-button>
          </div>
        </template>
        <template v-else>
          <div class="flex items-center gap-2 group">
            <span class="text-gray-700 text-sm">{{ node.name }}</span>
            <template v-if="isTreeEditing">
              <el-button size="small" text class="opacity-0 group-hover:opacity-100" @click.stop="startInlineEdit">
                <el-icon :size="14"><Edit /></el-icon>
              </el-button>
              <el-button size="small" text class="opacity-0 group-hover:opacity-100" @click.stop="handleDelete">
                <el-icon :size="14"><Delete /></el-icon>
              </el-button>
            </template>
          </div>
        </template>
      </div>
      <span v-else class="text-gray-300">-</span>
    </td>

    <!-- 品种列 -->
    <td class="px-4 py-1">
      <div v-if="node.level === 'variety'" class="flex items-center gap-2">
        <span v-if="!node.hasChildren" class="w-4 inline-block" />
        <el-button
          v-else
          size="small"
          text
          class="p-0 w-4 h-4"
          @click.stop="handleToggle"
          :title="isExpanded ? '点击折叠' : `展开 ${node.childCount} 个子节点`"
        >
          <el-icon :size="14" color="#059669">
            <ArrowDown v-if="isExpanded" /><ArrowRight v-else />
          </el-icon>
        </el-button>
        <span class="font-mono text-blue-600 text-sm">{{ node.code }}</span>
        <template v-if="isInlineEditingLocal">
          <div class="flex items-center gap-1">
            <input
              v-model="editValue"
              class="w-32 px-2 py-1 border border-amber-500 rounded text-sm focus:outline-none"
              @click.stop
              @keydown.enter="saveInlineEdit"
              @keydown.escape="cancelInlineEdit"
            />
            <el-button size="small" text @click.stop="saveInlineEdit">
              <el-icon :size="14"><Check /></el-icon>
            </el-button>
            <el-button size="small" text @click.stop="cancelInlineEdit">
              <el-icon :size="14"><Close /></el-icon>
            </el-button>
          </div>
        </template>
        <template v-else>
          <div class="flex items-center gap-2 group">
            <span class="text-gray-700 text-sm">{{ node.name }}</span>
            <span v-if="node.hasChildren" class="text-xs text-gray-400 ml-1">({{ node.childCount }})</span>
            <template v-if="isTreeEditing">
              <el-button size="small" text class="opacity-0 group-hover:opacity-100" @click.stop="startInlineEdit">
                <el-icon :size="14"><Edit /></el-icon>
              </el-button>
              <el-button size="small" text class="opacity-0 group-hover:opacity-100" @click.stop="handleDelete">
                <el-icon :size="14"><Delete /></el-icon>
              </el-button>
            </template>
          </div>
        </template>
      </div>
      <span v-else class="text-gray-300">-</span>
    </td>

    <!-- 子品种列 -->
    <td class="px-4 py-1">
      <div v-if="node.level === 'subVariety1'" class="flex items-center gap-2">
        <span v-if="!node.hasChildren" class="w-4 inline-block" />
        <el-button
          v-else
          size="small"
          text
          class="p-0 w-4 h-4"
          @click.stop="handleToggle"
          :title="isExpanded ? '点击折叠' : `展开 ${node.childCount} 个子节点`"
        >
          <el-icon :size="14" color="#059669">
            <ArrowDown v-if="isExpanded" /><ArrowRight v-else />
          </el-icon>
        </el-button>
        <span class="font-mono text-green-600 text-sm">{{ node.code }}</span>
        <template v-if="isInlineEditingLocal">
          <div class="flex items-center gap-1">
            <input
              v-model="editValue"
              class="w-32 px-2 py-1 border border-amber-500 rounded text-sm focus:outline-none"
              @click.stop
              @keydown.enter="saveInlineEdit"
              @keydown.escape="cancelInlineEdit"
            />
            <el-button size="small" text @click.stop="saveInlineEdit">
              <el-icon :size="14"><Check /></el-icon>
            </el-button>
            <el-button size="small" text @click.stop="cancelInlineEdit">
              <el-icon :size="14"><Close /></el-icon>
            </el-button>
          </div>
        </template>
        <template v-else>
          <div class="flex items-center gap-2 group">
            <span class="text-gray-700 text-sm">{{ node.name }}</span>
            <span v-if="node.isRecorded" class="text-xs text-green-600 ml-1">✓</span>
            <template v-if="isTreeEditing">
              <el-button size="small" text class="opacity-0 group-hover:opacity-100" @click.stop="startInlineEdit">
                <el-icon :size="14"><Edit /></el-icon>
              </el-button>
              <el-button size="small" text class="opacity-0 group-hover:opacity-100" @click.stop="handleDelete">
                <el-icon :size="14"><Delete /></el-icon>
              </el-button>
            </template>
          </div>
        </template>
      </div>
      <span v-else class="text-gray-300">-</span>
    </td>

    <!-- 详细名称列 -->
    <td class="px-4 py-1">
      <div v-if="node.level === 'detail'" class="flex items-center gap-2">
        <span class="font-mono text-green-600 text-sm">{{ node.code }}</span>
        <span class="font-medium text-emerald-700 text-sm">{{ node.name }}</span>
      </div>
      <span v-else-if="node.level === 'subVariety1' && node.isRecorded" class="text-xs text-gray-500">
        ({{ node.childCount }})
      </span>
      <span v-else-if="node.isRecorded" class="text-green-600 text-sm">✓ 已录入</span>
      <span v-else class="text-gray-300">-</span>
    </td>

    <!-- 编码列 -->
    <td class="px-4 py-1">
      <span v-if="node.level === 'detail'" class="font-mono text-blue-600 text-sm font-medium">
        {{ getFullCropCode() }}
      </span>
      <span v-else class="text-gray-300">-</span>
    </td>

    <!-- 状态 -->
    <td class="px-4 py-1 whitespace-nowrap">
      <span v-if="node.isRecorded || node.level === 'detail'" class="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
        启用
      </span>
      <span v-else-if="node.hasChildren" class="text-xs text-blue-600">{{ node.childCount }}</span>
      <span v-else class="text-xs text-gray-400">待录入</span>
    </td>

    <!-- 操作 -->
    <td class="px-4 py-1 whitespace-nowrap">
      <div class="flex items-center gap-1">
        <!-- 查看按钮 -->
        <el-button
          v-if="node.isRecorded || node.level === 'detail'"
          size="small"
          text
          class="p-1 hover:text-emerald-600 hover:bg-emerald-50"
          @click.stop="handleSelect"
          title="查看详情"
        >
          <el-icon :size="14"><View /></el-icon>
        </el-button>
        <!-- 新增按钮 -->
        <el-button
          v-if="node.level !== 'detail'"
          size="small"
          text
          class="p-1 hover:text-blue-600 hover:bg-blue-50"
          @click.stop="handleAdd"
          title="新增子品种"
        >
          <el-icon :size="14"><Plus /></el-icon>
        </el-button>
        <!-- 编辑按钮 -->
        <el-button
          v-if="node.isRecorded || node.isExtension"
          size="small"
          text
          class="p-1 hover:text-amber-600 hover:bg-amber-50"
          @click.stop="handleEdit"
          :title="node.isExtension ? '编辑' : '编辑品种'"
        >
          <el-icon :size="14"><Edit /></el-icon>
        </el-button>
        <!-- 删除按钮 -->
        <el-button
          v-if="node.isExtension || node.recordedVariety"
          size="small"
          text
          class="p-1 hover:text-red-600 hover:bg-red-50"
          @click.stop="handleDelete"
          :title="node.isExtension ? '删除' : '删除品种'"
        >
          <el-icon :size="14"><Delete /></el-icon>
        </el-button>
      </div>
    </td>
  </tr>

  <!-- 内联新增表单 -->
  <tr v-if="isInlineAdding" class="bg-yellow-50 border-l-4 border-yellow-400">
    <td class="px-4 py-2" colspan="8">
      <div class="flex items-center gap-4">
        <span class="text-sm font-medium text-gray-600 whitespace-nowrap">
          <template v-if="inlineAddState?.level === 'type'">新增类型：</template>
          <template v-if="inlineAddState?.level === 'variety'">新增品种：</template>
          <template v-if="inlineAddState?.level === 'subVariety1'">新增子品种：</template>
        </span>
        <input
          :value="inlineAddCode"
          @input="e => $emit('inlineAddCodeChange', e.target.value)"
          placeholder="编号"
          class="w-24 px-2 py-1.5 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          :value="inlineAddName"
          @input="e => $emit('inlineAddNameChange', e.target.value)"
          placeholder="名称"
          class="w-40 px-2 py-1.5 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <el-button type="primary" size="small" @click.stop="$emit('inlineAddSave')">保存</el-button>
        <el-button size="small" @click.stop="$emit('inlineAddCancel')">取消</el-button>
      </div>
    </td>
  </tr>

  <!-- 递归渲染子节点 -->
  <template v-if="isExpanded && node.hasChildren">
    <VarietyTreeNode
      v-for="child in node.children"
      :key="child.key"
      :node="child"
      :expanded-keys="expandedKeys"
      :is-tree-editing="isTreeEditing"
      :inline-add-state="inlineAddState"
      :inline-add-code="inlineAddCode"
      :inline-add-name="inlineAddName"
      @toggle-expand="key => $emit('toggleExpand', key)"
      @select="variety => $emit('select', variety)"
      @add="node => $emit('add', node)"
      @edit="variety => $emit('edit', variety)"
      @delete="variety => $emit('delete', variety)"
      @inline-add-code-change="val => $emit('inlineAddCodeChange', val)"
      @inline-add-name-change="val => $emit('inlineAddNameChange', val)"
      @inline-add-save="$emit('inlineAddSave')"
      @inline-add-cancel="$emit('inlineAddCancel')"
      @refresh="$emit('refresh')"
    />
  </template>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Check, Close, View, Plus, Edit, Delete, ArrowDown, ArrowRight } from '@element-plus/icons-vue'
import { showAlert, showConfirm } from '@/lib/dialogService'
import * as extensionService from '@/services/cropVarietyExtensionService'

defineOptions({ name: 'VarietyTreeNode' })

const props = defineProps({
  node: { type: Object, required: true },
  expandedKeys: { type: Array, default: () => [] },
  isTreeEditing: { type: Boolean, default: false },
  inlineAddState: { type: Object, default: null },
  inlineAddCode: { type: String, default: '' },
  inlineAddName: { type: String, default: '' }
})

const emit = defineEmits([
  'toggleExpand',
  'select',
  'add',
  'edit',
  'delete',
  'refresh',
  'inlineAddCodeChange',
  'inlineAddNameChange',
  'inlineAddSave',
  'inlineAddCancel'
])

// 内联编辑状态
const isInlineEditingLocal = ref(false)
const editValue = ref('')

const isExpanded = computed(() => props.expandedKeys.includes(props.node.key))
const isInlineAdding = computed(() =>
  props.inlineAddState?.active && props.inlineAddState?.parentKey === props.node.key
)

// 获取层级样式
function getLevelStyles(level, isExpandedFlag) {
  const base = 'border-b border-gray-100 hover:bg-blue-50 transition-colors'
  switch (level) {
    case 'category': return `${base} bg-gradient-to-r from-blue-50 to-indigo-50 font-semibold`
    case 'type': return `${base} bg-gray-50`
    case 'variety': return `${base} ${isExpandedFlag ? 'bg-green-100' : ''}`
    case 'subVariety1': return `${base} ${isExpandedFlag ? 'bg-emerald-50' : ''}`
    case 'detail': return `${base} bg-white`
    default: return base
  }
}

// 构建完整11位作物编码显示
function getFullCropCode() {
  if (props.node.level === 'detail') {
    const { categoryCode, typeCode, varietyCode, subVariety1Code } = props.node.path
    const sub1 = subVariety1Code || props.node.code || '000'
    const detail = props.node.code || '00'
    return `${categoryCode}${typeCode}${varietyCode}${sub1}${detail}`
  }
  return '-'
}

// 处理展开/折叠
function handleToggle(e) {
  e.stopPropagation()
  if (props.node.hasChildren) {
    emit('toggleExpand', props.node.key)
  }
}

// 处理点击选择
function handleSelect() {
  if (props.node.level === 'detail' && props.node.recordedVariety) {
    emit('select', props.node.recordedVariety)
  } else if (props.node.level === 'subVariety1' && props.node.isRecorded) {
    const { categoryCode, typeCode, varietyCode, subVariety1Code, subVariety1Name } = props.node.path
    const mockVariety = {
      id: props.node.key,
      cropCode: `${categoryCode}${typeCode}${varietyCode}${subVariety1Code || props.node.code}00`,
      categoryCode,
      categoryName: props.node.path.categoryName,
      typeCode,
      typeName: props.node.path.typeName,
      varietyCode,
      subVariety1Code: subVariety1Code || props.node.code,
      subVariety1Name: subVariety1Name || props.node.name,
      varietyName: props.node.path.varietyName,
      alias: [],
      status: 'active',
      createTime: '',
      updateTime: ''
    }
    emit('select', mockVariety)
  }
}

// 处理新增
function handleAdd(e) {
  e.stopPropagation()
  emit('add', props.node)
}

// 处理编辑
function handleEdit(e) {
  e.stopPropagation()
  if (props.node.recordedVariety) {
    emit('edit', props.node.recordedVariety)
  } else if (props.node.isExtension) {
    // 扩展节点编辑
    const levelNames = { category: '类别', type: '类型', variety: '品种', subVariety1: '子品种' }
    const levelName = levelNames[props.node.level] || props.node.level
    const newName = prompt(`请输入新的${levelName}名称：`, props.node.name)
    if (newName && newName.trim() && newName.trim() !== props.node.name) {
      const extensionId = props.node.extensionId
      const promise = props.node.level === 'category' && extensionId
        ? extensionService.updateCategoryExtension(extensionId, newName.trim())
        : props.node.level === 'type' && extensionId
        ? extensionService.updateTypeExtension(extensionId, newName.trim())
        : props.node.level === 'variety' && extensionId
        ? extensionService.updateVarietyExtension(extensionId, newName.trim())
        : props.node.level === 'subVariety1' && extensionId
        ? extensionService.updateSubVariety1Extension(extensionId, newName.trim())
        : null
      if (promise) {
        promise.then(() => emit('refresh')).catch(err => showAlert('更新失败: ' + err.message))
      }
    }
  }
}

// 处理删除
async function handleDelete(e) {
  e.stopPropagation()
  if (props.node.recordedVariety) {
    emit('delete', props.node.recordedVariety)
  } else if (props.node.isExtension) {
    const levelNames = { category: '类别', type: '类型', variety: '品种', subVariety1: '子品种' }
    const levelName = levelNames[props.node.level] || props.node.level
    if (await showConfirm(`确定要删除这个${levelName} "${props.node.name}" 吗？此操作不可恢复。`)) {
      const extensionId = props.node.extensionId
      const promise = props.node.level === 'category' && extensionId
        ? extensionService.deleteCategoryExtension(extensionId)
        : props.node.level === 'type' && extensionId
        ? extensionService.deleteTypeExtension(extensionId)
        : props.node.level === 'variety' && extensionId
        ? extensionService.deleteVarietyExtension(extensionId)
        : props.node.level === 'subVariety1' && extensionId
        ? extensionService.deleteSubVariety1Extension(extensionId)
        : null
      if (promise) {
        promise.then(() => emit('refresh')).catch(err => showAlert('删除失败: ' + err.message))
      }
    }
  }
}

// 开始内联编辑
function startInlineEdit() {
  editValue.value = props.node.name
  isInlineEditingLocal.value = true
}

// 保存内联编辑
async function saveInlineEdit() {
  if (!editValue.value.trim() || editValue.value.trim() === props.node.name) {
    isInlineEditingLocal.value = false
    return
  }

  const extensionId = props.node.extensionId
  try {
    if (props.node.level === 'type' && extensionId) {
      await extensionService.updateTypeExtension(extensionId, editValue.value.trim())
    } else if (props.node.level === 'variety' && extensionId) {
      await extensionService.updateVarietyExtension(extensionId, editValue.value.trim())
    } else if (props.node.level === 'subVariety1' && extensionId) {
      await extensionService.updateSubVariety1Extension(extensionId, editValue.value.trim())
    }
    emit('refresh')
  } catch (err) {
    await showAlert('更新失败: ' + err.message)
  }
  isInlineEditingLocal.value = false
}

// 取消内联编辑
function cancelInlineEdit() {
  isInlineEditingLocal.value = false
  editValue.value = ''
}
</script>
