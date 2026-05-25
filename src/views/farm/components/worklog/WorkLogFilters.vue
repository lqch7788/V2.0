<template>
  <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
    <div class="flex flex-wrap gap-4 items-end">
      <!-- 日期筛选 -->
      <div class="min-w-[180px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">日期</label>
        <el-date-picker
          v-model="dateValue"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          class="!w-full"
          @change="onDateChange"
        />
      </div>

      <!-- 工人筛选 -->
      <div class="flex-1 min-w-[180px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">工人</label>
        <el-input
          v-model="workerValue"
          placeholder="请输入姓名"
          clearable
          @input="onWorkerChange"
        />
      </div>

      <!-- 大棚筛选 -->
      <div class="min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">大棚</label>
        <el-select
          v-model="greenhouseValue"
          placeholder="全部"
          clearable
          @change="onGreenhouseChange"
        >
          <el-option label="全部" value="全部" />
          <el-option v-for="n in 6" :key="n" :label="`${n}号棚`" :value="`${n}号棚`" />
        </el-select>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-2">
        <el-button @click="$emit('search')">
          <el-icon class="mr-1"><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  filters: { type: Object, required: true }
})

const emit = defineEmits(['update:filters'])

const dateValue = ref(props.filters.date || '')
const workerValue = ref(props.filters.worker || '')
const greenhouseValue = ref(props.filters.greenhouse || '全部')

function onDateChange(val) {
  emit('update:filters', { ...props.filters, date: val || '' })
}

function onWorkerChange(val) {
  emit('update:filters', { ...props.filters, worker: val || '' })
}

function onGreenhouseChange(val) {
  emit('update:filters', { ...props.filters, greenhouse: val || '全部' })
}
</script>
