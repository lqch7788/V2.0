<template>
  <!-- 详情抽屉组件 - 与V1.1 DetailDrawer.tsx 完全一致 -->
  <el-drawer
    :model-value="isOpen"
    :title="title"
    :size="width === 640 ? 640 : 480"
    :close-on-click-modal="false"
    @close="onClose"
  >
    <!-- 加载态 -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <el-icon class="w-8 h-8 text-emerald-600 animate-spin">
        <Loading />
      </el-icon>
    </div>

    <!-- 内容 -->
    <template v-else>
      <slot />
    </template>

    <!-- 底部操作区 -->
    <template v-if="hasFooter" #footer>
      <slot name="footer" />
    </template>
  </el-drawer>
</template>

<script setup>
import { computed, useSlots } from 'vue'
import { Loading } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: Number, default: 480 },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const slots = useSlots()
const hasFooter = computed(() => !!slots.footer)

function onClose() {
  emit('close')
}
</script>
