<template>
  <!-- 标记管理弹窗 - 纯div结构 -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" @click.self="onClose">
    <div class="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[85vh] flex flex-col">
      <!-- 标题栏 - 渐变背景 -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-500 to-purple-600 rounded-t-xl">
        <h3 class="text-lg font-semibold text-white flex items-center gap-2">
          <el-icon style="color: white;"><PriceTag /></el-icon>
          标记管理
        </h3>
        <el-icon style="color: white; cursor: pointer;" @click="onClose"><Close /></el-icon>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 overflow-y-auto p-4">
        <div class="grid grid-cols-2 gap-4">
          <!-- 左侧：标记树 -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2">可用标记</h4>
            <div class="border border-gray-200 rounded-lg p-2 max-h-80 overflow-y-auto">
              <div v-if="marks.length === 0" class="py-8 text-center text-sm text-gray-400">
                暂无可用的标记
              </div>
              <el-tree
                v-else
                :data="markTreeData"
                node-key="id"
                :props="{ label: 'name', children: 'children' }"
                @node-click="handleMarkSelect"
                :highlight-current="true"
              >
                <template #default="{ node, data }">
                  <span class="flex items-center gap-2">
                    <span v-if="data.color" class="w-3 h-3 rounded-full" :style="{ backgroundColor: data.color }"></span>
                    <span>{{ data.name }}</span>
                  </span>
                </template>
              </el-tree>
            </div>

            <!-- 选中标记预览 -->
            <div v-if="selectedMark" class="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div class="flex items-center gap-2">
                <span v-if="selectedMark.color" class="w-4 h-4 rounded-full" :style="{ backgroundColor: selectedMark.color }"></span>
                <span class="text-sm font-medium text-purple-800">已选标记: {{ selectedMark.name }}</span>
              </div>
              <div v-if="selectedMark.icon" class="text-xs text-purple-600 mt-1">
                图标: {{ selectedMark.icon }}
              </div>
            </div>
          </div>

          <!-- 右侧：标签选择 -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-medium text-gray-700">选择标签</h4>
              <el-button link type="primary" size="small" @click="toggleAllLabels">
                {{ selectedLabelIds.length === labels.length ? '取消全选' : '全选' }}
              </el-button>
            </div>
            <div class="border border-gray-200 rounded-lg p-2 max-h-80 overflow-y-auto space-y-1">
              <div v-if="labels.length === 0" class="py-8 text-center text-sm text-gray-400">
                暂无可用标签
              </div>
              <div
                v-for="label in labels"
                :key="label.id"
                @click="toggleLabel(label.id)"
                :class="['flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors', selectedLabelIds.includes(label.id) ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50 border border-transparent']"
              >
                <el-icon v-if="selectedLabelIds.includes(label.id)" color="#9333ea"><Check /></el-icon>
                <el-icon v-else color="#9ca3af"><Check /></el-icon>
                <span class="text-sm text-gray-700">{{ label.labelNumber }}</span>
                <span v-if="label.currentMarkName" class="text-xs text-gray-400 ml-auto">
                  当前: {{ label.currentMarkName }}
                </span>
              </div>
            </div>
            <div class="mt-1 text-xs text-gray-400">
              已选 {{ selectedLabelIds.length }} / {{ labels.length }} 个标签
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="p-4 border-t border-gray-200 flex justify-end gap-3">
        <el-button @click="onClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认标记</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { PriceTag, Close, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  isOpen: Boolean,
  marks: {
    type: Array,
    default: () => []
  },
  labels: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'submit'])

const selectedMarkId = ref('')
const selectedLabelIds = ref([])

// 构建标记树
const markTreeData = computed(() => {
  const map = new Map()
  const roots = []

  props.marks.forEach(m => {
    map.set(m.id, { ...m, id: m.id, name: m.name, color: m.color, children: [] })
  })

  props.marks.forEach(m => {
    const node = map.get(m.id)
    if (m.parentId === 0 || !map.has(m.parentId)) {
      roots.push(node)
    } else {
      const parent = map.get(m.parentId)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(node)
      }
    }
  })

  return roots
})

// 选中的标记
const selectedMark = computed(() => {
  if (!selectedMarkId.value) return null
  return props.marks.find(m => m.id === selectedMarkId.value)
})

watch(() => props.isOpen, (val) => {
  if (val) {
    selectedMarkId.value = ''
    selectedLabelIds.value = []
  }
})

const handleMarkSelect = (data) => {
  selectedMarkId.value = data.id
}

const toggleLabel = (labelId) => {
  const index = selectedLabelIds.value.indexOf(labelId)
  if (index > -1) {
    selectedLabelIds.value.splice(index, 1)
  } else {
    selectedLabelIds.value.push(labelId)
  }
}

const toggleAllLabels = () => {
  if (selectedLabelIds.value.length === props.labels.length) {
    selectedLabelIds.value = []
  } else {
    selectedLabelIds.value = props.labels.map(l => l.id)
  }
}

const onClose = () => {
  emit('close')
}

const handleSubmit = () => {
  if (!selectedMarkId.value) {
    ElMessage.warning('请先选择一个标记')
    return
  }
  if (selectedLabelIds.value.length === 0) {
    ElMessage.warning('请至少选择一个标签')
    return
  }
  emit('submit', {
    markId: selectedMarkId.value,
    labelIds: selectedLabelIds.value
  })
}
</script>
