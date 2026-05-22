<template>
  <div class="ui-virtual-table" :style="{ height: height + 'px' }">
    <div class="virtual-table-header">
      <div
        v-for="col in columns"
        :key="col.key"
        class="header-cell"
        :style="{ width: col.width + 'px', flex: col.width ? 'none' : 1 }"
      >
        {{ col.title }}
      </div>
    </div>
    <div ref="bodyRef" class="virtual-table-body" @scroll="handleScroll">
      <div class="virtual-table-content" :style="{ paddingTop: offsetY + 'px' }">
        <div
          v-for="row in visibleData"
          :key="row[rowKey]"
          class="virtual-table-row"
        >
          <div
            v-for="col in columns"
            :key="col.key"
            class="table-cell"
            :style="{ width: col.width + 'px', flex: col.width ? 'none' : 1 }"
          >
            <slot :name="col.key" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </div>
        </div>
      </div>
      <div v-if="offsetY > 0" class="virtual-spacer" :style="{ height: offsetY + 'px' }" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUpdated } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  rowKey: { type: String, default: 'id' },
  height: { type: Number, default: 400 },
  rowHeight: { type: Number, default: 48 }
})

const bodyRef = ref(null)
const scrollTop = ref(0)

const visibleCount = computed(() => Math.ceil(props.height / props.rowHeight) + 2)
const startIndex = computed(() => Math.floor(scrollTop.value / props.rowHeight))
const offsetY = computed(() => startIndex.value * props.rowHeight)

const visibleData = computed(() => {
  return props.data.slice(startIndex.value, startIndex.value + visibleCount.value)
})

const handleScroll = (e) => {
  scrollTop.value = e.target.scrollTop
}

onMounted(() => {
  if (bodyRef.value) {
    bodyRef.value.addEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.ui-virtual-table {
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.virtual-table-header {
  display: flex;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.header-cell {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-align: left;
}

.virtual-table-body {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

.virtual-table-content {
  display: flex;
  flex-direction: column;
}

.virtual-table-row {
  display: flex;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s;
}

.virtual-table-row:hover {
  background: #f9fafb;
}

.table-cell {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #374151;
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.virtual-spacer {
  flex-shrink: 0;
}
</style>
