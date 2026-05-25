<template>
  <el-dialog
    v-model="visible"
    title="日志详情"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
      <div>
        <label class="block text-sm font-medium text-gray-500 mb-1">日志编号</label>
        <p class="text-sm text-gray-900">{{ log.code }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-500 mb-1">日期</label>
        <p class="text-sm text-gray-900">{{ log.date }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-500 mb-1">工人姓名</label>
        <p class="text-sm text-gray-900">{{ log.worker }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-500 mb-1">天气</label>
        <p class="text-sm text-gray-900">{{ log.weather }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-500 mb-1">温度</label>
        <p class="text-sm text-gray-900">{{ log.temperature }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-500 mb-1">作物</label>
        <p class="text-sm text-gray-900">{{ log.crop }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-500 mb-1">大棚</label>
        <p class="text-sm text-gray-900">{{ log.greenhouse }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-500 mb-1">生长状况</label>
        <span
          :class="log.growthStatus === '良好'
            ? 'bg-green-100 text-green-700'
            : 'bg-amber-100 text-amber-700'"
          class="inline-flex px-2 py-1 rounded-full text-xs font-medium"
        >
          {{ log.growthStatus }}
        </span>
      </div>
      <div class="col-span-2">
        <label class="block text-sm font-medium text-gray-500 mb-1">工作内容</label>
        <p class="text-sm text-gray-900">{{ log.tasks }}</p>
      </div>
      <div class="col-span-2">
        <label class="block text-sm font-medium text-gray-500 mb-1">问题描述</label>
        <p class="text-sm text-gray-900">{{ log.problems }}</p>
      </div>
      <div class="col-span-2">
        <label class="block text-sm font-medium text-gray-500 mb-1">处理措施</label>
        <p class="text-sm text-gray-900">{{ log.solutions }}</p>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  log: { type: Object, default: null },
  open: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const visible = computed({
  get: () => props.open && props.log !== null,
  set: (val) => { if (!val) emit('close') }
})

function handleClose() {
  emit('close')
}
</script>
