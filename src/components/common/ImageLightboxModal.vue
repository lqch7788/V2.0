<template>
  <el-dialog
    :model-value="visible"
    title="图片查看"
    width="800px"
    @close="handleClose"
  >
    <div class="flex flex-wrap gap-2 justify-center">
      <el-image
        v-for="(img, index) in images"
        :key="index"
        :src="img"
        :initial-index="index"
        :preview-src-list="images"
        fit="contain"
        class="w-40 h-40 m-2 cursor-pointer"
      />
    </div>
    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  visible: Boolean,
  images: Array
})

const emit = defineEmits(['update:visible'])

const handleClose = () => {
  emit('update:visible', false)
}
</script>
