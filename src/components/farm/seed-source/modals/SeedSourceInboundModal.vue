<template>
  <!--
    种源外购入库弹窗（V1.1 占位 - 已禁用）
    V1.1源文件：src/components/farm/seed-source/modals/SeedSourceInboundModal.tsx
    状态：V1.1 v3.4 已禁用入口（外购必须走作物库存 → 调拨入种源）
    此处保留作为完整组件骨架
  -->
  <el-dialog
    :model-value="visible"
    title="种源外购入库"
    width="800px"
    :close-on-click-modal="false"
    @update:model-value="(v) => $emit('update:visible', v)"
    @close="handleClose"
  >
    <el-alert
      title="此入口已禁用"
      type="warning"
      :closable="false"
      class="mb-4"
    >
      <template #default>
        <div>外购入库入口已在 V1.1 v3.4 禁用（2026-07-07）</div>
        <div class="text-xs mt-1">外购必须走：作物库存 → 调拨入种源（追加模式）</div>
      </template>
    </el-alert>

    <el-empty description="种源外购入库 - 已禁用" />
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'success'])

const handleClose = () => {
  emit('update:visible', false)
}
</script>
