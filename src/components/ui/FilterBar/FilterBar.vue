<template>
  <div class="ui-filter-bar">
    <div class="filter-bar-inner">
      <slot />
    </div>
    <div class="filter-actions">
      <el-button size="small" @click="handleReset">重置</el-button>
      <el-button type="primary" size="small" @click="handleSearch">查询</el-button>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['reset', 'search'])

const handleReset = () => emit('reset')
const handleSearch = () => emit('search')
</script>

<style scoped>
.ui-filter-bar {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.filter-bar-inner {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
}
</style>
