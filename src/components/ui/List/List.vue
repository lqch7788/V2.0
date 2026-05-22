<template>
  <div class="ui-list">
    <div v-for="(item, index) in dataSource" :key="index" class="list-item">
      <slot name="renderItem" :item="item" :index="index">
        {{ item }}
      </slot>
    </div>
    <div v-if="dataSource.length === 0" class="list-empty">
      <slot name="empty">
        <el-empty description="暂无数据" />
      </slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  dataSource: { type: Array, default: () => [] }
})
</script>

<style scoped>
.ui-list {
  width: 100%;
}

.list-item {
  padding: 0.5rem 0;
}

.list-item:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}

.list-empty {
  padding: 2rem;
  text-align: center;
}
</style>
