<template>
  <!-- 编辑模式：输入框 + 保存/取消按钮 -->
  <div v-if="isEditing" class="flex items-center gap-1">
    <el-input
      :model-value="editValue"
      @update:model-value="$emit('update:editValue', $event)"
      @keydown.enter="$emit('saveEdit')"
      @keydown.escape="$emit('cancelEdit')"
      size="small"
      class="!w-32"
      ref="inputRef"
    />
    <el-button link size="small" @click="$emit('saveEdit')">
      <el-icon :size="16"><Check /></el-icon>
    </el-button>
    <el-button link size="small" @click="$emit('cancelEdit')">
      <el-icon :size="16"><Close /></el-icon>
    </el-button>
  </div>

  <!-- 查看模式：可点击的名称 -->
  <div v-else class="flex items-center gap-2">
    <span class="cursor-pointer hover:text-emerald-600" @click="$emit('startEdit')">
      {{ currentName }}
    </span>
    <el-button link size="small" @click="$emit('startEdit')">
      <el-icon :size="12"><EditPen /></el-icon>
    </el-button>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, watch } from 'vue'
import { Check, Close, EditPen } from '@element-plus/icons-vue'

// P1-9 修复：与 EditCell.vue 统一命名 - 主属性使用 'type'，
// 保留 'cellType' 作为别名以兼容现有调用
const props = defineProps({
  type: { type: String, default: undefined },
  cellType: { type: String, default: undefined },
  categoryCode: { type: String, required: true },
  typeCode: { type: String, default: undefined },
  subCode: { type: String, default: undefined },
  currentName: { type: String, default: '' },
  editingCell: { type: Object, default: null },
  editValue: { type: String, default: '' },
})

defineEmits(['startEdit', 'saveEdit', 'cancelEdit', 'update:editValue'])

const inputRef = ref(null)

// 统一使用 type 作为 cell 类型
const cellTypeValue = computed(() => props.type || props.cellType)

// 判断当前单元格是否处于编辑状态
const isEditing = computed(() => {
  if (!props.editingCell) return false
  const c = props.editingCell
  return c.type === cellTypeValue.value &&
    c.categoryCode === props.categoryCode &&
    c.typeCode === props.typeCode &&
    c.subCode === props.subCode
})

// 编辑模式自动聚焦
watch(isEditing, async (val) => {
  if (val) {
    await nextTick()
    inputRef.value?.focus?.()
  }
})
</script>
