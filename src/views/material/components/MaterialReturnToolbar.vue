<!--
  MaterialReturn 工具栏（操作模式按钮）
  从 MaterialReturn.vue 拆分（保持 1:1 模板和样式）
-->
<template>
  <div class="flex gap-2">
    <!-- 导出模式 -->
    <template v-if="exportMode">
      <button class="h-8 px-3 rounded-md text-xs bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="$emit('exportClick')">
        <Download class="w-4 h-4" />确认导出
      </button>
      <button class="h-8 px-3 rounded-md text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-1" @click="$emit('cancelExport')">取消</button>
    </template>
    <!-- 默认模式 -->
    <template v-else>
      <template v-if="!batchEditMode && !deleteMode">
        <button class="h-8 px-3 rounded-md text-xs bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="$emit('add')">
          <Plus class="w-4 h-4" />新增
        </button>
        <button class="h-8 px-3 rounded-md text-xs bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="$emit('enterBatchEdit')">
          <Edit class="w-4 h-4" /><Edit2 class="w-4 h-4" />编辑
        </button>
        <button class="h-8 px-3 rounded-md text-xs bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1" @click="$emit('enterDelete')">
          <Trash2 class="w-4 h-4" />删除
        </button>
        <button class="h-8 px-3 rounded-md text-xs bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="$emit('enterExport')">
          <Download class="w-4 h-4" />导出
        </button>
      </template>
      <!-- 删除模式 -->
      <template v-if="deleteMode">
        <button class="h-8 px-3 rounded-md text-xs bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1" @click="$emit('confirmDelete')">确认删除</button>
        <button class="h-8 px-3 rounded-md text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-1" @click="$emit('cancelDelete')">取消</button>
      </template>
      <!-- 编辑模式 -->
      <template v-if="batchEditMode">
        <button class="h-8 px-3 rounded-md text-xs bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="$emit('confirmBatchEdit')">确认编辑</button>
        <button class="h-8 px-3 rounded-md text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-1" @click="$emit('cancelBatchEdit')">取消</button>
      </template>
    </template>
  </div>
</template>

<script setup>
import { Plus, Edit, Edit2, Trash2, Download } from 'lucide-vue-next'

defineProps({
  exportMode: { type: Boolean, default: false },
  batchEditMode: { type: Boolean, default: false },
  deleteMode: { type: Boolean, default: false }
})

defineEmits(['exportClick', 'cancelExport', 'add', 'enterBatchEdit', 'enterDelete', 'enterExport', 'confirmDelete', 'cancelDelete', 'confirmBatchEdit', 'cancelBatchEdit'])
</script>
